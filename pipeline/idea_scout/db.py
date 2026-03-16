import sqlite3


class IdeaDB:
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._create_tables()

    def _create_tables(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                selftext TEXT DEFAULT '',
                score INTEGER DEFAULT 0,
                num_comments INTEGER DEFAULT 0,
                subreddit TEXT DEFAULT '',
                permalink TEXT DEFAULT '',
                created_utc REAL DEFAULT 0,
                analysis TEXT,
                viability_score INTEGER,
                prototype_started INTEGER DEFAULT 0,
                discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        self.conn.commit()

    def upsert_post(self, post: dict):
        self.conn.execute("""
            INSERT INTO posts (id, title, selftext, score, num_comments,
                               subreddit, permalink, created_utc)
            VALUES (:id, :title, :selftext, :score, :num_comments,
                    :subreddit, :permalink, :created_utc)
            ON CONFLICT(id) DO UPDATE SET
                score = :score,
                num_comments = :num_comments
        """, post)
        self.conn.commit()

    def get_post(self, post_id: str) -> dict | None:
        row = self.conn.execute(
            "SELECT * FROM posts WHERE id = ?", (post_id,)
        ).fetchone()
        return dict(row) if row else None

    def save_analysis(self, post_id: str, analysis: str, viability_score: int):
        self.conn.execute(
            "UPDATE posts SET analysis = ?, viability_score = ? WHERE id = ?",
            (analysis, viability_score, post_id),
        )
        self.conn.commit()

    def get_unanalyzed_posts(self, limit: int = 20) -> list[dict]:
        rows = self.conn.execute(
            "SELECT * FROM posts WHERE analysis IS NULL ORDER BY score DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]

    def get_top_ideas(self, limit: int = 5) -> list[dict]:
        rows = self.conn.execute(
            """SELECT * FROM posts
               WHERE viability_score IS NOT NULL
               ORDER BY viability_score DESC, score DESC
               LIMIT ?""",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]

    def get_unbuilt_top_ideas(self, min_score: int = 7, limit: int = 1) -> list[dict]:
        rows = self.conn.execute(
            """SELECT * FROM posts
               WHERE viability_score >= ? AND prototype_started = 0
               ORDER BY viability_score DESC, score DESC
               LIMIT ?""",
            (min_score, limit),
        ).fetchall()
        return [dict(r) for r in rows]

    def mark_prototype_started(self, post_id: str):
        self.conn.execute(
            "UPDATE posts SET prototype_started = 1 WHERE id = ?", (post_id,),
        )
        self.conn.commit()
