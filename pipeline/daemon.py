import asyncio
import os
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
                db.save_analysis(post["id"], result["analysis"], result["viability_score"])
                print(f"    [{result['viability_score']}/10] {post['title'][:50]}")
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

            # Priority 1: Build new prototypes (highest value)
            buildable = db.get_buildable_ideas(limit=1)
            if buildable:
                print(f"\n=== BUILDING ===")
                await build_next_prototype()
                continue

            # Priority 2: Improve existing prototypes (make them shippable)
            improvable = db.get_improvable_prototypes(
                max_improvements=MAX_IMPROVEMENTS, limit=1
            )
            if improvable:
                idea = improvable[0]
                print(f"\n=== IMPROVING: {idea['title'][:50]} (round {idea.get('improvement_count', 0) + 1}) ===")
                await improve_prototype(idea)
                continue

            # Priority 3: Competition check for 7+ ideas (unlocks builds)
            needs_comp = db.get_ideas_needing_competition(min_score=7, limit=1)
            if needs_comp:
                print(f"\n=== COMPETITION CHECK (high priority) ===")
                await competition_batch(db, limit=5)
                continue

            # Priority 4: Analyze unscored ideas (small batches)
            if unanalyzed:
                print(f"\n=== ANALYZING (backlog={backlog}, unscored={unanalyzed}) ===")
                await analyze_batch(db, limit=10)
                continue

            # Priority 5: Competition check for lower-scoring ideas
            needs_comp_low = db.get_ideas_needing_competition(min_score=5, limit=1)
            if needs_comp_low:
                print(f"\n=== COMPETITION CHECK ===")
                await competition_batch(db, limit=5)
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
            print(f"Daemon error: {type(e).__name__}: {e}\n{traceback.format_exc()[-500:]}")
            err_str = str(e)
            if "429" not in err_str and "406" not in err_str and "circuit" not in err_str.lower() and "ReadTimeout" not in type(e).__name__:
                await notify_daemon(f"Error: {err_str[:200]}", tags="warning")
            await asyncio.sleep(60)


def main():
    asyncio.run(run_loop())


if __name__ == "__main__":
    main()
