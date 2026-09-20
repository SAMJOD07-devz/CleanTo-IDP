"""
CleanTO Backend Database Module (SQLite)
=========================================
Milestone: Review II (20% Milestone)
Schema:
- User (id, name)
- Submission (id, user_id, before_path, after_path, verdict, similarity_score, created_at)
"""

import sqlite3
import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "cleanto.db"


def get_db_connection():
    """Create a thread-safe database connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize SQLite tables and seed default demo user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS User (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Submission (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            before_path TEXT,
            after_path TEXT,
            verdict TEXT NOT NULL,
            similarity_score REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES User(id)
        )
    """)

    # Seed default demo user if not present
    cursor.execute("SELECT id FROM User WHERE id = 'usr_demo'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO User (id, name) VALUES (?, ?)",
            ("usr_demo", "Demo Contributor")
        )

    conn.commit()
    conn.close()


def insert_submission(submission_id: str, user_id: str, before_path: str, after_path: str, verdict: str, similarity_score: float) -> dict:
    """Insert a new submission record into SQLite and return the created record."""
    created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO Submission (id, user_id, before_path, after_path, verdict, similarity_score, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (submission_id, user_id, before_path, after_path, verdict, similarity_score, created_at)
    )
    conn.commit()
    conn.close()

    return {
        "submission_id": submission_id,
        "user_id": user_id,
        "before_path": before_path,
        "after_path": after_path,
        "verdict": verdict,
        "similarity_score": similarity_score,
        "created_at": created_at
    }


def get_submission(submission_id: str) -> dict | None:
    """Fetch a single submission by its unique ID."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, user_id, before_path, after_path, verdict, similarity_score, created_at FROM Submission WHERE id = ?",
        (submission_id,)
    )
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    return {
        "submission_id": row["id"],
        "user_id": row["user_id"],
        "before_path": row["before_path"],
        "after_path": row["after_path"],
        "verdict": row["verdict"],
        "similarity_score": row["similarity_score"],
        "created_at": row["created_at"]
    }


def list_submissions(limit: int = 50) -> list[dict]:
    """Retrieve recent submissions."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, user_id, verdict, similarity_score, created_at FROM Submission ORDER BY created_at DESC LIMIT ?",
        (limit,)
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "submission_id": r["id"],
            "user_id": r["user_id"],
            "verdict": r["verdict"],
            "similarity_score": r["similarity_score"],
            "created_at": r["created_at"]
        }
        for r in rows
    ]


# Initialize DB upon import
init_db()
