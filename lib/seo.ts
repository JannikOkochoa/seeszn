// ─── Central SEO configuration & helpers ─────────────────────────────────────
// German-first. The /de surface is the canonical primary surface; the English
// tree at the root is kept as a secondary language alternate.

import type { Metadata } from "next";

export const SITE_URL = "https://seeszn.com";
export const SITE_NAME = "SEESZN";
export const ORG_LEGAL_NAME = "Okri Holdings LLC";
export const CONTACT_EMAIL = "hello@seeszn.com";

/** Default social/OG image. Swap for a dedicated 1200×630 card when available. */
export const DEFAULT_OG_IMAGE = "/seeszn-brand-identity.png";

type Locale = "de" | "en";

interface BuildMetaInput {
  /** Page <title>. The SEESZN suffix is appended automatically unless absolute. */
  title: string;
  description: string;
  /** Path beginning with "/" — e.g. "/geo-agentur". */
  path: string;
  locale?: Locale;
  /** Path of the alternate-language version, if one exists. */
  altPath?: string;
  ogImage?: string;
  /** Article/research pages set this so OG type is "article". */
  type?: "website" | "article";
  noindex?: boolean;
}

const abs = (path: string) => `${SITE_URL}${path}`;

/**
 * Builds a complete Metadata object: title, description, canonical, hreflang
 * alternates, OpenGraph and Twitter cards. Keeps every page consistent.
 */
export function buildMetadata({
  title,
  description,
  path,
  locale = "de",
  altPath,
  ogImage = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
}: BuildMetaInput): Metadata {
  const fullTitle = title.includes("SEESZN") ? title : `${title} | SEESZN`;

  // hreflang map. x-default points at the German surface (German-first).
  const languages: Record<string, string> = {};
  if (locale === "de") {
    languages["de-DE"] = abs(path);
    languages["x-default"] = abs(path);
    if (altPath) languages["en"] = abs(altPath);
  } else {
    languages["en"] = abs(path);
    if (altPath) {
      languages["de-DE"] = abs(altPath);
      languages["x-default"] = abs(altPath);
    }
  }

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: abs(path),
      languages,
    },
    openGraph: {
      type,
      url: abs(path),
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      locale: locale === "de" ? "de_DE" : "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

// ─── Reusable JSON-LD graph builders ─────────────────────────────────────────

/**
 * The SEESZN offer architecture — four engagements, expressed once here so the
 * sitewide Organization entity and any Service markup stay consistent. Names and
 * descriptions mirror the wording visible across the homepage, /services and the
 * commercial landing pages. No invented claims.
 */
export const OFFERS: { name: string; serviceType: string; description: string }[] = [
  {
    name: "Visibility Audit",
    serviceType: "KI-Sichtbarkeits-Audit",
    description:
      "Diagnose, wo eine B2B-Marke in Google und in KI-Antworten (ChatGPT, Perplexity, Gemini, Google AI Overviews) fehlt, falsch gelesen oder nicht zitiert wird.",
  },
  {
    name: "Search Architecture",
    serviceType: "SEO & Search Architecture",
    description:
      "Die technische, semantische und inhaltliche Struktur, die eine Marke auffindbar und maschinell verständlich macht: Technical SEO, Sucharchitektur und Entity-Klarheit.",
  },
  {
    name: "Answer Engine Content Layer",
    serviceType: "GEO / AIO Content",
    description:
      "Quellenfähige Seiten, FAQs, Entity-Erklärungen und zitierfähige Inhalte (Citation Readiness) für Generative Engine Optimization und Answer Engine Optimization.",
  },
  {
    name: "Ongoing Visibility System",
    serviceType: "Visibility Care",
    description:
      "Laufende Pflege und Weiterentwicklung der Sichtbarkeit über Google, Google AI Overviews, ChatGPT, Perplexity und Gemini: Sichtbarkeit als System, nicht als Einmalprojekt.",
  },
];

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: ORG_LEGAL_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    logo: abs(DEFAULT_OG_IMAGE),
    slogan: "Sichtbarkeit für B2B-Marken in Google und KI-Antworten.",
    description:
      "SEESZN ist ein Sichtbarkeitsstudio für B2B-Marken. Wir bauen Websites, Inhalte und Sucharchitekturen, die in Google, ChatGPT, Perplexity, Gemini und Google AI Overviews gefunden und zitiert werden.",
    knowsAbout: [
      "SEO",
      "Generative Engine Optimization (GEO)",
      "Answer Engine Optimization (AIO)",
      "AI Overview Optimization",
      "KI-Sichtbarkeit",
      "AI Search Visibility",
      "Entity SEO",
      "Citation Readiness",
      "Content-Architektur",
      "B2B SEO",
    ],
    areaServed: [
      { "@type": "Country", name: "Deutschland" },
      { "@type": "Country", name: "Österreich" },
      { "@type": "Country", name: "Schweiz" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "SEESZN · Sichtbarkeitssystem für B2B-Marken",
      itemListElement: OFFERS.map((o) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: o.name,
          serviceType: o.serviceType,
          description: o.description,
          provider: { "@id": `${SITE_URL}/#organization` },
        },
      })),
    },
    sameAs: [] as string[],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "de-DE",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    serviceType: input.serviceType,
    description: input.description,
    url: abs(input.path),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "Country", name: "Deutschland" },
      { "@type": "Country", name: "Österreich" },
      { "@type": "Country", name: "Schweiz" },
    ],
    availableLanguage: ["de", "en"],
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function articleSchema(input: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    inLanguage: "de-DE",
    mainEntityOfPage: abs(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
