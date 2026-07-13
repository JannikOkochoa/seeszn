"use client";

// ─── Nächster Schritt ─────────────────────────────────────────────────────────
// Sehr reduzierter Aktionsbereich: eine primäre und höchstens zwei sekundäre
// Aktionen, alle über bestehende Funktionen (Maßnahmen, KPI-Drawer,
// Freigaben-Sektion). Für Viewer wird „Details ansehen“ zur primären Aktion.

import { useWorkspace } from "../workspace";

export default function NextActionPanel() {
  const { canWrite, openCreate, setKpiDrawerOpen } = useWorkspace();

  return (
    <section className="kw-ex-action" aria-label="Nächster Schritt">
      <p className="kr-eyebrow kw-ex-panel-label">Nächster Schritt</p>
      <div className="kw-ex-action-buttons">
        {canWrite ? (
          <>
            <button type="button" className="kr-btn" onClick={() => openCreate({ source: "kpi" })}>
              Maßnahme erstellen
            </button>
            <button type="button" className="kw-link" onClick={() => setKpiDrawerOpen(true)}>
              Details ansehen
            </button>
            <a className="kw-link" href="#freigaben">
              Freigaben öffnen
            </a>
          </>
        ) : (
          <>
            <button type="button" className="kr-btn" onClick={() => setKpiDrawerOpen(true)}>
              Details ansehen
            </button>
            <a className="kw-link" href="#freigaben">
              Freigaben öffnen
            </a>
          </>
        )}
      </div>
    </section>
  );
}
