"use client";

// ─── KPI-Steuerleiste ─────────────────────────────────────────────────────────
// Eine ruhige Zeile über den Zahlen: Zeitraum (7/28/90 Tage), Scope
// (alle Städtereisen oder eine einzelne Produktseite) und der Datenstand des
// aktiven GSC-Exports. Es gibt keinen Demo-Sync mehr: Daten kommen
// ausschließlich aus importierten Search-Console-Exporten.

import { formatDate, formatDateTime } from "@/lib/kpi/format";
import type { RangeDays } from "@/lib/kpi/aggregate";
import { useWorkspace } from "./workspace";

const RANGES: RangeDays[] = [7, 28, 90];

export function DataStatus() {
  const { hasRealData, gscProvenance, realtime } = useWorkspace();

  return (
    <span className="kw-sync" data-state={hasRealData ? "ok" : "checking"} role="status">
      <i className="olive-dot" aria-hidden="true" />
      <span>
        {hasRealData && gscProvenance?.dataAsOf
          ? `Daten aktuell bis ${formatDate(gscProvenance.dataAsOf)}`
          : "Noch keine Datenquelle verbunden"}
      </span>
      {realtime === "live" && (
        <span
          className="kw-sync-rt"
          title="Aufgaben, Kommentare und Freigaben werden zwischen allen angemeldeten Personen live synchronisiert."
        >
          · interne Änderungen live synchronisiert
        </span>
      )}
      {realtime === "offline" && (
        <span className="kw-sync-rt kw-sync-rt--off">· Live-Verbindung getrennt, Anzeige ggf. verzögert</span>
      )}
    </span>
  );
}

export default function KpiControlBar() {
  const {
    days,
    setDays,
    scopeKey,
    setScopeKey,
    scopeOptions,
    hasRealData,
    gscProvenance,
    currentRange,
    previousRange,
  } = useWorkspace();

  return (
    <div className="kw-bar">
      <div className="kw-bar-row">
        <div className="kw-bar-group" role="group" aria-label="Zeitraum">
          <span className="kw-bar-label">Zeitraum</span>
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className="kw-chip"
              data-active={days === r || undefined}
              aria-pressed={days === r}
              onClick={() => setDays(r)}
            >
              {r} Tage
            </button>
          ))}
        </div>

        {scopeOptions.length > 0 && (
          <div className="kw-bar-group">
            <label className="kw-bar-label" htmlFor="kw-scope">
              Scope
            </label>
            <select
              id="kw-scope"
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

        <div className="kw-bar-spacer" />

        <div className="kw-bar-group kw-bar-group--sync">
          <DataStatus />
        </div>
      </div>

      {hasRealData ? (
        <p className="kw-bar-meta">
          {formatDate(currentRange.from)} bis {formatDate(currentRange.to)} · Vergleich: Vorperiode{" "}
          {formatDate(previousRange.from)} bis {formatDate(previousRange.to)}
          {" · Quelle: Google Search Console Export"}
          {gscProvenance?.importedAt && <> · importiert am {formatDateTime(gscProvenance.importedAt)}</>}
        </p>
      ) : (
        <p className="kw-bar-meta">
          Sobald SEESZN einen Search-Console-Export importiert hat, erscheinen hier echte Werte mit
          Zeitraum, Scope und Datenstand.
        </p>
      )}
    </div>
  );
}
