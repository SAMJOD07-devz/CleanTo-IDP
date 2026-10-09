# CleanTO Backend (30% Milestone)

Flask REST API and persistence layer connecting the AI verification pipeline, SQLite database, human validator workflow, and local smart contract ledger.

---

## 1. Setup & Installation

Navigate to the `backend` folder and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

---

## 2. Run the Backend Server

```bash
python app.py
```
The server will start at: `http://localhost:5000` (or `http://127.0.0.1:5000`).

---

## 3. Run Automated Tests

Run the self-contained automated test suite validating all milestone contracts and workflows:

```bash
python test_api.py
```

---

## 4. API Endpoints Contract

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/submit` | `POST` | Upload multipart `before` and `after` images. Runs AI checks, routes to auto-pass + blockchain reward, flagged review, or duplicate/location failure. |
| `/submissions/<id>` | `GET` | Retrieve complete details of a submission (scores, verdict, blockchain tx hash). |
| `/submissions` | `GET` | List recent submissions. |
| `/validator/queue` | `GET` | List all submissions currently awaiting human reviewer verdict (`flagged_review`). |
| `/validator/review` | `POST` | Review a flagged submission (`approve` or `reject`). Triggers blockchain reward on approval. |
| `/users/<id>/balance` | `GET` | Get real CleanTO balance and verified cleanup count (smart contract / database mirror). |
| `/health` | `GET` | Health check endpoint. |

---

## 5. Developer CLI Testing Tool (`dev_test.py`)

Test the complete flow without opening the frontend:

```bash
# 1. Test auto-pass submission and reward
python dev_test.py submit-pass usr_demo

# 2. Test duplicate detection
python dev_test.py submit-dup usr_demo

# 3. Check validator queue
python dev_test.py queue

# 4. Review a flagged submission (approve / reject)
python dev_test.py review <submission_id> approve

# 5. Check user balance
python dev_test.py balance usr_demo
```

---

## 6. Database Schema (SQLite: `cleanto.db`)

* **`User`**:
  * `id` (TEXT PRIMARY KEY)
  * `name` (TEXT)
  * `balance` (REAL)
  * `cleanup_count` (INTEGER)
* **`Submission`**:
  * `id` (TEXT PRIMARY KEY)
  * `user_id` (TEXT)
  * `before_path` (TEXT)
  * `after_path` (TEXT)
  * `verdict` (TEXT) — `pass`, `fail_duplicate`, `fail_location_mismatch`, `flagged_review`, `approved_by_validator`, `rejected_by_validator`
  * `similarity_score` (REAL)
  * `cleanup_score` (REAL)
  * `tx_hash` (TEXT)
  * `reward_amount` (REAL)
  * `created_at` (TIMESTAMP)
  * `updated_at` (TIMESTAMP)
