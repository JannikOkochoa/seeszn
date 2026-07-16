// ─── Tests: SEO Intelligence / Decision Layer (lib/kpi/intelligence.ts) ───────
// Läuft mit dem eingebauten Node-Testrunner und Type-Stripping:
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs tests/intelligence.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildActionFeed,
  buildContentOpportunities,
  buildDeviceInsight,
  buildExecutiveNarrative,
  buildQuickWins,
  buildScopeMovements,
  buildSeoHealth,
  expectedCtr,
  hasGuideIntent,
  monthsInPeriod,
  pathOfUrl,
  scoreContentOpportunity,
  scoreOpportunity,
  topQueriesFor,
} from "../lib/kpi/intelligence.ts";

const PERIOD = { start: "2025-03-11", end: "2026-07-10" };

function dim(batch, type, value, { clicks, impressions, position, ctr }) {
  return {
    import_batch_id: batch,
    dimension_type: type,
    dimension_value: value,
    clicks,
    impressions,
    ctr: ctr ?? (impressions > 0 ? clicks / impressions : 0),
    position,
    period_start: PERIOD.start,
    period_end: PERIOD.end,
  };
}

function totals(clicks, impressions, position) {
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : null,
    position,
    daysWithData: 28,
  };
}

/** PeriodComparison wie aus comparePeriods, mit denselben Regeln. */
function cmp(cur, prev) {
  return {
    current: cur,
    previous: prev,
    clicksDeltaPct:
      prev.clicks === 0
        ? cur.clicks === 0
          ? 0
          : null
        : ((cur.clicks - prev.clicks) / prev.clicks) * 100,
    comparisonLabel: `${cur.clicks} statt ${prev.clicks} Klicks`,
    lowBase: prev.clicks < 10,
  };
}

function option(label, batchId = label) {
  return { key: `product_page|${label}`, scopeType: "product_page", scopeValue: label, label, batchId };
}

/* ── Richtwerte & Scores ────────────────────────────────────────────────────── */

test("expectedCtr: gestufte Richtwerte, konservativ jenseits Position 20", () => {
  assert.equal(expectedCtr(1), 0.25);
  assert.equal(expectedCtr(9), 0.02);
  assert.equal(expectedCtr(22), 0.004);
});

test("scoreOpportunity: viel Nachfrage + Seite 1 + große CTR-Lücke = hoch", () => {
  const high = scoreOpportunity({ impressions: 2400, position: 9, ctr: 0.005 });
  assert.equal(high.points, 94);
  assert.equal(high.level, "hoch");
  assert.equal(high.stars, 5);

  const low = scoreOpportunity({ impressions: 150, position: 18, ctr: 0.005 });
  assert.equal(low.level, "niedrig");
  assert.equal(low.stars, 1);
});

test("scoreContentOpportunity: Nachfrage zählt doppelt, Frage-Intention gibt Aufschlag", () => {
  const guide = scoreContentOpportunity({ impressions: 3000, position: 22, guideIntent: true });
  assert.equal(guide.points, 78);
  assert.equal(guide.level, "hoch");
  // Ohne Intention und mit wenig Nachfrage bleibt es eine kleine Chance.
  const weak = scoreContentOpportunity({ impressions: 300, position: 35, guideIntent: false });
  assert.equal(weak.level, "niedrig");
});

test("Hilfen: Monate im Zeitraum, URL-Pfad, Frage-Intention", () => {
  assert.equal(Math.round(monthsInPeriod(PERIOD.start, PERIOD.end)), 16);
  assert.equal(pathOfUrl("https://www.example.de/staedte-klassenfahrten/muenchen/"), "/staedte-klassenfahrten/muenchen/");
  assert.equal(pathOfUrl("https://www.example.de"), "/");
  assert.equal(hasGuideIntent("wie teuer sind klassenfahrten"), true);
  assert.equal(hasGuideIntent("klassenfahrt berlin"), false);
});

/* ── Quick Wins ─────────────────────────────────────────────────────────────── */

const QW_DIMS = [
  // Kandidat: sichtbar (Pos. 9), viel Nachfrage, CTR weit unter Richtwert.
  dim("sw", "query", "klassenfahrt berlin kosten", { clicks: 48, impressions: 9600, position: 9 }),
  // Kein Kandidat: Position 2 ist bereits oben.
  dim("sw", "query", "klassenfahrt hamburg", { clicks: 600, impressions: 5000, position: 2 }),
  // Kein Kandidat: zu wenig Impressionen.
  dim("sw", "query", "nischen-query", { clicks: 0, impressions: 150, position: 10 }),
  // Seiten-Kandidat: Position 13, CTR deutlich unter Richtwert.
  dim("sw", "page", "https://www.example.de/staedte-klassenfahrten/muenchen/", {
    clicks: 6,
    impressions: 3000,
    position: 13,
  }),
];

test("buildQuickWins: filtert deterministisch, empfiehlt nach Positionsfenster", () => {
  const wins = buildQuickWins(QW_DIMS, "sw");
  assert.equal(wins.length, 2);

  const [first, second] = wins;
  assert.equal(first.kind, "query");
  assert.equal(first.subject, "klassenfahrt berlin kosten");
  assert.equal(first.actionKind, "faq"); // Position 9: Snippet + FAQ
  assert.equal(first.score.level, "hoch");
  assert.equal(first.potentialMonthlyClicks, 9); // (9600/16 Monate) × CTR-Lücke 1,5 pp
  assert.match(first.why, /2 % Klickrate üblich/);

  assert.equal(second.kind, "page");
  assert.equal(second.subject, "/staedte-klassenfahrten/muenchen/");
  assert.equal(second.actionKind, "links"); // Position 13: Verlinkung + Inhalt
  assert.equal(second.pageUrl, "https://www.example.de/staedte-klassenfahrten/muenchen/");
});

test("buildQuickWins: fremde Batches fließen nicht ein", () => {
  assert.deepEqual(buildQuickWins(QW_DIMS, "anderer-batch"), []);
});

/* ── Geräte-Beobachtung ─────────────────────────────────────────────────────── */

test("buildDeviceInsight: mobile CTR-Lücke bei relevantem Mobilanteil", () => {
  const dims = [
    dim("sw", "device", "Mobile", { clicks: 48, impressions: 6000, position: 9, ctr: 0.008 }),
    dim("sw", "device", "Desktop", { clicks: 120, impressions: 4000, position: 8, ctr: 0.03 }),
  ];
  const insight = buildDeviceInsight(dims, "sw");
  assert.ok(insight);
  assert.equal(insight.mobileShare, 0.6);
  assert.match(insight.what, /0,8 %/);
  assert.match(insight.why, /Ursache offen/);
});

test("buildDeviceInsight: keine Beobachtung ohne echte Lücke", () => {
  const dims = [
    dim("sw", "device", "Mobile", { clicks: 150, impressions: 6000, position: 9, ctr: 0.025 }),
    dim("sw", "device", "Desktop", { clicks: 120, impressions: 4000, position: 8, ctr: 0.03 }),
  ];
  assert.equal(buildDeviceInsight(dims, "sw"), null);
});

/* ── Gewinner & Verlierer ───────────────────────────────────────────────────── */

const MOVEMENT_SCOPES = [
  // Gewinner über Reichweite: +50 % Klicks, Impressionen verdoppelt.
  { option: option("Berlin"), comparison: cmp(totals(30, 4000, 8.0), totals(20, 2000, 8.2)) },
  // Verlierer über Position: -50 % Klicks, Position 2 Plätze schlechter.
  { option: option("München"), comparison: cmp(totals(10, 3000, 9.5), totals(20, 3100, 7.5)) },
  // Kleine Basis: 6 statt 2 Klicks zählt absolut als Gewinner.
  { option: option("Hamburg"), comparison: cmp(totals(6, 500, 12), totals(2, 480, 12.1)) },
  // Stabil: ±2 % ist keine Bewegung.
  { option: option("Köln"), comparison: cmp(totals(51, 1000, 10), totals(50, 990, 10)) },
];

test("buildScopeMovements: Richtung, Treiber und ehrliche lowBase-Sprache", () => {
  const queryDims = [
    dim("Berlin", "query", "klassenfahrt berlin", { clicks: 40, impressions: 900, position: 5 }),
    dim("Berlin", "query", "berlin klassenfahrt kosten", { clicks: 12, impressions: 400, position: 9 }),
  ];
  const { winners, losers } = buildScopeMovements(MOVEMENT_SCOPES, queryDims);

  assert.deepEqual(
    winners.map((w) => w.option.label),
    ["Hamburg", "Berlin"],
  );
  const berlin = winners.find((w) => w.option.label === "Berlin");
  assert.equal(berlin.driver, "impressions");
  assert.match(berlin.why, /häufiger aus/);
  assert.deepEqual(
    berlin.topQueries.map((q) => q.query),
    ["klassenfahrt berlin", "berlin klassenfahrt kosten"],
  );

  const hamburg = winners.find((w) => w.option.label === "Hamburg");
  assert.equal(hamburg.lowBase, true);
  assert.equal(hamburg.what, "6 statt 2 Klicks.");

  assert.equal(losers.length, 1);
  assert.equal(losers[0].option.label, "München");
  assert.equal(losers[0].driver, "position");
  assert.match(losers[0].why, /9,5 statt 7,5/);
});

/* ── Content Opportunities ──────────────────────────────────────────────────── */

test("buildContentOpportunities: Format aus Intention, Duplikate zusammengefasst", () => {
  const dims = [
    dim("sw", "query", "wie teuer sind klassenfahrten", { clicks: 12, impressions: 3000, position: 22 }),
    dim("sw", "query", "kosten klassenfahrt", { clicks: 8, impressions: 2500, position: 18 }),
    // Gleiche Wortmenge wie oben -> wird nicht doppelt empfohlen.
    dim("sw", "query", "klassenfahrt kosten", { clicks: 3, impressions: 1000, position: 19 }),
    dim("sw", "query", "klassenfahrt england", { clicks: 5, impressions: 800, position: 14 }),
    // Unter den Schwellen: bleibt draußen.
    dim("sw", "query", "klassenfahrt berlin", { clicks: 40, impressions: 900, position: 5 }),
  ];
  const opportunities = buildContentOpportunities(dims, "sw");
  assert.deepEqual(
    opportunities.map((o) => o.topic),
    ["wie teuer sind klassenfahrten", "kosten klassenfahrt", "klassenfahrt england"],
  );
  assert.equal(opportunities[0].format, "Ratgeber-Beitrag");
  assert.equal(opportunities[0].score.level, "hoch");
  assert.equal(opportunities[2].format, "Bestehende Seite ausbauen");
  assert.match(opportunities[0].what, /3\.000 Impressionen/);
});

/* ── SEO Health ─────────────────────────────────────────────────────────────── */

test("buildSeoHealth: Aufmerksamkeit zuerst, kleine Basis über Position bewertet", () => {
  const rows = buildSeoHealth([
    { option: option("Gesamte Website", "sw"), comparison: cmp(totals(2400, 200000, 18), totals(2000, 180000, 18.2)) },
    { option: option("München"), comparison: cmp(totals(10, 3000, 9.5), totals(20, 3100, 7.5)) },
    { option: option("Hamburg"), comparison: cmp(totals(3, 500, 12), totals(2, 480, 12)) },
  ]);
  assert.deepEqual(
    rows.map((r) => [r.option.label, r.status]),
    [
      ["München", "attention"],
      ["Gesamte Website", "growing"],
      ["Hamburg", "stable"],
    ],
  );
  assert.equal(rows[0].statusLabel, "Braucht Aufmerksamkeit");
  assert.match(rows[0].what, /10 statt 20 Klicks/);
});

/* ── Executive-Zusammenfassung ──────────────────────────────────────────────── */

test("buildExecutiveNarrative: konkrete Scopes mit Zahlen und genau eine Priorität", () => {
  const base = cmp(totals(94, 50000, 17), totals(84, 48000, 17.2));
  const narrative = buildExecutiveNarrative(base, [
    { option: option("Hamburg"), comparison: cmp(totals(6, 500, 12), totals(2, 480, 12.1)) },
    { option: option("München"), comparison: cmp(totals(10, 3000, 9.5), totals(20, 3100, 7.5)) },
  ]);
  assert.equal(narrative.statements.length, 3);
  assert.match(narrative.statements[0], /11,9 % über der Vorperiode/);
  assert.match(narrative.statements[1], /Hamburg entwickelt sich positiv: 6 statt 2 Klicks\./);
  assert.match(narrative.statements[2], /München verliert/);
  assert.match(narrative.statements[2], /9,5 statt 7,5/);
  assert.equal(narrative.priorityLabel, "München");
  assert.match(narrative.prioritySentence, /höchste Priorität liegt aktuell bei München/);
});

test("buildExecutiveNarrative: ohne Verlierer wird der Reichweiten-Hebel zur Priorität", () => {
  const base = cmp(totals(51, 60000, 17), totals(50, 40000, 17));
  const narrative = buildExecutiveNarrative(base, []);
  assert.equal(narrative.priorityLabel, null);
  assert.match(narrative.prioritySentence, /Reichweite in Klicks/);
});

test("buildExecutiveNarrative: ohne Daten ehrlicher Hinweis", () => {
  const narrative = buildExecutiveNarrative(null, []);
  assert.match(narrative.statements[0], /Search-Console-Export/);
  assert.equal(narrative.prioritySentence, null);
});

/* ── Action Feed ────────────────────────────────────────────────────────────── */

test("buildActionFeed: priorisiert nach Sternen, blendet angelegte Maßnahmen aus", () => {
  const quickWins = buildQuickWins(QW_DIMS, "sw");
  const { losers } = buildScopeMovements(MOVEMENT_SCOPES, []);
  const opportunities = buildContentOpportunities(
    [dim("sw", "query", "wie teuer sind klassenfahrten", { clicks: 12, impressions: 3000, position: 22 })],
    "sw",
  );
  const deviceInsight = buildDeviceInsight(
    [
      dim("sw", "device", "Mobile", { clicks: 48, impressions: 6000, position: 9, ctr: 0.008 }),
      dim("sw", "device", "Desktop", { clicks: 120, impressions: 4000, position: 8, ctr: 0.03 }),
    ],
    "sw",
  );

  const feed = buildActionFeed({ quickWins, losers, opportunities, deviceInsight, openTasks: [] });
  assert.equal(feed.length, 5);
  // 5 Sterne zuerst: der schwere Verlierer (Position +2) vor dem stärksten Quick Win.
  assert.equal(feed[0].title, "Rankings der Seite München stabilisieren");
  assert.equal(feed[0].stars, 5);
  assert.equal(feed[1].title, "FAQ zur Suchanfrage „klassenfahrt berlin kosten“ ergänzen");
  assert.equal(feed[1].stars, 5);
  assert.match(feed[feed.length - 1].title, /Mobile Darstellung/);

  // Eine offene Maßnahme zur selben Query blendet die Empfehlung aus.
  const openTask = {
    id: "t1",
    title: "Irgendwas anderes",
    status: "open",
    deleted_at: null,
    insight_context: { query: "klassenfahrt berlin kosten" },
  };
  const filtered = buildActionFeed({ quickWins, losers, opportunities, deviceInsight, openTasks: [openTask] });
  assert.equal(filtered.length, 4);
  assert.ok(!filtered.some((i) => i.draft.query === "klassenfahrt berlin kosten"));

  // Geschlossene Maßnahmen zählen nicht als "bereits adressiert".
  const closedTask = { ...openTask, status: "closed" };
  assert.equal(
    buildActionFeed({ quickWins, losers, opportunities, deviceInsight, openTasks: [closedTask] }).length,
    5,
  );
});

test("buildActionFeed: Limit greift", () => {
  const quickWins = buildQuickWins(QW_DIMS, "sw");
  const feed = buildActionFeed({
    quickWins,
    losers: [],
    opportunities: [],
    deviceInsight: null,
    openTasks: [],
    limit: 1,
  });
  assert.equal(feed.length, 1);
});

/* ── Top-Queries je Batch ───────────────────────────────────────────────────── */

test("topQueriesFor: klickstärkste zuerst, ohne Null-Klick-Zeilen", () => {
  const dims = [
    dim("b1", "query", "a", { clicks: 5, impressions: 100, position: 8 }),
    dim("b1", "query", "b", { clicks: 12, impressions: 300, position: 6 }),
    dim("b1", "query", "c", { clicks: 0, impressions: 900, position: 30 }),
    dim("b2", "query", "fremd", { clicks: 99, impressions: 900, position: 1 }),
  ];
  assert.deepEqual(topQueriesFor(dims, "b1"), [
    { query: "b", clicks: 12 },
    { query: "a", clicks: 5 },
  ]);
});
