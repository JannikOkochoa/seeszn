// ─── Case Study: SEO + AIO im Tourismus — deutsche Fassung ───────────────────
// Kanonische Quelle für alle deutschen Inhalte. Jede Zahl wird genau einmal in
// FIGURES definiert und überall referenziert, damit zwei Abschnitte niemals
// unterschiedliche Werte für dieselbe Kennzahl zeigen.
//
// ANONYMISIERUNG
// Der Kunde wird ausschliesslich als "etablierter Tourismusanbieter" bzw.
// "Tourismusanbieter im DACH-Markt" bezeichnet. Kein Name, keine Domain, keine
// Städte — weder im sichtbaren Text noch in Metadaten, JSON-LD, alt-Texten,
// aria-Labels oder Dateinamen.
//
// DATENDISZIPLIN
// - `verified`       nur gesetzt, wenn der Wert aus einer benannten Quelle neu
//                    berechnet oder vom Kunden freigegeben wurde.
// - `publicApproved` nur gesetzt für Werte, die öffentlich gezeigt werden dürfen.
//                    Absolute Traffic-Volumina bleiben bewusst ungenehmigt.
//
// QUELLEN
// - GSC-A  Google Search Console, Domain-Property, Websuche, Export vom
//          13.07.2026, Fenster 11.03.2025 – 10.07.2026 (lokal neu berechnet).
// - GSC-B  Derselbe Export, Monatsaggregation 07/2025 – 06/2026.
// - LIVE   Direktabruf der Live-Oberfläche am 08.08.2026.
// - AIM    SEESZN AI-Search-Monitoring, konstantes Prompt-Set. Der Ergebniswert
//          ist vom Kunden zur Veröffentlichung freigegeben.

import type { CaseContent, SourceRef } from "./types";

export const CASE_PATH = "/case-studies/seo-aio-tourismus";
export const CASE_PATH_EN = "/en/case-studies/seo-aio-tourism";

// ── Kanonische Zahlen ────────────────────────────────────────────────────────
// Deutsche Schreibweise mit Dezimalkomma und Punkt als Tausendertrenner.
export const FIGURES = {
  aiPositionBefore: "5,3",
  aiPositionAfter: "2,2",
  aiWindowDays: "45",
  medianTargets: "26,1",
  top3TargetsNum: "17",
  top3TargetsDen: "1.000",
  impressionShare: "25,9",
  clickShare: "3,7",
  clicksYoY: "20,5",
  impressionsYoY: "21,3",
  ctrBefore: "1,11",
  ctrAfter: "1,12",
} as const;

/** Numerische Rohwerte — sprachunabhängig, für Geometrie und Skalen. */
export const VALUES = {
  aiPositionBefore: 5.3,
  aiPositionAfter: 2.2,
  impressionShare: 25.9,
  clickShare: 3.7,
  weights: [1079, 704, 655],
} as const;

export const AI_SYSTEMS = ["ChatGPT", "Gemini", "Perplexity", "Google AI Overviews"] as const;
export const AI_SYSTEMS_LINE = AI_SYSTEMS.join(" · ");

const SOURCES: Record<string, SourceRef> = {
  "GSC-A": {
    code: "GSC-A",
    label: "Google Search Console · Domain-Property · Websuche",
    window: "11.03.2025 – 10.07.2026",
  },
  "GSC-B": {
    code: "GSC-B",
    label: "Google Search Console · Domain-Property · Monatsaggregation",
    window: "01.07.2025 – 30.06.2026",
  },
  LIVE: {
    code: "LIVE",
    label: "Direktabruf der Live-Oberfläche",
    window: "08.08.2026",
  },
  AIM: {
    code: "AIM",
    label: "SEESZN AI-Search-Monitoring · konstantes Prompt-Set",
    window: "45 Tage",
  },
};

const H1_TEXT = `Von Ø Platz ${FIGURES.aiPositionBefore} auf Ø Platz ${FIGURES.aiPositionAfter} in AI Search.`;

export const de: CaseContent = {
  locale: "de",
  path: CASE_PATH,
  altPath: CASE_PATH_EN,
  indexPath: "/work",
  sources: SOURCES,

  hero: {
    eyebrow: "Case Study · SEO + AIO · Tourismus",
    breadcrumb: ["Case Studies", "SEO + AIO", "Tourismus"],
    h1Lead: "Von Ø Platz",
    h1Join: " auf Ø Platz ",
    h1Tail: "in AI Search.",
    days: `In ${FIGURES.aiWindowDays} Tagen.`,
    supporting:
      "Wie SEESZN die Sichtbarkeit eines etablierten Tourismusanbieters in Google und AI Search systematisch ausgebaut hat.",
    systems: `Google Search · ${AI_SYSTEMS_LINE}`,
    meta: [
      { key: "Markt", value: "DACH" },
      { key: "Zeitraum", value: "Jul 2026 — laufend" },
      { key: "Kunde", value: "Anonymisiert" },
    ],
    scrollLink: { label: "Ergebnis ansehen", href: "#ergebnis" },
    image: {
      src: "/Hero-Bild.png",
      width: 1122,
      height: 1402,
      alt: "Felsformationen im Meer vor einer verwitterten mediterranen Mauer mit Palmwedel.",
    },
  },

  quickFacts: {
    label: "Überblick",
    headline: ["Der Case in", "20 Sekunden."],
    facts: [
      { key: "Branche", value: "Tourismus" },
      { key: "Markt", value: "DACH" },
      { key: "Ausgangslage", value: "Etablierter Anbieter mit ungenutztem Search-Potenzial", wide: true },
      { key: "Ziel", value: "Mehr Sichtbarkeit in Google und AI Search" },
      { key: "Ansatz", value: "SEO + AIO / GEO" },
      { key: "Systeme", value: AI_SYSTEMS_LINE, wide: true },
      { key: "Ergebnis", value: `Ø ${FIGURES.aiPositionBefore} → Ø ${FIGURES.aiPositionAfter}` },
      { key: "Zeitraum", value: `${FIGURES.aiWindowDays} Tage` },
      { key: "Kunde", value: "Anonymisiert" },
    ],
  },

  baseline: {
    label: "Ausgangslage",
    headline: "Sichtbar. Aber weit unter Potenzial.",
    copy: "Der Anbieter war etabliert, die Nachfrage vorhanden und viele relevante Seiten bereits in Google sichtbar. Das Problem: Diese Sichtbarkeit wurde zu selten in Spitzenpositionen und Klicks übersetzt. Gleichzeitig entstand mit AI Search ein weiterer Suchkanal, in dem Empfehlungen und Quellen neu verteilt werden.",
    metrics: [
      {
        id: "median",
        value: { value: FIGURES.medianTargets, verified: true, publicApproved: true },
        label: "Median-Position der Zielseiten",
        note: "Mittlere Position über 1.000 Queries des Zielseiten-Verzeichnisses.",
        source: "GSC-A",
      },
      {
        id: "top3",
        value: {
          value: `${FIGURES.top3TargetsNum} / ${FIGURES.top3TargetsDen}`,
          verified: true,
          publicApproved: true,
        },
        label: "Zielseiten-Queries in den Top 3",
        note: "Position 3,0 oder besser, gemessen an den 1.000 klickstärksten Queries des Verzeichnisses.",
        source: "GSC-A",
      },
      {
        id: "share",
        value: {
          value: `${FIGURES.impressionShare} % → ${FIGURES.clickShare} %`,
          verified: true,
          publicApproved: true,
        },
        label: "Anteil an Impressionen → Anteil an Klicks",
        note: "Anteil der Zielseiten an allen Impressionen und allen Klicks der Domain, Juni 2026.",
        source: "GSC-B",
      },
    ],
    conclusion:
      "Die Nachfrage war da. Der Kunde wurde nur nicht oft genug dort gefunden, wo Entscheidungen fallen.",
    gap: {
      caption: "Anteil der Zielseiten an Impressionen und Klicks der Domain, Juni 2026.",
      sourceNote: "Quelle: GSC-B.",
      bars: [
        { id: "impressions", label: "Impressionen", value: VALUES.impressionShare, display: `${FIGURES.impressionShare} %` },
        { id: "clicks", label: "Klicks", value: VALUES.clickShare, display: `${FIGURES.clickShare} %` },
      ],
      punchline: "Reichweite war vorhanden. Zugriff nicht.",
    },
    historicalNote: `Zum Projektstart lagen die organischen Klicks im Jahresvergleich ${FIGURES.clicksYoY} % und die Impressionen ${FIGURES.impressionsYoY} % unter dem Vorjahr, während die Klickrate mit ${FIGURES.ctrBefore} % zu ${FIGURES.ctrAfter} % praktisch unverändert blieb.`,
  },

  findings: {
    label: "Befunde",
    headline: "Vier Dinge bremsten die Sichtbarkeit.",
    items: [
      {
        index: "01",
        title: "Technisches SEO",
        text: "Suchmaschinen bekamen an entscheidenden Stellen eine unnötig komplizierte Website: inkonsistente Heading-Strukturen, Crawl-Probleme, doppelte Elemente und sehr große HTML-Dokumente.",
      },
      {
        index: "02",
        title: "Content & Suchintention",
        text: "Relevante Nachfrage war vorhanden, wurde aber nicht konsequent auf die richtigen Seiten und Antworten geführt.",
      },
      {
        index: "03",
        title: "Interne Autorität",
        text: "Kommerziell wichtige Seiten erhielten nicht überall die interne Unterstützung, die ihrer Bedeutung entsprach.",
      },
      {
        index: "04",
        title: "AI Search",
        text: "Marke, Leistungen, Fakten und Antworten waren noch nicht konsequent darauf ausgerichtet, von generativen Suchsystemen erkannt, zugeordnet und als Quelle genutzt zu werden.",
      },
    ],
  },

  changes: {
    label: "Massnahmen",
    headline: "SEO und AI Search als ein System.",
    intro:
      "Wir haben Google und AI Search nicht als zwei getrennte Disziplinen behandelt. Technik, Inhalte, Informationsarchitektur, Entitäten, interne Verlinkung und externe Quellen wurden als zusammenhängendes Search-System optimiert.",
    items: [
      {
        index: "01",
        title: "Technik bereinigt",
        text: "Crawlability, Indexierung, Heading-Struktur und technische Inkonsistenzen systematisch bearbeitet.",
      },
      {
        index: "02",
        title: "Suchintention geschärft",
        text: "Bestehende Nachfrage identifiziert und wichtige Zielseiten präziser auf relevante Suchintentionen ausgerichtet.",
      },
      {
        index: "03",
        title: "Informationsarchitektur verbessert",
        text: "Kommerziell wichtige Seiten stärker miteinander verbunden und interne Autorität gezielter verteilt.",
      },
      {
        index: "04",
        title: "Antworten zitierfähig gemacht",
        text: "Fakten, Fragen und Entitäten klarer strukturiert und längere Inhalte in eindeutig abgegrenzte Themen- und Antwortblöcke gegliedert. So können einzelne Informationen von klassischen Suchmaschinen und generativen Systemen leichter verstanden, gefunden und zitiert werden.",
      },
      {
        index: "05",
        title: "Externe Bestätigung aufgebaut",
        text: "Nicht einfach Linkzahl erhöht, sondern relevante Drittquellen, Branchenkontexte und verifizierbare Markensignale gezielt gestärkt.",
      },
    ],
    definition:
      "AIO (AI Optimization), häufig auch GEO bzw. Generative Engine Optimization genannt, behandeln wir nicht als separaten Hack. Gute AI-Sichtbarkeit entsteht aus einer starken technischen Basis, klaren Inhalten, eindeutigen Entitäten und glaubwürdiger externer Bestätigung.",
  },

  result: {
    label: "Das Ergebnis",
    eyebrow: "Das Ergebnis",
    headline: "Top 3 in AI Search.",
    from: { value: FIGURES.aiPositionBefore, verified: true, publicApproved: true },
    to: { value: FIGURES.aiPositionAfter, verified: true, publicApproved: true },
    averagePrefix: "Ø",
    subline: `Durchschnittliche Position der Marke innerhalb von ${FIGURES.aiWindowDays} Tagen.`,
    statement: `Im konstant beobachteten Prompt-Set verbesserte sich die durchschnittliche Position der Marke innerhalb von ${FIGURES.aiWindowDays} Tagen von ${FIGURES.aiPositionBefore} auf ${FIGURES.aiPositionAfter}. Beobachtet wurden ${AI_SYSTEMS.slice(0, -1).join(", ")} und ${AI_SYSTEMS[AI_SYSTEMS.length - 1]}.`,
    caption: `Niedriger = bessere Position. Gemessen wurden Start- und Endwert des ${FIGURES.aiWindowDays}-Tage-Fensters. Der Verlauf dazwischen ist eine Darstellung der Veränderung, keine Einzelmessung.`,
    daysLabel: `${FIGURES.aiWindowDays} Tage`,
    axis: { top: "Platz 1", bottom: "Platz 7", top3: "Top 3" },
    meta: [
      { key: "Systeme", value: AI_SYSTEMS_LINE },
      { key: "Kennzahl", value: "Durchschnittliche Markenposition im Prompt-Set" },
      { key: "Quelle", value: `${SOURCES.AIM.code} · ${SOURCES.AIM.label}` },
    ],
  },

  difference: {
    label: "Wirkung",
    headline: "Was den Unterschied gemacht hat.",
    items: [
      {
        index: "01",
        title: "Relevanz statt Content-Masse",
        text: "Nicht mehr Seiten um jeden Preis, sondern wichtige Suchintentionen besser beantworten.",
      },
      {
        index: "02",
        title: "Eigene Website + externe Bestätigung",
        text: "Eine Marke wird nicht nur dadurch glaubwürdig, was sie selbst über sich schreibt. Relevante Drittquellen und konsistente Informationen stärken ihre Einordnung zusätzlich.",
      },
      {
        index: "03",
        title: "Google und AI gemeinsam denken",
        text: "Technik, Content, Entitäten, interne Verlinkung und externe Quellen wurden nicht als fünf Einzelprojekte behandelt, sondern als ein Search-System.",
      },
    ],
    image: {
      src: "/Food-&-Wine_Bild.png",
      width: 1086,
      height: 1448,
      alt: "Weinflasche, Glas und Zitrone auf einer Marmorplatte neben einer Speisekarte.",
    },
  },

  proof: {
    label: "Belege",
    headline: "Was im Quelltext stand.",
    railNote:
      "Vier Befunde, jeweils am 08.08.2026 direkt gegen die Live-Oberfläche geprüft. Hier steht, was gefunden wurde — nicht, was bereits behoben ist.",
    gapLabel: "h2 fehlt",
    proofs: [
      {
        id: "heading",
        kind: "heading",
        label: "Heading-Struktur",
        date: "08.08.2026",
        rows: [
          { key: "Dokumentfluss", value: "h1 → h3", code: true },
          { key: "Als div ausgezeichnet", value: 'div class="h2" ×4 · div class="h3" ×27–39', code: true },
          { key: "Echte H2 vor dem ersten H3", value: "0", code: true },
          { key: "Geprüfte Seiten", value: "3 Zielseiten desselben Templates" },
        ],
        note: "Visuell gegliedert. Semantisch flach.",
        source: "LIVE",
        verified: true,
        publicApproved: true,
      },
      {
        id: "duplicate",
        kind: "duplicate",
        label: "Doppelte Überschrift",
        date: "08.08.2026",
        rows: [
          { key: "Element", value: "<h2>[Bewertungsüberschrift]</h2>", code: true },
          { key: "Vorkommen", value: "2 × je Seite", code: true },
          { key: "Ursache", value: "Bewertungs-Overlay im Template" },
          { key: "Betroffen", value: "3 von 3 geprüften Seiten" },
        ],
        note: "Dieselbe Überschrift steht zweimal im Dokument. Der zweite Treffer stammt aus einem Overlay, das im Quelltext immer mitgeliefert wird.",
        source: "LIVE",
        verified: true,
        publicApproved: true,
      },
      {
        id: "crawl",
        kind: "crawl",
        label: "Crawl-Regeln",
        date: "08.08.2026",
        rows: [
          { key: "robots.txt", value: "Disallow: *cHash*", code: true },
          { key: "Ausnahme", value: "Allow: *sitemap.xml*cHash*", code: true },
          { key: "Sitemap-Index", value: "…/sitemap.xml?sitemap=[typ]&amp;cHash=[hash]", code: true },
        ],
        note: "Der Parametertyp, den die Sitemap-Einträge selbst tragen, ist sitewide gesperrt. Nur die vorangestellte Ausnahme hält die Sitemaps abrufbar.",
        source: "LIVE",
        verified: true,
        publicApproved: true,
      },
      {
        id: "weight",
        kind: "weight",
        label: "Dokumentgröße",
        date: "08.08.2026",
        rows: [
          { key: "Zielseite A", value: "1.079 KB HTML", code: true },
          { key: "Zielseite B", value: "704 KB HTML", code: true },
          { key: "Zielseite C", value: "655 KB HTML", code: true },
        ],
        note: "Reines ausgeliefertes HTML, ohne Bilder, JavaScript und Stylesheets. Das größte Dokument überschreitet ein Megabyte, bevor ein einziges Asset geladen ist.",
        source: "LIVE",
        verified: true,
        publicApproved: true,
      },
    ],
    weights: [
      { label: "Zielseite A", kb: VALUES.weights[0], display: "1.079 KB" },
      { label: "Zielseite B", kb: VALUES.weights[1], display: "704 KB" },
      { label: "Zielseite C", kb: VALUES.weights[2], display: "655 KB" },
    ],
  },

  method: {
    label: "Methodik",
    headline: "So messen wir.",
    copy: "AI-Antworten sind nicht vollständig deterministisch. Deshalb vergleichen wir keine einzelnen Screenshots, sondern ein konstantes Prompt-Set über definierte Messfenster.",
    facts: [
      { key: "Prompt-Set", value: "Konstant über das Vergleichsfenster" },
      { key: "Systeme", value: AI_SYSTEMS_LINE },
      { key: "Kennzahl", value: "Durchschnittliche Markenposition innerhalb des definierten Sets" },
      { key: "Vergleich", value: "Gleicher Messaufbau vor und nach den Maßnahmen" },
      { key: "Zeitraum", value: `${FIGURES.aiWindowDays} Tage` },
    ],
    detailsLabel: "Methodik im Detail",
    criteria: [
      { key: "Messfenster", value: "Länge und Lage des Fensters passend zur erwarteten Wirkungsdauer." },
      { key: "Baseline-Stabilität", value: "Schwankt der Ausgangswert stark, sinkt die Aussagekraft des Vergleichs." },
      { key: "Sitewide-Trend", value: "Bewegt sich die gesamte Domain im selben Zeitraum, wird das mitbewertet." },
      { key: "Saisonalität", value: "Tourismus ist saisonal. Vergleichszeiträume werden entsprechend gewählt." },
      { key: "Parallele Eingriffe", value: "Laufen mehrere Maßnahmen gleichzeitig, ist die Zuordnung schwächer." },
      { key: "Datenqualität", value: "Tracking, Zugriff auf Rohdaten und Vollständigkeit der Reihe." },
      { key: "Stichprobengröße", value: "Wie viele Prompts bzw. Queries das Set umfasst." },
    ],
    caveat:
      "Diese Kriterien beschreiben, wie belastbar wir eine Zuordnung halten. Sie sind keine statistische Signifikanz und behaupten keine Sicherheit, die die Datenlage nicht hergibt.",
  },

  takeaways: {
    label: "Erkenntnisse",
    headline: "Drei Dinge, die entscheidend waren.",
    items: [
      {
        index: "01",
        title: "Reichweite allein bringt noch keinen Traffic.",
        text: `${FIGURES.impressionShare} % der Domain-Impressionen entfielen auf relevante Zielseiten, aber nur ${FIGURES.clickShare} % der Klicks.`,
      },
      {
        index: "02",
        title: "Visuelle Struktur ist nicht automatisch technische Struktur.",
        text: "Auf geprüften Zielseiten existierte die Gliederung visuell, während der HTML-Dokumentfluss von H1 direkt auf H3 sprang.",
      },
      {
        index: "03",
        title: "AI-Sichtbarkeit entsteht nicht nur auf der eigenen Website.",
        text: "Klare eigene Inhalte sind die Grundlage. Glaubwürdige externe Quellen helfen zusätzlich dabei, eine Marke und ihre Expertise konsistent einzuordnen.",
      },
    ],
  },

  cta: {
    label: "Nächster Schritt",
    headline: "Wie sichtbar ist dein Unternehmen?",
    copy: "Finde heraus, wo deine Marke heute in Google und AI Search steht – und welches Potenzial du liegen lässt.",
    primary: { label: "First Move starten", href: "/first-move" },
    systems: `Google · ${AI_SYSTEMS_LINE}`,
    relatedLabel: "Weiterlesen",
    related: [
      { label: "Was ist KI-Sichtbarkeit?", href: "/insights/was-ist-ki-sichtbarkeit" },
      { label: "SEO, GEO und AIO im Vergleich", href: "/insights/seo-vs-geo-vs-aio" },
      { label: "Wie wir arbeiten", href: "/services" },
    ],
    image: {
      src: "/closing-bild.png",
      width: 1672,
      height: 941,
      alt: "Kleines Boot auf dunklem Wasser vor einer steilen Felsküste.",
    },
  },

  meta: {
    title: `SEO & AIO Case Study: Platz ${FIGURES.aiPositionBefore} → ${FIGURES.aiPositionAfter} | SEESZN`,
    description: `Wie SEESZN einen Tourismusanbieter in ${FIGURES.aiWindowDays} Tagen von Ø Platz ${FIGURES.aiPositionBefore} auf ${FIGURES.aiPositionAfter} in AI Search brachte – mit SEO, AIO/GEO und technischer Optimierung.`,
    ogTitle: `Von Ø Platz ${FIGURES.aiPositionBefore} auf Ø Platz ${FIGURES.aiPositionAfter} in AI Search.`,
    ogDescription: `SEO + AIO Case Study eines etablierten Tourismusanbieters. Messbare Entwicklung in ${AI_SYSTEMS_LINE}.`,
    ogImage: "/Hero-Bild.png",
    datePublished: "2026-08-08",
    dateModified: "2026-08-08",
    h1Text: H1_TEXT,
    about: [
      "Search Engine Optimization",
      "AI Search",
      "AI Optimization",
      "Generative Engine Optimization",
      "Tourismus",
    ],
    breadcrumbHomeLabel: "Start",
    breadcrumbIndexLabel: "Case Studies",
    breadcrumbLeafLabel: "SEO + AIO Tourismus",
  },
};

export const H1_TEXT_DE = H1_TEXT;
