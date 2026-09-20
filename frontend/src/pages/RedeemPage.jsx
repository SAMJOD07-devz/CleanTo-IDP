import React, { useState } from "react";
import { 
  ShoppingBag, 
  Coins, 
  Search, 
  ArrowUpDown, 
  X, 
  Check, 
  AlertCircle,
  Clock,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_OFFERS, MOCK_USER } from "../data/mockData";

export default function RedeemPage({ balance = MOCK_USER.cleanToBalance, onRedeem }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' (lowest cost) | 'desc' (highest cost)
  const [activeOfferModal, setActiveOfferModal] = useState(null);

  const categories = ["All", "Transit", "Food", "Environmental", "Equipment", "Education", "Honorary"];

  // Filter & sort offers
  const filteredOffers = MOCK_OFFERS.filter((o) => {
    const matchesCategory = selectedCategory === "All" || o.category === selectedCategory;
    const matchesSearch = o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.partner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    return sortOrder === "asc" ? a.cost - b.cost : b.cost - a.cost;
  });

  const handleConfirmRedeem = (offer) => {
    if (balance < offer.cost) {
      toast.error("Insufficient CleanTO Balance", {
        description: `You have ${balance} CleanTO points. This offer requires ${offer.cost} CleanTO.`,
      });
      return;
    }

    onRedeem?.(offer.cost);
    setActiveOfferModal(null);
    toast.success("Voucher Redeemed Successfully", {
      description: `Debited ${offer.cost} CleanTO for "${offer.title}". Certificate issued to your account.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DCE1] pb-6">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#E84C32] mb-1">
            Capped Exchange &middot; Partner Redemptions
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] tracking-tight font-sans">
            Civic Reward Marketplace
          </h1>
          <p className="text-xs text-[#525252]">
            Exchange earned CleanTO utility points for public transit passes, co-op produce vouchers, and civic equipment.
          </p>
        </div>

        {/* Live Balance Pill */}
        <div className="p-3 bg-white border border-[#D9DCE1] rounded-sm font-mono text-xs flex items-center gap-3 shadow-sm self-start sm:self-auto">
          <span className="text-[#737373] uppercase text-[10px]">Your Balance:</span>
          <strong className="text-base text-[#171717]">{balance} CleanTO</strong>
        </div>
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[#171717] text-white"
                  : "bg-white text-[#525252] border border-[#D9DCE1] hover:border-[#171717]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Cost Sorter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              placeholder="Search partner or voucher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-[#D9DCE1] rounded-sm text-xs text-[#171717] bg-white focus:outline-none focus:border-[#171717] w-52"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DCE1] bg-white rounded-sm text-xs font-mono text-[#525252] hover:border-[#171717]"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>Cost: {sortOrder === "asc" ? "Low → High" : "High → Low"}</span>
          </button>
        </div>

      </div>

      {/* Offer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => {
          const canAfford = balance >= offer.cost;
          return (
            <div
              key={offer.id}
              className="border border-[#D9DCE1] bg-white rounded-sm p-6 flex flex-col justify-between hover:border-[#171717] transition-all shadow-sm space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2 font-mono text-[10px]">
                  <span className="text-[#E84C32] font-bold uppercase">{offer.partner}</span>
                  <span className="px-2 py-0.5 rounded-sm bg-[#ECE9E2] text-[#525252] uppercase">
                    {offer.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#171717] font-sans">
                  {offer.title}
                </h3>

                <p className="text-xs text-[#525252] leading-relaxed">
                  {offer.description}
                </p>

                <div className="text-[11px] font-mono text-[#737373] space-y-0.5 pt-1">
                  <div>Status: <span className="text-[#171717]">{offer.availability}</span></div>
                  <div>Partner: <span className="text-[#525252]">{offer.partnerTag}</span></div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-[#D9DCE1] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#737373] block">Cost</span>
                  <strong className="text-lg font-mono text-[#171717]">{offer.cost} CleanTO</strong>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveOfferModal(offer)}
                  className={`px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                    canAfford
                      ? "bg-[#171717] hover:bg-[#E84C32] text-white"
                      : "bg-[#ECE9E2] text-[#737373] cursor-not-allowed border border-[#D9DCE1]"
                  }`}
                >
                  {canAfford ? "Redeem" : "Insufficient"}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* REDEMPTION CONFIRMATION MODAL                                  */}
      {/* ------------------------------------------------------------- */}
      {activeOfferModal && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#171717] rounded-sm max-w-md w-full p-6 space-y-5 shadow-2xl text-left font-sans">
            
            <div className="flex items-center justify-between border-b border-[#D9DCE1] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#E84C32] font-bold block">
                  Confirm Redemption Transaction
                </span>
                <h3 className="text-lg font-bold text-[#171717]">{activeOfferModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveOfferModal(null)}
                className="text-[#737373] hover:text-[#171717]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#F7F5F0] border border-[#D9DCE1] rounded-sm space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#525252]">Partner Sponsor:</span>
                <strong className="text-[#171717]">{activeOfferModal.partner}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525252]">Redemption Cost:</span>
                <strong className="text-[#E84C32]">{activeOfferModal.cost} CleanTO</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525252]">Balance After:</span>
                <strong className="text-[#171717]">{balance - activeOfferModal.cost} CleanTO</strong>
              </div>
            </div>

            <p className="text-xs text-[#525252] leading-relaxed">
              Upon confirmation, the specified utility points will be deducted from your account. An institutional voucher token will be generated immediately.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveOfferModal(null)}
                className="px-4 py-2 border border-[#D9DCE1] text-xs font-mono font-bold text-[#525252] hover:bg-[#ECE9E2] rounded-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleConfirmRedeem(activeOfferModal)}
                className="px-5 py-2 bg-[#E84C32] hover:bg-[#D03C24] text-white text-xs font-mono font-bold uppercase rounded-sm transition-colors shadow-sm"
              >
                Confirm &amp; Debit Balance
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
