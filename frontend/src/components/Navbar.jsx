import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ArrowUpRight, 
  Menu, 
  X, 
  ShieldCheck, 
  UploadCloud, 
  LayoutDashboard, 
  ShoppingBag, 
  Info,
  Layers
} from "lucide-react";
import { MOCK_USER } from "../data/mockData";

export default function Navbar({ balance = MOCK_USER.cleanToBalance }) {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Overview" },
    { to: "/submit", label: "Submit Cleanup", highlight: true },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/validator", label: "Validate" },
    { to: "/redeem", label: "Redeem" },
    { to: "/about", label: "About & Proof" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F0] border-b border-[#D9DCE1] transition-colors">
      
      {/* Top Editorial Utility Rule */}
      <div className="border-b border-[#E5E7EB] bg-[#ECE9E2] text-[11px] font-mono text-[#525252] px-4 py-1 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <span>CIVIC CLEANUP VERIFICATION &middot; PERMISSIONED CONSORTIUM LEDGER</span>
          <span className="hidden sm:inline-block">REVIEW II SPEC &middot; ZERO OPEN SPECULATION</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Wordmark & Geometric Symbol */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-sm bg-[#171717] text-[#F7F5F0] flex items-center justify-center font-mono font-bold text-sm tracking-tighter group-hover:bg-[#E84C32] transition-colors">
            CT
          </div>
          <div className="text-left">
            <span className="font-bold text-lg text-[#171717] tracking-tight font-sans">Clean<span className="text-[#E84C32]">TO</span></span>
            <span className="block text-[9px] font-mono uppercase text-[#737373] -mt-1 tracking-widest">Remediation Ledger</span>
          </div>
        </Link>

        {/* Desktop Nav Links (Editorial underline for active) */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "text-[#171717]"
                    : item.highlight
                    ? "text-[#E84C32] hover:text-[#C73820]"
                    : "text-[#525252] hover:text-[#171717]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171717]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Ledger Balance Chip + Submit Action */}
        <div className="flex items-center gap-3">
          
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#D9DCE1] bg-white text-xs font-mono text-[#171717] hover:border-[#171717] transition-all shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#66724B]" />
            <span className="font-semibold">{balance}</span>
            <span className="text-[#737373]">CleanTO</span>
          </Link>

          <Link
            to="/submit"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#E84C32] hover:bg-[#D03C24] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            Submit Cleanup
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-sm border border-[#D9DCE1] bg-white text-[#171717]"
            aria-label="Toggle Navigation"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-[#D9DCE1] bg-[#F7F5F0] px-4 py-4 space-y-3 text-left">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileOpen(false)}
              className={`block py-2 text-sm font-semibold uppercase tracking-wider ${
                location.pathname === item.to ? "text-[#E84C32] font-bold" : "text-[#525252]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#D9DCE1]">
            <Link
              to="/submit"
              onClick={() => setIsMobileOpen(false)}
              className="w-full block text-center py-2.5 rounded-sm bg-[#E84C32] text-white text-xs font-bold uppercase tracking-wider"
            >
              Submit Cleanup Claim
            </Link>
          </div>
        </div>
      )}

    </header>
  );
}
