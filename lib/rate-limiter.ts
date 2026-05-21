import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// fixedWindow boundaries align with midnight UTC (days since Unix epoch)
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, '1 d'),
  prefix: 'roast:ip',
});

export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  resetAt: string;
}> {
  const { success, reset } = await ratelimit.limit(ip);
  return { allowed: success, resetAt: new Date(reset).toISOString() };
}
