// ─── PREISE: Copy der Entscheidungsfläche ─────────────────────────────────────
// Jeder Abschnitt hier beantwortet genau eine Kauffrage. Was keine beantwortet,
// steht nicht auf der Seite.
//
// Zahlen kommen ausnahmslos aus lib/first-move/product.ts. Diese Datei hält
// keinen eigenen Preis und keine eigene Frist.

import {
  CLIENT_EFFORT_SHORT,
  DELIVERY_SHORT,
  MEASUREMENT_DISPLAY,
} from "@/lib/first-move/product";

export const ENTRY = {
  eyebrow: "PREISE",
  kicker: "ZWEI WEGE",
  h1: "Zwei Wege zu mehr Sichtbarkeit.",
  lead: "Wir finden und setzen den wichtigsten Move um, oder Sie kaufen Backlinks direkt nach Menge.",
  question: "Was möchten Sie lösen?",

  paths: [
    {
      n: "01",
      product: "first-move" as const,
      name: "FIRST MOVE",
      forWhom: "WENN NOCH OFFEN IST, WAS AM MEISTEN BEWEGT",
      body: "SEESZN prüft Ihre Sichtbarkeit in Search, AI Search und Google Ads, priorisiert einen konkreten Hebel und setzt genau eine begrenzte Maßnahme um. Mit Nachweis.",
      cta: "FIRST MOVE ANSEHEN",
    },
    {
      n: "02",
      product: "backlinks" as const,
      name: "BACKLINKS",
      forWhom: "WENN SIE BEREITS WISSEN, WAS SIE WOLLEN",
      body: "Menge, Format und Zielmarkt selbst wählen. Staffelpreis, kein Angebot nötig, Preis steht sofort daneben.",
      cta: "BACKLINKS KONFIGURIEREN",
    },
  ],
} as const;

export const FIRST_MOVE = {
  statement1: "Der wichtigste Move.",
  statement2: "Gefunden und",
  statementAccent: "umgesetzt",
  sub: "SEESZN prüft Ihre aktuelle Search-, AI- und Paid-Sichtbarkeit, priorisiert einen konkreten Hebel und setzt genau eine begrenzte Maßnahme direkt um.",

  /** Die vier technischen Angaben neben dem Preis. Datenblatt, keine Vorteile. */
  specs: [
    { v: DELIVERY_SHORT, k: "nach vollständigem Zugang" },
    { v: `≤ ${CLIENT_EFFORT_SHORT.replace("max. ", "").replace(" auf Kundenseite", "")}`, k: "Aufwand auf Ihrer Seite" },
    { v: "1 Move", k: "umgesetzt inklusive QA" },
    { v: MEASUREMENT_DISPLAY.replace(" Messfenster", ""), k: "Messung und Evidence Record" },
  ],

  cta: "FIRST MOVE FINDEN",

  /** Die sieben Schritte des Festpreises. */
  scope: {
    index: "01",
    label: "WAS ENTHALTEN IST",
    h2a: "Sieben Schritte,",
    accent: "ein",
    h2b: "Ergebnis.",
    steps: [
      { n: "01", label: "SCAN", body: "Die relevanten Sichtbarkeitsflächen werden gelesen: Search, AI Search und, wo vorhanden, das Google-Ads-Konto." },
      { n: "02", label: "VERIFIKATION", body: "Der Befund wird mit den nötigen Zugängen überprüft. Was sich nicht belegen lässt, wird nicht umgesetzt." },
      { n: "03", label: "PRIORISIERUNG", body: "SEESZN wählt genau einen begrenzten First Move: den mit der größten Lücke zwischen Aufwand und Ergebnis." },
      { n: "04", label: "UMSETZUNG", body: "Die abgestimmte Maßnahme geht live. Kein Maßnahmenpaket, keine parallele Baustelle." },
      { n: "05", label: "QA", body: "Die Umsetzung wird geprüft, und es gibt eine Freigabeschleife auf Ihrer Seite." },
      { n: "06", label: "MESSUNG", body: "Messgröße und Ausgangswert werden vorher festgelegt, nicht nachträglich gewählt." },
      { n: "07", label: "EVIDENCE RECORD", body: "Der Vorher- und Nachher-Stand wird über das Messfenster dokumentiert, mit Quelle und Datum." },
    ],
  },

  limits: {
    index: "02",
    label: "GRENZEN",
    h2a: "Ein Move. Klar",
    accent: "begrenzt",
    h2b: ".",
    lead: "Damit vorher klar ist, wofür der Festpreis nicht steht.",
    items: [
      "Kein Website-Relaunch",
      "Keine Migration",
      "Keine Content-Produktion in Serie",
      "Keine laufende Ads-Betreuung",
      "Kein laufender Linkaufbau",
      "Kein Rollout über mehrere Märkte",
      "Kein unbegrenzter Retainer",
    ],
  },

  proof: {
    index: "03",
    label: "BELEG",
    h2a: "Ein echter Move,",
    accent: "gemessen",
    h2b: ".",
  },

  risk: {
    index: "04",
    label: "WENN ES NICHT GEHT",
    h2a: "Nicht umsetzbar heißt",
    accent: "nicht",
    h2b: "bezahlt.",
  },

  close: {
    index: "05",
    label: "NÄCHSTER SCHRITT",
    line1: "Der erste Schritt ist",
    line2: "die Prüfung.",
    body: "Sie geben eine Domain an. SEESZN liest die öffentlichen Signale und zeigt den Befund, bevor irgendetwas beauftragt wird.",
  },
} as const;
