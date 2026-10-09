import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ArrowUpRight, 
  Camera, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Coins, 
  Check, 
  Lock, 
  FileCheck, 
  FileText,
  Clock, 
  MapPin, 
  AlertCircle,
  Fingerprint,
  CheckCircle2,
  Layers,
  Split,
  Award
} from "lucide-react";
import StatCounter from "../components/StatCounter";
import { MOCK_SUBMISSIONS } from "../data/mockData";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("split"); // 'before' | 'after' | 'split'

  const steps = [
    {
      num: "01",
      title: "Capture Before",
      desc: "Contributor photographs the contaminated site with locked GPS coordinates and hardware timestamp.",
      tag: "Tamper-Proof Metadata",
    },
    {
      num: "02",
      title: "Complete Cleanup",
      desc: "Citizen performs waste removal. System enforces a minimum time interval to eliminate staged fraud.",
      tag: "Enforced Interval",
    },
    {
      num: "03",
      title: "Capture After",
      desc: "Contributor captures the restored area from the same vantage angle for comparative evaluation.",
      tag: "Angle Alignment",
    },
    {
      num: "04",
      title: "AI & Validator Audit",
      desc: "Perceptual hashing screens duplicates; neural models score delta; borderline cases route to human delegates.",
      tag: "Dual Verification",
    },
    {
      num: "05",
      title: "Earn CleanTO",
      desc: "Cryptographic proof committed to consortium ledger; non-speculative utility points credited to wallet.",
      tag: "Immutable Ledger",
    },
  ];

  const pillars = [
    {
      title: "Evidence-Based Rewards",
      desc: "CleanTO is never distributed based on self-reported assertions. Only physically demonstrated, volumetric waste removals qualify for credit.",
      icon: FileCheck,
    },
    {
      title: "Dual AI & Human Review",
      desc: "High-confidence transformations auto-resolve in seconds. Ambiguous or borderline submissions escalate to multi-signature human validator consensus.",
      icon: Cpu,
    },
    {
      title: "Fraud & Duplicate Resistance",
      desc: "Perceptual visual fingerprints (pHash/dHash) defeat image reuse, web downloads, cropped submissions, and staged trash dumping.",
      icon: Lock,
    },
    {
      title: "Transparent Reward Records",
      desc: "Every issued point traces back to an immutable ledger transaction with IPFS evidence hashes, open to audit by municipal partners.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-20 pb-20 text-left">
      
      {/* 1. HERO SECTION (EDITORIAL ASYMMETRIC WITH POLISHED DEPTH) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Editorial Text Column */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#ECE9E2] border border-[#D9DCE1] text-[#171717] font-mono text-[11px] font-bold uppercase tracking-wider shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <span className="w-2 h-2 rounded-full bg-[#E84C32] animate-pulse" />
              Civic Infrastructure &middot; Proof-of-Remediation
            </div>

            {/* Balanced 2-line Headline (No orphan words) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-[#171717] tracking-tight leading-[1.12]">
              Turn real cleanup <br className="hidden sm:inline" />
              <span className="text-[#E84C32]">into verified reward.</span>
            </h1>

            <p className="text-[#525252] text-base sm:text-lg leading-relaxed max-w-xl">
              CleanTO combines computer-vision verification with a Delegated Proof-of-Stake validator network on a private consortium blockchain. Real environmental effort, provably distinct cleanups, zero scam potential.
            </p>

            {/* Confident Matching CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                to="/submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm bg-[#E84C32] hover:bg-[#D03C24] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(232,76,50,0.25)] hover:shadow-[0_6px_16px_rgba(232,76,50,0.35)] active:translate-y-0.5"
              >
                Submit a Cleanup
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm bg-white hover:bg-[#F4F3EF] border-2 border-[#171717] text-[#171717] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md active:translate-y-0.5"
              >
                See How Verification Works
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Indicators with Crisp Line Icons */}
            <div className="pt-6 border-t border-[#D9DCE1] grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] text-[#525252]">
              <div className="flex items-start gap-3 p-3 rounded-sm bg-white border border-[#E5E3DD] shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
                <div className="p-1.5 rounded-sm bg-[#ECE9E2] text-[#171717] shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <div>
                  <strong className="block text-[#171717] font-sans text-xs font-bold uppercase tracking-wider">Tamper-Proof</strong>
                  <span>Hardware GPS &amp; UTC</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-sm bg-white border border-[#E5E3DD] shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
                <div className="p-1.5 rounded-sm bg-[#ECE9E2] text-[#171717] shrink-0 mt-0.5">
                  <Fingerprint className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <div>
                  <strong className="block text-[#171717] font-sans text-xs font-bold uppercase tracking-wider">Algorithmic</strong>
                  <span>pHash Deduplication</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-sm bg-white border border-[#E5E3DD] shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
                <div className="p-1.5 rounded-sm bg-[#ECE9E2] text-[#171717] shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <div>
                  <strong className="block text-[#171717] font-sans text-xs font-bold uppercase tracking-wider">Audited</strong>
                  <span>DPoS Stake Security</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Product Visualization (Physical Audit Evidence Placard) */}
          <div className="lg:col-span-6">
            <div className="border-2 border-[#171717] bg-white p-6 sm:p-7 shadow-[0_12px_36px_rgba(23,23,23,0.08)] rounded-sm space-y-6">
              
              {/* Evidence Document Header with Prominent Ledger Badge */}
              <div className="flex items-center justify-between border-b border-[#D9DCE1] pb-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#171717] tracking-wider">INSPECTION EVIDENCE RECORD</span>
                  <span className="text-[#737373] hidden sm:inline">#REC-2026-0891</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#EBF7EE] text-[#1E7E34] font-bold border border-[#86EFAC] uppercase text-[10px] tracking-wide shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  Ledger Confirmed
                </span>
              </div>

              {/* Interactive Before/After Evidence Viewer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-semibold text-[#525252]">Comparative Cleanup Imagery</span>
                  <div className="flex border border-[#D9DCE1] rounded-sm overflow-hidden font-mono text-[10px] bg-[#ECE9E2] p-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("split")}
                      className={`px-2.5 py-1 transition-colors rounded-sm ${activeTab === "split" ? "bg-[#171717] text-white font-bold" : "text-[#525252] hover:text-[#171717]"}`}
                    >
                      Side-by-Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("before")}
                      className={`px-2.5 py-1 transition-colors rounded-sm ${activeTab === "before" ? "bg-[#171717] text-white font-bold" : "text-[#525252] hover:text-[#171717]"}`}
                    >
                      Before
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("after")}
                      className={`px-2.5 py-1 transition-colors rounded-sm ${activeTab === "after" ? "bg-[#171717] text-white font-bold" : "text-[#525252] hover:text-[#171717]"}`}
                    >
                      After
                    </button>
                  </div>
                </div>

                {/* Evidence Image Container (Real Waste Cleanup Imagery) */}
                <div className="relative border border-[#171717] rounded-sm overflow-hidden bg-[#ECE9E2] shadow-inner">
                  {activeTab === "split" ? (
                    <div className="grid grid-cols-2 h-64 divide-x-2 divide-[#171717]">
                      {/* Before (Littered) */}
                      <div className="relative h-full overflow-hidden bg-slate-900">
                        <img
                          src="/images/cleanup_before.jpg"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80";
                          }}
                          alt="Contaminated Site Before Cleanup"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-[#B91C1C] text-white font-mono text-[9px] font-bold uppercase tracking-wider shadow">
                          Before: 42kg Litter
                        </div>
                      </div>
                      {/* After (Remediated) */}
                      <div className="relative h-full overflow-hidden bg-slate-900">
                        <img
                          src="/images/cleanup_after.jpg"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80";
                          }}
                          alt="Remediated Site After Cleanup"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-[#1E7E34] text-white font-mono text-[9px] font-bold uppercase tracking-wider shadow">
                          After: Remediated
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-64">
                      <img
                        src={
                          activeTab === "before"
                            ? "/images/cleanup_before.jpg"
                            : "/images/cleanup_after.jpg"
                        }
                        onError={(e) => {
                          e.currentTarget.src = activeTab === "before"
                            ? "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80"
                            : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80";
                        }}
                        alt="Cleanup Transformation Evidence"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-sm font-mono text-[10px] font-bold uppercase tracking-wider shadow text-white"
                        style={{ backgroundColor: activeTab === "before" ? "#B91C1C" : "#1E7E34" }}
                      >
                        {activeTab === "before" ? "Phase 1: Contaminated Site" : "Phase 2: Post-Cleanup Area"}
                      </div>
                    </div>
                  )}

                  {/* Physical Verification Stamp */}
                  <div className="absolute top-3 right-3 stamp-olive px-3 py-1.5 rounded-sm rotate-1 shadow font-mono text-center bg-white/90 backdrop-blur-xs">
                    <span className="block text-[9px] uppercase font-extrabold tracking-widest text-[#4D5737]">
                      &bull; AUDITED CLEANUP &bull;
                    </span>
                    <span className="block text-[8px] text-[#66724B] font-bold">
                      RECORD #0891
                    </span>
                  </div>

                  {/* Bottom Image Metadata Tag */}
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-sm bg-[#171717]/90 text-white font-mono text-[10px] flex items-center gap-2 backdrop-blur-xs shadow">
                    <MapPin className="w-3 h-3 text-[#E84C32]" />
                    <span>Riverbank Ward 12 &middot; 12.9716° N, 79.1585° E</span>
                  </div>
                </div>
              </div>

              {/* Redesigned Elevated Stats Row (Visual Focal Point of Card) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. AI Delta Score Mini-Card */}
                <div className="p-3.5 rounded-sm bg-[#FAFAF8] border border-[#E5E3DD] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">AI Delta Score</span>
                    {/* Progress Circle Visual */}
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-[#D9DCE1]"
                          strokeWidth="4"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[#1E7E34]"
                          strokeDasharray="94.2, 100"
                          strokeWidth="4"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[#171717] font-sans">94.2</span>
                    <span className="text-xs font-bold text-[#1E7E34] font-mono">%</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#4D5737] block mt-1 font-semibold">
                    ✓ High reduction
                  </span>
                </div>

                {/* 2. pHash Match Mini-Card */}
                <div className="p-3.5 rounded-sm bg-[#FAFAF8] border border-[#E5E3DD] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">pHash Match</span>
                    <Fingerprint className="w-3.5 h-3.5 text-[#4D5737]" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[#171717] font-sans">0.02</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#1E7E34] block mt-1 font-semibold">
                    ✓ Verified unique
                  </span>
                </div>

                {/* 3. Reward Issued Mini-Card (Vivid Orange Focal Accent) */}
                <div className="p-3.5 rounded-sm bg-[#FDF7F5] border border-[#F2C4BC] shadow-[0_2px_8px_rgba(232,76,50,0.08)] hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-[#C73820] font-bold uppercase tracking-wider">Reward Issued</span>
                    <Coins className="w-3.5 h-3.5 text-[#E84C32]" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[#E84C32] font-mono">+45.0</span>
                    <span className="text-[11px] font-bold text-[#171717] font-sans">CleanTO</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#E84C32] block mt-1 font-semibold">
                    Consensus minted
                  </span>
                </div>

              </div>

              {/* Receipt Footer with Bold Monospace Tx Hash Trust Signal */}
              <div className="border-t border-[#D9DCE1] pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[#737373] uppercase text-[10px]">Ledger Tx:</span>
                  <span className="font-mono font-bold text-[#171717] bg-[#F2EFE9] border border-[#D9DCE1] px-2 py-0.5 rounded-sm">
                    0xa129...4373
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" title="Confirmed On-Chain" />
                </div>
                <Link to="/submit" className="text-[#E84C32] font-bold hover:underline flex items-center gap-1">
                  Test Verification Flow &rarr;
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. LIVE IMPACT METRICS (BORDERED LEDGER BAND WITH ELEVATED CARDS) */}
      <section className="border-y border-[#D9DCE1] bg-[#ECE9E2] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#D9DCE1]">
            
            <div className="space-y-1 md:px-4">
              <span className="text-[11px] font-mono uppercase text-[#737373]">Waste Cleared</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#171717] font-sans">
                <StatCounter end={12480} suffix=" kg" />
              </p>
              <p className="text-xs text-[#525252]">Physically weighed &amp; verified</p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:px-4">
              <span className="text-[11px] font-mono uppercase text-[#737373]">Confirmed Cleanups</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#171717] font-sans">
                <StatCounter end={3240} suffix="+" />
              </p>
              <p className="text-xs text-[#525252]">Dual-stage audit approval</p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:px-4">
              <span className="text-[11px] font-mono uppercase text-[#737373]">Active Validators</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#171717] font-sans">
                <StatCounter end={857} suffix=" Delegates" />
              </p>
              <p className="text-xs text-[#525252]">Collateral-staked peer reviewers</p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:px-4">
              <span className="text-[11px] font-mono uppercase text-[#737373]">Consensus Confidence</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#66724B] font-sans">
                <StatCounter end={98} suffix=".4%" />
              </p>
              <p className="text-xs text-[#525252]">Zero proven dispute rate</p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. HOW VERIFICATION WORKS (5-STEP SEQUENCE WITH PROGRESS PATH) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E84C32]">
            Sequential Pipeline
          </span>
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">
            How Verification Operates at Every Step
          </h2>
          <p className="text-[#525252] text-sm max-w-2xl">
            A five-stage chain of custody ensuring that community waste cleanup is authenticated before points are minted.
          </p>
        </div>

        {/* 5-Step Connected Flow Grid with Elevation */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="p-5 border border-[#D9DCE1] rounded-sm bg-white shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-3 flex flex-col justify-between hover:border-[#171717] hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-[#D9DCE1] pb-2">
                  <span className="font-mono font-bold text-xs text-[#E84C32]">{step.num}</span>
                  <span className="text-[10px] font-mono text-[#737373] uppercase">{step.tag}</span>
                </div>
                <h3 className="text-sm font-bold text-[#171717] font-sans">{step.title}</h3>
                <p className="text-xs text-[#525252] leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-3 border-t border-[#F7F5F0] text-[10px] font-mono text-[#737373]">
                Stage {idx + 1} of 5
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHY CLEANTO (4 FOCUSED FEATURE BLOCKS WITH DEPTH) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E84C32]">
            Architectural Guarantees
          </span>
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight">
            Designed to Make Cheating Economically Irrational
          </h2>
          <p className="text-[#525252] text-sm max-w-2xl">
            Centralized volunteer portals fail because photo reuse and staged cleanups cannot be prevented by simple administrative review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 border-2 border-[#D9DCE1] rounded-sm bg-white space-y-3 hover:border-[#171717] shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-[#ECE9E2] text-[#171717] flex items-center justify-center">
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <h4 className="text-base font-bold text-[#171717]">{p.title}</h4>
                </div>
                <p className="text-xs text-[#525252] leading-relaxed pl-11">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. PROOF / RECENT ACTIVITY LEDGER STREAM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9DCE1] pb-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#66724B]">
              Immutable Audit Trail
            </span>
            <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight">
              Recent Verified Activity Stream
            </h2>
          </div>
          <Link
            to="/dashboard"
            className="text-xs font-mono text-[#E84C32] font-bold hover:underline self-start sm:self-auto"
          >
            View Full Historical Ledger &rarr;
          </Link>
        </div>

        <div className="border border-[#D9DCE1] rounded-sm overflow-hidden bg-white shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-[#D9DCE1] bg-[#ECE9E2] text-[#525252] font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Record Ref</th>
                  <th className="py-3 px-4">Location / Area</th>
                  <th className="py-3 px-4">Waste Mass</th>
                  <th className="py-3 px-4">AI Confidence</th>
                  <th className="py-3 px-4">Ledger Status</th>
                  <th className="py-3 px-4">CleanTO Credited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#171717]">
                {MOCK_SUBMISSIONS.slice(0, 4).map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#F7F5F0] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold">{rec.id}</td>
                    <td className="py-3.5 px-4">{rec.location}</td>
                    <td className="py-3.5 px-4 font-mono">{rec.weightKg} kg</td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={rec.confidence >= 75 ? "text-[#4D5737] font-bold" : "text-[#B91C1C]"}>
                        {rec.confidence}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-sm ${
                        rec.verdict === "pass"
                          ? "bg-[#F0F2EB] text-[#4D5737] border border-[#66724B]/30"
                          : "bg-[#FDF2F0] text-[#B91C1C] border border-[#B91C1C]/30"
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#E84C32]">
                      {rec.reward > 0 ? `+${rec.reward} CleanTO` : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. FINAL FULL-WIDTH CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-2 border-[#171717] bg-[#171717] text-[#F7F5F0] p-10 sm:p-14 rounded-sm text-center space-y-6 shadow-[0_12px_40px_rgba(23,23,23,0.18)]">
          <div className="max-w-xl mx-auto space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E84C32]">
              Civic Stewardship
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Your next cleanup can become verified impact.
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Capture before and after photos of any public site. Let the pipeline verify the integrity of your effort and issue auditable civic reward credits.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-sm bg-[#E84C32] hover:bg-[#D03C24] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md hover:shadow-lg active:translate-y-0.5"
            >
              Start Cleaning
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
