import asyncio
import httpx
from .config import DB_PATH
from .scraper import fetch_all_subreddits
from .analyzer import analyze_post
from .db import IdeaDB
from .digest import send_digest


async def run():
    db = IdeaDB(DB_PATH)

    # 1. Scrape Reddit
    print("Fetching posts from Reddit...")
    posts = await fetch_all_subreddits()
    print(f"Found {len(posts)} posts")

    # 2. Store new posts
    new_count = 0
    for post in posts:
        existing = db.get_post(post["id"])
        if existing and existing.get("analysis"):
            continue
        db.upsert_post(post)
        new_count += 1
    print(f"New/updated posts: {new_count}")

    # 3. Analyze unanalyzed posts
    unanalyzed = db.get_unanalyzed_posts(limit=15)
    print(f"Analyzing {len(unanalyzed)} posts...")

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
    else:
        print("No ideas to digest")


def main():
    asyncio.run(run())


if __name__ == "__main__":
    main()
