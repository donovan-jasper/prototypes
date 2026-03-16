import tempfile
import os
from idea_scout.db import IdeaDB


def test_insert_and_retrieve_post():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        post = {
            "id": "abc123", "title": "Test idea", "selftext": "Description",
            "score": 42, "num_comments": 10, "subreddit": "AppIdeas",
            "permalink": "/r/AppIdeas/abc123", "created_utc": 1710500000.0,
        }
        db.upsert_post(post)
        result = db.get_post("abc123")
        assert result is not None
        assert result["title"] == "Test idea"
        assert result["score"] == 42
    finally:
        os.unlink(db_path)


def test_duplicate_post_updates_score():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        post = {
            "id": "abc123", "title": "Test", "selftext": "", "score": 10,
            "num_comments": 1, "subreddit": "AppIdeas", "permalink": "/r/x",
            "created_utc": 1710500000.0,
        }
        db.upsert_post(post)
        post["score"] = 50
        db.upsert_post(post)
        result = db.get_post("abc123")
        assert result["score"] == 50
    finally:
        os.unlink(db_path)


def test_save_and_get_analysis():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        post = {
            "id": "abc123", "title": "Test", "selftext": "", "score": 10,
            "num_comments": 1, "subreddit": "AppIdeas", "permalink": "/r/x",
            "created_utc": 1710500000.0,
        }
        db.upsert_post(post)
        db.save_analysis("abc123", "Great idea", 8)
        result = db.get_post("abc123")
        assert result["analysis"] == "Great idea"
        assert result["viability_score"] == 8
    finally:
        os.unlink(db_path)


def test_get_top_ideas():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        for i, score in enumerate([3, 9, 7, 5, 8]):
            post = {
                "id": f"post{i}", "title": f"Idea {i}", "selftext": "",
                "score": 10, "num_comments": 1, "subreddit": "AppIdeas",
                "permalink": f"/r/x/{i}", "created_utc": 1710500000.0,
            }
            db.upsert_post(post)
            db.save_analysis(f"post{i}", f"Analysis {i}", score)
        top = db.get_top_ideas(limit=3)
        assert len(top) == 3
        assert top[0]["viability_score"] == 9
        assert top[1]["viability_score"] == 8
    finally:
        os.unlink(db_path)
