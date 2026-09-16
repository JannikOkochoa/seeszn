"use client";

// ─── PREISE: First Move ───────────────────────────────────────────────────────
// Bewusst kurz. Die Fragen vor einer Zahlung von 2.490 € sind: was ist das, was
// kostet es, wie lange dauert es, wie viel Arbeit macht es mir, was passiert
// wenn es nicht geht. Mehr Abschnitte beantworten keine weitere Frage.
//
// Der Backlink-Preis kommt auf dieser Fläche nicht vor.

import Link from "next/link";
import { track } from "@/lib/moves/analytics";
import { RISK_REVERSAL_FULL } from "@/lib/first-move/product";
import { RISK_REVERSAL_FULL_EN } from "@/lib/first-move/productEn";
import Questions from "./Questions";
import ProofUnit from "./ProofUnit";
import StickyBuy from "./StickyBuy";
import { useCopy, usePricing } from "./PricingShell";

export default function FirstMoveView({ scanHref }: { scanHref: string }) {
  const t = useCopy();
  const { locale } = usePricing();
  const fm = t.firstMove;

  const cta = (
    <Link
      href={scanHref}
      className="mv-cta"
      onClick={() => track("pricing_checkout_started", { product: "first-move", locale })}
    >
      {fm.cta}
      <span className="mv-cta-arrow" aria-hidden="true">→</span>
    </Link>
  );

  return (
    <>
      <section className="mv-fm-head" aria-labelledby="fm-h">
        <div>
          <span className="mv-label">{fm.eyebrow}</span>
          <h1 className="mv-fm-statement" id="fm-h">
            {fm.h1}
          </h1>
          <p className="mv-fm-sub">{fm.definition}</p>
          <p className="mv-fm-surfaces">{fm.surfaces}</p>
        </div>

        <div className="mv-fm-priceblock" id="fm-price">
          <span className="mv-fm-price">{fm.price}</span>
          <span className="mv-fm-price-note">{fm.priceNote}</span>
          <div className="mv-buy-actions">
            {cta}
            <p className="mv-cfg-terms">{fm.ctaNote}</p>
          </div>
        </div>
      </section>

      <div className="mv-specs">
        {fm.specs.map((spec) => (
          <div className="mv-spec" key={spec.k}>
            <span className="mv-spec-v">{spec.v}</span>
            <span className="mv-spec-k">{spec.k}</span>
          </div>
        ))}
      </div>

      {/* ── Drei Schritte, nicht sieben ───────────────────────────────────── */}
      <section className="mv-section mv-section--tight">
        <div className="mv-steps">
          {fm.steps.map((step) => (
            <div className="mv-stepline" key={step.n}>
              <span className="mv-stepline-n">{step.n}</span>
              <span className="mv-stepline-l">{step.label}</span>
              <p className="mv-stepline-b">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ProofUnit scope="fm" />

      {/* ── Die Zusage ────────────────────────────────────────────────────── */}
      <section className="mv-section mv-section--tight" aria-labelledby="fm-risk-h">
        <span className="mv-label">{fm.guaranteeLabel}</span>
        <h2 className="mv-h2" id="fm-risk-h" style={{ marginTop: 14 }}>
          {fm.guaranteeH}
        </h2>
        <div className="mv-rule" />
        <p className="mv-serif" style={{ maxWidth: "56ch", fontSize: "clamp(16px, 1.8vw, 20px)", lineHeight: 1.5 }}>
          {locale === "en" ? RISK_REVERSAL_FULL_EN : RISK_REVERSAL_FULL}
        </p>
      </section>

      <Questions label={fm.questionsLabel} items={fm.questions} id="fm-close" />

      <StickyBuy
        name={fm.eyebrow}
        detail={`${fm.price} · ${fm.priceNote}`}
        cta={t.sticky.continueLabel}
        href={scanHref}
        afterId="fm-price"
        untilId="fm-close"
      />
    </>
  );
}
