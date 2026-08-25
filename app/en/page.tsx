// ─── /en (englische Startseite) ───────────────────────────────────────────────
// Dieselbe Sequenz wie die deutsche Startseite, dieselben Komponenten, eine
// eigene Copy-Fassung aus lib/home/en.ts. In dieser Datei steht deshalb keine
// Übersetzung und keine Sprachbedingung, nur die Auswahl des Datensatzes.
//
// Die Prüfung läuft gegen dieselbe API mit demselben Regelwerk. Übergeben wird
// nur die Sprache; Schwellen, Bewertung und Ergebniskategorien sind identisch.

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

const content = homeContent("en");

export const metadata: Metadata = buildMetadata({
  title: "SEESZN First Move | Find the constraint, then ship the change",
  description:
    "SEESZN reads Search, AI Search and Google Ads, ranks the strongest evidence-backed constraint, then ships one measurable intervention. Fixed price, implementation and measurement included.",
  path: "/en",
  locale: "en",
  altPath: "/",
});

export default function EnHomePage() {
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
