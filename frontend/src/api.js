/**
 * CleanTO - Frontend API Service (Review II Milestone)
 * Interface Contract:
 * - Request: POST /submit (multipart/form-data)
 *   - before: File
 *   - after: File
 * - Response: { "submission_id": string, "verdict": "pass" | "fail" | "duplicate", "similarity_score": number }
 */

// ============================================================================
// >>> ONE-LINE TOGGLE: Set USE_MOCK = false to connect to the real backend! <<<
// ============================================================================
export const USE_MOCK = true;
export const BACKEND_URL = "http://localhost:5000";

/**
 * Submit cleanup photo pair for AI verification
 * @param {File} beforeFile - The before cleanup image file
 * @param {File} afterFile - The after cleanup image file
 * @param {string} [mockVerdict='pass'] - Optional choice for mock mode demo ('pass' | 'fail' | 'duplicate')
 * @returns {Promise<{submission_id: string, verdict: string, similarity_score: number}>}
 */
export async function submitCleanup(beforeFile, afterFile, mockVerdict = "pass") {
  if (USE_MOCK) {
    // Simulate network latency (800ms) for realistic demo feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    const scores = {
      pass: 88.5,
      fail: 24.0,
      duplicate: 99.2,
    };

    const mockResponse = {
      submission_id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      verdict: mockVerdict, // 'pass' | 'fail' | 'duplicate'
      similarity_score: scores[mockVerdict] ?? 85.0,
    };

    console.log("[MOCK API] Returning mocked response:", mockResponse);
    return mockResponse;
  }

  // --- Real Backend API Call ---
  const formData = new FormData();
  formData.append("before", beforeFile);
  formData.append("after", afterFile);

  const response = await fetch(`${BACKEND_URL}/submit`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Backend returned status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
