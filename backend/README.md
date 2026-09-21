# CleanTO Backend (Review II — 20% Milestone)

Minimal Flask backend with SQLite persistence for image cleanup verification.

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

## 3. Run Self-Test Verification

Run the automated test suite to verify endpoints and SQLite database persistence without starting a server:

```bash
python test_api.py
```

---

## 4. Manual API Testing (cURL / PowerShell)

### A. Health Check
**cURL:**
```bash
curl http://localhost:5000/health
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
```

---

### B. Submit Cleanup Photos (`POST /submit`)

**cURL:**
```bash
curl -X POST http://localhost:5000/submit \
  -F "before=@../ai-service/sample_images/sample_before_1.jpg" \
  -F "after=@../ai-service/sample_images/sample_after_1.jpg"
```

**PowerShell:**
```powershell
$form = @{
    before = Get-Item "..\ai-service\sample_images\sample_before_1.jpg"
    after  = Get-Item "..\ai-service\sample_images\sample_after_1.jpg"
}
$response = Invoke-RestMethod -Uri "http://localhost:5000/submit" -Method Post -Form $form
$response | ConvertTo-Json
```

**Expected JSON Response:**
```json
{
  "submission_id": "sub_a1b2c3d4",
  "verdict": "pass",
  "similarity_score": 88.5,
  "created_at": "2026-09-20T17:15:00.000Z",
  "is_duplicate": false
}
```

---

### C. Get Stored Submission (`GET /submissions/{id}`)

**cURL:**
```bash
curl http://localhost:5000/submissions/sub_a1b2c3d4
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/submissions/sub_a1b2c3d4" -Method Get | ConvertTo-Json
```

**Expected JSON Response:**
```json
{
  "submission_id": "sub_a1b2c3d4",
  "user_id": "usr_demo",
  "verdict": "pass",
  "similarity_score": 88.5,
  "created_at": "2026-09-20T17:15:00.000Z"
}
```

---

## 5. Database Schema (SQLite: `cleanto.db`)

* **`User`**: `id` (TEXT PRIMARY KEY), `name` (TEXT)
* **`Submission`**: `id` (TEXT PRIMARY KEY), `user_id` (TEXT), `before_path` (TEXT), `after_path` (TEXT), `verdict` (TEXT), `similarity_score` (REAL), `created_at` (TIMESTAMP)
