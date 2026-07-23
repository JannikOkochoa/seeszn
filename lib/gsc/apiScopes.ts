// ─── GSC-API: kanonische Scope-Definition ─────────────────────────────────────
// Die einzige Wahrheit über die vier fachlichen Scopes des Klühspies-Dashboards
// und ihre exakten Seiten-URLs. scope_type/scope_value stimmen bewusst 1:1 mit
// dem bestehenden Export-Import (scripts/import-gsc-exports.mjs, MANIFEST)
// überein, damit die tägliche API-Aktualisierung dieselben Zeilen in
// gsc_active_datasets umschaltet – ohne neue Scopes, ohne UI-Änderung.
//
// Wichtig für die Trennschärfe: Berlin/Hamburg/München werten ausschließlich
// die jeweilige Hauptseite aus (Seiten-Filter mit Operator "equals", nicht
// "contains" – Unterseiten, Angebote, Ratgeber bleiben außen vor). Der Scope
// "Alle Städtereisen" (Label unverändert) aggregiert intern exakt diese drei
// Hauptseiten. Der sitewide-Scope bleibt der Kontext für die Intelligence-
// Ableitungen und deckt die ganze Property ab.

import "server-only";
import type { GscScopeType } from "@/lib/kpi/types";
import type { PageFilter } from "./apiClient";

/** Produktdomain der Städtereise-Seiten (siehe lib/product-pages/provider.ts). */
const BASE = "https://www.klassenfahrten-kluehspies.de";

export const BERLIN_URL = `${BASE}/staedte-klassenfahrten/deutschland/berlin/`;
export const HAMBURG_URL = `${BASE}/staedte-klassenfahrten/deutschland/hamburg/`;
export const MUENCHEN_URL = `${BASE}/staedte-klassenfahrten/deutschland/muenchen/`;

/** Die drei kanonischen Hauptseiten – Grundlage des gemeinsamen Scopes. */
export const CITY_PAGE_URLS: readonly string[] = [BERLIN_URL, HAMBURG_URL, MUENCHEN_URL];

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
   * Interner Dateiname des erzeugten Batch (nur Diagnostik, wird in der
   * Oberfläche nicht angezeigt). Enthält keine Secrets.
   */
  originalFileName: string;
}

/**
 * Reihenfolge wie im bestehenden Import: sitewide (Kontext), path_prefix
 * ("Alle Städtereisen"), danach die drei Produktseiten. buildScopeOptions()
 * blendet sitewide aus der KPI-Auswahl aus – unverändert.
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
  {
    scopeType: "product_page",
    scopeValue: "Berlin",
    pageFilter: { kind: "equals", url: BERLIN_URL },
    originalFileName: "gsc-api:berlin",
  },
  {
    scopeType: "product_page",
    scopeValue: "Hamburg",
    pageFilter: { kind: "equals", url: HAMBURG_URL },
    originalFileName: "gsc-api:hamburg",
  },
  {
    scopeType: "product_page",
    scopeValue: "München",
    pageFilter: { kind: "equals", url: MUENCHEN_URL },
    originalFileName: "gsc-api:muenchen",
  },
];
