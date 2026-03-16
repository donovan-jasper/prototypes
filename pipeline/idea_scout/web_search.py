from ddgs import DDGS


def search_web(query: str, max_results: int = 10) -> list[dict]:
    """Search DuckDuckGo and return results as list of {title, url, body}."""
    if not query.strip():
        return []
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        return [
            {"title": r.get("title", ""), "url": r.get("href", ""), "body": r.get("body", "")}
            for r in results
        ]
    except Exception:
        return []
