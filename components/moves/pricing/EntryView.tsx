"use client";

// ─── PREISE: der Einstieg ─────────────────────────────────────────────────────
// Eine Frage, zwei Wege, keine Preise. First Move und Backlinks lösen
// verschiedene Aufgaben; "ab 99 €" neben "2.490 €" stellt eine Vergleichsfrage,
// die niemand hat, und lässt den teureren Weg künstlich teuer aussehen. Der
// Preis steht im jeweiligen Weg, sobald die Aufgabe klar ist.

import { PathZone, useCopy } from "./PricingShell";

export default function EntryView() {
  const t = useCopy();
  return (
    <section className="mv-entry" aria-labelledby="pricing-h1">
      <span className="mv-label">{t.entry.eyebrow}</span>
      <h1 className="mv-entry-h" id="pricing-h1">
        {t.entry.h1}
      </h1>
      <p className="mv-entry-lead">{t.entry.lead}</p>

      <div className="mv-paths">
        {t.entry.paths.map((path) => (
          <PathZone
            key={path.product}
            n={path.n}
            name={path.name}
            line={path.line}
            cta={path.cta}
            product={path.product}
          />
        ))}
      </div>
    </section>
  );
}
