import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import Archive from "@/components/case-studies/Archive";
import { en as study } from "@/lib/case-studies/en";
import { buildMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";

// ─── Work index, English surface ─────────────────────────────────────────────
// Same single-entry archive. The case study itself is published in German only,
// which the lede says plainly rather than implying an English version exists.

export const metadata: Metadata = buildMetadata({
  title: "Results: SEO & AIO Case Studies | SEESZN",
  description:
    "Documented SEESZN results. One case study from the tourism sector: starting position, interventions, outcome in Google and AI Search, and the measurement setup behind it.",
  path: "/en/work",
  locale: "en",
  altPath: "/work",
});

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/en/work#collection`,
  name: "Results",
  url: `${SITE_URL}/en/work`,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  hasPart: [
    {
      "@type": "Article",
      "@id": `${SITE_URL}${study.path}#article`,
      name: study.meta.h1Text,
      about: "Tourism",
      url: `${SITE_URL}${study.path}`,
    },
  ],
};

export default function EnWorkPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionSchema,
          breadcrumbSchema([
            { name: "Start", path: "/en" },
            { name: "Results", path: "/en/work" },
          ]),
        ]}
      />
      <Nav />
      <main>
        <Archive locale="en" />
      </main>
      <Footer />
    </>
  );
}
