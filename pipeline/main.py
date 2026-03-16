import asyncio
import httpx
from .config import DB_PATH
from .scraper import fetch_all_subreddits
from .analyzer import analyze_post
from .agentic_scraper import run_agentic_scout
from .db import IdeaDB
from .digest import send_digest


async def run():
    db = IdeaDB(DB_PATH)

    # 1. HN scrape — find web tools that could be mobile apps
    print("Fetching HN posts (looking for mobile gap opportunities)...")
    posts = await fetch_all_subreddits()
    print(f"Found {len(posts)} HN posts")
    new_count = 0
    for post in posts:
        existing = db.get_post(post["id"])
        if existing and existing.get("analysis"):
            continue
        db.upsert_post(post)
        new_count += 1
    print(f"New/updated HN posts: {new_count}")

    # 2. Agentic web scout — primary source, mobile-focused
    print("Running agentic mobile app scout...")
    web_ideas = await run_agentic_scout(db)
    print(f"Agentic scout found {web_ideas} new mobile app ideas")

    # 3. Analyze all unanalyzed posts (HN + web)
    unanalyzed = db.get_unanalyzed_posts(limit=15)
    if unanalyzed:
        print(f"Analyzing {len(unanalyzed)} ideas for mobile viability...")
        async with httpx.AsyncClient(timeout=60) as client:
            for post in unanalyzed:
                try:
                    result = await analyze_post(client, post)
                    db.save_analysis(post["id"], result["analysis"], result["viability_score"])
                    print(f"  [{result['viability_score']}/10] {post['title'][:60]}")
                except Exception as e:
                    print(f"  ERROR analyzing {post['id']}: {e}")

    # 4. Send digest with top ideas
    top = db.get_top_ideas(limit=5)
    if top:
        await send_digest(top)
        print(f"Digest sent with {len(top)} top ideas")


def main():
    asyncio.run(run())


if __name__ == "__main__":
    main()
