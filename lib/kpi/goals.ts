// ─── KPI-Zielsystem: fachliche Spezifikation + Zielrechnung ───────────────────
// Reine, testbare Funktionen. Die fachlichen KPI-Eigenschaften (Einheit,
// Richtung, Comparator, erlaubte Zeiträume) sind hier zentral und fix definiert
// – das ist die „fachliche Wahrheit", die beim Zielsetzen NICHT frei verändert
// werden darf. Ziel-Ist-Vergleiche laufen ausschließlich über diese Funktionen,
// nie in Komponenten. Nur Typ-Importe, damit die Datei ohne Laufzeitabhängig-
// keiten (und ohne Pfad-Alias) direkt in einem Node-Harness geprüft werden kann.

import type { GoalVersionRow, KpiDefinitionRow } from "./types";

const roundPct = (pct: number) => Math.round(pct);

export type MetricDirection = "higher_is_better" | "lower_is_better";
export type PeriodType = "rolling_days" | "calendar_week" | "calendar_month" | "current_state";
export type Comparator = "at_least" | "at_most";
export type GoalSourceType = "manual_confirmed" | "imported_legacy" | "demo" | "system";
export type GoalStatusValue = "active" | "superseded" | "archived" | "draft";

/** Comparator folgt zwingend aus der Richtung; der Nutzer wählt ihn nie frei. */
export function comparatorForDirection(direction: MetricDirection): Comparator {
  return direction === "higher_is_better" ? "at_least" : "at_most";
}

export interface AllowedPeriod {
  periodType: PeriodType;
  periodDays: number | null;
  label: string;
}

export interface KpiSpec {
  metricKey: string;
  label: string;
  unit:
    | "clicks"
    | "impressions"
    | "percent"
    | "position"
    | "stars"
    | "reviews"
    | "views"
    | "interactions"
    | "posts"
    | "count"
    | "days"
    | "hours"
    | "euro";
  unitLabel: string;
  /** Substantiv für „X … fehlen" bzw. „X … über dem Ziel". */
  remainingNoun: string;
  direction: MetricDirection;
  comparator: Comparator;
  allowedPeriods: AllowedPeriod[];
  /** Formatierter Zahlwert ohne Einheitensymbol (Symbol setzt die UI). */
  formatValue: (n: number) => string;
}

const de = (n: number, digits = 0) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: digits >= 1 ? digits : 0, maximumFractionDigits: digits });

const ROLLING: AllowedPeriod[] = [
  { periodType: "rolling_days", periodDays: 7, label: "7 Tage" },
  { periodType: "rolling_days", periodDays: 28, label: "28 Tage" },
  { periodType: "rolling_days", periodDays: 90, label: "90 Tage" },
];

/**
 * Feste fachliche KPI-Spezifikationen, zentral gepflegt. Keys sind metric_key
 * der kpi_definitions (Klicks, Bewertungen) bzw. stabile Canvas-Metrik-Keys für
 * die unterstützenden Search-Kennzahlen. Comparator ist immer aus der Richtung
 * abgeleitet, nicht frei wählbar.
 */
export const KPI_SPECS: Record<string, KpiSpec> = {
  organic_clicks_product_pages: {
    metricKey: "organic_clicks_product_pages",
    label: "Organische Klicks",
    unit: "clicks",
    unitLabel: "Klicks",
    remainingNoun: "Klicks",
    direction: "higher_is_better",
    comparator: "at_least",
    allowedPeriods: ROLLING,
    formatValue: (n) => de(n),
  },
  // Unterstützende Search-Kennzahlen: fachliche Wahrheit dokumentiert, zum
  // Launch ohne Pflichtziel. Keys entsprechen den Canvas-Metriken.
  impressions: {
    metricKey: "impressions",
    label: "Impressionen",
    unit: "impressions",
    unitLabel: "Impressionen",
    remainingNoun: "Impressionen",
    direction: "higher_is_better",
    comparator: "at_least",
    allowedPeriods: ROLLING,
    formatValue: (n) => de(n),
  },
  ctr: {
    metricKey: "ctr",
    label: "Klickrate",
    unit: "percent",
    unitLabel: "%",
    remainingNoun: "Prozentpunkte",
    direction: "higher_is_better",
    comparator: "at_least",
    allowedPeriods: ROLLING,
    formatValue: (n) => `${de(n, 2)}`,
  },
  position: {
    metricKey: "position",
    label: "Ø Position",
    unit: "position",
    unitLabel: "Position",
    remainingNoun: "Positionen",
    direction: "lower_is_better",
    comparator: "at_most",
    allowedPeriods: ROLLING,
    formatValue: (n) => de(n, 1),
  },
  google_rating: {
    metricKey: "google_rating",
    label: "Google-Bewertung",
    unit: "stars",
    unitLabel: "Sterne",
    remainingNoun: "Sterne",
    direction: "higher_is_better",
    comparator: "at_least",
    allowedPeriods: [{ periodType: "current_state", periodDays: null, label: "Aktueller Stand" }],
    formatValue: (n) => de(n, 1),
  },
  google_new_reviews: {
    metricKey: "google_new_reviews",
    label: "Neue Google-Bewertungen",
    unit: "reviews",
    unitLabel: "Bewertungen",
    remainingNoun: "Bewertungen",
    direction: "higher_is_better",
    comparator: "at_least",
    allowedPeriods: [{ periodType: "calendar_month", periodDays: null, label: "Aktueller Monat" }],
    formatValue: (n) => de(n),
  },
  // Google-Präsenz: manuell gepflegte Baselines, Vergleich nach 90 Tagen –
  // kein rollierendes Ziel, deshalb allowedPeriods nur als Formalie current_state.
  google_profile_views: {
    metricKey: "google_profile_views",
    label: "Profilaufrufe",
    unit: "views",
    unitLabel: "Aufrufe",
    remainingNoun: "Aufrufe",
    direction: "higher_is_better",
    comparator: "at_least",
    allowedPeriods: [{ periodType: "current_state", periodDays: null, label: "Aktueller Stand" }],
    formatValue: (n) => de(n),
  },
  google_interactions: {
    metricKey: "google_interactions",
    label: "Interaktionen",
    unit: "interactions",
    unitLabel: "Interaktionen",
    remainingNoun: "Interaktionen",
    direction: "higher_is_better",
    comparator: "at_least",
    allowedPeriods: [{ periodType: "current_state", periodDays: null, label: "Aktueller Stand" }],
    formatValue: (n) => de(n),
  },
  google_monthly_views_estimate: {
    metricKey: "google_monthly_views_estimate",
    label: "Monatliche Aufrufe (ungefähr)",
    unit: "views",
    unitLabel: "Aufrufe",
    remainingNoun: "Aufrufe",
    direction: "higher_is_better",
    comparator: "at_least",
    allowedPeriods: [{ periodType: "current_state", periodDays: null, label: "Aktueller Stand" }],
    formatValue: (n) => de(n),
  },
  // Content & Authority: operative Wochen-/Monatsziele.
  blog_posts_published: {
    metricKey: "blog_posts_published",
    label: "Blogartikel",
    unit: "posts",
    unitLabel: "Beiträge",
    remainingNoun: "Beiträge",
    direction: "higher_is_better",
    comparator: "at_least",
    allowedPeriods: [{ periodType: "calendar_week", periodDays: null, label: "Aktuelle Woche" }],
    formatValue: (n) => de(n),
  },
  qualified_reddit_contributions: {
    metricKey: "qualified_reddit_contributions",
    label: "Reddit",
    unit: "posts",
    unitLabel: "Beiträge",
    remainingNoun: "Beiträge",
    direction: "higher_is_better",
    comparator: "at_least",
    allowedPeriods: [{ periodType: "calendar_month", periodDays: null, label: "Aktueller Monat" }],
    formatValue: (n) => de(n),
  },
};

export function specForMetricKey(metricKey: string): KpiSpec | null {
  return KPI_SPECS[metricKey] ?? null;
}

export function directionExplanation(direction: MetricDirection): string {
  return direction === "higher_is_better" ? "Höher ist besser" : "Niedriger ist besser";
}

/** Menschlicher Zeitraumtext, unabhängig von einer einzelnen KPI. */
export function formatGoalPeriod(periodType: PeriodType, periodDays: number | null): string {
  if (periodType === "rolling_days") return `${periodDays} Tage`;
  if (periodType === "calendar_week") return "Aktuelle Woche";
  if (periodType === "calendar_month") return "Aktueller Monat";
  return "Aktueller Stand";
}

/**
 * Aktive Zielversion eines KPI für eine bestimmte Zeitraumdefinition. „Aktiv"
 * heißt status = active (nicht superseded/archived/draft) und – falls angegeben –
 * passende Periode. Ohne Periodenfilter wird die erste aktive Version geliefert.
 */
export function resolveActiveGoal(
  goals: GoalVersionRow[],
  opts: { kpiDefinitionId: string; periodType?: PeriodType; periodDays?: number | null },
): GoalVersionRow | null {
  return (
    goals.find(
      (g) =>
        g.status === "active" &&
        g.kpi_definition_id === opts.kpiDefinitionId &&
        (opts.periodType === undefined || g.period_type === opts.periodType) &&
        (opts.periodDays === undefined || g.period_days === opts.periodDays),
    ) ?? null
  );
}

export type GoalStatusKey =
  | "achieved"
  | "near_target"
  | "needs_attention"
  | "no_target"
  | "insufficient_data";

export const GOAL_STATUS_LABEL: Record<GoalStatusKey, string> = {
  achieved: "Im Ziel",
  near_target: "Nahe am Ziel",
  needs_attention: "Benötigt Aufmerksamkeit",
  no_target: "Noch kein Ziel",
  insufficient_data: "Noch nicht genügend Daten",
};

/** Schwelle für „nahe am Ziel". */
export const NEAR_TARGET_PCT = 85;

export interface GoalStatusResult {
  statusKey: GoalStatusKey;
  statusLabel: string;
  /** Zielerreichung in Prozent (kann > 100 sein); null ohne Ziel/Daten. */
  achievedPct: number | null;
  /** Verbleibende Differenz in KPI-Einheiten; null ohne Ziel/Daten. */
  remaining: number | null;
  /** Fertig formulierter Resttext, z. B. „18 Klicks fehlen". */
  remainingText: string | null;
}

/**
 * Zielstatus aus Ist-Wert und Ziel, comparator-korrekt (higher/lower is better).
 * Ist-Wert und Ziel MÜSSEN dieselbe Einheit und denselben Zeitraum haben – das
 * stellt der Aufrufer sicher (gleicher Scope, gleiche Periode). Kein Pace-to-Goal,
 * kein Forecast.
 */
export function computeGoalStatus(
  actual: number | null,
  goal: { targetValue: number; comparator: Comparator } | null,
  spec: KpiSpec,
  opts: { hasEnoughData?: boolean } = {},
): GoalStatusResult {
  if (!goal) {
    return {
      statusKey: "no_target",
      statusLabel: GOAL_STATUS_LABEL.no_target,
      achievedPct: null,
      remaining: null,
      remainingText: null,
    };
  }
  if (actual === null || opts.hasEnoughData === false) {
    return {
      statusKey: "insufficient_data",
      statusLabel: GOAL_STATUS_LABEL.insufficient_data,
      achievedPct: null,
      remaining: null,
      remainingText: null,
    };
  }

  const { targetValue, comparator } = goal;

  if (comparator === "at_least") {
    const pct = targetValue > 0 ? (actual / targetValue) * 100 : actual > 0 ? 100 : 0;
    const met = actual >= targetValue;
    const remaining = Math.max(0, targetValue - actual);
    const statusKey: GoalStatusKey = met
      ? "achieved"
      : pct >= NEAR_TARGET_PCT
        ? "near_target"
        : "needs_attention";
    return {
      statusKey,
      statusLabel: GOAL_STATUS_LABEL[statusKey],
      achievedPct: pct,
      remaining,
      remainingText: met ? null : `${spec.formatValue(remaining)} ${spec.remainingNoun} fehlen`,
    };
  }

  // at_most (niedriger ist besser, z. B. Position): 100 % bei Gleichstand,
  // > 100 % wenn besser (kleiner als Ziel), < 100 % wenn schlechter (größer).
  const pct = actual > 0 ? (targetValue / actual) * 100 : 100;
  const met = actual <= targetValue;
  const remaining = Math.max(0, actual - targetValue);
  const statusKey: GoalStatusKey = met
    ? "achieved"
    : pct >= NEAR_TARGET_PCT
      ? "near_target"
      : "needs_attention";
  return {
    statusKey,
    statusLabel: GOAL_STATUS_LABEL[statusKey],
    achievedPct: pct,
    remaining,
    remainingText: met ? null : `${spec.formatValue(remaining)} ${spec.remainingNoun} über dem Ziel`,
  };
}

/* ── Zielanzeige der primären KPI-Karte ─────────────────────────────────────── */

/**
 * Aufbereitete Zielinformation für die KPI-Karte. Trennt sauber die Fälle:
 * Pilot-Scope ohne eigenes Ziel, kein Ziel, Ziel für eine andere Periode als
 * die gewählte (kein Prozentvergleich, um Einheiten/Zeiträume nicht zu mischen)
 * und die volle Anzeige.
 */
export type GoalDisplayState = "scope_no_goal" | "no_goal" | "period_mismatch" | "full";

export interface KpiGoalDisplay {
  state: GoalDisplayState;
  /** "Ziel 100 · 28 Tage" */
  targetText: string | null;
  /** "82 % erreicht" */
  achievedText: string | null;
  /** "18 Klicks fehlen" */
  remainingText: string | null;
  statusKey: GoalStatusKey | null;
  statusLabel: string | null;
  ownerName: string | null;
  /** Hinweis bei period_mismatch, z. B. "Zielerreichung im 28-Tage-Zeitraum". */
  mismatchNote: string | null;
}

/**
 * Baut die Zielanzeige der primären Kennzahl. Voller Vergleich nur, wenn Ist
 * und Ziel dieselbe Periode UND denselben (aggregierten) Scope betreffen –
 * andernfalls kein Prozentwert. Owner-Name kommt bereits aufgelöst herein
 * (kein UUID in der Anzeige).
 */
export function buildGoalDisplay(args: {
  isAggregateScope: boolean;
  spec: KpiSpec | null;
  /** Aktives Ziel, dessen Periode zur aktuell gewählten Range passt. */
  activeGoalForPeriod: GoalVersionRow | null;
  /** Irgendein aktives Ziel dieser KPI (für die Mismatch-Anzeige). */
  anyActiveGoal: GoalVersionRow | null;
  actual: number | null;
  hasEnoughData: boolean;
  ownerName: string | null;
}): KpiGoalDisplay {
  const empty: KpiGoalDisplay = {
    state: "no_goal",
    targetText: null,
    achievedText: null,
    remainingText: null,
    statusKey: null,
    statusLabel: null,
    ownerName: null,
    mismatchNote: null,
  };

  if (!args.isAggregateScope) {
    return { ...empty, state: "scope_no_goal" };
  }
  if (!args.spec) return empty;

  if (args.activeGoalForPeriod) {
    const goal = args.activeGoalForPeriod;
    const status = computeGoalStatus(
      args.actual,
      { targetValue: Number(goal.target_value), comparator: goal.comparator },
      args.spec,
      { hasEnoughData: args.hasEnoughData },
    );
    return {
      state: "full",
      targetText: `Ziel ${args.spec.formatValue(Number(goal.target_value))} · ${formatGoalPeriod(goal.period_type, goal.period_days)}`,
      achievedText: status.achievedPct !== null ? `${roundPct(status.achievedPct)} % erreicht` : null,
      remainingText: status.remainingText,
      statusKey: status.statusKey,
      statusLabel: status.statusLabel,
      ownerName: args.ownerName,
      mismatchNote: null,
    };
  }

  if (args.anyActiveGoal) {
    const goal = args.anyActiveGoal;
    return {
      state: "period_mismatch",
      targetText: `Ziel ${args.spec.formatValue(Number(goal.target_value))} · ${formatGoalPeriod(goal.period_type, goal.period_days)}`,
      achievedText: null,
      remainingText: null,
      statusKey: null,
      statusLabel: null,
      ownerName: args.ownerName,
      mismatchNote: `Zielerreichung bezieht sich auf ${formatGoalPeriod(goal.period_type, goal.period_days)}`,
    };
  }

  return empty;
}

/* ── Custom (nutzererstellte) KPIs ───────────────────────────────────────────── */

/** Kontrollierte Einheiten für eigene KPIs (Auswahl im Erstellungsflow). */
export const CUSTOM_UNITS: Array<{ value: string; label: string }> = [
  { value: "count", label: "Anzahl" },
  { value: "percent", label: "Prozent" },
  { value: "stars", label: "Sterne" },
  { value: "days", label: "Tage" },
  { value: "hours", label: "Stunden" },
  { value: "euro", label: "Euro" },
];

/** Kontrollierte Zeiträume für eigene KPIs (Auswahl im Erstellungsflow). */
export const CUSTOM_PERIODS: AllowedPeriod[] = [
  { periodType: "current_state", periodDays: null, label: "Aktueller Stand" },
  { periodType: "calendar_week", periodDays: null, label: "Pro Kalenderwoche" },
  { periodType: "calendar_month", periodDays: null, label: "Pro Kalendermonat" },
  { periodType: "rolling_days", periodDays: 7, label: "Rollierende 7 Tage" },
  { periodType: "rolling_days", periodDays: 28, label: "Rollierende 28 Tage" },
  { periodType: "rolling_days", periodDays: 90, label: "Rollierende 90 Tage" },
];

interface UnitMeta {
  unit: KpiSpec["unit"];
  unitLabel: string;
  remainingNoun: string;
  formatValue: (n: number) => string;
}

const CUSTOM_UNIT_META: Record<string, UnitMeta> = {
  count: { unit: "count", unitLabel: "", remainingNoun: "", formatValue: (n) => de(n) },
  percent: { unit: "percent", unitLabel: "%", remainingNoun: "Prozentpunkte", formatValue: (n) => `${de(n, 2)}` },
  stars: { unit: "stars", unitLabel: "★", remainingNoun: "Sterne", formatValue: (n) => de(n, 1) },
  days: { unit: "days", unitLabel: "Tage", remainingNoun: "Tage", formatValue: (n) => de(n) },
  hours: { unit: "hours", unitLabel: "Std.", remainingNoun: "Stunden", formatValue: (n) => de(n, 1) },
  euro: { unit: "euro", unitLabel: "€", remainingNoun: "Euro", formatValue: (n) => de(n, 2) },
};

export function customUnitLabel(unit: string | null): string {
  return CUSTOM_UNITS.find((u) => u.value === unit)?.label ?? unit ?? "";
}

/**
 * Fachliche Spezifikation zu einer KPI-Definition: System-KPIs über KPI_SPECS,
 * eigene KPIs aus den Zeilenfeldern (Einheit/Richtung). So teilen sich beide
 * Arten dieselbe Ziel-/Statuslogik, ohne zweite Wahrheit.
 */
export function resolveKpiSpec(def: {
  kind: string;
  metric_key: string;
  name: string;
  unit: string | null;
  direction: MetricDirection | null;
}): KpiSpec | null {
  if (def.kind !== "custom_manual") return specForMetricKey(def.metric_key);
  if (!def.unit || !def.direction) return null;
  const meta = CUSTOM_UNIT_META[def.unit] ?? CUSTOM_UNIT_META.count;
  return {
    metricKey: def.metric_key,
    label: def.name,
    unit: meta.unit,
    unitLabel: meta.unitLabel,
    remainingNoun: meta.remainingNoun || def.name,
    direction: def.direction,
    comparator: comparatorForDirection(def.direction),
    allowedPeriods: CUSTOM_PERIODS,
    formatValue: meta.formatValue,
  };
}

/** Ist ein KPI nutzererstellt (manuell)? */
export function isCustomKpi(def: { kind: string }): boolean {
  return def.kind === "custom_manual";
}

// Referenziert, damit der KpiDefinitionRow-Import typseitig genutzt wird.
export type KpiDefinitionForSpec = Pick<KpiDefinitionRow, "kind" | "metric_key" | "name" | "unit" | "direction">;
