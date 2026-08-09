// ─── First Move: Scan-Orchestrierung ──────────────────────────────────────────
// Die Schrittfolge des öffentlichen Scans. Jeder Zustand wird erst gemeldet,
// wenn der zugehörige Schritt tatsächlich fertig ist. Es gibt keine künstliche
// Wartezeit, keinen Fortschrittsbalken und keinen Zustand ohne echte Ursache.
//
// Der Aufrufer bekommt die Zustände über `emit` und kann sie streamen. Fällt ein
// einzelner Schritt aus, degradiert der Scan, statt abzubrechen.

import { normalizeUrl, SafeFetchError } from "@/lib/scan/fetcher";
import { readPage, readRobots, readSitemap, type PageSurface } from "./surface";
import { qualify } from "./qualify";
import { qualifyPublicPaid } from "./paid";
import type {
  FirstMoveFinding,
  FirstMoveRoute,
  PaidFinding,
  ScanState,
  ScanStateEvent,
  SpendBand,
} from "./types";

export type Emit = (event: ScanStateEvent) => void;

function state(emit: Emit, s: ScanState, label: string, detail?: string): void {
  emit({ type: "state", state: s, label, detail, at: new Date().toISOString() });
}

/** Wie viele Unterseiten der Scan höchstens öffentlich liest. */
const MAX_SAMPLE_PAGES = 8;
const SAMPLE_CONCURRENCY = 4;

const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|zip|mp4|mp3|xml|json|css|js)(\?|$)/i;
const SKIP_PATH = /\/(wp-content|wp-json|feed|tag|author|cart|checkout|login|account|impressum|datenschutz|privacy|agb|legal)\b/i;

/**
 * Wählt die Seiten, die tatsächlich geprüft werden. Bevorzugt flache,
 * inhaltstragende URLs und streut über verschiedene Verzeichnisse, damit ein
 * Template-Muster überhaupt sichtbar werden kann.
 */
function pickSamplePages(home: PageSurface, sitemapUrls: string[], host: string): URL[] {
  const pool = sitemapUrls.length ? sitemapUrls : home.internalLinks;
  const seen = new Set<string>();
  const scored: { url: URL; depth: number; dir: string }[] = [];

  for (const raw of pool) {
    let u: URL;
    try {
      u = new URL(raw);
    } catch {
      continue;
    }
    if (u.hostname.toLowerCase().replace(/^www\./, "") !== host) continue;
    if (SKIP_EXT.test(u.pathname) || SKIP_PATH.test(u.pathname)) continue;
    u.hash = "";
    u.search = "";
    const key = u.toString().replace(/\/$/, "");
    if (!key || seen.has(key)) continue;
    if (key === home.url.replace(/\/$/, "")) continue;
    seen.add(key);
    const segments = u.pathname.split("/").filter(Boolean);
    scored.push({ url: u, depth: segments.length, dir: segments[0] ?? "" });
    if (scored.length > 400) break;
  }

  scored.sort((a, b) => a.depth - b.depth);

  // Erst je ein Vertreter pro Verzeichnis, danach auffüllen. So entsteht ein
  // Querschnitt statt acht Seiten aus demselben Ordner.
  const chosen: URL[] = [];
  const usedDirs = new Set<string>();
  for (const item of scored) {
    if (chosen.length >= MAX_SAMPLE_PAGES) break;
    if (usedDirs.has(item.dir)) continue;
    usedDirs.add(item.dir);
    chosen.push(item.url);
  }
  for (const item of scored) {
    if (chosen.length >= MAX_SAMPLE_PAGES) break;
    if (chosen.some((c) => c.toString() === item.url.toString())) continue;
    chosen.push(item.url);
  }
  return chosen;
}

/** Liest die ausgewählten Seiten mit begrenzter Parallelität. */
async function readSamples(urls: URL[]): Promise<PageSurface[]> {
  const out: PageSurface[] = [];
  for (let i = 0; i < urls.length; i += SAMPLE_CONCURRENCY) {
    const batch = urls.slice(i, i + SAMPLE_CONCURRENCY);
    const results = await Promise.all(
      batch.map((u) => readPage(u, 7000).catch(() => null)),
    );
    for (const r of results) if (r) out.push(r);
  }
  return out;
}

export interface ScanOutcome {
  domain: string;
  url: string;
  finding: FirstMoveFinding | null;
  notQualifiedReason?: string;
}

/**
 * Öffentlicher Scan für Search, AI Search und den unentschiedenen Pfad.
 * Wirft nur bei Eingabe- oder Transportfehlern (SafeFetchError).
 */
export async function runFirstMoveScan(
  input: string,
  route: FirstMoveRoute,
  emit: Emit,
): Promise<ScanOutcome> {
  state(emit, "normalizing_domain", "Domain wird normalisiert");
  const target = normalizeUrl(input);
  const host = target.hostname.toLowerCase().replace(/^www\./, "");

  const home = await readPage(target);
  const displayDomain = new URL(home.url).hostname.replace(/^www\./, "");
  state(emit, "domain_reachable", "Domain erkannt", `${displayDomain} antwortet mit ${home.status}`);

  const origin = new URL(new URL(home.url).origin);
  const robots = await readRobots(origin);
  state(
    emit,
    "robots_checked",
    "robots.txt geprüft",
    robots.state === "missing"
      ? "keine robots.txt gefunden"
      : robots.state === "blocks"
        ? "Disallow auf / für User-agent *"
        : `Crawling erlaubt, ${robots.sitemapUrls.length} Sitemap-Verweise`,
  );

  const sitemap = await readSitemap(origin, robots.sitemapUrls);
  state(
    emit,
    "sitemap_checked",
    "Sitemap geprüft",
    sitemap.state === "found" ? `${sitemap.urls.length} URLs gelesen` : "keine lesbare Sitemap",
  );

  const picks = pickSamplePages(home, sitemap.urls, host);
  state(
    emit,
    "scope_detected",
    "Scope bestimmt",
    sitemap.state === "found"
      ? `${sitemap.urls.length} URLs im Index-Angebot${sitemap.partial ? ", Teilmenge gelesen" : ""}`
      : `${home.internalLinks.length} interne Links auf der Startseite`,
  );

  const samples = await readSamples(picks);
  state(emit, "public_pages_read", "Relevante Seiten verglichen", `${samples.length + 1} Seiten geprüft`);

  const indexable = samples.filter((p) => p.status === 200 && !p.noindex).length;
  state(
    emit,
    "technical_signals_checked",
    "Technische Signale geprüft",
    `${indexable} von ${samples.length} Unterseiten indexierbar`,
  );

  const templates = new Set(
    samples.map((p) => `${p.h1.length}:${p.h2.length > 0 ? "h2" : "flat"}`),
  ).size;
  state(
    emit,
    "semantic_patterns_found",
    "Muster abgeglichen",
    `${templates} unterscheidbare Seitentemplates`,
  );

  state(emit, "finding_qualifying", "Signale werden abgeglichen");
  const finding = qualify({ route, domain: displayDomain, home, samples, robots, sitemap });

  if (!finding) {
    const blocked = home.status !== 200;
    state(
      emit,
      "not_qualified",
      blocked ? "Oberfläche nicht öffentlich lesbar" : "Kein starkes öffentliches Signal",
      blocked
        ? `Die Startseite antwortet mit ${home.status}`
        : "Die öffentlichen Signale reichen für eine Empfehlung nicht aus",
    );
    return {
      domain: displayDomain,
      url: home.url,
      finding: null,
      notQualifiedReason: blocked
        ? `Die Startseite antwortet auf einen automatisierten Abruf mit Status ${home.status}. Was ein Bot-Schutz ausliefert, sagt über die echte Seite nichts aus, deshalb leiten wir daraus keinen Befund ab. Wir prüfen das manuell.`
        : "Die öffentlich lesbaren Signale zeigen kein Muster, das stark genug für eine Empfehlung wäre.",
    };
  }

  state(emit, "finding_ready", "Relevantes Signal erkannt", finding.title);
  return { domain: displayDomain, url: home.url, finding };
}

// ─── Paid Stufe 1 ─────────────────────────────────────────────────────────────

/** Bester Aufwand: freier PageSpeed-Endpunkt, blockiert den Check nie. */
async function measurePerformance(target: URL): Promise<number | null> {
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
    if (!res.ok) return null;
    const data = (await res.json()) as {
      lighthouseResult?: { categories?: { performance?: { score?: number } } };
    };
    const score = data.lighthouseResult?.categories?.performance?.score;
    return typeof score === "number" ? Math.round(score * 100) : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export interface PaidOutcome {
  domain: string;
  url: string;
  finding: PaidFinding | null;
  notQualifiedReason?: string;
}

export async function runPaidPublicCheck(
  input: string,
  spendBand: SpendBand,
  emit: Emit,
): Promise<PaidOutcome> {
  state(emit, "normalizing_domain", "Domain wird normalisiert");
  const target = normalizeUrl(input);

  const [landing, performance] = await Promise.all([
    readPage(target),
    measurePerformance(target),
  ]);
  const displayDomain = new URL(landing.url).hostname.replace(/^www\./, "");
  state(emit, "domain_reachable", "Einstiegsseite erkannt", `${displayDomain} antwortet mit ${landing.status}`);

  state(
    emit,
    "technical_signals_checked",
    "Öffentliche Mess-Signale geprüft",
    landing.tagSignals.length
      ? landing.tagSignals.join(", ")
      : "kein Mess-Tag im ausgelieferten HTML sichtbar",
  );

  state(
    emit,
    "public_pages_read",
    "Consent-Implementierung geprüft",
    landing.consentPlatform ? `${landing.consentPlatform} erkannt` : "keine gängige Consent-Plattform erkennbar",
  );

  state(
    emit,
    "semantic_patterns_found",
    "Konversionspfad geprüft",
    `${landing.formCount} Formular(e), ${landing.inputCount} Felder, ${landing.h1.length} H1`,
  );

  if (performance !== null) {
    state(emit, "technical_signals_checked", "Landingpage-Performance gemessen", `Lighthouse mobil ${performance}/100`);
  }

  state(emit, "finding_qualifying", "Signale werden abgeglichen");
  const finding = qualifyPublicPaid({
    domain: displayDomain,
    spendBand,
    landing,
    samples: [],
    performance,
  });

  if (!finding) {
    const blocked = landing.status !== 200;
    state(
      emit,
      "not_qualified",
      blocked ? "Einstiegsseite nicht öffentlich lesbar" : "Kein starkes öffentliches Signal",
      blocked
        ? `Die Einstiegsseite antwortet mit ${landing.status}`
        : "Die öffentlich sichtbaren Signale sind unauffällig",
    );
    return {
      domain: displayDomain,
      url: landing.url,
      finding: null,
      notQualifiedReason: blocked
        ? `Die Einstiegsseite antwortet auf einen automatisierten Abruf mit Status ${landing.status}. Aus einer Bot-Schutzseite leiten wir keinen Befund ab. Wir prüfen das manuell.`
        : "Die öffentlich sichtbaren Paid-Signale dieser Einstiegsseite sind unauffällig. Alles Weitere liegt im Konto und ist ohne lesenden Zugriff nicht seriös bewertbar.",
    };
  }

  state(emit, "public_finding_ready", "Relevantes Signal erkannt", finding.title);
  state(
    emit,
    "read_only_required",
    "Account-Ebene benötigt Read-only",
    "Suchbegriffe, Attribution und Budgetverteilung sind öffentlich nicht lesbar",
  );

  return { domain: displayDomain, url: landing.url, finding };
}

/** Mappt Transportfehler auf die Fehlercodes des Contracts. */
export function scanErrorCode(err: unknown): "invalid_domain" | "blocked_target" | "unreachable" | "timeout" | "internal" {
  if (err instanceof SafeFetchError) return err.code;
  return "internal";
}
