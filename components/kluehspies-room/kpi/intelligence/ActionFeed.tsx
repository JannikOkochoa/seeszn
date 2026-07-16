"use client";

// ─── Action Feed ──────────────────────────────────────────────────────────────
// Nicht Daten, sondern Aufgaben: die berechneten Empfehlungen aus Quick Wins,
// Verlierern, Content-Chancen und Geräte-Vergleich als priorisierte Liste mit
// Sterne-Bewertung. Bereits angelegte offene Maßnahmen erscheinen nicht
// erneut; ein Klick übernimmt Beobachtung und Zahlen in den Maßnahmen-Entwurf.

import SourceProvenance from "../SourceProvenance";
import { useWorkspace } from "../workspace";
import { draftFromSeed } from "./draft";

function Stars({ count }: { count: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <span className="kw-int-stars" role="img" aria-label={`Priorität ${count} von 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} data-empty={i >= count || undefined} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

export default function ActionFeed() {
  const { intelligence, canWrite, openCreate, pages } = useWorkspace();
  const { actionFeed } = intelligence;

  return (
    <section className="kw-int-section" aria-label="Empfohlene nächste Schritte">
      <p className="kr-eyebrow kw-int-label">Empfohlene nächste Schritte</p>
      <p className="kw-int-lead">
        Die wichtigsten berechneten Aufgaben, priorisiert nach Dringlichkeit und Potenzial.
        Bereits angelegte Maßnahmen erscheinen hier nicht mehr.
      </p>

      {actionFeed.length === 0 ? (
        <p className="kr-meta kw-empty">
          Alle berechneten Empfehlungen sind bereits als Maßnahme angelegt – oder es liegt aktuell
          nichts Dringendes vor.
        </p>
      ) : (
        <ol className="kw-int-feed">
          {actionFeed.map((item) => (
            <li key={item.key} className="kw-int-feed-item">
              <Stars count={item.stars} />
              <div className="kw-int-feed-main">
                <span className="kw-int-feed-title">{item.title}</span>
                <span className="kr-meta">{item.why}</span>
                <span className="kr-meta kw-int-feed-source">{item.sourceLabel}</span>
              </div>
              {canWrite && (
                <button
                  type="button"
                  className="kw-link"
                  onClick={() => openCreate(draftFromSeed(item.draft, pages))}
                >
                  Maßnahme anlegen
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      <SourceProvenance source="Berechnet" scope="aus Quick Wins, Verlierern, Content-Chancen und Geräte-Vergleich" />
    </section>
  );
}
