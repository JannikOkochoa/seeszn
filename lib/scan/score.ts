// ─── Heuristic readiness scoring ──────────────────────────────────────────────
// Turns raw surface signals into six readiness scores plus the first finding,
// observations and reading text.
//
// READ THIS BEFORE CHANGING NUMBERS: these are HEURISTIC readiness scores based
// on observable surface signals (HTML structure, robots/sitemap, schema, an
// optional performance signal). They are NOT a measurement of AI ranking or
// citation share. We never query an AI system or a search engine to produce
// them. Each score answers "how ready is this surface to be read and cited",
// not "where does this brand rank".

import type {
  CategoryId,
  Locale,
  Observation,
  RawSignals,
  ScanResult,
  ScanStatus,
  ScoreCard,
} from "./types";
import { detectBrandName } from "./aiQuestions";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function band(score: number): ScanStatus {
  if (score < 45) return "schwach";
  if (score < 70) return "mittel";
  return "stark";
}

// ── fixed product labels (same in both locales — they are the product) ─────────
const LABELS: Record<CategoryId, string> = {
  indexierbarkeit: "Indexierbarkeit",
  entityClarity: "Entity Clarity",
  sourceSurface: "Source Surface Quality",
  answerReadiness: "Answer Readiness",
  technicalTrust: "Technical Trust",
  conversionSurface: "Conversion Surface",
};

// ── raw score formulas ─────────────────────────────────────────────────────────

function scoreIndexierbarkeit(s: RawSignals): number {
  let v = 0;
  if (s.httpStatus === 200) v += 30;
  else if (s.httpStatus && s.httpStatus < 400) v += 18;
  if (s.robotsTxt === "allows") v += 25;
  else if (s.robotsTxt === "missing") v += 12;
  else if (s.robotsTxt === "error") v += 12;
  if (s.sitemap === "found") v += 20;
  else if (s.sitemap === "error") v += 8;
  if (s.canonical) v += 15;
  if (s.https) v += 10;
  return clamp(v);
}

function scoreEntityClarity(s: RawSignals): number {
  let v = 0;
  if (s.title && s.titleLength >= 10) v += 20;
  if (s.h1.length === 1) v += 20;
  else if (s.h1.length > 1) v += 10;
  if (s.ogSiteName) v += 15;
  if (s.hasOrganizationSchema) v += 25;
  if (s.ogTitle) v += 10;
  if (s.jsonLdTypes.length > 0) v += 10;
  return clamp(v);
}

function scoreSourceSurface(s: RawSignals): number {
  let v = 0;
  if (s.wordCount >= 600) v += 25;
  else if (s.wordCount >= 300) v += 15;
  else v += 5;
  if (s.h2Count >= 4) v += 20;
  else if (s.h2Count >= 2) v += 12;
  else v += 3;
  if (s.externalLinks >= 3) v += 15;
  else if (s.externalLinks >= 1) v += 8;
  if (s.hasArticleSchema) v += 15;
  if (s.faqPattern) v += 15;
  if (s.jsonLdTypes.length > 0) v += 10;
  return clamp(v);
}

function scoreAnswerReadiness(s: RawSignals): number {
  let v = 0;
  if (s.metaDescription && s.metaDescriptionLength >= 50) v += 20;
  else if (s.metaDescription) v += 10;
  if (s.faqPattern) v += 20;
  if (s.hasFaqSchema) v += 15;
  if (s.h2Count >= 3) v += 15;
  else if (s.h2Count >= 1) v += 8;
  if (s.title) v += 10;
  if (s.wordCount >= 300) v += 10;
  if (s.h1.length >= 1) v += 10;
  return clamp(v);
}

function scoreTechnicalTrust(s: RawSignals): number {
  let v = 5;
  if (s.https) v += 25;
  if (s.canonical) v += 10;
  if (s.ogTitle && s.ogDescription) v += 15;
  if (s.jsonLdTypes.length > 0) v += 10;
  if (s.performanceState === "measured" && s.performance !== null) {
    v += Math.round((s.performance / 100) * 35);
  } else {
    v += 15; // not measured — neutral, never penalized
  }
  return clamp(v);
}

function scoreConversionSurface(s: RawSignals): number {
  let v = 10;
  if (s.conversionSignal) v += 40;
  if (s.internalLinks >= 10) v += 30;
  else if (s.internalLinks >= 4) v += 18;
  else v += 6;
  if (s.ogTitle) v += 10;
  if (s.wordCount >= 300) v += 10;
  return clamp(v);
}

// ── localized reasons + next steps ──────────────────────────────────────────────

type Copy = Record<CategoryId, Record<ScanStatus, { reason: string; next: string }>>;

const COPY: Record<Locale, Copy> = {
  de: {
    indexierbarkeit: {
      schwach: { reason: "Grundlegende Crawlbarkeit ist nicht sauber: Erreichbarkeit, robots.txt oder Sitemap blockieren oder fehlen.", next: "Erreichbarkeit, robots.txt und sitemap.xml prüfen und sauber freigeben." },
      mittel: { reason: "Die Seite ist crawlbar, aber einzelne Indexier-Signale fehlen noch.", next: "Canonical und Sitemap konsequent setzen, damit jede Seite eindeutig indexierbar ist." },
      stark: { reason: "Die Oberfläche ist sauber erreichbar und für Crawler freigegeben.", next: "Indexierung stabil halten und auf weitere wichtige Seiten ausweiten." },
    },
    entityClarity: {
      schwach: { reason: "Maschinen können kaum auflösen, wer die Marke ist: Titel, H1, Site-Name oder Organisationsdaten fehlen.", next: "Klaren Titel, eine eindeutige H1 und Organization-Schema mit konsistentem Markennamen ergänzen." },
      mittel: { reason: "Die Marke ist erkennbar, aber die Identitätssignale sind noch uneinheitlich.", next: "Markenname über Titel, H1, OG-Site-Name und Schema konsistent ausrichten." },
      stark: { reason: "Wer die Marke ist, lässt sich klar aus der Oberfläche lesen.", next: "Entitätssignale auf Unterseiten und externe Profile übertragen." },
    },
    sourceSurface: {
      schwach: { reason: "Es gibt wenig zitierfähige Substanz: kaum Text, schwache Struktur, kaum belegende Verweise.", next: "Erklärende Inhalte mit klarer Gliederung, Belegen und ausgehenden Quellen aufbauen." },
      mittel: { reason: "Erste zitierfähige Fläche ist da, aber Tiefe und Struktur lassen sich ausbauen.", next: "Antwortstarke Abschnitte, FAQ-Blöcke und belegende Verweise ergänzen." },
      stark: { reason: "Die Oberfläche bietet zitierfähige, strukturierte Inhalte.", next: "Themencluster ausbauen, damit mehr Fragen abgedeckt werden." },
    },
    answerReadiness: {
      schwach: { reason: "Die Seite ist kaum auf direkte Antworten vorbereitet: wenig Beschreibung, kaum Frage-Antwort-Struktur.", next: "Meta-Description, klare Zwischenüberschriften und einen FAQ-Block mit echten Fragen ergänzen." },
      mittel: { reason: "Antwortflächen sind angelegt, aber noch nicht durchgängig nutzbar.", next: "Wichtige Fragen je Seite präzise und knapp beantworten, mit passendem Schema." },
      stark: { reason: "Die Inhalte sind klar strukturiert und gut als direkte Antwort nutzbar.", next: "Frage-Antwort-Abschnitte auf weitere relevante Suchanfragen ausweiten." },
    },
    technicalTrust: {
      schwach: { reason: "Technische Vertrauenssignale fehlen: HTTPS, Canonical, OpenGraph oder strukturierte Daten sind unvollständig.", next: "HTTPS, Canonical, OpenGraph und Schema.org vollständig und konsistent setzen." },
      mittel: { reason: "Die technische Basis steht, einzelne Vertrauenssignale fehlen aber noch.", next: "OpenGraph und strukturierte Daten vervollständigen und die Performance prüfen." },
      stark: { reason: "Die technische Basis ist solide und vertrauenswürdig aufgesetzt.", next: "Performance und strukturierte Daten regelmäßig überwachen." },
    },
    conversionSurface: {
      schwach: { reason: "Aus der Sichtbarkeit entsteht kein klarer nächster Schritt: kein deutlicher Weg zu Kontakt oder Aktion.", next: "Einen klaren, sichtbaren nächsten Schritt platzieren und intern sauber verlinken." },
      mittel: { reason: "Ein Conversion-Pfad ist erkennbar, aber noch nicht durchgängig geführt.", next: "Den Weg von der Antwort zur Aktion auf jeder wichtigen Seite eindeutig machen." },
      stark: { reason: "Sichtbarkeit führt zu einem klaren, erreichbaren nächsten Schritt.", next: "Conversion-Pfade messen und gezielt nachschärfen." },
    },
  },
  en: {
    indexierbarkeit: {
      schwach: { reason: "Basic crawlability is not clean: reachability, robots.txt or the sitemap block or are missing.", next: "Check reachability, robots.txt and sitemap.xml and open them up cleanly." },
      mittel: { reason: "The page is crawlable, but some indexing signals are still missing.", next: "Set canonical and sitemap consistently so every page is clearly indexable." },
      stark: { reason: "The surface is cleanly reachable and open to crawlers.", next: "Keep indexing stable and extend it to other key pages." },
    },
    entityClarity: {
      schwach: { reason: "Machines can barely resolve who the brand is: title, H1, site name or organization data are missing.", next: "Add a clear title, one unambiguous H1 and Organization schema with a consistent brand name." },
      mittel: { reason: "The brand is recognizable, but identity signals are still inconsistent.", next: "Align the brand name across title, H1, OG site name and schema." },
      stark: { reason: "Who the brand is reads clearly from the surface.", next: "Carry entity signals onto subpages and external profiles." },
    },
    sourceSurface: {
      schwach: { reason: "There is little citable substance: thin text, weak structure, few supporting references.", next: "Build explanatory content with clear structure, proof and outbound sources." },
      mittel: { reason: "A first citable surface exists, but depth and structure can grow.", next: "Add answer-rich sections, FAQ blocks and supporting references." },
      stark: { reason: "The surface offers citable, structured content.", next: "Expand topic clusters so more questions are covered." },
    },
    answerReadiness: {
      schwach: { reason: "The page is barely prepared for direct answers: little description, almost no question-answer structure.", next: "Add a meta description, clear subheadings and an FAQ block with real questions." },
      mittel: { reason: "Answer surfaces exist but are not yet consistently usable.", next: "Answer key questions per page precisely and concisely, with matching schema." },
      stark: { reason: "Content is clearly structured and usable as a direct answer.", next: "Extend question-answer sections to more relevant searches." },
    },
    technicalTrust: {
      schwach: { reason: "Technical trust signals are missing: HTTPS, canonical, OpenGraph or structured data are incomplete.", next: "Set HTTPS, canonical, OpenGraph and Schema.org fully and consistently." },
      mittel: { reason: "The technical base is in place, but some trust signals are still missing.", next: "Complete OpenGraph and structured data and check performance." },
      stark: { reason: "The technical base is solid and trustworthy.", next: "Monitor performance and structured data regularly." },
    },
    conversionSurface: {
      schwach: { reason: "Visibility does not produce a clear next step: no obvious path to contact or action.", next: "Place one clear, visible next step and link it well internally." },
      mittel: { reason: "A conversion path is visible but not yet consistently guided.", next: "Make the path from answer to action explicit on every key page." },
      stark: { reason: "Visibility leads to a clear, reachable next step.", next: "Measure conversion paths and sharpen them deliberately." },
    },
  },
};

// short weak-phrase fragments used to compose the first finding
const WEAK_PHRASE: Record<Locale, Record<CategoryId, string>> = {
  de: {
    indexierbarkeit: "technisch noch nicht sauber indexierbar",
    entityClarity: "als Marke noch nicht klar genug erkennbar",
    sourceSurface: "noch nicht klar genug als zitierbare Quelle aufgebaut",
    answerReadiness: "mit wenig Antwortfläche für direkte Fragen",
    technicalTrust: "mit fehlenden technischen Vertrauenssignalen",
    conversionSurface: "ohne klaren nächsten Schritt",
  },
  en: {
    indexierbarkeit: "not yet cleanly indexable",
    entityClarity: "not yet clearly recognizable as a brand",
    sourceSurface: "not yet built as a citable source",
    answerReadiness: "with little answer surface for direct questions",
    technicalTrust: "with missing technical trust signals",
    conversionSurface: "without a clear next step",
  },
};

// ── observations ────────────────────────────────────────────────────────────────

function buildObservations(s: RawSignals, locale: Locale): Observation[] {
  const de = locale === "de";
  const yes = de ? "vorhanden" : "present";
  const no = de ? "fehlt" : "missing";
  const list: Observation[] = [
    { label: de ? "Titel" : "Title", value: s.title ? truncate(s.title, 64) : no, ok: !!s.title },
    {
      label: de ? "Meta-Beschreibung" : "Meta description",
      value: s.metaDescription ? truncate(s.metaDescription, 80) : no,
      ok: !!s.metaDescription,
    },
    { label: "H1", value: s.h1.length ? truncate(s.h1[0], 56) : no, ok: s.h1.length === 1 },
    { label: de ? "H2-Abschnitte" : "H2 sections", value: String(s.h2Count), ok: s.h2Count >= 2 },
    { label: "Canonical", value: s.canonical ? yes : no, ok: !!s.canonical },
    {
      label: "OpenGraph",
      value: s.ogTitle || s.ogDescription ? yes : no,
      ok: !!(s.ogTitle && s.ogDescription),
    },
    {
      label: "Schema.org",
      value: s.jsonLdTypes.length ? s.jsonLdTypes.slice(0, 4).join(", ") : no,
      ok: s.jsonLdTypes.length > 0,
    },
    { label: "robots.txt", value: robotsLabel(s.robotsTxt, locale), ok: s.robotsTxt === "allows" },
    { label: "sitemap.xml", value: sitemapLabel(s.sitemap, locale), ok: s.sitemap === "found" },
    {
      label: de ? "FAQ / Antwortblock" : "FAQ / answer block",
      value: s.faqPattern ? (de ? "erkannt" : "detected") : (de ? "nicht erkannt" : "not detected"),
      ok: s.faqPattern,
    },
    {
      label: de ? "Interne Links" : "Internal links",
      value: String(s.internalLinks),
      ok: s.internalLinks >= 4,
    },
    {
      label: de ? "Externe Verweise" : "External references",
      value: String(s.externalLinks),
      ok: s.externalLinks >= 1,
    },
    {
      label: de ? "Wortumfang (Startseite)" : "Word count (homepage)",
      value: `~${s.wordCount}`,
      ok: s.wordCount >= 300,
    },
    {
      label: de ? "Performance-Signal" : "Performance signal",
      value:
        s.performanceState === "measured" && s.performance !== null
          ? `${s.performance}/100`
          : de
            ? "nicht gemessen"
            : "not measured",
      ok: s.performanceState === "measured" ? (s.performance ?? 0) >= 50 : null,
    },
  ];
  return list;
}

function robotsLabel(state: RawSignals["robotsTxt"], locale: Locale): string {
  const de = locale === "de";
  switch (state) {
    case "allows": return de ? "gibt Crawling frei" : "allows crawling";
    case "blocks": return de ? "blockiert Crawling" : "blocks crawling";
    case "missing": return de ? "nicht gefunden" : "not found";
    default: return de ? "nicht prüfbar" : "not checkable";
  }
}

function sitemapLabel(state: RawSignals["sitemap"], locale: Locale): string {
  const de = locale === "de";
  switch (state) {
    case "found": return de ? "gefunden" : "found";
    case "missing": return de ? "nicht gefunden" : "not found";
    default: return de ? "nicht prüfbar" : "not checkable";
  }
}

function truncate(s: string, max: number): string {
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

// ── finding + meaning + overall next step ────────────────────────────────────────

function buildFinding(cards: ScoreCard[], overall: number, locale: Locale): string {
  const de = locale === "de";
  const weak = cards.filter((c) => c.status === "schwach").sort((a, b) => a.score - b.score);
  const phrases = WEAK_PHRASE[locale];

  if (overall >= 70) {
    const lead = de ? "Technisch solide." : "Technically solid.";
    if (weak.length === 0) {
      return de
        ? `${lead} Die Oberfläche ist als zitierbare Quelle ordentlich aufgestellt.`
        : `${lead} The surface is set up reasonably well as a citable source.`;
    }
    const tail = phrases[weak[0].id];
    return de ? `${lead} Aber ${tail}.` : `${lead} But ${tail}.`;
  }

  const lead = de ? "Die Marke ist erreichbar, aber" : "The brand is reachable, but";
  const picks = (weak.length ? weak : [...cards].sort((a, b) => a.score - b.score)).slice(0, 2);
  const fragments = picks.map((c) => phrases[c.id]);
  const joined = de
    ? fragments.join(" und ")
    : fragments.join(" and ");
  return `${lead} ${joined}.`;
}

function buildMeaning(cards: ScoreCard[], locale: Locale): string {
  const de = locale === "de";
  const strongest = [...cards].sort((a, b) => b.score - a.score)[0];
  if (de) {
    return (
      "Such- und KI-Systeme lesen genau diese Oberfläche, bevor sie eine Marke verstehen oder als Quelle nutzen. " +
      "Wo Struktur, Belege oder klare Signale fehlen, wird eine Marke seltener korrekt aufgelöst und seltener zitiert. " +
      `Am stärksten ist aktuell ${strongest.label}, hier lässt sich am schnellsten aufbauen.`
    );
  }
  return (
    "Search and AI systems read exactly this surface before they understand a brand or use it as a source. " +
    "Where structure, proof or clear signals are missing, a brand is resolved correctly and cited less often. " +
    `The current strength is ${strongest.label}, which is the fastest base to build on.`
  );
}

function buildNextStep(cards: ScoreCard[], locale: Locale): string {
  const de = locale === "de";
  const weakest = [...cards].sort((a, b) => a.score - b.score)[0];
  const lead = de ? "Der sinnvollste erste Schritt:" : "The most useful first step:";
  return `${lead} ${weakest.nextStep}`;
}

// ── public entry ──────────────────────────────────────────────────────────────────

export interface ScoreInput {
  domain: string;
  url: string;
  signals: RawSignals;
  locale: Locale;
}

export function scoreSurface({ domain, url, signals, locale }: ScoreInput): ScanResult {
  const defs: { id: CategoryId; score: number }[] = [
    { id: "indexierbarkeit", score: scoreIndexierbarkeit(signals) },
    { id: "entityClarity", score: scoreEntityClarity(signals) },
    { id: "sourceSurface", score: scoreSourceSurface(signals) },
    { id: "answerReadiness", score: scoreAnswerReadiness(signals) },
    { id: "technicalTrust", score: scoreTechnicalTrust(signals) },
    { id: "conversionSurface", score: scoreConversionSurface(signals) },
  ];

  const cards: ScoreCard[] = defs.map(({ id, score }) => {
    const status = band(score);
    return {
      id,
      label: LABELS[id],
      score,
      status,
      reason: COPY[locale][id][status].reason,
      nextStep: COPY[locale][id][status].next,
    };
  });

  const overallScore = clamp(defs.reduce((sum, d) => sum + d.score, 0) / defs.length);
  const gapCount = cards.filter((c) => c.status === "schwach").length;

  return {
    domain,
    url,
    fetchedAt: new Date().toISOString(),
    locale,
    reachable: true,
    overallScore,
    overallStatus: band(overallScore),
    finding: buildFinding(cards, overallScore, locale),
    gapCount,
    scores: cards,
    observations: buildObservations(signals, locale),
    meaning: buildMeaning(cards, locale),
    nextStep: buildNextStep(cards, locale),
    // KI-Antwortfragen are attached by the scan route (the optional web-signal
    // check is async). We seed the brand name and empty arrays here so the result
    // shape is always complete even if that step is skipped.
    aiAnswerQuestions: [],
    aiAnswerChecks: [],
    brandName: detectBrandName(domain, signals),
    signals,
  };
}
