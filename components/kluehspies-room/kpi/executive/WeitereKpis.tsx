"use client";

// ─── Weitere KPIs (nutzererstellte, eigene KPIs) ──────────────────────────────
// Kompakter sekundärer Bereich: pro eigenem KPI Ist-Wert, Name, Ziel, Zeitraum,
// Status, Owner, Quelle und die Aktionen „Wert aktualisieren" / „Ziel
// bearbeiten". Die vier Haupt-KPIs bleiben unberührt und dominant. Keine große
// Kartenlandschaft, keine zusätzlichen Charts.

import { useMemo, useState } from "react";
import {
  computeGoalStatus,
  resolveActiveGoal,
  resolveKpiSpec,
  formatGoalPeriod,
} from "@/lib/kpi/goals";
import { isoWeekKey } from "@/lib/kpi/operational";
import { displayName } from "@/lib/kpi/format";
import type { KpiDefinitionRow, ManualCheckInRow } from "@/lib/kpi/types";
import { useWorkspace } from "../workspace";

function currentValue(
  checkIns: ManualCheckInRow[],
  kpiId: string,
  periodType: string,
  todayIso: string,
): number | null {
  const wanted =
    periodType === "calendar_week"
      ? isoWeekKey(todayIso)
      : periodType === "calendar_month"
        ? todayIso.slice(0, 7)
        : null;
  const rows = checkIns
    .filter((c) => c.kpi_definition_id === kpiId && (wanted === null || c.period_key === wanted))
    .sort((a, b) => b.measured_at.localeCompare(a.measured_at) || b.created_at.localeCompare(a.created_at));
  return rows[0] ? Number(rows[0].value) : null;
}

function ValueForm({ def, onDone }: { def: KpiDefinitionRow; onDone: () => void }) {
  const { recordCustomCheckIn } = useWorkspace();
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const num = Number(value.replace(",", "."));
    if (!Number.isFinite(num) || num < 0) {
      setError("Bitte einen gültigen Wert angeben.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await recordCustomCheckIn(def.id, num, note.trim() || null);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onDone();
  }

  return (
    <div className="kw-form kw-form--inline">
      <div className="kw-form-row">
        <label className="kw-field">
          <span className="kr-eyebrow">Aktueller Wert</span>
          <input
            type="text"
            inputMode="decimal"
            className="kw-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-autofocus
          />
        </label>
        <label className="kw-field">
          <span className="kr-eyebrow">Notiz (optional)</span>
          <input type="text" className="kw-input" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
      {error && (
        <p className="kw-form-error" role="alert">
          {error}
        </p>
      )}
      <div className="kw-form-actions">
        <button type="button" className="kr-btn" onClick={() => void submit()} disabled={saving}>
          {saving ? "Wird gespeichert…" : "Wert speichern"}
        </button>
        <button type="button" className="kw-link" onClick={onDone} disabled={saving}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

export default function WeitereKpis() {
  const { manualKpis, manualCheckIns, goalVersions, profiles, viewer, canEditTarget, openGoalDrawer } =
    useWorkspace();
  const [editingId, setEditingId] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const customKpis = useMemo(
    () => manualKpis.filter((d) => d.kind === "custom_manual" && !d.archived_at),
    [manualKpis],
  );

  if (customKpis.length === 0) return null;

  return (
    <section className="kw-ex-more" aria-label="Weitere KPIs">
      <p className="kr-eyebrow kw-ex-panel-label">Weitere KPIs</p>
      <ul className="kw-ex-more-list">
        {customKpis.map((def) => {
          const spec = resolveKpiSpec(def);
          const goal = resolveActiveGoal(goalVersions, { kpiDefinitionId: def.id });
          const actual = goal ? currentValue(manualCheckIns, def.id, goal.period_type, today) : null;
          const status =
            spec && goal
              ? computeGoalStatus(
                  actual,
                  { targetValue: Number(goal.target_value), comparator: goal.comparator },
                  spec,
                  { hasEnoughData: actual !== null },
                )
              : null;
          const owner = def.owner_id ? profiles.find((p) => p.id === def.owner_id) : undefined;
          const canEdit = canEditTarget || def.created_by === viewer.id || def.owner_id === viewer.id;

          return (
            <li key={def.id} className="kw-ex-more-item">
              {editingId === def.id ? (
                <ValueForm def={def} onDone={() => setEditingId(null)} />
              ) : (
                <>
                  <div className="kw-ex-more-head">
                    <span className="kw-ex-more-value">
                      {actual === null ? "Noch nicht erfasst" : spec ? spec.formatValue(actual) : actual}
                      {actual !== null && spec?.unitLabel ? ` ${spec.unitLabel}` : ""}
                    </span>
                    <span className="kw-ex-more-name">{def.name}</span>
                    <span className="kw-ex-more-tag">Eigener KPI</span>
                  </div>
                  <p className="kr-meta kw-ex-more-meta">
                    {goal
                      ? `Ziel ${spec ? spec.formatValue(Number(goal.target_value)) : goal.target_value} · ${formatGoalPeriod(goal.period_type, goal.period_days)}`
                      : "Noch kein Ziel festgelegt"}
                    {status && (
                      <>
                        {" · "}
                        <span data-status={status.statusKey}>{status.statusLabel}</span>
                      </>
                    )}
                    {" · "}
                    Owner {owner ? displayName(owner) : "Noch nicht zugewiesen"} · Manuell gepflegt
                  </p>
                  {canEdit && (
                    <div className="kw-ex-more-actions">
                      <button type="button" className="kw-link" onClick={() => setEditingId(def.id)}>
                        Wert aktualisieren
                      </button>
                      <button type="button" className="kw-link" onClick={() => openGoalDrawer(def.id)}>
                        Ziel bearbeiten
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
