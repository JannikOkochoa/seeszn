import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ManualContents from "@/components/about/ManualContents";
import OperatingManual from "@/components/about/OperatingManual";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { de } from "@/lib/i18n/de";
import type { Metadata } from "next";
import { buildMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Studio: Über SEESZN | SEESZN",
  description:
    "SEESZN ist ein Sichtbarkeitsstudio: Strategie, Search, Design und Engineering als ein System. Wir bauen Oberflächen, die Maschinen abrufen und Menschen vertrauen.",
  path: "/about",
  locale: "de",
  altPath: "/en/about",
});

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/about#about`,
  url: `${SITE_URL}/about`,
  name: "Studio: Über SEESZN",
  inLanguage: "de-DE",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  mainEntity: { "@id": `${SITE_URL}/#organization` },
};

export default function DeAboutPage() {
  const h = de.aboutPage.hero;
  const sc = de.aboutPage.scanCta;
  return (
    <>
      <JsonLd
        data={[
          aboutSchema,
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: "Studio", path: "/about" },
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
