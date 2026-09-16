// ─── MOVES: Structured Data ───────────────────────────────────────────────────
// Ausgezeichnet wird nur, was auf der Seite auch sichtbar steht.
//
// Bewusst kein Product-Schema: das hier sind Dienstleistungen, keine Waren, und
// Product ohne echte SKU, Verfügbarkeit und Versandlogik ist eine Auszeichnung,
// die zwar durchgeht, aber nichts Wahres beschreibt. Service mit Offer trifft
// die Sache und ist für die Preisangabe ausreichend.
//
// Kein aggregateRating, keine review: es gibt keine erhobenen Bewertungen.
// Erfundene Sterne wären die billigste und die dümmste Art, diese Fläche zu
// beschädigen.

import { SITE_URL, faqSchema } from "@/lib/seo";
import { MOVES_PATH } from "./catalog";
import { priceTable } from "./backlinks";
import type { MoveCategory } from "./types";

const abs = (path: string) => `${SITE_URL}${path}`;

/** Die Fläche als Dienstleistung mit den tatsächlich kaufbaren Stufen. */
export function moveServiceSchema(category: MoveCategory) {
  const offers = category.tiers
    .filter((tier) => tier.priceEur !== null)
    .map((tier) => ({
      "@type": "Offer",
      name: `${category.label} ${tier.name}`,
      description: tier.kicker,
      price: String(tier.priceEur),
      priceCurrency: "EUR",
      // Nettopreis. Die Seite sagt das an jeder Stelle mit dazu.
      valueAddedTaxIncluded: false,
      availability: "https://schema.org/InStock",
      url: abs(`${MOVES_PATH}/${category.slug}`),
      ...(tier.billing === "monthly"
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: String(tier.priceEur),
              priceCurrency: "EUR",
              billingDuration: 1,
              billingIncrement: 1,
              unitCode: "MON",
            },
          }
        : {}),
    }));

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `SEESZN ${category.label}`,
    serviceType: category.oneLiner,
    description: category.definition,
    url: abs(`${MOVES_PATH}/${category.slug}`),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "Country", name: "Deutschland" },
      { "@type": "Country", name: "Österreich" },
      { "@type": "Country", name: "Schweiz" },
    ],
    availableLanguage: ["de", "en"],
    ...(offers.length ? { offers } : {}),
  };
}

export function moveFaqSchema(category: MoveCategory) {
  return faqSchema(category.faq.map((item) => ({ q: item.q, a: item.a })));
}

/** Die Übersicht als Liste der vier Flächen. Nur Namen und URLs, keine Preise. */
export function movesListSchema(categories: readonly MoveCategory[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SEESZN MOVES",
    url: abs(MOVES_PATH),
    itemListElement: categories.map((category, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: category.label,
      url: abs(`${MOVES_PATH}/${category.slug}`),
    })),
  };
}

/**
 * BACKLINKS als Dienstleistung mit der vollständigen Staffel als Offers.
 *
 * Jede Stufe ist ein eigenes Offer mit dem Preis, der auf der Seite steht. Die
 * Monatsstaffel trägt eine UnitPriceSpecification mit Abrechnungsdauer, damit
 * ein wiederkehrender Preis nicht als Einmalpreis gelesen wird. Keine
 * Bewertungen, keine Verfügbarkeitsfristen, keine erfundenen Werte.
 */
export function backlinksServiceSchema(locale: "de" | "en" = "de") {
  const isEn = locale === "en";
  // Backlinks werden als Panel auf /pricing selbst gekauft, es gibt keine
  // eigene Unterseite. Die Offer-URLs müssen deshalb auf die tatsächlich
  // existierende Preisfläche zeigen, nicht auf einen fiktiven Unterpfad.
  const path = isEn ? "/en/pricing" : MOVES_PATH;
  const offers = [
    ...priceTable("once").map((p) => ({
      "@type": "Offer",
      name: isEn ? `${p.quantity} backlinks, one time` : `${p.quantity} Backlinks, einmalig`,
      price: (p.totalCents / 100).toFixed(2),
      priceCurrency: "EUR",
      valueAddedTaxIncluded: false,
      availability: "https://schema.org/InStock",
      url: abs(path),
      eligibleQuantity: { "@type": "QuantitativeValue", value: p.quantity, unitText: "Backlinks" },
    })),
    ...priceTable("monthly").map((p) => ({
      "@type": "Offer",
      name: isEn ? `${p.quantity} backlinks per month` : `${p.quantity} Backlinks pro Monat`,
      price: (p.totalCents / 100).toFixed(2),
      priceCurrency: "EUR",
      valueAddedTaxIncluded: false,
      availability: "https://schema.org/InStock",
      url: abs(path),
      eligibleQuantity: { "@type": "QuantitativeValue", value: p.quantity, unitText: "Backlinks" },
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: (p.totalCents / 100).toFixed(2),
        priceCurrency: "EUR",
        billingDuration: 1,
        billingIncrement: 1,
        unitCode: "MON",
      },
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "SEESZN BACKLINKS",
    serviceType: isEn
      ? "Backlinks as NAD, blog or forum listings, by target market"
      : "Backlinks als NAD, Blog oder Forum, nach Zielmarkt",
    description: isEn
      ? "Backlinks in three formats, staffed by quantity and selectable by target market. One time or monthly with a ten percent reduction."
      : "Backlinks in drei Formaten, gestaffelt nach Menge und wählbar je Zielmarkt. Einmalig oder monatlich mit zehn Prozent Abzug.",
    url: abs(path),
    provider: { "@id": `${SITE_URL}/#organization` },
    availableLanguage: ["de", "en"],
    offers,
  };
}

/**
 * Die Auszeichnung der Preisfläche, je Sprache.
 *
 * Bewusst knapp: Service mit Offer für beide Produkte, dazu die Brotkrume.
 * Keine FAQPage-Auszeichnung mehr. Google zeigt dafür kein Ergebnisformat
 * mehr, die Pflege kostet bei jeder Textänderung Aufmerksamkeit, und der
 * sichtbare Fragenblock wirkt ohne sie genauso. Keine Bewertungen, keine
 * Rezensionen, keine erfundene Verfügbarkeit.
 *
 * Organization wird nicht wiederholt: die Entität liegt sitewide im Layout,
 * hier wird nur darauf verwiesen.
 */
export function pricingSchema(locale: "de" | "en") {
  const path = locale === "en" ? "/en/pricing" : "/pricing";
  const isEn = locale === "en";

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${abs(path)}#webpage`,
      url: abs(path),
      name: isEn ? "SEESZN Pricing" : "SEESZN Preise",
      inLanguage: isEn ? "en" : "de-DE",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
    },
    backlinksServiceSchema(locale),
    breadcrumb(locale),
  ];
}

function breadcrumb(locale: "de" | "en") {
  const home = locale === "en" ? "/en" : "/";
  const path = locale === "en" ? "/en/pricing" : "/pricing";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SEESZN", item: abs(home) },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "en" ? "Pricing" : "Preise",
        item: abs(path),
      },
    ],
  };
}
