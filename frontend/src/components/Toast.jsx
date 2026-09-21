import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/40 bg-emerald-950/80 text-emerald-100",
    error: "border-rose-500/40 bg-rose-950/80 text-rose-100",
    warning: "border-amber-500/40 bg-amber-950/80 text-amber-100",
    info: "border-blue-500/40 bg-blue-950/80 text-blue-100",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${borders[toast.type || "info"]}`}
        >
          {icons[toast.type || "info"]}
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-sm mb-0.5 text-white">{toast.title}</h5>
            <p className="opacity-90">{toast.message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
