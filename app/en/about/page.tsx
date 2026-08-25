import type { Metadata } from "next";
import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ManualContents from "@/components/about/ManualContents";
import OperatingManual from "@/components/about/OperatingManual";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { en } from "@/lib/i18n/en";
import { buildMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About SEESZN | A system for measurable growth decisions",
  description:
    "SEESZN reads public signals, identifies the strongest evidence-backed constraint and ships the First Move. The result is measured across a defined window.",
  path: "/en/about",
  locale: "en",
  altPath: "/about",
});

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/en/about#about`,
  url: `${SITE_URL}/en/about`,
  name: "About SEESZN",
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  mainEntity: { "@id": `${SITE_URL}/#organization` },
};

export default function AboutPage() {
  const h = en.aboutPage.hero;
  const sc = en.aboutPage.scanCta;
  return (
    <>
      <JsonLd
        data={[
          aboutSchema,
          breadcrumbSchema([
            { name: "Home", path: "/en" },
            { name: "About", path: "/en/about" },
          ]),
        ]}
      />
      <Nav />
      <main>
        <RoomHero
          index="01"
          room={h.room}
          accession={h.accession}
          roman={[...h.roman]}
          italic={h.italic}
          sub={[...h.sub]}
          note={h.note ? [...h.note] : undefined}
          meta={h.meta}
          cta={h.cta}
          panel={<ManualContents />}
        />
        <OperatingManual />
        <ScanCTA
          index="02"
          roman={sc.roman}
          italic={sc.italic}
          sub={[...sc.sub]}
          closing={sc.closing}
        />
      </main>
      <Footer />
    </>
  );
}
