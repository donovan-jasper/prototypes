# Agentic Pipeline Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the pipeline into a continuous daemon with LLM-driven web scraping, competition analysis, and prototype improvement.

**Architecture:** A daemon runs an infinite work loop choosing between scout (agentic web search → idea extraction → competition check), build (spec → code → validate), and improve (extend existing prototypes). All LLM calls through OmniRoute role-based combos. DuckDuckGo for free web search.

**Tech Stack:** Python 3.12, httpx, duckduckgo-search, beautifulsoup4, SQLite, OmniRoute, systemd

---

## File Structure

| File | Responsibility |
|------|---------------|
| `idea_scout/config.py` | Add daemon/scout config constants |
| `idea_scout/db.py` | Add new columns, migration, new queries |
| `idea_scout/web_search.py` | **NEW** — DuckDuckGo search wrapper |
| `idea_scout/page_fetcher.py` | **NEW** — Fetch URL, extract text from HTML |
| `idea_scout/agentic_scraper.py` | **NEW** — LLM agent loop: generate queries → search → fetch → extract ideas → competition check |
| `idea_scout/main.py` | Update to use agentic scraper alongside HN |
| `builder/improver.py` | **NEW** — Assess prototype, plan improvement, implement |
| `builder/orchestrator.py` | Extract `safe_name()`, `git_commit_and_push()` for reuse |
| `daemon.py` | **NEW** — Priority work loop, systemd entry point |
| `pyproject.toml` | Add dependencies, daemon script entry |
| `tests/test_web_search.py` | **NEW** |
| `tests/test_page_fetcher.py` | **NEW** |
| `tests/test_agentic_scraper.py` | **NEW** |
| `tests/test_db_v2.py` | **NEW** — Tests for new DB columns/queries |
| `tests/test_daemon.py` | **NEW** |

---

### Task 1: Add dependencies

**Files:**
- Modify: `pyproject.toml`

- [ ] **Step 1: Add duckduckgo-search and beautifulsoup4**

```toml
[project]
name = "idea-scout"
version = "0.2.0"
requires-python = ">=3.12"
dependencies = [
    "httpx>=0.27",
    "duckduckgo-search>=7.0",
    "beautifulsoup4>=4.12",
]

[project.optional-dependencies]
dev = ["pytest>=8.0"]

[project.scripts]
idea-scout = "idea_scout.main:main"
prototype-builder = "builder.orchestrator:main"
pipeline-daemon = "daemon:main"
```

- [ ] **Step 2: Install deps**

Run: `cd ~/prototypes/pipeline && uv sync`

- [ ] **Step 3: Commit**

```bash
git add pyproject.toml uv.lock
git commit -m "deps: add duckduckgo-search, beautifulsoup4 for agentic scraper"
```

---

### Task 2: Extend DB schema with migration

**Files:**
- Modify: `idea_scout/db.py`
- Create: `tests/test_db_v2.py`

- [ ] **Step 1: Write failing tests for new columns and queries**

```python
# tests/test_db_v2.py
import tempfile
import os
from idea_scout.db import IdeaDB


def test_upsert_post_with_new_fields():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        post = {
            "id": "web-abc", "title": "Test idea", "selftext": "Desc",
            "score": 42, "num_comments": 10, "subreddit": "reddit",
            "permalink": "https://reddit.com/r/x/abc", "created_utc": 1710500000.0,
            "source_url": "https://reddit.com/r/AppIdeas/abc",
            "source_type": "reddit",
            "demand_signal": "50 upvotes, 12 'me too' replies",
        }
        db.upsert_post(post)
        result = db.get_post("web-abc")
        assert result["source_url"] == "https://reddit.com/r/AppIdeas/abc"
        assert result["source_type"] == "reddit"
        assert result["demand_signal"] == "50 upvotes, 12 'me too' replies"
    finally:
        os.unlink(db_path)


def test_save_competition_analysis():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        post = {
            "id": "x1", "title": "Test", "selftext": "", "score": 10,
            "num_comments": 1, "subreddit": "HN", "permalink": "/x",
            "created_utc": 1710500000.0,
        }
        db.upsert_post(post)
        db.save_analysis("x1", "Great idea", 8)
        db.save_competition("x1", "Only 2 weak competitors", 7)
        result = db.get_post("x1")
        assert result["competition_score"] == 7
        assert "2 weak" in result["competition_analysis"]
    finally:
        os.unlink(db_path)


def test_get_buildable_ideas_uses_combined_score():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        # Idea A: high viability (9) but saturated market (2)
        for pid, via, comp in [("a", 9, 2), ("b", 7, 9), ("c", 8, 7)]:
            post = {
                "id": pid, "title": f"Idea {pid}", "selftext": "", "score": 10,
                "num_comments": 1, "subreddit": "HN", "permalink": f"/{pid}",
                "created_utc": 1710500000.0,
            }
            db.upsert_post(post)
            db.save_analysis(pid, f"Analysis {pid}", via)
            db.save_competition(pid, f"Competition {pid}", comp)
        # b has best combined: 7*0.6 + 9*0.4 = 7.8
        # c: 8*0.6 + 7*0.4 = 7.6
        # a: 9*0.6 + 2*0.4 = 6.2
        top = db.get_buildable_ideas(limit=3)
        assert top[0]["id"] == "b"
        assert top[1]["id"] == "c"
    finally:
        os.unlink(db_path)


def test_get_improvable_prototypes():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        for pid, imp_count in [("a", 0), ("b", 3), ("c", 1)]:
            post = {
                "id": pid, "title": f"Idea {pid}", "selftext": "", "score": 10,
                "num_comments": 1, "subreddit": "HN", "permalink": f"/{pid}",
                "created_utc": 1710500000.0,
            }
            db.upsert_post(post)
            db.save_analysis(pid, f"Analysis {pid}", 8)
            db.conn.execute(
                "UPDATE posts SET prototype_started=1, improvement_count=? WHERE id=?",
                (imp_count, pid),
            )
            db.conn.commit()
        # b has 3 improvements (at cap), should not appear
        result = db.get_improvable_prototypes(max_improvements=3, limit=5)
        ids = [r["id"] for r in result]
        assert "b" not in ids
        assert "a" in ids
    finally:
        os.unlink(db_path)


def test_record_improvement():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        post = {
            "id": "x1", "title": "Test", "selftext": "", "score": 10,
            "num_comments": 1, "subreddit": "HN", "permalink": "/x",
            "created_utc": 1710500000.0,
        }
        db.upsert_post(post)
        db.conn.execute("UPDATE posts SET prototype_started=1 WHERE id='x1'")
        db.conn.commit()
        db.record_improvement("x1")
        result = db.get_post("x1")
        assert result["improvement_count"] == 1
        assert result["last_improved_at"] is not None
    finally:
        os.unlink(db_path)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run python -m pytest tests/test_db_v2.py -v`
Expected: FAIL — missing methods/columns

- [ ] **Step 3: Implement DB changes**

Update `idea_scout/db.py`:

```python
import sqlite3


class IdeaDB:
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._create_tables()
        self._migrate()

    def _create_tables(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                selftext TEXT DEFAULT '',
                score INTEGER DEFAULT 0,
                num_comments INTEGER DEFAULT 0,
                subreddit TEXT DEFAULT '',
                permalink TEXT DEFAULT '',
                created_utc REAL DEFAULT 0,
                analysis TEXT,
                viability_score INTEGER,
                prototype_started INTEGER DEFAULT 0,
                discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                competition_score INTEGER,
                competition_analysis TEXT,
                source_url TEXT,
                source_type TEXT,
                demand_signal TEXT,
                improvement_count INTEGER DEFAULT 0,
                last_improved_at TIMESTAMP
            )
        """)
        self.conn.commit()

    def _migrate(self):
        """Add columns to existing DBs that lack them."""
        cursor = self.conn.execute("PRAGMA table_info(posts)")
        existing = {row[1] for row in cursor.fetchall()}
        new_cols = {
            "competition_score": "INTEGER",
            "competition_analysis": "TEXT",
            "source_url": "TEXT",
            "source_type": "TEXT",
            "demand_signal": "TEXT",
            "improvement_count": "INTEGER DEFAULT 0",
            "last_improved_at": "TIMESTAMP",
        }
        for col, col_type in new_cols.items():
            if col not in existing:
                self.conn.execute(f"ALTER TABLE posts ADD COLUMN {col} {col_type}")
        self.conn.commit()

    def upsert_post(self, post: dict):
        self.conn.execute("""
            INSERT INTO posts (id, title, selftext, score, num_comments,
                               subreddit, permalink, created_utc,
                               source_url, source_type, demand_signal)
            VALUES (:id, :title, :selftext, :score, :num_comments,
                    :subreddit, :permalink, :created_utc,
                    :source_url, :source_type, :demand_signal)
            ON CONFLICT(id) DO UPDATE SET
                score = :score,
                num_comments = :num_comments
        """, {
            "source_url": None, "source_type": None, "demand_signal": None,
            **post,
        })
        self.conn.commit()

    def get_post(self, post_id: str) -> dict | None:
        row = self.conn.execute(
            "SELECT * FROM posts WHERE id = ?", (post_id,)
        ).fetchone()
        return dict(row) if row else None

    def save_analysis(self, post_id: str, analysis: str, viability_score: int):
        self.conn.execute(
            "UPDATE posts SET analysis = ?, viability_score = ? WHERE id = ?",
            (analysis, viability_score, post_id),
        )
        self.conn.commit()

    def save_competition(self, post_id: str, competition_analysis: str, competition_score: int):
        self.conn.execute(
            "UPDATE posts SET competition_analysis = ?, competition_score = ? WHERE id = ?",
            (competition_analysis, competition_score, post_id),
        )
        self.conn.commit()

    def get_unanalyzed_posts(self, limit: int = 20) -> list[dict]:
        rows = self.conn.execute(
            "SELECT * FROM posts WHERE analysis IS NULL ORDER BY score DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]

    def get_top_ideas(self, limit: int = 5) -> list[dict]:
        rows = self.conn.execute(
            """SELECT * FROM posts
               WHERE viability_score IS NOT NULL
               ORDER BY viability_score DESC, score DESC
               LIMIT ?""",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]

    def get_unbuilt_top_ideas(self, min_score: int = 7, limit: int = 1) -> list[dict]:
        rows = self.conn.execute(
            """SELECT * FROM posts
               WHERE viability_score >= ? AND prototype_started = 0
               ORDER BY viability_score DESC, score DESC
               LIMIT ?""",
            (min_score, limit),
        ).fetchall()
        return [dict(r) for r in rows]

    def get_buildable_ideas(self, limit: int = 1) -> list[dict]:
        """Get unbuilt ideas ranked by combined viability + competition score."""
        rows = self.conn.execute(
            """SELECT *,
                      (COALESCE(viability_score, 0) * 0.6 +
                       COALESCE(competition_score, 0) * 0.4) AS combined_score
               FROM posts
               WHERE viability_score >= 7
                 AND COALESCE(competition_score, 5) >= 4
                 AND prototype_started = 0
               ORDER BY combined_score DESC
               LIMIT ?""",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]

    def get_improvable_prototypes(self, max_improvements: int = 3, limit: int = 1) -> list[dict]:
        rows = self.conn.execute(
            """SELECT * FROM posts
               WHERE prototype_started = 1
                 AND COALESCE(improvement_count, 0) < ?
               ORDER BY viability_score DESC
               LIMIT ?""",
            (max_improvements, limit),
        ).fetchall()
        return [dict(r) for r in rows]

    def record_improvement(self, post_id: str):
        self.conn.execute(
            """UPDATE posts SET
                improvement_count = COALESCE(improvement_count, 0) + 1,
                last_improved_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (post_id,),
        )
        self.conn.commit()

    def mark_prototype_started(self, post_id: str):
        self.conn.execute(
            "UPDATE posts SET prototype_started = 1 WHERE id = ?", (post_id,),
        )
        self.conn.commit()

    def count_unbuilt_ideas(self, min_score: int = 7) -> int:
        row = self.conn.execute(
            "SELECT COUNT(*) FROM posts WHERE viability_score >= ? AND prototype_started = 0",
            (min_score,),
        ).fetchone()
        return row[0]
```

- [ ] **Step 4: Run tests**

Run: `uv run python -m pytest tests/test_db_v2.py tests/test_db.py -v`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add idea_scout/db.py tests/test_db_v2.py
git commit -m "feat: extend DB with competition, source, improvement tracking"
```

---

### Task 3: Web search wrapper

**Files:**
- Create: `idea_scout/web_search.py`
- Create: `tests/test_web_search.py`

- [ ] **Step 1: Write failing test**

```python
# tests/test_web_search.py
from idea_scout.web_search import search_web


def test_search_web_returns_results():
    """Integration test — hits real DuckDuckGo."""
    results = search_web("python programming", max_results=3)
    assert len(results) > 0
    assert "url" in results[0]
    assert "title" in results[0]
    assert "body" in results[0]


def test_search_web_empty_query():
    results = search_web("", max_results=3)
    assert results == []
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run python -m pytest tests/test_web_search.py -v`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```python
# idea_scout/web_search.py
from duckduckgo_search import DDGS


def search_web(query: str, max_results: int = 10) -> list[dict]:
    """Search DuckDuckGo and return results as list of {title, url, body}."""
    if not query.strip():
        return []
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        return [
            {"title": r.get("title", ""), "url": r.get("href", ""), "body": r.get("body", "")}
            for r in results
        ]
    except Exception:
        return []
```

- [ ] **Step 4: Run tests**

Run: `uv run python -m pytest tests/test_web_search.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add idea_scout/web_search.py tests/test_web_search.py
git commit -m "feat: DuckDuckGo web search wrapper"
```

---

### Task 4: Page fetcher

**Files:**
- Create: `idea_scout/page_fetcher.py`
- Create: `tests/test_page_fetcher.py`

- [ ] **Step 1: Write failing test**

```python
# tests/test_page_fetcher.py
from idea_scout.page_fetcher import html_to_text, extract_text_from_url
import pytest


def test_html_to_text_strips_tags():
    html = "<html><body><h1>Title</h1><p>Hello <b>world</b></p><script>evil()</script></body></html>"
    text = html_to_text(html)
    assert "Title" in text
    assert "Hello world" in text
    assert "evil()" not in text
    assert "<" not in text


def test_html_to_text_handles_empty():
    assert html_to_text("") == ""
    assert html_to_text(None) == ""


@pytest.mark.asyncio
async def test_extract_text_from_url_real():
    """Integration test — fetches a real page."""
    import httpx
    async with httpx.AsyncClient(timeout=15) as client:
        text = await extract_text_from_url(client, "https://news.ycombinator.com")
    assert len(text) > 100
    assert "Hacker News" in text
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run python -m pytest tests/test_page_fetcher.py -v`
Expected: FAIL

- [ ] **Step 3: Implement**

```python
# idea_scout/page_fetcher.py
import httpx
from bs4 import BeautifulSoup


def html_to_text(html: str | None) -> str:
    """Strip HTML tags and scripts, return clean text."""
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "header", "footer"]):
        tag.decompose()
    text = soup.get_text(separator="\n", strip=True)
    # Collapse excessive whitespace
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)[:8000]  # Cap at 8k chars for LLM context


async def extract_text_from_url(client: httpx.AsyncClient, url: str) -> str:
    """Fetch a URL and return its text content."""
    try:
        resp = await client.get(
            url,
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0 (compatible; IdeaScout/1.0)"},
        )
        resp.raise_for_status()
        return html_to_text(resp.text)
    except (httpx.HTTPError, Exception):
        return ""
```

- [ ] **Step 4: Add pytest-asyncio dep and run tests**

Add `pytest-asyncio` to dev deps in pyproject.toml, then:

Run: `uv sync && uv run python -m pytest tests/test_page_fetcher.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add idea_scout/page_fetcher.py tests/test_page_fetcher.py pyproject.toml
git commit -m "feat: page fetcher with HTML-to-text extraction"
```

---

### Task 5: Agentic scraper

**Files:**
- Create: `idea_scout/agentic_scraper.py`
- Create: `tests/test_agentic_scraper.py`

- [ ] **Step 1: Write tests for LLM response parsing**

```python
# tests/test_agentic_scraper.py
import json
from idea_scout.agentic_scraper import parse_ideas_from_llm, parse_competition_from_llm


def test_parse_ideas_from_llm_valid():
    response = json.dumps([
        {
            "title": "Friend birthday tracker",
            "description": "App to remember friends' birthdays",
            "source_url": "https://reddit.com/r/AppIdeas/abc",
            "source_type": "reddit",
            "demand_signal": "50 upvotes",
        }
    ])
    ideas = parse_ideas_from_llm(response)
    assert len(ideas) == 1
    assert ideas[0]["title"] == "Friend birthday tracker"
    assert ideas[0]["source_type"] == "reddit"


def test_parse_ideas_from_llm_invalid():
    ideas = parse_ideas_from_llm("not json at all")
    assert ideas == []


def test_parse_ideas_from_llm_markdown_wrapped():
    response = '```json\n[{"title": "Test", "description": "A test"}]\n```'
    ideas = parse_ideas_from_llm(response)
    assert len(ideas) == 1


def test_parse_competition_from_llm_valid():
    response = json.dumps({
        "competitors": ["App A", "App B"],
        "gaps": "Neither does X well",
        "competition_score": 7,
    })
    result = parse_competition_from_llm(response)
    assert result["competition_score"] == 7
    assert "App A" in result["competition_analysis"]


def test_parse_competition_from_llm_invalid():
    result = parse_competition_from_llm("garbage")
    assert result["competition_score"] == 5  # default neutral
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run python -m pytest tests/test_agentic_scraper.py -v`
Expected: FAIL

- [ ] **Step 3: Implement agentic scraper**

```python
# idea_scout/agentic_scraper.py
import json
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
    return resp.json()["choices"][0]["message"]["content"]


async def run_agentic_scout(db: IdeaDB) -> int:
    """Run one cycle of the agentic scraper. Returns count of new ideas found."""
    new_count = 0

    async with httpx.AsyncClient(timeout=30) as client:
        # Step 1: Generate search queries
        print("  [scout] Generating search queries...")
        query_response = await _llm_call(client, QUERY_GEN_PROMPT)
        try:
            queries = json.loads(query_response.strip().strip("```json").strip("```").strip())
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
        # Chunk context to fit in LLM context window
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

                # Competition check (only for promising ideas)
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
```

- [ ] **Step 4: Run tests**

Run: `uv run python -m pytest tests/test_agentic_scraper.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add idea_scout/agentic_scraper.py tests/test_agentic_scraper.py
git commit -m "feat: agentic scraper with LLM-driven search and competition analysis"
```

---

### Task 6: Update main.py to use agentic scraper

**Files:**
- Modify: `idea_scout/main.py`

- [ ] **Step 1: Update main to run both HN and agentic scraper**

```python
# idea_scout/main.py
import asyncio
import httpx
from .config import DB_PATH
from .scraper import fetch_all_subreddits
from .analyzer import analyze_post
from .agentic_scraper import run_agentic_scout
from .db import IdeaDB
from .digest import send_digest


async def run():
    db = IdeaDB(DB_PATH)

    # 1. Fast HN scrape (existing, reliable)
    print("Fetching posts from HN...")
    posts = await fetch_all_subreddits()
    print(f"Found {len(posts)} HN posts")
    new_count = 0
    for post in posts:
        existing = db.get_post(post["id"])
        if existing and existing.get("analysis"):
            continue
        db.upsert_post(post)
        new_count += 1
    print(f"New/updated HN posts: {new_count}")

    # 2. Analyze unanalyzed HN posts
    unanalyzed = db.get_unanalyzed_posts(limit=15)
    if unanalyzed:
        print(f"Analyzing {len(unanalyzed)} posts...")
        async with httpx.AsyncClient(timeout=60) as client:
            for post in unanalyzed:
                try:
                    result = await analyze_post(client, post)
                    db.save_analysis(post["id"], result["analysis"], result["viability_score"])
                    print(f"  [{result['viability_score']}/10] {post['title'][:60]}")
                except Exception as e:
                    print(f"  ERROR analyzing {post['id']}: {e}")

    # 3. Agentic web scout (broader internet)
    print("Running agentic scout...")
    web_ideas = await run_agentic_scout(db)
    print(f"Agentic scout found {web_ideas} new ideas")

    # 4. Send digest with top ideas
    top = db.get_top_ideas(limit=5)
    if top:
        await send_digest(top)
        print(f"Digest sent with {len(top)} top ideas")


def main():
    asyncio.run(run())


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run full test suite**

Run: `uv run python -m pytest tests/ -v`
Expected: ALL PASS

- [ ] **Step 3: Commit**

```bash
git add idea_scout/main.py
git commit -m "feat: integrate agentic scout into main pipeline"
```

---

### Task 7: Prototype improver

**Files:**
- Create: `builder/improver.py`

- [ ] **Step 1: Implement improver**

```python
# builder/improver.py
import os
import subprocess
import httpx
from idea_scout.config import OMNIROUTE_BASE, PLANNER_MODEL, DB_PATH, NTFY_TOPIC
from idea_scout.db import IdeaDB
from builder.code_builder import llm_call, parse_code_blocks
from builder.orchestrator import write_files, try_install_and_test, PROTOTYPES_DIR

ASSESS_PROMPT = """You are reviewing an existing prototype app. Read the spec and code below.

## Spec
{spec}

## Current Files
{file_listing}

Pick the SINGLE highest-impact improvement from this list:
1. Add a compelling feature that differentiates this from competitors
2. Add AI integration via an OpenAI-compatible API at http://localhost:20128/v1 (model: "coder")
3. Improve the UI — better CSS, responsive layout, nicer design
4. Add or improve tests
5. Better README with clear setup/run instructions

Return JSON:
{{
  "improvement": "one sentence describing what to do",
  "category": "feature|ai|ui|tests|docs",
  "files_to_change": ["list of file paths to create or modify"]
}}

Only JSON, no commentary."""

IMPLEMENT_PROMPT = """Implement this improvement to an existing prototype.

## Improvement
{improvement}

## Current Spec
{spec}

## Current Files
{file_listing}

Output the COMPLETE updated files (not diffs). Format each as:
```path/to/file.ext
<full contents>
```

Only output files that changed or are new. No commentary outside code blocks."""


def _read_project_files(project_dir: str) -> str:
    """Read all text files in a project directory into a listing."""
    parts = []
    for root, _, fnames in os.walk(project_dir):
        for fname in fnames:
            if fname.startswith(".") or "__pycache__" in root or "node_modules" in root:
                continue
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, project_dir)
            try:
                with open(fpath) as f:
                    content = f.read()
                if len(content) < 10000:
                    parts.append(f"### {rel}\n```\n{content}\n```")
            except (UnicodeDecodeError, PermissionError):
                continue
    return "\n\n".join(parts)


def _find_project_dir(idea: dict) -> str | None:
    """Find the project directory for a given idea."""
    safe_name = "".join(
        c if c.isalnum() or c in "-_" else "-"
        for c in idea["title"].lower()
    )[:40].strip("-")
    pattern = f"idea-{idea['id']}-{safe_name}"
    candidate = os.path.join(PROTOTYPES_DIR, pattern)
    if os.path.isdir(candidate):
        return candidate
    # Fuzzy match: any dir starting with idea-{id}
    for d in os.listdir(PROTOTYPES_DIR):
        if d.startswith(f"idea-{idea['id']}"):
            return os.path.join(PROTOTYPES_DIR, d)
    return None


async def improve_prototype(idea: dict) -> bool:
    """Run one improvement cycle on an existing prototype. Returns True if successful."""
    db = IdeaDB(DB_PATH)
    project_dir = _find_project_dir(idea)
    if not project_dir:
        print(f"  Cannot find project dir for {idea['id']}")
        return False

    spec_path = os.path.join(project_dir, "spec.md")
    spec = ""
    if os.path.exists(spec_path):
        with open(spec_path) as f:
            spec = f.read()

    file_listing = _read_project_files(project_dir)
    if not file_listing:
        print(f"  Empty project dir: {project_dir}")
        return False

    async with httpx.AsyncClient(timeout=300) as client:
        # Step 1: Assess — planner picks improvement
        print("  [planner] Assessing prototype...")
        assess_response = await llm_call(
            client, PLANNER_MODEL,
            [{"role": "user", "content": ASSESS_PROMPT.format(spec=spec, file_listing=file_listing)}],
        )
        try:
            import json
            cleaned = assess_response.strip()
            if "```" in cleaned:
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
                cleaned = cleaned.strip()
            assessment = json.loads(cleaned)
        except (json.JSONDecodeError, ValueError):
            print(f"  Failed to parse assessment: {assess_response[:100]}")
            return False

        improvement = assessment.get("improvement", "")
        print(f"  [planner] Improvement: {improvement}")

        # Step 2: Implement — coder does the work
        from idea_scout.config import CODER_MODEL, UNSTUCK_MODEL
        print("  [coder] Implementing...")
        impl_response = await llm_call(
            client, CODER_MODEL,
            [{"role": "user", "content": IMPLEMENT_PROMPT.format(
                improvement=improvement, spec=spec, file_listing=file_listing
            )}],
            temperature=0.2,
        )
        files = parse_code_blocks(impl_response)
        if not files:
            print("  No files generated")
            return False
        write_files(project_dir, files)
        print(f"  Wrote {len(files)} files")

        # Step 3: Validate
        success, error = try_install_and_test(project_dir)
        if not success:
            print(f"  [unstuck] Fixing: {error[:80]}")
            fix_response = await llm_call(
                client, UNSTUCK_MODEL,
                [{"role": "user", "content": (
                    f"## Improvement attempted\n{improvement}\n\n"
                    f"## Files changed\n{impl_response}\n\n"
                    f"## Error\n{error}\n\n"
                    "Fix the code. Output COMPLETE corrected files as ```path\\ncontents``` blocks."
                )}],
                temperature=0.2,
            )
            fixed_files = parse_code_blocks(fix_response)
            if fixed_files:
                write_files(project_dir, fixed_files)
            success, error = try_install_and_test(project_dir)

        status = "improved" if success else "attempted"
        print(f"  Status: {status}")

        # Commit
        subprocess.run(["git", "add", "."], cwd=PROTOTYPES_DIR)
        subprocess.run(
            ["git", "commit", "-m", f"improve: {improvement[:60]} [{status}]"],
            cwd=PROTOTYPES_DIR,
        )
        subprocess.run(["git", "push"], cwd=PROTOTYPES_DIR)

        db.record_improvement(idea["id"])

        # Notify
        await client.post(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            content=f"Improved: {idea['title']}\n{improvement}\nStatus: {status}".encode(),
            headers={"Title": "Prototype Improved", "Tags": "sparkles"},
        )

    return success
```

- [ ] **Step 2: Commit**

```bash
git add builder/improver.py
git commit -m "feat: prototype improver with planner/coder/unstuck flow"
```

---

### Task 8: Daemon with priority work loop

**Files:**
- Create: `daemon.py`
- Modify: `idea_scout/config.py`

- [ ] **Step 1: Add daemon config constants**

Add to `idea_scout/config.py`:

```python
# Daemon config
SCOUT_INTERVAL_HOURS = int(os.getenv("SCOUT_INTERVAL_HOURS", "5"))
IDLE_SLEEP_MINUTES = int(os.getenv("IDLE_SLEEP_MINUTES", "30"))
MIN_BACKLOG = int(os.getenv("MIN_BACKLOG", "3"))  # scout when fewer unbuilt ideas
MAX_IMPROVEMENTS = int(os.getenv("MAX_IMPROVEMENTS", "3"))
```

- [ ] **Step 2: Implement daemon**

```python
# daemon.py
import asyncio
import time
import traceback
import httpx
from idea_scout.config import (
    DB_PATH, NTFY_TOPIC, SCOUT_INTERVAL_HOURS, IDLE_SLEEP_MINUTES,
    MIN_BACKLOG, MAX_IMPROVEMENTS,
)
from idea_scout.db import IdeaDB
from idea_scout.main import run as run_scout
from builder.orchestrator import build_next_prototype
from builder.improver import improve_prototype


async def notify(msg: str, title: str = "Pipeline", tags: str = "robot"):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://ntfy.sh/{NTFY_TOPIC}",
                content=msg.encode(),
                headers={"Title": title, "Tags": tags},
            )
    except Exception:
        pass


async def run_loop():
    last_scout = 0
    print("Pipeline daemon started")
    await notify("Pipeline daemon started", tags="rocket")

    while True:
        try:
            db = IdeaDB(DB_PATH)
            hours_since_scout = (time.time() - last_scout) / 3600
            backlog = db.count_unbuilt_ideas(min_score=7)

            # Priority 1: Scout for ideas
            if hours_since_scout >= SCOUT_INTERVAL_HOURS or backlog < MIN_BACKLOG:
                print(f"\n=== SCOUTING (backlog={backlog}, hours={hours_since_scout:.1f}) ===")
                await run_scout()
                last_scout = time.time()
                continue

            # Priority 2: Build new prototype
            buildable = db.get_buildable_ideas(limit=1)
            if buildable:
                print(f"\n=== BUILDING: {buildable[0]['title'][:50]} ===")
                await build_next_prototype()
                continue

            # Priority 3: Improve existing prototype
            improvable = db.get_improvable_prototypes(
                max_improvements=MAX_IMPROVEMENTS, limit=1
            )
            if improvable:
                idea = improvable[0]
                print(f"\n=== IMPROVING: {idea['title'][:50]} (round {idea.get('improvement_count', 0) + 1}) ===")
                await improve_prototype(idea)
                continue

            # Nothing to do — sleep
            print(f"\n=== IDLE — sleeping {IDLE_SLEEP_MINUTES}m ===")
            await asyncio.sleep(IDLE_SLEEP_MINUTES * 60)

        except Exception as e:
            msg = f"Daemon error: {e}\n{traceback.format_exc()[-500:]}"
            print(msg)
            await notify(msg, title="Pipeline Error", tags="warning")
            await asyncio.sleep(60)  # Back off on error


def main():
    asyncio.run(run_loop())


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Run full test suite**

Run: `uv run python -m pytest tests/ -v`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add daemon.py idea_scout/config.py pyproject.toml
git commit -m "feat: continuous daemon with scout/build/improve priority loop"
```

---

### Task 9: Deploy and start systemd service

- [ ] **Step 1: Push all code**

```bash
git push
```

- [ ] **Step 2: Pull on box and install deps**

```bash
ssh ubuntu@159.54.161.194
cd ~/prototypes && git pull
cd pipeline && ~/.local/bin/uv sync
```

- [ ] **Step 3: Remove old cron jobs**

```bash
crontab -r  # or edit to remove the two pipeline crons
```

- [ ] **Step 4: Create systemd service**

Create `/etc/systemd/system/pipeline-daemon.service`:

```ini
[Unit]
Description=Idea Pipeline Daemon
After=network.target omniroute.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/prototypes/pipeline
ExecStart=/home/ubuntu/.local/bin/uv run python -m daemon
Restart=always
RestartSec=30
StandardOutput=append:/home/ubuntu/logs/daemon.log
StandardError=append:/home/ubuntu/logs/daemon.log

[Install]
WantedBy=multi-user.target
```

- [ ] **Step 5: Enable and start**

```bash
sudo systemctl daemon-reload
sudo systemctl enable pipeline-daemon
sudo systemctl start pipeline-daemon
journalctl -u pipeline-daemon -f  # watch initial output
```

- [ ] **Step 6: Verify it's running**

```bash
systemctl status pipeline-daemon
tail -20 ~/logs/daemon.log
```

Expected: daemon starts, runs scout, finds ideas, begins building.
