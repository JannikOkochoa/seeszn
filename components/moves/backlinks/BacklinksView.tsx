"use client";

// ─── PREISE: Backlinks ────────────────────────────────────────────────────────
// Ein Konfigurationskauf, keine Erzählung. Die Reihenfolge folgt dem Blick:
// Aussage, Rechner, ein Beleg, der Platzierungsschutz, die sechs Fragen.
//
// Was hier bewusst NICHT mehr steht: eine Formatkunde, eine Ablaufgrafik und
// eine zweite Fragenliste. Sie beantworteten keine Frage, die der Rechner oder
// die sechs Fragen nicht schon beantworten, und jede zusätzliche Fläche macht
// den Kauf langsamer.

import Configurator from "./Configurator";
import Questions from "@/components/moves/pricing/Questions";
import ProofUnit from "@/components/moves/pricing/ProofUnit";
import { useCopy } from "@/components/moves/pricing/PricingShell";

export default function BacklinksView() {
  const t = useCopy();
  const b = t.backlinks;

  return (
    <>
      <section className="mv-section mv-section--tight" style={{ borderTop: "none" }}>
        <span className="mv-label">{b.eyebrow}</span>
        <h1 className="mv-entry-h" style={{ marginTop: 10 }}>
          {b.h1}
        </h1>
        <p className="mv-entry-lead">{b.lead}</p>

        <Configurator />
      </section>

      <ProofUnit scope="bl" />

      {/* ── Platzierungsschutz ───────────────────────────────────────────── */}
      {/* Eigener Abschnitt, weil "was, wenn der Link verschwindet" bei vielen
          Käufern über den Abschluss entscheidet. Getrennt formuliert von der
          First-Move-Zusage: andere Bedingung, andere Folge. */}
      <section className="mv-section mv-section--tight" aria-labelledby="bl-prot-h">
        <span className="mv-label">{b.protectionLabel}</span>
        <h2 className="mv-h2" id="bl-prot-h" style={{ marginTop: 14 }}>
          {b.protectionH}
        </h2>
        <div className="mv-rule" />
        <p className="mv-serif" style={{ maxWidth: "58ch", fontSize: "clamp(16px, 1.8vw, 20px)", lineHeight: 1.5 }}>
          {b.protectionFull}
        </p>
      </section>

      <Questions label={b.questionsLabel} items={b.questions} id="bl-close" />
    </>
  );
}
