import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t-2 border-[#171717] bg-[#ECE9E2] text-[#525252] text-xs mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-left">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#D9DCE1]">
          
          {/* Col 1: Masthead & Purpose */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm bg-[#171717] text-white flex items-center justify-center font-mono font-bold text-xs">
                CT
              </div>
              <span className="font-bold text-base text-[#171717]">CleanTO Remediation Ledger</span>
            </div>
            
            <p className="text-[#525252] text-xs leading-relaxed max-w-md">
              A verifiable public-action infrastructure combining computer-vision validation and a Delegated Proof-of-Stake consensus ledger to establish transparent accountability for real-world environmental cleanups.
            </p>

            <div className="pt-2 font-mono text-[11px] text-[#171717] flex flex-wrap gap-4">
              <span>LEDGER SPEC: v1.02</span>
              <span>&middot;</span>
              <span>CHAIN: Private EVM (PoA)</span>
              <span>&middot;</span>
              <span>STORAGE: IPFS CIDs</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="font-mono text-[11px] font-bold text-[#171717] uppercase tracking-wider mb-3">
              Application Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/submit" className="hover:text-[#171717] transition-colors">Submit Cleanup Claim</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#171717] transition-colors">Contributor Wallet &amp; Ledger</Link></li>
              <li><Link to="/validator" className="hover:text-[#171717] transition-colors">Validator Consensus Desk</Link></li>
              <li><Link to="/redeem" className="hover:text-[#171717] transition-colors">Redemption Marketplace</Link></li>
              <li><Link to="/about" className="hover:text-[#171717] transition-colors">Architecture &amp; Consensus Model</Link></li>
            </ul>
          </div>

          {/* Col 3: Academic & Team Attribution */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="font-mono text-[11px] font-bold text-[#171717] uppercase tracking-wider mb-3">
              Project Governance
            </h4>
            <div className="p-3.5 rounded-sm bg-[#F7F5F0] border border-[#D9DCE1] space-y-1.5 font-mono text-[11px]">
              <div className="text-[#171717] font-semibold">Innovative Design Project (Review II)</div>
              <div className="text-[#525252]">Guide: Prof. Geetha S. (SCOPE)</div>
              <div className="text-[#737373] text-[10px] pt-1">
                Saumya Pandya (25BCE5069) &middot; Vaibhav Bisaria (25BCE1975) &middot; Harshit Mishra (25BCE5013)
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Regulatory Note */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono text-[#737373]">
          <p>© 2026 CleanTO Project. Built for verifiable environmental action.</p>
          <p className="max-w-xl text-left sm:text-right">
            CleanTO is a civic utility point. It does not constitute a security, cryptocurrency, or open tradeable asset.
          </p>
        </div>

      </div>
    </footer>
  );
}
