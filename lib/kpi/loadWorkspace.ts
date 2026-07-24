// ─── KPI-Workspace: Server-Loader ─────────────────────────────────────────────
// Lädt den kompletten Initialzustand mit dem Cookie-Session-Client (RLS greift,
// der Nutzer sieht nur seine Organisation). Läuft ausschließlich serverseitig.
//
// Datenwahrheit: Der KPI liest ausschließlich importierte GSC-Exporte über
// gsc_active_datasets. Die alten Demo-Tabellen (kpi_snapshots,
// gsc_daily_metrics, data_sources aus dem Demo-Sync) werden bewusst nicht mehr
// geladen; ohne aktiven Datensatz zeigt die Oberfläche einen Empty State,
// niemals Demo-Zahlen.

import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  METRIC_KEY,
  type GscActiveDatasetRow,
  type GscDimensionSnapshotRow,
  type GscImportBatchRow,
  type GscScopeDailyRow,
  type MemberCompany,
  type MemberRow,
  type MemberStatus,
  type Role,
  type WorkspaceInit,
} from "./types";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function loadWorkspace(
  supabase: SupabaseClient,
  user: User,
): Promise<WorkspaceInit | null> {
  const membership = await supabase
    .from("memberships")
    .select("organization_id, role, status")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membership.error || !membership.data) return null;

  const organizationId = membership.data.organization_id as string;
  const role = membership.data.role as Role;

  // Eine per Admin-API eingeladene Membership wird beim ersten erfolgreichen
  // Login aktiv. Läuft über den Admin-Client, weil memberships-Updates per
  // RLS bewusst nur seeszn_admin erlaubt sind.
  if (membership.data.status === "invited") {
    await createSupabaseAdminClient()
      .from("memberships")
      .update({ status: "active" })
      .eq("organization_id", organizationId)
      .eq("user_id", user.id);
  }
  const [
    kpi,
    activeDatasets,
    profiles,
    memberships,
    pages,
    tasks,
    taskLinks,
    approvals,
    goalVersions,
    manualKpis,
    manualCheckIns,
    quickWins,
  ] = await Promise.all([
      supabase
        .from("kpi_definitions")
        .select("id, organization_id, name, metric_key, owner_id, data_source_id, kind, created_by, unit, direction, description, archived_at")
        .eq("organization_id", organizationId)
        .eq("metric_key", METRIC_KEY)
        .maybeSingle(),
      supabase
        .from("gsc_active_datasets")
        .select("id, scope_type, scope_value, import_batch_id, activated_at")
        .eq("organization_id", organizationId),
      supabase.from("profiles").select("id, email, full_name"),
      supabase
        .from("memberships")
        .select("user_id, role, company, status")
        .eq("organization_id", organizationId),
      supabase
        .from("pages")
        .select(
          "id, name, url, segment, city, country, region, active, source, last_synced_at, archived_at",
        )
        .eq("organization_id", organizationId),
      supabase
        .from("tasks")
        .select(
          "id, organization_id, kpi_definition_id, page_id, title, description, insight_context, owner_id, priority, status, due_date, created_by, created_at, updated_at, deleted_at, deleted_by, deletion_reason",
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("task_kpi_links")
        .select("task_id, kpi_definition_id")
        .eq("organization_id", organizationId),
      supabase
        .from("approvals")
        .select("id, task_id, requested_by, decided_by, status, note, requested_at, decided_at")
        .eq("organization_id", organizationId)
        .order("requested_at", { ascending: false }),
      // Versionierte Ziele aller KPIs (kpi_targets, additiv erweitert). Vor der
      // Migration 20260714100000 fehlen die neuen Spalten: die Abfrage liefert
      // dann einen Fehler und data bleibt null → [] statt Crash (ehrlicher
      // „Noch kein Ziel"-Zustand).
      supabase
        .from("kpi_targets")
        .select(
          "id, kpi_definition_id, target_value, period_type, period_days, comparator, start_date, end_date, owner_id, rationale, source_type, status, supersedes_target_id, created_by, created_at, archived_at",
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      // Manuell gepflegte KPI-Definitionen (Bewertungen, Google-Präsenz, Content
      // & Authority): alle außer der primären GSC-Kennzahl. Leer bis zum
      // Bootstrap-Script (scripts/bootstrap-review-kpis.mjs).
      supabase
        .from("kpi_definitions")
        .select("id, organization_id, name, metric_key, owner_id, data_source_id, kind, created_by, unit, direction, description, archived_at")
        .eq("organization_id", organizationId)
        .neq("metric_key", METRIC_KEY),
      // Append-only Check-ins der manuellen KPIs. Fehlt die Tabelle noch
      // (vor der Migration), bleibt data null → [].
      supabase
        .from("kpi_manual_check_ins")
        .select(
          "id, kpi_definition_id, value, secondary_value, period_key, measured_at, note, source_type, entered_by, supersedes_check_in_id, archived_at, created_at",
        )
        .eq("organization_id", organizationId)
        .order("measured_at", { ascending: false }),
      // Editierbare Quick-Win-Karten. Fehlt die Tabelle noch (vor der
      // Migration), liefert die Abfrage einen Fehler → quickWinsEnabled = false
      // und der Room zeigt die kuratierten Standardinhalte als Fallback.
      supabase
        .from("kluehspies_quick_wins")
        .select("id, organization_id, title, what, why, recommendation, sort_order, created_at, updated_at")
        .eq("organization_id", organizationId)
        .order("sort_order", { ascending: true }),
    ]);

  const kpiId = kpi.data?.id as string | undefined;
  const activeBatchIds = ((activeDatasets.data ?? []) as GscActiveDatasetRow[]).map(
    (d) => d.import_batch_id,
  );

  const [annotations, batches, daily, dimensions] = await Promise.all([
    kpiId
      ? supabase
          .from("annotations")
          .select("id, kpi_definition_id, date, title, description, linked_task_id, created_by")
          .eq("kpi_definition_id", kpiId)
          .order("date", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    activeBatchIds.length > 0
      ? supabase
          .from("gsc_import_batches")
          .select(
            "id, scope_type, scope_value, period_start, period_end, imported_at, status, original_file_name",
          )
          .in("id", activeBatchIds)
      : Promise.resolve({ data: [], error: null }),
    // Volle Historie je Batch, parallel und einzeln abgefragt: der
    // Gesamtzeitraum-Filter des Cockpits braucht alle Tage, und pro Batch
    // bleiben die Zeilen (~487) sicher unter dem PostgREST-Zeilenlimit.
    Promise.all(
      activeBatchIds.map((batchId) =>
        supabase
          .from("gsc_scope_daily_metrics")
          .select("import_batch_id, date, clicks, impressions, ctr, position")
          .eq("import_batch_id", batchId)
          .order("date", { ascending: true }),
      ),
    ),
    // Dimensions-Snapshots für die Intelligence-Ableitungen: Queries und
    // Seiten nach Impressionen begrenzt (der Long Tail trägt keine
    // Entscheidung), Geräte/Darstellung vollständig (wenige Zeilen). Die
    // vollständigen Tabellen lädt der Detail-Drawer weiterhin lazy.
    Promise.all(
      activeBatchIds.flatMap((batchId) => [
        supabase
          .from("gsc_dimension_snapshots")
          .select(
            "import_batch_id, dimension_type, dimension_value, clicks, impressions, ctr, position, period_start, period_end",
          )
          .eq("import_batch_id", batchId)
          .in("dimension_type", ["query", "page"])
          .order("impressions", { ascending: false })
          .limit(800),
        supabase
          .from("gsc_dimension_snapshots")
          .select(
            "import_batch_id, dimension_type, dimension_value, clicks, impressions, ctr, position, period_start, period_end",
          )
          .eq("import_batch_id", batchId)
          .in("dimension_type", ["device", "search_appearance"])
          .limit(40),
      ]),
    ),
  ]);

  const me = (profiles.data ?? []).find((p) => p.id === user.id);

  // Mitgliederliste: memberships der Organisation + zugehörige Profile.
  // Der eigene, gerade aktivierte Status wird lokal gespiegelt.
  const profileById = new Map((profiles.data ?? []).map((p) => [p.id as string, p]));
  const members: MemberRow[] = ((memberships.data ?? []) as Array<{
    user_id: string;
    role: Role;
    company: MemberCompany | null;
    status: MemberStatus;
  }>).map((m) => {
    const profile = profileById.get(m.user_id);
    return {
      profile_id: m.user_id,
      full_name: (profile?.full_name as string | null) ?? null,
      email: (profile?.email as string | null) ?? null,
      role: m.role,
      company: m.company,
      status: m.user_id === user.id ? "active" : m.status,
    };
  });

  return {
    viewer: {
      id: user.id,
      email: user.email ?? "",
      name: (me?.full_name as string | null)?.trim() || user.email || "Angemeldet",
      role,
    },
    organizationId,
    kpi: (kpi.data as WorkspaceInit["kpi"]) ?? null,
    profiles: (profiles.data as WorkspaceInit["profiles"]) ?? [],
    members,
    goalVersions: (goalVersions.data as WorkspaceInit["goalVersions"]) ?? [],
    pages: (pages.data as WorkspaceInit["pages"]) ?? [],
    tasks: (tasks.data as WorkspaceInit["tasks"]) ?? [],
    taskLinks: (taskLinks.data as WorkspaceInit["taskLinks"]) ?? [],
    approvals: (approvals.data as WorkspaceInit["approvals"]) ?? [],
    annotations: (annotations.data as WorkspaceInit["annotations"]) ?? [],
    manualKpis: (manualKpis.data as WorkspaceInit["manualKpis"]) ?? [],
    manualCheckIns: (manualCheckIns.data as WorkspaceInit["manualCheckIns"]) ?? [],
    quickWins: (quickWins.data as WorkspaceInit["quickWins"]) ?? [],
    quickWinsEnabled: !quickWins.error,
    gsc: {
      activeDatasets: (activeDatasets.data as GscActiveDatasetRow[]) ?? [],
      batches: (batches.data as GscImportBatchRow[]) ?? [],
      daily: daily.flatMap((result) => (result.data as GscScopeDailyRow[]) ?? []),
      dimensions: dimensions.flatMap(
        (result) => (result.data as GscDimensionSnapshotRow[]) ?? [],
      ),
    },
  };
}
