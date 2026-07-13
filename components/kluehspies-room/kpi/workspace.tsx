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
import {
  addDaysIso,
  targetForDate,
  targetSeries,
  type RangeDays,
  type SeriesPoint,
} from "@/lib/kpi/aggregate";
import {
  buildScopeOptions,
  clicksSeries,
  comparePeriods,
  dailyForBatch,
  dataAsOf,
  defaultScopeKey,
  provenanceFor,
  rangesForBatch,
  type DatasetProvenance,
  type PeriodComparison,
  type ScopeOption,
} from "@/lib/kpi/gscData";
import type {
  AnnotationRow,
  ApprovalRow,
  ApprovalStatus,
  AuditEventRow,
  CommentRow,
  GscDimensionSnapshotRow,
  InsightContext,
  LevelDe,
  TargetRow,
  TaskPriority,
  TaskRow,
  TaskStatus,
  WorkspaceInit,
} from "@/lib/kpi/types";

/* ── Hilfen ─────────────────────────────────────────────────────────────────── */

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const idx = list.findIndex((x) => x.id === row.id);
  if (idx === -1) return [row, ...list];
  const next = list.slice();
  next[idx] = { ...next[idx], ...row };
  return next;
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
  targets: TargetRow[];
  tasks: TaskRow[];
  approvals: ApprovalRow[];
  annotations: AnnotationRow[];
  commentsByTask: Map<string, CommentRow[]>;
  activityByTask: Map<string, AuditEventRow[]>;
  realtime: RealtimeState;
  // Filter
  days: RangeDays;
  setDays: (d: RangeDays) => void;
  /** Scope des primären KPI: alle Städtereisen oder eine Produktseite. */
  scopeKey: string | null;
  setScopeKey: (key: string) => void;
  scopeOptions: ScopeOption[];
  // Echte GSC-Daten (einzige KPI-Quelle)
  hasRealData: boolean;
  activeScope: ScopeOption | null;
  gscComparison: PeriodComparison | null;
  gscProvenance: DatasetProvenance | null;
  /** Vergleich aller Scopes (Städtereisen gesamt, Berlin, Hamburg, München). */
  scopeBreakdown: Array<{ option: ScopeOption; comparison: PeriodComparison }>;
  /** Aggregierte Dimensions-Snapshots je Batch, lazy geladen. */
  dimensionsByBatch: Map<string, GscDimensionSnapshotRow[]>;
  loadDimensions: (batchId: string) => Promise<void>;
  // Abgeleitet
  anchor: string;
  currentRange: { from: string; to: string };
  previousRange: { from: string; to: string };
  series: SeriesPoint[];
  previousSeries: SeriesPoint[];
  targetLine: SeriesPoint[];
  activeTarget: TargetRow | null;
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
  setNewTarget: (value: number, startDate: string) => Promise<ActionResult>;
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

  const [targets, setTargets] = useState(init.targets);
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

  const [days, setDays] = useState<RangeDays>(28);

  // Scope-Auswahl über den aktiven GSC-Datensätzen; Standard: alle Städtereisen.
  const scopeOptions = useMemo(
    () => buildScopeOptions(init.gsc.activeDatasets, init.gsc.batches),
    [init.gsc.activeDatasets, init.gsc.batches],
  );
  const [scopeKey, setScopeKey] = useState<string | null>(() => defaultScopeKey(scopeOptions));

  const [kpiDrawerOpen, setKpiDrawerOpen] = useState(false);
  const [taskDrawerId, setTaskDrawerId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<TaskDraft | null>(null);
  const [createNonce, setCreateNonce] = useState(0);
  const [pendingUndo, setPendingUndo] = useState<{ taskId: string; title: string } | null>(null);

  const canWrite = viewer.role === "seeszn_admin" || viewer.role === "kluehspies_editor";
  const canEditTarget = viewer.role === "seeszn_admin";
  const isAdmin = viewer.role === "seeszn_admin";

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

  const setNewTarget = useCallback(
    async (value: number, startDate: string): Promise<ActionResult> => {
      if (!kpi) return { ok: false, message: "Kein KPI vorhanden." };
      const open = targets.find((t) => t.end_date === null);

      // Gleiches Startdatum: Wert des offenen Ziels anpassen statt neue Zeile.
      if (open && open.start_date === startDate) {
        const updated = await supabase
          .from("kpi_targets")
          .update({ target_value: value })
          .eq("id", open.id)
          .select()
          .single();
        if (updated.error || !updated.data) {
          return { ok: false, message: "Das Ziel konnte nicht angepasst werden." };
        }
        setTargets((prev) => upsertById(prev, updated.data as TargetRow));
        return { ok: true };
      }

      // Offenes Ziel zum Vortag schließen, danach neues offenes Ziel anlegen.
      if (open) {
        if (startDate <= open.start_date) {
          return { ok: false, message: "Das neue Ziel muss nach dem Beginn des aktuellen Ziels starten." };
        }
        const closed = await supabase
          .from("kpi_targets")
          .update({ end_date: addDaysIso(startDate, -1) })
          .eq("id", open.id)
          .select()
          .single();
        if (closed.error || !closed.data) {
          return { ok: false, message: "Das bisherige Ziel konnte nicht abgegrenzt werden." };
        }
        setTargets((prev) => upsertById(prev, closed.data as TargetRow));
      }

      const inserted = await supabase
        .from("kpi_targets")
        .insert({
          organization_id: organizationId,
          kpi_definition_id: kpi.id,
          target_value: value,
          start_date: startDate,
          end_date: null,
          created_by: viewer.id,
        })
        .select()
        .single();
      if (inserted.error) {
        return { ok: false, message: "Das neue Ziel überschneidet sich mit einem bestehenden Zeitraum." };
      }
      setTargets((prev) =>
        upsertById(prev, inserted.data as TargetRow).sort((a, b) => a.start_date.localeCompare(b.start_date)),
      );
      return { ok: true };
    },
    [supabase, kpi, targets, organizationId, viewer.id],
  );

  /* ── Abgeleitete Werte ───────────────────────────────────────────────────── */

  const productPages = useMemo(() => init.pages.filter((p) => p.segment === "product"), [init.pages]);

  // Alles Folgende rechnet ausschließlich auf importierten GSC-Exporten.
  const derived = useMemo(() => {
    const activeScope = scopeOptions.find((o) => o.key === scopeKey) ?? null;
    const rows = activeScope ? dailyForBatch(init.gsc.daily, activeScope.batchId) : [];
    const ranges = rangesForBatch(rows, days);
    const anchor =
      dataAsOf(rows) ?? addDaysIso(new Date().toISOString().slice(0, 10), -1);

    // Vergleich über alle Scopes, jeweils am eigenen Datenstand verankert.
    const scopeBreakdown = scopeOptions.flatMap((option) => {
      const optionRows = dailyForBatch(init.gsc.daily, option.batchId);
      const optionRanges = rangesForBatch(optionRows, days);
      if (!optionRanges) return [];
      return [
        {
          option,
          comparison: comparePeriods(optionRows, optionRanges.current, optionRanges.previous),
        },
      ];
    });

    if (!activeScope || !ranges) {
      // Kein aktiver Datensatz: Empty State, niemals Demo-Zahlen.
      const empty = { from: anchor, to: anchor };
      return {
        hasRealData: false,
        activeScope: null,
        anchor,
        currentRange: empty,
        previousRange: empty,
        series: [] as SeriesPoint[],
        previousSeries: [] as SeriesPoint[],
        targetLine: [] as SeriesPoint[],
        gscComparison: null,
        gscProvenance: null,
        scopeBreakdown,
        activeTarget: targetForDate(targets, anchor),
      };
    }

    const { current, previous } = ranges;
    return {
      hasRealData: true,
      activeScope,
      anchor,
      currentRange: current,
      previousRange: previous,
      series: clicksSeries(rows, current),
      previousSeries: clicksSeries(rows, previous),
      targetLine: targetSeries(targets, current),
      gscComparison: comparePeriods(rows, current, previous),
      gscProvenance: provenanceFor(activeScope, init.gsc.batches, rows),
      scopeBreakdown,
      activeTarget: targetForDate(targets, anchor),
    };
  }, [scopeOptions, scopeKey, init.gsc.daily, init.gsc.batches, days, targets]);

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

  const value: WorkspaceContextValue = {
    viewer,
    organizationId,
    kpi,
    profiles: init.profiles,
    members: init.members,
    pages: init.pages,
    productPages,
    targets,
    tasks,
    approvals,
    annotations,
    commentsByTask,
    activityByTask,
    realtime,
    days,
    setDays,
    scopeKey,
    setScopeKey,
    scopeOptions,
    dimensionsByBatch,
    loadDimensions,
    ...derived,
    kpiTasks,
    activeTaskCount,
    latestApprovalByTask,
    deletedTasks,
    pendingUndo,
    canWrite,
    canEditTarget,
    isAdmin,
    canDeleteTask,
    kpiDrawerOpen,
    setKpiDrawerOpen,
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
    setNewTarget,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
