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

export type MemberCompany = "seeszn" | "kluehspies";
export type MemberStatus = "active" | "invited";

/** Mitglied der aktuellen Organisation: profiles + memberships zusammengeführt. */
export interface MemberRow {
  profile_id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  /** Null bei Bestandszeilen; die Anzeige fällt dann auf die Rolle zurück. */
  company: MemberCompany | null;
  status: MemberStatus;
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

/** DEPRECATED: nur noch für die (ungenutzte) Ziellinien-Hilfe in aggregate.ts. */
export interface TargetRow {
  id: string;
  kpi_definition_id: string;
  target_value: number;
  start_date: string;
  end_date: string | null;
}

export type GoalPeriodType = "rolling_days" | "calendar_week" | "calendar_month" | "current_state";
export type GoalComparator = "at_least" | "at_most";
export type GoalSourceType = "manual_confirmed" | "imported_legacy" | "demo" | "system";
export type GoalStatusValue = "active" | "superseded" | "archived" | "draft";

/**
 * Versionierte Zielzeile (kpi_targets, additiv erweitert). start_date/end_date
 * sind effective_from/effective_until. Eine Zielversion wird nie überschrieben:
 * Änderungen erzeugen eine neue Version, die alte wird superseded.
 */
export interface GoalVersionRow {
  id: string;
  kpi_definition_id: string;
  target_value: number;
  period_type: GoalPeriodType;
  period_days: number | null;
  comparator: GoalComparator;
  start_date: string;
  end_date: string | null;
  owner_id: string | null;
  rationale: string | null;
  source_type: GoalSourceType;
  status: GoalStatusValue;
  supersedes_target_id: string | null;
  created_by: string | null;
  created_at: string;
  archived_at: string | null;
}

/** Append-only Check-in eines manuell gepflegten KPI (z. B. Google-Bewertungen). */
export interface ManualCheckInRow {
  id: string;
  kpi_definition_id: string;
  value: number;
  secondary_value: number | null;
  period_key: string | null;
  measured_at: string;
  note: string | null;
  source_type: string;
  entered_by: string | null;
  supersedes_check_in_id: string | null;
  archived_at: string | null;
  created_at: string;
}


export type PageRegion = "deutschland" | "europa";

export interface PageRow {
  id: string;
  name: string;
  url: string;
  segment: string | null;
  city: string | null;
  country: string | null;
  region: PageRegion | null;
  active: boolean;
  source: string | null;
  last_synced_at: string | null;
  archived_at: string | null;
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
  /** Soft Delete: gesetzt = aus normalen Listen ausgeblendet, nie physisch gelöscht. */
  deleted_at: string | null;
  deleted_by: string | null;
  deletion_reason: string | null;
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

/** Gespeicherte @-Erwähnung: referenziert die profile_id, nicht nur den Text. */
export interface CommentMentionRow {
  comment_id: string;
  mentioned_profile_id: string;
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

/* ── GSC-Export-Import (echte Search-Console-Daten) ─────────────────────────── */

export type GscScopeType = "sitewide" | "path_prefix" | "product_page";
export type GscDimensionType = "query" | "page" | "device" | "country" | "search_appearance";
export type GscBatchStatus = "pending" | "validating" | "imported" | "failed" | "archived";

export interface GscImportBatchRow {
  id: string;
  scope_type: GscScopeType;
  scope_value: string | null;
  period_start: string;
  period_end: string;
  imported_at: string | null;
  status: GscBatchStatus;
  original_file_name: string;
}

export interface GscActiveDatasetRow {
  id: string;
  scope_type: GscScopeType;
  scope_value: string | null;
  import_batch_id: string;
  activated_at: string;
}

/** Ein Tageswert aus Chart.csv, gebunden an einen Import-Batch. */
export interface GscScopeDailyRow {
  import_batch_id: string;
  date: string;
  clicks: number;
  impressions: number;
  /** Anteil 0..1, nicht Prozent. */
  ctr: number;
  position: number;
}

/** Aggregat über den gesamten Exportzeitraum (nie als Tageswert darstellen). */
export interface GscDimensionSnapshotRow {
  import_batch_id: string;
  dimension_type: GscDimensionType;
  dimension_value: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  period_start: string;
  period_end: string;
}

export const GSC_DIMENSION_LABEL: Record<GscDimensionType, string> = {
  query: "Suchanfragen",
  page: "Seiten",
  device: "Geräte",
  country: "Länder",
  search_appearance: "Darstellung in der Suche",
};

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
  profiles: ProfileRow[];
  /** Mitglieder der Organisation, Basis für Owner-Auswahl und Erwähnungen. */
  members: MemberRow[];
  /** Versionierte Ziele aller KPIs der Organisation (kanonische Zielwahrheit). */
  goalVersions: GoalVersionRow[];
  pages: PageRow[];
  tasks: TaskRow[];
  taskLinks: TaskLinkRow[];
  approvals: ApprovalRow[];
  annotations: AnnotationRow[];
  /** Manuell gepflegte KPI-Definitionen (Bewertungen, Google-Präsenz, Content
   *  & Authority): alle außer der primären GSC-Kennzahl; leer bis zum Bootstrap. */
  manualKpis: KpiDefinitionRow[];
  /** Append-only Check-ins der manuellen KPIs (Ist-Werte). */
  manualCheckIns: ManualCheckInRow[];
  /** Echte GSC-Daten: aktive Batches je Scope + deren tägliche Zeitreihen.
   *  Einzige Quelle der KPI-Berechnung; Demo-Daten fließen nicht mehr ein. */
  gsc: {
    activeDatasets: GscActiveDatasetRow[];
    batches: GscImportBatchRow[];
    daily: GscScopeDailyRow[];
  };
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

export const COMPANY_LABEL: Record<MemberCompany, string> = {
  seeszn: "SEESZN",
  kluehspies: "Klühspies",
};

export const PAGE_REGION_LABEL: Record<PageRegion, string> = {
  deutschland: "Deutschland",
  europa: "Europa",
};
