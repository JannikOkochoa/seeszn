// ─── MOVES: Copy der Übersichtsseite ──────────────────────────────────────────
// Die Übersicht orientiert, sie verkauft nicht. Sie beantwortet drei Fragen und
// hört dann auf: Was ist das hier, wo entsteht das Signal, wie ist die Bindung.
// Alles Produktspezifische steht auf der jeweiligen Produktseite.

import type { PurchaseMode } from "./types";

export const ROOT = {
  label: "MOVES",
  kicker: "AUSGEWÄHLTE UMSETZUNG, DIREKT BEAUFTRAGT",

  // Der eine Satz, der diese Fläche vom Rest der Seite unterscheidet: überall
  // sonst steht die Prüfung vor der Umsetzung. Hier nicht.
  h1a: "Umsetzung, die du",
  accent: "kaufen",
  h1b: "kannst.",

  lead: "Vier Flächen, auf denen SEESZN Sichtbarkeit aufbaut. Jede Einheit hat einen Preis, einen Umfang und ein Protokoll. Einmalig kaufbar oder monatlich, ohne Gespräch davor.",

  heroFacts: [
    "Preis und Umfang stehen vor dem Kauf",
    "Zahlung über Stripe",
    "Briefing dauert unter zehn Minuten",
  ],

  ctaPrimary: "FLÄCHEN ANSEHEN",
  ctaSecondary: "Lieber erst prüfen lassen",

  axis: {
    index: "01",
    label: "WO DAS SIGNAL ENTSTEHT",
    h2a: "Vier Flächen, vier",
    accent: "Orte",
    h2b: "für ein Signal.",
    lead: "Die Flächen unterscheiden sich danach, wo das Signal am Ende steht: auf einer fremden Publikation, in einer Redaktion, in einem fremden Text oder auf deiner eigenen Seite.",
    colSource: "FLÄCHE",
    colWhere: "WAS GEKAUFT WIRD",
    colFrom: "EINSTIEG",
  },

  modes: {
    index: "02",
    label: "DREI ARTEN ZU KAUFEN",
    h2a: "Was du wählst, ist die",
    accent: "Bindung",
    h2b: ".",
    lead: "Der Umfang je Einheit ist in allen drei Fällen derselbe. Was sich ändert, ist die Dauer, für die du dich festlegst.",
  },

  standards: {
    index: "03",
    label: "QUALIFIZIERUNG",
    h2a: "Woran eine Quelle",
    accent: "scheitert",
    h2b: ".",
    lead: "Diese Regeln gelten für jede Einheit auf jeder Fläche. Sie sind der Grund, warum hier weniger kaufbar ist als anderswo.",
    neverLabel: "WAS NIRGENDS ZUGESAGT WIRD",
  },

  proof: {
    index: "04",
    label: "BELEGE",
    h2a: "Gemessen, mit",
    accent: "Grenzen",
    h2b: "ausgewiesen.",
    lead: "Die folgenden Belege stammen aus laufenden SEESZN-Projekten. In jedem Zeitraum liefen mehrere Maßnahmen gleichzeitig. Die Zahlen zeigen die gemessene Veränderung im Zeitraum, nicht die Wirkung einer einzelnen Einheit.",
  },

  close: {
    index: "05",
    label: "ENTSCHEIDUNG",
    line1: "Kauf eine Einheit,",
    line2: "oder lass erst prüfen,",
    line3: "welche die richtige ist.",
    body: "Wenn klar ist, was fehlt, ist der direkte Kauf der kürzere Weg. Wenn das nicht klar ist, steht am Anfang die Prüfung, und der Kauf kommt danach.",
    ctaPrimary: "FLÄCHEN ANSEHEN",
    ctaSecondary: "SICHTBARKEIT PRÜFEN LASSEN",
  },

  meta: {
    title: "MOVES | Sichtbarkeit als einzelne Umsetzung kaufen | SEESZN",
    description:
      "Authority, Press, Mentions und Content als abgegrenzte Umsetzung mit festem Preis. Quelle vor der Platzierung zur Freigabe, Kennzeichnung nach Vorgabe, Protokoll je Einheit. Einmalig oder monatlich.",
  },
} as const;

/** Die drei Kaufarten, erklärt an einer Stelle für alle Flächen. */
export const MODES: readonly {
  mode: PurchaseMode;
  name: string;
  line: string;
  body: string;
  commitment: string;
}[] = [
  {
    mode: "one",
    name: "ONE",
    line: "Eine Umsetzung",
    body: "Eine abgegrenzte Einheit mit festem Preis. Du kaufst, gibst ein kurzes Briefing und bekommst am Ende das Protokoll. Danach ist der Vorgang abgeschlossen.",
    commitment: "Einmalige Zahlung, keine Laufzeit",
  },
  {
    mode: "momentum",
    name: "MOMENTUM",
    line: "Laufende Umsetzung",
    body: "Mehrere Einheiten im Monat, geplant über einen längeren Horizont. Sinnvoll, sobald eine einzelne Einheit das Thema nicht trägt, weil Wiederholung die Wirkung macht.",
    commitment: "Monatlich kündbar, keine Mindestlaufzeit",
  },
  {
    mode: "system",
    name: "SYSTEM",
    line: "Zugeschnittenes Programm",
    body: "Mehrere Flächen, mehrere Märkte oder ein Engpass, der erst gefunden werden muss. Hier steht die Prüfung vor dem Einkauf, und der Umfang wird zugeschnitten.",
    commitment: "Kein Online-Kauf, Preis nach Umfang",
  },
];

/** Beschriftungen des Belegsystems. Bewusst knapp und immer gleich. */
export const PROOF_LABELS = {
  deployed: "WORK DEPLOYED",
  period: "ZEITRAUM",
  before: "VORHER",
  after: "NACHHER",
  source: "QUELLE",
  method: "METHODIK",
  limits: "GRENZEN",
  metric: "MESSGRÖSSE",
  attribution: "ZUORDNUNG",
} as const;
