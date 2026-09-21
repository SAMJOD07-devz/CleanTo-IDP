# CleanTO — Permissioned Blockchain & Ledger Layer (PRD v1.0 Aligned)

> **Role Responsibility:** Engineer B (Frontend & Blockchain)  
> **Project:** CleanTO Ecosystem — AI-Powered Waste Cleanup Verification and Blockchain Reward System  
> **Team:** Saumya GauravKumar Pandya (25BCE5069), Vaibhav Bisaria (25BCE1975), Harshit Mishra (25BCE5013)  
> **Integration Partners:** Engineer A (Backend Submission & Staking Orchestrator), Engineer C (AI Verification Service)

---

## 1. Overview & PRD Alignment

CleanTO implements an immutable, auditable, and decentralized consensus layer to solve voluntary cleanup verification fraud without relying on volatile public crypto networks.

### Core Architectural Mandates (PRD §3, §5, §10):
1. **Permissioned / Hybrid Blockchain:**
   - Deployed on a private/consortium EVM ledger (e.g., local Hardhat EVM, Hyperledger Besu, or private PoA testnet).
   - Publicly readable/auditable for municipal partners, NGOs, and auditors.
   - **Write-restricted:** Only authenticated backend service addresses possess the `BACKEND_ROLE` to execute state-changing transactions.
2. **Proof-Only Storage Model:**
   - Large assets (before/after image binaries) reside on **IPFS** via content identifiers (CIDs).
   - On-chain storage records strictly metadata proofs: `submission_id`, `user_id`, `before_CID`, `after_CID`, `AI_score`, timestamps, geohash reference, and issued reward amount.
3. **Utility Reward Model (CleanTO):**
   - CleanTO is an internal utility reward unit, **NOT** a speculative cryptocurrency or freely tradeable open asset.
   - Smart contracts enforce transfer restrictions (non-transferable peer-to-peer / soulbound to user profile) — it can only be minted via verified cleanups, staked for DPoS validation, or burned/debited for partner catalogue redemptions.

---

## 2. Functional Requirements Breakdown (PRD Mapping)

| PRD ID | Requirement | Priority | Smart Contract Implementation |
| :--- | :--- | :--- | :--- |
| **FR-7** | Validator Staking & Eligibility | **Must** | `registerStake(address validator, uint256 amount)`: Locks CleanTO in escrow contract as collateral before the validator can participate in review pools. |
| **FR-8** | Validator Slashing & Penalties | **Must** | `applySlash(address validator, uint256 slashAmount, bytes32 submissionId, string reason)`: Deducts collateral stake upon proven collusion or fraudulent approval; emits auditable slash event. |
| **FR-9** | Immutable Submission Proof Recording | **Must** | `recordSubmission(...)`: Writes cryptographic cleanup proof linking contributor ID, IPFS CIDs, AI transformation score, GPS reference, and approval timestamp. |
| **FR-10** | CleanTO Issuance Logic | **Must** | `issueCleanTO(address contributor, uint256 amount, bytes32 submissionId)`: Mints/credits utility points calculated from the cleanup score directly to user's ledger account. |
| **Audit** | Public & Municipal Auditability | **Non-Func** | Read-only view functions (`getSubmissionProof`, `getValidatorHistory`, `getAuditTrail`) allowing external stakeholders to verify cleanup legitimacy without write access. |

---

## 3. Data Structures (PRD §9 Alignment)

### Submission Proof Struct
```solidity
struct SubmissionProof {
    bytes32 submissionId;      // Unique UUID hash
    address contributor;       // Contributor address/identifier
    string beforeCID;          // IPFS CID of before cleanup photo
    string afterCID;           // IPFS CID of after cleanup photo
    uint256 aiScore;           // Transformation score (0-100 scaled)
    uint256 timeBefore;        // Capture timestamp before (Unix epoch)
    uint256 timeAfter;         // Capture timestamp after (Unix epoch)
    bytes32 geoHash;           // Geohash or location reference hash
    uint256 rewardAmount;      // CleanTO credited
    uint8 status;              // 0: Pending, 1: Verified, 2: Rejected, 3: Fraudulent
}
```

### Validator Stake Struct (DPoS)
```solidity
struct ValidatorStake {
    uint256 activeStake;       // CleanTO currently locked as collateral
    uint256 totalValidations;  // Number of reviews completed
    uint256 slashCount;        // Times penalized for fraudulent approvals
    bool isEligible;           // Eligibility flag based on reputation & stake threshold
}
```

---

## 4. Smart Contract Architecture (Solidity / EVM)

The blockchain layer comprises two coordinated smart contracts:

```text
blockchain/
├── contracts/
│   ├── CleanTOToken.sol      # Restricted-transfer ERC-20 utility point contract
│   └── CleanTOLedger.sol     # Core registry for submissions, DPoS staking & slashing
├── scripts/
│   ├── deploy.js             # Deployment script for local/consortium EVM node
│   └── seed_validators.js    # Script to seed initial validator pool (PRD §10)
├── test/
│   ├── CleanTOToken.test.js  # Mint, burn, transfer-restriction test suite
│   └── CleanTOLedger.test.js # Submission audit, staking, and slash tests
└── hardhat.config.js         # Network configuration (Private PoA / Hardhat Node)
```

### Contract Responsibilities:
1. **`CleanTOToken.sol`:**
   - Modified token standard where transfer functions (`transfer`, `transferFrom`) are disabled for arbitrary accounts.
   - Only authorized contracts (`CleanTOLedger`) or authenticated minters (`BACKEND_ROLE`) can invoke `mint()`, `burn()`, or `redeem()`.
2. **`CleanTOLedger.sol`:**
   - Manages submission registry: `mapping(bytes32 => SubmissionProof) public submissions;`
   - Manages validator collateral: `mapping(address => ValidatorStake) public validatorStakes;`
   - Implements `onlyBackend` modifier to reject any direct client-side write calls.
   - Emits structured events for backend indexers:
     - `event SubmissionRecorded(bytes32 indexed submissionId, address indexed contributor, uint256 rewardAmount);`
     - `event StakeRegistered(address indexed validator, uint256 amount);`
     - `event ValidatorSlashed(address indexed validator, uint256 slashAmount, bytes32 indexed submissionId, string reason);`

---

## 5. Ledger Interface Contract (Backend ↔ Blockchain)

| Function | Access | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `recordSubmission` | `onlyBackend` | `bytes32 submissionId, address contributor, string beforeCid, string afterCid, uint256 aiScore, uint256 timeBefore, uint256 timeAfter, bytes32 geoHash, uint256 rewardAmount` | Stores immutable proof on ledger. |
| `issueCleanTO` | `onlyBackend` | `address contributor, uint256 amount, bytes32 submissionId` | Credits CleanTO utility points. |
| `registerStake` | `onlyBackend` | `address validator, uint256 amount` | Locks CleanTO collateral for validator eligibility. |
| `applySlash` | `onlyBackend` | `address validator, uint256 slashAmount, bytes32 submissionId, string reason` | Slashes validator stake upon verified collusion/fraud. |
| `redeemPoints` | `onlyBackend` | `address user, uint256 amount, bytes32 offerId` | Burns/debits points upon catalog voucher redemption. |
| `getSubmissionProof` | `view` (Public) | `bytes32 submissionId` | Returns complete submission audit trail. |
| `getBalance` | `view` (Public) | `address user` | Returns user's active CleanTO balance. |

---

## 6. Development & Deployment Guidelines

- **Environment:** Node.js v24+, Hardhat local node (`npx hardhat node`).
- **Initial Validator Seeding (PRD §10):** A dedicated migration script will initialize the initial seed pool of trusted validator addresses before organic reputation kicks in.
- **Strict Constraint Reminder:** Do not deploy to public Ethereum Mainnet or testnets where CleanTO can be listed or traded. Maintain a zero-gas, private/permissioned topology.
