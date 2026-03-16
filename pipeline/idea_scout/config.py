import os

# LLM config — OmniRoute gateway (OpenAI-compatible endpoint)
OMNIROUTE_BASE = os.getenv("OMNIROUTE_BASE", "http://localhost:20128/v1")
OMNIROUTE_MODEL = os.getenv("OMNIROUTE_MODEL", "free-pipeline")
DB_PATH = os.path.expanduser("~/prototypes/pipeline/ideas.db")
NTFY_TOPIC = "donovan-oci-app-pipeline"

# Hacker News API (fully open, no auth)
HN_API_BASE = "https://hacker-news.firebaseio.com/v0"
HN_SEARCH_BASE = "https://hn.algolia.com/api/v1"

# Search queries for finding app ideas on HN
HN_SEARCH_QUERIES = [
    "Show HN",
    "app idea",
    "I built",
    "side project",
    "looking for app",
    "wish there was an app",
]

# How many stories to fetch per source
HN_STORY_LIMIT = 30
