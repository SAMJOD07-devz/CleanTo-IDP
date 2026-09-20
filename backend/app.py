"""
CleanTO Backend API Server
==========================
Milestone: Review II (20% Working Vertical Slice)
Role: Backend Engineer

Interface Contract:
- POST /submit (multipart/form-data: `before`, `after`)
  Returns: { "submission_id": string, "verdict": "pass" | "fail" | "duplicate", "similarity_score": number }
- GET /submissions/{id}
  Returns: { "submission_id": string, "verdict": string, "similarity_score": number, "created_at": string }
"""

import os
import sys
import uuid
import logging
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

from db import init_db, insert_submission, get_submission, list_submissions

# Add ai-service to sys.path for direct module import
AI_SERVICE_DIR = Path(__file__).resolve().parent.parent / "ai-service"
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CleanTO.Backend")

# Safe AI import with mock fallback if AI dependencies are not installed
try:
    from duplicate_detector import check_duplicate, HashStore, get_embedding_engine
    STORE_PATH = AI_SERVICE_DIR / "submission_hashes.json"
    hash_store = HashStore(filepath=STORE_PATH)
    HAS_AI_SERVICE = True
    logger.info("AI service module loaded successfully.")
except Exception as e:
    HAS_AI_SERVICE = False
    hash_store = None
    logger.warning("AI service unavailable (%s). Running with mock AI verification fallback.", e)


def mock_check_duplicate(before_path, after_path):
    """Fallback stub when AI service libraries are not yet installed."""
    return {
        "verdict": "pass",
        "similarity_score": 0.885,
        "is_duplicate": False,
        "duplicate_reason": None,
        "before_phash": "mock_hash_before",
        "after_phash": "mock_hash_after",
    }


app = Flask(__name__)

# Enable CORS so frontend on any local port (e.g. localhost:3000, localhost:5173) can access
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Ensure database tables exist
init_db()


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "service": "CleanTO Backend API",
        "status": "online",
        "version": "0.3.0",
        "ai_service_integrated": HAS_AI_SERVICE,
        "endpoints": {
            "submit": "POST /submit (multipart/form-data: before, after)",
            "get_submission": "GET /submissions/<id>",
            "list_submissions": "GET /submissions",
            "health": "GET /health"
        }
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "ai_service_integrated": HAS_AI_SERVICE
    })


@app.route("/submit", methods=["GET", "POST"])
def submit():
    """
    Handle cleanup photo pair submission from frontend or manual test.
    Accepts multipart/form-data with 'before' and 'after' image files.
    """
    if request.method == "GET":
        return jsonify({
            "message": "CleanTO Submit Endpoint",
            "usage": "Send a POST request with multipart/form-data containing 'before' and 'after' image files.",
            "contract": {
                "method": "POST",
                "content_type": "multipart/form-data",
                "fields": {
                    "before": "Image file (JPEG/PNG)",
                    "after": "Image file (JPEG/PNG)"
                },
                "response_example": {
                    "submission_id": "sub_1a2b3c4d",
                    "verdict": "pass",
                    "similarity_score": 88.5,
                    "created_at": "2026-09-20T12:00:00Z"
                }
            }
        }), 200

    if "before" not in request.files or "after" not in request.files:
        return jsonify({
            "error": "Both 'before' and 'after' image files are required in form-data."
        }), 400

    before_file = request.files["before"]
    after_file = request.files["after"]

    if before_file.filename == "" or after_file.filename == "":
        return jsonify({
            "error": "Selected files must have non-empty filenames."
        }), 400

    # Generate unique ID for this submission
    sub_id = f"sub_{uuid.uuid4().hex[:8]}"
    user_id = request.form.get("user_id", "usr_demo")
    logger.info("Processing submission %s (user: %s, before: %s, after: %s)",
                sub_id, user_id, before_file.filename, after_file.filename)

    # Persist uploaded image files
    ext_before = Path(before_file.filename).suffix or ".jpg"
    ext_after = Path(after_file.filename).suffix or ".jpg"
    path_before = UPLOAD_DIR / f"{sub_id}_before{ext_before}"
    path_after = UPLOAD_DIR / f"{sub_id}_after{ext_after}"

    try:
        before_file.save(str(path_before))
        after_file.save(str(path_after))

        # Run AI duplicate detection and similarity scoring
        if HAS_AI_SERVICE and hash_store is not None:
            ai_result = check_duplicate(
                before_path=path_before,
                after_path=path_after,
                hash_threshold=6,
                store=hash_store,
                auto_register=True,
                submission_id=sub_id
            )
        else:
            ai_result = mock_check_duplicate(path_before, path_after)

        raw_score = ai_result.get("similarity_score", 0.85)
        # Scaled to 0-100 percentage
        display_score = round(raw_score * 100 if raw_score <= 1.0 else raw_score, 1)
        verdict = ai_result.get("verdict", "pass")

        # Persist submission into SQLite database
        record = insert_submission(
            submission_id=sub_id,
            user_id=user_id,
            before_path=str(path_before),
            after_path=str(path_after),
            verdict=verdict,
            similarity_score=display_score
        )

        # Exact Interface Contract response
        response_payload = {
            "submission_id": sub_id,
            "verdict": verdict,
            "similarity_score": display_score,
            "created_at": record["created_at"],
            "is_duplicate": ai_result.get("is_duplicate", False),
            "duplicate_reason": ai_result.get("duplicate_reason"),
            "before_phash": ai_result.get("before_phash"),
            "after_phash": ai_result.get("after_phash")
        }

        logger.info("Submission %s saved to DB: verdict=%s, score=%.1f%%", sub_id, verdict, display_score)
        return jsonify(response_payload), 200

    except Exception as e:
        logger.error("Error processing submission %s: %s", sub_id, e, exc_info=True)
        return jsonify({
            "error": "Submission processing failed",
            "message": str(e),
            "submission_id": sub_id
        }), 500


@app.route("/submissions/<submission_id>", methods=["GET"])
def get_submission_by_id(submission_id: str):
    """
    Fetch a stored submission by ID from the database.
    Contract: { "submission_id": string, "verdict": string, "similarity_score": number, "created_at": string }
    """
    submission = get_submission(submission_id)
    if not submission:
        return jsonify({"error": f"Submission '{submission_id}' not found."}), 404

    return jsonify({
        "submission_id": submission["submission_id"],
        "user_id": submission["user_id"],
        "verdict": submission["verdict"],
        "similarity_score": submission["similarity_score"],
        "created_at": submission["created_at"]
    }), 200


@app.route("/submissions", methods=["GET"])
def list_all_submissions():
    """List recent submissions stored in SQLite database."""
    items = list_submissions(limit=50)
    return jsonify({
        "count": len(items),
        "submissions": items
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info("Starting CleanTO Backend on http://0.0.0.0:%d", port)
    app.run(host="0.0.0.0", port=port, debug=True)
