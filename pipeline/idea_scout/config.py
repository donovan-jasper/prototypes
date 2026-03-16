import os

OMNIROUTE_BASE = os.getenv("OMNIROUTE_BASE", "http://localhost:20128/v1")
OMNIROUTE_MODEL = os.getenv("OMNIROUTE_MODEL", "gc/gemini-2.5-flash")
DB_PATH = os.path.expanduser("~/prototypes/pipeline/ideas.db")
NTFY_TOPIC = "donovan-oci-app-pipeline"

SUBREDDITS = [
    "AppIdeas",
    "SomebodyMakeThis",
    "androidapps",
    "iphone",
    "selfhosted",
    "webapps",
    "startups",
]

REDDIT_BASE = "https://www.reddit.com/r/{subreddit}/hot.json?limit=25&raw_json=1"
REDDIT_HEADERS = {
    "User-Agent": "idea-scout:v0.1 by /u/idea_scout_bot (autonomous app pipeline)",
    "Accept": "application/json",
}
