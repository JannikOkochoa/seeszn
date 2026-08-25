// ─── / (deutsche Startseite) ──────────────────────────────────────────────────
// Die Startseite ist die Entscheidungsfläche für den ersten Kauf, nicht mehr die
// Übersicht über Disziplinen. Sie trägt eine Sequenz mit genau einer dominanten
// Handlung:
//
//   Hero und Domainfeld → Faktenband → Engpass → öffentliche Prüfung →
//   Produktlogik → Proof → System → Wiedererkennung → Angebot → Entscheidung
//
// Search, AI Search und Google Ads sind darin Prüfflächen des Produkts. Es gibt
// keine drei gleichwertigen Einstiege und keinen Servicekatalog.
//
// Der Kopf ist der fokussierte Produktkopf: Marke, Sprache, eine Handlung. Die
// redaktionelle Navigation bleibt auf den Editorial-Seiten; interne Verlinkung
// läuft hier über den Footer und über die Links an den Belegen.
//
// Kaufentscheidende Inhalte sind server-gerendert und stehen im HTML. Der
// Funnel ist die einzige Client-Komponente der Sequenz: er hält den Zustand der
// Prüfung, weil Hero-Feld und Instrument dieselbe Prüfung starten.

import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ScrollReset from "@/components/ScrollReset";
import Footer from "@/components/Footer";
import HomeMoveStyles from "@/components/home/first-move/styles";
import HomeFunnel from "@/components/home/first-move/HomeFunnel";
import {
  Answers,
  Constraint,
  Decision,
  Offer,
  Proof,
  Recognition,
  System,
} from "@/components/home/first-move/Sections";
import { homeContent, HOME_OFFER_ANCHOR, HOME_SCAN_ANCHOR } from "@/lib/home";
import { buildMetadata } from "@/lib/seo";

const content = homeContent("de");

export const metadata: Metadata = buildMetadata({
  title: "SEESZN First Move | Den stärksten Engpass finden und umsetzen",
  description:
    "SEESZN prüft Search, AI Search und Google Ads, priorisiert den stärksten belegbaren Engpass und setzt eine messbare Intervention um. Festpreis, Umsetzung und Messung inklusive.",
  path: "/",
  locale: "de",
  altPath: "/en",
});

export default function DeHomePage() {
  return (
    <>
      <ScrollReset />
      <Nav
        variant="product"
        cta={{
          label: content.hero.cta,
          shortLabel: content.hero.ctaShort,
          href: `#${HOME_SCAN_ANCHOR}`,
        }}
      />
      <div className="hm">
        <HomeMoveStyles />
        <main>
          <HomeFunnel content={content} constraint={<Constraint content={content} />} />
          <Answers content={content} />
          <Proof content={content} />
          <System content={content} />
          <Recognition content={content} />
          <Offer anchor={HOME_OFFER_ANCHOR} content={content} />
          <Decision content={content} />
        </main>
      </div>
      <Footer />
    </>
  );
}
