"use client";

// ─── Data Freshness Bar ───────────────────────────────────────────────────────
// Eine sehr schmale, ehrliche Informationszeile unter dem Intro: GSC-Datenstand
// und -Quelle, nicht verbundene Systeme, Dashboard-Realtime. Keine Karten,
// keine Status-Lichter ohne echten Status – feine Trennpunkte, ein Link in den
// Datenquellen-Drawer. Neue Quellen (GSC API, GA4, Scanner, TYPO3) erweitern
// nur die Liste in lib/kpi/executive.ts, nicht dieses Layout.

import { getLiveSourceStatuses, type LiveSourceStatus } from "@/lib/kpi/executive";
import { formatDate } from "@/lib/kpi/format";
import { useWorkspace } from "../workspace";

/** Kurztext eines Eintrags für die Zeile. */
function segmentText(status: LiveSourceStatus, gscDataAsOf: string | null): string {
  if (status.kind === "gsc_export") {
    return gscDataAsOf
      ? `GSC bis ${formatDate(gscDataAsOf)} · Export verifiziert`
      : "GSC noch nicht verbunden";
  }
  if (status.state === "not_connected") return `${status.label} noch nicht verbunden`;
  if (status.state === "offline") return `${status.label}: ${status.detail}`;
  return `${status.label}: ${status.detail}`;
}

export default function DataFreshnessBar() {
  const { gscProvenance, realtime, setDataSourceDrawerOpen } = useWorkspace();
  const gscDataAsOf = gscProvenance?.dataAsOf ?? null;

  const statuses = getLiveSourceStatuses({
    gscDataAsOf,
    realtimeConnected: realtime === "live",
  });
  // Die Zeile bleibt bewusst kompakt; die vollständige Liste steht im Drawer.
  const visible = statuses.filter((s) =>
    ["gsc_export", "ga4_core", "website_scanner", "supabase_realtime"].includes(s.kind),
  );

  return (
    <div className="kw-ex-freshness" role="status">
      <span className="kw-ex-freshness-text">
        {visible.map((status, index) => (
          <span key={status.kind}>
            {index > 0 && (
              <span className="kw-ex-dot" aria-hidden="true">
                {" · "}
              </span>
            )}
            {segmentText(status, gscDataAsOf)}
          </span>
        ))}
      </span>
      <button
        type="button"
        className="kw-link kw-ex-freshness-link"
        onClick={() => setDataSourceDrawerOpen(true)}
      >
        Datenquelle ansehen
      </button>
    </div>
  );
}
