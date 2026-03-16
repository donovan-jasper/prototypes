import httpx
from .config import NTFY_TOPIC


def format_digest(ideas: list[dict]) -> str:
    """Format top ideas into a readable digest."""
    if not ideas:
        return "No new high-scoring ideas today."
    lines = []
    for i, idea in enumerate(ideas, 1):
        analysis = idea.get("analysis", "") or ""
        # First line of analysis is the summary
        summary = analysis.split("\n")[0] if analysis else idea["title"]
        source = idea.get("source_type") or idea.get("subreddit", "")
        competition = idea.get("competition_score")
        comp_str = f" | Competition: {competition}/10" if competition else ""

        lines.append(
            f"{i}. [{idea['viability_score']}/10] {idea['title']}\n"
            f"   {summary}\n"
            f"   {source}{comp_str}"
        )
    return "\n\n".join(lines)


async def send_digest(ideas: list[dict]):
    """Send daily digest via ntfy."""
    body = format_digest(ideas)
    async with httpx.AsyncClient() as client:
        # ASCII-safe title to avoid httpx encoding errors
        title = f"Top {len(ideas)} Mobile App Ideas"
        await client.post(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            content=body.encode("utf-8"),
            headers={
                "Title": title.encode("ascii", errors="replace").decode(),
                "Priority": "default",
                "Tags": "bulb,iphone",
            },
        )
