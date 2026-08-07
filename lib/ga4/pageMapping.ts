// ─── TRACKED_PAGES → GA4-Landingpage ──────────────────────────────────────────
// GA4 und die Search Console beschreiben dieselbe Seite unterschiedlich:
//
//   GSC : https://www.klassenfahrten-kluehspies.de/staedte-klassenfahrten/deutschland/berlin/
//   GA4 : /staedte-klassenfahrten/deutschland/berlin
//
// GA4 liefert in der Dimension landingPage nur den Pfad, ohne Host, ohne
// Query und – geprüft an der echten Property – ohne abschließenden Schrägstrich.
// Einzige Ausnahme ist die Startseite, die als "/" erscheint.
//
// Genau diese Kleinigkeit ist der Grund, warum eine naive Zuordnung stumm
// leere Werte liefert: Ein Filter auf ".../berlin/" trifft in GA4 nichts,
// obwohl die Seite 34 Sessions hat.
//
// TRACKED_PAGES bleibt die einzige Wahrheit über die getrackten Seiten; hier
// wird ausschließlich übersetzt. Es gibt keine zweite Seitenliste.

import { TRACKED_PAGES, type TrackedPage } from "@/lib/gsc/pageScopes";

/**
 * Normalisiert eine beliebige Seitenangabe auf die Schreibweise der
 * GA4-Dimension landingPage.
 *
 * Robust gegen: absolute URL oder Pfad, fehlender/überzähliger Schrägstrich,
 * Query-Parameter, Fragment, Groß-/Kleinschreibung des Hosts.
 */
export function toGa4LandingPath(input: string): string {
  let path = input.trim();

  // Absolute URL → nur der Pfad.
  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname;
    } catch {
      return "/";
    }
  }

  // Query und Fragment entfernen: GA4 führt sie in landingPage nicht mit.
  path = path.split("?")[0].split("#")[0];

  if (!path.startsWith("/")) path = `/${path}`;

  // Trailing Slash entfernen – außer bei der Startseite, die "/" bleibt.
  while (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path || "/";
}

export interface Ga4PageMapping {
  /** Schlüssel aus TRACKED_PAGES; verbindet GA4 und GSC eindeutig. */
  pageKey: string;
  label: string;
  /** Kanonische URL wie in der Search Console. */
  url: string;
  /** Pfad wie in der GA4-Dimension landingPage. */
  landingPath: string;
}

/** Die Zuordnung aller getrackten Seiten, abgeleitet aus TRACKED_PAGES. */
export const GA4_PAGE_MAPPINGS: readonly Ga4PageMapping[] = TRACKED_PAGES.map(
  (page: TrackedPage) => ({
    pageKey: page.key,
    label: page.label,
    url: page.url,
    landingPath: toGa4LandingPath(page.url),
  }),
);

/** Alle Landingpage-Pfade – Grundlage des inListFilter einer einzigen Abfrage. */
export const GA4_LANDING_PATHS: readonly string[] = GA4_PAGE_MAPPINGS.map((m) => m.landingPath);

/**
 * Umkehrung: GA4-Pfad → Seitenschlüssel. Zwei Seiten dürfen nie auf denselben
 * Pfad zeigen; wäre das der Fall, würden ihre Zahlen vermischt. Die Map wird
 * deshalb aus eindeutigen Pfaden gebaut und der Konflikt hier bemerkt.
 */
const PAGE_KEY_BY_PATH = new Map<string, string>();
for (const mapping of GA4_PAGE_MAPPINGS) {
  if (PAGE_KEY_BY_PATH.has(mapping.landingPath)) {
    throw new Error(
      `Zwei getrackte Seiten teilen sich den GA4-Pfad "${mapping.landingPath}". ` +
        "Ihre Zahlen würden vermischt – bitte TRACKED_PAGES prüfen.",
    );
  }
  PAGE_KEY_BY_PATH.set(mapping.landingPath, mapping.pageKey);
}

export function pageKeyForLandingPath(path: string): string | null {
  return PAGE_KEY_BY_PATH.get(toGa4LandingPath(path)) ?? null;
}

export function mappingForPageKey(pageKey: string): Ga4PageMapping | null {
  return GA4_PAGE_MAPPINGS.find((m) => m.pageKey === pageKey) ?? null;
}

/** Scope-Schlüssel in der Datenbank: "site" oder "page:<key>". */
export const GA4_SITE_SCOPE = "site";

export function ga4PageScopeKey(pageKey: string): string {
  return `page:${pageKey}`;
}
