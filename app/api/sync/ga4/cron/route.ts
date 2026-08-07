// ─── /api/sync/ga4/cron ───────────────────────────────────────────────────────
// Gegenstück zu /api/sync/gsc/cron für Google Analytics. Gleiche Autorisierung
// (Sync-Secret aus Env oder Vault, oder angemeldeter seeszn_admin), gleiche
// Protokollierung über sync_runs und gsc_sync_dispatches — aber eine eigene
// Datenquelle, ein eigener Lock und ein eigener Status.
//
// Der Sync läuft ausschließlich serverseitig; Google-Zugangsdaten verlassen
// den Server nie und erscheinen in keiner Antwort.

import { createHash, timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { Ga4ApiError, Ga4AuthError, Ga4ConfigError } from "@/lib/ga4/apiClient";
import { runGa4Sync, Ga4SyncAlreadyRunningError } from "@/lib/ga4/apiSync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function fail(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

function secretMatches(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function providedSecret(request: Request): string | null {
  const header = request.headers.get("x-gsc-sync-secret");
  if (header) return header;
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  return new URL(request.url).searchParams.get("key");
}

/** Env-Variable oder – gleichwertig – der Vault-Eintrag, wie beim GSC-Endpunkt. */
async function authorizedBySecret(request: Request): Promise<boolean> {
  const provided = providedSecret(request);
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

async function authorizedAdminActorId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const membership = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "seeszn_admin")
    .maybeSingle();
  return membership.data ? user.id : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readDispatch(request: Request) {
  try {
    const body = (await request.json()) as { dispatchId?: unknown; triggerSource?: unknown };
    return {
      dispatchId:
        typeof body?.dispatchId === "string" && UUID.test(body.dispatchId) ? body.dispatchId : null,
      triggerSource:
        body?.triggerSource === "self_heal"
          ? ("self_heal" as const)
          : body?.triggerSource === "scheduled"
            ? ("scheduler" as const)
            : null,
    };
  } catch {
    return { dispatchId: null, triggerSource: null };
  }
}

async function handle(request: Request): Promise<Response> {
  let triggerSource: "scheduler" | "self_heal" | "admin" | "manual";
  if (await authorizedBySecret(request)) {
    triggerSource = "manual";
  } else if (await authorizedAdminActorId()) {
    triggerSource = "admin";
  } else {
    return fail("Nicht autorisiert.", 401);
  }

  const { dispatchId, triggerSource: dispatchTrigger } = await readDispatch(request);
  if (dispatchTrigger) triggerSource = dispatchTrigger;

  const admin = createSupabaseAdminClient();
  try {
    const result = await runGa4Sync({ admin, triggerSource, dispatchId });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    // Ein bereits laufender Sync ist der Lock, der genau das verhindern soll.
    if (err instanceof Ga4SyncAlreadyRunningError) {
      return Response.json({ ok: true, skipped: "already_running" }, { status: 409 });
    }
    if (err instanceof Ga4ConfigError) {
      console.error("[sync/ga4/cron] Konfiguration unvollständig.");
      return fail(err.message, 500);
    }
    if (err instanceof Ga4AuthError) {
      console.error("[sync/ga4/cron] Google-Authentifizierung fehlgeschlagen.");
      return fail("Google-Authentifizierung für GA4 fehlgeschlagen.", 502);
    }
    if (err instanceof Ga4ApiError) {
      console.error("[sync/ga4/cron] GA4-API-Fehler.");
      return fail("Zugriff auf Google Analytics fehlgeschlagen.", 502);
    }
    console.error("[sync/ga4/cron]", err instanceof Error ? err.message : "Unbekannter Fehler");
    return fail("Der GA4-Sync ist fehlgeschlagen.", 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  return handle(request);
}
export async function GET(request: Request): Promise<Response> {
  return handle(request);
}
