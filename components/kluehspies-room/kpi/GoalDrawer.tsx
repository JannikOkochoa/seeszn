"use client";

// ─── Ziel-Drawer (primäre Kennzahl) ───────────────────────────────────────────
// Ruhiges, radikal einfaches Zielformular für SEESZN Admin: Zielwert,
// Zielzeitraum, gültig ab, Owner, optionale Begründung. Einheit und Richtung
// kommen aus der fachlichen KPI-Spezifikation (lib/kpi/goals.ts) und sind NICHT
// editierbar; der Comparator wird aus der Richtung abgeleitet und nie angezeigt.
// Darunter der Zielverlauf (Historie) in lesbarer Form – keine rohe Audit- oder
// JSON-Tabelle. Speichern erzeugt eine neue Zielversion; die alte wird
// superseded (nie überschrieben).

import { useMemo, useState } from "react";
import Drawer from "./Drawer";
import OwnerPicker from "./OwnerPicker";
import {
  directionExplanation,
  formatGoalPeriod,
  resolveActiveGoal,
  specForMetricKey,
  type AllowedPeriod,
} from "@/lib/kpi/goals";
import { displayName, formatDate } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

function periodKey(p: AllowedPeriod): string {
  return `${p.periodType}:${p.periodDays ?? ""}`;
}

// Gate: mountet das Formular nur, wenn der Ziel-Drawer offen ist. So
// initialisiert sich das Formular bei jedem Öffnen frisch aus dem aktiven Ziel,
// ohne setState im Render.
export default function GoalDrawer() {
  const { goalDrawerOpen } = useWorkspace();
  if (!goalDrawerOpen) return null;
  return <GoalForm />;
}

function GoalForm() {
  const { kpi, goalVersions, setGoalDrawerOpen, profiles, setGoal, canEditTarget } = useWorkspace();

  const spec = kpi ? specForMetricKey(kpi.metric_key) : null;
  const today = new Date().toISOString().slice(0, 10);
  const allowed = spec?.allowedPeriods ?? [];

  // Aktives Ziel (irgendeine Periode) als Vorlage für das Formular.
  const active = kpi ? resolveActiveGoal(goalVersions, { kpiDefinitionId: kpi.id }) : null;

  const [value, setValue] = useState(active ? String(active.target_value) : "");
  const [periodSel, setPeriodSel] = useState(
    active
      ? periodKey({ periodType: active.period_type, periodDays: active.period_days, label: "" })
      : periodKey(allowed[Math.min(1, allowed.length - 1)] ?? allowed[0] ?? { periodType: "rolling_days", periodDays: 28, label: "" }),
  );
  const [effectiveFrom, setEffectiveFrom] = useState(today);
  const [ownerId, setOwnerId] = useState<string | null>(active?.owner_id ?? null);
  const [rationale, setRationale] = useState(active?.rationale ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Zielverlauf: alle Versionen dieser KPI, neueste zuerst.
  const history = useMemo(
    () =>
      kpi
        ? goalVersions
            .filter((g) => g.kpi_definition_id === kpi.id)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
        : [],
    [goalVersions, kpi],
  );

  if (!kpi || !spec || !canEditTarget) return null;

  const selectedPeriod = allowed.find((p) => periodKey(p) === periodSel) ?? allowed[0];

  async function submit() {
    if (!kpi || !spec || !selectedPeriod) return;
    const num = Number(value.replace(",", "."));
    if (!Number.isFinite(num) || num <= 0) {
      setError("Bitte einen Zielwert größer 0 angeben.");
      return;
    }
    if (!effectiveFrom) {
      setError("Bitte ein Startdatum wählen.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await setGoal({
      kpiDefinitionId: kpi.id,
      targetValue: num,
      periodType: selectedPeriod.periodType,
      periodDays: selectedPeriod.periodDays,
      comparator: spec.comparator,
      effectiveFrom,
      ownerId,
      rationale: rationale.trim() || null,
      kpiLabel: spec.label,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setGoalDrawerOpen(false);
  }

  return (
    <Drawer
      open
      onClose={() => setGoalDrawerOpen(false)}
      title={
        <div>
          <span className="kr-eyebrow">Ziel · {spec.label}</span>
          <span className="kw-drawer-name">{active ? "Ziel bearbeiten" : "Ziel festlegen"}</span>
        </div>
      }
    >
      <section className="kw-dsection kw-dsection--head" aria-label="Ziel festlegen">
        <div className="kw-form">
          <div className="kw-form-row">
            <label className="kw-field">
              <span className="kr-eyebrow">Zielwert</span>
              <input
                type="text"
                inputMode="decimal"
                className="kw-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                data-autofocus
              />
              <span className="kr-meta">
                Einheit {spec.unitLabel} · {directionExplanation(spec.direction)}
                {spec.direction === "lower_is_better" && (
                  <> · Eine kleinere Positionszahl bedeutet eine bessere Platzierung.</>
                )}
              </span>
            </label>
            <label className="kw-field">
              <span className="kr-eyebrow">Zielzeitraum</span>
              <select
                className="kw-select"
                value={periodSel}
                onChange={(e) => setPeriodSel(e.target.value)}
              >
                {allowed.map((p) => (
                  <option key={periodKey(p)} value={periodKey(p)}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="kw-form-row">
            <label className="kw-field">
              <span className="kr-eyebrow">Gültig ab</span>
              <input
                type="date"
                className="kw-input"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </label>
            <div className="kw-field">
              <label className="kr-eyebrow" htmlFor="kw-goal-owner">
                Owner
              </label>
              <OwnerPicker id="kw-goal-owner" value={ownerId} onChange={setOwnerId} />
            </div>
          </div>

          <label className="kw-field">
            <span className="kr-eyebrow">Begründung (optional)</span>
            <textarea
              className="kw-input kw-textarea"
              rows={2}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="z. B. Erstes Ziel nach verifizierter GSC-Baseline"
            />
          </label>

          {error && (
            <p className="kw-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="kw-form-actions">
            <button type="button" className="kr-btn" onClick={() => void submit()} disabled={saving}>
              {saving ? "Wird gespeichert…" : active ? "Neues Ziel speichern" : "Ziel festlegen"}
            </button>
            <button type="button" className="kw-link" onClick={() => setGoalDrawerOpen(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      </section>

      <section className="kw-dsection kw-dsection--last" aria-label="Zielverlauf">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Zielverlauf</h3>
        </div>
        {history.length === 0 ? (
          <p className="kr-meta">Noch keine Zielversionen.</p>
        ) : (
          <ul className="kw-goal-history">
            {history.map((g) => {
              const by = profiles.find((p) => p.id === g.created_by);
              return (
                <li key={g.id} className="kw-goal-hist" data-status={g.status}>
                  <span className="kw-goal-hist-date">{formatDate(g.start_date)}</span>
                  <div className="kw-goal-hist-body">
                    <span className="kw-goal-hist-value">
                      {spec.formatValue(Number(g.target_value))} {spec.unitLabel} ·{" "}
                      {formatGoalPeriod(g.period_type, g.period_days)}
                      {g.status !== "active" && (
                        <span className="kw-goal-hist-tag">
                          {g.status === "superseded"
                            ? "abgelöst"
                            : g.status === "archived"
                              ? "archiviert"
                              : "Entwurf"}
                        </span>
                      )}
                    </span>
                    <span className="kr-meta">
                      Von {displayName(by)}
                      {g.end_date ? ` · gültig bis ${formatDate(g.end_date)}` : " · aktuell gültig"}
                    </span>
                    {g.rationale && <span className="kr-meta kw-goal-hist-note">{g.rationale}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Drawer>
  );
}
