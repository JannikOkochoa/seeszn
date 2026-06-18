// ─── The Visibility Operating Room — service system data ─────────────────────
//
// Copy system (used consistently across nav, /services and future pages):
//   SEO        = CRAWL     / SEARCH ARCHITECTURE
//   AI Search  = RETRIEVE  / MACHINE CITATION
//   Websites   = TRUST     / DIGITAL SURFACE
//   Audits     = DIAGNOSE  / DIAGNOSTIC INTELLIGENCE

export type RoomVisualKind = "crawl" | "fanout" | "layers" | "report";

export interface Room {
  /** anchor id — also used by nav deep links (/services#crawl) */
  id: string;
  index: string;
  /** station name on the Operating Line */
  station: string;
  name: string;
  discipline: string;
  /** [roman sentence, italic sentence] of the editorial statement */
  statement: [string, string];
  body: string;
  deliverables: string[];
  visual: RoomVisualKind;
  /** alternate the editorial grid — visual on the left */
  flip: boolean;
}

export const ROOMS: Room[] = [
  {
    id: "crawl",
    index: "01",
    station: "CRAWL",
    name: "CRAWL ROOM",
    discipline: "SEO / SEARCH ARCHITECTURE",
    statement: ["SEO is not traffic.", "It is architecture for being understood."],
    body: "We rebuild the structure beneath visibility: technical foundations, content systems, internal links and pages that search engines can understand, index and rank.",
    deliverables: [
      "Technical SEO",
      "Search Architecture",
      "Internal Linking",
      "Content Systems",
      "Schema Logic",
      "Analytics",
    ],
    visual: "crawl",
    flip: false,
  },
  {
    id: "retrieve",
    index: "02",
    station: "RETRIEVE",
    name: "RETRIEVAL ROOM",
    discipline: "AI SEARCH / GEO / AIO · MACHINE CITATION",
    statement: ["AI Search does not rank pages.", "It retrieves evidence."],
    body: "We prepare brands for AI-assisted discovery: query fan-outs, citation surfaces, entity-rich content and pages designed to be retrieved, trusted and referenced.",
    deliverables: [
      "GEO / AIO",
      "AI Overviews",
      "Query Fan-out Mapping",
      "Citation Surfaces",
      "Entity-dense Content",
      "Source Gap Analysis",
      "Chat Search Visibility",
    ],
    visual: "fanout",
    flip: true,
  },
  {
    id: "trust",
    index: "03",
    station: "TRUST",
    name: "SURFACE ROOM",
    discipline: "WEBSITES / DIGITAL SURFACE",
    statement: [
      "A website is no longer a brochure.",
      "It is the surface machines parse and people judge.",
    ],
    body: "We design and build websites as retrieval surfaces: fast, editorial, structured and conversion-ready. A site should not only look premium, it should become usable evidence.",
    deliverables: [
      "Next.js Development",
      "Editorial Landing Pages",
      "Design Systems",
      "Conversion Pages",
      "CMS-ready Structures",
      "Performance-first Builds",
    ],
    visual: "layers",
    flip: false,
  },
  {
    id: "diagnose",
    index: "04",
    station: "DIAGNOSE",
    name: "DIAGNOSIS ROOM",
    discipline: "AUDITS / DIAGNOSTIC INTELLIGENCE",
    statement: ["Before we build,", "we locate the leak."],
    body: "We identify where visibility breaks: technical gaps, weak source signals, missing content surfaces and unclear conversion paths. Then we turn the diagnosis into a roadmap.",
    deliverables: [
      "Search Diagnosis",
      "AI Visibility Audit",
      "Website Review",
      "Technical Audit",
      "Competitor Source Map",
      "Growth Roadmap",
    ],
    visual: "report",
    flip: true,
  },
];
