// ─── First Move: die Sprachschicht der Prüfung ────────────────────────────────
// Die Prüfung ist Logik, ihre Sätze sind Copy. Bis August 2026 lagen beide in
// denselben Funktionen, und die Auswertung konnte deshalb nur Deutsch sprechen.
// Mit der englischen Startseite braucht dieselbe Logik eine zweite Stimme.
//
// Regeln dieser Datei:
//
//   1. Hier steht ausschließlich Text. Keine Schwelle, keine Verzweigung, keine
//      Bewertung. Wer eine Regel ändern will, ändert sie in diagnosis.ts oder
//      qualify.ts, nie hier.
//   2. Deutsch bleibt der Standard. Jede Funktion, die eine Sprache annimmt,
//      hat "de" als Vorgabe, damit der bestehende Kaufweg unter /first-move
//      Wort für Wort unverändert bleibt.
//   3. Beide Sprachen tragen dieselbe Aussage mit denselben Zahlen. Englisch
//      ist eine eigene Formulierung, keine Wort-für-Wort-Übersetzung.
//   4. Es wird nie mehr behauptet als gemessen. Ein Satz, der im Deutschen eine
//      Grenze benennt, benennt sie im Englischen auch.
//
// Der Paid Check bleibt bewusst außen vor: er läuft nur unter
// /google-ads/first-move und hat keine englische Oberfläche.

import type { EvidenceLimitation, PublicDiagnosisState } from "./diagnosis";
import type { ConfidenceBand, DiagnosisCategory } from "./outcome";

/** Die beiden Sprachen der Produktoberfläche. */
export type FmLocale = "de" | "en";

/**
 * Englische Zählform. Deutsch braucht sie an diesen Stellen nicht, Englisch
 * schon: "1 pages checked" liest sich wie ein Fehler im Protokoll und
 * beschädigt genau das Vertrauen, das die Prüfung aufbaut.
 */
function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

// ── Diagnose: die fünf Dimensionen ────────────────────────────────────────────

export interface DiagnosisStrings {
  indexability: {
    label: string;
    robotsBlocked: string;
    tooFewPages: string;
    share(indexable: number, total: number): string;
    homeNoindex(share: string): string;
  };
  crawlAccess: {
    label: string;
    robotsBlocked: string;
    sitemap(urls: number, partial: boolean): string;
    linksOnly(links: number): string;
    sparse(links: number): string;
  };
  pageIdentity: {
    label: string;
    tooFewPages: string;
    duplicateTitles(pages: number, total: number): string;
    duplicateDescriptions(pages: number, total: number): string;
    missingH1(missing: number, total: number): string;
    solid(total: number): string;
    mixed(missing: number, total: number): string;
  };
  entity: {
    label: string;
    solid(types: number, canonical: number, total: number): string;
    organizationOnly: string;
    siteNameOnly: string;
    weak: string;
  };
  answerStructure: {
    label: string;
    tooFewPages: string;
    aiCrawlersBlocked(agents: string): string;
    solid(answering: number, total: number): string;
    none(total: number): string;
    mixed(answering: number, total: number): string;
  };
}

const DIAGNOSIS_DE: DiagnosisStrings = {
  indexability: {
    label: "Technische Basis",
    robotsBlocked: "Die robots.txt sperrt den generischen Crawler für die gesamte Domain.",
    tooFewPages: "Es waren zu wenige Seiten öffentlich lesbar, um die Indexierbarkeit zu beurteilen.",
    share: (indexable, total) => `${indexable} von ${total} geprüften Seiten sind indexierbar.`,
    homeNoindex: (share) => `Die Startseite liefert eine noindex-Anweisung aus. ${share}`,
  },
  crawlAccess: {
    label: "Crawl und Sitemap",
    robotsBlocked: "Das Crawling ist per robots.txt für / gesperrt.",
    sitemap: (urls, partial) =>
      `Eine Sitemap ist öffentlich erreichbar und bietet ${urls} URLs an${partial ? ", davon eine Teilmenge gelesen" : ""}.`,
    linksOnly: (links) =>
      `Es ist keine lesbare Sitemap vorhanden. Die Erschließung läuft über ${links} interne Links auf der Startseite.`,
    sparse: (links) =>
      `Es ist weder eine lesbare Sitemap noch eine dichte interne Verlinkung vorhanden; die Startseite verweist auf ${links} interne Ziele.`,
  },
  pageIdentity: {
    label: "Seitenidentität",
    tooFewPages: "Für einen Vergleich von Titeln und Überschriften waren zu wenige Seiten lesbar.",
    duplicateTitles: (pages, total) =>
      `${pages} der ${total} geprüften Seiten teilen sich denselben Title.`,
    duplicateDescriptions: (pages, total) =>
      `${pages} der ${total} geprüften Seiten tragen dieselbe Meta Description.`,
    missingH1: (missing, total) => `${missing} von ${total} geprüften Seiten liefern keine H1 aus.`,
    solid: (total) => `Alle ${total} geprüften Seiten tragen einen eigenen Title und eine eigene H1.`,
    mixed: (missing, total) =>
      `Die geprüften Seiten sind überwiegend eigenständig ausgezeichnet; ${missing} von ${total} liefern keine H1 aus.`,
  },
  entity: {
    label: "Absender und Auszeichnung",
    solid: (types, canonical, total) =>
      `Die Startseite benennt den Absender per Organization-Auszeichnung; ${types} strukturierte Typen sind ausgezeichnet, ${canonical} von ${total} geprüften Seiten sind selbstkanonisch.`,
    organizationOnly:
      "Die Startseite trägt eine Organization-Auszeichnung, sonst aber wenig strukturierte Daten.",
    siteNameOnly:
      "Die Startseite benennt sich per og:site_name, führt aber keine Organization-Auszeichnung.",
    weak: "Die Startseite trägt weder eine Organization-Auszeichnung noch einen og:site_name. Der Absender ist maschinell nicht eindeutig benannt.",
  },
  answerStructure: {
    label: "Antwortstruktur",
    tooFewPages:
      "Für eine Aussage über zitierfähige Antwortblöcke waren zu wenige inhaltstragende Seiten lesbar.",
    aiCrawlersBlocked: (agents) =>
      `Die robots.txt sperrt ${agents}. Diese Systeme können die Inhalte nicht als Quelle lesen.`,
    solid: (answering, total) =>
      `${answering} von ${total} inhaltstragenden Seiten enthalten als Frage formulierte Überschriften oder eine Frage-Antwort-Auszeichnung.`,
    none: (total) =>
      `Keine der ${total} inhaltstragenden Seiten enthält eine als Frage formulierte Überschrift oder eine Frage-Antwort-Auszeichnung.`,
    mixed: (answering, total) =>
      `${answering} von ${total} inhaltstragenden Seiten tragen einen abgrenzbaren Antwortblock.`,
  },
};

const DIAGNOSIS_EN: DiagnosisStrings = {
  indexability: {
    label: "Technical base",
    robotsBlocked: "robots.txt blocks the generic crawler across the whole domain.",
    tooFewPages: "Too few pages were publicly readable to judge indexability.",
    share: (indexable, total) => `${indexable} of ${total} checked pages are indexable.`,
    homeNoindex: (share) => `The home page returns a noindex directive. ${share}`,
  },
  crawlAccess: {
    label: "Crawl and sitemap",
    robotsBlocked: "robots.txt blocks crawling of / for the generic crawler.",
    sitemap: (urls, partial) =>
      `A sitemap is publicly reachable and offers ${count(urls, "URL", "URLs")}${partial ? ", of which we read a subset" : ""}.`,
    linksOnly: (links) =>
      `No readable sitemap is available. Discovery runs through ${count(links, "internal link", "internal links")} on the home page.`,
    sparse: (links) =>
      `Neither a readable sitemap nor dense internal linking is available; the home page points to ${count(links, "internal target", "internal targets")}.`,
  },
  pageIdentity: {
    label: "Page identity",
    tooFewPages: "Too few pages were readable to compare titles and headings.",
    duplicateTitles: (pages, total) => `${pages} of the ${total} checked pages share one title.`,
    duplicateDescriptions: (pages, total) =>
      `${pages} of the ${total} checked pages carry the same meta description.`,
    missingH1: (missing, total) => `${missing} of ${total} checked pages ship without an H1.`,
    solid: (total) => `All ${total} checked pages carry their own title and their own H1.`,
    mixed: (missing, total) =>
      `The checked pages are mostly marked up in their own right; ${missing} of ${total} ship without an H1.`,
  },
  entity: {
    label: "Publisher and markup",
    solid: (types, canonical, total) =>
      `The home page names its publisher through Organization markup; ${types} structured types are marked up, ${canonical} of ${total} checked pages are self-canonical.`,
    organizationOnly:
      "The home page carries Organization markup, but little structured data beyond it.",
    siteNameOnly: "The home page names itself through og:site_name without Organization markup.",
    weak: "The home page carries neither Organization markup nor an og:site_name. Machines cannot resolve who publishes these statements.",
  },
  answerStructure: {
    label: "Answer structure",
    tooFewPages: "Too few content pages were readable to say anything about citable answer blocks.",
    aiCrawlersBlocked: (agents) =>
      `robots.txt blocks ${agents}. Those systems cannot read the content as a source.`,
    solid: (answering, total) =>
      `${answering} of ${total} content pages carry question-shaped headings or question-answer markup.`,
    none: (total) =>
      `None of the ${total} content pages carries a question-shaped heading or question-answer markup.`,
    mixed: (answering, total) =>
      `${answering} of ${total} content pages carry a self-contained answer block.`,
  },
};

export const DIAGNOSIS_STRINGS: Record<FmLocale, DiagnosisStrings> = {
  de: DIAGNOSIS_DE,
  en: DIAGNOSIS_EN,
};

// ── Qualify: die Befundkandidaten ─────────────────────────────────────────────

export interface QualifyStrings {
  competingIntent: {
    signature(pages: number): string;
    noCanonical: string;
    internalLinks(linked: number, pages: number): string;
    title(pages: number): string;
    summary: string;
    interventionType: string;
    intervention: string;
  };
  robotsBlock: {
    title: string;
    summary: string;
    observation: string;
    interventionType: string;
    intervention: string;
  };
  homeNoindex: {
    title: string;
    summary: string;
    observation: string;
    interventionType: string;
    intervention: string;
  };
  templateDefect: {
    missingH1(missing: number, total: number): string;
    duplicateTitles(pages: number): string;
    duplicateDescriptions(pages: number): string;
    aiCrawlersBlocked(agents: string): string;
    answerless(pages: number, total: number): string;
    noPublisher: string;
    thinPages(thin: number, total: number): string;
    title: string;
    summary: string;
    interventionType: string;
    intervention: string;
  };
  eligibility: {
    enterpriseScale: string;
    multiMarket: string;
  };
}

const QUALIFY_DE: QualifyStrings = {
  competingIntent: {
    signature: (pages) =>
      `${pages} indexierbare Seiten tragen eine weitgehend deckungsgleiche Titel- und H1-Signatur.`,
    noCanonical:
      "Keine dieser Seiten verweist per Canonical auf eine der anderen. Sie stehen als eigenständige Ziele nebeneinander.",
    internalLinks: (linked, pages) =>
      `Die Startseite verlinkt ${linked} von ${pages} dieser Seiten direkt. Die interne Unterstützung verteilt sich statt zu bündeln.`,
    title: (pages) => `${pages} Seiten konkurrieren um dieselbe kommerzielle Absicht.`,
    summary:
      "Mehrere eigenständig indexierbare Seiten adressieren dieselbe Suchabsicht. Relevanz, interne Verlinkung und externe Signale verteilen sich auf mehrere Ziele, statt sich auf einem zu bündeln.",
    interventionType: "Konsolidierung auf eine zentrale Zielseite",
    intervention: "Konsolidierung auf eine kanonische Zielseite.",
  },
  robotsBlock: {
    title: "Die robots.txt sperrt den generischen Crawler für die gesamte Domain.",
    summary:
      "Die öffentliche robots.txt enthält für User-agent * ein Disallow auf das Wurzelverzeichnis. Damit ist die gesamte Domain für reguläres Crawling gesperrt.",
    observation: "robots.txt setzt für User-agent * ein Disallow auf /.",
    interventionType: "Crawling und Indexierbarkeit freigeben",
    intervention: "Crawling gezielt freigeben und die Freigabe verifizieren.",
  },
  homeNoindex: {
    title: "Die Startseite ist auf noindex gesetzt.",
    summary:
      "Die Startseite liefert eine noindex-Anweisung aus. Sie kann damit nicht als Einstiegs- und Autoritätsseite wirken.",
    observation:
      "Bei unserem Abruf liefert die Startseite mit Status 200 eine noindex-Anweisung aus, per robots-Meta oder X-Robots-Tag.",
    interventionType: "Indexierbarkeit der Einstiegsseite herstellen",
    intervention: "Indexierbarkeit der Einstiegsseite herstellen und verifizieren.",
  },
  templateDefect: {
    missingH1: (missing, total) =>
      `${missing} von ${total} geprüften Seiten liefern keine H1 aus. Die Hauptaussage der Seite ist maschinell nicht eindeutig.`,
    duplicateTitles: (pages) =>
      `${pages} geprüfte Seiten teilen sich denselben Title. Die Seiten sind in der Trefferliste nicht unterscheidbar.`,
    duplicateDescriptions: (pages) => `${pages} geprüfte Seiten teilen sich dieselbe Meta Description.`,
    aiCrawlersBlocked: (agents) =>
      `Die robots.txt sperrt ${agents} vollständig. Diese Systeme können die Inhalte nicht als Quelle lesen.`,
    answerless: (pages, total) =>
      `${pages} von ${total} geprüften Seiten enthalten keine als Frage formulierte Überschrift und keine Frage-Antwort-Auszeichnung. Es gibt damit wenig abgrenzbare Passagen, die als Antwort zitiert werden können.`,
    noPublisher:
      "Die Startseite trägt weder eine Organization-Auszeichnung noch einen og:site_name. Der Absender der Aussagen ist maschinell nicht eindeutig benannt.",
    thinPages: (thin, total) =>
      `${thin} von ${total} geprüften Seiten liefern unter 250 Wörter im ausgelieferten HTML. Für eine belastbare Passage reicht das selten.`,
    title: "Ein Template-Defekt flacht die Struktur über viele Seiten hinweg ab.",
    summary:
      "Der Defekt sitzt im geprüften Seitentyp und wiederholt sich über jede Seite, die daraus entsteht. Alle Seiten dieses Templates verlieren dadurch gleichzeitig an Trennschärfe.",
    interventionType: "Template-Logik für einen Seitentyp korrigieren",
    intervention: "Den Seitentyp an einer Stelle korrigieren.",
  },
  eligibility: {
    enterpriseScale:
      "Der Scope ist groß genug, dass wir den Move vor dem Kauf gemeinsam eingrenzen. Wir machen dafür ein kurzes Scoped Review.",
    multiMarket:
      "Die Domain bedient vier oder mehr Märkte. Wir grenzen den Move vorab auf einen Markt ein, damit der Festpreis trägt.",
  },
};

const QUALIFY_EN: QualifyStrings = {
  competingIntent: {
    signature: (pages) =>
      `${pages} indexable pages carry a largely identical title and H1 signature.`,
    noCanonical:
      "None of these pages points to another through a canonical. They stand side by side as separate targets.",
    internalLinks: (linked, pages) =>
      `The home page links ${linked} of these ${pages} pages directly. Internal support spreads out instead of concentrating.`,
    title: (pages) => `${pages} pages compete for the same commercial intent.`,
    summary:
      "Several separately indexable pages address one search intent. Relevance, internal links and external signals spread across multiple targets instead of concentrating on one.",
    interventionType: "Consolidation onto one central target page",
    intervention: "Consolidate onto one canonical target page.",
  },
  robotsBlock: {
    title: "robots.txt blocks the generic crawler across the whole domain.",
    summary:
      "The public robots.txt carries a Disallow on the root directory for User-agent *. Regular crawling of the domain is closed off.",
    observation: "robots.txt sets a Disallow on / for User-agent *.",
    interventionType: "Open crawling and indexability",
    intervention: "Open crawling deliberately and verify the change.",
  },
  homeNoindex: {
    title: "The home page is set to noindex.",
    summary:
      "The home page returns a noindex directive. It cannot act as the entry and authority page while that holds.",
    observation:
      "On our request the home page answers with status 200 and a noindex directive, through a robots meta tag or an X-Robots-Tag header.",
    interventionType: "Restore indexability of the entry page",
    intervention: "Restore indexability of the entry page and verify it.",
  },
  templateDefect: {
    missingH1: (missing, total) =>
      `${missing} of ${total} checked pages ship without an H1. A machine cannot tell what the page claims.`,
    duplicateTitles: (pages) =>
      `${pages} checked pages share one title. They are indistinguishable in a result list.`,
    duplicateDescriptions: (pages) => `${pages} checked pages share one meta description.`,
    aiCrawlersBlocked: (agents) =>
      `robots.txt blocks ${agents} completely. Those systems cannot read the content as a source.`,
    answerless: (pages, total) =>
      `${pages} of ${total} checked pages carry no question-shaped heading and no question-answer markup. That leaves few self-contained passages to quote as an answer.`,
    noPublisher:
      "The home page carries neither Organization markup nor an og:site_name. Machines cannot resolve who publishes these statements.",
    thinPages: (thin, total) =>
      `${thin} of ${total} checked pages ship under 250 words in their HTML. That rarely carries a quotable passage.`,
    title: "One template defect flattens the structure across many pages.",
    summary:
      "The defect sits in the checked page type and repeats across every page built from it. All pages from that template lose definition at the same time.",
    interventionType: "Correct the template logic for one page type",
    intervention: "Correct the page type in one place.",
  },
  eligibility: {
    enterpriseScale:
      "The scope is large enough that we narrow the Move together before you buy. A short scoped review handles that.",
    multiMarket:
      "The domain serves four or more markets. We narrow the Move to one market up front so the fixed price holds.",
  },
};

export const QUALIFY_STRINGS: Record<FmLocale, QualifyStrings> = {
  de: QUALIFY_DE,
  en: QUALIFY_EN,
};

// ── Scan: das sichtbare Protokoll ─────────────────────────────────────────────
//
// Jede Zeile erscheint erst, wenn der zugehörige Schritt fertig ist. Die
// englische Fassung meldet dieselben Schritte in derselben Reihenfolge.

export interface ScanStrings {
  normalizing: string;
  domainReachable: string;
  domainReachableDetail(domain: string, status: number): string;
  robotsChecked: string;
  robotsMissing: string;
  robotsBlocks: string;
  robotsAllows(sitemaps: number): string;
  sitemapChecked: string;
  sitemapFound(urls: number): string;
  sitemapMissing: string;
  scopeDetected: string;
  scopeFromSitemap(urls: number, partial: boolean): string;
  scopeFromLinks(links: number): string;
  pagesRead: string;
  pagesReadDetail(pages: number): string;
  technicalChecked: string;
  technicalDetail(indexable: number, total: number): string;
  patternsChecked: string;
  patternsDetail(templates: number): string;
  qualifying: string;
  finalLabel: Record<PublicDiagnosisState, string>;
  finalClearSignal: string;
  finalHealthy(readable: number): string;
  finalMixed(readable: number): string;
  finalSurfaceUnreadable: string;
  finalPagesWithoutContent(content: number, readable: number): string;
  finalTooFewPages(readable: number): string;
  finalTooLittleMeasured: string;
}

const SCAN_DE: ScanStrings = {
  normalizing: "Domain wird normalisiert",
  domainReachable: "Domain erkannt",
  domainReachableDetail: (domain, status) => `${domain} antwortet mit ${status}`,
  robotsChecked: "robots.txt geprüft",
  robotsMissing: "keine robots.txt gefunden",
  robotsBlocks: "Disallow auf / für User-agent *",
  robotsAllows: (sitemaps) => `Crawling erlaubt, ${sitemaps} Sitemap-Verweise`,
  sitemapChecked: "Sitemap geprüft",
  sitemapFound: (urls) => `${urls} URLs gelesen`,
  sitemapMissing: "keine lesbare Sitemap",
  scopeDetected: "Scope bestimmt",
  scopeFromSitemap: (urls, partial) =>
    `${urls} URLs im Index-Angebot${partial ? ", Teilmenge gelesen" : ""}`,
  scopeFromLinks: (links) => `${links} interne Links auf der Startseite`,
  pagesRead: "Relevante Seiten verglichen",
  pagesReadDetail: (pages) => `${pages} Seiten geprüft`,
  technicalChecked: "Technische Signale geprüft",
  technicalDetail: (indexable, total) => `${indexable} von ${total} geprüften Seiten indexierbar`,
  patternsChecked: "Muster abgeglichen",
  patternsDetail: (templates) => `${templates} unterscheidbare Seitentemplates`,
  qualifying: "Signale werden abgeglichen",
  finalLabel: {
    clear_signal: "Relevantes Signal erkannt",
    mixed_signal: "Signalbild abgeglichen",
    healthy_public_foundation: "Öffentliche Basis geprüft",
    insufficient_public_evidence: "Öffentliche Datenlage begrenzt",
  },
  finalClearSignal: "Ein Muster trägt eine Empfehlung.",
  finalHealthy: (readable) =>
    `${readable} Seiten gelesen, keine gemessene Schwäche in den öffentlichen Signalen`,
  finalMixed: (readable) => `${readable} Seiten gelesen, kein einzelner Engpass dominiert`,
  finalSurfaceUnreadable: "Die Oberfläche ist für einen automatisierten Abruf nicht lesbar",
  finalPagesWithoutContent: (content, readable) =>
    `nur ${content} von ${readable} gelesenen Seiten liefern Text im HTML aus`,
  finalTooFewPages: (readable) => `nur ${readable} Seite(n) öffentlich lesbar`,
  finalTooLittleMeasured: "zu wenige belastbar messbare Signale",
};

const SCAN_EN: ScanStrings = {
  normalizing: "Normalising the domain",
  domainReachable: "Domain resolved",
  domainReachableDetail: (domain, status) => `${domain} answers with ${status}`,
  robotsChecked: "robots.txt checked",
  robotsMissing: "no robots.txt found",
  robotsBlocks: "Disallow on / for User-agent *",
  robotsAllows: (sitemaps) => `crawling allowed, ${count(sitemaps, "sitemap reference", "sitemap references")}`,
  sitemapChecked: "Sitemap checked",
  sitemapFound: (urls) => `${count(urls, "URL", "URLs")} read`,
  sitemapMissing: "no readable sitemap",
  scopeDetected: "Scope determined",
  scopeFromSitemap: (urls, partial) =>
    `${count(urls, "URL", "URLs")} offered for indexing${partial ? ", subset read" : ""}`,
  scopeFromLinks: (links) => `${count(links, "internal link", "internal links")} on the home page`,
  pagesRead: "Relevant pages compared",
  pagesReadDetail: (pages) => `${count(pages, "page", "pages")} checked`,
  technicalChecked: "Technical signals checked",
  technicalDetail: (indexable, total) => `${indexable} of ${total} checked pages indexable`,
  patternsChecked: "Patterns compared",
  patternsDetail: (templates) => `${count(templates, "distinguishable page template", "distinguishable page templates")}`,
  qualifying: "Matching the signals",
  finalLabel: {
    clear_signal: "Relevant signal found",
    mixed_signal: "Signal picture compared",
    healthy_public_foundation: "Public base checked",
    insufficient_public_evidence: "Public evidence limited",
  },
  finalClearSignal: "One pattern carries a recommendation.",
  finalHealthy: (readable) =>
    `${count(readable, "page", "pages")} read, no measured weakness in the public signals`,
  finalMixed: (readable) => `${count(readable, "page", "pages")} read, no single constraint dominates`,
  finalSurfaceUnreadable: "The surface is unreadable for an automated request",
  finalPagesWithoutContent: (content, readable) =>
    `only ${content} of ${count(readable, "page", "pages")} read ship text in their HTML`,
  finalTooFewPages: (readable) => `only ${count(readable, "page", "pages")} publicly readable`,
  finalTooLittleMeasured: "too few signals measurable with confidence",
};

export const SCAN_STRINGS: Record<FmLocale, ScanStrings> = { de: SCAN_DE, en: SCAN_EN };

/** Der Standard bleibt Deutsch. Ein unbekannter Wert fällt darauf zurück. */
export function fmLocale(value: unknown): FmLocale {
  return value === "en" ? "en" : "de";
}

// ── Ergebnis: die Sätze der Ergebnisansicht ───────────────────────────────────
//
// Diese Texte rendert die Oberfläche, nicht der Scan. Sie liegen trotzdem hier,
// damit eine Sprache an genau einer Stelle vollständig nachlesbar ist. Die
// deutschen Fassungen bleiben zusätzlich als benannte Konstanten in
// ./disclosure und ./outcome exportiert, weil der bestehende Kaufweg sie so
// importiert.

export interface OutcomeStrings {
  confidence: Record<ConfidenceBand, string>;
  /** Beschriftung der einen dominanten Fortsetzung im Ergebnis. */
  cta: string;
  ctaMicro: string;
  /** Die vier Geschäftslagen. Gefragt wird nach dem Problem, nie nach dem Kanal. */
  situations: Record<
    "low_demand" | "traffic_no_business" | "growth_stalled" | "unclear_lever",
    { label: string; note: string; rationale: string }
  >;
  /** Die Klasse des Eingriffs je Kategorie. Nie das konkrete Ziel. */
  moveTitle: Record<DiagnosisCategory, string>;
  /** Begründung ohne gemessenen Befund. */
  rationaleHidden: string;
  rationaleNarrowed: string;
  signals: {
    label: string;
    headline: string;
    body: string;
    unavailableNote: string;
    skipCta: string;
    skipNote: string;
    continueCta: string;
    connectCta: string;
    inKickoff: string;
    sources: Record<"search_console" | "analytics" | "google_ads", string>;
  };
  /** Überschrift der aufklappbaren Beobachtungsliste. */
  observationsLabel: string;
  /** Überschrift der Belegliste. */
  evidenceLabel: string;
  category: Record<DiagnosisCategory, { name: string; meaning: string }>;
  state: Record<PublicDiagnosisState, { label: string; title: string; body: string; limits: string }>;
  limitation: Record<EvidenceLimitation, string>;
  hiddenSignal: { label: string; headline: string; body: string; narrowing: string; limits: string };
  limitedRead: { label: string; headline: string; narrowing: string };
}

const OUTCOME_EN: OutcomeStrings = {
  confidence: {
    high: "High confidence",
    medium: "Medium confidence",
    limited: "Limited public evidence",
  },
  cta: "Find the First Move",
  ctaMicro: "That takes 2 to 3 more signals from you and about a minute.",
  situations: {
    low_demand: {
      label: "We get too little new demand",
      note: "We first check where demand forms and whether you are reachable there at all.",
      rationale:
        "You are getting too little new demand. This Move therefore starts where demand either reaches you or fails to.",
    },
    traffic_no_business: {
      label: "We get traffic, yet too little business",
      note: "We first check what happens after the click instead of recommending more reach.",
      rationale:
        "You are getting traffic but too little business. This Move therefore starts behind the click.",
    },
    growth_stalled: {
      label: "Growth has stalled",
      note: "We first compare the trend to separate market movement from a constraint of your own.",
      rationale:
        "Growth has stalled. This Move is cut so its effect stays distinguishable from market movement inside the measurement window.",
    },
    unclear_lever: {
      label: "We do not know where the biggest lever sits",
      note: "We first prioritise the areas with the widest gap between effort and result.",
      rationale:
        "The biggest lever is still unclear. This Move is therefore the one that resolves the uncertainty fastest.",
    },
  },
  moveTitle: {
    SEARCH_GAP: "Create visibility where the buying intent forms.",
    AI_VISIBILITY_GAP: "Build one citable core page with an unambiguous publisher.",
    DEMAND_CAPTURE_GAP: "Consolidate the competing targets onto one central page.",
    CONVERSION_GAP: "Point the path after the click at one action.",
    AUTHORITY_GAP: "Name the publisher so machines can resolve it.",
    TECHNICAL_GAP: "Fix the technical constraint and verify the fix.",
    HIDDEN_SIGNAL: "Narrow the constraint using your own performance data.",
  },
  rationaleHidden:
    "The publicly checkable base holds. No further public check produces the next insight. It sits in your own performance data.",
  rationaleNarrowed:
    "The public check names the direction, though it carries no recommendation on its own yet. The Move therefore starts by confirming or discarding it.",
  signals: {
    label: "Step 03",
    headline: "Now the signals that stay invisible in public start to count.",
    body: "So that we do not guess, we compare the public check against your actual performance data.",
    unavailableNote:
      "We set these up together in the kickoff, read-only and in under 15 minutes. Nothing is connected here before you commission the work.",
    skipCta: "Continue without access",
    skipNote:
      "The First Move then comes from the public check and your business situation. With your data it gets sharper; without it, it still holds.",
    continueCta: "Complete the analysis",
    connectCta: "Connect read-only",
    inKickoff: "In the kickoff, read-only",
    sources: {
      search_console: "Which searches you actually appear for and where clicks are lost.",
      analytics: "What happens after the click and where the path breaks off.",
      google_ads: "Which search terms tie up budget and which signal steers the bidding.",
    },
  },
  observationsLabel: "What we read",
  evidenceLabel: "Evidence",
  category: {
    SEARCH_GAP: {
      name: "Search Gap",
      meaning: "Demand forms where you are not visible.",
    },
    AI_VISIBILITY_GAP: {
      name: "AI Visibility Gap",
      meaning:
        "Answer systems handle questions from your category. They currently cannot carry you as a source.",
    },
    DEMAND_CAPTURE_GAP: {
      name: "Demand Capture Gap",
      meaning:
        "Existing demand meets a structure that spreads it across several targets instead of concentrating it.",
    },
    CONVERSION_GAP: {
      name: "Conversion Gap",
      meaning: "The leverage sits after the click rather than before it.",
    },
    AUTHORITY_GAP: {
      name: "Authority Gap",
      meaning: "The content is there. The publisher behind it is not machine-readable.",
    },
    TECHNICAL_GAP: {
      name: "Technical Gap",
      meaning: "A technical constraint keeps existing demand from arriving at all.",
    },
    HIDDEN_SIGNAL: { name: "Hidden Signal", meaning: "" },
  },
  state: {
    clear_signal: {
      label: "Relevant signal",
      title: "",
      body: "",
      limits:
        "The finding rests on publicly readable signals. We verify it with the necessary access before any implementation.",
    },
    mixed_signal: {
      label: "Narrowed",
      title: "One area stands out, though it carries no recommendation on its own yet.",
      body: "Part of the publicly checkable base holds, part does not. That names the direction and rules out the rest.",
      limits:
        "Whether this area really is the constraint is decided by your own performance data. Search Console, analytics and the Google Ads account cannot be read from outside.",
    },
    healthy_public_foundation: {
      label: "Public check",
      title: "The obvious defect is not the answer.",
      body: "Your publicly visible base is clean. We see no single technical or structural defect that explains the situation.",
      limits:
        "Rankings, search volume, conversion rates and paid efficiency cannot be measured from public website signals alone.",
    },
    insufficient_public_evidence: {
      label: "Public check",
      title: "The public signals do not yet support a responsible First Move.",
      body: "",
      limits:
        "Without dependable public evidence we guess at nothing here. The next dependable layer is your own performance data.",
    },
  },
  limitation: {
    surface_not_readable:
      "The home page does not answer an automated request with a normal page. What a bot shield returns says nothing about the real website, so we derive nothing from it.",
    too_few_pages:
      "Too few subpages were publicly readable to say anything about patterns. A comparison needs several reachable pages.",
    pages_without_content:
      "The pages we fetched ship almost no text in their HTML; the content appears only in the browser. Reading that would describe the rendering rather than the website.",
    too_little_measured:
      "Too few of the checked dimensions were measurable with confidence to form a picture.",
  },
  hiddenSignal: {
    label: "Public check",
    headline: "The obvious defect is not the answer.",
    body: "Your publicly visible base is clean. We see no single technical, structural or search defect that explains the situation well enough.",
    narrowing:
      "That narrows the constraint. The signals that matter now sit where public checks cannot reach: actual demand, rankings, conversion and paid performance.",
    limits:
      "Rankings, search volume, conversion rates and paid efficiency cannot be measured from public website signals alone.",
  },
  limitedRead: {
    label: "Public check",
    headline: "The public signals do not yet support a responsible First Move.",
    narrowing:
      "Two more inputs open the next verification route: what cannot be read from outside is answered more reliably by your own performance data than by another public check.",
  },
};

/**
 * Die deutschen Sätze bleiben in ./disclosure und ./outcome. Diese Zuordnung
 * setzt sie dort zusammen, damit es keine zweite Quelle für dieselbe Copy gibt.
 */
export function outcomeStringsEn(): OutcomeStrings {
  return OUTCOME_EN;
}

// ── Anfragestrecke: Fit Check, Checkout und Befundprüfung ─────────────────────
//
// Der Abschnitt #start auf /first-move ist die einzige Stelle, an der ein
// Besucher etwas abschickt. Seit dem Umbau der Startseite kommen dort auch
// englischsprachige Besucher an: sie prüfen auf /en, gehen weiter und landen in
// genau diesem Panel. Es spricht deshalb beide Sprachen.
//
// Der Rest von /first-move bleibt deutsch. Die Seite ist die deutsche
// Produktseite; das Panel ist der gemeinsame Endpunkt beider Startseiten.

export interface RequestStrings {
  fit: {
    eyebrow: string;
    leadTitle: string;
    leadBody: string;
    leadCta: string;
    title: string;
    q1: string;
    q2: string;
    q3: string;
    complexityNoteSuggested: string;
    complexityNote: string;
    implementation: Record<"seeszn_access" | "internal_team" | "existing_agency" | "none", string>;
    approval: Record<"direct" | "internal_small" | "external" | "unknown", string>;
    complexity: Record<"simple" | "medium" | "high" | "very_high", string>;
  };
  gates: {
    noPath: { k: string; t: string; b: string; next: string };
    approvalOpen: { k: string; t: string; b: string; next: string };
    tooComplex: { k: string; t: string; b: string; next: string };
    scopedReview: { k: string; t: string; next: string };
  };
  start: string;
  review: {
    eyebrow: string;
    title: string;
    lead(domain: string): string;
    leadNoDomain: string;
    occasion: string;
    occasionValue: string;
    nextStep: string;
    submit: string;
    micro: string;
    sentTitle: string;
    sentBody: string;
  };
  checkout: {
    domain: string;
    product: string;
    price: string;
    scope: string;
    delivery: string;
    nextStep: string;
    nextStepGate: string;
    nextStepDefault: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    note: string;
    notePlaceholder: string;
    sending: string;
    submitGate: string;
    submit: string;
    micro: string;
    emailInvalid: string;
    failed: string;
    sentTitle: string;
    sentKicker: string;
  };
}

const REQUEST_DE: RequestStrings = {
  fit: {
    eyebrow: "Fit Check",
    leadTitle: "Drei Fragen entscheiden, ob der Festpreis trägt.",
    leadBody:
      "Umsetzungsweg, Freigabeweg und Komplexität. Danach siehst du, ob wir direkt starten können oder den Scope vorher gemeinsam eingrenzen.",
    leadCta: "First Move starten",
    title: "Passt dieser Move in den Festpreis?",
    q1: "Wie kann der Move umgesetzt werden?",
    q2: "Wie ist der Freigabeweg?",
    q3: "Wie komplex ist die Umsetzung?",
    complexityNoteSuggested:
      "Aus der Prüfung vorgeschlagen, du kannst korrigieren. Die Komplexität verändert den Preis nicht, sie entscheidet über die Eignung.",
    complexityNote:
      "Die Komplexität verändert den Preis nicht, sie entscheidet über die Eignung.",
    implementation: {
      seeszn_access: "SEESZN bekommt Zugriff",
      internal_team: "Unser internes Team setzt um",
      existing_agency: "Externe Partner oder Entwickler setzen um",
      none: "Aktuell gibt es keinen Umsetzungsweg",
    },
    approval: {
      direct: "Direkte Entscheidung möglich",
      internal_small: "Interne Abstimmung, 1 bis 2 Personen",
      external: "Externe Freigabe nötig",
      unknown: "Noch unklar",
    },
    complexity: { simple: "Einfach", medium: "Mittel", high: "Hoch", very_high: "Sehr hoch" },
  },
  gates: {
    noPath: {
      k: "Kein Checkout",
      t: "Ohne Umsetzungsweg gibt es keinen First Move.",
      b: "Ein First Move ist eine Umsetzung. Wir klären zuerst, wer die Änderung live bringen kann. Danach ist der Festpreis wieder die richtige Form.",
      next: "Umsetzungsweg klären",
    },
    approvalOpen: {
      k: "Checkout pausiert",
      t: "Der Freigabeweg ist noch offen.",
      b: "Ohne geklärte Freigabe startet die Lieferfrist nicht. Wir klären den Freigabeweg kurz vorab, damit die Frist hält.",
      next: "Freigabeweg klären",
    },
    tooComplex: {
      k: "Scoped Review",
      t: "Dieser Scope ist für den direkten Kauf zu groß.",
      b: "Bei sehr hoher Komplexität grenzen wir den Move vorher gemeinsam ein, damit der Festpreis trägt. Der Preis steigt dadurch nicht, geprüft wird die Eignung.",
      next: "Scope eingrenzen",
    },
    scopedReview: {
      k: "Scoped Review",
      t: "Der Scope braucht vorab eine Eingrenzung.",
      next: "Scope eingrenzen",
    },
  },
  start: "First Move starten",
  review: {
    eyebrow: "Befund prüfen",
    title: "Wir gehen den Befund gemeinsam durch.",
    lead: (domain) =>
      `Der Befund zu ${domain} liegt uns vor. Wir brauchen nur noch, an wen die Einordnung gehen soll.`,
    leadNoDomain: "Wir brauchen nur noch, an wen die Einordnung gehen soll.",
    occasion: "Anlass",
    occasionValue: "Befund gemeinsam prüfen",
    nextStep:
      "Wir gehen den Befund mit dir durch und sagen dir, was er trägt. Es entsteht dabei keine Bestellung.",
    submit: "Befund prüfen lassen",
    micro: "Keine Bestellung, keine Zahlung. Wir melden uns mit unserer Einordnung.",
    sentTitle: "Der Befund liegt bei uns.",
    sentBody:
      "Wir gehen ihn durch und melden uns mit unserer Einordnung. Es ist dadurch nichts bestellt.",
  },
  checkout: {
    domain: "Domain",
    product: "Produkt",
    price: "Preis",
    scope: "Umfang",
    delivery: "Lieferung",
    nextStep: "Nächster Schritt",
    nextStepGate: "Wir melden uns, um den Punkt oben zu klären.",
    nextStepDefault:
      "Wir verifizieren den Befund und bestätigen den Scope schriftlich. Danach folgt die Rechnung.",
    name: "Name",
    namePlaceholder: "Vor- und Nachname",
    email: "Firmen-E-Mail",
    emailPlaceholder: "name@unternehmen.de",
    note: "Kontext, optional",
    notePlaceholder: "Was wir vorab wissen sollten",
    sending: "Wird gesendet",
    submitGate: "Anfrage senden",
    submit: "First Move anfragen",
    micro: "Die Anfrage ist verbindlich für den Festpreis. Eine Zahlung erfolgt hier nicht.",
    emailInvalid: "Bitte gib eine gültige Firmen-E-Mail an.",
    failed: "Das hat nicht geklappt. Bitte versuche es erneut.",
    sentTitle: "Deine Anfrage liegt bei uns.",
    sentKicker: "Angenommen",
  },
};

const REQUEST_EN: RequestStrings = {
  fit: {
    eyebrow: "Fit check",
    leadTitle: "Three questions decide whether the fixed price holds.",
    leadBody:
      "Implementation path, approval path and complexity. After that you see whether we can start directly or narrow the scope together first.",
    leadCta: "Start the First Move",
    title: "Does this Move fit the fixed price?",
    q1: "How can the Move be implemented?",
    q2: "What does approval look like?",
    q3: "How complex is the implementation?",
    complexityNoteSuggested:
      "Suggested by the check and open to correction. Complexity does not change the price, it decides suitability.",
    complexityNote: "Complexity does not change the price, it decides suitability.",
    implementation: {
      seeszn_access: "SEESZN gets access",
      internal_team: "Our internal team implements",
      existing_agency: "Our external partner or developers implement",
      none: "There is no implementation path right now",
    },
    approval: {
      direct: "We can decide directly",
      internal_small: "Internal alignment, 1 to 2 people",
      external: "External approval needed",
      unknown: "Still open",
    },
    complexity: { simple: "Simple", medium: "Medium", high: "High", very_high: "Very high" },
  },
  gates: {
    noPath: {
      k: "No checkout",
      t: "Without an implementation path there is no First Move.",
      b: "A First Move is an implementation. We first clarify who can put the change live. After that the fixed price is the right shape again.",
      next: "Clarify the implementation path",
    },
    approvalOpen: {
      k: "Checkout paused",
      t: "The approval path is still open.",
      b: "Delivery does not start while approval is unclear. We clarify the approval path briefly up front so the deadline holds.",
      next: "Clarify the approval path",
    },
    tooComplex: {
      k: "Scoped review",
      t: "This scope is too large to buy directly.",
      b: "At very high complexity we narrow the Move together first so the fixed price holds. The price does not rise; what we check is suitability.",
      next: "Narrow the scope",
    },
    scopedReview: {
      k: "Scoped review",
      t: "The scope needs narrowing first.",
      next: "Narrow the scope",
    },
  },
  start: "Start the First Move",
  review: {
    eyebrow: "Review the finding",
    title: "We walk through the finding with you.",
    lead: (domain) =>
      `We have the finding for ${domain}. All we need now is who the reading should go to.`,
    leadNoDomain: "All we need now is who the reading should go to.",
    occasion: "Reason",
    occasionValue: "Review the finding together",
    nextStep:
      "We walk through the finding with you and tell you what it supports. Nothing is ordered by this.",
    submit: "Have the finding reviewed",
    micro: "No order, no payment. We come back to you with our reading.",
    sentTitle: "The finding is with us.",
    sentBody: "We are working through it and will come back with our reading. Nothing is ordered by this.",
  },
  checkout: {
    domain: "Domain",
    product: "Product",
    price: "Price",
    scope: "Scope",
    delivery: "Delivery",
    nextStep: "Next step",
    nextStepGate: "We will get in touch to clarify the point above.",
    nextStepDefault:
      "We verify the finding and confirm the scope in writing. The invoice follows after that.",
    name: "Name",
    namePlaceholder: "First and last name",
    email: "Company email",
    emailPlaceholder: "name@company.com",
    note: "Context, optional",
    notePlaceholder: "What we should know up front",
    sending: "Sending",
    submitGate: "Send the request",
    submit: "Request the First Move",
    micro: "The request is binding at the fixed price. No payment happens here.",
    emailInvalid: "Please enter a valid company email address.",
    failed: "That did not work. Please try again.",
    sentTitle: "Your request is with us.",
    sentKicker: "Received",
  },
};

export const REQUEST_STRINGS: Record<FmLocale, RequestStrings> = {
  de: REQUEST_DE,
  en: REQUEST_EN,
};

// ── Produktseite: Abschnitte und Funnel ───────────────────────────────────────
//
// Die Beschriftungen der Produktseite. Getrennt von der Anfragestrecke oben,
// weil die dort auch von der Startseite aus erreicht wird, während diese
// Strings nur auf /first-move und /en/first-move erscheinen.

export interface SectionStrings {
  process: {
    eyebrow: string;
    headline: string;
    disclosureSummary: string;
    disclosureBody1: string;
    disclosureBody2: string;
  };
  proof: { headline: string; evidenceSummary: string };
  offer: { priceSub: string; includedLabel: string; notIncludedLabel: string; summary: string };
  faq: { headline: string; termsLabel: string };
  final: { line1: string; line2: string; accent: string };
}

const SECTION_DE: SectionStrings = {
  process: {
    eyebrow: "Ablauf",
    headline: "So läuft ein First Move ab",
    disclosureSummary: "Wie wir prüfen, bevor wir etwas empfehlen",
    disclosureBody1:
      "Ein einzelner Checklistenpunkt reicht nie: fehlende Alt-Texte, eine Meta-Länge oder ein Tool-Score werden bei uns nicht zum Engpass erklärt. Antwortet eine Seite dem automatisierten Abruf mit einer Bot-Schutzseite, leiten wir daraus keinen Befund ab.",
    disclosureBody2:
      "Der öffentliche Scan zeigt ein Signal. Ob es die Ursache ist, entscheidet die Verifikation mit den nötigen Zugängen. Für Google Ads gilt zusätzlich: was im Konto liegt, behaupten wir nicht von außen.",
  },
  proof: { headline: "Ausgewählte Ergebnisse", evidenceSummary: "Messgrößen und Methodik" },
  offer: {
    priceSub: "Netto · Festpreis",
    includedLabel: "Enthalten",
    notIncludedLabel: "Nicht enthalten",
    summary: "Was enthalten ist und was nicht",
  },
  faq: { headline: "Häufige Fragen", termsLabel: "Leistungsbedingungen" },
  final: { line1: "Der nächste sinnvolle Move", line2: "beginnt mit deiner ", accent: "Domain" },
};

const SECTION_EN: SectionStrings = {
  process: {
    eyebrow: "How it runs",
    headline: "How a First Move runs",
    disclosureSummary: "How we check before we recommend anything",
    disclosureBody1:
      "A single checklist item is never enough: missing alt text, a meta length or a tool score does not become a constraint here. When a page answers our automated request with a bot shield, we derive no finding from it.",
    disclosureBody2:
      "The public check shows a signal. Whether it is the cause is decided by verification with the necessary access. For Google Ads one rule is added: whatever sits inside the account, we do not claim from outside.",
  },
  proof: { headline: "Selected results", evidenceSummary: "Metrics and method" },
  offer: {
    priceSub: "Fixed price · excluding VAT",
    includedLabel: "Included",
    notIncludedLabel: "Not included",
    summary: "What is included and what is out of scope",
  },
  faq: { headline: "Common questions", termsLabel: "Terms of service" },
  final: { line1: "The next Move worth making", line2: "starts with your ", accent: "domain" },
};

export const SECTION_STRINGS: Record<FmLocale, SectionStrings> = { de: SECTION_DE, en: SECTION_EN };

// ── Funnel: das Instrument und die vier Ergebnisschritte ──────────────────────

export interface FunnelStrings {
  instrument: {
    label: string;
    question: string;
    sub: string;
    placeholder: string;
    cta: string;
    reads: string;
    trust: readonly string[];
  };
  heroCta: string;
  heroCtaBusy: string;
  heroMicro: string;
  heroFieldLabel: string;
  emptyDomain: string;
  scanFailed: string;
  stageEyebrowScanning: string;
  stageEyebrowIdle: string;
  stageStep(current: number, total: number): string;
  stageTitleIdle: string;
  stageTitleScanning(domain: string): string;
  surfaceFallback: string;
  checked: string;
  again: string;
  runningNote: string;
  idleNote: string;
  stages: readonly string[];
  stagesNote: string;
  stepLabels: readonly [string, string, string, string];
  confidencePrefix: string;
  ruledOutLabel: string;
  observationsSummary: string;
  emailCta: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailSend: string;
  emailSending: string;
  emailSent: string;
  context: {
    badge: string;
    headline: string;
    body: string;
    groupLabel: string;
    next: string;
  };
  move: {
    badge: string;
    why: string;
    evidence: string;
    expectedImpact: string;
    confidence: string;
    clientEffort: string;
    delivery: string;
    measurement: string;
    scopeSummary: string;
    cta: string;
  };
  levels: Record<"low" | "medium" | "high", string>;
  scopeEligible: string;
  relevantCase: { label: string; more: string };
}

const FUNNEL_DE: FunnelStrings = {
  instrument: {
    label: "Sichtbarkeitsprüfung",
    question: "Wo bleibt gerade Wachstum liegen?",
    sub: "Eine Domain genügt. Die erste Einordnung erscheint direkt.",
    placeholder: "deine-domain.de",
    cta: "Kostenlos prüfen",
    reads: "Was wir dabei öffentlich lesen",
    trust: [
      "Keine E-Mail nötig. Das Ergebnis erscheint direkt auf dieser Seite.",
      "Nur öffentlich abrufbare Signale. Kein Zugriff auf deine Systeme.",
    ],
  },
  heroCta: "Domain prüfen",
  heroCtaBusy: "Prüfung läuft",
  heroMicro: "Öffentliche Daten. Kein Login. Etwa 20 Sekunden.",
  heroFieldLabel: "Deine Domain",
  emptyDomain: "Bitte gib eine Domain ein, zum Beispiel deine-domain.de",
  scanFailed: "Die Prüfung ist fehlgeschlagen. Bitte versuche es erneut.",
  stageEyebrowScanning: "Prüfung läuft",
  stageEyebrowIdle: "Öffentliche Prüfung",
  stageStep: (current, total) => `Schritt ${current} von ${total}`,
  stageTitleIdle: "Zuerst der Befund, dann der nächste Move",
  stageTitleScanning: (domain) => `Wir lesen ${domain}`,
  surfaceFallback: "die Oberfläche",
  checked: "Geprüft",
  again: "Andere Domain prüfen",
  runningNote:
    "Die Prüfung läuft gegen die echte Oberfläche. Jeder Zustand erscheint erst, wenn der Schritt fertig ist.",
  idleNote: "Ohne Zugriff auf deine Systeme und ohne E-Mail. Nur was öffentlich abrufbar ist.",
  stages: [
    "Geschäft und Angebot verstehen",
    "Erschließung und Scope bestimmen",
    "Search und AI Presence prüfen",
    "Muster über Seiten hinweg vergleichen",
    "Stärksten Hebel bestimmen",
  ],
  stagesNote:
    "Wir ordnen gerade ein, wo bei euch der größte Unterschied zwischen Aufwand und Ergebnis liegt.",
  stepLabels: ["Befund", "Situation", "Signale", "First Move"],
  confidencePrefix: "Öffentliche Lesung",
  ruledOutLabel: "Was wir ausschließen konnten",
  observationsSummary: "Was wir gelesen haben",
  emailCta: "Ergebnis per E-Mail senden",
  emailLabel: "Firmen-E-Mail",
  emailPlaceholder: "name@unternehmen.de",
  emailSend: "Senden",
  emailSending: "Wird gesendet",
  emailSent: "Das ist unterwegs. Wenn nichts ankommt, schreib uns kurz an hello@seeszn.com.",
  context: {
    badge: "Schritt 02",
    headline: "Was beschreibt eure Situation am ehesten?",
    body: "Eine Angabe genügt. Sie entscheidet, welche Ebene wir zuerst prüfen.",
    groupLabel: "Eure Situation",
    next: "Weiter",
  },
  move: {
    badge: "First Move",
    why: "Warum dieser Move",
    evidence: "Evidenz",
    expectedImpact: "Erwarteter Impact",
    confidence: "Sicherheit",
    clientEffort: "Aufwand bei euch",
    delivery: "Lieferung",
    measurement: "Messfenster",
    scopeSummary: "Was die Umsetzung einschließt",
    cta: "Diesen Move starten",
  },
  levels: { low: "Niedrig", medium: "Mittel", high: "Hoch" },
  scopeEligible: "geeignet für den Festpreis",
  relevantCase: { label: "Passendes Ergebnis", more: "Weitere Ergebnisse ansehen" },
};

const FUNNEL_EN: FunnelStrings = {
  instrument: {
    label: "Visibility check",
    question: "Where is growth being left behind?",
    sub: "One domain is enough. The first reading appears right away.",
    placeholder: "your-domain.com",
    cta: "Run the free check",
    reads: "What we read publicly",
    trust: [
      "No email needed. The result appears right here on this page.",
      "Only publicly available signals. No access to your systems.",
    ],
  },
  heroCta: "Check the domain",
  heroCtaBusy: "Check running",
  heroMicro: "Public data. No login. Around 20 seconds.",
  heroFieldLabel: "Your domain",
  emptyDomain: "Please enter a domain, for example your-domain.com",
  scanFailed: "The check failed. Please try again.",
  stageEyebrowScanning: "Check running",
  stageEyebrowIdle: "Public check",
  stageStep: (current, total) => `Step ${current} of ${total}`,
  stageTitleIdle: "The finding first, then the next Move",
  stageTitleScanning: (domain) => `Reading ${domain}`,
  surfaceFallback: "the surface",
  checked: "Checked",
  again: "Check another domain",
  runningNote:
    "The check runs against the live surface. Each state appears once its step has finished.",
  idleNote: "No access to your systems and no email. Only what is publicly available.",
  stages: [
    "Understand the business and the offer",
    "Determine discovery and scope",
    "Check Search and AI presence",
    "Compare patterns across pages",
    "Identify the strongest lever",
  ],
  stagesNote: "We are working out where the widest gap between effort and result sits for you.",
  stepLabels: ["Finding", "Situation", "Signals", "First Move"],
  confidencePrefix: "Public reading",
  ruledOutLabel: "What we can rule out",
  observationsSummary: "What we read",
  emailCta: "Send the result by email",
  emailLabel: "Company email",
  emailPlaceholder: "name@company.com",
  emailSend: "Send",
  emailSending: "Sending",
  emailSent: "That is on its way. If nothing arrives, write to us at hello@seeszn.com.",
  context: {
    badge: "Step 02",
    headline: "Which of these describes your situation best?",
    body: "One answer is enough. It decides which layer we check first.",
    groupLabel: "Your situation",
    next: "Continue",
  },
  move: {
    badge: "First Move",
    why: "Why this Move",
    evidence: "Evidence",
    expectedImpact: "Expected impact",
    confidence: "Confidence",
    clientEffort: "Effort on your side",
    delivery: "Delivery",
    measurement: "Measurement window",
    scopeSummary: "What the implementation covers",
    cta: "Start this Move",
  },
  levels: { low: "Low", medium: "Medium", high: "High" },
  scopeEligible: "suitable for the fixed price",
  relevantCase: { label: "Matching result", more: "See more results" },
};

export const FUNNEL_STRINGS: Record<FmLocale, FunnelStrings> = { de: FUNNEL_DE, en: FUNNEL_EN };
