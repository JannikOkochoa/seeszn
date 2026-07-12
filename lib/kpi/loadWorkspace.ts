// ─── KPI-Workspace: Server-Loader ─────────────────────────────────────────────
// Lädt den kompletten Initialzustand mit dem Cookie-Session-Client (RLS greift,
// der Nutzer sieht nur seine Organisation). Läuft ausschließlich serverseitig.

import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  GSC_PROVIDER,
  METRIC_KEY,
  type Role,
  type WorkspaceInit,
} from "./types";
import { addDaysIso } from "./aggregate";

/** 90 Tage aktuelle Periode + 90 Tage Vorperiode, mit Puffer. */
const METRIC_WINDOW_DAYS = 200;

export async function loadWorkspace(
  supabase: SupabaseClient,
  user: User,
): Promise<WorkspaceInit | null> {
  const membership = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membership.error || !membership.data) return null;

  const organizationId = membership.data.organization_id as string;
  const role = membership.data.role as Role;
  const since = addDaysIso(new Date().toISOString().slice(0, 10), -METRIC_WINDOW_DAYS);

  const [kpi, dataSource, profiles, pages, tasks, taskLinks, approvals] = await Promise.all([
    supabase
      .from("kpi_definitions")
      .select("id, organization_id, name, metric_key, owner_id, data_source_id")
      .eq("organization_id", organizationId)
      .eq("metric_key", METRIC_KEY)
      .maybeSingle(),
    supabase
      .from("data_sources")
      .select(
        "id, organization_id, provider, status, last_successful_sync_at, data_available_until, last_error",
      )
      .eq("organization_id", organizationId)
      .eq("provider", GSC_PROVIDER)
      .maybeSingle(),
    supabase.from("profiles").select("id, email, full_name"),
    supabase.from("pages").select("id, name, url, segment").eq("organization_id", organizationId),
    supabase
      .from("tasks")
      .select(
        "id, organization_id, kpi_definition_id, page_id, title, description, insight_context, owner_id, priority, status, due_date, created_by, created_at, updated_at",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
    supabase.from("task_kpi_links").select("task_id, kpi_definition_id").eq("organization_id", organizationId),
    supabase
      .from("approvals")
      .select("id, task_id, requested_by, decided_by, status, note, requested_at, decided_at")
      .eq("organization_id", organizationId)
      .order("requested_at", { ascending: false }),
  ]);

  const kpiId = kpi.data?.id as string | undefined;

  const [snapshots, targets, metrics, annotations] = await Promise.all([
    kpiId
      ? supabase
          .from("kpi_snapshots")
          .select("id, kpi_definition_id, date, value")
          .eq("kpi_definition_id", kpiId)
          .gte("date", since)
          .order("date", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    kpiId
      ? supabase
          .from("kpi_targets")
          .select("id, kpi_definition_id, target_value, start_date, end_date")
          .eq("kpi_definition_id", kpiId)
          .order("start_date", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("gsc_daily_metrics")
      .select("id, date, page_id, query, device, clicks, impressions, ctr, position")
      .eq("organization_id", organizationId)
      .gte("date", since)
      .order("date", { ascending: true })
      .limit(5000),
    kpiId
      ? supabase
          .from("annotations")
          .select("id, kpi_definition_id, date, title, description, linked_task_id, created_by")
          .eq("kpi_definition_id", kpiId)
          .order("date", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  const me = (profiles.data ?? []).find((p) => p.id === user.id);

  return {
    viewer: {
      id: user.id,
      email: user.email ?? "",
      name: (me?.full_name as string | null)?.trim() || user.email || "Angemeldet",
      role,
    },
    organizationId,
    kpi: (kpi.data as WorkspaceInit["kpi"]) ?? null,
    dataSource: (dataSource.data as WorkspaceInit["dataSource"]) ?? null,
    profiles: (profiles.data as WorkspaceInit["profiles"]) ?? [],
    snapshots: (snapshots.data as WorkspaceInit["snapshots"]) ?? [],
    targets: (targets.data as WorkspaceInit["targets"]) ?? [],
    pages: (pages.data as WorkspaceInit["pages"]) ?? [],
    metrics: (metrics.data as WorkspaceInit["metrics"]) ?? [],
    tasks: (tasks.data as WorkspaceInit["tasks"]) ?? [],
    taskLinks: (taskLinks.data as WorkspaceInit["taskLinks"]) ?? [],
    approvals: (approvals.data as WorkspaceInit["approvals"]) ?? [],
    annotations: (annotations.data as WorkspaceInit["annotations"]) ?? [],
  };
}
