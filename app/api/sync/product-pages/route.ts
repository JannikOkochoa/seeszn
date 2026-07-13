// ─── POST /api/sync/product-pages ─────────────────────────────────────────────
// Importiert die Produktseiten (Städte-Reiseziele) von der Klühspies-Website
// in die pages-Tabelle der Organisation. Nur seeszn_admin; wird ausschließlich
// manuell angestoßen, nie beim Login. Auth über die Cookie-Session, die
// Schreibarbeit über den Admin-Client im Provider (lib/product-pages).

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { syncProductPages } from "@/lib/product-pages/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Nicht angemeldet.", 401);

  // Optionaler Body: { organizationId } zur Auswahl bei mehreren Memberships.
  let requestedOrgId: string | null = null;
  try {
    const body = (await request.json()) as { organizationId?: unknown };
    if (typeof body?.organizationId === "string") requestedOrgId = body.organizationId;
  } catch {
    // Leerer Body ist erlaubt.
  }

  const memberships = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id);
  if (memberships.error) return fail("Membership konnte nicht geladen werden.", 500);

  const membership = requestedOrgId
    ? memberships.data.find((m) => m.organization_id === requestedOrgId)
    : memberships.data[0];
  if (!membership) return fail("Keine Organisation für diesen Nutzer.", 403);
  if (memberships.data.length > 1 && !requestedOrgId) {
    return fail("Mehrere Organisationen: organizationId im Body angeben.", 400);
  }
  if (membership.role !== "seeszn_admin") {
    return fail("Produktseiten synchronisiert nur SEESZN.", 403);
  }

  try {
    const admin = createSupabaseAdminClient();
    const result = await syncProductPages({
      admin,
      organizationId: membership.organization_id as string,
      actorId: user.id,
    });
    return Response.json({ ok: true, ...result });
  } catch {
    // Generische Meldung: keine Details der Quelle oder des Servers nach außen.
    return fail("Der Produktseiten-Import ist fehlgeschlagen. Der Bestand bleibt unverändert.", 502);
  }
}
