import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple rate limiter using Upstash Redis.
 * Falls open (allows request) if env vars are not set.
 *
 * Set up:
 *   1. Create a free Redis database at upstash.com
 *   2. Add to .env.local:
 *      UPSTASH_REDIS_REST_URL=...
 *      UPSTASH_REDIS_REST_TOKEN=...
 */

interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window size in seconds */
  window: number;
  /** Identifier prefix for Redis keys */
  prefix?: string;
}

async function redisIncr(key: string, window: number): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return 0; // fail open

  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, window],
    ]),
  });

  if (!res.ok) return 0;
  const data = await res.json();
  return data?.[0]?.result ?? 0;
}

function getIdentifier(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null; // fail open

  const id = getIdentifier(request);
  const key = `rl:${config.prefix ?? 'api'}:${id}`;

  try {
    const count = await redisIncr(key, config.window);
    if (count > config.limit) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: { 'Retry-After': String(config.window) },
        }
      );
    }
  } catch {
    // Fail open — don't block users if Redis is unavailable
  }

  return null;
}
