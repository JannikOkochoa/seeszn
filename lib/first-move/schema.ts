// ─── First Move: Structured Data ──────────────────────────────────────────────
// Die Auszeichnung beschreibt exakt das, was auf der Seite sichtbar steht: einen
// Produktnamen, einen Preis, eine Lieferzeit und die sichtbaren FAQ-Antworten.
//
// Bewusst nicht enthalten: AggregateRating, Review, erfundene Bewertungen,
// erfundene Verfügbarkeiten. Es gibt keine Bewertungsdaten, also gibt es auch
// keine Auszeichnung dafür.
//
// Die Organization-Entity der Website wird wiederverwendet, nicht dupliziert.

import { SITE_URL } from "@/lib/seo";
import {
  DELIVERY_DAYS_MAX,
  DELIVERY_DAYS_MIN,
  PRICE_EUR,
  PRODUCT_DEFINITION,
  PRODUCT_NAME,
} from "./product";
import type { FaqItem } from "./faq";

const abs = (path: string) => `${SITE_URL}${path}`;

export function firstMoveWebPage(input: {
  path: string;
  name: string;
  description: string;
}) {
  const url = abs(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: "de-DE",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${url}#service` },
    provider: { "@id": `${SITE_URL}/#organization` },
  };
}

export function firstMoveService(input: {
  path: string;
  serviceType: string;
  description?: string;
}) {
  const url = abs(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: PRODUCT_NAME,
    serviceType: input.serviceType,
    description: input.description ?? PRODUCT_DEFINITION,
    url,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "Country", name: "Deutschland" },
      { "@type": "Country", name: "Österreich" },
      { "@type": "Country", name: "Schweiz" },
    ],
    availableLanguage: ["de"],
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      price: String(PRICE_EUR),
      priceCurrency: "EUR",
      // Der Preis ist ein Nettopreis für Geschäftskunden. Genau so steht er auch
      // sichtbar auf der Seite.
      valueAddedTaxIncluded: false,
      availability: "https://schema.org/InStock",
      category: "Business service",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: String(PRICE_EUR),
        priceCurrency: "EUR",
        valueAddedTaxIncluded: false,
      },
      deliveryLeadTime: {
        "@type": "QuantitativeValue",
        minValue: DELIVERY_DAYS_MIN,
        maxValue: DELIVERY_DAYS_MAX,
        unitCode: "DAY",
      },
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

export function firstMoveFaq(items: readonly FaqItem[], path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${abs(path)}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
