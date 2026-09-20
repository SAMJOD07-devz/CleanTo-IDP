"""
CleanTO Backend API Server
==========================
Milestone: Review II (20% Working Slice)
Role: Backend Integration with AI Service

Exposes POST /submit endpoint to ingest cleanup photo submissions and invoke
the AI duplicate detection and verification pipeline.

Contract:
- Request: POST /submit (multipart/form-data)
  - before: File (image/jpeg, image/png)
  - after:  File (image/jpeg, image/png)
- Response:
  {
    "submission_id": "sub_...",
    "verdict": "pass" | "fail" | "duplicate",
    "similarity_score": float, # scaled 0-100%
    "is_duplicate": bool,
    "duplicate_reason": str | null,
    "before_phash": str,
    "after_phash": str
  }
"""

import os
import sys
import uuid
import tempfile
import logging
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add ai-service to sys.path
AI_SERVICE_DIR = Path(__file__).resolve().parent.parent / "ai-service"
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

try:
    from duplicate_detector import check_duplicate, register_submission, HashStore
except ImportError as e:
    raise ImportError(f"Could not import duplicate_detector from {AI_SERVICE_DIR}: {e}")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CleanTO.Backend")

app = Flask(__name__)
# Enable CORS for frontend origin
CORS(app, resources={r"/*": {"origins": "*"}})

TEMP_UPLOAD_DIR = Path(__file__).parent / "temp_uploads"
TEMP_UPLOAD_DIR.mkdir(exist_ok=True)

# Shared HashStore for submitted image records
STORE_PATH = AI_SERVICE_DIR / "submission_hashes.json"
hash_store = HashStore(filepath=STORE_PATH)


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "service": "CleanTO Backend & AI Verification API",
        "status": "online",
        "version": "0.3.0",
        "endpoints": {
            "submit": "POST /submit",
            "health": "GET /health",
            "hashes": "GET /api/hashes"
        }
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "hash_records_count": len(hash_store.records)
    })


@app.route("/api/hashes", methods=["GET"])
def get_hashes():
    """Diagnostic endpoint to inspect currently registered perceptual hashes."""
    return jsonify({
        "total_records": len(hash_store.records),
        "records": hash_store.records
    })


@app.route("/api/hashes/clear", methods=["POST"])
def clear_hashes():
    """Reset the hash store for testing/demo purposes."""
    hash_store.clear()
    return jsonify({"status": "cleared", "total_records": 0})


@app.route("/submit", methods=["POST"])
def submit():
    """
    Handle comparative cleanup photo submission from frontend.
    Accepts multipart/form-data with 'before' and 'after' image files.
    """
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
    sub_id = f"sub_{uuid.uuid4().hex[:7]}"
    logger.info("Processing submission %s (before: %s, after: %s)", sub_id, before_file.filename, after_file.filename)

    # Save files to temp directory for processing
    ext_before = Path(before_file.filename).suffix or ".jpg"
    ext_after = Path(after_file.filename).suffix or ".jpg"
    temp_before = TEMP_UPLOAD_DIR / f"{sub_id}_before{ext_before}"
    temp_after = TEMP_UPLOAD_DIR / f"{sub_id}_after{ext_after}"

    try:
        before_file.save(temp_before)
        after_file.save(temp_after)

        # Run AI duplicate detection and similarity scoring
        # auto_register=True ensures verified genuine passes are saved to HashStore
        ai_result = check_duplicate(
            before_path=temp_before,
            after_path=temp_after,
            hash_threshold=6,
            store=hash_store,
            auto_register=True,
            submission_id=sub_id
        )

        # Map AI similarity_score (0.0 - 1.0) to frontend display format (percentage: 0 - 100)
        raw_score = ai_result.get("similarity_score", 0.85)
        display_score = round(raw_score * 100, 1)

        verdict = ai_result.get("verdict", "pass")

        response_payload = {
            "submission_id": sub_id,
            "verdict": verdict,
            "similarity_score": display_score,
            "is_duplicate": ai_result.get("is_duplicate", False),
            "duplicate_reason": ai_result.get("duplicate_reason"),
            "before_phash": ai_result.get("before_phash"),
            "after_phash": ai_result.get("after_phash"),
            "matches": ai_result.get("matches", []),
            "details": ai_result.get("details", {})
        }

        logger.info("Submission %s evaluated: verdict=%s, score=%.1f%%", sub_id, verdict, display_score)
        return jsonify(response_payload), 200

    except Exception as e:
        logger.error("Error processing submission %s: %s", sub_id, e, exc_info=True)
        return jsonify({
            "error": "Verification pipeline error",
            "message": str(e),
            "submission_id": sub_id
        }), 500

    finally:
        # Clean up temporary uploaded files
        try:
            if temp_before.exists():
                temp_before.unlink()
            if temp_after.exists():
                temp_after.unlink()
        except Exception:
            pass


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info("Starting CleanTO Backend on port %d...", port)
    app.run(host="0.0.0.0", port=port, debug=True)
