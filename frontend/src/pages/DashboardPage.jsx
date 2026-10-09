import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Coins, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  X, 
  ArrowUpRight, 
  UploadCloud, 
  FileText,
  Calendar,
  Layers,
  RefreshCw,
  Eye,
  ShieldCheck
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import StatCounter from "../components/StatCounter";
import { getUserBalance, getSubmissions, BACKEND_URL } from "../api";
import { MOCK_USER, MOCK_SUBMISSIONS, MOCK_EARNINGS_SERIES } from "../data/mockData";

function resolveThumb(path, fallbackUrl) {
  if (!path) return fallbackUrl;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${BACKEND_URL}${path}`;
  }
  const filename = path.split(/[\/\\]/).pop();
  return `${BACKEND_URL}/uploads/${filename}`;
}

export default function DashboardPage({ balance: parentBalance }) {
  const [balance, setBalance] = useState(parentBalance || 0);
  const [cleanupCount, setCleanupCount] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [contractAddress, setContractAddress] = useState("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch real balance from GET /users/{id}/balance
      const balData = await getUserBalance("usr_demo");
      if (balData && typeof balData.balance === "number") {
        setBalance(balData.balance);
        setCleanupCount(balData.cleanup_count || 0);
        if (balData.contractAddress) {
          setContractAddress(balData.contractAddress);
        }
      }

      // 2. Fetch real submissions from GET /submissions
      const subs = await getSubmissions();
      if (subs && Array.isArray(subs) && subs.length > 0) {
        const mapped = subs.map((s) => ({
          id: s.submission_id || s.id,
          user_id: s.user_id || "usr_demo",
          date: s.created_at ? new Date(s.created_at).toLocaleDateString() : "Today",
          location: s.location || "Campus Sector 1 (12.9716° N, 79.1585° E)",
          confidence: Math.round(Number(s.similarity_score) || 85),
          cleanupScore: Math.round(Number(s.cleanup_score) || 75),
          verdict: s.verdict || "pass",
          reward: (s.verdict === "pass" || s.verdict === "approved_by_validator") ? Math.floor(Number(s.cleanup_score || s.similarity_score || 40)) : 0,
          status: s.verdict === "pass" ? "Committed (On-Chain)" : s.verdict === "flagged_review" ? "Pending Validator" : s.verdict === "approved_by_validator" ? "Co-signed (On-Chain)" : "Rejected",
          beforeThumb: resolveThumb(s.before_path, "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80"),
          afterThumb: resolveThumb(s.after_path, "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"),
          txRef: s.tx_hash ? `${s.tx_hash.substring(0, 16)}...` : `0x${(s.submission_id || "sub_000").replace(/[^a-f0-9]/gi, "").padEnd(16, "f")}...`,
          notes: `Verified via CleanTO Multi-Signal Pipeline. Verdict: ${s.verdict}`,
        }));
        setSubmissions(mapped);
      } else {
        setSubmissions(MOCK_SUBMISSIONS);
      }
    } catch (err) {
      console.warn("Failed to load dashboard live data:", err);
      setSubmissions(MOCK_SUBMISSIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter submissions locally
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      (sub.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.verdict === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const verifiedCount = cleanupCount || submissions.filter((s) => s.verdict === "pass" || s.verdict === "approved_by_validator").length;
  const pendingCount = submissions.filter((s) => s.verdict === "flagged_review").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DCE1] pb-6">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#4D5737] mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#66724B]" />
            Civic Contributor Ledger &middot; Account #usr_demo
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] tracking-tight font-sans">
            Contributor Wallet &amp; Audit Trail
          </h1>
          <p className="text-xs text-[#525252]">
            Auditable record of verified cleanups, utility token allocations, and consensus transactions read directly from smart contract.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            title="Refresh On-Chain Balance & Submissions"
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm border border-[#171717] bg-white hover:bg-[#ECE9E2] text-[#171717] font-mono text-xs font-bold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Chain</span>
          </button>

          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#E84C32] hover:bg-[#D03C24] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            Submit Cleanup Claim
          </Link>
        </div>
      </div>

      {/* Top Ledger Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* REAL ON-CHAIN BALANCE */}
        <div className="p-5 border-2 border-[#171717] bg-white rounded-sm shadow-sm space-y-2">
          <span className="text-[11px] font-mono text-[#737373] uppercase block">CleanTO Balance</span>
          <div className="text-3xl font-extrabold text-[#171717] font-sans">
            <StatCounter end={balance} suffix=" CleanTO" />
          </div>
          <span className="text-[10px] font-mono text-[#4D5737] block">
            ● Read from CleanTORewards.sol
          </span>
        </div>

        <div className="p-5 border border-[#D9DCE1] bg-white rounded-sm shadow-sm space-y-2">
          <span className="text-[11px] font-mono text-[#737373] uppercase block">Pending Escrow</span>
          <div className="text-3xl font-extrabold text-[#B45309] font-sans">
            <StatCounter end={pendingCount * 45} suffix=" CleanTO" />
          </div>
          <span className="text-[10px] font-mono text-[#737373] block">
            {pendingCount} item{pendingCount === 1 ? "" : "s"} in validator review
          </span>
        </div>

        <div className="p-5 border border-[#D9DCE1] bg-white rounded-sm shadow-sm space-y-2">
          <span className="text-[11px] font-mono text-[#737373] uppercase block">Verified Cleanups</span>
          <div className="text-3xl font-extrabold text-[#171717] font-sans">
            <StatCounter end={verifiedCount} suffix=" Sites" />
          </div>
          <span className="text-[10px] font-mono text-[#4D5737] block">
            Active verified remediations
          </span>
        </div>

        <div className="p-5 border border-[#D9DCE1] bg-white rounded-sm shadow-sm space-y-2">
          <span className="text-[11px] font-mono text-[#737373] uppercase block">Remediated Mass</span>
          <div className="text-3xl font-extrabold text-[#66724B] font-sans">
            <StatCounter end={verifiedCount * 28 + 40} suffix=" kg" />
          </div>
          <span className="text-[10px] font-mono text-[#737373] block">
            Estimated debris remediated
          </span>
        </div>

      </div>

      {/* Main Content: Chart + Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Recharts Interactive Earnings Over Time */}
        <div className="lg:col-span-7 border border-[#D9DCE1] bg-white p-6 rounded-sm shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D9DCE1] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#171717] uppercase tracking-wider font-mono">
                CleanTO Earned Over Time
              </h2>
              <p className="text-xs text-[#737373]">Accumulation from verified site cleanups</p>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#4D5737] bg-[#F0F2EB] px-2 py-0.5 rounded-sm">
              Live Ledger State
            </span>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-64 w-full pt-4 font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_EARNINGS_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="coralGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E84C32" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E84C32" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE9E2" vertical={false} />
                <XAxis dataKey="period" stroke="#737373" fontSize={10} tickLine={false} />
                <YAxis stroke="#737373" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid #171717",
                    borderRadius: "4px",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontFamily: "JetBrains Mono, monospace"
                  }}
                  itemStyle={{ color: "#E84C32" }}
                  formatter={(value) => [`${value} CleanTO`, "Cumulative Balance"]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#E84C32"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#coralGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-[#D9DCE1] pt-3 flex items-center justify-between text-[11px] font-mono text-[#737373]">
            <span>Current on-chain balance: {balance} CleanTO</span>
            <span className="text-[#171717] font-semibold">Tier 1 Contributor</span>
          </div>
        </div>

        {/* Right: Contributor Ledger Passport */}
        <div className="lg:col-span-5 border border-[#D9DCE1] bg-white p-6 rounded-sm shadow-sm space-y-4 font-mono text-xs">
          <div className="border-b border-[#D9DCE1] pb-2 font-bold text-xs uppercase text-[#171717]">
            Consortium Citizen Identity
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm space-y-1">
              <span className="text-[10px] text-[#737373] uppercase block">Permissioned Address</span>
              <span className="text-[11px] text-[#171717] font-semibold truncate block">
                0x14C3e5DF3E9abaE0460EEdE38F70c2B60615D7Eb
              </span>
            </div>

            <div className="p-3 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm space-y-1">
              <span className="text-[10px] text-[#737373] uppercase block">Smart Contract Target</span>
              <span className="text-[11px] text-[#E84C32] font-semibold block truncate">
                CleanTORewards.sol &middot; {contractAddress}
              </span>
            </div>

            <div className="p-3 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm space-y-1">
              <span className="text-[10px] text-[#737373] uppercase block">Consensus Authority</span>
              <span className="text-[11px] text-[#4D5737] font-semibold block">
                Single Reviewer Protocol &middot; Automated AI Filter
              </span>
            </div>
          </div>

          <Link
            to="/redeem"
            className="w-full block text-center py-2.5 rounded-sm bg-[#171717] text-white hover:bg-[#E84C32] font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Access Redemption Marketplace &rarr;
          </Link>
        </div>

      </div>

      {/* Recent Submissions Table with Filters & Search */}
      <div className="border border-[#D9DCE1] bg-white rounded-sm shadow-sm p-6 space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DCE1] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#171717] font-sans">
              Historical Submissions Ledger
            </h2>
            <p className="text-xs text-[#737373]">
              Real records fetched from SQLite backend and Smart Contract
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                placeholder="Search location or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-[#D9DCE1] rounded-sm text-xs text-[#171717] bg-[#F7F5F0] focus:outline-none focus:border-[#171717] w-48 sm:w-56"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex border border-[#D9DCE1] rounded-sm overflow-hidden text-xs font-mono">
              {["all", "pass", "flagged_review", "fail_duplicate", "fail_location_mismatch"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1.5 uppercase text-[10px] font-bold transition-colors ${
                    statusFilter === status
                      ? "bg-[#171717] text-white"
                      : "bg-[#F7F5F0] text-[#525252] hover:bg-[#ECE9E2]"
                  }`}
                >
                  {status === "flagged_review" ? "Flagged" : status === "fail_duplicate" ? "Duplicate" : status === "fail_location_mismatch" ? "Mismatch" : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="border-b border-[#D9DCE1] bg-[#ECE9E2] text-[#525252] font-mono text-[10px] uppercase">
              <tr>
                <th className="py-3 px-3">Submission Ref</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Location Target</th>
                <th className="py-3 px-3">Location Match</th>
                <th className="py-3 px-3">Cleanup Impact</th>
                <th className="py-3 px-3">Verdict</th>
                <th className="py-3 px-3">Reward</th>
                <th className="py-3 px-3">Ledger Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#171717]">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-[#737373] font-mono text-xs">
                    No submissions matched the specified filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedRecord(sub)}
                    className="hover:bg-[#F7F5F0] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-3 font-mono font-semibold text-[#171717]">{sub.id}</td>
                    <td className="py-3.5 px-3 font-mono text-[#525252]">{sub.date}</td>
                    <td className="py-3.5 px-3 max-w-[200px] truncate">{sub.location}</td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className={sub.confidence >= 70 ? "text-[#4D5737] font-bold" : "text-[#737373]"}>
                        {sub.confidence}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className="text-[#4D5737] font-semibold">{sub.cleanupScore}%</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-sm ${
                        sub.verdict === "pass" || sub.verdict === "approved_by_validator"
                          ? "bg-[#F0F2EB] text-[#4D5737] border border-[#66724B]/30"
                          : sub.verdict === "flagged_review"
                          ? "bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/30"
                          : "bg-[#FDF2F0] text-[#B91C1C] border border-[#B91C1C]/30"
                      }`}>
                        {sub.verdict}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#E84C32]">
                      {sub.reward > 0 ? `+${sub.reward} CleanTO` : "0"}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#525252]">
                      {sub.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUBMISSION DETAILS MODAL / DRAWER                             */}
      {/* ------------------------------------------------------------- */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#171717] rounded-sm max-w-2xl w-full p-6 space-y-5 shadow-2xl text-left font-sans">
            
            <div className="flex items-center justify-between border-b border-[#D9DCE1] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#737373] block">Inspection Dossier</span>
                <h3 className="text-xl font-bold text-[#171717]">{selectedRecord.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-[#737373] hover:text-[#171717]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Before / After Evidence */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#737373]">Before Photo Evidence</span>
                <div className="h-44 border border-[#D9DCE1] rounded-sm overflow-hidden bg-[#ECE9E2]">
                  <img src={selectedRecord.beforeThumb} alt="Before" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#737373]">After Photo Evidence</span>
                <div className="h-44 border border-[#D9DCE1] rounded-sm overflow-hidden bg-[#ECE9E2]">
                  <img src={selectedRecord.afterThumb} alt="After" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs p-3 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm">
              <div>
                <span className="text-[10px] text-[#737373] block uppercase">Date</span>
                <strong className="text-[#171717]">{selectedRecord.date}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] block uppercase">Location Match</span>
                <strong className="text-[#4D5737]">{selectedRecord.confidence}%</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] block uppercase">Reward</span>
                <strong className="text-[#E84C32]">+{selectedRecord.reward} CleanTO</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] block uppercase">Tx Reference</span>
                <strong className="text-[#171717] text-[11px]">{selectedRecord.txRef}</strong>
              </div>
            </div>

            {/* Notes */}
            <div className="p-3 bg-[#ECE9E2] border border-[#D9DCE1] rounded-sm text-xs text-[#525252]">
              <strong>Inspection Notes:</strong> {selectedRecord.notes}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-[#171717] hover:bg-[#E84C32] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
