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
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { getValidatorQueue, reviewSubmission, BACKEND_URL } from "../api";
import { MOCK_VALIDATOR_ITEMS } from "../data/mockData";

export default function ValidatorPage() {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Borderline Similarity", "Ambiguous Cleanup", "Low Delta"];

  // Fetch live queue from backend
  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const data = await getValidatorQueue();
      if (data && data.queue) {
        setQueue(data.queue);
      }
    } catch (err) {
      console.warn("Could not load live validator queue, showing fallback queue:", err.message);
      setQueue(MOCK_VALIDATOR_ITEMS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (item) => {
    const subId = item.submission_id || item.id;
    try {
      const res = await reviewSubmission(subId, "approve");
      setQueue((prev) => prev.filter((q) => (q.submission_id || q.id) !== subId));
      toast.success("Validator Approval Recorded", {
        description: `Approved ${subId}. Awarded ${res.reward_amount || item.cleanup_score || 50} CleanTO. Tx: ${res.tx_hash?.substring(0, 16)}...`,
      });
    } catch (err) {
      toast.error("Failed to submit approval", { description: err.message });
    }
  };

  const handleReject = async (item) => {
    const subId = item.submission_id || item.id;
    try {
      await reviewSubmission(subId, "reject");
      setQueue((prev) => prev.filter((q) => (q.submission_id || q.id) !== subId));
      toast.error("Submission Flagged as Rejected", {
        description: `Submission ${subId} rejected by validator.`,
      });
    } catch (err) {
      toast.error("Failed to submit rejection", { description: err.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DCE1] pb-6">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#66724B] mb-1">
            Consensus Layer &middot; Human Inspection Desk
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] tracking-tight font-sans">
            Validator Review Queue
          </h1>
          <p className="text-xs text-[#525252]">
            Human review queue for submissions flagged as borderline or ambiguous by the neural filter.
          </p>
        </div>

        {/* Validator Summary */}
        <div className="flex items-center gap-4 p-3 bg-white border border-[#D9DCE1] rounded-sm font-mono text-xs">
          <div>
            <span className="text-[10px] text-[#737373] uppercase block">Assigned Queue</span>
            <strong className="text-[#171717] text-sm">{queue.length} Pending</strong>
          </div>
          <div className="border-l border-[#D9DCE1] pl-4">
            <button
              onClick={fetchQueue}
              className="flex items-center gap-1.5 text-xs text-[#171717] hover:text-[#66724B] font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Review Queue Grid */}
      {queue.length === 0 ? (
        <div className="border-2 border-dashed border-[#D9DCE1] bg-white p-12 rounded-sm text-center space-y-3">
          <div className="w-10 h-10 rounded-sm bg-[#F0F2EB] text-[#66724B] flex items-center justify-center mx-auto">
            <Check className="w-5 h-5 stroke-[2]" />
          </div>
          <h3 className="text-base font-bold text-[#171717]">Review Queue Empty</h3>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            No submissions currently pending human validator review. Submissions with borderline AI confidence will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {queue.map((item) => {
            const subId = item.submission_id || item.id;
            const beforeUrl = item.before_image_url
              ? `${BACKEND_URL}${item.before_image_url}`
              : item.beforeThumb || "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80";
            const afterUrl = item.after_image_url
              ? `${BACKEND_URL}${item.after_image_url}`
              : item.afterThumb || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80";

            return (
              <div
                key={subId}
                className="border border-[#D9DCE1] bg-white rounded-sm p-6 space-y-6 shadow-sm hover:border-[#171717] transition-colors"
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9DCE1] pb-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#171717]">{subId}</span>
                      <span className="px-2 py-0.5 rounded-sm bg-[#FDF9EE] text-[#B88E1C] font-mono text-[10px] font-bold border border-[#E5B83B]/40 uppercase">
                        {item.verdict || "Flagged for Review"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#525252] font-mono">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[#737373]" /> {item.user_id || "usr_demo"}</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#737373]" /> {item.created_at?.substring(0, 19).replace("T", " ") || "Recently"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-[#737373]">Review State:</span>
                    <span className="font-bold text-[#B88E1C] bg-[#FDF9EE] px-2.5 py-1 rounded-sm border border-[#E5B83B]/40">
                      Single Validator Consensus
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Photographic Inspection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#737373] block">
                      Before Cleanup Evidence
                    </span>
                    <div className="h-56 border border-[#D9DCE1] rounded-sm overflow-hidden bg-[#ECE9E2]">
                      <img src={beforeUrl} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#737373] block">
                      After Cleanup Evidence
                    </span>
                    <div className="h-56 border border-[#D9DCE1] rounded-sm overflow-hidden bg-[#ECE9E2]">
                      <img src={afterUrl} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Telemetry & Risk Signals Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-[#737373] uppercase block">Location Similarity</span>
                    <strong className="text-sm text-[#171717]">{item.similarity_score || 65.0}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737373] uppercase block">Cleanup Reduction Score</span>
                    <strong className="text-sm text-[#171717]">{item.cleanup_score || 45.0}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737373] uppercase block">Status</span>
                    <strong className="text-sm text-[#B88E1C]">Requires Decision</strong>
                  </div>
                </div>

                {/* Specific Rationale Alert */}
                <div className="p-3 bg-[#FDF9EE] border border-[#E5B83B]/40 rounded-sm text-xs text-[#B88E1C] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span><strong>Borderline Threshold Flag:</strong> Similarity or cleanup reduction falls between automatic pass (70%+) and fail cutoffs. Human verification required before blockchain reward execution.</span>
                </div>

                {/* Action Buttons: Approve, Reject */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#D9DCE1]">
                  <button
                    type="button"
                    onClick={() => handleReject(item)}
                    className="px-4 py-2 border border-[#B91C1C] text-[#B91C1C] hover:bg-[#FDF2F0] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Reject Submission
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(item)}
                    className="px-5 py-2 bg-[#66724B] hover:bg-[#4D5737] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Approve &amp; Trigger Reward
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
