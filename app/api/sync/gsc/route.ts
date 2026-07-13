// ─── POST /api/sync/gsc ───────────────────────────────────────────────────────
// LEGACY: Demo-Sync (DemoGscProvider) für die alte KPI-Datenbasis. Seit dem
// GSC-Export-Import ist der echte KPI vollständig auf importierten
// Search-Console-Exporten (gsc_active_datasets); dieser Endpoint erzeugt nur
// noch synthetische Demo-Daten und ist deshalb standardmäßig deaktiviert.
//
// Reaktivierung nur bewusst über LEGACY_GSC_DEMO_SYNC_ENABLED=true
// (serverseitig, kein NEXT_PUBLIC_). Der echte GoogleProvider bleibt als
// spätere Option in lib/gsc bestehen; die Export-Datenbasis ist von diesem
// Endpoint unabhängig. Es gibt keine Client-Schaltfläche mehr.

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getGscProvider } from "@/lib/gsc";
import { GSC_PROVIDER_NAME, runGscSync, SyncConflictError } from "@/lib/gsc/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

export async function POST(request: Request): Promise<Response> {
  // 0) Legacy-Guard: standardmäßig deaktiviert. Ohne explizite Freischaltung
  //    erzeugt der Demo-Sync keine neuen Daten mehr.
  if (process.env.LEGACY_GSC_DEMO_SYNC_ENABLED !== "true") {
    return fail(
      "Der Demo-Sync ist deaktiviert. Der KPI nutzt importierte Search-Console-Exporte.",
      410,
    );
  }

  // 1) Session prüfen (Cookie-basiert, serverseitig validiert).
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail("Nicht angemeldet.", 401);
  }

  // Optionaler Body: { organizationId } zur Auswahl bei mehreren Memberships.
  let requestedOrgId: string | null = null;
  try {
    const body = (await request.json()) as { organizationId?: unknown };
    if (typeof body?.organizationId === "string") {
      requestedOrgId = body.organizationId;
    }
  } catch {
    // Leerer Body ist erlaubt.
  }

  // 2) Organisation aus der Membership ermitteln (RLS: nur eigene Zeilen).
  const memberships = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id);
  if (memberships.error) {
    return fail("Membership konnte nicht geladen werden.", 500);
  }

  const membership = requestedOrgId
    ? memberships.data.find((m) => m.organization_id === requestedOrgId)
    : memberships.data[0];
  if (!membership) {
    return fail("Keine Organisation für diesen Nutzer.", 403);
  }
  if (memberships.data.length > 1 && !requestedOrgId) {
    return fail("Mehrere Organisationen: organizationId im Body angeben.", 400);
  }

  // 3) Rolle prüfen: Sync darf nur seeszn_admin auslösen.
  if (membership.role !== "seeszn_admin") {
    return fail("Keine Berechtigung für den Sync.", 403);
  }

  // 4) Passende Datenquelle laden (ab hier Admin-Client, nur Servercode).
  const admin = createSupabaseAdminClient();
  const source = await admin
    .from("data_sources")
    .select("id, organization_id, data_available_until")
    .eq("organization_id", membership.organization_id)
    .eq("provider", GSC_PROVIDER_NAME)
    .maybeSingle();
  if (source.error) {
    return fail("Datenquelle konnte nicht geladen werden.", 500);
  }
  if (!source.data) {
    return fail("Keine Search-Console-Datenquelle für diese Organisation.", 404);
  }

  // 5–16) Kompletter Sync-Ablauf im Service (Claim, sync_run, Import,
  // Aggregation, Protokoll, Fehlerpfad).
  try {
    const result = await runGscSync({
      admin,
      dataSource: source.data,
      provider: getGscProvider(),
      siteUrl: process.env.GSC_SITE_URL ?? "https://www.kluehspies.de/",
    });
    return Response.json(result);
  } catch (err) {
    if (err instanceof SyncConflictError) {
      return fail("Für diese Datenquelle läuft bereits ein Sync.", 409);
    }
    console.error("[sync/gsc]", err);
    return fail("Der Sync ist fehlgeschlagen.", 500);
  }
}
