// ─── Case content (German) ──────────────────────────────────────────────────
// Qualitative status only — no invented metrics. "in Arbeit", "neu aufgebaut",
// "Struktur geschaffen" statt erfundener Zahlen.

import type { RelatedLink } from "@/lib/landing";

export interface CaseStudy {
  slug: string;
  name: string;
  fullName: string;
  sector: string;
  scope: string[];
  status: string;
  url?: string;
  domain?: string;
  /** One-line editorial line. */
  statement: string;
  ausgangslage: string;
  problem: string;
  umsetzung: string[];
  relevanz: string;
  statusText: string;
  related: RelatedLink[];
  meta: { title: string; description: string };
}

export const CASES: Record<string, CaseStudy> = {
  rischo: {
    slug: "rischo",
    name: "RISCHO",
    fullName: "Rischo GmbH",
    sector: "Stahl- & Metallbau · Bremen",
    scope: ["Website Build", "SEO Care"],
    status: "Live · in Betreuung",
    url: "https://rischo-gmbh.de",
    domain: "rischo-gmbh.de",
    statement: "Ein Handwerksbetrieb seit 1981, jetzt gebaut, um gefunden zu werden.",
    ausgangslage:
      "Rischo ist ein etablierter Bremer Spezialist für Stahl- und Metallbau mit langer Handwerkstradition. Die fachliche Substanz war stark, die digitale Oberfläche bildete sie jedoch nicht ab.",
    problem:
      "Das Handwerk war bekannt, die Modelle aber blind: schwache digitale Struktur, kaum lokale Suchsichtbarkeit und Seiten, die nicht beantworteten, was Kunden tatsächlich suchen. In klassischer Suche schwer auffindbar, in KI-Antworten praktisch nicht präsent.",
    umsetzung: [
      "Website neu gebaut: performance-first, technisch sauber, strukturiert für lokale Suche und maschinelles Verstehen, von der ersten Seite an.",
      "Lokale Sucharchitektur für die Region Bremen: Leistungsbereiche nach Suchintention kartiert, intern so vernetzt, dass Maschinen die Struktur lesen können.",
      "Inhalte neu geschrieben entlang der Fragen, die Kunden vor dem ersten Kontakt stellen: konkret und lösungsorientiert, nicht selbstbeschreibend.",
      "SEO-Betreuung im laufenden Betrieb: Sichtbarkeit wird nicht einmal aufgebaut und vergessen, sondern kontinuierlich gepflegt und justiert.",
    ],
    relevanz:
      "Starkes Handwerk braucht eine Oberfläche, die seine Substanz abbildet: für Kunden, die online recherchieren, und für KI-Systeme, die Antworten aus Quellen zusammensetzen. Wer strukturiert und abrufbar ist, gewinnt beide Wege.",
    statusText:
      "Live und in laufender SEO-Betreuung. Website, Sucharchitektur und Inhalte sind neu aufgebaut; die Pflege läuft fortlaufend. Konkrete Performance-Readings bleiben vertraulich.",
    related: [
      { label: "SEO Agentur Bremen & DACH", href: "/seo-agentur-bremen" },
      { label: "B2B SEO Agentur", href: "/b2b-seo-agentur" },
      { label: "Weitere Cases", href: "/work" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    meta: {
      title: "Case: RISCHO · Stahl- & Metallbau Bremen | SEESZN",
      description: "Wie SEESZN für den Bremer Stahl- und Metallbau-Spezialisten Rischo eine schnelle Website mit sauberer Sucharchitektur gebaut hat, in laufender SEO-Betreuung.",
    },
  },

  sivius: {
    slug: "sivius",
    name: "SIVIUS",
    fullName: "SIVIUS Group",
    sector: "Immobilien & Asset Management",
    scope: ["Website Build", "Software Development", "GEO / AIO Care"],
    status: "Live · in Betreuung",
    url: "https://www.sivius.net/de/",
    domain: "sivius.net",
    statement: "Substanz gebaut. Jetzt auch abrufbar.",
    ausgangslage:
      "SIVIUS ist im Immobilien- und Asset-Management aktiv, eine Kategorie mit realen, substanziellen Werten, die digital klar und glaubwürdig repräsentiert werden müssen.",
    problem:
      "Quartiere gebaut, Modelle leer: Die reale Substanz war vorhanden, aber als abrufbare, zitierfähige Evidenz für Such- und KI-Systeme kaum vorhanden. Entität und Quellsignale waren unscharf.",
    umsetzung: [
      "Digitale Oberfläche gebaut: editorial, performance-first, auf KI-Retrieval ausgerichtet, als erste belastbare Quelle der Marke.",
      "Software hinter der Oberfläche entwickelt und in laufender technischer Betreuung gehalten.",
      "Entitäts-Klarheit hergestellt: konsistente Benennung der Marke, kanonische Beschreibung, ausgerichtete Quellsignale auf relevanten Oberflächen.",
      "GEO-/AIO-Betreuung im laufenden Betrieb: Inhalte und Struktur werden fortlaufend so weiterentwickelt, dass KI-Systeme SIVIUS als Quelle verwenden können.",
    ],
    relevanz:
      "In einer Kategorie, in der reale Assets zählen, entscheidet die digitale Darstellung, ob KI-Systeme eine Marke als Quelle behandeln oder übergehen. Entitäts-Klarheit und zitierfähige Struktur sind hier kein technisches Detail, sie sind Reputationsinfrastruktur.",
    statusText:
      "Live und in laufender GEO-/AIO-Betreuung. Oberfläche und Software sind gebaut; Entitäts- und Quellstruktur werden fortlaufend weiterentwickelt. Konkrete Performance-Readings bleiben vertraulich.",
    related: [
      { label: "GEO Agentur: Generative Engine Optimization", href: "/geo-agentur" },
      { label: "AIO Optimierung", href: "/aio-optimierung" },
      { label: "Weitere Cases", href: "/work" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    meta: {
      title: "Case: SIVIUS · Immobilien & Asset Management | SEESZN",
      description: "Wie SEESZN für die SIVIUS Group Website, Software und KI-Sichtbarkeit (GEO/AIO) aufgebaut hat: Entitäts-Klarheit und zitierfähige Struktur für AI Retrieval.",
    },
  },

  contentkueche: {
    slug: "contentkueche",
    name: "CONTENTKÜCHE",
    fullName: "Contentkueche GmbH",
    sector: "Content Marketing · München",
    scope: ["GEO / AIO Care", "SEO Care"],
    status: "In Betreuung",
    url: "https://contentkueche.de",
    domain: "contentkueche.de",
    statement: "Wer Content produziert, sollte die Quelle sein, die Maschinen zitieren.",
    ausgangslage:
      "Contentküche ist eine Münchner Content-Agentur, die selbst Inhalte für Marken produziert und damit in einer Kategorie tätig ist, in der Zitierbarkeit besonders zählt.",
    problem:
      "Hoher Output, schwache Quelle: Die Inhaltsqualität war da, die systematische Übersetzung in zitierfähige Quellsignale fehlte. Wer Content produziert, aber selbst nicht zitiert wird, arbeitet für die Sichtbarkeit anderer.",
    umsetzung: [
      "Suchstruktur für die relevanten Themenfelder aufgebaut: nach topical authority strukturiert, nicht nach Keyword-Volumen.",
      "Inhalte auf Zitierfähigkeit ausgerichtet: in eigenständige, chunk-fähige Passagen gegliedert, die ohne Kontext zitierbar sind.",
      "Quellsignale der Marke konsolidiert, damit Contentküche selbst als Quelle sichtbar wird, nicht nur die Marken, für die sie arbeitet.",
    ],
    relevanz:
      "Eine Content-Agentur, die selbst nicht zitiert wird, demonstriert ihre eigene Leistung nicht. Die Arbeit zielt auf genau das: Contentküche zur anerkannten Quelle in ihrer Kategorie machen: abrufbar, belegbar, zitiert.",
    statusText:
      "In laufender GEO-/AIO- und SEO-Betreuung. Suchstruktur und Quellsignale werden fortlaufend aufgebaut und gepflegt. Konkrete Performance-Readings bleiben vertraulich.",
    related: [
      { label: "GEO Agentur", href: "/geo-agentur" },
      { label: "Was ist KI-Sichtbarkeit?", href: "/insights/was-ist-ki-sichtbarkeit" },
      { label: "Weitere Cases", href: "/work" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    meta: {
      title: "Case: Contentküche · Content Marketing München | SEESZN",
      description: "Wie SEESZN die Münchner Content-Agentur Contentküche in GEO-/AIO- und SEO-Betreuung hält, damit produzierter Content zur zitierfähigen Quelle wird.",
    },
  },
};

export const CASE_SLUGS = Object.keys(CASES);
