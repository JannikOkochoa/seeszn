// ─── PREISE: die gemeinsame Seite ─────────────────────────────────────────────
// Beide Sprachfassungen rendern dieselbe Komponente. Unterschiedlich sind nur
// Sprache, Pfad und die Ziele, die in der jeweiligen Sprache existieren.
//
// Aufbau, bewusst kurz gehalten:
//
//   Kopf (reduziert)  ·  Produktwahl  ·  aktives Produkt  ·  Beleg  ·  Fragen
//   ·  minimaler Footer
//
// Kein zusätzlicher Marketingabschnitt. Was keine Kauffrage beantwortet, steht
// nicht auf dieser Seite.

import JsonLd from "@/components/seo/JsonLd";
import ScrollReset from "@/components/ScrollReset";
import MovesStyles from "@/components/moves/styles";
import PricingHeader from "./PricingHeader";
import PricingFooter from "./PricingFooter";
import PricingShell, { type PricingProduct } from "./PricingShell";
import EntryView from "./EntryView";
import FirstMoveView from "./FirstMoveView";
import BacklinksView from "@/components/moves/backlinks/BacklinksView";
import { ViewTracker } from "@/components/moves/Interactions";
import { pricingCopy, type MovesLocale } from "@/lib/moves/i18n";
import { PRICING_PATH } from "@/lib/moves/pricingMeta";
import { pricingSchema } from "@/lib/moves/schema";
import { PRICING_SCAN_HREF } from "@/lib/moves/pricingMeta";

export function pricingPage(locale: MovesLocale) {
  return async function PricingRoute({
    searchParams,
  }: {
    searchParams: Promise<{ product?: string }>;
  }) {
    const { product } = await searchParams;
    // Serverseitig gelesen, damit ein Besucher aus einer Mail sofort im
    // richtigen Weg landet statt erst den Einstieg zu sehen.
    const initial: PricingProduct | null =
      product === "first-move" || product === "backlinks" ? product : null;

    const t = pricingCopy(locale);

    return (
      <>
        <ScrollReset />
        <PricingHeader locale={locale} context={t.header.context} homeLabel={t.header.home} />
        <div className="mv mv-pricing">
          <MovesStyles />
          <JsonLd data={pricingSchema(locale)} />
          <ViewTracker event="pricing_view" payload={{ entry: initial ?? "choose", locale }} />

          <main>
            <PricingShell
              initial={initial}
              locale={locale}
              basePath={PRICING_PATH[locale]}
              entry={<EntryView />}
              firstMove={<FirstMoveView scanHref={PRICING_SCAN_HREF[locale]} />}
              backlinks={<BacklinksView />}
            />
          </main>
        </div>
        <PricingFooter locale={locale} />
      </>
    );
  };
}
