/**
 * CleanTO - Frontend API Service (30% Milestone)
 * ==============================================
 * Role: Frontend & Blockchain Engineer
 *
 * Interface Contract (30% Milestone):
 * - POST /submit (multipart/form-data: `before`, `after`, optional `user_id`)
 *   Returns: {
 *     "submission_id": string,
 *     "verdict": "pass" | "fail_duplicate" | "fail_location_mismatch" | "flagged_review" | "approved_by_validator",
 *     "similarity_score": number,
 *     "cleanup_score": number,
 *     "tx_hash": string | null,
 *     "reward_amount": number | null
 *   }
 * - GET /submissions/{id} - Returns submission details + cleanup_score
 * - GET /submissions - Returns list of recent submissions
 * - GET /validator/queue - Returns { count, queue: [...] } submissions with verdict "flagged_review"
 * - POST /validator/review - Body: { "submission_id": string, "decision": "approve" | "reject" }
 * - GET /users/{id}/balance - Returns { balance, cleanup_count, user_id }
 */

export const BACKEND_URL = "http://localhost:5000";

// Fallback queue items for offline testing if backend is not running
const FALLBACK_QUEUE = [
  {
    submission_id: "sub_flagged_101",
    user_id: "usr_demo",
    verdict: "flagged_review",
    similarity_score: 64.2,
    cleanup_score: 38.5,
    location: "Riverbank Sector 4 (12.9716° N, 79.1585° E)",
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    before_path: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80",
    after_path: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    flag_reason: "Borderline spatial similarity (64.2%) — potential angle variance requires peer verification.",
  },
  {
    submission_id: "sub_flagged_102",
    user_id: "usr_ecowarrior",
    verdict: "flagged_review",
    similarity_score: 58.7,
    cleanup_score: 42.0,
    location: "North Commons Promenade (12.9722° N, 79.1592° E)",
    created_at: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    before_path: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    after_path: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    flag_reason: "Low residual clutter change (cleanup_score 42.0%) — manual confirmation needed.",
  },
];

/**
 * Submit cleanup photo pair for AI verification and blockchain reward
 * @param {File} beforeFile - The before cleanup image file
 * @param {File} afterFile - The after cleanup image file
 * @param {string|null} [devOverride=null] - Optional dev-panel scenario override
 * @param {string} [userId='usr_demo'] - User identifier
 * @returns {Promise<{submission_id: string, verdict: string, similarity_score: number, cleanup_score: number, tx_hash?: string}>}
 */
export async function submitCleanup(beforeFile, afterFile, devOverride = null, userId = "usr_demo") {
  // If explicitly requested via the hidden dev panel override
  if (devOverride) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const scores = {
      pass: { similarity: 88.5, cleanup: 82.0 },
      fail_duplicate: { similarity: 99.4, cleanup: 0.0 },
      fail_location_mismatch: { similarity: 31.2, cleanup: 15.0 },
      flagged_review: { similarity: 62.4, cleanup: 45.0 },
      approved_by_validator: { similarity: 62.4, cleanup: 65.0 },
    };
    const s = scores[devOverride] || { similarity: 75.0, cleanup: 70.0 };
    return {
      submission_id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      verdict: devOverride,
      similarity_score: s.similarity,
      cleanup_score: s.cleanup,
      created_at: new Date().toISOString(),
      _dev_override: true,
    };
  }

  // --- Real Backend API Call (POST /submit) ---
  const formData = new FormData();
  formData.append("before", beforeFile);
  formData.append("after", afterFile);
  formData.append("user_id", userId);

  try {
    const response = await fetch(`${BACKEND_URL}/submit`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `Backend returned ${response.status}`;
      try {
        const parsed = JSON.parse(errText);
        errMsg = parsed.error || parsed.message || errMsg;
      } catch (e) {
        // fallback
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    console.log("[CleanTO API] POST /submit response:", data);
    return data;
  } catch (err) {
    console.warn(`[CleanTO API] Failed to reach live backend at ${BACKEND_URL}:`, err.message);
    console.warn("[CleanTO API] Simulating real contract response for offline preview.");

    // Offline fallback for demo resiliency
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      submission_id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      verdict: "pass",
      similarity_score: 87.5,
      cleanup_score: 79.0,
      created_at: new Date().toISOString(),
      _offline_fallback: true,
    };
  }
}

/**
 * Fetch human reviewer queue: GET /validator/queue
 * @returns {Promise<Array>}
 */
export async function getValidatorQueue() {
  try {
    const response = await fetch(`${BACKEND_URL}/validator/queue`);
    if (!response.ok) {
      throw new Error(`Queue fetch returned ${response.status}`);
    }
    const data = await response.json();
    return data.queue || data.submissions || data;
  } catch (err) {
    console.warn("[CleanTO API] GET /validator/queue offline, using fallback items:", err.message);
    return FALLBACK_QUEUE;
  }
}

/**
 * Submit validator decision: POST /validator/review
 * @param {string} submissionId
 * @param {'approve'|'reject'} decision
 * @returns {Promise<{submission_id: string, status: string, verdict: string, tx_hash?: string, reward_amount?: number}>}
 */
export async function submitValidatorReview(submissionId, decision) {
  try {
    const response = await fetch(`${BACKEND_URL}/validator/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission_id: submissionId,
        decision: decision, // 'approve' | 'reject'
      }),
    });

    if (!response.ok) {
      throw new Error(`Review submit returned ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("[CleanTO API] POST /validator/review offline fallback:", err.message);
    return {
      submission_id: submissionId,
      verdict: decision === "approve" ? "approved_by_validator" : "rejected_by_validator",
      decision,
      status: "recorded",
      _offline_fallback: true,
    };
  }
}

// Alias for backwards-compatibility
export const reviewSubmission = submitValidatorReview;

/**
 * Fetch real user balance: GET /users/{id}/balance
 * @param {string} userId
 * @returns {Promise<{balance: number, userId: string, cleanup_count?: number, contractAddress?: string}>}
 */
export async function getUserBalance(userId = "usr_demo") {
  try {
    const response = await fetch(`${BACKEND_URL}/users/${userId}/balance`);
    if (!response.ok) {
      throw new Error(`Balance query returned ${response.status}`);
    }
    const data = await response.json();
    return {
      balance: Number(data.balance ?? data.cleanToBalance ?? 0),
      cleanup_count: data.cleanup_count ?? 0,
      userId: data.user_id || userId,
      contractAddress: data.contract_address || null,
      chainConnected: data.chain_connected ?? true,
    };
  } catch (err) {
    console.warn("[CleanTO API] GET /users/:id/balance offline fallback:", err.message);
    // Direct blockchain bridge check
    try {
      const bcRes = await fetch(`http://localhost:8546/balance/${userId}`);
      if (bcRes.ok) {
        const bcData = await bcRes.json();
        return {
          balance: Number(bcData.balance || 0),
          userId,
          cleanup_count: bcData.cleanupCount || 0,
          contractAddress: bcData.contractAddress,
        };
      }
    } catch {}
    return { balance: 92, userId, cleanup_count: 2, _offline_fallback: true };
  }
}

/**
 * Fetch real submissions list: GET /submissions
 * @returns {Promise<Array>}
 */
export async function getSubmissions() {
  try {
    const response = await fetch(`${BACKEND_URL}/submissions`);
    if (!response.ok) {
      throw new Error(`Submissions fetch returned ${response.status}`);
    }
    const data = await response.json();
    return data.submissions || data;
  } catch (err) {
    console.warn("[CleanTO API] GET /submissions offline fallback:", err.message);
    return null;
  }
}

/**
 * Get details for a specific submission by ID
 * @param {string} submissionId
 */
export async function getSubmission(submissionId) {
  const response = await fetch(`${BACKEND_URL}/submissions/${submissionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch submission ${submissionId}: ${response.statusText}`);
  }
  return await response.json();
}
