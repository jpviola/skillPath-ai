// Layer 5 — Distributed rate limiter with a local fallback.
//
// Strategy:
//   1. If a KV/Redis REST endpoint is configured, use it as the source of
//      truth so rate limits are shared across serverless instances.
//   2. Otherwise fall back to in-memory counters for local development.
//
// The remote adapter is intentionally tiny and dependency-free. It expects a
// REST endpoint that can atomically increment a key with TTL, such as Upstash
// Redis or Vercel KV's REST bridge.

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const MAX = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 10);
const GLOBAL_MAX = Number(process.env.RATE_LIMIT_GLOBAL_MAX || 1000);

const REMOTE_URL = (process.env.RATE_LIMIT_REDIS_REST_URL || "").replace(/\/$/, "");
const REMOTE_TOKEN = process.env.RATE_LIMIT_REDIS_REST_TOKEN || "";

const hits = new Map<string, number[]>();
let globalHits: number[] = [];

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number;
  reason?: "device" | "global" | "remote";
}

function localPrune(now: number, key: string) {
  globalHits = globalHits.filter((t) => now - t < WINDOW_MS);
  const arr = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  hits.set(key, arr);
  return arr;
}

function getRetryAfter(now: number, oldestHit: number): number {
  return Math.max(1, Math.ceil((WINDOW_MS - (now - oldestHit)) / 1000));
}

function remoteEnabled(): boolean {
  return REMOTE_URL.length > 0 && REMOTE_TOKEN.length > 0;
}

async function remoteIncrement(key: string): Promise<number> {
  const url = new URL(`${REMOTE_URL}/incr/${encodeURIComponent(key)}`);
  url.searchParams.set("expireIn", String(Math.ceil(WINDOW_MS / 1000)));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REMOTE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: 1 }),
  });

  if (!res.ok) {
    throw new Error(`Remote rate limit failed (${res.status})`);
  }

  const data = (await res.json().catch(() => ({}))) as { result?: unknown };
  const count = Number(data.result);
  if (!Number.isFinite(count)) {
    throw new Error("Remote rate limit returned an invalid count");
  }
  return count;
}

async function rateLimitRemote(key: string): Promise<RateLimitResult> {
  const [deviceCount, globalCount] = await Promise.all([
    remoteIncrement(`device:${key}`),
    remoteIncrement("global"),
  ]);

  if (globalCount > GLOBAL_MAX) {
    return { ok: false, retryAfter: Math.ceil(WINDOW_MS / 1000), reason: "global" };
  }
  if (deviceCount > MAX) {
    return { ok: false, retryAfter: Math.ceil(WINDOW_MS / 1000), reason: "device" };
  }
  return { ok: true, retryAfter: 0 };
}

export async function rateLimit(key: string): Promise<RateLimitResult> {
  const now = Date.now();

  if (remoteEnabled()) {
    try {
      return await rateLimitRemote(key);
    } catch {
      // If the remote store is misconfigured or temporarily unavailable, fall
      // back to local state rather than failing every request outright.
    }
  }

  const arr = localPrune(now, key);
  if (globalHits.length >= GLOBAL_MAX) {
    return {
      ok: false,
      retryAfter: getRetryAfter(now, globalHits[0]),
      reason: "global",
    };
  }
  if (arr.length >= MAX) {
    return {
      ok: false,
      retryAfter: getRetryAfter(now, arr[0]),
      reason: "device",
    };
  }

  arr.push(now);
  hits.set(key, arr);
  globalHits.push(now);
  return { ok: true, retryAfter: 0 };
}

export function rateLimitStats(): {
  globalCount: number;
  globalMax: number;
  perDeviceCount: number;
  perDeviceMax: number;
  windowMs: number;
} {
  const now = Date.now();
  globalHits = globalHits.filter((t) => now - t < WINDOW_MS);
  return {
    globalCount: globalHits.length,
    globalMax: GLOBAL_MAX,
    perDeviceCount: 0,
    perDeviceMax: MAX,
    windowMs: WINDOW_MS,
  };
}
