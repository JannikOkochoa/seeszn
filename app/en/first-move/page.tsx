// ─── /en/first-move ───────────────────────────────────────────────────────────
// Die englische Produktseite. Strukturgleich mit /first-move: derselbe Funnel,
// dieselben Abschnitte, dieselbe Prüfung, dieselbe Anfragestrecke. Verschieden
// ist ausschließlich die Sprache, die als `locale` durchgereicht wird.
//
// Es entsteht hier keine zweite Geschäftslogik: Schwellen, Bewertung, Preis,
// Fristen, Risk Reversal und Aufbewahrung kommen aus denselben gesperrten
// Werten wie auf der deutschen Seite.
//
// Der englische Kaufweg endet unter demselben Anker #start, damit der Übergang
// von /en identisch funktioniert.

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
import { MASTER_FAQ_EN } from "@/lib/first-move/faqEn";
import { MASTER_PROOF_ORDER } from "@/lib/first-move/proof";
import { firstMoveFaq, firstMoveService, firstMoveWebPage } from "@/lib/first-move/schema";
import { MASTER_PATH, EN_MASTER_PATH } from "@/lib/first-move/product";
import { PRICE_DISPLAY_NET_EN } from "@/lib/first-move/productEn";
import { isAdsOAuthEnabled } from "@/lib/first-move/paid";

const TITLE = "SEESZN First Move | Find the acquisition constraint that matters most";
const DESCRIPTION = `SEESZN reads your domain for public signals, verifies the finding, ships one clearly bounded change and documents the result. ${PRICE_DISPLAY_NET_EN}.`;

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: EN_MASTER_PATH,
  locale: "en",
  altPath: MASTER_PATH,
});

export default function EnFirstMovePage() {
  return (
    <div className="fm">
      <FirstMoveStyles />
      <JsonLd
        data={[
          firstMoveWebPage({
            path: EN_MASTER_PATH,
            name: TITLE,
            description: DESCRIPTION,
            locale: "en",
          }),
          firstMoveService({
            path: EN_MASTER_PATH,
            serviceType: "Acquisition diagnosis and bounded implementation",
            locale: "en",
          }),
          firstMoveFaq(MASTER_FAQ_EN, EN_MASTER_PATH),
          breadcrumbSchema([
            { name: "Home", path: "/en" },
            { name: "First Move", path: EN_MASTER_PATH },
          ]),
        ]}
      />

      <a href="#inhalt" className="fm-skip">
        Skip to content
      </a>
      <ProductHeader locale="en" />

      <main id="inhalt">
        <FirstMoveFunnel
          variant="master"
          locale="en"
          adsOAuthEnabled={isAdsOAuthEnabled()}
          heroCopy={
            <HeroCopy
              eyebrow="SEESZN First Move"
              headline={
                <>
                  Where is <span className="fm-acid">growth</span> being left behind?
                </>
              }
              lead="Enter your domain. SEESZN reads the publicly available signals, rules out what fails to explain the situation, then names the next Move."
            />
          }
          heroPlate={<HeroPlate />}
          process={<Process locale="en" />}
          proof={<Proof order={MASTER_PROOF_ORDER} locale="en" />}
          offer={<Offer locale="en" />}
          faq={<Faq items={MASTER_FAQ_EN} locale="en" />}
          final={<FinalCta locale="en" />}
        />
      </main>

      <ProductFooter locale="en" />
    </div>
  );
}
