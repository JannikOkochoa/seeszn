// ─── Tests: Automatisierung (Brand-Split, Self-Healing, Beobachtungskette) ────
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs tests/gsc-automation.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import {
  BRAND_VARIANTS,
  brandQueryRegex,
  isBrandedQuery,
  normalizeQuery,
} from "../lib/gsc/brand.ts";
import { PAGE_SEGMENTS, segmentsForPage, TRACKED_PAGES } from "../lib/gsc/pageScopes.ts";
import { buildBrandSplit, buildPageOptions } from "../lib/kpi/pagePerformance.ts";
import { buildGscSyncStatus } from "../lib/kpi/syncStatus.ts";
import {
  BASE_WINDOW_DAYS,
  MAX_WINDOW_DAYS,
  baseWindowDays,
  resolveWindowDays,
} from "../lib/gsc/syncWindow.ts";

import { isValidProperty, normalizeEnvValue } from "../lib/gsc/envConfig.ts";

/* ── Env-Werte robust lesen ─────────────────────────────────────────────────── */

test("Env: ein Wert, der seinen eigenen Namen enthält, wird bereinigt", () => {
  // Genau dieser Fall stand in der Hosting-Umgebung und ließ jede
  // Google-Abfrage mit HTTP 400 auflaufen.
  assert.equal(
    normalizeEnvValue("GOOGLE_GSC_PROPERTY", "GOOGLE_GSC_PROPERTY=https://www.example.de/"),
    "https://www.example.de/",
  );
  assert.equal(
    normalizeEnvValue("GOOGLE_GSC_PROPERTY", 'GOOGLE_GSC_PROPERTY="sc-domain:example.de"'),
    "sc-domain:example.de",
  );
});

test("Env: korrekte Werte bleiben unverändert", () => {
  assert.equal(
    normalizeEnvValue("GOOGLE_GSC_PROPERTY", "https://www.example.de/"),
    "https://www.example.de/",
  );
  assert.equal(normalizeEnvValue("GOOGLE_GSC_PROPERTY", '  "sc-domain:example.de"  '), "sc-domain:example.de");
  assert.equal(normalizeEnvValue("GOOGLE_GSC_PROPERTY", undefined), undefined);
  assert.equal(normalizeEnvValue("GOOGLE_GSC_PROPERTY", "   "), undefined);
});

test("Property: nur Domain- und URL-Properties gelten als gültig", () => {
  assert.equal(isValidProperty("sc-domain:example.de"), true);
  assert.equal(isValidProperty("https://www.example.de/"), true);
  assert.equal(isValidProperty("http://example.de/"), true);
  assert.equal(isValidProperty("GOOGLE_GSC_PROPERTY=https://www.example.de/"), false);
  assert.equal(isValidProperty("example.de"), false);
  assert.equal(isValidProperty(undefined), false);
});

/* ── Self-Healing-Fenster ───────────────────────────────────────────────────── */

test("Fenster: im Normalbetrieb bleibt es beim Standardfenster", () => {
  assert.deepEqual(
    resolveWindowDays({
      baseDays: BASE_WINDOW_DAYS,
      dataAvailableUntil: "2026-08-04",
      endDate: "2026-08-05",
    }),
    { days: BASE_WINDOW_DAYS, catchUp: false },
  );
});

test("Fenster: eine Lücke innerhalb des Standardfensters wird ohne Mehraufwand gedeckt", () => {
  // 60 Tage Rückstand liegen bereits vollständig im 200-Tage-Fenster.
  const result = resolveWindowDays({
    baseDays: BASE_WINDOW_DAYS,
    dataAvailableUntil: "2026-06-06",
    endDate: "2026-08-05",
  });
  assert.equal(result.catchUp, false);
  assert.equal(result.days, BASE_WINDOW_DAYS);
});

test("Fenster: nach einem sehr langen Ausfall wird es genau so weit geöffnet wie nötig", () => {
  // 300 Tage Rückstand -> 300 + 14 Tage Puffer.
  const result = resolveWindowDays({
    baseDays: BASE_WINDOW_DAYS,
    dataAvailableUntil: "2025-10-09",
    endDate: "2026-08-05",
  });
  assert.equal(result.catchUp, true);
  assert.equal(result.days, 314);
});

test("Fenster: die Obergrenze hält auch einen mehrjährigen Rückstand", () => {
  const result = resolveWindowDays({
    baseDays: BASE_WINDOW_DAYS,
    dataAvailableUntil: "2022-01-01",
    endDate: "2026-08-05",
  });
  assert.equal(result.days, MAX_WINDOW_DAYS);
  assert.equal(result.catchUp, true);
});

test("Fenster: ohne bekannten Datenstand gilt das Standardfenster", () => {
  assert.deepEqual(
    resolveWindowDays({ baseDays: BASE_WINDOW_DAYS, dataAvailableUntil: null, endDate: "2026-08-05" }),
    { days: BASE_WINDOW_DAYS, catchUp: false },
  );
});

test("Fenster: die Env-Übersteuerung bleibt in sicheren Grenzen", () => {
  assert.equal(baseWindowDays(undefined), BASE_WINDOW_DAYS);
  assert.equal(baseWindowDays("nonsense"), BASE_WINDOW_DAYS);
  assert.equal(baseWindowDays("5"), 30);
  assert.equal(baseWindowDays("9999"), MAX_WINDOW_DAYS);
  assert.equal(baseWindowDays("120"), 120);
});

/* ── Markenerkennung ────────────────────────────────────────────────────────── */

test("Brand: alle beobachteten Schreibvarianten zählen als Marken-Suche", () => {
  for (const query of [
    "klühspies",
    "Klühspies",
    "kluehspies",
    "klühspieß",
    "klühspies reisen",
    "kluehspies reisen gmbh & co. kg",
    "klassenfahrten klühspies",
    "klühspies klassenfahrten & skireisen",
    "www.klassenfahrten-kluehspies.de",
  ]) {
    assert.equal(isBrandedQuery(query), true, `sollte branded sein: ${query}`);
  }
});

test("Brand: allgemeine Suchanfragen bleiben Nicht-Marken-Suchen", () => {
  for (const query of [
    "klassenfahrt berlin",
    "klassenfahrten anbieter",
    "abschlussfahrt 10 klasse",
    "skireise schule",
    "klassenfahrt buchen",
  ]) {
    assert.equal(isBrandedQuery(query), false, `sollte non-branded sein: ${query}`);
  }
});

test("Brand: Normalisierung fasst Umlaute und Schreibweisen zusammen", () => {
  assert.equal(normalizeQuery("Klühspies Reisen"), "kluehspiesreisen");
  assert.equal(normalizeQuery("klühspieß"), "kluehspiess");
  assert.equal(normalizeQuery("KLUEHSPIES-reisen.de"), "kluehspiesreisende");
});

test("Brand: das RE2-Muster enthält jede konfigurierte Variante", () => {
  const regex = brandQueryRegex();
  assert.ok(regex.startsWith("(?i)"), "Groß-/Kleinschreibung egal");
  for (const variant of BRAND_VARIANTS) {
    assert.ok(regex.includes(variant), `Variante fehlt im Filter: ${variant}`);
  }
});

/* ── Segment-Registry ───────────────────────────────────────────────────────── */

test("Segmente entstehen ausschließlich aus TRACKED_PAGES.brandSplit", () => {
  const expected = TRACKED_PAGES.filter((p) => p.brandSplit).length * 2;
  assert.equal(PAGE_SEGMENTS.length, expected);
  assert.deepEqual(
    segmentsForPage("homepage").map((s) => s.scopeValue),
    ["homepage:branded", "homepage:non_branded"],
  );
  // Eine Seite ohne brandSplit erzeugt keine Segment-Scopes.
  assert.deepEqual(segmentsForPage("berlin"), []);
});

/* ── Brand-Split über echte Tageszeitreihen ─────────────────────────────────── */

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

/** 14 Tage je Segment; Vorperiode 1.–7., aktuelle Periode 8.–14. */
function twoWeeks(batch, prev, cur) {
  return Array.from({ length: 14 }, (_, i) => {
    const date = `2026-08-${String(i + 1).padStart(2, "0")}`;
    const spec = i < 7 ? prev : cur;
    return day(batch, date, spec.clicks, spec.impressions, spec.position);
  });
}

const HOMEPAGE = TRACKED_PAGES.find((p) => p.key === "homepage");
const PAGE_WITH_SEGMENTS = {
  ...HOMEPAGE,
  batchId: "b-home",
  segments: [
    { kind: "branded", label: "Marken-Suchen", batchId: "b-brand" },
    { kind: "non_branded", label: "Nicht-Marken-Suchen", batchId: "b-nonbrand" },
  ],
};

const SPLIT_DAILY = [
  // Seite gesamt: 20 Klicks/Tag aktuell
  ...twoWeeks("b-home", { clicks: 10, impressions: 500, position: 15 }, { clicks: 20, impressions: 800, position: 12 }),
  // Marken-Suchen: 12 Klicks/Tag aktuell
  ...twoWeeks("b-brand", { clicks: 8, impressions: 60, position: 2 }, { clicks: 12, impressions: 80, position: 1.5 }),
  // Nicht-Marken: 4 Klicks/Tag aktuell
  ...twoWeeks("b-nonbrand", { clicks: 1, impressions: 400, position: 25 }, { clicks: 4, impressions: 600, position: 20 }),
];

test("Brand-Split: Anteile beziehen sich auf die zuordenbaren Summen", () => {
  const pageTotals = { clicks: 140, impressions: 5600, ctr: 0.025, position: 12, daysWithData: 7 };
  const split = buildBrandSplit({
    page: PAGE_WITH_SEGMENTS,
    pageTotals,
    daily: SPLIT_DAILY,
    dimensions: [],
    range: 7,
    rangeLabel: "7 Tage",
  });

  // 7 Tage aktuelle Periode: branded 84, non-branded 28 -> zuordenbar 112.
  assert.equal(split.branded.totals.clicks, 84);
  assert.equal(split.nonBranded.totals.clicks, 28);
  assert.equal(split.attributed.clicks, 112);
  assert.equal(split.branded.shareOfClicks, 84 / 112);
  assert.equal(split.nonBranded.shareOfClicks, 28 / 112);

  // Die Differenz zur Seite wird nicht verschluckt, sondern ausgewiesen.
  assert.equal(split.unattributed.clicks, 140 - 112);
  assert.equal(split.unattributed.impressions, 5600 - (560 + 4200));
});

test("Brand-Split: jedes Segment hat einen echten Vorperiodenvergleich", () => {
  const split = buildBrandSplit({
    page: PAGE_WITH_SEGMENTS,
    pageTotals: { clicks: 140, impressions: 5600, ctr: 0.025, position: 12, daysWithData: 7 },
    daily: SPLIT_DAILY,
    dimensions: [],
    range: 7,
    rangeLabel: "7 Tage",
  });

  // Nicht-Marken: 28 statt 7 Klicks -> +300 %.
  assert.equal(split.nonBranded.comparison.previous.clicks, 7);
  const clicks = split.nonBranded.metrics.find((m) => m.key === "clicks");
  assert.equal(Math.round(clicks.deltaPct), 300);
  assert.equal(clicks.assessment, "better");

  // Position 20 statt 25 ist eine Verbesserung, obwohl die Zahl fällt.
  assert.equal(split.nonBranded.metrics.find((m) => m.key === "position").assessment, "better");
});

test("Brand-Split: ein halber Split wird nicht gezeigt", () => {
  const halfway = {
    ...PAGE_WITH_SEGMENTS,
    segments: [{ kind: "branded", label: "Marken-Suchen", batchId: "b-brand" }],
  };
  assert.equal(
    buildBrandSplit({
      page: halfway,
      pageTotals: { clicks: 1, impressions: 1, ctr: 1, position: 1, daysWithData: 1 },
      daily: SPLIT_DAILY,
      dimensions: [],
      range: 7,
      rangeLabel: "7 Tage",
    }),
    null,
  );
});

test("Seiten-Auswahl: Segmente hängen nur an Seiten mit aktiven Segment-Datensätzen", () => {
  const activeDatasets = [
    { scope_type: "page", scope_value: HOMEPAGE.scopeValue, import_batch_id: "b-home" },
    { scope_type: "page_segment", scope_value: "homepage:branded", import_batch_id: "b-brand" },
    { scope_type: "page_segment", scope_value: "homepage:non_branded", import_batch_id: "b-nonbrand" },
    { scope_type: "product_page", scope_value: "Berlin", import_batch_id: "b-berlin" },
  ];
  const batches = [{ id: "b-home" }, { id: "b-brand" }, { id: "b-nonbrand" }, { id: "b-berlin" }];
  const options = buildPageOptions(activeDatasets, batches);

  const homepage = options.find((o) => o.key === "homepage");
  assert.deepEqual(
    homepage.segments.map((s) => s.kind),
    ["branded", "non_branded"],
  );
  assert.deepEqual(options.find((o) => o.key === "berlin").segments, []);
});

/* ── Beobachtungskette ──────────────────────────────────────────────────────── */

function run(status, startedAt, extra = {}) {
  return {
    status,
    started_at: startedAt,
    completed_at: status === "running" ? null : startedAt,
    error_message: null,
    records_processed: 100,
    trigger_source: "scheduler",
    dispatch_id: null,
    ...extra,
  };
}

function dispatch(extra = {}) {
  return {
    id: "d-1",
    job_name: "kluehspies-gsc-daily-sync",
    reason: "scheduled",
    scheduled_at: "2026-08-06T06:00:00Z",
    http_status: 200,
    delivered: true,
    error_message: null,
    reconciled_at: "2026-08-06T06:05:00Z",
    ...extra,
  };
}

test("Kette: vollständiger Durchlauf reißt nirgends ab", () => {
  const status = buildGscSyncStatus({
    runs: [run("success", "2026-08-06T06:00:05Z", { dispatch_id: "d-1" })],
    dataAsOf: "2026-08-04",
    todayIso: "2026-08-06",
    scopeCount: 8,
    dispatch: dispatch(),
  });
  assert.equal(status.state, "live");
  assert.equal(status.scopeCount, 8);
  assert.equal(status.chain.brokeAt, null);
  assert.equal(status.chain.delivered, true);
  assert.equal(status.chain.finished.status, "success");
});

test("Kette: nicht zugestellter Aufruf zeigt genau diese Stufe als Bruch", () => {
  const status = buildGscSyncStatus({
    runs: [],
    dataAsOf: "2026-07-21",
    todayIso: "2026-08-06",
    dispatch: dispatch({ delivered: false, http_status: 502, error_message: "HTTP 502" }),
  });
  assert.equal(status.chain.brokeAt, "delivery");
  assert.equal(status.chain.started, null);
  assert.equal(status.state, "stale");
});

test("Kette: ohne Scheduler-Auslösung bricht sie ganz vorn", () => {
  const status = buildGscSyncStatus({
    runs: [run("success", "2026-08-06T06:00:05Z")],
    dataAsOf: "2026-08-04",
    todayIso: "2026-08-06",
    dispatch: null,
  });
  assert.equal(status.chain.brokeAt, "scheduler");
  // Der manuelle Lauf ist trotzdem sichtbar.
  assert.equal(status.chain.started.at, "2026-08-06T06:00:05Z");
});

test("Kette: zugestellt, aber kein Lauf entstanden", () => {
  const status = buildGscSyncStatus({
    runs: [],
    dataAsOf: "2026-08-04",
    todayIso: "2026-08-06",
    dispatch: dispatch(),
  });
  assert.equal(status.chain.brokeAt, "start");
});

test("Status: der letzte Erfolg bleibt sichtbar, wenn der jüngste Versuch scheitert", () => {
  const status = buildGscSyncStatus({
    runs: [
      run("error", "2026-08-06T06:00:00Z", { error_message: "Kein Zugriff auf die Property." }),
      run("success", "2026-08-05T06:00:00Z"),
    ],
    dataAsOf: "2026-08-04",
    todayIso: "2026-08-06",
  });
  assert.equal(status.state, "failed");
  assert.equal(status.lastAttempt.status, "error");
  assert.equal(status.lastSuccess.started_at, "2026-08-05T06:00:00Z");
  assert.equal(status.lastError, "Kein Zugriff auf die Property.");
});
