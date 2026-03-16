import asyncio
import time
import traceback
import httpx
from idea_scout.config import (
    DB_PATH, NTFY_TOPIC, SCOUT_INTERVAL_HOURS, IDLE_SLEEP_MINUTES,
    MIN_BACKLOG, MAX_IMPROVEMENTS,
)
from idea_scout.db import IdeaDB
from idea_scout.main import run as run_scout
from builder.orchestrator import build_next_prototype
from builder.improver import improve_prototype


async def notify(msg: str, title: str = "Pipeline", tags: str = "robot"):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://ntfy.sh/{NTFY_TOPIC}",
                content=msg.encode(),
                headers={"Title": title, "Tags": tags},
            )
    except Exception:
        pass


async def run_loop():
    last_scout = 0
    print("Pipeline daemon started")
    await notify("Pipeline daemon started", tags="rocket")

    while True:
        try:
            db = IdeaDB(DB_PATH)
            hours_since_scout = (time.time() - last_scout) / 3600
            backlog = db.count_unbuilt_ideas(min_score=7)

            # Priority 1: Scout for ideas
            if hours_since_scout >= SCOUT_INTERVAL_HOURS or backlog < MIN_BACKLOG:
                print(f"\n=== SCOUTING (backlog={backlog}, hours={hours_since_scout:.1f}) ===")
                await run_scout()
                last_scout = time.time()
                continue

            # Priority 2: Build new prototype
            buildable = db.get_buildable_ideas(limit=1)
            if buildable:
                print(f"\n=== BUILDING: {buildable[0]['title'][:50]} ===")
                await build_next_prototype()
                continue

            # Priority 3: Improve existing prototype
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
            print(f"Daemon error: {e}\n{traceback.format_exc()[-500:]}")
            # Don't spam ntfy with rate limit errors
            err_str = str(e)
            if "429" not in err_str and "406" not in err_str and "circuit" not in err_str.lower():
                await notify(f"Error: {err_str[:200]}", title="Pipeline Error", tags="warning")
            await asyncio.sleep(60)


def main():
    asyncio.run(run_loop())


if __name__ == "__main__":
    main()
