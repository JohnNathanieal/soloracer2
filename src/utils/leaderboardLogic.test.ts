import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLeaderboard, ChampionUser } from './leaderboardLogic';

const mockChampions: ChampionUser[] = [
  {
    id: 'u-1',
    name: 'Ananya Nair',
    handle: '@ananya_n',
    badge: 'Canal Sentinel',
    city: 'Thrissur',
    points: 820,
    actionsCompleted: 14,
    level: 4,
    levelTitle: 'City Guardian',
    rankChange: 'up',
  },
  {
    id: 'u-2',
    name: 'Rohit Menon',
    handle: '@rohit_m',
    badge: 'Pothole Spotter',
    city: 'Kochi',
    points: 750,
    actionsCompleted: 12,
    level: 4,
    levelTitle: 'City Guardian',
    rankChange: 'same',
  },
  {
    id: 'u-3',
    name: 'Kavita Rao',
    handle: '@kavita_r',
    badge: 'Lake Guardian',
    city: 'Bengaluru',
    points: 680,
    actionsCompleted: 11,
    level: 3,
    levelTitle: 'Community Champion',
    rankChange: 'up',
  },
  {
    id: 'u-4',
    name: 'Vishnu Das',
    handle: '@vishnu_d',
    badge: 'Blood Hero',
    city: 'Thrissur',
    points: 610,
    actionsCompleted: 9,
    level: 3,
    levelTitle: 'Community Champion',
    rankChange: 'down',
  },
  {
    id: 'u-5',
    name: 'Priya Pillai',
    handle: '@priya_p',
    badge: 'Transit Advocate',
    city: 'Kochi',
    points: 540,
    actionsCompleted: 8,
    level: 3,
    levelTitle: 'Community Champion',
    rankChange: 'same',
  },
  {
    id: 'u-6',
    name: 'Deepak Kumar',
    handle: '@deepak_k',
    badge: 'Corridor Watch',
    city: 'Bengaluru',
    points: 490,
    actionsCompleted: 7,
    level: 2,
    levelTitle: 'Local Hero',
    rankChange: 'up',
  },
  {
    id: 'u-7',
    name: 'Arjun Varma',
    handle: '@arjun_v',
    badge: 'Flood Volunteer',
    city: 'Thrissur',
    points: 420,
    actionsCompleted: 6,
    level: 2,
    levelTitle: 'Local Hero',
    rankChange: 'down',
  },
  {
    id: 'u-8',
    name: 'Meera Nambiar',
    handle: '@meera_n',
    badge: 'Civic Reporter',
    city: 'Kochi',
    points: 380,
    actionsCompleted: 5,
    level: 2,
    levelTitle: 'Local Hero',
    rankChange: 'same',
  },
  {
    id: 'u-9',
    name: 'Suresh Bhat',
    handle: '@suresh_b',
    badge: 'Green Taskforce',
    city: 'Bengaluru',
    points: 320,
    actionsCompleted: 5,
    level: 2,
    levelTitle: 'Local Hero',
    rankChange: 'up',
  },
  {
    id: 'u-10',
    name: 'Sneha George',
    handle: '@sneha_g',
    badge: 'Health Scout',
    city: 'Thrissur',
    points: 260,
    actionsCompleted: 4,
    level: 2,
    levelTitle: 'Local Hero',
    rankChange: 'same',
  },
  {
    id: 'u-11',
    name: 'Farhan Ali',
    handle: '@farhan_a',
    badge: 'Clean Air Patrol',
    city: 'Bengaluru',
    points: 210,
    actionsCompleted: 3,
    level: 2,
    levelTitle: 'Local Hero',
    rankChange: 'same',
  },
];

test('buildLeaderboard sorts champions and places user accurately', () => {
  // If user has 500 points, user should rank #6 (between Priya 540 and Deepak 490)
  const result = buildLeaderboard(
    mockChampions,
    {
      name: 'Naveen',
      city: 'Thrissur',
      points: 500,
      actionsCompleted: 6,
      level: 3,
      levelTitle: 'Community Champion',
    },
    'all',
    1.0
  );

  assert.equal(result.topTen.length, 10);
  assert.equal(result.currentUserRank, 6);
  assert.equal(result.currentUserInTopTen, true);
  assert.equal(result.topTen[5].isCurrentUser, true);
  assert.equal(result.topTen[5].points, 500);
  // Points to pass Priya (540 pts): 540 - 500 + 1 = 41 pts
  assert.equal(result.pointsToNextRank, 41);
});

test('buildLeaderboard handles user outside top 10', () => {
  const result = buildLeaderboard(
    mockChampions,
    {
      name: 'Naveen',
      city: 'Thrissur',
      points: 50,
      actionsCompleted: 1,
      level: 1,
      levelTitle: 'Civic Rookie',
    },
    'all',
    1.0
  );

  assert.equal(result.topTen.length, 10);
  assert.equal(result.currentUserRank, 12);
  assert.equal(result.currentUserInTopTen, false);
});

test('buildLeaderboard filters by specific city', () => {
  const result = buildLeaderboard(
    mockChampions,
    {
      name: 'Naveen',
      city: 'Thrissur',
      points: 300,
      actionsCompleted: 4,
      level: 2,
      levelTitle: 'Local Hero',
    },
    'Thrissur',
    1.0
  );

  // In Thrissur: Ananya (820), Vishnu (610), Arjun (420), Naveen (300), Sneha (260)
  assert.equal(result.currentUserRank, 4);
  assert.equal(result.currentUserInTopTen, true);
  assert.ok(result.topTen.every((c) => c.city === 'Thrissur'));
});
