import React from 'react';
import {
  MapPin,
  Sparkles,
  Award,
  Sun,
  Moon,
  Compass,
  Gift,
  Newspaper,
  History,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { useImpact } from '../context/ImpactContext';

export const Header: React.FC = () => {
  const {
    isDarkMode,
    toggleDarkMode,
    activeTab,
    setActiveTab,
    userLocation,
    userLevel,
    wallet,
    setIsLocationPickerOpen,
    setIsWalletModalOpen,
  } = useImpact();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row: Brand + Location + Wallet + Theme */}
        <div className="flex items-center justify-between h-18 gap-2 sm:gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('feed')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
              aria-label="ImpactPulse Home"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                    Impact<span className="text-emerald-500">Pulse</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    Live Civic
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight hidden md:block">
                  Local Headlines. Real Action. Instant Impact.
                </p>
              </div>
            </button>
          </div>

          {/* Center-Right Tools: Location Badge, Wallet Pill, Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time Location Badge */}
            <button
              onClick={() => setIsLocationPickerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Change region or calibrate GPS location"
              aria-label={`Current location: ${userLocation.name}. Click to change.`}
            >
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {userLocation.isGps && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white"></span>
                )}
              </div>
              <span className="max-w-[100px] sm:max-w-[130px] truncate">
                {userLocation.name.split(',')[0]}
              </span>
              <Compass className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" />
            </button>

            {/* Impact Wallet & Level Badge */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-xs group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={`Impact Wallet: ${wallet.points} points. ${userLevel.title}. Click to view history.`}
            >
              {/* Animated coin icon */}
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:rotate-12 transition-transform">
                <Sparkles className="w-3.5 h-3.5" />
              </div>

              {/* Points & Level */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1 leading-tight">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white tabular-nums">
                    {wallet.points}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                    pts
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:flex leading-none">
                  <Award className="w-2.5 h-2.5 text-amber-500" />
                  <span>{userLevel.title}</span>
                </div>
              </div>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Bottom row: Navigation Tabs */}
        <div className="flex items-center gap-1 py-2 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'feed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Local Action Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all shrink-0 relative ${
              activeTab === 'rewards'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Rewards & Vouchers</span>
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950">
              Store
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all shrink-0 relative ${
              activeTab === 'leaderboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Champions Leaderboard</span>
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Top 10
            </span>
          </button>

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
          >
            <History className="w-4 h-4" />
            <span>Impact History & Wallet</span>
            {wallet.claimHistory.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
