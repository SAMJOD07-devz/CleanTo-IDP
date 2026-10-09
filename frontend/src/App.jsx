import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "sonner";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DevDrawer from "./components/DevDrawer";
import IntroScene from "./components/IntroScene";

// Pages
import LandingPage from "./pages/LandingPage";
import SubmitPage from "./pages/SubmitPage";
import DashboardPage from "./pages/DashboardPage";
import ValidatorPage from "./pages/ValidatorPage";
import RedeemPage from "./pages/RedeemPage";
import AboutPage from "./pages/AboutPage";

// API
import { getUserBalance } from "./api";

// In-memory flag: Resets on page refresh/reload so intro ALWAYS plays on fresh reload,
// but stays true across internal client-side navigation (Submit -> Dashboard -> Home)
let introCompletedInMemory = false;

// Clear stale sessionStorage keys from previous builds
try {
  sessionStorage.removeItem("cleanto_intro_seen");
} catch (e) {}

function AnimatedRoutes({ balance, devOverride, onRewardEarned, onRedeem }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/submit" 
            element={
              <SubmitPage 
                devOverride={devOverride} 
                onRewardEarned={onRewardEarned} 
              />
            } 
          />
          <Route path="/dashboard" element={<DashboardPage balance={balance} />} />
          <Route path="/validator" element={<ValidatorPage />} />
          <Route path="/redeem" element={<RedeemPage balance={balance} onRedeem={onRedeem} />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [balance, setBalance] = useState(0);
  const [devOverride, setDevOverride] = useState(null); // null means Live Backend!
  
  // Always true on fresh reload/page load; false only after intro has played within this session
  const [showIntro, setShowIntro] = useState(() => !introCompletedInMemory);

  // Sync real balance from backend/blockchain on mount
  useEffect(() => {
    async function syncBalance() {
      try {
        const data = await getUserBalance("usr_demo");
        if (data && typeof data.balance === "number") {
          setBalance(data.balance);
        }
      } catch (e) {
        // Fallback default
        setBalance(75);
      }
    }
    syncBalance();
  }, []);

  const handleRewardEarned = (amount) => {
    setBalance((prev) => prev + amount);
    toast.success("CleanTO Balance Credited", {
      description: `Earned +${amount} CleanTO for verified cleanup. Reflected across your wallet.`,
    });
  };

  const handleRedeem = (cost) => {
    setBalance((prev) => Math.max(0, prev - cost));
  };

  const handleIntroComplete = () => {
    introCompletedInMemory = true;
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    introCompletedInMemory = false;
    setShowIntro(true);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#F7F5F0] text-[#171717] flex flex-col font-sans selection:bg-[#E84C32] selection:text-white relative">
        
        {/* 3D Intro Scene: Shown on every fresh page load/reload, hands off to LandingPage */}
        <AnimatePresence>
          {showIntro && (
            <IntroScene onComplete={handleIntroComplete} />
          )}
        </AnimatePresence>

        <Navbar balance={balance} />
        <main className="flex-1">
          <AnimatedRoutes
            balance={balance}
            devOverride={devOverride}
            onRewardEarned={handleRewardEarned}
            onRedeem={handleRedeem}
          />
        </main>
        <Footer />
        
        {/* Hidden Dev & Demo Panel (Triggered by Ctrl+Shift+D or micro-gear) */}
        <DevDrawer 
          devOverride={devOverride} 
          onOverrideChange={setDevOverride}
          onReplayIntro={handleReplayIntro}
        />

        {/* Sonner Editorial Toast System */}
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}
