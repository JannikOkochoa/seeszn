// ─── KPI-Workspace: geteilte Typen ────────────────────────────────────────────
// Spiegeln die Supabase-Tabellen; werden von Server-Loader und Client geteilt.
// Kein server-only: reine Typen.

export type Role = "seeszn_admin" | "kluehspies_editor" | "viewer";

export type TaskStatus =
  | "open"
  | "in_progress"
  | "waiting_for_approval"
  | "live"
  | "measuring"
  | "closed";

export type TaskPriority = "low" | "medium" | "high";

export type ApprovalStatus = "requested" | "approved" | "changes_requested" | "withdrawn";

export type LevelDe = "niedrig" | "mittel" | "hoch";

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
}

export interface KpiDefinitionRow {
  id: string;
  organization_id: string;
  name: string;
  metric_key: string;
  owner_id: string | null;
  data_source_id: string | null;
}

export interface DataSourceRow {
  id: string;
  organization_id: string;
  provider: string;
  status: "idle" | "syncing" | "error";
  last_successful_sync_at: string | null;
  data_available_until: string | null;
  last_error: string | null;
}

export interface SnapshotRow {
  id: string;
  kpi_definition_id: string;
  date: string;
  value: number;
}

export interface TargetRow {
  id: string;
  kpi_definition_id: string;
  target_value: number;
  start_date: string;
  end_date: string | null;
}

export interface PageRow {
  id: string;
  name: string;
  url: string;
  segment: string | null;
}

export interface MetricRow {
  id: string;
  date: string;
  page_id: string;
  query: string;
  device: string;
  clicks: number;
  impressions: number;
  ctr: number | null;
  position: number | null;
}

/** Strukturierter Erkenntniskontext einer Maßnahme (tasks.insight_context). */
export interface InsightContext {
  source?: "kpi" | "page" | "winner" | "loser" | "query" | "device" | "annotation";
  observation?: string;
  pageUrl?: string;
  query?: string;
  device?: string;
  period?: { from: string; to: string };
  metrics?: {
    clicks?: number;
    previousClicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  };
  expectedImpact?: LevelDe;
  estimatedEffort?: LevelDe;
}

export interface TaskRow {
  id: string;
  organization_id: string;
  kpi_definition_id: string | null;
  page_id: string | null;
  title: string;
  description: string | null;
  insight_context: InsightContext | null;
  owner_id: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskLinkRow {
  task_id: string;
  kpi_definition_id: string;
}

export interface ApprovalRow {
  id: string;
  task_id: string;
  requested_by: string | null;
  decided_by: string | null;
  status: ApprovalStatus;
  note: string | null;
  requested_at: string;
  decided_at: string | null;
}

export interface AnnotationRow {
  id: string;
  kpi_definition_id: string;
  date: string;
  title: string;
  description: string | null;
  linked_task_id: string | null;
  created_by: string | null;
}

export interface CommentRow {
  id: string;
  task_id: string;
  profile_id: string;
  body: string;
  created_at: string;
}

export interface AuditEventRow {
  id: string;
  actor_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface WorkspaceViewer {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** Serverseitig geladener Initialzustand des KPI-Workspace. */
export interface WorkspaceInit {
  viewer: WorkspaceViewer;
  organizationId: string;
  kpi: KpiDefinitionRow | null;
  dataSource: DataSourceRow | null;
  profiles: ProfileRow[];
  snapshots: SnapshotRow[];
  targets: TargetRow[];
  pages: PageRow[];
  metrics: MetricRow[];
  tasks: TaskRow[];
  taskLinks: TaskLinkRow[];
  approvals: ApprovalRow[];
  annotations: AnnotationRow[];
}

export const METRIC_KEY = "organic_clicks_product_pages";
export const GSC_PROVIDER = "google_search_console";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  open: "Offen",
  in_progress: "In Arbeit",
  waiting_for_approval: "Wartet auf Freigabe",
  live: "Live",
  measuring: "In Messung",
  closed: "Abgeschlossen",
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
};

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  requested: "Wartet auf Klühspies",
  approved: "Freigegeben",
  changes_requested: "Änderungen angefordert",
  withdrawn: "Zurückgezogen",
};
