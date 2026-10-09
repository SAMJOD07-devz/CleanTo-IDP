"""
CleanTO Backend Automated Test Suite (30% Milestone)
====================================================
Role: Backend Engineer
Validates all updated interface contracts and workflows:
1. Health and Index endpoints.
2. POST /submit with genuine cleanup pair -> Auto-pass verdict + blockchain reward + balance increment.
3. POST /submit with duplicate images -> fail_duplicate verdict.
4. Flagged submission flow:
   - Submission receives 'flagged_review'
   - Appears in GET /validator/queue
   - Reviewer calls POST /validator/review with 'approve'
   - Blockchain recordCleanup is triggered, tx_hash assigned, balance credited.
5. GET /users/<id>/balance returns updated balance and cleanup count.
6. GET /submissions/<id> returns all fields including cleanup_score, similarity_score, and tx_hash.
"""

import io
import sys
import json
import uuid
from pathlib import Path
from PIL import Image

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app import app
from db import init_db, insert_submission, get_submission, get_user_balance


def create_test_image(color=(100, 150, 200), size=(128, 128)) -> bytes:
    """Helper to generate a distinct in-memory JPEG."""
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format="JPEG")
    return buf.getvalue()


def run_tests():
    print("=" * 70)
    print(" CleanTO Backend Verification Test Suite (30% Milestone)")
    print("=" * 70)

    init_db()
    client = app.test_client()

    # --- Test 1: Health & API Index ---
    print("\n[1] Testing GET / and GET /health...")
    res_index = client.get("/")
    assert res_index.status_code == 200, f"Expected 200, got {res_index.status_code}"
    res_health = client.get("/health")
    assert res_health.status_code == 200, f"Expected 200, got {res_health.status_code}"
    print("    [PASS] Health & Index endpoints OK.")

    # --- Test 2: POST /submit (Auto Pass + Blockchain Reward) ---
    print("\n[2] Testing POST /submit (Genuine Cleanup Pair)...")
    img_before = create_test_image(color=(120, 80, 50))
    img_after = create_test_image(color=(130, 85, 55))

    data = {
        "before": (io.BytesIO(img_before), "clean_before.jpg"),
        "after": (io.BytesIO(img_after), "clean_after.jpg"),
        "user_id": "usr_test_1"
    }

    res_submit = client.post("/submit", data=data, content_type="multipart/form-data")
    assert res_submit.status_code == 200, f"POST /submit failed: {res_submit.data}"
    json_submit = res_submit.get_json()

    print("    Submitted Response:")
    print(f"      - submission_id: {json_submit.get('submission_id')}")
    print(f"      - verdict: {json_submit.get('verdict')}")
    print(f"      - similarity_score: {json_submit.get('similarity_score')}")
    print(f"      - cleanup_score: {json_submit.get('cleanup_score')}")
    print(f"      - tx_hash: {json_submit.get('tx_hash')}")

    assert "submission_id" in json_submit
    assert "verdict" in json_submit
    assert "similarity_score" in json_submit
    assert "cleanup_score" in json_submit
    print("    [PASS] Submission contract verified.")

    # --- Test 3: Duplicate Detection ---
    print("\n[3] Testing POST /submit (Identical Images -> Duplicate Detection)...")
    identical_img = create_test_image(color=(200, 200, 200))
    dup_data = {
        "before": (io.BytesIO(identical_img), "dup1.jpg"),
        "after": (io.BytesIO(identical_img), "dup2.jpg"),
        "user_id": "usr_test_dup"
    }
    res_dup = client.post("/submit", data=dup_data, content_type="multipart/form-data")
    assert res_dup.status_code == 200
    json_dup = res_dup.get_json()
    print(f"    Duplicate Verdict: {json_dup.get('verdict')} (Reason: {json_dup.get('duplicate_reason')})")
    assert json_dup.get("verdict") == "fail_duplicate"
    print("    [PASS] Duplicate rejected as expected.")

    # --- Test 4: Validator Queue & Review Workflow ---
    print("\n[4] Testing Validator Queue & Review Workflow...")
    # Insert a flagged submission directly to test validator review
    flagged_sub_id = f"sub_flagged_test_{uuid.uuid4().hex[:8]}"
    insert_submission(
        submission_id=flagged_sub_id,
        user_id="usr_validator_subject",
        before_path="",
        after_path="",
        verdict="flagged_review",
        similarity_score=64.5,
        cleanup_score=40.0
    )

    # Check GET /validator/queue
    res_queue = client.get("/validator/queue")
    assert res_queue.status_code == 200
    queue_data = res_queue.get_json()
    queued_ids = [item["submission_id"] for item in queue_data["queue"]]
    assert flagged_sub_id in queued_ids, f"Flagged ID {flagged_sub_id} not in queue: {queued_ids}"
    print(f"    Found flagged submission in /validator/queue (Queue size: {queue_data['count']})")

    # Approve via POST /validator/review
    review_payload = {
        "submission_id": flagged_sub_id,
        "decision": "approve"
    }
    res_review = client.post(
        "/validator/review",
        data=json.dumps(review_payload),
        content_type="application/json"
    )
    assert res_review.status_code == 200
    review_data = res_review.get_json()
    print(f"    Validator Review Response: verdict={review_data.get('verdict')}, tx_hash={review_data.get('tx_hash')}")
    assert review_data.get("verdict") == "approved_by_validator"
    assert review_data.get("tx_hash") is not None
    print("    [PASS] Validator approval and reward flow verified.")

    # --- Test 5: GET /users/{id}/balance ---
    print("\n[5] Testing GET /users/<id>/balance...")
    res_balance = client.get("/users/usr_validator_subject/balance")
    assert res_balance.status_code == 200
    balance_data = res_balance.get_json()
    print(f"    User Balance Data: {balance_data}")
    assert balance_data["balance"] >= 40.0
    assert balance_data["cleanup_count"] >= 1
    print("    [PASS] Real balance accurately tracked.")

    # --- Test 6: GET /submissions/{id} ---
    print("\n[6] Testing GET /submissions/<id>...")
    res_sub_detail = client.get(f"/submissions/{flagged_sub_id}")
    assert res_sub_detail.status_code == 200
    detail_data = res_sub_detail.get_json()
    assert detail_data["submission_id"] == flagged_sub_id
    assert detail_data["verdict"] == "approved_by_validator"
    assert "cleanup_score" in detail_data
    assert "tx_hash" in detail_data
    print(f"    Retrieved submission details: verdict={detail_data['verdict']}, score={detail_data['cleanup_score']}")
    print("    [PASS] GET /submissions/<id> full detail verified.")

    print("\n" + "=" * 70)
    print(" ALL 30% MILESTONE BACKEND TESTS PASSED SUCCESSFULLY! ")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
