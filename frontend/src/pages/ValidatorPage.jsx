import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  X, 
  HelpCircle, 
  MapPin, 
  Clock, 
  User, 
  Layers,
  ChevronRight,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { getValidatorQueue, submitValidatorReview, BACKEND_URL } from "../api";

function resolveImageUrl(path, fallbackUrl) {
  if (!path) return fallbackUrl;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const filename = path.split(/[\/\\]/).pop();
  return `${BACKEND_URL}/uploads/${filename}`;
}

export default function ValidatorPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Borderline Location", "Low Delta", "Unresolved"];

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const items = await getValidatorQueue();
      setQueue(items || []);
    } catch (err) {
      toast.error("Failed to load validator queue", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Filter logic
  const filteredQueue = queue.filter((item) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Borderline Location") {
      return (item.similarity_score || 0) < 65;
    }
    if (activeCategory === "Low Delta") {
      return (item.cleanup_score || 0) < 45;
    }
    return true;
  });

  // REAL ACTION: Wire Approve to POST /validator/review
  const handleApprove = async (item) => {
    const subId = item.submission_id || item.id;
    setActionInProgress((prev) => ({ ...prev, [subId]: "approving" }));

    try {
      const result = await submitValidatorReview(subId, "approve");
      setQueue((prev) => prev.filter((q) => (q.submission_id || q.id) !== subId));
      
      const reward = result.reward_amount || Math.floor(Number(item.cleanup_score || 50));
      toast.success("Submission Approved & Co-Signed", {
        description: `Verified ${subId}. Awarded ${reward} CleanTO. ${result.tx_hash ? `Tx: ${result.tx_hash.substring(0, 16)}...` : "Recorded on ledger."}`,
      });
      console.log("[Validator Desk] Approved submission:", subId, result);
    } catch (err) {
      toast.error("Approval transaction failed", {
        description: err.message || "Failed to record validator decision.",
      });
    } finally {
      setActionInProgress((prev) => ({ ...prev, [subId]: null }));
    }
  };

  // REAL ACTION: Wire Reject to POST /validator/review
  const handleReject = async (item) => {
    const subId = item.submission_id || item.id;
    setActionInProgress((prev) => ({ ...prev, [subId]: "rejecting" }));

    try {
      const result = await submitValidatorReview(subId, "reject");
      setQueue((prev) => prev.filter((q) => (q.submission_id || q.id) !== subId));

      toast.error("Submission Flagged as Rejected", {
        description: `Submission ${subId} marked as rejected. No reward will be issued.`,
      });
      console.log("[Validator Desk] Rejected submission:", subId, result);
    } catch (err) {
      toast.error("Rejection recording failed", {
        description: err.message,
      });
    } finally {
      setActionInProgress((prev) => ({ ...prev, [subId]: null }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DCE1] pb-6">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#4D5737] mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#66724B]" />
            Consensus Layer &middot; Single-Reviewer Inspection Desk
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] tracking-tight font-sans">
            Validator Inspection Desk
          </h1>
          <p className="text-xs text-[#525252]">
            Human review queue for submissions flagged as borderline (spatial similarity or cleanup impact score) by the neural filter.
          </p>
        </div>

        {/* Status / Refresh Bar */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={fetchQueue}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm border border-[#171717] bg-white hover:bg-[#ECE9E2] text-[#171717] font-mono text-xs font-bold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Queue</span>
          </button>

          <div className="p-3 bg-white border border-[#D9DCE1] rounded-sm font-mono text-xs">
            <span className="text-[10px] text-[#737373] uppercase block">Assigned Queue</span>
            <strong className="text-[#171717] text-sm">{queue.length} Pending Review</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9DCE1] pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase font-bold transition-colors ${
              activeCategory === cat
                ? "bg-[#171717] text-white"
                : "bg-white text-[#525252] border border-[#D9DCE1] hover:border-[#171717]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Review Queue Grid */}
      {loading ? (
        <div className="border border-[#D9DCE1] bg-white p-12 rounded-sm text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#E84C32]" />
          <h3 className="text-sm font-bold text-[#171717] font-mono">Fetching Borderline Submissions...</h3>
          <p className="text-xs text-[#737373]">Querying GET /validator/queue endpoint</p>
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="border-2 border-dashed border-[#D9DCE1] bg-white p-12 rounded-sm text-center space-y-3">
          <div className="w-10 h-10 rounded-sm bg-[#F0F2EB] text-[#4D5737] flex items-center justify-center mx-auto">
            <Check className="w-5 h-5 stroke-[2]" />
          </div>
          <h3 className="text-base font-bold text-[#171717]">Review Queue Exhausted</h3>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            All assigned borderline submissions in category "{activeCategory}" have been evaluated. When submissions fall into the borderline score band, they will appear here.
          </p>
          <button
            type="button"
            onClick={fetchQueue}
            className="mt-2 px-4 py-2 bg-[#171717] text-white text-xs font-mono font-bold rounded-sm hover:bg-[#333333]"
          >
            Check for New Flagged Items
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQueue.map((item) => {
            const subId = item.submission_id || item.id;
            const isApproving = actionInProgress[subId] === "approving";
            const isRejecting = actionInProgress[subId] === "rejecting";

            const beforeImg = resolveImageUrl(
              item.before_path || item.beforeThumb,
              "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80"
            );
            const afterImg = resolveImageUrl(
              item.after_path || item.afterThumb,
              "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
            );

            const simScore = typeof item.similarity_score === "number"
              ? (item.similarity_score <= 1.0 ? item.similarity_score * 100 : item.similarity_score).toFixed(1)
              : "64.2";

            const clnScore = typeof item.cleanup_score === "number"
              ? (item.cleanup_score <= 1.0 ? item.cleanup_score * 100 : item.cleanup_score).toFixed(1)
              : "38.5";

            const timeStr = item.created_at
              ? new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : item.timestamp || "Recent";

            return (
              <div
                key={subId}
                className="border-2 border-[#171717] bg-white rounded-sm p-6 space-y-6 shadow-editorial transition-colors"
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9DCE1] pb-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#171717]">{subId}</span>
                      <span className="px-2 py-0.5 rounded-sm bg-[#FEF3C7] text-[#B45309] font-mono text-[10px] font-bold border border-[#B45309]/30 uppercase">
                        flagged_review
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#525252] font-mono">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#737373]" /> {item.user_id || "usr_demo"}
                      </span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#E84C32]" /> {item.location || "12.9716° N, 79.1585° E"}
                      </span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#737373]" /> {timeStr}
                      </span>
                    </div>
                  </div>

                  <div className="font-mono text-xs">
                    <span className="px-2.5 py-1 rounded-sm bg-[#ECE9E2] text-[#171717] font-bold">
                      Awaiting Single Reviewer Determination
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Photographic Inspection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-[#737373]">
                      <span>Before Cleanup Evidence</span>
                      <span>Site Debris</span>
                    </div>
                    <div className="h-60 border border-[#D9DCE1] rounded-sm overflow-hidden bg-[#ECE9E2]">
                      <img src={beforeImg} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-[#737373]">
                      <span>After Cleanup Evidence</span>
                      <span>Remediated</span>
                    </div>
                    <div className="h-60 border border-[#D9DCE1] rounded-sm overflow-hidden bg-[#ECE9E2]">
                      <img src={afterImg} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Telemetry & AI Signals Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-[#737373] uppercase block">Spatial Consistency</span>
                    <strong className="text-base text-[#171717]">{simScore}%</strong>
                    <span className="text-[10px] text-[#737373] block">CLIP embedding match</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737373] uppercase block">Cleanup Score</span>
                    <strong className="text-base text-[#4D5737]">{clnScore}%</strong>
                    <span className="text-[10px] text-[#737373] block">Debris reduction index</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737373] uppercase block">Proposed Reward</span>
                    <strong className="text-base text-[#E84C32]">+{Math.floor(Number(clnScore) || 40)} CleanTO</strong>
                    <span className="text-[10px] text-[#737373] block">Minted upon approval</span>
                  </div>
                </div>

                {/* Flag Reason */}
                <div className="p-3 bg-[#FEF3C7]/50 border border-[#B45309]/30 rounded-sm text-xs text-[#92400E] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#B45309]" />
                  <span>
                    <strong>Neural Escalation Rationale:</strong>{" "}
                    {item.flag_reason || item.flagReason || "Borderline confidence band — spatial angle variance or subtle debris reduction requires human verification."}
                  </span>
                </div>

                {/* Real Action Buttons: Approve, Reject */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-[#D9DCE1]">
                  <button
                    type="button"
                    disabled={isApproving || isRejecting}
                    onClick={() => handleReject(item)}
                    className="px-5 py-2.5 border border-[#B91C1C] text-[#B91C1C] hover:bg-[#FDF2F0] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isRejecting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span>Reject Submission</span>
                  </button>

                  <button
                    type="button"
                    disabled={isApproving || isRejecting}
                    onClick={() => handleApprove(item)}
                    className="px-6 py-2.5 bg-[#4D5737] hover:bg-[#3D452B] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isApproving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Approve &amp; Mint Reward</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
