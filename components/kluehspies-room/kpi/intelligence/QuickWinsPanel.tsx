"use client";

// ─── Quick Wins ───────────────────────────────────────────────────────────────
// Kuratierte, schnell umsetzbare AI-/SEO-Maßnahmen. Die Inhalte sind im Room
// editierbar (anlegen, ändern, löschen, sortieren) und liegen in der Tabelle
// kluehspies_quick_wins. Solange die Tabelle noch nicht existiert, dienen die
// kuratierten Standardinhalte (defaultQuickWins.ts) als Fallback – dann ohne
// Bearbeiten-Steuerung. Jede Karte beantwortet die drei Fragen des Decision
// Layer: was ist passiert, warum, was empfehlen wir. Design, Kartenstruktur,
// Badge und „Maßnahme anlegen"-Button bleiben unverändert.

import { Fragment } from "react";
import { useWorkspace } from "../workspace";
import { DEFAULT_QUICK_WINS, recommendationToLines } from "./defaultQuickWins";

/** Vereinheitlichte Anzeigeform, egal ob aus der DB oder aus den Defaults. */
interface DisplayCard {
  /** DB-id, wenn editierbar; null für die Fallback-Defaults. */
  id: string | null;
  title: string;
  what: string;
  why: string;
  lines: string[];
}

/** Zeilenweise Ausgabe innerhalb eines bestehenden <dd>. Leere Zeilen erzeugen
 *  einen ruhigen Absatzabstand über die vorhandene Zeilenhöhe. */
function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export default function QuickWinsPanel() {
  const {
    canWrite,
    openCreate,
    quickWins,
    quickWinsEnabled,
    openQuickWinEdit,
    deleteQuickWin,
    moveQuickWin,
  } = useWorkspace();

  // Editierbar nur, wenn die Tabelle existiert und Karten vorhanden sind.
  const editable = quickWinsEnabled && quickWins.length > 0;
  const cards: DisplayCard[] = editable
    ? [...quickWins]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((w) => ({
          id: w.id,
          title: w.title,
          what: w.what,
          why: w.why,
          lines: recommendationToLines(w.recommendation),
        }))
    : DEFAULT_QUICK_WINS.map((w) => ({
        id: null,
        title: w.title,
        what: w.what,
        why: w.why,
        lines: w.recommendation,
      }));

  // Admin darf verwalten, sobald die Tabelle bereitsteht (auch bei 0 Karten).
  const canManage = canWrite && quickWinsEnabled;

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Quick Win „${title}“ wirklich löschen?`)) return;
    const result = await deleteQuickWin(id);
    if (!result.ok) window.alert(result.message);
  }

  return (
    <section className="kw-int-section" aria-label="Quick Wins">
      <p className="kr-eyebrow kw-int-label">Quick Wins</p>
      <p className="kw-int-lead">
        Schnell umsetzbare Maßnahmen, mit denen Klühspies als Unternehmen, Leistungsanbieter und
        fachliche Quelle von Google und AI-Systemen eindeutiger verstanden und häufiger zitiert
        werden kann.
      </p>

      <ul className="kw-int-cards">
        {cards.map((card, index) => (
          <li key={card.id ?? `default-${index}`} className="kw-int-card">
            <div className="kw-int-card-head">
              <span className="kw-int-subject">{card.title}</span>
              <span className="kw-int-score" data-level="hoch">
                Opportunity hoch
              </span>
            </div>
            <dl className="kw-int-qa">
              <div>
                <dt className="kr-eyebrow">Was ist passiert</dt>
                <dd>{card.what}</dd>
              </div>
              <div>
                <dt className="kr-eyebrow">Warum</dt>
                <dd>{card.why}</dd>
              </div>
              <div>
                <dt className="kr-eyebrow">Empfehlung</dt>
                <dd className="kw-int-action">
                  <Lines lines={card.lines} />
                </dd>
              </div>
            </dl>
            <div className="kw-int-card-foot">
              {canManage && card.id ? (
                <span className="kw-qw-manage">
                  <button
                    type="button"
                    className="kw-link"
                    onClick={() => {
                      const row = quickWins.find((w) => w.id === card.id);
                      if (row) openQuickWinEdit({ mode: "edit", row });
                    }}
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    className="kw-link"
                    onClick={() => moveQuickWin(card.id!, "up")}
                    disabled={index === 0}
                    aria-label="Nach oben"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="kw-link"
                    onClick={() => moveQuickWin(card.id!, "down")}
                    disabled={index === cards.length - 1}
                    aria-label="Nach unten"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="kw-link kw-qw-delete"
                    onClick={() => handleDelete(card.id!, card.title)}
                  >
                    Löschen
                  </button>
                </span>
              ) : (
                <span className="kr-meta" aria-hidden="true" />
              )}
              {canWrite && (
                <button
                  type="button"
                  className="kw-link"
                  onClick={() =>
                    openCreate({
                      source: "page",
                      observation: `${card.title}: ${card.what}`,
                    })
                  }
                >
                  Maßnahme anlegen
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {canManage && (
        <p className="kw-qw-add">
          <button
            type="button"
            className="kw-link"
            onClick={() => openQuickWinEdit({ mode: "create" })}
          >
            + Quick Win hinzufügen
          </button>
        </p>
      )}

      <p className="kw-provenance kr-meta">
        Quelle: SEESZN AI-/SEO-Audit · Website-Stand Juli 2026
      </p>
    </section>
  );
}
