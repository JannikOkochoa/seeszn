"use client";

// ─── PREISE: die Fragen vor der Bestellung ────────────────────────────────────
// Der Antworttext steht immer im HTML, auch zugeklappt: ein Abrufsystem soll die
// Regeln lesen können, ohne etwas anzuklicken. Sichtbar ist zunächst nur die
// Frage, damit sechs Antworten die Seite nicht zur Textwand machen.
//
// Native <details>: funktioniert ohne JavaScript, ist tastaturbedienbar und
// wird von Screenreadern korrekt angesagt.

import { track } from "@/lib/moves/analytics";

export default function Questions({
  label,
  items,
  id,
}: {
  label: string;
  items: readonly { q: string; a: string }[];
  id?: string;
}) {
  return (
    <section className="mv-section" id={id} aria-labelledby={`${id ?? "q"}-h`}>
      <span className="mv-label" id={`${id ?? "q"}-h`}>
        {label}
      </span>
      <div className="mv-questions">
        {items.map((item, i) => (
          <details
            key={item.q}
            className="mv-question"
            onToggle={(e) => {
              if ((e.currentTarget as HTMLDetailsElement).open) {
                track("faq_opened", { position: i + 1 });
              }
            }}
          >
            <summary>
              <h3 className="mv-question-q">{item.q}</h3>
            </summary>
            <p className="mv-question-a">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
