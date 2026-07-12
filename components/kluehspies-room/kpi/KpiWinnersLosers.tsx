"use client";

// ─── Gewinner und Verlierer ───────────────────────────────────────────────────
// Datenbasierte Auffälligkeiten mit sauberer Trennung von Beobachtung und
// möglicher Interpretation. Keine erfundenen Ursachen. Aus jeder Zeile lässt
// sich direkt eine Maßnahme erstellen.

import type { Finding } from "@/lib/kpi/aggregate";
import { useWorkspace } from "./workspace";

const KIND_LABEL: Record<Finding["kind"], string> = {
  winner: "Gewinner",
  loser: "Verlierer",
  device: "Geräteabweichung",
  impressions: "Impressionen ohne Klicks",
  threshold: "Ranking-Schwelle",
};

export default function KpiWinnersLosers() {
  const { findings, canWrite, openCreate, pages, days } = useWorkspace();

  if (findings.length === 0) {
    return (
      <p className="kr-meta kw-empty">
        Keine Auffälligkeiten im gewählten Zeitraum. Die Seiten bewegen sich im normalen Rahmen.
      </p>
    );
  }

  function createFrom(f: Finding) {
    const page = pages.find((p) => p.id === f.pageId);
    openCreate({
      source: f.kind === "device" ? "device" : f.kind === "winner" ? "winner" : "loser",
      observation: f.observation,
      pageId: f.pageId,
      pageUrl: page?.url,
      device: f.device,
      metrics: {
        clicks: f.metrics.clicks,
        previousClicks: f.metrics.previousClicks,
      },
    });
  }

  return (
    <div className="kw-findings">
      {findings.map((f, i) => (
        <article key={`${f.kind}-${f.pageId}-${i}`} className="kw-finding" data-kind={f.kind}>
          <div className="kw-finding-head">
            <span className="kr-eyebrow">{KIND_LABEL[f.kind]}</span>
            {canWrite && (
              <button type="button" className="kw-link" onClick={() => createFrom(f)}>
                Maßnahme erstellen
              </button>
            )}
          </div>
          <p className="kw-finding-obs">
            <span className="kw-finding-tag">Beobachtung</span>
            {f.observation}
          </p>
          {f.interpretation && (
            <p className="kw-finding-int">
              <span className="kw-finding-tag">Einordnung</span>
              {f.interpretation}
            </p>
          )}
          <p className="kr-meta">Basis: letzte {days} Tage gegenüber der Vorperiode.</p>
        </article>
      ))}
    </div>
  );
}
