// ─── ProductPageProvider ──────────────────────────────────────────────────────
// Importiert die Städte-Reiseziele von klassenfahrten-kluehspies.de in die
// pages-Tabelle. Läuft ausschließlich serverseitig und nur auf expliziten
// Anstoß über POST /api/sync/product-pages (nie beim Login).
//
// Quellen und Vollständigkeit:
//   1. Die beiden Listenseiten (Deutschland/Europa) liefern die initial
//      gerenderten Reisekarten inklusive Anzeigename (h3).
//   2. Die Europa-Liste lädt einen Teil der Ziele erst über "Mehr Reisen
//      laden" nach (TYPO3-Ajax). Damit kein Ziel fehlt, wird die Liste über
//      die Travel-Sitemap der Website vervollständigt: dort stehen alle
//      Zielseiten (/staedte-klassenfahrten/<land>/<stadt>/) unabhängig vom
//      Nachladen.
//   3. Für Ziele, die nur über die Sitemap gefunden werden, kommt der Name aus
//      dem Breadcrumb der Zielseite (aktives Element, z. B. "Salzburg").
//
// Sync-Verhalten: idempotente Upserts über (organization_id, url); neue Ziele
// werden ergänzt, nicht mehr gefundene archiviert (archived_at), nie gelöscht.

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PRODUCT_PAGES_SOURCE = "kluehspies_website";

const BASE_URL = "https://www.klassenfahrten-kluehspies.de";
const LISTING_URLS: Record<Region, string> = {
  deutschland: `${BASE_URL}/staedte-klassenfahrten/deutschland/`,
  europa: `${BASE_URL}/staedte-klassenfahrten/europa/`,
};
const SITEMAP_INDEX_URL = `${BASE_URL}/sitemap.xml`;

const FETCH_TIMEOUT_MS = 20_000;
/** Nachlade-Requests für Namen nachgeladener Ziele, parallel begrenzt. */
const NAME_FETCH_CONCURRENCY = 4;
/**
 * Sicherung gegen Layout-Änderungen der Quelle: Liefert der Import insgesamt
 * weniger Ziele, bricht der Sync ab, statt den Bestand zu archivieren.
 */
const MIN_EXPECTED_TOTAL = 10;

export type Region = "deutschland" | "europa";

export interface RemoteProductPage {
  url: string;
  name: string;
  city: string;
  country: string;
  region: Region;
}

export interface ProductPageSyncResult {
  found: number;
  foundByRegion: Record<Region, number>;
  inserted: number;
  updated: number;
  reactivated: number;
  archived: number;
}

/** Deutsche Ländernamen für die Slugs der Zielseiten-URLs. */
const COUNTRY_LABEL: Record<string, string> = {
  deutschland: "Deutschland",
  belgien: "Belgien",
  daenemark: "Dänemark",
  frankreich: "Frankreich",
  griechenland: "Griechenland",
  grossbritannien: "Großbritannien",
  irland: "Irland",
  italien: "Italien",
  kroatien: "Kroatien",
  luxemburg: "Luxemburg",
  niederlande: "Niederlande",
  norwegen: "Norwegen",
  oesterreich: "Österreich",
  polen: "Polen",
  portugal: "Portugal",
  schweden: "Schweden",
  schweiz: "Schweiz",
  slowakei: "Slowakei",
  slowenien: "Slowenien",
  spanien: "Spanien",
  tschechien: "Tschechien",
  ungarn: "Ungarn",
};

class ProductPageSourceError extends Error {}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      // Höflich identifizieren; die Quelle ist die Website des Kunden.
      "User-Agent": "SEESZN-ProductPageSync/1.0 (+https://seeszn.de)",
      Accept: "text/html,application/xhtml+xml,application/xml",
    },
  });
  if (!response.ok) {
    throw new ProductPageSourceError(`Quelle antwortete mit ${response.status}: ${url}`);
  }
  return response.text();
}

/** Zerlegt eine Zielseiten-URL in Land- und Stadt-Slug; null für alles andere. */
function destinationSlugs(url: string): { countrySlug: string; citySlug: string } | null {
  const match = url.match(
    /^https:\/\/www\.klassenfahrten-kluehspies\.de\/staedte-klassenfahrten\/([a-z0-9-]+)\/([a-z0-9-]+)\/$/,
  );
  if (!match) return null;
  return { countrySlug: match[1], citySlug: match[2] };
}

function absoluteUrl(href: string): string {
  return href.startsWith("http") ? href : `${BASE_URL}${href}`;
}

/** Fallback für unbekannte Slugs: "gardasee" -> "Gardasee". */
function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß");
}

/**
 * Liest die initial gerenderten Reisekarten einer Listenseite:
 * Kartencontainer "travel-finder-teaser-list-wrapper", darin der Ziel-Link
 * und der Anzeigename im h3.
 */
export function parseListingCards(html: string): Map<string, string> {
  const cards = new Map<string, string>();
  const chunks = html.split("travel-finder-teaser-list-wrapper").slice(1);
  for (const chunk of chunks) {
    const hrefMatch = chunk.match(/href="([^"]*\/staedte-klassenfahrten\/[a-z0-9-]+\/[a-z0-9-]+\/)"/);
    const nameMatch = chunk.match(/<h3[^>]*>\s*([^<]+?)\s*<\/h3>/);
    if (!hrefMatch || !nameMatch) continue;
    const url = absoluteUrl(hrefMatch[1]);
    if (!destinationSlugs(url)) continue;
    cards.set(url, decodeEntities(nameMatch[1].trim()));
  }
  return cards;
}

/** Alle Zielseiten-URLs aus der Travel-Sitemap (vollständig, inkl. nachgeladener). */
export async function fetchSitemapDestinationUrls(): Promise<string[]> {
  const index = await fetchText(SITEMAP_INDEX_URL);
  const sitemapUrls = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    decodeEntities(m[1].trim()),
  );
  const travelSitemaps = sitemapUrls.filter((u) => u.includes("sitemap=travel"));
  const sources = travelSitemaps.length > 0 ? travelSitemaps : sitemapUrls;

  const urls = new Set<string>();
  for (const sitemapUrl of sources) {
    const xml = await fetchText(sitemapUrl);
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = decodeEntities(match[1].trim());
      if (destinationSlugs(url)) urls.add(url);
    }
  }
  return [...urls];
}

/** Name eines Ziels aus dem Breadcrumb der Zielseite ("Salzburg", "Gardasee"). */
async function resolveDestinationName(url: string): Promise<string | null> {
  try {
    const html = await fetchText(url);
    const match = html.match(/breadcrumb-item active[^>]*>([\s\S]*?)<\/li>/);
    if (!match) return null;
    const text = decodeEntities(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    if (!text) return null;
    // Breadcrumbs sind teils kleingeschrieben ("adriaküste"): Anzeigename
    // beginnt immer mit Großbuchstaben.
    return text.charAt(0).toUpperCase() + text.slice(1);
  } catch {
    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/**
 * Sammelt alle aktuellen Reiseziele aus Listenseiten + Sitemap.
 * Wirft, wenn die Quelle nicht plausibel antwortet (Schutz vor
 * Massen-Archivierung durch Layout-Änderungen).
 */
export async function collectRemoteProductPages(): Promise<RemoteProductPage[]> {
  const [deHtml, euHtml, sitemapUrls] = await Promise.all([
    fetchText(LISTING_URLS.deutschland),
    fetchText(LISTING_URLS.europa),
    fetchSitemapDestinationUrls(),
  ]);

  const cardNames = new Map<string, string>([
    ...parseListingCards(deHtml),
    ...parseListingCards(euHtml),
  ]);

  // Vereinigung aus Karten und Sitemap; die Region ergibt sich aus dem
  // Land-Slug (deutschland -> Deutschland-Liste, alles andere -> Europa).
  const allUrls = new Set<string>([...cardNames.keys(), ...sitemapUrls]);

  const missingNames = [...allUrls].filter((url) => !cardNames.has(url));
  const resolved = await mapWithConcurrency(missingNames, NAME_FETCH_CONCURRENCY, async (url) => ({
    url,
    name: await resolveDestinationName(url),
  }));
  for (const { url, name } of resolved) {
    if (name) cardNames.set(url, name);
  }

  const pages: RemoteProductPage[] = [];
  for (const url of allUrls) {
    const slugs = destinationSlugs(url);
    if (!slugs) continue;
    const name = cardNames.get(url) ?? titleCaseSlug(slugs.citySlug);
    pages.push({
      url,
      name,
      city: name,
      country: COUNTRY_LABEL[slugs.countrySlug] ?? titleCaseSlug(slugs.countrySlug),
      region: slugs.countrySlug === "deutschland" ? "deutschland" : "europa",
    });
  }

  if (pages.length < MIN_EXPECTED_TOTAL) {
    throw new ProductPageSourceError(
      `Nur ${pages.length} Ziele gefunden; Sync abgebrochen, Bestand bleibt unverändert.`,
    );
  }
  if (!pages.some((p) => p.region === "deutschland") || !pages.some((p) => p.region === "europa")) {
    throw new ProductPageSourceError(
      "Eine der beiden Regionen lieferte keine Ziele; Sync abgebrochen.",
    );
  }

  return pages.sort((a, b) => a.name.localeCompare(b.name, "de"));
}

/**
 * Gleicht die Produktseiten einer Organisation mit der Website ab.
 * Läuft mit dem Admin-Client, nachdem der Route Handler Auth + Rolle
 * (seeszn_admin) geprüft hat.
 */
export async function syncProductPages(opts: {
  admin: SupabaseClient;
  organizationId: string;
  actorId: string | null;
}): Promise<ProductPageSyncResult> {
  const { admin, organizationId, actorId } = opts;
  const remote = await collectRemoteProductPages();
  const now = new Date().toISOString();

  const existing = await admin
    .from("pages")
    .select("id, url, archived_at")
    .eq("organization_id", organizationId)
    .eq("source", PRODUCT_PAGES_SOURCE);
  if (existing.error) throw new Error(existing.error.message);

  const existingByUrl = new Map(
    (existing.data ?? []).map((row) => [row.url as string, row as { url: string; archived_at: string | null }]),
  );
  const remoteUrls = new Set(remote.map((p) => p.url));

  let inserted = 0;
  let updated = 0;
  let reactivated = 0;
  for (const page of remote) {
    const known = existingByUrl.get(page.url);
    if (!known) inserted += 1;
    else if (known.archived_at !== null) reactivated += 1;
    else updated += 1;
  }

  const upsert = await admin.from("pages").upsert(
    remote.map((page) => ({
      organization_id: organizationId,
      url: page.url,
      name: page.name,
      segment: "product",
      city: page.city,
      country: page.country,
      region: page.region,
      active: true,
      source: PRODUCT_PAGES_SOURCE,
      last_synced_at: now,
      archived_at: null,
    })),
    { onConflict: "organization_id,url" },
  );
  if (upsert.error) throw new Error(upsert.error.message);

  // Nicht mehr gefundene Ziele archivieren, nie löschen. Betrifft nur Zeilen
  // aus diesem Sync (source), manuell gepflegte Seiten bleiben unberührt.
  const toArchive = (existing.data ?? []).filter(
    (row) => row.archived_at === null && !remoteUrls.has(row.url as string),
  );
  if (toArchive.length > 0) {
    const archive = await admin
      .from("pages")
      .update({ archived_at: now, active: false, last_synced_at: now })
      .eq("organization_id", organizationId)
      .eq("source", PRODUCT_PAGES_SOURCE)
      .is("archived_at", null)
      .in(
        "id",
        toArchive.map((row) => row.id as string),
      );
    if (archive.error) throw new Error(archive.error.message);
  }

  const foundByRegion: Record<Region, number> = {
    deutschland: remote.filter((p) => p.region === "deutschland").length,
    europa: remote.filter((p) => p.region === "europa").length,
  };

  // Audit-Protokoll direkt über den Admin-Client (audit_events ist für
  // Endnutzer nicht schreibbar).
  await admin.from("audit_events").insert({
    organization_id: organizationId,
    actor_id: actorId,
    entity_type: "organization",
    entity_id: organizationId,
    action: "product_pages.synced",
    metadata: {
      found: remote.length,
      deutschland: foundByRegion.deutschland,
      europa: foundByRegion.europa,
      inserted,
      updated,
      reactivated,
      archived: toArchive.length,
    },
  });

  return {
    found: remote.length,
    foundByRegion,
    inserted,
    updated,
    reactivated,
    archived: toArchive.length,
  };
}
