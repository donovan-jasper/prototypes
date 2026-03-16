import asyncio
import os
import time
import traceback
import httpx
from idea_scout.config import (
    DB_PATH, NTFY_TOPIC, SCOUT_INTERVAL_HOURS, IDLE_SLEEP_MINUTES,
    MIN_BACKLOG, MAX_IMPROVEMENTS,
)
from idea_scout.db import IdeaDB
from idea_scout.main import run as run_scout
from idea_scout.analyzer import analyze_post
from builder.orchestrator import build_next_prototype
from builder.improver import improve_prototype

SCOUT_TIMESTAMP_FILE = os.path.expanduser("~/prototypes/pipeline/.last_scout")


async def notify(msg: str, title: str = "Pipeline", tags: str = "robot"):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://ntfy.sh/{NTFY_TOPIC}",
                content=msg.encode("utf-8"),
                headers={
                    "Title": title.encode("ascii", errors="replace").decode(),
                    "Tags": tags,
                },
            )
    except Exception:
        pass


async def analyze_batch(db: IdeaDB, limit: int = 10):
    """Analyze a small batch of unanalyzed ideas. Skips errors gracefully."""
    unanalyzed = db.get_unanalyzed_posts(limit=limit)
    if not unanalyzed:
        return 0
    scored = 0
    print(f"  Analyzing {len(unanalyzed)} ideas...")
    async with httpx.AsyncClient(timeout=60) as client:
        for post in unanalyzed:
            try:
                result = await analyze_post(client, post)
                db.save_analysis(post["id"], result["analysis"], result["viability_score"])
                print(f"    [{result['viability_score']}/10] {post['title'][:50]}")
                scored += 1
            except Exception as e:
                print(f"    SKIP {post['id']}: {type(e).__name__}")
    return scored


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
    await notify("Pipeline daemon started", tags="rocket")

    while True:
        try:
            db = IdeaDB(DB_PATH)
            last_scout = _read_last_scout()
            hours_since_scout = (time.time() - last_scout) / 3600
            backlog = db.count_unbuilt_ideas(min_score=7)
            unanalyzed = len(db.get_unanalyzed_posts(limit=1))

            # Priority 1: Scout for NEW ideas — but only if backlog is low or it's been a while
            if hours_since_scout >= SCOUT_INTERVAL_HOURS and backlog < MIN_BACKLOG:
                print(f"\n=== SCOUTING (backlog={backlog}, hours={hours_since_scout:.1f}) ===")
                await run_scout()
                _write_last_scout(time.time())
                continue

            # Priority 2: Build a prototype if we have buildable ideas
            buildable = db.get_buildable_ideas(limit=1)
            if buildable:
                print(f"\n=== BUILDING: {buildable[0]['title'][:50]} ===")
                await build_next_prototype()
                continue

            # Priority 3: Analyze unscored ideas (small batches to avoid timeouts)
            if unanalyzed:
                print(f"\n=== ANALYZING (backlog={backlog}, unscored={unanalyzed}) ===")
                await analyze_batch(db, limit=10)
                continue

            # Priority 4: Improve existing prototype
            improvable = db.get_improvable_prototypes(
                max_improvements=MAX_IMPROVEMENTS, limit=1
            )
            if improvable:
                idea = improvable[0]
                print(f"\n=== IMPROVING: {idea['title'][:50]} (round {idea.get('improvement_count', 0) + 1}) ===")
                await improve_prototype(idea)
                continue

            # Nothing to do — sleep
            print(f"\n=== IDLE — sleeping {IDLE_SLEEP_MINUTES}m ===")
            await asyncio.sleep(IDLE_SLEEP_MINUTES * 60)

        except Exception as e:
            print(f"Daemon error: {type(e).__name__}: {e}\n{traceback.format_exc()[-500:]}")
            err_str = str(e)
            if "429" not in err_str and "406" not in err_str and "circuit" not in err_str.lower() and "ReadTimeout" not in type(e).__name__:
                await notify(f"Error: {err_str[:200]}", title="Pipeline Error", tags="warning")
            await asyncio.sleep(60)


def main():
    asyncio.run(run_loop())


if __name__ == "__main__":
    main()
