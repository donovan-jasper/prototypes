import sqlite3


class IdeaDB:
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._create_tables()
        self._migrate()

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
                discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                competition_score INTEGER,
                competition_analysis TEXT,
                source_url TEXT,
                source_type TEXT,
                demand_signal TEXT,
                improvement_count INTEGER DEFAULT 0,
                last_improved_at TIMESTAMP
            )
        """)
        self.conn.commit()

    def _migrate(self):
        """Add columns to existing DBs that lack them."""
        cursor = self.conn.execute("PRAGMA table_info(posts)")
        existing = {row[1] for row in cursor.fetchall()}
        new_cols = {
            "competition_score": "INTEGER",
            "competition_analysis": "TEXT",
            "source_url": "TEXT",
            "source_type": "TEXT",
            "demand_signal": "TEXT",
            "improvement_count": "INTEGER DEFAULT 0",
            "last_improved_at": "TIMESTAMP",
            "digest_sent_at": "TIMESTAMP",
            "feasibility_score": "INTEGER",
        }
        for col, col_type in new_cols.items():
            if col not in existing:
                self.conn.execute(f"ALTER TABLE posts ADD COLUMN {col} {col_type}")
        self.conn.commit()

    def upsert_post(self, post: dict):
        self.conn.execute("""
            INSERT INTO posts (id, title, selftext, score, num_comments,
                               subreddit, permalink, created_utc,
                               source_url, source_type, demand_signal)
            VALUES (:id, :title, :selftext, :score, :num_comments,
                    :subreddit, :permalink, :created_utc,
                    :source_url, :source_type, :demand_signal)
            ON CONFLICT(id) DO UPDATE SET
                score = :score,
                num_comments = :num_comments
        """, {
            "source_url": None, "source_type": None, "demand_signal": None,
            **post,
        })
        self.conn.commit()

    def get_post(self, post_id: str) -> dict | None:
        row = self.conn.execute(
            "SELECT * FROM posts WHERE id = ?", (post_id,)
        ).fetchone()
        return dict(row) if row else None

    def save_analysis(self, post_id: str, analysis: str, viability_score: int, feasibility_score: int = None):
        self.conn.execute(
            "UPDATE posts SET analysis = ?, viability_score = ?, feasibility_score = ? WHERE id = ?",
            (analysis, viability_score, feasibility_score, post_id),
        )
        self.conn.commit()

    def save_competition(self, post_id: str, competition_analysis: str, competition_score: int):
        self.conn.execute(
            "UPDATE posts SET competition_analysis = ?, competition_score = ? WHERE id = ?",
            (competition_analysis, competition_score, post_id),
        )
        self.conn.commit()

    def get_unanalyzed_posts(self, limit: int = 20) -> list[dict]:
        rows = self.conn.execute(
            "SELECT * FROM posts WHERE analysis IS NULL ORDER BY rowid DESC LIMIT ?",
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

    def get_buildable_ideas(self, limit: int = 1) -> list[dict]:
        """Get unbuilt ideas ranked by viability + competition + feasibility.
        Requires both viability AND competition analysis to be complete."""
        rows = self.conn.execute(
            """SELECT *,
                      (viability_score * 0.4 +
                       competition_score * 0.3 +
                       COALESCE(feasibility_score, 5) * 0.3) AS combined_score
               FROM posts
               WHERE viability_score >= 7
                 AND competition_score IS NOT NULL
                 AND competition_score >= 4
                 AND prototype_started = 0
               ORDER BY combined_score DESC
               LIMIT ?""",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]

    def get_improvable_prototypes(self, max_improvements: int = 3, min_score: int = 7, limit: int = 1) -> list[dict]:
        """Only improve prototypes with strong viability + competition scores (monetizable)."""
        rows = self.conn.execute(
            """SELECT * FROM posts
               WHERE prototype_started = 1
                 AND COALESCE(improvement_count, 0) < ?
                 AND viability_score >= ?
                 AND COALESCE(competition_score, 5) >= 4
               ORDER BY viability_score DESC
               LIMIT ?""",
            (max_improvements, min_score, limit),
        ).fetchall()
        return [dict(r) for r in rows]

    def record_improvement(self, post_id: str):
        self.conn.execute(
            """UPDATE posts SET
                improvement_count = COALESCE(improvement_count, 0) + 1,
                last_improved_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (post_id,),
        )
        self.conn.commit()

    def mark_prototype_started(self, post_id: str):
        self.conn.execute(
            "UPDATE posts SET prototype_started = 1 WHERE id = ?", (post_id,),
        )
        self.conn.commit()

    def get_unsent_top_ideas(self, limit: int = 5) -> list[dict]:
        """Get top ideas that have NOT been included in a digest yet."""
        rows = self.conn.execute(
            """SELECT * FROM posts
               WHERE viability_score IS NOT NULL
                 AND digest_sent_at IS NULL
               ORDER BY viability_score DESC, score DESC
               LIMIT ?""",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]

    def mark_digest_sent(self, post_ids: list[str]):
        """Mark ideas as included in a digest."""
        if not post_ids:
            return
        self.conn.executemany(
            "UPDATE posts SET digest_sent_at = CURRENT_TIMESTAMP WHERE id = ?",
            [(pid,) for pid in post_ids],
        )
        self.conn.commit()

    def get_ideas_needing_competition(self, min_score: int = 5, limit: int = 5) -> list[dict]:
        """Get analyzed ideas scoring >= min_score that lack competition analysis."""
        rows = self.conn.execute(
            """SELECT * FROM posts
               WHERE viability_score >= ?
                 AND viability_score IS NOT NULL
                 AND competition_score IS NULL
               ORDER BY viability_score DESC
               LIMIT ?""",
            (min_score, limit),
        ).fetchall()
        return [dict(r) for r in rows]

    def count_unbuilt_ideas(self, min_score: int = 7) -> int:
        row = self.conn.execute(
            "SELECT COUNT(*) FROM posts WHERE viability_score >= ? AND prototype_started = 0",
            (min_score,),
        ).fetchone()
        return row[0]
