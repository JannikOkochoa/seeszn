// ─── German translation dictionary ───────────────────────────────────────────
// Tone: direct, founder-led "du". No corporate speak.
// Keep in English: SEO, AI Search, GEO, AIO, Citations, Content, etc.

import type { Translations } from "./en";

export const de: Translations = {
  locale: "de",

  // ── Navigation ──────────────────────────────────────────────────────────────
  nav: {
    utilityBar: "AI Search Sichtbarkeit für Marken, die gefunden, zitiert und gewählt werden wollen",
    services: "LEISTUNGEN",
    work: "ARBEIT",
    insights: "INSIGHTS",
    about: "STUDIO",
    cta: "DIAGNOSE BUCHEN",
    servicesTagline: "Wir bauen die Oberflächen, die Maschinen abrufen und Menschen vertrauen.",
    enterOperatingRoom: "ZUM OPERATING ROOM",
    allServices: "ALLE LEISTUNGEN",
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
    line1: "Du bist nicht",
    line2: "in der",
    italic: "Antwort.",
    sub: "SICHTBARKEITSSYSTEME FÜR MARKEN,\nDIE IN MASCHINENGEDÄCHTNIS EINGEHEN.",
    cta: "DIAGNOSE STARTEN",
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
        sub: "Erschein, wo die Absicht beginnt.",
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
      { index: "01", sector: "EDUCATION", headline: "Gefunden.\nNicht zitiert.", trace: "SOURCE SURFACE" },
      { index: "02", sector: "TRAVEL", headline: "Sichtbar.\nNicht erinnert.", trace: "CATEGORY TRACE" },
      { index: "03", sector: "B2B SAAS", headline: "Erwähnt.\nNicht vertraut.", trace: "TRUST SIGNAL" },
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
      { left: "NICHT RANKINGS", right: "ABRUF" },
      { left: "NICHT TRAFFIC", right: "PRÄSENZ" },
      { left: "NICHT CONTENT", right: "CITATIONS" },
      { left: "NICHT REICHWEITE", right: "AUTORITÄT" },
    ],
  },

  // ── Contact ─────────────────────────────────────────────────────────────────
  contact: {
    headlineRoman: "Das hier ist kein Pitch.",
    headlineItalic: "Es ist eine Diagnose.",
    sub: "Wir kartieren deine Sichtbarkeit auf Google\nund allen wichtigen KI-Plattformen, bevor\nwir über eine Zusammenarbeit sprechen.",
    successMessage: "Diagnose angefordert. Wir melden uns.",
    placeholder: "deine@email.de",
    buttonIdle: "DIAGNOSE STARTEN",
    buttonLoading: "...",
    errorMessage: "Etwas ist schiefgelaufen. Schreib uns direkt an hello@seeszn.com",
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    location: "BERLIN — BANGKOK",
    rooms: [
      { num: "01", name: "OPERATING ROOM", href: "/de/services" },
      { num: "02", name: "EVIDENCE ARCHIVE", href: "/de/work" },
      { num: "03", name: "INTELLIGENCE ROOM", href: "/de/insights" },
      { num: "04", name: "OPERATING MANUAL", href: "/de/about" },
      { num: "05", name: "SCAN ROOM", href: "/de/diagnosis" },
    ],
  },

  // ── Services page ────────────────────────────────────────────────────────────
  servicesPage: {
    hero: {
      roomLabel: "LEISTUNGEN / OPERATING ROOM",
      roman1: "Sichtbarkeit bricht,",
      roman2: "bevor der Kunde",
      italic: "dich sieht.",
      sub1: "WIR DIAGNOSTIZIEREN, BAUEN UND STRUKTURIEREN\nDIE OBERFLÄCHEN, DIE MASCHINEN ABRUFEN\nUND MENSCHEN VERTRAUEN.",
      sub2: "SEO, AI SEARCH, WEBSITES UND AUDITS —\nALS EIN SICHTBARKEITSSYSTEM.",
      cta: "DIAGNOSE BUCHEN",
    },
    system: {
      sectionLabel: "DAS SYSTEM",
      headline: "Sichtbarkeit ist nicht mehr",
      headlineItalic: "ein Kanal.",
      copy1: "ES IST EIN SYSTEM AUS SUCHARCHITEKTUR, MACHINE CITATION, DIGITALEN OBERFLÄCHEN UND DIAGNOSTISCHER INTELLIGENZ.",
      copy2: "SEESZN VERBINDET SEO, AI SEARCH, WEBSITES UND AUDITS ZU EINEM OPERATING SYSTEM — GEBAUT FÜR WIE MENSCHEN HEUTE SUCHEN UND WIE MASCHINEN MORGEN INFORMATIONEN ABRUFEN.",
      enterRoom: "ZUM OPERATING ROOM",
      roomsHeader: "DIE VIER RÄUME",
      roomsSubheader: "EIN SYSTEM — VIER INSTRUMENTE",
    },
    diagnosisCta: {
      sectionLabel: "NÄCHSTER SCHRITT",
      headlineRoman: "Weißt du nicht, wo",
      headlineItalic: "Sichtbarkeit bricht?",
      copy: "WIR KARTIEREN DEINE AKTUELLE SUCHSICHTBARKEIT,\nAI CITATION POTENTIAL, WEBSITE-STRUKTUR\nUND DIE WICHTIGSTEN HEBEL.",
      cta: "DIAGNOSE BUCHEN",
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
      sub: ["EIN ARCHIV AUS INSTRUMENTEN, NICHT LOGOS.", "DIE FORMEN, IN DENEN UNSERE EVIDENZ ERSCHEINT —", "KATALOGISIERT WIE PRÄPARATE."],
      note: ["CLIENT READINGS BLEIBEN VERTRAULICH.", "DIE INSTRUMENTE SIND ÖFFENTLICH."],
      meta: "THE EVIDENCE ARCHIVE",
      cta: { label: "DIAGNOSE BUCHEN", href: "/de/diagnosis" },
    },
    archive: {
      chip1: "EVIDENCE ARCHIVE",
      chip2: "AUSGEWÄHLTE INSTRUMENTE",
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
      cta: { label: "DIAGNOSE BUCHEN", href: "/de/diagnosis" },
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
      cta: { label: "DIAGNOSE BUCHEN", href: "/de/diagnosis" },
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
    bookDiagnosis: "DIAGNOSE BUCHEN",
    nextMove: "NÄCHSTER SCHRITT",
    railLabel: "OPERATING LINE",
  },
};
