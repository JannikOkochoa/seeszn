// ─── First Move: FAQ, englische Fassung ───────────────────────────────────────
// Dieselben Fragen wie in ./faq, in englischer Sprache und mit den englischen
// Anzeigeformen der gesperrten Produktwerte. Es entstehen keine neuen Zusagen:
// jede Zahl kommt aus ./product beziehungsweise ./productEn.
//
// Der Text wird server-gerendert und identisch als FAQPage-Schema ausgegeben.

import {
  ACCESS_DEADLINE_DAYS,
  CLIENT_EFFORT_MINUTES,
  MEASUREMENT_WEEKS_MAX,
  MEASUREMENT_WEEKS_MIN,
  RETENTION_DAYS,
} from "./product";
import {
  DELAY_CLAUSE_EN,
  DELIVERY_DISPLAY_EN,
  PRICE_DISPLAY_EN,
  PRICE_DISPLAY_NET_EN,
  RISK_REVERSAL_FULL_EN,
} from "./productEn";
import type { FaqItem } from "./faq";

export const MASTER_FAQ_EN: readonly FaqItem[] = [
  {
    q: "What is a SEESZN First Move?",
    a: `A First Move is a bounded diagnosis and implementation engagement at a fixed price of ${PRICE_DISPLAY_NET_EN}. We evidence the most important constraint in Search, AI Search or paid acquisition, implement exactly one matching change, then document the before and after state.`,
  },
  {
    q: `What do I get for ${PRICE_DISPLAY_EN}?`,
    a: "Verification of the finding, prioritisation of one First Move, a short kickoff, implementation of the bounded change, QA with one approval loop, the measurement setup, an evidence record and a follow-up after the measurement window. What you end up with is a shipped change with documented proof.",
  },
  {
    q: "What does the free check show, and what does it leave out?",
    a: "The check shows the observation, one or two pieces of evidence for it, plus impact and confidence. It shows no target pages, no implementation plan and no measurement hypothesis. A short public check spots a pattern; it does not yet know the cause. Verification and implementation belong to the paid First Move.",
  },
  {
    q: "How does buying work?",
    a: `You send a binding request at the fixed price of ${PRICE_DISPLAY_NET_EN}. We verify the finding, confirm the scope to you in writing, then invoice. No payment happens on the page itself.`,
  },
  {
    q: "Could I find these problems myself with Claude or an SEO tool?",
    a: "Plenty of individual problems surface quickly with tools or with AI today. The hard part is prioritisation: which finding carries commercial weight, which one is technical noise and which change should ship first. First Move ties that selection to the actual implementation and to a measurement afterwards. If your team already covers prioritisation and implementation, you do not need us for it.",
  },
  {
    q: "Which signals does SEESZN check?",
    a: "In the first step only publicly readable signals: reachability and status codes, robots.txt, sitemap, indexability, canonical behaviour, page templates, heading structure, internal linking, topical overlap, structured data, entity signals and answer structure. For paid acquisition we add the publicly visible measurement and consent signals plus the structure of the landing page. Anything deeper needs access and happens after you commission the work.",
  },
  {
    q: "Can a First Move address Google Ads?",
    a: "Yes. Paid acquisition is one diagnostic path of the same product at the same fixed price. The paid path runs in two stages: first the public pre-check without account access, then, once a public signal exists, read-only access to the Google Ads account for the account layer.",
  },
  {
    q: "Does SEESZN need access to my website before I buy?",
    a: "No. The first signal comes entirely from publicly available data. We need access for verification and implementation, so after the request.",
  },
  {
    q: "Does SEESZN need write access to Google Ads before I buy?",
    a: "No. There is no write access and no campaign change before purchase. For the full paid finding we need read-only access: read, never change, revocable at any time.",
  },
  {
    q: "When is the First Move live?",
    a: `${DELIVERY_DISPLAY_EN}. Your effort stays at a maximum of ${CLIENT_EFFORT_MINUTES} minutes for access and approval. ${DELAY_CLAUSE_EN}`,
  },
  {
    q: "How is the effect measured?",
    a: `Before implementation we define the metric and its baseline, then document what moves across ${MEASUREMENT_WEEKS_MIN} to ${MEASUREMENT_WEEKS_MAX} weeks using the same measurement logic. We also name what the data does carry. We guarantee no position and no revenue outcome.`,
  },
  {
    q: "What happens when the public check finds no signal?",
    a: "Then we say so. A generic checklist item never gets declared a constraint here just to put a result on the screen. The public check only sees a slice: Search Console, analytics and the Google Ads account stay invisible from outside. You can request a First Move without a public signal for that reason. We then read the situation with the necessary access and say, before implementation, whether a bounded Move holds.",
  },
  {
    q: "What happens when the confirmed Move cannot be implemented?",
    a: RISK_REVERSAL_FULL_EN,
  },
  {
    q: "How long is scan data kept?",
    a: `${RETENTION_DAYS} days. Processing runs in France inside the EU. We store only what the work requires.`,
  },
  {
    q: "What happens when I cannot provide the necessary access in time?",
    a: `Delivery starts once access is complete and the approval path is clear. If the necessary access is missing after ${ACCESS_DEADLINE_DAYS} days, the work pauses until it arrives. A delay created that way does not establish a refund claim from that delay.`,
  },
];
