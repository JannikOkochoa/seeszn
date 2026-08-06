// ─── Ladefenster des GSC-Syncs ────────────────────────────────────────────────
// Reine Rechnung, bewusst ohne server-only: so ist sie einzeln testbar.
//
// Das Fenster ist kein Backfill-Regler, sondern die Menge an Historie, die das
// Cockpit zum Rechnen braucht. Ein Batch ist im Datenmodell in sich
// abgeschlossen, und das Dashboard liest ausschließlich den aktiven Batch – ein
// kürzeres Fenster würde die 90-Tage-Ansicht leerlaufen lassen. 200 Tage sind
// deshalb nicht "viel Historie", sondern das Minimum: 90 Tage plus 90 Tage
// Vorperiode plus Puffer.

/** Standardfenster: 90 Tage Ansicht + 90 Tage Vorperiode + Puffer. */
export const BASE_WINDOW_DAYS = 200;
/** Obergrenze, damit auch ein sehr langer Ausfall den Lauf nicht sprengt. */
export const MAX_WINDOW_DAYS = 480;
/** Zusätzliche Tage beim Nachholen, damit an der Nahtstelle nichts fehlt. */
export const CATCH_UP_MARGIN_DAYS = 14;

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000,
  );
}

/** Konfigurierbares Standardfenster (GSC_SYNC_WINDOW_DAYS), sicher begrenzt. */
export function baseWindowDays(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return BASE_WINDOW_DAYS;
  return Math.min(MAX_WINDOW_DAYS, Math.max(30, Math.round(parsed)));
}

/**
 * Self-Healing: Das Standardfenster deckt jede übliche Lücke bereits ab, weil
 * es ohnehin 200 Tage zurückreicht. Nur wenn länger nichts mehr ankam als das
 * Fenster lang ist, wird es so weit geöffnet, dass keine Lücke entsteht.
 *
 * Damit holt ein späterer regulärer Lauf einen ausgefallenen Zeitraum von
 * selbst nach, ohne bei jedem Lauf mehr Historie zu ziehen als nötig.
 */
export function resolveWindowDays(input: {
  baseDays: number;
  /** data_sources.data_available_until, also der zuletzt geschriebene Stand. */
  dataAvailableUntil: string | null;
  endDate: string;
}): { days: number; catchUp: boolean } {
  const { baseDays, dataAvailableUntil, endDate } = input;
  if (!dataAvailableUntil) return { days: baseDays, catchUp: false };

  const gap = daysBetween(dataAvailableUntil, endDate);
  if (gap <= baseDays) return { days: baseDays, catchUp: false };

  return { days: Math.min(MAX_WINDOW_DAYS, gap + CATCH_UP_MARGIN_DAYS), catchUp: true };
}
