// ─── English translation dictionary ──────────────────────────────────────────

export const en = {
  locale: "en" as "en" | "de",

  // ── Navigation ──────────────────────────────────────────────────────────────
  nav: {
    utilityBar: "AI Search visibility for brands that want to be found, cited, chosen",
    services: "SERVICES",
    work: "WORK",
    insights: "INSIGHTS",
    about: "ABOUT",
    cta: "BOOK A DIAGNOSIS",
    servicesTagline: "We build the surfaces machines retrieve and people trust.",
    enterOperatingRoom: "ENTER THE OPERATING ROOM",
    allServices: "ALL SERVICES",
    servicesDropdown: [
      {
        heading: "SEO",
        href: "/services#crawl",
        items: ["Technical SEO", "Content Systems", "Search Architecture", "Analytics"],
      },
      {
        heading: "AI SEARCH",
        href: "/services#retrieve",
        items: ["GEO / AIO", "AI Overviews", "Citation Visibility", "Chat Search"],
      },
      {
        heading: "WEBSITES",
        href: "/services#trust",
        items: ["Design Systems", "Next.js Development", "Conversion Pages", "Editorial Websites"],
      },
      {
        heading: "AUDITS",
        href: "/services#diagnose",
        items: ["Search Diagnosis", "AI Visibility Audit", "Website Review", "Growth Roadmap"],
      },
    ],
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: {
    line1: "You are not",
    line2: "in the",
    italic: "answer.",
    sub: "VISIBILITY SYSTEMS FOR BRANDS\nENTERING MACHINE MEMORY.",
    cta: "START A DIAGNOSIS",
  },

  // ── TheShift ────────────────────────────────────────────────────────────────
  theShift: {
    headline: "SEARCH WAS ONCE A PAGE.\nNOW IT IS AN ANSWER.\nANSWERS NEED SOURCES.",
    cta: "THE SHIFT →",
    points: [
      { year: "2000", label: "Rankings" },
      { year: "2010", label: "Traffic" },
      { year: "2020", label: "Attention" },
      { year: "2024+", label: "AI Answers" },
    ],
  },

  // ── Homepage services accordion ─────────────────────────────────────────────
  homepageServices: {
    sectionLabel: "WHAT WE BUILD",
    rows: [
      {
        num: "01",
        name: "PRESENCE",
        sub: "Appear where intent begins.",
        detail:
          "We structure your brand's content, entity data, and authority signals so it surfaces at the moment a user or AI begins forming a question — before they've finished asking it.",
      },
      {
        num: "02",
        name: "SOURCES",
        sub: "Become the material machines pull from.",
        detail:
          "AI systems cite sources. We engineer your brand to be among them — through structured data, authoritative content architecture, and cross-platform signal consistency.",
      },
      {
        num: "03",
        name: "CITATIONS",
        sub: "Turn mentions into memory.",
        detail:
          "Being mentioned is not enough. We convert brand mentions into durable citations that AI models treat as confirmed knowledge — moving you from noise to record.",
      },
      {
        num: "04",
        name: "TIMING",
        sub: "Enter before the category hardens.",
        detail:
          "The brands that dominate AI answers are the ones that entered the machine's memory early. We identify your window and execute before your competitors close it.",
      },
    ],
  },

  // ── AbsenceIndex ────────────────────────────────────────────────────────────
  absenceIndex: {
    chip: "THE ABSENCE INDEX",
    headlineRoman: "Absence",
    headlineItalic: "is measurable.",
    stat: "83%",
    copy: "OF DEFINED PROMPTS IN A CATEGORY\nCAN FORM ANSWERS WITHOUT THE\nBRANDS THAT BELIEVE THEY OWN IT.",
    cta: "SEE THE DATA →",
  },

  // ── Cases ───────────────────────────────────────────────────────────────────
  cases: {
    chip: "SELECTED PROOFS",
    viewAll: "VIEW ALL CASES",
    cards: [
      { index: "01", sector: "EDUCATION", headline: "Searchable.\nNot cited.", trace: "SOURCE SURFACE" },
      { index: "02", sector: "TRAVEL", headline: "Visible.\nNot remembered.", trace: "CATEGORY TRACE" },
      { index: "03", sector: "B2B SAAS", headline: "Mentioned.\nNot trusted.", trace: "TRUST SIGNAL" },
    ],
  },

  // ── Manifesto ───────────────────────────────────────────────────────────────
  manifesto: {
    sectionLabel: "OUR MANIFESTO",
    headlinePart1: "IF THE MODEL",
    headlinePart2: "CANNOT ",
    headlineCiteWord: "CITE",
    headlinePart3: " YOU,",
    headlinePart4: "YOU DO NOT EXIST.",
    readMore: "READ MORE →",
    contrasts: [
      { left: "NOT RANKINGS", right: "RECALL" },
      { left: "NOT TRAFFIC", right: "PRESENCE" },
      { left: "NOT CONTENT", right: "CITATIONS" },
      { left: "NOT REACH", right: "AUTHORITY" },
    ],
  },

  // ── Contact ─────────────────────────────────────────────────────────────────
  contact: {
    headlineRoman: "This is not a pitch.",
    headlineItalic: "It is a diagnosis.",
    sub: "We map your visibility across Google\nand all major AI platforms before we\ndiscuss working together.",
    successMessage: "Diagnosis requested. We’ll be in touch.",
    placeholder: "your@email.com",
    buttonIdle: "START A DIAGNOSIS",
    buttonLoading: "...",
    errorMessage: "Something went wrong. Write to hello@seeszn.com directly.",
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    location: "BERLIN — BANGKOK",
    rooms: [
      { num: "01", name: "OPERATING ROOM", href: "/services" },
      { num: "02", name: "EVIDENCE ARCHIVE", href: "/work" },
      { num: "03", name: "INTELLIGENCE ROOM", href: "/insights" },
      { num: "04", name: "OPERATING MANUAL", href: "/about" },
      { num: "05", name: "SCAN ROOM", href: "/diagnosis" },
    ],
  },

  // ── Services page ────────────────────────────────────────────────────────────
  servicesPage: {
    hero: {
      roomLabel: "SERVICES / OPERATING ROOM",
      roman1: "Visibility breaks",
      roman2: "before the customer",
      italic: "sees you.",
      sub1: "WE DIAGNOSE, REBUILD AND STRUCTURE\nTHE SURFACES MACHINES RETRIEVE\nAND PEOPLE TRUST.",
      sub2: "SEO, AI SEARCH, WEBSITES AND AUDITS —\nBUILT AS ONE VISIBILITY SYSTEM.",
      cta: "BOOK A DIAGNOSIS",
    },
    system: {
      sectionLabel: "THE SYSTEM",
      headline: "Visibility is no longer",
      headlineItalic: "one channel.",
      copy1: "IT IS A SYSTEM OF SEARCH ARCHITECTURE, MACHINE CITATION, DIGITAL SURFACES AND DIAGNOSTIC INTELLIGENCE.",
      copy2: "SEESZN CONNECTS SEO, AI SEARCH, WEBSITES AND AUDITS INTO ONE OPERATING SYSTEM — BUILT FOR HOW PEOPLE SEARCH NOW, AND HOW MACHINES RETRIEVE INFORMATION NEXT.",
      enterRoom: "ENTER THE OPERATING ROOM",
      roomsHeader: "THE FOUR ROOMS",
      roomsSubheader: "ONE SYSTEM — FOUR INSTRUMENTS",
    },
    diagnosisCta: {
      sectionLabel: "NEXT MOVE",
      headlineRoman: "Not sure where",
      headlineItalic: "visibility breaks?",
      copy: "WE MAP YOUR CURRENT SEARCH VISIBILITY,\nAI CITATION POTENTIAL, WEBSITE STRUCTURE\nAND HIGHEST-LEVERAGE NEXT MOVES.",
      cta: "BOOK A DIAGNOSIS",
      closing: "We build the surfaces machines retrieve and people trust.",
    },
    rooms: [
      {
        id: "crawl",
        index: "01",
        station: "CRAWL",
        name: "CRAWL ROOM",
        discipline: "SEO / SEARCH ARCHITECTURE",
        statementRoman: "SEO is not traffic.",
        statementItalic: "It is architecture for being understood.",
        body: "We rebuild the structure beneath visibility: technical foundations, content systems, internal links and pages that search engines can understand, index and rank.",
        deliverables: ["Technical SEO", "Search Architecture", "Internal Linking", "Content Systems", "Schema Logic", "Analytics"],
        flip: false,
      },
      {
        id: "retrieve",
        index: "02",
        station: "RETRIEVE",
        name: "RETRIEVAL ROOM",
        discipline: "AI SEARCH / GEO / AIO — MACHINE CITATION",
        statementRoman: "AI Search does not rank pages.",
        statementItalic: "It retrieves evidence.",
        body: "We prepare brands for AI-assisted discovery: query fan-outs, citation surfaces, entity-rich content and pages designed to be retrieved, trusted and referenced.",
        deliverables: ["GEO / AIO", "AI Overviews", "Query Fan-out Mapping", "Citation Surfaces", "Entity-dense Content", "Source Gap Analysis", "Chat Search Visibility"],
        flip: true,
      },
      {
        id: "trust",
        index: "03",
        station: "TRUST",
        name: "SURFACE ROOM",
        discipline: "WEBSITES / DIGITAL SURFACE",
        statementRoman: "A website is no longer a brochure.",
        statementItalic: "It is the surface machines parse and people judge.",
        body: "We design and build websites as retrieval surfaces: fast, editorial, structured and conversion-ready. A site should not only look premium — it should become usable evidence.",
        deliverables: ["Next.js Development", "Editorial Landing Pages", "Design Systems", "Conversion Pages", "CMS-ready Structures", "Performance-first Builds"],
        flip: false,
      },
      {
        id: "diagnose",
        index: "04",
        station: "DIAGNOSE",
        name: "DIAGNOSIS ROOM",
        discipline: "AUDITS / DIAGNOSTIC INTELLIGENCE",
        statementRoman: "Before we build,",
        statementItalic: "we locate the leak.",
        body: "We identify where visibility breaks: technical gaps, weak source signals, missing content surfaces and unclear conversion paths. Then we turn the diagnosis into a roadmap.",
        deliverables: ["Search Diagnosis", "AI Visibility Audit", "Website Review", "Technical Audit", "Competitor Source Map", "Growth Roadmap"],
        flip: true,
      },
    ],
  },

  // ── Work page ────────────────────────────────────────────────────────────────
  workPage: {
    hero: {
      room: "WORK / EVIDENCE ARCHIVE",
      accession: "SZN-AR-02",
      roman: ["PROOF IS WHAT", "THE SYSTEM"],
      italic: "reveals.",
      sub: ["AN ARCHIVE OF INSTRUMENTS, NOT LOGOS.", "THE FORMS OUR EVIDENCE TAKES —", "CATALOGUED LIKE SPECIMENS."],
      note: ["CLIENT READINGS REMAIN CONFIDENTIAL.", "THE INSTRUMENTS ARE PUBLIC."],
      meta: "THE EVIDENCE ARCHIVE",
      cta: { label: "BOOK A DIAGNOSIS", href: "/diagnosis" },
    },
    archive: {
      chip1: "EVIDENCE ARCHIVE",
      chip2: "SELECTED INSTRUMENTS",
    },
  },

  // ── Insights page ────────────────────────────────────────────────────────────
  insightsPage: {
    hero: {
      room: "INSIGHTS / INTELLIGENCE ROOM",
      accession: "SZN-IN-03",
      roman: ["MOST SEARCH NOW", "HAPPENS WHERE"],
      italic: "you cannot see it.",
      sub: ["FIELD NOTES FROM THE RETRIEVAL LAYER —", "WHAT AI SEARCH READS, CITES AND IGNORES,", "RECORDED IN OPERATION."],
      note: ["NO TREND ESSAYS. NO PREDICTION THEATER.", "ONLY WHAT WE VERIFY."],
      meta: "THE INTELLIGENCE ROOM",
      cta: { label: "BOOK A DIAGNOSIS", href: "/diagnosis" },
    },
    fieldNotes: {
      chip: "FIELD NOTES",
      dateLabel: "FILED 2026 — ONGOING",
      introHeadlineRoman: "We publish what we verify",
      introHeadlineItalic: "in operation.",
      introCopy: "EACH NOTE — ONE OBSERVATION, ONE OPERATIVE MOVE.\nNO ESSAYS. NO PREDICTION THEATER.",
      notes: [
        {
          id: "FN-01", cls: "RETRIEVAL",
          title: "One question becomes thirty searches.",
          abstract: "Query fan-out creates hidden search paths most brands never see.",
          observation: "AI search systems decompose a single prompt into a fan of sub-queries — comparisons, alternatives, pricing, reviews, local variants. Each path is answered separately, from different surfaces, and reassembled into one response. A brand can dominate the visible query and be absent from the fan that actually feeds the answer.",
          move: "Map the fan-out for your category before writing a single page.",
        },
        {
          id: "FN-02", cls: "CITATION",
          title: "The listicle you ignored is answering for you.",
          abstract: "Models over-cite aggregation surfaces — and someone else built them.",
          observation: "Answer engines lean on surfaces that compare and rank: listicles, category roundups, buyer's guides, forum threads. These pages get cited because they are dense, structured and already adjudicated. If the only roundup in your category was written by an affiliate site, that site speaks for your market.",
          move: "Earn placement on the surfaces models already trust — or build the definitive one.",
        },
        {
          id: "FN-03", cls: "STRUCTURE",
          title: "Machines quote paragraphs, not pages.",
          abstract: "Retrieval is chunk-level. Most pages cannot be quoted in forty words.",
          observation: "Retrieval systems split pages into passages and embed each one separately. A page wins by containing chunks that are distinct, self-sufficient and source-worthy — a definition that stands alone, a comparison that needs no context. Long undifferentiated prose embeds as noise and is never selected.",
          move: "Write in chunks: one claim, one passage, quotable without its page.",
        },
        {
          id: "FN-04", cls: "ENTITY",
          title: "If the model cannot resolve who you are, it cannot recommend you.",
          abstract: "Entity clarity decides whether mentions consolidate into memory.",
          observation: "Models build entity records from corroborating sources: consistent naming, a canonical description, aligned profiles, third-party confirmation. Inconsistent naming and thin corroboration split a brand into fragments too weak to cite. Mentions then accrue to the category — not to you.",
          move: "One canonical entity record, corroborated everywhere it counts.",
        },
        {
          id: "FN-05", cls: "STRUCTURE",
          title: "Schema is grammar, not strategy.",
          abstract: "Markup makes statements legible. It does not make them credible.",
          observation: "Structured data tells a parser what a statement is — it does not supply the evidence that makes the statement quotable. Schema applied to thin content is a well-formatted absence. The order of operations matters: evidence first, structure second, markup last.",
          move: "Structure follows evidence. Never the reverse.",
        },
        {
          id: "FN-06", cls: "TRUST",
          title: "Speed is a trust signal before it is a ranking factor.",
          abstract: "A slow surface reads as a neglected one — to people and to crawlers.",
          observation: "Latency shapes judgment in the first contact: visitors read slowness as neglect, and crawl systems allocate attention away from surfaces that waste their budget. Performance is not a technical afterthought; it is part of how credibility is rendered.",
          move: "Treat performance as brand, budgeted like design.",
        },
        {
          id: "FN-07", cls: "SURFACE",
          title: "Your category page is a retrieval surface.",
          abstract: "Commercial fan-out paths retrieve category pages. Most are thin grids.",
          observation: "When the fan-out turns commercial — best, versus, alternatives, pricing — systems retrieve category and service pages. Most are product grids with no statements worth quoting. A category page that defines, compares and proves becomes the fragment the answer is built from.",
          move: "Rebuild category pages as evidence: definitions, comparisons, proof.",
        },
        {
          id: "FN-08", cls: "RETRIEVAL",
          title: "Answers are assembled, not found.",
          abstract: "An AI answer is a composite of fragments from several surfaces.",
          observation: "No single page wins an AI answer. The system assembles fragments — a definition from one surface, a comparison from another, a price from a third — and cites the usable ones. Presence means being a fragment the assembly cannot skip.",
          move: "Design pages as fragment libraries, not narratives.",
        },
      ],
    },
    scanCta: {
      roman: "Reading is not",
      italic: "visibility.",
      sub: ["THE NOTES ARE GENERAL.", "YOUR LEAK IS SPECIFIC."],
      closing: "We build the surfaces machines retrieve and people trust.",
    },
  },

  // ── About page ────────────────────────────────────────────────────────────────
  aboutPage: {
    hero: {
      room: "ABOUT / OPERATING MANUAL",
      accession: "SZN-OM-04",
      roman: ["WE OPERATE WHERE", "MACHINES DECIDE"],
      italic: "what people see.",
      sub: ["SEESZN IS A VISIBILITY STUDIO —", "STRATEGY, SEARCH, DESIGN AND ENGINEERING", "OPERATING AS ONE SYSTEM."],
      note: ["THIS PAGE IS THE MANUAL.", "THE READING OF YOUR SURFACE IS PRIVATE."],
      meta: "THE OPERATING MANUAL",
      cta: { label: "BOOK A DIAGNOSIS", href: "/diagnosis" },
    },
    scanCta: {
      roman: "The manual is public.",
      italic: "The reading is private.",
      sub: ["WE MAP YOUR SURFACE BEFORE", "WE DISCUSS WORKING TOGETHER."],
      closing: "We build the surfaces machines retrieve and people trust.",
    },
    manual: {
      premise: {
        label: "THE PREMISE",
        headlineRoman: "Search became retrieval.",
        headlineItalic: "Ranking became citation.",
        copy1: "ANSWERS ARE ASSEMBLED FROM SURFACES MACHINES TRUST. THE BRANDS THAT REMAIN VISIBLE ARE READABLE, VERIFIABLE AND QUOTABLE — TO PARSERS AND TO PEOPLE.",
        copy2: "WE BUILD FOR BOTH READERS. THAT IS THE ENTIRE STUDIO.",
      },
      model: {
        label: "THE MODEL",
        rightLabel: "ONE LOOP — NOT A FUNNEL",
        phases: [
          { name: "DIAGNOSE", desc: "Locate where visibility breaks before any work begins." },
          { name: "ARCHITECT", desc: "Structure entities, pages and paths for retrieval." },
          { name: "BUILD", desc: "Design and engineer the surface — fast, editorial, legible." },
          { name: "OBSERVE", desc: "Watch answers, citations and conversion. Correct the system." },
        ],
      },
      principles: {
        label: "PRINCIPLES",
        items: [
          { name: "STRUCTURE BEFORE SCALE", gloss: "Content volume without architecture is noise the machine skips." },
          { name: "RETRIEVAL BEFORE REACH", gloss: "Be quotable before being loud." },
          { name: "EVIDENCE OVER OPINION", gloss: "We read systems. We do not guess at them." },
          { name: "ONE SYSTEM, NOT SILOS", gloss: "SEO, AI search and the website are the same surface." },
          { name: "TASTE IS A PERFORMANCE SYSTEM", gloss: "Restraint, hierarchy and speed are what conversion feels like." },
          { name: "SPEED IS PART OF TRUST", gloss: "A slow surface reads as a neglected one." },
        ],
      },
      refusals: {
        label: "REFUSALS",
        rightLabel: "REFUSAL IS A DESIGN TOOL",
        headlineRoman: "What we decline",
        headlineItalic: "defines the work.",
        items: [
          { name: "Work without a diagnosis", gloss: "We do not build before we locate the leak." },
          { name: "Keyword volume as strategy", gloss: "Volume feeds dashboards, not answers." },
          { name: "Dashboards instead of decisions", gloss: "A metric is not a move." },
          { name: "AI theater", gloss: "No glow, no magic, no neon intelligence." },
          { name: "Brochure websites", gloss: "A surface that cannot be retrieved is decoration." },
          { name: "Growth language", gloss: "Nothing is boosted, unlocked or taken to the next level." },
        ],
      },
      unit: {
        label: "THE UNIT",
        headlineRoman: "A small unit.",
        headlineItalic: "One table.",
        copy1: "STRATEGY, SEARCH ARCHITECTURE, EDITORIAL DESIGN AND ENGINEERING — OPERATING BETWEEN BERLIN AND BANGKOK.",
        copy2: "SENIOR ONLY. NO HANDOFFS. NO ACCOUNT LAYERS.\nTHE PEOPLE WHO DIAGNOSE YOUR SURFACE BUILD IT.",
      },
    },
  },

  // ── Diagnosis page ────────────────────────────────────────────────────────────
  diagnosisPage: {
    hero: {
      room: "DIAGNOSIS / SCAN ROOM",
      accession: "SZN-SC-05",
      roman: ["BEFORE WE BUILD,", "WE LOCATE"],
      italic: "the leak.",
      sub: ["A DIAGNOSIS, NOT A PITCH.", "WE MAP WHERE YOUR VISIBILITY BREAKS", "BEFORE WE DISCUSS WORKING TOGETHER."],
      meta: "THE SCAN ROOM",
    },
    intakeForm: {
      headerLeft: "SCAN INTAKE — NEW SPECIMEN",
      field1Label: "FIELD 01 — CONTACT",
      field1Required: "REQUIRED",
      field2Label: "FIELD 02 — SURFACE",
      field2Optional: "OPTIONAL",
      field3Label: "FIELD 03 — SUSPECTED LEAK",
      field3Optional: "OPTIONAL",
      suspects: ["SEARCH RANKINGS", "AI ANSWERS", "WEBSITE", "CONVERSION", "UNKNOWN"],
      submitIdle: "REQUEST THE SCAN",
      submitLoading: "TRANSMITTING…",
      errorMessage: "TRANSMISSION FAILED. WRITE TO ",
      doneTitle: "INTAKE RECEIVED.",
      doneCopy: "Your surface enters the scan. We reply from hello@seeszn.com — a reading, not a pitch.",
      footerLeft: "NO PITCH DECK. NO RETAINER TALK.",
      footerRight: "A READING OF YOUR SURFACE",
    },
    protocol: {
      measuresLabel: "WHAT THE SCAN READS",
      measuresRight: "FIVE MEASURES — ONE SURFACE",
      measures: [
        { name: "CRAWL", question: "Can machines walk your structure?", reads: "INDEX ROUTES · DEPTH · DEAD ENDS · ORPHANS" },
        { name: "ENTITY", question: "Does the machine know who you are?", reads: "CANONICAL RECORD · NAMING · CORROBORATION" },
        { name: "CITATION", question: "Do answers quote you?", reads: "FAN-OUT COVERAGE · SOURCE SURFACES · GAPS" },
        { name: "TRUST", question: "Does the surface read as credible?", reads: "SPEED · CLARITY · EVIDENCE DESIGN" },
        { name: "CONVERSION", question: "Does retrieval become revenue?", reads: "ANSWER-TO-ACTION PATH · LANDING EVIDENCE" },
      ],
      stepsLabel: "THE PROTOCOL",
      stepsRight: "FOUR STEPS — ONE DIAGNOSIS",
      steps: [
        { name: "INTAKE", desc: "You send the surface. One email, one domain — that is enough to begin." },
        { name: "SCAN", desc: "We read it across search and AI systems: structure, entities, citations, trust, conversion." },
        { name: "READING", desc: "You receive the leak map — where visibility breaks, and why. In plain language." },
        { name: "ROADMAP", desc: "The highest-leverage moves, sequenced. Whether we build them together is a separate decision." },
      ],
      mailNote: "PREFER MAIL?",
    },
  },

  // ── Common ──────────────────────────────────────────────────────────────────
  common: {
    bookDiagnosis: "BOOK A DIAGNOSIS",
    nextMove: "NEXT MOVE",
    railLabel: "OPERATING LINE",
  },
};

export type Translations = typeof en;
