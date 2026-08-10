// ─── Tests: First Move V6 ─────────────────────────────────────────────────────
// Zwei Dinge, die nicht kaputtgehen dürfen:
//
//   1. Der kostenlose Scan gibt nur die öffentliche Sicht heraus. Umsetzungsplan,
//      Zielseiten und Messhypothese bleiben am Server.
//   2. Die gesperrten Produktwerte stehen an einer Stelle und stimmen mit dem
//      Schema überein.
//
// Läuft mit:
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs tests/first-move-v6.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { toPublicFinding } from "../lib/first-move/disclosure.ts";
import { EXAMPLE_FINDING } from "../lib/first-move/example.ts";
import { PAID_FAQ } from "../lib/first-move/faq.ts";
import { PROOF_CASES, relevantCaseId } from "../lib/first-move/proof.ts";
import {
  NO_CONTEXT_NOTE,
  clearScanStore,
  createScanContextId,
  internalVerificationContext,
  recallScan,
  rememberScan,
} from "../lib/first-move/scanStore.ts";
import { LEAD_SOURCE_LABEL } from "../lib/leads/types.ts";
import { PRICE_DISPLAY, PRICE_DISPLAY_NET, PRICE_EUR } from "../lib/first-move/product.ts";
import { firstMoveService } from "../lib/first-move/schema.ts";

/** Ein vollständiger interner Befund, wie ihn qualify() erzeugt. */
const FULL_FINDING = {
  id: "fm_test",
  route: "search",
  status: "qualified",
  title: "3 Seiten konkurrieren um dieselbe kommerzielle Absicht.",
  summary: "Mehrere eigenständig indexierbare Seiten adressieren dieselbe Suchabsicht.",
  evidence: [
    {
      id: "e1",
      source: "content",
      type: "competing_intent_cluster",
      observation: "3 indexierbare Seiten tragen eine deckungsgleiche Titel- und H1-Signatur.",
      scope: { urls: ["https://kunde.de/a", "https://kunde.de/b"] },
      measuredValue: 3,
      observedAt: "2026-01-01T00:00:00.000Z",
      reproducible: true,
    },
    {
      id: "e2",
      source: "public_html",
      type: "canonical_state",
      observation: "Keine dieser Seiten verweist per Canonical auf eine der anderen.",
      scope: { urls: ["https://kunde.de/a"] },
      observedAt: "2026-01-01T00:00:00.000Z",
      reproducible: true,
    },
    {
      id: "e3",
      source: "internal_linking",
      type: "internal_support_split",
      observation: "Die Startseite verlinkt 1 von 3 dieser Seiten direkt: https://kunde.de/a",
      observedAt: "2026-01-01T00:00:00.000Z",
      reproducible: true,
    },
  ],
  impact: "high",
  confidence: "medium",
  effort: "low",
  proposedFirstMove: {
    interventionType: "Konsolidierung auf eine zentrale Zielseite",
    title: "Konsolidierung auf eine kanonische Zielseite.",
    scope: "Eine Zielseite wird als kanonisches Ziel bestimmt.",
    implementationSurface: "information_architecture",
    implementationMode: "SEESZN_access",
    bounded: true,
    reversibleOrControlled: true,
  },
  measurementHypothesis: {
    metric: "Organische Klicks",
    baselineDefinition: "Search Console, vier Wochen vor der Umsetzung.",
    expectedDirection: "increase",
    measurementWindowWeeksMin: 4,
    measurementWindowWeeksMax: 8,
  },
  eligibility: { eligible: true },
  publicEvidenceOnly: true,
  surfaceKind: "commerce",
  suggestedComplexity: "medium",
  createdAt: "2026-01-01T00:00:00.000Z",
};

test("die öffentliche Sicht enthält keinen Umsetzungsplan", () => {
  const view = toPublicFinding(FULL_FINDING);
  assert.equal("proposedFirstMove" in view, false);
  assert.equal("measurementHypothesis" in view, false);
  assert.equal("effort" in view, false);
});

test("die öffentliche Sicht zeigt höchstens zwei Belege, ohne URLs", () => {
  const view = toPublicFinding(FULL_FINDING);
  assert.equal(view.evidence.length, 2);
  for (const item of view.evidence) {
    assert.equal("scope" in item, false);
    assert.equal("measuredValue" in item, false);
    assert.ok(!/https?:\/\//.test(item.observation));
  }
});

test("URLs werden auch aus Freitext entfernt", () => {
  const view = toPublicFinding({
    ...FULL_FINDING,
    evidence: [FULL_FINDING.evidence[2]],
    title: "Befund auf https://kunde.de/a",
  });
  assert.ok(!/https?:\/\//.test(view.title));
  assert.ok(!/https?:\/\//.test(view.evidence[0].observation));
});

test("Beobachtung, Impact, Confidence und Fit-Vorschlag bleiben erhalten", () => {
  const view = toPublicFinding(FULL_FINDING);
  assert.equal(view.title, FULL_FINDING.title);
  assert.equal(view.summary, FULL_FINDING.summary);
  assert.equal(view.impact, "high");
  assert.equal(view.confidence, "medium");
  assert.equal(view.suggestedComplexity, "medium");
  assert.equal(view.publicEvidenceOnly, true);
});

test("die Art des Eingriffs ist öffentlich, das konkrete Ziel nicht", () => {
  const view = toPublicFinding(FULL_FINDING);
  assert.equal(view.interventionType, "Konsolidierung auf eine zentrale Zielseite");
  const serialized = JSON.stringify(view);
  // Weder Titel noch Scope des geplanten Moves dürfen mitgehen.
  assert.ok(!serialized.includes("kanonische Zielseite."));
  assert.ok(!serialized.includes("kanonisches Ziel bestimmt"));
  assert.ok(!serialized.includes("kunde.de"));
});

test("der Beispielbefund ist als Beispiel gekennzeichnet und kein PublicFinding", () => {
  assert.match(EXAMPLE_FINDING.label.toLowerCase(), /beispiel/);
  assert.ok(EXAMPLE_FINDING.cta.length > 0);
  // Kein id/status/eligibility: das Objekt kann nicht als echtes Ergebnis
  // durchgehen und passt nicht in den Payload einer Anfrage.
  assert.equal("id" in EXAMPLE_FINDING, false);
  assert.equal("status" in EXAMPLE_FINDING, false);
  assert.equal("eligibility" in EXAMPLE_FINDING, false);
});

test("die Abschlussereignisse heißen nach einer Anfrage, nicht nach einem Checkout", () => {
  const source = readFileSync(new URL("../lib/first-move/analytics.ts", import.meta.url), "utf8");
  const events = source.slice(source.indexOf("export type FirstMoveEvent"));
  assert.ok(events.includes('"first_move_request_start"'));
  assert.ok(events.includes('"first_move_request_submit"'));
  assert.ok(!events.includes('"checkout_start"'));
  assert.ok(!events.includes('"checkout_complete"'));
});

test("die Paid-FAQ ist kurz und paid-spezifisch", () => {
  assert.ok(PAID_FAQ.length >= 6 && PAID_FAQ.length <= 8, `PAID_FAQ hat ${PAID_FAQ.length} Fragen`);
});

test("der öffentliche French-Beret-Case zeigt keine Durchschnittsposition", () => {
  const card = PROOF_CASES.build;
  const visible = [card.leadValue, card.leadCaption, ...card.secondary.flatMap((s) => [s.value, s.caption])];
  // Weder der aktuelle Wert (7,1) noch der historische (8,3) gehören auf die
  // Karte: eine Durchschnittsposition ist Methodik-Kontext, kein Leitwert.
  assert.ok(!visible.some((v) => v.includes("7,1") || v.includes("8,3")));
  assert.equal(card.leadValue, "3.59K");
  assert.ok(card.secondary.some((s) => s.value === "752K"));
});

test("der relevanteste Case folgt aus Route und Oberfläche", () => {
  assert.equal(relevantCaseId("paid_acquisition"), "scale");
  assert.equal(relevantCaseId("search", "commerce"), "build");
  assert.equal(relevantCaseId("search", "site"), "transform");
  assert.equal(relevantCaseId("ai_search"), "transform");
  assert.equal(relevantCaseId(undefined), "transform");
});

test("die Kontext-ID ist hoch entropisch und nicht erratbar", () => {
  const a = createScanContextId();
  const b = createScanContextId();
  assert.match(a, /^fm_[0-9a-f]{32}$/);
  assert.notEqual(a, b);
  // Kein Zeitstempel-Muster mehr wie in der alten fm_<base36-Zeit>-Form.
  assert.ok(!/^fm_[0-9a-z]{8,9}$/.test(a));
});

test("die interne Auswertung bleibt für die Verifikation erhalten", async () => {
  const id = createScanContextId();
  const context = {
    id,
    domain: "kunde.de",
    url: "https://kunde.de/",
    route: "search",
    finding: { ...FULL_FINDING, id },
  };
  await rememberScan({ context, publicFinding: toPublicFinding(context.finding) });

  const entry = await recallScan(id);
  assert.ok(entry, "Eintrag muss abrufbar sein");

  const text = internalVerificationContext(entry);
  // Genau das, was die öffentliche Sicht nicht trägt, steht hier drin.
  assert.ok(text.includes("Konsolidierung auf eine kanonische Zielseite."));
  assert.ok(text.includes("kanonisches Ziel bestimmt"));
  assert.ok(text.includes("https://kunde.de/a"));
  assert.ok(text.includes("Organische Klicks"));
  // Und die dritte Beobachtung, die öffentlich weggeschnitten wurde.
  assert.ok(text.includes("Die Startseite verlinkt 1 von 3"));

  assert.equal(await recallScan("gibt-es-nicht"), null);
  assert.equal(await recallScan(undefined), null);
  clearScanStore();
  assert.equal(await recallScan(id), null, "nach clear ist nichts mehr da");
});

test("abgelaufener Kontext gilt als nicht vorhanden", async () => {
  const id = createScanContextId();
  const context = {
    id,
    domain: "kunde.de",
    url: "https://kunde.de/",
    route: "search",
    finding: { ...FULL_FINDING, id },
  };
  await rememberScan({ context, publicFinding: toPublicFinding(context.finding) });
  assert.ok(await recallScan(id));

  // Sechs Stunden und eine Minute später.
  const realNow = Date.now;
  Date.now = () => realNow() + 6 * 60 * 60 * 1000 + 60_000;
  try {
    assert.equal(await recallScan(id), null, "nach Ablauf muss der Kontext fehlen");
  } finally {
    Date.now = realNow;
  }
  clearScanStore();
});

test("ohne Kontext bleibt eine klare interne Notiz", () => {
  assert.match(NO_CONTEXT_NOTE, /Kein interner Scan-Kontext/);
  assert.match(NO_CONTEXT_NOTE, /öffentlichen Signal/);
});

test("neue Leads melden eine Anfrage, keinen Checkout", () => {
  const types = readFileSync(new URL("../lib/leads/types.ts", import.meta.url), "utf8");
  const union = types.slice(types.indexOf("export type LeadSource"), types.indexOf("export type LegacyLeadSource"));
  assert.ok(union.includes('"first_move_request"'));
  assert.ok(!union.includes('"first_move_checkout"'));

  const route = readFileSync(new URL("../app/api/first-move/request/route.ts", import.meta.url), "utf8");
  assert.ok(route.includes('"first_move_request"'));
  assert.ok(!route.includes('"first_move_checkout"'));

  // Altbestand bleibt im CRM lesbar.
  assert.equal(LEAD_SOURCE_LABEL.first_move_request, "First Move Anfrage");
  assert.ok(LEAD_SOURCE_LABEL.first_move_checkout);
});

test("Preis steht an einer Stelle und stimmt mit dem Schema überein", () => {
  assert.equal(PRICE_EUR, 2490);
  assert.equal(PRICE_DISPLAY, "2.490 €");
  assert.equal(PRICE_DISPLAY_NET, "2.490 € netto");
  const service = firstMoveService({ path: "/first-move", serviceType: "Test" });
  assert.equal(service.offers.price, "2490");
  assert.equal(service.offers.priceCurrency, "EUR");
  assert.equal(service.offers.valueAddedTaxIncluded, false);
});
