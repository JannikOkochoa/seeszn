import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import Archive from "@/components/case-studies/Archive";
import { de as study } from "@/lib/case-studies/de";
import { buildMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";

// ─── Ergebnisse ──────────────────────────────────────────────────────────────
// Eine öffentliche Case Study. Bewusst ein Register mit einem Eintrag statt
// eines Rasters, das mit Platzhaltern aufgefüllt wird.

export const metadata: Metadata = buildMetadata({
  title: "Ergebnisse: SEO & AIO Case Studies | SEESZN",
  description:
    "Dokumentierte SEESZN-Ergebnisse. Eine Case Study aus dem Tourismus: Ausgangslage, Maßnahmen, Ergebnis in Google und AI Search sowie der Messaufbau dahinter.",
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
      "@id": `${SITE_URL}${study.path}#article`,
      name: study.meta.h1Text,
      about: "Tourismus",
      url: `${SITE_URL}${study.path}`,
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
