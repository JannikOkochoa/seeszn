// ─── Safe outbound fetch for the Sichtbarkeitsprüfung ─────────────────────────
// Everything that touches a user-supplied target goes through here. We treat the
// domain as hostile input: validate the URL, resolve DNS and reject private /
// internal addresses (SSRF), follow only a small number of redirects (re-checking
// each hop), enforce a hard timeout and cap how many bytes we read.

import dns from "node:dns/promises";
import net from "node:net";

const USER_AGENT =
  "Mozilla/5.0 (compatible; SEESZN-Sichtbarkeitspruefung/1.0; +https://seeszn.com)";

export class SafeFetchError extends Error {
  constructor(
    message: string,
    readonly code: "invalid_domain" | "blocked_target" | "unreachable" | "timeout",
  ) {
    super(message);
    this.name = "SafeFetchError";
  }
}

/**
 * Turn user input ("example.de", "https://example.de/", " Example ") into a
 * validated https/http URL. Throws SafeFetchError on anything unusable.
 */
export function normalizeUrl(input: string): URL {
  const raw = (input || "").trim();
  if (!raw) throw new SafeFetchError("Empty input", "invalid_domain");
  if (raw.length > 255) throw new SafeFetchError("Too long", "invalid_domain");

  // Add a scheme if the user typed a bare domain.
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new SafeFetchError("Not a valid URL", "invalid_domain");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new SafeFetchError("Only http and https are allowed", "invalid_domain");
  }

  const host = url.hostname.toLowerCase();
  // A real public host needs a dot and a sane TLD-ish shape.
  if (!host.includes(".") || /\s/.test(host)) {
    throw new SafeFetchError("Not a public domain", "invalid_domain");
  }
  if (isBlockedHostname(host)) {
    throw new SafeFetchError("Target not allowed", "blocked_target");
  }

  url.hash = "";
  return url;
}

/** Obvious non-public host names we reject before any DNS work. */
function isBlockedHostname(host: string): boolean {
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".lan")
  ) {
    return true;
  }
  // Cloud metadata endpoint, by name or IP.
  if (host === "metadata.google.internal") return true;
  // If the host is itself an IP literal, range-check it directly.
  if (net.isIP(host)) return isPrivateIp(host);
  return false;
}

/** True for loopback, link-local, private and reserved ranges. */
function isPrivateIp(ip: string): boolean {
  const v = net.isIP(ip);
  if (v === 4) {
    const p = ip.split(".").map(Number);
    if (p.length !== 4 || p.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
    const [a, b] = p;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local incl. 169.254.169.254
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast / reserved
    return false;
  }
  if (v === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fe80")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
    // IPv4-mapped (::ffff:a.b.c.d) — extract and recheck.
    const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    return false;
  }
  return true; // not a valid IP literal -> treat as unsafe
}

/** Resolve a hostname and confirm every address it points to is public. */
async function assertPublicHost(host: string): Promise<void> {
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new SafeFetchError("Private address", "blocked_target");
    return;
  }
  let records: { address: string }[];
  try {
    records = await dns.lookup(host, { all: true });
  } catch {
    throw new SafeFetchError("DNS lookup failed", "unreachable");
  }
  if (records.length === 0) throw new SafeFetchError("No DNS record", "unreachable");
  for (const r of records) {
    if (isPrivateIp(r.address)) {
      throw new SafeFetchError("Resolves to a private address", "blocked_target");
    }
  }
}

export interface SafeResponse {
  status: number;
  finalUrl: string;
  headers: Headers;
  body: string;
  truncated: boolean;
}

interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  /** Only read/return a body for text-like responses. */
  wantBody?: boolean;
}

/**
 * Fetch a public URL with timeout, byte cap and manual, host-checked redirects.
 * Never throws on HTTP status codes — only on transport / safety failures.
 */
export async function safeFetch(
  start: URL,
  { timeoutMs = 8000, maxBytes = 1_500_000, maxRedirects = 4, wantBody = true }: SafeFetchOptions = {},
): Promise<SafeResponse> {
  let current = start;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertPublicHost(current.hostname);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,*/*" },
      });
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        throw new SafeFetchError("Timed out", "timeout");
      }
      throw new SafeFetchError("Connection failed", "unreachable");
    }
    clearTimeout(timer);

    // Manual redirect handling so we can re-validate each hop.
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location || hop === maxRedirects) {
        throw new SafeFetchError("Too many redirects", "unreachable");
      }
      let nextUrl: URL;
      try {
        nextUrl = new URL(location, current);
      } catch {
        throw new SafeFetchError("Bad redirect", "unreachable");
      }
      if (nextUrl.protocol !== "https:" && nextUrl.protocol !== "http:") {
        throw new SafeFetchError("Bad redirect scheme", "blocked_target");
      }
      if (isBlockedHostnameSafe(nextUrl.hostname)) {
        throw new SafeFetchError("Redirect to blocked target", "blocked_target");
      }
      current = nextUrl;
      continue;
    }

    let body = "";
    let truncated = false;
    if (wantBody && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let received = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value.byteLength;
          if (received > maxBytes) {
            body += decoder.decode(value.slice(0, Math.max(0, maxBytes - (received - value.byteLength))));
            truncated = true;
            await reader.cancel();
            break;
          }
          body += decoder.decode(value, { stream: true });
        }
      } catch {
        // partial body is still useful; keep what we have
      }
    }

    return { status: res.status, finalUrl: current.toString(), headers: res.headers, body, truncated };
  }

  throw new SafeFetchError("Too many redirects", "unreachable");
}

function isBlockedHostnameSafe(host: string): boolean {
  const h = host.toLowerCase();
  return isBlockedHostname(h);
}
