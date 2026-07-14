"use client";

// ─── Performance Tooltip ──────────────────────────────────────────────────────
// Präziser, ruhiger Tooltip für den Performance Canvas: die Metrik als leise
// Überschrift, dann klar getrennt der Wert der aktuellen Periode (führend) und
// – falls vorhanden – der Vergleichswert der Vorperiode. Bei Position sagt ein
// kurzer Hinweis, was besser ist. Position wird vom Canvas gesetzt;
// pointer-events aus, damit das Crosshair stabil bleibt.

import { formatDate } from "@/lib/kpi/format";

export default function PerformanceTooltip({
  date,
  currentLabel,
  currentValue,
  previousDate,
  previousValue,
  hint,
  left,
}: {
  date: string;
  currentLabel: string;
  currentValue: string;
  /** Kalendertag der Vorperiode, dem dieser Punkt gegenübersteht. */
  previousDate: string | null;
  previousValue: string | null;
  /** Kurzer Hinweis, was besser ist (z. B. bei Position). */
  hint?: string | null;
  /** Horizontale Position in Prozent der Chartbreite. */
  left: number;
}) {
  return (
    <div className="kw-tip kw-ex-tip" style={{ left: `${left}%` }} role="presentation">
      <span className="kw-tip-metric">{currentLabel}</span>
      <span className="kw-tip-date">{formatDate(date)}</span>

      <span className="kw-tip-row kw-tip-row--cur">
        <strong className="kw-tip-value">{currentValue}</strong>
        <span className="kw-tip-period">Aktuelle Periode</span>
      </span>

      {previousValue !== null && (
        <span className="kw-tip-row kw-tip-row--prev">
          <span className="kw-tip-value">{previousValue}</span>
          <span className="kw-tip-period">
            Vorperiode{previousDate ? ` · ${formatDate(previousDate)}` : ""}
          </span>
        </span>
      )}

      {hint && <span className="kw-tip-hint">{hint}</span>}
    </div>
  );
}
