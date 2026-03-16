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
    assert result["competition_score"] == 5
