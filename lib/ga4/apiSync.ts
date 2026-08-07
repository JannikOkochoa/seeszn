// ─── GA4-Sync: Tageswerte je Scope holen und fortschreiben ───────────────────
// Holt die Kennzahlen der Website und jeder getrackten Landingpage als
// Tageszeitreihe und schreibt sie per Upsert nach ga4_daily_metrics. Ein
// erneuter Lauf über denselben Zeitraum erzeugt dieselben Zeilen – deshalb ist
// jeder Lauf idempotent und das Nachholen einer Lücke der Normalfall.
//
// Fünf Abfragen je Lauf, unabhängig davon, wie viele Seiten getrackt sind:
//   1. Website:      [date]                        → Basiskennzahlen
//   2. Seiten:       [date, landingPage]           → dieselben Kennzahlen
//   3. Website:      [date, eventName]             → Abschluss-Events
//   4. Seiten:       [date, landingPage, eventName]→ Abschluss-Events je Seite
//   5. Katalog:      [eventName]                   → Event-Audit
//
// Zeitzone: GA4 liefert Tage in der Zeitzone der Property (hier Europe/Berlin).
// Sie wird aus der API-Antwort übernommen und mitgespeichert, nicht angenommen
// – sonst entstünde eine stille Verschiebung gegenüber der Search Console.

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CONVERSION_EVENTS,
  PRIMARY_CONVERSION_EVENT,
  SECONDARY_CONVERSION_EVENT,
} from "./events";
import {
  GA4_LANDING_PATHS,
  GA4_PAGE_MAPPINGS,
  GA4_SITE_SCOPE,
  ga4PageScopeKey,
  pageKeyForLandingPath,
} from "./pageMapping";
import { runGa4Report, resolveGa4Credentials, type Ga4Report } from "./apiClient";

const GA4_PROVIDER = "google_analytics_4";
const ORG_SLUG = "kluehspies";
const CHUNK = 500;

/**
 * Ladefenster. Wie bei der Search Console das Minimum, das die Oberfläche
 * braucht: 90 Tage Ansicht plus 90 Tage Vorperiode plus Puffer.
 */
export const GA4_WINDOW_DAYS = 200;
/** GA4 verarbeitet Daten mit bis zu 48 Stunden Verzug. */
export const GA4_LAG_DAYS = 2;

/** Die sieben Basiskennzahlen; Raten und Durchschnitte werden abgeleitet. */
const BASE_METRICS = [
  "sessions",
  "activeUsers",
  "totalUsers",
  "newUsers",
  "engagedSessions",
  "userEngagementDuration",
  "screenPageViews",
] as const;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}
/** GA4 liefert Datumswerte als "20260804". */
function parseGa4Date(raw: string): string | null {
  return /^\d{8}$/.test(raw) ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : null;
}

interface MetricRow {
  scope_key: string;
  date: string;
  sessions: number;
  active_users: number;
  total_users: number;
  new_users: number;
  engaged_sessions: number;
  user_engagement_duration: number;
  screen_page_views: number;
  primary_conversions: number;
  secondary_conversions: number;
}

function emptyRow(scopeKey: string, date: string): MetricRow {
  return {
    scope_key: scopeKey,
    date,
    sessions: 0,
    active_users: 0,
    total_users: 0,
    new_users: 0,
    engaged_sessions: 0,
    user_engagement_duration: 0,
    screen_page_views: 0,
    primary_conversions: 0,
    secondary_conversions: 0,
  };
}

function applyBaseMetrics(row: MetricRow, values: string[]): void {
  const n = (i: number) => Number(values[i] ?? 0) || 0;
  row.sessions = n(0);
  row.active_users = n(1);
  row.total_users = n(2);
  row.new_users = n(3);
  row.engaged_sessions = n(4);
  row.user_engagement_duration = n(5);
  row.screen_page_views = n(6);
}

export interface Ga4SyncResult {
  window: { startDate: string; endDate: string; days: number };
  timeZone: string | null;
  propertyId: string;
  /** Zeilen je Scope, geschrieben. */
  scopes: Array<{ scopeKey: string; label: string; days: number }>;
  rowsWritten: number;
  eventsCatalogued: number;
  dataAvailableUntil: string | null;
  subjectToThresholding: boolean;
  syncRunId: string | null;
}

export class Ga4SyncAlreadyRunningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Ga4SyncAlreadyRunningError";
  }
}

/* ── Datenbeschaffung ───────────────────────────────────────────────────────── */

const landingPageInList = {
  filter: {
    fieldName: "landingPage",
    inListFilter: { values: [...GA4_LANDING_PATHS] },
  },
};
const conversionEventInList = {
  filter: {
    fieldName: "eventName",
    inListFilter: { values: [...CONVERSION_EVENTS] },
  },
};

async function fetchAll(
  startDate: string,
  endDate: string,
): Promise<{ rows: Map<string, MetricRow>; report: Ga4Report; events: Ga4Report }> {
  const dateRanges = [{ startDate, endDate }];
  const metrics = BASE_METRICS.map((name) => ({ name }));
  const byKey = new Map<string, MetricRow>();
  const keyOf = (scopeKey: string, date: string) => `${scopeKey}|${date}`;

  const upsert = (scopeKey: string, date: string): MetricRow => {
    const key = keyOf(scopeKey, date);
    let row = byKey.get(key);
    if (!row) {
      row = emptyRow(scopeKey, date);
      byKey.set(key, row);
    }
    return row;
  };

  // 1) Website gesamt
  const site = await runGa4Report({ dateRanges, dimensions: [{ name: "date" }], metrics });
  for (const r of site.rows) {
    const date = parseGa4Date(r.dimensionValues[0]?.value ?? "");
    if (!date) continue;
    applyBaseMetrics(upsert(GA4_SITE_SCOPE, date), r.metricValues.map((v) => v.value));
  }

  // 2) Getrackte Landingpages – eine Abfrage für alle
  const pages = await runGa4Report({
    dateRanges,
    dimensions: [{ name: "date" }, { name: "landingPage" }],
    metrics,
    dimensionFilter: landingPageInList,
  });
  for (const r of pages.rows) {
    const date = parseGa4Date(r.dimensionValues[0]?.value ?? "");
    const pageKey = pageKeyForLandingPath(r.dimensionValues[1]?.value ?? "");
    if (!date || !pageKey) continue;
    applyBaseMetrics(
      upsert(ga4PageScopeKey(pageKey), date),
      r.metricValues.map((v) => v.value),
    );
  }

  // 3) Abschluss-Events der ganzen Website
  const siteEvents = await runGa4Report({
    dateRanges,
    dimensions: [{ name: "date" }, { name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: conversionEventInList,
  });
  for (const r of siteEvents.rows) {
    const date = parseGa4Date(r.dimensionValues[0]?.value ?? "");
    if (!date) continue;
    const row = upsert(GA4_SITE_SCOPE, date);
    const count = Number(r.metricValues[0]?.value ?? 0) || 0;
    if (r.dimensionValues[1]?.value === PRIMARY_CONVERSION_EVENT) row.primary_conversions += count;
    if (r.dimensionValues[1]?.value === SECONDARY_CONVERSION_EVENT) row.secondary_conversions += count;
  }

  // 4) Abschluss-Events je Landingpage
  const pageEvents = await runGa4Report({
    dateRanges,
    dimensions: [{ name: "date" }, { name: "landingPage" }, { name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      andGroup: { expressions: [landingPageInList, conversionEventInList] },
    },
  });
  for (const r of pageEvents.rows) {
    const date = parseGa4Date(r.dimensionValues[0]?.value ?? "");
    const pageKey = pageKeyForLandingPath(r.dimensionValues[1]?.value ?? "");
    if (!date || !pageKey) continue;
    const row = upsert(ga4PageScopeKey(pageKey), date);
    const count = Number(r.metricValues[0]?.value ?? 0) || 0;
    if (r.dimensionValues[2]?.value === PRIMARY_CONVERSION_EVENT) row.primary_conversions += count;
    if (r.dimensionValues[2]?.value === SECONDARY_CONVERSION_EVENT) row.secondary_conversions += count;
  }

  // 5) Event-Katalog über das gesamte Fenster
  const events = await runGa4Report({
    dateRanges,
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "keyEvents" }, { name: "totalUsers" }],
    limit: 500,
  });

  return { rows: byKey, report: site, events };
}

/* ── Öffentlicher Einstieg ──────────────────────────────────────────────────── */

export async function runGa4Sync(opts: {
  admin: SupabaseClient;
  triggerSource?: "scheduler" | "self_heal" | "admin" | "manual";
  dispatchId?: string | null;
}): Promise<Ga4SyncResult> {
  const { admin, triggerSource = "manual", dispatchId = null } = opts;
  const creds = await resolveGa4Credentials();

  const org = await admin.from("organizations").select("id").eq("slug", ORG_SLUG).maybeSingle();
  if (org.error) throw new Error(org.error.message);
  if (!org.data) throw new Error(`Organisation '${ORG_SLUG}' nicht gefunden.`);
  const organizationId = org.data.id as string;

  const source = await admin
    .from("data_sources")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("provider", GA4_PROVIDER)
    .maybeSingle();
  const dataSourceId = (source.data?.id as string | undefined) ?? null;
  if (!dataSourceId) throw new Error("Keine GA4-Datenquelle in data_sources.");

  // Lauf beanspruchen – je Datenquelle, damit GSC und GA4 sich nicht blockieren.
  const claim = await admin.rpc("claim_sync_run", {
    p_organization_id: organizationId,
    p_data_source_id: dataSourceId,
    p_trigger_source: triggerSource,
    p_dispatch_id: dispatchId,
  });
  if (claim.error) throw new Error(`Lauf konnte nicht beansprucht werden: ${claim.error.message}`);
  const syncRunId = (claim.data as string | null) ?? null;
  if (!syncRunId) {
    throw new Ga4SyncAlreadyRunningError("Für GA4 läuft bereits ein Sync.");
  }

  const finishRun = async (
    status: "success" | "error",
    records: number,
    errorMessage: string | null,
  ) => {
    await admin
      .from("sync_runs")
      .update({
        status,
        completed_at: new Date().toISOString(),
        records_processed: records,
        error_message: errorMessage,
      })
      .eq("id", syncRunId);
  };

  try {
    const endDate = addDays(isoDate(new Date()), -GA4_LAG_DAYS);
    const startDate = addDays(endDate, -(GA4_WINDOW_DAYS - 1));

    const { rows, report, events } = await fetchAll(startDate, endDate);

    // Property-Zustand fortschreiben: die Zeitzone kommt aus der Antwort.
    await admin.from("ga4_property_state").upsert(
      {
        organization_id: organizationId,
        property_id: creds.propertyId,
        time_zone: report.timeZone,
        currency_code: report.currencyCode,
        subject_to_thresholding: report.subjectToThresholding,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id" },
    );

    const metricRows = [...rows.values()].map((r) => ({ organization_id: organizationId, ...r }));
    for (let i = 0; i < metricRows.length; i += CHUNK) {
      const chunk = await admin
        .from("ga4_daily_metrics")
        .upsert(metricRows.slice(i, i + CHUNK), { onConflict: "organization_id,scope_key,date" });
      if (chunk.error) throw new Error(`Tageswerte-Upsert fehlgeschlagen: ${chunk.error.message}`);
    }

    const eventRows = events.rows.map((r) => ({
      organization_id: organizationId,
      event_name: r.dimensionValues[0]?.value ?? "",
      period_start: startDate,
      period_end: endDate,
      event_count: Number(r.metricValues[0]?.value ?? 0) || 0,
      key_events: Number(r.metricValues[1]?.value ?? 0) || 0,
      total_users: Number(r.metricValues[2]?.value ?? 0) || 0,
      is_key_event: (Number(r.metricValues[1]?.value ?? 0) || 0) > 0,
      captured_at: new Date().toISOString(),
    }));
    if (eventRows.length > 0) {
      const ev = await admin
        .from("ga4_event_snapshots")
        .upsert(eventRows, { onConflict: "organization_id,event_name" });
      if (ev.error) throw new Error(`Event-Katalog-Upsert fehlgeschlagen: ${ev.error.message}`);
    }

    const dataAvailableUntil =
      metricRows
        .filter((r) => r.scope_key === GA4_SITE_SCOPE && r.sessions > 0)
        .map((r) => r.date)
        .sort()
        .at(-1) ?? null;

    if (dataAvailableUntil) {
      await admin
        .from("data_sources")
        .update({
          data_available_until: dataAvailableUntil,
          last_successful_sync_at: new Date().toISOString(),
          status: "idle",
          last_error: null,
        })
        .eq("id", dataSourceId);
    }

    await finishRun("success", metricRows.length + eventRows.length, null);

    const scopes = [
      {
        scopeKey: GA4_SITE_SCOPE,
        label: "Website gesamt",
        days: metricRows.filter((r) => r.scope_key === GA4_SITE_SCOPE).length,
      },
      ...GA4_PAGE_MAPPINGS.map((m) => ({
        scopeKey: ga4PageScopeKey(m.pageKey),
        label: m.label,
        days: metricRows.filter((r) => r.scope_key === ga4PageScopeKey(m.pageKey)).length,
      })),
    ];

    return {
      window: { startDate, endDate, days: GA4_WINDOW_DAYS },
      timeZone: report.timeZone,
      propertyId: creds.propertyId,
      scopes,
      rowsWritten: metricRows.length,
      eventsCatalogued: eventRows.length,
      dataAvailableUntil,
      subjectToThresholding: report.subjectToThresholding,
      syncRunId,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message.slice(0, 500) : "Unbekannter Fehler";
    await finishRun("error", 0, message);
    await admin
      .from("data_sources")
      .update({ status: "error", last_error: message })
      .eq("id", dataSourceId);
    throw err;
  }
}
