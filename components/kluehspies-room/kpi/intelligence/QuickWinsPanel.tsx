"use client";

// ─── Quick Wins ───────────────────────────────────────────────────────────────
// Automatisch erkannte Chancen: sichtbar in Google (Position 4–15, spürbare
// Nachfrage), aber deutlich unter der üblichen Klickrate. Jede Karte
// beantwortet die drei Fragen des Decision Layer – was ist passiert, warum,
// was tun wir jetzt – und wird direkt zur Maßnahme.

import { formatNumber } from "@/lib/kpi/format";
import SourceProvenance from "../SourceProvenance";
import { useWorkspace } from "../workspace";
import { pageIdForUrl } from "./draft";

export default function QuickWinsPanel() {
  const { intelligence, canWrite, openCreate, pages } = useWorkspace();
  const { quickWins, deviceInsight, sourceScope, sourcePeriod } = intelligence;

  return (
    <section className="kw-int-section" aria-label="Quick Wins">
      <p className="kr-eyebrow kw-int-label">Quick Wins</p>
      <p className="kw-int-lead">
        Ergebnisse, die bereits in Google sichtbar sind, aber deutlich seltener geklickt werden
        als an ihrer Position üblich. Hier wirkt Optimierung am schnellsten.
      </p>

      {quickWins.length === 0 && !deviceInsight ? (
        <p className="kr-meta kw-empty">
          Aktuell keine berechneten Quick Wins: kein sichtbares Ergebnis liegt auffällig unter der
          üblichen Klickrate.
        </p>
      ) : (
        <ul className="kw-int-cards">
          {quickWins.map((w) => (
            <li key={w.key} className="kw-int-card">
              <div className="kw-int-card-head">
                <span className="kw-int-subject">
                  {w.kind === "query" ? `„${w.subject}“` : w.subject}
                </span>
                <span className="kw-int-score" data-level={w.score.level}>
                  Opportunity {w.score.level}
                </span>
              </div>
              <dl className="kw-int-qa">
                <div>
                  <dt className="kr-eyebrow">Was ist passiert</dt>
                  <dd>{w.what}</dd>
                </div>
                <div>
                  <dt className="kr-eyebrow">Warum</dt>
                  <dd>{w.why}</dd>
                </div>
                <div>
                  <dt className="kr-eyebrow">Empfehlung</dt>
                  <dd className="kw-int-action">{w.action}</dd>
                </div>
              </dl>
              <div className="kw-int-card-foot">
                <span className="kr-meta">
                  {w.potentialMonthlyClicks !== null
                    ? `Rechnerisches Potenzial: rund ${formatNumber(w.potentialMonthlyClicks)} zusätzliche Klicks pro Monat`
                    : `${formatNumber(w.metrics.clicks)} Klicks im Exportzeitraum`}
                </span>
                {canWrite && (
                  <button
                    type="button"
                    className="kw-link"
                    onClick={() =>
                      openCreate({
                        source: w.kind === "page" ? "page" : "query",
                        observation: `${w.kind === "page" ? w.subject : `Suchanfrage „${w.subject}“`}: ${w.what} ${w.why}`,
                        query: w.kind === "query" ? w.subject : undefined,
                        pageUrl: w.pageUrl ?? undefined,
                        pageId: pageIdForUrl(w.pageUrl ?? undefined, pages),
                        metrics: {
                          clicks: w.metrics.clicks,
                          impressions: w.metrics.impressions,
                          ctr: w.metrics.ctrPct,
                          position: w.metrics.position,
                        },
                      })
                    }
                  >
                    Maßnahme anlegen
                  </button>
                )}
              </div>
            </li>
          ))}

          {deviceInsight && (
            <li className="kw-int-card">
              <div className="kw-int-card-head">
                <span className="kw-int-subject">Mobile Suchergebnisse</span>
                <span className="kw-int-score" data-level="mittel">
                  Opportunity mittel
                </span>
              </div>
              <dl className="kw-int-qa">
                <div>
                  <dt className="kr-eyebrow">Was ist passiert</dt>
                  <dd>{deviceInsight.what}</dd>
                </div>
                <div>
                  <dt className="kr-eyebrow">Warum</dt>
                  <dd>{deviceInsight.why}</dd>
                </div>
                <div>
                  <dt className="kr-eyebrow">Empfehlung</dt>
                  <dd className="kw-int-action">{deviceInsight.action}</dd>
                </div>
              </dl>
              {canWrite && (
                <div className="kw-int-card-foot">
                  <span className="kr-meta">Aus dem Geräte-Vergleich des Exports</span>
                  <button
                    type="button"
                    className="kw-link"
                    onClick={() =>
                      openCreate({
                        source: "device",
                        device: "MOBILE",
                        observation: `${deviceInsight.what} ${deviceInsight.why}`,
                      })
                    }
                  >
                    Maßnahme anlegen
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      )}

      <SourceProvenance
        source="Berechnet"
        scope={sourceScope ? `aus dem GSC-Export „${sourceScope.label}“` : undefined}
        periodStart={sourcePeriod?.start}
        periodEnd={sourcePeriod?.end}
      />
    </section>
  );
}
