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
    if (!gscDataAsOf) return "GSC noch nicht verbunden";
    const suffix = status.state === "degraded" ? "nicht mehr aktuell" : "echte Daten";
    return `GSC bis ${formatDate(gscDataAsOf)} · ${suffix}`;
  }
  if (status.state === "not_connected") return `${status.label} noch nicht verbunden`;
  return `${status.label}: ${status.detail}`;
}

export default function DataFreshnessBar() {
  const { gscProvenance, realtime, syncStatus, ga4Configured, setDataSourceDrawerOpen } =
    useWorkspace();
  const gscDataAsOf = gscProvenance?.dataAsOf ?? syncStatus.dataAsOf;

  const statuses = getLiveSourceStatuses({
    syncStatus,
    ga4Configured,
    realtimeConnected: realtime === "live",
  });
  // Die Zeile bleibt bewusst kompakt; die vollständige Liste steht im Drawer.
  const visible = statuses.filter((s) =>
    ["gsc_export", "gsc_api", "ga4_core", "website_scanner", "supabase_realtime"].includes(s.kind),
  );

  return (
    <div className="kw-ex-freshness" role="status">
      <span className="kw-ex-freshness-text">
        {visible.map((status, index) => (
          <span
            key={status.kind}
            className={
              status.state === "error" || status.state === "degraded"
                ? "kw-ex-freshness-warn"
                : undefined
            }
          >
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
