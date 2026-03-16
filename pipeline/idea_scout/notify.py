"""Shared notification helpers. All pipeline notifications go through here."""
import httpx
from .config import NTFY_TOPIC

NTFY_URL = f"https://ntfy.sh/{NTFY_TOPIC}"


async def _send(title: str, body: str, tags: str = "robot", priority: str = "default"):
    """Low-level ntfy send. Handles encoding and errors."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            await client.post(
                NTFY_URL,
                content=body.encode("utf-8"),
                headers={
                    "Title": title.encode("ascii", errors="replace").decode(),
                    "Tags": tags,
                    "Priority": priority,
                },
            )
    except Exception:
        pass


def _parse_analysis(analysis: str) -> tuple[str, dict]:
    """Parse analysis text into (summary, key-value dict)."""
    lines = analysis.split("\n")
    summary = lines[0] if lines else ""
    parts = {}
    for line in lines[1:]:
        if ":" in line:
            key = line.split(":")[0].strip()
            val = ":".join(line.split(":")[1:]).strip()
            if val:
                parts[key] = val
    return summary, parts


async def notify_daemon(msg: str, tags: str = "robot"):
    """Daemon lifecycle events (start, error, idle)."""
    await _send("Pipeline", msg, tags=tags)


async def notify_high_score_idea(idea: dict):
    """Individual notification when an idea scores >= 7 during analysis.

    Title: "New 8/10: CramCure"
    Body:
    Smart flashcard app that uses spaced repetition
    Money: Freemium $4.99/mo
    Who: Students, language learners
    Gap: No good mobile-first solution exists
    """
    score = idea.get("viability_score", 0)
    title = idea.get("title", "Unknown")
    summary, parts = _parse_analysis(idea.get("analysis", "") or "")

    body_lines = [(summary or title)[:120]]
    if parts.get("Monetization"):
        body_lines.append(f"Money: {parts['Monetization'][:80]}")
    if parts.get("Audience"):
        body_lines.append(f"Who: {parts['Audience'][:80]}")
    if parts.get("Gap"):
        body_lines.append(f"Gap: {parts['Gap'][:80]}")

    ntfy_title = f"New {score}/10: {title[:50]}"
    priority = "high" if score >= 9 else "default"
    tags = "star2,iphone" if score >= 9 else "bulb,iphone"

    await _send(ntfy_title, "\n".join(body_lines), tags=tags, priority=priority)


async def notify_build_complete(idea: dict, status: str, file_count: int):
    """Notification when a prototype build finishes.

    Title: "Built: CramCure [working]"
    Body:
    Smart flashcard app with spaced repetition
    Score: 8/10 | Files: 12
    Money: Freemium $4.99/mo
    """
    title = idea.get("title", "Unknown")
    summary, parts = _parse_analysis(idea.get("analysis", "") or "")

    is_working = "working" in status or status == "improved"
    status_tag = "working" if is_working else "needs-fix"
    ntfy_title = f"Built: {title[:40]} [{status_tag}]"

    body_lines = [(summary or title)[:120]]
    body_lines.append(f"Score: {idea.get('viability_score', '?')}/10 | Files: {file_count}")
    if parts.get("Monetization"):
        body_lines.append(f"Money: {parts['Monetization'][:80]}")

    tags = "white_check_mark,iphone" if is_working else "warning"
    priority = "high" if is_working else "default"

    await _send(ntfy_title, "\n".join(body_lines), tags=tags, priority=priority)


async def notify_improvement(idea: dict, improvement: str, status: str, round_num: int):
    """Notification when a prototype improvement finishes.

    Title: "Improved: CramCure (r2) [improved]"
    Body: Added paywall skeleton with free trial
    """
    title = idea.get("title", "Unknown")
    ntfy_title = f"Improved: {title[:35]} (r{round_num}) [{status}]"
    await _send(ntfy_title, improvement[:200], tags="sparkles")


async def notify_analysis_batch(ideas: list[dict]):
    """Single notification summarizing a batch of 7+ ideas found during analysis.

    Title: "Analyzed: 3 promising ideas"
    Body:
    [8] CramCure — Smart flashcard app
    [7] DayDrop — One-note-per-day journal
    [7] FlipFile — Client-side file converter
    """
    if not ideas:
        return

    lines = []
    for idea in sorted(ideas, key=lambda x: x.get("viability_score", 0), reverse=True):
        score = idea.get("viability_score", 0)
        title = idea.get("title", "?")[:30]
        summary, _ = _parse_analysis(idea.get("analysis", "") or "")
        # Truncate summary to first sentence or 60 chars
        short = summary[:60].split(".")[0] if summary else ""
        lines.append(f"[{score}] {title} — {short}")

    ntfy_title = f"Analyzed: {len(ideas)} promising idea{'s' if len(ideas) != 1 else ''}"
    await _send(ntfy_title, "\n".join(lines), tags="bulb,iphone")


async def notify_scout_complete(new_count: int, total_queries: int):
    """Notification when a scout cycle finishes finding new ideas."""
    if new_count == 0:
        return
    await _send(
        f"Scout: {new_count} new ideas",
        f"Searched {total_queries} queries",
        tags="mag",
    )
