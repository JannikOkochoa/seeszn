// ─── /api/sync/gsc/cron ───────────────────────────────────────────────────────
// Geschützter Endpunkt für die tägliche automatische Aktualisierung der
// Search-Console-Daten über die Google-API. Zwei Autorisierungswege:
//
//   1. Cron/Automat: Secret GSC_SYNC_SECRET über den Header
//      "x-gsc-sync-secret", "Authorization: Bearer <secret>" oder ?key=<secret>.
//   2. Angemeldeter SEESZN Admin (Cookie-Session, Rolle seeszn_admin) – erlaubt
//      einen manuellen Anstoß, ohne das Secret zu teilen und ohne neue UI.
//
// GET und POST verhalten sich identisch, damit einfache Hostinger-Cronjobs
// (curl ohne -X) funktionieren. Der eigentliche Sync läuft ausschließlich
// serverseitig mit dem Admin-Client; Google-Credentials und das Sync-Secret
// verlassen den Server nie. Fehler werden serverseitig ohne Secrets
// protokolliert und dem Aufrufer secret-frei gemeldet.

import { createHash, timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { GscApiError, GscAuthError, GscConfigError } from "@/lib/gsc/apiClient";
import {
  runApiGscSync,
  SyncAlreadyRunningError,
  type SyncTriggerSource,
} from "@/lib/gsc/apiSync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// GSC-Abfragen über mehrere Scopes können einige Sekunden dauern.
export const maxDuration = 60;

function fail(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

/** Längenunabhängiger, timing-sicherer Vergleich zweier Secrets. */
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
  const key = new URL(request.url).searchParams.get("key");
  return key ?? null;
}

/**
 * true = per Secret autorisiert.
 *
 * Zwei gleichwertige Quellen, in dieser Reihenfolge:
 *   1. GSC_SYNC_SECRET aus der Umgebung (kein Netzwerkweg, unveränderte
 *      Bestandsfunktion für manuelle Aufrufe).
 *   2. Der Vault-Eintrag gsc_sync_secret in Supabase. Genau von dort liest
 *      auch der Scheduler. Damit gibt es für die Automatisierung eine einzige
 *      Quelle der Wahrheit: Env-Variable und Scheduler können nicht mehr
 *      auseinanderdriften und den Sync still ausfallen lassen.
 *
 * Der Vault-Wert verlässt die Datenbank dabei nie – verglichen wird dort.
 */
async function authorizedBySecret(request: Request): Promise<boolean> {
  const provided = providedSecret(request);
  if (!provided) return false;

  const expected = process.env.GSC_SYNC_SECRET;
  if (expected && secretMatches(provided, expected)) return true;

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("gsc_sync_secret_matches", { p_candidate: provided });
    return !error && data === true;
  } catch {
    return false;
  }
}

/** Gibt die Actor-User-ID zurück, wenn ein seeszn_admin angemeldet ist. */
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

/**
 * Der Supabase-Scheduler schickt {"dispatchId","triggerSource"} mit. Damit
 * lässt sich der Lauf später eindeutig der Auslösung zuordnen: erst dadurch
 * ist im Nachhinein erkennbar, ob der Scheduler ausgelöst hat und der Aufruf
 * die App auch wirklich erreicht hat.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readDispatch(
  request: Request,
): Promise<{ dispatchId: string | null; triggerSource: SyncTriggerSource | null }> {
  try {
    const body = (await request.json()) as { dispatchId?: unknown; triggerSource?: unknown };
    const dispatchId =
      typeof body?.dispatchId === "string" && UUID.test(body.dispatchId) ? body.dispatchId : null;
    const triggerSource =
      body?.triggerSource === "self_heal"
        ? ("self_heal" as const)
        : body?.triggerSource === "scheduled"
          ? ("scheduler" as const)
          : null;
    return { dispatchId, triggerSource };
  } catch {
    // Leerer Body ist erlaubt (z. B. einfacher curl-Aufruf).
    return { dispatchId: null, triggerSource: null };
  }
}

async function handle(request: Request): Promise<Response> {
  // 1) Autorisierung: Secret (Cron) ODER angemeldeter seeszn_admin.
  let actorId: string | null = null;
  let triggerSource: SyncTriggerSource;
  if (await authorizedBySecret(request)) {
    actorId = null; // automatischer Lauf
    triggerSource = "manual";
  } else {
    actorId = await authorizedAdminActorId();
    if (!actorId) {
      return fail("Nicht autorisiert.", 401);
    }
    triggerSource = "admin";
  }

  const { dispatchId, triggerSource: dispatchTrigger } = await readDispatch(request);
  if (dispatchTrigger) triggerSource = dispatchTrigger;

  // 2) Sync ausführen (Admin-Client, nur Servercode).
  const admin = createSupabaseAdminClient();
  try {
    const result = await runApiGscSync({ admin, actorId, triggerSource, dispatchId });
    // Ein teilweise fehlgeschlagener Lauf darf nicht wie ein erfolgreicher
    // aussehen: ok spiegelt die Scope-Fehler, und wenn kein einziger Scope
    // durchkam, ist das ein Fehlerstatus (502), damit ein Cron-Monitor anschlägt.
    const ok = result.failed === 0;
    const status = result.activated === 0 && result.failed > 0 ? 502 : 200;
    return Response.json({ ok, ...result }, { status });
  } catch (err) {
    // Bereits laufender Sync ist kein Fehler, sondern der Lock, der genau das
    // verhindern soll: 409 statt 500, damit ein Monitor nicht Alarm schlägt.
    if (err instanceof SyncAlreadyRunningError) {
      return Response.json({ ok: true, skipped: "already_running" }, { status: 409 });
    }
    // Fehlende Env-Variablen: Namen dürfen genannt werden, Werte nie.
    if (err instanceof GscConfigError) {
      console.error("[sync/gsc/cron] Konfiguration unvollständig.");
      return fail(err.message, 500);
    }
    // invalid_grant / widerrufener Token: klar, aber ohne Google-Details.
    if (err instanceof GscAuthError) {
      console.error("[sync/gsc/cron] Google-Authentifizierung fehlgeschlagen.");
      return fail("Google-Authentifizierung fehlgeschlagen.", 502);
    }
    if (err instanceof GscApiError) {
      console.error("[sync/gsc/cron] GSC-API-Fehler.");
      return fail("Zugriff auf die Search Console fehlgeschlagen.", 502);
    }
    // Alles andere: serverseitig protokollieren, Client nur generisch melden.
    console.error("[sync/gsc/cron]", err instanceof Error ? err.message : "Unbekannter Fehler");
    return fail("Der Sync ist fehlgeschlagen.", 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  return handle(request);
}

export async function GET(request: Request): Promise<Response> {
  return handle(request);
}
