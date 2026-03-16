from idea_scout.scraper import parse_hn_search_response

SAMPLE_RESPONSE = {
    "hits": [
        {
            "objectID": "12345",
            "title": "Show HN: I built a friend tracker app",
            "story_text": "Helps you remember details about your friends",
            "points": 42,
            "num_comments": 15,
            "created_at_i": 1710500000,
        },
        {
            "objectID": "67890",
            "title": "Ask HN: What app do you wish existed?",
            "story_text": "",
            "points": 120,
            "num_comments": 85,
            "created_at_i": 1710400000,
        },
    ]
}


def test_parse_hn_response_extracts_posts():
    posts = parse_hn_search_response(SAMPLE_RESPONSE)
    assert len(posts) == 2
    assert posts[0]["id"] == "hn-12345"
    assert posts[0]["title"] == "Show HN: I built a friend tracker app"
    assert posts[0]["score"] == 42
    assert "news.ycombinator.com" in posts[0]["permalink"]


def test_parse_hn_response_handles_empty():
    posts = parse_hn_search_response({"hits": []})
    assert posts == []


def test_parse_hn_response_skips_no_title():
    data = {"hits": [{"objectID": "1", "title": "", "points": 5}]}
    posts = parse_hn_search_response(data)
    assert posts == []
