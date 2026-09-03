interface RateLimitStore {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitStore>();

/**
 * In-memory sliding-window rate limiter for API endpoints.
 * @param key Unique identifier (e.g. API key hash or IP address)
 * @param maxRequests Maximum allowed requests in the time window (default 100)
 * @param windowMs Time window in milliseconds (default 60000ms / 1 min)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitStore = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: Math.ceil(newRecord.resetAt / 1000),
    };
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.ceil(record.resetAt / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    reset: Math.ceil(record.resetAt / 1000),
  };
}
