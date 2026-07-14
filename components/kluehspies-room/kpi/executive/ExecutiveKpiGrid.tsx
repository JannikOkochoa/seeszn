"use client";

// ─── Executive KPI Grid ───────────────────────────────────────────────────────
// Genau vier zentrale Werte (Klicks, Impressionen, Klickrate, Ø Position) für
// den gewählten Scope und Zeitraum, berechnet in lib/kpi/executive.ts. Die
// primäre Kennzahl (Klicks) trägt zusätzlich die Zielanzeige aus dem
// eigenständigen Zielmodell (lib/kpi/goals.ts) – aber nur im aggregierten
// Scope und nur mit passendem Zeitraum, damit nie Einheiten/Perioden/Scopes
// vermischt werden. Die unterstützenden Kennzahlen bleiben zum Launch ohne Ziel.

import { buildExecutiveKpis, type ExecutiveKpiContext } from "@/lib/kpi/executive";
import { cockpitRangeLabel } from "@/lib/kpi/gscData";
import { buildGoalDisplay, resolveActiveGoal, specForMetricKey } from "@/lib/kpi/goals";
import { displayName, formatDate } from "@/lib/kpi/format";
import ExecutiveKpi from "./ExecutiveKpi";
import { useWorkspace } from "../workspace";

export default function ExecutiveKpiGrid() {
  const {
    gscTotals,
    gscComparison,
    hasRealData,
    range,
    gscProvenance,
    goalVersions,
    kpi,
    profiles,
    activeScope,
    canEditTarget,
    openGoalDrawer,
  } = useWorkspace();

  if (!hasRealData || !gscTotals) return null;

  const context: ExecutiveKpiContext = {
    rangeLabel: cockpitRangeLabel(range),
    dataAsOfLabel: gscProvenance?.dataAsOf ? formatDate(gscProvenance.dataAsOf) : null,
  };
  const models = buildExecutiveKpis(gscTotals, gscComparison, context);

  // Zielanzeige der primären Kennzahl (Klicks): nur im aggregierten Scope
  // (path_prefix) und nur mit zur gewählten Range passender Periode.
  const isAggregate = activeScope?.scopeType === "path_prefix";
  const spec = kpi ? specForMetricKey(kpi.metric_key) : null;
  const periodDays = typeof range === "number" ? range : null;
  const activeGoalForPeriod =
    kpi && periodDays !== null
      ? resolveActiveGoal(goalVersions, {
          kpiDefinitionId: kpi.id,
          periodType: "rolling_days",
          periodDays,
        })
      : null;
  const anyActiveGoal = kpi ? resolveActiveGoal(goalVersions, { kpiDefinitionId: kpi.id }) : null;
  const displayedGoal = activeGoalForPeriod ?? anyActiveGoal;
  const ownerProfile = displayedGoal?.owner_id
    ? profiles.find((p) => p.id === displayedGoal.owner_id)
    : undefined;

  const clicksGoal = buildGoalDisplay({
    isAggregateScope: !!isAggregate,
    spec,
    activeGoalForPeriod,
    anyActiveGoal,
    actual: gscTotals.clicks,
    hasEnoughData: gscTotals.daysWithData > 0,
    ownerName: displayedGoal?.owner_id ? displayName(ownerProfile) : null,
  });

  return (
    <div className="kw-ex-kpis" role="list" aria-label="Zentrale Kennzahlen">
      {models.map((model) => (
        <div role="listitem" key={model.key}>
          <ExecutiveKpi
            model={model}
            goal={model.key === "clicks" ? clicksGoal : undefined}
            canEditGoal={model.key === "clicks" && canEditTarget && !!isAggregate}
            onEditGoal={() => kpi && openGoalDrawer(kpi.id)}
          />
        </div>
      ))}
    </div>
  );
}
