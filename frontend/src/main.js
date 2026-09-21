import { USE_MOCK, BACKEND_URL, submitCleanup } from "./api.js";

// DOM Elements
const beforeCard = document.getElementById("beforeCard");
const afterCard = document.getElementById("afterCard");
const beforeInput = document.getElementById("beforeInput");
const afterInput = document.getElementById("afterInput");
const beforePreview = document.getElementById("beforePreview");
const afterPreview = document.getElementById("afterPreview");
const beforeName = document.getElementById("beforeName");
const afterName = document.getElementById("afterName");

const uploadForm = document.getElementById("uploadForm");
const submitBtn = document.getElementById("submitBtn");
const btnSpinner = document.getElementById("btnSpinner");
const btnText = document.getElementById("btnText");

const modeBadge = document.getElementById("modeBadge");
const modeTarget = document.getElementById("modeTarget");
const mockControls = document.getElementById("mockControls");

const resultCard = document.getElementById("resultCard");
const verdictBadge = document.getElementById("verdictBadge");
const resSubmissionId = document.getElementById("resSubmissionId");
const resScoreText = document.getElementById("resScoreText");
const scoreBar = document.getElementById("scoreBar");
const resetBtn = document.getElementById("resetBtn");

let beforeFile = null;
let afterFile = null;

// Initialize Mode Indicator
if (USE_MOCK) {
  modeBadge.textContent = "MOCK MODE ACTIVE";
  modeBadge.style.color = "#3b82f6";
  modeTarget.textContent = "Simulating POST /submit (Local Demo)";
  mockControls.style.display = "block";
} else {
  modeBadge.textContent = "LIVE BACKEND";
  modeBadge.style.color = "#10b981";
  modeTarget.textContent = `Target: ${BACKEND_URL}/submit`;
  mockControls.style.display = "none";
}

// Click to Trigger File Inputs
beforeCard.addEventListener("click", () => beforeInput.click());
afterCard.addEventListener("click", () => afterInput.click());

// Handle Before File Selection
beforeInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    beforeFile = file;
    beforePreview.src = URL.createObjectURL(file);
    beforePreview.style.display = "block";
    beforeName.textContent = file.name;
    beforeName.style.display = "block";
    beforeCard.classList.add("has-file");
    beforeCard.querySelector(".upload-hint").style.display = "none";
    beforeCard.querySelector(".upload-icon").style.display = "none";
  }
  updateSubmitButton();
});

// Handle After File Selection
afterInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    afterFile = file;
    afterPreview.src = URL.createObjectURL(file);
    afterPreview.style.display = "block";
    afterName.textContent = file.name;
    afterName.style.display = "block";
    afterCard.classList.add("has-file");
    afterCard.querySelector(".upload-hint").style.display = "none";
    afterCard.querySelector(".upload-icon").style.display = "none";
  }
  updateSubmitButton();
});

// Update Submit Button State
function updateSubmitButton() {
  if (beforeFile && afterFile) {
    submitBtn.disabled = false;
    btnText.textContent = "🚀 Submit Cleanup for Verification";
  } else {
    submitBtn.disabled = true;
    btnText.textContent = "Select Both Photos to Submit";
  }
}

// Handle Form Submission
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!beforeFile || !afterFile) return;

  // Set Loading State
  submitBtn.disabled = true;
  btnSpinner.style.display = "inline-block";
  btnText.textContent = "Verifying with AI Pipeline...";
  resultCard.style.display = "none";

  try {
    const selectedScenario = document.querySelector('input[name="mockScenario"]:checked')?.value || "pass";
    const result = await submitCleanup(beforeFile, afterFile, selectedScenario);

    // Display Results
    renderVerdict(result);
  } catch (err) {
    alert(`Submission Error: ${err.message}`);
  } finally {
    btnSpinner.style.display = "none";
    submitBtn.disabled = false;
    btnText.textContent = "🚀 Submit Cleanup for Verification";
  }
});

// Render Verdict Outcome
function renderVerdict(result) {
  resultCard.style.display = "block";
  resSubmissionId.textContent = result.submission_id;

  const score = result.similarity_score ?? 0;
  resScoreText.textContent = `${score}%`;
  scoreBar.style.width = `${Math.min(score, 100)}%`;

  verdictBadge.className = "verdict-badge";

  if (result.verdict === "pass") {
    verdictBadge.classList.add("verdict-pass");
    verdictBadge.textContent = "✅ PASS — CLEANUP VERIFIED";
    scoreBar.style.backgroundColor = "var(--accent-emerald)";
  } else if (result.verdict === "fail") {
    verdictBadge.classList.add("verdict-fail");
    verdictBadge.textContent = "❌ FAIL — INSUFFICIENT TRANSFORMATION";
    scoreBar.style.backgroundColor = "var(--accent-rose)";
  } else if (result.verdict === "duplicate") {
    verdictBadge.classList.add("verdict-duplicate");
    verdictBadge.textContent = "⚠️ DUPLICATE — REUSED PHOTO DETECTED";
    scoreBar.style.backgroundColor = "var(--accent-amber)";
  } else {
    verdictBadge.textContent = result.verdict.toUpperCase();
  }

  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Handle Reset
resetBtn.addEventListener("click", () => {
  beforeFile = null;
  afterFile = null;
  beforeInput.value = "";
  afterInput.value = "";

  beforePreview.style.display = "none";
  afterPreview.style.display = "none";
  beforeName.style.display = "none";
  afterName.style.display = "none";

  beforeCard.classList.remove("has-file");
  afterCard.classList.remove("has-file");

  beforeCard.querySelector(".upload-hint").style.display = "block";
  beforeCard.querySelector(".upload-icon").style.display = "block";
  afterCard.querySelector(".upload-hint").style.display = "block";
  afterCard.querySelector(".upload-icon").style.display = "block";

  resultCard.style.display = "none";
  updateSubmitButton();
});
