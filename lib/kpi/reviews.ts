// ─── Google-Bewertungen: Ableitung aus Check-ins + Zielen ─────────────────────
// Reine Funktion. Der Ist-Zustand der manuell gepflegten Review-KPIs entsteht
// aus den neuesten kpi_manual_check_ins; die Ziele aus den aktiven
// kpi_targets-Versionen. Keine erfundenen Werte: fehlt ein Check-in, bleibt der
// Wert null (nie automatisch 0). Nur Typ-Importe (node-lauffähig für Tests).

import type { GoalVersionRow, KpiDefinitionRow, ManualCheckInRow } from "./types";

/** Feste metric_keys der manuell gepflegten Review-KPIs (siehe lib/kpi/goals.ts). */
export const REVIEW_RATING_METRIC_KEY = "google_rating";
export const REVIEW_NEW_METRIC_KEY = "google_new_reviews";

export interface ReviewModel {
  /** Review-KPIs existieren (Bootstrap gelaufen). */
  configured: boolean;
  /** Ø Sternebewertung (neuester Rating-Check-in); null = noch nicht erfasst. */
  rating: number | null;
  /** Gesamtzahl der Bewertungen (secondary_value des Rating-Check-ins). */
  count: number | null;
  /** Aktives Sterne-Ziel; null = kein Ziel gepflegt. */
  targetRating: number | null;
  /** Neue Bewertungen im aktuellen Monat; null = diesen Monat noch nicht erfasst. */
  newThisMonth: number | null;
  /** Aktives Monatsziel; null = kein Ziel gepflegt. */
  monthlyGoal: number | null;
  updatedById: string | null;
  updatedAt: string | null;
}

function latest(rows: ManualCheckInRow[]): ManualCheckInRow | null {
  // measured_at absteigend, bei Gleichstand created_at als Tiebreaker.
  return (
    [...rows].sort(
      (a, b) => b.measured_at.localeCompare(a.measured_at) || b.created_at.localeCompare(a.created_at),
    )[0] ?? null
  );
}

export function currentMonthKey(todayIso: string): string {
  return todayIso.slice(0, 7);
}

export function deriveReviewModel(
  reviewKpis: KpiDefinitionRow[],
  checkIns: ManualCheckInRow[],
  goals: GoalVersionRow[],
  todayIso: string,
): ReviewModel {
  const ratingKpi = reviewKpis.find((k) => k.metric_key === REVIEW_RATING_METRIC_KEY) ?? null;
  const newKpi = reviewKpis.find((k) => k.metric_key === REVIEW_NEW_METRIC_KEY) ?? null;

  if (!ratingKpi) {
    return {
      configured: false,
      rating: null,
      count: null,
      targetRating: null,
      newThisMonth: null,
      monthlyGoal: null,
      updatedById: null,
      updatedAt: null,
    };
  }

  const ratingCheckIn = latest(checkIns.filter((c) => c.kpi_definition_id === ratingKpi.id));
  const monthKey = currentMonthKey(todayIso);
  const newCheckIn = newKpi
    ? latest(
        checkIns.filter((c) => c.kpi_definition_id === newKpi.id && c.period_key === monthKey),
      )
    : null;

  const activeGoal = (kpiId: string, periodType: GoalVersionRow["period_type"]) =>
    goals.find((g) => g.status === "active" && g.kpi_definition_id === kpiId && g.period_type === periodType) ??
    null;

  const ratingGoal = activeGoal(ratingKpi.id, "current_state");
  const monthGoal = newKpi ? activeGoal(newKpi.id, "calendar_month") : null;

  return {
    configured: true,
    rating: ratingCheckIn ? Number(ratingCheckIn.value) : null,
    count: ratingCheckIn && ratingCheckIn.secondary_value !== null ? Number(ratingCheckIn.secondary_value) : null,
    targetRating: ratingGoal ? Number(ratingGoal.target_value) : null,
    newThisMonth: newCheckIn ? Number(newCheckIn.value) : null,
    monthlyGoal: monthGoal ? Number(monthGoal.target_value) : null,
    updatedById: ratingCheckIn?.entered_by ?? null,
    updatedAt: ratingCheckIn?.created_at ?? null,
  };
}
