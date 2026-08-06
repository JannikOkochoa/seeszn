// ─── Getrackte Einzelseiten: die einzige Wahrheit ─────────────────────────────
// Jede Seite, für die es einen eigenen Performance-Bereich im Dashboard gibt,
// steht genau einmal in TRACKED_PAGES. Aus dieser Liste entstehen automatisch:
//
//   * die GSC-Abfragen des täglichen Syncs (lib/gsc/apiScopes.ts),
//   * die Auswahl im Seiten-Performance-Bereich (lib/kpi/pagePerformance.ts).
//
// Eine weitere Seite (Blogartikel, Landingpage, Kategorie) aufzunehmen heißt
// deshalb: einen Eintrag hier ergänzen, den Sync einmal laufen lassen. Kein
// neuer Endpunkt, keine neue Komponente, keine Sonderlösung je Seite.
//
// Wichtig zur Domain: https://www.kluehspies.com/ ist eine 301-Weiterleitung
// auf https://www.klassenfahrten-kluehspies.de/. In der Search Console
// existieren Daten deshalb ausschließlich unter der .de-Domain; die
// Homepage-URL unten ist das Weiterleitungsziel und damit die Seite, die
// Google tatsächlich ausliefert und misst.

import type { GscScopeType } from "@/lib/kpi/types";

/** Produktdomain aller getrackten Seiten (GSC-Property). */
export const BASE = "https://www.klassenfahrten-kluehspies.de";

export const HOMEPAGE_URL = `${BASE}/`;
export const BERLIN_URL = `${BASE}/staedte-klassenfahrten/deutschland/berlin/`;
export const HAMBURG_URL = `${BASE}/staedte-klassenfahrten/deutschland/hamburg/`;
export const MUENCHEN_URL = `${BASE}/staedte-klassenfahrten/deutschland/muenchen/`;

export interface TrackedPage {
  /** Stabiler Schlüssel, auch Teil des internen Batch-Namens. */
  key: string;
  /** Anzeigename im Dashboard. */
  label: string;
  /** Kanonische URL exakt wie in der Search Console (inkl. Trailing Slash). */
  url: string;
  /**
   * Scope-Typ, unter dem die Seite gespeichert wird.
   *   "page"         – generische Einzelseite (Standard für neue Seiten)
   *   "product_page" – die drei Pilot-Stadtseiten; historisch gewachsen und
   *                    Grundlage der Winners/Losers-Ableitungen, deshalb
   *                    unverändert.
   */
  scopeType: Extract<GscScopeType, "page" | "product_page">;
  /** Scope-Schlüssel in gsc_active_datasets. Bei "page" die URL selbst. */
  scopeValue: string;
  /** Ein Satz Einordnung für den Seiten-Performance-Bereich. */
  hint: string;
  /**
   * true = zusätzlich zwei Segment-Scopes anlegen, die dieselbe Seite in
   * Marken- und Nicht-Marken-Suchen zerlegen. Kostet zwei weitere Scopes im
   * täglichen Sync und lohnt sich dort, wo der Markenanteil die Gesamtzahlen
   * dominiert. Für jede Seite einzeln entscheidbar.
   */
  brandSplit?: boolean;
}

/** Marken- bzw. Nicht-Marken-Segment einer Seite. */
export type PageSegmentKind = "branded" | "non_branded";

export interface PageSegment {
  /** Stabiler Schlüssel, z. B. "homepage:branded". */
  key: string;
  page: TrackedPage;
  kind: PageSegmentKind;
  label: string;
  scopeType: "page_segment";
  scopeValue: string;
}

export const SEGMENT_LABEL: Record<PageSegmentKind, string> = {
  branded: "Marken-Suchen",
  non_branded: "Nicht-Marken-Suchen",
};

/**
 * Reihenfolge = Reihenfolge der Auswahl im Dashboard. Die Homepage steht
 * bewusst vorn: sie ist die stärkste Einzelseite der Property.
 */
export const TRACKED_PAGES: readonly TrackedPage[] = [
  {
    key: "homepage",
    label: "Homepage",
    url: HOMEPAGE_URL,
    scopeType: "page",
    scopeValue: HOMEPAGE_URL,
    hint: "Die Startseite. Sie trägt vor allem Suchen nach dem Markennamen.",
    brandSplit: true,
  },
  {
    key: "berlin",
    label: "Berlin",
    url: BERLIN_URL,
    scopeType: "product_page",
    scopeValue: "Berlin",
    hint: "Städtereise-Hauptseite Berlin, ohne Unterseiten und Angebote.",
  },
  {
    key: "hamburg",
    label: "Hamburg",
    url: HAMBURG_URL,
    scopeType: "product_page",
    scopeValue: "Hamburg",
    hint: "Städtereise-Hauptseite Hamburg, ohne Unterseiten und Angebote.",
  },
  {
    key: "muenchen",
    label: "München",
    url: MUENCHEN_URL,
    scopeType: "product_page",
    scopeValue: "München",
    hint: "Städtereise-Hauptseite München, ohne Unterseiten und Angebote.",
  },
];

/** Die drei kanonischen Stadtseiten – Grundlage des Sammel-Scopes. */
export const CITY_PAGE_URLS: readonly string[] = [BERLIN_URL, HAMBURG_URL, MUENCHEN_URL];

/** Stabiler Schlüssel eines Scopes, identisch zu lib/kpi/gscData.scopeKeyOf. */
export function pageScopeKey(page: TrackedPage): string {
  return `${page.scopeType}|${page.scopeValue}`;
}

export function findTrackedPage(key: string): TrackedPage | null {
  return TRACKED_PAGES.find((p) => p.key === key) ?? null;
}

/**
 * Alle Segment-Scopes, abgeleitet aus den Seiten mit brandSplit. Wie bei den
 * Seiten selbst gilt: hier steht nichts Seitenspezifisches, die Liste entsteht
 * vollständig aus TRACKED_PAGES.
 */
export const PAGE_SEGMENTS: readonly PageSegment[] = TRACKED_PAGES.filter(
  (page) => page.brandSplit,
).flatMap((page) =>
  (["branded", "non_branded"] as const).map((kind) => ({
    key: `${page.key}:${kind}`,
    page,
    kind,
    label: SEGMENT_LABEL[kind],
    scopeType: "page_segment" as const,
    scopeValue: `${page.key}:${kind}`,
  })),
);

/** Die beiden Segmente einer Seite, sofern sie den Brand-Split nutzt. */
export function segmentsForPage(pageKey: string): PageSegment[] {
  return PAGE_SEGMENTS.filter((segment) => segment.page.key === pageKey);
}
