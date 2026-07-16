"use client";

// ─── Nächster Schritt ─────────────────────────────────────────────────────────
// Genau eine dominante Empfehlung: der oberste Eintrag des berechneten Action
// Feed (konkret, mit Zahlen). Liegt keiner vor, fällt das Panel auf die ruhige
// Lageeinschätzung aus dem Vorperiodenvergleich zurück (lib/kpi/executive.ts).
// Für Viewer wird „Details ansehen“ zur primären Aktion.

import { buildNextStep } from "@/lib/kpi/executive";
import { useWorkspace } from "../workspace";
import { draftFromSeed } from "../intelligence/draft";

export default function NextActionPanel() {
  const { canWrite, openCreate, setKpiDrawerOpen, gscComparison, intelligence, pages } =
    useWorkspace();
  const top = intelligence.actionFeed[0] ?? null;
  const fallback = buildNextStep(gscComparison);

  return (
    <section className="kw-ex-action" aria-label="Nächster Schritt">
      <p className="kr-eyebrow kw-ex-panel-label">Nächster Schritt</p>
      <p className="kw-ex-action-headline">{top ? top.title : fallback.headline}</p>
      <p className="kr-meta kw-ex-action-rationale">{top ? top.why : fallback.rationale}</p>
      <div className="kw-ex-action-buttons">
        {canWrite ? (
          <>
            <button
              type="button"
              className="kr-btn"
              onClick={() =>
                openCreate(top ? draftFromSeed(top.draft, pages) : { source: "kpi" })
              }
            >
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
