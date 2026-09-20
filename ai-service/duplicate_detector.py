"""
CleanTO AI Verification Service - Duplicate & Fraud Detection Module
====================================================================
Milestone: 20% IDP Milestone
Role: AI Engineer

This module provides perceptual hashing (pHash) and pretrained embedding similarity
checks to detect duplicate and lightly manipulated cleanup photo submissions.

Core Capabilities:
1. Perceptual Hashing (pHash & dHash) via `imagehash`
2. Simple file-backed / in-memory HashStore for previously verified submissions
3. Pretrained embedding similarity (CLIP with graceful fallback to multi-channel vision embedding)
4. Returns standardized interface contract:
   {"verdict": "pass" | "fail" | "duplicate", "similarity_score": float, ...}
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple, Union
from PIL import Image
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CleanTO.DuplicateDetector")

# Try importing imagehash
try:
    import imagehash
except ImportError:
    raise ImportError("The 'imagehash' package is required. Install via: pip install imagehash")


# =====================================================================
# 1. Embedding Engine (Pretrained CLIP / Feature Similarity)
# =====================================================================

class EmbeddingEngine:
    """
    Computes visual embedding similarity between two images.
    Prioritizes pretrained CLIP models (sentence-transformers / open_clip / transformers).
    Provides a deterministic multi-channel spatial vision embedding fallback if torch is unavailable.
    """

    def __init__(self):
        self.backend = None
        self.model = None
        self.preprocess = None
        self._initialize_backend()

    def _initialize_backend(self):
        # 1. Try sentence-transformers (clip-ViT-B-32)
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("clip-ViT-B-32")
            self.backend = "sentence-transformers-clip"
            logger.info("Initialized CLIP via sentence-transformers (clip-ViT-B-32)")
            return
        except Exception:
            pass

        # 2. Try open_clip
        try:
            import open_clip
            import torch
            model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='openai')
            model.eval()
            self.model = model
            self.preprocess = preprocess
            self.backend = "open-clip"
            logger.info("Initialized CLIP via open_clip (ViT-B-32)")
            return
        except Exception:
            pass

        # 3. Try transformers (CLIPVisionModelWithProjection)
        try:
            from transformers import CLIPProcessor, CLIPModel
            self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            self.preprocess = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            self.backend = "transformers-clip"
            logger.info("Initialized CLIP via huggingface transformers")
            return
        except Exception:
            pass

        # 4. Fallback: Multi-scale spatial color & gradient descriptor
        self.backend = "vision-feature-embedding"
        logger.info("Initialized standard vision feature embedding fallback")

    def get_embedding(self, image: Image.Image) -> np.ndarray:
        """Extract a normalized 1D feature embedding vector from a PIL Image."""
        if self.backend == "sentence-transformers-clip":
            vec = self.model.encode(image, show_progress_bar=False)
            norm = np.linalg.norm(vec)
            return vec / (norm + 1e-9)

        elif self.backend == "open-clip":
            import torch
            tensor = self.preprocess(image).unsqueeze(0)
            with torch.no_grad():
                feat = self.model.encode_image(tensor)
                feat = feat / feat.norm(dim=-1, keepdim=True)
            return feat.squeeze(0).cpu().numpy()

        elif self.backend == "transformers-clip":
            import torch
            inputs = self.preprocess(images=image, return_tensors="pt")
            with torch.no_grad():
                out = self.model.get_image_features(**inputs)
                feat = out / out.norm(dim=-1, keepdim=True)
            return feat.squeeze(0).cpu().numpy()

        else:
            # High-resolution spatial-color-gradient embedding
            img_resized = image.convert("RGB").resize((128, 128))
            arr = np.asarray(img_resized, dtype=np.float32) / 255.0

            # Spatial grid cells (4x4 = 16 cells)
            grid_h, grid_w = 32, 32
            features = []
            for r in range(4):
                for c in range(4):
                    cell = arr[r*grid_h:(r+1)*grid_h, c*grid_w:(c+1)*grid_w]
                    # Mean and std across channels
                    features.extend(cell.mean(axis=(0, 1)))
                    features.extend(cell.std(axis=(0, 1)))

            # Image-wide color histogram (32 bins per channel)
            for ch in range(3):
                hist, _ = np.histogram(arr[:, :, ch], bins=32, range=(0.0, 1.0), density=True)
                features.extend(hist)

            vec = np.array(features, dtype=np.float32)
            norm = np.linalg.norm(vec)
            return vec / (norm + 1e-9)

    def compute_similarity(self, img1: Image.Image, img2: Image.Image) -> float:
        """Compute cosine similarity between two PIL images (range [0.0, 1.0])."""
        emb1 = self.get_embedding(img1)
        emb2 = self.get_embedding(img2)
        cos_sim = float(np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2) + 1e-9))
        return round(float(np.clip(cos_sim, 0.0, 1.0)), 4)


# Global singleton instance for efficient reuse across calls
_EMBEDDING_ENGINE = None

def get_embedding_engine() -> EmbeddingEngine:
    global _EMBEDDING_ENGINE
    if _EMBEDDING_ENGINE is None:
        _EMBEDDING_ENGINE = EmbeddingEngine()
    return _EMBEDDING_ENGINE


# =====================================================================
# 2. Perceptual Hash Store (File-Backed or In-Memory)
# =====================================================================

DEFAULT_STORE_FILE = Path(__file__).parent / "submission_hashes.json"

class HashStore:
    """
    Lightweight store for perceptual hashes of approved submissions.
    Supports in-memory operations and optional JSON persistence.
    """

    def __init__(self, filepath: Optional[Union[str, Path]] = DEFAULT_STORE_FILE):
        self.filepath = Path(filepath) if filepath else None
        self.records: List[Dict[str, Any]] = []
        self.load()

    def load(self):
        """Load records from JSON file if available."""
        if self.filepath and self.filepath.exists():
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    self.records = json.load(f)
                logger.info("Loaded %d records from %s", len(self.records), self.filepath)
            except Exception as e:
                logger.warning("Could not read hash store %s: %s", self.filepath, e)
                self.records = []
        else:
            self.records = []

    def save(self):
        """Persist records to JSON file."""
        if self.filepath:
            try:
                self.filepath.parent.mkdir(parents=True, exist_ok=True)
                with open(self.filepath, "w", encoding="utf-8") as f:
                    json.dump(self.records, f, indent=2)
            except Exception as e:
                logger.error("Failed to save hash store: %s", e)

    def clear(self):
        """Reset all records."""
        self.records = []
        self.save()

    def add_submission(
        self,
        submission_id: str,
        before_phash: str,
        after_phash: str,
        before_dhash: Optional[str] = None,
        after_dhash: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Register a verified cleanup submission with its image hashes."""
        record = {
            "submission_id": submission_id,
            "before_phash": str(before_phash),
            "after_phash": str(after_phash),
            "before_dhash": str(before_dhash) if before_dhash else None,
            "after_dhash": str(after_dhash) if after_dhash else None,
            "metadata": metadata or {}
        }
        self.records.append(record)
        self.save()
        logger.info("Registered submission %s in HashStore", submission_id)

    def find_duplicate(
        self,
        target_phash: imagehash.ImageHash,
        target_dhash: Optional[imagehash.ImageHash] = None,
        max_distance: int = 6
    ) -> List[Dict[str, Any]]:
        """
        Search for existing hashes within Hamming distance threshold.
        Returns a list of match records with distance and confidence.
        """
        matches = []
        for rec in self.records:
            # Check before image
            rec_before = imagehash.hex_to_hash(rec["before_phash"])
            dist_before = target_phash - rec_before
            if dist_before <= max_distance:
                matches.append({
                    "submission_id": rec["submission_id"],
                    "matched_role": "before",
                    "matched_hash": rec["before_phash"],
                    "distance": int(dist_before),
                    "match_type": "exact" if dist_before == 0 else "near_duplicate"
                })

            # Check after image
            rec_after = imagehash.hex_to_hash(rec["after_phash"])
            dist_after = target_phash - rec_after
            if dist_after <= max_distance:
                matches.append({
                    "submission_id": rec["submission_id"],
                    "matched_role": "after",
                    "matched_hash": rec["after_phash"],
                    "distance": int(dist_after),
                    "match_type": "exact" if dist_after == 0 else "near_duplicate"
                })

        return matches


# =====================================================================
# 3. Core Verification Functions
# =====================================================================

def compute_hashes(img_or_path: Union[str, Path, Image.Image]) -> Tuple[imagehash.ImageHash, imagehash.ImageHash, Image.Image]:
    """Compute both pHash and dHash for a given image path or PIL image."""
    if isinstance(img_or_path, (str, Path)):
        img = Image.open(img_or_path).convert("RGB")
    elif isinstance(img_or_path, Image.Image):
        img = img_or_path.convert("RGB")
    else:
        raise ValueError(f"Unsupported image type: {type(img_or_path)}")

    p_hash = imagehash.phash(img)
    d_hash = imagehash.dhash(img)
    return p_hash, d_hash, img


def check_duplicate(
    before_path: Union[str, Path],
    after_path: Union[str, Path],
    hash_threshold: int = 6,
    store: Optional[HashStore] = None,
    store_path: Optional[Union[str, Path]] = DEFAULT_STORE_FILE,
    auto_register: bool = False,
    submission_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Check if either the 'before' or 'after' image has been submitted previously (duplicate check),
    and compute visual embedding similarity between the before and after image.

    Args:
        before_path: Filepath to the 'before cleanup' photo.
        after_path: Filepath to the 'after cleanup' photo.
        hash_threshold: Maximum Hamming distance to consider a match a duplicate (default: 6).
        store: Optional pre-instantiated HashStore object.
        store_path: Path to JSON hash store (used if store is not provided).
        auto_register: If True and verdict == 'pass', automatically register the hashes in the store.
        submission_id: Unique ID for this submission (generated if not provided).

    Returns:
        A dictionary following the agreed interface contract:
        {
            "verdict": "pass" | "fail" | "duplicate",
            "similarity_score": float,
            "is_duplicate": bool,
            "duplicate_reason": Optional[str],
            "before_phash": str,
            "after_phash": str,
            "before_dhash": str,
            "after_dhash": str,
            "before_after_phash_distance": int,
            "matches": List[Dict[str, Any]],
            "details": Dict[str, Any]
        }
    """
    before_p = Path(before_path)
    after_p = Path(after_path)

    # Validate file existence
    if not before_p.exists():
        return {
            "verdict": "fail",
            "similarity_score": 0.0,
            "is_duplicate": False,
            "duplicate_reason": f"Before image file not found: {before_path}",
            "matches": [],
            "details": {"error": "file_not_found", "path": str(before_path)}
        }
    if not after_p.exists():
        return {
            "verdict": "fail",
            "similarity_score": 0.0,
            "is_duplicate": False,
            "duplicate_reason": f"After image file not found: {after_path}",
            "matches": [],
            "details": {"error": "file_not_found", "path": str(after_path)}
        }

    # 1. Compute perceptual hashes
    try:
        before_phash, before_dhash, before_img = compute_hashes(before_p)
        after_phash, after_dhash, after_img = compute_hashes(after_p)
    except Exception as e:
        return {
            "verdict": "fail",
            "similarity_score": 0.0,
            "is_duplicate": False,
            "duplicate_reason": f"Failed to decode images: {e}",
            "matches": [],
            "details": {"error": "image_decode_error", "exception": str(e)}
        }

    # 2. Check internal consistency (before and after must not be identical images!)
    before_after_dist = before_phash - after_phash
    if before_after_dist == 0:
        return {
            "verdict": "duplicate",
            "similarity_score": 1.0,
            "is_duplicate": True,
            "duplicate_reason": "Before and After photos are identical (zero cleanup occurred).",
            "before_phash": str(before_phash),
            "after_phash": str(after_phash),
            "before_dhash": str(before_dhash),
            "after_dhash": str(after_dhash),
            "before_after_phash_distance": int(before_after_dist),
            "matches": [{
                "target": "after_matches_before",
                "distance": 0,
                "match_type": "exact_identical_pair"
            }],
            "details": {"flag": "before_equals_after"}
        }

    # 3. Query HashStore for duplicates against prior submissions
    if store is None:
        store = HashStore(filepath=store_path)

    before_matches = store.find_duplicate(before_phash, before_dhash, max_distance=hash_threshold)
    after_matches = store.find_duplicate(after_phash, after_dhash, max_distance=hash_threshold)

    all_matches = []
    duplicate_reasons = []

    for m in before_matches:
        all_matches.append({"target": "before", **m})
        duplicate_reasons.append(
            f"Before image matches prior submission '{m['submission_id']}' "
            f"({m['match_type']}, Hamming distance: {m['distance']})"
        )

    for m in after_matches:
        all_matches.append({"target": "after", **m})
        duplicate_reasons.append(
            f"After image matches prior submission '{m['submission_id']}' "
            f"({m['match_type']}, Hamming distance: {m['distance']})"
        )

    # 4. Pretrained Embedding Similarity (Signal 2)
    engine = get_embedding_engine()
    similarity_score = engine.compute_similarity(before_img, after_img)

    is_duplicate = len(all_matches) > 0

    if is_duplicate:
        verdict = "duplicate"
        duplicate_reason = "; ".join(duplicate_reasons)
    else:
        verdict = "pass"
        duplicate_reason = None
        # If auto_register is requested, save this genuine submission
        if auto_register:
            sub_id = submission_id or f"sub_{int(Path(before_path).stat().st_mtime)}"
            store.add_submission(
                submission_id=sub_id,
                before_phash=str(before_phash),
                after_phash=str(after_phash),
                before_dhash=str(before_dhash),
                after_dhash=str(after_dhash)
            )

    return {
        "verdict": verdict,
        "similarity_score": similarity_score,
        "is_duplicate": is_duplicate,
        "duplicate_reason": duplicate_reason,
        "before_phash": str(before_phash),
        "after_phash": str(after_phash),
        "before_dhash": str(before_dhash),
        "after_dhash": str(after_dhash),
        "before_after_phash_distance": int(before_after_dist),
        "matches": all_matches,
        "details": {
            "hash_threshold": hash_threshold,
            "embedding_backend": engine.backend,
            "total_store_records": len(store.records)
        }
    }


def register_submission(
    submission_id: str,
    before_path: Union[str, Path],
    after_path: Union[str, Path],
    store_path: Optional[Union[str, Path]] = DEFAULT_STORE_FILE,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Convenience helper to record a verified submission in the hash store."""
    before_phash, before_dhash, _ = compute_hashes(before_path)
    after_phash, after_dhash, _ = compute_hashes(after_path)

    store = HashStore(filepath=store_path)
    store.add_submission(
        submission_id=submission_id,
        before_phash=str(before_phash),
        after_phash=str(after_phash),
        before_dhash=str(before_dhash),
        after_dhash=str(after_dhash),
        metadata=metadata
    )
    return {
        "status": "success",
        "submission_id": submission_id,
        "before_phash": str(before_phash),
        "after_phash": str(after_phash)
    }
