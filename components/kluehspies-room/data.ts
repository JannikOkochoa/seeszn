// ─── Klühspies Website Lab — Mock-Daten ──────────────────────────────────────
// Lokale Arbeitsdaten für den privaten Client Room. Bewusst ohne Backend:
// Der Raum zeigt den Arbeitsstand, Freigaben werden vorerst lokal markiert.

export type Impact = "Hoch" | "Mittel-Hoch" | "Mittel" | "Niedrig";
export type Effort = "Niedrig" | "Mittel" | "Hoch";
export type RecStatus =
  | "Freigabe offen"
  | "In Prüfung"
  | "Nächster Sprint"
  | "Freigegeben"
  | "Wird besprochen";

export interface Recommendation {
  id: string;
  num: string; // Pin-Nummer im Mockup, "01"–"04"
  pinTarget: string; // wo der Pin sitzt, für aria-Labels
  title: string;
  problem: string;
  recommendation: string;
  why: string;
  impact: Impact;
  effort: Effort;
  status: RecStatus;
}

export const recommendations: Recommendation[] = [
  {
    id: "rec-01",
    num: "01",
    pinTarget: "Hero H1",
    title: "H1 stärker auf Klassenfahrten ausrichten",
    problem:
      "Die Startseite muss sofort klar machen, dass Klühspies eine relevante Autorität für Klassenfahrten und Gruppenreisen ist.",
    recommendation:
      "Die H1 sollte den Hauptsuchintent direkt abdecken: Klassenfahrten einfach planen – mit Klühspies Reisen.",
    why: "Stärkt das Google-Verständnis, erhöht die AI-Antwortfähigkeit und macht den Nutzen für Lehrkräfte schneller sichtbar.",
    impact: "Hoch",
    effort: "Niedrig",
    status: "Freigabe offen",
  },
  {
    id: "rec-02",
    num: "02",
    pinTarget: "Kategorie-Karten",
    title: "Reisekategorien als klare H2-Struktur abbilden",
    problem:
      "Wichtige Angebotsbereiche sind nicht stark genug als semantische Hauptbereiche der Seite erkennbar.",
    recommendation:
      "Städtereisen, Skiklassenfahrten und Erlebnisreisen als eigene H2-Bereiche mit interner Verlinkung ausbauen.",
    why: "Verbessert Crawlbarkeit, Themenautorität und Nutzerführung.",
    impact: "Hoch",
    effort: "Mittel",
    status: "In Prüfung",
  },
  {
    id: "rec-03",
    num: "03",
    pinTarget: "FAQ-Bereich",
    title: "FAQ-Block für SEO & AI Overviews ergänzen",
    problem:
      "Viele Suchanfragen von Lehrkräften sind fragebasiert und werden zunehmend direkt von AI-Systemen beantwortet.",
    recommendation:
      "Einen kompakten FAQ-Block unterhalb der Hauptbereiche einbauen.",
    why: "Erhöht die Chance, in Google, AI Overviews und ChatGPT-ähnlichen Antworten als Quelle verstanden zu werden.",
    impact: "Mittel-Hoch",
    effort: "Niedrig",
    status: "Freigabe offen",
  },
  {
    id: "rec-04",
    num: "04",
    pinTarget: "Städte-Hub / interne Verlinkung",
    title: "Städte-Hub intern stärker verlinken",
    problem:
      "Einzelne Städtereisen können besser von der Startseite aus gestützt werden.",
    recommendation:
      "Eine sichtbare Hub-Struktur für beliebte Städte wie Berlin, Hamburg, München, Prag und Wien ergänzen.",
    why: "Stärkt interne Linkkraft und hilft Google, die thematische Tiefe von Klühspies zu erkennen.",
    impact: "Hoch",
    effort: "Mittel",
    status: "Nächster Sprint",
  },
];

export interface ApprovalItem {
  id: string;
  title: string;
  description: string;
  impact: Impact;
  effort: Effort;
  status: RecStatus;
}

export const approvalItems: ApprovalItem[] = [
  {
    id: "app-01",
    title: "Neue H1/H2-Struktur",
    description:
      "Die Startseiten-Überschriften werden klar auf den Suchintent von Lehrkräften ausgerichtet: Klassenfahrten planen, Reiseziele finden, Sicherheit verstehen.",
    impact: "Hoch",
    effort: "Niedrig",
    status: "Freigabe offen",
  },
  {
    id: "app-02",
    title: "FAQ-Block auf der Homepage",
    description:
      "Drei zentrale Fragen von Lehrkräften, direkt auf der Startseite beantwortet. Lesbar für Google, AI Overviews und ChatGPT-ähnliche Systeme.",
    impact: "Mittel-Hoch",
    effort: "Niedrig",
    status: "Freigabe offen",
  },
  {
    id: "app-03",
    title: "Städte-Hub auf der Startseite",
    description:
      "Sichtbare Verlinkung zu Berlin, Hamburg, München, Prag und Wien. Stärkt die thematische Tiefe und stützt die einzelnen Städteseiten.",
    impact: "Hoch",
    effort: "Mittel",
    status: "Freigabe offen",
  },
];

export interface WorkLogEntry {
  date: string;
  title: string;
  detail: string;
}

export const workLog: WorkLogEntry[] = [
  {
    date: "24. Juni 2026",
    title: "Homepage-Struktur analysiert",
    detail:
      "Bestehende Startseite auf H-Struktur, Suchintent und interne Verlinkung geprüft.",
  },
  {
    date: "26. Juni 2026",
    title: "Neue H1/H2-Logik vorbereitet",
    detail:
      "Überschriften-Hierarchie auf Klassenfahrten und Gruppenreisen ausgerichtet, ohne den Klühspies-Ton zu verlieren.",
  },
  {
    date: "30. Juni 2026",
    title: "FAQ/AIO-Potenziale identifiziert",
    detail:
      "Fragebasierte Suchanfragen von Lehrkräften gesammelt und für Google und AI Overviews priorisiert.",
  },
  {
    date: "2. Juli 2026",
    title: "Interne Verlinkung für Städte-Klassenfahrten priorisiert",
    detail:
      "Hub-Struktur für Berlin, Hamburg, München, Prag und Wien vorbereitet.",
  },
];

export interface HeadingRow {
  level: "H1" | "H2" | "H3";
  text: string;
}

export const headingStructure: {
  current: string[];
  recommended: HeadingRow[];
  h4Note: string;
  goal: string;
} = {
  current: [
    "H1 zu generisch: Der Hauptsuchintent Klassenfahrt ist nicht sofort erkennbar.",
    "H2-Bereiche sind nicht klar auf Suchintentionen abgebildet.",
    "Wichtige FAQ-Fragen fehlen auf der Startseite.",
    "Internes Verlinkungspotenzial ist nicht sichtbar genug.",
  ],
  recommended: [
    { level: "H1", text: "Klassenfahrten einfach planen – mit Klühspies Reisen" },
    { level: "H2", text: "Beliebte Klassenfahrten für Schulen" },
    { level: "H3", text: "Städtereisen" },
    { level: "H3", text: "Skiklassenfahrten" },
    { level: "H3", text: "Erlebnisreisen" },
    { level: "H2", text: "Warum Lehrkräfte mit Klühspies planen" },
    { level: "H2", text: "Reiseziele für Klassenfahrten" },
    { level: "H3", text: "Berlin Klassenfahrt" },
    { level: "H3", text: "Hamburg Klassenfahrt" },
    { level: "H3", text: "Prag Klassenfahrt" },
    { level: "H2", text: "Häufige Fragen zur Klassenfahrt" },
    { level: "H3", text: "Kosten, Sicherheit und Organisation" },
  ],
  h4Note:
    "H4 nur für unterstützende Details innerhalb von Karten und Infoboxen – nicht für zentrale SEO-Bereiche.",
  goal: "Ziel: klare semantische Struktur für Google, AI-Systeme und Lehrkräfte – ohne die Seite künstlich zu überladen.",
};

export const overviewCards: { label: string; value: string; detail: string }[] = [
  {
    label: "Aktueller Fokus",
    value: "Homepage-Struktur & interne Verlinkung",
    detail: "Erst das Gerüst, dann die Tiefe.",
  },
  {
    label: "Offene Freigaben",
    value: "6 Entscheidungen warten auf Feedback",
    detail: "Feedback direkt hier im Raum, kein PDF-Pingpong.",
  },
  {
    label: "Nächste Umsetzung",
    value: "H-Struktur, FAQ-Block, Städte-Hub",
    detail: "Umsetzung startet nach Freigabe.",
  },
  {
    label: "Fortschritt",
    value: "12 Empfehlungen · 4 freigegeben · 2 live",
    detail: "Stand: 2. Juli 2026",
  },
];

// ─── Klühspies CI (Quelle: Brand Manual, /kluehspies-brand-manual.pdf) ───────
export const KLUE = {
  blue: "#0578be",
  yellow: "#ffcd1c",
  black: "#000000",
  white: "#ffffff",
} as const;

export const brandColors: { name: string; hex: string; light?: boolean }[] = [
  { name: "Klühspies Blau", hex: KLUE.blue },
  { name: "Klühspies Gelb", hex: KLUE.yellow, light: true },
  { name: "Schwarz", hex: KLUE.black },
  { name: "Weiß", hex: KLUE.white, light: true },
];

export const brandValues = ["Jugendlichkeit", "Einfachheit", "Kompetenz"] as const;

export const BRAND_MANUAL_URL = "/kluehspies-brand-manual.pdf";
export const STORAGE_KEY = "kluehspies-room-access";

// ─── KPI Monitoring — Mock-Daten ─────────────────────────────────────────────
// Bewusst lokale Zahlen ohne API: Der Raum zeigt die Steuerungslogik,
// echte Datenquellen (GSC, Ranktracker) werden im nächsten Ausbau angebunden.

export type KpiStatus = "On Track" | "In Prüfung" | "Wartet auf Freigabe";
export type TrendDirection = "up" | "down" | "flat";

export interface KpiCard {
  id: string;
  label: string;
  value: string;
  target: string;
  status: KpiStatus;
  trend: TrendDirection;
  trendLabel: string;
  explanation: string;
}

export const kpiCards: KpiCard[] = [
  {
    id: "kpi-ranking",
    label: "Ø Keyword-Ranking",
    value: "17",
    target: "Ziel 12",
    status: "On Track",
    trend: "up",
    trendLabel: "von Position 24 seit Mai",
    explanation:
      "Durchschnittliche Position des beobachteten Keyword-Sets. Die Richtung stimmt, das Tempo wird wöchentlich geprüft.",
  },
  {
    id: "kpi-top10",
    label: "Top-10 Keywords",
    value: "14",
    target: "Ziel 30",
    status: "On Track",
    trend: "up",
    trendLabel: "+6 in acht Wochen",
    explanation:
      "Keywords auf Seite eins. Der wichtigste Frühindikator für planbare Anfragen von Lehrkräften.",
  },
  {
    id: "kpi-content",
    label: "Ratgeber Output",
    value: "2 / Woche",
    target: "Ziel 2 Artikel pro Woche",
    status: "On Track",
    trend: "flat",
    trendLabel: "Takt wird gehalten",
    explanation:
      "Jeder Ratgeber beantwortet eine konkrete Frage von Lehrkräften und verlinkt auf die passende Produktseite.",
  },
  {
    id: "kpi-links",
    label: "Link Pipeline",
    value: "100 / Monat",
    target: "Ziel 100 geprüfte Opportunities",
    status: "In Prüfung",
    trend: "up",
    trendLabel: "Aufbauphase läuft",
    explanation:
      "Geprüfte Link-Opportunities pro Monat. Qualifizierung läuft, erste Kontakte sind aktiv.",
  },
  {
    id: "kpi-approvals",
    label: "Freigaben offen",
    value: "6",
    target: "Ziel 0",
    status: "Wartet auf Freigabe",
    trend: "down",
    trendLabel: "staut sich seit zwei Wochen",
    explanation:
      "Offene Entscheidungen halten die Umsetzung zurück. Der schnellste Hebel in diesem Raum.",
  },
];

export interface RankingPoint {
  week: string;
  position: number;
}

export const rankingTrend: RankingPoint[] = [
  { week: "KW 21", position: 24 },
  { week: "KW 22", position: 23.4 },
  { week: "KW 23", position: 22.8 },
  { week: "KW 24", position: 21.6 },
  { week: "KW 25", position: 20.1 },
  { week: "KW 26", position: 19.2 },
  { week: "KW 27", position: 17.9 },
  { week: "KW 28", position: 17 },
];

export const rankingTarget = 12;

export const visibilityAside: { label: string; value: string; detail: string }[] = [
  {
    label: "Impressionen",
    value: "+18 % seit Mai",
    detail: "Google Search Console, letzte 28 Tage gegen Vormonat.",
  },
  {
    label: "Klickpotenzial",
    value: "Steigt mit dem Top-10-Anteil",
    detail:
      "Positionen 11 bis 20 werden kaum geklickt. Jedes Keyword, das die Top 10 erreicht, zahlt direkt auf Anfragen ein.",
  },
];

export const visibilityInsight =
  "Die Sichtbarkeit wird nicht über einzelne Rankings bewertet, sondern über den Fortschritt relevanter Keyword-Cluster.";

export type ArticleState = "Geplant" | "In Trello" | "Im Schreiben" | "Zur Freigabe" | "Live";

export const articleStates: ArticleState[] = [
  "Geplant",
  "In Trello",
  "Im Schreiben",
  "Zur Freigabe",
  "Live",
];

export interface ContentWeek {
  week: string;
  current?: boolean;
  articles: { title: string; state: ArticleState }[];
}

export const contentWeeks: ContentWeek[] = [
  {
    week: "KW 27",
    articles: [
      { title: "Wie viel kostet eine Klassenfahrt pro Schüler?", state: "Live" },
      { title: "Packliste für die Klassenfahrt", state: "Live" },
    ],
  },
  {
    week: "KW 28",
    current: true,
    articles: [
      { title: "Aufsichtspflicht auf Klassenfahrten: was Lehrkräfte wissen müssen", state: "Im Schreiben" },
      { title: "Zuschüsse und Fördertöpfe für Klassenfahrten", state: "In Trello" },
    ],
  },
  {
    week: "KW 29",
    articles: [
      { title: "Elternbrief zur Klassenfahrt: Aufbau und Vorlage", state: "Geplant" },
      { title: "Welches Reiseziel passt zu welcher Jahrgangsstufe?", state: "Geplant" },
    ],
  },
  {
    week: "KW 30",
    articles: [
      { title: "Die erste Klassenfahrt als Lehrkraft organisieren", state: "Geplant" },
      { title: "Nachhaltig auf Klassenfahrt: Bahn statt Bus?", state: "Geplant" },
    ],
  },
];

export const contentNote =
  "Ablage in Trello und hier im Raum. Alle Themen sind fragebasiert und stehen nicht in Konkurrenz zu den Produktseiten.";

export interface PipelineStage {
  label: string;
  display: string;
  share: number; // Anteil an der Ausgangsmenge, für die Balkenbreite
  detail: string;
}

export const linkPipeline: PipelineStage[] = [
  {
    label: "Link Opportunities geprüft",
    display: "100 / Monat",
    share: 1,
    detail: "Schulportale, Bildungsblogs, Regional- und Fachmedien im DACH-Raum.",
  },
  {
    label: "Qualifizierte Kontakte",
    display: "20",
    share: 0.2,
    detail: "Persönlich recherchiert, thematisch passend, redaktionell erreichbar.",
  },
  {
    label: "Hochwertige Links angestrebt",
    display: "5–10",
    share: 0.08,
    detail: "Nur Quellen, die Klühspies als Autorität für Klassenfahrten stützen.",
  },
];

export const linkPipelineLive = "Live-Links werden separat getrackt · aktuell 2";
export const linkPipelineNote =
  "Qualität vor Masse: Der Fokus liegt auf relevanten DACH-Quellen, nicht auf künstlicher Linkmenge.";

export type ProductPageStatus = "Wartet auf Freigabe" | "In Vorbereitung" | "Geplant · Sprint 2";
export type CheckState = "done" | "open";

export interface ProductPage {
  city: string;
  pilot?: boolean;
  status: ProductPageStatus;
  typo3: string;
  checks: { label: string; state: CheckState }[];
}

const pageChecks = (
  faq: CheckState,
  h2: CheckState,
  links: CheckState,
  meta: CheckState
): ProductPage["checks"] => [
  { label: "FAQ auf max. 5 reduziert", state: faq },
  { label: "H2-Paketblock", state: h2 },
  { label: "Interne Verlinkung", state: links },
  { label: "Meta Title & Description", state: meta },
];

export const productPages: ProductPage[] = [
  {
    city: "Berlin",
    pilot: true,
    status: "Wartet auf Freigabe",
    typo3: "~3 h",
    checks: pageChecks("done", "done", "done", "done"),
  },
  {
    city: "Hamburg",
    status: "In Vorbereitung",
    typo3: "~3 h",
    checks: pageChecks("done", "done", "open", "open"),
  },
  {
    city: "München",
    status: "In Vorbereitung",
    typo3: "~4 h",
    checks: pageChecks("done", "open", "open", "open"),
  },
  {
    city: "Prag",
    status: "Geplant · Sprint 2",
    typo3: "~3 h",
    checks: pageChecks("open", "open", "open", "open"),
  },
  {
    city: "Wien",
    status: "Geplant · Sprint 2",
    typo3: "~3 h",
    checks: pageChecks("open", "open", "open", "open"),
  },
];

export const productPagesNote =
  "Berlin dient als Pilot: Das Template wird an einer Seite bewiesen und danach auf alle Städte übertragen. Begründungen zu jeder Seite stehen in der SEO Pipeline.";

export const aiReadiness = {
  score: 62,
  explanation:
    "Wie gut die Website heute von Google AI Overviews und LLM-Systemen gelesen, verstanden und zitiert werden kann. Bewertet von SEESZN entlang von fünf Faktoren.",
  factors: [
    { label: "Klare H-Struktur", score: 55, note: "Zielbild steht, Umsetzung startet nach Freigabe." },
    { label: "FAQ-Qualität", score: 48, note: "Max. fünf Fragen pro Produktseite, FAQ-Hub in Planung." },
    { label: "Interne Verlinkung", score: 58, note: "Städte-Hub vorbereitet, Ratgeber-Links folgen." },
    { label: "Produktseiten-Fokus", score: 70, note: "Suchintent pro Stadt klar definiert." },
    { label: "Ratgeber ohne Kannibalisierung", score: 80, note: "URL-Regeln stehen, Themen fragebasiert geplant." },
  ],
} as const;

export interface Blocker {
  title: string;
  detail: string;
}

export const blockers: Blocker[] = [
  {
    title: "6 Freigaben offen",
    detail:
      "Drei Homepage-Freigaben, zwei Mockup-Empfehlungen und die Berlin-Pilotseite warten auf eine Entscheidung.",
  },
  {
    title: "Berlin Pilotseite wartet auf Freigabe",
    detail:
      "Das Produktseiten-Template wird an Berlin bewiesen und danach auf Hamburg, München, Prag und Wien übertragen.",
  },
  {
    title: "FAQ-Hub Struktur offen",
    detail:
      "Die zentrale FAQ-Seite sammelt künftig alle Fragen, Produktseiten behalten maximal fünf.",
  },
  {
    title: "Ratgeber-URL-Regeln bereit für Trello",
    detail:
      "Themen- und fragebasierte URLs, keine Konkurrenz zu den Produktseiten. Ablage heute Abend.",
  },
];

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  metric: string;
  status: string;
}

export const experiments: Experiment[] = [
  {
    id: "exp-01",
    title: "Berlin als Pilot-Produktseite",
    hypothesis:
      "Neue H-Struktur, H2-Paketblock und maximal fünf FAQs verbessern Ranking und AI-Zitierfähigkeit der Seite messbar.",
    metric: "Position für Klassenfahrt Berlin · Impressionen der Seite",
    status: "Wartet auf Freigabe",
  },
  {
    id: "exp-02",
    title: "FAQ-Hub als zentrale Fragenseite",
    hypothesis:
      "Ein Hub bündelt Longtail-Fragen und entlastet die Produktseiten, ohne deren Rankings zu kannibalisieren.",
    metric: "FAQ-Rankings · Anteil fragebasierter Impressionen",
    status: "Struktur in Arbeit",
  },
  {
    id: "exp-03",
    title: "Ratgeber als Zubringer",
    hypothesis:
      "Fragebasierte Ratgeber verlinken auf Produktseiten und stärken deren Autorität, statt mit ihnen zu konkurrieren.",
    metric: "Interne Klicks Ratgeber → Produktseite",
    status: "Startet in KW 28",
  },
];
