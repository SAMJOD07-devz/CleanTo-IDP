"""
CleanTO AI Verification Service
===============================
Milestone: 20% IDP Milestone
Role: AI Engineer

Exposes check_duplicate and HashStore for backend integration.
"""

from .duplicate_detector import (
    check_duplicate,
    register_submission,
    HashStore,
    compute_hashes,
    get_embedding_engine
)

__all__ = [
    "check_duplicate",
    "register_submission",
    "HashStore",
    "compute_hashes",
    "get_embedding_engine"
]
