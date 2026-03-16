import httpx
from bs4 import BeautifulSoup


def html_to_text(html: str | None) -> str:
    """Strip HTML tags and scripts, return clean text."""
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "header", "footer"]):
        tag.decompose()
    text = soup.get_text(separator="\n", strip=True)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)[:8000]


async def extract_text_from_url(client: httpx.AsyncClient, url: str) -> str:
    """Fetch a URL and return its text content."""
    try:
        resp = await client.get(
            url,
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0 (compatible; IdeaScout/1.0)"},
        )
        resp.raise_for_status()
        return html_to_text(resp.text)
    except (httpx.HTTPError, Exception):
        return ""
