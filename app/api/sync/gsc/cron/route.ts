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
import { runApiGscSync } from "@/lib/gsc/apiSync";

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

/** true = per Secret autorisiert. */
function authorizedBySecret(request: Request): boolean {
  const expected = process.env.GSC_SYNC_SECRET;
  const provided = providedSecret(request);
  if (!expected || !provided) return false;
  return secretMatches(provided, expected);
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

async function handle(request: Request): Promise<Response> {
  // 1) Autorisierung: Secret (Cron) ODER angemeldeter seeszn_admin.
  let actorId: string | null = null;
  if (authorizedBySecret(request)) {
    actorId = null; // automatischer Lauf
  } else {
    actorId = await authorizedAdminActorId();
    if (!actorId) {
      return fail("Nicht autorisiert.", 401);
    }
  }

  // 2) Sync ausführen (Admin-Client, nur Servercode).
  const admin = createSupabaseAdminClient();
  try {
    const result = await runApiGscSync({ admin, actorId });
    return Response.json({ ok: true, ...result });
  } catch (err) {
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
