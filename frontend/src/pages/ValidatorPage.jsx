import React, { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
// MOCK DATA: Queue for Review II demonstration
import { MOCK_VALIDATOR_ITEMS, MOCK_USER } from "../data/mockData";

export default function ValidatorPage() {
  const [queue, setQueue] = useState(MOCK_VALIDATOR_ITEMS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeReviewItem, setActiveReviewItem] = useState(null);

  const categories = ["All", "Suspicious", "Low confidence", "Duplicate risk"];

  const filteredQueue = activeCategory === "All"
    ? queue
    : queue.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());

  // MOCK ACTION: Replace with validator endpoint
  const handleApprove = (item) => {
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
    setActiveReviewItem(null);
    toast.success("Validator Approval Recorded", {
      description: `Signed submission ${item.id}. Multi-signature consensus updated to ${item.currentSignatures + 1}/${item.requiredSignatures}.`,
    });
  };

  // MOCK ACTION: Replace with validator endpoint
  const handleReject = (item) => {
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
    setActiveReviewItem(null);
    toast.error("Submission Flagged as Rejected", {
      description: `Submission ${item.id} rejected due to: ${item.flagReason}.`,
    });
  };

  // MOCK ACTION: Replace with validator endpoint
  const handleNeedsEvidence = (item) => {
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
    setActiveReviewItem(null);
    toast.warning("Requested Additional Telemetry", {
      description: `Notification dispatched to contributor of ${item.id} for secondary verification photo.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DCE1] pb-6">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#66724B] mb-1">
            Consensus Layer &middot; DPoS Peer Review Queue
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] tracking-tight font-sans">
            Validator Inspection Desk
          </h1>
          <p className="text-xs text-[#525252]">
            Human review queue for submissions flagged as borderline or ambiguous by the neural filter.
          </p>
        </div>

        {/* Validator Credential Summary */}
        <div className="flex items-center gap-4 p-3 bg-white border border-[#D9DCE1] rounded-sm font-mono text-xs">
          <div>
            <span className="text-[10px] text-[#737373] uppercase block">Assigned Queue</span>
            <strong className="text-[#171717] text-sm">{queue.length} Pending</strong>
          </div>
          <div className="border-l border-[#D9DCE1] pl-4">
            <span className="text-[10px] text-[#737373] uppercase block">Audit Accuracy</span>
            <strong className="text-[#4D5737] text-sm">99.1% High</strong>
          </div>
          <div className="border-l border-[#D9DCE1] pl-4">
            <span className="text-[10px] text-[#737373] uppercase block">Reviews Completed</span>
            <strong className="text-[#171717] text-sm">48 Audits</strong>
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
      {filteredQueue.length === 0 ? (
        <div className="border-2 border-dashed border-[#D9DCE1] bg-white p-12 rounded-sm text-center space-y-3">
          <div className="w-10 h-10 rounded-sm bg-[#F0F2EB] text-[#66724B] flex items-center justify-center mx-auto">
            <Check className="w-5 h-5 stroke-[2]" />
          </div>
          <h3 className="text-base font-bold text-[#171717]">Review Queue Exhausted</h3>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            All assigned borderline submissions in category "{activeCategory}" have been evaluated. Check back when new threshold flags trigger.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQueue.map((item) => (
            <div
              key={item.id}
              className="border border-[#D9DCE1] bg-white rounded-sm p-6 space-y-6 shadow-sm hover:border-[#171717] transition-colors"
            >
              {/* Item Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9DCE1] pb-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#171717]">{item.id}</span>
                    <span className="px-2 py-0.5 rounded-sm bg-[#FDF9EE] text-[#B88E1C] font-mono text-[10px] font-bold border border-[#E5B83B]/40 uppercase">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#525252] font-mono">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#E84C32]" /> {item.location}</span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#737373]" /> {item.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-[#737373]">Consensus Required:</span>
                  <span className="font-bold text-[#171717] bg-[#ECE9E2] px-2.5 py-1 rounded-sm">
                    {item.currentSignatures} of {item.requiredSignatures} Signatures
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
                    <img src={item.beforeThumb} alt="Before" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#737373] block">
                    After Cleanup Evidence
                  </span>
                  <div className="h-56 border border-[#D9DCE1] rounded-sm overflow-hidden bg-[#ECE9E2]">
                    <img src={item.afterThumb} alt="After" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Telemetry & Risk Signals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#737373] uppercase block">AI Delta Score</span>
                  <strong className="text-sm text-[#171717]">{item.aiConfidence}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#737373] uppercase block">Elapsed Time</span>
                  <strong className="text-sm text-[#171717]">{item.timeDelta}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#737373] uppercase block">GPS Variance</span>
                  <strong className="text-sm text-[#4D5737]">{item.gpsDrift}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#737373] uppercase block">Applicant History</span>
                  <strong className="text-sm text-[#171717]">{item.applicantReputation} Trust</strong>
                </div>
              </div>

              {/* Specific Rationale Alert */}
              <div className="p-3 bg-[#FDF9EE] border border-[#E5B83B]/40 rounded-sm text-xs text-[#B88E1C] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span><strong>Neural Escalation Rationale:</strong> {item.flagReason}</span>
              </div>

              {/* Action Buttons: Approve, Reject, Needs Evidence */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D9DCE1]">
                <button
                  type="button"
                  onClick={() => handleNeedsEvidence(item)}
                  className="px-4 py-2 border border-[#D9DCE1] bg-white hover:bg-[#ECE9E2] text-xs font-mono font-bold text-[#525252] rounded-sm transition-colors"
                >
                  Request Telemetry Clarification
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleReject(item)}
                    className="px-4 py-2 border border-[#B91C1C] text-[#B91C1C] hover:bg-[#FDF2F0] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Reject (Flag Fraud)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(item)}
                    className="px-5 py-2 bg-[#66724B] hover:bg-[#4D5737] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Approve &amp; Cosign
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
