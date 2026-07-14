// ─── Tests: Executive-Cockpit-Logik (lib/kpi/executive.ts, gscData.ts) ────────
// Läuft mit dem eingebauten Node-Testrunner und Type-Stripping:
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs tests/executive.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAttentionItems,
  buildExecutiveKpis,
  buildExecutiveSummary,
  getLiveSourceStatuses,
  greetingForHour,
} from "../lib/kpi/executive.ts";
import {
  cockpitRangeLabel,
  computeRange,
  comparePeriods,
  metricDailySeries,
} from "../lib/kpi/gscData.ts";

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

/** 14 Tage: Vorperiode 1.-7., aktuelle 8.-14. */
function twoWeeks(build) {
  return Array.from({ length: 14 }, (_, i) => {
    const date = `2026-07-${String(i + 1).padStart(2, "0")}`;
    return build(i + 1, date);
  });
}

function comparisonOf(rows) {
  return computeRange(rows, 7).comparison;
}

/* ── Executive Summary: die vier Regeln ─────────────────────────────────────── */

test("Summary: Impressionen steigen, Klicks fallen", () => {
  const rows = twoWeeks((d, date) =>
    d <= 7 ? day("b", date, 10, 1000, 20) : day("b", date, 5, 2000, 20),
  );
  assert.equal(
    buildExecutiveSummary(comparisonOf(rows)),
    "Die Reichweite steigt, aber sie führt aktuell zu weniger Klicks.",
  );
});

test("Summary: beides steigt", () => {
  const rows = twoWeeks((d, date) =>
    d <= 7 ? day("b", date, 5, 1000, 20) : day("b", date, 10, 2000, 20),
  );
  assert.equal(
    buildExecutiveSummary(comparisonOf(rows)),
    "Organische Nachfrage und Reichweite entwickeln sich positiv.",
  );
});

test("Summary: Klicks fallen und Position verschlechtert sich", () => {
  const rows = twoWeeks((d, date) =>
    d <= 7 ? day("b", date, 10, 1000, 20) : day("b", date, 5, 1000, 28),
  );
  assert.equal(
    buildExecutiveSummary(comparisonOf(rows)),
    "Die organische Sichtbarkeit hat sich in der aktuellen Periode abgeschwächt.",
  );
});

test("Summary: kaum Veränderung ist stabil", () => {
  const rows = twoWeeks((d, date) => day("b", date, 10, 1000, 20));
  assert.equal(
    buildExecutiveSummary(comparisonOf(rows)),
    "Die organische Entwicklung ist weitgehend stabil.",
  );
});

test("Summary: ohne Daten ehrlicher Hinweis, keine erfundene Aussage", () => {
  assert.match(buildExecutiveSummary(null), /Search-Console-Export/);
});

/* ── KPI-Modelle ────────────────────────────────────────────────────────────── */

test("KPI-Modelle: vier Werte, Position mit betterWhen=down korrekt bewertet", () => {
  const rows = twoWeeks((d, date) =>
    d <= 7 ? day("b", date, 10, 1000, 30) : day("b", date, 20, 1200, 20),
  );
  const cmp = comparisonOf(rows);
  const kpis = buildExecutiveKpis(cmp.current, cmp);
  assert.equal(kpis.length, 4);
  const byKey = Object.fromEntries(kpis.map((k) => [k.key, k]));
  // Klicks gestiegen -> besser
  assert.equal(byKey.clicks.assessment, "better");
  // Position gesunken (30 -> 20) -> ebenfalls besser, obwohl der Wert fällt
  assert.ok(byKey.position.deltaPct < 0);
  assert.equal(byKey.position.assessment, "better");
  // Screenreader-Text enthält absolute Werte
  assert.match(byKey.clicks.srText, /aktuell 140, zuvor 70/);
});

test("KPI-Modelle: Vorperiode 0 ergibt keinen Prozentwert (Division durch null)", () => {
  const rows = twoWeeks((d, date) =>
    d <= 7 ? day("b", date, 0, 0, 0) : day("b", date, 3, 300, 15),
  );
  const cmp = comparisonOf(rows);
  const clicks = buildExecutiveKpis(cmp.current, cmp).find((k) => k.key === "clicks");
  assert.equal(clicks.deltaPct, null);
  assert.match(clicks.srText, /Kein Vorperiodenvergleich/);
});

test("KPI-Modelle: kleine Basis wird als lowBase markiert", () => {
  const rows = twoWeeks((d, date) =>
    d <= 7 ? day("b", date, d === 1 ? 2 : 0, 100, 20) : day("b", date, d === 8 ? 6 : 0, 100, 20),
  );
  const cmp = comparisonOf(rows);
  assert.equal(cmp.lowBase, true);
  const clicks = buildExecutiveKpis(cmp.current, cmp).find((k) => k.key === "clicks");
  assert.equal(clicks.lowBase, true);
});

/* ── Gesamter Zeitraum ──────────────────────────────────────────────────────── */

test("Gesamtzeitraum: totals ohne erfundene Vorperiode", () => {
  const rows = twoWeeks((d, date) => day("b", date, 1, 100, 20));
  const all = computeRange(rows, "all");
  assert.equal(all.comparison, null);
  assert.equal(all.previous, null);
  assert.equal(all.totals.clicks, 14);
  assert.deepEqual(all.current, { from: "2026-07-01", to: "2026-07-14" });
  assert.equal(cockpitRangeLabel("all"), "Gesamter Zeitraum");
});

/* ── Metrik-Serien für den Canvas ───────────────────────────────────────────── */

test("Metrik-Serien: CTR in Prozent, Position unverändert, Lücken bleiben null", () => {
  const rows = [day("b", "2026-07-02", 5, 200, 12.5)];
  const range = { from: "2026-07-01", to: "2026-07-03" };
  assert.deepEqual(
    metricDailySeries(rows, range, "ctr").map((p) => p.value),
    [null, 2.5, null],
  );
  assert.deepEqual(
    metricDailySeries(rows, range, "position").map((p) => p.value),
    [null, 12.5, null],
  );
  assert.deepEqual(
    metricDailySeries(rows, range, "impressions").map((p) => p.value),
    [null, 200, null],
  );
});

/* ── Aufmerksamkeit ─────────────────────────────────────────────────────────── */

test("Attention: max drei Beobachtungen, deterministisch, mit Zahlen", () => {
  const rows = twoWeeks((d, date) =>
    d <= 7 ? day("b", date, 10, 1000, 20) : day("b", date, 5, 2000, 20),
  );
  const cmp = comparisonOf(rows);
  const scope = (key, label, prevClicks, curClicks) => ({
    option: { key, scopeType: "product_page", scopeValue: label, label, batchId: key },
    comparison: comparePeriods(
      [
        day(key, "2026-07-07", prevClicks, 100, 20),
        day(key, "2026-07-14", curClicks, 100, 20),
      ],
      { from: "2026-07-08", to: "2026-07-14" },
      { from: "2026-07-01", to: "2026-07-07" },
    ),
  });
  const items = buildAttentionItems(cmp, [
    scope("hh", "Hamburg", 2, 6),
    scope("b", "Berlin", 10, 14),
  ]);
  assert.ok(items.length <= 3);
  assert.equal(items[0].observation, "Impressionen steigen, Klicks fallen.");
  assert.match(items[0].numbers, /Impressionen 14\.000/);
  // Keine Kausalitätsbehauptung: Interpretation als "möglich" formuliert
  assert.match(items[0].interpretation, /Mögliche Einordnung/);
  const lowBase = items.find((i) => i.observation.includes("wenigen Klicks"));
  assert.ok(lowBase, "lowBase-Wachstum als Beobachtung vorhanden");
});

test("Attention: ohne Vergleich keine erfundenen Beobachtungen", () => {
  assert.deepEqual(buildAttentionItems(null, []), []);
});

/* ── Ehrliche Live-Quellen ──────────────────────────────────────────────────── */

test("Live-Quellen: nicht Verbundenes heißt not_connected, nie live", () => {
  const statuses = getLiveSourceStatuses({ gscDataAsOf: "2026-07-10", realtimeConnected: true });
  const byKind = Object.fromEntries(statuses.map((s) => [s.kind, s]));
  assert.equal(byKind.gsc_export.state, "verified");
  assert.equal(byKind.ga4_core.state, "not_connected");
  assert.equal(byKind.website_scanner.state, "not_connected");
  assert.equal(byKind.gsc_api.state, "not_connected");
  // Supabase-Realtime ist tatsächlich verbunden -> ehrliches "live"
  assert.equal(byKind.supabase_realtime.state, "live");
  const offline = getLiveSourceStatuses({ gscDataAsOf: null, realtimeConnected: false });
  assert.equal(offline.find((s) => s.kind === "gsc_export").state, "not_connected");
  assert.equal(offline.find((s) => s.kind === "supabase_realtime").state, "offline");
});

/* ── Begrüßung ──────────────────────────────────────────────────────────────── */

test("Begrüßung: deterministisch nach Stunde", () => {
  assert.equal(greetingForHour(8), "Guten Morgen.");
  assert.equal(greetingForHour(14), "Guten Tag.");
  assert.equal(greetingForHour(21), "Guten Abend.");
  assert.equal(greetingForHour(3), "Guten Abend.");
});
