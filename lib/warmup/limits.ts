import { getAllowedDailyLimit } from './levels';

export interface CanSendCheckParams {
  dailySent: number;
  warmupLevel: number;
  campaignDailyLimit: number;
}

export function canAccountSendToday({
  dailySent,
  warmupLevel,
  campaignDailyLimit,
}: CanSendCheckParams): boolean {
  const allowed = getAllowedDailyLimit(warmupLevel, campaignDailyLimit);
  return dailySent < allowed;
}

export function isThreadLimitReached(
  messageCountInThread: number,
  maxMessagesPerThread: number
): boolean {
  return messageCountInThread >= maxMessagesPerThread;
}

/**
 * Calculates a controlled jitter delay in milliseconds between min_delay and max_delay
 */
export function calculateNextScheduledTime(
  minDelayMinutes: number,
  maxDelayMinutes: number,
  baseDate: Date = new Date()
): Date {
  const minMs = Math.max(1, minDelayMinutes) * 60 * 1000;
  const maxMs = Math.max(minDelayMinutes, maxDelayMinutes) * 60 * 1000;
  const randomDelay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

  return new Date(baseDate.getTime() + randomDelay);
}
