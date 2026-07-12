"use client";

// ─── KPI-Workspace: Zustand, Realtime, Aktionen ───────────────────────────────
// Ein Provider für den kompletten KPI-Slice. Serverseitig geladene Initialdaten
// kommen als Props; alle Mutationen laufen über den Browser-Client (RLS greift),
// der Sync über POST /api/sync/gsc, Audit-Einträge über POST /api/audit.
// Realtime hält Tasks, Kommentare, Freigaben, Annotationen, Snapshots und den
// Sync-Status über alle Sessions einer Organisation synchron.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  addDaysIso,
  buildFindings,
  buildRanges,
  deltaPct,
  latestValue,
  metricSeries,
  pageStats,
  queryStats,
  snapshotSeries,
  sumSeries,
  targetForDate,
  targetSeries,
  type DeviceFilter,
  type Finding,
  type MetricFilter,
  type PageStats,
  type QueryStats,
  type RangeDays,
  type SeriesPoint,
} from "@/lib/kpi/aggregate";
import type {
  AnnotationRow,
  ApprovalRow,
  ApprovalStatus,
  AuditEventRow,
  CommentRow,
  DataSourceRow,
  InsightContext,
  LevelDe,
  MetricRow,
  SnapshotRow,
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
  pages: WorkspaceInit["pages"];
  productPages: WorkspaceInit["pages"];
  // Live-Zustand
  dataSource: DataSourceRow | null;
  snapshots: SnapshotRow[];
  targets: TargetRow[];
  metrics: MetricRow[];
  tasks: TaskRow[];
  approvals: ApprovalRow[];
  annotations: AnnotationRow[];
  commentsByTask: Map<string, CommentRow[]>;
  activityByTask: Map<string, AuditEventRow[]>;
  realtime: RealtimeState;
  checkingFreshness: boolean;
  syncing: boolean;
  syncMessage: string | null;
  // Filter
  days: RangeDays;
  device: DeviceFilter;
  pageFilter: string;
  setDays: (d: RangeDays) => void;
  setDevice: (d: DeviceFilter) => void;
  setPageFilter: (p: string) => void;
  // Abgeleitet
  anchor: string;
  currentRange: { from: string; to: string };
  previousRange: { from: string; to: string };
  isFiltered: boolean;
  series: SeriesPoint[];
  previousSeries: SeriesPoint[];
  targetLine: SeriesPoint[];
  currentSum: number;
  previousSum: number;
  periodDeltaPct: number | null;
  latestSnapshot: { date: string; value: number } | null;
  activeTarget: TargetRow | null;
  progressPct: number | null;
  stats: PageStats[];
  findings: Finding[];
  queries: QueryStats[];
  kpiTasks: TaskRow[];
  activeTaskCount: number;
  latestApprovalByTask: Map<string, ApprovalRow>;
  // Rechte (nur UX; Sicherheit bleibt RLS)
  canWrite: boolean;
  canSync: boolean;
  canEditTarget: boolean;
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
  runSync: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<ActionResult>;
  updateTask: (
    id: string,
    patch: Partial<
      Pick<TaskRow, "title" | "description" | "owner_id" | "priority" | "status" | "due_date" | "page_id">
    >,
  ) => Promise<ActionResult>;
  loadComments: (taskId: string) => Promise<void>;
  addComment: (taskId: string, body: string) => Promise<ActionResult>;
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

  const [dataSource, setDataSource] = useState(init.dataSource);
  const [snapshots, setSnapshots] = useState(init.snapshots);
  const [targets, setTargets] = useState(init.targets);
  const [metrics, setMetrics] = useState(init.metrics);
  const [tasks, setTasks] = useState(init.tasks);
  const [taskLinks, setTaskLinks] = useState(init.taskLinks);
  const [approvals, setApprovals] = useState(init.approvals);
  const [annotations, setAnnotations] = useState(init.annotations);
  const [commentsByTask, setCommentsByTask] = useState<Map<string, CommentRow[]>>(new Map());
  const [activityByTask, setActivityByTask] = useState<Map<string, AuditEventRow[]>>(new Map());
  const [realtime, setRealtime] = useState<RealtimeState>("connecting");
  const [checkingFreshness, setCheckingFreshness] = useState(true);
  const [syncing, setSyncing] = useState(init.dataSource?.status === "syncing");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [days, setDays] = useState<RangeDays>(28);
  const [device, setDevice] = useState<DeviceFilter>("all");
  const [pageFilter, setPageFilter] = useState<string>("all");

  const [kpiDrawerOpen, setKpiDrawerOpen] = useState(false);
  const [taskDrawerId, setTaskDrawerId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<TaskDraft | null>(null);
  const [createNonce, setCreateNonce] = useState(0);

  const canWrite = viewer.role === "seeszn_admin" || viewer.role === "kluehspies_editor";
  const canSync = viewer.role === "seeszn_admin";
  const canEditTarget = viewer.role === "seeszn_admin";

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

  /* ── Datenfrische: sofort letzten Stand zeigen, im Hintergrund prüfen ────── */
  const refetchFreshness = useCallback(async () => {
    setCheckingFreshness(true);
    const { data } = await supabase
      .from("data_sources")
      .select(
        "id, organization_id, provider, status, last_successful_sync_at, data_available_until, last_error",
      )
      .eq("organization_id", organizationId)
      .eq("provider", "google_search_console")
      .maybeSingle();
    if (data) {
      setDataSource(data as DataSourceRow);
      setSyncing((data as DataSourceRow).status === "syncing");
    }
    setCheckingFreshness(false);
  }, [supabase, organizationId]);

  const refetchAfterSync = useCallback(async () => {
    const since = addDaysIso(new Date().toISOString().slice(0, 10), -200);
    const [snap, met] = await Promise.all([
      kpi
        ? supabase
            .from("kpi_snapshots")
            .select("id, kpi_definition_id, date, value")
            .eq("kpi_definition_id", kpi.id)
            .gte("date", since)
            .order("date", { ascending: true })
        : Promise.resolve({ data: null }),
      supabase
        .from("gsc_daily_metrics")
        .select("id, date, page_id, query, device, clicks, impressions, ctr, position")
        .eq("organization_id", organizationId)
        .gte("date", since)
        .order("date", { ascending: true })
        .limit(5000),
    ]);
    if (snap.data) setSnapshots(snap.data as SnapshotRow[]);
    if (met.data) setMetrics(met.data as MetricRow[]);
    await refetchFreshness();
  }, [supabase, kpi, organizationId, refetchFreshness]);

  useEffect(() => {
    // Hintergrundprüfung nach dem ersten Paint; der letzte gespeicherte
    // Stand ist zu diesem Zeitpunkt bereits sichtbar.
    const t = setTimeout(() => void refetchFreshness(), 0);
    return () => clearTimeout(t);
  }, [refetchFreshness]);

  /* ── Realtime: eine Subscription pro Organisation ────────────────────────── */
  const refetchAfterSyncRef = useRef(refetchAfterSync);
  useEffect(() => {
    refetchAfterSyncRef.current = refetchAfterSync;
  }, [refetchAfterSync]);

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
          { event: "UPDATE", schema: "public", table: "data_sources", filter: orgFilter },
          (payload) => {
            const row = payload.new as DataSourceRow;
            const before = payload.old as Partial<DataSourceRow>;
            setDataSource(row);
            setSyncing(row.status === "syncing");
            // Ein anderer Nutzer hat erfolgreich synchronisiert: Werte nachladen.
            if (row.status === "idle" && before.status !== undefined && before.status !== "idle") {
              void refetchAfterSyncRef.current();
            }
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "kpi_snapshots", filter: orgFilter },
          (payload) => {
            if (payload.eventType === "DELETE") return;
            setSnapshots((prev) =>
              upsertById(prev, payload.new as SnapshotRow).sort((a, b) => a.date.localeCompare(b.date)),
            );
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

  const runSync = useCallback(async () => {
    setSyncMessage(null);
    setSyncing(true);
    try {
      const res = await fetch("/api/sync/gsc", { method: "POST" });
      if (res.status === 409) {
        setSyncMessage("Es läuft bereits eine Aktualisierung.");
        return;
      }
      if (res.status === 403) {
        setSyncMessage("Die Aktualisierung kann nur SEESZN anstoßen.");
        return;
      }
      if (!res.ok) {
        setSyncMessage("Die Aktualisierung ist fehlgeschlagen. Der letzte Datenstand bleibt erhalten.");
        return;
      }
      await refetchAfterSync();
    } catch {
      setSyncMessage("Die Aktualisierung ist fehlgeschlagen. Der letzte Datenstand bleibt erhalten.");
    } finally {
      setSyncing(false);
      void refetchFreshness();
    }
  }, [refetchAfterSync, refetchFreshness]);

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
    async (taskId: string, body: string): Promise<ActionResult> => {
      const inserted = await supabase
        .from("comments")
        .insert({ organization_id: organizationId, task_id: taskId, profile_id: viewer.id, body })
        .select()
        .single();
      if (inserted.error) {
        return { ok: false, message: "Der Kommentar konnte nicht gespeichert werden." };
      }
      const row = inserted.data as CommentRow;
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

  const anchor = useMemo(() => {
    if (dataSource?.data_available_until) return dataSource.data_available_until;
    if (snapshots.length > 0) return snapshots[snapshots.length - 1].date;
    return addDaysIso(new Date().toISOString().slice(0, 10), -1);
  }, [dataSource, snapshots]);

  const derived = useMemo(() => {
    const { current, previous } = buildRanges(days, anchor);
    const productPageIds = new Set(productPages.map((p) => p.id));
    const filter: MetricFilter = { device, pageId: pageFilter, productPageIds };
    const isFiltered = device !== "all" || pageFilter !== "all";

    const series = isFiltered
      ? metricSeries(metrics, current, filter)
      : snapshotSeries(snapshots, current);
    const previousSeries = isFiltered
      ? metricSeries(metrics, previous, filter)
      : snapshotSeries(snapshots, previous);
    const targetLine = targetSeries(targets, current);

    const currentSum = sumSeries(series);
    const previousSum = sumSeries(previousSeries);
    const stats = pageStats(metrics, init.pages, current, previous, device);
    const findings = buildFindings(stats, days);
    const queries = queryStats(metrics, init.pages, current, previous, filter);

    const latestSnapshot = latestValue(snapshotSeries(snapshots, current));
    const activeTarget = targetForDate(targets, anchor);
    const avgDaily = currentSum / days;
    const progressPct =
      activeTarget && Number(activeTarget.target_value) > 0
        ? (avgDaily / Number(activeTarget.target_value)) * 100
        : null;

    return {
      currentRange: current,
      previousRange: previous,
      isFiltered,
      series,
      previousSeries,
      targetLine,
      currentSum,
      previousSum,
      periodDeltaPct: deltaPct(currentSum, previousSum),
      latestSnapshot,
      activeTarget,
      progressPct,
      stats,
      findings,
      queries,
    };
  }, [days, anchor, device, pageFilter, metrics, snapshots, targets, productPages, init.pages]);

  const kpiTasks = useMemo(() => {
    if (!kpi) return [];
    const linked = new Set(taskLinks.filter((l) => l.kpi_definition_id === kpi.id).map((l) => l.task_id));
    return tasks.filter((t) => linked.has(t.id) || t.kpi_definition_id === kpi.id);
  }, [tasks, taskLinks, kpi]);

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
    pages: init.pages,
    productPages,
    dataSource,
    snapshots,
    targets,
    metrics,
    tasks,
    approvals,
    annotations,
    commentsByTask,
    activityByTask,
    realtime,
    checkingFreshness,
    syncing,
    syncMessage,
    days,
    device,
    pageFilter,
    setDays,
    setDevice,
    setPageFilter,
    anchor,
    ...derived,
    kpiTasks,
    activeTaskCount,
    latestApprovalByTask,
    canWrite,
    canSync,
    canEditTarget,
    kpiDrawerOpen,
    setKpiDrawerOpen,
    taskDrawerId,
    setTaskDrawerId,
    createDraft,
    createNonce,
    openCreate,
    closeCreate,
    runSync,
    createTask,
    updateTask,
    loadComments,
    addComment,
    loadActivity,
    requestApproval,
    decideApproval,
    createAnnotation,
    updateAnnotation,
    setNewTarget,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
