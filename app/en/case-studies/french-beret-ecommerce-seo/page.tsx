import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import FrenchBeretCase from "@/components/case-studies/french-beret/FrenchBeretCase";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import {
  FB_CLIENT_URL,
  FB_FIGURES_EN,
  FB_H1_TEXT_EN,
  FB_INDEX_PATH_EN,
  FB_META_EN,
  FB_PATH,
  FB_PATH_EN,
} from "@/lib/case-studies/french-beret";

// ─── Case Study: French Beret — E-Commerce & Search Architecture ─────────────
// English edition. Shares the FrenchBeretCase component and layout with the
// German page at FB_PATH; only the content and locale differ.

export const metadata: Metadata = {
  ...buildMetadata({
    title: FB_META_EN.title,
    description: FB_META_EN.description,
    path: FB_PATH_EN,
    locale: "en",
    altPath: FB_PATH,
    type: "article",
    ogImage: FB_META_EN.ogImage,
  }),
  openGraph: {
    type: "article",
    url: `${SITE_URL}${FB_PATH_EN}`,
    siteName: "SEESZN",
    title: FB_META_EN.ogTitle,
    description: FB_META_EN.ogDescription,
    locale: "en_US",
    images: [
      {
        url: FB_META_EN.ogImage,
        width: 1536,
        height: 1024,
        alt: "French Beret in black, cream and brown in a calm product composition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: FB_META_EN.ogTitle,
    description: FB_META_EN.ogDescription,
    images: [FB_META_EN.ogImage],
  },
};

const url = `${SITE_URL}${FB_PATH_EN}`;

// Only what is actually visible on the page: the article itself, its topics,
// the named brand and the path to it. No reviews, no offers, no fake FAQ.
const article = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${url}#article`,
  headline: FB_H1_TEXT_EN,
  description: FB_META_EN.description,
  inLanguage: "en",
  mainEntityOfPage: url,
  url,
  datePublished: FB_META_EN.datePublished,
  dateModified: FB_META_EN.dateModified,
  image: `${SITE_URL}${FB_META_EN.ogImage}`,
  articleSection: "Case Study",
  author: { "@id": `${SITE_URL}/#organization` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  about: FB_META_EN.about.map((name) => ({ "@type": "Thing", name })),
  mentions: [{ "@type": "Organization", name: "French Beret", url: FB_CLIENT_URL }],
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en` },
    { "@type": "ListItem", position: 2, name: "Results", item: `${SITE_URL}${FB_INDEX_PATH_EN}` },
    { "@type": "ListItem", position: 3, name: "French Beret", item: url },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[article, breadcrumb]} />
      <FrenchBeretCase locale="en" />
      {/* The headline numbers, also as one connected sentence — identical to
          the visible values in section 06, no additional claim. */}
      <p className="tc-sr">
        {`French Beret: ${FB_FIGURES_EN.impressions} Google impressions, ${FB_FIGURES_EN.clicks} organic clicks and an average position of ${FB_FIGURES_EN.position} in a measurement window of ${FB_FIGURES_EN.windowMonthsIn}. Source: Google Search Console.`}
      </p>
    </>
  );
}
