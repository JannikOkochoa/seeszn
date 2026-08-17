// ─── First Move: Qualifikation eines Befunds ──────────────────────────────────
// Aus beobachteten Signalen wird hier höchstens ein Engpass. Die Regeln stammen
// aus docs/first-move/SCAN_API_CONTRACT_v6.md und sind bewusst streng:
//
//   1. Mindestens zwei voneinander unabhängige Signale, oder ein direkt
//      messbares starkes Signal plus eine bestätigende Beobachtung.
//   2. Ein generischer Checklistenpunkt qualifiziert nie allein. Fehlende
//      Alt-Texte, Meta-Längen, fehlendes Organization-Schema oder ein
//      Tool-Score erzeugen hier grundsätzlich keinen Befund.
//   3. Reicht die Evidenz nicht, ist die Ausgabe null. Dann zeigt die Seite
//      ehrlich, dass kein belastbarer Move gefunden wurde.
//   4. Der vorgeschlagene Move muss begrenzt sein. Ein Relaunch ist kein Move.

import type {
  Complexity,
  EligibilityState,
  EvidenceItem,
  FirstMoveFinding,
  FirstMoveRoute,
  Level,
  SurfaceKind,
} from "./types";
import type { PageSurface, RobotsResult, SitemapResult } from "./surface";
import { MEASUREMENT_WEEKS_MAX, MEASUREMENT_WEEKS_MIN } from "./product";
import { CONTENT_WORD_FLOOR } from "./diagnosis";

/**
 * Seiten, deren Textkörper wirklich im ausgelieferten HTML steht.
 *
 * Eine rein clientseitig gerenderte Seite liefert eine Hülle von rund 50 Wörtern
 * ohne H1 aus. Ohne diesen Filter entsteht daraus ein "Template-Defekt über alle
 * Seiten" mit hohem Impact, der ausschließlich unser Leseverfahren beschreibt
 * und über die Website nichts aussagt. Jede Kandidatenregel, die über die
 * Struktur von Seiten urteilt, arbeitet deshalb auf dieser Menge.
 */
function contentPages(samples: PageSurface[]): PageSurface[] {
  return samples.filter((p) => p.status === 200 && p.wordCount >= CONTENT_WORD_FLOOR);
}

export interface QualifyInput {
  route: FirstMoveRoute;
  domain: string;
  home: PageSurface;
  samples: PageSurface[];
  robots: RobotsResult;
  sitemap: SitemapResult;
}

let evidenceCounter = 0;
function ev(item: Omit<EvidenceItem, "id" | "observedAt">): EvidenceItem {
  evidenceCounter += 1;
  return { id: `e${evidenceCounter}`, observedAt: new Date().toISOString(), ...item };
}

// ── Textnormalisierung für den Intent-Vergleich ────────────────────────────────

const STOPWORDS = new Set([
  "und", "oder", "der", "die", "das", "den", "dem", "des", "ein", "eine", "einer", "eines",
  "für", "mit", "von", "vom", "zum", "zur", "bei", "auf", "aus", "ist", "sind", "im", "in",
  "the", "and", "for", "with", "your", "our", "you", "we", "of", "to", "a", "an",
  "home", "startseite", "seite", "page", "willkommen", "welcome",
]);

function tokens(input: string, brandTokens: Set<string>): Set<string> {
  return new Set(
    input
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/gu, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t) && !brandTokens.has(t)),
  );
}

/**
 * Verkaufsfloskeln, die fast jeder Title trägt. Ohne sie herauszurechnen sehen
 * "Soundbars online kaufen | Marke" und "Kopfhörer online kaufen | Marke" wie
 * dieselbe Absicht aus, obwohl sie zwei verschiedene Kategorien sind. Genau
 * dieser Fehler würde einen falschen Konsolidierungsvorschlag erzeugen.
 */
const BOILERPLATE = new Set([
  "kaufen", "online", "shop", "günstig", "günstige", "günstigen", "versand", "kostenlos",
  "kostenloser", "jetzt", "bestellen", "entdecken", "offizieller", "offizielle", "official",
  "store", "deutschland", "österreich", "schweiz", "preis", "preise", "angebote", "sale",
  "neu", "top", "beste", "besten", "große", "großer", "auswahl", "sortiment", "vergleich",
  "buy", "cheap", "free", "shipping", "best", "new", "discover", "order", "shopping",
]);

/** Die unterscheidende Restmenge eines Titels. */
function core(t: Set<string>): Set<string> {
  return new Set([...t].filter((x) => !BOILERPLATE.has(x)));
}

function sharedTokens(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  return shared;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  const shared = sharedTokens(a, b);
  return shared / (a.size + b.size - shared);
}

/** Wörter, die kommerzielle Absicht tragen. Nur als zusätzliche Absicherung. */
const COMMERCIAL_HINTS = [
  "agentur", "beratung", "service", "leistungen", "lösung", "lösungen", "software",
  "preise", "pricing", "kaufen", "shop", "angebot", "produkt", "produkte", "kurs",
  "seminar", "schulung", "consulting", "solution", "solutions", "platform", "plattform",
];

function hasCommercialIntent(t: Set<string>): boolean {
  for (const hint of COMMERCIAL_HINTS) if (t.has(hint)) return true;
  return false;
}

/**
 * Produktdetailseiten sind kein Kandidat für konkurrierende Absicht. Varianten
 * derselben Ware sollen nebeneinander stehen, ihre Konsolidierung wäre falscher
 * Rat. Sie bleiben für die Template-Prüfung erhalten, nur der Intent-Cluster
 * lässt sie aus.
 */
const PRODUCT_DETAIL_PATH = /\/(products?|produkt|produkte|artikel|item|dp|sku)\//i;

/**
 * Sprachfassungen derselben Seite. Sie tragen naturgemäß dieselbe Absicht und
 * sind kein Relevanzproblem, sondern gewollt.
 *
 * Ohne diesen Ausschluss hat der Scan auf gnu.org "2 Seiten konkurrieren um
 * dieselbe kommerzielle Absicht" gemeldet: gemeint waren / und /home.en.html
 * neben den Fassungen home.de/es/fr/el/fa.html. Eine Konsolidierung wäre dort
 * genau der falsche Rat gewesen.
 *
 * Erkannt werden die beiden üblichen Muster: ein Sprachpräfix im Pfad
 * (/de/, /en-gb/) und ein Sprachsuffix im Dateinamen (home.de.html).
 */
const LOCALE_SEGMENT = /^[a-z]{2}(-[a-z]{2})?$/i;
const LOCALE_FILE_SUFFIX = /\.[a-z]{2}(-[a-z]{2})?\.(html?|php)$/i;

function isLocaleVariant(url: string): boolean {
  try {
    const path = new URL(url).pathname;
    if (LOCALE_FILE_SUFFIX.test(path)) return true;
    const first = path.split("/").filter(Boolean)[0] ?? "";
    return LOCALE_SEGMENT.test(first);
  } catch {
    return false;
  }
}

/** Letztes Pfadsegment ohne Endung, klein geschrieben. */
function slug(url: string): string {
  try {
    const segments = new URL(url).pathname.split("/").filter(Boolean);
    return (segments[segments.length - 1] ?? "").toLowerCase().replace(/\.[a-z]{2,5}$/, "");
  } catch {
    return "";
  }
}

/**
 * Zwei URLs gehören zur selben Variantenfamilie, wenn ihr Slug einen langen
 * gemeinsamen Anfang hat: "…-nut-butter-balls-mandel" und "…-nut-butter-balls-erdnuss".
 * Das ist das klassische Varianten-Muster und kein Relevanzproblem.
 */
function sameVariantFamily(a: string, b: string): boolean {
  const sa = slug(a);
  const sb = slug(b);
  if (!sa || !sb) return false;
  let i = 0;
  while (i < sa.length && i < sb.length && sa[i] === sb[i]) i++;
  return i >= 12;
}

function brandTokenSet(domain: string, home: PageSurface): Set<string> {
  const parts = domain.split(".")[0].split(/[-_]/);
  const site = (home.ogSiteName || "").toLowerCase().split(/\s+/);
  return new Set([...parts, ...site].filter((p) => p.length > 2));
}

// ── Kandidaten ────────────────────────────────────────────────────────────────

interface Candidate {
  route: FirstMoveRoute;
  title: string;
  summary: string;
  evidence: EvidenceItem[];
  impact: Level;
  confidence: Level;
  effort: Level;
  move: FirstMoveFinding["proposedFirstMove"];
  hypothesis: FirstMoveFinding["measurementHypothesis"];
  /** Interne Rangfolge bei gleichwertigem Impact. */
  weight: number;
}

const LEVEL_SCORE: Record<Level, number> = { low: 1, medium: 2, high: 3 };

/**
 * A) Mehrere indexierbare Seiten konkurrieren um dieselbe kommerzielle Absicht.
 * Verlangt: eine echte Gruppe, jede Seite eigenständig indexierbar, und eine
 * beobachtete Ungleichverteilung der internen Verlinkung.
 */
function candidateCompetingIntent(input: QualifyInput): Candidate | null {
  const brand = brandTokenSet(input.domain, input.home);
  const pages = contentPages(input.samples).filter(
    (p) =>
      !p.noindex &&
      (p.title || p.h1.length > 0) &&
      !PRODUCT_DETAIL_PATH.test(new URL(p.url).pathname) &&
      !isLocaleVariant(p.url),
  );
  if (pages.length < 3) return null;

  const signatures = pages
    .map((p) => {
      const sig = tokens(`${p.title ?? ""} ${p.h1[0] ?? ""}`, brand);
      return { page: p, sig, core: core(sig) };
    })
    // Ohne mindestens zwei unterscheidende Wörter lässt sich über die Absicht
    // einer Seite nichts sagen. Solche Seiten fließen nicht in den Vergleich.
    .filter((s) => s.core.size >= 2);
  if (signatures.length < 3) return null;

  let best: { pages: PageSurface[]; score: number; commercial: boolean } | null = null;
  for (let i = 0; i < signatures.length; i++) {
    const group = [signatures[i]];
    for (let j = i + 1; j < signatures.length; j++) {
      // Zwei Bedingungen zusammen: hohe Überschneidung UND mindestens zwei
      // gemeinsame Wörter, die nicht Verkaufsfloskel sind.
      const overlap = jaccard(signatures[i].core, signatures[j].core);
      const shared = sharedTokens(signatures[i].core, signatures[j].core);
      if (overlap >= 0.5 && shared >= 2) group.push(signatures[j]);
    }
    if (group.length < 2) continue;
    // Selbstkanonisch heißt: die Seiten wurden nicht bereits konsolidiert.
    const independent = group.filter((g) => {
      const c = g.page.canonical;
      if (!c) return true;
      try {
        return new URL(c, g.page.url).toString().replace(/\/$/, "") === g.page.url.replace(/\/$/, "");
      } catch {
        return true;
      }
    });
    if (independent.length < 2) continue;

    // Je Variantenfamilie bleibt ein Vertreter. Drei Geschmacksrichtungen
    // desselben Produkts sind keine drei konkurrierenden Zielseiten.
    const distinct: typeof independent = [];
    for (const candidate of independent) {
      if (distinct.some((kept) => sameVariantFamily(kept.page.url, candidate.page.url))) continue;
      distinct.push(candidate);
    }
    if (distinct.length < 2) continue;

    const commercial = distinct.some((g) => hasCommercialIntent(g.sig));
    const score = distinct.length + (commercial ? 1 : 0);
    if (!best || score > best.score) {
      best = { pages: distinct.map((g) => g.page), score, commercial };
    }
  }

  // Ein Zweiercluster reicht nur, wenn die Seiten erkennbar kommerzielle Absicht
  // tragen. Der Befund behauptet "dieselbe kommerzielle Absicht"; zwei
  // themengleiche Seiten ohne jedes kommerzielle Signal tragen diesen Satz nicht.
  if (!best || best.pages.length < 2) return null;
  if (best.pages.length < 3 && !best.commercial) return null;

  // Interne Verlinkung als zweites unabhängiges Signal: wie oft verweist die
  // Startseite auf die einzelnen konkurrierenden Seiten.
  const homeLinks = new Set(input.home.internalLinks.map((u) => u.replace(/\/$/, "")));
  const linked = best.pages.filter((p) => homeLinks.has(p.url.replace(/\/$/, ""))).length;

  const urls = best.pages.map((p) => p.url);
  const evidence: EvidenceItem[] = [
    ev({
      source: "content",
      type: "competing_intent_cluster",
      observation: `${best.pages.length} indexierbare Seiten tragen eine weitgehend deckungsgleiche Titel- und H1-Signatur.`,
      scope: { urls },
      measuredValue: best.pages.length,
      reproducible: true,
    }),
    ev({
      source: "public_html",
      type: "canonical_state",
      observation:
        "Keine dieser Seiten verweist per Canonical auf eine der anderen. Sie stehen als eigenständige Ziele nebeneinander.",
      scope: { urls },
      reproducible: true,
    }),
    ev({
      source: "internal_linking",
      type: "internal_support_split",
      observation: `Die Startseite verlinkt ${linked} von ${best.pages.length} dieser Seiten direkt. Die interne Unterstützung verteilt sich statt zu bündeln.`,
      measuredValue: `${linked}/${best.pages.length}`,
      scope: { urls },
      reproducible: true,
    }),
  ];

  const impact: Level = best.pages.length >= 3 ? "high" : "medium";

  return {
    route: "search",
    title: `${best.pages.length} Seiten konkurrieren um dieselbe kommerzielle Absicht.`,
    summary:
      "Mehrere eigenständig indexierbare Seiten adressieren dieselbe Suchabsicht. Relevanz, interne Verlinkung und externe Signale verteilen sich auf mehrere Ziele, statt sich auf einem zu bündeln.",
    evidence,
    impact,
    confidence: "medium",
    effort: "low",
    move: {
      interventionType: "Konsolidierung auf eine zentrale Zielseite",
      title: "Konsolidierung auf eine kanonische Zielseite.",
      scope:
        "Eine Zielseite wird als kanonisches Ziel bestimmt. Die konkurrierenden Seiten werden zusammengeführt oder per Canonical und interner Verlinkung eindeutig auf dieses Ziel ausgerichtet. Inhalte bleiben erhalten, es entsteht kein Relaunch.",
      implementationSurface: "information_architecture",
      implementationMode: "SEESZN_access",
      expectedHours: 12,
      bounded: true,
      reversibleOrControlled: true,
    },
    hypothesis: {
      metric: "Organische Klicks und durchschnittliche Position der kanonischen Zielseite",
      baselineDefinition:
        "Search Console, Summe der betroffenen URLs, vier Wochen vor der Umsetzung als Basiswert.",
      expectedDirection: "increase",
      measurementWindowWeeksMin: MEASUREMENT_WEEKS_MIN,
      measurementWindowWeeksMax: MEASUREMENT_WEEKS_MAX,
      attributionLimitations: [
        "Saisonalität und Wettbewerbsbewegungen sind nicht kontrollierbar.",
        "Wir attribuieren nur, was die Daten im Messfenster tragen.",
      ],
    },
    weight: 6,
  };
}

/** B) Crawl- oder Indexierungsdefekt. Direkt messbar, deshalb hohe Confidence. */
function candidateIndexationDefect(input: QualifyInput): Candidate | null {
  const { robots, sitemap, home } = input;

  if (robots.state === "blocks") {
    return {
      route: "search",
      title: "Die robots.txt sperrt den generischen Crawler für die gesamte Domain.",
      summary:
        "Die öffentliche robots.txt enthält für User-agent * ein Disallow auf das Wurzelverzeichnis. Damit ist die gesamte Domain für reguläres Crawling gesperrt.",
      evidence: [
        ev({
          source: "robots",
          type: "disallow_root",
          observation: "robots.txt setzt für User-agent * ein Disallow auf /.",
          scope: { urls: [`https://${input.domain}/robots.txt`] },
          reproducible: true,
        }),
        ev({
          source: "sitemap",
          type: "sitemap_state",
          observation:
            sitemap.state === "found"
              ? `Gleichzeitig liegt eine Sitemap mit ${sitemap.urls.length} URLs vor. Es werden also Seiten zur Indexierung angeboten, die das Crawling ausschließt.`
              : "Es ist keine lesbare Sitemap vorhanden, die die Sperre relativieren würde.",
          measuredValue: sitemap.urls.length,
          reproducible: true,
        }),
      ],
      impact: "high",
      confidence: "high",
      effort: "low",
      move: {
        interventionType: "Crawling und Indexierbarkeit freigeben",
        title: "Crawling gezielt freigeben und die Freigabe verifizieren.",
        scope:
          "Die robots.txt wird so korrigiert, dass die kommerziell relevanten Bereiche crawlbar sind. Danach werden Abruf, Indexierbarkeit und Sitemap-Auslieferung gegengeprüft.",
        implementationSurface: "technical_seo",
        implementationMode: "SEESZN_access",
        expectedHours: 6,
        bounded: true,
        reversibleOrControlled: true,
      },
      hypothesis: {
        metric: "Indexierte URLs und organische Impressionen",
        baselineDefinition: "Search Console, Indexabdeckung und Impressionen zum Zeitpunkt der Umsetzung.",
        expectedDirection: "increase",
        measurementWindowWeeksMin: MEASUREMENT_WEEKS_MIN,
        measurementWindowWeeksMax: MEASUREMENT_WEEKS_MAX,
        attributionLimitations: ["Die Indexierungsgeschwindigkeit liegt bei der Suchmaschine."],
      },
      weight: 9,
    };
  }

  if (home.noindex) {
    return {
      route: "search",
      title: "Die Startseite ist auf noindex gesetzt.",
      summary:
        "Die Startseite liefert eine noindex-Anweisung aus. Sie kann damit nicht als Einstiegs- und Autoritätsseite wirken.",
      evidence: [
        ev({
          source: "public_html",
          type: "robots_meta_noindex",
          observation:
            "Bei unserem Abruf liefert die Startseite mit Status 200 eine noindex-Anweisung aus, per robots-Meta oder X-Robots-Tag.",
          scope: { urls: [home.url] },
          reproducible: true,
        }),
        ev({
          source: "sitemap",
          type: "sitemap_state",
          observation:
            sitemap.state === "found"
              ? `Die Sitemap listet ${sitemap.urls.length} URLs. Die Auslieferung widerspricht der Indexierungsabsicht.`
              : "Es liegt keine lesbare Sitemap vor.",
          measuredValue: sitemap.urls.length,
          reproducible: true,
        }),
      ],
      impact: "high",
      confidence: "high",
      effort: "low",
      move: {
        interventionType: "Indexierbarkeit der Einstiegsseite herstellen",
        title: "Indexierbarkeit der Einstiegsseite herstellen und verifizieren.",
        scope:
          "Die noindex-Anweisung wird auf der Startseite und auf den kommerziell relevanten Einstiegen entfernt. Danach wird die Auslieferung serverseitig gegengeprüft.",
        implementationSurface: "technical_seo",
        implementationMode: "SEESZN_access",
        expectedHours: 5,
        bounded: true,
        reversibleOrControlled: true,
      },
      hypothesis: {
        metric: "Indexstatus und organische Impressionen der Einstiegsseite",
        baselineDefinition: "Search Console, URL-Prüfung und Impressionen vor der Umsetzung.",
        expectedDirection: "increase",
        measurementWindowWeeksMin: MEASUREMENT_WEEKS_MIN,
        measurementWindowWeeksMax: MEASUREMENT_WEEKS_MAX,
      },
      weight: 9,
    };
  }

  return null;
}

/**
 * C) Ein Template-Defekt flacht die semantische Struktur systematisch ab.
 * Verlangt zwei unabhängige Bedingungen über mindestens drei Seiten.
 */
function candidateTemplateFlattening(input: QualifyInput): Candidate | null {
  const pages = contentPages(input.samples);
  if (pages.length < 4) return null;

  // Nur eine FEHLENDE H1 zählt. "Mehr als eine H1" war die frühere Bedingung und
  // hat technisch einwandfreie Übersichts- und Listenseiten getroffen, die
  // legitim mehrere H1 setzen. Auf stripe.com hätte das jede geprüfte Seite als
  // defekt markiert.
  const badH1 = pages.filter((p) => p.h1.length === 0);
  const titles = pages.map((p) => (p.title ?? "").trim().toLowerCase()).filter(Boolean);
  const dupTitles = titles.length - new Set(titles).size;
  const descs = pages.map((p) => (p.metaDescription ?? "").trim().toLowerCase()).filter(Boolean);
  const dupDescs = descs.length - new Set(descs).size;

  const conditions: EvidenceItem[] = [];
  if (badH1.length / pages.length >= 0.5) {
    conditions.push(
      ev({
        source: "public_html",
        type: "h1_structure",
        observation: `${badH1.length} von ${pages.length} geprüften Seiten liefern keine H1 aus. Die Hauptaussage der Seite ist maschinell nicht eindeutig.`,
        measuredValue: `${badH1.length}/${pages.length}`,
        scope: { urls: badH1.slice(0, 6).map((p) => p.url) },
        reproducible: true,
      }),
    );
  }
  if (dupTitles >= 2) {
    conditions.push(
      ev({
        source: "public_html",
        type: "duplicate_titles",
        observation: `${dupTitles + 1} geprüfte Seiten teilen sich denselben Title. Die Seiten sind in der Trefferliste nicht unterscheidbar.`,
        measuredValue: dupTitles + 1,
        reproducible: true,
      }),
    );
  }
  if (dupDescs >= 2) {
    conditions.push(
      ev({
        source: "public_html",
        type: "duplicate_descriptions",
        observation: `${dupDescs + 1} geprüfte Seiten teilen sich dieselbe Meta Description.`,
        measuredValue: dupDescs + 1,
        reproducible: true,
      }),
    );
  }

  // Zwei unabhängige Bedingungen sind Pflicht. Ein einzelner Punkt ist Rauschen.
  if (conditions.length < 2) return null;

  const share = Math.max(badH1.length / pages.length, (dupTitles + 1) / pages.length);

  return {
    route: "search",
    title: "Ein Template-Defekt flacht die Struktur über viele Seiten hinweg ab.",
    summary:
      "Der Defekt tritt nicht auf einer Einzelseite auf, sondern systematisch über den geprüften Seitentyp. Damit verlieren alle Seiten dieses Templates gleichzeitig an semantischer Schärfe.",
    evidence: conditions,
    impact: share >= 0.7 ? "high" : "medium",
    confidence: "medium",
    effort: "low",
    move: {
      interventionType: "Template-Logik für einen Seitentyp korrigieren",
      title: "Den Seitentyp an einer Stelle korrigieren.",
      scope:
        "Titel-, H1- und Description-Logik werden im betroffenen Template einmal sauber gesetzt und über alle Seiten dieses Typs ausgerollt. Kein Redesign, keine Migration.",
      implementationSurface: "technical_seo",
      implementationMode: "SEESZN_access",
      expectedHours: 10,
      bounded: true,
      reversibleOrControlled: true,
    },
    hypothesis: {
      metric: "Impressionen und Klickrate der Seiten dieses Templates",
      baselineDefinition:
        "Search Console, gefiltert auf das URL-Muster des Templates, vier Wochen vor der Umsetzung.",
      expectedDirection: "increase",
      measurementWindowWeeksMin: MEASUREMENT_WEEKS_MIN,
      measurementWindowWeeksMax: MEASUREMENT_WEEKS_MAX,
      attributionLimitations: ["Snippet-Darstellung entscheidet die Suchmaschine."],
    },
    weight: 4,
  };
}

/** D) AI Search: die Oberfläche ist für Antwortsysteme schwer verwertbar. */
function candidateAiSearchCitability(input: QualifyInput): Candidate | null {
  const pages = contentPages(input.samples);
  if (pages.length < 3) return null;

  const signals: EvidenceItem[] = [];
  let strong = false;

  if (input.robots.blocksAiCrawlers.length > 0) {
    strong = true;
    signals.push(
      ev({
        source: "robots",
        type: "ai_crawler_disallow",
        observation: `Die robots.txt sperrt ${input.robots.blocksAiCrawlers.join(", ")} vollständig. Diese Systeme können die Inhalte nicht als Quelle lesen.`,
        measuredValue: input.robots.blocksAiCrawlers.length,
        reproducible: true,
      }),
    );
  }

  const answerless = pages.filter((p) => p.questionHeadings === 0 && !p.hasFaqSchema);
  if (answerless.length / pages.length >= 0.8) {
    signals.push(
      ev({
        source: "content",
        type: "answer_structure_absent",
        observation: `${answerless.length} von ${pages.length} geprüften Seiten enthalten keine als Frage formulierte Überschrift und keine Frage-Antwort-Auszeichnung. Es gibt keinen klar abgrenzbaren Antwortblock zum Zitieren.`,
        measuredValue: `${answerless.length}/${pages.length}`,
        reproducible: true,
      }),
    );
  }

  const noEntity = !input.home.hasOrganizationSchema && !input.home.ogSiteName;
  if (noEntity) {
    signals.push(
      ev({
        source: "entity_signal",
        type: "entity_definition_missing",
        observation:
          "Die Startseite trägt weder eine Organization-Auszeichnung noch einen og:site_name. Der Absender der Aussagen ist maschinell nicht eindeutig benannt.",
        scope: { urls: [input.home.url] },
        reproducible: true,
      }),
    );
  }

  const thin = pages.filter((p) => p.wordCount < 250);
  if (thin.length / pages.length >= 0.5) {
    signals.push(
      ev({
        source: "content",
        type: "extractable_content_thin",
        observation: `${thin.length} von ${pages.length} geprüften Seiten liefern unter 250 Wörter im ausgelieferten HTML. Für eine belastbare Passage reicht das selten.`,
        measuredValue: `${thin.length}/${pages.length}`,
        scope: { urls: thin.slice(0, 6).map((p) => p.url) },
        reproducible: true,
      }),
    );
  }

  if (signals.length < 2) return null;

  // Die Aussage muss zur Messung passen. Eine Domain, die genau einen Crawler
  // sperrt, ist nicht "von Antwortsystemen ausgeschlossen". daringfireball.net
  // sperrt nur PerplexityBot; der absolute Satz wäre dort schlicht falsch.
  const blocked = input.robots.blocksAiCrawlers.length;
  const broadBlock = blocked >= 2;

  return {
    route: "ai_search",
    title: !strong
      ? "Die Inhalte sind für Antwortsysteme schwer zitierbar."
      : broadBlock
        ? "Mehrere Antwortsysteme sind vom Lesen der Inhalte ausgeschlossen."
        : "Ein Antwortsystem ist vom Lesen der Inhalte ausgeschlossen.",
    summary: strong
      ? `Die robots.txt sperrt ${blocked === 1 ? "ein Antwortsystem" : `${blocked} Antwortsysteme`} vollständig, und die geprüften Seiten enthalten kaum abgrenzbare Antwortblöcke. In genau diesen Systemen kann die Marke nicht als Quelle geführt werden.`
      : "Die geprüften Seiten enthalten keine klar abgegrenzten, belegten Antwortblöcke und keinen eindeutig benannten Absender. Antwortsysteme können daraus keine zitierfähige Passage bilden.",
    evidence: signals,
    impact: strong ? (broadBlock ? "high" : "medium") : "medium",
    // Ohne Crawler-Sperre stützt sich dieser Kandidat ausschließlich auf das
    // FEHLEN von Signalen: keine Frageüberschrift, kein Absender, wenig Text.
    // Daraus lässt sich ein Muster vermuten, aber kein Engpass diagnostizieren.
    // `low` heißt hier deshalb nicht "schwaches Signal", sondern: diese Aussage
    // trägt keine öffentliche Empfehlung. Die Beobachtungen bleiben erhalten und
    // laufen über die Dimension "Antwortstruktur" ins Ergebnis.
    confidence: strong ? "high" : "low",
    effort: strong ? "low" : "medium",
    move: {
      interventionType: strong
        ? "Zugang für Antwortsysteme herstellen"
        : "Zitierfähige Kernseite mit klarer Entity-Auszeichnung",
      title: strong
        ? "Zugang für Antwortsysteme herstellen und eine zitierfähige Kernseite aufbauen."
        : "Eine zitierfähige Kernseite mit belegten Antwortblöcken aufbauen.",
      scope:
        "Eine kommerziell zentrale Seite bekommt klar abgegrenzte Frage-Antwort-Blöcke, überprüfbare Aussagen und eine eindeutige Entity-Auszeichnung. Bei einer Crawler-Sperre wird zusätzlich der Zugang freigegeben. Ein Seitentyp, kein Content-Programm.",
      implementationSurface: "ai_search",
      implementationMode: "SEESZN_access",
      expectedHours: 14,
      bounded: true,
      reversibleOrControlled: true,
    },
    hypothesis: {
      metric: "Nennungen und durchschnittliche Position in einem konstanten Prompt-Set",
      baselineDefinition:
        "Konstantes Prompt-Set über ChatGPT, Gemini, Perplexity und Google AI Overviews, gemessen vor der Umsetzung mit derselben Messlogik wie danach.",
      expectedDirection: "increase",
      measurementWindowWeeksMin: MEASUREMENT_WEEKS_MIN,
      measurementWindowWeeksMax: MEASUREMENT_WEEKS_MAX,
      attributionLimitations: [
        "Antwortsysteme sind nicht deterministisch. Wir messen ein konstantes Prompt-Set, keine garantierte Nennung.",
        "Modellwechsel auf Anbieterseite sind nicht kontrollierbar.",
      ],
    },
    weight: strong ? 8 : 5,
  };
}

// ── Scope, Komplexität, Eligibility ───────────────────────────────────────────

/**
 * Grobe Einordnung der Oberfläche. Sie beeinflusst weder Befund noch Preis, sie
 * entscheidet nur, welcher Case nach dem Scan als relevantester zuerst steht.
 * Grundlage sind beobachtete Signale: Produktauszeichnung oder Produktdetailpfade.
 */
function surfaceKindOf(input: QualifyInput): SurfaceKind {
  const pages = [input.home, ...input.samples];
  const hasProductSchema = pages.some((p) =>
    p.jsonLdTypes.some((t) => t.toLowerCase() === "product"),
  );
  const productPaths = pages.filter((p) => {
    try {
      return PRODUCT_DETAIL_PATH.test(new URL(p.url).pathname);
    } catch {
      return false;
    }
  }).length;
  return hasProductSchema || productPaths >= 2 ? "commerce" : "site";
}

export function complexityFromScope(urlCount: number): Complexity {
  if (urlCount >= 50_000) return "very_high";
  if (urlCount >= 2_000) return "high";
  if (urlCount >= 200) return "medium";
  return "simple";
}

function eligibilityFromScope(input: QualifyInput): EligibilityState {
  // Nur echte Enterprise-Größe blockiert. Dass wir eine große Sitemap nur in
  // Teilen gelesen haben, ist unsere Lesegrenze und kein Grund, jemandem den
  // Kauf zu verwehren. Es erhöht die vorgeschlagene Komplexität, mehr nicht.
  const urlCount = input.sitemap.urls.length;
  if (urlCount >= 50_000) {
    return {
      eligible: false,
      reason: "enterprise_scale",
      nextAction:
        "Der Scope ist groß genug, dass wir den Move vor dem Kauf gemeinsam eingrenzen. Wir machen dafür ein kurzes Scoped Review.",
    };
  }
  const markets = new Set(input.home.hreflangLocales.map((l) => l.split("-")[0]));
  if (markets.size >= 4) {
    return {
      eligible: false,
      reason: "multi_market_scope",
      nextAction:
        "Die Domain bedient vier oder mehr Märkte. Wir grenzen den Move vorab auf einen Markt ein, damit der Festpreis trägt.",
    };
  }
  return { eligible: true };
}

// ── Auswahl ───────────────────────────────────────────────────────────────────

/**
 * Wählt höchstens einen Befund. Rangfolge: passender Diagnosepfad, dann Impact,
 * dann Confidence, dann geringerer Aufwand. Gibt null zurück, wenn nichts die
 * Schwelle erreicht.
 */
export function qualify(input: QualifyInput): FirstMoveFinding | null {
  // Harte Vorbedingung: ohne lesbare Startseite gibt es keinen Befund.
  //
  // Bot-Schutzseiten (Cloudflare, Akamai und Ähnliches) antworten mit 403 und
  // liefern dabei eine Challenge-Seite, die selbst noindex trägt, keine H1 hat
  // und kein Tag enthält. Ohne diesen Guard würde daraus ein Befund entstehen,
  // der über die echte Website nichts aussagt. Genau das darf nie passieren.
  if (input.home.status !== 200) return null;

  const candidates = [
    candidateIndexationDefect(input),
    candidateCompetingIntent(input),
    candidateAiSearchCitability(input),
    candidateTemplateFlattening(input),
  ].filter((c): c is Candidate => c !== null);

  if (!candidates.length) return null;

  const routeBonus = (c: Candidate) => {
    if (input.route === "unsure") return 0;
    if (input.route === c.route) return 5;
    return 0;
  };

  candidates.sort((a, b) => {
    const s =
      routeBonus(b) - routeBonus(a) ||
      LEVEL_SCORE[b.impact] - LEVEL_SCORE[a.impact] ||
      LEVEL_SCORE[b.confidence] - LEVEL_SCORE[a.confidence] ||
      LEVEL_SCORE[a.effort] - LEVEL_SCORE[b.effort] ||
      b.weight - a.weight;
    return s;
  });

  const best = candidates[0];

  // Harte Gegenprüfung: ohne zwei Beobachtungen kein Befund.
  if (best.evidence.length < 2) return null;

  const eligibility = eligibilityFromScope(input);

  return {
    id: `fm_${Date.now().toString(36)}`,
    route: best.route,
    status: "qualified",
    title: best.title,
    summary: best.summary,
    evidence: best.evidence,
    impact: best.impact,
    confidence: best.confidence,
    effort: best.effort,
    proposedFirstMove: best.move,
    measurementHypothesis: best.hypothesis,
    eligibility,
    publicEvidenceOnly: true,
    surfaceKind: surfaceKindOf(input),
    // Eine nur teilweise gelesene Sitemap heißt: der Scope ist größer als das,
    // was wir sehen konnten. Das schlägt sich in der Komplexität nieder, damit
    // der Fit Check nicht zu optimistisch startet.
    suggestedComplexity: input.sitemap.partial
      ? "high"
      : complexityFromScope(input.sitemap.urls.length),
    createdAt: new Date().toISOString(),
  };
}
