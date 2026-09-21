import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "sonner";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DevDrawer from "./components/DevDrawer";

// Pages
import LandingPage from "./pages/LandingPage";
import SubmitPage from "./pages/SubmitPage";
import DashboardPage from "./pages/DashboardPage";
import ValidatorPage from "./pages/ValidatorPage";
import RedeemPage from "./pages/RedeemPage";
import AboutPage from "./pages/AboutPage";

// Initial user mock balance
import { MOCK_USER } from "./data/mockData";

function AnimatedRoutes({ balance, mockScenario, onRewardEarned, onRedeem }) {
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
                mockScenario={mockScenario} 
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
  const [balance, setBalance] = useState(MOCK_USER.cleanToBalance);
  const [mockScenario, setMockScenario] = useState("pass");

  const handleRewardEarned = (amount) => {
    setBalance((prev) => prev + amount);
    toast.success("CleanTO Balance Credited", {
      description: `Earned +${amount} CleanTO for verified cleanup. Reflected across your wallet.`,
    });
  };

  const handleRedeem = (cost) => {
    setBalance((prev) => Math.max(0, prev - cost));
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#F7F5F0] text-[#171717] flex flex-col font-sans selection:bg-[#E84C32] selection:text-white">
        <Navbar balance={balance} />
        <main className="flex-1">
          <AnimatedRoutes
            balance={balance}
            mockScenario={mockScenario}
            onRewardEarned={handleRewardEarned}
            onRedeem={handleRedeem}
          />
        </main>
        <Footer />
        
        {/* Discreet Hidden Demo Drawer */}
        <DevDrawer 
          mockScenario={mockScenario} 
          onScenarioChange={setMockScenario} 
        />

        {/* Sonner Editorial Toast System */}
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}
