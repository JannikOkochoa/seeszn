"use client";

// ─── Primärer KPI ─────────────────────────────────────────────────────────────
// „Organische Klicks auf Städtereise-Produktseiten“ als wichtigster
// Steuerungswert, berechnet ausschließlich aus dem aktiven Search-Console-
// Export. Prozentveränderung immer zusammen mit den absoluten Werten
// („6 statt 2 Klicks“); bei sehr kleiner Vorperiode ohne Hervorhebung.
// Ohne aktiven Datensatz: ehrlicher Empty State statt Demo-Zahlen.

import { displayName, formatDate, formatDelta, formatNumber, formatPercent } from "@/lib/kpi/format";
import SourceProvenance from "./SourceProvenance";
import { useWorkspace } from "./workspace";

export default function PrimaryKpiPanel() {
  const {
    kpi,
    profiles,
    days,
    hasRealData,
    activeScope,
    gscComparison,
    gscProvenance,
    activeTaskCount,
    setKpiDrawerOpen,
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

  if (!hasRealData || !gscComparison) {
    return (
      <div className="kw-primary kw-primary--empty">
        <span className="kr-eyebrow">Primärer KPI</span>
        <h3 className="kw-primary-name">{kpi.name}</h3>
        <p className="kr-meta kw-primary-pending">
          Noch keine Datenquelle verbunden. Sobald SEESZN einen Search-Console-Export importiert
          hat, erscheinen hier echte Werte – ohne Demo- oder Platzhalterzahlen.
        </p>
      </div>
    );
  }

  const owner = profiles.find((p) => p.id === kpi.owner_id);
  const { current, previous, clicksDeltaPct, comparisonLabel, lowBase } = gscComparison;

  return (
    <button
      type="button"
      className="kw-primary"
      onClick={() => setKpiDrawerOpen(true)}
      aria-haspopup="dialog"
      aria-label={`${kpi.name} öffnen: Details, Verlauf und Maßnahmen`}
    >
      <div className="kw-primary-head">
        <span className="kr-eyebrow">Primärer KPI · Google Search Console Export</span>
        <span className="kw-primary-open" aria-hidden="true">
          Details öffnen →
        </span>
      </div>

      <h3 className="kw-primary-name">{kpi.name}</h3>

      <div className="kw-primary-grid">
        <div className="kw-primary-value-block">
          <span className="kw-primary-value">{formatNumber(current.clicks)}</span>
          <span className="kr-meta">
            Klicks in {days} Tagen · {activeScope?.label}
          </span>
          <span className="kw-delta" data-dir={lowBase ? undefined : (clicksDeltaPct ?? 0) >= 0 ? "up" : "down"}>
            {comparisonLabel}
            {clicksDeltaPct !== null && !lowBase && <> · {formatDelta(clicksDeltaPct)} zur Vorperiode</>}
            {lowBase && <> · Vorperiode zu klein für belastbare Prozentwerte</>}
          </span>
        </div>

        <dl className="kw-primary-meta">
          <div>
            <dt className="kr-eyebrow">Impressionen</dt>
            <dd>
              {formatNumber(current.impressions)}
              <span className="kw-delta"> · Vorperiode {formatNumber(previous.impressions)}</span>
            </dd>
          </div>
          <div>
            <dt className="kr-eyebrow">CTR · Ø Position</dt>
            <dd>
              {current.ctr !== null ? formatPercent(current.ctr * 100) : "–"}
              {" · "}
              {current.position !== null ? formatNumber(current.position, 1) : "–"}
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
        <SourceProvenance
          source="Google Search Console Export"
          scope={activeScope?.label}
          periodStart={gscProvenance?.periodStart}
          periodEnd={gscProvenance?.periodEnd}
          dataAsOf={gscProvenance?.dataAsOf}
          importedAt={gscProvenance?.importedAt}
        />
        <span className="kr-meta">
          Zeitraum: letzte {days} Tage bis {gscProvenance?.dataAsOf ? formatDate(gscProvenance.dataAsOf) : "–"}
        </span>
      </div>
    </button>
  );
}
