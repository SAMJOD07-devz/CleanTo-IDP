# CleanTO AI Verification Service (20% Milestone)

**Role:** AI Engineer  
**Milestone:** 20% Initial IDP Milestone  
**Lead:** Harshit Mishra (25BCE5013)  
**Deliverable:** Pre-trained Duplicate and Light-Manipulation Screening via Perceptual Hashing (pHash) & Visual Embeddings.

---

## 1. Overview & Purpose

In community waste cleanup incentivization systems, a major fraud vector is **submission reuse**:
1. **Identical Resubmission:** Uploading the exact same photo multiple times to farm rewards.
2. **Lightly Manipulated Duplicate:** Slightly cropping, rotating, adjusting brightness/contrast, or recompressing an existing photo to change the cryptographic hash (SHA-256) while visually keeping the same scene.
3. **Zero-Cleanup Attack:** Uploading the exact same photo as both "before" and "after".

This service implements **Perceptual Hashing (pHash & dHash)** and **visual embedding similarity** to detect these attacks before submissions are passed to the validator consensus or reward layers.

> **Note on Scope:** Fine-tuned YOLOv8 / TACO litter detection and transformation quantification models are explicitly scheduled for later milestones.

---

## 2. Architecture & Interface Contract

### Function Signature

```python
from duplicate_detector import check_duplicate

result = check_duplicate(
    before_path="path/to/before.jpg",
    after_path="path/to/after.jpg",
    hash_threshold=6,             # Maximum Hamming distance to consider a duplicate
    auto_register=False,          # Set True to store genuine submission hashes
    submission_id="SUBM_12345"    # Optional identifier for tracking
)
```

### Return Data Structure

```json
{
  "verdict": "pass" | "fail" | "duplicate",
  "similarity_score": 0.9503,
  "is_duplicate": false,
  "duplicate_reason": null,
  "before_phash": "901a18989cb79f9f",
  "after_phash": "909058989cbf9d9f",
  "before_dhash": "b8a8ecaef4d8cad0",
  "after_dhash": "b8a8eceeecdad470",
  "before_after_phash_distance": 6,
  "matches": [],
  "details": {
    "hash_threshold": 6,
    "embedding_backend": "vision-feature-embedding",
    "total_store_records": 1
  }
}
```

---

## 3. How Duplicate Detection Works

1. **Perceptual Hash Computation:**
   - Both images are converted to 64-bit DCT perceptual hashes (`pHash`) and gradient difference hashes (`dHash`).
   - Small edits (JPEG compression, $\pm 5\%$ crop, brightness/contrast adjustments) leave the hash largely unchanged (Hamming distance $\le 6$).
2. **Internal Consistency Check:**
   - Verifies that `before_phash != after_phash` (protects against zero-cleanup fraud where the same photo is uploaded twice).
3. **Historical Database Query (`HashStore`):**
   - Checks both hashes against previously accepted submissions stored in `submission_hashes.json` (or in-memory).
   - If Hamming distance $\le \text{hash\_threshold}$, flags as `verdict: "duplicate"`.
4. **Visual Embedding Similarity (Second Signal):**
   - Generates normalized feature embeddings to score visual consistency between before and after images.
   - Automatically utilizes `open_clip` or `sentence-transformers` (`clip-ViT-B-32`) when PyTorch is present, with an automated spatial vision embedding fallback for lightweight environments.

---

## 4. Test Image Suite & Demo

The `sample_images/` directory contains verified test images demonstrating the 3 key scenarios:

| Test Case | Before Image | After Image | Expected Verdict |
| :--- | :--- | :--- | :--- |
| **Case 1: Genuine Unique Pair** | `genuine_before.jpg` | `genuine_after.jpg` | `pass` (`is_duplicate: false`) |
| **Case 2: Exact Duplicate** | `exact_dup_before.jpg` | `exact_dup_after.jpg` | `duplicate` (`distance: 0`) |
| **Case 3: Lightly Edited Duplicate** | `edited_dup_before.jpg` (cropped + brightened) | `genuine_after.jpg` | `duplicate` (`distance <= 8`) |
| **Case 4: Zero-Cleanup Attack** | `genuine_before.jpg` | `genuine_before.jpg` | `duplicate` (`distance: 0`) |

### Running the Demo Test Suite

```bash
python test_duplicate_detector.py
```

---

## 5. Integration Guide for Backend Teammate

Backend teammates can directly import the module:

```python
import sys
sys.path.append("../ai-service")
from duplicate_detector import check_duplicate, register_submission

# During submission intake:
verification = check_duplicate(before_image_path, after_image_path)

if verification["verdict"] == "duplicate":
    # Reject submission and notify user
    return {"status": "rejected", "reason": verification["duplicate_reason"]}
elif verification["verdict"] == "pass":
    # Proceed to IPFS pinning & validator workflow
    ...
    # Once validated, register into the hash store:
    register_submission(submission_id, before_image_path, after_image_path)
```
