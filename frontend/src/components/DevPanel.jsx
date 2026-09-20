import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Sliders, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { USE_MOCK, BACKEND_URL } from "../api";

export default function DevPanel({ mockScenario, onScenarioChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Discreet Floating Trigger in Bottom-Left Corner */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Demo &amp; Dev Control Panel"
        className="fixed bottom-5 left-5 z-50 p-2.5 rounded-full bg-slate-900/85 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-700/70 shadow-lg backdrop-blur-md transition-all hover:scale-105"
      >
        <Settings className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-90 text-emerald-400" : ""}`} />
      </button>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-16 left-5 z-50 w-80 rounded-2xl bg-slate-900/95 border border-slate-700/80 p-5 shadow-2xl backdrop-blur-xl text-left space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Demo Control Panel</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Backend connection status */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-[11px] font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pipeline Mode:</span>
                <span className={`font-bold ${USE_MOCK ? "text-blue-400" : "text-emerald-400"}`}>
                  {USE_MOCK ? "MOCK RESPONSE" : "LIVE BACKEND"}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {USE_MOCK ? "Configured in frontend/src/api.js" : BACKEND_URL}
              </div>
            </div>

            {/* Simulated AI Verdict Options */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
                Simulated AI Verdict (for Demo):
              </label>
              <div className="space-y-1.5">
                {[
                  { id: "pass", label: "Pass (Verified Cleanup)", icon: CheckCircle2, color: "text-emerald-400" },
                  { id: "fail", label: "Fail (Low Transformation)", icon: XCircle, color: "text-rose-400" },
                  { id: "duplicate", label: "Duplicate (pHash Match)", icon: AlertTriangle, color: "text-amber-400" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = mockScenario === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onScenarioChange(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-emerald-500/15 border border-emerald-500/50 text-white font-semibold"
                          : "bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-tight pt-1 font-mono">
              Hidden from public UI. Click the gear to dismiss.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
