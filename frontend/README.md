# CleanTO — Frontend Client Application (PRD v1.0 Aligned)

> **Role Responsibility:** Engineer B (Frontend & Blockchain)  
> **Project:** CleanTO Ecosystem — AI-Powered Waste Cleanup Verification and Blockchain Reward System  
> **Team:** Saumya GauravKumar Pandya (25BCE5069), Vaibhav Bisaria (25BCE1975), Harshit Mishra (25BCE5013)  
> **Integration Partners:** Engineer A (Backend API & Database), Engineer C (AI Verification Service)

---

## 1. Overview & PRD Alignment

CleanTO enables community waste cleanups through a fraud-resistant, verified workflow. Contributors upload before and after photos with GPS and timestamps, verified via AI and a Delegated Proof of Stake (DPoS) validator network, recorded on a permissioned ledger, and rewarded with non-speculative **CleanTO utility points**.

### PRD Target Users Supported by Frontend:
1. **Citizen / Contributor:** Captures/uploads cleanup photo pairs, tracks verification in real time, views CleanTO balance, and redeems vouchers.
2. **Delegate / Validator:** Eligible high-reputation users who stake CleanTO, review borderline/flagged submissions, and flag dirty zones.
3. **Municipal Authority / NGO (Phase 2/3):** Consumes impact analytics, views priority zones, and coordinates bonus cleanup campaigns.
4. **Platform Administrator:** Observes system health, review SLAs, and validator metrics.

---

## 2. Functional Requirements Breakdown (PRD Mapping)

| PRD ID | Requirement | Priority | Frontend Module & UI Implementation |
| :--- | :--- | :--- | :--- |
| **FR-1** | Before photo capture with GPS + timestamp | **Must** | Camera capture screen with mandatory device GPS lock (`navigator.geolocation`) and ISO timestamp. Pre-submission preview. |
| **FR-2** | After photo capture of the same site | **Must** | "After" photo capture with live ghosting/overlay of the "before" shot to guide angle consistency. Real-time GPS verification. |
| **FR-5** | Minimum time gap enforcement | **Must** | Active cleanup timer & lock UI. Warns contributor if attempting to upload "after" photo too soon, preventing staged fraud. |
| **FR-6** | Borderline/flagged submissions routing | **Must** | **Validator Review Dashboard:** Dedicated inbox displaying submissions pending peer review. |
| **FR-7** | Validator eligibility & staking flow | **Must** | **Staking Modal/Screen:** Informs eligible users of reputation threshold, locks CleanTO collateral before enabling review actions. |
| **FR-8** | Validator slashing alerts | **Must** | History/penalty logs in Validator profile showing slashing alerts and reputation changes if fraud was negligently approved. |
| **FR-10** | CleanTO balance crediting | **Must** | Automatic wallet update and celebratory reward modal upon final verification. |
| **FR-11** | Balance, history & redemption view | **Should** | **Wallet & Catalog:** Detailed activity ledger, token balance, and filtered redemption catalog (vouchers, coupons). |
| **FR-12** | Flag not-yet-cleaned areas | **Should** | **Cleanup-Needed Map:** Interactive map allowing delegates/citizens to pin dirty zones needing community attention. |
| **FR-13** | Priority zones with bonus rewards | **Could** | Map badge and card highlights indicating municipal/NGO sponsored high-reward cleanup locations. |
| **FR-14** | Leaderboard view | **Could** | Regional & campus leaderboard showing top contributors by verified cleanups and area impact. |

---

## 3. UI/UX Specifications & Non-Functional Constraints

- **Usability Constraint (PRD §7):** The entire photo submission flow must be completable in **under 60 seconds** on a low-end smartphone with average 3G/4G connectivity.
- **Mobile-First & Responsive:** Touch-friendly buttons (minimum 44x44px touch targets), lightweight asset footprint, zero heavy external runtime libraries.
- **Location Privacy:** Exact GPS coordinates are sent strictly to the backend for verification. Public feeds and maps display only generalized/fuzzed location radius.
- **Non-Crypto Framing:** CleanTO is presented strictly as **Community Reward Points / Impact Credits** — avoid crypto jargon (e.g., gas, mining, HODL, token swap) to prevent user confusion and speculative behavior.

---

## 4. Frontend Architecture & Screen Hierarchy

```text
frontend/
├── src/
│   ├── components/
│   │   ├── camera/          # GeoPhotoCapture, CameraOverlay, GeoTagBadge
│   │   ├── submission/      # CleanupTimer, VerificationTimeline, SubmissionCard
│   │   ├── wallet/          # BalanceCard, TransactionHistory, RewardBadge
│   │   ├── redemption/      # OfferCard, VoucherModal, FilterTabs
│   │   ├── validator/       # SubmissionDiffViewer, StakingCard, VoteButtonGroup
│   │   └── map/             # DirtyZoneMap, PriorityZonePin
│   ├── pages/
│   │   ├── HomeFeed.tsx
│   │   ├── NewSubmission.tsx (Before -> Active Cleaning -> After)
│   │   ├── SubmissionDetail.tsx
│   │   ├── Wallet.tsx
│   │   ├── RedemptionCatalog.tsx
│   │   ├── ValidatorDashboard.tsx
│   │   └── Leaderboard.tsx
│   └── services/
│       ├── api.ts           # Axios / Fetch client targeting Backend
│       ├── mock/            # Mock responses for parallel development
│       └── geolocation.ts   # Browser location helper with error handling
```

---

## 5. Submission API Contract (Frontend ↔ Backend)

### Upload Endpoint
- **URL:** `POST /api/v1/submissions`
- **Encoding:** `multipart/form-data`
- **Fields:**
  - `before_image`: File (JPEG/PNG)
  - `after_image`: File (JPEG/PNG)
  - `user_id`: String
  - `gps_lat_before`: Float
  - `gps_long_before`: Float
  - `timestamp_before`: ISO 8601 String
  - `gps_lat_after`: Float
  - `gps_long_after`: Float
  - `timestamp_after`: ISO 8601 String

### Status Polling / WebSocket Contract
- **URL:** `GET /api/v1/submissions/:submission_id`
- **Status Enum:**
  `UPLOADED` | `AI_EVALUATING` | `AUTO_APPROVED` | `AUTO_REJECTED` | `IN_VALIDATION` | `VERIFIED` | `REJECTED`
- **Response Format:**
  ```json
  {
    "submission_id": "sub_789456",
    "user_id": "usr_123456",
    "status": "IN_VALIDATION",
    "before_cid": "ipfs://QmBefore...",
    "after_cid": "ipfs://QmAfter...",
    "time_gap_seconds": 1840,
    "ai_score": {
      "transformation_score": 84.2,
      "location_consistency": true,
      "duplicate_flag": false,
      "verdict": "BORDERLINE"
    },
    "validator_votes": {
      "required": 3,
      "current_approvals": 2,
      "current_rejections": 0
    },
    "reward_amount": 35,
    "created_at": "2026-09-20T14:00:00Z"
  }
  ```

---

## 6. Critical Security & Integration Rule

> [!CAUTION]
> **NO DIRECT BLOCKCHAIN CALLS FROM FRONTEND:**  
> The client app **never** connects directly to blockchain RPCs, holds private keys, or signs smart contract transactions. All transactions (issuing CleanTO, staking, slashing, recording submission proofs) are triggered exclusively by the authenticated **Backend Service**. The frontend strictly interacts with the Backend REST API.
