from idea_scout.scraper import parse_reddit_response

SAMPLE_RESPONSE = {
    "data": {
        "children": [
            {
                "data": {
                    "id": "abc123",
                    "title": "App idea: a friend tracker with gamification",
                    "selftext": "I want an app that helps me remember details about friends",
                    "score": 42,
                    "num_comments": 15,
                    "subreddit": "AppIdeas",
                    "permalink": "/r/AppIdeas/comments/abc123/app_idea/",
                    "created_utc": 1710500000.0,
                    "is_self": True,
                }
            },
            {
                "data": {
                    "id": "def456",
                    "title": "Check out my new app",
                    "selftext": "",
                    "score": 3,
                    "num_comments": 1,
                    "subreddit": "AppIdeas",
                    "permalink": "/r/AppIdeas/comments/def456/check_out/",
                    "created_utc": 1710400000.0,
                    "is_self": True,
                }
            },
        ]
    }
}


def test_parse_reddit_response_extracts_posts():
    posts = parse_reddit_response(SAMPLE_RESPONSE)
    assert len(posts) == 2
    assert posts[0]["id"] == "abc123"
    assert posts[0]["title"] == "App idea: a friend tracker with gamification"
    assert posts[0]["score"] == 42


def test_parse_reddit_response_handles_empty():
    posts = parse_reddit_response({"data": {"children": []}})
    assert posts == []
