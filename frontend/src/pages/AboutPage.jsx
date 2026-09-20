import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  ArrowDown, 
  Cpu, 
  ShieldCheck, 
  Coins, 
  Lock, 
  Scale, 
  HelpCircle,
  FileCheck,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function AboutPage() {
  const roadmapItems = [
    {
      phase: "Milestone 20% (Review II — Active)",
      status: "Functional Now",
      items: [
        "Before & After photo pair upload with drag-and-drop",
        "Hardware GPS telemetry and UTC timestamp lock",
        "POST /submit multipart request integration",
        "Dual-pipeline response handling (Pass, Fail, Duplicate)",
        "Standalone CleanTORewards smart contract with authorized recorder on local EVM",
      ],
    },
    {
      phase: "Phase 2 (Milestone 50%)",
      status: "Next Integration",
      items: [
        "Live IPFS CID pinning for all uploaded photo binaries",
        "Trained litter density segmentation model with IoU scoring",
        "Automated backend orchestration for DPoS validator assignment",
        "Live wallet balance synchronization with consortium chain RPC",
      ],
    },
    {
      phase: "Phase 3 (Final Full Rollout)",
      status: "Production Scope",
      items: [
        "On-chain validator collateral staking and automated slashing contracts",
        "Municipal government impact dashboards & priority cleanup zones",
        "Digital redemption settlement with city transit and retail voucher APIs",
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-left">
      
      {/* Title & Introduction */}
      <div className="border-b border-[#D9DCE1] pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#E84C32] uppercase tracking-wider">
          System Architecture &middot; Civic Whitepaper
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171717] tracking-tight leading-tight">
          Verifiable Civic Environmental Remediation at Scale
        </h1>
        <p className="text-base sm:text-lg text-[#525252] leading-relaxed">
          Why community cleanup volunteerism plateaus, why simple "photo upload" portals fail, and how CleanTO establishes tamper-evident proof before minting utility points.
        </p>
      </div>

      {/* The Core Problem */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight font-sans">
          The Problem: Environmental Work is Difficult to Verify
        </h2>
        <div className="p-6 border-l-4 border-[#171717] bg-white border border-[#D9DCE1] rounded-sm space-y-3 text-xs text-[#525252] leading-relaxed">
          <p>
            Community cleanup initiatives rely overwhelmingly on uncompensated good will. When institutions attempt to introduce financial incentives, systems are promptly overwhelmed by three forms of exploitation:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 font-medium text-[#171717]">
            <li><strong>Photo Recycling:</strong> Users upload existing cleanup photos downloaded from forums or social media.</li>
            <li><strong>Staged Remediation:</strong> Unethical actors deliberately litter a public spot, photograph it, immediately retrieve the trash, and claim a bounty.</li>
            <li><strong>Audit Bottlenecks:</strong> Centralized municipal administrators lack the time and tooling to manually verify thousands of photo submissions daily.</li>
          </ul>
        </div>
      </div>

      {/* The CleanTO Solution */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight font-sans">
          The CleanTO Solution: An Asymmetric Pipeline
        </h2>

        {/* Visual Workflow Diagram */}
        <div className="border-2 border-[#171717] bg-white p-6 sm:p-8 rounded-sm shadow-sm space-y-4 font-mono text-xs">
          
          <div className="p-4 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm flex items-center justify-between">
            <div>
              <span className="font-bold text-[#171717] block">1. User Evidence &amp; Telemetry Lock</span>
              <span className="text-[11px] text-[#737373]">Paired Before/After captures with device GPS and UTC clock lock</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#525252]">Client Layer</span>
          </div>

          <div className="flex justify-center text-[#737373]"><ArrowDown className="w-4 h-4" /></div>

          <div className="p-4 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm flex items-center justify-between">
            <div>
              <span className="font-bold text-[#171717] block">2. Algorithmic AI Assessment</span>
              <span className="text-[11px] text-[#737373]">Perceptual hash (pHash) screening + litter density delta scoring</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#E84C32]">Neural Model</span>
          </div>

          <div className="flex justify-center text-[#737373]"><ArrowDown className="w-4 h-4" /></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#F0F2EB] border border-[#66724B]/30 rounded-sm">
              <span className="text-[#4D5737] font-bold block text-xs">Clear High Delta (&ge;80%)</span>
              <p className="text-[10px] text-[#525252] mt-0.5">Automated approval; forwarded directly to ledger minting.</p>
            </div>
            <div className="p-3 bg-[#FDF9EE] border border-[#E5B83B]/40 rounded-sm">
              <span className="text-[#B88E1C] font-bold block text-xs">Borderline Delta (60–79%)</span>
              <p className="text-[10px] text-[#525252] mt-0.5">Escalated to 3 randomized collateral-staked human validators.</p>
            </div>
          </div>

          <div className="flex justify-center text-[#737373]"><ArrowDown className="w-4 h-4" /></div>

          <div className="p-4 bg-[#171717] text-white rounded-sm flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">3. CleanTORewards.sol Consortium Ledger</span>
              <span className="text-[11px] text-slate-300">Auditable transaction committed &amp; non-speculative points minted</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#66724B]">Private EVM</span>
          </div>

        </div>
      </div>

      {/* Why DPoS Validator Model is Planned */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight font-sans">
          Why Delegated Proof of Stake (DPoS)?
        </h2>
        <p className="text-xs text-[#525252] leading-relaxed">
          AI computer vision alone can produce false positives under varied lighting or camera angles. CleanTO solves this by establishing a decentralized tier of human validators who have built proven cleanup history.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-white border border-[#D9DCE1] rounded-sm space-y-1">
            <strong className="text-[#171717] block font-sans">Collateral Staking</strong>
            <p className="text-[11px] text-[#525252]">Validators lock CleanTO points as escrow when reviewing claims.</p>
          </div>
          <div className="p-4 bg-white border border-[#D9DCE1] rounded-sm space-y-1">
            <strong className="text-[#171717] block font-sans">Randomized Pool</strong>
            <p className="text-[11px] text-[#525252]">Borderline claims require multi-signature approval from uncoordinated peers.</p>
          </div>
          <div className="p-4 bg-white border border-[#D9DCE1] rounded-sm space-y-1">
            <strong className="text-[#B91C1C] block font-sans">Slashing Penalty</strong>
            <p className="text-[11px] text-[#525252]">Approving fraudulent claims results in immediate stake forfeiture.</p>
          </div>
        </div>
      </div>

      {/* Implementation Transparency: Functional vs Planned */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight font-sans">
          Milestone Status: Functional vs. Planned Scope
        </h2>
        <div className="space-y-4">
          {roadmapItems.map((phase, idx) => (
            <div key={idx} className="border border-[#D9DCE1] bg-white p-5 rounded-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#D9DCE1] pb-2 font-mono text-xs">
                <span className="font-bold text-[#171717]">{phase.phase}</span>
                <span className={`px-2 py-0.5 rounded-sm font-bold uppercase text-[10px] ${
                  phase.status === "Functional Now"
                    ? "bg-[#F0F2EB] text-[#4D5737] border border-[#66724B]/30"
                    : "bg-[#ECE9E2] text-[#737373]"
                }`}>
                  {phase.status}
                </span>
              </div>
              <ul className="text-xs text-[#525252] space-y-1.5 list-disc list-inside">
                {phase.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="pt-6 border-t border-[#D9DCE1] flex items-center justify-between">
        <Link
          to="/"
          className="text-xs font-mono font-bold text-[#525252] hover:text-[#171717]"
        >
          &larr; Return to Overview
        </Link>
        <Link
          to="/submit"
          className="px-6 py-3 rounded-sm bg-[#E84C32] hover:bg-[#D03C24] text-white text-xs font-mono font-bold uppercase tracking-wider"
        >
          Test Cleanup Verification
        </Link>
      </div>

    </div>
  );
}
