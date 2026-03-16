import httpx
from .config import NTFY_TOPIC


def format_digest(ideas: list[dict]) -> str:
    """Format top ideas into a readable digest."""
    if not ideas:
        return "No new high-scoring ideas today."
    lines = []
    for i, idea in enumerate(ideas, 1):
        lines.append(
            f"{i}. [{idea['viability_score']}/10] {idea['title']}\n"
            f"   r/{idea['subreddit']} | {idea['score']}pts\n"
            f"   {(idea.get('analysis', '') or '')[:150]}"
        )
    return "\n\n".join(lines)


async def send_digest(ideas: list[dict]):
    """Send daily digest via ntfy."""
    body = format_digest(ideas)
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            content=body.encode(),
            headers={
                "Title": f"App Ideas: {len(ideas)} top finds",
                "Priority": "default",
                "Tags": "bulb",
            },
        )
