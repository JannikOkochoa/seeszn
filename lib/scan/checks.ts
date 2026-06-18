// ─── Free surface checks ──────────────────────────────────────────────────────
// All checks here use only the public web surface and free Google endpoints.
// No paid services, no database, no SERP scraping, no AI-system polling.
// Parsing is done with conservative regex (no DOM dependency) over a byte-capped
// HTML string, so a malformed or huge page degrades gracefully instead of
// crashing the route.

import { safeFetch, SafeFetchError, normalizeUrl } from "./fetcher";
import type { RawSignals } from "./types";

// ── small HTML helpers ────────────────────────────────────────────────────────

function stripScriptsStyles(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function firstMatch(re: RegExp, html: string): string | null {
  const m = re.exec(html);
  return m ? decodeEntities(m[1].trim()) : null;
}

/** Read a <meta> attribute by name/property, tolerant of attribute order. */
function metaContent(html: string, key: "name" | "property", value: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const k = new RegExp(`${key}\\s*=\\s*["']${value}["']`, "i");
    if (k.test(tag)) {
      const c = /content\s*=\s*["']([^"']*)["']/i.exec(tag);
      if (c) return decodeEntities(c[1]);
    }
  }
  return null;
}

function allTagText(html: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const text = decodeEntities(m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
    if (text) out.push(text);
  }
  return out;
}

interface JsonLdSummary {
  types: string[];
  hasOrganization: boolean;
  hasFaq: boolean;
  hasArticle: boolean;
}

function collectJsonLd(html: string): JsonLdSummary {
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const types = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      collectTypes(parsed, types);
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }
  const list = [...types];
  const has = (t: string) => list.some((x) => x.toLowerCase() === t.toLowerCase());
  return {
    types: list,
    hasOrganization: has("Organization") || has("Corporation") || has("LocalBusiness"),
    hasFaq: has("FAQPage") || has("QAPage") || has("Question"),
    hasArticle: has("Article") || has("BlogPosting") || has("NewsArticle") || has("TechArticle"),
  };
}

function collectTypes(node: unknown, into: Set<string>): void {
  if (Array.isArray(node)) {
    for (const n of node) collectTypes(n, into);
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    if (typeof t === "string") into.add(t);
    else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && into.add(x));
    if (Array.isArray(obj["@graph"])) collectTypes(obj["@graph"], into);
    for (const key of Object.keys(obj)) {
      if (key !== "@type") collectTypes(obj[key], into);
    }
  }
}

function countLinks(html: string, originHost: string): { internal: number; external: number } {
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let internal = 0;
  let external = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1].trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      continue;
    }
    if (/^https?:\/\//i.test(href)) {
      try {
        const h = new URL(href).hostname.toLowerCase().replace(/^www\./, "");
        if (h === originHost.replace(/^www\./, "")) internal++;
        else external++;
      } catch {
        /* skip */
      }
    } else {
      internal++; // relative link
    }
  }
  return { internal, external };
}

function wordCount(html: string): number {
  const text = stripScriptsStyles(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(" ").filter((w) => w.length > 1).length;
}

function detectFaqPattern(html: string, jsonLd: JsonLdSummary): boolean {
  if (jsonLd.hasFaq) return true;
  const text = stripScriptsStyles(html).toLowerCase();
  if (/häufige fragen|häufig gestellte fragen|\bfaq\b|fragen und antworten|frequently asked/.test(text)) return true;
  // Several question-shaped headings is a strong Q&A signal.
  const headings = [...allTagText(html, "h2"), ...allTagText(html, "h3")];
  const questionHeadings = headings.filter((h) => h.trim().endsWith("?")).length;
  return questionHeadings >= 3;
}

function detectConversionSignal(html: string, internalLinks: number): boolean {
  const lower = html.toLowerCase();
  const hasContactWord =
    /\b(kontakt|contact|demo|termin|beratung|anfrage|angebot|jetzt starten|get in touch|book a|buchen|call|gespräch)\b/.test(lower);
  const hasMailto = /href\s*=\s*["']mailto:/i.test(html);
  const hasForm = /<form\b/i.test(html);
  // A reachable surface with a clear path: contact intent + a way to act.
  return (hasContactWord && (hasMailto || hasForm || internalLinks > 5)) || (hasMailto && hasForm);
}

// ── robots.txt ────────────────────────────────────────────────────────────────

async function checkRobots(origin: URL): Promise<{ state: RawSignals["robotsTxt"]; sitemapUrls: string[] }> {
  try {
    const robotsUrl = new URL("/robots.txt", origin);
    const res = await safeFetch(robotsUrl, { timeoutMs: 5000, maxBytes: 200_000 });
    if (res.status !== 200 || !res.body.trim()) {
      return { state: "missing", sitemapUrls: [] };
    }
    const sitemapUrls = [...res.body.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1].trim());

    // Determine if the generic crawler is disallowed from the root.
    const lines = res.body.split(/\r?\n/);
    let activeForAll = false;
    let blocksRoot = false;
    for (const line of lines) {
      const clean = line.replace(/#.*$/, "").trim();
      if (!clean) continue;
      const ua = /^user-agent:\s*(.+)$/i.exec(clean);
      if (ua) {
        activeForAll = ua[1].trim() === "*";
        continue;
      }
      if (activeForAll) {
        const dis = /^disallow:\s*(.*)$/i.exec(clean);
        if (dis && dis[1].trim() === "/") blocksRoot = true;
      }
    }
    return { state: blocksRoot ? "blocks" : "allows", sitemapUrls };
  } catch (err) {
    if (err instanceof SafeFetchError && err.code === "timeout") return { state: "error", sitemapUrls: [] };
    return { state: "error", sitemapUrls: [] };
  }
}

async function checkSitemap(origin: URL, fromRobots: string[]): Promise<RawSignals["sitemap"]> {
  // Prefer a sitemap explicitly declared in robots.txt.
  const candidates = fromRobots.length ? fromRobots : [new URL("/sitemap.xml", origin).toString()];
  for (const candidate of candidates.slice(0, 2)) {
    try {
      const url = normalizeUrl(candidate);
      const res = await safeFetch(url, { timeoutMs: 5000, maxBytes: 300_000 });
      if (res.status === 200 && /<(urlset|sitemapindex)\b|<url>|<loc>/i.test(res.body)) {
        return "found";
      }
    } catch {
      // try next candidate
    }
  }
  return "missing";
}

// ── PageSpeed Insights (free, best-effort) ──────────────────────────────────────
// We try the free PSI endpoint. If it is unavailable, rate-limited or slow, we
// do not block the scan and mark performance as not measured. Honest by design.

async function checkPerformance(target: URL): Promise<{ performance: number | null; state: "measured" | "unavailable" }> {
  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", target.toString());
  api.searchParams.set("category", "performance");
  api.searchParams.set("strategy", "mobile");
  if (process.env.PAGESPEED_API_KEY) api.searchParams.set("key", process.env.PAGESPEED_API_KEY);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(api.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return { performance: null, state: "unavailable" };
    const data = (await res.json()) as {
      lighthouseResult?: { categories?: { performance?: { score?: number } } };
    };
    const score = data.lighthouseResult?.categories?.performance?.score;
    if (typeof score === "number") return { performance: Math.round(score * 100), state: "measured" };
    return { performance: null, state: "unavailable" };
  } catch {
    clearTimeout(timer);
    return { performance: null, state: "unavailable" };
  }
}

// ── orchestration ───────────────────────────────────────────────────────────────

export interface FetchedSurface {
  signals: RawSignals;
  finalUrl: string;
}

/**
 * Run all free checks against a normalized URL and return raw signals.
 * The homepage fetch, robots/sitemap and the performance probe run in parallel;
 * a failure in any single check is contained and reflected in the signals.
 */
export async function runChecks(target: URL): Promise<FetchedSurface> {
  const origin = new URL(target.origin);

  const [homepage, robots, performance] = await Promise.all([
    safeFetch(target, { timeoutMs: 8000, maxBytes: 1_500_000 }),
    checkRobots(origin),
    checkPerformance(target),
  ]);

  const sitemap = await checkSitemap(origin, robots.sitemapUrls);

  const html = homepage.body;
  const originHost = new URL(homepage.finalUrl).hostname.toLowerCase();
  const jsonLd = collectJsonLd(html);
  const links = countLinks(html, originHost);
  const words = wordCount(html);
  const title = firstMatch(/<title\b[^>]*>([\s\S]*?)<\/title>/i, html);
  const metaDescription = metaContent(html, "name", "description");
  const h1 = allTagText(html, "h1");
  const h2Count = allTagText(html, "h2").length;
  const canonical = (() => {
    const links = html.match(/<link\b[^>]*>/gi) || [];
    for (const l of links) {
      if (/rel\s*=\s*["']canonical["']/i.test(l)) {
        const href = /href\s*=\s*["']([^"']+)["']/i.exec(l);
        if (href) return decodeEntities(href[1]);
      }
    }
    return null;
  })();

  const signals: RawSignals = {
    httpStatus: homepage.status,
    https: new URL(homepage.finalUrl).protocol === "https:",
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length ?? 0,
    h1,
    h2Count,
    canonical,
    ogTitle: metaContent(html, "property", "og:title"),
    ogDescription: metaContent(html, "property", "og:description"),
    ogSiteName: metaContent(html, "property", "og:site_name"),
    jsonLdTypes: jsonLd.types,
    hasOrganizationSchema: jsonLd.hasOrganization,
    hasFaqSchema: jsonLd.hasFaq,
    hasArticleSchema: jsonLd.hasArticle,
    robotsTxt: robots.state,
    sitemap,
    internalLinks: links.internal,
    externalLinks: links.external,
    wordCount: words,
    faqPattern: detectFaqPattern(html, jsonLd),
    conversionSignal: detectConversionSignal(html, links.internal),
    performance: performance.performance,
    performanceState: performance.state,
  };

  return { signals, finalUrl: homepage.finalUrl };
}
