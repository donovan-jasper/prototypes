import asyncio
import os
import shutil
import subprocess
import time
import traceback
import httpx
from idea_scout.config import (
    DB_PATH, SCOUT_INTERVAL_HOURS, IDLE_SLEEP_MINUTES,
    MIN_BACKLOG, MAX_IMPROVEMENTS, OMNIROUTE_BASE, CODER_MODEL,
)
from idea_scout.db import IdeaDB
from idea_scout.main import run as run_scout
from idea_scout.analyzer import analyze_post
from idea_scout.agentic_scraper import COMPETITION_PROMPT, parse_competition_from_llm
from idea_scout.web_search import search_web
from idea_scout.notify import notify_daemon, notify_high_score_idea, notify_analysis_batch
from builder.orchestrator import build_next_prototype
from builder.improver import improve_prototype

SCOUT_TIMESTAMP_FILE = os.path.expanduser("~/prototypes/pipeline/.last_scout")
_state = {"llm_failures": 0, "consecutive_406": 0, "err_counts": {}, "notified_errors": set()}
MAX_LLM_FAILURES_BEFORE_RESTART = 2
MAX_ERROR_NOTIFICATIONS = 2  # only notify this many times per error type per cycle



MIN_DISK_GB = 2  # pause builds when disk drops below this


def _check_disk_space() -> bool:
    usage = shutil.disk_usage('/')
    free_gb = usage.free / (1024 ** 3)
    if free_gb < MIN_DISK_GB:
        print(f'  [disk] Only {free_gb:.1f}GB free — pausing builds until space is freed')
        return False
    return True

def _reset_error_state():
    """Reset error tracking after a successful cycle."""
    _state["llm_failures"] = 0
    _state["consecutive_406"] = 0
    _state["err_counts"] = {}


def _restart_omniroute():
    """Restart OmniRoute when it gets stuck."""
    print("  [health] OmniRoute appears stuck, restarting...")
    subprocess.run(["sudo", "systemctl", "restart", "omniroute"], timeout=15)
    time.sleep(5)
    print("  [health] OmniRoute restarted")


async def analyze_batch(db: IdeaDB, limit: int = 10):
    """Analyze a small batch of unanalyzed ideas.

    Sends one batched notification summarizing all 7+ ideas found,
    plus individual alerts for exceptional 9+ ideas.
    """
    unanalyzed = db.get_unanalyzed_posts(limit=limit)
    if not unanalyzed:
        return 0
    scored = 0
    high_scorers = []  # collect 7+ ideas for batch notification
    print(f"  Analyzing {len(unanalyzed)} ideas...")
    async with httpx.AsyncClient(timeout=60) as client:
        for post in unanalyzed:
            try:
                result = await analyze_post(client, post)
                db.save_analysis(post["id"], result["analysis"], result["viability_score"], result.get("feasibility_score"))
                feas = result.get("feasibility_score", "?")
                print(f"    [{result['viability_score']}/10 f={feas}] {post['title'][:50]}")
                scored += 1

                if result["viability_score"] >= 7:
                    idea = db.get_post(post["id"])
                    if idea:
                        high_scorers.append(idea)
                        # Individual alert only for exceptional (9+)
                        if result["viability_score"] >= 9:
                            await notify_high_score_idea(idea)

            except Exception as e:
                print(f"    SKIP {post['id']}: {type(e).__name__}")

    # One batch notification for all 7-8 scorers
    if high_scorers:
        await notify_analysis_batch(high_scorers)

    return scored


async def competition_batch(db: IdeaDB, limit: int = 5):
    """Run competition analysis on high-scoring ideas that lack it. Uses coder model."""
    ideas = db.get_ideas_needing_competition(min_score=5, limit=limit)
    if not ideas:
        return 0
    checked = 0
    print(f"  Checking competition for {len(ideas)} ideas...")
    async with httpx.AsyncClient(timeout=90) as client:
        for idea in ideas:
            try:
                query = f"{idea['title']} mobile app"
                results = search_web(query, max_results=5)
                search_text = "\n".join(
                    f"- {r['title']}: {r['body']}" for r in results
                )
                prompt = COMPETITION_PROMPT.format(
                    title=idea["title"],
                    description=idea.get("selftext", ""),
                    search_results=search_text or "No results found",
                )
                resp = await client.post(
                    f"{OMNIROUTE_BASE}/chat/completions",
                    json={
                        "model": CODER_MODEL,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                    },
                    timeout=90,
                )
                resp.raise_for_status()
                content = resp.json()["choices"][0]["message"]["content"]
                result = parse_competition_from_llm(content)
                db.save_competition(
                    idea["id"],
                    result["competition_analysis"],
                    result["competition_score"],
                )
                print(f"    [comp {result['competition_score']}/10] {idea['title'][:50]}")
                checked += 1
                await asyncio.sleep(3)
            except Exception as e:
                print(f"    SKIP competition {idea['id']}: {type(e).__name__}")
    return checked


def _read_last_scout() -> float:
    try:
        with open(SCOUT_TIMESTAMP_FILE) as f:
            return float(f.read().strip())
    except (FileNotFoundError, ValueError):
        return 0

def _write_last_scout(ts: float):
    with open(SCOUT_TIMESTAMP_FILE, "w") as f:
        f.write(str(ts))


async def run_loop():
    print("Pipeline daemon started")
    await notify_daemon("Pipeline daemon started", tags="rocket")

    while True:
        try:
            db = IdeaDB(DB_PATH)
            last_scout = _read_last_scout()
            hours_since_scout = (time.time() - last_scout) / 3600
            backlog = db.count_unbuilt_ideas(min_score=7)
            unanalyzed = len(db.get_unanalyzed_posts(limit=1))

            # Disk space gate — skip builds/improvements if disk is low
            if not _check_disk_space():
                await notify_daemon(f'Disk space critically low — pausing builds', tags='warning')
                await asyncio.sleep(IDLE_SLEEP_MINUTES * 60)
                continue

            # Priority 1: Build new prototypes (highest value)
            buildable = db.get_buildable_ideas(limit=1)
            if buildable:
                print(f"\n=== BUILDING ===")
                await build_next_prototype()
                _reset_error_state()
                continue

            # Priority 2: Improve existing prototypes (make them shippable)
            improvable = db.get_improvable_prototypes(
                max_improvements=MAX_IMPROVEMENTS, limit=1
            )
            if improvable:
                idea = improvable[0]
                print(f"\n=== IMPROVING: {idea['title'][:50]} (round {idea.get('improvement_count', 0) + 1}) ===")
                await improve_prototype(idea)
                _reset_error_state()
                continue

            # Priority 3: Competition check for 7+ ideas (unlocks builds)
            needs_comp = db.get_ideas_needing_competition(min_score=7, limit=1)
            if needs_comp:
                print(f"\n=== COMPETITION CHECK (high priority) ===")
                await competition_batch(db, limit=5)
                _reset_error_state()
                continue

            # Priority 4: Analyze unscored ideas (small batches)
            if unanalyzed:
                print(f"\n=== ANALYZING (backlog={backlog}, unscored={unanalyzed}) ===")
                await analyze_batch(db, limit=10)
                _reset_error_state()
                continue

            # Priority 5: Competition check for lower-scoring ideas
            needs_comp_low = db.get_ideas_needing_competition(min_score=5, limit=1)
            if needs_comp_low:
                print(f"\n=== COMPETITION CHECK ===")
                await competition_batch(db, limit=5)
                _reset_error_state()
                continue

            # Priority 6: Scout for NEW ideas — only if backlog is low
            if hours_since_scout >= SCOUT_INTERVAL_HOURS and backlog < MIN_BACKLOG:
                print(f"\n=== SCOUTING (backlog={backlog}, hours={hours_since_scout:.1f}) ===")
                await run_scout()
                _write_last_scout(time.time())
                continue

            # Nothing to do — sleep
            print(f"\n=== IDLE — sleeping {IDLE_SLEEP_MINUTES}m ===")
            await asyncio.sleep(IDLE_SLEEP_MINUTES * 60)

        except Exception as e:
            err_name = type(e).__name__
            err_str = str(e)
            # Classify error for dedup
            if "406" in err_str:
                err_key = "406"
            elif "429" in err_str:
                err_key = "429"
            else:
                err_key = err_name
            _state["err_counts"][err_key] = _state["err_counts"].get(err_key, 0) + 1
            count = _state["err_counts"][err_key]

            # Only log first 2 of each error type, then suppress
            if count <= MAX_ERROR_NOTIFICATIONS:
                print(f"Daemon error: {err_name}: {e}\n{traceback.format_exc()[-500:]}")
            elif count == MAX_ERROR_NOTIFICATIONS + 1:
                print(f"  [muted] Suppressing further {err_key} errors until next success")

            # Track LLM failures and restart OmniRoute if stuck
            if err_name in ("ReadTimeout", "RemoteProtocolError", "ConnectError"):
                _state["llm_failures"] += 1
                if _state["llm_failures"] >= MAX_LLM_FAILURES_BEFORE_RESTART:
                    _restart_omniroute()
                    _state["llm_failures"] = 0
                await asyncio.sleep(30)
            elif err_key == "429":
                _state["llm_failures"] = 0
                _state["consecutive_406"] = 0
                await asyncio.sleep(90)
            elif err_key == "406":
                # All providers exhausted — exponential backoff
                _state["llm_failures"] = 0
                _state["consecutive_406"] = min(_state["consecutive_406"] + 1, 6)
                wait = min(60 * (2 ** _state["consecutive_406"]), 1800)  # 2m, 4m, 8m, 16m, max 30m
                if count <= MAX_ERROR_NOTIFICATIONS:
                    print(f"  [backoff] All providers exhausted, waiting {wait // 60}m (streak: {_state['consecutive_406']})")
                await asyncio.sleep(wait)
            else:
                _state["llm_failures"] = 0
                _state["consecutive_406"] = 0
                # Only send push notification for first 2 of each error type
                if count <= MAX_ERROR_NOTIFICATIONS and "circuit" not in err_str.lower():
                    await notify_daemon(f"Error: {err_str[:200]}", tags="warning")
                await asyncio.sleep(60)


def main():
    asyncio.run(run_loop())


if __name__ == "__main__":
    main()
