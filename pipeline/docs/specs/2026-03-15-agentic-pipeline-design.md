# Agentic Pipeline: Continuous Idea Discovery, Prototyping & Improvement

## Goal

Transform the pipeline from a cron-based HN scraper into a continuous, autonomous system that discovers unmet software needs across the entire internet, builds prototypes, and iteratively improves them — running 24/7 on a free Oracle Cloud instance.

## Architecture

A single daemon (`pipeline/daemon.py`) runs an infinite priority-based work loop. It delegates to three subsystems: **scout** (agentic web search + idea extraction), **builder** (spec → code → validate), and **improver** (extend/polish existing prototypes). All LLM calls go through OmniRoute with role-based combos (planner/coder/unstuck).

## Subsystem 1: Agentic Scout

### How it works

1. **Query generation** — The planner LLM generates 15-20 search queries per run, mixing two strategies:
   - **Dedicated sources**: HN Show/Ask, Product Hunt launches, Indie Hackers, app idea subreddits
   - **Organic demand signals**: Real people expressing unmet needs anywhere on the internet. Queries target natural language like:
     - `"I wish there was an app" site:reddit.com`
     - `"someone should build" app OR tool`
     - `"why isn't there a" software OR service`
     - `"is there an app that" -"yes" -"try"`
     - `"I would pay for" app OR tool`
     - `"frustrated with" app OR tool -support`

2. **Web search** — `duckduckgo-search` Python library (free, no API key). Each query returns ~10 results.

3. **Page fetch & extraction** — httpx fetches promising URLs. The planner LLM extracts ideas from raw text, returning structured data: what the person wants, context, source URL, rough demand signal (upvotes, replies, etc.).

4. **Competition analysis** — For each extracted idea, the planner:
   - Generates 2-3 follow-up searches: `"apps that do X"`, `"alternatives to Y"`, `"X app review"`
   - Fetches those results
   - Scores competition: how many competitors exist, how good they are, what gaps remain
   - Produces a `competition_score` (1-10, 10 = wide open market) alongside the existing `viability_score`

5. **Dedup & store** — Content hash against DB to skip already-seen ideas. Ideas with both high viability AND low competition float to the top.

### Rate limiting

- Max 20 DuckDuckGo queries per scout run (library has built-in rate limiting)
- Max 30 page fetches per run
- Scout runs every 4-6 hours (daemon decides based on backlog)

### Files

- `idea_scout/agentic_scraper.py` — Main agent loop: query gen → search → fetch → extract → competition check
- `idea_scout/web_search.py` — DuckDuckGo search wrapper
- `idea_scout/page_fetcher.py` — httpx page fetch with HTML-to-text conversion
- `idea_scout/scraper.py` — Keep existing HN Algolia scraper as a fast supplemental source

### DB changes

Add columns to `posts` table:
- `competition_score INTEGER` — 1-10, how saturated the market is
- `competition_analysis TEXT` — competitors found, gaps identified
- `source_url TEXT` — original URL where the idea was found
- `source_type TEXT` — "hn", "reddit", "twitter", "forum", "blog", etc.
- `demand_signal TEXT` — evidence of demand (upvotes, replies, "me too" comments)

## Subsystem 2: Builder (existing, minor changes)

Already implemented with planner/coder/unstuck flow. Changes:
- Use combined score: `final_score = viability_score * 0.6 + competition_score * 0.4` for prioritization
- Pass competition analysis to spec writer so it knows what to differentiate from

## Subsystem 3: Improver

When no new high-scoring ideas need building, the daemon shifts to improving existing prototypes.

### Improvement actions (planner decides which)

1. **Add features** — Planner reads the spec + code, suggests 1-2 features that would make the prototype more compelling
2. **Add AI integration** — If the app could benefit from AI (and most can), add it via OmniRoute
3. **Polish UI** — Better CSS, responsive design, icons
4. **Add tests** — Improve test coverage
5. **Improve README** — Better docs, screenshots placeholder, setup instructions

### How it works

1. Planner reviews a prototype directory (spec.md + code files)
2. Picks the single highest-impact improvement
3. Generates a mini-spec for just that improvement
4. Coder implements it
5. Validates (syntax check, tests)
6. Escalates to unstuck if needed
7. Commits and pushes

### Files

- `builder/improver.py` — Improvement agent: assess → plan → implement → validate

## Subsystem 4: Daemon

### Work loop

```
while True:
    if should_scout():       # every 4-6h, or backlog < 3 unbuilt ideas
        run_scout()
    elif has_unbuilt_ideas(): # viability >= 7, competition >= 5
        build_next()
    elif has_improvable():    # existing prototypes with < 3 improvement rounds
        improve_next()
    else:
        sleep(30 minutes)
        continue

    notify_if_interesting()
```

### State tracking

Add to DB:
- `posts.improvement_count INTEGER DEFAULT 0` — how many times we've improved this prototype
- `posts.last_improved_at TIMESTAMP` — when

### Systemd service

Replaces cron jobs. Runs as `pipeline-daemon.service`, restarts on failure.

### Files

- `pipeline/daemon.py` — Main loop, priority logic, sleep/backoff
- `/etc/systemd/system/pipeline-daemon.service` — Systemd unit

## Dependencies

- `duckduckgo-search` — free web search, no API key
- `beautifulsoup4` — HTML to text extraction
- `httpx` — already installed, async HTTP

## Constraints

- All free tier: OmniRoute combos, DuckDuckGo, Oracle Cloud
- 1GB RAM on AMD box — keep memory usage low, no browser automation
- Rate limit DuckDuckGo to avoid getting blocked
- Cap improvement rounds at 3 per prototype to avoid infinite polishing
