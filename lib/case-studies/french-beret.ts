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
