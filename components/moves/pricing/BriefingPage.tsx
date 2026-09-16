// ─── PREISE: die Rückkehr aus Stripe ───────────────────────────────────────────
// Beide Sprachfassungen rendern dieselbe Komponente. Sie tut zwei Dinge und
// sonst nichts: sie bestätigt den Kauf, und sie holt die sechs Angaben, ohne
// die nicht angefangen werden kann.
//
// Kein Konto, keine Registrierung, keine zweite Zahlungsaufforderung. Die
// Bestellreferenz ist die Kennung, und sie steht sichtbar auf der Seite.
//
// Der Kopf ist derselbe reduzierte Kopf wie die Preisfläche, der Footer
// derselbe minimale Footer: ein Checkout ist keine Entdeckungsfläche, hier
// gilt die Regel noch strenger als auf der Preisfläche selbst.

import Link from "next/link";
import ScrollReset from "@/components/ScrollReset";
import MovesStyles from "@/components/moves/styles";
import PricingHeader from "./PricingHeader";
import PricingFooter from "./PricingFooter";
import Brief from "@/components/moves/Brief";
import { ViewTracker } from "@/components/moves/Interactions";
import { isBacklinkSku, tierBySku } from "@/lib/moves/catalog";
import { euro, priceFor, type PurchaseMode } from "@/lib/moves/backlinks";
import { orderBySession } from "@/lib/moves/orders";
import { pricingCopy, type MovesLocale } from "@/lib/moves/i18n";
import { PRICING_PATH } from "@/lib/moves/pricingMeta";

export function briefingPage(locale: MovesLocale) {
  return async function BriefingRoute({
    searchParams,
  }: {
    searchParams: Promise<{ session_id?: string }>;
  }) {
    const { session_id: sessionId } = await searchParams;
    const order = sessionId ? await orderBySession(sessionId) : null;
    const t = pricingCopy(locale).briefing;

    // Zwei Produktarten treffen hier zusammen. Die Katalogstufen haben einen
    // Eintrag in catalog.ts (ein inzwischen stillgelegter Weg, siehe dort),
    // die Backlink-Konfiguration trägt ihre Angaben im Schlüssel selbst
    // (backlinks-<modus>-<menge>). Beide werden auf dieselbe kleine
    // Beleganzeige abgebildet.
    const catalogProduct = order && !isBacklinkSku(order.sku) ? tierBySku(order.sku) : null;
    const backlinkOrder = order && isBacklinkSku(order.sku) ? parseBacklinkSku(order.sku) : null;
    const receipt = catalogProduct
      ? {
          title: `${catalogProduct.category.label} ${catalogProduct.tier.name}`,
          amount: `${catalogProduct.tier.priceDisplay} ${catalogProduct.tier.priceNote}`,
          timing: catalogProduct.tier.timing,
          next: catalogProduct.category.process[2]?.body ?? "",
          category: catalogProduct.category,
          tier: catalogProduct.tier,
        }
      : backlinkOrder
        ? {
            title: t.backlinkTitle(backlinkOrder.quantity),
            amount: `${euro(backlinkOrder.totalCents)} ${
              backlinkOrder.mode === "monthly" ? t.backlinkAmountMonthly : t.backlinkAmountOnce
            }`,
            timing: t.backlinkTiming,
            next: t.backlinkNext,
            category: null,
            tier: null,
          }
        : null;

    return (
      <>
        <ScrollReset />
        <PricingHeader locale={locale} context={`${pricingCopy(locale).header.context} / CHECKOUT`} />
        <div className="mv mv-pricing">
          <MovesStyles />
          <main>
            <section className="mv-hero" aria-labelledby="mv-brief-h">
              <div className="mv-hero-top">
                <span className="mv-index">{t.brand}</span>
                <span className="mv-label">{order ? t.statusPaid : t.statusNoOrder}</span>
              </div>

              {order && receipt ? (
                <>
                  <ViewTracker event="checkout_completed" payload={{ sku: order.sku, locale }} />

                  <h1 className="mv-h1" style={{ fontSize: "clamp(32px, 4.6vw, 64px)" }}>
                    <span className="mv-mask">
                      <span style={{ ["--mask-delay" as string]: "60ms" }}>{t.thanksLine1}</span>
                    </span>
                    <span className="mv-mask">
                      <span style={{ ["--mask-delay" as string]: "170ms" }}>
                        {t.thanksPre}
                        <span className="mv-accent">{t.thanksAccent}</span>
                        {t.thanksPost}
                      </span>
                    </span>
                  </h1>
                  <div className="mv-rule" />

                  <div className="mv-brief" style={{ marginTop: 10 }}>
                    <div className="mv-receipt">
                      <dl>
                        <div className="mv-tier-fact">
                          <dt>{t.receiptRef}</dt>
                          <dd>{order.orderRef}</dd>
                        </div>
                        <div className="mv-tier-fact">
                          <dt>{t.receiptProduct}</dt>
                          <dd>{receipt.title}</dd>
                        </div>
                        <div className="mv-tier-fact">
                          <dt>{t.receiptAmount}</dt>
                          <dd>{receipt.amount}</dd>
                        </div>
                        <div className="mv-tier-fact">
                          <dt>{t.receiptTime}</dt>
                          <dd>{receipt.timing}</dd>
                        </div>
                        <div className="mv-tier-fact">
                          <dt>{t.receiptNext}</dt>
                          <dd>{receipt.next}</dd>
                        </div>
                      </dl>
                      <p className="mv-micro" style={{ marginTop: 18, letterSpacing: "0.1em" }}>
                        {t.invoiceNote}
                      </p>
                    </div>

                    <Brief
                      sessionId={sessionId!}
                      orderRef={order.orderRef}
                      category={receipt.category}
                      tier={receipt.tier}
                      alreadyBriefed={order.briefed}
                      t={t.form}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h1 className="mv-h1" style={{ fontSize: "clamp(30px, 4.2vw, 56px)" }}>
                    {t.noOrderH1a}
                    <br />
                    {t.noOrderH1b}
                    <span className="mv-accent">{t.noOrderAccent}</span>.
                  </h1>
                  <div className="mv-rule" />
                  <p className="mv-lead">
                    {t.noOrderBodyPre}{" "}
                    <a href="mailto:hello@seeszn.com" className="mv-secondary">
                      hello@seeszn.com
                    </a>
                    {t.noOrderBodyPost}
                  </p>
                  <div className="mv-hero-actions">
                    <Link href={PRICING_PATH[locale]} className="mv-cta">
                      {t.noOrderCta}
                      <span className="mv-cta-arrow" aria-hidden="true">→</span>
                    </Link>
                  </div>
                </>
              )}
            </section>
          </main>
        </div>
        <PricingFooter locale={locale} />
      </>
    );
  };
}

/**
 * Liest Kaufart und Menge aus einem Backlink-Schlüssel und holt den Preis aus
 * der Staffel. Der Schlüssel ist serverseitig vergeben, trotzdem wird jeder
 * Wert gegen die Staffel geprüft: ein Schlüssel, der dort nicht steht, ergibt
 * keinen Beleg.
 */
function parseBacklinkSku(
  sku: string,
): { mode: PurchaseMode; quantity: number; totalCents: number } | null {
  const [, mode, raw] = sku.split("-");
  const quantity = Number(raw);
  if (!Number.isInteger(quantity)) return null;
  const purchaseMode: PurchaseMode = mode === "monthly" ? "monthly" : "once";
  const price = priceFor(quantity, purchaseMode);
  if (!price) return null;
  return { mode: purchaseMode, quantity, totalCents: price.totalCents };
}
