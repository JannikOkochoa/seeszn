"use client";

// ─── KPI-Detail-Drawer ────────────────────────────────────────────────────────
// Der große Arbeitsbereich zum primären KPI, vollständig auf echten
// Search-Console-Exporten: Kopf mit Kernwerten (Klicks, Impressionen, CTR,
// gewichtete Ø Position, Vergleich mit absoluten Werten), Zeitverlauf aus
// Chart.csv, Scope-Vergleich, aggregierte Dimensionstabellen mit explizitem
// Exportzeitraum sowie Ziel, Annotationen und verknüpfte Maßnahmen.

import { useEffect, useState } from "react";
import Drawer from "./Drawer";
import KpiTimeSeries from "./KpiTimeSeries";
import AnnotationsPanel from "./AnnotationsPanel";
import DimensionTable from "./DimensionTable";
import SourceProvenance from "./SourceProvenance";
import {
  APPROVAL_STATUS_LABEL,
  GSC_DIMENSION_LABEL,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type GscDimensionType,
} from "@/lib/kpi/types";
import { COCKPIT_RANGES, cockpitRangeLabel } from "@/lib/kpi/gscData";
import { displayName, formatDate, formatDelta, formatNumber, formatPercent } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

const DIMENSION_SECTIONS: Array<{ type: GscDimensionType; searchable: boolean }> = [
  { type: "query", searchable: true },
  { type: "page", searchable: true },
  { type: "device", searchable: false },
  { type: "country", searchable: true },
  { type: "search_appearance", searchable: false },
];

export default function KpiDetailDrawer() {
  const {
    kpi,
    kpiDrawerOpen,
    setKpiDrawerOpen,
    profiles,
    range,
    setRange,
    hasRealData,
    activeScope,
    gscTotals,
    gscComparison,
    gscProvenance,
    scopeBreakdown,
    dimensionsByBatch,
    loadDimensions,
    activeTarget,
    activeTaskCount,
    canWrite,
    canEditTarget,
    openCreate,
    series,
    previousSeries,
    targetLine,
    annotations,
    currentRange,
    kpiTasks,
    latestApprovalByTask,
    setTaskDrawerId,
    setNewTarget,
    anchor,
  } = useWorkspace();

  const [annotationFocus, setAnnotationFocus] = useState<string | null>(null);
  const [targetEditing, setTargetEditing] = useState(false);
  const [targetValue, setTargetValue] = useState("");
  const [targetError, setTargetError] = useState<string | null>(null);
  const [targetSaving, setTargetSaving] = useState(false);

  // Dimensions-Snapshots des aktiven Scopes lazy laden, sobald der Drawer
  // offen ist (aggregierte Exportwerte, unabhängig vom Tage-Filter).
  const batchId = activeScope?.batchId ?? null;
  useEffect(() => {
    if (kpiDrawerOpen && batchId) void loadDimensions(batchId);
  }, [kpiDrawerOpen, batchId, loadDimensions]);

  if (!kpi) return null;

  const owner = profiles.find((p) => p.id === kpi.owner_id);
  const annotationsInCurrentRange = annotations.filter(
    (a) => a.date >= currentRange.from && a.date <= currentRange.to,
  );
  const dimensionRows = batchId ? dimensionsByBatch.get(batchId) : undefined;

  async function saveTarget() {
    const value = Number(targetValue.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setTargetError("Bitte einen Zielwert größer 0 angeben.");
      return;
    }
    setTargetSaving(true);
    setTargetError(null);
    const result = await setNewTarget(value, anchor);
    setTargetSaving(false);
    if (!result.ok) {
      setTargetError(result.message);
      return;
    }
    setTargetEditing(false);
  }

  return (
    <Drawer
      open={kpiDrawerOpen}
      onClose={() => setKpiDrawerOpen(false)}
      wide
      title={
        <div>
          <span className="kr-eyebrow">Primärer KPI · Google Search Console Export</span>
          <span className="kw-drawer-name">{kpi.name}</span>
        </div>
      }
    >
      {!hasRealData || !gscTotals ? (
        <section className="kw-dsection kw-dsection--head" aria-label="Kein Datensatz">
          <p className="kr-meta kw-empty-block">
            Noch keine Datenquelle verbunden. Sobald SEESZN einen Search-Console-Export importiert
            hat, erscheinen hier echte Werte.
          </p>
        </section>
      ) : (
        <>
          {/* A · Kopf */}
          <section className="kw-dsection kw-dsection--head" aria-label="Kernwerte">
            <div className="kw-dhead-grid">
              <div>
                <span className="kr-eyebrow">Klicks · {cockpitRangeLabel(range)}</span>
                <span className="kw-dhead-value">{formatNumber(gscTotals.clicks)}</span>
                <span className="kr-meta">
                  {gscComparison ? (
                    <>
                      {gscComparison.comparisonLabel}
                      {gscComparison.clicksDeltaPct !== null && !gscComparison.lowBase && (
                        <>
                          {" "}
                          <span
                            className="kw-delta"
                            data-dir={(gscComparison.clicksDeltaPct ?? 0) >= 0 ? "up" : "down"}
                          >
                            ({formatDelta(gscComparison.clicksDeltaPct)})
                          </span>
                        </>
                      )}
                      {gscComparison.lowBase && " · Vorperiode zu klein für belastbare Prozentwerte"}
                    </>
                  ) : (
                    "Gesamter verfügbarer Zeitraum, ohne Vorperiodenvergleich"
                  )}
                </span>
              </div>
              <div>
                <span className="kr-eyebrow">Impressionen</span>
                <span className="kw-dhead-mid">{formatNumber(gscTotals.impressions)}</span>
                <span className="kr-meta">
                  {gscComparison
                    ? `Vorperiode ${formatNumber(gscComparison.previous.impressions)}`
                    : "Summe über den Gesamtzeitraum"}
                </span>
              </div>
              <div>
                <span className="kr-eyebrow">CTR · Ø Position</span>
                <span className="kw-dhead-mid">
                  {gscTotals.ctr !== null ? formatPercent(gscTotals.ctr * 100) : "–"}
                  {" · "}
                  {gscTotals.position !== null ? formatNumber(gscTotals.position, 1) : "–"}
                </span>
                <span className="kr-meta">Position mit Impressionen gewichtet, aus Tageswerten</span>
              </div>
              <div>
                <span className="kr-eyebrow">Ziel</span>
                {targetEditing ? (
                  <div className="kw-target-edit">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="kw-input kw-input--target"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      aria-label="Neuer Zielwert, Klicks pro Tag"
                      data-autofocus
                    />
                    <span className="kr-meta">Klicks pro Tag, gültig ab {formatDate(anchor)}</span>
                    {targetError && (
                      <span className="kw-form-error" role="alert">
                        {targetError}
                      </span>
                    )}
                    <span className="kw-form-actions">
                      <button
                        type="button"
                        className="kw-link"
                        onClick={() => void saveTarget()}
                        disabled={targetSaving}
                      >
                        {targetSaving ? "Wird gespeichert…" : "Ziel speichern"}
                      </button>
                      <button type="button" className="kw-link" onClick={() => setTargetEditing(false)}>
                        Abbrechen
                      </button>
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="kw-dhead-mid">
                      {activeTarget ? formatNumber(Number(activeTarget.target_value)) : "–"}
                    </span>
                    <span className="kr-meta">
                      {activeTarget ? "Klicks pro Tag · manuell gepflegt" : "Kein aktives Ziel"}
                      {canEditTarget && (
                        <>
                          {" · "}
                          <button
                            type="button"
                            className="kw-link"
                            onClick={() => {
                              setTargetValue(activeTarget ? String(activeTarget.target_value) : "");
                              setTargetEditing(true);
                            }}
                          >
                            {activeTarget ? "anpassen" : "Ziel festlegen"}
                          </button>
                        </>
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="kw-dhead-foot">
              <SourceProvenance
                source="Google Search Console Export"
                scope={activeScope?.label}
                periodStart={gscProvenance?.periodStart}
                periodEnd={gscProvenance?.periodEnd}
                dataAsOf={gscProvenance?.dataAsOf}
                importedAt={gscProvenance?.importedAt}
              />
              {canWrite && (
                <button type="button" className="kr-btn" onClick={() => openCreate({ source: "kpi" })}>
                  Maßnahme erstellen
                </button>
              )}
            </div>
            <p className="kr-meta kw-props-hint">
              Owner: {owner ? displayName(owner) : "nicht zugewiesen"} ·{" "}
              {activeTaskCount === 1 ? "1 aktive Maßnahme" : `${activeTaskCount} aktive Maßnahmen`}
            </p>
          </section>

          {/* B · Zeitverlauf (tägliche Werte aus Chart.csv) */}
          <section className="kw-dsection" aria-label="Zeitverlauf">
            <div className="kw-dsection-head">
              <h3 className="kw-dsection-title">Zeitverlauf</h3>
              <div className="kw-bar-group" role="group" aria-label="Zeitraum im Diagramm">
                {COCKPIT_RANGES.map((r) => (
                  <button
                    key={String(r)}
                    type="button"
                    className="kw-chip"
                    data-active={range === r || undefined}
                    aria-pressed={range === r}
                    onClick={() => setRange(r)}
                  >
                    {cockpitRangeLabel(r)}
                  </button>
                ))}
              </div>
            </div>
            <KpiTimeSeries
              series={series}
              previousSeries={previousSeries}
              targetLine={targetLine}
              annotations={annotationsInCurrentRange}
              isFiltered={false}
              onAnnotationOpen={(a) => setAnnotationFocus(a.id)}
            />
            <AnnotationsPanel focusId={annotationFocus} onFocusHandled={() => setAnnotationFocus(null)} />
          </section>

          {/* C · Scope-Vergleich (je Scope am eigenen Datenstand, gleiche Tageszahl) */}
          {scopeBreakdown.length > 1 && (
            <section className="kw-dsection" aria-label="Scope-Vergleich">
              <div className="kw-dsection-head">
                <h3 className="kw-dsection-title">Scopes im Vergleich · {cockpitRangeLabel(range)}</h3>
              </div>
              <div className="kw-table-wrap">
                <table className="kw-table">
                  <thead>
                    <tr>
                      <th className="kw-th">Scope</th>
                      <th className="kw-th kw-th--num">Klicks</th>
                      <th className="kw-th kw-th--num">Vorperiode</th>
                      <th className="kw-th kw-th--num">Veränderung</th>
                      <th className="kw-th kw-th--num">Impressionen</th>
                      <th className="kw-th kw-th--num">CTR</th>
                      <th className="kw-th kw-th--num">Ø Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopeBreakdown.map(({ option, totals, comparison }) => (
                      <tr key={option.key} className="kw-tr">
                        <td className="kw-td kw-td--name">{option.label}</td>
                        <td className="kw-td kw-td--num">{formatNumber(totals.clicks)}</td>
                        <td className="kw-td kw-td--num">
                          {comparison ? formatNumber(comparison.previous.clicks) : "–"}
                        </td>
                        <td className="kw-td kw-td--num">
                          {comparison
                            ? comparison.lowBase
                              ? comparison.comparisonLabel
                              : formatDelta(comparison.clicksDeltaPct)
                            : "–"}
                        </td>
                        <td className="kw-td kw-td--num">{formatNumber(totals.impressions)}</td>
                        <td className="kw-td kw-td--num">
                          {totals.ctr !== null ? formatPercent(totals.ctr * 100) : "–"}
                        </td>
                        <td className="kw-td kw-td--num">
                          {totals.position !== null ? formatNumber(totals.position, 1) : "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="kr-meta kw-chart-note">
                Berechnet aus den täglichen Exportwerten je Scope; Prozentwerte entfallen bei sehr
                kleiner Vorperiode zugunsten des absoluten Vergleichs.
              </p>
            </section>
          )}

          {/* D · Dimensionen (Aggregate über den gesamten Exportzeitraum) */}
          {DIMENSION_SECTIONS.map(({ type, searchable }) => (
            <section key={type} className="kw-dsection" aria-label={GSC_DIMENSION_LABEL[type]}>
              <div className="kw-dsection-head">
                <h3 className="kw-dsection-title">{GSC_DIMENSION_LABEL[type]}</h3>
              </div>
              {dimensionRows === undefined ? (
                <p className="kr-meta">Werte werden geladen…</p>
              ) : (
                <>
                  <DimensionTable rows={dimensionRows} dimensionType={type} searchable={searchable} />
                  {type === "query" && (
                    <p className="kr-meta kw-chart-note">
                      Google lässt anonymisierte und sehr seltene Suchanfragen aus; die Summe der
                      Zeilen entspricht deshalb nicht exakt der Gesamtzahl der Klicks.
                    </p>
                  )}
                </>
              )}
            </section>
          ))}

          {/* E · Verknüpfte Maßnahmen */}
          <section className="kw-dsection kw-dsection--last" aria-label="Verknüpfte Maßnahmen">
            <div className="kw-dsection-head">
              <h3 className="kw-dsection-title">Verknüpfte Maßnahmen</h3>
            </div>
            {kpiTasks.length === 0 ? (
              <p className="kr-meta kw-empty">Noch keine Maßnahmen mit diesem KPI verknüpft.</p>
            ) : (
              <ul className="kw-linked-tasks">
                {kpiTasks.map((t) => {
                  const taskOwner = profiles.find((p) => p.id === t.owner_id);
                  const latest = latestApprovalByTask.get(t.id);
                  const insight = t.insight_context;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        className="kw-task-open"
                        onClick={() => setTaskDrawerId(t.id)}
                        disabled={t.id.startsWith("temp-")}
                      >
                        <span className="kw-task-title">{t.title}</span>
                        <span className="kw-task-meta">
                          <span>{TASK_STATUS_LABEL[t.status]}</span>
                          <span className="kw-task-sep" aria-hidden="true">
                            ·
                          </span>
                          <span>{taskOwner ? displayName(taskOwner) : "Nicht zugewiesen"}</span>
                          <span className="kw-task-sep" aria-hidden="true">
                            ·
                          </span>
                          <span>Priorität {TASK_PRIORITY_LABEL[t.priority].toLowerCase()}</span>
                          {insight?.expectedImpact && (
                            <>
                              <span className="kw-task-sep" aria-hidden="true">
                                ·
                              </span>
                              <span>Impact {insight.expectedImpact}</span>
                            </>
                          )}
                          {t.due_date && (
                            <>
                              <span className="kw-task-sep" aria-hidden="true">
                                ·
                              </span>
                              <span>Fällig {formatDate(t.due_date)}</span>
                            </>
                          )}
                          {latest && (
                            <>
                              <span className="kw-task-sep" aria-hidden="true">
                                ·
                              </span>
                              <span>{APPROVAL_STATUS_LABEL[latest.status]}</span>
                            </>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </Drawer>
  );
}
