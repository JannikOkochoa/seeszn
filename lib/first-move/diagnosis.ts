// ─── First Move: öffentliche Diagnose ─────────────────────────────────────────
// Der Scan hatte bis August 2026 genau zwei Ausgänge: ein qualifizierter Befund
// oder `null`. Alles, was kein Befund war, sah für den Besucher gleich aus, egal
// ob wir eine gesunde Oberfläche gelesen, ein widersprüchliches Bild gefunden
// oder schlicht nichts zu lesen bekommen haben. Drei völlig verschiedene
// Wahrheiten in einem Satz. Das war der eigentliche Fehler.
//
// Diese Datei trennt deshalb zwei Fragen, die vorher eine waren:
//
//   1. Können wir einen Engpass empfehlen?      → qualify()
//   2. Haben wir überhaupt etwas Brauchbares gesehen? → diagnose()
//
// Frage 2 hat vier Antworten, und jede hat prüfbare Kriterien:
//
//   clear_signal                 ein gemessener Befund trägt eine Empfehlung
//   mixed_signal                 belastbare Evidenz, aber kein dominierendes Bild
//   healthy_public_foundation    genug Evidenz, überwiegend solide Beobachtungen
//   insufficient_public_evidence zu wenig oder zu schlechte Evidenz
//
// Grundregeln:
//   - "Solide" muss verdient sein. Es entsteht nie daraus, dass kein negatives
//     Signal die Schwelle gerissen hat, sondern nur aus positiv gemessenen
//     Beobachtungen (siehe SOLID_DIMENSIONS_FOR_HEALTHY).
//   - "Zu wenig Evidenz" entsteht aus Menge und Lesbarkeit der Seiten, nie aus
//     einem neutralen Punktestand.
//   - Alles hier stützt sich ausschließlich auf öffentlich Gelesenes. Rankings,
//     Conversion, Paid-Effizienz und Umsatz sind daraus nicht ableitbar und
//     werden hier auch nicht behauptet.

import { DIAGNOSIS_STRINGS, type DiagnosisStrings } from "./copy";
import type { FirstMoveFinding, Level } from "./types";
import type { PageSurface, RobotsResult, SitemapResult } from "./surface";

export type PublicDiagnosisState =
  | "clear_signal"
  | "mixed_signal"
  | "healthy_public_foundation"
  | "insufficient_public_evidence";

/**
 * Bewertung einer einzelnen Dimension.
 *   solid    positiv gemessen
 *   mixed    gemessen, teils tragfähig, teils nicht
 *   weak     eine gemessene Schwäche
 *   unknown  nicht belastbar messbar, zählt nirgends mit
 */
export type DimensionVerdict = "solid" | "mixed" | "weak" | "unknown";

export type DimensionId =
  | "indexability"
  | "crawl_access"
  | "page_identity"
  | "entity"
  | "answer_structure"
  // Paid: die Einstiegsseite ist der ganze öffentlich prüfbare Scope.
  | "measurement"
  | "consent"
  | "conversion_path"
  | "message_clarity"
  | "page_speed";

export interface DiagnosisDimension {
  id: DimensionId;
  /** Überschrift in der Ergebnisansicht. */
  label: string;
  verdict: DimensionVerdict;
  /**
   * Was tatsächlich beobachtet wurde, als Satz. Enthält nie eine URL und nie
   * eine Interpretation, die über das Gemessene hinausgeht.
   */
  observation: string;
}

/** Warum die Evidenz nicht gereicht hat. Nur bei insufficient gesetzt. */
export type EvidenceLimitation =
  | "surface_not_readable"
  | "too_few_pages"
  | "pages_without_content"
  | "too_little_measured";

export interface EvidenceBase {
  /** Gelesene Seiten mit Status 200, Startseite eingeschlossen. */
  readablePages: number;
  /** Davon Seiten mit echtem Textkörper im ausgelieferten HTML. */
  contentPages: number;
  /** Angebotene URLs laut Sitemap. */
  sitemapUrls: number;
  /** Interne Links auf der Startseite. */
  homeInternalLinks: number;
}

export interface PublicDiagnosis {
  state: PublicDiagnosisState;
  /** Immer alle fünf, auch die mit verdict "unknown". */
  dimensions: DiagnosisDimension[];
  evidenceBase: EvidenceBase;
  /** Sicherheit der Interpretation, nicht Stärke des Befunds. */
  confidence: Level;
  limitation?: EvidenceLimitation;
}

// ── Schwellen ─────────────────────────────────────────────────────────────────
// Bewusst exportiert: die Tests prüfen genau an diesen Grenzen, und eine Schwelle,
// die niemand nachlesen kann, driftet.

/** Unter so vielen lesbaren Seiten sagen wir nichts über Muster. */
export const MIN_READABLE_PAGES = 3;

/** Ein ausgelieferter HTML-Körper ab hier gilt als inhaltstragend. */
export const CONTENT_WORD_FLOOR = 180;

/**
 * Unter so vielen inhaltstragenden Seiten ist die Oberfläche für uns nicht
 * lesbar. Typischer Fall: eine rein clientseitig gerenderte Seite liefert eine
 * Hülle von 50 Wörtern aus. Daraus einen Template-Defekt abzuleiten wäre eine
 * Aussage über unser Leseverfahren, nicht über die Website.
 */
export const MIN_CONTENT_PAGES = 3;

/** So viele Dimensionen müssen belastbar messbar sein. */
export const MIN_MEASURED_DIMENSIONS = 3;

/** So viele Dimensionen müssen solide sein, damit "solide Basis" gilt. */
export const SOLID_DIMENSIONS_FOR_HEALTHY = 3;

// Paid: eine einzige Seite, davon zwei Dimensionen nur positiv belegbar. Die
// Schwellen stehen deshalb getrennt und liegen bewusst nicht niedriger.
export const PAID_MIN_MEASURED_DIMENSIONS = 2;
export const PAID_SOLID_DIMENSIONS_FOR_HEALTHY = 3;

// ── Hilfen ────────────────────────────────────────────────────────────────────

export interface DiagnoseInput {
  home: PageSurface;
  samples: PageSurface[];
  robots: RobotsResult;
  sitemap: SitemapResult;
}

function readablePagesOf(input: DiagnoseInput): PageSurface[] {
  return [input.home, ...input.samples].filter((p) => p.status === 200);
}

function isSelfCanonical(p: PageSurface): boolean {
  if (!p.canonical) return false;
  try {
    return (
      new URL(p.canonical, p.url).toString().replace(/\/$/, "") === p.url.replace(/\/$/, "")
    );
  } catch {
    return false;
  }
}

function countDuplicates(values: string[]): number {
  const cleaned = values.map((v) => v.trim().toLowerCase()).filter(Boolean);
  return cleaned.length - new Set(cleaned).size;
}

function dim(
  id: DimensionId,
  label: string,
  verdict: DimensionVerdict,
  observation: string,
): DiagnosisDimension {
  return { id, label, verdict, observation };
}

// ── Dimensionen ───────────────────────────────────────────────────────────────

/**
 * 1) Technische Basis. Kann das, was wir gelesen haben, überhaupt indexiert
 * werden? Direkt gemessen, deshalb die verlässlichste Dimension.
 */
function indexabilityDimension(
  input: DiagnoseInput,
  readable: PageSurface[],
  c: DiagnosisStrings,
): DiagnosisDimension {
  const label = c.indexability.label;
  if (input.robots.state === "blocks") {
    return dim("indexability", label, "weak", c.indexability.robotsBlocked);
  }
  if (readable.length < 2) {
    return dim("indexability", label, "unknown", c.indexability.tooFewPages);
  }

  const indexable = readable.filter((p) => !p.noindex).length;
  const share = indexable / readable.length;
  const observation = c.indexability.share(indexable, readable.length);

  if (input.home.noindex) {
    return dim("indexability", label, "weak", c.indexability.homeNoindex(observation));
  }
  if (share < 0.75) return dim("indexability", label, "weak", observation);
  if (share >= 0.95) return dim("indexability", label, "solid", observation);
  return dim("indexability", label, "mixed", observation);
}

/** 2) Wie gut ist die Oberfläche für einen Crawler überhaupt erschlossen? */
function crawlAccessDimension(input: DiagnoseInput, c: DiagnosisStrings): DiagnosisDimension {
  const label = c.crawlAccess.label;
  const urls = input.sitemap.urls.length;
  const links = input.home.internalLinks.length;
  const hasSitemap = input.sitemap.state === "found" && urls > 0;

  if (input.robots.state === "blocks") {
    return dim("crawl_access", label, "weak", c.crawlAccess.robotsBlocked);
  }
  if (hasSitemap) {
    return dim(
      "crawl_access",
      label,
      "solid",
      c.crawlAccess.sitemap(urls, Boolean(input.sitemap.partial)),
    );
  }
  if (links >= 25) {
    return dim("crawl_access", label, "mixed", c.crawlAccess.linksOnly(links));
  }
  return dim("crawl_access", label, "weak", c.crawlAccess.sparse(links));
}

/**
 * 3) Ist jede Seite als eigene Seite erkennbar?
 *
 * Bewusst nur fehlende H1 zählt, nicht "mehr als eine H1": moderne Übersichts-
 * und Listenseiten setzen legitim mehrere H1. Das als Defekt zu werten hätte
 * technisch einwandfreie Seiten abgewertet.
 */
function pageIdentityDimension(readable: PageSurface[], c: DiagnosisStrings): DiagnosisDimension {
  const label = c.pageIdentity.label;
  if (readable.length < MIN_READABLE_PAGES) {
    return dim("page_identity", label, "unknown", c.pageIdentity.tooFewPages);
  }

  const titled = readable.filter((p) => (p.title ?? "").trim());
  const dupTitles = countDuplicates(readable.map((p) => p.title ?? ""));
  const dupDescs = countDuplicates(readable.map((p) => p.metaDescription ?? ""));
  const missingH1 = readable.filter((p) => p.h1.length === 0).length;
  const missingShare = missingH1 / readable.length;
  const titledShare = titled.length / readable.length;

  if (dupTitles >= 2) {
    return dim(
      "page_identity",
      label,
      "weak",
      c.pageIdentity.duplicateTitles(dupTitles + 1, readable.length),
    );
  }
  if (dupDescs >= 3) {
    return dim(
      "page_identity",
      label,
      "weak",
      c.pageIdentity.duplicateDescriptions(dupDescs + 1, readable.length),
    );
  }
  if (missingShare >= 0.5) {
    return dim("page_identity", label, "weak", c.pageIdentity.missingH1(missingH1, readable.length));
  }
  if (dupTitles === 0 && dupDescs === 0 && missingShare <= 0.15 && titledShare >= 0.95) {
    return dim("page_identity", label, "solid", c.pageIdentity.solid(readable.length));
  }
  return dim("page_identity", label, "mixed", c.pageIdentity.mixed(missingH1, readable.length));
}

/** 4) Ist der Absender der Aussagen maschinell eindeutig benannt? */
function entityDimension(
  input: DiagnoseInput,
  readable: PageSurface[],
  c: DiagnosisStrings,
): DiagnosisDimension {
  const label = c.entity.label;
  const org = input.home.hasOrganizationSchema;
  const site = Boolean(input.home.ogSiteName);
  const types = input.home.jsonLdTypes.length;
  const canonical = readable.filter(isSelfCanonical).length;

  if (org && (site || types >= 3)) {
    return dim("entity", label, "solid", c.entity.solid(types, canonical, readable.length));
  }
  if (org || site) {
    return dim(
      "entity",
      label,
      "mixed",
      org ? c.entity.organizationOnly : c.entity.siteNameOnly,
    );
  }
  return dim("entity", label, "weak", c.entity.weak);
}

/** 5) Gibt es abgrenzbare Antwortblöcke, aus denen zitiert werden kann? */
function answerStructureDimension(
  input: DiagnoseInput,
  contentPages: PageSurface[],
  c: DiagnosisStrings,
): DiagnosisDimension {
  const label = c.answerStructure.label;
  if (contentPages.length < 4) {
    return dim("answer_structure", label, "unknown", c.answerStructure.tooFewPages);
  }
  if (input.robots.blocksAiCrawlers.length > 0) {
    return dim(
      "answer_structure",
      label,
      "weak",
      c.answerStructure.aiCrawlersBlocked(input.robots.blocksAiCrawlers.join(", ")),
    );
  }

  const answering = contentPages.filter((p) => p.questionHeadings > 0 || p.hasFaqSchema).length;
  const share = answering / contentPages.length;

  if (share >= 0.4) {
    return dim(
      "answer_structure",
      label,
      "solid",
      c.answerStructure.solid(answering, contentPages.length),
    );
  }
  if (answering === 0) {
    return dim("answer_structure", label, "weak", c.answerStructure.none(contentPages.length));
  }
  return dim(
    "answer_structure",
    label,
    "mixed",
    c.answerStructure.mixed(answering, contentPages.length),
  );
}

// ── Klassifikation ────────────────────────────────────────────────────────────

/**
 * Ein Befund trägt eine öffentliche Empfehlung nur, wenn seine Evidenz gemessen
 * ist. `confidence: "low"` markiert Kandidaten, die ausschließlich aus dem
 * Fehlen von Signalen schließen. Aus einer Abwesenheit lässt sich ein Muster
 * vermuten, aber kein Engpass diagnostizieren.
 */
function findingCarriesRecommendation(finding: FirstMoveFinding | null): boolean {
  return finding !== null && finding.confidence !== "low";
}

function interpretationConfidence(base: EvidenceBase): Level {
  if (base.readablePages >= 6 && base.contentPages >= 5) return "high";
  if (base.readablePages >= 4 && base.contentPages >= 3) return "medium";
  return "low";
}

/**
 * Leitet aus derselben Evidenz, aus der `qualify()` einen Befund sucht, den
 * öffentlichen Diagnosezustand ab. Rein, ohne Netz, ohne Zeitbezug: dieselbe
 * Eingabe ergibt immer dieselbe Ausgabe.
 */
export function diagnose(
  input: DiagnoseInput,
  finding: FirstMoveFinding | null,
  /**
   * Die Sprachschicht. Der Standard ist Deutsch, damit jeder bestehende
   * Aufrufer und jeder Test unverändert dieselben Sätze bekommt.
   */
  c: DiagnosisStrings = DIAGNOSIS_STRINGS.de,
): PublicDiagnosis {
  const readable = readablePagesOf(input);
  const contentPages = readable.filter((p) => p.wordCount >= CONTENT_WORD_FLOOR);

  const evidenceBase: EvidenceBase = {
    readablePages: readable.length,
    contentPages: contentPages.length,
    sitemapUrls: input.sitemap.urls.length,
    homeInternalLinks: input.home.internalLinks.length,
  };

  const dimensions: DiagnosisDimension[] = [
    indexabilityDimension(input, readable, c),
    crawlAccessDimension(input, c),
    pageIdentityDimension(readable, c),
    entityDimension(input, readable, c),
    answerStructureDimension(input, contentPages, c),
  ];

  const measured = dimensions.filter((d) => d.verdict !== "unknown");
  const solid = dimensions.filter((d) => d.verdict === "solid");
  const weak = dimensions.filter((d) => d.verdict === "weak");
  const confidence = interpretationConfidence(evidenceBase);

  // 1) Ein direkt gemessener Defekt an der Startseite oder der robots.txt braucht
  //    keine Seitenstichprobe. Er steht für sich und geht deshalb vor der
  //    Evidenzprüfung.
  if (findingCarriesRecommendation(finding) && finding!.confidence === "high") {
    return { state: "clear_signal", dimensions, evidenceBase, confidence: "high" };
  }

  // 2) Evidenzgrenze. Sie entsteht aus Lesbarkeit und Menge, nie aus einem
  //    neutralen Punktestand, und sie schlägt jeden gemusterten Befund: aus zwei
  //    lesbaren Seiten leiten wir kein Muster ab.
  const limitation = evidenceLimitation(input, evidenceBase, measured.length);
  if (limitation) {
    return {
      state: "insufficient_public_evidence",
      dimensions,
      evidenceBase,
      confidence: "low",
      limitation,
    };
  }

  // 3) Ein gemessener Befund mit ausreichender Evidenz.
  if (findingCarriesRecommendation(finding)) {
    return { state: "clear_signal", dimensions, evidenceBase, confidence: finding!.confidence };
  }

  // 4) Solide Basis muss verdient sein: genug solide Dimensionen UND keine
  //    gemessene Schwäche. Das Ausbleiben eines negativen Signals allein reicht
  //    ausdrücklich nicht.
  const indexability = dimensions.find((d) => d.id === "indexability");
  if (
    weak.length === 0 &&
    solid.length >= SOLID_DIMENSIONS_FOR_HEALTHY &&
    indexability?.verdict === "solid"
  ) {
    return { state: "healthy_public_foundation", dimensions, evidenceBase, confidence };
  }

  // 5) Alles andere: belastbar gelesen, aber kein eindeutiges Bild.
  return { state: "mixed_signal", dimensions, evidenceBase, confidence };
}

// ── Paid ──────────────────────────────────────────────────────────────────────
//
// Der Paid-Check liest genau eine Einstiegsseite. Sein Scope ist bewusst kleiner,
// die Taxonomie bleibt aber dieselbe: auch hier ist "unauffällig" ein anderes
// Ergebnis als "nicht lesbar", und beides ist ein Ergebnis.

export interface DiagnosePaidInput {
  landing: PageSurface;
  /** Lighthouse mobil, 0 bis 100. null, wenn die Messung nicht zustande kam. */
  performance: number | null;
}

/**
 * Sieht das Abgerufene überhaupt wie ein HTML-Dokument aus?
 *
 * Ohne diese Grenze hat der Paid Check eine als text/plain ausgelieferte
 * RFC-Datei bewertet und ihr "liefert keine H1 aus" attestiert. Der Satz ist
 * wörtlich wahr und trotzdem ohne Aussage: eine Textdatei ist keine
 * Einstiegsseite. Ein Dokument ohne Title und ohne jede Überschrift wird deshalb
 * nicht als Landingpage beurteilt.
 *
 * Bewusst nur im Paid-Pfad: der Search-Scan beurteilt eine Domain über mehrere
 * Seiten hinweg und ist gegen eine einzelne Nicht-HTML-URL ohnehin robust.
 */
export function looksLikeHtmlDocument(page: PageSurface): boolean {
  const hasTitle = Boolean((page.title ?? "").trim());
  const hasHeading = page.h1.length + page.h2.length + page.h3.length > 0;
  return hasTitle || hasHeading;
}

export function diagnosePaid(
  input: DiagnosePaidInput,
  finding: FirstMoveFinding | null,
): PublicDiagnosis {
  const { landing, performance } = input;
  const evidenceBase: EvidenceBase = {
    readablePages: landing.status === 200 ? 1 : 0,
    contentPages: landing.status === 200 && landing.wordCount >= CONTENT_WORD_FLOOR ? 1 : 0,
    sitemapUrls: 0,
    homeInternalLinks: landing.internalLinks.length,
  };

  if (landing.status !== 200 || !looksLikeHtmlDocument(landing)) {
    return {
      state: "insufficient_public_evidence",
      dimensions: [],
      evidenceBase,
      confidence: "low",
      limitation: "surface_not_readable",
    };
  }

  // Eine Hülle ohne Text im HTML ist keine beurteilbare Einstiegsseite. Ohne
  // diese Grenze wurde posthog.com aus 49 Wörtern heraus diagnostiziert.
  if (landing.wordCount < CONTENT_WORD_FLOOR) {
    return {
      state: "insufficient_public_evidence",
      dimensions: [],
      evidenceBase,
      confidence: "low",
      limitation: "pages_without_content",
    };
  }

  const adsTag = landing.tagSignals.some((t) => t.startsWith("Google Ads"));
  const anyTag = landing.tagSignals.length > 0;
  const hasPath = landing.formCount > 0 || landing.internalLinks.length > 3;

  const dimensions: DiagnosisDimension[] = [
    // Mess-Signale können nur positiv belegt werden. Sieht man nichts, heißt das
    // NICHT, dass nichts misst: Container, serverseitiges Tagging und
    // Consent-Gating sind der Normalfall. Deshalb gibt es hier kein "weak".
    dim(
      "measurement",
      "Messbare Signale",
      adsTag ? "solid" : anyTag ? "mixed" : "unknown",
      adsTag
        ? `Im ausgelieferten HTML sind ${landing.tagSignals.length} Mess-Signale sichtbar, darunter ein Google-Ads-Tag.`
        : anyTag
          ? `Im ausgelieferten HTML sind ${landing.tagSignals.length} Mess-Signale sichtbar (${landing.tagSignals.join(", ")}), aber kein Google-Ads-Tag. Ob Conversions über den Container oder serverseitig laufen, ist von außen nicht erkennbar.`
          : "Im ausgelieferten HTML ist kein Mess-Tag sichtbar. Das ist kein Befund: Tags können über einen Container, serverseitig oder erst nach Einwilligung laden.",
    ),
    // Ebenso: unsere Mustererkennung kennt acht verbreitete Plattformen. Findet
    // sie keine, ist das eine Grenze der Prüfung, keine fehlende Einwilligung.
    dim(
      "consent",
      "Consent",
      landing.consentPlatform ? "solid" : "unknown",
      landing.consentPlatform
        ? `${landing.consentPlatform} ist im ausgelieferten HTML erkennbar.`
        : "Es ist keine der verbreiteten Consent-Plattformen im HTML erkennbar. Eine eigene oder über einen Container geladene Lösung wäre von außen nicht sichtbar.",
    ),
    // Der Konversionspfad ist direkt beobachtbar. Ein Formular ist nicht die
    // einzige gültige Handlung: eine Seite, die auf ein Produkt oder einen
    // Kontaktweg weiterführt, hat einen Pfad. Vorher galt jede formularlose
    // Seite als schwach, auch seeszn.com selbst.
    dim(
      "conversion_path",
      "Konversionspfad",
      !hasPath
        ? "weak"
        : landing.formCount > 0
          ? landing.inputCount <= 6
            ? "solid"
            : "mixed"
          : landing.internalLinks.length >= 8
            ? "solid"
            : "mixed",
      landing.formCount > 0
        ? `${landing.formCount} Formular(e) mit ${landing.inputCount} sichtbaren Feldern, davon ${landing.requiredInputCount} als Pflichtfeld ausgezeichnet.`
        : hasPath
          ? `Kein Formular auf der Einstiegsseite; der nächste Schritt führt über ${landing.internalLinks.length} interne Ziele weiter.`
          : "Weder ein Formular noch ein weiterführender interner Pfad ist erkennbar.",
    ),
    // Immer messbar, sobald die Seite lesbar ist. Sie trägt die Dimension, wenn
    // Tagging und Consent von außen unsichtbar bleiben.
    dim(
      "message_clarity",
      "Aussageklarheit",
      landing.h1.length === 0 ? "weak" : landing.h1.length === 1 ? "solid" : "mixed",
      landing.h1.length === 0
        ? "Die Einstiegsseite liefert keine H1 aus."
        : landing.h1.length === 1
          ? `Eine eindeutige H1 und ${landing.wordCount} Wörter Text im ausgelieferten HTML.`
          : `${landing.h1.length} H1-Überschriften auf der Einstiegsseite. Bei Übersichtsseiten ist das üblich, eine einzelne Hauptaussage ist daraus nicht ablesbar.`,
    ),
    dim(
      "page_speed",
      "Ladeverhalten",
      performance === null ? "unknown" : performance >= 70 ? "solid" : performance >= 45 ? "mixed" : "weak",
      performance === null
        ? "Die Performance-Messung kam nicht zustande; das Ladeverhalten ist hier nicht bewertet."
        : `Lighthouse mobil: ${performance} von 100.`,
    ),
  ];

  const measured = dimensions.filter((d) => d.verdict !== "unknown");
  const solid = dimensions.filter((d) => d.verdict === "solid");
  const weak = dimensions.filter((d) => d.verdict === "weak");
  const path = dimensions.find((d) => d.id === "conversion_path");

  if (measured.length < PAID_MIN_MEASURED_DIMENSIONS) {
    return {
      state: "insufficient_public_evidence",
      dimensions,
      evidenceBase,
      confidence: "low",
      limitation: "too_little_measured",
    };
  }
  if (findingCarriesRecommendation(finding)) {
    return { state: "clear_signal", dimensions, evidenceBase, confidence: finding!.confidence };
  }
  // Solide Basis muss auch hier verdient sein. Da zwei der fünf Dimensionen nur
  // positiv belegbar sind, reicht "nichts Negatives gefunden" nicht: es braucht
  // drei positiv gemessene Dimensionen und einen beobachteten Konversionspfad.
  if (
    weak.length === 0 &&
    solid.length >= PAID_SOLID_DIMENSIONS_FOR_HEALTHY &&
    path?.verdict === "solid"
  ) {
    return { state: "healthy_public_foundation", dimensions, evidenceBase, confidence: "medium" };
  }
  return { state: "mixed_signal", dimensions, evidenceBase, confidence: "medium" };
}

function evidenceLimitation(
  input: DiagnoseInput,
  base: EvidenceBase,
  measuredCount: number,
): EvidenceLimitation | null {
  if (input.home.status !== 200) return "surface_not_readable";
  if (base.readablePages < MIN_READABLE_PAGES) return "too_few_pages";
  if (base.contentPages < MIN_CONTENT_PAGES) return "pages_without_content";
  if (measuredCount < MIN_MEASURED_DIMENSIONS) return "too_little_measured";
  return null;
}
