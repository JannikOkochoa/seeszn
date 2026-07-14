// ─── POST /api/admin/members/invite ───────────────────────────────────────────
// Sicherer Einladungsprozess über die Supabase Admin API. Nur seeszn_admin;
// der Secret Key bleibt ausschließlich serverseitig (createSupabaseAdminClient
// wirft im Browser). Rollenänderungen laufen nicht hier, sondern über die
// memberships-Policies (nur seeszn_admin).
//
// Damit während der Entwicklung keine echten Einladungen an Kundenadressen
// hinausgehen, ist der Versand hinter MEMBER_INVITES_ENABLED=true verriegelt.
// Testkonten entstehen stattdessen über scripts/dev-bootstrap-team.mjs
// (ausschließlich example.com-Adressen, nur gegen die lokale Instanz).

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ROLES = new Set(["seeszn_admin", "kluehspies_editor", "viewer"]);
const ALLOWED_COMPANIES = new Set(["seeszn", "kluehspies"]);

function fail(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Nicht angemeldet.", 401);

  let body: { email?: unknown; fullName?: unknown; role?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("Ungültige Anfrage.", 400);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const role = typeof body.role === "string" ? body.role : "";
  const company = typeof body.company === "string" ? body.company : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName) {
    return fail("E-Mail-Adresse und Name sind erforderlich.", 400);
  }
  if (!ALLOWED_ROLES.has(role) || !ALLOWED_COMPANIES.has(company)) {
    return fail("Ungültige Rolle oder Unternehmenszuordnung.", 400);
  }

  // Organisation und Rolle des Einladenden prüfen (RLS: nur eigene Zeilen).
  const membership = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membership.error || !membership.data) return fail("Keine Organisation.", 403);
  if (membership.data.role !== "seeszn_admin") {
    return fail("Mitglieder lädt nur SEESZN ein.", 403);
  }
  const organizationId = membership.data.organization_id as string;

  // Entwicklungs-Sicherung: ohne explizite Freischaltung wird nichts versendet.
  if (process.env.MEMBER_INVITES_ENABLED !== "true") {
    return fail(
      "Einladungen sind deaktiviert (MEMBER_INVITES_ENABLED). Für die Entwicklung scripts/dev-bootstrap-team.mjs verwenden.",
      503,
    );
  }

  const admin = createSupabaseAdminClient();
  const invited = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });
  if (invited.error || !invited.data.user) {
    // Generisch bleiben; keine Auskunft, ob eine Adresse bereits existiert.
    return fail("Die Einladung konnte nicht versendet werden.", 502);
  }

  // Profil legt der on_auth_user_created-Trigger an; hier nur die Membership.
  const membershipInsert = await admin.from("memberships").upsert(
    {
      organization_id: organizationId,
      user_id: invited.data.user.id,
      role,
      company,
      status: "invited",
    },
    { onConflict: "organization_id,user_id" },
  );
  if (membershipInsert.error) {
    return fail("Die Einladung wurde versendet, die Membership konnte aber nicht angelegt werden.", 500);
  }

  await admin.from("audit_events").insert({
    organization_id: organizationId,
    actor_id: user.id,
    entity_type: "membership",
    entity_id: invited.data.user.id,
    action: "member.invited",
    metadata: { role, company },
  });

  return Response.json({ ok: true });
}
