import os

# LLM config — OmniRoute gateway (OpenAI-compatible endpoint)
# Role-based combos: planner (analysis/specs), coder (implementation), unstuck (error recovery)
OMNIROUTE_BASE = os.getenv("OMNIROUTE_BASE", "http://localhost:20128/v1")
PLANNER_MODEL = os.getenv("PLANNER_MODEL", "planner")
CODER_MODEL = os.getenv("CODER_MODEL", "coder")
UNSTUCK_MODEL = os.getenv("UNSTUCK_MODEL", "unstuck")
DB_PATH = os.path.expanduser("~/prototypes/pipeline/ideas.db")
NTFY_TOPIC = "donovan-oci-app-pipeline"

# Hacker News API (fully open, no auth)
HN_API_BASE = "https://hacker-news.firebaseio.com/v0"
HN_SEARCH_BASE = "https://hn.algolia.com/api/v1"

# HN queries — find web tools that could become mobile apps
HN_SEARCH_QUERIES = [
    "Show HN",
    "mobile app",
    "I wish there was",
    "no good app for",
]

# How many stories to fetch per source
HN_STORY_LIMIT = 30

# Daemon config — scout every 2h for more frequent idea discovery
SCOUT_INTERVAL_HOURS = int(os.getenv("SCOUT_INTERVAL_HOURS", "2"))
IDLE_SLEEP_MINUTES = int(os.getenv("IDLE_SLEEP_MINUTES", "30"))
MIN_BACKLOG = int(os.getenv("MIN_BACKLOG", "3"))
MAX_IMPROVEMENTS = int(os.getenv("MAX_IMPROVEMENTS", "10"))
