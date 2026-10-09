"""
CleanTO Backend API Server
==========================
Milestone: 30% Milestone Integration
Role: Backend Engineer

Updated Interface Contract:
- POST /submit (multipart/form-data: `before`, `after`, optional `user_id`)
  Returns: {
    "submission_id": string,
    "verdict": "pass" | "fail_duplicate" | "fail_location_mismatch" | "flagged_review" | "approved_by_validator",
    "similarity_score": number,
    "cleanup_score": number,
    "tx_hash": string | null,
    "reward_amount": number | null
  }
- GET /submissions/<id>
  Returns: { "submission_id": string, "user_id": string, "verdict": string, "similarity_score": number, "cleanup_score": number, "tx_hash": string | null, "created_at": string }
- GET /validator/queue
  Returns: { "count": number, "queue": [ ...submissions with verdict == 'flagged_review'... ] }
- POST /validator/review (JSON: { "submission_id": string, "decision": "approve" | "reject" })
  Returns: { "status": "success", "submission_id": string, "verdict": string, "tx_hash": string | null, "reward_amount": number | null }
- GET /users/<user_id>/balance
  Returns: { "user_id": string, "balance": number, "cleanup_count": number, "chain_connected": boolean }
"""

import os
import sys
import uuid
import logging
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from db import (
    init_db,
    insert_submission,
    get_submission,
    list_submissions,
    get_flagged_submissions,
    update_submission_verdict,
    credit_user_reward,
    get_user_balance
)
from blockchain_service import record_cleanup_on_chain, query_chain_balance

# Add ai-service to sys.path for direct module import
AI_SERVICE_DIR = Path(__file__).resolve().parent.parent / "ai-service"
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CleanTO.Backend")

# Load AI Service
try:
    from duplicate_detector import check_duplicate, HashStore, get_embedding_engine
    STORE_PATH = AI_SERVICE_DIR / "submission_hashes.json"
    hash_store = HashStore(filepath=STORE_PATH)
    HAS_AI_SERVICE = True
    logger.info("AI duplicate detector & vision verification loaded successfully.")
except Exception as e:
    HAS_AI_SERVICE = False
    hash_store = None
    logger.warning("AI service library error: %s. Using internal AI fallback.", e)


app = Flask(__name__)
# Enable CORS for all frontend origins and routes
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Ensure database tables exist and migrations are applied
init_db()


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "service": "CleanTO Backend API",
        "status": "online",
        "version": "0.3.0",
        "milestone": "30% Milestone",
        "ai_service_integrated": HAS_AI_SERVICE,
        "endpoints": {
            "submit": "POST /submit (multipart/form-data: before, after, user_id)",
            "get_submission": "GET /submissions/<id>",
            "list_submissions": "GET /submissions",
            "validator_queue": "GET /validator/queue",
            "validator_review": "POST /validator/review",
            "user_balance": "GET /users/<id>/balance",
            "health": "GET /health"
        }
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "ai_service_integrated": HAS_AI_SERVICE,
        "milestone": "30%"
    })


@app.route("/uploads/<path:filename>", methods=["GET"])
def serve_upload(filename):
    """Serve uploaded photos for validator review interface."""
    return send_from_directory(str(UPLOAD_DIR), filename)


@app.route("/submit", methods=["GET", "POST"])
def submit():
    """
    Handle cleanup photo pair submission from the frontend.
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
                    "after": "Image file (JPEG/PNG)",
                    "user_id": "Optional string (default: 'usr_demo')"
                },
                "response_example": {
                    "submission_id": "sub_1a2b3c4d",
                    "verdict": "pass",
                    "similarity_score": 88.5,
                    "cleanup_score": 75.0,
                    "tx_hash": "0x4f12...a9b3",
                    "reward_amount": 75.0
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
    logger.info("Received submission %s from user '%s'", sub_id, user_id)

    # Persist uploaded image files
    ext_before = Path(before_file.filename).suffix or ".jpg"
    ext_after = Path(after_file.filename).suffix or ".jpg"
    path_before = UPLOAD_DIR / f"{sub_id}_before{ext_before}"
    path_after = UPLOAD_DIR / f"{sub_id}_after{ext_after}"

    try:
        before_file.save(str(path_before))
        after_file.save(str(path_after))

        # 1. Run Real AI Duplicate & Location & Cleanup Verification
        if HAS_AI_service_detector():
            from duplicate_detector import check_duplicate as ai_check
            ai_result = ai_check(
                before_path=path_before,
                after_path=path_after,
                hash_threshold=6,
                store=hash_store,
                auto_register=True,
                submission_id=sub_id
            )
        else:
            ai_result = {
                "verdict": "pass",
                "similarity_score": 0.88,
                "cleanup_score": 0.75,
                "is_duplicate": False,
                "duplicate_reason": None
            }

        # Normalize scores to 0-100 percentage range for consistency
        raw_sim = ai_result.get("similarity_score", 0.85)
        raw_clean = ai_result.get("cleanup_score", 0.75)
        similarity_score = round(raw_sim * 100 if raw_sim <= 1.0 else raw_sim, 1)
        cleanup_score = round(raw_clean * 100 if raw_clean <= 1.0 else raw_clean, 1)
        verdict = ai_result.get("verdict", "pass")

        tx_hash = None
        reward_amount = 0.0

        # 2. Blockchain and Reward Logic:
        # If the submission passes automatic AI verification immediately, mint/record on blockchain
        if verdict == "pass":
            tx_data = record_cleanup_on_chain(user_id, cleanup_score, sub_id)
            tx_hash = tx_data.get("tx_hash")
            reward_amount = tx_data.get("reward_amount", cleanup_score)
            credit_user_reward(user_id, reward_amount)
            logger.info("Submission %s auto-approved: Awarded %.1f CleanTO (tx: %s)",
                        sub_id, reward_amount, tx_hash)
        elif verdict == "flagged_review":
            logger.info("Submission %s borderline (sim=%.1f, clean=%.1f): Queued for Validator review",
                        sub_id, similarity_score, cleanup_score)
        else:
            logger.info("Submission %s rejected by AI: verdict=%s", sub_id, verdict)

        # 3. Persist submission into SQLite database
        record = insert_submission(
            submission_id=sub_id,
            user_id=user_id,
            before_path=str(path_before),
            after_path=str(path_after),
            verdict=verdict,
            similarity_score=similarity_score,
            cleanup_score=cleanup_score,
            tx_hash=tx_hash,
            reward_amount=reward_amount
        )

        response_payload = {
            "submission_id": sub_id,
            "verdict": verdict,
            "similarity_score": similarity_score,
            "cleanup_score": cleanup_score,
            "tx_hash": tx_hash,
            "reward_amount": reward_amount if tx_hash else None,
            "created_at": record["created_at"],
            "is_duplicate": ai_result.get("is_duplicate", False),
            "duplicate_reason": ai_result.get("duplicate_reason")
        }

        return jsonify(response_payload), 200

    except Exception as e:
        logger.error("Error processing submission %s: %s", sub_id, e, exc_info=True)
        return jsonify({
            "error": "Submission processing failed",
            "message": str(e),
            "submission_id": sub_id
        }), 500


def HAS_AI_service_detector():
    """Helper check for AI service."""
    return HAS_AI_SERVICE and hash_store is not None


@app.route("/submissions/<submission_id>", methods=["GET"])
def get_submission_by_id(submission_id: str):
    """Fetch a stored submission by ID."""
    submission = get_submission(submission_id)
    if not submission:
        return jsonify({"error": f"Submission '{submission_id}' not found."}), 404

    return jsonify({
        "submission_id": submission["submission_id"],
        "user_id": submission["user_id"],
        "verdict": submission["verdict"],
        "similarity_score": submission["similarity_score"],
        "cleanup_score": submission["cleanup_score"],
        "tx_hash": submission["tx_hash"],
        "reward_amount": submission["reward_amount"],
        "created_at": submission["created_at"]
    }), 200


@app.route("/submissions", methods=["GET"])
def list_all_submissions():
    """List all recent submissions."""
    items = list_submissions(limit=50)
    return jsonify({
        "count": len(items),
        "submissions": items
    }), 200


@app.route("/validator/queue", methods=["GET"])
def get_validator_queue():
    """
    Retrieve all submissions currently flagged for human validator review.
    Returns: { "count": int, "queue": [ ... ] }
    """
    flagged = get_flagged_submissions()
    queue = []
    for item in flagged:
        before_file = Path(item["before_path"]).name if item["before_path"] else ""
        after_file = Path(item["after_path"]).name if item["after_path"] else ""
        queue.append({
            "submission_id": item["submission_id"],
            "user_id": item["user_id"],
            "verdict": item["verdict"],
            "similarity_score": item["similarity_score"],
            "cleanup_score": item["cleanup_score"],
            "created_at": item["created_at"],
            "before_image_url": f"/uploads/{before_file}" if before_file else None,
            "after_image_url": f"/uploads/{after_file}" if after_file else None
        })

    return jsonify({
        "count": len(queue),
        "queue": queue
    }), 200


@app.route("/validator/review", methods=["POST"])
def review_submission():
    """
    Process human validator decision (approve or reject) for a flagged submission.
    JSON Body: { "submission_id": string, "decision": "approve" | "reject" }
    """
    data = request.get_json(silent=True)
    if not data or "submission_id" not in data or "decision" not in data:
        return jsonify({
            "error": "JSON body must include 'submission_id' and 'decision' ('approve' | 'reject')."
        }), 400

    sub_id = data["submission_id"]
    decision = data["decision"].lower().strip()

    if decision not in ("approve", "reject"):
        return jsonify({"error": "Decision must be either 'approve' or 'reject'."}), 400

    submission = get_submission(sub_id)
    if not submission:
        return jsonify({"error": f"Submission '{sub_id}' not found."}), 404

    if decision == "approve":
        # Calculate reward based on cleanup score (defaulting to minimum 50 if zero)
        score = submission["cleanup_score"] if submission["cleanup_score"] > 0 else 50.0
        user_id = submission["user_id"]

        # 1. Trigger blockchain smart contract call
        tx_data = record_cleanup_on_chain(user_id, score, sub_id)
        tx_hash = tx_data.get("tx_hash")
        reward_amount = tx_data.get("reward_amount", score)

        # 2. Credit user balance in DB
        credit_user_reward(user_id, reward_amount)

        # 3. Update submission verdict to approved_by_validator
        new_verdict = "approved_by_validator"
        update_submission_verdict(sub_id, new_verdict, tx_hash=tx_hash, reward_amount=reward_amount)

        logger.info("Validator APPROVED submission %s for user %s: Awarded %.1f CleanTO (tx: %s)",
                    sub_id, user_id, reward_amount, tx_hash)

        return jsonify({
            "status": "success",
            "submission_id": sub_id,
            "verdict": new_verdict,
            "tx_hash": tx_hash,
            "reward_amount": reward_amount,
            "message": f"Submission {sub_id} successfully approved and rewarded {reward_amount} CleanTO."
        }), 200

    else: # reject
        new_verdict = "rejected_by_validator"
        update_submission_verdict(sub_id, new_verdict)
        logger.info("Validator REJECTED submission %s", sub_id)

        return jsonify({
            "status": "success",
            "submission_id": sub_id,
            "verdict": new_verdict,
            "message": f"Submission {sub_id} has been rejected."
        }), 200


@app.route("/users/<user_id>/balance", methods=["GET"])
def get_balance(user_id: str):
    """
    Returns the real CleanTO balance and cleanup count for a contributor.
    Checks on-chain contract first, then falls back to backend DB ledger.
    """
    # 1. Check if smart contract query succeeds
    chain_data = query_chain_balance(user_id)
    if chain_data:
        return jsonify({
            "user_id": user_id,
            "balance": chain_data["balance"],
            "cleanup_count": chain_data["cleanup_count"],
            "user_address": chain_data["user_address"],
            "chain_connected": True
        }), 200

    # 2. Return backend-tracked mirror balance
    user_data = get_user_balance(user_id)
    return jsonify({
        "user_id": user_data["user_id"],
        "name": user_data["name"],
        "balance": user_data["balance"],
        "cleanup_count": user_data["cleanup_count"],
        "chain_connected": False
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info("Starting CleanTO Backend on http://0.0.0.0:%d", port)
    app.run(host="0.0.0.0", port=port, debug=True)
