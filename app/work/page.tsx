import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import Archive from "@/components/case-studies/Archive";
import { de as study } from "@/lib/case-studies/de";
import { FB_H1_TEXT, FB_PATH } from "@/lib/case-studies/french-beret";
import { PA_H1_TEXT, PA_PATH } from "@/lib/case-studies/paid-acquisition";
import { buildMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";

// ─── Ergebnisse ──────────────────────────────────────────────────────────────
// Ein Register mit drei Einträgen entlang der strategischen Logik BUILD /
// TRANSFORM / SCALE. Alle drei Case Studies sind veröffentlicht und stehen
// deshalb im Schema. Der SCALE-Eintrag ist anonymisiert: er nennt die Disziplin
// und die Grössenordnung, aber keinen Kunden.

export const metadata: Metadata = buildMetadata({
  title: "Ergebnisse: SEO, AI Search & E-Commerce Case Studies | SEESZN",
  description:
    "Dokumentierte SEESZN-Ergebnisse aus SEO, AI Search, E-Commerce und Google Ads. Ausgangslage, Maßnahmen, Ergebnis und Messmethodik je Case Study nachvollziehbar offengelegt.",
  path: "/work",
  locale: "de",
  altPath: "/en/work",
});

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/work#collection`,
  name: "Ergebnisse",
  url: `${SITE_URL}/work`,
  inLanguage: "de-DE",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  hasPart: [
    {
      "@type": "Article",
      "@id": `${SITE_URL}${FB_PATH}#article`,
      name: FB_H1_TEXT,
      about: "E-Commerce",
      url: `${SITE_URL}${FB_PATH}`,
    },
    {
      "@type": "Article",
      "@id": `${SITE_URL}${study.path}#article`,
      name: study.meta.h1Text,
      about: "Tourismus",
      url: `${SITE_URL}${study.path}`,
    },
    {
      "@type": "Article",
      "@id": `${SITE_URL}${PA_PATH}#article`,
      name: PA_H1_TEXT,
      about: "Paid Acquisition",
      url: `${SITE_URL}${PA_PATH}`,
    },
  ],
};

export default function WorkPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionSchema,
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: "Ergebnisse", path: "/work" },
          ]),
        ]}
      />
      <Nav />
      <main>
        <Archive locale="de" />
      </main>
      <Footer />
    </>
  );
}
