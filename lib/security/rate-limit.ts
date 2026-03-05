import { headers } from 'next/headers';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const IS_PROD = process.env.NODE_ENV === 'production';

type Result = { ok: true } | { ok: false; retryAfterSeconds: number };

const localFallback = new Map<string, { count: number; resetAt: number }>();

function localCheck(key: string, limit: number, windowMs: number): Result {
  const now = Date.now();
  const item = localFallback.get(key);
  if (!item || item.resetAt <= now) {
    localFallback.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (item.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((item.resetAt - now) / 1000)) };
  }
  item.count += 1;
  return { ok: true };
}

export async function getRequestClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = h.get('x-real-ip')?.trim();
  return forwardedFor || realIp || 'unknown';
}

export async function assertRateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<Result> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    if (IS_PROD) {
      console.warn('UPSTASH rate limit env missing in production; using local fallback');
    }
    return localCheck(opts.key, opts.limit, opts.windowMs);
  }

  const bucketKey = `rl:${opts.key}:${Math.floor(Date.now() / opts.windowMs)}`;

  const response = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', bucketKey],
      ['PEXPIRE', bucketKey, opts.windowMs],
      ['PTTL', bucketKey],
    ]),
    cache: 'no-store',
  });

  if (!response.ok) {
    return localCheck(opts.key, opts.limit, opts.windowMs);
  }

  const data = (await response.json()) as Array<{ result: number | null }>;
  const count = Number(data?.[0]?.result ?? 0);
  const ttlMs = Number(data?.[2]?.result ?? opts.windowMs);

  if (count > opts.limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000)) };
  }
  return { ok: true };
}

export function rateLimitHeaders(retryAfterSeconds: number): Record<string, string> {
  return {
    'Retry-After': String(retryAfterSeconds),
    'Cache-Control': 'no-store',
  };
}
