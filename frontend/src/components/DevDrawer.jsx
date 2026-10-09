import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Check, ShieldAlert, Cpu } from "lucide-react";
import { BACKEND_URL } from "../api";

/**
 * CleanTO Hidden Dev & Demo Panel (30% Milestone)
 * Accessible via:
 * 1. Keyboard Shortcut: Ctrl + Shift + D (or Cmd + Shift + D)
 * 2. Subtle micro-gear icon in bottom right corner
 *
 * Normal user flow defaults to Live Backend.
 */
export default function DevDrawer({ devOverride, onOverrideChange, onReplayIntro }) {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut listener: Ctrl+Shift+D or Cmd+Shift+D
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const options = [
    {
      id: null,
      label: "Live Pipeline (Default)",
      desc: `Calls real backend at ${BACKEND_URL}/submit with AI model`,
      tag: "REAL",
    },
    {
      id: "pass",
      label: "Simulate: pass",
      desc: "High similarity (>85%) + high cleanup score (>80%)",
      tag: "VERDICT",
    },
    {
      id: "fail_duplicate",
      label: "Simulate: fail_duplicate",
      desc: "pHash / dHash match with prior submission",
      tag: "VERDICT",
    },
    {
      id: "fail_location_mismatch",
      label: "Simulate: fail_location_mismatch",
      desc: "CLIP spatial similarity < 50% between photo pair",
      tag: "VERDICT",
    },
    {
      id: "flagged_review",
      label: "Simulate: flagged_review",
      desc: "Borderline scores (50-70%) queued for Validator Desk",
      tag: "VERDICT",
    },
    {
      id: "approved_by_validator",
      label: "Simulate: approved_by_validator",
      desc: "Submission reviewed and approved by peer validator",
      tag: "VERDICT",
    },
  ];

  return (
    <>
      {/* Tucked micro-gear trigger in bottom-right corner */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Dev Inspection Panel (Shortcut: Ctrl+Shift+D)"
        className="fixed bottom-3 right-3 z-50 p-1.5 rounded-sm bg-[#171717]/60 hover:bg-[#171717] text-[#D9DCE1] hover:text-white border border-[#333333] transition-all opacity-40 hover:opacity-100"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      {/* Hidden Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className="fixed bottom-12 right-3 z-50 w-88 max-w-[calc(100vw-24px)] rounded-sm bg-[#F7F5F0] border-2 border-[#171717] p-5 shadow-2xl text-left space-y-4 font-sans"
          >
            <div className="flex items-center justify-between border-b border-[#D9DCE1] pb-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#E84C32]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Internal Dev Controls
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#737373] hover:text-[#171717] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Mode Badge */}
            <div className="p-3 bg-[#ECE9E2] border border-[#D9DCE1] rounded-sm font-mono text-[11px] space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[#525252]">Active Pipeline:</span>
                <span className={`font-bold ${devOverride ? "text-[#E84C32]" : "text-[#4D5737]"}`}>
                  {devOverride ? `SIMULATION (${devOverride})` : "LIVE BACKEND (REAL)"}
                </span>
              </div>
              <div className="text-[10px] text-[#737373] truncate">
                Target: {BACKEND_URL}/submit
              </div>
            </div>

            {/* Outcome Selection */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              <label className="font-mono text-[10px] uppercase font-bold text-[#525252] block mb-1">
                Trigger Presentation Scenario:
              </label>
              {options.map((item) => {
                const isSelected = devOverride === item.id;
                return (
                  <button
                    key={String(item.id)}
                    type="button"
                    onClick={() => onOverrideChange(item.id)}
                    className={`w-full text-left p-2.5 rounded-sm border transition-all ${
                      isSelected
                        ? "border-[#171717] bg-[#171717] text-white"
                        : "border-[#D9DCE1] bg-white text-[#171717] hover:border-[#171717]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{item.label}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#E84C32]" />
                      ) : (
                        <span className="text-[9px] font-mono px-1 rounded bg-[#ECE9E2] text-[#737373]">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <span
                      className={`block text-[10px] font-mono mt-0.5 ${
                        isSelected ? "text-slate-300" : "text-[#737373]"
                      }`}
                    >
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] font-mono text-[#737373] border-t border-[#D9DCE1] pt-2 flex items-center justify-between">
              <span>Shortcut: Ctrl+Shift+D</span>
              <div className="flex items-center gap-2">
                {onReplayIntro && (
                  <button
                    type="button"
                    onClick={() => {
                      onReplayIntro();
                      setIsOpen(false);
                    }}
                    className="text-[#E84C32] font-bold hover:underline"
                  >
                    Replay 3D Intro
                  </button>
                )}
                <span>&middot;</span>
                <button
                  type="button"
                  onClick={() => onOverrideChange(null)}
                  className="underline hover:text-[#171717]"
                >
                  Reset Live
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
