// ─── Case Study: Paid Acquisition at Scale — anonymized ──────────────────────
// Canonical source for every value on this page. A number lives exactly once in
// PA_FIGURES and is referenced everywhere else, so two sections can never show
// different values for the same metric.
//
// ANONYMITY
// The client is not named on the public page, and the material for it does not
// travel through this file either: no client name, no legal entity, no domain,
// no vertical narrow enough to identify the company, no asset path carrying a
// project codename. "European growth company · DACH" is the full public
// description and the most this page may say.
//
// DATA DISCIPLINE
// The four values below are the only performance figures on this page. They are
// approved ranges, not point estimates, and they are shown as ranges for that
// reason — a range that is presented as a precise number is a false precision.
//
// THREE LAYERS THAT ARE NEVER MIXED
//   A  Approved figures — the values in PA_FIGURES. Sections 04, 05, 06 and 07
//      show them and nothing else.
//   B  Illustrative arithmetic — PA_ILLUSTRATIVE. A statement about what the
//      approved spend level implies, not a reported client saving. It carries
//      PA_ILLUSTRATIVE.note wherever it appears, once per block.
//   C  Strategic description — the workstreams and principles. Deliberately at
//      the level of what was worked on, never at the level of tactics that are
//      not documented: no bidding strategies, no campaign types, no attribution
//      models, no tracking implementation, no landing-page experiments.
//
// There is no monthly or yearly CPL history in this file. None is documented,
// so the chart in section 04 is range-based rather than a time series. An
// invented January–December curve would be the one thing that makes a truthful
// case study untrustworthy.

import { PAID_PRODUCT_PATH } from "@/lib/links";

export const PA_PATH = "/case-studies/paid-acquisition-at-scale";
export const PA_INDEX_PATH = "/work";
export const PA_ASSETS = "/case-studies/paid-acquisition";

/** The only performance values on this page. All approved for publication. */
export const PA_FIGURES = {
  /** Annual Google Ads spend under management. */
  spend: "€2.5–3.0M",
  /** Cost per lead, earlier observed range. */
  cplFrom: "€167–216",
  /** Cost per lead, later observed range. */
  cplTo: "€100–130",
  /** Conversion value, earlier and later. */
  valueFrom: "14K",
  valueTo: "37K",
  /** Relative change in conversion value. */
  multiple: "2.6×",
} as const;

/** Numeric bounds behind the CPL ranges — used only to draw the chart. */
export const PA_CPL_BOUNDS = {
  fromLow: 167,
  fromHigh: 216,
  toLow: 100,
  toHigh: 130,
} as const;

export const PA_CHANNEL = "Google Ads · DACH · Multi-year engagement";
export const PA_DISCIPLINE = "Google Ads · Paid Acquisition · Acquisition Economics";

/** Visible H1 in plain text — shared by the OG title and the JSON-LD headline. */
export const PA_H1_TEXT = "Scaling paid acquisition without scaling inefficiency.";

/**
 * Layer B. The €250K figure is the monthly equivalent of the approved annual
 * range, and the €25K figure is ten percent of it. Both are arithmetic on a
 * published number, not a measured client outcome — which is exactly what the
 * note says, everywhere the block appears.
 */
export const PA_ILLUSTRATIVE = {
  monthly: "€250K",
  monthlyLabel: "approx. monthly media spend at scale",
  tenPercent: "€25K",
  note: "Illustrative impact at €250K monthly spend",
} as const;

export const PA_META = {
  title: "Paid Acquisition at Scale Case Study | SEESZN",
  description:
    "How SEESZN helped operate €2.5–3.0M in annual Google Ads spend while reducing acquisition costs and increasing conversion value.",
  ogTitle: "Scaling paid acquisition without scaling inefficiency.",
  ogDescription:
    "Anonymized case study: €2.5–3.0M in annual Google Ads spend, cost per lead from €167–216 into the €100–130 range, conversion value from 14K to 37K.",
  ogImage: `${PA_ASSETS}/paid-acquisition-hero.png`,
  datePublished: "2026-08-15",
  dateModified: "2026-08-15",
  about: [
    "Paid Acquisition",
    "Google Ads",
    "Performance Marketing",
    "Acquisition Economics",
  ],
} as const;

// ── Images ───────────────────────────────────────────────────────────────────
// Alt text describes the picture, never the client. These are art-directed
// installation photographs; they illustrate the argument and document nothing.
export const PA_IMAGES = {
  hero: {
    src: `${PA_ASSETS}/paid-acquisition-hero.png`,
    width: 1122,
    height: 1402,
    alt: "Abstract chrome installation behind a pale stone column in a minimalist gallery with a black marble floor",
  },
  scale: {
    src: `${PA_ASSETS}/paid-acquisition-scale.png`,
    width: 1122,
    height: 1402,
    alt: "Row of polished chrome cylinders rising in height on a black marble plinth in a stone gallery",
  },
  texture: {
    src: `${PA_ASSETS}/paid-acquisition-texture.png`,
    width: 1672,
    height: 941,
    alt: "",
  },
  closing: {
    src: `${PA_ASSETS}/paid-acquisition-closing.png`,
    width: 1122,
    height: 1402,
    alt: "Sculptural chrome ribbon curving above a dark reflecting pool and a raw stone block in a warm-lit gallery",
  },
} as const;

// ── 01 · Hero ────────────────────────────────────────────────────────────────
export const PA_HERO_KPIS: { value: string; label: string }[] = [
  { value: PA_FIGURES.spend, label: "Annual Ad Spend" },
  { value: `${PA_FIGURES.cplFrom} → ${PA_FIGURES.cplTo}`, label: "Cost per Lead" },
  { value: `${PA_FIGURES.valueFrom} → ${PA_FIGURES.valueTo}`, label: "Conversion Value" },
];

// ── 02 · The scaling problem ─────────────────────────────────────────────────
export type PaMark = "compound" | "control" | "signal" | "value";

export const PA_PROBLEMS: {
  index: string;
  mark: PaMark;
  title: string;
  text: string;
}[] = [
  {
    index: "01",
    mark: "compound",
    title: "Budget waste compounds at scale",
    text: "Small inefficiencies become meaningful capital loss when spend increases.",
  },
  {
    index: "02",
    mark: "control",
    title: "More campaigns ≠ more control",
    text: "Complexity can increase faster than visibility.",
  },
  {
    index: "03",
    mark: "signal",
    title: "Google optimizes for the signal you give it",
    text: "Weak or poorly aligned signals create weak automated decisions.",
  },
  {
    index: "04",
    mark: "value",
    title: "Lead volume doesn't equal growth",
    text: "Acquisition efficiency only matters when it creates economically valuable customers.",
  },
];

// ── 03 · What we focused on ──────────────────────────────────────────────────
// Layer C. Four workstreams, described at the level they are documented at.
export const PA_WORKSTREAMS: { index: string; title: string; text: string }[] = [
  {
    index: "01",
    title: "Account Architecture",
    text: "Creating clearer structures between demand capture, brand demand and scalable acquisition.",
  },
  {
    index: "02",
    title: "Waste Reduction",
    text: "Identifying areas where spend generated activity without proportional commercial value.",
  },
  {
    index: "03",
    title: "Signal Quality",
    text: "Improving the relationship between platform optimization and commercially meaningful conversion signals.",
  },
  {
    index: "04",
    title: "Scale Economics",
    text: "Evaluating where incremental budget could still generate economically attractive growth.",
  },
];

// ── 07 · Before / After ──────────────────────────────────────────────────────
// Every row carries a label as well as a value, so the two columns are never
// distinguished by their accent colour alone.
export interface PaCompareRow {
  label: string;
  before: string;
  after: string;
}

export const PA_COMPARE: PaCompareRow[] = [
  { label: "Cost per Lead", before: PA_FIGURES.cplFrom, after: PA_FIGURES.cplTo },
  { label: "Conversion Value", before: PA_FIGURES.valueFrom, after: PA_FIGURES.valueTo },
];

export const PA_COMPARE_SUMMARY = {
  before: {
    title: "Weaker acquisition economics",
    text: "More expensive growth",
  },
  after: {
    title: "Stronger economics at scale",
    text: "More efficient allocation of media capital",
  },
} as const;

// ── 08 · What changed ────────────────────────────────────────────────────────
export const PA_PRINCIPLES: { index: string; title: string; text: string }[] = [
  {
    index: "01",
    title: "Optimize economics, not platform metrics",
    text: "The goal is not to make the Google Ads dashboard look better. The goal is to improve the economics of customer acquisition.",
  },
  {
    index: "02",
    title: "Better signals create better automation",
    text: "Automation becomes more valuable when the inputs reflect meaningful business outcomes.",
  },
  {
    index: "03",
    title: "Scale amplifies both good and bad decisions",
    text: "Strong systems compound. Weak systems become increasingly expensive.",
  },
];

// ── Confidentiality ──────────────────────────────────────────────────────────
export const PA_CONFIDENTIAL = {
  headline: "Client name withheld due to confidentiality.",
  detail: "European growth company · DACH",
} as const;

// ── Next step ────────────────────────────────────────────────────────────────
// Die Paid-Acquisition-Case-Study führt auf die Paid-Produktseite, nicht auf die
// Master-Seite: derselbe Preis, derselbe Kaufweg, aber der Message Match bleibt
// erhalten und die eingebettete Prüfung ist dort die Paid-Prüfung (Messsignale,
// Consent, Konversionspfad, Formularreibung) statt der Search-Prüfung.
export const PA_CTA_HREF = PAID_PRODUCT_PATH;
export const PA_RELATED: { label: string; href: string }[] = [
  { label: "French Beret case study", href: "/case-studies/french-beret-ecommerce-seo" },
  { label: "How we work", href: "/services" },
  { label: "All results", href: PA_INDEX_PATH },
];
