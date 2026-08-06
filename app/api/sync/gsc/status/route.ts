// ─── GET /api/sync/gsc/status ─────────────────────────────────────────────────
// Live-Diagnose der Search-Console-Anbindung, ohne einen Sync auszulösen.
// Beantwortet in einem Aufruf: Sind die Zugangsdaten vollständig? Ist der
// Refresh Token gültig? Hat das verbundene Google-Konto Zugriff auf die
// konfigurierte Property? Wann lief der letzte Sync und wie alt sind die Daten?
//
// Autorisierung wie beim Cron-Endpunkt: Secret (GSC_SYNC_SECRET) oder
// angemeldeter seeszn_admin. Die Antwort enthält niemals Client Secret,
// Refresh Token oder Access Token — nur Namen, Zustände und Zeitpunkte.

import { createHash, timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyGscAccess } from "@/lib/gsc/apiClient";
import {
  buildGscSyncStatus,
  type SyncDispatchRow,
  type SyncRunRow,
} from "@/lib/kpi/syncStatus";
import { API_SCOPES } from "@/lib/gsc/apiScopes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ORG_SLUG = "kluehspies";

function secretMatches(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Wie beim Cron-Endpunkt: Env-Variable oder – gleichwertig – der Vault-Eintrag. */
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

  // 1) Live-Prüfung gegen Google (Token + Property-Berechtigung).
  const access = await verifyGscAccess();

  // 2) Gespeicherter Zustand: letzter Lauf und Datenstand.
  const admin = createSupabaseAdminClient();
  const org = await admin.from("organizations").select("id").eq("slug", ORG_SLUG).maybeSingle();
  const organizationId = (org.data?.id as string | undefined) ?? null;

  let runs: SyncRunRow[] = [];
  let dispatch: SyncDispatchRow | null = null;
  let dataAsOf: string | null = null;
  const scopes: Array<{ scopeType: string; scopeValue: string | null; dataAsOf: string | null }> = [];

  if (organizationId) {
    const [runResult, dispatchResult] = await Promise.all([
      admin
        .from("sync_runs")
        .select(
          "status, started_at, completed_at, error_message, records_processed, trigger_source, dispatch_id",
        )
        .eq("organization_id", organizationId)
        .order("started_at", { ascending: false })
        .limit(20),
      admin
        .from("gsc_sync_dispatches")
        .select(
          "id, job_name, reason, scheduled_at, http_status, delivered, error_message, reconciled_at",
        )
        .eq("organization_id", organizationId)
        .order("scheduled_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    runs = (runResult.data as SyncRunRow[] | null) ?? [];
    dispatch = (dispatchResult.data as SyncDispatchRow | null) ?? null;

    const active = await admin
      .from("gsc_active_datasets")
      .select("scope_type, scope_value, gsc_import_batches!inner(period_end)")
      .eq("organization_id", organizationId);

    for (const row of (active.data ?? []) as Array<{
      scope_type: string;
      scope_value: string | null;
      gsc_import_batches: { period_end: string } | { period_end: string }[] | null;
    }>) {
      const batch = Array.isArray(row.gsc_import_batches)
        ? row.gsc_import_batches[0]
        : row.gsc_import_batches;
      const periodEnd = batch?.period_end ?? null;
      scopes.push({ scopeType: row.scope_type, scopeValue: row.scope_value, dataAsOf: periodEnd });
      if (periodEnd && (dataAsOf === null || periodEnd > dataAsOf)) dataAsOf = periodEnd;
    }
  }

  const syncStatus = buildGscSyncStatus({
    runs,
    dataAsOf,
    todayIso: new Date().toISOString().slice(0, 10),
    scopeCount: scopes.length,
    dispatch,
  });

  // Scopes, die konfiguriert sind, aber noch nie aktiviert wurden: der häufigste
  // Grund dafür, dass ein neuer Bereich im Dashboard leer bleibt.
  const activeKeys = new Set(scopes.map((s) => `${s.scopeType}|${s.scopeValue ?? ""}`));
  const missingScopes = API_SCOPES.filter(
    (s) => !activeKeys.has(`${s.scopeType}|${s.scopeValue ?? ""}`),
  ).map((s) => ({ scopeType: s.scopeType, scopeValue: s.scopeValue }));

  // Immer HTTP 200: das ist ein Diagnosebericht, kein Betriebsergebnis. Die
  // Wahrheit steht in ok/access/syncStatus. Der Cron-Endpunkt trägt die
  // HTTP-Semantik für Monitore.
  return Response.json({
    ok: access.ok && syncStatus.state === "live" && missingScopes.length === 0,
    access,
    syncStatus,
    scopes,
    missingScopes,
    configuredScopes: API_SCOPES.length,
  });
}
