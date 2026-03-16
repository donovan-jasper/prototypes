import httpx
from idea_scout.config import OMNIROUTE_BASE, OMNIROUTE_MODEL

SPEC_PROMPT = """You are a senior software architect. Given this app idea, write a complete
implementation spec that a coding agent can follow to build a working prototype.

IDEA: {title}
DESCRIPTION: {analysis}

Write a spec with these sections:
1. App Name (creative, memorable)
2. One-line pitch
3. Tech stack (keep it simple — prefer Python/Flask or Node/Express, SQLite, vanilla HTML/CSS/JS)
4. Core features (3-5 max, MVP only)
5. File structure
6. Implementation steps (detailed enough for an AI coding agent to follow)
7. How to test it works

Output as clean markdown. No preamble."""


async def generate_spec(post: dict) -> str:
    """Generate an implementation spec from an idea."""
    prompt = SPEC_PROMPT.format(
        title=post["title"],
        analysis=post.get("analysis", post.get("selftext", "")),
    )
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{OMNIROUTE_BASE}/chat/completions",
            json={
                "model": OMNIROUTE_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.5,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
