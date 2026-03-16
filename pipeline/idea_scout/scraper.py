import httpx
from .config import HN_SEARCH_BASE, HN_SEARCH_QUERIES, HN_STORY_LIMIT


def parse_hn_search_response(data: dict) -> list[dict]:
    """Extract posts from HN Algolia search response."""
    posts = []
    for hit in data.get("hits", []):
        # Skip if no title
        title = hit.get("title") or ""
        if not title:
            continue
        story_text = hit.get("story_text") or hit.get("comment_text") or ""
        posts.append({
            "id": f"hn-{hit.get('objectID', '')}",
            "title": title,
            "selftext": story_text[:2000],
            "score": hit.get("points") or 0,
            "num_comments": hit.get("num_comments") or 0,
            "subreddit": "HackerNews",
            "permalink": f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}",
            "created_utc": hit.get("created_at_i") or 0,
        })
    return posts


async def fetch_hn_search(client: httpx.AsyncClient, query: str, limit: int = 30) -> list[dict]:
    """Search HN via Algolia API."""
    resp = await client.get(
        f"{HN_SEARCH_BASE}/search_by_date",
        params={
            "query": query,
            "tags": "story",
            "hitsPerPage": limit,
        },
    )
    resp.raise_for_status()
    return parse_hn_search_response(resp.json())


async def fetch_all_subreddits() -> list[dict]:
    """Fetch posts from all configured sources."""
    all_posts = []
    seen_ids = set()

    async with httpx.AsyncClient(timeout=30) as client:
        for query in HN_SEARCH_QUERIES:
            try:
                posts = await fetch_hn_search(client, query, HN_STORY_LIMIT)
                for post in posts:
                    if post["id"] not in seen_ids:
                        seen_ids.add(post["id"])
                        all_posts.append(post)
            except httpx.HTTPError as e:
                print(f"  Skipping query '{query}': {e}")
                continue

    return all_posts
