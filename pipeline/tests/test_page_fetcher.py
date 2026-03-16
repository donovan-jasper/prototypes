from idea_scout.page_fetcher import html_to_text


def test_html_to_text_strips_tags():
    html = "<html><body><h1>Title</h1><p>Hello <b>world</b></p><script>evil()</script></body></html>"
    text = html_to_text(html)
    assert "Title" in text
    assert "Hello" in text
    assert "world" in text
    assert "evil()" not in text
    assert "<" not in text


def test_html_to_text_handles_empty():
    assert html_to_text("") == ""
    assert html_to_text(None) == ""
