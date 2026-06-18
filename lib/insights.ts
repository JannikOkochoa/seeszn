// ─── Insight & research article content (German) ────────────────────────────
// Neutral, source-style explanations. No invented statistics.

import type { Article } from "@/components/landing/ArticlePage";

const PUBLISHED = "2026-06-17";

const crumbsInsight = (name: string, slug: string) => [
  { name: "Start", path: "/" },
  { name: "Insights", path: "/insights" },
  { name, path: `/${slug}` },
];

export const ARTICLES: Record<string, Article> = {
  // ───────────────────────────────────────────────────────────────────────────
  "insights/was-ist-ki-sichtbarkeit": {
    slug: "insights/was-ist-ki-sichtbarkeit",
    kicker: "GRUNDLAGEN",
    h1: "Was ist KI-Sichtbarkeit?",
    lead: "KI-Sichtbarkeit beschreibt, ob eine Marke in KI-gestützten Antworten erscheint und ob sie als Quelle zitiert wird.",
    datePublished: PUBLISHED,
    answer: {
      question: "Was ist KI-Sichtbarkeit?",
      body: "KI-Sichtbarkeit ist das Ausmaß, in dem eine Marke in KI-generierten Antworten erscheint und als Quelle zitiert wird, etwa in ChatGPT, Perplexity, Gemini oder Google AI Overviews. Sie erweitert die klassische Suchsichtbarkeit (Ranking) um die Frage, ob KI-Systeme eine Marke kennen, verstehen, abrufen und empfehlen.",
    },
    sections: [
      {
        num: "01",
        heading: "Warum klassische Sichtbarkeit nicht mehr reicht",
        paragraphs: [
          "Klassisches Ranking ist nur noch ein Teil der Sichtbarkeit. Suche war einmal eine Liste von Seiten; heute ist sie zunehmend eine generierte Antwort. Diese Antwort wird aus mehreren Quellen zusammengesetzt.",
          "Viele Unternehmen sind indexiert, aber nicht abrufbar: Sie ranken in den klassischen Ergebnissen und fehlen trotzdem in der KI-Antwort, die darüber steht.",
        ],
      },
      {
        num: "02",
        heading: "Woraus KI-Sichtbarkeit besteht",
        bullets: [
          "Entität: Kann das System auflösen, wer du bist?",
          "Abrufbarkeit: Sind deine Inhalte technisch erreichbar und chunk-fähig?",
          "Zitierfähigkeit: Lässt sich eine Passage eigenständig zitieren?",
          "Quellsignale: Bestätigen andere Oberflächen deine Aussagen?",
        ],
      },
      {
        num: "03",
        heading: "Wie man KI-Sichtbarkeit verbessert",
        paragraphs: [
          "KI-Systeme bevorzugen Marken, die als Quelle klar, strukturiert und belegbar sind. Der Weg führt über eine konsistente Entität, zitierfähige Inhalte (eine Aussage, eine Passage) und saubere technische Abrufbarkeit.",
          "KI-Sichtbarkeit ist kein Schalter, sondern ein aufgebauter Zustand: aus Struktur, Substanz und konsistenten Signalen, die Vertrauen akkumulieren.",
        ],
      },
    ],
    faq: [
      { q: "Ist KI-Sichtbarkeit dasselbe wie SEO?", a: "Nein. SEO zielt auf Rankings in Suchmaschinen. KI-Sichtbarkeit zielt darauf, in KI-Antworten zitiert zu werden. Beide hängen zusammen, sind aber nicht identisch." },
      { q: "Kann man KI-Sichtbarkeit messen?", a: "Teilweise. Man kann ein Prompt-Set wiederholt stellen und auswerten, ob und wie eine Marke genannt und zitiert wird. Die Ausprägung variiert je nach Branche, Sprache, Suchsystem und Prompt-Set." },
      { q: "Für wen ist KI-Sichtbarkeit relevant?", a: "Besonders für B2B-Marken und erklärungsbedürftige Angebote, deren Käufer über Suche und KI-Assistenten recherchieren." },
    ],
    related: [
      { label: "Was ist GEO?", href: "/insights/was-ist-geo" },
      { label: "SEO vs. GEO vs. AIO im Vergleich", href: "/insights/seo-vs-geo-vs-aio" },
      { label: "KI-Sichtbarkeit Agentur", href: "/ki-sichtbarkeit-agentur" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    crumbs: crumbsInsight("Was ist KI-Sichtbarkeit?", "insights/was-ist-ki-sichtbarkeit"),
    meta: {
      title: "Was ist KI-Sichtbarkeit? Definition & Grundlagen | SEESZN",
      description: "KI-Sichtbarkeit erklärt: Was sie bedeutet, woraus sie besteht und wie Marken in ChatGPT, Perplexity, Gemini und AI Overviews zitiert werden. Neutrale Grundlagen von SEESZN.",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "insights/was-ist-geo": {
    slug: "insights/was-ist-geo",
    kicker: "GRUNDLAGEN",
    h1: "Was ist GEO (Generative Engine Optimization)?",
    lead: "GEO ist die Optimierung dafür, von generativen Suchsystemen als Quelle abgerufen und zitiert zu werden.",
    datePublished: PUBLISHED,
    answer: {
      question: "Was ist GEO?",
      body: "GEO (Generative Engine Optimization) ist die Disziplin, Inhalte und Quellsignale so aufzubereiten, dass generative Suchsysteme wie ChatGPT, Perplexity, Gemini und Google AI Overviews eine Marke abrufen, ihr vertrauen und sie in der generierten Antwort zitieren. Anders als klassisches SEO zielt GEO nicht auf eine Ranking-Position, sondern auf Präsenz innerhalb der Antwort.",
    },
    sections: [
      {
        num: "01",
        heading: "Wie generative Suche funktioniert",
        paragraphs: [
          "Generative Systeme zerlegen einen Prompt in einen Fächer aus Sub-Queries (Query Fan-out): Vergleiche, Alternativen, Preise, Bewertungen. Jeder Pfad wird aus eigenen Quellen beantwortet und zu einer Antwort assembliert.",
          "Eine Marke kann die sichtbare Suchanfrage dominieren und im Fächer, der die Antwort speist, vollständig fehlen.",
        ],
      },
      {
        num: "02",
        heading: "Was GEO konkret umfasst",
        bullets: [
          "Query-Fan-out-Mapping: die versteckten Suchpfade einer Kategorie kennen",
          "Zitierfähige Inhalte: eine Aussage, eine Passage, eigenständig",
          "Entity Building: eine klare, konsistente, belegbare Marke",
          "Source Gap Analysis: die Oberflächen finden, denen Modelle vertrauen",
        ],
      },
    ],
    faq: [
      { q: "Was bedeutet GEO?", a: "GEO steht für Generative Engine Optimization: die Optimierung dafür, von generativen KI-Suchsystemen als Quelle zitiert zu werden." },
      { q: "Ist GEO dasselbe wie AEO?", a: "AEO (Answer Engine Optimization) wird oft synonym verwendet. Beide beschreiben die Optimierung für Antwortsysteme. GEO betont den generativen Charakter der Antwort." },
      { q: "Ersetzt GEO das klassische SEO?", a: "Nein. GEO ergänzt SEO. Eine saubere Sucharchitektur ist die Voraussetzung dafür, überhaupt abgerufen zu werden." },
    ],
    related: [
      { label: "Was ist KI-Sichtbarkeit?", href: "/insights/was-ist-ki-sichtbarkeit" },
      { label: "Was ist AIO?", href: "/insights/was-ist-aio" },
      { label: "SEO vs. GEO vs. AIO im Vergleich", href: "/insights/seo-vs-geo-vs-aio" },
      { label: "GEO Agentur", href: "/geo-agentur" },
    ],
    crumbs: crumbsInsight("Was ist GEO?", "insights/was-ist-geo"),
    meta: {
      title: "Was ist GEO? Generative Engine Optimization erklärt | SEESZN",
      description: "GEO (Generative Engine Optimization) erklärt: Wie generative Suche funktioniert, was GEO umfasst und wie sich GEO von SEO unterscheidet. Neutrale Grundlagen von SEESZN.",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "insights/was-ist-aio": {
    slug: "insights/was-ist-aio",
    kicker: "GRUNDLAGEN",
    h1: "Was ist AIO (AI Overview Optimization)?",
    lead: "AIO ist die Optimierung von Inhalten für KI-Antwortflächen wie Google AI Overviews.",
    datePublished: PUBLISHED,
    answer: {
      question: "Was ist AIO?",
      body: "AIO (AI Overview Optimization) ist die Optimierung von Inhalten dafür, in KI-generierten Antwortflächen, allen voran Google AI Overviews, als Quelle zu erscheinen. Ziel ist, in der zusammengefassten Antwort genannt zu werden, statt nur darunter verlinkt zu sein.",
    },
    sections: [
      {
        num: "01",
        heading: "Warum AIO wichtig wird",
        paragraphs: [
          "Die Antwort steht zunehmend über dem klassischen Ergebnis. AI Overviews fassen mehrere Quellen zu einer Antwort zusammen. Wer dort nicht als Quelle auftaucht, verliert Sichtbarkeit, auch bei guten Rankings.",
          "Maschinen zitieren Absätze, nicht Seiten. Retrieval passiert auf Chunk-Ebene.",
        ],
      },
      {
        num: "02",
        heading: "Wie man für AI Overviews optimiert",
        bullets: [
          "Chunk-fähige Inhalte: eigenständig zitierbare Passagen",
          "Antwortblöcke: kurze, direkte Antworten unter klaren Fragen",
          "Strukturierte Daten: FAQ-, Article- und Organisations-Schema",
          "Technische Abrufbarkeit: Crawlbarkeit, Geschwindigkeit, Semantik",
        ],
      },
    ],
    faq: [
      { q: "Was bedeutet AIO?", a: "AIO steht für AI Overview Optimization: die Optimierung dafür, in KI-Antwortflächen wie Google AI Overviews als Quelle zu erscheinen." },
      { q: "Was ist der Unterschied zwischen AIO und GEO?", a: "AIO fokussiert auf KI-Antwortflächen in der Suche (v. a. AI Overviews). GEO ist breiter und umfasst alle generativen Suchsysteme. In der Praxis überschneiden sie sich stark." },
      { q: "Schadet AIO dem Website-Traffic?", a: "AI Overviews können Klicks ersetzen. Genau deshalb verschiebt AIO das Ziel von 'oben ranken' zu 'in der Antwort zitiert werden'." },
    ],
    related: [
      { label: "Was ist GEO?", href: "/insights/was-ist-geo" },
      { label: "SEO vs. GEO vs. AIO im Vergleich", href: "/insights/seo-vs-geo-vs-aio" },
      { label: "AIO Optimierung für AI Overviews", href: "/aio-optimierung" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    crumbs: crumbsInsight("Was ist AIO?", "insights/was-ist-aio"),
    meta: {
      title: "Was ist AIO? AI Overview Optimization erklärt | SEESZN",
      description: "AIO (AI Overview Optimization) erklärt: Wie KI-Antwortflächen funktionieren und wie Marken in Google AI Overviews als Quelle erscheinen. Neutrale Grundlagen von SEESZN.",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "insights/seo-vs-geo-vs-aio": {
    slug: "insights/seo-vs-geo-vs-aio",
    kicker: "VERGLEICH",
    h1: "SEO vs. GEO vs. AIO: der Unterschied einfach erklärt",
    lead: "Drei Disziplinen, ein Ziel: gefunden, abgerufen und zitiert werden. Hier der Unterschied.",
    datePublished: PUBLISHED,
    answer: {
      question: "Was ist der Unterschied zwischen SEO, GEO und AIO?",
      body: "SEO optimiert für Rankings in klassischen Suchmaschinen. GEO (Generative Engine Optimization) optimiert dafür, von generativen KI-Suchsystemen wie ChatGPT oder Perplexity als Quelle zitiert zu werden. AIO (AI Overview Optimization) ist die speziellere Optimierung für KI-Antwortflächen in der Suche, vor allem Google AI Overviews. SEO ist die Grundlage; GEO und AIO bauen darauf auf.",
    },
    sections: [
      {
        num: "01",
        heading: "Drei Fragen, drei Disziplinen",
        bullets: [
          "SEO fragt: Werde ich gerankt?",
          "GEO fragt: Werde ich als Quelle verwendet?",
          "AIO fragt: Erscheine ich in der KI-Antwortfläche?",
        ],
      },
      {
        num: "02",
        heading: "Warum sie zusammengehören",
        paragraphs: [
          "Die drei Disziplinen widersprechen sich nicht, sie bauen aufeinander auf. Ohne crawlbare, saubere Struktur (SEO) gibt es nichts abzurufen. Ohne zitierfähige, entity-klare Inhalte (GEO) wird nichts ausgewählt. Ohne chunk-fähige Antwortblöcke (AIO) erscheint nichts in der Antwortfläche.",
          "Wer alle drei separat behandelt, optimiert für drei verschiedene Systeme und baut dreimal. Wer sie als ein System behandelt, baut einmal und wird in allen drei sichtbar.",
        ],
      },
    ],
    table: {
      caption: "SEO, GEO und AIO im direkten Vergleich",
      columns: ["", "SEO", "GEO", "AIO"],
      rows: [
        ["Ziel", "Ranking-Position", "Zitiert als Quelle", "Präsenz in AI-Antwortfläche"],
        ["Arena", "Klassische SERP", "ChatGPT, Perplexity, Gemini", "Google AI Overviews"],
        ["Einheit", "Seite / Keyword", "Quelle / Passage", "Antwort-Chunk"],
        ["Kernhebel", "Technik, Links, Content", "Entität, Citations, Fan-out", "Antwortblöcke, Schema"],
        ["Erfolgsmaß", "Position & Traffic", "Erwähnung & Zitat", "Nennung in der Antwort"],
      ],
    },
    faq: [
      { q: "Brauche ich GEO und AIO, wenn ich schon SEO mache?", a: "SEO ist die Grundlage, deckt aber KI-Antworten nicht vollständig ab. Wenn deine Zielgruppe KI-Assistenten und AI Overviews nutzt, ergänzen GEO und AIO das klassische SEO sinnvoll." },
      { q: "Ist SEO durch KI tot?", a: "Nein. Die crawlbare, strukturierte Grundlage bleibt Voraussetzung dafür, überhaupt abgerufen zu werden. SEO verändert sich, es verschwindet nicht." },
      { q: "Womit sollte man anfangen?", a: "Mit einem Audit, das alle drei Ebenen prüft. Es zeigt, ob die Lücke eher technisch (SEO), inhaltlich-zitierbar (GEO) oder antwortflächen-spezifisch (AIO) ist." },
    ],
    related: [
      { label: "Was ist KI-Sichtbarkeit?", href: "/insights/was-ist-ki-sichtbarkeit" },
      { label: "Was ist GEO?", href: "/insights/was-ist-geo" },
      { label: "Was ist AIO?", href: "/insights/was-ist-aio" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    crumbs: crumbsInsight("SEO vs. GEO vs. AIO", "insights/seo-vs-geo-vs-aio"),
    meta: {
      title: "SEO vs. GEO vs. AIO: der Unterschied erklärt | SEESZN",
      description: "SEO, GEO und AIO im Vergleich: Ziele, Arenen und Hebel der drei Disziplinen, mit Vergleichstabelle. Neutral erklärt von SEESZN.",
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "research/absence-index": {
    slug: "research/absence-index",
    kicker: "RESEARCH · METHODIK",
    h1: "Der Absence Index: wie wir messen, wo Marken aus Antworten verschwinden",
    lead: "Der Absence Index ist ein internes Beobachtungsmodell dafür, wie oft eine Kategorie ohne die Marken beantwortet wird, die glauben, sie zu besitzen.",
    datePublished: PUBLISHED,
    answer: {
      question: "Was ist der Absence Index?",
      body: "Der Absence Index ist ein internes Beobachtungsmodell von SEESZN. Er beschreibt, in welchem Anteil eines definierten Prompt-Sets einer Kategorie die relevanten Antworten erzeugt werden können, ohne eine bestimmte Marke zu nennen oder zu zitieren. Er misst Abwesenheit, nicht Ranking: also die Lücke zwischen 'existiert' und 'wird in der Antwort verwendet'.",
    },
    sections: [
      {
        num: "01",
        heading: "Was der Absence Index misst",
        paragraphs: [
          "Der Index betrachtet ein definiertes Set an Prompts, die für eine Kategorie typisch sind: Vergleiche, Empfehlungen, Alternativen, Kauffragen. Für jeden Prompt wird beobachtet, ob die Antwort eine Zielmarke nennt, zitiert oder als Quelle verwendet.",
          "Daraus ergibt sich ein qualitatives Bild: Wie oft kann die Kategorie beantwortet werden, ohne dass die Marke vorkommt?",
        ],
      },
      {
        num: "02",
        heading: "Was als Abwesenheit zählt",
        bullets: [
          "Die Marke wird in der Antwort nicht genannt.",
          "Die Marke wird genannt, aber nicht als Quelle zitiert.",
          "Die Antwort verweist stattdessen auf Aggregatoren, Wettbewerber oder Dritte.",
        ],
      },
      {
        num: "03",
        heading: "Was als Präsenz zählt",
        bullets: [
          "Mention: Die Marke wird namentlich genannt.",
          "Citation: Die Marke wird als Quelle verlinkt oder referenziert.",
          "Source Presence: Inhalte der Marke speisen die Antwort erkennbar.",
        ],
      },
      {
        num: "04",
        heading: "Beispiel-Prompts",
        bullets: [
          "„Beste Anbieter für [Kategorie] im DACH-Raum?“",
          "„[Marke] vs. [Wettbewerber]: was ist besser?“",
          "„Welche Alternativen gibt es zu [Marke]?“",
          "„Worauf sollte man bei [Kategorie] achten?“",
        ],
      },
      {
        num: "05",
        heading: "Eine Beobachtung, kein universeller Wert",
        paragraphs: [
          "In manchen Kategorien beobachten wir, dass ein Großteil der definierten Prompts beantwortet werden kann, ohne die Marken zu nennen, die sich als Kategorieführer verstehen. Eine intern wiederkehrende Größenordnung liegt bei rund 83% der geprüften Prompts.",
          "Dieser Wert ist eine interne Kategorie-Beobachtung, kein allgemeingültiger Benchmark und keine repräsentative Studie. Er illustriert das Muster, nicht eine feste Zahl.",
        ],
      },
      {
        num: "06",
        heading: "Grenzen des Modells",
        bullets: [
          "KI-Antworten sind nicht deterministisch und ändern sich mit Modellversionen.",
          "Prompt-Formulierung, Sprache und Region beeinflussen das Ergebnis stark.",
          "Live-Suche vs. trainiertes Wissen führt zu unterschiedlichen Antworten.",
          "Der Index ist ein Indikator für Handlungsbedarf, kein Messinstrument mit Nachkommastellen.",
        ],
      },
      {
        num: "07",
        heading: "Warum das für Unternehmen zählt",
        paragraphs: [
          "Wenn eine Kategorie ohne eine Marke beantwortet werden kann, findet ein Teil der Kaufvorbereitung ohne diese Marke statt, unbemerkt. Der Absence Index macht diese unsichtbare Lücke besprechbar und priorisierbar.",
        ],
      },
    ],
    disclaimer:
      "Hinweis: Die konkrete Ausprägung variiert je nach Branche, Sprache, Suchsystem und Prompt-Set. Der Absence Index ist ein internes Beobachtungsmodell zur Veranschaulichung von Sichtbarkeitslücken und ersetzt keine repräsentative Studie.",
    faq: [
      { q: "Ist der Absence Index eine wissenschaftliche Studie?", a: "Nein. Er ist ein internes Beobachtungsmodell, das Sichtbarkeitslücken in KI-Antworten veranschaulicht. Die Ergebnisse hängen von Kategorie, Sprache, Suchsystem und Prompt-Set ab." },
      { q: "Woher kommt der Wert von 83%?", a: "Es ist eine intern wiederkehrende Größenordnung aus geprüften Prompt-Sets, kein allgemeingültiger Benchmark. Er illustriert ein Muster, keine feste Zahl." },
      { q: "Kann man den Absence Index für die eigene Marke ermitteln?", a: "Ja, im Rahmen eines KI-Sichtbarkeits-Audits. Wir definieren ein kategorie-spezifisches Prompt-Set und werten Nennung, Zitat und Quellpräsenz aus." },
    ],
    related: [
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
      { label: "Was ist KI-Sichtbarkeit?", href: "/insights/was-ist-ki-sichtbarkeit" },
      { label: "ChatGPT-Sichtbarkeit", href: "/chatgpt-sichtbarkeit" },
      { label: "Alle Insights", href: "/insights" },
    ],
    crumbs: [
      { name: "Start", path: "/" },
      { name: "Research", path: "/research/absence-index" },
      { name: "Absence Index", path: "/research/absence-index" },
    ],
    meta: {
      title: "Absence Index: Methodik der KI-Sichtbarkeitslücke | SEESZN",
      description: "Der Absence Index von SEESZN: ein Beobachtungsmodell, das misst, wie oft eine Kategorie ohne die führenden Marken beantwortet wird. Methodik, Beispiele und Grenzen.",
    },
  },
};

export const ARTICLE_SLUGS = Object.keys(ARTICLES);
