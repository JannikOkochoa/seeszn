// ─── SEESZN First Move: die englische Anzeigeform ─────────────────────────────
// Dieselben Produktwerte, andere Sprache und andere Zahlenschreibweise.
//
// Es entsteht hier KEIN zweiter Satz Fakten. Preis, Fristen, Aufwand,
// Messfenster, Aufbewahrung und Hosting kommen als Zahl aus ./product und
// werden hier nur formatiert. Ändert sich dort ein Wert, ändert sich diese
// Datei automatisch mit.
//
// Zahlenschreibweise: Deutsch schreibt "2.490 € netto", Englisch
// "€2,490 excl. VAT". Beides meint denselben Nettobetrag.

import {
  ACCESS_DEADLINE_DAYS,
  CLIENT_EFFORT_MINUTES,
  DELIVERY_DAYS_MAX,
  DELIVERY_DAYS_MIN,
  MEASUREMENT_WEEKS_MAX,
  MEASUREMENT_WEEKS_MIN,
  PRICE_EUR,
  RETENTION_DAYS,
} from "./product";

/** Englische Preisform. Tausendertrennzeichen ist das Komma. */
export const PRICE_DISPLAY_EN = `€${PRICE_EUR.toLocaleString("en-US")}`;
export const PRICE_DISPLAY_NET_EN = `${PRICE_DISPLAY_EN} excl. VAT`;

export const DELIVERY_DISPLAY_EN = `${DELIVERY_DAYS_MIN}–${DELIVERY_DAYS_MAX} business days after full access`;
export const DELIVERY_SHORT_EN = `${DELIVERY_DAYS_MIN}–${DELIVERY_DAYS_MAX} business days`;

export const CLIENT_EFFORT_DISPLAY_EN = `max. ${CLIENT_EFFORT_MINUTES} minutes of work on your side`;

export const MEASUREMENT_DISPLAY_EN = `${MEASUREMENT_WEEKS_MIN}–${MEASUREMENT_WEEKS_MAX} week measurement window`;

export const RETENTION_DISPLAY_EN = `Scan data kept ${RETENTION_DAYS} days`;
export const HOSTING_DISPLAY_EN = "Hosting in France / EU";

export const RISK_REVERSAL_SHORT_EN = "Replacement Move or a 100% refund";
export const RISK_REVERSAL_FULL_EN =
  "If the confirmed First Move turns out not to be implementable after verification, you choose: an equivalent replacement Move or a 100% refund.";

export const DELAY_CLAUSE_EN = `Delivery starts once access is complete and the approval path is clear. If the necessary access is not provided within ${ACCESS_DEADLINE_DAYS} days, the work pauses. A delay caused on your side does not create a refund claim from that delay.`;

/** Was den Preis begrenzt, bevor die Zahl fällt. */
export const PRICE_FRAME_EN =
  "One clearly bounded first Move at a fixed price. No retainer, no bundle of twelve measures.";

/** Die Zusage direkt vor dem Angebot. */
export const PRICE_PROMISE_EN =
  "You see price and scope in full before you commission anything.";

/**
 * Die Definition nahe am Hero. Wie im Deutschen bewusst 40 bis 60 Wörter, damit
 * sie als Ganzes zitierbar bleibt.
 */
export const PRODUCT_DEFINITION_EN =
  "SEESZN First Move is a bounded diagnosis and implementation engagement. Working from evidence-backed signals, SEESZN identifies the most important constraint in Search, AI Search or paid acquisition, implements exactly one matching change, then documents the before and after state.";

export const INCLUDED_EN: readonly string[] = [
  "verification of the finding with the necessary access",
  "prioritisation of one First Move",
  "a short kickoff",
  "implementation of the bounded change",
  "QA and one approval loop",
  "measurement setup",
  "evidence record",
  "follow-up after the measurement window",
];

export const OFFER_FACTS_EN: readonly { k: string; v: string }[] = [
  { k: "Delivery", v: DELIVERY_DISPLAY_EN },
  { k: "Your effort", v: CLIENT_EFFORT_DISPLAY_EN },
  { k: "Implementation", v: "included" },
  { k: "QA", v: "included" },
  { k: "Measurement", v: `included, ${MEASUREMENT_WEEKS_MIN}–${MEASUREMENT_WEEKS_MAX} weeks` },
  { k: "Proof", v: "evidence record, documented before and after" },
];

export const REASSURANCE_EN: readonly string[] = [
  RISK_REVERSAL_SHORT_EN,
  RETENTION_DISPLAY_EN,
  HOSTING_DISPLAY_EN,
];

/** Der öffentliche Ablauf. Drei Schritte, eine Sprache. */
export const PROCESS_STEPS_EN: readonly { num: string; title: string; body: string }[] = [
  {
    num: "01",
    title: "Verify the finding",
    body: "We check the finding with the necessary access and decide whether it carries an implementation.",
  },
  {
    num: "02",
    title: "Ship the change",
    body: "We implement exactly one bounded change, including QA and one approval loop.",
  },
  {
    num: "03",
    title: "Document the result",
    body: `The metric and its baseline are fixed before the work. We then document what moves across ${MEASUREMENT_WEEKS_MIN} to ${MEASUREMENT_WEEKS_MAX} weeks.`,
  },
];

/** Was ausdrücklich nicht enthalten ist. */
export const NOT_INCLUDED_EN: readonly string[] = [
  "relaunch",
  "migration",
  "content at volume",
  "ongoing link building",
  "ongoing ads management",
  "a full account rebuild",
  "multi-market rollout",
];

/** Die sachliche Einordnung über dem Preis. */
export const OFFER_POSITIONING_EN =
  "We verify the finding, implement one clearly bounded change, then document the result.";

/** Die Qualifikationsregel in einem Satz. */
export const QUALIFICATION_RULE_EN =
  "A finding only counts once several signals point at the same constraint.";

/** Die kompakte Faktenzeile unter dem Domainfeld. Ohne Preis, wie im Deutschen. */
export const HERO_FACT_LINE_EN = `Fixed price · ${DELIVERY_SHORT_EN} · max. ${CLIENT_EFFORT_MINUTES} min from you`;
