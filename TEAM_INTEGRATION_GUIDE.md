# CleanTO — Team Collaboration & Integration Guide
**Milestone:** Review II (20% Working Vertical Slice)  
**Branch:** `develop`  
**Repository:** [https://github.com/SAMJOD07-devz/CleanTo-IDP.git](https://github.com/SAMJOD07-devz/CleanTo-IDP.git)

---

## 1. What's New on `develop`?
The **Frontend Client** and **Blockchain Smart Contract** modules have been pushed to the `develop` branch:
- **`frontend/`**: Complete Warm Editorial Fintech web application (Landing, Submit, Contributor Dashboard, Validator Portal, Reward Redemption, and About pages) with a fully working 20% cleanup submission flow and 1-click test photos.
- **`blockchain/`**: Hardhat workspace with `CleanTORewards.sol`, 6 passing automated unit tests, and a standalone demonstration script.
- **`backend/` & `ai-service/`**: Left completely untouched so Engineer A (AI) and Engineer C (Backend) have a clean canvas.

---

## 2. How Teammates Get These Files

### Option A: You Already Cloned the Project Locally
If you already have the repository folder on your machine, **do not clone it again**. Simply pull the latest changes:

```bash
# 1. Save any work you've done in backend/ or ai-service/
git add .
git commit -m "wip: save local progress"

# 2. Fetch the latest branches from GitHub
git fetch origin

# 3. Switch to develop branch
git checkout develop

# 4. Pull all latest frontend and blockchain code
git pull origin develop
```

> **Note on Merge Conflicts:** Because you are working in `backend/` or `ai-service/` and the new files are in `frontend/` and `blockchain/`, Git will merge automatically with **zero conflicts**.

---

### Option B: Fresh Setup (First Time Cloning)
If you are setting up on a new PC:

```bash
# 1. Clone the repository
git clone https://github.com/SAMJOD07-devz/CleanTo-IDP.git
cd CleanTo-IDP

# 2. Checkout the develop branch
git checkout develop
```

---

## 3. How to Run the Frontend Locally

Requirements: **Node.js (v18 or v20+)** and **npm**

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
```

- Open **[http://localhost:3000](http://localhost:3000)** in your browser.
- Go to the **Submit** tab (`http://localhost:3000/#/submit`).
- Click **"⚡ Load Sample Photos (1-Click Demo)"** at the top right to instantly populate test photos.
- Click **"Submit Cleanup for Pipeline Verification"** to see the 4-stage scan animation and verdict stamp.
- Use the **"Demo Controls"** gear in the bottom-left corner to test `Pass`, `Fail`, or `Duplicate` outcomes.

---

## 4. How Backend Integrates with Frontend (The Contract)

The frontend is ready to talk to the real backend whenever the backend engineer starts the server on port `5000`.

### The Interface Contract
- **Endpoint:** `POST http://localhost:5000/submit`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `before`: File (JPEG / PNG image)
  - `after`: File (JPEG / PNG image)
- **Expected JSON Response:**
```json
{
  "submission_id": "sub_987654",
  "verdict": "pass",
  "similarity_score": 88.5
}
```
*(Valid `verdict` values: `"pass"`, `"fail"`, or `"duplicate"`)*

### Switching Frontend to the Real Backend
In `frontend/src/api.js`:
```javascript
// Change this line from true to false:
export const USE_MOCK = false; 
export const BACKEND_URL = "http://localhost:5000";
```
When `USE_MOCK = false`, the frontend makes the real HTTP `fetch` to `http://localhost:5000/submit`. When `true`, it uses the internal mock adapter for offline demos.

---

## 5. How to Run the Blockchain Tests & Demo

Requirements: **Node.js** and **npm**

```bash
cd blockchain

# 1. Install Hardhat and dependencies
npm install

# 2. Run automated contract tests (6/6 should pass)
npm test

# 3. Run the standalone reward recording demo
npm run demo
```

---

## 6. Team Git Workflow Going Forward

1. **Daily Work:**  
   Always base your work off `develop` and push your commits to `develop` (or your own branch `feature/backend` or `feature/ai` then merge into `develop`):
   ```bash
   git checkout develop
   git pull origin develop
   # do your work...
   git add backend/      # or git add ai-service/
   git commit -m "feat(backend): add /submit endpoint and photo ingestion"
   git push origin develop
   ```

2. **Final Milestone Merge to Main:**  
   Once the Backend, AI model, Frontend, and Blockchain are tested together on `develop`, open a **Pull Request from `develop` into `main`** for the final Review II evaluation.
