// ─── Tests: zentrale GSC-Berechnungslogik (lib/kpi/gscData.ts) ────────────────
// Läuft mit dem eingebauten Node-Testrunner und Type-Stripping:
//   node --test --experimental-strip-types tests/gsc-calc.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildScopeOptions,
  clicksSeries,
  comparePeriods,
  dailyForBatch,
  dataAsOf,
  defaultScopeKey,
  periodTotals,
  rangesForBatch,
  scopeKeyOf,
} from "../lib/kpi/gscData.ts";
import { buildRanges, deltaPct } from "../lib/kpi/aggregate.ts";

function day(batch, date, clicks, impressions, position) {
  return {
    import_batch_id: batch,
    date,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position,
  };
}

const rows = [
  // 14 Tage Daten für Batch "b1": 2026-07-01 .. 2026-07-14
  ...Array.from({ length: 14 }, (_, i) => {
    const date = `2026-07-${String(i + 1).padStart(2, "0")}`;
    return day("b1", date, i + 1, (i + 1) * 100, 10 + i);
  }),
];

test("Zeitraum + Vorperiode: 7 Tage am Datenstand verankert", () => {
  const batchRows = dailyForBatch(rows, "b1");
  assert.equal(dataAsOf(batchRows), "2026-07-14");
  const ranges = rangesForBatch(batchRows, 7);
  assert.deepEqual(ranges.current, { from: "2026-07-08", to: "2026-07-14" });
  assert.deepEqual(ranges.previous, { from: "2026-07-01", to: "2026-07-07" });
});

test("Periodensumme, Vorperiodensumme und Prozentveränderung", () => {
  const batchRows = dailyForBatch(rows, "b1");
  const { current, previous } = rangesForBatch(batchRows, 7);
  const cmp = comparePeriods(batchRows, current, previous);
  // Klicks 8..14 = 77; Vorperiode 1..7 = 28
  assert.equal(cmp.current.clicks, 77);
  assert.equal(cmp.previous.clicks, 28);
  assert.equal(Math.round(cmp.clicksDeltaPct), 175);
  assert.equal(cmp.comparisonLabel, "77 statt 28 Klicks");
  assert.equal(cmp.lowBase, false);
});

test("CTR aus Summen, Position mit Impressionen gewichtet", () => {
  const totals = periodTotals(dailyForBatch(rows, "b1"), {
    from: "2026-07-13",
    to: "2026-07-14",
  });
  // Tag 13: 13 Klicks/1300 Impr./Pos. 22; Tag 14: 14/1400/23
  assert.equal(totals.clicks, 27);
  assert.equal(totals.impressions, 2700);
  assert.ok(Math.abs(totals.ctr - 27 / 2700) < 1e-9);
  const expectedPosition = (22 * 1300 + 23 * 1400) / 2700;
  assert.ok(Math.abs(totals.position - expectedPosition) < 1e-9);
});

test("Division durch null: Vorperiode 0 liefert null statt Unsinn", () => {
  assert.equal(deltaPct(5, 0), null);
  assert.equal(deltaPct(0, 0), 0);
});

test("kleine Vorperiode wird als lowBase markiert (keine irreführende Hervorhebung)", () => {
  const tiny = [day("b2", "2026-07-13", 6, 600, 12), day("b2", "2026-07-14", 0, 10, 30)];
  const prevTiny = [day("b2", "2026-07-11", 1, 100, 12), day("b2", "2026-07-12", 1, 100, 12)];
  const all = [...prevTiny, ...tiny];
  const cmp = comparePeriods(all, { from: "2026-07-13", to: "2026-07-14" }, { from: "2026-07-11", to: "2026-07-12" });
  assert.equal(cmp.lowBase, true);
  assert.equal(cmp.comparisonLabel, "6 statt 2 Klicks");
  assert.equal(Math.round(cmp.clicksDeltaPct), 200);
});

test("Serie enthält null für Tage ohne Daten (keine erfundenen Nullwerte)", () => {
  const series = clicksSeries(dailyForBatch(rows, "b1"), { from: "2026-06-29", to: "2026-07-02" });
  assert.deepEqual(
    series.map((p) => p.value),
    [null, null, 1, 2],
  );
});

test("Scope-Auswahl: path_prefix zuerst, sitewide nicht als KPI-Filter", () => {
  const batches = [
    { id: "b1", scope_type: "product_page", scope_value: "Berlin", period_start: "2025-03-11", period_end: "2026-07-10", imported_at: null, status: "imported", original_file_name: "berlin.zip" },
    { id: "b2", scope_type: "path_prefix", scope_value: "/staedte-klassenfahrten/", period_start: "2025-03-11", period_end: "2026-07-10", imported_at: null, status: "imported", original_file_name: "city-pages.zip" },
    { id: "b3", scope_type: "sitewide", scope_value: "https://example.com/", period_start: "2025-03-11", period_end: "2026-07-10", imported_at: null, status: "imported", original_file_name: "sitewide.zip" },
  ];
  const active = batches.map((b, i) => ({
    id: `a${i}`,
    scope_type: b.scope_type,
    scope_value: b.scope_value,
    import_batch_id: b.id,
    activated_at: "2026-07-13T00:00:00Z",
  }));
  const options = buildScopeOptions(active, batches);
  assert.deepEqual(
    options.map((o) => o.label),
    ["Alle Städtereisen", "Berlin"],
  );
  assert.equal(defaultScopeKey(options), scopeKeyOf("path_prefix", "/staedte-klassenfahrten/"));
});

test("buildRanges: 28- und 90-Tage-Fenster sind exakt", () => {
  const r28 = buildRanges(28, "2026-07-10");
  assert.deepEqual(r28.current, { from: "2026-06-13", to: "2026-07-10" });
  assert.deepEqual(r28.previous, { from: "2026-05-16", to: "2026-06-12" });
  const r90 = buildRanges(90, "2026-07-10");
  assert.deepEqual(r90.current, { from: "2026-04-12", to: "2026-07-10" });
});
