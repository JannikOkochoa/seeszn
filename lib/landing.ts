// ─── German commercial landing-page content ─────────────────────────────────
// Each entry drives one /<slug> page through the shared LandingPage template.
// Tone: deutsch, scharf, premium, sachlich. Keine Hype-Sprache, keine erfundenen Zahlen.

export interface FaqItem {
  q: string;
  a: string;
}

export interface ProcessStep {
  name: string;
  desc: string;
}

export interface RelatedLink {
  label: string;
  href: string;
}

export interface LandingPage {
  slug: string; // path segment under /de
  keyword: string; // target keyword (internal note)
  kicker: string; // small label above H1
  h1: string;
  lead: string; // hero subline
  /** Short, quotable definition block placed directly under the hero — for AI answers. */
  answer: { question: string; body: string };
  forWhom: { intro: string; items: string[] };
  problem: { headline: string; body: string[] };
  whatWeDo: { intro: string; items: { name: string; desc: string }[] };
  process: ProcessStep[];
  faq: FaqItem[];
  related: RelatedLink[];
  meta: { title: string; description: string };
  serviceType: string;
}

const DIAGNOSIS = "/diagnosis";

export const LANDING_PAGES: Record<string, LandingPage> = {
  // ───────────────────────────────────────────────────────────────────────────
  "ki-sichtbarkeit-agentur": {
    slug: "ki-sichtbarkeit-agentur",
    keyword: "KI Sichtbarkeit Agentur",
    kicker: "KI-SICHTBARKEIT",
    h1: "KI-Sichtbarkeit Agentur für B2B-Marken — sichtbar in der Suche, zitiert in der Antwort",
    lead: "SEESZN baut Websites, Inhalte und Sucharchitekturen, die von Suchmaschinen verstanden, von KI-Systemen als Quelle abgerufen und von Entscheidern als glaubwürdig gelesen werden.",
    answer: {
      question: "Was macht eine KI-Sichtbarkeit Agentur?",
      body: "Eine KI-Sichtbarkeit Agentur sorgt dafür, dass eine Marke nicht nur in klassischen Suchergebnissen rankt, sondern auch in KI-gestützten Antworten erscheint — in ChatGPT, Perplexity, Gemini und Google AI Overviews. SEESZN verbindet dafür SEO, GEO und AIO zu einem System: technische Sucharchitektur, zitierfähige Inhalte und konsistente Entitäts- und Quellsignale.",
    },
    forWhom: {
      intro: "Für B2B-Marken, die in Suche und KI-Antworten bestehen müssen:",
      items: [
        "B2B-Unternehmen mit komplexen Angeboten, die erklärt und belegt werden müssen",
        "Hidden Champions und Industriemarken mit substanziellem Angebot und schwacher digitaler Quelle",
        "Agenturen und Beratungen, die selbst als zitierte Autorität gelten wollen",
        "Marken, die ranken — und in KI-Antworten trotzdem nicht auftauchen",
      ],
    },
    problem: {
      headline: "Deine Marke rankt vielleicht. Aber wird sie auch zitiert?",
      body: [
        "Viele Unternehmen sind indexiert, aber nicht abrufbar. Sie erscheinen in klassischen Suchergebnissen — und verschwinden trotzdem aus KI-Antworten, Vergleichs-Prompts und Empfehlungsfragen.",
        "Klassisches Ranking ist nur noch ein Teil der Sichtbarkeit. KI-Systeme setzen Antworten aus Quellen zusammen, denen sie vertrauen. Wer dort nicht klar, strukturiert und belegbar auftaucht, wird nicht zitiert — egal wie gut das Angebot ist.",
      ],
    },
    whatWeDo: {
      intro: "Wir arbeiten an den Stellen, an denen Sichtbarkeit heute entsteht:",
      items: [
        { name: "KI-Sichtbarkeits-Audit", desc: "Wir messen, wo deine Marke in Google und KI-Systemen erscheint — und wo sie fehlt." },
        { name: "SEO-Architektur", desc: "Technische Grundlage, Sucharchitektur, interne Verlinkung und Content-Systeme, die Maschinen verstehen." },
        { name: "GEO / AIO Content-System", desc: "Inhalte, die in Chunks zitierbar sind und von KI-Systemen als Quelle abgerufen werden." },
        { name: "Website-Relaunch & Conversion Surface", desc: "Eine schnelle, editoriale Oberfläche, die Maschinen parsen und Menschen vertrauen." },
        { name: "Citation & Entity Building", desc: "Konsistente Entität und belastbare Quellsignale, damit Erwähnungen zu Wissen werden." },
      ],
    },
    process: [
      { name: "Audit", desc: "Wir lokalisieren, wo Sichtbarkeit bricht — über Suche, KI-Retrieval, Website und Vertrauenssignale." },
      { name: "Architektur", desc: "Wir strukturieren Entitäten, Seiten und Pfade so, dass sie abrufbar werden." },
      { name: "Content", desc: "Wir bauen zitierfähige Inhalte: Definitionen, Vergleiche, Belege — als eigenständige Passagen." },
      { name: "Website", desc: "Wir setzen die Oberfläche um: schnell, strukturiert, conversion-ready." },
      { name: "Monitoring", desc: "Wir beobachten Antworten, Citations und Conversion und korrigieren das System." },
    ],
    faq: [
      { q: "Was ist KI-Sichtbarkeit?", a: "KI-Sichtbarkeit beschreibt, ob und wie eine Marke in KI-gestützten Antworten erscheint — etwa in ChatGPT, Perplexity, Gemini oder Google AI Overviews. Sie ergänzt klassisches Suchmaschinen-Ranking um die Frage, ob KI-Systeme eine Marke als Quelle abrufen und zitieren." },
      { q: "Was kostet die Zusammenarbeit mit einer KI-Sichtbarkeit Agentur?", a: "Das hängt von Ausgangslage und Umfang ab. Der Einstieg ist immer das Audit — es macht die Lücken sichtbar und den Umfang ableitbar. Ohne Diagnose ist jede Preisangabe geraten." },
      { q: "Wie lange dauert es, bis KI-Sichtbarkeit entsteht?", a: "Technische Korrekturen wirken schnell, der Aufbau von Quell- und Entitätssignalen braucht Wochen bis Monate. KI-Sichtbarkeit ist kein Schalter, sondern ein aufgebauter Zustand. Die konkrete Dauer variiert je nach Branche, Sprache und Wettbewerb." },
      { q: "Worin unterscheidet sich SEESZN von einer klassischen SEO-Agentur?", a: "Klassisches SEO optimiert auf Rankings und Traffic. SEESZN optimiert zusätzlich auf Abrufbarkeit und Zitierbarkeit in KI-Systemen — Entitäten, Quellsignale und chunk-fähige Inhalte. SEO, GEO und AIO werden als ein System behandelt." },
    ],
    related: [
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
      { label: "Was ist KI-Sichtbarkeit? — Grundlagen", href: "/insights/was-ist-ki-sichtbarkeit" },
      { label: "GEO Agentur — Generative Engine Optimization", href: "/geo-agentur" },
      { label: "Cases ansehen", href: "/work" },
    ],
    meta: {
      title: "KI-Sichtbarkeit Agentur für B2B-Marken | SEESZN",
      description: "SEESZN ist die KI-Sichtbarkeit Agentur für B2B-Marken: sichtbar in Google, ChatGPT, Perplexity, Gemini und AI Overviews. SEO, GEO, AIO und Audits aus einem System.",
    },
    serviceType: "KI-Sichtbarkeit / AI Visibility",
  },

  // ───────────────────────────────────────────────────────────────────────────
  "geo-agentur": {
    slug: "geo-agentur",
    keyword: "GEO Agentur",
    kicker: "GEO — GENERATIVE ENGINE OPTIMIZATION",
    h1: "GEO Agentur — Generative Engine Optimization: zur zitierten Quelle werden, nicht zum Treffer in einer Linkliste",
    lead: "GEO macht deine Marke zur Quelle, aus der generative Suchsysteme ihre Antworten bauen — nicht zum Treffer, der unter der Antwort verschwindet.",
    answer: {
      question: "Was ist GEO (Generative Engine Optimization)?",
      body: "Generative Engine Optimization (GEO) ist die Optimierung von Inhalten und Quellsignalen für generative Suchsysteme wie ChatGPT, Perplexity, Gemini und Google AI Overviews. Während klassisches SEO auf Ranking-Positionen zielt, zielt GEO darauf, von KI-Systemen abgerufen, vertraut und in der generierten Antwort zitiert zu werden.",
    },
    forWhom: {
      intro: "GEO ist relevant, wenn Kaufentscheidungen zunehmend in KI-Antworten vorbereitet werden:",
      items: [
        "B2B-Marken in erklärungsbedürftigen Kategorien",
        "Unternehmen, deren Zielgruppe Vergleiche und Empfehlungen über KI-Tools recherchiert",
        "Marken, die in 'beste Anbieter für …'-Prompts auftauchen sollten",
        "Agenturen und Expertenmarken, die als zitierte Autorität gelten wollen",
      ],
    },
    problem: {
      headline: "Eine Frage wird zu dreißig Suchen.",
      body: [
        "Generative Systeme zerlegen einen Prompt in einen Fächer aus Sub-Queries — Vergleiche, Alternativen, Preise, Bewertungen. Jeder Pfad wird aus eigenen Quellen beantwortet und zu einer Antwort zusammengesetzt.",
        "Eine Marke kann die sichtbare Suchanfrage dominieren und im Fächer, der die Antwort tatsächlich speist, vollständig fehlen. GEO arbeitet an genau diesem Fächer.",
      ],
    },
    whatWeDo: {
      intro: "GEO-Arbeit, konkret:",
      items: [
        { name: "Query-Fan-out-Mapping", desc: "Wir kartieren die versteckten Suchpfade deiner Kategorie, bevor Inhalte entstehen." },
        { name: "Citation Surfaces", desc: "Wir bauen Seiten, die als Quelle zitierfähig sind: dicht, strukturiert, eigenständig." },
        { name: "Entity-dichter Content", desc: "Inhalte, die klar machen, wer du bist, was du tust und warum das belegbar ist." },
        { name: "Source Gap Analysis", desc: "Wir finden die Oberflächen, denen Modelle bereits vertrauen — und schließen die Lücke." },
        { name: "Strukturierte Daten", desc: "Schema als Grammatik: Markup folgt der Evidenz, nie umgekehrt." },
      ],
    },
    process: [
      { name: "Fan-out kartieren", desc: "Welche Sub-Queries speisen die Antworten in deiner Kategorie?" },
      { name: "Quell-Lücken finden", desc: "Welche Oberflächen werden zitiert — und wo fehlst du?" },
      { name: "Quellenflächen bauen", desc: "Wir schreiben in Chunks: ein Claim, eine Passage, zitierbar ohne ihre Seite." },
      { name: "Entität festigen", desc: "Konsistente Benennung und Korroboration über alle relevanten Profile." },
      { name: "Beobachten", desc: "Wir prüfen, ob und wo du in Antworten auftauchst, und justieren nach." },
    ],
    faq: [
      { q: "Was bedeutet GEO?", a: "GEO steht für Generative Engine Optimization — die Optimierung dafür, von generativen KI-Suchsystemen als Quelle abgerufen und zitiert zu werden, statt nur in klassischen Ergebnislisten zu ranken." },
      { q: "Was ist der Unterschied zwischen SEO und GEO?", a: "SEO optimiert für Ranking-Positionen in Suchmaschinen. GEO optimiert für Zitierbarkeit in generierten Antworten. SEO fragt: Werde ich gerankt? GEO fragt: Werde ich als Quelle verwendet? Beide ergänzen sich." },
      { q: "Wie wählen KI-Systeme aus, welche Quellen sie zitieren?", a: "Vereinfacht: Sie bevorzugen Inhalte, die strukturiert, eigenständig zitierbar und durch konsistente Signale belegbar sind. Eine Definition, die für sich steht, ein Vergleich ohne nötigen Kontext — solche Passagen werden eher ausgewählt als lange, undifferenzierte Prosa." },
      { q: "Kann man GEO messen?", a: "Teilweise. Man kann prüfen, ob und wie eine Marke in den Antworten relevanter Prompt-Sets erscheint und welche Quellen zitiert werden. Die konkrete Ausprägung variiert je nach Branche, Sprache, Suchsystem und Prompt-Set." },
    ],
    related: [
      { label: "Was ist GEO? — ausführliche Erklärung", href: "/insights/was-ist-geo" },
      { label: "SEO vs. GEO vs. AIO im Vergleich", href: "/insights/seo-vs-geo-vs-aio" },
      { label: "AIO Optimierung für AI Overviews", href: "/aio-optimierung" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    meta: {
      title: "GEO Agentur — Generative Engine Optimization | SEESZN",
      description: "GEO Agentur für B2B: SEESZN macht Marken zur zitierten Quelle in ChatGPT, Perplexity, Gemini und AI Overviews. Generative Engine Optimization aus einem System.",
    },
    serviceType: "Generative Engine Optimization (GEO)",
  },

  // ───────────────────────────────────────────────────────────────────────────
  "aio-optimierung": {
    slug: "aio-optimierung",
    keyword: "AIO Optimierung / AI Overview Optimierung",
    kicker: "AIO — AI OVERVIEW OPTIMIZATION",
    h1: "AIO Optimierung — in der Antwort zitiert werden, nicht nur darunter verlinkt sein",
    lead: "AIO bereitet Inhalte so auf, dass sie in KI-Antwortflächen erscheinen — dort, wo Kaufentscheidungen heute beginnen, bevor der erste Klick passiert.",
    answer: {
      question: "Was ist AIO (AI Overview Optimization)?",
      body: "AIO (AI Overview Optimization) ist die Optimierung von Inhalten für KI-generierte Antwortflächen — allen voran Google AI Overviews, aber auch vergleichbare Antwortmodule in anderen Suchsystemen. Ziel ist, dass eine Marke in der zusammengefassten KI-Antwort als Quelle erscheint, statt nur unterhalb davon verlinkt zu werden.",
    },
    forWhom: {
      intro: "Für Marken, deren Suchanfragen zunehmend mit AI Overviews beantwortet werden:",
      items: [
        "Marken in informationsgetriebenen Kategorien (Erklärung, Vergleich, Ratgeber)",
        "B2B-Unternehmen, deren Buyer-Journey mit Recherche beginnt",
        "Anbieter, die unter AI Overviews an Klicks verlieren",
        "Marken, die in der Antwort selbst genannt werden wollen, nicht nur darunter",
      ],
    },
    problem: {
      headline: "Die Antwort steht jetzt über dem Ergebnis.",
      body: [
        "AI Overviews fassen mehrere Quellen zu einer Antwort zusammen. Wer dort nicht als Quelle auftaucht, verliert Sichtbarkeit — auch bei guten klassischen Rankings.",
        "Maschinen zitieren Absätze, nicht Seiten. Retrieval passiert auf Chunk-Ebene. Die meisten Seiten lassen sich nicht in vierzig Worten zitieren — und werden deshalb übersprungen.",
      ],
    },
    whatWeDo: {
      intro: "AIO-Arbeit, konkret:",
      items: [
        { name: "Chunk-fähige Inhalte", desc: "Wir schreiben Passagen, die eigenständig zitierbar sind — eine Definition, ein Vergleich, ein Beleg." },
        { name: "Antwortblöcke", desc: "Kurze, direkte Antworten unter klaren Fragen, die Antwortflächen direkt übernehmen können." },
        { name: "Strukturierte Daten", desc: "FAQ-, Article- und Organisations-Schema, damit Aussagen maschinenlesbar werden." },
        { name: "Evidenz-Design", desc: "Belege, Definitionen und Vergleiche so platziert, dass sie als Quelle taugen." },
        { name: "Technische Abrufbarkeit", desc: "Crawlbarkeit, Geschwindigkeit und saubere Semantik als Voraussetzung." },
      ],
    },
    process: [
      { name: "Prompt-Set definieren", desc: "Welche Fragen lösen in deiner Kategorie AI Overviews aus?" },
      { name: "Lücken prüfen", desc: "Wo erscheinst du nicht in der Antwort, obwohl du es solltest?" },
      { name: "Antwortblöcke bauen", desc: "Konzise, belegte Passagen unter klaren Fragen." },
      { name: "Schema ergänzen", desc: "Struktur folgt Evidenz — Markup macht Aussagen lesbar." },
      { name: "Beobachten", desc: "Wir verfolgen, ob du in Antwortflächen auftauchst, und justieren nach." },
    ],
    faq: [
      { q: "Was ist AIO?", a: "AIO steht für AI Overview Optimization: die Optimierung von Inhalten dafür, in KI-generierten Antwortflächen wie Google AI Overviews als Quelle zu erscheinen." },
      { q: "Wie optimiert man für Google AI Overviews?", a: "Durch eigenständig zitierbare Passagen, klare Antwortblöcke unter konkreten Fragen, saubere Semantik, strukturierte Daten und belegbare Aussagen. Entscheidend ist Abrufbarkeit auf Chunk-Ebene, nicht reine Seitenlänge." },
      { q: "Was ist der Unterschied zwischen AIO und GEO?", a: "AIO fokussiert speziell auf KI-Antwortflächen in der Suche (v. a. Google AI Overviews). GEO ist breiter und umfasst alle generativen Suchsysteme inklusive ChatGPT und Perplexity. In der Praxis überschneiden sich beide stark." },
      { q: "Verliert man durch AI Overviews Traffic?", a: "Das kann passieren, wenn die Antwort den Klick ersetzt und die Marke nicht als Quelle genannt wird. Genau deshalb verschiebt AIO das Ziel von 'oben ranken' zu 'in der Antwort zitiert werden'." },
    ],
    related: [
      { label: "Was ist AIO? — Grundlagen", href: "/insights/was-ist-aio" },
      { label: "SEO vs. GEO vs. AIO im Vergleich", href: "/insights/seo-vs-geo-vs-aio" },
      { label: "GEO Agentur", href: "/geo-agentur" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    meta: {
      title: "AIO Optimierung für Google AI Overviews | SEESZN",
      description: "AIO Optimierung: SEESZN macht B2B-Marken in Google AI Overviews und KI-Antwortflächen sichtbar — über chunk-fähige Inhalte, Antwortblöcke und strukturierte Daten.",
    },
    serviceType: "AI Overview Optimization (AIO)",
  },

  // ───────────────────────────────────────────────────────────────────────────
  "chatgpt-sichtbarkeit": {
    slug: "chatgpt-sichtbarkeit",
    keyword: "ChatGPT Sichtbarkeit",
    kicker: "CHATGPT-SICHTBARKEIT",
    h1: "ChatGPT-Sichtbarkeit: von KI-Assistenten genannt, verstanden und empfohlen werden",
    lead: "Wenn Menschen ChatGPT nach Anbietern, Lösungen und Vergleichen fragen, entscheidet die Quellenlage, ob deine Marke vorkommt.",
    answer: {
      question: "Wie wird eine Marke in ChatGPT sichtbar?",
      body: "Eine Marke wird in ChatGPT-ähnlichen Systemen sichtbar, wenn sie als klare, konsistente und belegbare Entität existiert und auf Oberflächen vorkommt, die das System abruft oder gelernt hat. Bei Systemen mit Live-Suche (ChatGPT Search) zählt zusätzlich, ob die Inhalte zitierfähig und aktuell abrufbar sind. SEESZN arbeitet an beidem: Entitätsklarheit und zitierfähigen Quellenflächen.",
    },
    forWhom: {
      intro: "Relevant, wenn deine Zielgruppe KI-Assistenten zur Recherche nutzt:",
      items: [
        "B2B-Marken, nach denen in Vergleichs- und Empfehlungs-Prompts gefragt wird",
        "Anbieter, die in 'Welche Agentur / welches Tool für …' genannt werden wollen",
        "Marken mit gutem Ruf, der aber im KI-Wissen nicht ankommt",
        "Unternehmen, die kontrollieren wollen, wie KI über sie spricht",
      ],
    },
    problem: {
      headline: "Wenn das Modell nicht auflösen kann, wer du bist, kann es dich nicht empfehlen.",
      body: [
        "KI-Modelle bauen Entitäts-Datensätze aus korroborierenden Quellen: konsistente Benennung, eine kanonische Beschreibung, ausgerichtete Profile, Drittbestätigung.",
        "Inkonsistente Benennung und dünne Korroboration spalten eine Marke in Fragmente, die zu schwach zum Zitieren sind. Erwähnungen akkumulieren dann in der Kategorie — nicht bei dir.",
      ],
    },
    whatWeDo: {
      intro: "Was wir aufbauen:",
      items: [
        { name: "Entity Building", desc: "Eine kanonische Beschreibung, konsistent über alle relevanten Profile und Erwähnungen." },
        { name: "Citation Surfaces", desc: "Zitierfähige Seiten, die Live-Suchsysteme abrufen und referenzieren können." },
        { name: "Quell-Präsenz", desc: "Präsenz auf den Aggregations- und Vergleichsoberflächen, denen Modelle vertrauen." },
        { name: "Konsistenzprüfung", desc: "Wir beseitigen widersprüchliche Angaben, die Modelle verwirren." },
        { name: "Monitoring", desc: "Wir prüfen, wie KI-Assistenten deine Marke beschreiben und wo Lücken bleiben." },
      ],
    },
    process: [
      { name: "Prompt-Test", desc: "Wie beschreiben und empfehlen KI-Assistenten dich heute — wenn überhaupt?" },
      { name: "Entitäts-Audit", desc: "Wo ist deine Beschreibung inkonsistent oder dünn korroboriert?" },
      { name: "Kanonischer Datensatz", desc: "Eine klare Beschreibung, überall ausgerichtet." },
      { name: "Quellenflächen", desc: "Zitierfähige Inhalte und Präsenz auf vertrauten Oberflächen." },
      { name: "Nachprüfen", desc: "Erneuter Prompt-Test und laufende Beobachtung." },
    ],
    faq: [
      { q: "Kann man ChatGPT-Sichtbarkeit messen?", a: "Teilweise. Man kann ein definiertes Prompt-Set wiederholt stellen und auswerten, ob, wie und mit welchen Quellen eine Marke genannt wird. Die Ergebnisse variieren je nach Modellversion, Prompt und ob Live-Suche aktiv ist." },
      { q: "Kann man garantieren, dass ChatGPT eine Marke empfiehlt?", a: "Nein. Niemand kontrolliert, in welcher Antwort eine Marke erscheint. Seriös ist: die Voraussetzungen verbessern — Entitätsklarheit, Quellsignale, zitierfähige Inhalte. Wir bauen den Zustand, nicht den Trick." },
      { q: "Was ist der Unterschied zwischen ChatGPT-Wissen und ChatGPT Search?", a: "Das trainierte Wissen stammt aus Daten bis zu einem Stichtag. ChatGPT Search ruft zusätzlich live Quellen ab und zitiert sie. Für beide Wege zählt eine klare Entität; für Search zusätzlich aktuelle, abrufbare und zitierfähige Inhalte." },
      { q: "Wie lange dauert es, in ChatGPT sichtbarer zu werden?", a: "Das hängt davon ab, wie oft Quellen aktualisiert oder neu erfasst werden und wie konsistent die Entität aufgebaut wird. Es ist ein aufgebauter Zustand, kein Schalter — die Dauer variiert je nach Ausgangslage." },
    ],
    related: [
      { label: "Was ist KI-Sichtbarkeit?", href: "/insights/was-ist-ki-sichtbarkeit" },
      { label: "GEO Agentur — Generative Engine Optimization", href: "/geo-agentur" },
      { label: "Absence Index — wo Marken aus Antworten verschwinden", href: "/research/absence-index" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    meta: {
      title: "ChatGPT-Sichtbarkeit für Marken | SEESZN",
      description: "ChatGPT-Sichtbarkeit: SEESZN baut Entitätsklarheit und zitierfähige Quellenflächen, damit KI-Assistenten deine Marke nennen, verstehen und empfehlen können.",
    },
    serviceType: "ChatGPT / AI Assistant Visibility",
  },

  // ───────────────────────────────────────────────────────────────────────────
  "seo-agentur-bremen": {
    slug: "seo-agentur-bremen",
    keyword: "SEO Agentur Bremen",
    kicker: "SEO — BREMEN & DACH",
    h1: "SEO Agentur aus Bremen für B2B-Marken im DACH-Raum",
    lead: "SEESZN verbindet klassische SEO-Architektur mit KI-Sichtbarkeit — für Unternehmen in Bremen und dem gesamten deutschsprachigen Raum.",
    answer: {
      question: "Was bietet SEESZN als SEO-Studio mit Bezug zu Bremen?",
      body: "SEESZN ist ein Sichtbarkeitsstudio mit Bezug zu Bremen und Projekten im gesamten DACH-Raum. Wir verbinden technische SEO, Content-Architektur und KI-Sichtbarkeit (GEO/AIO) zu einem System. Die Arbeit ist nicht auf einen Standort beschränkt — wir betreuen B2B-Marken remote und vor Ort.",
    },
    forWhom: {
      intro: "Relevant für:",
      items: [
        "B2B-Unternehmen aus Bremen und dem Nordwesten",
        "Mittelstand und Hidden Champions im DACH-Raum",
        "Lokale Marktführer, die online ihre Stärke abbilden wollen",
        "Unternehmen, die SEO und KI-Sichtbarkeit aus einer Hand wollen",
      ],
    },
    problem: {
      headline: "Lokale Stärke, digitale Lücke.",
      body: [
        "Viele etablierte Unternehmen sind in ihrer Region führend — und online schwer auffindbar. Die Website bildet die Substanz nicht ab, die Suche findet sie nicht, KI-Systeme kennen sie nicht.",
        "Gute SEO ist Architektur: Struktur, Inhalte und Signale, die Maschinen verstehen und Menschen vertrauen.",
      ],
    },
    whatWeDo: {
      intro: "Was wir aufbauen:",
      items: [
        { name: "Technical SEO", desc: "Saubere Struktur, Indexierbarkeit, Geschwindigkeit und Semantik als Fundament." },
        { name: "Sucharchitektur", desc: "Seiten und interne Verlinkung, die Suchintention abdecken." },
        { name: "Content-Systeme", desc: "Inhalte, die Fragen beantworten, statt Keywords zu wiederholen." },
        { name: "KI-Sichtbarkeit", desc: "GEO/AIO ergänzt klassisches SEO um Abrufbarkeit in KI-Antworten." },
        { name: "Website & Conversion", desc: "Eine Oberfläche, die rankt und verkauft." },
      ],
    },
    process: [
      { name: "Audit", desc: "Wir prüfen Technik, Struktur, Inhalte und KI-Sichtbarkeit." },
      { name: "Architektur", desc: "Wir planen Seiten, Themen und interne Verlinkung." },
      { name: "Umsetzung", desc: "Wir bauen Inhalte und Oberfläche, sauber und schnell." },
      { name: "Betreuung", desc: "Laufende SEO- und KI-Sichtbarkeits-Pflege." },
    ],
    faq: [
      { q: "Arbeitet SEESZN nur mit Unternehmen aus Bremen?", a: "Nein. SEESZN hat Bezug zu Bremen, arbeitet aber im gesamten DACH-Raum — remote und projektbezogen vor Ort. Standort ist kein limitierender Faktor." },
      { q: "Was unterscheidet SEESZN von klassischen SEO-Agenturen?", a: "Wir behandeln SEO, GEO und AIO als ein System. Neben Rankings arbeiten wir an Zitierbarkeit in KI-Antworten — ein Bereich, den viele klassische Agenturen noch nicht abdecken." },
      { q: "Lohnt sich SEO für B2B und Mittelstand?", a: "Ja, gerade dort. In erklärungsbedürftigen B2B-Kategorien recherchieren Käufer ausführlich — über Suche und zunehmend über KI-Assistenten. Wer dort als Quelle auftaucht, gewinnt qualifizierte Anfragen." },
      { q: "Wie startet die Zusammenarbeit?", a: "Mit einem Audit. Wir kartieren, wo Sichtbarkeit bricht, bevor wir bauen. Daraus entsteht eine priorisierte Roadmap." },
    ],
    related: [
      { label: "B2B SEO Agentur — für Hidden Champions", href: "/b2b-seo-agentur" },
      { label: "KI-Sichtbarkeit Agentur", href: "/ki-sichtbarkeit-agentur" },
      { label: "Case: RISCHO (Stahl- & Metallbau, Bremen)", href: "/cases/rischo" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    meta: {
      title: "SEO Agentur Bremen für B2B & DACH | SEESZN",
      description: "SEO Agentur mit Bezug zu Bremen: SEESZN verbindet technische SEO, Content-Architektur und KI-Sichtbarkeit (GEO/AIO) für B2B-Marken im DACH-Raum.",
    },
    serviceType: "SEO / Suchmaschinenoptimierung",
  },

  // ───────────────────────────────────────────────────────────────────────────
  "b2b-seo-agentur": {
    slug: "b2b-seo-agentur",
    keyword: "B2B SEO Agentur",
    kicker: "B2B SEO",
    h1: "B2B SEO Agentur für Hidden Champions, Industrie und expertengeführte Marken",
    lead: "Komplexe Angebote brauchen Inhalte, die Suchmaschinen und KI-Systeme verstehen — und Käufer überzeugen.",
    answer: {
      question: "Was macht eine B2B SEO Agentur anders?",
      body: "Eine B2B SEO Agentur optimiert für lange, beratungsintensive Kaufprozesse statt für schnelle Transaktionen. Im Mittelpunkt stehen Suchintention entlang der Buyer-Journey, erklärende und zitierfähige Inhalte sowie Entitäts- und Quellsignale — heute zunehmend auch für KI-Antworten (GEO/AIO). SEESZN verbindet beides zu einem System.",
    },
    forWhom: {
      intro: "Relevant für:",
      items: [
        "Hidden Champions und Industrieunternehmen",
        "Erklärungsbedürftige Dienstleistungen und Software",
        "Agenturen und Beratungen mit Expertenpositionierung",
        "Marken mit langem Sales-Cycle und mehreren Entscheidern",
      ],
    },
    problem: {
      headline: "Starkes Angebot, schwache Quelle.",
      body: [
        "Viele B2B-Marken haben ein exzellentes Angebot — aber Inhalte, die weder Suchintention abdecken noch zitierfähig sind. Die Substanz steckt im Vertrieb, nicht in abrufbaren Quellen.",
        "Käufer recherchieren heute über Suche und KI-Assistenten, bevor sie Kontakt aufnehmen. Wer in dieser Phase nicht als Quelle auftaucht, kommt im Vergleich nicht vor.",
      ],
    },
    whatWeDo: {
      intro: "B2B-SEO, konkret:",
      items: [
        { name: "Suchintention abbilden", desc: "Wir decken die Fragen entlang der Buyer-Journey ab, nicht nur Top-Keywords." },
        { name: "Erklärende Quellenflächen", desc: "Inhalte, die komplexe Angebote verständlich und zitierfähig machen." },
        { name: "Entity & Authority", desc: "Konsistente Entität und belastbare Signale für Vertrauen." },
        { name: "GEO / AIO", desc: "Abrufbarkeit in KI-Antworten als Teil der B2B-Sichtbarkeit." },
        { name: "Conversion Surface", desc: "Seiten, die qualifizierte Anfragen erzeugen, nicht nur Traffic." },
      ],
    },
    process: [
      { name: "Audit", desc: "Such-, Content- und KI-Sichtbarkeits-Status." },
      { name: "Themen-Architektur", desc: "Topical Authority statt Einzelseiten." },
      { name: "Content-System", desc: "Erklär-, Vergleichs- und Entscheidungsinhalte." },
      { name: "Website", desc: "Schnelle, klare Conversion-Oberfläche." },
      { name: "Betreuung", desc: "Laufende Beobachtung, Justierung und Pflege." },
    ],
    faq: [
      { q: "Für welche Unternehmen eignet sich B2B-SEO?", a: "Besonders für erklärungsbedürftige Angebote mit langem Kaufprozess: Industrie, Software, Beratung, spezialisierte Dienstleistungen. Dort zahlt sich Sichtbarkeit in qualifizierten Anfragen aus." },
      { q: "Wie misst man den Erfolg von B2B-SEO?", a: "Nicht an reinem Traffic, sondern an Sichtbarkeit für kaufnahe Suchintention, qualifizierten Anfragen und Präsenz in relevanten KI-Antworten. Vanity-Metriken sind kein Ziel." },
      { q: "Wie hängt B2B-SEO mit KI-Sichtbarkeit zusammen?", a: "Eng. Dieselbe Substanz, die gute B2B-Inhalte ausmacht — Klarheit, Belege, Struktur — macht sie auch für KI-Systeme abruf- und zitierfähig. SEESZN baut beides zusammen auf." },
      { q: "Was kostet B2B-SEO?", a: "Das ergibt sich aus Audit und Umfang. Der Einstieg ist das Audit — es priorisiert die Hebel, aus denen sich ein belastbarer Umfang ableiten lässt. Ohne Diagnose wäre jede Zahl geraten." },
    ],
    related: [
      { label: "KI-Sichtbarkeit Agentur", href: "/ki-sichtbarkeit-agentur" },
      { label: "SEO Agentur Bremen & DACH", href: "/seo-agentur-bremen" },
      { label: "GEO Agentur", href: "/geo-agentur" },
      { label: "KI-Sichtbarkeits-Audit anfragen", href: "/ki-sichtbarkeits-audit" },
    ],
    meta: {
      title: "B2B SEO Agentur für Hidden Champions | SEESZN",
      description: "B2B SEO Agentur für Industrie, Hidden Champions und expertengeführte Marken: SEESZN verbindet Suchintention, zitierfähige Inhalte und KI-Sichtbarkeit (GEO/AIO).",
    },
    serviceType: "B2B SEO",
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ki-sichtbarkeits-audit": {
    slug: "ki-sichtbarkeits-audit",
    keyword: "KI Sichtbarkeits Audit",
    kicker: "AUDIT — DER EINSTIEG",
    h1: "KI-Sichtbarkeits-Audit: prüfen, wo deine Marke aus Antworten verschwindet",
    lead: "Bevor wir bauen, lokalisieren wir die Lücke. Das Audit zeigt, wo deine Marke in Google und KI-Systemen erscheint — und wo sie fehlt.",
    answer: {
      question: "Was ist ein KI-Sichtbarkeits-Audit?",
      body: "Ein KI-Sichtbarkeits-Audit ist eine strukturierte Analyse, die misst, wie sichtbar und zitierfähig eine Marke in klassischer Suche und in KI-Antwortsystemen ist. Es prüft fünf Ebenen — Crawl, Entität, Citation, Trust und Conversion — und liefert eine klare Karte, wo Sichtbarkeit bricht, plus eine priorisierte Roadmap. Es ist eine Diagnose, kein Pitch.",
    },
    forWhom: {
      intro: "Das Audit ist der richtige Einstieg, wenn:",
      items: [
        "du wissen willst, ob KI-Systeme deine Marke kennen und nennen",
        "du in klassischer Suche rankst, aber in KI-Antworten fehlst",
        "vor einem Relaunch Klarheit über die Sichtbarkeits-Lücken nötig ist",
        "du eine fundierte Roadmap statt eines Bauchgefühls willst",
      ],
    },
    problem: {
      headline: "Die meisten Marken wissen nicht, wo sie aus Antworten verschwinden.",
      body: [
        "Sie sehen Rankings — aber nicht die Antwortflächen, die zunehmend über den Ergebnissen stehen und die Kaufvorbereitung übernehmen.",
        "Das Audit macht diese unsichtbare Schicht sichtbar: wo du gelesen, wo zitiert, wo ignoriert wirst — und welche Hebel das am schnellsten ändern.",
      ],
    },
    whatWeDo: {
      intro: "Das Audit liest fünf Ebenen:",
      items: [
        { name: "Crawl", desc: "Können Maschinen deine Struktur durchqueren — Index-Routen, Tiefe, Sackgassen, Waisen?" },
        { name: "Entity", desc: "Weiß die Maschine, wer du bist — kanonischer Datensatz, Benennung, Korroboration?" },
        { name: "Citation", desc: "Zitieren Antworten dich — Fan-out-Abdeckung, Quell-Oberflächen, Lücken?" },
        { name: "Trust", desc: "Liest sich die Oberfläche als glaubwürdig — Geschwindigkeit, Klarheit, Evidenz-Design?" },
        { name: "Conversion", desc: "Wird Abruf zu Umsatz — Antwort-zu-Aktion-Pfad, Landing Evidence?" },
      ],
    },
    process: [
      { name: "Intake", desc: "Du sendest die Oberfläche. Eine E-Mail, eine Domain — das reicht zum Start." },
      { name: "Scan", desc: "Wir lesen sie in Such- und KI-Systemen: Struktur, Entitäten, Citations, Trust, Conversion." },
      { name: "Reading", desc: "Du erhältst die Leak-Map — wo Sichtbarkeit bricht und warum, in klarer Sprache." },
      { name: "Roadmap", desc: "Die wichtigsten Hebel, sequenziert. Ob wir gemeinsam umsetzen, ist eine separate Entscheidung." },
    ],
    faq: [
      { q: "Was kostet ein KI-Sichtbarkeits-Audit?", a: "Der Umfang richtet sich nach Größe und Komplexität der Marke. Der Einstieg ist bewusst niedrigschwellig: eine Domain und eine E-Mail genügen, um zu starten. Den konkreten Rahmen klären wir transparent vor Beginn — ohne versteckte Retainer-Bindung." },
      { q: "Was bekomme ich am Ende?", a: "Eine klare Leak-Map (wo Sichtbarkeit bricht und warum) und eine priorisierte Roadmap der wirksamsten Hebel. Verständlich formuliert — eine Diagnose, kein Pitch-Deck." },
      { q: "Muss ich danach mit SEESZN zusammenarbeiten?", a: "Nein. Das Audit steht für sich. Ob die Umsetzung gemeinsam erfolgt, ist eine separate Entscheidung." },
      { q: "Wie lange dauert das Audit?", a: "In der Regel einige Werktage nach Intake, abhängig von Umfang und Komplexität der Oberfläche." },
    ],
    related: [
      { label: "Diagnose anfragen", href: "/diagnosis" },
      { label: "KI-Sichtbarkeit Agentur", href: "/ki-sichtbarkeit-agentur" },
      { label: "Absence Index — die Methodik", href: "/research/absence-index" },
      { label: "Was ist KI-Sichtbarkeit?", href: "/insights/was-ist-ki-sichtbarkeit" },
    ],
    meta: {
      title: "KI-Sichtbarkeits-Audit — Diagnose statt Pitch | SEESZN",
      description: "KI-Sichtbarkeits-Audit von SEESZN: Wir prüfen über fünf Ebenen, wo deine Marke in Google und KI-Antworten erscheint und wo sie fehlt — mit priorisierter Roadmap.",
    },
    serviceType: "KI-Sichtbarkeits-Audit",
  },
};

export const LANDING_SLUGS = Object.keys(LANDING_PAGES);

// Final-CTA copy shared by landing pages.
export const LANDING_CTA = {
  primary: { label: "KI-Sichtbarkeit prüfen", href: DIAGNOSIS },
  secondary: { label: "Cases ansehen", href: "/work" },
};
