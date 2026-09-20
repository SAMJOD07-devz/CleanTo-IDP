# CleanTO — Permissioned Blockchain & Ledger Layer

> **Role Responsibility:** Engineer B (Frontend & Blockchain)  
> **Team:** CleanTO Innovative Design Project (IDP)  
> **Integration Partners:** Engineer A (Backend API & Submission Orchestration), Engineer C (AI Verification Service)

---

## 1. Context & Architectural Principles

CleanTO utilizes a blockchain layer to ensure tamper-proof, auditable accountability for environmental cleanups and reward point distributions without exposing the system to financial speculation or token farming.

### Core Architecture Principles:
1. **Permissioned / Hybrid Ledger (NOT a Public Chain):**
   - Implemented as a private/consortium EVM network (e.g., local Hardhat node, Hyperledger Besu, or private PoA testnet).
   - Eliminates volatile gas fees, front-running, and public speculation.
2. **Minimal On-Chain Footprint (Proof-Only Storage):**
   - Raw images are stored on **IPFS** (decentralized storage).
   - The ledger stores **only cryptographic proofs and transaction records**: user ID hash, before/after IPFS CIDs, AI/validator score, timestamp, geo-reference hash, and reward amount.
3. **Backend-Only Write Authorization (Strict Security):**
   - **Crucial Rule:** The smart contract write layer **only accepts calls from the authenticated backend service address** (`onlyBackend`).
   - The frontend client **never** holds private keys or submits transactions directly to the ledger.
4. **CleanTO Utility Point Model (Non-Cryptocurrency):**
   - CleanTO is an internal **utility reward point**, explicitly non-tradeable on open crypto exchanges.
   - Non-transferable between arbitrary wallets (soulbound / restricted transfer) — can only be earned via verified cleanups, staked for validation, or redeemed via partner catalogs.

---

## 2. Delegated Proof of Stake (DPoS) & Validator Governance

To prevent fraud and collusion while maintaining community governance:
- **Eligibility:** Users with verified cleanup milestones and high reputation can register as validators.
- **Collateral Staking:** Validators must lock a defined stake of CleanTO as collateral (`registerStake`).
- **Multi-Validator Consensus:** Each borderline submission requires approvals from multiple randomly chosen validators (assigned by the backend).
- **Slashing Mechanism:** If an approved cleanup is subsequently determined to be fraudulent:
  - The offending validator's stake is slashed (`applySlash`).
  - Slashed points are burned or redirected to the community pool.
  - Validator reputation score is decremented.

---

## 3. Ledger Interface Contract (Backend ↔ Blockchain)

The smart contract / ledger logic implements the following methods:

| Method Name | Caller | Purpose | Key Parameters | Return / Event |
| :--- | :--- | :--- | :--- | :--- |
| `recordSubmission` | Backend | Store immutable proof of verified cleanup | `bytes32 submissionId`, `bytes32 userId`, `string beforeCid`, `string afterCid`, `uint256 aiScore`, `uint256 timestamp`, `string geoRef` | Event `SubmissionRecorded` |
| `issueCleanTO` | Backend | Mint/credit reward points to contributor | `address/bytes32 userId`, `uint256 amount`, `bytes32 submissionId` | Event `CleanTOIssued` |
| `registerStake` | Backend | Lock validator collateral for DPoS eligibility | `address/bytes32 validatorId`, `uint256 amount` | Event `StakeRegistered` |
| `applySlash` | Backend | Penalize dishonest or negligent validator | `address/bytes32 validatorId`, `uint256 slashAmount`, `bytes32 submissionId`, `string reason` | Event `StakeSlashed` |
| `redeemPoints` | Backend | Debit CleanTO for catalog voucher | `address/bytes32 userId`, `uint256 amount`, `bytes32 offerId` | Event `PointsRedeemed` |
| `getSubmissionProof` | View (Any) | Retrieve submission audit trail | `bytes32 submissionId` | Submission struct data |
| `getBalance` | View (Any) | Query CleanTO balance of a user | `address/bytes32 userId` | `uint256 balance` |

---

## 4. Smart Contract Design Plan (Solidity / EVM)

When implementation begins, the contracts will be structured into:

1. **`CleanTOToken.sol`**:
   - ERC-20 compliant interface modified with transfer restrictions.
   - Only callable by `CleanTOLedger` or authorized backend minter.
   - Disables open peer-to-peer trading.
2. **`CleanTOLedger.sol`**:
   - Houses the submission registry mapping: `mapping(bytes32 => SubmissionProof)`.
   - Validator stake tracker: `mapping(address => ValidatorStake)`.
   - Access control via OpenZeppelin `AccessControl` (`BACKEND_ROLE`).
3. **Local Tooling:**
   - Hardhat development environment.
   - Comprehensive test suite testing: submission recording, minting, staking, and slash edge-cases.
