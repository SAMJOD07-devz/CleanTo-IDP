/**
 * CleanTO - Frontend API Service (30% Milestone)
 * Interface Contract:
 * - POST /submit (multipart/form-data: `before`, `after`, optional `user_id`)
 * - GET /submissions/<id>
 * - GET /validator/queue
 * - POST /validator/review ({ submission_id, decision: 'approve' | 'reject' })
 * - GET /users/<id>/balance
 */

export const USE_MOCK = false;
export const BACKEND_URL = "http://localhost:5000";

/**
 * Submit cleanup photo pair for AI verification and blockchain reward
 * @param {File} beforeFile - The before cleanup image file
 * @param {File} afterFile - The after cleanup image file
 * @param {string} [userId='usr_demo'] - User identifier
 * @returns {Promise<{submission_id: string, verdict: string, similarity_score: number, cleanup_score: number, tx_hash?: string}>}
 */
export async function submitCleanup(beforeFile, afterFile, userId = "usr_demo") {
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
      throw new Error(`Backend returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[CleanTO Live API] Submission verified:", data);
    return data;
  } catch (err) {
    console.warn(`[CleanTO API] Failed to reach live backend at ${BACKEND_URL}:`, err.message);
    throw err;
  }
}

/**
 * Fetch submissions currently queued for human validator review
 */
export async function getValidatorQueue() {
  const response = await fetch(`${BACKEND_URL}/validator/queue`);
  if (!response.ok) {
    throw new Error(`Failed to fetch validator queue: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Review a flagged submission (approve or reject)
 * @param {string} submissionId
 * @param {'approve' | 'reject'} decision
 */
export async function reviewSubmission(submissionId, decision) {
  const response = await fetch(`${BACKEND_URL}/validator/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submission_id: submissionId, decision }),
  });
  if (!response.ok) {
    throw new Error(`Failed to submit review: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Get real CleanTO balance and verified cleanups for a user
 * @param {string} [userId='usr_demo']
 */
export async function getUserBalance(userId = "usr_demo") {
  const response = await fetch(`${BACKEND_URL}/users/${userId}/balance`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user balance: ${response.statusText}`);
  }
  return await response.json();
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
