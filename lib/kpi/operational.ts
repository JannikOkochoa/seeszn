// ─── Operative KPIs: Google-Präsenz + Content & Authority ─────────────────────
// Reine Ableitungen aus manuellen Check-ins und Zielen. Sekundäre KPI-Gruppen –
// die vier Search-Kennzahlen bleiben unberührt. Keine erfundenen Werte, kein
// automatischer Trend. Nur Typ-Importe (node-lauffähig für Tests).

import type { GoalVersionRow, KpiDefinitionRow, ManualCheckInRow } from "./types";

export const GOOGLE_PROFILE_VIEWS_KEY = "google_profile_views";
export const GOOGLE_INTERACTIONS_KEY = "google_interactions";
export const GOOGLE_MONTHLY_VIEWS_KEY = "google_monthly_views_estimate";
export const BLOG_POSTS_KEY = "blog_posts_published";
export const REDDIT_CONTRIB_KEY = "qualified_reddit_contributions";

/** Tage bis zum nächsten Baseline-Vergleich der Google-Präsenz. */
export const PRESENCE_COMPARISON_DAYS = 90;

function latestFor(checkIns: ManualCheckInRow[], kpiId: string, periodKey?: string | null): ManualCheckInRow | null {
  return (
    checkIns
      .filter((c) => c.kpi_definition_id === kpiId && (periodKey === undefined || c.period_key === periodKey))
      .sort(
        (a, b) =>
          b.measured_at.localeCompare(a.measured_at) || b.created_at.localeCompare(a.created_at),
      )[0] ?? null
  );
}

function countFor(checkIns: ManualCheckInRow[], kpiId: string): number {
  return checkIns.filter((c) => c.kpi_definition_id === kpiId).length;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** ISO-8601-Wochenschlüssel, z. B. "2026-W29". */
export function isoWeekKey(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7; // Montag = 0
  d.setUTCDate(d.getUTCDate() - day + 3); // Donnerstag dieser Woche
  const year = d.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function monthKeyOf(iso: string): string {
  return iso.slice(0, 7);
}

/* ── Google-Präsenz ─────────────────────────────────────────────────────────── */

export interface GooglePresenceModel {
  configured: boolean;
  profileViews: number | null;
  interactions: number | null;
  monthlyEstimate: number | null;
  /** Messdatum der Baseline (measured_at der Profilaufrufe). */
  baselineDate: string | null;
  /** Baseline + 90 Tage; nur informativ. */
  nextComparisonDate: string | null;
  /** true erst, wenn eine zweite Messung existiert (dann ist ein Vergleich möglich). */
  hasComparison: boolean;
  updatedById: string | null;
  updatedAt: string | null;
}

export function deriveGooglePresence(
  manualKpis: KpiDefinitionRow[],
  checkIns: ManualCheckInRow[],
): GooglePresenceModel {
  const viewsKpi = manualKpis.find((k) => k.metric_key === GOOGLE_PROFILE_VIEWS_KEY) ?? null;
  const interactionsKpi = manualKpis.find((k) => k.metric_key === GOOGLE_INTERACTIONS_KEY) ?? null;
  const monthlyKpi = manualKpis.find((k) => k.metric_key === GOOGLE_MONTHLY_VIEWS_KEY) ?? null;

  if (!viewsKpi) {
    return {
      configured: false,
      profileViews: null,
      interactions: null,
      monthlyEstimate: null,
      baselineDate: null,
      nextComparisonDate: null,
      hasComparison: false,
      updatedById: null,
      updatedAt: null,
    };
  }

  const viewsCheckIn = latestFor(checkIns, viewsKpi.id);
  const interactionsCheckIn = interactionsKpi ? latestFor(checkIns, interactionsKpi.id) : null;
  const monthlyCheckIn = monthlyKpi ? latestFor(checkIns, monthlyKpi.id) : null;
  const baselineDate = viewsCheckIn?.measured_at ?? null;

  return {
    configured: true,
    profileViews: viewsCheckIn ? Number(viewsCheckIn.value) : null,
    interactions: interactionsCheckIn ? Number(interactionsCheckIn.value) : null,
    monthlyEstimate: monthlyCheckIn ? Number(monthlyCheckIn.value) : null,
    baselineDate,
    nextComparisonDate: baselineDate ? addDaysIso(baselineDate, PRESENCE_COMPARISON_DAYS) : null,
    // Ein Vergleich ist erst ab der zweiten Messung möglich; bis dahin ehrlich false.
    hasComparison: countFor(checkIns, viewsKpi.id) > 1,
    updatedById: viewsCheckIn?.entered_by ?? null,
    updatedAt: viewsCheckIn?.created_at ?? null,
  };
}

/* ── Content & Authority ────────────────────────────────────────────────────── */

export interface ContentMetric {
  /** Ist-Wert der aktuellen Periode; null = noch nicht erfasst. */
  value: number | null;
  /** Aktives Ziel; null = kein Ziel gepflegt. */
  goal: number | null;
  periodKey: string;
}

export interface ContentAuthorityModel {
  configured: boolean;
  blog: ContentMetric;
  reddit: ContentMetric;
  updatedById: string | null;
  updatedAt: string | null;
}

function activeGoalTarget(goals: GoalVersionRow[], kpiId: string): number | null {
  const g = goals.find((x) => x.status === "active" && x.kpi_definition_id === kpiId) ?? null;
  return g ? Number(g.target_value) : null;
}

export function deriveContentAuthority(
  manualKpis: KpiDefinitionRow[],
  checkIns: ManualCheckInRow[],
  goals: GoalVersionRow[],
  todayIso: string,
): ContentAuthorityModel {
  const blogKpi = manualKpis.find((k) => k.metric_key === BLOG_POSTS_KEY) ?? null;
  const redditKpi = manualKpis.find((k) => k.metric_key === REDDIT_CONTRIB_KEY) ?? null;
  const weekKey = isoWeekKey(todayIso);
  const monthKey = monthKeyOf(todayIso);

  const blogCheckIn = blogKpi ? latestFor(checkIns, blogKpi.id, weekKey) : null;
  const redditCheckIn = redditKpi ? latestFor(checkIns, redditKpi.id, monthKey) : null;

  const updates = [blogCheckIn, redditCheckIn].filter((c): c is ManualCheckInRow => c !== null);
  const latestUpdate =
    updates.sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null;

  return {
    configured: !!blogKpi && !!redditKpi,
    blog: {
      value: blogCheckIn ? Number(blogCheckIn.value) : null,
      goal: blogKpi ? activeGoalTarget(goals, blogKpi.id) : null,
      periodKey: weekKey,
    },
    reddit: {
      value: redditCheckIn ? Number(redditCheckIn.value) : null,
      goal: redditKpi ? activeGoalTarget(goals, redditKpi.id) : null,
      periodKey: monthKey,
    },
    updatedById: latestUpdate?.entered_by ?? null,
    updatedAt: latestUpdate?.created_at ?? null,
  };
}
