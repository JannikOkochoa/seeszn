"use client";

// ─── KPI erstellen ────────────────────────────────────────────────────────────
// Kinderleichter Flow in einem ruhigen Drawer: entweder eine vorhandene
// Kennzahl mit einem Ziel versehen (Einheit/Richtung/Zeiträume liefert das
// System) oder einen eigenen manuellen KPI anlegen (kontrollierte Einheiten und
// Zeiträume). Kein Regel-Builder, keine IDs, keine Formeln. Für alle aktiven
// Mitglieder; die Absicherung liegt in der RLS.

import { useMemo, useState } from "react";
import Drawer from "./Drawer";
import OwnerPicker from "./OwnerPicker";
import {
  CUSTOM_PERIODS,
  CUSTOM_UNITS,
  directionExplanation,
  resolveKpiSpec,
  type AllowedPeriod,
} from "@/lib/kpi/goals";
import { useWorkspace } from "./workspace";

function pkey(p: AllowedPeriod): string {
  return `${p.periodType}:${p.periodDays ?? ""}`;
}

type Mode = "existing" | "custom";

export default function KpiCreateDrawer() {
  const { kpiCreateOpen } = useWorkspace();
  if (!kpiCreateOpen) return null;
  return <CreateForm />;
}

function CreateForm() {
  const { kpi, manualKpis, setKpiCreateOpen, createKpi } = useWorkspace();
  const today = new Date().toISOString().slice(0, 10);

  const [mode, setMode] = useState<Mode>("existing");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Gemeinsame Zielfelder
  const [target, setTarget] = useState("");
  const [periodSel, setPeriodSel] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState(today);
  const [rationale, setRationale] = useState("");

  // Mode „existing"
  const existingOptions = useMemo(
    () =>
      [kpi, ...manualKpis]
        .filter((d): d is NonNullable<typeof d> => !!d && !d.archived_at)
        .map((d) => ({ def: d, spec: resolveKpiSpec(d) }))
        .filter((x) => x.spec !== null),
    [kpi, manualKpis],
  );
  const [metricKey, setMetricKey] = useState<string>(existingOptions[0]?.def.metric_key ?? "");
  const selectedExisting = existingOptions.find((x) => x.def.metric_key === metricKey) ?? null;

  // Mode „custom"
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState(CUSTOM_UNITS[0].value);
  const [direction, setDirection] = useState<"higher_is_better" | "lower_is_better">("higher_is_better");
  const [firstValue, setFirstValue] = useState("");

  const allowedPeriods = mode === "existing" ? selectedExisting?.spec?.allowedPeriods ?? [] : CUSTOM_PERIODS;
  const effectivePeriodSel = periodSel || (allowedPeriods[Math.min(1, allowedPeriods.length - 1)] ? pkey(allowedPeriods[Math.min(1, allowedPeriods.length - 1)]) : "");
  const selectedPeriod = allowedPeriods.find((p) => pkey(p) === effectivePeriodSel) ?? allowedPeriods[0];

  async function submit() {
    const num = Number(target.replace(",", "."));
    if (!Number.isFinite(num) || num <= 0) {
      setError("Bitte einen Zielwert größer 0 angeben.");
      return;
    }
    if (!selectedPeriod) {
      setError("Bitte einen Zeitraum wählen.");
      return;
    }
    if (mode === "existing" && !selectedExisting) {
      setError("Bitte eine Kennzahl wählen.");
      return;
    }
    if (mode === "custom" && !name.trim()) {
      setError("Bitte einen Namen angeben.");
      return;
    }
    setSaving(true);
    setError(null);
    const first = firstValue.trim() === "" ? null : Number(firstValue);
    const result = await createKpi({
      mode,
      metricKey: mode === "existing" ? metricKey : undefined,
      name: mode === "custom" ? name.trim() : undefined,
      description: mode === "custom" ? description.trim() || null : undefined,
      unit: mode === "custom" ? unit : undefined,
      direction: mode === "custom" ? direction : undefined,
      firstValue: mode === "custom" && first !== null && Number.isFinite(first) ? first : null,
      targetValue: num,
      periodType: selectedPeriod.periodType,
      periodDays: selectedPeriod.periodDays,
      ownerId,
      effectiveFrom,
      rationale: rationale.trim() || null,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setKpiCreateOpen(false);
  }

  return (
    <Drawer
      open
      onClose={() => setKpiCreateOpen(false)}
      title={
        <div>
          <span className="kr-eyebrow">Neuer KPI</span>
          <span className="kw-drawer-name">KPI hinzufügen</span>
        </div>
      }
    >
      <section className="kw-dsection kw-dsection--head" aria-label="KPI erstellen">
        {/* Art wählen */}
        <div className="kw-bar-group" role="group" aria-label="KPI-Art">
          <button
            type="button"
            className="kw-chip"
            data-active={mode === "existing" || undefined}
            aria-pressed={mode === "existing"}
            onClick={() => setMode("existing")}
          >
            Vorhandene Kennzahl
          </button>
          <button
            type="button"
            className="kw-chip"
            data-active={mode === "custom" || undefined}
            aria-pressed={mode === "custom"}
            onClick={() => setMode("custom")}
          >
            Eigener KPI
          </button>
        </div>

        <div className="kw-form kw-create-form">
          {mode === "existing" ? (
            <>
              <label className="kw-field">
                <span className="kr-eyebrow">Kennzahl</span>
                <select
                  className="kw-select"
                  value={metricKey}
                  onChange={(e) => {
                    setMetricKey(e.target.value);
                    setPeriodSel("");
                  }}
                >
                  {existingOptions.map((x) => (
                    <option key={x.def.metric_key} value={x.def.metric_key}>
                      {x.spec!.label}
                    </option>
                  ))}
                </select>
                {selectedExisting?.spec && (
                  <span className="kr-meta">
                    Einheit {selectedExisting.spec.unitLabel || "Anzahl"} ·{" "}
                    {directionExplanation(selectedExisting.spec.direction)} · Ist-Wert automatisch
                    aus der Datenquelle
                  </span>
                )}
              </label>
            </>
          ) : (
            <>
              <label className="kw-field">
                <span className="kr-eyebrow">Name</span>
                <input
                  type="text"
                  className="kw-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z. B. Newsletter-Anmeldungen"
                  data-autofocus
                />
              </label>
              <label className="kw-field">
                <span className="kr-eyebrow">Kurze Beschreibung (optional)</span>
                <input
                  type="text"
                  className="kw-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <div className="kw-form-row">
                <label className="kw-field">
                  <span className="kr-eyebrow">Einheit</span>
                  <select className="kw-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
                    {CUSTOM_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="kw-field">
                  <span className="kr-eyebrow">Richtung</span>
                  <select
                    className="kw-select"
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as typeof direction)}
                  >
                    <option value="higher_is_better">Höher ist besser</option>
                    <option value="lower_is_better">Niedriger ist besser</option>
                  </select>
                </label>
              </div>
              <label className="kw-field">
                <span className="kr-eyebrow">Erster Ist-Wert (optional)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="kw-input"
                  value={firstValue}
                  onChange={(e) => setFirstValue(e.target.value)}
                  placeholder="Leer lassen, falls noch nicht erfasst"
                />
              </label>
            </>
          )}

          {/* Ziel + Zeitraum (beide Modi) */}
          <div className="kw-form-row">
            <label className="kw-field">
              <span className="kr-eyebrow">Zielwert</span>
              <input
                type="text"
                inputMode="decimal"
                className="kw-input"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </label>
            <label className="kw-field">
              <span className="kr-eyebrow">Zeitraum</span>
              <select
                className="kw-select"
                value={effectivePeriodSel}
                onChange={(e) => setPeriodSel(e.target.value)}
              >
                {allowedPeriods.map((p) => (
                  <option key={pkey(p)} value={pkey(p)}>
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
              <label className="kr-eyebrow" htmlFor="kw-create-owner">
                Owner
              </label>
              <OwnerPicker id="kw-create-owner" value={ownerId} onChange={setOwnerId} />
            </div>
          </div>

          <label className="kw-field">
            <span className="kr-eyebrow">Begründung (optional)</span>
            <textarea
              className="kw-input kw-textarea"
              rows={2}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </label>

          {error && (
            <p className="kw-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="kw-form-actions">
            <button type="button" className="kr-btn" onClick={() => void submit()} disabled={saving}>
              {saving ? "Wird angelegt…" : "KPI anlegen"}
            </button>
            <button type="button" className="kw-link" onClick={() => setKpiCreateOpen(false)}>
              Abbrechen
            </button>
          </div>
          <p className="kr-meta">
            {mode === "existing"
              ? "Der Ist-Wert wird automatisch gemessen und nie manuell überschrieben."
              : "Eigener KPI: manuell gepflegt, später über datierte Check-ins aktualisierbar."}
          </p>
        </div>
      </section>
    </Drawer>
  );
}
