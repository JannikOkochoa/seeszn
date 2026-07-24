"use client";

// ─── KPI-Workspace: Zustand, Realtime, Aktionen ───────────────────────────────
// Ein Provider für den kompletten KPI-Slice. Serverseitig geladene Initialdaten
// kommen als Props; alle Mutationen laufen über den Browser-Client (RLS greift),
// Audit-Einträge über POST /api/audit. Realtime hält Tasks, Kommentare,
// Freigaben und Annotationen über alle Sessions einer Organisation synchron.
//
// Datenwahrheit: Der primäre KPI rechnet ausschließlich auf importierten
// GSC-Exporten (gsc_active_datasets -> gsc_scope_daily_metrics). Ohne aktiven
// Datensatz gibt es einen Empty State; Demo-Daten fließen nie ein.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { addDaysIso, type SeriesPoint } from "@/lib/kpi/aggregate";
import {
  buildScopeOptions,
  clicksSeries,
  computeRange,
  dailyForBatch,
  dataAsOf,
  defaultScopeKey,
  provenanceFor,
  sitewideOption,
  type CockpitRange,
  type DatasetProvenance,
  type PeriodComparison,
  type PeriodTotals,
  type ScopeOption,
} from "@/lib/kpi/gscData";
import {
  buildActionFeed,
  buildContentOpportunities,
  buildDeviceInsight,
  buildExecutiveNarrative,
  buildQuickWins,
  buildScopeMovements,
  buildSeoHealth,
  type ActionFeedItem,
  type ContentOpportunity,
  type DeviceInsight,
  type ExecutiveNarrative,
  type HealthRow,
  type QuickWin,
  type ScopeComparison,
  type ScopeMovement,
} from "@/lib/kpi/intelligence";
import type {
  AnnotationRow,
  ApprovalRow,
  ApprovalStatus,
  AuditEventRow,
  CommentRow,
  GoalComparator,
  GoalPeriodType,
  GoalVersionRow,
  GscDimensionSnapshotRow,
  GscScopeDailyRow,
  InsightContext,
  KpiDefinitionRow,
  LevelDe,
  ManualCheckInRow,
  QuickWinRow,
  TaskPriority,
  TaskRow,
  TaskStatus,
  WorkspaceInit,
} from "@/lib/kpi/types";
import { REVIEW_NEW_METRIC_KEY, REVIEW_RATING_METRIC_KEY } from "@/lib/kpi/reviews";
import { comparatorForDirection, resolveActiveGoal } from "@/lib/kpi/goals";
import {
  BLOG_POSTS_KEY,
  GOOGLE_INTERACTIONS_KEY,
  GOOGLE_MONTHLY_VIEWS_KEY,
  GOOGLE_PROFILE_VIEWS_KEY,
  REDDIT_CONTRIB_KEY,
  isoWeekKey,
} from "@/lib/kpi/operational";

/* ── Hilfen ─────────────────────────────────────────────────────────────────── */

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const idx = list.findIndex((x) => x.id === row.id);
  if (idx === -1) return [row, ...list];
  const next = list.slice();
  next[idx] = { ...next[idx], ...row };
  return next;
}

/** Kurzer Zeitraumtext für Audit-Metadaten (keine UUIDs in der Kundenansicht). */
function periodShort(periodType: GoalPeriodType, periodDays: number | null): string {
  if (periodType === "rolling_days") return `${periodDays} Tage`;
  if (periodType === "calendar_month") return "Monat";
  return "Aktueller Stand";
}

function removeById<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((x) => x.id !== id);
}

export type ActionResult = { ok: true } | { ok: false; message: string };

export interface TaskDraft {
  source: NonNullable<InsightContext["source"]>;
  observation?: string;
  pageId?: string | null;
  pageUrl?: string;
  query?: string;
  device?: string;
  metrics?: InsightContext["metrics"];
}

/** Editierbare Inhalte einer Quick-Win-Karte. */
export interface QuickWinInput {
  title: string;
  what: string;
  why: string;
  /** Empfehlungstext, zeilenweise mit "\n" verbunden. */
  recommendation: string;
}

/** Ziel des Quick-Win-Editor-Drawers: neue Karte oder eine bestehende. */
export type QuickWinEditTarget = { mode: "create" } | { mode: "edit"; row: QuickWinRow };

export interface CreateTaskInput {
  title: string;
  description: string;
  pageId: string | null;
  ownerId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  expectedImpact: LevelDe;
  estimatedEffort: LevelDe;
  requestApproval: boolean;
  insight: InsightContext;
}

export type RealtimeState = "connecting" | "live" | "offline";

/**
 * SEO Intelligence: alle deterministischen Ableitungen des Decision Layer auf
 * stabiler 28-Tage-Basis (unabhängig vom Zeitraum-Filter des Canvas) bzw. den
 * aggregierten Dimensions-Snapshots des Exportzeitraums.
 */
export interface WorkspaceIntelligence {
  narrative: ExecutiveNarrative;
  quickWins: QuickWin[];
  deviceInsight: DeviceInsight | null;
  contentOpportunities: ContentOpportunity[];
  winners: ScopeMovement[];
  losers: ScopeMovement[];
  health: HealthRow[];
  actionFeed: ActionFeedItem[];
  /** Quelle der Tiefen-Ableitungen: Sitewide-Export, sonst Städtereisen. */
  sourceScope: ScopeOption | null;
  /** Exportzeitraum der zugrunde liegenden Dimensions-Snapshots. */
  sourcePeriod: { start: string; end: string } | null;
}

interface WorkspaceContextValue {
  // Stammdaten
  viewer: WorkspaceInit["viewer"];
  organizationId: string;
  kpi: WorkspaceInit["kpi"];
  profiles: WorkspaceInit["profiles"];
  /** Mitglieder der Organisation (Owner-Auswahl, Erwähnungen), nie hart codiert. */
  members: WorkspaceInit["members"];
  pages: WorkspaceInit["pages"];
  productPages: WorkspaceInit["pages"];
  // Live-Zustand
  /** Versionierte Ziele aller KPIs (append-only Historie). */
  goalVersions: GoalVersionRow[];
  /** Manuell gepflegte KPI-Definitionen (Bewertungen, Google-Präsenz, Content &
   *  Authority): alle außer der primären GSC-Kennzahl; leer bis Bootstrap. */
  manualKpis: KpiDefinitionRow[];
  /** Append-only Check-ins der manuellen KPIs. */
  manualCheckIns: ManualCheckInRow[];
  tasks: TaskRow[];
  approvals: ApprovalRow[];
  annotations: AnnotationRow[];
  commentsByTask: Map<string, CommentRow[]>;
  activityByTask: Map<string, AuditEventRow[]>;
  realtime: RealtimeState;
  // Filter
  range: CockpitRange;
  setRange: (r: CockpitRange) => void;
  /** Scope des primären KPI: alle Städtereisen oder eine Produktseite. */
  scopeKey: string | null;
  setScopeKey: (key: string) => void;
  scopeOptions: ScopeOption[];
  // Echte GSC-Daten (einzige KPI-Quelle)
  hasRealData: boolean;
  activeScope: ScopeOption | null;
  /** Tageszeilen des aktiven Scopes (volle Historie) für den Canvas. */
  scopeDailyRows: GscScopeDailyRow[];
  /** Kennwerte der aktuellen Periode; immer vorhanden, wenn Daten da sind. */
  gscTotals: PeriodTotals | null;
  /** Vorperiodenvergleich; null beim Gesamtzeitraum. */
  gscComparison: PeriodComparison | null;
  gscProvenance: DatasetProvenance | null;
  /**
   * Stabile Basis des Executive Intro: 28-Tage-Vergleich des Standard-Scopes
   * (alle Städtereisen), unabhängig von den gewählten Filtern.
   */
  executiveBase: PeriodComparison | null;
  /**
   * Stabile 28-Tage-Basis je Pilotseite für die Executive-Zusammenfassung;
   * unabhängig vom Zeitraum-/Scope-Filter des Cockpits.
   */
  executiveScopeBreakdown: Array<{ option: ScopeOption; comparison: PeriodComparison | null }>;
  /** Vergleich aller Scopes (Städtereisen gesamt, Berlin, Hamburg, München). */
  scopeBreakdown: Array<{
    option: ScopeOption;
    totals: PeriodTotals;
    comparison: PeriodComparison | null;
  }>;
  /** Aggregierte Dimensions-Snapshots je Batch, lazy geladen. */
  dimensionsByBatch: Map<string, GscDimensionSnapshotRow[]>;
  loadDimensions: (batchId: string) => Promise<void>;
  /** SEO Intelligence: berechnete Quick Wins, Bewegungen, Chancen, Aufgaben. */
  intelligence: WorkspaceIntelligence;
  // Abgeleitet
  anchor: string;
  currentRange: { from: string; to: string };
  previousRange: { from: string; to: string };
  series: SeriesPoint[];
  previousSeries: SeriesPoint[];
  kpiTasks: TaskRow[];
  activeTaskCount: number;
  latestApprovalByTask: Map<string, ApprovalRow>;
  /** Soft-gelöschte Maßnahmen, nur für die SEESZN-Admin-Ansicht. */
  deletedTasks: TaskRow[];
  /** Nach einer Löschung 10 Sekunden lang gesetzt: Rückgängig-Angebot. */
  pendingUndo: { taskId: string; title: string } | null;
  // Rechte (nur UX; Sicherheit bleibt RLS)
  canWrite: boolean;
  canEditTarget: boolean;
  isAdmin: boolean;
  canDeleteTask: (task: TaskRow) => boolean;
  // Drawer
  kpiDrawerOpen: boolean;
  setKpiDrawerOpen: (open: boolean) => void;
  dataSourceDrawerOpen: boolean;
  setDataSourceDrawerOpen: (open: boolean) => void;
  /** Ziel-Drawer der primären Kennzahl (Klicks). */
  goalDrawerOpen: boolean;
  setGoalDrawerOpen: (open: boolean) => void;
  taskDrawerId: string | null;
  setTaskDrawerId: (id: string | null) => void;
  createDraft: TaskDraft | null;
  /** Wechselt bei jedem Öffnen; dient als key für ein frisches Formular. */
  createNonce: number;
  openCreate: (draft: TaskDraft) => void;
  closeCreate: () => void;
  // Aktionen
  createTask: (input: CreateTaskInput) => Promise<ActionResult>;
  updateTask: (
    id: string,
    patch: Partial<
      Pick<TaskRow, "title" | "description" | "owner_id" | "priority" | "status" | "due_date" | "page_id">
    >,
  ) => Promise<ActionResult>;
  loadComments: (taskId: string) => Promise<void>;
  addComment: (
    taskId: string,
    body: string,
    mentionedProfileIds?: string[],
  ) => Promise<ActionResult>;
  deleteTask: (id: string, reason: string) => Promise<ActionResult>;
  restoreTask: (id: string) => Promise<ActionResult>;
  loadActivity: (taskId: string) => Promise<void>;
  requestApproval: (taskId: string) => Promise<ActionResult>;
  decideApproval: (
    approval: ApprovalRow,
    status: Exclude<ApprovalStatus, "requested">,
    note: string,
  ) => Promise<ActionResult>;
  createAnnotation: (input: {
    date: string;
    title: string;
    description: string;
    linkedTaskId: string | null;
  }) => Promise<ActionResult>;
  updateAnnotation: (
    id: string,
    patch: { date?: string; title?: string; description?: string | null; linked_task_id?: string | null },
  ) => Promise<ActionResult>;
  /** Neue Zielversion setzen (supersedet das bisherige aktive Ziel derselben Periode). */
  setGoal: (input: GoalInput) => Promise<ActionResult>;
  /** Aktives Ziel archivieren (kein Hard-Delete; Historie bleibt erhalten). */
  archiveGoal: (goalId: string) => Promise<ActionResult>;
  /** Google-Bewertungen aktualisieren: neue Check-ins + ggf. neue Zielversionen. */
  updateReviewValues: (input: ReviewValuesInput) => Promise<ActionResult>;
  /** Google-Präsenz aktualisieren: neue manuelle Check-ins (append-only). */
  updateGooglePresence: (input: GooglePresenceInput) => Promise<ActionResult>;
  /** Content & Authority aktualisieren: neue manuelle Check-ins (append-only). */
  updateContentAuthority: (input: ContentAuthorityInput) => Promise<ActionResult>;
  /** Neuen KPI anlegen (vorhandene Kennzahl mit Ziel ODER eigener manueller KPI). */
  createKpi: (input: CreateKpiInput) => Promise<ActionResult>;
  /** Manuellen Ist-Wert eines eigenen KPI erfassen (append-only Check-in). */
  recordCustomCheckIn: (kpiDefinitionId: string, value: number, note: string | null) => Promise<ActionResult>;
  /** Eigenen KPI archivieren (kein Hard-Delete). */
  archiveKpi: (kpiDefinitionId: string) => Promise<ActionResult>;
  /** Darf dieses Mitglied einen KPI erstellen? (alle aktiven Mitglieder). */
  canCreateKpi: boolean;
  /** Ziel-Drawer für einen bestimmten KPI öffnen (null = primärer KPI). */
  goalDrawerKpiId: string | null;
  openGoalDrawer: (kpiDefinitionId: string | null) => void;
  /** „+ KPI hinzufügen"-Drawer. */
  kpiCreateOpen: boolean;
  setKpiCreateOpen: (open: boolean) => void;
  /** Mitgliederverwaltung, ausschließlich für SEESZN-Admins. */
  memberAdminOpen: boolean;
  setMemberAdminOpen: (open: boolean) => void;
  // Quick Wins (editierbare AI-/SEO-Karten der QUICK-WINS-Section)
  /** Gepflegte Karten aus der Datenbank; leer, solange nur Defaults gelten. */
  quickWins: QuickWinRow[];
  /** Ob die Tabelle existiert (Bearbeiten möglich). Sonst: Fallback-Defaults. */
  quickWinsEnabled: boolean;
  /** Aktuell im Editor geöffnete Karte bzw. „neu"; null = geschlossen. */
  quickWinEdit: QuickWinEditTarget | null;
  /** Wechselt bei jedem Öffnen; key für ein frisches Formular. */
  quickWinEditNonce: number;
  openQuickWinEdit: (target: QuickWinEditTarget) => void;
  closeQuickWinEdit: () => void;
  createQuickWin: (input: QuickWinInput) => Promise<ActionResult>;
  updateQuickWin: (id: string, input: QuickWinInput) => Promise<ActionResult>;
  deleteQuickWin: (id: string) => Promise<ActionResult>;
  /** Karte um eine Position nach oben/unten verschieben (tauscht sort_order). */
  moveQuickWin: (id: string, direction: "up" | "down") => Promise<ActionResult>;
}

export interface GoalInput {
  kpiDefinitionId: string;
  targetValue: number;
  periodType: GoalPeriodType;
  periodDays: number | null;
  comparator: GoalComparator;
  effectiveFrom: string;
  ownerId: string | null;
  rationale: string | null;
  /** Audit-Kontext (KPI-Name, keine UUIDs in der Kundenansicht). */
  kpiLabel: string;
}

export interface ReviewValuesInput {
  rating: number;
  reviewCount: number;
  targetRating: number;
  newThisMonth: number | null;
  monthlyGoal: number;
  note: string | null;
}

export interface GooglePresenceInput {
  profileViews: number;
  interactions: number;
  monthlyEstimate: number;
  measuredAt: string;
  note: string | null;
}

export interface ContentAuthorityInput {
  /** null = kein Check-in für diese Periode anlegen. */
  blogThisWeek: number | null;
  redditThisMonth: number | null;
  note: string | null;
}

export interface CreateKpiInput {
  mode: "existing" | "custom";
  /** mode "existing": metric_key einer vorhandenen kpi_definition. */
  metricKey?: string;
  /** mode "custom": */
  name?: string;
  description?: string | null;
  unit?: string;
  direction?: "higher_is_better" | "lower_is_better";
  /** optionaler erster Ist-Wert (nur custom). */
  firstValue?: number | null;
  // Ziel (beide Modi):
  targetValue: number;
  periodType: GoalPeriodType;
  periodDays: number | null;
  ownerId: string | null;
  effectiveFrom: string;
  rationale: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace außerhalb des KPI-Workspace verwendet.");
  return ctx;
}

/* ── Provider ───────────────────────────────────────────────────────────────── */

export function WorkspaceProvider({
  init,
  children,
}: {
  init: WorkspaceInit;
  children: React.ReactNode;
}) {
  const supabase = getSupabaseBrowserClient();
  const { viewer, organizationId, kpi } = init;

  const [goalVersions, setGoalVersions] = useState(init.goalVersions);
  const [manualCheckIns, setManualCheckIns] = useState(init.manualCheckIns);
  const [manualKpis, setManualKpis] = useState(init.manualKpis);
  const [tasks, setTasks] = useState(init.tasks);
  const [taskLinks, setTaskLinks] = useState(init.taskLinks);
  const [approvals, setApprovals] = useState(init.approvals);
  const [annotations, setAnnotations] = useState(init.annotations);
  const [commentsByTask, setCommentsByTask] = useState<Map<string, CommentRow[]>>(new Map());
  const [activityByTask, setActivityByTask] = useState<Map<string, AuditEventRow[]>>(new Map());
  const [realtime, setRealtime] = useState<RealtimeState>("connecting");
  const [dimensionsByBatch, setDimensionsByBatch] = useState<Map<string, GscDimensionSnapshotRow[]>>(
    new Map(),
  );

  // Standard: 28 Tage, wie im Executive Cockpit vorgesehen.
  const [range, setRange] = useState<CockpitRange>(28);

  // Scope-Auswahl über den aktiven GSC-Datensätzen; Standard: alle Städtereisen.
  const scopeOptions = useMemo(
    () => buildScopeOptions(init.gsc.activeDatasets, init.gsc.batches),
    [init.gsc.activeDatasets, init.gsc.batches],
  );
  const [scopeKey, setScopeKey] = useState<string | null>(() => defaultScopeKey(scopeOptions));
  const [dataSourceDrawerOpen, setDataSourceDrawerOpen] = useState(false);

  const [kpiDrawerOpen, setKpiDrawerOpen] = useState(false);
  const [goalDrawerOpen, setGoalDrawerOpen] = useState(false);
  // Ziel-Drawer kann jeden KPI adressieren (primär oder eigener); null = primärer KPI.
  const [goalDrawerKpiId, setGoalDrawerKpiId] = useState<string | null>(null);
  const [kpiCreateOpen, setKpiCreateOpen] = useState(false);
  const [memberAdminOpen, setMemberAdminOpen] = useState(false);
  const [taskDrawerId, setTaskDrawerId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<TaskDraft | null>(null);
  const [createNonce, setCreateNonce] = useState(0);
  const [pendingUndo, setPendingUndo] = useState<{ taskId: string; title: string } | null>(null);

  // Quick Wins: editierbare Karten der QUICK-WINS-Section.
  const [quickWins, setQuickWins] = useState(init.quickWins);
  const quickWinsEnabled = init.quickWinsEnabled;
  const [quickWinEdit, setQuickWinEdit] = useState<QuickWinEditTarget | null>(null);
  const [quickWinEditNonce, setQuickWinEditNonce] = useState(0);

  const canWrite = viewer.role === "seeszn_admin" || viewer.role === "kluehspies_editor";
  const canEditTarget = viewer.role === "seeszn_admin";
  const isAdmin = viewer.role === "seeszn_admin";
  // KPIs darf jedes aktive Organisationsmitglied erstellen (auch Viewer). Die
  // eigentliche Absicherung liegt in der RLS (20260714120000_collaborative_kpi).
  const canCreateKpi =
    viewer.role === "seeszn_admin" ||
    viewer.role === "kluehspies_editor" ||
    viewer.role === "viewer";

  // Löschrechte spiegeln den Soft-Delete-Trigger: Admin alles, Editor nur
  // eigene oder ihm zugewiesene Maßnahmen, Viewer nie.
  const canDeleteTask = useCallback(
    (task: TaskRow): boolean => {
      if (viewer.role === "seeszn_admin") return true;
      if (viewer.role !== "kluehspies_editor") return false;
      return task.created_by === viewer.id || task.owner_id === viewer.id;
    },
    [viewer.role, viewer.id],
  );

  // Das Rückgängig-Fenster schließt sich nach zehn Sekunden von selbst.
  useEffect(() => {
    if (!pendingUndo) return;
    const timer = setTimeout(() => setPendingUndo(null), 10_000);
    return () => clearTimeout(timer);
  }, [pendingUndo]);

  /* ── Audit (fire and forget, Server validiert alles) ─────────────────────── */
  const logAudit = useCallback(
    (action: string, entityType: string, entityId: string, metadata: Record<string, unknown> = {}) => {
      void fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, entityType, entityId, metadata }),
      }).catch(() => {
        /* Audit ist Protokoll, nie blockierend. */
      });
    },
    [],
  );

  /* ── Dimensions-Snapshots: aggregierte Exportwerte, lazy je Batch ────────── */
  const loadDimensions = useCallback(
    async (batchId: string) => {
      if (dimensionsByBatch.has(batchId)) return;
      const { data } = await supabase
        .from("gsc_dimension_snapshots")
        .select(
          "import_batch_id, dimension_type, dimension_value, clicks, impressions, ctr, position, period_start, period_end",
        )
        .eq("import_batch_id", batchId)
        .order("clicks", { ascending: false })
        .limit(3000);
      setDimensionsByBatch((prev) => {
        if (prev.has(batchId)) return prev;
        const next = new Map(prev);
        next.set(batchId, (data as GscDimensionSnapshotRow[]) ?? []);
        return next;
      });
    },
    [supabase, dimensionsByBatch],
  );

  /* ── Realtime: eine Subscription pro Organisation ────────────────────────── */
  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    const orgFilter = `organization_id=eq.${organizationId}`;

    async function connect() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);

      channel = supabase
        .channel(`kpi-room-${organizationId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks", filter: orgFilter },
          (payload) => {
            if (payload.eventType === "DELETE") {
              const oldId = (payload.old as { id?: string }).id;
              if (oldId) setTasks((prev) => removeById(prev, oldId));
              return;
            }
            setTasks((prev) => upsertById(prev, payload.new as TaskRow));
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "comments", filter: orgFilter },
          (payload) => {
            const row = payload.new as CommentRow;
            setCommentsByTask((prev) => {
              const existing = prev.get(row.task_id);
              if (!existing) return prev; // Thread noch nicht geladen
              if (existing.some((c) => c.id === row.id)) return prev;
              const next = new Map(prev);
              next.set(row.task_id, [...existing, row]);
              return next;
            });
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "approvals", filter: orgFilter },
          (payload) => {
            if (payload.eventType === "DELETE") return;
            setApprovals((prev) => upsertById(prev, payload.new as ApprovalRow));
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "annotations", filter: orgFilter },
          (payload) => {
            if (payload.eventType === "DELETE") {
              const oldId = (payload.old as { id?: string }).id;
              if (oldId) setAnnotations((prev) => removeById(prev, oldId));
              return;
            }
            setAnnotations((prev) => upsertById(prev, payload.new as AnnotationRow));
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "kpi_targets", filter: orgFilter },
          (payload) => {
            if (payload.eventType === "DELETE") return;
            setGoalVersions((prev) => upsertById(prev, payload.new as GoalVersionRow));
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "kpi_manual_check_ins", filter: orgFilter },
          (payload) => {
            setManualCheckIns((prev) => upsertById(prev, payload.new as ManualCheckInRow));
          },
        )
        .subscribe((status) => {
          if (cancelled) return;
          if (status === "SUBSCRIBED") setRealtime("live");
          else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setRealtime("offline");
          }
        });
    }

    void connect();
    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [supabase, organizationId]);

  /* ── Aktionen ────────────────────────────────────────────────────────────── */

  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<ActionResult> => {
      const insight: InsightContext = {
        ...input.insight,
        expectedImpact: input.expectedImpact,
        estimatedEffort: input.estimatedEffort,
      };
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const nowIso = new Date().toISOString();
      const optimistic: TaskRow = {
        id: tempId,
        organization_id: organizationId,
        kpi_definition_id: kpi?.id ?? null,
        page_id: input.pageId,
        title: input.title,
        description: input.description || null,
        insight_context: insight,
        owner_id: input.ownerId,
        priority: input.priority,
        status: input.requestApproval ? "waiting_for_approval" : input.status,
        due_date: input.dueDate,
        created_by: viewer.id,
        created_at: nowIso,
        updated_at: nowIso,
        deleted_at: null,
        deleted_by: null,
        deletion_reason: null,
      };
      setTasks((prev) => [optimistic, ...prev]);

      const inserted = await supabase
        .from("tasks")
        .insert({
          organization_id: organizationId,
          kpi_definition_id: kpi?.id ?? null,
          page_id: input.pageId,
          title: input.title,
          description: input.description || null,
          insight_context: insight,
          owner_id: input.ownerId,
          priority: input.priority,
          status: optimistic.status,
          due_date: input.dueDate,
          created_by: viewer.id,
        })
        .select()
        .single();

      if (inserted.error) {
        setTasks((prev) => removeById(prev, tempId));
        return { ok: false, message: "Die Maßnahme konnte nicht gespeichert werden." };
      }
      const task = inserted.data as TaskRow;
      setTasks((prev) => upsertById(removeById(prev, tempId), task));

      // n:m-Verknüpfung zum KPI (neue Logik nutzt task_kpi_links).
      if (kpi) {
        const link = await supabase.from("task_kpi_links").insert({
          organization_id: organizationId,
          task_id: task.id,
          kpi_definition_id: kpi.id,
        });
        if (!link.error) {
          setTaskLinks((prev) => [...prev, { task_id: task.id, kpi_definition_id: kpi.id }]);
        }
      }

      if (input.requestApproval) {
        const approval = await supabase
          .from("approvals")
          .insert({ organization_id: organizationId, task_id: task.id, requested_by: viewer.id })
          .select()
          .single();
        if (!approval.error) {
          setApprovals((prev) => upsertById(prev, approval.data as ApprovalRow));
          // Audit hängt am Task, damit der Aktivitätsverlauf der Maßnahme
          // die Freigabe-Historie vollständig zeigt.
          logAudit("approval.requested", "task", task.id, {});
        }
      }

      logAudit("task.created", "task", task.id, { title: task.title });
      return { ok: true };
    },
    [supabase, organizationId, kpi, viewer.id, logAudit],
  );

  const updateTask = useCallback(
    async (
      id: string,
      patch: Partial<
        Pick<TaskRow, "title" | "description" | "owner_id" | "priority" | "status" | "due_date" | "page_id">
      >,
    ): Promise<ActionResult> => {
      const before = tasks.find((t) => t.id === id);
      if (!before) return { ok: false, message: "Maßnahme nicht gefunden." };
      setTasks((prev) => upsertById(prev, { ...before, ...patch, updated_at: new Date().toISOString() }));

      const updated = await supabase.from("tasks").update(patch).eq("id", id).select().single();
      if (updated.error || !updated.data) {
        setTasks((prev) => upsertById(prev, before));
        return {
          ok: false,
          message:
            updated.error?.code === "PGRST116"
              ? "Keine Berechtigung für diese Änderung."
              : "Die Änderung konnte nicht gespeichert werden.",
        };
      }
      setTasks((prev) => upsertById(prev, updated.data as TaskRow));

      if (patch.status && patch.status !== before.status) {
        logAudit("task.status_changed", "task", id, { from: before.status, to: patch.status });
      } else if (patch.owner_id !== undefined && patch.owner_id !== before.owner_id) {
        logAudit("task.assigned", "task", id, { ownerId: patch.owner_id ?? "" });
      } else {
        logAudit("task.updated", "task", id, {});
      }
      return { ok: true };
    },
    [supabase, tasks, logAudit],
  );

  const loadComments = useCallback(
    async (taskId: string) => {
      const { data } = await supabase
        .from("comments")
        .select("id, task_id, profile_id, body, created_at")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      setCommentsByTask((prev) => {
        const next = new Map(prev);
        next.set(taskId, (data as CommentRow[]) ?? []);
        return next;
      });
    },
    [supabase],
  );

  const addComment = useCallback(
    async (
      taskId: string,
      body: string,
      mentionedProfileIds: string[] = [],
    ): Promise<ActionResult> => {
      const inserted = await supabase
        .from("comments")
        .insert({ organization_id: organizationId, task_id: taskId, profile_id: viewer.id, body })
        .select()
        .single();
      if (inserted.error) {
        return { ok: false, message: "Der Kommentar konnte nicht gespeichert werden." };
      }
      const row = inserted.data as CommentRow;

      // Erwähnungen speichern die profile_id, nicht nur den sichtbaren Text.
      // Ein Fehler hier lässt den Kommentar bestehen (Markierung bleibt Text).
      const uniqueMentions = [...new Set(mentionedProfileIds)];
      if (uniqueMentions.length > 0) {
        await supabase.from("comment_mentions").insert(
          uniqueMentions.map((profileId) => ({
            comment_id: row.id,
            mentioned_profile_id: profileId,
            organization_id: organizationId,
          })),
        );
      }
      setCommentsByTask((prev) => {
        const existing = prev.get(taskId) ?? [];
        if (existing.some((c) => c.id === row.id)) return prev;
        const next = new Map(prev);
        next.set(taskId, [...existing, row]);
        return next;
      });
      logAudit("comment.created", "task", taskId, {});
      return { ok: true };
    },
    [supabase, organizationId, viewer.id, logAudit],
  );

  const deleteTask = useCallback(
    async (id: string, reason: string): Promise<ActionResult> => {
      const before = tasks.find((t) => t.id === id);
      if (!before) return { ok: false, message: "Maßnahme nicht gefunden." };

      const patch = {
        deleted_at: new Date().toISOString(),
        deleted_by: viewer.id,
        deletion_reason: reason.trim() || null,
      };
      setTasks((prev) => upsertById(prev, { ...before, ...patch }));

      const updated = await supabase.from("tasks").update(patch).eq("id", id).select().single();
      if (updated.error || !updated.data) {
        setTasks((prev) => upsertById(prev, before));
        return { ok: false, message: "Die Maßnahme konnte nicht gelöscht werden." };
      }
      setTasks((prev) => upsertById(prev, updated.data as TaskRow));

      // Vollständiges Audit-Event mit Snapshot der Maßnahme zum Löschzeitpunkt.
      const owner = init.profiles.find((p) => p.id === before.owner_id);
      const page = init.pages.find((p) => p.id === before.page_id);
      logAudit("task.deleted", "task", id, {
        title: before.title,
        status: before.status,
        owner: owner ? owner.full_name?.trim() || owner.email || "" : "",
        page: page?.name ?? "",
        reason: reason.trim(),
      });

      setPendingUndo({ taskId: id, title: before.title });
      return { ok: true };
    },
    [supabase, tasks, viewer.id, init.profiles, init.pages, logAudit],
  );

  const restoreTask = useCallback(
    async (id: string): Promise<ActionResult> => {
      const before = tasks.find((t) => t.id === id);
      if (!before) return { ok: false, message: "Maßnahme nicht gefunden." };

      const updated = await supabase
        .from("tasks")
        .update({ deleted_at: null, deleted_by: null, deletion_reason: null })
        .eq("id", id)
        .select()
        .single();
      if (updated.error || !updated.data) {
        return { ok: false, message: "Die Maßnahme konnte nicht wiederhergestellt werden." };
      }
      setTasks((prev) => upsertById(prev, updated.data as TaskRow));
      logAudit("task.restored", "task", id, { title: before.title });
      setPendingUndo((current) => (current?.taskId === id ? null : current));
      return { ok: true };
    },
    [supabase, tasks, logAudit],
  );

  const loadActivity = useCallback(
    async (taskId: string) => {
      const { data } = await supabase
        .from("audit_events")
        .select("id, actor_id, entity_type, entity_id, action, metadata, created_at")
        .eq("entity_id", taskId)
        .order("created_at", { ascending: false })
        .limit(50);
      setActivityByTask((prev) => {
        const next = new Map(prev);
        next.set(taskId, (data as AuditEventRow[]) ?? []);
        return next;
      });
    },
    [supabase],
  );

  const requestApproval = useCallback(
    async (taskId: string): Promise<ActionResult> => {
      const inserted = await supabase
        .from("approvals")
        .insert({ organization_id: organizationId, task_id: taskId, requested_by: viewer.id })
        .select()
        .single();
      if (inserted.error) {
        const duplicate = inserted.error.message.includes("approvals_one_open_per_task");
        return {
          ok: false,
          message: duplicate
            ? "Für diese Maßnahme ist bereits eine Freigaberunde offen."
            : "Die Freigabe konnte nicht angefordert werden.",
        };
      }
      setApprovals((prev) => upsertById(prev, inserted.data as ApprovalRow));
      logAudit("approval.requested", "task", taskId, {});
      // Fachlicher Status folgt der Freigabe-Anforderung.
      await supabase.from("tasks").update({ status: "waiting_for_approval" }).eq("id", taskId);
      setTasks((prev) => {
        const t = prev.find((x) => x.id === taskId);
        return t ? upsertById(prev, { ...t, status: "waiting_for_approval" }) : prev;
      });
      return { ok: true };
    },
    [supabase, organizationId, viewer.id, logAudit],
  );

  const decideApproval = useCallback(
    async (
      approval: ApprovalRow,
      status: Exclude<ApprovalStatus, "requested">,
      note: string,
    ): Promise<ActionResult> => {
      const updated = await supabase
        .from("approvals")
        .update({
          status,
          note: note.trim() || null,
          decided_by: viewer.id,
          decided_at: new Date().toISOString(),
        })
        .eq("id", approval.id)
        .select()
        .single();
      if (updated.error || !updated.data) {
        return { ok: false, message: "Die Entscheidung konnte nicht gespeichert werden." };
      }
      setApprovals((prev) => upsertById(prev, updated.data as ApprovalRow));
      logAudit("approval.decided", "task", approval.task_id, { status });
      return { ok: true };
    },
    [supabase, viewer.id, logAudit],
  );

  const createAnnotation = useCallback(
    async (input: {
      date: string;
      title: string;
      description: string;
      linkedTaskId: string | null;
    }): Promise<ActionResult> => {
      if (!kpi) return { ok: false, message: "Kein KPI vorhanden." };
      const inserted = await supabase
        .from("annotations")
        .insert({
          organization_id: organizationId,
          kpi_definition_id: kpi.id,
          date: input.date,
          title: input.title,
          description: input.description || null,
          linked_task_id: input.linkedTaskId,
          created_by: viewer.id,
        })
        .select()
        .single();
      if (inserted.error) {
        return { ok: false, message: "Die Annotation konnte nicht gespeichert werden." };
      }
      setAnnotations((prev) => upsertById(prev, inserted.data as AnnotationRow));
      logAudit("annotation.created", "annotation", (inserted.data as AnnotationRow).id, {
        title: input.title,
      });
      return { ok: true };
    },
    [supabase, organizationId, kpi, viewer.id, logAudit],
  );

  const updateAnnotation = useCallback(
    async (
      id: string,
      patch: { date?: string; title?: string; description?: string | null; linked_task_id?: string | null },
    ): Promise<ActionResult> => {
      const updated = await supabase.from("annotations").update(patch).eq("id", id).select().single();
      if (updated.error || !updated.data) {
        return { ok: false, message: "Die Annotation konnte nicht geändert werden." };
      }
      setAnnotations((prev) => upsertById(prev, updated.data as AnnotationRow));
      logAudit("annotation.updated", "annotation", id, {});
      return { ok: true };
    },
    [supabase, logAudit],
  );

  // Neue Zielversion setzen: identische Ziele werden nicht dupliziert; sonst
  // wird das bisherige aktive Ziel derselben Periode superseded (nie
  // überschrieben) und eine neue aktive Version angelegt.
  const setGoal = useCallback(
    async (input: GoalInput): Promise<ActionResult> => {
      const active =
        goalVersions.find(
          (g) =>
            g.status === "active" &&
            g.kpi_definition_id === input.kpiDefinitionId &&
            g.period_type === input.periodType &&
            g.period_days === input.periodDays,
        ) ?? null;

      // Unverändert: kein neuer Datensatz (verhindert Versions-Spam). Eine leere
      // Begründung (z. B. beim Review-Speichern) zählt nicht als Änderung; nur
      // eine tatsächlich neue Begründung erzeugt eine Version.
      const rationaleChanged = input.rationale !== null && input.rationale !== (active?.rationale ?? null);
      if (
        active &&
        Number(active.target_value) === input.targetValue &&
        active.owner_id === input.ownerId &&
        !rationaleChanged
      ) {
        return { ok: true };
      }

      if (active) {
        const closed = await supabase
          .from("kpi_targets")
          .update({ status: "superseded", end_date: addDaysIso(input.effectiveFrom, -1) })
          .eq("id", active.id)
          .select()
          .single();
        if (closed.error || !closed.data) {
          return { ok: false, message: "Das bisherige Ziel konnte nicht abgelöst werden." };
        }
        setGoalVersions((prev) => upsertById(prev, closed.data as GoalVersionRow));
      }

      const inserted = await supabase
        .from("kpi_targets")
        .insert({
          organization_id: organizationId,
          kpi_definition_id: input.kpiDefinitionId,
          target_value: input.targetValue,
          period_type: input.periodType,
          period_days: input.periodDays,
          comparator: input.comparator,
          start_date: input.effectiveFrom,
          end_date: null,
          owner_id: input.ownerId,
          rationale: input.rationale,
          source_type: "manual_confirmed",
          status: "active",
          supersedes_target_id: active?.id ?? null,
          created_by: viewer.id,
        })
        .select()
        .single();
      if (inserted.error || !inserted.data) {
        return { ok: false, message: "Das Ziel konnte nicht gespeichert werden." };
      }
      const row = inserted.data as GoalVersionRow;
      setGoalVersions((prev) => upsertById(prev, row));

      const ownerProfile = init.profiles.find((p) => p.id === input.ownerId);
      const ownerName = input.ownerId
        ? ownerProfile?.full_name?.trim() || ownerProfile?.email || "SEESZN"
        : "Nicht zugewiesen";
      const onlyOwnerChanged =
        active !== null &&
        Number(active.target_value) === input.targetValue &&
        active.period_type === input.periodType &&
        active.period_days === input.periodDays &&
        active.owner_id !== input.ownerId;
      const action = !active
        ? "kpi.goal_created"
        : onlyOwnerChanged
          ? "kpi.goal_owner_changed"
          : "kpi.goal_changed";
      logAudit(action, "kpi_goal", row.id, {
        kpi: input.kpiLabel,
        oldValue: active ? Number(active.target_value) : "",
        newValue: input.targetValue,
        oldPeriod: active ? periodShort(active.period_type, active.period_days) : "",
        newPeriod: periodShort(input.periodType, input.periodDays),
        owner: ownerName,
        effectiveFrom: input.effectiveFrom,
      });
      return { ok: true };
    },
    [supabase, goalVersions, organizationId, viewer.id, init.profiles, logAudit],
  );

  const archiveGoal = useCallback(
    async (goalId: string): Promise<ActionResult> => {
      const g = goalVersions.find((x) => x.id === goalId);
      if (!g) return { ok: false, message: "Ziel nicht gefunden." };
      const today = new Date().toISOString().slice(0, 10);
      const updated = await supabase
        .from("kpi_targets")
        .update({ status: "archived", archived_at: new Date().toISOString(), end_date: g.end_date ?? today })
        .eq("id", goalId)
        .select()
        .single();
      if (updated.error || !updated.data) {
        return { ok: false, message: "Das Ziel konnte nicht archiviert werden." };
      }
      setGoalVersions((prev) => upsertById(prev, updated.data as GoalVersionRow));
      logAudit("kpi.goal_archived", "kpi_goal", goalId, {});
      return { ok: true };
    },
    [supabase, goalVersions, logAudit],
  );

  // Google-Bewertungen: neue Check-ins (Ist) + ggf. neue Zielversionen. GSC-Ist-
  // Werte laufen NIE hierüber. Ohne eingerichtete Review-KPIs (vor Bootstrap)
  // ehrliche Fehlermeldung statt stiller No-op.
  const updateReviewValues = useCallback(
    async (input: ReviewValuesInput): Promise<ActionResult> => {
      const ratingKpi = init.manualKpis.find((k) => k.metric_key === REVIEW_RATING_METRIC_KEY);
      const newKpi = init.manualKpis.find((k) => k.metric_key === REVIEW_NEW_METRIC_KEY);
      if (!ratingKpi || !newKpi) {
        return { ok: false, message: "Die Bewertungs-KPIs sind noch nicht eingerichtet." };
      }
      const today = new Date().toISOString().slice(0, 10);
      const monthKey = today.slice(0, 7);

      const ratingCheckIn = await supabase
        .from("kpi_manual_check_ins")
        .insert({
          organization_id: organizationId,
          kpi_definition_id: ratingKpi.id,
          value: input.rating,
          secondary_value: input.reviewCount,
          period_key: null,
          measured_at: today,
          note: input.note,
          source_type: "manually_entered",
          entered_by: viewer.id,
        })
        .select()
        .single();
      if (ratingCheckIn.error || !ratingCheckIn.data) {
        return { ok: false, message: "Die Bewertungswerte konnten nicht gespeichert werden." };
      }
      setManualCheckIns((prev) => [ratingCheckIn.data as ManualCheckInRow, ...prev]);
      logAudit("review.checked_in", "review_check_in", (ratingCheckIn.data as ManualCheckInRow).id, {
        rating: input.rating,
        count: input.reviewCount,
      });

      if (input.newThisMonth !== null) {
        const newCheckIn = await supabase
          .from("kpi_manual_check_ins")
          .insert({
            organization_id: organizationId,
            kpi_definition_id: newKpi.id,
            value: input.newThisMonth,
            secondary_value: null,
            period_key: monthKey,
            measured_at: today,
            note: input.note,
            source_type: "manually_entered",
            entered_by: viewer.id,
          })
          .select()
          .single();
        if (!newCheckIn.error && newCheckIn.data) {
          setManualCheckIns((prev) => [newCheckIn.data as ManualCheckInRow, ...prev]);
        }
      }

      // Ziele mitschreiben (nur bei Änderung entsteht eine neue Version).
      await setGoal({
        kpiDefinitionId: ratingKpi.id,
        targetValue: input.targetRating,
        periodType: "current_state",
        periodDays: null,
        comparator: "at_least",
        effectiveFrom: today,
        ownerId: null,
        rationale: null,
        kpiLabel: "Google-Bewertung",
      });
      await setGoal({
        kpiDefinitionId: newKpi.id,
        targetValue: input.monthlyGoal,
        periodType: "calendar_month",
        periodDays: null,
        comparator: "at_least",
        effectiveFrom: today,
        ownerId: null,
        rationale: null,
        kpiLabel: "Neue Google-Bewertungen",
      });
      return { ok: true };
    },
    [supabase, init.manualKpis, organizationId, viewer.id, logAudit, setGoal],
  );

  // Kleiner Helfer: einen manuellen Check-in anlegen (append-only) und lokal
  // spiegeln. GSC-Ist-Werte laufen NIE hierüber.
  const insertCheckIn = useCallback(
    async (
      kpiId: string,
      fields: {
        value: number;
        secondaryValue?: number | null;
        periodKey: string | null;
        measuredAt: string;
        note: string | null;
      },
    ): Promise<ManualCheckInRow | null> => {
      const inserted = await supabase
        .from("kpi_manual_check_ins")
        .insert({
          organization_id: organizationId,
          kpi_definition_id: kpiId,
          value: fields.value,
          secondary_value: fields.secondaryValue ?? null,
          period_key: fields.periodKey,
          measured_at: fields.measuredAt,
          note: fields.note,
          source_type: "manually_entered",
          entered_by: viewer.id,
        })
        .select()
        .single();
      if (inserted.error || !inserted.data) return null;
      const row = inserted.data as ManualCheckInRow;
      setManualCheckIns((prev) => [row, ...prev]);
      return row;
    },
    [supabase, organizationId, viewer.id],
  );

  const updateGooglePresence = useCallback(
    async (input: GooglePresenceInput): Promise<ActionResult> => {
      const viewsKpi = init.manualKpis.find((k) => k.metric_key === GOOGLE_PROFILE_VIEWS_KEY);
      const interactionsKpi = init.manualKpis.find((k) => k.metric_key === GOOGLE_INTERACTIONS_KEY);
      const monthlyKpi = init.manualKpis.find((k) => k.metric_key === GOOGLE_MONTHLY_VIEWS_KEY);
      if (!viewsKpi || !interactionsKpi || !monthlyKpi) {
        return { ok: false, message: "Die Google-Präsenz-KPIs sind noch nicht eingerichtet." };
      }
      const views = await insertCheckIn(viewsKpi.id, {
        value: input.profileViews,
        periodKey: null,
        measuredAt: input.measuredAt,
        note: input.note,
      });
      if (!views) return { ok: false, message: "Die Werte konnten nicht gespeichert werden." };
      await insertCheckIn(interactionsKpi.id, {
        value: input.interactions,
        periodKey: null,
        measuredAt: input.measuredAt,
        note: input.note,
      });
      await insertCheckIn(monthlyKpi.id, {
        value: input.monthlyEstimate,
        periodKey: null,
        measuredAt: input.measuredAt,
        note: input.note,
      });
      logAudit("presence.checked_in", "manual_check_in", views.id, {
        profileViews: input.profileViews,
        interactions: input.interactions,
        monthlyEstimate: input.monthlyEstimate,
        measuredAt: input.measuredAt,
      });
      return { ok: true };
    },
    [insertCheckIn, init.manualKpis, logAudit],
  );

  const updateContentAuthority = useCallback(
    async (input: ContentAuthorityInput): Promise<ActionResult> => {
      const blogKpi = init.manualKpis.find((k) => k.metric_key === BLOG_POSTS_KEY);
      const redditKpi = init.manualKpis.find((k) => k.metric_key === REDDIT_CONTRIB_KEY);
      if (!blogKpi || !redditKpi) {
        return { ok: false, message: "Die Content-KPIs sind noch nicht eingerichtet." };
      }
      const today = new Date().toISOString().slice(0, 10);
      let anchorId: string | null = null;
      if (input.blogThisWeek !== null) {
        const row = await insertCheckIn(blogKpi.id, {
          value: input.blogThisWeek,
          periodKey: isoWeekKey(today),
          measuredAt: today,
          note: input.note,
        });
        if (!row) return { ok: false, message: "Die Werte konnten nicht gespeichert werden." };
        anchorId = row.id;
      }
      if (input.redditThisMonth !== null) {
        const row = await insertCheckIn(redditKpi.id, {
          value: input.redditThisMonth,
          periodKey: today.slice(0, 7),
          measuredAt: today,
          note: input.note,
        });
        if (!row && anchorId === null)
          return { ok: false, message: "Die Werte konnten nicht gespeichert werden." };
        anchorId = anchorId ?? row?.id ?? null;
      }
      if (anchorId) {
        logAudit("content.checked_in", "manual_check_in", anchorId, {
          blog: input.blogThisWeek ?? "",
          reddit: input.redditThisMonth ?? "",
        });
      }
      return { ok: true };
    },
    [insertCheckIn, init.manualKpis, logAudit],
  );

  // Periodenschlüssel für einen Check-in aus dem Periodentyp ableiten.
  const periodKeyForType = useCallback((periodType: GoalPeriodType, todayIso: string): string | null => {
    if (periodType === "calendar_week") return isoWeekKey(todayIso);
    if (periodType === "calendar_month") return todayIso.slice(0, 7);
    return null;
  }, []);

  // Neuen KPI anlegen: entweder ein Ziel an eine vorhandene Kennzahl hängen
  // (mode "existing") oder eine eigene manuelle Definition + Ziel + optionalen
  // ersten Ist-Wert (mode "custom"). Automatisch gemessene Ist-Werte laufen NIE
  // über einen manuellen Check-in.
  const createKpi = useCallback(
    async (input: CreateKpiInput): Promise<ActionResult> => {
      const today = new Date().toISOString().slice(0, 10);

      if (input.mode === "existing") {
        const def = [kpi, ...manualKpis].find((d) => d && d.metric_key === input.metricKey);
        if (!def) return { ok: false, message: "Diese Kennzahl ist nicht verfügbar." };
        return setGoal({
          kpiDefinitionId: def.id,
          targetValue: input.targetValue,
          periodType: input.periodType,
          periodDays: input.periodDays,
          comparator: comparatorForDirection(def.direction ?? "higher_is_better"),
          effectiveFrom: input.effectiveFrom,
          ownerId: input.ownerId,
          rationale: input.rationale,
          kpiLabel: def.name,
        });
      }

      // mode "custom"
      if (!input.name?.trim() || !input.unit || !input.direction) {
        return { ok: false, message: "Bitte Name, Einheit und Richtung angeben." };
      }
      const metricKey = `custom_${crypto.randomUUID()}`;
      const inserted = await supabase
        .from("kpi_definitions")
        .insert({
          organization_id: organizationId,
          name: input.name.trim(),
          metric_key: metricKey,
          kind: "custom_manual",
          created_by: viewer.id,
          owner_id: input.ownerId,
          unit: input.unit,
          direction: input.direction,
          description: input.description?.trim() || null,
        })
        .select(
          "id, organization_id, name, metric_key, owner_id, data_source_id, kind, created_by, unit, direction, description, archived_at",
        )
        .single();
      if (inserted.error || !inserted.data) {
        return { ok: false, message: "Der KPI konnte nicht angelegt werden." };
      }
      const def = inserted.data as KpiDefinitionRow;
      setManualKpis((prev) => [def, ...prev]);
      logAudit("kpi.created", "kpi_definition", def.id, {
        name: def.name,
        unit: input.unit,
        direction: input.direction,
      });

      const goal = await setGoal({
        kpiDefinitionId: def.id,
        targetValue: input.targetValue,
        periodType: input.periodType,
        periodDays: input.periodDays,
        comparator: comparatorForDirection(input.direction),
        effectiveFrom: input.effectiveFrom,
        ownerId: input.ownerId,
        rationale: input.rationale,
        kpiLabel: def.name,
      });
      if (!goal.ok) return goal;

      if (input.firstValue !== null && input.firstValue !== undefined) {
        const row = await insertCheckIn(def.id, {
          value: input.firstValue,
          periodKey: periodKeyForType(input.periodType, today),
          measuredAt: today,
          note: null,
        });
        if (row) logAudit("kpi.check_in_created", "manual_check_in", row.id, { value: input.firstValue });
      }
      return { ok: true };
    },
    [supabase, kpi, manualKpis, organizationId, viewer.id, setGoal, insertCheckIn, periodKeyForType, logAudit],
  );

  const recordCustomCheckIn = useCallback(
    async (kpiDefinitionId: string, value: number, note: string | null): Promise<ActionResult> => {
      const def = manualKpis.find((d) => d.id === kpiDefinitionId);
      if (!def) return { ok: false, message: "KPI nicht gefunden." };
      const today = new Date().toISOString().slice(0, 10);
      const activeGoal = resolveActiveGoal(goalVersions, { kpiDefinitionId });
      const periodKey = activeGoal ? periodKeyForType(activeGoal.period_type, today) : null;
      const row = await insertCheckIn(kpiDefinitionId, { value, periodKey, measuredAt: today, note });
      if (!row) return { ok: false, message: "Der Wert konnte nicht gespeichert werden." };
      logAudit("kpi.check_in_created", "manual_check_in", row.id, { kpi: def.name, value });
      return { ok: true };
    },
    [manualKpis, goalVersions, insertCheckIn, periodKeyForType, logAudit],
  );

  const archiveKpi = useCallback(
    async (kpiDefinitionId: string): Promise<ActionResult> => {
      const def = manualKpis.find((d) => d.id === kpiDefinitionId);
      if (!def) return { ok: false, message: "KPI nicht gefunden." };
      const updated = await supabase
        .from("kpi_definitions")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", kpiDefinitionId)
        .select(
          "id, organization_id, name, metric_key, owner_id, data_source_id, kind, created_by, unit, direction, description, archived_at",
        )
        .single();
      if (updated.error || !updated.data) {
        return { ok: false, message: "Der KPI konnte nicht archiviert werden." };
      }
      setManualKpis((prev) => upsertById(prev, updated.data as KpiDefinitionRow));
      logAudit("kpi.archived", "kpi_definition", kpiDefinitionId, { name: def.name });
      return { ok: true };
    },
    [supabase, manualKpis, logAudit],
  );

  const openGoalDrawer = useCallback((kpiDefinitionId: string | null) => {
    setGoalDrawerKpiId(kpiDefinitionId);
    setGoalDrawerOpen(true);
  }, []);

  /* ── Abgeleitete Werte ───────────────────────────────────────────────────── */

  const productPages = useMemo(() => init.pages.filter((p) => p.segment === "product"), [init.pages]);

  // Alles Folgende rechnet ausschließlich auf importierten GSC-Exporten.
  const derived = useMemo(() => {
    const activeScope = scopeOptions.find((o) => o.key === scopeKey) ?? null;
    const rows = activeScope ? dailyForBatch(init.gsc.daily, activeScope.batchId) : [];
    const computed = computeRange(rows, range);
    const anchor =
      dataAsOf(rows) ?? addDaysIso(new Date().toISOString().slice(0, 10), -1);

    // Stabile Intro-Basis: 28 Tage auf dem Standard-Scope (path_prefix).
    const baseOption = scopeOptions.find((o) => o.scopeType === "path_prefix") ?? null;
    const executiveBase = baseOption
      ? computeRange(dailyForBatch(init.gsc.daily, baseOption.batchId), 28)?.comparison ?? null
      : null;

    // Stabile 28-Tage-Basis je Pilotseite für die Executive-Zusammenfassung:
    // unabhängig vom Zeitraum-/Scope-Filter des Cockpits, damit z. B. "Gesamter
    // Zeitraum" die Aussage nicht künstlich verändert.
    const executiveScopeBreakdown = scopeOptions
      .filter((option) => option.scopeType === "product_page")
      .map((option) => ({
        option,
        comparison: computeRange(dailyForBatch(init.gsc.daily, option.batchId), 28)?.comparison ?? null,
      }));

    // Vergleich über alle Scopes, jeweils am eigenen Datenstand verankert.
    const scopeBreakdown = scopeOptions.flatMap((option) => {
      const optionRows = dailyForBatch(init.gsc.daily, option.batchId);
      const optionComputed = computeRange(optionRows, range);
      if (!optionComputed) return [];
      return [
        {
          option,
          totals: optionComputed.totals,
          comparison: optionComputed.comparison,
        },
      ];
    });

    if (!activeScope || !computed) {
      // Kein aktiver Datensatz: Empty State, niemals Demo-Zahlen.
      const empty = { from: anchor, to: anchor };
      return {
        hasRealData: false,
        activeScope: null,
        scopeDailyRows: [] as GscScopeDailyRow[],
        anchor,
        currentRange: empty,
        previousRange: empty,
        series: [] as SeriesPoint[],
        previousSeries: [] as SeriesPoint[],
        gscTotals: null,
        gscComparison: null,
        gscProvenance: null,
        executiveBase,
        executiveScopeBreakdown,
        scopeBreakdown,
      };
    }

    const { current, previous } = computed;
    return {
      hasRealData: true,
      activeScope,
      scopeDailyRows: rows,
      anchor,
      currentRange: current,
      previousRange: previous ?? current,
      series: clicksSeries(rows, current),
      previousSeries: previous ? clicksSeries(rows, previous) : ([] as SeriesPoint[]),
      gscTotals: computed.totals,
      gscComparison: computed.comparison,
      gscProvenance: provenanceFor(activeScope, init.gsc.batches, rows),
      executiveBase,
      executiveScopeBreakdown,
      scopeBreakdown,
    };
  }, [scopeOptions, scopeKey, init.gsc.daily, init.gsc.batches, range]);

  // SEO Intelligence: stabile 28-Tage-Vergleiche je Scope plus die
  // aggregierten Dimensions-Snapshots (Exportzeitraum). Bewusst unabhängig vom
  // Zeitraum-/Scope-Filter des Canvas, damit die Aussagen nicht mit jedem
  // Filterklick springen. Der Action Feed hängt zusätzlich an tasks, weil er
  // bereits angelegte offene Maßnahmen ausblendet.
  const intelligence = useMemo<WorkspaceIntelligence>(() => {
    const dims = init.gsc.dimensions;
    const sitewide = sitewideOption(init.gsc.activeDatasets, init.gsc.batches);
    const baseOption = scopeOptions.find((o) => o.scopeType === "path_prefix") ?? null;
    const compare28 = (option: ScopeOption): PeriodComparison | null =>
      computeRange(dailyForBatch(init.gsc.daily, option.batchId), 28)?.comparison ?? null;

    const productScopes: ScopeComparison[] = scopeOptions
      .filter((o) => o.scopeType === "product_page")
      .map((option) => ({ option, comparison: compare28(option) }));
    const base = baseOption ? compare28(baseOption) : null;

    const sourceScope = sitewide ?? baseOption;
    const quickWins = sourceScope ? buildQuickWins(dims, sourceScope.batchId) : [];
    const deviceInsight = sourceScope ? buildDeviceInsight(dims, sourceScope.batchId) : null;
    const contentOpportunities = sourceScope
      ? buildContentOpportunities(dims, sourceScope.batchId)
      : [];
    const { winners, losers } = buildScopeMovements(productScopes, dims);
    const healthScopes: ScopeComparison[] = [
      ...(sitewide ? [{ option: sitewide, comparison: compare28(sitewide) }] : []),
      ...(baseOption ? [{ option: baseOption, comparison: base }] : []),
      ...productScopes,
    ];
    const sourceRow = sourceScope
      ? init.gsc.dimensions.find((d) => d.import_batch_id === sourceScope.batchId)
      : undefined;

    return {
      narrative: buildExecutiveNarrative(base, productScopes),
      quickWins,
      deviceInsight,
      contentOpportunities,
      winners,
      losers,
      health: buildSeoHealth(healthScopes),
      actionFeed: buildActionFeed({
        quickWins,
        losers,
        opportunities: contentOpportunities,
        deviceInsight,
        openTasks: tasks,
      }),
      sourceScope,
      sourcePeriod: sourceRow
        ? { start: sourceRow.period_start, end: sourceRow.period_end }
        : null,
    };
  }, [
    scopeOptions,
    init.gsc.activeDatasets,
    init.gsc.batches,
    init.gsc.daily,
    init.gsc.dimensions,
    tasks,
  ]);

  const kpiTasks = useMemo(() => {
    if (!kpi) return [];
    const linked = new Set(taskLinks.filter((l) => l.kpi_definition_id === kpi.id).map((l) => l.task_id));
    // Soft-gelöschte Maßnahmen sind aus allen normalen Listen ausgeblendet.
    return tasks.filter(
      (t) => t.deleted_at === null && (linked.has(t.id) || t.kpi_definition_id === kpi.id),
    );
  }, [tasks, taskLinks, kpi]);

  const deletedTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.deleted_at !== null)
        .sort((a, b) => (b.deleted_at ?? "").localeCompare(a.deleted_at ?? "")),
    [tasks],
  );

  const activeTaskCount = useMemo(
    () => kpiTasks.filter((t) => t.status !== "closed").length,
    [kpiTasks],
  );

  const latestApprovalByTask = useMemo(() => {
    const map = new Map<string, ApprovalRow>();
    const sorted = [...approvals].sort((a, b) => b.requested_at.localeCompare(a.requested_at));
    for (const a of sorted) {
      if (!map.has(a.task_id)) map.set(a.task_id, a);
    }
    return map;
  }, [approvals]);

  const openCreate = useCallback((draft: TaskDraft) => {
    setCreateDraft(draft);
    setCreateNonce((n) => n + 1);
  }, []);
  const closeCreate = useCallback(() => setCreateDraft(null), []);

  // ── Quick Wins: CRUD über den Browser-Client (RLS erzwingt die Rechte) ──────
  const openQuickWinEdit = useCallback((target: QuickWinEditTarget) => {
    setQuickWinEdit(target);
    setQuickWinEditNonce((n) => n + 1);
  }, []);
  const closeQuickWinEdit = useCallback(() => setQuickWinEdit(null), []);

  const createQuickWin = useCallback(
    async (input: QuickWinInput): Promise<ActionResult> => {
      const nextOrder = quickWins.reduce((max, w) => Math.max(max, w.sort_order), 0) + 1;
      const inserted = await supabase
        .from("kluehspies_quick_wins")
        .insert({
          organization_id: organizationId,
          title: input.title,
          what: input.what,
          why: input.why,
          recommendation: input.recommendation,
          sort_order: nextOrder,
          created_by: viewer.id,
        })
        .select("id, organization_id, title, what, why, recommendation, sort_order, created_at, updated_at")
        .single();
      if (inserted.error || !inserted.data) {
        return { ok: false, message: "Der Quick Win konnte nicht gespeichert werden." };
      }
      const row = inserted.data as QuickWinRow;
      setQuickWins((prev) => [...prev, row].sort((a, b) => a.sort_order - b.sort_order));
      return { ok: true };
    },
    [supabase, organizationId, viewer.id, quickWins],
  );

  const updateQuickWin = useCallback(
    async (id: string, input: QuickWinInput): Promise<ActionResult> => {
      const before = quickWins.find((w) => w.id === id);
      if (!before) return { ok: false, message: "Quick Win nicht gefunden." };
      const patch = {
        title: input.title,
        what: input.what,
        why: input.why,
        recommendation: input.recommendation,
      };
      setQuickWins((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));

      const updated = await supabase
        .from("kluehspies_quick_wins")
        .update(patch)
        .eq("id", id)
        .select("id, organization_id, title, what, why, recommendation, sort_order, created_at, updated_at")
        .single();
      if (updated.error || !updated.data) {
        setQuickWins((prev) => prev.map((w) => (w.id === id ? before : w)));
        return {
          ok: false,
          message:
            updated.error?.code === "PGRST116"
              ? "Keine Berechtigung für diese Änderung."
              : "Die Änderung konnte nicht gespeichert werden.",
        };
      }
      const row = updated.data as QuickWinRow;
      setQuickWins((prev) => prev.map((w) => (w.id === id ? row : w)));
      return { ok: true };
    },
    [supabase, quickWins],
  );

  const deleteQuickWin = useCallback(
    async (id: string): Promise<ActionResult> => {
      const before = quickWins;
      setQuickWins((prev) => prev.filter((w) => w.id !== id));
      const deleted = await supabase.from("kluehspies_quick_wins").delete().eq("id", id);
      if (deleted.error) {
        setQuickWins(before);
        return { ok: false, message: "Der Quick Win konnte nicht gelöscht werden." };
      }
      return { ok: true };
    },
    [supabase, quickWins],
  );

  const moveQuickWin = useCallback(
    async (id: string, direction: "up" | "down"): Promise<ActionResult> => {
      const ordered = [...quickWins].sort((a, b) => a.sort_order - b.sort_order);
      const index = ordered.findIndex((w) => w.id === id);
      if (index === -1) return { ok: false, message: "Quick Win nicht gefunden." };
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= ordered.length) return { ok: true };

      const a = ordered[index];
      const b = ordered[swapWith];
      // sort_order-Werte tauschen; optimistisch spiegeln, dann persistieren.
      const before = quickWins;
      setQuickWins((prev) =>
        prev
          .map((w) =>
            w.id === a.id
              ? { ...w, sort_order: b.sort_order }
              : w.id === b.id
                ? { ...w, sort_order: a.sort_order }
                : w,
          )
          .sort((x, y) => x.sort_order - y.sort_order),
      );

      const [ra, rb] = await Promise.all([
        supabase.from("kluehspies_quick_wins").update({ sort_order: b.sort_order }).eq("id", a.id),
        supabase.from("kluehspies_quick_wins").update({ sort_order: a.sort_order }).eq("id", b.id),
      ]);
      if (ra.error || rb.error) {
        setQuickWins(before);
        return { ok: false, message: "Die Reihenfolge konnte nicht gespeichert werden." };
      }
      return { ok: true };
    },
    [supabase, quickWins],
  );

  const value: WorkspaceContextValue = {
    viewer,
    organizationId,
    kpi,
    profiles: init.profiles,
    members: init.members,
    pages: init.pages,
    productPages,
    goalVersions,
    manualKpis,
    manualCheckIns,
    tasks,
    approvals,
    annotations,
    commentsByTask,
    activityByTask,
    realtime,
    range,
    setRange,
    scopeKey,
    setScopeKey,
    scopeOptions,
    dimensionsByBatch,
    loadDimensions,
    intelligence,
    ...derived,
    kpiTasks,
    activeTaskCount,
    latestApprovalByTask,
    deletedTasks,
    pendingUndo,
    canWrite,
    canEditTarget,
    isAdmin,
    canCreateKpi,
    canDeleteTask,
    kpiDrawerOpen,
    setKpiDrawerOpen,
    dataSourceDrawerOpen,
    setDataSourceDrawerOpen,
    goalDrawerOpen,
    setGoalDrawerOpen,
    goalDrawerKpiId,
    openGoalDrawer,
    kpiCreateOpen,
    setKpiCreateOpen,
    memberAdminOpen,
    setMemberAdminOpen,
    quickWins,
    quickWinsEnabled,
    quickWinEdit,
    quickWinEditNonce,
    openQuickWinEdit,
    closeQuickWinEdit,
    createQuickWin,
    updateQuickWin,
    deleteQuickWin,
    moveQuickWin,
    taskDrawerId,
    setTaskDrawerId,
    createDraft,
    createNonce,
    openCreate,
    closeCreate,
    createTask,
    updateTask,
    loadComments,
    addComment,
    deleteTask,
    restoreTask,
    loadActivity,
    requestApproval,
    decideApproval,
    createAnnotation,
    updateAnnotation,
    setGoal,
    archiveGoal,
    updateReviewValues,
    updateGooglePresence,
    updateContentAuthority,
    createKpi,
    recordCustomCheckIn,
    archiveKpi,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
