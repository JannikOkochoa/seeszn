"use client";

// ─── SEO Health ───────────────────────────────────────────────────────────────
// Keine technischen Fehler, sondern der Zustand je Seite: wächst, stabil oder
// braucht Aufmerksamkeit – aus den stabilen 28-Tage-Vergleichen. Was
// Aufmerksamkeit braucht, steht oben.

import SourceProvenance from "../SourceProvenance";
import { useWorkspace } from "../workspace";

export default function SeoHealthPanel() {
  const { intelligence } = useWorkspace();
  const { health } = intelligence;

  if (health.length === 0) return null;

  return (
    <section className="kw-int-section" aria-label="SEO Health">
      <p className="kr-eyebrow kw-int-label">SEO Health · 28 Tage</p>
      <p className="kw-int-lead">
        Der Zustand jeder beobachteten Seite auf einen Blick – was Aufmerksamkeit braucht, steht
        oben.
      </p>
      <ul className="kw-int-health">
        {health.map((h) => (
          <li key={h.option.key} className="kw-int-health-row" data-status={h.status}>
            <span className="kw-int-health-name">
              <i className="kw-int-dot" aria-hidden="true" />
              {h.option.label}
            </span>
            <span className="kw-int-health-status">{h.statusLabel}</span>
            <span className="kr-meta kw-int-health-what">{h.what}</span>
            <span className="kr-meta kw-int-health-action">{h.action}</span>
          </li>
        ))}
      </ul>
      <SourceProvenance source="Berechnet" scope="aus den täglichen Exportwerten je Scope" />
    </section>
  );
}
