import React from 'react';
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  Leaf,
  Shield,
  HeartHandshake,
  Activity,
  Layers,
  Compass,
  Trophy,
} from 'lucide-react';
import { useImpact } from '../context/ImpactContext';
import { NewsCard } from './NewsCard';
import { IssueCategory } from '../types/impact';

export const NewsFeed: React.FC = () => {
  const {
    newsStories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    userLocation,
    setIsLocationPickerOpen,
    wallet,
    setActiveTab,
  } = useImpact();

  const categories: { id: IssueCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Issues', icon: Layers },
    { id: 'environmental', label: 'Environmental', icon: Leaf },
    { id: 'civic_safety', label: 'Civic Safety', icon: Shield },
    { id: 'community_support', label: 'Community Support', icon: HeartHandshake },
  ];

  const filteredStories = newsStories.filter((story) => {
    // Category match
    if (selectedCategory !== 'all' && story.category !== selectedCategory) {
      return false;
    }
    // Search match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchHeadline = story.headline.toLowerCase().includes(q);
      const matchSummary = story.summary.toLowerCase().includes(q);
      const matchLocation = story.locationName.toLowerCase().includes(q);
      if (!matchHeadline && !matchSummary && !matchLocation) return false;
    }
    return true;
  });

  const totalPointsAvailable = newsStories
    .filter((s) => !wallet.claimedArticleIds.includes(s.id))
    .reduce((sum, s) => sum + s.pointsReward, 0);

  return (
    <div className="space-y-6">
      {/* Civic Action Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
              Direct Civic Impact Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Turn Negative Local News Into Citizen Action
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Read urgent local headlines, follow actionable safety guidelines, sign petitions, and verify your community actions to earn instant redeemable vouchers.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <div className="text-xl font-black text-white">{newsStories.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                Local Alerts
              </div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center px-2">
              <div className="text-xl font-black text-amber-300">+{totalPointsAvailable}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                Points Available
              </div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="text-center px-2 py-1 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-300"
              title="View Top 10 Community Champions"
            >
              <div className="flex items-center justify-center gap-1 text-xl font-black text-amber-300">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Top 10</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                Champions
              </div>
            </button>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search local alerts, locations, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Current Location Filter indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Targeting:</span>
          <button
            onClick={() => setIsLocationPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:border-emerald-500 transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate max-w-[140px]">{userLocation.name}</span>
            <Compass className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs scale-102'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* News Cards Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            No civic alerts match your criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try clearing your search filter or selecting another issue category above.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <NewsCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
};
