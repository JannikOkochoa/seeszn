// ─── GSC-Sync-Service ─────────────────────────────────────────────────────────
// Kapselt den kompletten Sync-Ablauf; der Route Handler bleibt dünn.
// Läuft mit dem Admin-Client (service_role), nachdem der Handler Auth und
// Rolle geprüft hat. Idempotent: alle Schreibvorgänge sind Upserts über die
// Unique Constraints, wiederholte Läufe erzeugen keine Duplikate.
// Fehlerpfad: sync_run und data_source erhalten den Fehler, der letzte
// gültige Datenstand (data_available_until) bleibt unangetastet.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GscProvider } from "./types";

export const METRIC_KEY_ORGANIC_PRODUCT_CLICKS = "organic_clicks_product_pages";
export const GSC_PROVIDER_NAME = "google_search_console";

/** Backfill-Fenster, wenn noch gar keine Daten vorhanden sind. */
const DEFAULT_BACKFILL_DAYS = 28;
/** Upsert-Batchgröße, hält Requests unter den PostgREST-Limits. */
const CHUNK_SIZE = 500;

export class SyncConflictError extends Error {
  constructor() {
    super("Für diese Datenquelle läuft bereits ein Sync.");
    this.name = "SyncConflictError";
  }
}

export interface SyncResult {
  syncRunId: string;
  provider: GscProvider["kind"];
  fromDate: string | null;
  toDate: string | null;
  recordsProcessed: number;
  dataAvailableUntil: string | null;
}

interface DataSourceRow {
  id: string;
  organization_id: string;
  data_available_until: string | null;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

function yesterdayUtc(): string {
  return addDays(isoDate(new Date()), -1);
}

export async function runGscSync(opts: {
  admin: SupabaseClient;
  dataSource: DataSourceRow;
  provider: GscProvider;
  siteUrl: string;
}): Promise<SyncResult> {
  const { admin, provider, siteUrl } = opts;
  const { id: dataSourceId, organization_id: organizationId } = opts.dataSource;

  // Parallele Syncs verhindern: atomarer Statuswechsel idle/error -> syncing.
  // Nur genau ein Aufrufer gewinnt das konditionale UPDATE.
  const claim = await admin
    .from("data_sources")
    .update({ status: "syncing" })
    .eq("id", dataSourceId)
    .neq("status", "syncing")
    .select("id, data_available_until");
  if (claim.error) throw new Error(claim.error.message);
  if (!claim.data || claim.data.length === 0) throw new SyncConflictError();

  const dataAvailableUntil = claim.data[0].data_available_until as string | null;

  const run = await admin
    .from("sync_runs")
    .insert({
      organization_id: organizationId,
      data_source_id: dataSourceId,
      status: "running",
    })
    .select("id")
    .single();
  if (run.error) {
    // Claim wieder freigeben, sonst blockiert die Quelle dauerhaft.
    await admin.from("data_sources").update({ status: "error" }).eq("id", dataSourceId);
    throw new Error(run.error.message);
  }
  const syncRunId = run.data.id as string;

  try {
    // Nur fehlende Tage importieren: ab dem Tag nach dem letzten Datenstand
    // bis gestern (GSC liefert für heute keine finalen Werte).
    const toDate = yesterdayUtc();
    const fromDate = dataAvailableUntil
      ? addDays(dataAvailableUntil, 1)
      : addDays(toDate, -(DEFAULT_BACKFILL_DAYS - 1));

    if (fromDate > toDate) {
      await finishRun(admin, syncRunId, dataSourceId, 0, dataAvailableUntil);
      return {
        syncRunId,
        provider: provider.kind,
        fromDate: null,
        toDate: null,
        recordsProcessed: 0,
        dataAvailableUntil,
      };
    }

    // Seiten und KPI-Definition der Organisation laden.
    const [pagesRes, kpiRes] = await Promise.all([
      admin
        .from("pages")
        .select("id, url, segment")
        .eq("organization_id", organizationId),
      admin
        .from("kpi_definitions")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("metric_key", METRIC_KEY_ORGANIC_PRODUCT_CLICKS)
        .maybeSingle(),
    ]);
    if (pagesRes.error) throw new Error(pagesRes.error.message);
    if (kpiRes.error) throw new Error(kpiRes.error.message);
    if (!kpiRes.data) {
      throw new Error(`KPI-Definition ${METRIC_KEY_ORGANIC_PRODUCT_CLICKS} fehlt.`);
    }
    const kpiDefinitionId = kpiRes.data.id as string;

    const pages = pagesRes.data as Array<{ id: string; url: string; segment: string | null }>;
    if (pages.length === 0) {
      throw new Error("Keine Seiten für diese Organisation hinterlegt.");
    }
    const pageByUrl = new Map(pages.map((p) => [p.url, p]));

    const rows = await provider.fetchDailyMetrics({
      siteUrl,
      startDate: fromDate,
      endDate: toDate,
      pageUrls: pages.map((p) => p.url),
    });

    // Rohdaten upserten; unbekannte URLs werden bewusst übersprungen, damit
    // externe GSC-Strukturen nicht ungefiltert ins Datenmodell laufen.
    const metricRows = rows
      .filter((row) => pageByUrl.has(row.pageUrl))
      .map((row) => ({
        organization_id: organizationId,
        data_source_id: dataSourceId,
        date: row.date,
        page_id: pageByUrl.get(row.pageUrl)!.id,
        query: row.query,
        device: row.device,
        country: row.country,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      }));

    for (let i = 0; i < metricRows.length; i += CHUNK_SIZE) {
      const chunk = metricRows.slice(i, i + CHUNK_SIZE);
      const { error } = await admin.from("gsc_daily_metrics").upsert(chunk, {
        onConflict: "data_source_id,date,page_id,query,device,country",
      });
      if (error) throw new Error(error.message);
    }

    // KPI-Aggregation: Summe der Klicks pro Tag über alle Produktseiten.
    const clicksByDate = new Map<string, number>();
    for (const row of rows) {
      const page = pageByUrl.get(row.pageUrl);
      if (page?.segment !== "product") continue;
      clicksByDate.set(row.date, (clicksByDate.get(row.date) ?? 0) + row.clicks);
    }

    const snapshotRows = [...clicksByDate.entries()].map(([date, value]) => ({
      organization_id: organizationId,
      kpi_definition_id: kpiDefinitionId,
      date,
      value,
    }));
    if (snapshotRows.length > 0) {
      const { error } = await admin.from("kpi_snapshots").upsert(snapshotRows, {
        onConflict: "kpi_definition_id,date",
      });
      if (error) throw new Error(error.message);
    }

    await finishRun(admin, syncRunId, dataSourceId, metricRows.length, toDate);

    return {
      syncRunId,
      provider: provider.kind,
      fromDate,
      toDate,
      recordsProcessed: metricRows.length,
      dataAvailableUntil: toDate,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Sync-Fehler";
    // Letzten gültigen Datenstand erhalten: data_available_until bleibt stehen.
    await Promise.all([
      admin
        .from("sync_runs")
        .update({
          status: "error",
          completed_at: new Date().toISOString(),
          error_message: message,
        })
        .eq("id", syncRunId),
      admin
        .from("data_sources")
        .update({ status: "error", last_error: message })
        .eq("id", dataSourceId),
    ]);
    throw err;
  }
}

async function finishRun(
  admin: SupabaseClient,
  syncRunId: string,
  dataSourceId: string,
  recordsProcessed: number,
  dataAvailableUntil: string | null,
): Promise<void> {
  const completedAt = new Date().toISOString();
  const [runRes, sourceRes] = await Promise.all([
    admin
      .from("sync_runs")
      .update({
        status: "success",
        completed_at: completedAt,
        records_processed: recordsProcessed,
      })
      .eq("id", syncRunId),
    admin
      .from("data_sources")
      .update({
        status: "idle",
        last_successful_sync_at: completedAt,
        data_available_until: dataAvailableUntil,
        last_error: null,
      })
      .eq("id", dataSourceId),
  ]);
  if (runRes.error) throw new Error(runRes.error.message);
  if (sourceRes.error) throw new Error(sourceRes.error.message);
}
