import React from 'react';
import {
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Shield,
  HeartHandshake,
  Activity,
} from 'lucide-react';
import { NewsStory, IssueCategory } from '../types/impact';
import { useImpact } from '../context/ImpactContext';
import { calculateDistanceKm } from '../utils/impactLogic';

interface NewsCardProps {
  story: NewsStory;
}

export const NewsCard: React.FC<NewsCardProps> = ({ story }) => {
  const { userLocation, wallet, openActionModal } = useImpact();

  const isClaimed = wallet.claimedArticleIds.includes(story.id);

  // Calculate live distance in km
  const distanceKm = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    story.coordinates.lat,
    story.coordinates.lng
  );

  const getCategoryTheme = (category: IssueCategory) => {
    switch (category) {
      case 'environmental':
        return {
          label: 'Environmental Alert',
          icon: Leaf,
          badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
          badgeText: 'text-emerald-700 dark:text-emerald-300',
          badgeBorder: 'border-emerald-300 dark:border-emerald-800',
        };
      case 'civic_safety':
        return {
          label: 'Civic Safety',
          icon: Shield,
          badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
          badgeText: 'text-amber-700 dark:text-amber-300',
          badgeBorder: 'border-amber-300 dark:border-amber-800',
        };
      case 'community_support':
        return {
          label: 'Community Support',
          icon: HeartHandshake,
          badgeBg: 'bg-indigo-100 dark:bg-indigo-950/80',
          badgeText: 'text-indigo-700 dark:text-indigo-300',
          badgeBorder: 'border-indigo-300 dark:border-indigo-800',
        };
      case 'health_alert':
        return {
          label: 'Health Advisory',
          icon: Activity,
          badgeBg: 'bg-rose-100 dark:bg-rose-950/80',
          badgeText: 'text-rose-700 dark:text-rose-300',
          badgeBorder: 'border-rose-300 dark:border-rose-800',
        };
      default:
        return {
          label: 'Civic Issue',
          icon: AlertTriangle,
          badgeBg: 'bg-slate-100 dark:bg-slate-800',
          badgeText: 'text-slate-700 dark:text-slate-300',
          badgeBorder: 'border-slate-300 dark:border-slate-700',
        };
    }
  };

  const theme = getCategoryTheme(story.category);
  const CategoryIcon = theme.icon;

  return (
    <article className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-400/50 dark:hover:border-emerald-500/50 transition-all duration-300">
      {/* Top Banner / Image with tags overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={story.imageUrl}
          alt={story.headline}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></div>

        {/* Category & Urgency Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            {theme.label}
          </span>

          {story.urgency === 'Urgent' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.8 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Urgent
            </span>
          )}
        </div>

        {/* Potential Earnable Points Pill */}
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-black shadow-md backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{story.pointsReward} pts</span>
          </div>
        </div>

        {/* Bottom image overlay: Location & Distance */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white/90">
          <div className="flex items-center gap-1 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{story.locationName}</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs text-emerald-300 font-semibold shrink-0">
            {distanceKm < 1 ? '< 1 km away' : `${distanceKm} km away`}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Metadata: source & reading time */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[65%]">
              {story.sourceAgency}
            </span>
            <div className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{story.readingTimeMinutes} min read</span>
            </div>
          </div>

          {/* Headline */}
          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {story.headline}
          </h3>

          {/* Summary */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {story.summary}
          </p>
        </div>

        {/* Card Footer: Action button or Claimed status */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 font-medium">{story.timestamp}</div>

          {isClaimed ? (
            <button
              onClick={() => openActionModal(story)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Claimed (+{story.pointsReward} pts)</span>
            </button>
          ) : (
            <button
              onClick={() => openActionModal(story)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Take Action & Earn Points</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
