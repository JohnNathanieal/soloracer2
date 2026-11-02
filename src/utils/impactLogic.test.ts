import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceKm,
  isWithinGeofence,
  getUserLevel,
  checkDailyPointLimit,
  evaluateQuiz,
  processVoucherRedemption,
  generateVoucherCode,
} from './impactLogic';

test('calculateDistanceKm calculates approximate distance correctly', () => {
  // Thrissur (10.5276, 76.2144) to Kochi (9.9312, 76.2673) is ~66-70 km
  const distance = calculateDistanceKm(10.5276, 76.2144, 9.9312, 76.2673);
  assert.ok(distance >= 60 && distance <= 75, `Expected distance ~67km, got ${distance}`);

  // Same coordinate is 0km
  assert.equal(calculateDistanceKm(10.5276, 76.2144, 10.5276, 76.2144), 0);
});

test('isWithinGeofence validates radius correctly', () => {
  const resultInside = isWithinGeofence(10.5276, 76.2144, 10.53, 76.22, 10);
  assert.equal(resultInside.isWithin, true);
  assert.ok(resultInside.distanceKm < 10);

  const resultOutside = isWithinGeofence(10.5276, 76.2144, 12.9716, 77.5946, 50); // Thrissur to Bengaluru
  assert.equal(resultOutside.isWithin, false);
  assert.ok(resultOutside.distanceKm > 200);
});

test('getUserLevel computes civic levels and progress percentages', () => {
  // Level 1: 0-99
  const level1 = getUserLevel(50);
  assert.equal(level1.level, 1);
  assert.equal(level1.title, 'Civic Rookie');
  assert.equal(level1.progressPercent, 50);

  // Level 2: 100-249 (100 is start of level 2)
  const level2 = getUserLevel(175);
  assert.equal(level2.level, 2);
  assert.equal(level2.title, 'Local Hero');
  assert.equal(level2.progressPercent, 50); // (175-100)/150 = 50%

  // Level 3: 250-499
  const level3 = getUserLevel(375);
  assert.equal(level3.level, 3);
  assert.equal(level3.title, 'Community Champion');
  assert.equal(level3.progressPercent, 50);

  // Level 4: 500+
  const level4 = getUserLevel(750);
  assert.equal(level4.level, 4);
  assert.equal(level4.title, 'City Guardian');
});

test('checkDailyPointLimit enforces daily 500-point cap', () => {
  const today = '2026-11-02';

  // Allowed under limit
  const res1 = checkDailyPointLimit(today, today, 200, 50, 500);
  assert.equal(res1.allowed, true);
  assert.equal(res1.remainingDailyQuota, 250);

  // Denied if already at limit
  const res2 = checkDailyPointLimit(today, today, 500, 50, 500);
  assert.equal(res2.allowed, false);
  assert.equal(res2.remainingDailyQuota, 0);

  // Denied if action exceeds cap
  const res3 = checkDailyPointLimit(today, today, 480, 50, 500);
  assert.equal(res3.allowed, false);

  // Date rollover resets daily quota
  const resRollover = checkDailyPointLimit('2026-11-02', '2026-11-01', 500, 50, 500);
  assert.equal(resRollover.allowed, true);
  assert.equal(resRollover.remainingDailyQuota, 450);
});

test('evaluateQuiz checks answers accurately', () => {
  const correctAnswers = [1, 2];

  // Perfect score passes
  const passRes = evaluateQuiz({ 0: 1, 1: 2 }, correctAnswers);
  assert.equal(passRes.passed, true);
  assert.equal(passRes.score, 2);

  // One wrong fails
  const failRes = evaluateQuiz({ 0: 1, 1: 0 }, correctAnswers);
  assert.equal(failRes.passed, false);
  assert.equal(failRes.score, 1);

  // Incomplete answers fail
  const incompleteRes = evaluateQuiz({ 0: 1 }, correctAnswers);
  assert.equal(incompleteRes.passed, false);
});

test('processVoucherRedemption manages wallet deductions and codes', () => {
  // Insufficient balance
  const failRedeem = processVoucherRedemption(50, 100, 'SWIGGY');
  assert.equal(failRedeem.success, false);
  assert.equal(failRedeem.newBalance, 50);

  // Sufficient balance
  const passRedeem = processVoucherRedemption(250, 100, 'AMAZON');
  assert.equal(passRedeem.success, true);
  assert.equal(passRedeem.newBalance, 150);
  assert.ok(passRedeem.code?.startsWith('IMP-AMAZ'));

  const generatedCode = generateVoucherCode('BMS');
  assert.ok(generatedCode.startsWith('IMP-BMS-'));
});
