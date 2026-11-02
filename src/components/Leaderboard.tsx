import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Crown,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  MapPin,
  CheckCircle2,
  Users,
  Flame,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useImpact } from '../context/ImpactContext';
import { MOCK_CHAMPIONS } from '../data/champions';
import { buildLeaderboard, ChampionUser } from '../utils/leaderboardLogic';

export const Leaderboard: React.FC = () => {
  const { wallet, userLevel, userLocation, setActiveTab, openActionModal, newsStories } = useImpact();

  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('alltime');
  const [regionFilter, setRegionFilter] = useState<'all' | 'local'>('all');

  const currentCity = userLocation.name.split(',')[0].trim();

  // Multipliers for timeframes
  const multiplier = timeframe === 'weekly' ? 0.35 : timeframe === 'monthly' ? 0.7 : 1.0;

  // Build dynamic leaderboard with current user
  const leaderboardData = buildLeaderboard(
    MOCK_CHAMPIONS,
    {
      name: 'Naveen',
      city: currentCity,
      points: wallet.points,
      actionsCompleted: wallet.claimHistory.length,
      level: userLevel.level,
      levelTitle: userLevel.title,
    },
    regionFilter === 'local' ? currentCity : 'all',
    multiplier
  );

  const topThree = leaderboardData.topTen.slice(0, 3);
  const remainingRanks = leaderboardData.topTen.slice(3, 10);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-md shadow-amber-400/30">
            <Crown className="w-4 h-4 fill-amber-950" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-300 dark:bg-slate-200 text-slate-800 flex items-center justify-center font-black shadow-sm">
            <Medal className="w-4 h-4" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-700/80 text-amber-100 flex items-center justify-center font-black shadow-sm">
            <Medal className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-mono font-bold text-xs border border-slate-200 dark:border-slate-700">
            #{rank}
          </div>
        );
    }
  };

  const getTrendIcon = (trend: ChampionUser['rankChange']) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />;
      case 'down':
        return <ArrowDown className="w-3.5 h-3.5 text-rose-500" />;
      case 'new':
        return <span className="text-[10px] font-bold text-teal-500 uppercase">NEW</span>;
      default:
        return <Minus className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-800 text-white p-6 sm:p-8 shadow-xl border border-amber-400/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            Civic Hall of Fame
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">
            Community Champions Leaderboard
          </h2>

          <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed mb-6">
            Recognizing the top citizens turning local headlines into verified community impact. Stand among your city&apos;s most active civic guardians!
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-md">
                <Crown className="w-5 h-5 fill-amber-950" />
              </div>
              <div>
                <div className="text-[11px] text-amber-200 uppercase tracking-wider font-semibold">
                  #1 Rank Leader
                </div>
                <div className="text-sm font-extrabold text-white">
                  {leaderboardData.topTen[0]?.name || 'Ananya Nair'} ({leaderboardData.topTen[0]?.points} pts)
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-white/20 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-emerald-200 uppercase tracking-wider font-semibold">
                  Your Current Standing
                </div>
                <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>#{leaderboardData.currentUserRank}</span>
                  <span className="text-xs font-normal text-slate-200">
                    ({wallet.points} pts • {userLevel.title})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-8 -top-8 w-60 h-60 rounded-full bg-amber-400/20 blur-3xl pointer-events-none"></div>
      </div>

      {/* Filter and Timeframe Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Timeframe tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl">
          {[
            { id: 'weekly', label: 'This Week' },
            { id: 'monthly', label: 'This Month' },
            { id: 'alltime', label: 'All-Time' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id as 'weekly' | 'monthly' | 'alltime')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Region filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Scope:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setRegionFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                regionFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Regions
            </button>
            <button
              onClick={() => setRegionFilter('local')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                regionFilter === 'local'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3 text-emerald-500" />
              <span>{currentCity} Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      {topThree.length >= 3 && (
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-3xl mx-auto">
            {/* Rank 2 (Silver - Left) */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-14 sm:w-18 h-14 sm:h-18 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-100 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md border-2 border-slate-300 dark:border-slate-500">
                  {topThree[1].name.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-lg bg-slate-300 text-slate-900 flex items-center justify-center font-black text-xs shadow-xs">
                  #2
                </div>
              </div>
              <div className="text-center w-full px-1">
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {topThree[1].name}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {topThree[1].points} pts
                </div>
                <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                  {topThree[1].badge}
                </div>
              </div>
              <div className="w-full h-24 sm:h-32 mt-3 rounded-t-2xl bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900/60 border-t-4 border-slate-400 flex items-center justify-center">
                <span className="font-black text-slate-400 dark:text-slate-600 text-xl sm:text-2xl">
                  2
                </span>
              </div>
            </div>

            {/* Rank 1 (Gold - Center - Highest) */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <Crown className="w-7 h-7 text-amber-400 fill-amber-400 animate-bounce" />
                </div>
                <div className="w-18 sm:w-22 h-18 sm:h-22 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-950 flex items-center justify-center font-black text-xl sm:text-2xl shadow-xl border-4 border-amber-300 ring-4 ring-amber-400/20">
                  {topThree[0].name.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs shadow-xs">
                  #1
                </div>
              </div>
              <div className="text-center w-full px-1">
                <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {topThree[0].name}
                </div>
                <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-black">
                  {topThree[0].points} pts
                </div>
                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 truncate">
                  {topThree[0].badge}
                </div>
              </div>
              <div className="w-full h-32 sm:h-44 mt-3 rounded-t-2xl bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-slate-900 border-t-4 border-amber-400 flex items-center justify-center">
                <span className="font-black text-amber-500 dark:text-amber-400 text-3xl sm:text-4xl">
                  1
                </span>
              </div>
            </div>

            {/* Rank 3 (Bronze - Right) */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-14 sm:w-18 h-14 sm:h-18 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 text-amber-100 flex items-center justify-center font-black text-lg sm:text-xl shadow-md border-2 border-amber-600">
                  {topThree[2].name.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-lg bg-amber-700 text-amber-100 flex items-center justify-center font-black text-xs shadow-xs">
                  #3
                </div>
              </div>
              <div className="text-center w-full px-1">
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {topThree[2].name}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {topThree[2].points} pts
                </div>
                <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                  {topThree[2].badge}
                </div>
              </div>
              <div className="w-full h-20 sm:h-28 mt-3 rounded-t-2xl bg-gradient-to-b from-amber-900/20 to-slate-100 dark:from-amber-950/30 dark:to-slate-900/60 border-t-4 border-amber-700 flex items-center justify-center">
                <span className="font-black text-amber-700 dark:text-amber-600 text-xl sm:text-2xl">
                  3
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP 10 LEADERBOARD TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Top 10 Civic Champions
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Updated in real-time
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {leaderboardData.topTen.map((champ, index) => {
            const rank = index + 1;
            const isUser = champ.isCurrentUser;

            return (
              <div
                key={champ.id}
                className={`flex items-center justify-between p-3.5 sm:p-4 transition-colors ${
                  isUser
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Left: Rank & Avatar & User Info */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {getRankBadge(rank)}

                  <div className="flex items-center gap-1">
                    {getTrendIcon(champ.rankChange)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {champ.name}
                      </span>
                      {isUser && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-mono text-[11px] text-slate-400">{champ.handle}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {champ.city}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-medium">
                        {champ.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Points & Verified Actions */}
                <div className="flex items-center gap-3 sm:gap-6 shrink-0 text-right">
                  <div className="hidden sm:block">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {champ.actionsCompleted} Actions
                    </div>
                    <div className="text-[10px] text-slate-400">{champ.levelTitle}</div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{champ.points}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PINNED STANDING FOOTER CARD IF USER IS BELOW TOP 10 */}
      {!leaderboardData.currentUserInTopTen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
              #{leaderboardData.currentUserRank}
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base">
                You are ranked #{leaderboardData.currentUserRank}
              </div>
              <div className="text-xs text-slate-300">
                You have {wallet.points} points. Earn{' '}
                <span className="font-bold text-amber-300">
                  +{leaderboardData.pointsToNextRank} pts
                </span>{' '}
                to climb into the Top 10!
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('feed')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center justify-center gap-2"
          >
            <span>Take Action on Headlines</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
