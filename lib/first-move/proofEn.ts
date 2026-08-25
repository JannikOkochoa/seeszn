// ─── First Move: Proof, englische Fassung ─────────────────────────────────────
// Dieselben drei Fälle, dieselben Messwerte, englische Sprache und englische
// Zahlenschreibweise (Punkt als Dezimaltrenner).
//
// Zwei Regeln bleiben unverändert und sind hier strenger umgesetzt als in der
// deutschen Quelle:
//
//   1. Anonymisierung. Die englischen Anzeigenamen sind ausschließlich
//      "Tourism · DACH", "Paid Acquisition · NDA" und
//      "E-Commerce · International". Kein Kundenname, keine Branche unterhalb
//      dieser Ebene. Der Tourismusfall wird nie über Schulen, Lehrkräfte oder
//      Klassenfahrten beschrieben.
//   2. Keine zweite Wahrheit. Die Zahlen stammen aus ./proof und werden hier nur
//      umgeschrieben. tests/home-locales.test.mjs vergleicht die Ziffernfolgen
//      beider Fassungen, damit eine englische Zahl nicht wegdriften kann.

import { PROOF_CASES, type ProofCase } from "./proof";

export const PROOF_CASES_EN: Record<ProofCase["id"], ProofCase> = {
  transform: {
    ...PROOF_CASES.transform,
    name: "Tourism · DACH",
    descriptor: "SEO + AI Search",
    leadValue: "5.3 → 2.2",
    leadCaption: "Average Position in AI Search",
    secondary: [{ value: "45 days", caption: "Measurement period" }],
    note: "Client confidential",
    imageAlt: "Mediterranean coastline with rocks in the water, the motif of the tourism case.",
    evidence: [
      { label: "Window", value: "45 days, measured before and after" },
      {
        label: "Metric",
        value: "Average position of the brand inside a constant prompt set",
      },
      { label: "Sources", value: "ChatGPT, Gemini, Perplexity, Google AI Overviews" },
      {
        label: "Method",
        value:
          "The same prompt set, the same measurement logic and the same evaluation before and after implementation. No prompts were added afterwards.",
      },
      {
        label: "Limits",
        value:
          "Answer systems are not deterministic. The number describes the measured change inside the prompt set, never a guaranteed mention.",
      },
    ],
  },
  build: {
    ...PROOF_CASES.build,
    name: "E-Commerce · International",
    descriptor: "SEO + GEO",
    leadValue: "3.59K",
    leadCaption: "Organic Clicks in 3 months",
    secondary: [{ value: "752K", caption: "Google Impressions" }],
    imageAlt: "Product shot from the shop's range.",
    evidence: [
      { label: "Window", value: "3 months after the search surface was built" },
      {
        label: "Metric",
        value:
          "Organic clicks as the lead metric, impressions as context. Average position across all queries sat at 7.1 and is documented as context only.",
      },
      { label: "Source", value: "Google Search Console, the shop's own property" },
      {
        label: "Method",
        value:
          "Search architecture and citable content built for an internationally oriented shop. Clicks are the lead metric because they show actual demand.",
      },
    ],
  },
  scale: {
    ...PROOF_CASES.scale,
    name: "Paid Acquisition · NDA",
    descriptor: "DACH · Google Ads",
    leadValue: "€2.5m to €3.0m",
    leadCaption: "Annual Media Spend",
    secondary: [
      { value: "€167 to €216 → €100 to €130", caption: "CPL" },
      { value: "14K → 37K", caption: "Conversion Value" },
    ],
    note: "Client confidential",
    attribution: "Led by Philipp Ehrhardt · Paid Acquisition at SEESZN",
    imageAlt: "Working environment of the European B2B workspace brand.",
    evidence: [
      { label: "Window", value: "2020 to 2025" },
      { label: "Metrics", value: "Cost per lead and conversion value inside the Google Ads account" },
      { label: "Source", value: "The client's Google Ads account" },
      {
        label: "Attribution",
        value:
          "Led by Philipp Ehrhardt, today full-time Paid Acquisition at SEESZN. The work began before his time at SEESZN; the capability is part of the team now.",
      },
      {
        label: "Limits",
        value:
          "Across five years the market, the product and demand all play a part. We report the paid metrics, never a total company effect.",
      },
    ],
  },
};
