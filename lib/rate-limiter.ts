interface RateLimitEntry {
  count: number;
  resetAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var _rateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const store: Map<string, RateLimitEntry> =
  global._rateLimitStore ?? new Map<string, RateLimitEntry>();

if (process.env.NODE_ENV !== 'production') {
  global._rateLimitStore = store;
}

const MAX_ROASTS = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export function checkRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ROASTS) {
    return { allowed: false };
  }

  entry.count++;
  return { allowed: true };
}
