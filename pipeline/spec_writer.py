import httpx
from idea_scout.config import OMNIROUTE_BASE, PLANNER_MODEL

SPEC_PROMPT = """You are a senior mobile app architect. Given this app idea, write a complete
implementation spec for a MOBILE APP prototype that a coding agent can build.

IDEA: {title}
DESCRIPTION: {analysis}

Write a spec with these sections:
1. App Name (creative, memorable, App Store ready)
2. One-line pitch (as it would appear on the App Store)
3. Tech stack — use React Native (Expo) for cross-platform iOS+Android. SQLite for local storage. Keep deps minimal.
4. Core features (3-5 max, MVP only — what gets people to download and pay)
5. Monetization strategy (subscription tiers, one-time purchase, freemium with IAP, etc.)
6. File structure
7. Implementation steps (detailed enough for an AI coding agent to follow)
8. How to test it works (Expo Go on device or simulator)

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
                "model": PLANNER_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.5,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
