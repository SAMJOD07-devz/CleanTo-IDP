"""
CleanTO Backend Database Module (SQLite)
=========================================
Milestone: 30% Milestone
Schema:
- User (id, name, balance, cleanup_count)
- Submission (id, user_id, before_path, after_path, verdict, similarity_score, cleanup_score, tx_hash, reward_amount, created_at, updated_at)
"""

import sqlite3
import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

DB_PATH = Path(__file__).resolve().parent / "cleanto.db"


def get_db_connection():
    """Create a thread-safe database connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize SQLite tables, perform necessary migrations, and seed default demo user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS User (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            balance REAL DEFAULT 0.0,
            cleanup_count INTEGER DEFAULT 0
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
            cleanup_score REAL DEFAULT 0.0,
            tx_hash TEXT,
            reward_amount REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES User(id)
        )
    """)

    # Safe column migrations for existing SQLite database files
    cursor.execute("PRAGMA table_info(Submission)")
    existing_sub_columns = [col["name"] for col in cursor.fetchall()]
    
    if "cleanup_score" not in existing_sub_columns:
        cursor.execute("ALTER TABLE Submission ADD COLUMN cleanup_score REAL DEFAULT 0.0")
    if "tx_hash" not in existing_sub_columns:
        cursor.execute("ALTER TABLE Submission ADD COLUMN tx_hash TEXT")
    if "reward_amount" not in existing_sub_columns:
        cursor.execute("ALTER TABLE Submission ADD COLUMN reward_amount REAL DEFAULT 0.0")
    if "updated_at" not in existing_sub_columns:
        cursor.execute("ALTER TABLE Submission ADD COLUMN updated_at TIMESTAMP")
        cursor.execute("UPDATE Submission SET updated_at = created_at WHERE updated_at IS NULL")

    cursor.execute("PRAGMA table_info(User)")
    existing_user_columns = [col["name"] for col in cursor.fetchall()]
    if "balance" not in existing_user_columns:
        cursor.execute("ALTER TABLE User ADD COLUMN balance REAL DEFAULT 0.0")
    if "cleanup_count" not in existing_user_columns:
        cursor.execute("ALTER TABLE User ADD COLUMN cleanup_count INTEGER DEFAULT 0")

    # Seed default demo user if not present
    cursor.execute("SELECT id FROM User WHERE id = 'usr_demo'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO User (id, name, balance, cleanup_count) VALUES (?, ?, ?, ?)",
            ("usr_demo", "Demo Contributor", 0.0, 0)
        )

    conn.commit()
    conn.close()


def insert_submission(
    submission_id: str,
    user_id: str,
    before_path: str,
    after_path: str,
    verdict: str,
    similarity_score: float,
    cleanup_score: float = 0.0,
    tx_hash: Optional[str] = None,
    reward_amount: float = 0.0
) -> Dict[str, Any]:
    """Insert a new submission record into SQLite and return the created record."""
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Ensure user exists in User table
    cursor.execute("SELECT id FROM User WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO User (id, name, balance, cleanup_count) VALUES (?, ?, ?, ?)",
            (user_id, f"User {user_id}", 0.0, 0)
        )

    cursor.execute(
        """
        INSERT INTO Submission (
            id, user_id, before_path, after_path, verdict,
            similarity_score, cleanup_score, tx_hash, reward_amount,
            created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            submission_id, user_id, before_path, after_path, verdict,
            similarity_score, cleanup_score, tx_hash, reward_amount,
            now_iso, now_iso
        )
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
        "cleanup_score": cleanup_score,
        "tx_hash": tx_hash,
        "reward_amount": reward_amount,
        "created_at": now_iso,
        "updated_at": now_iso
    }


def get_submission(submission_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single submission by its unique ID."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, user_id, before_path, after_path, verdict,
               similarity_score, cleanup_score, tx_hash, reward_amount,
               created_at, updated_at
        FROM Submission WHERE id = ?
        """,
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
        "cleanup_score": row["cleanup_score"] if row["cleanup_score"] is not None else 0.0,
        "tx_hash": row["tx_hash"],
        "reward_amount": row["reward_amount"] if row["reward_amount"] is not None else 0.0,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }


def list_submissions(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve recent submissions."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, user_id, verdict, similarity_score, cleanup_score,
               tx_hash, reward_amount, created_at, updated_at
        FROM Submission ORDER BY created_at DESC LIMIT ?
        """,
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
            "cleanup_score": r["cleanup_score"] if r["cleanup_score"] is not None else 0.0,
            "tx_hash": r["tx_hash"],
            "reward_amount": r["reward_amount"] if r["reward_amount"] is not None else 0.0,
            "created_at": r["created_at"],
            "updated_at": r["updated_at"]
        }
        for r in rows
    ]


def get_flagged_submissions() -> List[Dict[str, Any]]:
    """Retrieve all submissions currently queued with 'flagged_review' status."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, user_id, before_path, after_path, verdict,
               similarity_score, cleanup_score, created_at
        FROM Submission
        WHERE verdict = 'flagged_review'
        ORDER BY created_at ASC
        """
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "submission_id": r["id"],
            "user_id": r["user_id"],
            "before_path": r["before_path"],
            "after_path": r["after_path"],
            "verdict": r["verdict"],
            "similarity_score": r["similarity_score"],
            "cleanup_score": r["cleanup_score"] if r["cleanup_score"] is not None else 0.0,
            "created_at": r["created_at"]
        }
        for r in rows
    ]


def update_submission_verdict(
    submission_id: str,
    verdict: str,
    tx_hash: Optional[str] = None,
    reward_amount: Optional[float] = None
) -> bool:
    """Update a submission's verdict, transaction hash, and reward amount upon validation."""
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()

    if tx_hash is not None and reward_amount is not None:
        cursor.execute(
            """
            UPDATE Submission
            SET verdict = ?, tx_hash = ?, reward_amount = ?, updated_at = ?
            WHERE id = ?
            """,
            (verdict, tx_hash, reward_amount, now_iso, submission_id)
        )
    else:
        cursor.execute(
            """
            UPDATE Submission
            SET verdict = ?, updated_at = ?
            WHERE id = ?
            """,
            (verdict, now_iso, submission_id)
        )

    updated = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return updated


def credit_user_reward(user_id: str, amount: float):
    """Credit CleanTO tokens and increment verified cleanup count for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO User (id, name, balance, cleanup_count)
        VALUES (?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET
            balance = balance + excluded.balance,
            cleanup_count = cleanup_count + 1
        """,
        (user_id, f"User {user_id}", amount)
    )

    conn.commit()
    conn.close()


def get_user_balance(user_id: str) -> Dict[str, Any]:
    """Get the current CleanTO balance and verified cleanup count for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, name, balance, cleanup_count FROM User WHERE id = ?",
        (user_id,)
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {
            "user_id": user_id,
            "name": f"User {user_id}",
            "balance": 0.0,
            "cleanup_count": 0
        }

    return {
        "user_id": row["id"],
        "name": row["name"],
        "balance": float(row["balance"] or 0.0),
        "cleanup_count": int(row["cleanup_count"] or 0)
    }


# Initialize DB upon module load
init_db()
