import json
from idea_scout.analyzer import parse_analysis_response, build_analysis_prompt


def test_build_analysis_prompt():
    post = {
        "title": "App that tracks friend birthdays",
        "selftext": "I forget my friends' birthdays all the time",
        "subreddit": "AppIdeas",
        "score": 50,
        "num_comments": 20,
    }
    prompt = build_analysis_prompt(post)
    assert "friend birthdays" in prompt.lower()
    assert "AppIdeas" in prompt


def test_parse_analysis_response_valid():
    response = json.dumps({
        "idea_summary": "Birthday tracking app",
        "competitors": "Google Calendar, Facebook",
        "gap": "No dedicated, social birthday app",
        "difficulty": "Easy — basic CRUD + notifications",
        "viability_score": 7,
    })
    result = parse_analysis_response(response)
    assert result["viability_score"] == 7
    assert "Birthday tracking" in result["analysis"]


def test_parse_analysis_response_invalid_json():
    result = parse_analysis_response("not json at all")
    assert result["viability_score"] == 0
    assert len(result["analysis"]) > 0
