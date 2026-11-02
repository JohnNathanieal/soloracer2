/**
 * Pure civic and gamification logic for ImpactPulse.
 * Designed for unit testability with node:test.
 */

export interface UserLocation {
  name: string;
  lat: number;
  lng: number;
  isGps: boolean;
}

export interface UserLevelInfo {
  level: number;
  title: string;
  currentPoints: number;
  nextLevelThreshold: number;
  prevLevelThreshold: number;
  progressPercent: number;
}

export interface DailyRateLimitResult {
  allowed: boolean;
  currentDailyTotal: number;
  remainingDailyQuota: number;
  reason?: string;
}

/**
 * Calculates great-circle distance between two coordinates in kilometers using Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

/**
 * Validates if user location is within geofence radius.
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number = 25
): { isWithin: boolean; distanceKm: number } {
  const distanceKm = calculateDistanceKm(userLat, userLng, targetLat, targetLng);
  return {
    isWithin: distanceKm <= radiusKm,
    distanceKm,
  };
}

/**
 * Computes user civic level and progress percentage.
 * Level 1: Civic Rookie (0 - 99 pts)
 * Level 2: Local Hero (100 - 249 pts)
 * Level 3: Community Champion (250 - 499 pts)
 * Level 4: City Guardian (500+ pts)
 */
export function getUserLevel(points: number): UserLevelInfo {
  const safePoints = Math.max(0, points);

  if (safePoints < 100) {
    return {
      level: 1,
      title: 'Civic Rookie',
      currentPoints: safePoints,
      prevLevelThreshold: 0,
      nextLevelThreshold: 100,
      progressPercent: Math.min(100, Math.round((safePoints / 100) * 100)),
    };
  }

  if (safePoints < 250) {
    const levelProgress = safePoints - 100;
    const levelRange = 150;
    return {
      level: 2,
      title: 'Local Hero',
      currentPoints: safePoints,
      prevLevelThreshold: 100,
      nextLevelThreshold: 250,
      progressPercent: Math.min(100, Math.round((levelProgress / levelRange) * 100)),
    };
  }

  if (safePoints < 500) {
    const levelProgress = safePoints - 250;
    const levelRange = 250;
    return {
      level: 3,
      title: 'Community Champion',
      currentPoints: safePoints,
      prevLevelThreshold: 250,
      nextLevelThreshold: 500,
      progressPercent: Math.min(100, Math.round((levelProgress / levelRange) * 100)),
    };
  }

  const guardianProgress = Math.min(safePoints - 500, 500);
  return {
    level: 4,
    title: 'City Guardian',
    currentPoints: safePoints,
    prevLevelThreshold: 500,
    nextLevelThreshold: 1000,
    progressPercent: Math.min(100, Math.round((guardianProgress / 500) * 100)),
  };
}

/**
 * Checks if a user is allowed to earn points today based on daily 500-point anti-farming limit.
 */
export function checkDailyPointLimit(
  todayDateStr: string,
  savedDateStr: string,
  currentDailyEarned: number,
  pointsToAdd: number,
  dailyLimit: number = 500
): DailyRateLimitResult {
  // If date rolled over, daily earned resets to 0
  const effectiveDailyEarned = todayDateStr === savedDateStr ? currentDailyEarned : 0;
  const remainingDailyQuota = Math.max(0, dailyLimit - effectiveDailyEarned);

  if (effectiveDailyEarned >= dailyLimit) {
    return {
      allowed: false,
      currentDailyTotal: effectiveDailyEarned,
      remainingDailyQuota: 0,
      reason: `Daily earning limit reached (${dailyLimit} pts/day max). Come back tomorrow to earn more!`,
    };
  }

  if (effectiveDailyEarned + pointsToAdd > dailyLimit) {
    return {
      allowed: false,
      currentDailyTotal: effectiveDailyEarned,
      remainingDailyQuota,
      reason: `This action (${pointsToAdd} pts) would exceed your daily cap. You only have ${remainingDailyQuota} pts left today.`,
    };
  }

  return {
    allowed: true,
    currentDailyTotal: effectiveDailyEarned,
    remainingDailyQuota: remainingDailyQuota - pointsToAdd,
  };
}

/**
 * Validates quiz answers against correct option indexes.
 */
export function evaluateQuiz(
  selectedAnswers: Record<number, number>,
  correctAnswers: number[]
): {
  passed: boolean;
  score: number;
  total: number;
  details: { questionIndex: number; selected: number; correct: number; isCorrect: boolean }[];
} {
  const total = correctAnswers.length;
  let score = 0;
  const details = correctAnswers.map((correct, index) => {
    const selected = selectedAnswers[index];
    const isCorrect = selected === correct;
    if (isCorrect) score += 1;
    return {
      questionIndex: index,
      selected,
      correct,
      isCorrect,
    };
  });

  return {
    passed: score === total && Object.keys(selectedAnswers).length === total,
    score,
    total,
    details,
  };
}

/**
 * Generates a unique, authentic voucher coupon code.
 */
export function generateVoucherCode(brandSlug: string): string {
  const cleanSlug = brandSlug.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'IMPACT';
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestampPart = Date.now().toString(36).slice(-3).toUpperCase();
  return `IMP-${cleanSlug}-${randomChars}${timestampPart}`;
}

/**
 * Validates voucher redemption and checks balance.
 */
export function processVoucherRedemption(
  currentBalance: number,
  voucherCost: number,
  brandSlug: string
): { success: boolean; newBalance: number; code?: string; error?: string } {
  if (currentBalance < voucherCost) {
    return {
      success: false,
      newBalance: currentBalance,
      error: `Insufficient points. You need ${voucherCost} pts but have ${currentBalance} pts.`,
    };
  }

  return {
    success: true,
    newBalance: currentBalance - voucherCost,
    code: generateVoucherCode(brandSlug),
  };
}
