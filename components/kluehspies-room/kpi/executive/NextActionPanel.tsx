"use client";

// ─── Nächster Schritt ─────────────────────────────────────────────────────────
// Keine Linksammlung, sondern eine echte Empfehlung: ein Satz Lageeinschätzung
// plus kurze Begründung, deterministisch aus dem Vorperiodenvergleich
// (lib/kpi/executive.ts), darunter genau eine dominante Aktion. Für Viewer wird
// „Details ansehen“ zur primären Aktion. Sekundäres bleibt bewusst leise.

import { buildNextStep } from "@/lib/kpi/executive";
import { useWorkspace } from "../workspace";

export default function NextActionPanel() {
  const { canWrite, openCreate, setKpiDrawerOpen, gscComparison } = useWorkspace();
  const next = buildNextStep(gscComparison);

  return (
    <section className="kw-ex-action" aria-label="Nächster Schritt">
      <p className="kr-eyebrow kw-ex-panel-label">Nächster Schritt</p>
      <p className="kw-ex-action-headline">{next.headline}</p>
      <p className="kr-meta kw-ex-action-rationale">{next.rationale}</p>
      <div className="kw-ex-action-buttons">
        {canWrite ? (
          <>
            <button type="button" className="kr-btn" onClick={() => openCreate({ source: "kpi" })}>
              Maßnahme erstellen
            </button>
            <button
              type="button"
              className="kw-link kw-ex-action-secondary"
              onClick={() => setKpiDrawerOpen(true)}
            >
              Details ansehen
            </button>
          </>
        ) : (
          <button type="button" className="kr-btn" onClick={() => setKpiDrawerOpen(true)}>
            Details ansehen
          </button>
        )}
      </div>
    </section>
  );
}
