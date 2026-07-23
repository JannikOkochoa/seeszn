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

/** Produktdomain der Städtereise-Seiten (siehe lib/product-pages/provider.ts). */
const BASE = "https://www.klassenfahrten-kluehspies.de";

export const BERLIN_URL = `${BASE}/staedte-klassenfahrten/deutschland/berlin/`;
export const HAMBURG_URL = `${BASE}/staedte-klassenfahrten/deutschland/hamburg/`;
export const MUENCHEN_URL = `${BASE}/staedte-klassenfahrten/deutschland/muenchen/`;

/** Die drei kanonischen Hauptseiten – Grundlage des gemeinsamen Scopes. */
export const CITY_PAGE_URLS: readonly string[] = [BERLIN_URL, HAMBURG_URL, MUENCHEN_URL];

export interface ApiScope {
  scopeType: GscScopeType;
  scopeValue: string | null;
  /**
   * Exakte Seiten, die dieser Scope aggregiert. Leer = ganze Property
   * (sitewide, kein Seiten-Filter). Für alle anderen Scopes wird pro URL ein
   * "equals"-Filter erzeugt (inkl. Variante ohne Trailing Slash), damit die
   * Google-Normalisierung greift, aber keine Unterseiten einfließen.
   */
  pageUrls: readonly string[];
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
    pageUrls: [],
    originalFileName: "gsc-api:sitewide",
  },
  {
    scopeType: "path_prefix",
    scopeValue: "/staedte-klassenfahrten/",
    // Intern ausschließlich die drei Hauptseiten – nicht der gesamte Pfad.
    pageUrls: CITY_PAGE_URLS,
    originalFileName: "gsc-api:staedtereisen",
  },
  {
    scopeType: "product_page",
    scopeValue: "Berlin",
    pageUrls: [BERLIN_URL],
    originalFileName: "gsc-api:berlin",
  },
  {
    scopeType: "product_page",
    scopeValue: "Hamburg",
    pageUrls: [HAMBURG_URL],
    originalFileName: "gsc-api:hamburg",
  },
  {
    scopeType: "product_page",
    scopeValue: "München",
    pageUrls: [MUENCHEN_URL],
    originalFileName: "gsc-api:muenchen",
  },
];
