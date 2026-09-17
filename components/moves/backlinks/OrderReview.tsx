"use client";

// ─── BACKLINKS: die Bestellübersicht ──────────────────────────────────────────
// Der letzte Blick vor der Zahlung. Sie steht an derselben Stelle wie der Knopf,
// den sie ersetzt, damit der Besucher nicht erst suchen muss, was passiert ist.
//
// Sichtbar ist alles, was den Auftrag ausmacht: Menge, Abrechnung, Format,
// Zielmarkt, Stückpreis und Gesamtbetrag. Kein Nebenangebot, kein Zusatzhaken,
// nichts Vorausgewähltes, kein Hinweis auf andere Produkte. Eine Kaufübersicht
// ist keine Entdeckungsfläche.

import { motion, useReducedMotion } from "framer-motion";
import { marketByCode, marketLabel } from "@/lib/moves/markets";
import { useCopy, usePricing } from "@/components/moves/pricing/PricingShell";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function OrderReview({
  quantity,
  monthly,
  typeLabel,
  market,
  unit,
  total,
  saving,
  termMonths,
  busy,
  onBack,
  onPay,
}: {
  quantity: number;
  monthly: boolean;
  typeLabel: string;
  market: string;
  unit: string;
  total: string;
  saving: string | null;
  termMonths: number;
  busy: boolean;
  onBack: () => void;
  onPay: () => void;
}) {
  const t = useCopy().review;
  const { locale } = usePricing();
  const reduced = useReducedMotion();
  const m = marketByCode(market);

  const rows: readonly { k: string; v: string }[] = [
    { k: t.quantity, v: `${quantity} ${t.unit}` },
    // Keine Aussage über Kündigung: die Mindestlaufzeit ist zugesagt, alles
    // danach steht in den Bedingungen und wird hier nicht vorweggenommen.
    { k: t.billing, v: monthly ? t.billingMonthly(termMonths) : t.billingOnce },
    { k: t.format, v: typeLabel },
    { k: t.market, v: `${m.flag} ${marketLabel(m, locale)}` },
    { k: t.perUnit, v: unit },
  ];

  return (
    <motion.div
      className="mv-review"
      role="group"
      aria-label={t.label}
      initial={reduced ? undefined : { opacity: 0, y: 10 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: EASE }}
    >
      <div className="mv-review-head">
        <span className="mv-k">{t.label}</span>
        <button type="button" className="mv-review-back" onClick={onBack}>
          {t.back}
        </button>
      </div>

      <dl className="mv-tier-facts">
        {rows.map((row) => (
          <div className="mv-tier-fact" key={row.k}>
            <dt>{row.k}</dt>
            <dd>{row.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mv-review-total">
        <span className="mv-k">{monthly ? t.totalMonthly : t.totalOnce}</span>
        <span className="mv-review-sum">{total}</span>
        <span className="mv-review-net">
          {t.net}
          {saving ? t.savingSuffix(saving) : ""}
        </span>
        {/* Hier stand der dreifache Monatsbetrag als Mindestbindung. Die
            Mindestlaufzeit steht weiterhin in der Abrechnungszeile darüber
            und benennt die Bindung vollständig. */}
      </div>

      <button
        type="button"
        className="mv-cta"
        data-busy={busy ? "true" : undefined}
        disabled={busy}
        onClick={onPay}
        style={{ width: "100%", marginTop: 20 }}
      >
        {busy ? t.payBusy : t.pay(total)}
        {busy ? null : <span className="mv-cta-arrow" aria-hidden="true">→</span>}
      </button>
    </motion.div>
  );
}
