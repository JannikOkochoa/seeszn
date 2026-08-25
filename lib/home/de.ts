// ─── Startseite, deutsche Fassung ─────────────────────────────────────────────
// Die Startseite ist seit August 2026 keine Übersicht über Disziplinen mehr,
// sondern die Entscheidungsfläche für den ersten Kauf. Sie beantwortet in einer
// Sequenz: was SEESZN ist, was der First Move liefert, welche Oberflächen
// geprüft werden, warum das Verfahren belastbar ist, was jetzt zu tun ist und
// was nach der Domaineingabe passiert.
//
// Alle kaufentscheidenden Zahlen kommen ausschließlich aus
// lib/first-move/product.ts. Hier steht keine einzige Zahl doppelt.
//
// Schreibregeln, die hier gelten und die jede Änderung einhalten muss:
//   - SEESZN ist nie eine Agentur, ein Studio oder ein Dienstleisterteam.
//   - Search, AI Search und Google Ads sind Prüfflächen des Produkts, nie drei
//     Leistungen nebeneinander.
//   - Keine Gedankenstriche, kein "nicht X, sondern Y", keine Dreiklänge aus
//     Adjektiven, keine erfundene Dringlichkeit.
//   - Englisch für Produktnamen, Systemlabels und Metadaten. Deutsch für
//     Erklärung, Einordnung, Risiko und Recht.

import {
  CLIENT_EFFORT_MINUTES,
  DELIVERY_DAYS_MAX,
  DELIVERY_DAYS_MIN,
  INCLUDED,
  MEASUREMENT_WEEKS_MAX,
  MEASUREMENT_WEEKS_MIN,
  OFFER_FACTS,
  PRICE_DISPLAY_NET,
  PRICE_FRAME,
  PRICE_PROMISE,
  PRODUCT_DEFINITION,
  REASSURANCE,
  RISK_REVERSAL_FULL,
} from "@/lib/first-move/product";
import { SCAN_STAGE_STATES } from "./stages";
import type { HomeContent } from "./types";

export const homeDe: HomeContent = {
  locale: "de",
  homePath: "/",

  hero: {
    eyebrow: "THE FIRST MOVE",
    // Eine Betonung, ein Gedanke. Die Akzentzeile trägt die Aussage.
    line1: "Find the move",
    line2: "that changes",
    accent: "the curve.",
    ghost: "CURVE",
    lead: "SEESZN prüft Search, AI Search und Google Ads, priorisiert den stärksten belegbaren Engpass und setzt eine messbare Intervention in 5–7 Werktagen um.",
    fieldLabel: "Deine Domain",
    placeholder: "deine-domain.de",
    cta: "FIRST MOVE FINDEN",
    ctaShort: "FIRST MOVE",
    ctaBusy: "PRÜFUNG LÄUFT",
    micro: "Keine E-Mail vor dem Ergebnis · Öffentliche Signale zuerst · Deine Daten bleiben in der EU",
    emptyError: "Bitte gib eine Domain ein, zum Beispiel deine-domain.de",
    scanFailed: "Die Prüfung ist fehlgeschlagen. Bitte versuche es erneut.",
  },

  // Produktfakten statt Versprechen. "≤15 MIN FROM YOU" sagt dasselbe wie die
  // frühere Fassung "CLIENT EFFORT", nur direkt an die Person gerichtet.
  trustStrip: [
    `${DELIVERY_DAYS_MIN}–${DELIVERY_DAYS_MAX} BUSINESS DAYS`,
    `≤${CLIENT_EFFORT_MINUTES} MIN FROM YOU`,
    "IMPLEMENTATION + QA",
    `${MEASUREMENT_WEEKS_MIN}–${MEASUREMENT_WEEKS_MAX} WEEK MEASUREMENT`,
  ],

  constraint: {
    index: "01",
    label: "THE CONSTRAINT",
    line1: "Three growth systems.",
    line2: "No clear first decision.",
    body: "Search, AI Search und Google Ads werden meist in getrennten Roadmaps geplant. Jede Liste ist für sich plausibel. Welche einzelne Änderung zuerst wirkt, beantwortet keine davon.",
    note: "Der First Move beantwortet genau diese Frage, bevor Budget in Bewegung kommt.",
    surfacesLabel: "PRÜFFLÄCHEN",
    surfaces: ["SEARCH", "AI SEARCH", "GOOGLE ADS"],
  },

  scan: {
    index: "02",
    label: "THE READ",
    title: "Zuerst der Befund, dann der Move.",
    question: "Wo bleibt gerade Wachstum liegen?",
    sub: "Eine Domain genügt. Die erste Einordnung erscheint direkt auf dieser Seite.",
    instrumentLabel: "Sichtbarkeitsprüfung",
    free: "Kostenlos",
    cta: "Kostenlos prüfen",
    again: "Andere Domain prüfen",
    checked: "Geprüft",
    reads: "Was wir dabei öffentlich lesen",
    readsList: [
      "Domain und Erreichbarkeit",
      "robots.txt",
      "Sitemap und Scope",
      "eine Stichprobe öffentlicher Seiten",
      "Seitentemplates",
      "technische Signale",
      "semantische Muster",
    ],
    trust: [
      "Keine E-Mail nötig. Das Ergebnis erscheint direkt auf dieser Seite.",
      "Nur öffentlich abrufbare Signale. Kein Zugriff auf deine Systeme.",
    ],
    runningNote:
      "Die Prüfung läuft gegen die echte Oberfläche. Jeder Zustand erscheint erst, wenn der Schritt fertig ist.",
    idleNote: "Ohne Zugriff auf deine Systeme und ohne E-Mail. Nur was öffentlich abrufbar ist.",
    // Die Fragen, die das Ergebnis beantwortet. Die erste beantwortet die
    // Überschrift des Befunds selbst, deshalb steht sie hier nicht noch einmal.
    headings: {
      evidence: "Woran der Befund belegt ist",
      ruledOut: "Das können wir ausschließen",
      route: "Wie wir weiter prüfen",
    },
    confidencePrefix: "Öffentliche Lesung",
    primaryCta: "FIRST MOVE STARTEN",
    secondaryCta: "Befund gemeinsam prüfen",
    scanningTitle: "Wir lesen",
    scanningFallback: "die Oberfläche",
    scanningNote:
      "Wir ordnen gerade ein, wo bei euch der größte Unterschied zwischen Aufwand und Ergebnis liegt.",
    stages: [
      { id: "01", label: "Geschäft und Angebot verstehen", states: SCAN_STAGE_STATES[0] },
      { id: "02", label: "Erschließung und Scope bestimmen", states: SCAN_STAGE_STATES[1] },
      { id: "03", label: "Search und AI Presence prüfen", states: SCAN_STAGE_STATES[2] },
      { id: "04", label: "Muster über Seiten hinweg vergleichen", states: SCAN_STAGE_STATES[3] },
      { id: "05", label: "Stärksten Hebel bestimmen", states: SCAN_STAGE_STATES[4] },
    ],
  },

  answers: {
    index: "03",
    label: "THE PRODUCT",
    line1: "Four answers.",
    line2: "One Move.",
    definition: PRODUCT_DEFINITION,
    rows: [
      {
        num: "01",
        label: "CONSTRAINT",
        title: "Wo Wachstum verloren geht.",
        body: "Wir lesen die öffentlich abrufbaren Signale aus Search, AI Search und Google Ads und benennen den Engpass mit der größten Lücke zwischen Aufwand und Ergebnis.",
      },
      {
        num: "02",
        label: "EVIDENCE",
        title: "Woran der Befund belegt ist.",
        body: "Jede Aussage hängt an einer Beobachtung mit Quelle, Zeitpunkt und Reichweite. Was öffentlich nicht messbar war, steht als Grenze daneben.",
      },
      {
        num: "03",
        label: "INTERVENTION",
        title: "Was SEESZN konkret umsetzt.",
        body: "Eine klar begrenzte Änderung geht live, geführt durch QA und eine Freigabeschleife. Umfang und Zielzustand stehen vor dem Start fest.",
      },
      {
        num: "04",
        label: "MEASUREMENT",
        title: "Wie der Effekt nachgewiesen wird.",
        body: `Messgröße und Basiswert stehen vor der Umsetzung fest. Danach dokumentieren wir ${MEASUREMENT_WEEKS_MIN} bis ${MEASUREMENT_WEEKS_MAX} Wochen und legen den Vorher/Nachher-Stand offen.`,
      },
    ],
  },

  proof: {
    index: "04",
    label: "EVIDENCE RECORD",
    line1: "Gemessene",
    accent: "Ergebnisse.",
    lead: "Drei dokumentierte Fälle. Jeder mit Messgröße, Zeitraum, Quelle und den Grenzen der Aussage.",
    keys: {
      result: "Ergebnis",
      beforeAfter: "Vorher → Nachher",
      metric: "Messgröße",
      window: "Messfenster",
      source: "Quelle",
      scope: "Scope",
      limits: "Grenzen",
    },
    caseLink: "Methodik in der Case Study",
    // Die Anzeigenamen sind bewusst enger als in lib/first-move/proof.ts: der
    // Tourismusfall trägt hier ausschließlich "Tourism · DACH", der Paid-Fall
    // ausschließlich "Paid Acquisition · NDA".
    cases: {
      transform: {
        name: "Tourism · DACH",
        descriptor: "SEO + AI Search",
        scope: "Ein konstantes Prompt-Set der Kategorie, vorher und nachher identisch ausgewertet.",
        href: "/case-studies/seo-aio-tourismus",
      },
      scale: {
        name: "Paid Acquisition · NDA",
        descriptor: "DACH · Google Ads",
        scope: "Ein Google-Ads-Konto im DACH-Raum über den gesamten Zeitraum.",
        href: "/case-studies/paid-acquisition-at-scale",
      },
      build: {
        name: "E-Commerce · International",
        descriptor: "SEO + GEO",
        scope: "Ein international ausgerichteter Shop, gemessen in seiner eigenen Property.",
        href: "/case-studies/french-beret-ecommerce-seo",
      },
    },
    order: ["transform", "scale", "build"],
  },

  system: {
    index: "05",
    label: "THE SYSTEM",
    line1: "So entsteht ein",
    accent: "First Move.",
    lead: "Fünf Stufen, jede mit einem eigenen Ergebnis. Zwei davon entscheidet ein Mensch.",
    stages: [
      {
        num: "01",
        label: "PUBLIC SIGNALS",
        meta: "Search · AI Search · Google Ads",
        body: "Öffentlich abrufbare Signale, ohne Zugriff auf eure Systeme und ohne E-Mail.",
      },
      {
        num: "02",
        label: "CONSTRAINT ENGINE",
        meta: "Evidence · Impact · Feasibility",
        body: "Ein Befund zählt erst, wenn mehrere Signale auf denselben Engpass hindeuten.",
      },
      {
        num: "03",
        label: "HUMAN VERIFICATION",
        meta: "Priority · Scope · Approval",
        body: "Ein Mensch prüft den Befund mit den nötigen Zugängen und gibt Priorität und Umfang frei.",
      },
      {
        num: "04",
        label: "FIRST MOVE",
        meta: "Implementation · QA",
        body: "Genau eine begrenzte Änderung geht live, inklusive QA und einer Freigabeschleife.",
      },
      {
        num: "05",
        label: "MEASUREMENT",
        meta: "Before · After · Decision",
        body: "Nach dem Messfenster liegt der Evidence Record vor und trägt die nächste Entscheidung.",
      },
    ],
    note: "Stufe 03 und Stufe 04 laufen nie ohne Freigabe. Was ein Mensch nicht bestätigt hat, geht nicht live.",
  },

  recognition: {
    index: "06",
    label: "RECOGNITION",
    line1: "Wann der First Move",
    accent: "passt.",
    items: [
      "Das Team hat Daten aus mehreren Systemen, aber keine klare erste Entscheidung.",
      "Search, AI Search und Paid Acquisition werden in getrennten Roadmaps geplant.",
      "Viele Maßnahmen wirken plausibel. Ihr erwarteter Effekt ist nicht sauber belegt.",
    ],
  },

  offer: {
    index: "07",
    label: "THE OFFER",
    name: "SEESZN First Move",
    priceCaption: "Festpreis, netto",
    includedLabel: "Enthalten",
    riskLabel: "Wenn der Move nicht umsetzbar ist",
    cta: "FIRST MOVE STARTEN",
    ctaHref: "/first-move#start",
    price: PRICE_DISPLAY_NET,
    priceFrame: PRICE_FRAME,
    pricePromise: PRICE_PROMISE,
    facts: OFFER_FACTS,
    included: INCLUDED,
    riskReversal: RISK_REVERSAL_FULL,
    reassurance: REASSURANCE,
  },

  decision: {
    index: "08",
    label: "DECISION",
    line1: "One constraint.",
    line2: "One intervention.",
    accent: "A result you can measure.",
    body: "Gib deine Domain ein. Der Befund erscheint direkt auf dieser Seite, danach entscheidest du.",
    cta: "FIRST MOVE STARTEN",
    secondary: "Zuerst die Domain prüfen",
  },
};
