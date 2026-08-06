// ─── GSC-API-Sync: Adapter auf das bestehende Import-Batch-Modell ─────────────
// Holt die aktuellen Search-Console-Daten je Scope über die API und schreibt
// sie in exakt dieselben Tabellen, die das Dashboard bereits liest
// (gsc_import_batches, gsc_scope_daily_metrics, gsc_dimension_snapshots,
// gsc_active_datasets). Kein zweites Analytics-System, keine neue UI.
//
// Sicherheits- und Fallback-Prinzipien (identisch zum manuellen Export-Import):
//   * Schreiben nur mit dem Admin-Client (service_role), nachdem der Aufrufer
//     (Route Handler) Secret oder Rolle geprüft hat.
//   * Ein Scope wird erst nach vollständigem, verifiziertem Insert aktiviert
//     (activate = atomarer Upsert in gsc_active_datasets). Schlägt ein Scope
//     fehl oder liefert die API leere Daten, bleibt der zuletzt aktive Batch
//     unverändert – das Dashboard zeigt weiter die letzten guten Daten bzw. den
//     bestehenden Export. Damit ist der Fallback strukturell garantiert.
//   * Ältere API-Batches je Scope werden nach erfolgreicher Aktivierung
//     entfernt (nur solche mit metadata.source = "gsc_api_sync"); manuell
//     importierte Export-Batches (.zip) bleiben als Fallback-Historie erhalten.

import "server-only";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GscDimensionType, GscScopeType } from "@/lib/kpi/types";
import { API_SCOPES, type ApiScope } from "./apiScopes";
import { baseWindowDays, resolveWindowDays } from "./syncWindow";
import {
  GscAuthError,
  GscConfigError,
  querySearchAnalytics,
  type GscApiMetricRow,
} from "./apiClient";

const ORG_SLUG = "kluehspies";
const GSC_PROVIDER_NAME = "google_search_console";
export const API_SYNC_SOURCE = "gsc_api_sync";
const CHUNK = 500;

// Die Fensterrechnung lebt in lib/gsc/syncWindow.ts – dort ohne server-only
// und damit einzeln testbar.

/** GSC-Dimensionstabellen → interner Dimensionstyp (wie im Export-Import). */
const DIMENSION_QUERIES: ReadonlyArray<{ dimension: string; type: GscDimensionType }> = [
  { dimension: "query", type: "query" },
  { dimension: "page", type: "page" },
  { dimension: "device", type: "device" },
  { dimension: "country", type: "country" },
  { dimension: "searchAppearance", type: "search_appearance" },
];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}
function clampCtr(n: number): number {
  return Math.min(1, Math.max(0, n));
}

interface DailyRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}
interface DimensionRow {
  dimension_type: GscDimensionType;
  dimension_value: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface ScopeSyncResult {
  scopeType: GscScopeType;
  scopeValue: string | null;
  status: "activated" | "unchanged" | "skipped_empty" | "error";
  periodStart: string | null;
  periodEnd: string | null;
  dailyRows: number;
  dimensionRows: number;
  message?: string;
}

/** Wer den Lauf ausgelöst hat; spiegelt sync_runs.trigger_source. */
export type SyncTriggerSource = "scheduler" | "self_heal" | "admin" | "manual";

/**
 * Es läuft bereits ein Sync für diese Organisation. Kein Fehlerfall im
 * eigentlichen Sinn: der Aufrufer bricht ab, statt parallel dieselben Batches
 * zu schreiben.
 */
export class SyncAlreadyRunningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SyncAlreadyRunningError";
  }
}

export interface ApiSyncResult {
  window: {
    startDate: string;
    endDate: string;
    days: number;
    /** true = Fenster wurde geweitet, um eine echte Datenlücke zu schließen. */
    catchUp: boolean;
  };
  scopes: ScopeSyncResult[];
  activated: number;
  skipped: number;
  failed: number;
  /** Neuester Tag mit Daten über alle Scopes; Grundlage des Datenstands. */
  dataAvailableUntil: string | null;
  /** ID des protokollierten Laufs in sync_runs; null ohne Datenquelle. */
  syncRunId: string | null;
  triggerSource: SyncTriggerSource;
  dispatchId: string | null;
}

/* ── Datenbeschaffung ───────────────────────────────────────────────────────── */

function toDaily(rows: GscApiMetricRow[]): DailyRow[] {
  return rows
    .map((r) => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: clampCtr(r.ctr),
      position: r.position,
    }))
    .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchScopeData(
  scope: ApiScope,
  startDate: string,
  endDate: string,
): Promise<{ daily: DailyRow[]; dimensions: DimensionRow[] }> {
  // Tägliche Zeitreihe: Google berechnet CTR und Position selbst konsistent
  // über die (ggf. mehreren) gefilterten Seiten – keine nachträgliche Mittelung.
  const dailyRaw = await querySearchAnalytics({
    startDate,
    endDate,
    dimensions: ["date"],
    pageFilter: scope.pageFilter,
    queryFilter: scope.queryFilter,
  });
  const daily = toDaily(dailyRaw);

  const dimensions: DimensionRow[] = [];
  for (const { dimension, type } of DIMENSION_QUERIES) {
    let raw: GscApiMetricRow[];
    try {
      raw = await querySearchAnalytics({
        startDate,
        endDate,
        dimensions: [dimension],
        pageFilter: scope.pageFilter,
        queryFilter: scope.queryFilter,
      });
    } catch {
      // search_appearance ist nicht für jede Property verfügbar; solche
      // Dimensionen werden bewusst übersprungen statt den Scope zu kippen.
      if (type === "search_appearance") continue;
      throw new Error(`Dimension "${dimension}" konnte nicht geladen werden.`);
    }
    const seen = new Set<string>();
    for (const r of raw) {
      const value = r.keys[0];
      if (!value || seen.has(value)) continue;
      seen.add(value);
      dimensions.push({
        dimension_type: type,
        dimension_value: value,
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: clampCtr(r.ctr),
        position: r.position,
      });
    }
  }
  return { daily, dimensions };
}

/* ── Persistenz je Scope ────────────────────────────────────────────────────── */

function contentHash(scope: ApiScope, daily: DailyRow[], dimensions: DimensionRow[]): string {
  const hash = createHash("sha256");
  hash.update(`${scope.scopeType}|${scope.scopeValue ?? ""}\n`);
  for (const d of daily) {
    hash.update(`${d.date},${d.clicks},${d.impressions},${d.ctr},${d.position}\n`);
  }
  hash.update("--dimensions--\n");
  for (const d of dimensions) {
    hash.update(
      `${d.dimension_type},${d.dimension_value},${d.clicks},${d.impressions},${d.ctr},${d.position}\n`,
    );
  }
  return hash.digest("hex");
}

/** Aktiven Datensatz je Scope auf den Batch umschalten (atomarer Upsert). */
async function activateScope(
  admin: SupabaseClient,
  organizationId: string,
  scope: ApiScope,
  batchId: string,
  actorId: string | null,
): Promise<void> {
  const existing = await admin
    .from("gsc_active_datasets")
    .select("id, import_batch_id")
    .eq("organization_id", organizationId)
    .eq("scope_type", scope.scopeType)
    .eq("scope_value", scope.scopeValue)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);

  if (existing.data?.import_batch_id === batchId) return;

  if (existing.data) {
    const upd = await admin
      .from("gsc_active_datasets")
      .update({
        import_batch_id: batchId,
        activated_at: new Date().toISOString(),
        activated_by: actorId,
      })
      .eq("id", existing.data.id);
    if (upd.error) throw new Error(upd.error.message);
  } else {
    const ins = await admin.from("gsc_active_datasets").insert({
      organization_id: organizationId,
      scope_type: scope.scopeType,
      scope_value: scope.scopeValue,
      import_batch_id: batchId,
      activated_by: actorId,
    });
    if (ins.error) throw new Error(ins.error.message);
  }
}

/** Ältere API-Batches desselben Scopes entfernen; Export-Batches bleiben. */
async function pruneOldApiBatches(
  admin: SupabaseClient,
  organizationId: string,
  scope: ApiScope,
  keepBatchId: string,
): Promise<void> {
  const old = await admin
    .from("gsc_import_batches")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("scope_type", scope.scopeType)
    .eq("scope_value", scope.scopeValue)
    .eq("metadata->>source", API_SYNC_SOURCE)
    .neq("id", keepBatchId);
  if (old.error || !old.data || old.data.length === 0) return;
  // Cascade räumt Tageswerte und Dimensions-Snapshots mit; der aktive
  // Datensatz zeigt bereits auf keepBatchId, wird also nicht berührt.
  await admin
    .from("gsc_import_batches")
    .delete()
    .in(
      "id",
      old.data.map((b) => b.id as string),
    );
}

async function syncScope(
  admin: SupabaseClient,
  organizationId: string,
  dataSourceId: string | null,
  actorId: string | null,
  scope: ApiScope,
  startDate: string,
  endDate: string,
  windowDays: number,
): Promise<ScopeSyncResult> {
  const base: ScopeSyncResult = {
    scopeType: scope.scopeType,
    scopeValue: scope.scopeValue,
    status: "error",
    periodStart: null,
    periodEnd: null,
    dailyRows: 0,
    dimensionRows: 0,
  };

  const { daily, dimensions } = await fetchScopeData(scope, startDate, endDate);

  // Leere/ungültige API-Antwort: Fallback behalten, aktiven Batch nicht anfassen.
  if (daily.length === 0) {
    return { ...base, status: "skipped_empty", message: "Keine Daten von der API." };
  }

  const periodStart = daily[0].date;
  const periodEnd = daily[daily.length - 1].date;
  const fileHash = contentHash(scope, daily, dimensions);

  // Idempotenz: identischer Inhalt bereits importiert → nur sicherstellen, dass
  // er aktiv ist, keine neuen Zeilen.
  const existing = await admin
    .from("gsc_import_batches")
    .select("id, status")
    .eq("organization_id", organizationId)
    .eq("file_hash", fileHash)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);

  if (existing.data?.status === "imported") {
    await activateScope(admin, organizationId, scope, existing.data.id, actorId);
    await pruneOldApiBatches(admin, organizationId, scope, existing.data.id);
    return {
      ...base,
      status: "unchanged",
      periodStart,
      periodEnd,
      dailyRows: daily.length,
      dimensionRows: dimensions.length,
    };
  }

  // Neuen Batch anlegen (unsichtbar bis zur Aktivierung).
  const inserted = await admin
    .from("gsc_import_batches")
    .insert({
      organization_id: organizationId,
      data_source_id: dataSourceId,
      file_hash: fileHash,
      original_file_name: scope.originalFileName,
      scope_type: scope.scopeType,
      scope_value: scope.scopeValue,
      period_start: periodStart,
      period_end: periodEnd,
      imported_by: actorId,
      status: "validating",
      metadata: { source: API_SYNC_SOURCE, window_days: windowDays },
    })
    .select("id")
    .single();
  if (inserted.error) throw new Error(inserted.error.message);
  const batchId = inserted.data.id as string;

  const markFailed = async (message: string): Promise<ScopeSyncResult> => {
    await admin
      .from("gsc_import_batches")
      .update({ status: "failed", error_message: message.slice(0, 500) })
      .eq("id", batchId);
    return { ...base, status: "error", periodStart, periodEnd, message };
  };

  // Tageswerte einfügen.
  const dailyRows = daily.map((d) => ({
    organization_id: organizationId,
    import_batch_id: batchId,
    scope_type: scope.scopeType,
    scope_value: scope.scopeValue,
    ...d,
  }));
  for (let i = 0; i < dailyRows.length; i += CHUNK) {
    const chunk = await admin
      .from("gsc_scope_daily_metrics")
      .insert(dailyRows.slice(i, i + CHUNK));
    if (chunk.error) return markFailed(`Tageswerte-Insert fehlgeschlagen: ${chunk.error.message}`);
  }

  // Dimensions-Snapshots einfügen.
  const dimensionRows = dimensions.map((d) => ({
    organization_id: organizationId,
    import_batch_id: batchId,
    scope_type: scope.scopeType,
    scope_value: scope.scopeValue,
    period_start: periodStart,
    period_end: periodEnd,
    ...d,
  }));
  for (let i = 0; i < dimensionRows.length; i += CHUNK) {
    const chunk = await admin
      .from("gsc_dimension_snapshots")
      .insert(dimensionRows.slice(i, i + CHUNK));
    if (chunk.error) return markFailed(`Dimensions-Insert fehlgeschlagen: ${chunk.error.message}`);
  }

  // Verifizieren, bevor irgendetwas aktiv wird.
  const check = await admin
    .from("gsc_scope_daily_metrics")
    .select("clicks, impressions")
    .eq("import_batch_id", batchId)
    .limit(1000);
  if (check.error) return markFailed(`Verifikation fehlgeschlagen: ${check.error.message}`);
  const dbClicks = check.data.reduce((a, r) => a + Number(r.clicks), 0);
  const dbImpressions = check.data.reduce((a, r) => a + Number(r.impressions), 0);
  const apiClicks = daily.reduce((a, d) => a + d.clicks, 0);
  const apiImpressions = daily.reduce((a, d) => a + d.impressions, 0);
  if (check.data.length !== daily.length) {
    return markFailed(`Zeilenzahl weicht ab: DB ${check.data.length}, API ${daily.length}`);
  }
  if (dbClicks !== apiClicks || dbImpressions !== apiImpressions) {
    return markFailed(
      `Summen weichen ab: DB ${dbClicks}/${dbImpressions}, API ${apiClicks}/${apiImpressions}`,
    );
  }

  const done = await admin
    .from("gsc_import_batches")
    .update({
      status: "imported",
      imported_at: new Date().toISOString(),
      row_counts: { daily: daily.length, dimensions: dimensions.length },
    })
    .eq("id", batchId);
  if (done.error) return markFailed(`Statuswechsel fehlgeschlagen: ${done.error.message}`);

  await activateScope(admin, organizationId, scope, batchId, actorId);
  await pruneOldApiBatches(admin, organizationId, scope, batchId);

  return {
    ...base,
    status: "activated",
    periodStart,
    periodEnd,
    dailyRows: daily.length,
    dimensionRows: dimensions.length,
  };
}

/* ── Öffentlicher Einstieg ──────────────────────────────────────────────────── */

/** Kurzfassung der fehlgeschlagenen Scopes für sync_runs.error_message. */
function failureSummary(scopes: ScopeSyncResult[]): string | null {
  const failed = scopes.filter((s) => s.status === "error");
  if (failed.length === 0) return null;
  return failed
    .map((s) => `${s.scopeType}${s.scopeValue ? `/${s.scopeValue}` : ""}: ${s.message ?? "Fehler"}`)
    .join(" | ")
    .slice(0, 500);
}

/**
 * Führt den vollständigen API-Sync über alle Scopes aus. Wirft nur bei
 * globalen Problemen (fehlende Org, Config-/Auth-Fehler aus dem Client);
 * einzelne Scope-Fehler werden im Ergebnis gesammelt und lassen die übrigen
 * Scopes und deren zuletzt aktive Daten unberührt.
 *
 * Jeder Lauf wird in sync_runs protokolliert (running → success/error) und
 * schreibt bei Erfolg data_sources.data_available_until fort. Das ist die
 * Grundlage dafür, dass das Dashboard einen fehlenden oder fehlgeschlagenen
 * Sync erkennen kann, statt stillschweigend alte Zahlen zu zeigen.
 */
export async function runApiGscSync(opts: {
  admin: SupabaseClient;
  actorId: string | null;
  /** Wer den Lauf ausgelöst hat; landet in sync_runs.trigger_source. */
  triggerSource?: SyncTriggerSource;
  /** Auslösung des Schedulers, die zu diesem Lauf geführt hat. */
  dispatchId?: string | null;
}): Promise<ApiSyncResult> {
  const { admin, actorId, triggerSource = "manual", dispatchId = null } = opts;

  const org = await admin
    .from("organizations")
    .select("id")
    .eq("slug", ORG_SLUG)
    .maybeSingle();
  if (org.error) throw new Error(org.error.message);
  if (!org.data) throw new Error(`Organisation '${ORG_SLUG}' nicht gefunden.`);
  const organizationId = org.data.id as string;

  const dataSource = await admin
    .from("data_sources")
    .select("id, data_available_until")
    .eq("organization_id", organizationId)
    .eq("provider", GSC_PROVIDER_NAME)
    .maybeSingle();
  const dataSourceId = (dataSource.data?.id as string | undefined) ?? null;
  const dataAvailableUntil = (dataSource.data?.data_available_until as string | null) ?? null;

  // Lauf beanspruchen. claim_gsc_sync_run serialisiert über einen Advisory
  // Lock und gibt NULL zurück, wenn bereits ein Lauf aktiv ist – Scheduler und
  // manueller Anstoß können sich damit nicht in die Quere kommen.
  let syncRunId: string | null = null;
  if (dataSourceId) {
    const claim = await admin.rpc("claim_gsc_sync_run", {
      p_organization_id: organizationId,
      p_data_source_id: dataSourceId,
      p_trigger_source: triggerSource,
      p_dispatch_id: dispatchId,
    });
    if (claim.error) throw new Error(`Lauf konnte nicht beansprucht werden: ${claim.error.message}`);
    syncRunId = (claim.data as string | null) ?? null;
    if (!syncRunId) {
      throw new SyncAlreadyRunningError("Für diese Organisation läuft bereits ein GSC-Sync.");
    }
  }

  const finishRun = async (
    status: "success" | "error",
    recordsProcessed: number,
    errorMessage: string | null,
  ): Promise<void> => {
    if (!syncRunId) return;
    await admin
      .from("sync_runs")
      .update({
        status,
        completed_at: new Date().toISOString(),
        records_processed: recordsProcessed,
        error_message: errorMessage,
      })
      .eq("id", syncRunId);
  };

  // GSC liefert für den laufenden Tag keine finalen Werte → bis gestern (UTC).
  const endDate = addDays(isoDate(new Date()), -1);
  const { days: windowDays, catchUp } = resolveWindowDays({
    baseDays: baseWindowDays(process.env.GSC_SYNC_WINDOW_DAYS),
    dataAvailableUntil,
    endDate,
  });
  const startDate = addDays(endDate, -(windowDays - 1));

  const scopes: ScopeSyncResult[] = [];
  try {
    for (const scope of API_SCOPES) {
      try {
        scopes.push(
          await syncScope(
            admin,
            organizationId,
            dataSourceId,
            actorId,
            scope,
            startDate,
            endDate,
            windowDays,
          ),
        );
      } catch (err) {
        // Konfigurations- und Anmeldefehler betreffen jeden Scope gleichermaßen.
        // Sie als Scope-Fehler zu sammeln, hätte einen widerrufenen Token als
        // "5 Scopes fehlgeschlagen" mit HTTP 200 getarnt – deshalb Abbruch.
        if (err instanceof GscConfigError || err instanceof GscAuthError) throw err;
        const message = err instanceof Error ? err.message : "Unbekannter Scope-Fehler";
        scopes.push({
          scopeType: scope.scopeType,
          scopeValue: scope.scopeValue,
          status: "error",
          periodStart: null,
          periodEnd: null,
          dailyRows: 0,
          dimensionRows: 0,
          message,
        });
      }
    }
  } catch (err) {
    await finishRun(
      "error",
      scopes.reduce((sum, s) => sum + s.dailyRows, 0),
      err instanceof Error ? err.message.slice(0, 500) : "Unbekannter Fehler",
    );
    throw err;
  }

  const failed = scopes.filter((s) => s.status === "error").length;
  const recordsProcessed = scopes.reduce((sum, s) => sum + s.dailyRows + s.dimensionRows, 0);

  // Datenstand = neuester Tag, den irgendein erfolgreicher Scope mitbringt.
  const newDataAvailableUntil =
    scopes
      .filter((s) => s.status === "activated" || s.status === "unchanged")
      .map((s) => s.periodEnd)
      .filter((d): d is string => d !== null)
      .sort()
      .at(-1) ?? null;

  if (dataSourceId && newDataAvailableUntil) {
    await admin
      .from("data_sources")
      .update({ data_available_until: newDataAvailableUntil })
      .eq("id", dataSourceId);
  }

  await finishRun(failed > 0 ? "error" : "success", recordsProcessed, failureSummary(scopes));

  return {
    window: { startDate, endDate, days: windowDays, catchUp },
    scopes,
    activated: scopes.filter((s) => s.status === "activated" || s.status === "unchanged").length,
    skipped: scopes.filter((s) => s.status === "skipped_empty").length,
    failed,
    dataAvailableUntil: newDataAvailableUntil,
    syncRunId,
    triggerSource,
    dispatchId,
  };
}
