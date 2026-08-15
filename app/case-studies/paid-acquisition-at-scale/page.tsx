import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import PaidAcquisitionCase from "@/components/case-studies/paid-acquisition/PaidAcquisitionCase";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import {
  PA_FIGURES,
  PA_H1_TEXT,
  PA_IMAGES,
  PA_INDEX_PATH,
  PA_META,
  PA_PATH,
} from "@/lib/case-studies/paid-acquisition";

// ─── Case Study: Paid Acquisition at Scale — anonymized ──────────────────────
// English edition only, so the page is self-referentially canonical and has no
// hreflang pair — same situation as the French Beret case, which is German only.
//
// Nothing on this route names the client: not the slug, not the title, not the
// description, not the OG card, not the structured data. The Article has no
// `mentions` for that reason — the French Beret case names its client there
// because that client is public, and this one is not.

export const metadata: Metadata = {
  ...buildMetadata({
    title: PA_META.title,
    description: PA_META.description,
    path: PA_PATH,
    locale: "en",
    type: "article",
    ogImage: PA_META.ogImage,
  }),
  openGraph: {
    type: "article",
    url: `${SITE_URL}${PA_PATH}`,
    siteName: "SEESZN",
    title: PA_META.ogTitle,
    description: PA_META.ogDescription,
    locale: "en_US",
    images: [
      {
        url: PA_META.ogImage,
        width: PA_IMAGES.hero.width,
        height: PA_IMAGES.hero.height,
        alt: PA_IMAGES.hero.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PA_META.ogTitle,
    description: PA_META.ogDescription,
    images: [PA_META.ogImage],
  },
};

const url = `${SITE_URL}${PA_PATH}`;

// Only what is visible on the page: the article, its subjects and the path to
// it. No ratings, no reviews, no revenue outcomes, no client organisation.
const article = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${url}#article`,
  headline: PA_H1_TEXT,
  description: PA_META.description,
  inLanguage: "en",
  mainEntityOfPage: url,
  url,
  datePublished: PA_META.datePublished,
  dateModified: PA_META.dateModified,
  image: `${SITE_URL}${PA_META.ogImage}`,
  articleSection: "Case Study",
  author: { "@id": `${SITE_URL}/#organization` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  about: PA_META.about.map((name) => ({ "@type": "Thing", name })),
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Results", item: `${SITE_URL}${PA_INDEX_PATH}` },
    { "@type": "ListItem", position: 3, name: "Paid Acquisition at Scale", item: url },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[article, breadcrumb]} />
      <PaidAcquisitionCase />
      {/* The approved figures once more as one connected sentence — identical to
          the values visible in sections 04 to 07, not an additional claim. */}
      <p className="tc-sr">
        {`Anonymized paid acquisition case study: ${PA_FIGURES.spend} in annual Google Ads spend under management, ` +
          `cost per lead from ${PA_FIGURES.cplFrom} into the ${PA_FIGURES.cplTo} range, ` +
          `conversion value from ${PA_FIGURES.valueFrom} to ${PA_FIGURES.valueTo}, an increase of ${PA_FIGURES.multiple}. ` +
          `Client name withheld due to confidentiality.`}
      </p>
    </>
  );
}
