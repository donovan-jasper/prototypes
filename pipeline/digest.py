import httpx
from .config import NTFY_TOPIC


def format_digest(ideas: list[dict]) -> str:
    """Format top ideas into a readable digest."""
    if not ideas:
        return "No new high-scoring ideas today."
    lines = []
    for i, idea in enumerate(ideas, 1):
        analysis = idea.get("analysis", "") or ""
        # Extract key fields from analysis
        parts = {line.split(":")[0].strip(): ":".join(line.split(":")[1:]).strip()
                 for line in analysis.split("\n") if ":" in line}
        summary = analysis.split("\n")[0] if analysis else idea["title"]
        audience = parts.get("Audience", "")
        monetization = parts.get("Monetization", "")
        gap = parts.get("Gap", "")
        competition = idea.get("competition_score")

        detail = f"{i}. [{idea['viability_score']}/10] {idea['title']}\n{summary}"
        if audience:
            detail += f"\nWho: {audience[:80]}"
        if gap:
            detail += f"\nGap: {gap[:80]}"
        if monetization:
            detail += f"\n$: {monetization[:80]}"
        if competition:
            detail += f"\nCompetition: {competition}/10"
        lines.append(detail)
    return "\n\n".join(lines)


async def send_digest(ideas: list[dict]):
    """Send daily digest via ntfy."""
    body = format_digest(ideas)
    try:
        async with httpx.AsyncClient(timeout=15) as client:
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
    except Exception as e:
        print(f"  Digest notification failed: {type(e).__name__}")
