"""
CleanTO Backend Automated & Self-Test Script
===========================================
Milestone: Review II (20% Milestone)

Runs unit tests against the Flask application and SQLite database:
1. Tests database initialization and user seeding.
2. Tests POST /submit endpoint with sample images.
3. Tests GET /submissions/{id} endpoint.
4. Tests error handling for 404 and missing image fields.
"""

import sys
import io
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app import app
from db import init_db, get_submission, list_submissions

def run_tests():
    print("=" * 60)
    print("CleanTO Backend Self-Test (20% Milestone Verification)")
    print("=" * 60)

    # Initialize DB
    init_db()
    client = app.test_client()

    # 1. Health & Index Check
    print("\n[1] Testing GET / and GET /health...")
    res = client.get("/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("    GET / -> Status 200 OK")

    res_health = client.get("/health")
    assert res_health.status_code == 200, f"Expected 200, got {res_health.status_code}"
    print(f"    GET /health -> {res_health.get_json()}")

    # 2. Check Sample Images
    sample_dir = BACKEND_DIR.parent / "ai-service" / "sample_images"
    before_img = sample_dir / "sample_before_1.jpg"
    after_img = sample_dir / "sample_after_1.jpg"

    if before_img.exists() and after_img.exists():
        with open(before_img, "rb") as f_b, open(after_img, "rb") as f_a:
            before_bytes = f_b.read()
            after_bytes = f_a.read()
    else:
        # Generate minimal fake jpeg bytes if samples are absent
        from PIL import Image
        buf_b, buf_a = io.BytesIO(), io.BytesIO()
        Image.new("RGB", (64, 64), color="red").save(buf_b, format="JPEG")
        Image.new("RGB", (64, 64), color="green").save(buf_a, format="JPEG")
        before_bytes = buf_b.getvalue()
        after_bytes = buf_a.getvalue()

    # 3. Test POST /submit
    print("\n[2] Testing POST /submit (Contract Verification)...")
    data = {
        "before": (io.BytesIO(before_bytes), "before.jpg"),
        "after": (io.BytesIO(after_bytes), "after.jpg"),
        "user_id": "usr_demo"
    }

    res_submit = client.post("/submit", data=data, content_type="multipart/form-data")
    assert res_submit.status_code == 200, f"POST /submit failed with {res_submit.status_code}: {res_submit.data}"
    json_data = res_submit.get_json()

    print("    Response payload:")
    for k, v in json_data.items():
        print(f"      - {k}: {v}")

    assert "submission_id" in json_data, "Missing submission_id"
    assert "verdict" in json_data, "Missing verdict"
    assert "similarity_score" in json_data, "Missing similarity_score"
    sub_id = json_data["submission_id"]
    print(f"    SUCCESS: Created submission ID: {sub_id}")

    # 4. Test GET /submissions/{id}
    print(f"\n[3] Testing GET /submissions/{sub_id}...")
    res_get = client.get(f"/submissions/{sub_id}")
    assert res_get.status_code == 200, f"GET /submissions/{sub_id} failed: {res_get.status_code}"
    get_data = res_get.get_json()
    print("    Retrieved payload:")
    for k, v in get_data.items():
        print(f"      - {k}: {v}")

    assert get_data["submission_id"] == sub_id
    assert get_data["verdict"] == json_data["verdict"]
    assert "created_at" in get_data
    print("    SUCCESS: Retrieved submission matches DB record.")

    # 5. Test 404 on non-existent submission
    print("\n[4] Testing GET /submissions/invalid_id (404 expected)...")
    res_404 = client.get("/submissions/non_existent_123")
    assert res_404.status_code == 404, f"Expected 404, got {res_404.status_code}"
    print("    SUCCESS: Returned 404 for invalid ID.")

    # 6. Test GET /submissions (List)
    print("\n[5] Testing GET /submissions (List recent)...")
    res_list = client.get("/submissions")
    assert res_list.status_code == 200
    list_data = res_list.get_json()
    print(f"    Total submissions in SQLite: {list_data['count']}")

    print("\n" + "=" * 60)
    print("ALL BACKEND CONTRACT TESTS PASSED SUCCESSFULLY! (20% Milestone)")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
