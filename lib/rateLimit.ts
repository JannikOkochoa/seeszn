// ─── Lightweight in-memory rate limiting ────────────────────────────────────────
// Dependency-free fixed-window limiter for the public POST routes. State lives in
// the module scope of the Node runtime — good enough to blunt abuse and bursts on
// a single instance. It is intentionally simple: no Redis, no external service.
//
// Local development is never throttled (enforced only when NODE_ENV=production), so
// repeated local testing does not lock you out. No IPs or secrets are logged.
//
// ⚠ Composite keys: behind a shared reverse proxy (e.g. Hostinger), all traffic
// may arrive from the same upstream IP. Callers should build a composite key that
// includes a per-user signal (e.g. email domain) alongside the IP so that one
// user cannot exhaust the budget of every other user on the same host.

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets — used for the Retry-After header. */
  retryAfterSec: number;
}

/**
 * Fixed-window limiter. Returns ok=false once `limit` is exceeded for an
 * `ip` within `windowMs`. No-op (always ok) outside production so local dev and
 * previews are not throttled.
 */
export function rateLimit(
  namespace: string,
  ip: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  if (process.env.NODE_ENV !== "production") return { ok: true, retryAfterSec: 0 };

  const now = Date.now();
  const key = `${namespace}:${ip}`;
  const entry = windows.get(key);

  if (!entry || entry.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    sweep(now);
    return { ok: true, retryAfterSec: 0 };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }

  entry.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** Drop expired windows so the map cannot grow unbounded. Cheap, amortized. */
function sweep(now: number): void {
  if (windows.size < 5000) return;
  for (const [key, win] of windows) {
    if (win.resetAt <= now) windows.delete(key);
  }
}
