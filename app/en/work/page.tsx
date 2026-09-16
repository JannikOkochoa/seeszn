import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import Archive from "@/components/case-studies/Archive";
import { en as study } from "@/lib/case-studies/en";
import { PA_H1_TEXT, PA_PATH } from "@/lib/case-studies/paid-acquisition";
import { FB_H1_TEXT_EN, FB_PATH_EN } from "@/lib/case-studies/french-beret";
import { buildMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";

// ─── Work index, English surface ─────────────────────────────────────────────
// The English register lists every case study that is actually published in
// English: e-commerce (French Beret), tourism and the anonymized paid
// acquisition case. Same rule as before, now with one more entry that meets
// it — nothing here promises an English page that doesn't exist.

export const metadata: Metadata = buildMetadata({
  title: "Results: SEO & AIO Case Studies | SEESZN",
  description:
    "Documented SEESZN results: e-commerce search architecture, AI Search visibility in tourism, and paid acquisition at 2.5-3.0M EUR annual Google Ads spend. Starting position, interventions, outcome and measurement setup for each.",
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
      "@id": `${SITE_URL}${FB_PATH_EN}#article`,
      name: FB_H1_TEXT_EN,
      about: "E-Commerce",
      url: `${SITE_URL}${FB_PATH_EN}`,
    },
    {
      "@type": "Article",
      "@id": `${SITE_URL}${study.path}#article`,
      name: study.meta.h1Text,
      about: "Tourism",
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

export default function EnWorkPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionSchema,
          breadcrumbSchema([
            { name: "Home", path: "/en" },
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
