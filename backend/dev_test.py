"""
CleanTO Developer CLI Test Utility (30% Milestone)
==================================================
Run this script to simulate submissions, inspect the validator queue,
review borderline entries, and check user balances without touching the frontend.

Usage:
  python dev_test.py submit-pass
  python dev_test.py submit-dup
  python dev_test.py queue
  python dev_test.py review <submission_id> <approve|reject>
  python dev_test.py balance <user_id>
"""

import sys
import io
import requests
from PIL import Image

BACKEND_URL = "http://127.0.0.1:5000"


def make_dummy_image(color=(120, 150, 180)):
    buf = io.BytesIO()
    Image.new("RGB", (128, 128), color=color).save(buf, format="JPEG")
    buf.seek(0)
    return buf


def submit_pass(user_id="usr_demo"):
    print(f"--> Submitting genuine cleanup for user '{user_id}'...")
    b_img = make_dummy_image((100, 80, 60))
    a_img = make_dummy_image((110, 85, 65))
    files = {
        "before": ("before.jpg", b_img, "image/jpeg"),
        "after": ("after.jpg", a_img, "image/jpeg")
    }
    data = {"user_id": user_id}
    res = requests.post(f"{BACKEND_URL}/submit", files=files, data=data)
    print("Status:", res.status_code)
    print("Response:", res.json())


def submit_duplicate(user_id="usr_demo"):
    print(f"--> Submitting duplicate pair for user '{user_id}'...")
    same_img = make_dummy_image((200, 200, 200))
    files = {
        "before": ("dup.jpg", same_img, "image/jpeg"),
        "after": ("dup.jpg", same_img, "image/jpeg")
    }
    data = {"user_id": user_id}
    res = requests.post(f"{BACKEND_URL}/submit", files=files, data=data)
    print("Status:", res.status_code)
    print("Response:", res.json())


def check_queue():
    print("--> Fetching Validator Review Queue...")
    res = requests.get(f"{BACKEND_URL}/validator/queue")
    print("Status:", res.status_code)
    print("Queue:", res.json())


def review(submission_id, decision):
    print(f"--> Reviewing submission '{submission_id}' with decision '{decision}'...")
    res = requests.post(
        f"{BACKEND_URL}/validator/review",
        json={"submission_id": submission_id, "decision": decision}
    )
    print("Status:", res.status_code)
    print("Response:", res.json())


def check_balance(user_id="usr_demo"):
    print(f"--> Checking balance for user '{user_id}'...")
    res = requests.get(f"{BACKEND_URL}/users/{user_id}/balance")
    print("Status:", res.status_code)
    print("Balance:", res.json())


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    cmd = sys.argv[1].lower()
    if cmd == "submit-pass":
        user = sys.argv[2] if len(sys.argv) > 2 else "usr_demo"
        submit_pass(user)
    elif cmd == "submit-dup":
        user = sys.argv[2] if len(sys.argv) > 2 else "usr_demo"
        submit_duplicate(user)
    elif cmd == "queue":
        check_queue()
    elif cmd == "review":
        if len(sys.argv) < 4:
            print("Usage: python dev_test.py review <submission_id> <approve|reject>")
            sys.exit(1)
        review(sys.argv[2], sys.argv[3])
    elif cmd == "balance":
        user = sys.argv[2] if len(sys.argv) > 2 else "usr_demo"
        check_balance(user)
    else:
        print(f"Unknown command '{cmd}'\n", __doc__)
