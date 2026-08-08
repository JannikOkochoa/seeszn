// ─── Metadaten und JSON-LD beider Sprachfassungen ────────────────────────────
// Eine Implementierung, zwei Sprachen. Beide Seiten bekommen dadurch garantiert
// dieselbe Struktur: selbstreferenzierendes Canonical, reziprokes hreflang nach
// dem bestehenden SEESZN-Muster (x-default zeigt auf die deutsche Fassung) und
// dasselbe Article-Schema in der jeweiligen Sprache.

import type { Metadata } from "next";
import type { CaseContent } from "./types";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export function caseMetadata(content: CaseContent): Metadata {
  const m = content.meta;
  return {
    ...buildMetadata({
      title: m.title,
      description: m.description,
      path: content.path,
      locale: content.locale,
      altPath: content.altPath,
      type: "article",
      ogImage: m.ogImage,
    }),
    // OG/Twitter tragen die Kurzfassung der Aussage statt des SEO-Titels.
    openGraph: {
      type: "article",
      url: `${SITE_URL}${content.path}`,
      siteName: "SEESZN",
      title: m.ogTitle,
      description: m.ogDescription,
      locale: content.locale === "de" ? "de_DE" : "en_US",
      images: [
        {
          url: m.ogImage,
          width: content.hero.image.width,
          height: content.hero.image.height,
          alt: content.hero.image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: m.ogTitle,
      description: m.ogDescription,
      images: [m.ogImage],
    },
  };
}

export function caseJsonLd(content: CaseContent) {
  const m = content.meta;
  const url = `${SITE_URL}${content.path}`;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: m.h1Text,
    description: m.description,
    inLanguage: content.locale === "de" ? "de-DE" : "en",
    mainEntityOfPage: url,
    url,
    datePublished: m.datePublished,
    dateModified: m.dateModified,
    image: `${SITE_URL}${m.ogImage}`,
    articleSection: "Case Study",
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: m.about.map((name) => ({ "@type": "Thing", name })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: m.breadcrumbHomeLabel,
        item: content.locale === "de" ? `${SITE_URL}/` : `${SITE_URL}/en`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: m.breadcrumbIndexLabel,
        item: `${SITE_URL}${content.indexPath}`,
      },
      { "@type": "ListItem", position: 3, name: m.breadcrumbLeafLabel, item: url },
    ],
  };

  return [article, breadcrumb];
}
