import json
import asyncio
import hashlib
import httpx
from .config import OMNIROUTE_BASE, PLANNER_MODEL
from .web_search import search_web
from .page_fetcher import extract_text_from_url
from .db import IdeaDB

QUERY_GEN_PROMPT = """Generate 15 diverse web search queries to find unmet software/app needs.

Mix these strategies:
1. Dedicated sources: "Show HN", "Product Hunt new", "indie hackers what to build"
2. Organic demand: real people expressing frustration or wishes, like:
   - "I wish there was an app" site:reddit.com
   - "someone should build" app OR tool
   - "why isn't there a" software OR service
   - "is there an app that" -"yes"
   - "I would pay for" app OR tool
   - "frustrated with" app OR software
3. Niche communities: specific subreddits, forums, Quora, Twitter/X

Return ONLY a JSON array of query strings. No commentary."""

EXTRACT_IDEAS_PROMPT = """Extract app/tool ideas from these web search results and page contents.

For each idea found, return:
- title: concise name for the idea
- description: what the person wants/needs (2-3 sentences)
- source_url: the URL where you found it
- source_type: "reddit", "hn", "twitter", "forum", "blog", "producthunt", or "other"
- demand_signal: evidence of demand (upvotes, replies, "me too" comments, etc.)

Only extract genuine unmet needs — skip self-promotion, "I built this" posts (unless the comments reveal unmet needs), and vague wishes.

Search results and page contents:
{context}

Return ONLY a JSON array. No commentary. If no ideas found, return []."""

COMPETITION_PROMPT = """Analyze competition for this app idea:

IDEA: {title}
DESCRIPTION: {description}

Based on these search results about existing solutions:
{search_results}

Return JSON:
{{
  "competitors": ["list of existing apps/services"],
  "gaps": "what's missing or bad about existing solutions",
  "competition_score": <1-10 integer, 10 = wide open market, 1 = completely saturated>
}}

Be honest. If strong competitors exist with no clear gap, score low. Only a JSON object."""

MAX_SEARCH_QUERIES = 20
MAX_PAGE_FETCHES = 30


def parse_ideas_from_llm(text: str) -> list[dict]:
    try:
        cleaned = text.strip()
        if "```" in cleaned:
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.strip()
        data = json.loads(cleaned)
        if not isinstance(data, list):
            return []
        return [
            {
                "title": item.get("title", ""),
                "description": item.get("description", ""),
                "source_url": item.get("source_url", ""),
                "source_type": item.get("source_type", "other"),
                "demand_signal": item.get("demand_signal", ""),
            }
            for item in data
            if item.get("title")
        ]
    except (json.JSONDecodeError, ValueError, IndexError):
        return []


def parse_competition_from_llm(text: str) -> dict:
    try:
        cleaned = text.strip()
        if "```" in cleaned:
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.strip()
        data = json.loads(cleaned)
        score = max(1, min(10, int(data.get("competition_score", 5))))
        competitors = data.get("competitors", [])
        gaps = data.get("gaps", "Unknown")
        analysis = f"Competitors: {', '.join(competitors)}\nGaps: {gaps}"
        return {"competition_analysis": analysis, "competition_score": score}
    except (json.JSONDecodeError, ValueError, IndexError):
        return {"competition_analysis": "Failed to analyze competition", "competition_score": 5}


def _idea_id(title: str, source_url: str) -> str:
    raw = f"{title.lower().strip()}|{source_url.strip()}"
    return f"web-{hashlib.sha256(raw.encode()).hexdigest()[:12]}"


async def _llm_call(client: httpx.AsyncClient, prompt: str) -> str:
    resp = await client.post(
        f"{OMNIROUTE_BASE}/chat/completions",
        json={
            "model": PLANNER_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.4,
        },
        timeout=120,
    )
    resp.raise_for_status()
    await asyncio.sleep(3)  # spread load across providers
    return resp.json()["choices"][0]["message"]["content"]


async def run_agentic_scout(db: IdeaDB) -> int:
    """Run one cycle of the agentic scraper. Returns count of new ideas found."""
    new_count = 0

    async with httpx.AsyncClient(timeout=30) as client:
        # Step 1: Generate search queries
        print("  [scout] Generating search queries...")
        query_response = await _llm_call(client, QUERY_GEN_PROMPT)
        try:
            cleaned = query_response.strip()
            if "```" in cleaned:
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
                cleaned = cleaned.strip()
            queries = json.loads(cleaned)
        except json.JSONDecodeError:
            queries = []
        queries = queries[:MAX_SEARCH_QUERIES]
        print(f"  [scout] Got {len(queries)} queries")

        # Step 2: Search and collect results
        all_context = []
        fetched = 0
        for query in queries:
            results = search_web(query, max_results=5)
            for r in results:
                snippet = f"URL: {r['url']}\nTitle: {r['title']}\nSnippet: {r['body']}"
                all_context.append(snippet)
                # Fetch full page for promising results
                if fetched < MAX_PAGE_FETCHES and any(
                    kw in r["body"].lower() + r["title"].lower()
                    for kw in ["wish", "need", "want", "should build", "frustrated", "app idea", "looking for"]
                ):
                    page_text = await extract_text_from_url(client, r["url"])
                    if page_text:
                        all_context.append(f"Full page from {r['url']}:\n{page_text}")
                        fetched += 1

        print(f"  [scout] Collected {len(all_context)} context snippets, fetched {fetched} pages")

        # Step 3: Extract ideas
        context_str = "\n---\n".join(all_context)
        if len(context_str) > 30000:
            context_str = context_str[:30000]

        print("  [scout] Extracting ideas...")
        extract_response = await _llm_call(
            client, EXTRACT_IDEAS_PROMPT.format(context=context_str)
        )
        ideas = parse_ideas_from_llm(extract_response)
        print(f"  [scout] Extracted {len(ideas)} ideas")

        # Step 4: Dedup and store
        for idea in ideas:
            idea_id = _idea_id(idea["title"], idea["source_url"])
            if db.get_post(idea_id):
                continue

            post = {
                "id": idea_id,
                "title": idea["title"],
                "selftext": idea["description"],
                "score": 0,
                "num_comments": 0,
                "subreddit": idea["source_type"],
                "permalink": idea["source_url"],
                "created_utc": 0,
                "source_url": idea["source_url"],
                "source_type": idea["source_type"],
                "demand_signal": idea["demand_signal"],
            }
            db.upsert_post(post)
            new_count += 1

        # Step 5: Competition analysis for unanalyzed ideas
        unanalyzed = db.get_unanalyzed_posts(limit=10)
        print(f"  [scout] Analyzing {len(unanalyzed)} ideas + competition...")
        for post in unanalyzed:
            try:
                # Viability analysis
                from .analyzer import analyze_post
                result = await analyze_post(client, post)
                db.save_analysis(post["id"], result["analysis"], result["viability_score"])
                print(f"    [{result['viability_score']}/10] {post['title'][:50]}")

                # Competition check for promising ideas
                if result["viability_score"] >= 5:
                    comp_queries = [
                        f"apps that do {post['title'][:30]}",
                        f"alternatives to {post['title'][:30]} app",
                    ]
                    comp_results = []
                    for cq in comp_queries:
                        comp_results.extend(search_web(cq, max_results=5))
                    comp_context = "\n".join(
                        f"- {r['title']}: {r['body']}" for r in comp_results
                    )
                    comp_response = await _llm_call(
                        client,
                        COMPETITION_PROMPT.format(
                            title=post["title"],
                            description=post.get("selftext", ""),
                            search_results=comp_context,
                        ),
                    )
                    comp = parse_competition_from_llm(comp_response)
                    db.save_competition(
                        post["id"], comp["competition_analysis"], comp["competition_score"]
                    )
                    print(f"    Competition: {comp['competition_score']}/10")
            except Exception as e:
                print(f"    ERROR: {e}")

    return new_count
