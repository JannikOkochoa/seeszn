// ─── /first-move ──────────────────────────────────────────────────────────────
// Die Master-Produktseite. Self-canonical, index und follow. Sie trägt den
// gesamten Kaufweg: Domain, öffentliche Prüfung, Signal, Proof, Angebot, Fit
// Check und Anfrage.
//
// V6-Sequenz: Hero → Prüfung → Signal → passender Proof → Ablauf → Ergebnisse →
// Angebot → Fit Check → Start → FAQ. Wer das Produkt schon kennt, springt über
// den Header-CTA direkt ins Angebot.
//
// Die Seite nutzt den fokussierten Product Header statt der Agenturnavigation.
// Alles Kaufentscheidende ist server-gerendert und wird als Slot an den Funnel
// übergeben, damit es im HTML steht und nicht auf JavaScript wartet.

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import FirstMoveStyles from "@/components/first-move/styles";
import { ProductFooter, ProductHeader } from "@/components/first-move/Chrome";
import FirstMoveFunnel from "@/components/first-move/Funnel";
import {
  Faq,
  FinalCta,
  HeroCopy,
  HeroPlate,
  Offer,
  Process,
  Proof,
} from "@/components/first-move/Sections";
import { MASTER_FAQ } from "@/lib/first-move/faq";
import { MASTER_PROOF_ORDER } from "@/lib/first-move/proof";
import { firstMoveFaq, firstMoveService, firstMoveWebPage } from "@/lib/first-move/schema";
import { MASTER_PATH, PRICE_DISPLAY_NET } from "@/lib/first-move/product";
import { isAdsOAuthEnabled } from "@/lib/first-move/paid";

const TITLE = "SEESZN First Move | Den wichtigsten Akquisitionsengpass finden";
const DESCRIPTION = `SEESZN prüft deine Domain auf öffentliche Signale, verifiziert den Befund, setzt eine klar begrenzte Änderung um und dokumentiert das Ergebnis. ${PRICE_DISPLAY_NET}.`;

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: MASTER_PATH,
  locale: "de",
});

export default function FirstMovePage() {
  return (
    <div className="fm">
      <FirstMoveStyles />
      <JsonLd
        data={[
          firstMoveWebPage({ path: MASTER_PATH, name: TITLE, description: DESCRIPTION }),
          firstMoveService({
            path: MASTER_PATH,
            serviceType: "Akquisitionsdiagnose und begrenzte Umsetzung",
          }),
          firstMoveFaq(MASTER_FAQ, MASTER_PATH),
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: "First Move", path: MASTER_PATH },
          ]),
        ]}
      />

      <a href="#inhalt" className="fm-skip">
        Zum Inhalt springen
      </a>
      <ProductHeader />

      <main id="inhalt">
        <FirstMoveFunnel
          variant="master"
          adsOAuthEnabled={isAdsOAuthEnabled()}
          heroCopy={
            <HeroCopy
              eyebrow="SEESZN First Move"
              headline={
                <>
                  Finde den nächsten <span className="fm-acid">Engpass</span>, den wir belegen und
                  direkt beheben können.
                </>
              }
              lead="Wir prüfen deine Domain auf öffentliche Signale. Wenn sich ein relevanter Befund zeigt, siehst du ihn direkt. Vor einer Umsetzung verifizieren wir ihn."
            />
          }
          heroPlate={<HeroPlate />}
          process={<Process />}
          proof={<Proof order={MASTER_PROOF_ORDER} />}
          offer={<Offer />}
          faq={<Faq items={MASTER_FAQ} />}
          final={<FinalCta />}
        />
      </main>

      <ProductFooter />
    </div>
  );
}
