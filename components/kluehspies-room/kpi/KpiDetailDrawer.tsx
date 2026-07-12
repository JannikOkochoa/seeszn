"use client";

// ─── KPI-Detail-Drawer ────────────────────────────────────────────────────────
// Der große Arbeitsbereich zum primären KPI: Kopf mit Kernwerten, Zeitverlauf
// mit Ziel und Annotationen, Produktseiten, Gewinner/Verlierer, Suchanfragen
// und verknüpfte Maßnahmen. Der Nutzer bleibt dabei auf der Seite.

import { useState } from "react";
import Drawer from "./Drawer";
import KpiTimeSeries from "./KpiTimeSeries";
import KpiBreakdownTable from "./KpiBreakdownTable";
import KpiWinnersLosers from "./KpiWinnersLosers";
import QueryPerformanceTable from "./QueryPerformanceTable";
import AnnotationsPanel from "./AnnotationsPanel";
import { SyncStatus } from "./KpiControlBar";
import {
  APPROVAL_STATUS_LABEL,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
} from "@/lib/kpi/types";
import { displayName, formatDate, formatDelta, formatNumber } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

export default function KpiDetailDrawer() {
  const {
    kpi,
    kpiDrawerOpen,
    setKpiDrawerOpen,
    profiles,
    latestSnapshot,
    currentSum,
    periodDeltaPct,
    activeTarget,
    days,
    setDays,
    activeTaskCount,
    dataSource,
    canWrite,
    canEditTarget,
    openCreate,
    series,
    previousSeries,
    targetLine,
    annotations,
    currentRange,
    isFiltered,
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

  if (!kpi) return null;

  const owner = profiles.find((p) => p.id === kpi.owner_id);
  const annotationsInCurrentRange = annotations.filter(
    (a) => a.date >= currentRange.from && a.date <= currentRange.to,
  );

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
          <span className="kr-eyebrow">Primärer KPI · Google Search Console</span>
          <span className="kw-drawer-name">{kpi.name}</span>
        </div>
      }
    >
      {/* A · Kopf */}
      <section className="kw-dsection kw-dsection--head" aria-label="Kernwerte">
        <div className="kw-dhead-grid">
          <div>
            <span className="kr-eyebrow">Neuester Tageswert</span>
            <span className="kw-dhead-value">
              {latestSnapshot ? formatNumber(latestSnapshot.value) : "–"}
            </span>
            <span className="kr-meta">
              {latestSnapshot ? `am ${formatDate(latestSnapshot.date)}` : "Noch keine Werte"}
            </span>
          </div>
          <div>
            <span className="kr-eyebrow">{days} Tage</span>
            <span className="kw-dhead-mid">{formatNumber(currentSum)}</span>
            <span className="kw-delta" data-dir={(periodDeltaPct ?? 0) >= 0 ? "up" : "down"}>
              {formatDelta(periodDeltaPct)} zur Vorperiode
            </span>
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
                  <button type="button" className="kw-link" onClick={() => void saveTarget()} disabled={targetSaving}>
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
                  {activeTarget ? "Klicks pro Tag" : "Kein aktives Ziel"}
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
          <div>
            <span className="kr-eyebrow">Owner</span>
            <span className="kw-dhead-mid kw-dhead-mid--text">
              {owner ? displayName(owner) : "Nicht zugewiesen"}
            </span>
            <span className="kr-meta">
              {activeTaskCount === 1 ? "1 aktive Maßnahme" : `${activeTaskCount} aktive Maßnahmen`}
            </span>
          </div>
        </div>
        <div className="kw-dhead-foot">
          <SyncStatus />
          <span className="kr-meta">
            {dataSource?.data_available_until
              ? `Datenstand ${formatDate(dataSource.data_available_until)}`
              : "Datenstand offen"}
          </span>
          {canWrite && (
            <button
              type="button"
              className="kr-btn"
              onClick={() => openCreate({ source: "kpi" })}
            >
              Maßnahme erstellen
            </button>
          )}
        </div>
      </section>

      {/* B · Zeitverlauf */}
      <section className="kw-dsection" aria-label="Zeitverlauf">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Zeitverlauf</h3>
          <div className="kw-bar-group" role="group" aria-label="Zeitraum im Diagramm">
            {([7, 28, 90] as const).map((r) => (
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
        </div>
        <KpiTimeSeries
          series={series}
          previousSeries={previousSeries}
          targetLine={targetLine}
          annotations={annotationsInCurrentRange}
          isFiltered={isFiltered}
          onAnnotationOpen={(a) => setAnnotationFocus(a.id)}
        />
        <AnnotationsPanel focusId={annotationFocus} onFocusHandled={() => setAnnotationFocus(null)} />
      </section>

      {/* C · Produktseiten */}
      <section className="kw-dsection" aria-label="Produktseiten">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Produktseiten</h3>
        </div>
        <KpiBreakdownTable />
      </section>

      {/* D · Gewinner und Verlierer */}
      <section className="kw-dsection" aria-label="Gewinner und Verlierer">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Gewinner und Verlierer</h3>
        </div>
        <KpiWinnersLosers />
      </section>

      {/* E · Suchanfragen */}
      <section className="kw-dsection" aria-label="Suchanfragen">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Suchanfragen</h3>
        </div>
        <QueryPerformanceTable />
      </section>

      {/* F · Verknüpfte Maßnahmen */}
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
                      {insight?.estimatedEffort && (
                        <>
                          <span className="kw-task-sep" aria-hidden="true">
                            ·
                          </span>
                          <span>Aufwand {insight.estimatedEffort}</span>
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
    </Drawer>
  );
}
