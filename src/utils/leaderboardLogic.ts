export interface ChampionUser {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  badge: string;
  city: string;
  points: number;
  actionsCompleted: number;
  level: number;
  levelTitle: string;
  rankChange: 'up' | 'down' | 'same' | 'new';
  isCurrentUser?: boolean;
}

export interface LeaderboardResult {
  topTen: ChampionUser[];
  currentUserRank: number;
  currentUserInTopTen: boolean;
  pointsToNextRank: number;
}

/**
 * Merges mock champions with the current user's live wallet points,
 * sorts descending, assigns 1-indexed ranks, and provides top 10 plus user standing.
 */
export function buildLeaderboard(
  champions: ChampionUser[],
  currentUser: {
    name: string;
    city: string;
    points: number;
    actionsCompleted: number;
    level: number;
    levelTitle: string;
  },
  filterCity?: string,
  timeframeMultiplier: number = 1.0
): LeaderboardResult {
  // Format current user entry
  const userEntry: ChampionUser = {
    id: 'current-user',
    name: `${currentUser.name} (You)`,
    handle: '@you',
    badge: 'Active Citizen',
    city: currentUser.city,
    points: Math.round(currentUser.points * timeframeMultiplier),
    actionsCompleted: currentUser.actionsCompleted,
    level: currentUser.level,
    levelTitle: currentUser.levelTitle,
    rankChange: 'same',
    isCurrentUser: true,
  };

  // Adjust champions by timeframe and optional city filter
  let list = champions.map((champ) => ({
    ...champ,
    points: Math.round(champ.points * timeframeMultiplier),
    isCurrentUser: false,
  }));

  if (filterCity && filterCity !== 'all') {
    const cityLower = filterCity.toLowerCase();
    list = list.filter((c) => c.city.toLowerCase().includes(cityLower));
  }

  // Include current user
  list.push(userEntry);

  // Sort descending by points, tie-break by actionsCompleted
  list.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.actionsCompleted - a.actionsCompleted;
  });

  const currentUserIndex = list.findIndex((u) => u.isCurrentUser);
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : list.length;
  const topTen = list.slice(0, 10);
  const currentUserInTopTen = currentUserIndex >= 0 && currentUserIndex < 10;

  // Calculate points needed to reach previous rank
  let pointsToNextRank = 0;
  if (currentUserIndex > 0) {
    const userAbove = list[currentUserIndex - 1];
    pointsToNextRank = Math.max(1, userAbove.points - userEntry.points + 1);
  }

  return {
    topTen,
    currentUserRank,
    currentUserInTopTen,
    pointsToNextRank,
  };
}
