import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import FrenchBeretCase from "@/components/case-studies/french-beret/FrenchBeretCase";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import {
  FB_CLIENT_URL,
  FB_FIGURES,
  FB_H1_TEXT,
  FB_INDEX_PATH,
  FB_META,
  FB_PATH,
} from "@/lib/case-studies/french-beret";

// ─── Case Study: French Beret — E-Commerce & Search Architecture ─────────────
// Deutsch only. Es gibt keine englische Fassung, also auch kein hreflang-Paar:
// die Seite ist selbstreferenzierend kanonisch.

export const metadata: Metadata = {
  ...buildMetadata({
    title: FB_META.title,
    description: FB_META.description,
    path: FB_PATH,
    locale: "de",
    type: "article",
    ogImage: FB_META.ogImage,
  }),
  openGraph: {
    type: "article",
    url: `${SITE_URL}${FB_PATH}`,
    siteName: "SEESZN",
    title: FB_META.ogTitle,
    description: FB_META.ogDescription,
    locale: "de_DE",
    images: [
      {
        url: FB_META.ogImage,
        width: 1536,
        height: 1024,
        alt: "French Beret in Schwarz, Creme und Braun in einer ruhigen Produktkomposition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: FB_META.ogTitle,
    description: FB_META.ogDescription,
    images: [FB_META.ogImage],
  },
};

const url = `${SITE_URL}${FB_PATH}`;

// Nur, was auch sichtbar auf der Seite steht: der Artikel selbst, seine Themen,
// die genannte Marke und der Pfad dorthin. Keine Bewertungen, keine Angebote,
// keine FAQ-Attrappe.
const article = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${url}#article`,
  headline: FB_H1_TEXT,
  description: FB_META.description,
  inLanguage: "de-DE",
  mainEntityOfPage: url,
  url,
  datePublished: FB_META.datePublished,
  dateModified: FB_META.dateModified,
  image: `${SITE_URL}${FB_META.ogImage}`,
  articleSection: "Case Study",
  author: { "@id": `${SITE_URL}/#organization` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  about: FB_META.about.map((name) => ({ "@type": "Thing", name })),
  mentions: [{ "@type": "Organization", name: "French Beret", url: FB_CLIENT_URL }],
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Ergebnisse", item: `${SITE_URL}${FB_INDEX_PATH}` },
    { "@type": "ListItem", position: 3, name: "French Beret", item: url },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[article, breadcrumb]} />
      <FrenchBeretCase />
      {/* Die Kernzahlen zusätzlich als ein zusammenhängender Satz — identisch zu
          den sichtbaren Werten in Abschnitt 06, kein zusätzlicher Claim. */}
      <p className="tc-sr">
        {`French Beret: ${FB_FIGURES.impressions} Google-Impressionen, ${FB_FIGURES.clicks} organische Klicks und eine durchschnittliche Position von ${FB_FIGURES.position} in einem Messfenster von ${FB_FIGURES.windowMonthsIn}. Quelle: Google Search Console.`}
      </p>
    </>
  );
}
