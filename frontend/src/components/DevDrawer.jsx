import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, X, Check, AlertTriangle, XCircle, Settings } from "lucide-react";
import { USE_MOCK, BACKEND_URL } from "../api";

export default function DevDrawer({ mockScenario, onScenarioChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Discreet bottom-left control button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Demo &amp; Pipeline Configuration"
        className="fixed bottom-4 left-4 z-50 px-2.5 py-1.5 rounded-sm bg-[#171717] text-[#F7F5F0] border border-[#262626] font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-[#E84C32] transition-colors shadow-md flex items-center gap-1.5"
      >
        <Settings className="w-3 h-3" />
        <span>Demo Controls</span>
      </button>

      {/* Slide-out Editorial Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className="fixed bottom-14 left-4 z-50 w-80 rounded-sm bg-[#F7F5F0] border-2 border-[#171717] p-5 shadow-2xl text-left space-y-4 font-sans"
          >
            <div className="flex items-center justify-between border-b border-[#D9DCE1] pb-2.5">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#171717]">
                Milestone 20% &middot; Demo State
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#737373] hover:text-[#171717] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pipeline connection state */}
            <div className="p-3 bg-[#ECE9E2] border border-[#D9DCE1] rounded-sm font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#525252]">Active Adapter:</span>
                <span className={`font-bold ${USE_MOCK ? "text-[#E84C32]" : "text-[#66724B]"}`}>
                  {USE_MOCK ? "MOCK ADAPTER" : "LIVE BACKEND"}
                </span>
              </div>
              <div className="text-[10px] text-[#737373] truncate">
                {USE_MOCK ? "Toggled in frontend/src/api.js" : BACKEND_URL}
              </div>
            </div>

            {/* Scenario selector */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase font-bold text-[#525252] block">
                Select Simulated Pipeline Outcome:
              </label>
              
              <div className="space-y-1.5">
                {[
                  { id: "pass", label: "Pass (Verified Cleanup)", note: "Delta > 85%, unique pHash" },
                  { id: "fail", label: "Fail (Low Transformation)", note: "Delta < 30%, rejection" },
                  { id: "duplicate", label: "Duplicate (Reused Photo)", note: "pHash match > 99%" },
                ].map((item) => {
                  const isSelected = mockScenario === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onScenarioChange(item.id)}
                      className={`w-full text-left p-2.5 rounded-sm border transition-all ${
                        isSelected
                          ? "border-[#171717] bg-[#171717] text-white"
                          : "border-[#D9DCE1] bg-white text-[#171717] hover:border-[#171717]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{item.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#E84C32]" />}
                      </div>
                      <span className={`block text-[10px] font-mono mt-0.5 ${isSelected ? "text-slate-300" : "text-[#737373]"}`}>
                        {item.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] font-mono text-[#737373] border-t border-[#D9DCE1] pt-2">
              Hidden from public UI to preserve presentation cleanliness.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
