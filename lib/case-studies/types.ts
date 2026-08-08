// ─── Case-Study-Inhaltsmodell ────────────────────────────────────────────────
// Beide Sprachfassungen liefern exakt diese Struktur. Die Komponenten kennen
// nur dieses Interface und keine Sprache — dadurch teilen sich Deutsch und
// Englisch dieselbe Implementierung, dasselbe Raster, dieselbe Motion und
// dasselbe Timing. Eine Sprachfassung kann optisch gar nicht abdriften.

import type { Gated } from "./gate";

export type Locale = "de" | "en";

export interface SourceRef {
  code: string;
  label: string;
  window: string;
}

export interface MetaRow {
  key: string;
  value: string;
}

export interface ImageRef {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface NumberedItem {
  index: string;
  title: string;
  text: string;
}

export interface BaselineMetric {
  id: string;
  value: Gated<string>;
  label: string;
  note: string;
  source: string;
}

export interface TechnicalProof {
  id: string;
  kind: "heading" | "duplicate" | "crawl" | "weight";
  label: string;
  date: string;
  rows: { key: string; value: string; code?: boolean }[];
  note: string;
  source: string;
  verified: boolean;
  publicApproved: boolean;
}

export interface CaseContent {
  locale: Locale;
  /** Kanonischer Pfad dieser Sprachfassung. */
  path: string;
  /** Pfad der jeweils anderen Sprachfassung, für hreflang. */
  altPath: string;
  /** Zielseite des Breadcrumb-Links "Case Studies". */
  indexPath: string;

  sources: Record<string, SourceRef>;

  hero: {
    eyebrow: string;
    breadcrumb: [string, string, string];
    h1Lead: string;
    h1Join: string;
    h1Tail: string;
    days: string;
    supporting: string;
    systems: string;
    meta: MetaRow[];
    scrollLink: { label: string; href: string };
    image: ImageRef;
  };

  quickFacts: {
    label: string;
    headline: [string, string];
    facts: { key: string; value: string; wide?: boolean }[];
  };

  baseline: {
    label: string;
    headline: string;
    copy: string;
    metrics: BaselineMetric[];
    conclusion: string;
    gap: {
      caption: string;
      sourceNote: string;
      bars: { id: string; label: string; value: number; display: string }[];
      punchline: string;
    };
    historicalNote: string;
  };

  findings: { label: string; headline: string; items: NumberedItem[] };

  changes: {
    label: string;
    headline: string;
    intro: string;
    items: NumberedItem[];
    definition: string;
  };

  result: {
    label: string;
    eyebrow: string;
    headline: string;
    from: Gated<string>;
    to: Gated<string>;
    /** Präfix vor dem Zahlenpaar, z. B. "Ø" oder "Avg." */
    averagePrefix: string;
    subline: string;
    statement: string;
    caption: string;
    daysLabel: string;
    axis: { top: string; bottom: string; top3: string };
    meta: MetaRow[];
  };

  difference: { label: string; headline: string; items: NumberedItem[]; image: ImageRef };

  proof: {
    label: string;
    headline: string;
    railNote: string;
    gapLabel: string;
    proofs: TechnicalProof[];
    weights: { label: string; kb: number; display: string }[];
  };

  method: {
    label: string;
    headline: string;
    copy: string;
    facts: MetaRow[];
    detailsLabel: string;
    criteria: MetaRow[];
    caveat: string;
  };

  takeaways: { label: string; headline: string; items: NumberedItem[] };

  cta: {
    label: string;
    headline: string;
    copy: string;
    primary: { label: string; href: string };
    systems: string;
    relatedLabel: string;
    related: { label: string; href: string }[];
    image: ImageRef;
  };

  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    datePublished: string;
    dateModified: string;
    /** Vollständiger H1-Satz, auch für JSON-LD und OG. */
    h1Text: string;
    /** schema.org `about`-Begriffe in der jeweiligen Sprache. */
    about: string[];
    breadcrumbIndexLabel: string;
    breadcrumbLeafLabel: string;
    breadcrumbHomeLabel: string;
  };
}
