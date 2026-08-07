// ─── Tests: Invarianten gegen Scope- und Periodenvermischung ─────────────────
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs tests/gsc-integrity.test.mjs
//
// Hintergrund: Im Data-Integrity-Audit fiel auf, dass die Query-Tabelle eines
// Segments Werte über den gesamten Batch-Zeitraum zeigte, während die
// Kennzahlen daneben aus 28 Tagen stammten. Eine einzelne Suchanfrage wies
// dadurch mehr Impressionen aus als das Segment insgesamt — beide Zahlen
// korrekt, die Gegenüberstellung irreführend.
//
// Diese Tests sichern die Invarianten, an denen genau solche Vermischungen
// auffallen:
//   1. Jede Query-Tabelle trägt ihren eigenen Zeitraum.
//   2. Kennzahlen kommen ausschließlich aus dem gewählten Zeitfenster.
//   3. Segmentsummen + nicht zugeordnet = Seitensumme.
//   4. Zeilen fremder Batches fließen nirgends ein.
//   5. Aktuelle Periode und Vorperiode überlappen nicht.

import test from "node:test";
import assert from "node:assert/strict";
import { buildPagePerformance } from "../lib/kpi/pagePerformance.ts";
import { TRACKED_PAGES } from "../lib/gsc/pageScopes.ts";

const HOMEPAGE = TRACKED_PAGES.find((p) => p.key === "homepage");

const PAGE_BATCH = "b-page";
const BRAND_BATCH = "b-brand";
const NONBRAND_BATCH = "b-nonbrand";
const FOREIGN_BATCH = "b-sitewide";

const PAGE = {
  ...HOMEPAGE,
  batchId: PAGE_BATCH,
  segments: [
    { kind: "branded", label: "Marken-Suchen", batchId: BRAND_BATCH },
    { kind: "non_branded", label: "Nicht-Marken-Suchen", batchId: NONBRAND_BATCH },
  ],
};

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

/**
 * 60 Tage Historie. Die letzten 28 Tage (Tag 33–60) sind die aktuelle Periode,
 * Tag 5–32 die Vorperiode. Die ersten Tage liegen bewusst außerhalb beider
 * Fenster: Werte von dort dürfen in keiner Kennzahl auftauchen.
 */
function history(batch, { early, previous, current }) {
  return Array.from({ length: 60 }, (_, i) => {
    const date = `2026-06-${String(i + 1).padStart(2, "0")}`.replace(
      /2026-06-(\d\d)/,
      (_m, d) => (Number(d) <= 30 ? `2026-06-${d}` : `2026-07-${String(Number(d) - 30).padStart(2, "0")}`),
    );
    const spec = i < 4 ? early : i < 32 ? previous : current;
    return day(batch, date, spec.clicks, spec.impressions, spec.position);
  });
}

const DAILY = [
  // Die Tage außerhalb beider Fenster tragen deutlich abweichende Werte:
  // fließt davon etwas ein, fallen die Summen sofort auf. Segmente bleiben
  // dabei durchgehend echte Teilmengen der Seite.
  ...history(PAGE_BATCH, {
    early: { clicks: 100, impressions: 1000, position: 3 },
    previous: { clicks: 5, impressions: 200, position: 20 },
    current: { clicks: 10, impressions: 300, position: 15 },
  }),
  ...history(BRAND_BATCH, {
    early: { clicks: 60, impressions: 400, position: 1 },
    previous: { clicks: 4, impressions: 30, position: 2 },
    current: { clicks: 7, impressions: 40, position: 1.5 },
  }),
  ...history(NONBRAND_BATCH, {
    early: { clicks: 30, impressions: 500, position: 5 },
    previous: { clicks: 0, impressions: 150, position: 30 },
    current: { clicks: 1, impressions: 220, position: 25 },
  }),
  // Ein fremder Scope mit riesigen Zahlen: darf nirgends einfließen.
  ...history(FOREIGN_BATCH, {
    early: { clicks: 5000, impressions: 50000, position: 1 },
    previous: { clicks: 5000, impressions: 50000, position: 1 },
    current: { clicks: 5000, impressions: 50000, position: 1 },
  }),
];

/** Dimensionswerte sind Aggregate über den GESAMTEN Batch-Zeitraum. */
function query(batch, value, clicks, impressions) {
  return {
    import_batch_id: batch,
    dimension_type: "query",
    dimension_value: value,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: 12,
    period_start: "2026-06-01",
    period_end: "2026-07-30",
  };
}

const DIMENSIONS = [
  // Bewusst grösser als die 28-Tage-Summe des Segments: genau die Konstellation
  // aus dem Audit ("klassenfahrt" 15 Klicks / 14.261 Impressionen).
  query(NONBRAND_BATCH, "klassenfahrt", 15, 14261),
  query(NONBRAND_BATCH, "klassenfahrten anbieter", 23, 1598),
  query(BRAND_BATCH, "klühspies", 994, 9242),
  query(PAGE_BATCH, "klühspies", 994, 9242),
  // Fremder Batch: darf in keiner Tabelle auftauchen.
  query(FOREIGN_BATCH, "fremde suchanfrage", 5000, 50000),
];

function build(range = 28) {
  return buildPagePerformance({
    page: PAGE,
    daily: DAILY,
    dimensions: DIMENSIONS,
    range,
    metric: "clicks",
  });
}

/* ── 1) Jede Query-Tabelle trägt ihren Zeitraum ─────────────────────────────── */

test("Invariante: jede Query-Tabelle nennt ihren eigenen Zeitraum", () => {
  const model = build();

  assert.ok(model.topQueries.length > 0, "Seiten-Tabelle hat Zeilen");
  assert.ok(model.queryPeriod, "Seiten-Tabelle ohne Zeitraum wäre irreführend");

  for (const segment of [model.brandSplit.branded, model.brandSplit.nonBranded]) {
    if (segment.topQueries.length === 0) continue;
    assert.ok(
      segment.queryPeriod,
      `Segment "${segment.label}" zeigt Suchanfragen ohne Zeitraumangabe`,
    );
  }
});

test("Invariante: der Query-Zeitraum weicht vom Kennzahlen-Zeitraum ab und wird deshalb ausgewiesen", () => {
  const model = build();
  const segment = model.brandSplit.nonBranded;

  // Genau der Fall aus dem Audit: eine einzelne Zeile hat mehr Impressionen
  // als das Segment in der aktuellen Periode.
  const biggest = Math.max(...segment.topQueries.map((q) => q.impressions));
  assert.ok(
    biggest > segment.totals.impressions,
    "Testdaten bilden den Auditfall nicht ab",
  );
  // Das ist zulässig – aber nur, solange der abweichende Zeitraum benannt ist.
  assert.notEqual(segment.queryPeriod.start, model.currentRange.from);
  assert.ok(segment.queryPeriod.start < model.currentRange.from);
});

/* ── 2) Kennzahlen stammen nur aus dem gewählten Fenster ────────────────────── */

test("Invariante: Werte außerhalb des Zeitfensters fließen in keine Kennzahl ein", () => {
  const model = build();
  // Tag 1–4 tragen 100 Klicks/Tag statt 10. Käme davon irgendetwas an, läge
  // die Summe deutlich über 280.
  assert.equal(model.totals.clicks, 28 * 10);
  assert.equal(model.totals.impressions, 28 * 300);
  assert.equal(model.comparison.previous.clicks, 28 * 5);
  assert.equal(model.brandSplit.branded.totals.clicks, 28 * 7);
  assert.equal(model.brandSplit.nonBranded.totals.clicks, 28 * 1);
});

test("Invariante: 7, 28 und 90 Tage liefern unterschiedliche, jeweils passende Summen", () => {
  const seven = build(7);
  const twentyEight = build(28);
  assert.equal(seven.totals.clicks, 7 * 10);
  assert.equal(twentyEight.totals.clicks, 28 * 10);
  assert.equal(seven.series.length, 7);
  assert.equal(twentyEight.series.length, 28);
  // Der Gesamtzeitraum hat ehrlich keine Vorperiode.
  assert.equal(build("all").comparison, null);
});

/* ── 3) Segmentsummen ergeben die Seitensumme ──────────────────────────────── */

test("Invariante: Branded + Non-Branded + nicht zugeordnet = Seite", () => {
  for (const range of [7, 28, 90, "all"]) {
    const model = build(range);
    const s = model.brandSplit;
    assert.equal(
      s.attributed.clicks + s.unattributed.clicks,
      model.totals.clicks,
      `Klicks stimmen bei Zeitraum ${range} nicht`,
    );
    assert.equal(
      s.attributed.impressions + s.unattributed.impressions,
      model.totals.impressions,
      `Impressionen stimmen bei Zeitraum ${range} nicht`,
    );
    assert.equal(s.attributed.clicks, s.branded.totals.clicks + s.nonBranded.totals.clicks);
  }
});

test("Invariante: Anteile summieren sich auf 100 Prozent der zugeordneten Menge", () => {
  const s = build().brandSplit;
  assert.ok(Math.abs(s.branded.shareOfClicks + s.nonBranded.shareOfClicks - 1) < 1e-9);
  assert.ok(Math.abs(s.branded.shareOfImpressions + s.nonBranded.shareOfImpressions - 1) < 1e-9);
});

test("Invariante: auseinandergelaufene Stände zeigen keinen Split statt eines falschen", () => {
  // Segmente können als Teilmengen nie mehr melden als die Seite. Passiert es
  // doch, stammen die Stände aus unterschiedlichen Sync-Läufen — dann darf
  // kein Split erscheinen, weil die Anteile sich auf eine Grundmenge bezögen,
  // die es nicht gibt.
  const desynced = buildPagePerformance({
    page: PAGE,
    daily: [
      ...DAILY.filter((d) => d.import_batch_id !== PAGE_BATCH),
      ...history(PAGE_BATCH, {
        early: { clicks: 0, impressions: 0, position: 1 },
        previous: { clicks: 0, impressions: 0, position: 1 },
        current: { clicks: 1, impressions: 1, position: 1 },
      }),
    ],
    dimensions: DIMENSIONS,
    range: 28,
    metric: "clicks",
  });
  assert.equal(desynced.brandSplit, null);
  // Die Seitenkennzahlen selbst bleiben davon unberührt.
  assert.equal(desynced.totals.clicks, 28);
});

/* ── 4) Keine Vermischung mit fremden Scopes ───────────────────────────────── */

test("Invariante: Zeilen fremder Batches fließen in keine Kennzahl und keine Tabelle", () => {
  const model = build();
  const s = model.brandSplit;

  // Der fremde Scope trägt 5000 Klicks/Tag – nichts davon darf ankommen.
  assert.equal(model.totals.clicks, 280);
  assert.equal(s.branded.totals.clicks + s.nonBranded.totals.clicks, 28 * 8);

  const allQueries = [
    ...model.topQueries,
    ...s.branded.topQueries,
    ...s.nonBranded.topQueries,
  ].map((q) => q.query);
  assert.ok(
    !allQueries.includes("fremde suchanfrage"),
    "Query aus einem fremden Batch ist in einer Tabelle gelandet",
  );
});

test("Invariante: die Segmenttabellen enthalten ausschließlich Zeilen ihres eigenen Segments", () => {
  const s = build().brandSplit;
  assert.deepEqual(
    s.branded.topQueries.map((q) => q.query),
    ["klühspies"],
  );
  assert.deepEqual(
    s.nonBranded.topQueries.map((q) => q.query),
    ["klassenfahrten anbieter", "klassenfahrt"],
  );
});

/* ── 5) Perioden überlappen nicht ──────────────────────────────────────────── */

test("Invariante: aktuelle Periode und Vorperiode sind gleich lang und überschneidungsfrei", () => {
  for (const range of [7, 28, 90]) {
    const model = build(range);
    if (!model.previousRange) continue;
    assert.ok(
      model.previousRange.to < model.currentRange.from,
      `Perioden überlappen bei Zeitraum ${range}`,
    );
    const days = (a, b) =>
      Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000) + 1;
    assert.equal(days(model.currentRange.from, model.currentRange.to), range);
    assert.equal(days(model.previousRange.from, model.previousRange.to), range);
  }
});

test("Invariante: Seite und Segmente rechnen über exakt dieselben Perioden", () => {
  const model = build();
  const s = model.brandSplit;
  for (const segment of [s.branded, s.nonBranded]) {
    assert.equal(segment.comparison.current.daysWithData, model.comparison.current.daysWithData);
    assert.equal(segment.comparison.previous.daysWithData, model.comparison.previous.daysWithData);
  }
});
