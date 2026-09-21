"""
CleanTO AI Verification Service - Test Suite & Verification Demo
================================================================
Milestone: 20% IDP Milestone
Role: AI Engineer

This script tests and demonstrates:
1. Genuine, unique before/after pair -> should PASS (verdict: "pass")
2. Exact duplicate resubmission -> should be FLAGGED (verdict: "duplicate", distance = 0)
3. Lightly edited / cropped duplicate -> should be CAUGHT by perceptual hash (verdict: "duplicate")
4. Identical before/after edge case -> should be FLAGGED (verdict: "duplicate")
"""

import os
import sys
import json
from pathlib import Path

# Add current directory to path
current_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(current_dir))

from duplicate_detector import check_duplicate, HashStore, register_submission, compute_hashes


def run_demo():
    print("=" * 80)
    print("CleanTO AI Service - Duplicate Detection & Verification Demo (20% Milestone)")
    print("=" * 80)

    sample_dir = current_dir / "sample_images"
    test_store_path = current_dir / "test_submission_hashes.json"

    # Clean up test store if existing
    if test_store_path.exists():
        test_store_path.unlink()

    store = HashStore(filepath=test_store_path)

    genuine_before = sample_dir / "genuine_before.jpg"
    genuine_after = sample_dir / "genuine_after.jpg"
    exact_dup_before = sample_dir / "exact_dup_before.jpg"
    exact_dup_after = sample_dir / "exact_dup_after.jpg"
    edited_dup_before = sample_dir / "edited_dup_before.jpg"
    edited_dup_after = sample_dir / "edited_dup_after.jpg"

    # Verify all sample files exist
    for p in [genuine_before, genuine_after, exact_dup_before, exact_dup_after, edited_dup_before, edited_dup_after]:
        if not p.exists():
            print(f"[ERROR] Sample image missing: {p}")
            return False

    print("\n[STEP 0] Inspecting Generated Sample Image Perceptual Hashes:")
    p_gb, d_gb, _ = compute_hashes(genuine_before)
    p_ga, d_ga, _ = compute_hashes(genuine_after)
    p_eb, d_eb, _ = compute_hashes(edited_dup_before)
    print(f"  • Genuine Before pHash: {p_gb} | dHash: {d_gb}")
    print(f"  • Genuine After  pHash: {p_ga} | dHash: {d_ga}")
    print(f"  • Edited Before  pHash: {p_eb} | dHash: {d_eb}")
    print(f"  • Distance (Genuine Before vs Edited Dup Before): pHash dist = {p_gb - p_eb}, dHash dist = {d_gb - d_eb}")

    # -------------------------------------------------------------
    # DEMO CASE 1: Genuine, Unique Submission
    # -------------------------------------------------------------
    print("\n" + "-" * 80)
    print("DEMO CASE 1: Genuine, Unique Before/After Pair")
    print("Description: Contributor uploads a real cleanup pair that has never been seen.")
    print("Expected: verdict == 'pass', is_duplicate == False")
    print("-" * 80)

    res1 = check_duplicate(
        before_path=genuine_before,
        after_path=genuine_after,
        hash_threshold=6,
        store=store,
        auto_register=True,
        submission_id="SUBM_GENUINE_001"
    )

    print("Result:")
    print(json.dumps(res1, indent=2))
    assert res1["verdict"] == "pass", f"Expected 'pass', got {res1['verdict']}"
    assert res1["is_duplicate"] is False, "Expected is_duplicate == False"
    print(">>> SUCCESS: Genuine pair successfully PASSED and registered into HashStore.")

    # -------------------------------------------------------------
    # DEMO CASE 2: Exact Duplicate Resubmission
    # -------------------------------------------------------------
    print("\n" + "-" * 80)
    print("DEMO CASE 2: Exact Duplicate Resubmission")
    print("Description: Contributor attempts to resubmit the exact same images for a new claim.")
    print("Expected: verdict == 'duplicate', is_duplicate == True, distance == 0")
    print("-" * 80)

    res2 = check_duplicate(
        before_path=exact_dup_before,
        after_path=exact_dup_after,
        hash_threshold=6,
        store=store,
        submission_id="SUBM_EXACT_DUP_002"
    )

    print("Result:")
    print(json.dumps(res2, indent=2))
    assert res2["verdict"] == "duplicate", f"Expected 'duplicate', got {res2['verdict']}"
    assert res2["is_duplicate"] is True, "Expected is_duplicate == True"
    assert any(m["distance"] == 0 for m in res2["matches"]), "Expected exact match with distance 0"
    print(">>> SUCCESS: Exact duplicate correctly FLAGGED and REJECTED.")

    # -------------------------------------------------------------
    # DEMO CASE 3: Lightly Edited / Cropped Duplicate
    # -------------------------------------------------------------
    print("\n" + "-" * 80)
    print("DEMO CASE 3: Lightly Edited / Cropped Duplicate")
    print("Description: Contributor cropped borders, adjusted brightness/contrast, and recompressed.")
    print("             Standard SHA-256 hash completely fails to catch this.")
    print("Expected: verdict == 'duplicate', is_duplicate == True, caught via perceptual hash")
    print("-" * 80)

    # Note: threshold can be set between 6 and 10 depending on sensitivity policy
    res3 = check_duplicate(
        before_path=edited_dup_before,
        after_path=genuine_after,
        hash_threshold=8,
        store=store,
        submission_id="SUBM_EDITED_DUP_003"
    )

    print("Result:")
    print(json.dumps(res3, indent=2))
    assert res3["verdict"] == "duplicate", f"Expected 'duplicate', got {res3['verdict']}"
    assert res3["is_duplicate"] is True, "Expected is_duplicate == True"
    print(">>> SUCCESS: Lightly edited duplicate caught by perceptual hash!")

    # -------------------------------------------------------------
    # DEMO CASE 4: Zero-Cleanup Attack (Before == After)
    # -------------------------------------------------------------
    print("\n" + "-" * 80)
    print("DEMO CASE 4: Zero-Cleanup Staged Attack (Before and After are identical)")
    print("Description: Contributor uploads the same photo for both before and after.")
    print("Expected: verdict == 'duplicate', before_after_phash_distance == 0")
    print("-" * 80)

    res4 = check_duplicate(
        before_path=genuine_before,
        after_path=genuine_before,
        hash_threshold=6,
        store=store,
        submission_id="SUBM_ZERO_CLEANUP_004"
    )

    print("Result:")
    print(json.dumps(res4, indent=2))
    assert res4["verdict"] == "duplicate", f"Expected 'duplicate', got {res4['verdict']}"
    assert res4["before_after_phash_distance"] == 0, "Expected distance == 0"
    print(">>> SUCCESS: Zero-cleanup submission correctly identified and caught.")

    # Clean up test store
    if test_store_path.exists():
        test_store_path.unlink()

    print("\n" + "=" * 80)
    print("ALL 4 DEMO TEST CASES PASSED SUCCESSFULLY!")
    print("=" * 80)
    return True


if __name__ == "__main__":
    success = run_demo()
    sys.exit(0 if success else 1)
