import React, { useState } from 'react';
import {
  X,
  Award,
  Sparkles,
  History,
  Gift,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  RotateCcw,
  Calendar,
  Zap,
} from 'lucide-react';
import { useImpact } from '../context/ImpactContext';

export const WalletHistoryModal: React.FC = () => {
  const {
    isWalletModalOpen,
    setIsWalletModalOpen,
    wallet,
    userLevel,
    resetWalletData,
    addToast,
  } = useImpact();

  const [activeTab, setActiveTab] = useState<'claims' | 'vouchers' | 'civic'>('claims');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  if (!isWalletModalOpen) return null;

  const handleCopyCode = (id: string, code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      addToast({
        type: 'success',
        title: 'Coupon Code Copied',
        message: code,
      });
      setTimeout(() => setCopiedCodeId(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-2xl my-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 id="wallet-modal-title" className="text-xl font-extrabold text-white">
                  Civic Impact Wallet
                </h2>
                <p className="text-xs text-emerald-300 font-medium">
                  Level {userLevel.level} • {userLevel.title}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsWalletModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close wallet dialog"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Points & Level Progress Bar */}
          <div className="mt-5 space-y-2">
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white">{wallet.points}</span>
                <span className="text-xs uppercase font-bold text-emerald-300">pts balance</span>
              </div>
              <span className="text-xs font-mono text-slate-300">
                {userLevel.currentPoints} / {userLevel.nextLevelThreshold} pts to Level {userLevel.level + 1}
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                style={{ width: `${userLevel.progressPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
              <span>{userLevel.title}</span>
              <span>
                {userLevel.level === 4 ? 'Maximum Level Reached' : `${userLevel.nextLevelThreshold - userLevel.currentPoints} pts to next rank`}
              </span>
            </div>
          </div>
        </div>

        {/* Daily limit tracker card */}
        <div className="px-6 py-3 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Anti-Farming Daily Cap:</span>
          </div>
          <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
            {wallet.dailyPointsEarned} / 500 daily pts earned today
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-2 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('claims')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'claims'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Claimed Actions ({wallet.claimHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'vouchers'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Redeemed Vouchers ({wallet.redeemedVouchers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('civic')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'civic'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Civic Pledges</span>
          </button>
        </div>

        {/* Scrollable list content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: CLAIM HISTORY */}
          {activeTab === 'claims' && (
            <div className="space-y-3">
              {wallet.claimHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold">No actions claimed yet.</p>
                  <p className="text-xs">
                    Read local news stories, complete the verification quiz, and claim points!
                  </p>
                </div>
              ) : (
                wallet.claimHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">{item.claimedAt}</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                        {item.articleHeadline}
                      </h4>
                      {item.completedTasks.length > 0 && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Verified: {item.completedTasks.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs whitespace-nowrap">
                      +{item.pointsEarned} pts
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: REDEEMED VOUCHERS */}
          {activeTab === 'vouchers' && (
            <div className="space-y-3">
              {wallet.redeemedVouchers.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold">No vouchers redeemed yet.</p>
                  <p className="text-xs">
                    Visit the Rewards Store tab to redeem gift cards with your earned points!
                  </p>
                </div>
              ) : (
                wallet.redeemedVouchers.map((v) => {
                  const isCopied = copiedCodeId === v.id;
                  return (
                    <div
                      key={v.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {v.brand}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {v.title}
                          </h4>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {v.valueDisplay}
                        </span>
                      </div>

                      {/* Code display */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300">
                          {v.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(v.id, v.code)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Redeemed: {v.redeemedAt}</span>
                        <span>Valid until: {v.expiryDate}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: CIVIC ENGAGEMENT */}
          {activeTab === 'civic' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Signed Petitions ({wallet.signedPetitionIds.length})
                </h4>
                {wallet.signedPetitionIds.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No petitions signed yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {wallet.signedPetitionIds.map((id) => (
                      <div
                        key={id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Petition ID: {id} signed & verified.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Volunteer Pledges ({wallet.volunteerPledges.length})
                </h4>
                {wallet.volunteerPledges.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No pledges recorded yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {wallet.volunteerPledges.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">Pledge:</div>
                        <div>{p.optionSelected}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Reset Demo */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
          <button
            onClick={resetWalletData}
            className="flex items-center gap-1.5 text-slate-500 hover:text-rose-500 transition-colors"
            title="Reset wallet to default starting points"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Close Wallet
          </button>
        </div>
      </div>
    </div>
  );
};
