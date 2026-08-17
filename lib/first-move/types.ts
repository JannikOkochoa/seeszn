// ─── First Move: Datenmodell des Scans ────────────────────────────────────────
// Typisierte Umsetzung von docs/first-move/SCAN_API_CONTRACT_v6.md. Die Regel dahinter ist
// eine einzige: ein First Move ist kein Audit-Fund, sondern ein belegter,
// begrenzter Engpass, der genau eine realistische Intervention und eine
// Messhypothese trägt.
//
// Reicht die Evidenz nicht, ist die richtige Ausgabe `not_qualified`. Nie eine
// erfundene Empfehlung.
//
// V6 trennt zusätzlich zwei Sichten: `FirstMoveFinding` ist die vollständige
// interne Auswertung, `PublicFinding` das, was ein kostenloser Scan zeigen darf.
// Nur die öffentliche Sicht verlässt den Server.

import type { PublicDiagnosis } from "./diagnosis";

/** Diagnosepfad. Keine kaufbare Auswahl, nur die Richtung der ersten Suche. */
export type FirstMoveRoute = "search" | "ai_search" | "paid_acquisition" | "unsure";

/** Reifegrad eines Befunds. */
export type FindingStatus =
  | "candidate"
  | "qualified"
  | "not_qualified"
  | "requires_more_evidence"
  | "ineligible";

export type Level = "low" | "medium" | "high";

/**
 * Art der geprüften Oberfläche. Wird aus beobachteten Signalen abgeleitet
 * (Produktauszeichnung, Produktdetailpfade) und entscheidet nur darüber, welcher
 * Case nach einem Befund als relevantester zuerst gezeigt wird.
 */
export type SurfaceKind = "commerce" | "site";

/** Herkunft einer einzelnen Beobachtung. */
export type EvidenceSource =
  | "public_html"
  | "robots"
  | "sitemap"
  | "headers"
  | "performance"
  | "structured_data"
  | "internal_linking"
  | "content"
  | "entity_signal"
  | "ai_search_monitoring"
  | "public_tag_signal"
  | "consent_signal"
  | "landing_page"
  | "google_ads_read_only"
  | "crm_read_only"
  | "other";

/**
 * Eine Beobachtung, kein Urteil. `observation` beschreibt, was messbar da war.
 * Die Interpretation steht ausschließlich im Finding, nie hier.
 */
export interface EvidenceItem {
  id: string;
  source: EvidenceSource;
  type: string;
  observation: string;
  scope?: {
    urls?: string[];
    querySet?: string;
    market?: string;
    accountIdMasked?: string;
  };
  measuredValue?: string | number;
  comparisonValue?: string | number;
  observedAt: string;
  reproducible: boolean;
}

/** Der konkrete Eingriff. Muss begrenzt und kontrollierbar sein. */
export interface ProposedFirstMove {
  /**
   * Die Klasse des Eingriffs, ohne konkretes Ziel. Das ist der einzige Teil des
   * Umsetzungsplans, der öffentlich gezeigt wird: er zeigt die Einschätzung,
   * ohne die Arbeit vorwegzunehmen. Beispiel: "Konsolidierung auf eine zentrale
   * Zielseite". Nie: welche Seite das Ziel wird.
   */
  interventionType: string;
  title: string;
  scope: string;
  implementationSurface:
    | "website"
    | "content"
    | "information_architecture"
    | "technical_seo"
    | "ai_search"
    | "google_ads"
    | "measurement";
  implementationMode: "SEESZN_access" | "internal_team" | "existing_agency";
  expectedHours?: number;
  bounded: boolean;
  reversibleOrControlled: boolean;
}

/** Was gemessen wird und was ausdrücklich nicht kausal zugesichert ist. */
export interface MeasurementHypothesis {
  metric: string;
  baselineDefinition: string;
  expectedDirection: "increase" | "decrease" | "stabilize" | "clarify";
  measurementWindowWeeksMin: 4;
  measurementWindowWeeksMax: 8;
  attributionLimitations?: string[];
}

export type EligibilityReason =
  | "no_implementation_path"
  | "approval_unknown"
  | "paid_read_only_required"
  | "enterprise_scale"
  | "multi_market_scope"
  | "capacity"
  | "insufficient_evidence"
  | "other";

export interface EligibilityState {
  eligible: boolean;
  reason?: EligibilityReason;
  nextAction?: string;
}

/** Der kanonische Befund. */
export interface FirstMoveFinding {
  id: string;
  route: FirstMoveRoute;
  status: FindingStatus;
  title: string;
  summary: string;
  evidence: EvidenceItem[];
  impact: Level;
  confidence: Level;
  effort: Level;
  proposedFirstMove?: ProposedFirstMove;
  measurementHypothesis?: MeasurementHypothesis;
  eligibility: EligibilityState;
  publicEvidenceOnly: boolean;
  requiresReadOnly?: boolean;
  /** Art der Oberfläche, nur für die Auswahl des relevantesten Cases. */
  surfaceKind?: SurfaceKind;
  /** Vorschlag für die Komplexitätsfrage im Fit Check. */
  suggestedComplexity?: Complexity;
  /**
   * True nur beim klar als Beispiel gekennzeichneten Platzhalter. Ein echter
   * Scan setzt das nie. Die UI muss darauf ein sichtbares Label rendern.
   */
  isExample?: boolean;
  createdAt: string;
}

// ─── Öffentliche Sicht ────────────────────────────────────────────────────────
//
// Der kostenlose Scan zeigt Beobachtung, ein bis zwei Belege, Impact,
// Confidence und die Art des möglichen Eingriffs. Er zeigt nicht: konkrete
// URLs, das konkrete Ziel, die Canonical- oder Redirect-Logik, die
// Messhypothese oder den Scope des vorgeschlagenen Moves. Diese Arbeit gehört
// zum bezahlten Produkt.

/** Eine Beobachtung in der öffentlichen Sicht. Ohne URLs, ohne Messwerte. */
export interface PublicEvidencePoint {
  id: string;
  observation: string;
}

export interface PublicFinding {
  id: string;
  route: FirstMoveRoute;
  status: FindingStatus;
  /** Die Beobachtung, nicht die Umsetzung. */
  title: string;
  summary: string;
  /** Höchstens zwei knappe Belege. */
  evidence: PublicEvidencePoint[];
  impact: Level;
  confidence: Level;
  /**
   * Die Art des möglichen Eingriffs, ohne Ziel und ohne Ausführungsplan.
   * Sie zeigt die Einschätzung, nicht die Arbeit.
   */
  interventionType?: string;
  eligibility: EligibilityState;
  publicEvidenceOnly: true;
  requiresReadOnly?: boolean;
  /** Art der Oberfläche, nur für die Auswahl des relevantesten Cases. */
  surfaceKind?: SurfaceKind;
  /** Vorschlag für die Komplexitätsfrage im Fit Check. */
  suggestedComplexity?: Complexity;
  createdAt: string;
}

/** Kategorie eines Paid-Befunds. */
export type PaidCategory =
  | "brand_leakage"
  | "search_term_waste"
  | "pmax_incrementality"
  | "conversion_signal_quality"
  | "campaign_fragmentation"
  | "landing_page_mismatch"
  | "lead_value_signal"
  | "other";

export interface PaidFinding extends FirstMoveFinding {
  route: "paid_acquisition";
  paidCategory: PaidCategory;
  publicEvidence: EvidenceItem[];
  accountEvidence?: EvidenceItem[];
  economicSignal?: {
    metric: string;
    currentValue?: string | number;
    comparisonValue?: string | number;
    source: "google_ads_read_only" | "crm_read_only" | "derived";
  };
  requiresReadOnly: boolean;
}

/** Zustände, die der Scan tatsächlich durchläuft. Keine Fortschrittsprozente. */
export type ScanState =
  | "idle"
  | "normalizing_domain"
  | "domain_reachable"
  | "robots_checked"
  | "sitemap_checked"
  | "scope_detected"
  | "public_pages_read"
  | "technical_signals_checked"
  | "semantic_patterns_found"
  | "finding_qualifying"
  | "public_finding_ready"
  | "read_only_required"
  | "account_connected"
  | "account_signals_checked"
  | "finding_ready"
  | "not_qualified"
  | "error";

/** Ein gestreamtes Statusereignis. Wird erst gesendet, wenn der Schritt real fertig ist. */
export interface ScanStateEvent {
  type: "state";
  state: ScanState;
  /** Kurzer deutscher Text für die Live-Leiste. */
  label: string;
  /** Optionaler Messwert, den der Schritt tatsächlich ergeben hat. */
  detail?: string;
  at: string;
}

export interface ScanResultEvent {
  type: "result";
  domain: string;
  url: string;
  route: FirstMoveRoute;
  /** Immer die öffentliche Sicht. Die vollständige Auswertung bleibt am Server. */
  finding: PublicFinding | null;
  /**
   * Der Diagnosezustand samt gelesener Evidenz. Immer gesetzt, wenn der Scan
   * durchgelaufen ist: auch ohne Empfehlung hat der Besucher ein Ergebnis.
   * Enthält nur aggregierte Beobachtungen, nie URLs.
   */
  diagnosis: PublicDiagnosis;
  /** Gesetzt, wenn kein Befund die Qualifikationsschwelle erreicht hat. */
  notQualifiedReason?: string;
  at: string;
}

export interface ScanErrorEvent {
  type: "error";
  code: "invalid_domain" | "blocked_target" | "unreachable" | "timeout" | "internal" | "rate_limited";
  message: string;
}

export type ScanEvent = ScanStateEvent | ScanResultEvent | ScanErrorEvent;

// ─── Paid Stage 1 ─────────────────────────────────────────────────────────────

/** Monatliches Mediabudget. Nur Bänder, nie eine exakte Zahl. */
export type SpendBand = "lt_10k" | "10k_50k" | "50k_250k" | "gt_250k" | "unknown";

export const SPEND_BANDS: readonly { id: SpendBand; label: string }[] = [
  { id: "lt_10k", label: "< 10.000 € / Monat" },
  { id: "10k_50k", label: "10.000–50.000 €" },
  { id: "50k_250k", label: "50.000–250.000 €" },
  { id: "gt_250k", label: "> 250.000 €" },
  { id: "unknown", label: "Weiß ich nicht" },
];

// ─── Fit Check ────────────────────────────────────────────────────────────────

export type ImplementationPath =
  | "seeszn_access"
  | "internal_team"
  | "existing_agency"
  | "none";

export type ApprovalPath = "direct" | "internal_small" | "external" | "unknown";

export type Complexity = "simple" | "medium" | "high" | "very_high";

export interface FitCheckAnswers {
  implementation: ImplementationPath | null;
  approval: ApprovalPath | null;
  complexity: Complexity | null;
}
