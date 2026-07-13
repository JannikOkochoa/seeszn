"use client";

// ─── Executive KPI Grid ───────────────────────────────────────────────────────
// Genau vier zentrale Werte (Klicks, Impressionen, Klickrate, Ø Position) für
// den gewählten Scope und Zeitraum, berechnet in lib/kpi/executive.ts. Die
// Slots sind datengetrieben: ein künftiger GA4-Wert ("Organische Anfragen")
// ersetzt einen Modelleintrag, nicht das Grid.

import { buildExecutiveKpis } from "@/lib/kpi/executive";
import ExecutiveKpi from "./ExecutiveKpi";
import { useWorkspace } from "../workspace";

export default function ExecutiveKpiGrid() {
  const { gscTotals, gscComparison, hasRealData } = useWorkspace();

  if (!hasRealData || !gscTotals) return null;

  const models = buildExecutiveKpis(gscTotals, gscComparison);

  return (
    <div className="kw-ex-kpis" role="list" aria-label="Zentrale Kennzahlen">
      {models.map((model) => (
        <div role="listitem" key={model.key}>
          <ExecutiveKpi model={model} />
        </div>
      ))}
    </div>
  );
}
