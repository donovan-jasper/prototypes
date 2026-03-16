import tempfile
import os
from idea_scout.db import IdeaDB


def test_upsert_post_with_new_fields():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        post = {
            "id": "web-abc", "title": "Test idea", "selftext": "Desc",
            "score": 42, "num_comments": 10, "subreddit": "reddit",
            "permalink": "https://reddit.com/r/x/abc", "created_utc": 1710500000.0,
            "source_url": "https://reddit.com/r/AppIdeas/abc",
            "source_type": "reddit",
            "demand_signal": "50 upvotes, 12 'me too' replies",
        }
        db.upsert_post(post)
        result = db.get_post("web-abc")
        assert result["source_url"] == "https://reddit.com/r/AppIdeas/abc"
        assert result["source_type"] == "reddit"
        assert result["demand_signal"] == "50 upvotes, 12 'me too' replies"
    finally:
        os.unlink(db_path)


def test_save_competition_analysis():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        post = {
            "id": "x1", "title": "Test", "selftext": "", "score": 10,
            "num_comments": 1, "subreddit": "HN", "permalink": "/x",
            "created_utc": 1710500000.0,
        }
        db.upsert_post(post)
        db.save_analysis("x1", "Great idea", 8)
        db.save_competition("x1", "Only 2 weak competitors", 7)
        result = db.get_post("x1")
        assert result["competition_score"] == 7
        assert "2 weak" in result["competition_analysis"]
    finally:
        os.unlink(db_path)


def test_get_buildable_ideas_uses_combined_score():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        for pid, via, comp in [("a", 9, 2), ("b", 7, 9), ("c", 8, 7)]:
            post = {
                "id": pid, "title": f"Idea {pid}", "selftext": "", "score": 10,
                "num_comments": 1, "subreddit": "HN", "permalink": f"/{pid}",
                "created_utc": 1710500000.0,
            }
            db.upsert_post(post)
            db.save_analysis(pid, f"Analysis {pid}", via)
            db.save_competition(pid, f"Competition {pid}", comp)
        # b has best combined: 7*0.6 + 9*0.4 = 7.8
        # c: 8*0.6 + 7*0.4 = 7.6
        # a: 9*0.6 + 2*0.4 = 6.2 — but competition_score 2 < 4, so filtered out
        top = db.get_buildable_ideas(limit=3)
        assert top[0]["id"] == "b"
        assert top[1]["id"] == "c"
    finally:
        os.unlink(db_path)


def test_get_improvable_prototypes():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        for pid, imp_count in [("a", 0), ("b", 3), ("c", 1)]:
            post = {
                "id": pid, "title": f"Idea {pid}", "selftext": "", "score": 10,
                "num_comments": 1, "subreddit": "HN", "permalink": f"/{pid}",
                "created_utc": 1710500000.0,
            }
            db.upsert_post(post)
            db.save_analysis(pid, f"Analysis {pid}", 8)
            db.conn.execute(
                "UPDATE posts SET prototype_started=1, improvement_count=? WHERE id=?",
                (imp_count, pid),
            )
            db.conn.commit()
        result = db.get_improvable_prototypes(max_improvements=3, limit=5)
        ids = [r["id"] for r in result]
        assert "b" not in ids
        assert "a" in ids
    finally:
        os.unlink(db_path)


def test_record_improvement():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        db = IdeaDB(db_path)
        post = {
            "id": "x1", "title": "Test", "selftext": "", "score": 10,
            "num_comments": 1, "subreddit": "HN", "permalink": "/x",
            "created_utc": 1710500000.0,
        }
        db.upsert_post(post)
        db.conn.execute("UPDATE posts SET prototype_started=1 WHERE id='x1'")
        db.conn.commit()
        db.record_improvement("x1")
        result = db.get_post("x1")
        assert result["improvement_count"] == 1
        assert result["last_improved_at"] is not None
    finally:
        os.unlink(db_path)
