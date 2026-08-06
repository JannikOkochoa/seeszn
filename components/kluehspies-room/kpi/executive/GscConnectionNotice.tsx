"use client";

// ─── Verbindungshinweis der Search-Console-Anbindung ──────────────────────────
// Sichtbar genau dann, wenn die Anbindung nicht sauber läuft: veraltete Daten
// oder ein fehlgeschlagener Lauf. Läuft alles, bleibt die Zeile weg — der Ruhe-
// zustand des Raums ist Stille, kein grünes Licht.
//
// Der Hinweis ersetzt keine Zahl und blendet keine aus: die angezeigten Werte
// bleiben echt, sie sind nur älter als erwartet. Genau das steht hier auch.

import { formatDateTime } from "@/lib/kpi/format";
import { useWorkspace } from "../workspace";

export default function GscConnectionNotice() {
  const { syncStatus, setDataSourceDrawerOpen } = useWorkspace();

  if (syncStatus.state === "live" || syncStatus.state === "unlogged") return null;

  const severe = syncStatus.state === "failed" || syncStatus.state === "never";

  return (
    <div
      className={`kw-conn ${severe ? "kw-conn--error" : "kw-conn--warn"}`}
      role="status"
      aria-live="polite"
    >
      <p className="kw-conn-headline">{syncStatus.headline}</p>
      <p className="kw-conn-detail">{syncStatus.detail}</p>
      {syncStatus.lastSuccess && (
        <p className="kw-conn-hint kr-meta">
          Letzter erfolgreicher Sync:{" "}
          {formatDateTime(
            syncStatus.lastSuccess.completed_at ?? syncStatus.lastSuccess.started_at,
          )}
          .
        </p>
      )}
      <button
        type="button"
        className="kw-link kw-conn-link"
        onClick={() => setDataSourceDrawerOpen(true)}
      >
        Ablauf der Aktualisierung ansehen
      </button>
    </div>
  );
}
