"use client";

// ─── Primärer KPI ─────────────────────────────────────────────────────────────
// „Organische Klicks auf Produktseiten“ als wichtigster Steuerungswert: großer
// Serif-Wert, feine Meta-Zeilen, keine bunte Dashboard-Karte. Öffnet den
// Detail-Drawer.

import { displayName, formatDate, formatDelta, formatNumber } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

export default function PrimaryKpiPanel() {
  const {
    kpi,
    profiles,
    latestSnapshot,
    currentSum,
    periodDeltaPct,
    activeTarget,
    progressPct,
    days,
    activeTaskCount,
    dataSource,
    setKpiDrawerOpen,
    checkingFreshness,
  } = useWorkspace();

  if (!kpi) {
    return (
      <div className="kw-primary kw-primary--empty">
        <p className="kr-meta">
          Für diesen Raum ist noch kein KPI eingerichtet. SEESZN richtet die Messung ein.
        </p>
      </div>
    );
  }

  const owner = profiles.find((p) => p.id === kpi.owner_id);
  const loading = checkingFreshness && latestSnapshot === null;
  const status =
    progressPct === null ? null : progressPct >= 100 ? "Auf Kurs" : progressPct >= 85 ? "Nah am Ziel" : "Unter Ziel";

  return (
    <button
      type="button"
      className="kw-primary"
      onClick={() => setKpiDrawerOpen(true)}
      aria-haspopup="dialog"
      aria-label={`${kpi.name} öffnen: Details, Verlauf, Seiten und Maßnahmen`}
    >
      <div className="kw-primary-head">
        <span className="kr-eyebrow">Primärer KPI · Google Search Console</span>
        <span className="kw-primary-open" aria-hidden="true">
          Details öffnen →
        </span>
      </div>

      <h3 className="kw-primary-name">{kpi.name}</h3>

      <div className="kw-primary-grid">
        <div className="kw-primary-value-block">
          {loading ? (
            <span className="kw-primary-value kw-skeleton" aria-hidden="true">
              &nbsp;
            </span>
          ) : latestSnapshot ? (
            <>
              <span className="kw-primary-value">{formatNumber(latestSnapshot.value)}</span>
              <span className="kr-meta">
                Klicks am {formatDate(latestSnapshot.date)} · neuester Tageswert
              </span>
            </>
          ) : (
            <>
              <span className="kw-primary-value kw-primary-value--empty">–</span>
              <span className="kr-meta">Noch keine Werte. Nach dem ersten Sync erscheinen hier Daten.</span>
            </>
          )}
        </div>

        <dl className="kw-primary-meta">
          <div>
            <dt className="kr-eyebrow">{days} Tage gesamt</dt>
            <dd>
              {formatNumber(currentSum)} Klicks{" "}
              <span className="kw-delta" data-dir={periodDeltaPct === null ? undefined : periodDeltaPct >= 0 ? "up" : "down"}>
                {formatDelta(periodDeltaPct)} zur Vorperiode
              </span>
            </dd>
          </div>
          <div>
            <dt className="kr-eyebrow">Ziel</dt>
            <dd>
              {activeTarget ? (
                <>
                  {formatNumber(Number(activeTarget.target_value))} Klicks pro Tag
                  {progressPct !== null && (
                    <span className="kw-delta"> · {formatNumber(progressPct)} % erreicht</span>
                  )}
                </>
              ) : (
                <span className="kw-muted">Kein aktives Ziel definiert</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="kr-eyebrow">Owner</dt>
            <dd>{owner ? displayName(owner) : <span className="kw-muted">Nicht zugewiesen</span>}</dd>
          </div>
          <div>
            <dt className="kr-eyebrow">Maßnahmen</dt>
            <dd>
              {activeTaskCount === 0 ? (
                <span className="kw-muted">Keine aktiven Maßnahmen</span>
              ) : (
                `${activeTaskCount} aktiv`
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="kw-primary-foot">
        {status && (
          <span className="kr-status" data-state={status === "Auf Kurs" ? "done" : "open"}>
            <i className="olive-dot" aria-hidden="true" />
            {status}
          </span>
        )}
        <span className="kr-meta">
          {dataSource?.data_available_until
            ? `Datenstand ${formatDate(dataSource.data_available_until)}`
            : "Datenstand offen"}
        </span>
      </div>
    </button>
  );
}
