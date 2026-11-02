import React, { useState } from 'react';
import {
  Gift,
  Sparkles,
  ShoppingBag,
  Utensils,
  Film,
  Train,
  Leaf,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Award,
  AlertCircle,
  X,
} from 'lucide-react';
import { useImpact } from '../context/ImpactContext';
import { Voucher, RedeemedVoucher } from '../types/impact';

export const RewardsStore: React.FC = () => {
  const {
    vouchers,
    wallet,
    userLevel,
    redeemVoucher,
    latestRedeemedVoucher,
    setLatestRedeemedVoucher,
    setIsWalletModalOpen,
  } = useImpact();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState(false);

  const filteredVouchers = vouchers.filter((v) => {
    if (categoryFilter === 'all') return true;
    return v.category === categoryFilter;
  });

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'food':
        return <Utensils className="w-4 h-4" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4" />;
      case 'entertainment':
        return <Film className="w-4 h-4" />;
      case 'transit':
        return <Train className="w-4 h-4" />;
      case 'eco_charity':
        return <Leaf className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Rewards Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 border border-emerald-500/20 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/30 mb-3">
            <Gift className="w-3.5 h-3.5" />
            Civic Voucher Bazaar
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">
            Turn Real Community Impact Into Tangible Rewards
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Every verified civic action grants you impact points. Redeem your balance for food, e-commerce gift cards, transit passes, or sponsor tree plantings in your name.
          </p>

          {/* Current Impact Balance Card */}
          <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-emerald-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-300 font-medium">Available Impact Balance</div>
                <div className="text-2xl font-black text-white flex items-baseline gap-1">
                  <span>{wallet.points}</span>
                  <span className="text-xs text-emerald-400 uppercase tracking-wider font-bold">Points</span>
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-white/20 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-400/20 text-amber-300">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-300 font-medium">Civic Rank</div>
                <div className="text-sm font-bold text-white">{userLevel.title}</div>
              </div>
            </div>

            <div className="ml-auto">
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-colors"
              >
                View Wallet History
              </button>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Rewards' },
          { id: 'food', label: 'Food & Dining' },
          { id: 'shopping', label: 'Shopping & E-Gift' },
          { id: 'entertainment', label: 'Entertainment' },
          { id: 'transit', label: 'Green Transit' },
          { id: 'eco_charity', label: 'Eco & Donations' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              categoryFilter === tab.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVouchers.map((voucher) => {
          const hasEnough = wallet.points >= voucher.pointsCost;
          const pointsNeeded = voucher.pointsCost - wallet.points;

          return (
            <div
              key={voucher.id}
              className="flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
            >
              <div>
                {/* Header Brand Bar */}
                <div
                  className={`p-5 bg-gradient-to-r ${voucher.logoColor} text-white flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-black/20 backdrop-blur-xs">
                      {getCategoryIcon(voucher.category)}
                    </span>
                    <span className="font-extrabold text-sm tracking-wide">{voucher.brand}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                    {voucher.badgeTag}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {voucher.title}
                    </h3>
                  </div>

                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {voucher.valueDisplay}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {voucher.description}
                  </p>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-2 border-t border-slate-100 dark:border-slate-800">
                    {voucher.partnerInfo}
                  </p>
                </div>
              </div>

              {/* Card Footer: Points Cost + Redeem Button */}
              <div className="p-5 pt-0 mt-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>{voucher.pointsCost} pts</span>
                </div>

                {hasEnough ? (
                  <button
                    onClick={() => redeemVoucher(voucher)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    Redeem Reward
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    title={`You need ${pointsNeeded} more points`}
                  >
                    Need {pointsNeeded} more pts
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUCCESSFUL REDEMPTION CELEBRATION MODAL */}
      {latestRedeemedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-400/50 dark:border-emerald-600/50 overflow-hidden text-center p-6 space-y-4 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md">
              <Gift className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Reward Unlocked!
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {latestRedeemedVoucher.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {latestRedeemedVoucher.valueDisplay} from {latestRedeemedVoucher.brand}
              </p>
            </div>

            {/* Generated Code Box */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-emerald-500/60 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Your Unique Redemption Coupon Code:
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-base sm:text-lg font-black text-slate-900 dark:text-emerald-300 select-all">
                  {latestRedeemedVoucher.code}
                </span>
                <button
                  onClick={() => handleCopyCode(latestRedeemedVoucher.code)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 shadow-xs transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-[10px] text-slate-400 mt-2">
                Valid until {latestRedeemedVoucher.expiryDate}. Also saved in your Impact Wallet history.
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLatestRedeemedVoucher(null)}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors"
              >
                Continue Browsing
              </button>
              <button
                onClick={() => {
                  setLatestRedeemedVoucher(null);
                  setIsWalletModalOpen(true);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Open My Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
