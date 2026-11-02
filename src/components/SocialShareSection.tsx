import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Send,
  ExternalLink,
} from 'lucide-react';
import { NewsStory } from '../types/impact';
import { generateShareContent } from '../utils/shareUtils';
import { useImpact } from '../context/ImpactContext';

interface SocialShareSectionProps {
  story: NewsStory;
  completedTasks?: string[];
  isCompleted?: boolean;
}

export const SocialShareSection: React.FC<SocialShareSectionProps> = ({
  story,
  completedTasks = [],
  isCompleted = false,
}) => {
  const { addToast } = useImpact();
  const [copied, setCopied] = useState(false);

  const shareContent = generateShareContent(
    story,
    story.pointsReward,
    completedTasks,
    typeof window !== 'undefined' ? window.location.origin : 'https://impactpulse.app'
  );

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareContent.text} ${shareContent.url}`);
      setCopied(true);
      addToast({
        type: 'success',
        title: 'Share Link Copied',
        message: 'Impact statement and link copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Civic Action: ${story.headline}`,
          text: shareContent.text,
          url: shareContent.url,
        });
        addToast({
          type: 'success',
          title: 'Shared Successfully',
          message: 'Thank you for spreading civic awareness!',
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-500/30 shadow-xs space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-600 text-white shadow-xs">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{isCompleted ? 'Share Your Verified Civic Action!' : 'Share This Local Alert'}</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Community Power
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isCompleted
                ? 'Inspire neighbors to take action on local headlines and earn points.'
                : 'Alert friends and family to local safety guidelines and community petitions.'}
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{story.pointsReward} pts earned</span>
          </span>
        )}
      </div>

      {/* Share Quote / Preview Box */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 italic flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <span className="line-clamp-2">
          &ldquo;{shareContent.text}&rdquo;
        </span>
      </div>

      {/* Social Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* WhatsApp Share */}
        <a
          href={shareContent.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {/* Custom WhatsApp Icon SVG */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 2C6.494 2 2 6.494 2 12.031c0 1.769.462 3.497 1.34 5.021L2 22l5.093-1.336a9.98 9.98 0 0 0 4.938 1.288h.004c5.536 0 10.03-4.494 10.03-10.031 0-2.682-1.044-5.203-2.943-7.102A9.97 9.97 0 0 0 12.031 2zm0 18.232h-.003a8.21 8.21 0 0 1-4.186-1.15l-.3-.178-3.111.816.83-3.033-.195-.311a8.204 8.204 0 0 1-1.258-4.346c0-4.542 3.696-8.238 8.24-8.238 2.2 0 4.269.858 5.824 2.414a8.2 8.2 0 0 1 2.411 5.823c0 4.543-3.697 8.239-8.242 8.239zm4.518-6.173c-.248-.124-1.464-.723-1.691-.806-.228-.083-.393-.124-.559.124-.165.248-.642.806-.787.971-.144.165-.289.186-.537.062-.248-.124-1.048-.386-1.996-1.232-.738-.658-1.237-1.472-1.382-1.72-.144-.248-.015-.382.109-.505.112-.112.248-.289.372-.434.124-.144.165-.248.248-.413.083-.165.042-.31-.02-.434-.062-.124-.559-1.346-.766-1.843-.201-.484-.405-.418-.559-.426l-.476-.008c-.165 0-.434.062-.661.31-.228.248-.868.848-.868 2.067 0 1.22 8.89 2.4 1.013 2.565.124.165 1.751 2.673 4.242 3.748.592.256 1.054.41 1.414.524.595.19 1.137.163 1.565.099.477-.072 1.464-.599 1.671-1.178.207-.579.207-1.074.145-1.178-.063-.103-.228-.165-.476-.289z" />
          </svg>
          <span>Share WhatsApp</span>
        </a>

        {/* Twitter / X Share */}
        <a
          href={shareContent.twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#000000] dark:bg-white text-white dark:text-black hover:opacity-90 shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {/* Twitter / X Icon SVG */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Post to X</span>
        </a>

        {/* Copy Link / Native Share */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="p-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
            title="More Share Options"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
