"use client";

// ─── Gewinner & Verlierer ─────────────────────────────────────────────────────
// Bewegungen der Produktseiten aus den täglichen Exportwerten: stabile
// 28-Tage-Vergleiche, das "Warum" ist der dominante messbare Treiber
// (Reichweite, Position oder Klickrate). Die stärksten Suchanfragen je Seite
// geben den Keyword-Kontext – ehrlich als Exportzeitraum-Aggregat markiert.

import type { ScopeMovement } from "@/lib/kpi/intelligence";
import { formatNumber } from "@/lib/kpi/format";
import SourceProvenance from "../SourceProvenance";
import { useWorkspace } from "../workspace";
import { pageIdForScopeLabel } from "./draft";

function MovementList({ items, empty }: { items: ScopeMovement[]; empty: string }) {
  const { canWrite, openCreate, pages } = useWorkspace();

  if (items.length === 0) return <p className="kr-meta kw-empty">{empty}</p>;

  return (
    <ul className="kw-int-move-list">
      {items.map((m) => (
        <li key={`${m.direction}-${m.option.key}`} className="kw-int-move">
          <span className="kw-int-move-name">{m.option.label}</span>
          <dl className="kw-int-qa">
            <div>
              <dt className="kr-eyebrow">Was ist passiert</dt>
              <dd>{m.what}</dd>
            </div>
            <div>
              <dt className="kr-eyebrow">Warum</dt>
              <dd>{m.why}</dd>
            </div>
            <div>
              <dt className="kr-eyebrow">Empfehlung</dt>
              <dd className="kw-int-action">{m.action}</dd>
            </div>
          </dl>
          {m.topQueries.length > 0 && (
            <p className="kr-meta kw-int-move-queries">
              Stärkste Suchanfragen (Exportzeitraum):{" "}
              {m.topQueries
                .map((q) => `„${q.query}“ (${formatNumber(q.clicks)})`)
                .join(", ")}
            </p>
          )}
          {canWrite && (
            <button
              type="button"
              className="kw-link kw-int-move-cta"
              onClick={() =>
                openCreate({
                  source: m.direction,
                  observation: `${m.option.label}: ${m.what} ${m.why}`,
                  pageId: pageIdForScopeLabel(m.option.label, pages),
                  metrics: {
                    clicks: m.clicks,
                    previousClicks: m.previousClicks,
                    position: m.positionNow ?? undefined,
                  },
                })
              }
            >
              Maßnahme anlegen
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function WinnersLosersPanel() {
  const { intelligence } = useWorkspace();
  const { winners, losers } = intelligence;

  return (
    <section className="kw-int-section" aria-label="Gewinner und Verlierer">
      <div className="kw-int-cols">
        <div>
          <p className="kr-eyebrow kw-int-label">Gewinner · 28 Tage</p>
          <p className="kw-int-lead">Seiten, die gegenüber der Vorperiode zulegen.</p>
          <MovementList
            items={winners}
            empty="Keine Seite liegt spürbar über der Vorperiode."
          />
        </div>
        <div>
          <p className="kr-eyebrow kw-int-label">Verlierer · 28 Tage</p>
          <p className="kw-int-lead">Seiten, die Klicks oder Rankings abgeben.</p>
          <MovementList
            items={losers}
            empty="Keine Seite verliert aktuell spürbar. Gut so."
          />
        </div>
      </div>
      <SourceProvenance source="Berechnet" scope="aus den täglichen Exportwerten je Produktseite" />
    </section>
  );
}
