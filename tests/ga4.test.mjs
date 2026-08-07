// ─── Tests: GA4-Zuordnung, Aggregation und Invarianten ───────────────────────
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs tests/ga4.test.mjs
//
// Zwei Lektionen aus den vorherigen Audits stecken hier drin:
//   1. Jede Kennzahl muss ihren tatsächlichen Zeitraum kennen (GSC-Audit).
//   2. Nicht jede Metrik darf über Tage summiert werden (GA4-Audit): Sitzungen
//      und neue Nutzer ja, aktive und gesamte Nutzer nicht.

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGa4PageModel,
  formatEngagementTime,
  ga4DataAsOf,
  ga4PeriodTotals,
  ga4RowsForScope,
} from "../lib/kpi/ga4Data.ts";
import {
  GA4_LANDING_PATHS,
  GA4_PAGE_MAPPINGS,
  ga4PageScopeKey,
  pageKeyForLandingPath,
  toGa4LandingPath,
} from "../lib/ga4/pageMapping.ts";
import {
  CONVERSION_EVENTS,
  PRIMARY_CONVERSION_EVENT,
  categorizeEvent,
} from "../lib/ga4/events.ts";
import { TRACKED_PAGES } from "../lib/gsc/pageScopes.ts";

/* ── URL-Normalisierung ─────────────────────────────────────────────────────── */

test("Landingpage: absolute URL wird auf den GA4-Pfad reduziert", () => {
  assert.equal(toGa4LandingPath("https://www.klassenfahrten-kluehspies.de/"), "/");
  assert.equal(
    toGa4LandingPath("https://www.klassenfahrten-kluehspies.de/staedte-klassenfahrten/deutschland/berlin/"),
    "/staedte-klassenfahrten/deutschland/berlin",
  );
});

test("Landingpage: Trailing Slash fällt weg, außer bei der Startseite", () => {
  // Genau diese Regel hat die Property bestätigt: "/staedte-klassenfahrten"
  // ohne Schrägstrich, aber "/" für die Startseite. Eine naive Zuordnung mit
  // Schrägstrich trifft in GA4 nichts.
  assert.equal(toGa4LandingPath("/berlin/"), "/berlin");
  assert.equal(toGa4LandingPath("/berlin//"), "/berlin");
  assert.equal(toGa4LandingPath("/"), "/");
  assert.equal(toGa4LandingPath(""), "/");
});

test("Landingpage: Query und Fragment gehören nicht dazu", () => {
  assert.equal(toGa4LandingPath("/reiseanfrage/?showCart=1&cHash=abc"), "/reiseanfrage");
  assert.equal(toGa4LandingPath("/angebote#top"), "/angebote");
  assert.equal(toGa4LandingPath("angebote"), "/angebote");
});

test("Landingpage: jede getrackte Seite hat genau einen eindeutigen Pfad", () => {
  assert.equal(GA4_PAGE_MAPPINGS.length, TRACKED_PAGES.length);
  assert.equal(new Set(GA4_LANDING_PATHS).size, GA4_LANDING_PATHS.length);
  for (const m of GA4_PAGE_MAPPINGS) {
    assert.equal(pageKeyForLandingPath(m.landingPath), m.pageKey);
    // Auch mit Schrägstrich muss die Rückabbildung greifen.
    assert.equal(pageKeyForLandingPath(`${m.landingPath}/`), m.pageKey);
  }
});

test("Landingpage: fremde Pfade werden keiner getrackten Seite zugeordnet", () => {
  assert.equal(pageKeyForLandingPath("/staedte-klassenfahrten"), null);
  assert.equal(pageKeyForLandingPath("/staedte-klassenfahrten/deutschland/koeln"), null);
  assert.equal(pageKeyForLandingPath("(not set)"), null);
});

/* ── Event-Einordnung ───────────────────────────────────────────────────────── */

test("Events: der Lead ist der Abschluss, nicht der Einstieg", () => {
  assert.equal(PRIMARY_CONVERSION_EVENT, "step9_anfrage_abgeschickt");
  assert.equal(categorizeEvent("step9_anfrage_abgeschickt", true).category, "primary_conversion");
  // Der Formularstart ist ausdrücklich KEIN Lead, obwohl GA4 ihn als Key Event führt.
  assert.equal(categorizeEvent("step0_anfrage_form_start", true).category, "engagement");
  assert.equal(categorizeEvent("reisefinder_liste", true).category, "engagement");
  assert.equal(categorizeEvent("cta_header_reisebarater_link", true).category, "engagement");
});

test("Events: unbekannte Events werden nicht geraten", () => {
  const unknown = categorizeEvent("ein_neues_event", false);
  assert.equal(unknown.category, "system");
  assert.equal(unknown.rationale, null);
  const unknownKey = categorizeEvent("ein_neues_key_event", true);
  assert.equal(unknownKey.category, "engagement");
  assert.equal(unknownKey.rationale, null);
});

test("Events: nur Abschluss-Events werden je Seite synchronisiert", () => {
  assert.deepEqual([...CONVERSION_EVENTS], [
    "step9_anfrage_abgeschickt",
    "kontaktformular_abgeschickt",
  ]);
});

/* ── Aggregation ────────────────────────────────────────────────────────────── */

function day(scopeKey, date, over = {}) {
  return {
    scope_key: scopeKey,
    date,
    sessions: 10,
    active_users: 8,
    total_users: 9,
    new_users: 6,
    engaged_sessions: 5,
    user_engagement_duration: 600,
    screen_page_views: 30,
    primary_conversions: 1,
    secondary_conversions: 0,
    ...over,
  };
}

/** 14 Tage: 01.–07. Vorperiode, 08.–14. aktuelle Periode. */
const ROWS = [
  ...Array.from({ length: 7 }, (_, i) =>
    day("page:homepage", `2026-08-0${i + 1}`, { sessions: 10, primary_conversions: 1 }),
  ),
  ...Array.from({ length: 7 }, (_, i) =>
    day("page:homepage", `2026-08-${String(i + 8).padStart(2, "0")}`, {
      sessions: 20,
      engaged_sessions: 14,
      primary_conversions: 3,
      user_engagement_duration: 1800,
    }),
  ),
  // Ein anderer Scope mit riesigen Zahlen – darf nie einfließen.
  ...Array.from({ length: 14 }, (_, i) =>
    day("site", `2026-08-${String(i + 1).padStart(2, "0")}`, { sessions: 5000, primary_conversions: 400 }),
  ),
];

const CURRENT = { from: "2026-08-08", to: "2026-08-14" };
const PREVIOUS = { from: "2026-08-01", to: "2026-08-07" };

test("Aggregation: nur der eigene Scope, nur der eigene Zeitraum", () => {
  const t = ga4PeriodTotals(ga4RowsForScope(ROWS, "page:homepage"), CURRENT);
  assert.equal(t.sessions, 7 * 20);
  assert.equal(t.primaryConversions, 7 * 3);
  assert.equal(t.daysWithData, 7);
  // Der site-Scope trägt 5000 Sitzungen je Tag – nichts davon darf ankommen.
  assert.ok(t.sessions < 1000);
});

test("Aggregation: Raten kommen aus den Summen, nicht aus Tagesmittelwerten", () => {
  const t = ga4PeriodTotals(ga4RowsForScope(ROWS, "page:homepage"), CURRENT);
  assert.equal(t.engagementRate, (7 * 14) / (7 * 20));
  assert.equal(t.averageEngagementTime, (7 * 1800) / (7 * 20));
  assert.equal(t.conversionRate, (7 * 3) / (7 * 20));
});

test("Aggregation: Tagessummen der Nutzer sind als solche benannt", () => {
  const t = ga4PeriodTotals(ga4RowsForScope(ROWS, "page:homepage"), CURRENT);
  // Die nicht additiven Werte existieren, heißen aber unmissverständlich
  // "DailySum" – sie dürfen nie als Nutzerzahl eines Zeitraums erscheinen.
  assert.equal(t.activeUsersDailySum, 7 * 8);
  assert.equal(t.totalUsersDailySum, 7 * 9);
  assert.ok(!("activeUsers" in t), "activeUsers wäre als Zeitraumwert irreführend");
  assert.ok(!("totalUsers" in t), "totalUsers wäre als Zeitraumwert irreführend");
});

test("Modell: die angezeigten Metriken enthalten keine summierten Nutzerzahlen", () => {
  const m = buildGa4PageModel({
    rows: ROWS,
    scopeKey: "page:homepage",
    range: CURRENT,
    previousRange: PREVIOUS,
  });
  const keys = m.traffic.map((x) => x.key);
  assert.ok(keys.includes("newUsers"), "neue Nutzer sind additiv und dürfen erscheinen");
  assert.ok(!keys.includes("activeUsers"));
  assert.ok(!keys.includes("totalUsers"));
});

test("Modell: rechnet über den übergebenen Zeitraum, nicht über einen eigenen", () => {
  const m = buildGa4PageModel({
    rows: ROWS,
    scopeKey: "page:homepage",
    range: CURRENT,
    previousRange: PREVIOUS,
  });
  assert.deepEqual(m.range, CURRENT);
  assert.deepEqual(m.previousRange, PREVIOUS);
  assert.equal(m.current.sessions, 140);
  assert.equal(m.previous.sessions, 70);
  const sessions = m.traffic.find((x) => x.key === "sessions");
  assert.equal(Math.round(sessions.deltaPct), 100);
  assert.equal(sessions.assessment, "better");
});

test("Modell: Lücken im Zeitraum werden gezählt, nicht kaschiert", () => {
  const sparse = ROWS.filter((r) => r.date !== "2026-08-10" && r.date !== "2026-08-11");
  const m = buildGa4PageModel({
    rows: sparse,
    scopeKey: "page:homepage",
    range: CURRENT,
    previousRange: PREVIOUS,
  });
  assert.equal(m.current.daysWithData, 5);
  assert.equal(m.missingDays, 2);
});

test("Modell: ohne Daten im Zeitraum gibt es null statt Nullwerten", () => {
  assert.equal(
    buildGa4PageModel({
      rows: ROWS,
      scopeKey: "page:hamburg",
      range: CURRENT,
      previousRange: PREVIOUS,
    }),
    null,
  );
  assert.equal(
    buildGa4PageModel({
      rows: ROWS,
      scopeKey: "page:homepage",
      range: { from: "2027-01-01", to: "2027-01-07" },
      previousRange: null,
    }),
    null,
  );
});

test("Datenstand: Tage ohne Sitzungen zählen nicht als Datenstand", () => {
  const rows = [
    day("page:homepage", "2026-08-01"),
    day("page:homepage", "2026-08-02", { sessions: 0 }),
  ];
  assert.equal(ga4DataAsOf(rows), "2026-08-01");
});

test("Scope-Schlüssel: Seite und Website sind nie verwechselbar", () => {
  assert.equal(ga4PageScopeKey("homepage"), "page:homepage");
  assert.notEqual(ga4PageScopeKey("homepage"), "site");
});

test("Formatierung: Interaktionszeit als Minuten und Sekunden", () => {
  assert.equal(formatEngagementTime(0), "0:00 Min.");
  assert.equal(formatEngagementTime(58), "0:58 Min.");
  assert.equal(formatEngagementTime(83), "1:23 Min.");
  assert.equal(formatEngagementTime(null), "–");
});
