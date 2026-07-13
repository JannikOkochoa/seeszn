"use client";

// ─── Benötigt Aufmerksamkeit ──────────────────────────────────────────────────
// Maximal drei deterministisch berechnete Beobachtungen aus den echten Zahlen
// (lib/kpi/executive.ts), klar als „Berechnet“ gekennzeichnet. Sprachlich
// getrennt: Beobachtung (faktisch), konkrete Zahlen, optionale vorsichtige
// Einordnung ohne Kausalitätsbehauptung. Keine erfundenen Empfehlungen.

import { buildAttentionItems } from "@/lib/kpi/executive";
import SourceProvenance from "../SourceProvenance";
import { useWorkspace } from "../workspace";

export default function AttentionPanel() {
  const { gscComparison, scopeBreakdown, hasRealData } = useWorkspace();

  const items = hasRealData ? buildAttentionItems(gscComparison, scopeBreakdown) : [];

  return (
    <section className="kw-ex-attention" aria-label="Benötigt Aufmerksamkeit">
      <p className="kr-eyebrow kw-ex-panel-label">Benötigt Aufmerksamkeit</p>
      {items.length === 0 ? (
        <p className="kr-meta">
          {hasRealData
            ? gscComparison
              ? "Keine Auffälligkeiten in der aktuellen Periode."
              : "Für den Gesamtzeitraum gibt es keinen Vorperiodenvergleich."
            : "Sobald Daten verbunden sind, erscheinen hier berechnete Beobachtungen."}
        </p>
      ) : (
        <ul className="kw-ex-attention-list">
          {items.map((item) => (
            <li key={item.key} className="kw-ex-attention-item">
              <span className="kw-ex-attention-obs">{item.observation}</span>
              <span className="kr-meta">{item.numbers}</span>
              {item.interpretation && (
                <span className="kr-meta kw-ex-attention-int">{item.interpretation}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <SourceProvenance source="Berechnet" scope="aus den importierten GSC-Tageswerten" />
    </section>
  );
}
