# CleanTO Implementation Status — Review II Milestone (20%)

> **Project:** CleanTO — Verifiable Civic Environmental Remediation & Reward System  
> **Role:** Engineer B — Frontend & Blockchain  
> **Aesthetic Theme:** Warm Editorial Fintech (`#F7F5F0` warm white, `#171717` charcoal, `#E84C32` coral, `#66724B` olive)

---

## 1. Functional Now (20% Scope)

### A. Frontend Verification Pipeline (`/submit`)
- **Before & After Photo Uploads:** Interactive drag-and-drop or click file pickers with strict file validation (type check for images, 10MB size limit, distinct file check).
- **Live Image Previews:** Real thumbnail rendering with remove/replace controls.
- **Hardware Telemetry:** Browser Geolocation API lock (latitude, longitude, accuracy radius) and UTC timestamp capture.
- **`POST /submit` Integration:** Dispatches `multipart/form-data` matching the shared interface contract (`before`, `after`).
- **Scanning State:** Step-by-step progress animation displaying pipeline states (*"Checking image integrity"*, *"Computing perceptual hash"*, *"Scoring delta"*).
- **Result States:**
  - `PASS`: Olive verified stamp, similarity score bar, CleanTO reward credit, dashboard link.
  - `FAIL`: Coral red rejection stamp, explanation, retake suggestions.
  - `DUPLICATE`: Amber warning stamp, duplicate image explanation.
  - `ERROR`: Specific error alerts preserving user files and coordinates.
- **Isolated Adapter Toggle:** Defined in [frontend/src/api.js](file:///c:/Users/SAUMYA/Desktop/IDP-STARTUP/CleanTo/frontend/src/api.js):
  ```javascript
  export const USE_MOCK = false; // Toggle to false to connect to live backend on BACKEND_URL
  export const BACKEND_URL = "http://localhost:5000";
  ```
- **Demo Controls:** Unobtrusive bottom-left `[Demo Controls]` drawer allowing live switching of simulated AI outcomes (`pass`, `fail`, `duplicate`) without cluttering public UI.

### B. Blockchain Ledger Layer (`/blockchain`)
- **Contract:** [CleanTORewards.sol](file:///c:/Users/SAUMYA/Desktop/IDP-STARTUP/CleanTo/blockchain/contracts/CleanTORewards.sol) deployed on local EVM.
  - `recordCleanup(address user, uint256 score)`: Records verified cleanup, updates balance, and emits `CleanupRewardRecorded`.
  - `balanceOf(address user)`: Public view function.
  - Access control: Restricts minting exclusively to `owner` or `authorizedRecorder`. Rejects zero address and unauthorized callers.
- **Automated Tests:** [test/CleanTORewards.test.js](file:///c:/Users/SAUMYA/Desktop/IDP-STARTUP/CleanTo/blockchain/test/CleanTORewards.test.js) (6/6 tests passing).
- **Demo Script:** [scripts/demo.js](file:///c:/Users/SAUMYA/Desktop/IDP-STARTUP/CleanTo/blockchain/scripts/demo.js) (`npm run demo`) verifying deployment, unauthorized rejection, and authorized reward crediting.

---

## 2. Mocked Now (Interactive UI Shell)

These pages are fully interactive with responsive layouts, filters, tabs, search, modals, and Sonner toast notifications:

- **Landing Page (`/`):** Asymmetric editorial layout with physical evidence placard, olive inspection stamp, live impact stat counters (12,480 kg waste, 3,240 cleanups, 857 validators), 5-step sequence, and activity stream.
- **Contributor Wallet (`/dashboard`):** CleanTO balance counters, interactive **Recharts** monthly earnings curve, search bar, status filters (`All`, `Pass`, `Fail`, `Duplicate`), and interactive **Submission Dossier Modal** on row click.
- **Validator Desk (`/validator`):** Review queue with category tabs (`All`, `Suspicious`, `Low confidence`, `Duplicate risk`), side-by-side photo comparison, AI confidence meter, and working mock actions (**Approve**, **Reject**, **Request Evidence**) with Sonner toast feedback.
- **Redemption Marketplace (`/redeem`):** Category filter tabs, search bar, cost sorter (Low&rarr;High / High&rarr;Low), and interactive **Redemption Confirmation Modal** with live balance debit.
- **Architecture & Whitepaper (`/about`):** Plain-language explanation of voluntary cleanup failure, pHash deduplication, delta models, and DPoS economic guarantees.

---

## 3. Planned Later (Post-Review II)

- **Decentralized Storage:** Connecting file uploads directly to IPFS pinning services (Pinata/Infura) to generate immutable CIDs.
- **Fine-Tuned Segmentation Model:** Real-time IoU trash mask inference replacing first-pass mock.
- **DPoS Staking Contracts:** On-chain validator collateral deposit and automated slashing for proven-fraud approvals.
- **Municipal Integration:** City authority dashboard with priority cleanup zones and institutional voucher settlement.

---

## 4. Setup & Running Instructions

### Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Access at **http://localhost:3000** (or network address shown in terminal).

### Blockchain Demo
```bash
cd blockchain
npm install
npx hardhat test      # Runs automated unit tests
npm run demo          # Runs deployment and balance verification script
```
