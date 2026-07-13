"use client";

// ─── Performance Tooltip ──────────────────────────────────────────────────────
// Präziser, ruhiger Tooltip für den Performance Canvas: Datum, Wert der
// aktuellen Periode und – falls vorhanden – der Vergleichswert der Vorperiode,
// eindeutig beschriftet. Position wird vom Canvas gesetzt; pointer-events aus,
// damit das Crosshair stabil bleibt.

import { formatDate } from "@/lib/kpi/format";

export default function PerformanceTooltip({
  date,
  currentLabel,
  currentValue,
  previousDate,
  previousValue,
  left,
}: {
  date: string;
  currentLabel: string;
  currentValue: string;
  /** Kalendertag der Vorperiode, dem dieser Punkt gegenübersteht. */
  previousDate: string | null;
  previousValue: string | null;
  /** Horizontale Position in Prozent der Chartbreite. */
  left: number;
}) {
  return (
    <div className="kw-tip kw-ex-tip" style={{ left: `${left}%` }} role="presentation">
      <span className="kw-tip-date">{formatDate(date)}</span>
      <span className="kw-tip-row">
        <strong>{currentValue}</strong>
        <span>{currentLabel}</span>
      </span>
      {previousValue !== null && (
        <span className="kw-tip-row kw-ex-tip-prev">
          <strong>{previousValue}</strong>
          <span>Vorperiode{previousDate ? ` (${formatDate(previousDate)})` : ""}</span>
        </span>
      )}
    </div>
  );
}
