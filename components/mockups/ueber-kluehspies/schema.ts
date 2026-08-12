// ─── Über Klühspies — strukturierte Daten ───────────────────────────────────
// Ein einziger @graph mit drei Knoten: TravelAgency (Subtyp von LocalBusiness
// und präziser als Organization), FAQPage und BreadcrumbList.
//
// Zwei Regeln bestimmen den Aufbau:
//
// 1. Jeder Wert kommt aus ./content.ts, also aus derselben Konstante, die die
//    Komponente rendert. Die FAQ-Antworten sind damit zwangsläufig wörtlich der
//    sichtbare Seitentext und können nicht auseinanderlaufen.
// 2. Nicht belegte Felder fehlen, statt geschätzt zu werden. Betrifft aktuell
//    foundingDate (Gründungsjahr nirgends veröffentlicht) und aggregateRating
//    (keine öffentlich einsehbare, belastbare Bewertungsgrundlage; eine
//    erfundene Bewertung wäre ein Rich-Result-Verstoß).
//
// Die URLs zeigen auf die spätere Produktionsadresse unter
// klassenfahrten-kluehspies.de, nicht auf die Mockup-Route: das Schema
// beschreibt Klühspies, nicht die Vorschau unter seeszn.com.

import {
  CONTENT_STAND,
  PRODUCTION_SEO,
  URLS,
  contactSection,
  faq,
  organization,
} from "./content";

const ORG_ID = `${URLS.home}#organization`;
const PAGE_ID = `${PRODUCTION_SEO.canonical}#webpage`;

export function buildJsonLd() {
  const travelAgency = {
    "@type": "TravelAgency",
    "@id": ORG_ID,
    name: organization.name,
    legalName: organization.legalName,
    description: organization.description,
    url: URLS.home,
    telephone: organization.telephone,
    faxNumber: organization.faxNumber,
    email: organization.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: organization.address.street,
      postalCode: organization.address.postalCode,
      addressLocality: organization.address.locality,
      addressCountry: organization.address.country,
    },
    openingHours: organization.openingHours,
    award: [...organization.awards],
    memberOf: organization.memberOf.map((name) => ({
      "@type": "Organization",
      name,
    })),
    areaServed: { "@type": "Country", name: "Deutschland" },
    knowsLanguage: "de",
    sameAs: [...organization.sameAs],
  };

  // FAQPage ist ein Subtyp von WebPage, deshalb trägt derselbe Knoten die
  // Seitenangaben: Aktualität über dateModified, Verantwortung über reviewedBy.
  const faqPage = {
    "@type": "FAQPage",
    "@id": PAGE_ID,
    url: PRODUCTION_SEO.canonical,
    name: PRODUCTION_SEO.title,
    description: PRODUCTION_SEO.description,
    inLanguage: "de-DE",
    dateModified: CONTENT_STAND.iso,
    about: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    reviewedBy: {
      "@type": "Person",
      name: contactSection.person.name,
      jobTitle: contactSection.person.role,
      worksFor: { "@id": ORG_ID },
    },
    breadcrumb: { "@id": `${PRODUCTION_SEO.canonical}#breadcrumb` },
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${PRODUCTION_SEO.canonical}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: URLS.home },
      {
        "@type": "ListItem",
        position: 2,
        name: "Über Klühspies",
        item: PRODUCTION_SEO.canonical,
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [travelAgency, faqPage, breadcrumb],
  };
}

/**
 * Serialisierung für dangerouslySetInnerHTML. `<` wird zu < ersetzt, damit
 * ein Zeichen aus den Inhalten das script-Element nicht vorzeitig schließen
 * kann. Vorgehen nach node_modules/next/dist/docs/01-app/02-guides/json-ld.md.
 */
export function jsonLdString(): string {
  return JSON.stringify(buildJsonLd()).replace(/</g, "\\u003c");
}
