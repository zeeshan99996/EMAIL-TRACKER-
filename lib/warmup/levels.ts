import { WarmupLevelInfo } from './types';

export const WARMUP_LEVELS: Record<number, WarmupLevelInfo> = {
  0: {
    level: 0,
    name: 'Initial Starter',
    targetDailyVolume: 10,
    description: 'New account baseline (up to 10 emails/day).',
  },
  1: {
    level: 1,
    name: 'Developing',
    targetDailyVolume: 20,
    description: 'Developing engagement (up to 20 emails/day).',
  },
  2: {
    level: 2,
    name: 'Active Warmup',
    targetDailyVolume: 35,
    description: 'Moderate volume (up to 35 emails/day) expanding deliverability.',
  },
  3: {
    level: 3,
    name: 'High Volume',
    targetDailyVolume: 50,
    description: 'High volume (up to 50 emails/day) across active fleet.',
  },
  4: {
    level: 4,
    name: 'Established / Completed',
    targetDailyVolume: 75,
    description: 'Full warmup achieved (50+ emails/day) with optimal sender score.',
  },
};

/**
 * Calculates current level progression based on total sent messages
 */
export function calculateLevelFromStats(totalSent: number, currentLevel: number): number {
  if (totalSent >= 75) return 4;
  if (totalSent >= 35) return Math.max(currentLevel, 3);
  if (totalSent >= 10) return Math.max(currentLevel, 2);
  if (totalSent >= 5) return Math.max(currentLevel, 1);
  return currentLevel;
}

/**
 * Calculates human-readable Warmup Progress Percentage (0% to 100%)
 */
export function calculateWarmupProgressPercent(totalSent: number = 0): number {
  if (totalSent <= 0) return 5; // Connected & Initialized
  if (totalSent >= 100) return 100; // 100% Fully Established

  if (totalSent < 10) {
    return Math.min(25, Math.round(5 + (totalSent / 10) * 20));
  } else if (totalSent < 25) {
    return Math.min(50, Math.round(25 + ((totalSent - 10) / 15) * 25));
  } else if (totalSent < 50) {
    return Math.min(75, Math.round(50 + ((totalSent - 25) / 25) * 25));
  } else {
    return Math.min(99, Math.round(75 + ((totalSent - 50) / 50) * 24));
  }
}

/**
 * Returns maximum allowed messages today for this account based on level and user config limit
 */
export function getAllowedDailyLimit(warmupLevel: number, campaignDailyLimit: number): number {
  const levelTarget = WARMUP_LEVELS[warmupLevel]?.targetDailyVolume ?? 20;
  return Math.max(10, Math.min(levelTarget, campaignDailyLimit || 50));
}
