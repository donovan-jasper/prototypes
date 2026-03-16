import httpx
from .config import REDDIT_BASE, REDDIT_HEADERS, SUBREDDITS


def parse_reddit_response(data: dict) -> list[dict]:
    """Extract posts from Reddit JSON response."""
    posts = []
    for child in data.get("data", {}).get("children", []):
        p = child.get("data", {})
        posts.append({
            "id": p.get("id", ""),
            "title": p.get("title", ""),
            "selftext": p.get("selftext", ""),
            "score": p.get("score", 0),
            "num_comments": p.get("num_comments", 0),
            "subreddit": p.get("subreddit", ""),
            "permalink": p.get("permalink", ""),
            "created_utc": p.get("created_utc", 0),
        })
    return posts


async def fetch_subreddit(client: httpx.AsyncClient, subreddit: str) -> list[dict]:
    """Fetch hot posts from a subreddit."""
    url = REDDIT_BASE.format(subreddit=subreddit)
    resp = await client.get(url, headers=REDDIT_HEADERS)
    resp.raise_for_status()
    return parse_reddit_response(resp.json())


async def fetch_all_subreddits() -> list[dict]:
    """Fetch posts from all configured subreddits."""
    all_posts = []
    async with httpx.AsyncClient(timeout=30) as client:
        for sub in SUBREDDITS:
            try:
                posts = await fetch_subreddit(client, sub)
                all_posts.extend(posts)
            except httpx.HTTPError as e:
                print(f"  Skipping r/{sub}: {e}")
                continue
    return all_posts
