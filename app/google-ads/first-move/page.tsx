// ─── /google-ads/first-move ───────────────────────────────────────────────────
// Der kontextspezifische Einstieg aus Google Ads. Dasselbe Produkt, derselbe
// Preis, derselbe Kaufweg, anderer Message Match.
//
// Wichtig: self-canonical. Diese Seite zeigt NICHT auf /first-move, sonst würde
// eine bezahlte Landingpage ihre eigene Indexierung aufgeben. Sie trägt eigenen
// Titel, eigene Description, eigene H1, eigenen Problemrahmen, eine eigene
// Erklärung des zweistufigen Paid-Vorgehens, eigene Proof-Reihenfolge und eine
// eigene, bewusst kurze FAQ.
//
// V6: Der Kanal ist hier bereits bekannt. Deshalb bleibt im Hero neben der
// Domain nur das Budgetband stehen, nie eine Frage nach dem Diagnosepfad und nie
// eine Aufforderung zum Google-Ads-Zugriff.

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
import { PaidStages } from "@/components/first-move/PaidSections";
import { PAID_FAQ } from "@/lib/first-move/faq";
import { PAID_PROOF_ORDER } from "@/lib/first-move/proof";
import { firstMoveFaq, firstMoveService, firstMoveWebPage } from "@/lib/first-move/schema";
import { MASTER_PATH, PAID_PATH, PRICE_DISPLAY_NET } from "@/lib/first-move/product";
import { isAdsOAuthEnabled } from "@/lib/first-move/paid";

const TITLE = "Google Ads First Move | Budget- und Signalprobleme finden | SEESZN";
const DESCRIPTION = `SEESZN prüft zuerst öffentliche Paid-Acquisition-Signale und vertieft den Befund bei Bedarf per Google Ads Read-only. Ein First Move, ${PRICE_DISPLAY_NET}.`;

// V6-Korrektur: die Paid-Seite trägt ihre eigene, kurze FAQ. Die vollständige
// Master-FAQ wird nicht mehr angehängt, sichtbarer Text und FAQPage-Schema sind
// damit identisch und paid-spezifisch.
const FAQ_ITEMS = PAID_FAQ;

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PAID_PATH,
  locale: "de",
});

export default function GoogleAdsFirstMovePage() {
  return (
    <div className="fm">
      <FirstMoveStyles />
      <JsonLd
        data={[
          firstMoveWebPage({ path: PAID_PATH, name: TITLE, description: DESCRIPTION }),
          firstMoveService({
            path: PAID_PATH,
            serviceType: "Google Ads Analyse und begrenzte Umsetzung",
            description:
              "SEESZN prüft zuerst öffentlich sichtbare Paid-Acquisition-Signale, vertieft den Befund bei Bedarf per Google Ads Read-only, setzt genau eine begrenzte Intervention um und dokumentiert den Vorher/Nachher-Zustand.",
          }),
          firstMoveFaq(FAQ_ITEMS, PAID_PATH),
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: "First Move", path: MASTER_PATH },
            { name: "Google Ads", path: PAID_PATH },
          ]),
        ]}
      />

      <a href="#inhalt" className="fm-skip">
        Zum Inhalt springen
      </a>
      <ProductHeader />

      <main id="inhalt">
        <FirstMoveFunnel
          variant="paid"
          adsOAuthEnabled={isAdsOAuthEnabled()}
          heroCopy={
            <HeroCopy
              eyebrow="Google Ads · SEESZN First Move"
              headline={
                <>
                  Dein Budget läuft. Die Frage ist, welcher <span className="fm-acid">Engpass</span>{" "}
                  es aufhält.
                </>
              }
              lead="Wir prüfen deine Einstiegsseite auf öffentliche Paid-Signale. Zeigt sich ein relevanter Befund, siehst du ihn direkt. Für die Account-Ebene brauchen wir danach lesenden Zugriff."
            />
          }
          heroPlate={<HeroPlate />}
          process={
            <>
              <PaidStages />
              <Process />
            </>
          }
          proof={<Proof order={PAID_PROOF_ORDER} />}
          offer={<Offer />}
          faq={<Faq items={FAQ_ITEMS} />}
          final={<FinalCta paid />}
        />
      </main>

      <ProductFooter />
    </div>
  );
}
