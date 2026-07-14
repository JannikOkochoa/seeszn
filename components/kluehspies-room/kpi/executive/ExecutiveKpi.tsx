"use client";

// ─── Einzelner Executive-KPI ──────────────────────────────────────────────────
// Große Serif-Zahl, verständlicher Name, Veränderung zur Vorperiode mit
// absolutem Vorperiodenwert, dezente Quelle. Positive und negative Entwicklung
// laufen über Richtung und Text, nicht über rote oder grüne Flächen. Die Karte
// ist rein datengetrieben (ExecutiveKpiModel) und damit austauschbar – ein
// späterer GA4-Wert ersetzt nur das Modell, nicht die Komponente.

import { motion, useReducedMotion } from "framer-motion";
import type { ExecutiveKpiModel } from "@/lib/kpi/executive";
import type { KpiGoalDisplay } from "@/lib/kpi/goals";

const ARROW: Record<"up" | "down" | "flat", string> = { up: "↗", down: "↘", flat: "→" };

function deltaText(model: ExecutiveKpiModel): string | null {
  if (model.deltaPct === null) return null;
  const sign = model.deltaPct > 0 ? "+" : model.deltaPct < 0 ? "−" : "±";
  return `${sign}${Math.abs(model.deltaPct).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}

export default function ExecutiveKpi({
  model,
  goal,
  canEditGoal = false,
  onEditGoal,
}: {
  model: ExecutiveKpiModel;
  goal?: KpiGoalDisplay;
  canEditGoal?: boolean;
  onEditGoal?: () => void;
}) {
  const reduced = useReducedMotion();
  const delta = deltaText(model);
  const direction: "up" | "down" | "flat" =
    model.deltaPct === null || Math.abs(model.deltaPct) < 0.05
      ? "flat"
      : model.deltaPct > 0
        ? "up"
        : "down";

  return (
    <article className="kw-ex-kpi" data-assess={model.assessment}>
      {/* Screenreader bekommen den vollständigen Satz inkl. absoluter Werte. */}
      <span className="kw-visually-hidden">{model.srText}</span>

      <div aria-hidden="true">
        {/* key = Wert: ruhiger Crossfade beim Zeitraum-/Scope-Wechsel, kein Springen. */}
        <motion.span
          key={model.value}
          className="kw-ex-kpi-value"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {model.value}
        </motion.span>
        <span className="kw-ex-kpi-label">{model.label}</span>
        <span className="kw-ex-kpi-hint">{model.hint}</span>

        <span className="kw-ex-kpi-delta">
          {delta === null ? (
            <span className="kw-ex-kpi-note">Kein Vorperiodenvergleich</span>
          ) : model.lowBase ? (
            // Kleine Basis: absolute Werte tragen die Aussage, Prozent tritt zurück.
            <>
              <span>zuvor {model.previousValue}</span>
              <span className="kw-ex-kpi-note"> · {delta} auf kleiner Basis</span>
            </>
          ) : (
            <>
              <span className="kw-ex-kpi-dir" data-dir={direction}>
                {ARROW[direction]} {delta}
              </span>
              <span className="kw-ex-kpi-note"> · zuvor {model.previousValue}</span>
            </>
          )}
        </span>

        <span className="kw-ex-kpi-source">{model.source}</span>
      </div>

      {/* Zielanzeige nur bei der primären Kennzahl (Klicks), aus dem Zielmodell. */}
      {goal && (
        <div className="kw-ex-kpi-goal">
          {goal.state === "scope_no_goal" ? (
            <span className="kw-ex-kpi-goal-none">
              Für diesen Bereich ist noch kein Ziel festgelegt
            </span>
          ) : goal.state === "no_goal" ? (
            <>
              <span className="kw-ex-kpi-goal-none">Noch kein Ziel festgelegt</span>
              {canEditGoal && onEditGoal && (
                <button type="button" className="kw-link kw-ex-kpi-goal-edit" onClick={onEditGoal}>
                  Ziel festlegen
                </button>
              )}
            </>
          ) : (
            <>
              <span className="kw-ex-kpi-goal-target">{goal.targetText}</span>
              {(goal.achievedText || goal.remainingText) && (
                <span className="kw-ex-kpi-goal-line">
                  {goal.achievedText}
                  {goal.achievedText && goal.remainingText ? " · " : ""}
                  {goal.remainingText}
                </span>
              )}
              {goal.statusLabel && (
                <span className="kw-ex-kpi-goal-status" data-status={goal.statusKey ?? undefined}>
                  {goal.statusLabel}
                </span>
              )}
              {goal.mismatchNote && <span className="kw-ex-kpi-goal-note">{goal.mismatchNote}</span>}
              <span className="kw-ex-kpi-goal-owner">
                Owner {goal.ownerName ?? "Noch nicht zugewiesen"}
              </span>
              {canEditGoal && onEditGoal && (
                <button type="button" className="kw-link kw-ex-kpi-goal-edit" onClick={onEditGoal}>
                  Ziel bearbeiten
                </button>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
