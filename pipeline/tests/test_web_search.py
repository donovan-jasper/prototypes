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
