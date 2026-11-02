import React from 'react';
import { ImpactProvider, useImpact } from './context/ImpactContext';
import { Header } from './components/Header';
import { NewsFeed } from './components/NewsFeed';
import { RewardsStore } from './components/RewardsStore';
import { Leaderboard } from './components/Leaderboard';
import { ActionModal } from './components/ActionModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { WalletHistoryModal } from './components/WalletHistoryModal';
import { ToastContainer } from './components/ToastContainer';
import { ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, userLocation } = useImpact();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Fixed Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'feed' && <NewsFeed />}
        {activeTab === 'rewards' && <RewardsStore />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </main>

      {/* Global Modals & Notifications */}
      <ActionModal />
      <LocationPickerModal />
      <WalletHistoryModal />
      <ToastContainer />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              ImpactPulse
            </span>
            <span>— Local Headlines. Real Action. Instant Impact.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-500" />
              <span>Calibrated for {userLocation.name}</span>
            </span>
            <span>•</span>
            <span>Proof-of-Action Anti-Foulplay System</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="hover:text-emerald-500 font-semibold transition-colors"
            >
              Champions Leaderboard
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('rewards')}
              className="hover:text-emerald-500 font-semibold transition-colors"
            >
              Voucher Bazaar
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ImpactProvider>
      <AppContent />
    </ImpactProvider>
  );
}
