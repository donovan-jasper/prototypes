import json
import asyncio
import hashlib
import httpx
from .config import OMNIROUTE_BASE, PLANNER_MODEL, CODER_MODEL
from .web_search import search_web
from .page_fetcher import extract_text_from_url
from .db import IdeaDB

QUERY_GEN_PROMPT = """Generate 15 diverse web search queries to find unmet MOBILE APP needs that people would pay for.

Focus on monetizable mobile app gaps — things people want on their phone but can't find.

Mix these strategies:
1. Direct mobile demand:
   - "I wish there was an app" site:reddit.com
   - "need an app for" site:reddit.com
   - "is there an iPhone app" OR "is there an Android app"
   - "best app for" -"here are" (find questions, not listicles)
   - "no good app for" OR "every app for X sucks"
   - "I would pay for an app" OR "shut up and take my money" app
2. Frustration with existing apps:
   - "frustrated with" app mobile
   - "looking for alternative to" app
   - "X app is terrible" OR "X app keeps crashing"
   - "why did they remove" feature app
3. Web tools missing mobile versions:
   - "wish X had a mobile app"
   - "X only works on desktop"
   - "need mobile version of"
4. Overpriced apps to undercut:
   - Search for App Store apps that charge $5-20+ for simple functionality
   - "overpriced" + app category on Reddit
   - "not worth the price" app review
   - "free alternative to [expensive app]"
   - Simple utility apps (contacts sync, file manager, QR scanner) charging premium prices
5. Niche communities: specific subreddits (r/apps, r/androidapps, r/iphone), forums, Twitter/X, Quora

Return ONLY a JSON array of query strings. No commentary."""

EXTRACT_IDEAS_PROMPT = """Extract MOBILE APP ideas from these web search results and page contents.

Focus on ideas that would work as a paid/freemium mobile app (iOS or Android).

For each idea found, return:
- title: a CREATIVE, ORIGINAL app name (NOT the name from the source post). Good names alliterate (SnapShift), are punchy acronyms, or catchy words. NEVER copy the project name from the source.
- description: what the person wants/needs as a mobile app (2-3 sentences)
- source_url: the URL where you found it
- source_type: "reddit", "hn", "twitter", "forum", "blog", "producthunt", or "other"
- demand_signal: evidence of demand (upvotes, replies, "me too" comments, etc.)
- monetization_hint: how this could make money (subscription, one-time purchase, freemium, ads, etc.)

Think BROADLY — a developer tool complaint might inspire a consumer mobile app. "I wish my CI was faster" → build status dashboard app. "No good way to track API costs" → subscription tracker app.

Skip ideas where well-funded incumbents already dominate (password managers, basic note apps, etc.).
Prioritize ideas where people express willingness to pay.

Search results and page contents:
{context}

Return ONLY a JSON array. No commentary. If no ideas found, return []."""

COMPETITION_PROMPT = """Analyze MOBILE APP competition for this idea:

IDEA: {title}
DESCRIPTION: {description}

Based on these search results about existing solutions:
{search_results}

Focus specifically on the App Store / Google Play landscape. A web-only tool with no mobile app is a GAP, not a competitor.

Return JSON:
{{
  "competitors": ["list of existing MOBILE apps that do this"],
  "competitor_prices": ["price of each competitor: free, $X, $X/mo"],
  "web_only_alternatives": ["web tools with no mobile app — these are opportunities"],
  "gaps": "what's missing or bad about existing mobile solutions",
  "overpriced_opportunity": "if competitors charge $5+ for simple functionality, note the undercut opportunity",
  "monetization": "recommended price point to undercut competitors while still making money",
  "competition_score": <1-10 integer, 10 = wide open OR overpriced incumbents easy to undercut, 1 = saturated with good free/cheap apps>
}}

Be honest. If strong mobile competitors exist with no clear gap, score low. Only a JSON object."""

MAX_SEARCH_QUERIES = 25
MAX_PAGE_FETCHES = 30

# Always-run queries that reliably find mobile app demand on Reddit/social
SEED_QUERIES = [
    '"I wish there was an app" site:reddit.com',
    '"someone should make an app" site:reddit.com',
    '"is there an app that" site:reddit.com',
    '"I would pay for" app site:reddit.com',
    '"no good app for" site:reddit.com',
    '"why is there no app" site:reddit.com',
    '"need an app" site:reddit.com/r/androidapps OR site:reddit.com/r/iphone',
    '"app idea" site:reddit.com/r/AppIdeas OR site:reddit.com/r/SomebodyMakeThis',
    '"looking for an app" site:reddit.com -"found it"',
    '"every app for" "sucks" OR "terrible" OR "awful" site:reddit.com',
    # Overpriced app store apps — undercut opportunity
    '"too expensive" app store site:reddit.com',
    '"not worth" "$" app store site:reddit.com',
    '"overpriced" app iOS OR Android site:reddit.com',
    '"why does this app cost" site:reddit.com',
    '"free alternative to" app iOS OR Android site:reddit.com',
]


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
                "monetization_hint": item.get("monetization_hint", ""),
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
        prices = data.get("competitor_prices", [])
        web_only = data.get("web_only_alternatives", [])
        gaps = data.get("gaps", "Unknown")
        monetization = data.get("monetization", "Unknown")
        overpriced = data.get("overpriced_opportunity", "")
        comp_with_prices = []
        for i, c in enumerate(competitors):
            price = prices[i] if i < len(prices) else ""
            comp_with_prices.append(f"{c} ({price})" if price else c)
        parts = [f"Mobile competitors: {', '.join(comp_with_prices) if comp_with_prices else 'None found'}"]
        if web_only:
            parts.append(f"Web-only (mobile gap): {', '.join(web_only)}")
        parts.append(f"Gaps: {gaps}")
        if overpriced:
            parts.append(f"Undercut opportunity: {overpriced}")
        parts.append(f"Recommended pricing: {monetization}")
        analysis = "\n".join(parts)
        return {"competition_analysis": analysis, "competition_score": score}
    except (json.JSONDecodeError, ValueError, IndexError):
        return {"competition_analysis": "Failed to analyze competition", "competition_score": 5}


def _idea_id(title: str, source_url: str) -> str:
    raw = f"{title.lower().strip()}|{source_url.strip()}"
    return f"web-{hashlib.sha256(raw.encode()).hexdigest()[:12]}"


async def _llm_call(client: httpx.AsyncClient, prompt: str, model: str = None) -> str:
    resp = await client.post(
        f"{OMNIROUTE_BASE}/chat/completions",
        json={
            "model": model or CODER_MODEL,
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
        # Step 1: Seed queries (guaranteed Reddit/social hits) + LLM-generated queries
        print("  [scout] Generating search queries...")
        queries = list(SEED_QUERIES)  # always search these first
        try:
            query_response = await _llm_call(client, QUERY_GEN_PROMPT)
            cleaned = query_response.strip()
            if "```" in cleaned:
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
                cleaned = cleaned.strip()
            llm_queries = json.loads(cleaned)
            if isinstance(llm_queries, list):
                queries.extend(llm_queries)
        except (json.JSONDecodeError, Exception) as e:
            print(f"  [scout] LLM query gen failed: {e}, using seed queries only")
        queries = queries[:MAX_SEARCH_QUERIES]
        print(f"  [scout] Got {len(queries)} queries ({len(SEED_QUERIES)} seed + {len(queries) - len(SEED_QUERIES)} LLM)")

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

        print("  [scout] Extracting ideas (planner)...")
        extract_response = await _llm_call(
            client, EXTRACT_IDEAS_PROMPT.format(context=context_str),
            model=PLANNER_MODEL,
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

        # Analysis + competition handled by daemon's analyze_batch loop
        print(f"  [scout] Done — {new_count} new ideas stored, awaiting analysis")

    return new_count
