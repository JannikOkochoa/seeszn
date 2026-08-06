// ─── Tests: Verbindungsstatus + Seiten-Performance ───────────────────────────
// Läuft mit dem eingebauten Node-Testrunner und Type-Stripping:
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs tests/gsc-page-performance.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGscSyncStatus,
  STALE_AFTER_DAYS,
} from "../lib/kpi/syncStatus.ts";
import {
  buildPageOptions,
  buildPagePerformance,
  TOP_QUERY_LIMIT,
} from "../lib/kpi/pagePerformance.ts";
import { buildScopeOptions } from "../lib/kpi/gscData.ts";
import { HOMEPAGE_URL, TRACKED_PAGES } from "../lib/gsc/pageScopes.ts";

/* ── Verbindungsstatus ──────────────────────────────────────────────────────── */

function run(status, startedAt, errorMessage = null) {
  return {
    status,
    started_at: startedAt,
    completed_at: startedAt,
    error_message: errorMessage,
    records_processed: 500,
  };
}

test("Status: frischer Datenstand ist live", () => {
  const status = buildGscSyncStatus({
    runs: [run("success", "2026-08-06T03:00:00Z")],
    dataAsOf: "2026-08-04",
    todayIso: "2026-08-06",
  });
  assert.equal(status.state, "live");
  assert.equal(status.ageDays, 2);
});

test("Status: alter Datenstand ist stale, auch nach erfolgreichem Lauf", () => {
  const status = buildGscSyncStatus({
    runs: [run("success", "2026-07-23T18:00:00Z")],
    dataAsOf: "2026-07-21",
    todayIso: "2026-08-06",
  });
  assert.equal(status.state, "stale");
  assert.equal(status.ageDays, 16);
  assert.ok(status.headline.includes("16 Tage"));
});

test("Status: die Schwelle liegt genau bei STALE_AFTER_DAYS", () => {
  const atThreshold = buildGscSyncStatus({
    runs: [run("success", "2026-08-06T03:00:00Z")],
    dataAsOf: "2026-08-01",
    todayIso: `2026-08-0${1 + STALE_AFTER_DAYS}`,
  });
  assert.equal(atThreshold.state, "live");
  const overThreshold = buildGscSyncStatus({
    runs: [run("success", "2026-08-06T03:00:00Z")],
    dataAsOf: "2026-08-01",
    todayIso: `2026-08-0${2 + STALE_AFTER_DAYS}`,
  });
  assert.equal(overThreshold.state, "stale");
});

test("Status: ein fehlgeschlagener Lauf schlägt jede Frische", () => {
  const status = buildGscSyncStatus({
    runs: [run("error", "2026-08-06T03:00:00Z", "invalid_grant")],
    dataAsOf: "2026-08-05",
    todayIso: "2026-08-06",
  });
  assert.equal(status.state, "failed");
  assert.ok(status.detail.includes("invalid_grant"));
});

test("Status: ohne Daten wird nichts beschönigt", () => {
  const status = buildGscSyncStatus({ runs: [], dataAsOf: null, todayIso: "2026-08-06" });
  assert.equal(status.state, "never");
  assert.equal(status.ageDays, null);
});

test("Status: Daten ohne Protokoll heißen unlogged, nicht live", () => {
  const status = buildGscSyncStatus({
    runs: [],
    dataAsOf: "2026-08-05",
    todayIso: "2026-08-06",
  });
  assert.equal(status.state, "unlogged");
});

/* ── Seiten-Registry und -Auswahl ───────────────────────────────────────────── */

const HOMEPAGE = TRACKED_PAGES.find((p) => p.key === "homepage");

test("Registry: die Homepage ist ein generischer page-Scope auf ihrer URL", () => {
  assert.equal(HOMEPAGE.scopeType, "page");
  assert.equal(HOMEPAGE.scopeValue, HOMEPAGE_URL);
  assert.equal(HOMEPAGE.url, HOMEPAGE_URL);
});

test("Seiten-Auswahl: nur Seiten mit aktivem, vorhandenem Batch", () => {
  const activeDatasets = [
    { scope_type: "page", scope_value: HOMEPAGE_URL, import_batch_id: "b-home" },
    { scope_type: "product_page", scope_value: "Berlin", import_batch_id: "b-berlin" },
    // Hamburg zeigt auf einen Batch, der nicht geladen wurde -> fällt heraus.
    { scope_type: "product_page", scope_value: "Hamburg", import_batch_id: "b-weg" },
  ];
  const batches = [{ id: "b-home" }, { id: "b-berlin" }];
  const options = buildPageOptions(activeDatasets, batches);
  assert.deepEqual(
    options.map((o) => o.key),
    ["homepage", "berlin"],
  );
  assert.equal(options[0].batchId, "b-home");
});

test("page-Scopes tauchen nicht in der KPI-Scope-Auswahl auf", () => {
  const activeDatasets = [
    { scope_type: "sitewide", scope_value: "https://x/", import_batch_id: "b1" },
    { scope_type: "page", scope_value: HOMEPAGE_URL, import_batch_id: "b2" },
    { scope_type: "path_prefix", scope_value: "/staedte-klassenfahrten/", import_batch_id: "b3" },
    { scope_type: "product_page", scope_value: "Berlin", import_batch_id: "b4" },
  ];
  const batches = [{ id: "b1" }, { id: "b2" }, { id: "b3" }, { id: "b4" }];
  assert.deepEqual(
    buildScopeOptions(activeDatasets, batches).map((o) => o.label),
    ["Alle Städtereisen", "Berlin"],
  );
});

/* ── Seiten-Performance ─────────────────────────────────────────────────────── */

function day(date, clicks, impressions, position) {
  return {
    import_batch_id: "b-home",
    date,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position,
  };
}

/** 14 Tage: erst 2 Klicks/Tag, dann 6 Klicks/Tag. */
const DAILY = [
  ...Array.from({ length: 7 }, (_, i) => day(`2026-08-0${i + 1}`, 2, 100, 12)),
  ...Array.from({ length: 7 }, (_, i) => day(`2026-08-${String(i + 8).padStart(2, "0")}`, 6, 200, 8)),
];

function query(value, clicks, impressions) {
  return {
    import_batch_id: "b-home",
    dimension_type: "query",
    dimension_value: value,
    clicks,
    impressions,
    ctr: clicks / impressions,
    position: 3,
    period_start: "2026-08-01",
    period_end: "2026-08-14",
  };
}

const PAGE = { ...HOMEPAGE, batchId: "b-home", segments: [] };

test("Seiten-Performance: vier Kennzahlen mit Vergleich zur Vorperiode", () => {
  const model = buildPagePerformance({
    page: PAGE,
    daily: DAILY,
    dimensions: [],
    range: 7,
    metric: "clicks",
  });

  assert.deepEqual(
    model.metrics.map((m) => m.key),
    ["clicks", "impressions", "ctr", "position"],
  );
  // Aktuelle 7 Tage: 42 Klicks, Vorperiode: 14 Klicks -> +200 %.
  const clicks = model.metrics.find((m) => m.key === "clicks");
  assert.equal(model.totals.clicks, 42);
  assert.equal(model.comparison.previous.clicks, 14);
  assert.equal(Math.round(clicks.deltaPct), 200);
  assert.equal(clicks.assessment, "better");

  // Position: kleinere Zahl ist besser -> 8 statt 12 ist eine Verbesserung.
  const position = model.metrics.find((m) => m.key === "position");
  assert.equal(position.assessment, "better");

  assert.equal(model.series.length, 7);
  assert.equal(model.previousSeries.length, 7);
  assert.deepEqual(model.currentRange, { from: "2026-08-08", to: "2026-08-14" });
  assert.deepEqual(model.previousRange, { from: "2026-08-01", to: "2026-08-07" });
});

test("Seiten-Performance: Gesamtzeitraum hat ehrlich keine Vorperiode", () => {
  const model = buildPagePerformance({
    page: PAGE,
    daily: DAILY,
    dimensions: [],
    range: "all",
    metric: "clicks",
  });
  assert.equal(model.comparison, null);
  assert.equal(model.previousRange, null);
  assert.deepEqual(model.previousSeries, []);
  assert.equal(model.totals.clicks, 56);
});

test("Seiten-Performance: Top-Queries nur dieser Seite, nach Klicks", () => {
  const dimensions = [
    query("klühspies", 47, 592),
    query("klühspies reisen", 59, 533),
    { ...query("fremd", 999, 999), import_batch_id: "b-andere" },
    ...Array.from({ length: 15 }, (_, i) => query(`rest ${i}`, 1, 10)),
  ];
  const model = buildPagePerformance({
    page: PAGE,
    daily: DAILY,
    dimensions,
    range: 7,
    metric: "clicks",
  });

  assert.equal(model.topQueries.length, TOP_QUERY_LIMIT);
  assert.equal(model.topQueries[0].query, "klühspies reisen");
  assert.equal(model.topQueries[1].query, "klühspies");
  // Zeilen anderer Batches gehören nicht zu dieser Seite.
  assert.ok(!model.topQueries.some((q) => q.query === "fremd"));
  assert.deepEqual(model.queryPeriod, { start: "2026-08-01", end: "2026-08-14" });
});

test("Seiten-Performance: ohne Zeilen gibt es null statt Platzhalterzahlen", () => {
  assert.equal(
    buildPagePerformance({
      page: { ...PAGE, batchId: "b-leer" },
      daily: DAILY,
      dimensions: [],
      range: 7,
      metric: "clicks",
    }),
    null,
  );
});
