// ─── Sichtbarkeitsprüfung — type-safe data model ──────────────────────────────
// One free, server-side reading of a brand's public web surface.
//
// IMPORTANT: every score in this model is a HEURISTIC READINESS score derived
// from surface signals we can actually observe for free (HTML, robots.txt,
// sitemap.xml, an optional PageSpeed signal). They are NOT a measurement of how
// a brand ranks inside any AI system or search engine. We never query ChatGPT,
// Gemini, Perplexity or Google SERPs, and we never invent rankings or citation
// shares. The labels describe how ready a surface is to be read and cited.

export type Locale = "de" | "en";

/** Heuristic readiness band for a single category. */
export type ScanStatus = "schwach" | "mittel" | "stark";

/** The six readiness categories. Stable ids — UI + scoring key off these. */
export type CategoryId =
  | "indexierbarkeit"
  | "entityClarity"
  | "sourceSurface"
  | "answerReadiness"
  | "technicalTrust"
  | "conversionSurface";

/** A single readiness score card. All prose is already localized. */
export interface ScoreCard {
  id: CategoryId;
  /** Fixed product label, e.g. "Indexierbarkeit", "Entity Clarity". */
  label: string;
  /** Heuristic readiness score, 0–100. */
  score: number;
  status: ScanStatus;
  /** One short sentence: why this band. */
  reason: string;
  /** One concrete, suggested next step. */
  nextStep: string;
}

/** A plain fact we observed on the surface, for the "Was wir gesehen haben" list. */
export interface Observation {
  label: string;
  value: string;
  /** true = present/healthy, false = missing/weak, null = not measured. */
  ok: boolean | null;
}

/** Raw surface signals — the honest evidence behind every score. */
export interface RawSignals {
  httpStatus: number | null;
  https: boolean;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  h1: string[];
  h2Count: number;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogSiteName: string | null;
  /** schema.org @type values found in JSON-LD blocks. */
  jsonLdTypes: string[];
  hasOrganizationSchema: boolean;
  hasFaqSchema: boolean;
  hasArticleSchema: boolean;
  robotsTxt: "allows" | "blocks" | "missing" | "error";
  sitemap: "found" | "missing" | "error";
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  /** A FAQ / question-answer block was detected. */
  faqPattern: boolean;
  /** A clear conversion path was detected (contact / demo / booking signals). */
  conversionSignal: boolean;
  /** PageSpeed performance score 0–100, or null when not measured. */
  performance: number | null;
  performanceState: "measured" | "unavailable";
}

// ─── KI-Antwortfragen — questions where AI systems should name the brand ──────────
// These are NOT generic SEO keywords. They are questions a potential customer
// might ask ChatGPT, Gemini, Perplexity or Google AI Overviews, where the scanned
// brand should be visible if it is clearly understood and well sourced. The
// optional web-signal check is a "Web-Signalcheck" from visible page signals at
// the time of the scan, never a durable AI ranking.

/** Which of the three fixed question roles a question fills. */
export type AiQuestionKind = "category" | "brand" | "problem";

/** A single generated KI-Antwortfrage before any web-signal check. */
export interface AiAnswerQuestion {
  question: string;
  kind: AiQuestionKind;
}

/** A visible domain from the web-signal check top results. */
export interface VisibleDomain {
  domain: string;
  title?: string;
  position: number;
}

/** The result of (optionally) checking one KI-Antwortfrage against the web surface. */
export interface AiAnswerCheck {
  question: string;
  kind: AiQuestionKind;
  provider: "none" | "google_cse";
  checked: boolean;
  label: "Nicht live geprüft" | "Web-Signalcheck";
  ownDomainFound: boolean;
  ownDomainPosition?: number;
  visibleDomains: VisibleDomain[];
  visibleCompetitors: VisibleDomain[];
  status: "gefunden" | "nicht_gefunden" | "nicht_geprueft";
  leakType?: "Kategorie-Leak" | "Vertrauens-Leak" | "Antwort-Leak" | "Brand-Signal" | "Unklar";
  interpretation: string;
}

/** The full reading returned by /api/scan and rendered in the result cockpit. */
export interface ScanResult {
  /** Normalized display host, e.g. "example.de". */
  domain: string;
  /** Final fetched URL after safe redirects. */
  url: string;
  /** ISO timestamp of this first reading. */
  fetchedAt: string;
  locale: Locale;
  reachable: boolean;
  /** Overall heuristic readiness, 0–100. */
  overallScore: number;
  overallStatus: ScanStatus;
  /** The trigger line shown first ("Erste Einordnung"). */
  finding: string;
  /** Number of categories currently in the weak band. */
  gapCount: number;
  scores: ScoreCard[];
  observations: Observation[];
  /** "Was das bedeutet" — one short paragraph. */
  meaning: string;
  /** "Nächster sinnvoller Schritt" — one short paragraph. */
  nextStep: string;
  /** Exactly 3 generated KI-Antwortfragen (raw question strings). */
  aiAnswerQuestions: string[];
  /** Exactly 3 web-signal checks, one per KI-Antwortfrage. */
  aiAnswerChecks: AiAnswerCheck[];
  /** Detected brand name used in the KI-Antwortfragen. */
  brandName: string;
  signals: RawSignals;
}

/** Error envelope when a scan cannot complete. */
export interface ScanError {
  error: string;
  /** Machine code so the UI can choose the right message. */
  code: "invalid_domain" | "blocked_target" | "unreachable" | "timeout" | "internal" | "rate_limited";
}
