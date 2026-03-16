import json
import asyncio
import httpx
from .config import OMNIROUTE_BASE, PLANNER_MODEL

ANALYSIS_PROMPT = """Analyze this app idea from Reddit. Respond ONLY with valid JSON, no markdown.

Title: {title}
Description: {selftext}
Subreddit: r/{subreddit}
Upvotes: {score} | Comments: {num_comments}

Respond with this exact JSON structure:
{{
  "idea_summary": "one sentence summary of the app idea",
  "competitors": "existing apps/services that do something similar",
  "gap": "what's missing or bad about existing solutions",
  "difficulty": "Easy/Medium/Hard — brief explanation",
  "viability_score": <1-10 integer, 10 = most viable>
}}"""


def build_analysis_prompt(post: dict) -> str:
    return ANALYSIS_PROMPT.format(**post)


def parse_analysis_response(text: str) -> dict:
    """Parse LLM response into analysis dict."""
    try:
        cleaned = text.strip()
        if "```" in cleaned:
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.strip()
        data = json.loads(cleaned)
        score = int(data.get("viability_score", 0))
        score = max(0, min(10, score))
        analysis = (
            f"{data.get('idea_summary', '')}\n"
            f"Competitors: {data.get('competitors', 'Unknown')}\n"
            f"Gap: {data.get('gap', 'Unknown')}\n"
            f"Difficulty: {data.get('difficulty', 'Unknown')}"
        )
        return {"analysis": analysis, "viability_score": score}
    except (json.JSONDecodeError, ValueError, IndexError):
        return {"analysis": f"Failed to parse LLM response: {text[:200]}", "viability_score": 0}


async def analyze_post(client: httpx.AsyncClient, post: dict) -> dict:
    """Send a post to OmniRoute for analysis."""
    prompt = build_analysis_prompt(post)
    resp = await client.post(
        f"{OMNIROUTE_BASE}/chat/completions",
        json={
            "model": PLANNER_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
        },
        timeout=60,
    )
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]
    await asyncio.sleep(2)  # spread load across providers
    return parse_analysis_response(content)
