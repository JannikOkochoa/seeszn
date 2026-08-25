// ─── Startseite, englische Fassung ────────────────────────────────────────────
// Dieselbe Sequenz, dieselbe Bedeutung, eine eigene Stimme. Das hier ist keine
// Wort-für-Wort-Übersetzung der deutschen Fassung: englische Sätze sind kürzer
// gebaut, und was im Deutschen mit "ihr" arbeitet, spricht hier die Person an.
//
// Unverändert bleiben: Produktname, Systemlabels, Reihenfolge der Abschnitte,
// Zahlen und Zusagen. "First Move" wird nie übersetzt.
//
// Schreibregeln wie in der deutschen Fassung, zusätzlich für Englisch:
//   - kein Oxford-Komma vor "and"
//   - kein Gedankenstrich
//   - keine "not X, but Y"-Konstruktion
//   - SEESZN ist nie eine agency und nie ein studio

import {
  CLIENT_EFFORT_MINUTES,
  DELIVERY_DAYS_MAX,
  DELIVERY_DAYS_MIN,
  MEASUREMENT_WEEKS_MAX,
  MEASUREMENT_WEEKS_MIN,
} from "@/lib/first-move/product";
import {
  INCLUDED_EN,
  OFFER_FACTS_EN,
  PRICE_DISPLAY_NET_EN,
  PRICE_FRAME_EN,
  PRICE_PROMISE_EN,
  PRODUCT_DEFINITION_EN,
  REASSURANCE_EN,
  RISK_REVERSAL_FULL_EN,
} from "@/lib/first-move/productEn";
import { SCAN_STAGE_STATES } from "./stages";
import type { HomeContent } from "./types";

export const homeEn: HomeContent = {
  locale: "en",
  homePath: "/en",

  hero: {
    eyebrow: "THE FIRST MOVE",
    line1: "Find the move",
    line2: "that changes",
    accent: "the curve.",
    ghost: "CURVE",
    lead: `SEESZN reads Search, AI Search and Google Ads, ranks the strongest evidence-backed constraint, then ships one measurable intervention in ${DELIVERY_DAYS_MIN}–${DELIVERY_DAYS_MAX} business days.`,
    fieldLabel: "Your domain",
    placeholder: "your-domain.com",
    cta: "FIND MY FIRST MOVE",
    ctaShort: "FIRST MOVE",
    ctaBusy: "CHECK RUNNING",
    micro: "No email before the result · Public signals first · Your data stays in the EU",
    emptyError: "Please enter a domain, for example your-domain.com",
    scanFailed: "The check failed. Please try again.",
  },

  trustStrip: [
    `${DELIVERY_DAYS_MIN}–${DELIVERY_DAYS_MAX} BUSINESS DAYS`,
    `≤${CLIENT_EFFORT_MINUTES} MIN FROM YOU`,
    "IMPLEMENTATION + QA",
    `${MEASUREMENT_WEEKS_MIN}–${MEASUREMENT_WEEKS_MAX} WEEK MEASUREMENT`,
  ],

  constraint: {
    index: "01",
    label: "THE CONSTRAINT",
    line1: "Three growth systems.",
    line2: "No clear first decision.",
    body: "Search, AI Search and Google Ads usually sit in separate roadmaps. Each list looks reasonable on its own. Which single change works first is answered by none of them.",
    note: "The First Move answers that question before budget starts moving.",
    surfacesLabel: "SURFACES WE READ",
    surfaces: ["SEARCH", "AI SEARCH", "GOOGLE ADS"],
  },

  scan: {
    index: "02",
    label: "THE READ",
    title: "The finding first, then the Move.",
    question: "Where is growth being left behind?",
    sub: "One domain is enough. The first reading appears right here on this page.",
    instrumentLabel: "Visibility check",
    free: "Free",
    cta: "Run the free check",
    again: "Check another domain",
    checked: "Checked",
    reads: "What we read publicly",
    readsList: [
      "domain and reachability",
      "robots.txt",
      "sitemap and scope",
      "a sample of public pages",
      "page templates",
      "technical signals",
      "semantic patterns",
    ],
    trust: [
      "No email needed. The result appears right here on this page.",
      "Only publicly available signals. No access to your systems.",
    ],
    runningNote:
      "The check runs against the live surface. Each state appears once its step has finished.",
    idleNote: "No access to your systems and no email. Only what is publicly available.",
    headings: {
      evidence: "What backs the finding",
      ruledOut: "What we can rule out",
      route: "How we verify from here",
    },
    confidencePrefix: "Public reading",
    primaryCta: "START THE FIRST MOVE",
    secondaryCta: "Review the finding together",
    scanningTitle: "Reading",
    scanningFallback: "the surface",
    scanningNote:
      "We are working out where the widest gap between effort and result sits for you.",
    stages: [
      { id: "01", label: "Understand the business and the offer", states: SCAN_STAGE_STATES[0] },
      { id: "02", label: "Determine discovery and scope", states: SCAN_STAGE_STATES[1] },
      { id: "03", label: "Check Search and AI presence", states: SCAN_STAGE_STATES[2] },
      { id: "04", label: "Compare patterns across pages", states: SCAN_STAGE_STATES[3] },
      { id: "05", label: "Identify the strongest lever", states: SCAN_STAGE_STATES[4] },
    ],
  },

  answers: {
    index: "03",
    label: "THE PRODUCT",
    line1: "Four answers.",
    line2: "One Move.",
    definition: PRODUCT_DEFINITION_EN,
    rows: [
      {
        num: "01",
        label: "CONSTRAINT",
        title: "Where growth is lost.",
        body: "We read the publicly available signals across Search, AI Search and Google Ads, then name the constraint with the widest gap between effort and result.",
      },
      {
        num: "02",
        label: "EVIDENCE",
        title: "What backs the finding.",
        body: "Every statement hangs on an observation with a source, a timestamp and a scope. Whatever we could not measure publicly is named as a limit beside it.",
      },
      {
        num: "03",
        label: "INTERVENTION",
        title: "What SEESZN actually ships.",
        body: "One bounded change goes live, guided through QA and one approval loop. Scope and target state are fixed before the work starts.",
      },
      {
        num: "04",
        label: "MEASUREMENT",
        title: "How the effect is proven.",
        body: `The metric and its baseline are set before implementation. We then document ${MEASUREMENT_WEEKS_MIN} to ${MEASUREMENT_WEEKS_MAX} weeks and put the before and after state on the record.`,
      },
    ],
  },

  proof: {
    index: "04",
    label: "EVIDENCE RECORD",
    line1: "Measured",
    accent: "results.",
    lead: "Three documented cases. Each one with its metric, window, source and the limits of what it says.",
    keys: {
      result: "Result",
      beforeAfter: "Before → After",
      metric: "Metric",
      window: "Measurement window",
      source: "Source",
      scope: "Scope",
      limits: "Limits",
    },
    caseLink: "Method in the case study",
    cases: {
      transform: {
        name: "Tourism · DACH",
        descriptor: "SEO + AI Search",
        scope: "One constant prompt set for the category, evaluated identically before and after.",
        href: "/en/case-studies/seo-aio-tourism",
        display: {
          leadValue: "5.3 → 2.2",
          leadCaption: "Average Position in AI Search",
          secondary: [{ value: "45 days", caption: "Measurement period" }],
          window: "45 days, measured before and after",
          metric: "Average position of the brand inside a constant prompt set",
          source: "ChatGPT, Gemini, Perplexity, Google AI Overviews",
          limits:
            "Answer systems are not deterministic. The number describes the measured change inside the prompt set, never a guaranteed mention.",
          note: "Client confidential",
        },
      },
      scale: {
        name: "Paid Acquisition · NDA",
        descriptor: "DACH · Google Ads",
        scope: "One Google Ads account in the DACH region across the full period.",
        display: {
          leadValue: "€2.5m to €3.0m",
          leadCaption: "Annual Media Spend",
          secondary: [
            { value: "€167 to €216 → €100 to €130", caption: "CPL" },
            { value: "14K → 37K", caption: "Conversion Value" },
          ],
          window: "2020 to 2025",
          metric: "Cost per lead and conversion value inside the Google Ads account",
          source: "The client's Google Ads account",
          limits:
            "Across five years the market, the product and demand all play a part. We report the paid metrics, never a total company effect.",
          note: "Client confidential",
          attribution: "Led by Philipp Ehrhardt · Paid Acquisition at SEESZN",
        },
      },
      build: {
        name: "E-Commerce · International",
        descriptor: "SEO + GEO",
        scope: "One internationally oriented shop, measured in its own property.",
        display: {
          leadValue: "3.59K",
          leadCaption: "Organic Clicks in 3 months",
          secondary: [{ value: "752K", caption: "Google Impressions" }],
          window: "3 months after the search surface was built",
          metric:
            "Organic clicks as the lead metric, impressions as context. Average position across all queries sat at 7.1 and is documented as context only.",
          source: "Google Search Console, the shop's own property",
        },
      },
    },
    order: ["transform", "scale", "build"],
  },

  system: {
    index: "05",
    label: "THE SYSTEM",
    line1: "How a First Move",
    accent: "comes together.",
    lead: "Five stages, each with a result of its own. Two of them are decided by a person.",
    stages: [
      {
        num: "01",
        label: "PUBLIC SIGNALS",
        meta: "Search · AI Search · Google Ads",
        body: "Publicly available signals, without access to your systems and without an email.",
      },
      {
        num: "02",
        label: "CONSTRAINT ENGINE",
        meta: "Evidence · Impact · Feasibility",
        body: "A finding only counts once several signals point at the same constraint.",
      },
      {
        num: "03",
        label: "HUMAN VERIFICATION",
        meta: "Priority · Scope · Approval",
        body: "A person verifies the finding with the necessary access, then approves priority and scope.",
      },
      {
        num: "04",
        label: "FIRST MOVE",
        meta: "Implementation · QA",
        body: "Exactly one bounded change goes live, including QA and one approval loop.",
      },
      {
        num: "05",
        label: "MEASUREMENT",
        meta: "Before · After · Decision",
        body: "After the measurement window the evidence record is in, carrying the next decision.",
      },
    ],
    note: "Stage 03 and stage 04 never run without approval. Whatever a person has not confirmed does not go live.",
  },

  recognition: {
    index: "06",
    label: "RECOGNITION",
    line1: "When the First Move",
    accent: "fits.",
    items: [
      "The team holds data from several systems, yet no clear first decision.",
      "Search, AI Search and paid acquisition are planned in separate roadmaps.",
      "Plenty of measures look reasonable. Their expected effect has no clean evidence behind it.",
    ],
  },

  offer: {
    index: "07",
    label: "THE OFFER",
    name: "SEESZN First Move",
    priceCaption: "Fixed price, excluding VAT",
    includedLabel: "Included",
    riskLabel: "If the Move turns out not to be implementable",
    cta: "START THE FIRST MOVE",
    // Der Kaufweg selbst ist bislang nur deutsch. Der englische CTA führt
    // deshalb auf die bestehende Anfragestrecke; die Sprache dort wechselt,
    // sobald es eine englische Produktseite gibt.
    ctaHref: "/first-move#start",
    price: PRICE_DISPLAY_NET_EN,
    priceFrame: PRICE_FRAME_EN,
    pricePromise: PRICE_PROMISE_EN,
    facts: OFFER_FACTS_EN,
    included: INCLUDED_EN,
    riskReversal: RISK_REVERSAL_FULL_EN,
    reassurance: REASSURANCE_EN,
  },

  decision: {
    index: "08",
    label: "DECISION",
    line1: "One constraint.",
    line2: "One intervention.",
    accent: "A result you can measure.",
    body: "Enter your domain. The finding appears right here on this page, then you decide.",
    cta: "START THE FIRST MOVE",
    secondary: "Check the domain first",
  },
};
