"use client";

// ─── Content Opportunities ────────────────────────────────────────────────────
// Keine Keyword-Liste, sondern Empfehlungen: Suchanfragen mit spürbarer
// Nachfrage, für die Klühspies noch nicht auf Seite 1 steht. Frageähnliche
// Anfragen werden als Ratgeber-Thema empfohlen, übrige als Ausbau bestehender
// Inhalte – jeweils mit Zahlen und Opportunity-Einstufung.

import SourceProvenance from "../SourceProvenance";
import { useWorkspace } from "../workspace";

export default function ContentOpportunitiesPanel() {
  const { intelligence, canWrite, openCreate } = useWorkspace();
  const { contentOpportunities, sourceScope, sourcePeriod } = intelligence;

  return (
    <section className="kw-int-section" aria-label="Content Opportunities">
      <p className="kr-eyebrow kw-int-label">Content Opportunities</p>
      <p className="kw-int-lead">
        Themen, nach denen gesucht wird, während Klühspies dafür noch nicht auf Seite 1 sichtbar
        ist. Empfohlen wird das Format, nicht nur das Keyword.
      </p>

      {contentOpportunities.length === 0 ? (
        <p className="kr-meta kw-empty">
          Keine berechneten Content-Chancen: keine nachgefragte Suchanfrage liegt jenseits von
          Seite 1.
        </p>
      ) : (
        <ul className="kw-int-cards">
          {contentOpportunities.map((o) => (
            <li key={o.key} className="kw-int-card">
              <div className="kw-int-card-head">
                <span className="kw-int-subject">„{o.topic}“</span>
                <span className="kw-int-score" data-level={o.score.level}>
                  Opportunity {o.score.level}
                </span>
              </div>
              <p className="kr-meta kw-int-format">{o.format}</p>
              <dl className="kw-int-qa">
                <div>
                  <dt className="kr-eyebrow">Was ist passiert</dt>
                  <dd>{o.what}</dd>
                </div>
                <div>
                  <dt className="kr-eyebrow">Warum</dt>
                  <dd>{o.why}</dd>
                </div>
                <div>
                  <dt className="kr-eyebrow">Empfehlung</dt>
                  <dd className="kw-int-action">{o.action}</dd>
                </div>
              </dl>
              {canWrite && (
                <div className="kw-int-card-foot">
                  <span className="kr-meta">
                    Ø Position {o.metrics.position.toLocaleString("de-DE", { maximumFractionDigits: 1 })}
                  </span>
                  <button
                    type="button"
                    className="kw-link"
                    onClick={() =>
                      openCreate({
                        source: "query",
                        observation: `Suchanfrage „${o.topic}“: ${o.what} ${o.why}`,
                        query: o.topic,
                        metrics: {
                          clicks: o.metrics.clicks,
                          impressions: o.metrics.impressions,
                          ctr: o.metrics.ctrPct,
                          position: o.metrics.position,
                        },
                      })
                    }
                  >
                    Maßnahme anlegen
                  </button>
                </div>
              )}
            </li>
          ))}
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
