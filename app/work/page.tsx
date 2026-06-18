import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ArchiveRegister from "@/components/work/ArchiveRegister";
import CaseFiles from "@/components/work/CaseFiles";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { de } from "@/lib/i18n/de";
import { CASES, CASE_SLUGS } from "@/lib/cases";
import type { Metadata } from "next";
import { buildMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Arbeit: Cases & Evidence Archive | SEESZN",
  description:
    "Ausgewählte SEESZN-Cases: RISCHO, SIVIUS und Contentküche. Websites, Sucharchitektur und KI-Sichtbarkeit (GEO/AIO) in laufender Betreuung.",
  path: "/work",
  locale: "de",
  altPath: "/en/work",
});

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/work#collection`,
  name: "Arbeit: Cases & Evidence Archive",
  url: `${SITE_URL}/work`,
  inLanguage: "de-DE",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  hasPart: CASE_SLUGS.map((slug) => ({
    "@type": "CreativeWork",
    "@id": `${SITE_URL}/cases/${slug}#case`,
    name: `${CASES[slug].fullName} · Case`,
    about: CASES[slug].sector,
    url: `${SITE_URL}/cases/${slug}`,
  })),
};

export default function DeWorkPage() {
  const h = de.workPage.hero;
  const c = de.workPage.closer;
  return (
    <>
      <JsonLd
        data={[
          collectionSchema,
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: "Arbeit", path: "/work" },
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
          panel={<ArchiveRegister />}
        />
        <CaseFiles />
        <ScanCTA
          index={c.index}
          label={c.label}
          roman={c.roman}
          italic={c.italic}
          sub={[...c.sub]}
          closing={c.closing}
        />
      </main>
      <Footer />
    </>
  );
}
