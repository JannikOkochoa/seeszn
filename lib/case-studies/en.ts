// ─── Case Study: SEO + AIO in Tourism — English edition ──────────────────────
// A real localisation of the German case study, not a translation layer. Same
// structure, same data, same sources. Only the language differs.
//
// WRITING RULES ENFORCED HERE
// - American English, matching the rest of the English SEESZN surface
//   (the existing English copy uses "color", "optimization", "organization").
// - No em dash anywhere in public copy. Sentences are split or use a colon.
// - No Oxford comma: "ChatGPT, Gemini, Perplexity and Google AI Overviews".
// - English number formatting: 5.3 / 2.2 / 26.1 / 25.9% / 3.7% / 1,079 KB.
//
// ANONYMISATION
// The client is only ever "an established tourism provider". No name, no
// domain, no cities, in copy or metadata or structured data.

import type { CaseContent, SourceRef } from "./types";
import { CASE_PATH, CASE_PATH_EN, VALUES, AI_SYSTEMS } from "./de";

// ── Canonical figures, English formatting ────────────────────────────────────
export const FIGURES_EN = {
  aiPositionBefore: "5.3",
  aiPositionAfter: "2.2",
  aiWindowDays: "45",
  medianTargets: "26.1",
  top3TargetsNum: "17",
  top3TargetsDen: "1,000",
  impressionShare: "25.9",
  clickShare: "3.7",
  clicksYoY: "20.5",
  impressionsYoY: "21.3",
  ctrBefore: "1.11",
  ctrAfter: "1.12",
} as const;

const F = FIGURES_EN;

const AI_SYSTEMS_LINE = AI_SYSTEMS.join(" · ");
/** No Oxford comma before "and". */
const AI_SYSTEMS_PROSE = `${AI_SYSTEMS.slice(0, -1).join(", ")} and ${AI_SYSTEMS[AI_SYSTEMS.length - 1]}`;

const SOURCES: Record<string, SourceRef> = {
  "GSC-A": {
    code: "GSC-A",
    label: "Google Search Console · domain property · web search",
    window: "11 Mar 2025 to 10 Jul 2026",
  },
  "GSC-B": {
    code: "GSC-B",
    label: "Google Search Console · domain property · monthly aggregation",
    window: "1 Jul 2025 to 30 Jun 2026",
  },
  LIVE: {
    code: "LIVE",
    label: "Direct request to the live site",
    window: "8 Aug 2026",
  },
  AIM: {
    code: "AIM",
    label: "SEESZN AI Search monitoring · consistent prompt set",
    window: "45 days",
  },
};

const H1_TEXT = `From avg. position ${F.aiPositionBefore} to ${F.aiPositionAfter} in AI Search.`;

export const en: CaseContent = {
  locale: "en",
  path: CASE_PATH_EN,
  altPath: CASE_PATH,
  indexPath: "/en/work",
  sources: SOURCES,

  hero: {
    eyebrow: "Case Study · SEO + AIO · Tourism",
    breadcrumb: ["Case Studies", "SEO + AIO", "Tourism"],
    h1Lead: "From avg. position",
    h1Join: " to ",
    h1Tail: "in AI Search.",
    days: `In ${F.aiWindowDays} days.`,
    supporting:
      "How SEESZN systematically increased the visibility of an established tourism provider across Google and AI Search.",
    systems: `Google Search · ${AI_SYSTEMS_LINE}`,
    meta: [
      { key: "Market", value: "DACH" },
      { key: "Period", value: "Jul 2026 · ongoing" },
      { key: "Client", value: "Anonymized" },
    ],
    scrollLink: { label: "See the result", href: "#ergebnis" },
    image: {
      src: "/Hero-Bild.png",
      width: 1122,
      height: 1402,
      alt: "Rock formations in the sea in front of a weathered Mediterranean wall with a palm frond.",
    },
  },

  quickFacts: {
    label: "Overview",
    headline: ["The case in", "20 seconds."],
    facts: [
      { key: "Industry", value: "Tourism" },
      { key: "Market", value: "DACH" },
      { key: "Starting point", value: "Established provider with untapped search potential", wide: true },
      { key: "Goal", value: "Increase visibility across Google and AI Search" },
      { key: "Approach", value: "SEO + AIO / GEO" },
      { key: "Systems", value: AI_SYSTEMS_LINE, wide: true },
      { key: "Result", value: `Avg. ${F.aiPositionBefore} → ${F.aiPositionAfter}` },
      { key: "Timeframe", value: `${F.aiWindowDays} days` },
      { key: "Client", value: "Anonymized" },
    ],
  },

  baseline: {
    label: "Starting point",
    headline: "Visible. Still far below its potential.",
    copy: "The provider was established, demand existed and many relevant pages were already visible in Google. The problem: that visibility rarely turned into top positions and clicks. At the same time AI Search emerged as a second channel, where recommendations and sources are distributed differently.",
    metrics: [
      {
        id: "median",
        value: { value: F.medianTargets, verified: true, publicApproved: true },
        label: "Median position of target pages",
        note: "Median position across 1,000 queries in the target-page directory.",
        source: "GSC-A",
      },
      {
        id: "top3",
        value: {
          value: `${F.top3TargetsNum} / ${F.top3TargetsDen}`,
          verified: true,
          publicApproved: true,
        },
        label: "Target-page queries in the top 3",
        note: "Position 3.0 or better, measured across the 1,000 highest-click queries in the directory.",
        source: "GSC-A",
      },
      {
        id: "share",
        value: {
          value: `${F.impressionShare}% → ${F.clickShare}%`,
          verified: true,
          publicApproved: true,
        },
        label: "Share of impressions → share of clicks",
        note: "Share of all domain impressions and all domain clicks coming from target pages, June 2026.",
        source: "GSC-B",
      },
    ],
    conclusion:
      "Demand already existed. The client simply was not being found often enough where decisions were made.",
    gap: {
      caption: "Share of domain impressions and clicks coming from target pages, June 2026.",
      sourceNote: "Source: GSC-B.",
      bars: [
        { id: "impressions", label: "Impressions", value: VALUES.impressionShare, display: `${F.impressionShare}%` },
        { id: "clicks", label: "Clicks", value: VALUES.clickShare, display: `${F.clickShare}%` },
      ],
      punchline: "Reach was there. Traffic was not.",
    },
    historicalNote: `At the start of the project, organic clicks were ${F.clicksYoY}% and impressions ${F.impressionsYoY}% below the previous year, while the click-through rate stayed almost flat at ${F.ctrBefore}% versus ${F.ctrAfter}%.`,
  },

  findings: {
    label: "Findings",
    headline: "Four things were limiting visibility.",
    items: [
      {
        index: "01",
        title: "Technical SEO",
        text: "At decisive points, search engines were handed an unnecessarily complicated website: inconsistent heading structures, crawl issues, duplicated elements and very large HTML documents.",
      },
      {
        index: "02",
        title: "Content & search intent",
        text: "Relevant demand existed but was not consistently routed to the right pages and answers.",
      },
      {
        index: "03",
        title: "Internal authority",
        text: "Commercially important pages did not always receive the internal support their role deserved.",
      },
      {
        index: "04",
        title: "AI Search",
        text: "The brand, its services, facts and answers were not yet set up to be recognized, attributed and used as a source by generative search systems.",
      },
    ],
  },

  changes: {
    label: "What we changed",
    headline: "SEO and AI Search as one system.",
    intro:
      "We did not treat Google and AI Search as two separate disciplines. Technical SEO, content, information architecture, entities, internal linking and external sources were optimized as one connected search system.",
    items: [
      {
        index: "01",
        title: "Technical foundation",
        text: "Crawlability, indexing, heading structure and technical inconsistencies were addressed systematically.",
      },
      {
        index: "02",
        title: "Search intent",
        text: "Existing demand was identified and important target pages were aimed more precisely at the intent behind those searches.",
      },
      {
        index: "03",
        title: "Information architecture",
        text: "Commercially important pages were connected more strongly and internal authority was distributed with more intent.",
      },
      {
        index: "04",
        title: "Citable answers",
        text: "Facts, questions and entities were structured more clearly while longer content was broken into clearly defined topic and answer sections. This makes individual pieces of information easier for traditional search engines and generative systems to understand, retrieve and cite.",
      },
      {
        index: "05",
        title: "External validation",
        text: "Not simply more links. Relevant third-party sources, industry context and verifiable brand signals were strengthened deliberately.",
      },
    ],
    definition:
      "AIO, or AI Optimization, is also commonly referred to as GEO or Generative Engine Optimization. We do not treat it as a separate hack. Strong AI visibility builds on a solid technical foundation, clear content, well-defined entities and credible external validation.",
  },

  result: {
    label: "The result",
    eyebrow: "The result",
    headline: "Top 3 in AI Search.",
    from: { value: F.aiPositionBefore, verified: true, publicApproved: true },
    to: { value: F.aiPositionAfter, verified: true, publicApproved: true },
    averagePrefix: "Avg.",
    subline: `Average brand position within ${F.aiWindowDays} days.`,
    statement: `Across the consistently monitored prompt set, the brand's average position improved from ${F.aiPositionBefore} to ${F.aiPositionAfter} within ${F.aiWindowDays} days. The monitoring covered ${AI_SYSTEMS_PROSE}.`,
    caption: `Lower is better. The measurement includes the start and end values of the ${F.aiWindowDays}-day window. The path between them visualizes the change and does not represent individual measurements.`,
    daysLabel: `${F.aiWindowDays} days`,
    axis: { top: "Position 1", bottom: "Position 7", top3: "Top 3" },
    meta: [
      { key: "Systems", value: AI_SYSTEMS_LINE },
      { key: "Metric", value: "Average brand position across the prompt set" },
      { key: "Source", value: `${SOURCES.AIM.code} · ${SOURCES.AIM.label}` },
    ],
  },

  difference: {
    label: "Impact",
    headline: "What made the difference.",
    items: [
      {
        index: "01",
        title: "Relevance over content volume",
        text: "Not more pages at any cost. Answering the search intents that matter, better.",
      },
      {
        index: "02",
        title: "Your own site plus external validation",
        text: "A brand does not become credible purely through what it writes about itself. Relevant third-party sources and consistent information strengthen how it is understood.",
      },
      {
        index: "03",
        title: "Google and AI as one problem",
        text: "Technical SEO, content, entities, internal linking and external sources were not treated as five separate projects but as one search system.",
      },
    ],
    image: {
      src: "/Food-&-Wine_Bild.png",
      width: 1086,
      height: 1448,
      alt: "A wine bottle, glass and lemon on a marble surface next to a menu.",
    },
  },

  proof: {
    label: "Technical proof",
    headline: "What the source code showed.",
    railNote:
      "Four findings, each checked directly against the live site on 8 Aug 2026. This is what was found, not what has already been fixed.",
    gapLabel: "h2 missing",
    proofs: [
      {
        id: "heading",
        kind: "heading",
        label: "Heading structure",
        date: "8 Aug 2026",
        rows: [
          { key: "Document flow", value: "h1 → h3", code: true },
          { key: "Marked up as divs", value: 'div class="h2" ×4 · div class="h3" ×27–39', code: true },
          { key: "Real h2 before first h3", value: "0", code: true },
          { key: "Pages checked", value: "3 target pages using the same template" },
        ],
        note: "Visually structured. Semantically flat.",
        source: "LIVE",
        verified: true,
        publicApproved: true,
      },
      {
        id: "duplicate",
        kind: "duplicate",
        label: "Duplicate heading",
        date: "8 Aug 2026",
        rows: [
          { key: "Element", value: "<h2>[review heading]</h2>", code: true },
          { key: "Occurrences", value: "2 × per page", code: true },
          { key: "Cause", value: "Review overlay in the template" },
          { key: "Affected", value: "3 of 3 pages checked" },
        ],
        note: "The same heading appears twice in the document. The second one comes from an overlay that is always shipped in the source.",
        source: "LIVE",
        verified: true,
        publicApproved: true,
      },
      {
        id: "crawl",
        kind: "crawl",
        label: "Crawl rules",
        date: "8 Aug 2026",
        rows: [
          { key: "robots.txt", value: "Disallow: *cHash*", code: true },
          { key: "Exception", value: "Allow: *sitemap.xml*cHash*", code: true },
          { key: "Sitemap index", value: "…/sitemap.xml?sitemap=[type]&amp;cHash=[hash]", code: true },
        ],
        note: "The parameter type carried by the sitemap entries themselves is blocked site-wide. Only the preceding exception keeps the sitemaps reachable.",
        source: "LIVE",
        verified: true,
        publicApproved: true,
      },
      {
        id: "weight",
        kind: "weight",
        label: "Document size",
        date: "8 Aug 2026",
        rows: [
          { key: "Target page A", value: "1,079 KB HTML", code: true },
          { key: "Target page B", value: "704 KB HTML", code: true },
          { key: "Target page C", value: "655 KB HTML", code: true },
        ],
        note: "Delivered HTML only, without images, JavaScript and stylesheets. The largest document passes one megabyte before a single asset loads.",
        source: "LIVE",
        verified: true,
        publicApproved: true,
      },
    ],
    weights: [
      { label: "Target page A", kb: VALUES.weights[0], display: "1,079 KB" },
      { label: "Target page B", kb: VALUES.weights[1], display: "704 KB" },
      { label: "Target page C", kb: VALUES.weights[2], display: "655 KB" },
    ],
  },

  method: {
    label: "Methodology",
    headline: "How we measure.",
    copy: "AI responses are not fully deterministic. That is why we do not compare isolated screenshots. We use a consistent prompt set across defined measurement windows.",
    facts: [
      { key: "Prompt set", value: "Consistent across the comparison window" },
      { key: "Systems", value: AI_SYSTEMS_LINE },
      { key: "Metric", value: "Average brand position within the defined set" },
      { key: "Comparison", value: "Same measurement setup before and after the work" },
      { key: "Timeframe", value: `${F.aiWindowDays} days` },
    ],
    detailsLabel: "Methodology in detail",
    criteria: [
      { key: "Measurement window", value: "Length and timing of the window, matched to how long an effect takes." },
      { key: "Baseline stability", value: "If the starting value swings widely, the comparison says less." },
      { key: "Site-wide trend", value: "If the whole domain moves in the same period, that is factored in." },
      { key: "Seasonality", value: "Tourism is seasonal. Comparison periods are chosen accordingly." },
      { key: "Parallel work", value: "When several measures run at once, attribution gets weaker." },
      { key: "Data quality", value: "Tracking, access to raw data and completeness of the series." },
      { key: "Sample size", value: "How many prompts or queries the set covers." },
    ],
    caveat:
      "These criteria describe how firmly we hold an attribution. They are not statistical significance and claim no certainty the data cannot support.",
  },

  takeaways: {
    label: "Takeaways",
    headline: "Three things that mattered.",
    items: [
      {
        index: "01",
        title: "Reach alone does not create traffic.",
        text: `${F.impressionShare}% of domain impressions came from relevant target pages but they generated only ${F.clickShare}% of clicks.`,
      },
      {
        index: "02",
        title: "Visual structure is not the same as technical structure.",
        text: "On the pages reviewed, the visual hierarchy existed while the HTML document flow jumped directly from h1 to h3.",
      },
      {
        index: "03",
        title: "AI visibility is not built on your own website alone.",
        text: "Clear first-party content is the foundation. Credible external sources also help search systems understand a brand and its expertise consistently.",
      },
    ],
  },

  cta: {
    label: "Next step",
    headline: "How visible is your business?",
    copy: "Find out where your brand currently stands across Google and AI Search and where you are leaving visibility on the table.",
    primary: { label: "Check your visibility", href: "/en/diagnosis" },
    systems: `Google · ${AI_SYSTEMS_LINE}`,
    relatedLabel: "Keep reading",
    related: [
      { label: "Insights", href: "/en/insights" },
      { label: "How we work", href: "/en/services" },
      { label: "All case studies", href: "/en/work" },
    ],
    image: {
      src: "/closing-bild.png",
      width: 1672,
      height: 941,
      alt: "A small boat on dark water below a steep rocky coastline.",
    },
  },

  meta: {
    title: `SEO & AIO Case Study: Avg. Position ${F.aiPositionBefore} to ${F.aiPositionAfter} | SEESZN`,
    description: `How SEESZN moved a tourism provider from an average position of ${F.aiPositionBefore} to ${F.aiPositionAfter} in AI Search within ${F.aiWindowDays} days using SEO, AIO/GEO and technical optimization.`,
    ogTitle: `From Avg. Position ${F.aiPositionBefore} to ${F.aiPositionAfter} in AI Search.`,
    ogDescription: `SEO + AIO case study for an established tourism provider with measurable progress across ${AI_SYSTEMS_PROSE}.`,
    ogImage: "/Hero-Bild.png",
    datePublished: "2026-08-08",
    dateModified: "2026-08-08",
    h1Text: H1_TEXT,
    about: [
      "Search Engine Optimization",
      "AI Search",
      "AI Optimization",
      "Generative Engine Optimization",
      "Tourism",
    ],
    breadcrumbHomeLabel: "Home",
    breadcrumbIndexLabel: "Case Studies",
    breadcrumbLeafLabel: "SEO + AIO Tourism",
  },
};
