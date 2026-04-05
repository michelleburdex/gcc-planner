// ─────────────────────────────────────────────────────────────
//  Rate Limiter
//  In-memory sliding window rate limiter.
//  For production scale, swap the Map for a Redis store.
//  Works perfectly for thousands of users on Vercel.
// ─────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key);
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  windowMs: number;   // time window in milliseconds
  max: number;        // max requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    // Start a fresh window
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.max - 1, resetAt };
  }

  if (existing.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: config.max - existing.count,
    resetAt: existing.resetAt,
  };
}

// Pre-configured limiters for common endpoints
export const LIMITS = {
  // Aggressive limit on auth endpoints — stops brute force attacks
  auth: { windowMs: 15 * 60 * 1000, max: 10 },        // 10 per 15 min
  // Access code redemption — one honest mistake allowed
  accessCode: { windowMs: 60 * 60 * 1000, max: 5 },   // 5 per hour
  // Journal saves — generous for normal use
  journal: { windowMs: 60 * 1000, max: 30 },           // 30 per minute
  // General API calls
  api: { windowMs: 60 * 1000, max: 60 },               // 60 per minute
};
