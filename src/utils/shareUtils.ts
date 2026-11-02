import { NewsStory } from '../types/impact';

export interface ShareContent {
  text: string;
  url: string;
  twitterUrl: string;
  whatsappUrl: string;
}

export function generateShareContent(
  story: NewsStory,
  pointsEarned: number,
  completedTasks: string[] = [],
  appUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://impactpulse.app'
): ShareContent {
  const tasksSummary =
    completedTasks.length > 0
      ? ` Completed: ${completedTasks.slice(0, 2).join(', ')}.`
      : '';

  const shareText = `I just took verified civic action on ImpactPulse for "${story.headline}" in ${story.locationName} and earned +${pointsEarned} civic points!${tasksSummary} Turn local headlines into community action:`;

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(appUrl);
  const hashtags = 'ImpactPulse,CivicAction,CommunityHero,LocalImpact';

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${hashtags}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${appUrl}`)}`;

  return {
    text: shareText,
    url: appUrl,
    twitterUrl,
    whatsappUrl,
  };
}
