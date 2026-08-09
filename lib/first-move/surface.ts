// ─── First Move: Lesen der öffentlichen Oberfläche ────────────────────────────
// Alles hier arbeitet ausschließlich mit öffentlich abrufbarem HTML, robots.txt
// und sitemap.xml. Kein Account-Zugriff, keine SERP-Abfragen, keine KI-Systeme.
//
// Jeder ausgehende Request läuft über lib/scan/fetcher (SSRF-Schutz, Timeout,
// Byte-Cap, erneut geprüfte Redirects). Diese Datei parst nur, sie holt nichts
// an dieser Sicherheitsschicht vorbei.
//
// Bewusst konservative Regex statt DOM: ein kaputtes oder riesiges Dokument darf
// degradieren, nie den Scan abbrechen.

import { safeFetch, normalizeUrl } from "@/lib/scan/fetcher";

export interface PageSurface {
  url: string;
  status: number;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  /** robots-Meta bzw. X-Robots-Tag enthält noindex. */
  noindex: boolean;
  h1: string[];
  h2: string[];
  h3: string[];
  /** Überschriften, die als Frage formuliert sind. Signal für Antwortstruktur. */
  questionHeadings: number;
  wordCount: number;
  /** Interne Links als absolute URLs, dedupliziert. */
  internalLinks: string[];
  externalLinks: number;
  jsonLdTypes: string[];
  hasOrganizationSchema: boolean;
  hasFaqSchema: boolean;
  hreflangCount: number;
  /** Unterschiedliche hreflang-Werte, klein geschrieben. Signal für Multi-Market. */
  hreflangLocales: string[];
  /** Anzahl <form>-Elemente und sichtbarer Eingabefelder. */
  formCount: number;
  inputCount: number;
  requiredInputCount: number;
  /** Erkannte öffentliche Mess- und Tag-Signale. */
  tagSignals: string[];
  /** Erkannte Consent-Management-Plattform, falls im HTML sichtbar. */
  consentPlatform: string | null;
  ogSiteName: string | null;
  htmlBytes: number;
}

// ── HTML-Helfer ───────────────────────────────────────────────────────────────

function stripScriptsStyles(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagText(html: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < 200) {
    const text = decodeEntities(m[1].replace(/<[^>]+>/g, " "));
    if (text) out.push(text);
  }
  return out;
}

function metaContent(html: string, key: "name" | "property", value: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (new RegExp(`${key}\\s*=\\s*["']${value}["']`, "i").test(tag)) {
      const c = /content\s*=\s*["']([^"']*)["']/i.exec(tag);
      if (c) return decodeEntities(c[1]);
    }
  }
  return null;
}

function linkHref(html: string, rel: string): string | null {
  const links = html.match(/<link\b[^>]*>/gi) || [];
  for (const l of links) {
    if (new RegExp(`rel\\s*=\\s*["']${rel}["']`, "i").test(l)) {
      const href = /href\s*=\s*["']([^"']+)["']/i.exec(l);
      if (href) return decodeEntities(href[1]);
    }
  }
  return null;
}

function collectJsonLdTypes(html: string): string[] {
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const types = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      walk(JSON.parse(m[1].trim()), types);
    } catch {
      /* defektes JSON-LD wird ignoriert, nicht gemeldet */
    }
  }
  return [...types];
}

function walk(node: unknown, into: Set<string>): void {
  if (Array.isArray(node)) {
    for (const n of node) walk(n, into);
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    if (typeof t === "string") into.add(t);
    else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && into.add(x));
    for (const key of Object.keys(obj)) if (key !== "@type") walk(obj[key], into);
  }
}

/**
 * Öffentlich erkennbare Mess- und Tag-Signale. Wir behaupten damit nie eine
 * vollständige Conversion-Konfiguration, sondern nur, welche Container bzw.
 * Tags im ausgelieferten HTML sichtbar sind.
 */
const TAG_PATTERNS: readonly { id: string; re: RegExp }[] = [
  { id: "Google Tag Manager", re: /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]{4,}/ },
  { id: "Google Tag (gtag.js)", re: /googletagmanager\.com\/gtag\/js/ },
  { id: "Google Ads Conversion Tag", re: /google_conversion_id|AW-\d{6,}|googleads\.g\.doubleclick\.net/ },
  { id: "Google Ads Remarketing", re: /googleadservices\.com\/pagead\/conversion/ },
  { id: "Meta Pixel", re: /connect\.facebook\.net\/[^"']*fbevents\.js/ },
  { id: "LinkedIn Insight Tag", re: /snap\.licdn\.com\/li\.lms-analytics/ },
  { id: "Microsoft Advertising UET", re: /bat\.bing\.com\/bat\.js/ },
];

const CONSENT_PATTERNS: readonly { id: string; re: RegExp }[] = [
  { id: "Cookiebot", re: /consent\.cookiebot\.com/ },
  { id: "Usercentrics", re: /usercentrics|app\.usercentrics\.eu/ },
  { id: "OneTrust", re: /cdn\.cookielaw\.org|onetrust/i },
  { id: "Borlabs Cookie", re: /borlabs-cookie/i },
  { id: "Cookieyes", re: /cookieyes|cky-consent/i },
  { id: "Iubenda", re: /iubenda|cdn\.iubenda\.com/ },
  { id: "Klaro", re: /klaro(-no-css)?\.js/ },
  { id: "Complianz", re: /complianz/i },
];

// ── Seite lesen ───────────────────────────────────────────────────────────────

/** Holt eine öffentliche Seite und extrahiert alle Signale in einem Durchgang. */
export async function readPage(target: URL, timeoutMs = 8000): Promise<PageSurface> {
  const res = await safeFetch(target, { timeoutMs, maxBytes: 900_000 });
  const html = res.body;
  const finalUrl = new URL(res.finalUrl);
  const originHost = finalUrl.hostname.toLowerCase().replace(/^www\./, "");

  const robotsMeta = (metaContent(html, "name", "robots") || "").toLowerCase();
  const xRobots = (res.headers.get("x-robots-tag") || "").toLowerCase();

  const h1 = tagText(html, "h1");
  const h2 = tagText(html, "h2");
  const h3 = tagText(html, "h3");

  // Interne Links, dedupliziert und auf eine sinnvolle Menge gedeckelt.
  const internal = new Set<string>();
  let externalLinks = 0;
  const anchorRe = /<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi;
  let a: RegExpExecArray | null;
  while ((a = anchorRe.exec(html)) && internal.size < 400) {
    const href = a[1].trim();
    if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    let abs: URL;
    try {
      abs = new URL(href, finalUrl);
    } catch {
      continue;
    }
    if (abs.protocol !== "https:" && abs.protocol !== "http:") continue;
    const host = abs.hostname.toLowerCase().replace(/^www\./, "");
    if (host === originHost) {
      abs.hash = "";
      internal.add(abs.toString());
    } else {
      externalLinks++;
    }
  }

  const text = stripScriptsStyles(html).replace(/<[^>]+>/g, " ");
  const words = decodeEntities(text).split(" ").filter((w) => w.length > 1).length;

  const jsonLdTypes = collectJsonLdTypes(html);
  const lowerTypes = jsonLdTypes.map((t) => t.toLowerCase());

  const inputs = html.match(/<(input|select|textarea)\b[^>]*>/gi) || [];
  const visibleInputs = inputs.filter((i) => !/type\s*=\s*["'](hidden|submit|button|image)["']/i.test(i));

  const tagSignals = TAG_PATTERNS.filter((p) => p.re.test(html)).map((p) => p.id);
  const consent = CONSENT_PATTERNS.find((p) => p.re.test(html));

  return {
    url: res.finalUrl,
    status: res.status,
    title: (() => {
      const m = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
      return m ? decodeEntities(m[1]) || null : null;
    })(),
    metaDescription: metaContent(html, "name", "description"),
    canonical: linkHref(html, "canonical"),
    noindex: robotsMeta.includes("noindex") || xRobots.includes("noindex"),
    h1,
    h2,
    h3,
    questionHeadings: [...h2, ...h3].filter((h) => h.trim().endsWith("?")).length,
    wordCount: words,
    internalLinks: [...internal],
    externalLinks,
    jsonLdTypes,
    hasOrganizationSchema: lowerTypes.some((t) =>
      ["organization", "corporation", "localbusiness"].includes(t),
    ),
    hasFaqSchema: lowerTypes.some((t) => ["faqpage", "qapage", "question"].includes(t)),
    hreflangCount: (html.match(/hreflang\s*=\s*["'][^"']+["']/gi) || []).length,
    hreflangLocales: [
      ...new Set(
        [...html.matchAll(/hreflang\s*=\s*["']([^"']+)["']/gi)]
          .map((m) => m[1].toLowerCase().trim())
          .filter((l) => l && l !== "x-default"),
      ),
    ],
    formCount: (html.match(/<form\b/gi) || []).length,
    inputCount: visibleInputs.length,
    requiredInputCount: visibleInputs.filter((i) => /\brequired\b/i.test(i)).length,
    tagSignals,
    consentPlatform: consent ? consent.id : null,
    ogSiteName: metaContent(html, "property", "og:site_name"),
    htmlBytes: html.length,
  };
}

// ── robots.txt ────────────────────────────────────────────────────────────────

export interface RobotsResult {
  state: "allows" | "blocks" | "missing" | "error";
  sitemapUrls: string[];
  /** Enthält eine Disallow-Regel speziell für bekannte AI-Crawler. */
  blocksAiCrawlers: string[];
}

const AI_CRAWLERS = ["gptbot", "oai-searchbot", "chatgpt-user", "perplexitybot", "claudebot", "google-extended"];

export async function readRobots(origin: URL): Promise<RobotsResult> {
  try {
    const res = await safeFetch(new URL("/robots.txt", origin), { timeoutMs: 5000, maxBytes: 200_000 });
    if (res.status !== 200 || !res.body.trim()) {
      return { state: "missing", sitemapUrls: [], blocksAiCrawlers: [] };
    }
    const sitemapUrls = [...res.body.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1].trim());

    let currentAgents: string[] = [];
    let blocksRoot = false;
    const blockedAi = new Set<string>();
    let lastWasAgent = false;

    for (const raw of res.body.split(/\r?\n/)) {
      const line = raw.replace(/#.*$/, "").trim();
      if (!line) continue;
      const ua = /^user-agent:\s*(.+)$/i.exec(line);
      if (ua) {
        if (!lastWasAgent) currentAgents = [];
        currentAgents.push(ua[1].trim().toLowerCase());
        lastWasAgent = true;
        continue;
      }
      lastWasAgent = false;
      const dis = /^disallow:\s*(.*)$/i.exec(line);
      if (dis && dis[1].trim() === "/") {
        if (currentAgents.includes("*")) blocksRoot = true;
        for (const agent of currentAgents) {
          if (AI_CRAWLERS.includes(agent)) blockedAi.add(agent);
        }
      }
    }

    return {
      state: blocksRoot ? "blocks" : "allows",
      sitemapUrls,
      blocksAiCrawlers: [...blockedAi],
    };
  } catch {
    return { state: "error", sitemapUrls: [], blocksAiCrawlers: [] };
  }
}

// ── sitemap.xml ───────────────────────────────────────────────────────────────

export interface SitemapResult {
  state: "found" | "missing" | "error";
  /** Gelesene URLs, gedeckelt. Nur zur Scope-Erkennung und Seitenauswahl. */
  urls: string[];
  /** True, wenn ein Sitemap-Index vorlag und wir nur einen Teil gelesen haben. */
  partial: boolean;
}

const MAX_SITEMAP_URLS = 3000;

export async function readSitemap(origin: URL, fromRobots: string[]): Promise<SitemapResult> {
  const candidates = fromRobots.length ? fromRobots : [new URL("/sitemap.xml", origin).toString()];
  const urls: string[] = [];
  let partial = false;
  let sawAny = false;

  for (const candidate of candidates.slice(0, 2)) {
    let body: string;
    try {
      const url = normalizeUrl(candidate);
      const res = await safeFetch(url, { timeoutMs: 6000, maxBytes: 900_000 });
      if (res.status !== 200) continue;
      body = res.body;
    } catch {
      continue; // eine unlesbare Sitemap-Quelle bricht den Scan nicht ab
    }
    if (!/<(urlset|sitemapindex)\b/i.test(body)) continue;
    sawAny = true;

    if (/<sitemapindex\b/i.test(body)) {
      // Sitemap-Index: nur die ersten Kind-Sitemaps lesen, damit große Shops den
      // Scan nicht ausbremsen. Das Ergebnis wird als partial markiert.
      const children = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
      partial = children.length > 3;
      for (const child of children.slice(0, 3)) {
        try {
          const res = await safeFetch(normalizeUrl(child), { timeoutMs: 6000, maxBytes: 900_000 });
          if (res.status !== 200) continue;
          for (const m of res.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
            if (urls.length >= MAX_SITEMAP_URLS) { partial = true; break; }
            urls.push(m[1]);
          }
        } catch {
          /* eine unlesbare Kind-Sitemap bricht den Scan nicht ab */
        }
      }
    } else {
      for (const m of body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
        if (urls.length >= MAX_SITEMAP_URLS) { partial = true; break; }
        urls.push(m[1]);
      }
    }
    if (urls.length) break;
  }

  if (!sawAny) return { state: "missing", urls: [], partial: false };
  return { state: "found", urls, partial };
}
