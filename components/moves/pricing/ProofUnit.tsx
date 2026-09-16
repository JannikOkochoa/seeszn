// ─── PREISE: ein Beleg ────────────────────────────────────────────────────────
// Genau einer. Keine Logowand, keine Zitatkarussells, keine fünf Case Studies.
// Die Zahlen stammen aus einem freigegebenen SEESZN-Projekt und werden mit
// Zeitraum und Einordnung ausgewiesen, nie ohne.

"use client";

import Link from "next/link";
import { PROOF_RECORDS } from "@/lib/moves/proof";
import { FIGURES_EN } from "@/lib/case-studies/en";
import { useCopy, usePricing } from "./PricingShell";

export default function ProofUnit({ scope }: { scope: "fm" | "bl" }) {
  const t = useCopy();
  const { locale } = usePricing();
  const record = PROOF_RECORDS.find((r) => r.id === "transform") ?? PROOF_RECORDS[0]!;

  // Die deutschen Belegtexte stammen aus der freigegebenen Case Study. Für die
  // englische Fassung wird nur das übersetzt, was hier gezeigt wird; die Zahlen
  // bleiben identisch. record.before/.after sind serverseitig fest auf
  // Dezimalkomma formatiert (lib/moves/proof.ts); für Englisch wird deshalb die
  // bereits freigegebene englische Schreibweise aus derselben Case Study
  // verwendet, nicht neu formatiert.
  const before = locale === "en" ? FIGURES_EN.aiPositionBefore : record.before;
  const after = locale === "en" ? FIGURES_EN.aiPositionAfter : record.after;
  const metric =
    locale === "en"
      ? "Average brand position across a constant prompt set"
      : record.metric;
  const period = locale === "en" ? "45 days, measured before plus after" : record.period;
  const caseHref = locale === "en" ? (record.caseHrefEn ?? record.caseHref) : record.caseHref;

  return (
    <section className="mv-section mv-section--tight" aria-labelledby={`${scope}-proof-h`}>
      <span className="mv-label" id={`${scope}-proof-h`}>
        {t.proof.label}
      </span>

      <div className="mv-proof-unit">
        <div>
          <span className="mv-proof-figure">
            {before} → {after}
          </span>
          <span className="mv-proof-metric">{metric}</span>
        </div>
        <div>
          <p className="mv-proof-ctx">{t.proof.context}</p>
          <span className="mv-micro">{period}</span>
          {caseHref ? (
            <Link href={caseHref} className="mv-ext-target" style={{ marginTop: 16 }}>
              {t.proof.cta}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
