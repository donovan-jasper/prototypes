from idea_scout.config import PLANNER_MODEL
from builder.code_builder import llm_call
import httpx

SPEC_PROMPT = """You are a senior mobile app architect and product strategist.

Given this raw idea signal, FIRST think broadly about how the core concept could serve the widest
possible mobile audience. Don't just build what was described — think about who else would want
this, what adjacent problems it solves, and how to make it a must-have app.

RAW IDEA: {title}
CONTEXT: {analysis}

Write a spec with these sections:

1. App Name — MUST be original, creative, and App Store ready. Great names:
   - Alliterate (PocketPal, SnapShift, CallCatch)
   - Are clever acronyms
   - Are short, punchy, memorable words
   - NEVER reuse the name of the original project/post this idea came from

2. One-line pitch (as it would appear on the App Store — sell the benefit, not the feature)

3. Expanded vision — Who is this REALLY for? Think beyond the original niche:
   - What's the broadest audience this serves?
   - What adjacent use cases does this enable?
   - Why would a non-technical person want this?

4. Tech stack — React Native (Expo) for cross-platform iOS+Android. SQLite for local storage. Keep deps minimal.

5. Core features (3-5 max, MVP only — what gets people to download and pay)

6. Monetization strategy — be specific:
   - Free tier vs paid (what's the hook vs the paywall?)
   - Price point with reasoning
   - What makes people STAY subscribed?

7. Skip if saturated — if well-funded incumbents (1Password, Notion, etc.) already dominate this
   exact niche with no clear gap, say "SKIP: [reason]" and stop here.

8. File structure

9. Tests — include Jest test files for core logic. Every feature must have at least one test.

10. Implementation steps (detailed enough for an AI coding agent to follow)

11. How to verify it works (Expo Go on device or simulator, plus `npm test` must pass)

Output as clean markdown. No preamble."""


async def generate_spec(post: dict) -> str:
    """Generate an implementation spec from an idea."""
    prompt = SPEC_PROMPT.format(
        title=post["title"],
        analysis=post.get("analysis", post.get("selftext", "")),
    )
    async with httpx.AsyncClient(timeout=300) as client:
        return await llm_call(
            client, PLANNER_MODEL,
            [{"role": "user", "content": prompt}],
            temperature=0.5,
        )
