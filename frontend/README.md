# CleanTO — Frontend Client Application

> **Role Responsibility:** Engineer B (Frontend & Blockchain)  
> **Team:** CleanTO Innovative Design Project (IDP)  
> **Integration Partners:** Engineer A (Backend API & Database), Engineer C (AI Verification Service)

---

## 1. Context & Purpose

Community waste cleanup faces two critical hurdles:
1. Lack of genuine incentive for citizens to participate.
2. Inability to reliably verify cleanup validity (fraudulent submissions, staged litter, photo reuse).

**CleanTO** solves this through an AI-and-blockchain-verified cleanup workflow. Contributors upload geolocated "before" and "after" photos of cleanup spots. Submissions are verified by AI and human validators (DPoS model), recorded immutably on a permissioned ledger, and rewarded with **CleanTO utility points** redeemable in a capped marketplace.

---

## 2. Frontend Scope & Core Modules

The frontend is a **mobile-first web application** (or responsive hybrid client) built to serve contributors and validators.

### A. Photo Capture & Cleanup Submission Flow
- **Before Photo Capture:**
  - Live camera / photo upload with mandatory real-time **GPS coordinate capture** (`navigator.geolocation`) and ISO **timestamp generation**.
  - Site description / notes.
- **Active Cleanup Tracking:**
  - Timer/progress tracker indicating the ongoing cleanup session.
- **After Photo Capture:**
  - Same-spot guidance to ensure camera angle matches the "before" image.
  - Automatic GPS & timestamp capture for delta comparison.
- **Submission Confirmation:**
  - Pre-flight preview before uploading to the backend.

### B. Submission Status & Verification Timeline
- Real-time or polling-based status tracker for each submission:
  - `UPLOADED` -> Images stored on IPFS via Backend.
  - `AI_EVALUATING` -> Duplicate detection, transformation score, location consistency.
  - `AUTO_APPROVED` / `AUTO_REJECTED` -> Clear pass/fail paths.
  - `IN_VALIDATION` -> Borderline cases escalated to peer validators.
  - `FINALIZED` -> Recorded on ledger and CleanTO reward credited.

### C. CleanTO Wallet & Rewards View
- **Balance Display:** Total earned CleanTO utility points.
- **Crucial UI Constraint:** CleanTO is explicitly **NOT** a cryptocurrency or tradeable financial asset. The UI must represent it strictly as **verified community reward points / credits**.
- **Transaction History:** List of verified cleanup rewards, timestamps, and redemption debits.

### D. Capped Redemption Catalogue
- Catalog of community partner vouchers, discount coupons, and sustainable goods.
- Redemption flow with per-user monthly/daily caps to prevent bot farming or gaming.

### E. Validator Review Dashboard (DPoS)
- Reserved for users with high reputation and verified cleanup history.
- **Review Interface:**
  - Side-by-side Before vs. After comparison with zoom and pan.
  - Inspection of GPS delta, capture timestamps, and AI transformation/duplicate scores.
- **Staking & Voting:**
  - Display validator's active stake (collateral).
  - Multi-validator voting actions: `Approve`, `Reject`, or `Flag Fraud`.
  - Alert regarding stake slashing risk for negligent/fraudulent approvals.

---

## 3. Interface Contract (Frontend ↔ Backend API)

> **Rule:** The frontend develops against this contract using mock endpoints until the backend is integrated.

### Submission Request Contract
- **Endpoint:** `POST /api/v1/submissions`
- **Content-Type:** `multipart/form-data`
- **Payload:**
  - `before_image`: File (Binary)
  - `after_image`: File (Binary)
  - `user_id`: String
  - `gps_lat_before`: Float
  - `gps_long_before`: Float
  - `timestamp_before`: ISO 8601 String
  - `gps_lat_after`: Float
  - `gps_long_after`: Float
  - `timestamp_after`: ISO 8601 String

### Status Polling Contract
- **Endpoint:** `GET /api/v1/submissions/:submission_id`
- **Response Format:**
  ```json
  {
    "submission_id": "sub_12345",
    "user_id": "usr_9876",
    "status": "IN_VALIDATION", // UPLOADED | AI_EVALUATING | AUTO_APPROVED | AUTO_REJECTED | IN_VALIDATION | VERIFIED | REJECTED
    "before_cid": "ipfs://Qm...",
    "after_cid": "ipfs://Qm...",
    "ai_score": {
      "transformation_score": 88.5,
      "location_consistency": true,
      "duplicate_flag": false,
      "verdict": "BORDERLINE"
    },
    "reward_amount": 25,
    "created_at": "2026-09-20T10:00:00Z"
  }
  ```

---

## 4. Key Architectural & Security Rules

1. **NO Direct Blockchain Calls from Client:**
   - The frontend **never** interacts directly with smart contracts or submits transactions to the blockchain node.
   - All ledger queries (balance, proofs) and state transitions are mediated by the authenticated backend.
2. **Device Hardware Permissions:**
   - Handle GPS denial gracefully with clear instructions requiring location services.
   - Prevent manipulation of client-side timestamps through server-side cross-checks.
3. **Mocking Strategy:**
   - Maintain a `/services/mock/` adapter layer so the full UI flow can be demonstrated and tested independently before backend wiring.
