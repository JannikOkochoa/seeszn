// ─── GSC-API: kanonische Scope-Definition ─────────────────────────────────────
// Welche Scopes der tägliche Sync abfragt. Zwei Aggregat-Scopes sind hier fest
// verankert (sitewide als Kontext, "Alle Städtereisen" als Sammelwert); alle
// Einzelseiten kommen aus der wiederverwendbaren Registry
// lib/gsc/pageScopes.ts. Eine neue Seite aufzunehmen heißt deshalb: einen
// Eintrag in TRACKED_PAGES ergänzen – hier ändert sich nichts.
//
// scope_type/scope_value stimmen bewusst 1:1 mit dem bestehenden
// Export-Import (scripts/import-gsc-exports.mjs, MANIFEST) überein, damit die
// tägliche API-Aktualisierung dieselben Zeilen in gsc_active_datasets
// umschaltet – ohne neue Scopes für bereits getrackte Seiten.
//
// Trennschärfe: Einzelseiten werden mit Operator "equals" abgefragt, nicht
// "contains" – Unterseiten, Angebote und Ratgeber bleiben außen vor. Der Scope
// "Alle Städtereisen" (Label unverändert) aggregiert intern exakt die drei
// Stadt-Hauptseiten. Der sitewide-Scope bleibt der Kontext für die
// Intelligence-Ableitungen und deckt die ganze Property ab.

import "server-only";
import type { GscScopeType } from "@/lib/kpi/types";
import type { PageFilter, QueryFilter } from "./apiClient";
import { brandQueryRegex } from "./brand";
import { BASE, CITY_PAGE_URLS, PAGE_SEGMENTS, TRACKED_PAGES } from "./pageScopes";

export { BASE, BERLIN_URL, CITY_PAGE_URLS, HAMBURG_URL, HOMEPAGE_URL, MUENCHEN_URL } from "./pageScopes";

/** Regex-Metazeichen für RE2 escapen (Google nutzt RE2 für includingRegex). */
function escapeRe2(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Verankerter RE2-Regex, der ausschließlich exakt die drei kanonischen
 * Stadt-URLs matcht: ^(berlin|hamburg|muenchen)$. Durch ^…$ fallen Unterseiten
 * und andere Städtereisen heraus.
 */
export const CITY_PAGES_REGEX = `^(${CITY_PAGE_URLS.map(escapeRe2).join("|")})$`;

export interface ApiScope {
  scopeType: GscScopeType;
  scopeValue: string | null;
  /**
   * Seiten-Filter für die GSC-Abfrage. "none" = ganze Property (sitewide);
   * "equals" = genau eine kanonische URL; "includingRegex" = verankerter RE2
   * über exakt die drei Hauptseiten. Nie ein echter Pfad-Prefix.
   */
  pageFilter: PageFilter;
  /**
   * Optionaler Filter auf der Suchanfrage. Nur die Segment-Scopes nutzen ihn,
   * um dieselbe Seite in Marken- und Nicht-Marken-Suchen zu zerlegen.
   */
  queryFilter?: QueryFilter;
  /**
   * Interner Dateiname des erzeugten Batch (nur Diagnostik, wird in der
   * Oberfläche nicht angezeigt). Enthält keine Secrets.
   */
  originalFileName: string;
}

/**
 * Reihenfolge wie im bestehenden Import: sitewide (Kontext), path_prefix
 * ("Alle Städtereisen"), danach jede getrackte Einzelseite in der Reihenfolge
 * von TRACKED_PAGES. buildScopeOptions() blendet sitewide und die generischen
 * page-Scopes aus der KPI-Auswahl aus – unverändert.
 */
export const API_SCOPES: readonly ApiScope[] = [
  {
    scopeType: "sitewide",
    scopeValue: `${BASE}/`,
    pageFilter: { kind: "none" },
    originalFileName: "gsc-api:sitewide",
  },
  {
    // scope_value bleibt aus Kompatibilität "/staedte-klassenfahrten/" (Key in
    // gsc_active_datasets), der GSC-Filter umfasst aber ausschließlich die drei
    // Hauptseiten – kein echter Pfad-Prefix. Label bleibt "Alle Städtereisen".
    scopeType: "path_prefix",
    scopeValue: "/staedte-klassenfahrten/",
    pageFilter: { kind: "includingRegex", regex: CITY_PAGES_REGEX },
    originalFileName: "gsc-api:staedtereisen",
  },
  ...TRACKED_PAGES.map((page) => ({
    scopeType: page.scopeType as GscScopeType,
    scopeValue: page.scopeValue,
    pageFilter: { kind: "equals", url: page.url } as PageFilter,
    originalFileName: `gsc-api:${page.key}`,
  })),
  // Marken- und Nicht-Marken-Segmente derselben Seiten. Eigene Scopes statt
  // einer nachträglichen Aufteilung der Query-Tabelle: nur so gibt es je
  // Segment eine echte Tageszeitreihe – und damit einen belastbaren Vergleich
  // zur Vorperiode statt einer Momentaufnahme.
  ...PAGE_SEGMENTS.map((segment) => ({
    scopeType: segment.scopeType as GscScopeType,
    scopeValue: segment.scopeValue,
    pageFilter: { kind: "equals", url: segment.page.url } as PageFilter,
    queryFilter: {
      kind: segment.kind === "branded" ? "includingRegex" : "excludingRegex",
      regex: brandQueryRegex(),
    } as QueryFilter,
    originalFileName: `gsc-api:${segment.key}`,
  })),
];
