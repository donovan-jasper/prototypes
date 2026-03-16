import asyncio
from .config import DB_PATH
from .scraper import fetch_all_subreddits
from .agentic_scraper import run_agentic_scout
from .db import IdeaDB
from .notify import notify_scout_complete


async def run():
    db = IdeaDB(DB_PATH)

    # 1. HN scrape — find web tools that could be mobile apps
    print("Fetching HN posts (looking for mobile gap opportunities)...")
    posts = await fetch_all_subreddits()
    print(f"Found {len(posts)} HN posts")
    hn_new = 0
    for post in posts:
        existing = db.get_post(post["id"])
        if existing and existing.get("analysis"):
            continue
        db.upsert_post(post)
        hn_new += 1
    print(f"New/updated HN posts: {hn_new}")

    # 2. Agentic web scout — primary source, mobile-focused
    print("Running agentic mobile app scout...")
    web_ideas = await run_agentic_scout(db)
    print(f"Agentic scout found {web_ideas} new mobile app ideas")

    # 3. Notify scout completion (individual idea notifications happen in analyze_batch)
    total_new = hn_new + web_ideas
    await notify_scout_complete(total_new, 25)  # ~25 queries per cycle


def main():
    asyncio.run(run())


if __name__ == "__main__":
    main()
