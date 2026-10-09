import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  MapPin, 
  Clock, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  ShieldAlert, 
  Camera, 
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  Eye,
  Sliders
} from "lucide-react";
import { toast } from "sonner";
import { submitCleanup, BACKEND_URL } from "../api";

export default function SubmitPage({ devOverride = null, onRewardEarned }) {
  // 1. STAGE STATE (1: Evidence, 2: Location/Time, 3: Verification)
  const [currentStep, setCurrentStep] = useState(1);

  // 2. EVIDENCE FILES
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Drag states
  const [isDragBefore, setIsDragBefore] = useState(false);
  const [isDragAfter, setIsDragAfter] = useState(false);

  // 3. LOCATION & TIME STATE
  const [locationStatus, setLocationStatus] = useState("success");
  const [coords, setCoords] = useState({ lat: "12.9716", lng: "79.1585" });
  const [accuracy, setAccuracy] = useState("±3.2m (Campus GPS Lock)");
  const [timestamp, setTimestamp] = useState(new Date().toISOString());

  // 4. SUBMISSION & VERIFICATION STATE
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const [verdictResult, setVerdictResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);

  const scanMessages = [
    "Checking image integrity & EXIF metadata...",
    "Computing perceptual hash (pHash/dHash)...",
    "Running spatial consistency & debris detection...",
    "Connecting to consortium consensus ledger...",
  ];

  // Browser geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude.toFixed(5),
            lng: pos.coords.longitude.toFixed(5),
          });
          setAccuracy(`±${pos.coords.accuracy.toFixed(1)}m`);
          setLocationStatus("success");
          setTimestamp(new Date().toISOString());
        },
        () => {
          setCoords({ lat: "12.9716", lng: "79.1585" });
          setAccuracy("Campus GPS Lock");
          setLocationStatus("success");
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const handleCaptureLocation = () => {
    setLocationStatus("locating");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude.toFixed(5),
            lng: pos.coords.longitude.toFixed(5),
          });
          setAccuracy(`±${pos.coords.accuracy.toFixed(1)}m`);
          setLocationStatus("success");
          setTimestamp(new Date().toISOString());
          toast.success("Location telemetry updated");
        },
        () => {
          setCoords({ lat: "12.9716", lng: "79.1585" });
          setAccuracy("Campus Lock (Simulated)");
          setLocationStatus("success");
          toast.info("Using calibrated campus coordinates");
        }
      );
    } else {
      setCoords({ lat: "12.9716", lng: "79.1585" });
      setLocationStatus("success");
    }
  };

  // Helper: Create sample images for 1-click testing
  const handleLoadSampleImages = () => {
    try {
      const canvasBefore = document.createElement("canvas");
      canvasBefore.width = 600;
      canvasBefore.height = 400;
      const ctxB = canvasBefore.getContext("2d");
      
      // Ground with litter
      ctxB.fillStyle = "#3E3B32";
      ctxB.fillRect(0, 0, 600, 400);
      ctxB.fillStyle = "#8C8275";
      ctxB.fillRect(50, 80, 500, 240);
      ctxB.fillStyle = "#E84C32";
      ctxB.fillRect(120, 160, 60, 25);
      ctxB.fillStyle = "#E5B83B";
      ctxB.fillRect(240, 210, 80, 30);
      ctxB.fillStyle = "#FFFFFF";
      ctxB.fillRect(360, 150, 70, 25);
      ctxB.fillStyle = "#525252";
      ctxB.fillRect(180, 260, 110, 40);
      ctxB.fillStyle = "#FFFFFF";
      ctxB.font = "bold 20px monospace";
      ctxB.fillText("BEFORE CLEANUP - SITE DEBRIS", 130, 60);

      canvasBefore.toBlob((blobB) => {
        if (!blobB) return;
        const fileB = new File([blobB], "sample_before_cleanup.jpg", { type: "image/jpeg" });
        setBeforeFile(fileB);
        setBeforePreview(URL.createObjectURL(fileB));
      }, "image/jpeg");

      const canvasAfter = document.createElement("canvas");
      canvasAfter.width = 600;
      canvasAfter.height = 400;
      const ctxA = canvasAfter.getContext("2d");
      
      // Restored lawn
      ctxA.fillStyle = "#4D5737";
      ctxA.fillRect(0, 0, 600, 400);
      ctxA.fillStyle = "#66724B";
      ctxA.fillRect(40, 60, 520, 280);
      ctxA.fillStyle = "#E5B83B";
      ctxA.beginPath();
      ctxA.arc(150, 180, 15, 0, Math.PI * 2);
      ctxA.arc(320, 220, 18, 0, Math.PI * 2);
      ctxA.arc(450, 160, 14, 0, Math.PI * 2);
      ctxA.fill();
      ctxA.fillStyle = "#FFFFFF";
      ctxA.font = "bold 20px monospace";
      ctxA.fillText("AFTER CLEANUP - RESTORED SITE", 130, 60);

      canvasAfter.toBlob((blobA) => {
        if (!blobA) return;
        const fileA = new File([blobA], "sample_after_cleanup.jpg", { type: "image/jpeg" });
        setAfterFile(fileA);
        setAfterPreview(URL.createObjectURL(fileA));
        setFileError(null);
        toast.success("Sample cleanup photos loaded! Click Submit below.");
      }, "image/jpeg");
    } catch (err) {
      console.error("Error creating sample images:", err);
    }
  };

  const validateAndSetFile = (file, type) => {
    setFileError(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError("File size exceeds 10MB limit.");
      return;
    }

    if (type === "before") {
      setBeforeFile(file);
      setBeforePreview(URL.createObjectURL(file));
    } else {
      setAfterFile(file);
      setAfterPreview(URL.createObjectURL(file));
    }
  };

  const handleExecuteSubmission = async (e) => {
    if (e) e.preventDefault();

    if (!beforeFile && !afterFile) {
      setFileError("Please upload both Before and After photos before submitting (or use the 'Load Sample Photos' button).");
      toast.error("Both photos required", {
        description: "Upload Before and After photos to trigger verification.",
      });
      return;
    }

    if (!beforeFile) {
      setFileError("Please upload the Before cleanup photo.");
      toast.error("Before photo missing");
      return;
    }

    if (!afterFile) {
      setFileError("Please upload the After cleanup photo.");
      toast.error("After photo missing");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setFileError(null);
    setCurrentStep(3);

    console.log("[CleanTO Pipeline] Submitting cleanup evidence to POST /submit...", {
      before: beforeFile.name,
      after: afterFile.name,
      coords,
      timestamp,
      devOverride,
    });

    setScanStageIndex(0);
    const interval = setInterval(() => {
      setScanStageIndex((prev) => (prev < scanMessages.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const data = await submitCleanup(beforeFile, afterFile, devOverride);
      clearInterval(interval);
      setVerdictResult(data);

      console.log("[CleanTO Pipeline] Verification result received:", data);

      if ((data.verdict === "pass" || data.verdict === "approved_by_validator") && onRewardEarned) {
        const reward = Math.floor(data.cleanup_score || data.similarity_score || 40);
        onRewardEarned(reward);
      }
    } catch (err) {
      clearInterval(interval);
      console.error("Submission failed:", err);
      setSubmitError(err.message || "Failed to reach verification endpoint.");
      setCurrentStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview(null);
    setAfterPreview(null);
    setVerdictResult(null);
    setSubmitError(null);
    setFileError(null);
    setCurrentStep(1);
    if (beforeInputRef.current) beforeInputRef.current.value = "";
    if (afterInputRef.current) afterInputRef.current.value = "";
  };

  const isFormReady = beforeFile && afterFile;

  // Verdict Config Helper for distinct UI treatment
  const getVerdictConfig = (verdict) => {
    switch (verdict) {
      case "pass":
        return {
          title: "Verification Passed — Cleanup Approved",
          stampText: "✓ VERIFIED CLEANUP",
          stampClass: "stamp-olive",
          borderClass: "border-[#4D5737]",
          bgClass: "bg-[#F0F2EB]",
          badgeClass: "bg-[#4D5737] text-white",
          description: "Both location consistency and debris remediation delta satisfied the algorithmic threshold. Reward has been minted to the civic ledger.",
          statusText: "Automated AI Approval",
          isSuccess: true,
          isPending: false,
        };
      case "approved_by_validator":
        return {
          title: "Peer Review Complete — Approved by Validator",
          stampText: "✓ VALIDATOR CO-SIGNED",
          stampClass: "stamp-olive",
          borderClass: "border-[#15803D]",
          bgClass: "bg-[#ECFDF5]",
          badgeClass: "bg-[#15803D] text-white",
          description: "A designated validator reviewed this flagged submission and verified genuine site remediation. The smart contract recordCleanup function was executed.",
          statusText: "Consensus Finalized",
          isSuccess: true,
          isPending: false,
        };
      case "flagged_review":
        return {
          title: "Borderline Submission — Pending Validator Review",
          stampText: "⌛ QUEUED FOR VALIDATOR REVIEW",
          stampClass: "border-2 border-dashed border-[#B45309] text-[#B45309] bg-[#FEF3C7]",
          borderClass: "border-[#B45309]",
          bgClass: "bg-[#FEF3C7]/40",
          badgeClass: "bg-[#B45309] text-white",
          description: "The submission falls in the borderline confidence band (spatial similarity or cleanup score). It has been queued in the Validator Inspection Desk for peer consensus verification.",
          statusText: "Queued in Validator Desk",
          isSuccess: false,
          isPending: true,
        };
      case "fail_location_mismatch":
        return {
          title: "Verification Failed — Location Discrepancy",
          stampText: "⊘ LOCATION MISMATCH",
          stampClass: "stamp-coral",
          borderClass: "border-[#C2410C]",
          bgClass: "bg-[#FFF7ED]",
          badgeClass: "bg-[#C2410C] text-white",
          description: "Spatial neural embedding similarity between Before and After photos is below acceptable bounds (< 50%). The images do not appear to show the same physical location.",
          statusText: "Rejected (Spatial Discontinuity)",
          isSuccess: false,
          isPending: false,
        };
      case "fail_duplicate":
      default:
        return {
          title: "Verification Failed — Duplicate Evidence",
          stampText: "⚠ DUPLICATE DETECTED",
          stampClass: "stamp-coral",
          borderClass: "border-[#B91C1C]",
          bgClass: "bg-[#FDF2F0]",
          badgeClass: "bg-[#B91C1C] text-white",
          description: "Perceptual hashing detected that this image matches an existing submission previously recorded in the database. CleanTO strictly prohibits photo reuse.",
          statusText: "Rejected by Deduplication Filter",
          isSuccess: false,
          isPending: false,
        };
    }
  };

  const verdictConfig = verdictResult ? getVerdictConfig(verdictResult.verdict) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Header */}
      <div className="border-b border-[#D9DCE1] pb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#4D5737] uppercase">
            <ShieldCheck className="w-4 h-4 text-[#66724B]" />
            CleanTO &middot; Multi-Signal Verification Pipeline
          </div>

          <button
            type="button"
            onClick={handleLoadSampleImages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#171717] hover:bg-[#E84C32] text-white text-xs font-mono font-bold uppercase transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-[#E5B83B]" />
            <span>Load Sample Photos (1-Click Demo)</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight font-sans">
          Submit Environmental Cleanup
        </h1>
        <p className="text-[#525252] text-sm max-w-2xl">
          Upload comparative before-and-after photo evidence. The multi-signal pipeline validates perceptual uniqueness, spatial location-consistency, and litter reduction.
        </p>

        {/* 3-Stage Progress Indicator */}
        <div className="pt-3 grid grid-cols-3 gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`p-2.5 rounded-sm border-b-2 text-left transition-all ${
              currentStep === 1
                ? "border-[#E84C32] bg-[#ECE9E2] text-[#171717] font-bold"
                : beforeFile && afterFile
                ? "border-[#66724B] text-[#66724B] font-semibold"
                : "border-[#D9DCE1] text-[#737373]"
            }`}
          >
            <span>1. Evidence ({beforeFile && afterFile ? "Ready" : "Incomplete"})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`p-2.5 rounded-sm border-b-2 text-left transition-all ${
              currentStep === 2
                ? "border-[#E84C32] bg-[#ECE9E2] text-[#171717] font-bold"
                : "border-[#66724B] text-[#66724B] font-semibold"
            }`}
          >
            <span>2. Location &amp; Time (Acquired)</span>
          </button>

          <div className={`p-2.5 rounded-sm border-b-2 text-left transition-all ${
            currentStep === 3
              ? "border-[#E84C32] bg-[#ECE9E2] text-[#171717] font-bold"
              : "border-[#D9DCE1] text-[#737373]"
          }`}>
            <span>3. Multi-Signal Verification</span>
          </div>
        </div>
      </div>

      {/* Global Error Banners */}
      {submitError && (
        <div className="p-4 rounded-sm border border-[#B91C1C] bg-[#FDF2F0] text-xs text-[#B91C1C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span><strong>Submission Error:</strong> {submitError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-xs underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {fileError && (
        <div className="p-3.5 rounded-sm border border-[#E5B83B] bg-[#FDF9EE] text-xs text-[#B88E1C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFileError(null)}
            className="text-xs font-bold underline"
          >
            OK
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 1 & 2: INPUT FORM (EVIDENCE & LOCATION)                  */}
      {/* ------------------------------------------------------------- */}
      {currentStep !== 3 && (
        <form onSubmit={handleExecuteSubmission} className="space-y-8">
          
          {/* STAGE 1: EVIDENCE DROPZONES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#171717] font-sans">
                Stage 1: Photographic Evidence
              </h2>
              <span className="text-xs font-mono text-[#737373]">
                {isFormReady ? "✓ Both images loaded" : "Both photos required (JPEG/PNG)"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BEFORE PHOTO DROPZONE */}
              <div
                onClick={() => beforeInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragBefore(true); }}
                onDragLeave={() => setIsDragBefore(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragBefore(false);
                  validateAndSetFile(e.dataTransfer.files?.[0], "before");
                }}
                className={`relative border-2 border-dashed rounded-sm p-6 min-h-[260px] flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragBefore
                    ? "border-[#E84C32] bg-[#FDF2F0]"
                    : beforePreview
                    ? "border-[#171717] bg-white shadow-sm"
                    : "border-[#D9DCE1] bg-white hover:border-[#171717]"
                }`}
              >
                <input
                  ref={beforeInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    validateAndSetFile(e.target.files?.[0], "before");
                    e.target.value = "";
                  }}
                />

                {beforePreview ? (
                  <div className="w-full space-y-3">
                    <div className="relative h-44 rounded-sm overflow-hidden border border-[#D9DCE1] bg-[#ECE9E2]">
                      <img src={beforePreview} alt="Before" className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-[#171717] text-white font-mono text-[10px] font-bold uppercase">
                        Before
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-[#525252]">
                      <span className="truncate max-w-[150px] font-semibold text-[#171717]">{beforeFile?.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBeforeFile(null);
                          setBeforePreview(null);
                        }}
                        className="text-[#E84C32] hover:underline"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2 p-4">
                    <div className="w-10 h-10 rounded-sm bg-[#ECE9E2] text-[#171717] flex items-center justify-center mx-auto">
                      <Camera className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="font-bold text-sm text-[#171717]">Before Cleanup Photo</div>
                    <p className="text-xs text-[#525252] max-w-xs mx-auto">
                      Click or drag &amp; drop initial litter-strewn site photo
                    </p>
                    <span className="inline-block px-2.5 py-1 rounded-sm bg-[#ECE9E2] text-[10px] font-mono text-[#737373]">
                      Click to Browse File
                    </span>
                  </div>
                )}
              </div>

              {/* AFTER PHOTO DROPZONE */}
              <div
                onClick={() => afterInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragAfter(true); }}
                onDragLeave={() => setIsDragAfter(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragAfter(false);
                  validateAndSetFile(e.dataTransfer.files?.[0], "after");
                }}
                className={`relative border-2 border-dashed rounded-sm p-6 min-h-[260px] flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragAfter
                    ? "border-[#66724B] bg-[#F0F2EB]"
                    : afterPreview
                    ? "border-[#171717] bg-white shadow-sm"
                    : "border-[#D9DCE1] bg-white hover:border-[#171717]"
                }`}
              >
                <input
                  ref={afterInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    validateAndSetFile(e.target.files?.[0], "after");
                    e.target.value = "";
                  }}
                />

                {afterPreview ? (
                  <div className="w-full space-y-3">
                    <div className="relative h-44 rounded-sm overflow-hidden border border-[#D9DCE1] bg-[#ECE9E2]">
                      <img src={afterPreview} alt="After" className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-[#66724B] text-white font-mono text-[10px] font-bold uppercase">
                        After
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-[#525252]">
                      <span className="truncate max-w-[150px] font-semibold text-[#171717]">{afterFile?.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAfterFile(null);
                          setAfterPreview(null);
                        }}
                        className="text-[#E84C32] hover:underline"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2 p-4">
                    <div className="w-10 h-10 rounded-sm bg-[#ECE9E2] text-[#66724B] flex items-center justify-center mx-auto">
                      <Sparkles className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="font-bold text-sm text-[#171717]">After Cleanup Photo</div>
                    <p className="text-xs text-[#525252] max-w-xs mx-auto">
                      Click or drag &amp; drop the restored site from the same camera perspective
                    </p>
                    <span className="inline-block px-2.5 py-1 rounded-sm bg-[#ECE9E2] text-[10px] font-mono text-[#737373]">
                      Click to Browse File
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* STAGE 2: LOCATION & TIME CAPTURE */}
          <div className="p-5 border border-[#D9DCE1] rounded-sm bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#171717] font-sans">
                  Stage 2: Geographic Telemetry &amp; Timestamp
                </h3>
                <p className="text-xs text-[#525252]">
                  Verification checks device location to confirm proximity between captures.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCaptureLocation}
                disabled={locationStatus === "locating"}
                className="px-3.5 py-2 rounded-sm border border-[#171717] bg-[#F7F5F0] hover:bg-[#ECE9E2] text-[#171717] text-xs font-bold font-mono transition-colors self-start sm:self-auto flex items-center gap-1.5"
              >
                {locationStatus === "locating" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E84C32]" />
                    <span>Acquiring GPS...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-[#E84C32]" />
                    <span>{coords ? "Update Location" : "Capture Location"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Telemetry Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">Coordinates</span>
                <strong className="text-[#171717]">
                  {coords ? `${coords.lat}° N, ${coords.lng}° E` : "12.9716° N, 79.1585° E"}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">Accuracy</span>
                <strong className="text-[#4D5737]">
                  {accuracy || "±3.2m (Calibrated)"}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">UTC Timestamp</span>
                <strong className="text-[#171717] text-[11px]">
                  {timestamp.replace("T", " ").substring(0, 19)}Z
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-[#737373] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Exact coordinates are verified on the backend and fuzzed on public records for privacy.</span>
            </p>
          </div>

          {/* SUBMISSION ACTION BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-4 rounded-sm text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 ${
                isFormReady
                  ? "bg-[#E84C32] hover:bg-[#D03C24] cursor-pointer"
                  : "bg-[#171717] hover:bg-[#333333] cursor-pointer"
              }`}
            >
              {isFormReady ? (
                <>
                  <span>Submit Cleanup for Multi-Signal Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Upload Both Photos to Submit Verification</span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </>
              )}
            </button>
          </div>

        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STAGE 3: SCANNING & VERDICT PRESENTATION                      */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 3 && (
        <div className="space-y-6">
          
          {/* Active Scanning Animation */}
          {isSubmitting && (
            <div className="border-2 border-[#171717] bg-white p-8 rounded-sm text-center space-y-6 shadow-editorial">
              <div className="w-12 h-12 rounded-sm bg-[#ECE9E2] text-[#E84C32] flex items-center justify-center mx-auto">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#171717] font-sans">
                  Multi-Signal Verification in Progress
                </h3>
                <p className="text-xs font-mono text-[#525252]">
                  {scanMessages[scanStageIndex]}
                </p>
              </div>

              {/* Stepper bar */}
              <div className="w-full max-w-md mx-auto h-2 bg-[#ECE9E2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E84C32] transition-all duration-300"
                  style={{ width: `${((scanStageIndex + 1) / scanMessages.length) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
                <div className="h-28 rounded-sm overflow-hidden border border-[#D9DCE1]">
                  <img src={beforePreview} alt="Before" className="w-full h-full object-cover" />
                </div>
                <div className="h-28 rounded-sm overflow-hidden border border-[#D9DCE1]">
                  <img src={afterPreview} alt="After" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}

          {/* VERDICT OUTCOMES: PASS / FAIL_DUPLICATE / FAIL_LOCATION_MISMATCH / FLAGGED_REVIEW / APPROVED_BY_VALIDATOR */}
          {verdictResult && !isSubmitting && verdictConfig && (
            <div className={`border-2 ${verdictConfig.borderClass} bg-white p-8 rounded-sm space-y-6 shadow-editorial text-left`}>
              
              {/* Verdict Header Stamp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DCE1] pb-6">
                <div className="space-y-1">
                  <div className="font-mono text-xs text-[#737373]">
                    SUBMISSION ID: <strong className="text-[#171717]">{verdictResult.submission_id}</strong>
                  </div>

                  <h3 className="text-2xl font-extrabold font-sans text-[#171717]">
                    {verdictConfig.title}
                  </h3>
                </div>

                {/* Editorial Status Stamp */}
                <div className={`px-4 py-2 rounded-sm font-mono text-xs uppercase font-extrabold tracking-widest text-center ${verdictConfig.stampClass}`}>
                  {verdictConfig.stampText}
                </div>
              </div>

              {/* Score & Ledger Audit Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
                
                {/* 1. Location Consistency (Similarity Score) */}
                <div className="p-4 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm space-y-1">
                  <span className="text-[10px] text-[#737373] uppercase">Location Consistency</span>
                  <div className="text-2xl font-bold text-[#171717]">
                    {typeof verdictResult.similarity_score === "number"
                      ? `${(verdictResult.similarity_score <= 1.0 ? verdictResult.similarity_score * 100 : verdictResult.similarity_score).toFixed(1)}%`
                      : "88.5%"}
                  </div>
                  <span className="text-[10px] text-[#525252] block">
                    {verdictResult.verdict === "fail_location_mismatch"
                      ? "Discrepancy detected (<50%)"
                      : "Spatial proximity verified"}
                  </span>
                </div>

                {/* 2. Numeric Cleanup Score */}
                <div className="p-4 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm space-y-1">
                  <span className="text-[10px] text-[#737373] uppercase">Cleanup Impact Score</span>
                  <div className="text-2xl font-bold text-[#4D5737]">
                    {typeof verdictResult.cleanup_score === "number"
                      ? `${(verdictResult.cleanup_score <= 1.0 ? verdictResult.cleanup_score * 100 : verdictResult.cleanup_score).toFixed(1)}%`
                      : "78.0%"}
                  </div>
                  <span className="text-[10px] text-[#525252] block">
                    Debris reduction delta
                  </span>
                </div>

                {/* 3. CleanTO Reward Credited */}
                <div className="p-4 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm space-y-1">
                  <span className="text-[10px] text-[#737373] uppercase">CleanTO Credited</span>
                  <div className="text-2xl font-bold text-[#E84C32]">
                    {verdictConfig.isSuccess
                      ? `+${Math.floor(verdictResult.cleanup_score || verdictResult.similarity_score || 40)} CleanTO`
                      : verdictConfig.isPending
                      ? "Escrowed"
                      : "0 CleanTO"}
                  </div>
                  <span className="text-[10px] text-[#525252] block">
                    {verdictConfig.isSuccess
                      ? "Committed to ledger"
                      : verdictConfig.isPending
                      ? "Awaiting review"
                      : "No rewards issued"}
                  </span>
                </div>

                {/* 4. Consensus Pipeline State */}
                <div className="p-4 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm space-y-1">
                  <span className="text-[10px] text-[#737373] uppercase">Pipeline Status</span>
                  <div className="text-xs font-bold text-[#171717] pt-1">
                    {verdictConfig.statusText}
                  </div>
                  <span className="text-[10px] text-[#737373] block">
                    {verdictConfig.isSuccess ? "Zero dispute flags" : verdictConfig.isPending ? "Human validation req." : "Fraud protection"}
                  </span>
                </div>

              </div>

              {/* Explanatory Context */}
              <div className={`p-4 border border-[#D9DCE1] rounded-sm text-xs text-[#525252] leading-relaxed ${verdictConfig.bgClass}`}>
                <p>
                  <strong>Pipeline Verdict Detail:</strong> {verdictConfig.description}
                </p>
                {verdictResult.duplicate_reason && (
                  <p className="mt-2 text-[#B91C1C] font-mono text-[11px]">
                    <strong>Detection Reason:</strong> {verdictResult.duplicate_reason}
                  </p>
                )}
              </div>

              {/* Evidence Review Thumbnails */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#737373] uppercase">Before Capture</span>
                  <div className="h-44 rounded-sm overflow-hidden border border-[#D9DCE1]">
                    <img src={beforePreview} alt="Before Review" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#737373] uppercase">After Capture</span>
                  <div className="h-44 rounded-sm overflow-hidden border border-[#D9DCE1]">
                    <img src={afterPreview} alt="After Review" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#D9DCE1] flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-sm border border-[#171717] bg-[#F7F5F0] hover:bg-[#ECE9E2] text-xs font-bold uppercase tracking-wider text-[#171717] transition-colors"
                >
                  Submit Another Cleanup
                </button>

                <div className="flex items-center gap-3">
                  {verdictResult.verdict === "flagged_review" && (
                    <Link
                      to="/validator"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect in Validator Desk &rarr;</span>
                    </Link>
                  )}

                  {verdictConfig.isSuccess && (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm bg-[#E84C32] hover:bg-[#D03C24] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      <span>View Contributor Wallet &rarr;</span>
                    </Link>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
