"use client";

// ─── Performance Controls ─────────────────────────────────────────────────────
// Steuerzeile des Performance Canvas: eine Hauptmetrik (Klicks, Impressionen,
// CTR, Position), Zeitraum (7/28/90/gesamt) und Scope. Ruhige Chips und ein
// schlichtes Select – keine Doppelachsen, immer genau eine Metrik.

import { COCKPIT_RANGES, cockpitRangeLabel, type CanvasMetric } from "@/lib/kpi/gscData";
import { useWorkspace } from "../workspace";

export const METRIC_LABEL: Record<CanvasMetric, string> = {
  clicks: "Klicks",
  impressions: "Impressionen",
  ctr: "CTR",
  position: "Position",
};

export default function PerformanceControls({
  metric,
  onMetricChange,
}: {
  metric: CanvasMetric;
  onMetricChange: (metric: CanvasMetric) => void;
}) {
  const { range, setRange, scopeKey, setScopeKey, scopeOptions } = useWorkspace();

  return (
    <div className="kw-ex-controls">
      <div className="kw-bar-group" role="group" aria-label="Metrik">
        {(Object.keys(METRIC_LABEL) as CanvasMetric[]).map((key) => (
          <button
            key={key}
            type="button"
            className="kw-chip"
            data-active={metric === key || undefined}
            aria-pressed={metric === key}
            onClick={() => onMetricChange(key)}
          >
            {METRIC_LABEL[key]}
          </button>
        ))}
      </div>

      <div className="kw-bar-group" role="group" aria-label="Zeitraum">
        {COCKPIT_RANGES.map((r) => (
          <button
            key={String(r)}
            type="button"
            className="kw-chip"
            data-active={range === r || undefined}
            aria-pressed={range === r}
            onClick={() => setRange(r)}
          >
            {r === "all" ? "Gesamt" : cockpitRangeLabel(r)}
          </button>
        ))}
      </div>

      {scopeOptions.length > 0 && (
        <div className="kw-bar-group">
          <label className="kw-bar-label" htmlFor="kw-ex-scope">
            Scope
          </label>
          <select
            id="kw-ex-scope"
            className="kw-select"
            value={scopeKey ?? ""}
            onChange={(e) => setScopeKey(e.target.value)}
          >
            {scopeOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
