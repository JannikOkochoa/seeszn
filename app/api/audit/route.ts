// ─── POST /api/audit ──────────────────────────────────────────────────────────
// Kontrollierter Audit-Schreiber: audit_events sind für Endnutzer bewusst nicht
// schreibbar (kein Grant, keine Policy). Dieser Handler validiert Session,
// Membership und Objektzugehörigkeit und schreibt dann mit dem Admin-Client.
// actor_id kommt immer aus der Session, nie aus dem Request.

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Erlaubte Aktionen; alles andere wird abgewiesen. */
const ALLOWED_ACTIONS = new Set([
  "task.created",
  "task.updated",
  "task.status_changed",
  "task.assigned",
  "task.deleted",
  "task.restored",
  "approval.requested",
  "approval.decided",
  "annotation.created",
  "annotation.updated",
  "comment.created",
  "kpi.goal_created",
  "kpi.goal_changed",
  "kpi.goal_archived",
  "kpi.goal_owner_changed",
  "review.checked_in",
  "review.goal_changed",
  "presence.checked_in",
  "content.checked_in",
]);

/** entity_type -> Tabelle, gegen die die Organisationszugehörigkeit geprüft wird. */
const ENTITY_TABLES: Record<string, string> = {
  task: "tasks",
  approval: "approvals",
  annotation: "annotations",
  comment: "comments",
  kpi_definition: "kpi_definitions",
  kpi_goal: "kpi_targets",
  review_check_in: "kpi_manual_check_ins",
  manual_check_in: "kpi_manual_check_ins",
};

/** Nur flache, kurze Skalar-Metadaten; keine Objekte, keine Secrets. */
function sanitizeMetadata(raw: unknown): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  if (typeof raw !== "object" || raw === null) return clean;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,40}$/.test(key)) continue;
    if (typeof value === "string") clean[key] = value.slice(0, 300);
    else if (typeof value === "number" && Number.isFinite(value)) clean[key] = value;
    else if (typeof value === "boolean") clean[key] = value;
    if (Object.keys(clean).length >= 12) break;
  }
  return clean;
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });

  let body: {
    action?: unknown;
    entityType?: unknown;
    entityId?: unknown;
    metadata?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  const entityType = typeof body.entityType === "string" ? body.entityType : "";
  const entityId = typeof body.entityId === "string" ? body.entityId : null;
  if (!ALLOWED_ACTIONS.has(action) || !(entityType in ENTITY_TABLES) || !entityId) {
    return Response.json({ error: "Ungültige Audit-Aktion." }, { status: 400 });
  }

  // Organisation aus der Membership (RLS: nur eigene Zeilen sichtbar).
  const membership = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membership.error || !membership.data) {
    return Response.json({ error: "Keine Organisation." }, { status: 403 });
  }
  if (membership.data.role === "viewer") {
    return Response.json({ error: "Keine Berechtigung." }, { status: 403 });
  }
  const organizationId = membership.data.organization_id as string;

  // Objekt muss zur Organisation des Nutzers gehören.
  const admin = createSupabaseAdminClient();
  const entity = await admin
    .from(ENTITY_TABLES[entityType])
    .select("organization_id")
    .eq("id", entityId)
    .maybeSingle();
  if (entity.error || !entity.data || entity.data.organization_id !== organizationId) {
    return Response.json({ error: "Objekt nicht gefunden." }, { status: 404 });
  }

  const insert = await admin.from("audit_events").insert({
    organization_id: organizationId,
    actor_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    action,
    metadata: sanitizeMetadata(body.metadata),
  });
  if (insert.error) {
    return Response.json({ error: "Audit-Eintrag fehlgeschlagen." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
