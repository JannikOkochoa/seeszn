// ─── GET /api/sync/ga4/status ─────────────────────────────────────────────────
// Live-Diagnose der GA4-Anbindung, ohne einen Sync auszulösen: Sind die
// Zugangsdaten vollständig? Ist der Refresh Token gültig? Antwortet die
// Property? Wann lief der letzte Sync und wie alt sind die Daten?
//
// Getrennt vom GSC-Status: beide Quellen melden ihren Zustand eigenständig.
// Die Antwort enthält niemals Token, Client Secret oder Stacktraces.

import { createHash, timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyGa4Access } from "@/lib/ga4/apiClient";
import { GA4_PAGE_MAPPINGS, GA4_SITE_SCOPE, ga4PageScopeKey } from "@/lib/ga4/pageMapping";
import { PRIMARY_CONVERSION_EVENT, SECONDARY_CONVERSION_EVENT } from "@/lib/ga4/events";
import {
  buildGscSyncStatus,
  type SyncDispatchRow,
  type SyncRunRow,
} from "@/lib/kpi/syncStatus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ORG_SLUG = "kluehspies";
/** GA4 verarbeitet Daten bis zu 48 h; ab vier Tagen Rückstand ist etwas liegen geblieben. */
const GA4_STALE_AFTER_DAYS = 4;

function secretMatches(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

async function authorizedBySecret(request: Request): Promise<boolean> {
  const header = request.headers.get("x-gsc-sync-secret");
  const auth = request.headers.get("authorization");
  const provided =
    header ?? (auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null) ??
    new URL(request.url).searchParams.get("key");
  if (!provided) return false;
  const expected = process.env.GSC_SYNC_SECRET;
  if (expected && secretMatches(provided, expected)) return true;
  try {
    const { data, error } = await createSupabaseAdminClient().rpc("gsc_sync_secret_matches", {
      p_candidate: provided,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}

async function authorizedAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const membership = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "seeszn_admin")
    .maybeSingle();
  return Boolean(membership.data);
}

export async function GET(request: Request): Promise<Response> {
  if (!(await authorizedBySecret(request)) && !(await authorizedAdmin())) {
    return Response.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const access = await verifyGa4Access();
  const admin = createSupabaseAdminClient();
  const org = await admin.from("organizations").select("id").eq("slug", ORG_SLUG).maybeSingle();
  const organizationId = (org.data?.id as string | undefined) ?? null;

  let runs: SyncRunRow[] = [];
  let dispatch: SyncDispatchRow | null = null;
  let dataAsOf: string | null = null;
  let propertyState: Record<string, unknown> | null = null;
  const scopes: Array<{ scopeKey: string; label: string; days: number; dataAsOf: string | null }> = [];

  if (organizationId) {
    const source = await admin
      .from("data_sources")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("provider", "google_analytics_4")
      .maybeSingle();
    const dataSourceId = (source.data?.id as string | undefined) ?? null;

    const [runResult, dispatchResult, stateResult, metricResult] = await Promise.all([
      dataSourceId
        ? admin
            .from("sync_runs")
            .select(
              "status, started_at, completed_at, error_message, records_processed, trigger_source, dispatch_id",
            )
            .eq("data_source_id", dataSourceId)
            .order("started_at", { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [] }),
      admin
        .from("gsc_sync_dispatches")
        .select(
          "id, job_name, reason, scheduled_at, http_status, delivered, error_message, reconciled_at",
        )
        .eq("organization_id", organizationId)
        .eq("source", "ga4")
        .order("scheduled_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("ga4_property_state")
        .select("property_id, time_zone, currency_code, subject_to_thresholding, updated_at")
        .eq("organization_id", organizationId)
        .maybeSingle(),
      admin
        .from("ga4_daily_metrics")
        .select("scope_key, date")
        .eq("organization_id", organizationId),
    ]);

    runs = (runResult.data as SyncRunRow[] | null) ?? [];
    dispatch = (dispatchResult.data as SyncDispatchRow | null) ?? null;
    propertyState = (stateResult.data as Record<string, unknown> | null) ?? null;

    const byScope = new Map<string, string[]>();
    for (const row of ((metricResult.data ?? []) as Array<{ scope_key: string; date: string }>)) {
      const list = byScope.get(row.scope_key) ?? [];
      list.push(row.date);
      byScope.set(row.scope_key, list);
      if (row.scope_key === GA4_SITE_SCOPE && (dataAsOf === null || row.date > dataAsOf)) {
        dataAsOf = row.date;
      }
    }
    const describe = (scopeKey: string, label: string) => {
      const dates = (byScope.get(scopeKey) ?? []).sort();
      scopes.push({ scopeKey, label, days: dates.length, dataAsOf: dates.at(-1) ?? null });
    };
    describe(GA4_SITE_SCOPE, "Website gesamt");
    for (const m of GA4_PAGE_MAPPINGS) describe(ga4PageScopeKey(m.pageKey), m.label);
  }

  const syncStatus = buildGscSyncStatus({
    runs,
    dataAsOf,
    todayIso: new Date().toISOString().slice(0, 10),
    scopeCount: scopes.filter((s) => s.days > 0).length,
    dispatch,
    sourceLabel: "Analytics",
    staleAfterDays: GA4_STALE_AFTER_DAYS,
  });

  return Response.json({
    ok: access.ok && syncStatus.state === "live",
    access,
    property: propertyState,
    syncStatus,
    scopes,
    conversions: {
      primary: PRIMARY_CONVERSION_EVENT,
      secondary: SECONDARY_CONVERSION_EVENT,
    },
  });
}
