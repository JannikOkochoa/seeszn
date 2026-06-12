// ─── German translation dictionary ───────────────────────────────────────────
// Tone: direct, founder-led "du". No corporate speak.
// Keep in English: SEO, AI Search, GEO, AIO, Citations, Content, etc.

import type { Translations } from "./en";

export const de: Translations = {
  locale: "de",

  // ── Navigation ──────────────────────────────────────────────────────────────
  nav: {
    utilityBar: "AI Search Sichtbarkeit für Marken, die gefunden, zitiert und gewählt werden wollen",
    services: "ENTDECKEN",
    work: "UNSERE ARBEIT",
    insights: "INSIGHTS",
    about: "STUDIO",
    cta: "SICHTBARKEIT PRÜFEN",
    servicesTagline: "Wir bauen die Oberflächen, die Maschinen abrufen und Menschen vertrauen.",
    enterOperatingRoom: "SYSTEM ENTDECKEN",
    allServices: "ENTDECKEN",
    servicesDropdown: [
      {
        heading: "SEO",
        href: "/de/services#crawl",
        items: ["Technical SEO", "Content Systems", "Search Architecture", "Analytics"],
      },
      {
        heading: "AI SEARCH",
        href: "/de/services#retrieve",
        items: ["GEO / AIO", "AI Overviews", "Citation Visibility", "Chat Search"],
      },
      {
        heading: "WEBSITES",
        href: "/de/services#trust",
        items: ["Design Systems", "Next.js Development", "Conversion Pages", "Editorial Websites"],
      },
      {
        heading: "AUDITS",
        href: "/de/services#diagnose",
        items: ["Search Diagnose", "AI Visibility Audit", "Website Review", "Growth Roadmap"],
      },
    ],
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: {
    line1: "Die KI kennt",
    line2: "deine Marke",
    italic: "nicht.",
    sub: "WIR BRINGEN DEINE MARKE\nIN DIE MODELLE.",
    cta: "SICHTBARKEIT PRÜFEN",
  },

  // ── TheShift ────────────────────────────────────────────────────────────────
  theShift: {
    headline: "SUCHE WAR EINMAL EINE SEITE.\nJETZT IST SIE EINE ANTWORT.\nANTWORTEN BRAUCHEN QUELLEN.",
    cta: "DIE VERSCHIEBUNG →",
    points: [
      { year: "2000", label: "Rankings" },
      { year: "2010", label: "Traffic" },
      { year: "2020", label: "Attention" },
      { year: "2024+", label: "AI Answers" },
    ],
  },

  // ── Homepage services accordion ─────────────────────────────────────────────
  homepageServices: {
    sectionLabel: "WAS WIR BAUEN",
    rows: [
      {
        num: "01",
        name: "PRÄSENZ",
        sub: "Erscheine, wo die relevante Suche sich hin bewegt.",
        detail:
          "Wir strukturieren Content, Entity-Daten und Autoritätssignale so, dass deine Marke in dem Moment auftaucht, wenn ein Nutzer oder eine KI eine Frage formuliert — noch bevor sie ausgesprochen ist.",
      },
      {
        num: "02",
        name: "QUELLEN",
        sub: "Werde das Material, aus dem Maschinen zitieren.",
        detail:
          "KI-Systeme zitieren Quellen. Wir entwickeln deine Marke zur zitierten Quelle — durch strukturierte Daten, autoritative Content-Architektur und konsistente Signale auf allen Plattformen.",
      },
      {
        num: "03",
        name: "CITATIONS",
        sub: "Mach aus Erwähnungen dauerhaftes Wissen.",
        detail:
          "Erwähnt zu werden reicht nicht. Wir wandeln Markennennungen in belastbare Citations um, die KI-Modelle als verifizierbares Wissen behandeln — von Rauschen zu Datensatz.",
      },
      {
        num: "04",
        name: "TIMING",
        sub: "Tritt ein, bevor die Kategorie sich festigt.",
        detail:
          "Die Marken, die KI-Antworten dominieren, haben früh das Maschinengedächtnis besetzt. Wir identifizieren dein Fenster und handeln, bevor deine Mitbewerber es schließen.",
      },
    ],
  },

  // ── AbsenceIndex ────────────────────────────────────────────────────────────
  absenceIndex: {
    chip: "THE ABSENCE INDEX",
    headlineRoman: "Abwesenheit",
    headlineItalic: "ist messbar.",
    stat: "83%",
    copy: "ALLER DEFINIERTEN PROMPTS EINER KATEGORIE\nKÖNNEN OHNE DIE MARKEN BEANTWORTET WERDEN,\nDIE GLAUBEN, SIE BESITZEN DIE KATEGORIE.",
    cta: "DATEN ANSEHEN →",
  },

  // ── Cases ───────────────────────────────────────────────────────────────────
  cases: {
    chip: "AUSGEWÄHLTE NACHWEISE",
    viewAll: "ALLE FÄLLE",
    cards: [
      { index: "01", sector: "METALL & STAHL", headline: "Handwerk bekannt.\nModelle blind.", trace: "RISCHO GMBH" },
      { index: "02", sector: "IMMOBILIEN", headline: "Quartiere gebaut.\nModelle leer.", trace: "SIVIUS GROUP" },
      { index: "03", sector: "CONTENT MARKETING", headline: "Content produziert.\nNicht zitiert.", trace: "CONTENTKUECHE" },
    ],
  },

  // ── Manifesto ───────────────────────────────────────────────────────────────
  manifesto: {
    sectionLabel: "UNSER MANIFEST",
    headlinePart1: "WENN DAS MODELL",
    headlinePart2: "DICH NICHT ",
    headlineCiteWord: "ZITIEREN",
    headlinePart3: " KANN,",
    headlinePart4: "EXISTIERST DU NICHT.",
    readMore: "MEHR LESEN →",
    contrasts: [
      { left: "NOT RANKINGS", right: "RETRIEVAL" },
      { left: "NOT TRAFFIC",  right: "PRESENCE" },
      { left: "NOT CONTENT",  right: "CITATIONS" },
      { left: "NOT REACH",    right: "AUTHORITY" },
    ],
  },

  // ── Contact ─────────────────────────────────────────────────────────────────
  contact: {
    headlineRoman: "Du wirst nicht gefunden?",
    headlineItalic: "Wir prüfen das für dich.",
    sub: "Wir kartieren deine Sichtbarkeit auf Google\nund allen wichtigen KI-Plattformen, bevor\nwir über eine Zusammenarbeit sprechen.",
    successMessage: "Diagnose angefordert. Wir melden uns.",
    placeholder: "deine@email.de",
    buttonIdle: "SICHTBARKEIT PRÜFEN",
    buttonLoading: "...",
    errorMessage: "Etwas ist schiefgelaufen. Schreib uns direkt an hello@seeszn.com",
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    tagline: "Wir bauen die Oberflächen, die Maschinen abrufen und Menschen vertrauen.",
    email: "HELLO@SEESZN.COM",
    cta: "SICHTBARKEIT PRÜFEN",
    nav: [
      { name: "ENTDECKEN", href: "/de/services" },
      { name: "ARBEIT",    href: "/de/work" },
      { name: "INSIGHTS",  href: "/de/insights" },
      { name: "STUDIO",    href: "/de/about" },
    ],
    legal: [
      { name: "Rechtliches", href: "/de/legal" },
      { name: "Datenschutz", href: "/de/privacy" },
      { name: "Kontakt",     href: "/de/diagnosis" },
      { name: "KI-Sichtbarkeits-Brief", href: "/brief/ki-sichtbarkeit" },
    ],
    copy: "© 2026 Okri Holdings LLC",
  },

  // ── Services page ────────────────────────────────────────────────────────────
  servicesPage: {
    hero: {
      roomLabel: "ENTDECKEN",
      roman1: "Sichtbarkeitssysteme",
      roman2: "für Marken, die in",
      italic: "Machine Memory eintreten.",
      sub1: "SEESZN BAUT OBERFLÄCHEN, DIE MASCHINEN ABRUFEN UND MENSCHEN VERTRAUEN.",
      sub2: "SEARCH, AI VISIBILITY, WEBSITES UND DIAGNOSE — VERBUNDEN ZU EINEM SYSTEM.",
      cta: "SICHTBARKEIT PRÜFEN",
      secondary: "DAS SYSTEM SEHEN",
      imageCaption: "VISIBILITY OPERATING SYSTEM",
    },
    system: {
      sectionLabel: "DAS SYSTEM",
      headline: "Kein Service-Menü.",
      headlineItalic: "Ein Sichtbarkeitssystem.",
      copy1: "Struktur macht dich lesbar. Retrieval macht dich abrufbar. Oberflächen machen dich vertrauenswürdig. Diagnose zeigt, wo es bricht.",
      copy2: "SEESZN VERBINDET ALLE VIER ZU EINEM OPERATING SYSTEM — GEBAUT FÜR WIE SICHTBARKEIT HEUTE FUNKTIONIERT.",
      ticks: ["STRUKTUR", "RETRIEVAL", "OBERFLÄCHE", "DIAGNOSE"],
    },
    imageWorld: {
      sectionLabel: "DIE SURFACE-WELT",
      panels: [
        { num: "01", caption: "VISIBLE SURFACE", body: "Was Menschen zuerst sehen." },
        { num: "02", caption: "MACHINE MEMORY", body: "Was Systeme später abrufen." },
        { num: "03", caption: "SOURCE SIGNAL", body: "Wo Vertrauen zu Evidenz wird." },
      ],
    },
    machineMemory: {
      sectionLabel: "MACHINE MEMORY",
      headline: "Eine Frage",
      headlineItalic: "wird zu dreißig Suchen.",
      copy: "AI Search zerlegt eine einzelne Frage in verdeckte Pfade — Kontext, Quellen, Vergleiche, Beweise. Jeder Pfad wird von einer anderen Oberfläche beantwortet. Marken, die nur auf der sichtbaren Suchanfrage existieren, verschwinden aus der Antwort.",
      input: "FRAGE",
      fragments: ["KONTEXT", "QUELLE", "VERGLEICH", "BEWEIS", "VERTRAUEN"],
      output: "ANSWER SURFACE",
      footnote: "DIE OBERFLÄCHEN, DIE DIE ANTWORT SPEISEN, SIND DIE, DIE WIR BAUEN.",
    },
    scan: {
      sectionLabel: "DER SCAN",
      headlineRoman: "Bevor wir bauen,",
      headlineItalic: "lokalisieren wir die Lücke.",
      copy: "Wir kartieren, wo deine Sichtbarkeit bricht — über Suchstruktur, AI Retrieval, Website-Oberflächen und Vertrauenssignale. Dann wird der Scan zur Roadmap.",
      cta: "SCAN STARTEN",
      panelTitle: "SPECIMEN 001 — BRAND SURFACE",
      panelRef: "SZN-DSC-01",
      statusKey: "STATUS",
      statusVal: "TEILWEISE ABRUFBAR",
      readings: ["CRAWL", "RETRIEVAL", "SURFACE", "TRUST"],
      nextKey: "NÄCHSTER SCHRITT",
      nextVal: "DIAGNOSE",
    },
    diagnosisCta: {
      sectionLabel: "NÄCHSTER SCHRITT",
      headlineRoman: "Weißt du nicht, wo",
      headlineItalic: "Sichtbarkeit bricht?",
      copy: "WIR KARTIEREN DEINE AKTUELLE SUCHSICHTBARKEIT,\nAI CITATION POTENTIAL, WEBSITE-STRUKTUR\nUND DIE WICHTIGSTEN HEBEL.",
      cta: "SICHTBARKEIT PRÜFEN",
      closing: "Wir bauen die Oberflächen, die Maschinen abrufen und Menschen vertrauen.",
    },
    rooms: [
      {
        id: "crawl",
        index: "01",
        station: "CRAWL",
        name: "CRAWL ROOM",
        discipline: "SEO / SUCHARCHITEKTUR",
        statementRoman: "SEO ist nicht Traffic.",
        statementItalic: "Es ist Architektur dafür, verstanden zu werden.",
        body: "Wir bauen die Struktur unter der Sichtbarkeit: technische Grundlagen, Content-Systeme, interne Verlinkung und Seiten, die Suchmaschinen verstehen, indexieren und ranken können.",
        deliverables: ["Technical SEO", "Sucharchitektur", "Interne Verlinkung", "Content-Systeme", "Schema-Logik", "Analytics"],
        flip: false,
      },
      {
        id: "retrieve",
        index: "02",
        station: "RETRIEVE",
        name: "RETRIEVAL ROOM",
        discipline: "AI SEARCH / GEO / AIO — MACHINE CITATION",
        statementRoman: "AI Search rankt keine Seiten.",
        statementItalic: "Es ruft Evidenz ab.",
        body: "Wir bereiten Marken auf KI-gestützte Discovery vor: Query Fan-outs, Citation Surfaces, Entity-reiche Inhalte und Seiten, die abgerufen, vertraut und referenziert werden.",
        deliverables: ["GEO / AIO", "AI Overviews", "Query Fan-out Mapping", "Citation Surfaces", "Entity-dichter Content", "Source Gap Analysis", "Chat Search Sichtbarkeit"],
        flip: true,
      },
      {
        id: "trust",
        index: "03",
        station: "TRUST",
        name: "SURFACE ROOM",
        discipline: "WEBSITES / DIGITALE OBERFLÄCHE",
        statementRoman: "Eine Website ist keine Broschüre mehr.",
        statementItalic: "Sie ist die Oberfläche, die Maschinen parsen und Menschen beurteilen.",
        body: "Wir designen und bauen Websites als Retrieval-Oberflächen: schnell, editorial, strukturiert und conversion-ready. Eine Site soll nicht nur premium aussehen — sie soll verwendbare Evidenz sein.",
        deliverables: ["Next.js Development", "Editorial Landing Pages", "Design Systems", "Conversion Pages", "CMS-ready Strukturen", "Performance-first Builds"],
        flip: false,
      },
      {
        id: "diagnose",
        index: "04",
        station: "DIAGNOSE",
        name: "DIAGNOSIS ROOM",
        discipline: "AUDITS / DIAGNOSTISCHE INTELLIGENZ",
        statementRoman: "Bevor wir bauen,",
        statementItalic: "lokalisieren wir die Lücke.",
        body: "Wir identifizieren, wo Sichtbarkeit bricht: technische Lücken, schwache Quellsignale, fehlende Content-Oberflächen und unklare Conversion-Pfade. Dann verwandeln wir die Diagnose in eine Roadmap.",
        deliverables: ["Search Diagnose", "AI Visibility Audit", "Website Review", "Technical Audit", "Competitor Source Map", "Growth Roadmap"],
        flip: true,
      },
    ],
  },

  // ── Work page ────────────────────────────────────────────────────────────────
  workPage: {
    hero: {
      room: "ARBEIT / EVIDENCE ARCHIVE",
      accession: "SZN-AR-02",
      roman: ["BEWEIS IST, WAS", "DAS SYSTEM"],
      italic: "enthüllt.",
      sub: ["DREI LIVE-SYSTEME — GEBAUT, GEMESSEN", "UND IN LAUFENDER BETREUUNG.", "ABGELEGT ALS CASE FILES."],
      note: ["CLIENT READINGS BLEIBEN VERTRAULICH.", "DIE OBERFLÄCHEN SIND LIVE."],
      meta: "THE EVIDENCE ARCHIVE",
      cta: { label: "SICHTBARKEIT PRÜFEN", href: "/de/diagnosis" },
    },
    archive: {
      chip1: "EVIDENCE ARCHIVE",
      chip2: "AUSGEWÄHLTE INSTRUMENTE",
    },
    caseFiles: {
      sectionLabel: "CASE FILES",
      headline: "Drei Systeme",
      headlineItalic: "im Betrieb.",
      intro: "Gebaut, gemessen und in Betreuung. Die Readings bleiben vertraulich — die Oberflächen sind live.",
      visitLabel: "LIVE SURFACE ANSEHEN",
      surfaceKey: "SURFACE",
      sectorKey: "BRANCHE",
      scopeKey: "SCOPE",
      statusKey: "STATUS",
      cases: [
        {
          id: "SZN-CF-01",
          index: "01",
          name: "RISCHO",
          fullName: "Rischo GmbH",
          domain: "rischo-gmbh.de",
          url: "https://rischo-gmbh.de",
          sector: "STAHL- & METALLBAU — BREMEN",
          scope: ["WEBSITE BUILD", "SEO CARE"],
          status: "LIVE — IN BETREUUNG",
          statementRoman: "Ein Handwerksbetrieb seit 1981.",
          statementItalic: "Jetzt gebaut, um gefunden zu werden.",
          body: "Wir haben die digitale Oberfläche für einen Bremer Stahl- und Metallbau-Spezialisten gebaut und halten sie in laufender SEO-Betreuung: saubere Struktur, lokale Sichtbarkeit und Seiten, die beantworten, was Kunden wirklich suchen.",
        },
        {
          id: "SZN-CF-02",
          index: "02",
          name: "SIVIUS",
          fullName: "SIVIUS Group",
          domain: "sivius.net",
          url: "https://www.sivius.net/de/",
          sector: "IMMOBILIEN & ASSET MANAGEMENT",
          scope: ["WEBSITE BUILD", "SOFTWARE DEVELOPMENT", "GEO / AIO CARE"],
          status: "LIVE — IN BETREUUNG",
          statementRoman: "Echte Assets brauchen",
          statementItalic: "abrufbare Evidenz.",
          body: "Wir haben die Oberfläche gebaut, entwickeln die Software dahinter und bereiten die Marke auf AI Retrieval vor: Entity-Klarheit, zitierfähige Struktur und Inhalte, die Maschinen übernehmen können.",
        },
        {
          id: "SZN-CF-03",
          index: "03",
          name: "CONTENTKÜCHE",
          fullName: "Contentkueche GmbH",
          domain: "contentkueche.de",
          url: "https://contentkueche.de",
          sector: "CONTENT MARKETING — MÜNCHEN",
          scope: ["GEO / AIO CARE", "SEO CARE"],
          status: "IN BETREUUNG",
          statementRoman: "Wer Content produziert,",
          statementItalic: "sollte die Quelle sein, die Maschinen zitieren.",
          body: "Wir halten eine Münchner Content-Agentur in GEO/AIO- und SEO-Betreuung: Suchstruktur, Sichtbarkeit in AI-Antworten und die Quellsignale, die aus Output Evidenz machen.",
        },
      ],
    },
    closer: {
      index: "03",
      label: "NÄCHSTER SCHRITT",
      roman: "Das nächste Case File",
      italic: "könnte deins sein.",
      sub: ["WIR KARTIEREN DIE LÜCKE, BEVOR WIR BAUEN.", "DER SCAN KOMMT ZUERST."],
      closing: "Wir bauen die Oberflächen, die Maschinen abrufen und Menschen vertrauen.",
    },
  },

  // ── Insights page ────────────────────────────────────────────────────────────
  insightsPage: {
    hero: {
      room: "INSIGHTS / INTELLIGENCE ROOM",
      accession: "SZN-IN-03",
      roman: ["DIE MEISTE SUCHE PASSIERT", "DORT, WO DU"],
      italic: "sie nicht siehst.",
      sub: ["FIELD NOTES AUS DER RETRIEVAL-SCHICHT —", "WAS AI SEARCH LIEST, ZITIERT UND IGNORIERT,", "AUFGEZEICHNET IM BETRIEB."],
      note: ["KEINE TREND-ESSAYS. KEIN VORHERSAGE-THEATER.", "NUR WAS WIR VERIFIZIEREN."],
      meta: "THE INTELLIGENCE ROOM",
      cta: { label: "SICHTBARKEIT PRÜFEN", href: "/de/diagnosis" },
    },
    cinema: {
      decode: "SIGNAL ERFASST — AUFZEICHNUNG LÄUFT",
      statusLeft: "INTELLIGENCE ROOM — LIVE-LESUNG",
      statusRight: "SCROLLEN — IN DEN FÄCHER",
      fragments: [
        "QUERY 14 / 30 — UNGESEHEN",
        "CITATION SURFACE: LISTICLE",
        "CHUNK EINGEBETTET — RAUSCHEN",
        "ENTITY: NICHT AUFGELÖST",
        "FAN-OUT PFAD 07 — OFFEN",
        "PASSAGE GEWÄHLT — 40 WORTE",
        "CRAWL-BUDGET: VERBRAUCHT",
        "QUELLE ZITIERT: NICHT DU",
        "RETRIEVAL-TIEFE: CHUNK",
      ],
      ghost: "UNSEEN",
    },
    fanout: {
      chip: "QUERY FAN-OUT",
      label: "LIVE-DEKOMPOSITION",
      queryKey: "DIE FRAGE, DIE DU SIEHST",
      query: "beste agentur für ai search sichtbarkeit",
      counterKey: "VERSTECKTE SUCHPFADE",
      headline: "Eine Frage wird zu",
      headlineItalic: "dreißig Suchen.",
      copy: "Das System zerlegt den Prompt in einen Fächer aus Sub-Queries — separat beantwortet, aus Quellen, die du nie optimiert hast, und zu einer Antwort zusammengesetzt.",
      endRoman: "Du hast für eine optimiert.",
      endItalic: "Die Antwort nutzte dreißig.",
      endNote: "PRÄSENZ HEISST: EIN FRAGMENT SEIN, DAS DIE ANTWORT NICHT AUSLASSEN KANN.",
      subqueries: [
        "beste geo agenturen 2026",
        "seeszn erfahrungen",
        "geo vs seo unterschied",
        "ai overviews optimieren kosten",
        "seeszn alternativen",
        "wie wählen llms citations",
        "answer engine optimization agentur",
        "schema für ai search",
        "seeszn preise",
        "top geo agenturen europa",
        "ist seo tot 2026",
        "chatgpt search ranking faktoren",
        "perplexity zitiert quellen",
        "entity optimierung marke",
        "ai visibility audit",
        "query fan-out erklärt",
        "beste agentur für ai citations",
        "llm seo fallstudien",
        "gemini grounding quellen",
        "von chatgpt zitiert werden",
        "rag für marketing teams",
        "kategorieseiten für ki optimieren",
        "copilot suche quellen",
        "vertrauenswürdige quellen ki antworten",
      ],
    },
    marquee: {
      ariaLabel: "Was mit deinen Oberflächen in der Retrieval-Schicht passiert",
      words: ["GELESEN", "ABGERUFEN", "ZITIERT", "ASSEMBLIERT", "IGNORIERT", "VERIFIZIERT"],
    },
    observatory: {
      sectionLabel: "DAS OBSERVATORIUM",
      headline: "Wir beobachten die Systeme,",
      headlineItalic: "die entscheiden, was gesehen wird.",
      copy: "Jede Answer Engine liest anders. Wir halten alle unter Beobachtung — und legen ab, was wir verifizieren: als Field Notes.",
      sweepKey: "SWEEP",
      contactsKey: "KONTAKTE",
      systems: [
        { name: "GOOGLE AI MODE / AI OVERVIEWS", status: "BEOBACHTET" },
        { name: "CHATGPT SEARCH", status: "BEOBACHTET" },
        { name: "PERPLEXITY", status: "BEOBACHTET" },
        { name: "GEMINI", status: "BEOBACHTET" },
        { name: "COPILOT", status: "BEOBACHTET" },
        { name: "CLASSIC SERP", status: "ZÄHLT NOCH" },
      ],
      footnote: "SCROLLEN = SWEEP — JEDER KONTAKT IST EIN SYSTEM, DAS WIR LESEN.",
    },
    fieldNotes: {
      chip: "FIELD NOTES",
      dateLabel: "SEIT 2026 — LAUFEND",
      introHeadlineRoman: "Wir veröffentlichen, was wir",
      introHeadlineItalic: "in der Praxis verifizieren.",
      introCopy: "JEDE NOTE — EINE BEOBACHTUNG, EIN OPERATIVER ZUG.\nKEINE ESSAYS. KEIN VORHERSAGE-THEATER.",
      notes: [
        {
          id: "FN-01", cls: "RETRIEVAL",
          title: "Eine Frage wird zu dreißig Suchen.",
          abstract: "Query Fan-out erzeugt versteckte Suchpfade, die die meisten Marken nie sehen.",
          observation: "KI-Suchsysteme zerlegen einen einzelnen Prompt in einen Fächer aus Sub-Queries — Vergleiche, Alternativen, Preise, Bewertungen, lokale Varianten. Jeder Pfad wird separat beantwortet, aus verschiedenen Quellen, und zu einer Antwort zusammengesetzt. Eine Marke kann die sichtbare Query dominieren und im Fächer, der die Antwort tatsächlich speist, vollständig fehlen.",
          move: "Kartiere den Fan-out für deine Kategorie, bevor du eine einzige Seite schreibst.",
        },
        {
          id: "FN-02", cls: "CITATION",
          title: "Das Listicle, das du ignoriert hast, antwortet für dich.",
          abstract: "Modelle zitieren Aggregations-Oberflächen zu stark — und jemand anderes hat sie gebaut.",
          observation: "Answer Engines stützen sich auf Oberflächen, die vergleichen und bewerten: Listicles, Kategorie-Roundups, Buyer's Guides, Forum-Threads. Diese Seiten werden zitiert, weil sie dicht, strukturiert und bereits beurteilt sind. Wenn der einzige Roundup in deiner Kategorie von einer Affiliate-Site geschrieben wurde, spricht diese Site für deinen Markt.",
          move: "Platziere dich auf den Oberflächen, denen Modelle bereits vertrauen — oder baue die definitive.",
        },
        {
          id: "FN-03", cls: "STRUCTURE",
          title: "Maschinen zitieren Absätze, nicht Seiten.",
          abstract: "Retrieval passiert auf Chunk-Ebene. Die meisten Seiten können nicht in vierzig Worten zitiert werden.",
          observation: "Retrieval-Systeme teilen Seiten in Passagen auf und betten jede einzeln ein. Eine Seite gewinnt, indem sie Chunks enthält, die distinct, eigenständig und quellenwertig sind — eine Definition, die für sich steht, ein Vergleich, der keinen Kontext braucht. Langer, undifferenzierter Prosa-Text wird als Rauschen eingebettet und nie ausgewählt.",
          move: "Schreibe in Chunks: ein Claim, eine Passage, zitierbar ohne ihre Seite.",
        },
        {
          id: "FN-04", cls: "ENTITY",
          title: "Wenn das Modell nicht auflösen kann, wer du bist, kann es dich nicht empfehlen.",
          abstract: "Entity-Klarheit entscheidet, ob Erwähnungen sich zu Erinnerung verdichten.",
          observation: "Modelle bauen Entity-Datensätze aus korroborierenden Quellen: konsistente Benennung, eine kanonische Beschreibung, ausgerichtete Profile, Drittbestätigung. Inkonsistente Benennung und dünne Korroboration spalten eine Marke in Fragmente, die zu schwach zum Zitieren sind. Erwähnungen akkumulieren dann in der Kategorie — nicht bei dir.",
          move: "Ein kanonischer Entity-Datensatz, überall wo es zählt korroboriert.",
        },
        {
          id: "FN-05", cls: "STRUCTURE",
          title: "Schema ist Grammatik, keine Strategie.",
          abstract: "Markup macht Aussagen lesbar. Es macht sie nicht glaubwürdig.",
          observation: "Strukturierte Daten sagen einem Parser, was eine Aussage ist — sie liefern nicht die Evidenz, die die Aussage zitierbar macht. Schema auf dünne Inhalte anzuwenden ist eine gut formatierte Abwesenheit. Die Reihenfolge der Operationen ist entscheidend: Evidenz zuerst, Struktur zweite, Markup zuletzt.",
          move: "Struktur folgt Evidenz. Niemals umgekehrt.",
        },
        {
          id: "FN-06", cls: "TRUST",
          title: "Geschwindigkeit ist ein Trust-Signal, bevor sie ein Rankingfaktor ist.",
          abstract: "Eine langsame Oberfläche wirkt wie eine vernachlässigte — für Menschen und Crawler.",
          observation: "Latenz prägt das Urteil beim ersten Kontakt: Besucher lesen Langsamkeit als Vernachlässigung, und Crawl-Systeme weisen Aufmerksamkeit von Oberflächen ab, die ihr Budget verschwenden. Performance ist kein technisches Nachdenken; es ist Teil davon, wie Glaubwürdigkeit gerendert wird.",
          move: "Behandle Performance als Marke, budgetiert wie Design.",
        },
        {
          id: "FN-07", cls: "SURFACE",
          title: "Deine Kategorie-Seite ist eine Retrieval-Oberfläche.",
          abstract: "Kommerzielle Fan-out-Pfade rufen Kategorie-Seiten ab. Die meisten sind dünne Grids.",
          observation: "Wenn der Fan-out kommerziell wird — best, versus, alternatives, pricing — rufen Systeme Kategorie- und Service-Seiten ab. Die meisten sind Produkt-Grids ohne eine Aussage, die es wert ist, zitiert zu werden. Eine Kategorie-Seite, die definiert, vergleicht und beweist, wird das Fragment, aus dem die Antwort gebaut wird.",
          move: "Baue Kategorie-Seiten als Evidenz um: Definitionen, Vergleiche, Proof.",
        },
        {
          id: "FN-08", cls: "RETRIEVAL",
          title: "Antworten werden zusammengesetzt, nicht gefunden.",
          abstract: "Eine KI-Antwort ist ein Komposit aus Fragmenten verschiedener Oberflächen.",
          observation: "Keine einzelne Seite gewinnt eine KI-Antwort. Das System setzt Fragmente zusammen — eine Definition von einer Oberfläche, ein Vergleich von einer anderen, ein Preis von einer dritten — und zitiert die verwendbaren. Präsenz bedeutet, ein Fragment zu sein, das die Zusammenstellung nicht überspringen kann.",
          move: "Designe Seiten als Fragment-Bibliotheken, nicht als Narrative.",
        },
      ],
    },
    scanCta: {
      roman: "Lesen ist nicht",
      italic: "Sichtbarkeit.",
      sub: ["DIE NOTES SIND ALLGEMEIN.", "DEINE LÜCKE IST SPEZIFISCH."],
      closing: "Wir bauen die Oberflächen, die Maschinen abrufen und Menschen vertrauen.",
    },
  },

  // ── About page ────────────────────────────────────────────────────────────────
  aboutPage: {
    hero: {
      room: "STUDIO / OPERATING MANUAL",
      accession: "SZN-OM-04",
      roman: ["WIR ARBEITEN DORT, WO", "MASCHINEN ENTSCHEIDEN,"],
      italic: "was Menschen sehen.",
      sub: ["SEESZN IST EIN SICHTBARKEITSSTUDIO —", "STRATEGIE, SEARCH, DESIGN UND ENGINEERING", "ALS EIN SYSTEM."],
      note: ["DIESES DOKUMENT IST DAS HANDBUCH.", "DEINE OBERFLÄCHEN-LESUNG BLEIBT PRIVAT."],
      meta: "THE OPERATING MANUAL",
      cta: { label: "SICHTBARKEIT PRÜFEN", href: "/de/diagnosis" },
    },
    scanCta: {
      roman: "Das Handbuch ist öffentlich.",
      italic: "Die Lesung ist privat.",
      sub: ["WIR KARTIEREN DEINE OBERFLÄCHE, BEVOR", "WIR ÜBER EINE ZUSAMMENARBEIT SPRECHEN."],
      closing: "Wir bauen die Oberflächen, die Maschinen abrufen und Menschen vertrauen.",
    },
    manual: {
      premise: {
        label: "DAS FUNDAMENT",
        headlineRoman: "Suche wurde zu Retrieval.",
        headlineItalic: "Ranking wurde zu Citation.",
        copy1: "ANTWORTEN WERDEN AUS OBERFLÄCHEN ZUSAMMENGESETZT, DENEN MASCHINEN VERTRAUEN. DIE MARKEN, DIE SICHTBAR BLEIBEN, SIND LESBAR, VERIFIZIERBAR UND ZITIERBAR — FÜR PARSER UND FÜR MENSCHEN.",
        copy2: "WIR BAUEN FÜR BEIDE LESER. DAS IST DAS GESAMTE STUDIO.",
      },
      model: {
        label: "DAS MODELL",
        rightLabel: "EIN LOOP — KEIN FUNNEL",
        phases: [
          { name: "DIAGNOSE", desc: "Lokalisiere, wo Sichtbarkeit bricht, bevor irgendeine Arbeit beginnt." },
          { name: "ARCHITECT", desc: "Strukturiere Entities, Seiten und Pfade für den Abruf." },
          { name: "BUILD", desc: "Designe und baue die Oberfläche — schnell, editorial, lesbar." },
          { name: "OBSERVE", desc: "Beobachte Antworten, Citations und Konversion. Korrigiere das System." },
        ],
      },
      principles: {
        label: "PRINZIPIEN",
        items: [
          { name: "STRUKTUR VOR VOLUMEN", gloss: "Content-Volumen ohne Architektur ist Rauschen, das die Maschine überspringt." },
          { name: "ABRUF VOR REICHWEITE", gloss: "Sei zitierbar, bevor du laut bist." },
          { name: "EVIDENZ ÜBER MEINUNG", gloss: "Wir lesen Systeme. Wir raten nicht." },
          { name: "EIN SYSTEM, KEINE SILOS", gloss: "SEO, AI Search und die Website sind dieselbe Oberfläche." },
          { name: "GESCHMACK IST EIN LEISTUNGSSYSTEM", gloss: "Zurückhaltung, Hierarchie und Geschwindigkeit — das ist, wie Konversion sich anfühlt." },
          { name: "GESCHWINDIGKEIT IST TEIL DES VERTRAUENS", gloss: "Eine langsame Oberfläche wirkt wie eine vernachlässigte." },
        ],
      },
      refusals: {
        label: "ABLEHNUNGEN",
        rightLabel: "ABLEHNUNG IST EIN DESIGNWERKZEUG",
        headlineRoman: "Was wir ablehnen,",
        headlineItalic: "definiert die Arbeit.",
        items: [
          { name: "Arbeit ohne Diagnose", gloss: "Wir bauen nicht, bevor wir die Lücke lokalisiert haben." },
          { name: "Keyword-Volumen als Strategie", gloss: "Volumen füttert Dashboards, nicht Antworten." },
          { name: "Dashboards statt Entscheidungen", gloss: "Eine Metrik ist kein Zug." },
          { name: "KI-Theater", gloss: "Kein Glanz, keine Magie, keine Neon-Intelligenz." },
          { name: "Broschüren-Websites", gloss: "Eine Oberfläche, die nicht abgerufen werden kann, ist Dekoration." },
          { name: "Growth-Sprache", gloss: "Nichts wird geboostet, freigeschaltet oder auf das nächste Level gebracht." },
        ],
      },
      unit: {
        label: "DAS TEAM",
        headlineRoman: "Eine kleine Einheit.",
        headlineItalic: "Ein Tisch.",
        copy1: "STRATEGIE, SUCHARCHITEKTUR, EDITORIAL DESIGN UND ENGINEERING — ZWISCHEN BERLIN UND BANGKOK.",
        copy2: "NUR SENIOR. KEINE ÜBERGABEN. KEINE ACCOUNT-SCHICHTEN.\nDIE PERSONEN, DIE DEINE OBERFLÄCHE DIAGNOSTIZIEREN, BAUEN SIE AUCH.",
      },
    },
  },

  // ── Diagnosis page ────────────────────────────────────────────────────────────
  diagnosisPage: {
    hero: {
      room: "DIAGNOSE / SCAN ROOM",
      accession: "SZN-SC-05",
      roman: ["BEVOR WIR BAUEN,", "LOKALISIEREN WIR"],
      italic: "die Lücke.",
      sub: ["EINE DIAGNOSE, KEIN PITCH.", "WIR KARTIEREN, WO DEINE SICHTBARKEIT BRICHT,", "BEVOR WIR ÜBER EINE ZUSAMMENARBEIT SPRECHEN."],
      meta: "THE SCAN ROOM",
    },
    intakeForm: {
      headerLeft: "SCAN INTAKE — NEUES SPECIMEN",
      field1Label: "FELD 01 — KONTAKT",
      field1Required: "PFLICHT",
      field2Label: "FELD 02 — OBERFLÄCHE",
      field2Optional: "OPTIONAL",
      field3Label: "FELD 03 — VERDÄCHTIGE LÜCKE",
      field3Optional: "OPTIONAL",
      suspects: ["SEARCH RANKINGS", "AI ANSWERS", "WEBSITE", "CONVERSION", "UNBEKANNT"],
      submitIdle: "SCAN ANFORDERN",
      submitLoading: "WIRD ÜBERTRAGEN…",
      errorMessage: "ÜBERTRAGUNG FEHLGESCHLAGEN. SCHREIB AN ",
      doneTitle: "INTAKE ERHALTEN.",
      doneCopy: "Deine Oberfläche wird gescannt. Wir antworten von hello@seeszn.com — eine Diagnose, kein Pitch.",
      footerLeft: "KEIN PITCH DECK. KEIN RETAINER-GESPRÄCH.",
      footerRight: "EINE LESUNG DEINER OBERFLÄCHE",
    },
    protocol: {
      measuresLabel: "WAS DER SCAN LIEST",
      measuresRight: "FÜNF MASSE — EINE OBERFLÄCHE",
      measures: [
        { name: "CRAWL", question: "Können Maschinen deine Struktur durchqueren?", reads: "INDEX-ROUTEN · TIEFE · SACKGASSEN · WAISEN" },
        { name: "ENTITY", question: "Weiß die Maschine, wer du bist?", reads: "KANONISCHES RECORD · BENENNUNG · KORROBORATION" },
        { name: "CITATION", question: "Zitieren Antworten dich?", reads: "FAN-OUT-ABDECKUNG · QUELL-OBERFLÄCHEN · LÜCKEN" },
        { name: "TRUST", question: "Liest sich die Oberfläche als glaubwürdig?", reads: "GESCHWINDIGKEIT · KLARHEIT · EVIDENZ-DESIGN" },
        { name: "CONVERSION", question: "Wird Abruf zu Umsatz?", reads: "ANTWORT-ZU-AKTION-PFAD · LANDING EVIDENCE" },
      ],
      stepsLabel: "DAS PROTOKOLL",
      stepsRight: "VIER SCHRITTE — EINE DIAGNOSE",
      steps: [
        { name: "INTAKE", desc: "Du sendest die Oberfläche. Eine E-Mail, eine Domain — das reicht zum Start." },
        { name: "SCAN", desc: "Wir lesen sie in Such- und KI-Systemen: Struktur, Entities, Citations, Trust, Konversion." },
        { name: "READING", desc: "Du erhältst die Leak-Map — wo Sichtbarkeit bricht und warum. In klarer Sprache." },
        { name: "ROADMAP", desc: "Die wichtigsten Hebel, sequenziert. Ob wir sie gemeinsam umsetzen, ist eine separate Entscheidung." },
      ],
      mailNote: "LIEBER PER MAIL?",
    },
  },

  // ── Common ──────────────────────────────────────────────────────────────────
  common: {
    bookDiagnosis: "SICHTBARKEIT PRÜFEN",
    nextMove: "NÄCHSTER SCHRITT",
    railLabel: "OPERATING LINE",
  },

  // ── Legal pages ─────────────────────────────────────────────────────────────
  legalNav: {
    legal: "Rechtliches",
    privacy: "Datenschutz",
    contact: "Kontakt",
  },

  legalPage: {
    meta: "RECHTLICHE HINWEISE",
    accession: "SZN-LG-01",
    title: "Rechtliche Hinweise",
    subtitle: "Angaben zum Betreiber dieser Website.",
    sections: [
      {
        num: "01",
        heading: "Betreiber",
        body: "Okri Holdings LLC\n1912 Capitol Avenue, Ste. 500\nCheyenne, Wyoming\nVereinigte Staaten",
      },
      {
        num: "02",
        heading: "Kontakt",
        body: "E-Mail: contact@okriholdings.com\nTelefon: +1 914 855 1480",
      },
      {
        num: "03",
        heading: "Leistung",
        body: "SEESZN ist eine Marke der Okri Holdings LLC. Die Website seeszn.com bietet Informationen zu AI Search Visibility, SEO und digitalen Sichtbarkeitsdiensten.",
      },
      {
        num: "04",
        heading: "Haftung für Inhalte",
        body: "Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Wir können jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen. Als Diensteanbieter sind wir gemäß den anwendbaren Gesetzen für eigene Inhalte auf diesen Seiten verantwortlich. Wir sind nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.",
      },
      {
        num: "05",
        heading: "Haftung für Links",
        body: "Unsere Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.",
      },
      {
        num: "06",
        heading: "Urheberrecht",
        body: "Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem anwendbaren Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
      },
    ],
  },

  privacyPage: {
    meta: "DATENSCHUTZ",
    accession: "SZN-PP-01",
    title: "Datenschutzerklärung",
    subtitle: "Wie wir mit deinen Daten umgehen — klar und direkt.",
    sections: [
      {
        num: "01",
        heading: "Verantwortliche Stelle",
        body: "Okri Holdings LLC\n1912 Capitol Avenue, Ste. 500\nCheyenne, Wyoming\nVereinigte Staaten\n\nE-Mail: contact@okriholdings.com\nTelefon: +1 914 855 1480",
      },
      {
        num: "02",
        heading: "Daten, die wir erheben",
        body: "Beim Besuch von seeszn.com erfassen unsere Webserver automatisch Standard-Zugriffsdaten: IP-Adresse, Browsertyp, Betriebssystem, verweisende URL sowie die aufgerufenen Seiten. Diese Daten dienen ausschließlich dem sicheren Betrieb und der Verbesserung der Website. Sie werden nicht mit deiner Identität verknüpft.",
      },
      {
        num: "03",
        heading: "Kontaktanfragen",
        body: "Wenn du über unser Kontaktformular oder per E-Mail eine Anfrage stellst, verarbeiten wir deinen Namen, deine E-Mail-Adresse und den Inhalt deiner Nachricht ausschließlich zur Beantwortung deiner Anfrage. Diese Daten werden nicht an Dritte weitergegeben und nach vollständiger Bearbeitung deiner Anfrage gelöscht.",
      },
      {
        num: "04",
        heading: "Cookies und Tracking",
        body: "Diese Website verwendet keine Tracking-Cookies, Werbepixel oder Drittanbieter-Analysetools, die dich individuell identifizieren. Technisch notwendige Session-Daten können verwendet werden, um die Funktionsfähigkeit der Website sicherzustellen. Es findet kein Profiling statt.",
      },
      {
        num: "05",
        heading: "Drittanbieter-Dienste",
        body: "Wir nutzen Resend zur Verarbeitung und Zustellung von E-Mail-Einsendungen über unser Kontaktformular. Resend handelt als Auftragsverarbeiter unter unserer Weisung. Die Datenschutzerklärung von Resend ist unter resend.com/privacy abrufbar. Weitere Drittanbieter werden auf dieser Website nicht eingesetzt.",
      },
      {
        num: "06",
        heading: "Deine Rechte",
        body: "Du hast das Recht, Auskunft über die bei uns gespeicherten personenbezogenen Daten zu verlangen sowie deren Berichtigung oder Löschung zu fordern. Du kannst bestimmter Verarbeitungen auch widersprechen oder deren Einschränkung verlangen. Um diese Rechte wahrzunehmen, kontaktiere uns unter contact@okriholdings.com. Wir antworten innerhalb von 30 Tagen.",
      },
      {
        num: "07",
        heading: "Speicherdauer",
        body: "Daten aus Kontaktanfragen werden nur so lange gespeichert, wie es zur Bearbeitung deiner Anfrage erforderlich ist, und nicht länger als 12 Monate, sofern gesetzliche Aufbewahrungspflichten nichts anderes vorschreiben. Zugriffsprotokolldaten werden nach 30 Tagen gelöscht.",
      },
      {
        num: "08",
        heading: "Änderungen dieser Erklärung",
        body: "Wir können diese Erklärung von Zeit zu Zeit aktualisieren. Das Datum oben auf dieser Seite gibt an, wann sie zuletzt überarbeitet wurde. Die weitere Nutzung der Website nach Änderungen gilt als Zustimmung zur aktualisierten Erklärung.",
      },
    ],
    updated: "Zuletzt aktualisiert: Juni 2026",
  },
};
