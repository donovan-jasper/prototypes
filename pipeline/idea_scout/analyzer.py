import json
import asyncio
import httpx
from .config import OMNIROUTE_BASE, PLANNER_MODEL

ANALYSIS_PROMPT = """Analyze this as a MOBILE APP opportunity. Think BROADLY — don't just evaluate the literal idea.
Ask yourself: "What's the widest audience version of this concept on mobile?"

A developer tool might inspire a productivity app. A web service might reveal an unserved mobile need.
Think about what non-technical people would pay for.

Title: {title}
Description: {selftext}
Source: {subreddit}
Upvotes: {score} | Comments: {num_comments}

Respond ONLY with valid JSON, no markdown:
{{
  "idea_summary": "one sentence — the BROADENED mobile app concept, not just the original idea",
  "mobile_fit": "why this works as a mobile app — what's the phone-native advantage?",
  "target_audience": "who downloads this? be specific beyond just 'everyone'",
  "competitors": "existing MOBILE apps (App Store/Play Store) that compete directly",
  "gap": "what's missing or bad about existing mobile solutions",
  "monetization": "specific strategy (subscription $X/mo, freemium, one-time $X) and why people would pay",
  "saturated": true/false — true if dominant well-funded apps already nail this (e.g. password managers, basic notes),
  "difficulty": "Easy/Medium/Hard — brief explanation",
  "viability_score": <1-10 integer, 10 = most viable. Score 0 if saturated by incumbents.>
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
        # Score 0 for saturated markets
        if data.get("saturated", False):
            score = 0
        analysis = (
            f"{data.get('idea_summary', '')}\n"
            f"Audience: {data.get('target_audience', 'Unknown')}\n"
            f"Mobile fit: {data.get('mobile_fit', 'Unknown')}\n"
            f"Competitors: {data.get('competitors', 'Unknown')}\n"
            f"Gap: {data.get('gap', 'Unknown')}\n"
            f"Monetization: {data.get('monetization', 'Unknown')}\n"
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
