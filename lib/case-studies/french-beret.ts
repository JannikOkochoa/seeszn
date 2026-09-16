// ─── Case Study: French Beret — E-Commerce & Search Architecture ─────────────
// Kanonische Quelle für alle Inhalte dieser Case Study. Jede Zahl steht genau
// einmal in FIGURES und wird überall referenziert, damit zwei Abschnitte nie
// unterschiedliche Werte für dieselbe Kennzahl zeigen.
//
// DATENDISZIPLIN
// Die vier Kennzahlen unten sind die einzigen Performancewerte dieser Seite.
// Sie stammen aus der Google Search Console des Shops und sind direkt gemessen,
// nicht hochgerechnet. Es gibt keine abgeleiteten Tages- oder Wochenwerte.
//
// DREI EBENEN, DIE NICHT VERMISCHT WERDEN
//   A  Gemessene Performance — die vier Werte oben. Abschnitt 06 zeigt sie in
//      reiner Typografie, ohne jede Abbildung.
//   B  Umgesetzte Systemelemente — Produkte, Collections, redaktionelle Ebene,
//      interne Verbindungen. Abschnitte 04 und 05 beschreiben sie im Text.
//   C  Illustrative Visualisierung — die gelieferten Shop-Darstellungen. Jeder
//      Bildblock trägt genau einmal FB_VISUAL_CAPTION, damit die illustrative
//      Ebene erkennbar bleibt, ohne sie zu kommentieren.
//
// Das mitgelieferte Search-Performance-Chart ist ein gestaltetes Visual und
// keine Messgrundlage. Es wird nicht eingebunden, solange kein echter
// Search-Console-Export vorliegt. Vertrauen vor zusätzlichem Chart.

export const FB_PATH = "/case-studies/french-beret-ecommerce-seo";
export const FB_INDEX_PATH = "/work";
export const FB_CLIENT_URL = "https://french-beret.com";
export const FB_ASSETS = "/case-studies/french-beret";

/** Deutsche Schreibweise: Dezimalkomma, Punkt als Tausendertrenner. */
export const FB_FIGURES = {
  impressions: "752.000",
  impressionsShort: "752K",
  clicks: "3.590",
  position: "7,1",
  products: "245",
  /** Nominativ, für Labels und Tabellenwerte: "Messfenster: 3 Monate". */
  windowMonths: "3 Monate",
  /** Dativ, für den Fließtext nach "in": "in 3 Monaten". */
  windowMonthsIn: "3 Monaten",
} as const;

/** Kurzform der Kernaussage — sichtbare H1, OG-Titel und JSON-LD teilen sie. */
export const FB_H1_TEXT = `${FB_FIGURES.clicks} organische Klicks in ${FB_FIGURES.windowMonthsIn}.`;

export const FB_DISCIPLINE = "SEO · E-Commerce · Information Architecture · Content";

/** Steht einmal je Bildblock. Nicht unter jeder einzelnen Karte wiederholen. */
export const FB_VISUAL_CAPTION = "Konzeptionelle Visualisierung der Systemarchitektur.";

/**
 * Datenstand der ausgewiesenen Kennzahlen. Bewusst monatsgenau: der exakte
 * Tagesstand des Exports ist nicht dokumentiert, und ein präziser wirkender
 * Wert wäre eine Genauigkeit, die die Quelle nicht hergibt.
 */
export const FB_DATA_AS_OF = "August 2026";

export const FB_META = {
  title: "French Beret Case Study: E-Commerce SEO von Grund auf | SEESZN",
  // Bewusst ausgeschrieben statt aus FIGURES zusammengesetzt: im Fließtext
  // heißt das Fenster "drei Monaten", nicht "3 Monate".
  description:
    `Wie SEESZN für French Beret eine Search-Architektur von Grund auf aufgebaut hat: ` +
    `${FB_FIGURES.impressions} Impressionen, ${FB_FIGURES.clicks} organische Klicks, ` +
    `Ø Position ${FB_FIGURES.position} in drei Monaten.`,
  ogTitle: FB_H1_TEXT,
  ogDescription:
    "Case Study: Wie SEESZN für French Beret eine E-Commerce- und Search-Architektur von Grund auf aufgebaut hat.",
  ogImage: `${FB_ASSETS}/french-beret-hero.webp`,
  datePublished: "2026-08-10",
  dateModified: "2026-08-10",
  about: [
    "Search Engine Optimization",
    "E-Commerce",
    "Information Architecture",
    "Content-Architektur",
  ],
} as const;

// ── 02 · Der Case in 20 Sekunden ─────────────────────────────────────────────
// Acht Zeilen, paarweise gesetzt: links die Frage, rechts die Antwort derselben
// Ebene. Marke/Modell, Ausgangslage/Ziel, Ansatz/Umfang, Ergebnis/Messfenster.
export const FB_FACTS: { key: string; value: string }[] = [
  { key: "Marke", value: "French Beret" },
  { key: "Geschäftsmodell", value: "E-Commerce" },
  { key: "Ausgangslage", value: "Aufbau eines neuen Search-getriebenen Commerce-Systems" },
  {
    key: "Ziel",
    value:
      "Organische Nachfrage systematisch erschließen und skalierbare Shop-Strukturen schaffen",
  },
  { key: "Ansatz", value: "SEO, E-Commerce Architecture, Editorial Search" },
  { key: "Umfang", value: `${FB_FIGURES.products} Live-Produkte, Collections, Advice Hub` },
  {
    key: "Ergebnis",
    value: `${FB_FIGURES.impressionsShort} Impressionen · ${FB_FIGURES.clicks} Klicks · Ø Position ${FB_FIGURES.position}`,
  },
  { key: "Messfenster", value: FB_FIGURES.windowMonths },
];

// ── 04 · Von Suchnachfrage zur Shop-Architektur ──────────────────────────────
export type FlowMark =
  | "demand"
  | "collections"
  | "products"
  | "editorial"
  | "links"
  | "discovery";

export const FB_FLOW: { index: string; mark: FlowMark; title: string; text: string }[] = [
  {
    index: "01",
    mark: "demand",
    title: "Search Demand",
    text: "Relevante Suchnachfrage und Suchintention verstehen.",
  },
  {
    index: "02",
    mark: "collections",
    title: "Collection Architecture",
    text: "Nachfrage logisch in kommerzielle Kategorien übersetzen.",
  },
  {
    index: "03",
    mark: "products",
    title: "Product Coverage",
    text: "Relevante Produkte strukturiert auffindbar machen.",
  },
  {
    index: "04",
    mark: "editorial",
    title: "Editorial Content",
    text: "Informationsbedarf beantworten und Expertise aufbauen.",
  },
  {
    index: "05",
    mark: "links",
    title: "Internal Connections",
    text: "Kommerzielle und redaktionelle Seiten sinnvoll verbinden.",
  },
  {
    index: "06",
    mark: "discovery",
    title: "Organic Discovery",
    text: "Mehr relevante Einstiegspunkte über Search schaffen.",
  },
];

export const FB_TAXONOMY = [
  "Material",
  "Farbe",
  "Zielgruppe",
  "Stil",
  "Produkttyp",
  "Pflege",
  "Passform",
] as const;

// ── 06 · Das Ergebnis ────────────────────────────────────────────────────────
export const FB_KPIS: { value: string; label: string }[] = [
  { value: FB_FIGURES.impressions, label: "Google-Impressionen" },
  { value: FB_FIGURES.clicks, label: "Organische Klicks" },
  { value: `Ø ${FB_FIGURES.position}`, label: "Durchschnittliche Position" },
  { value: FB_FIGURES.windowMonths, label: "Messfenster" },
];

/** Kompaktfassung derselben vier Werte für den Hero. */
export const FB_HERO_KPIS: { value: string; label: string }[] = [
  { value: FB_FIGURES.impressionsShort, label: "Google-Impressionen" },
  { value: FB_FIGURES.clicks, label: "Organische Klicks" },
  { value: `Ø ${FB_FIGURES.position}`, label: "Durchschnittliche Position" },
  { value: FB_FIGURES.products, label: "Live-Produkte" },
];

// ── 07 · Die Systembausteine ─────────────────────────────────────────────────
export interface FbModule {
  index: string;
  title: string;
  text: string;
  image: { src: string; width: number; height: number; alt: string };
  /** Breite Bahn statt Rasterzelle. */
  band?: boolean;
}

export const FB_MODULES: FbModule[] = [
  {
    index: "01",
    title: `${FB_FIGURES.products} Live-Produkte`,
    text: "Eine breite Produktabdeckung schafft kommerzielle Einstiegspunkte für unterschiedliche Suchintentionen.",
    image: {
      src: `${FB_ASSETS}/french-beret-products.webp`,
      width: 1448,
      height: 1086,
      alt: "Produktübersicht verschiedener French-Beret-Modelle und Farben in einer gefilterten Listenansicht",
    },
  },
  {
    index: "02",
    title: "Collection Architecture",
    text: "Produkte werden über relevante Dimensionen wie Material, Farbe und Stil strukturiert.",
    image: {
      src: `${FB_ASSETS}/french-beret-collections.webp`,
      width: 1448,
      height: 1086,
      alt: "Darstellung einer nach Material, Farbe und Stil gegliederten Beret-Collection",
    },
  },
  {
    index: "03",
    title: "Advice Hub",
    text: "Redaktionelle Inhalte beantworten Informationsbedarf rund um Auswahl, Styling und Pflege.",
    image: {
      src: `${FB_ASSETS}/french-beret-advice-hub.webp`,
      width: 1448,
      height: 1086,
      alt: "Editorialer Advice Hub mit Inhalten zu Styling, Materialien und Pflege von Berets",
    },
  },
  {
    index: "04",
    title: "Storefront",
    text: "Commerce, Marke und organische Discoverability werden als zusammenhängendes System gedacht.",
    band: true,
    image: {
      src: `${FB_ASSETS}/french-beret-storefront.webp`,
      width: 1717,
      height: 916,
      alt: "Editoriale E-Commerce-Darstellung von French Beret mit Navigation, Markenclaim und Einstieg in den Shop",
    },
  },
];

// ── 08 · Was funktioniert hat ────────────────────────────────────────────────
export const FB_LEARNINGS: { index: string; title: string; text: string }[] = [
  {
    index: "01",
    title: "Architektur vor Content-Masse.",
    text: "Eine klare Struktur trägt weiter als eine große Menge unstrukturierter Inhalte.",
  },
  {
    index: "02",
    title: "Commerce und Content als ein System.",
    text: "Produkte, Kategorien und Inhalte zahlen auf dieselbe Nachfrage ein.",
  },
  {
    index: "03",
    title: "SEO beginnt vor dem ersten Blogartikel.",
    text: "Taxonomie, Navigation und interne Verlinkung sind Teil der Search-Strategie.",
  },
  {
    index: "04",
    title: "Kontinuität statt Einzelaktionen.",
    text: "Search entsteht aus fortlaufendem Optimieren, Messen und Verbessern.",
  },
];

// ── 09 · So messen wir ───────────────────────────────────────────────────────
export const FB_METHOD_FACTS: { key: string; value: string }[] = [
  { key: "Messquelle", value: "Google Search Console, Property des Shops" },
  { key: "Messfenster", value: FB_FIGURES.windowMonths },
  { key: "Kennzahlen", value: "Impressionen · Klicks · durchschnittliche Position" },
  { key: "Darstellung", value: "Direkt gemessene Werte, keine Hochrechnung" },
  { key: "Datenstand", value: FB_DATA_AS_OF },
];

// ── 10 · Nächster Schritt ────────────────────────────────────────────────────
export const FB_RELATED: { label: string; href: string }[] = [
  { label: "Was ist KI-Sichtbarkeit?", href: "/insights/was-ist-ki-sichtbarkeit" },
  { label: "SEO, GEO und AIO im Vergleich", href: "/insights/seo-vs-geo-vs-aio" },
  { label: "Wie wir arbeiten", href: "/services" },
];

export const FB_HERO_IMAGE = {
  src: `${FB_ASSETS}/french-beret-hero.webp`,
  width: 1536,
  height: 1024,
  alt: "French Beret in Schwarz, Creme und Braun in einer ruhigen Produktkomposition auf Travertinsteinen",
};

// ─── English edition ──────────────────────────────────────────────────────────
// Same canonical numbers as FB_FIGURES above, reformatted to English notation
// (comma thousands separator, period decimal) the same way lib/case-studies/en.ts
// reformats the Tourism case's figures. No value here is independently sourced —
// every number is carried over from the German original, which stays the
// factual source of truth.

export const FB_PATH_EN = "/en/case-studies/french-beret-ecommerce-seo";
export const FB_INDEX_PATH_EN = "/en/work";

export const FB_FIGURES_EN = {
  impressions: "752,000",
  impressionsShort: "752K",
  clicks: "3,590",
  position: "7.1",
  products: "245",
  windowMonths: "3 months",
  windowMonthsIn: "3 months",
} as const;

export const FB_H1_TEXT_EN = `${FB_FIGURES_EN.clicks} organic clicks in ${FB_FIGURES_EN.windowMonthsIn}.`;

export const FB_VISUAL_CAPTION_EN = "Conceptual visualization of the system architecture.";

export const FB_META_EN = {
  title: "French Beret Case Study: E-Commerce SEO From the Ground Up | SEESZN",
  description:
    `How SEESZN built a search architecture from the ground up for French Beret: ` +
    `${FB_FIGURES_EN.impressions} impressions, ${FB_FIGURES_EN.clicks} organic clicks, ` +
    `avg. position ${FB_FIGURES_EN.position} in three months.`,
  ogTitle: FB_H1_TEXT_EN,
  ogDescription:
    "Case study: how SEESZN built an e-commerce and search architecture from the ground up for French Beret.",
  ogImage: `${FB_ASSETS}/french-beret-hero.webp`,
  datePublished: "2026-08-10",
  dateModified: "2026-08-10",
  about: ["Search Engine Optimization", "E-Commerce", "Information Architecture", "Content Architecture"],
} as const;

export const FB_FACTS_EN: { key: string; value: string }[] = [
  { key: "Brand", value: "French Beret" },
  { key: "Business model", value: "E-Commerce" },
  { key: "Starting position", value: "Building a new search-driven commerce system" },
  {
    key: "Goal",
    value: "Systematically capture organic demand and create scalable shop structures",
  },
  { key: "Approach", value: "SEO, E-Commerce Architecture, Editorial Search" },
  { key: "Scope", value: `${FB_FIGURES_EN.products} live products, collections, advice hub` },
  {
    key: "Outcome",
    value: `${FB_FIGURES_EN.impressionsShort} impressions · ${FB_FIGURES_EN.clicks} clicks · avg. position ${FB_FIGURES_EN.position}`,
  },
  { key: "Measurement window", value: FB_FIGURES_EN.windowMonths },
];

export const FB_FLOW_EN: { index: string; mark: FlowMark; title: string; text: string }[] = [
  {
    index: "01",
    mark: "demand",
    title: "Search Demand",
    text: "Understand relevant search demand and search intent.",
  },
  {
    index: "02",
    mark: "collections",
    title: "Collection Architecture",
    text: "Translate demand into logical commercial categories.",
  },
  {
    index: "03",
    mark: "products",
    title: "Product Coverage",
    text: "Make relevant products discoverable through clear structure.",
  },
  {
    index: "04",
    mark: "editorial",
    title: "Editorial Content",
    text: "Answer information needs and build expertise.",
  },
  {
    index: "05",
    mark: "links",
    title: "Internal Connections",
    text: "Meaningfully connect commercial and editorial pages.",
  },
  {
    index: "06",
    mark: "discovery",
    title: "Organic Discovery",
    text: "Create more relevant entry points through search.",
  },
];

export const FB_TAXONOMY_EN = [
  "Material",
  "Color",
  "Target audience",
  "Style",
  "Product type",
  "Care",
  "Fit",
] as const;

export const FB_KPIS_EN: { value: string; label: string }[] = [
  { value: FB_FIGURES_EN.impressions, label: "Google impressions" },
  { value: FB_FIGURES_EN.clicks, label: "Organic clicks" },
  { value: `Avg. ${FB_FIGURES_EN.position}`, label: "Average position" },
  { value: FB_FIGURES_EN.windowMonths, label: "Measurement window" },
];

export const FB_HERO_KPIS_EN: { value: string; label: string }[] = [
  { value: FB_FIGURES_EN.impressionsShort, label: "Google impressions" },
  { value: FB_FIGURES_EN.clicks, label: "Organic clicks" },
  { value: `Avg. ${FB_FIGURES_EN.position}`, label: "Average position" },
  { value: FB_FIGURES_EN.products, label: "Live products" },
];

export const FB_MODULES_EN: FbModule[] = [
  {
    ...FB_MODULES[0],
    title: `${FB_FIGURES_EN.products} Live Products`,
    text: "Broad product coverage creates commercial entry points for different search intents.",
    image: {
      ...FB_MODULES[0].image,
      alt: "Product overview of different French Beret models and colors in a filtered list view",
    },
  },
  {
    ...FB_MODULES[1],
    text: "Products are structured across relevant dimensions such as material, color and style.",
    image: {
      ...FB_MODULES[1].image,
      alt: "Illustration of a beret collection organized by material, color and style",
    },
  },
  {
    ...FB_MODULES[2],
    text: "Editorial content answers information needs around selection, styling and care.",
    image: {
      ...FB_MODULES[2].image,
      alt: "Editorial advice hub with content on styling, materials and care for berets",
    },
  },
  {
    ...FB_MODULES[3],
    text: "Commerce, brand and organic discoverability are treated as one connected system.",
    image: {
      ...FB_MODULES[3].image,
      alt: "Editorial e-commerce presentation of French Beret with navigation, brand statement and entry into the shop",
    },
  },
];

export const FB_LEARNINGS_EN: { index: string; title: string; text: string }[] = [
  {
    index: "01",
    title: "Architecture before content volume.",
    text: "A clear structure carries further than a large volume of unstructured content.",
  },
  {
    index: "02",
    title: "Commerce and content as one system.",
    text: "Products, categories and content all pay into the same demand.",
  },
  {
    index: "03",
    title: "SEO starts before the first blog post.",
    text: "Taxonomy, navigation and internal linking are part of the search strategy.",
  },
  {
    index: "04",
    title: "Continuity over one-off actions.",
    text: "Search results come from continuous optimizing, measuring and improving.",
  },
];

export const FB_METHOD_FACTS_EN: { key: string; value: string }[] = [
  { key: "Measurement source", value: "Google Search Console, the shop's property" },
  { key: "Measurement window", value: FB_FIGURES_EN.windowMonths },
  { key: "Metrics", value: "Impressions · clicks · average position" },
  { key: "Reporting", value: "Directly measured values, no extrapolation" },
  { key: "Data as of", value: FB_DATA_AS_OF },
];

// English case studies only ever link to English-published content — see the
// same rule already established in components/case-studies/Archive.tsx. Two of
// the three German "Weiterlesen" links point at insight articles that have no
// English edition yet, so they are left out here rather than pointed at a
// German-only page or invented.
export const FB_RELATED_EN: { label: string; href: string }[] = [
  { label: "How we work", href: "/en/services" },
];

export const FB_HERO_IMAGE_EN = {
  ...FB_HERO_IMAGE,
  alt: "French Beret in black, cream and brown in a calm product composition on travertine stone",
};

// ── UI-Chrome, das im Component selbst stand ─────────────────────────────────
// Alles, was FrenchBeretCase.tsx bisher als Literal in der JSX trug: Breadcrumb,
// Abschnitts-Eyebrows/-Überschriften, Fließtext und CTA. Die deutsche Spalte ist
// wortgleich mit dem, was vorher im Component stand.
export const FB_UI = {
  de: {
    breadcrumb: { home: "Start", homeHref: "/", index: "Ergebnisse", leaf: "French Beret" },
    eyebrow: { num: "01 · Build", label: "Case Study" },
    heroTail: "organische Klicks",
    heroSub:
      "Wie SEESZN für French Beret eine E-Commerce- und Search-Architektur von Grund auf aufgebaut hat.",
    heroMeta: { client: "Kunde", period: "Zeitraum", website: "Website" },
    overview: { label: "Überblick", h2a: "Der Case in", h2b: "20 Sekunden." },
    approach: {
      label: "Ausgangslage",
      h2a: "Kein Legacy-SEO.",
      h2b: "Ein System von Grund auf.",
      p1: "French Beret war kein klassisches SEO-Relaunch-Projekt. Shop-Struktur, kommerzielle Landingpages, Produktarchitektur und redaktionelle Inhalte konnten von Beginn an gemeinsam gedacht werden.",
      p2: "Das Ziel war deshalb nicht, einzelne Rankings nachträglich zu reparieren. Es ging darum, eine E-Commerce-Struktur aufzubauen, in der Suchnachfrage, Navigation, Produkte und Inhalte dieselbe Architektur nutzen.",
      quoteA: "Search wurde nicht auf den Shop gesetzt.",
      quoteB: "Search wurde Teil des Shops.",
    },
    flow: {
      label: "Architektur",
      h2: "Von Suchnachfrage zur Shop-Architektur.",
      note: "Sechs Ebenen, eine Struktur. Jede Ebene baut auf der vorherigen auf, damit Nachfrage, Kategorien, Produkte und Inhalte nicht getrennt voneinander entstehen.",
      taxonomyLabel: "Taxonomie-Dimensionen",
    },
    range: {
      label: "Sortiment",
      h2: (products: string) => `${products} Live-Produkte.`,
      note: (products: string) =>
        `Nicht ${products} isolierte URLs, sondern ein Commerce-System aus Produkten, Collections und redaktionellen Einstiegspunkten.`,
      collectionsBy: "Collections nach",
      collectionsList: ["Material", "Farbe", "Zielgruppe", "Stil"],
      editorial: "Editorial Search",
      editorialText: "Inhalte rund um Auswahl, Styling, Nutzung und Pflege.",
    },
    result: {
      label: "Ergebnis",
      h2: "Drei Monate Search.",
      note: "Vier Werte aus einer Quelle, im selben Messfenster erhoben. Mehr Kennzahlen gibt die Datenlage nicht her, und mehr braucht sie auch nicht.",
      source: (windowMonthsIn: string) =>
        `Quelle: Google Search Console, Property des Shops. Dokumentiertes Messfenster von ${windowMonthsIn}.`,
      hard: "Keine Hochrechnung.",
    },
    modules: {
      label: "System",
      h2: "Die Systembausteine.",
      note: "Vier Bausteine tragen das System: Produktabdeckung, Collection-Struktur, redaktionelle Ebene und Storefront. Sie greifen ineinander, statt nebeneinander zu stehen.",
    },
    learnings: { label: "Erkenntnisse", h2: "Was funktioniert hat." },
    method: {
      label: "Methodik",
      h2: "So messen wir.",
      lead: "Search-Daten werden über ein fest definiertes Messfenster ausgewertet. Wir zeigen die Werte, die direkt in der verwendeten Datenquelle gemessen wurden, und trennen dokumentierte Ergebnisse von Interpretation.",
      footnote: (position: string) =>
        `Ø Position ${position} ist die durchschnittliche Position aller Queries in der Google Search Console. Sie bedeutet nicht, dass einzelne Keywords auf Platz ${position} ranken, und sie ist kein Ranking für ein bestimmtes Keyword.`,
    },
    cta: {
      label: "Nächster Schritt",
      h2a: "Wie sichtbar ist",
      h2b: "dein Commerce-System?",
      copy: "Finde heraus, wo deine Marke heute in Google und AI Search steht und welcher Engpass als Nächstes gelöst werden sollte.",
      button: "First Move starten",
      buttonHref: "/first-move",
      relatedLabel: "Weiterlesen",
    },
  },
  en: {
    breadcrumb: { home: "Home", homeHref: "/en", index: "Results", leaf: "French Beret" },
    eyebrow: { num: "01 · Build", label: "Case Study" },
    heroTail: "organic clicks",
    heroSub:
      "How SEESZN built an e-commerce and search architecture from the ground up for French Beret.",
    heroMeta: { client: "Client", period: "Period", website: "Website" },
    overview: { label: "Overview", h2a: "The case in", h2b: "20 seconds." },
    approach: {
      label: "Starting Position",
      h2a: "No legacy SEO.",
      h2b: "A system from the ground up.",
      p1: "French Beret wasn't a classic SEO relaunch project. Shop structure, commercial landing pages, product architecture and editorial content could be designed together from day one.",
      p2: "The goal wasn't to fix individual rankings after the fact. It was to build an e-commerce structure in which search demand, navigation, products and content share the same architecture.",
      quoteA: "Search wasn't bolted onto the shop.",
      quoteB: "Search became part of the shop.",
    },
    flow: {
      label: "Architecture",
      h2: "From search demand to shop architecture.",
      note: "Six layers, one structure. Each layer builds on the previous one so demand, categories, products and content don't develop in isolation.",
      taxonomyLabel: "Taxonomy dimensions",
    },
    range: {
      label: "Range",
      h2: (products: string) => `${products} Live Products.`,
      note: (products: string) =>
        `Not ${products} isolated URLs, but a commerce system of products, collections and editorial entry points.`,
      collectionsBy: "Collections by",
      collectionsList: ["Material", "Color", "Target audience", "Style"],
      editorial: "Editorial Search",
      editorialText: "Content around selection, styling, use and care.",
    },
    result: {
      label: "Result",
      h2: "Three months of search.",
      note: "Four values from one source, measured in the same window. The data doesn't support more metrics, and it doesn't need to.",
      source: (windowMonthsIn: string) =>
        `Source: Google Search Console, the shop's property. Documented measurement window of ${windowMonthsIn}.`,
      hard: "No extrapolation.",
    },
    modules: {
      label: "System",
      h2: "The system building blocks.",
      note: "Four building blocks carry the system: product coverage, collection structure, editorial layer and storefront. They interlock rather than sit side by side.",
    },
    learnings: { label: "Learnings", h2: "What worked." },
    method: {
      label: "Methodology",
      h2: "How we measure.",
      lead: "Search data is evaluated over a fixed measurement window. We show the values measured directly in the data source used, and separate documented results from interpretation.",
      footnote: (position: string) =>
        `Avg. position ${position} is the average position across all queries in Google Search Console. It doesn't mean individual keywords rank at position ${position}, and it isn't a ranking for any specific keyword.`,
    },
    cta: {
      label: "Next Step",
      h2a: "How visible is",
      h2b: "your commerce system?",
      copy: "Find out where your brand stands today in Google and AI Search, and which bottleneck to solve next.",
      button: "Start First Move",
      buttonHref: "/en/first-move",
      relatedLabel: "Read more",
    },
  },
} as const;
