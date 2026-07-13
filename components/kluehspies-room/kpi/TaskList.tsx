"use client";

// ─── Maßnahmenliste ───────────────────────────────────────────────────────────
// Ruhige Zeilen statt Karten: Titel, Owner, Priorität, Fälligkeit, Status und
// Freigabestand. Filter oben, jede Zeile öffnet den Task-Drawer. Überfällige
// Aufgaben werden klar, aber unaufgeregt markiert.

import { useMemo, useState } from "react";
import {
  APPROVAL_STATUS_LABEL,
  COMPANY_LABEL,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type MemberCompany,
  type TaskPriority,
  type TaskRow,
  type TaskStatus,
} from "@/lib/kpi/types";
import { displayName, formatDate, formatDateTime } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

type DueFilter = "all" | "overdue" | "week";

export default function TaskList() {
  const {
    kpiTasks,
    profiles,
    members,
    pages,
    latestApprovalByTask,
    setTaskDrawerId,
    canWrite,
    isAdmin,
    deletedTasks,
    restoreTask,
    openCreate,
    anchor,
  } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all" | "active">("active");
  const [showDeleted, setShowDeleted] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [pageFilterLocal, setPageFilterLocal] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");

  const today = new Date().toISOString().slice(0, 10);
  const weekAhead = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }, []);

  const rows = useMemo(() => {
    return kpiTasks.filter((t) => {
      if (statusFilter === "active") {
        if (t.status === "closed") return false;
      } else if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (ownerFilter === "none" && t.owner_id !== null) return false;
      if (ownerFilter !== "all" && ownerFilter !== "none" && t.owner_id !== ownerFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (pageFilterLocal !== "all" && t.page_id !== pageFilterLocal) return false;
      if (approvalFilter !== "all") {
        const latest = latestApprovalByTask.get(t.id);
        if (approvalFilter === "none" && latest) return false;
        if (approvalFilter !== "none" && latest?.status !== approvalFilter) return false;
      }
      if (dueFilter === "overdue" && (!t.due_date || t.due_date >= today || t.status === "closed"))
        return false;
      if (dueFilter === "week" && (!t.due_date || t.due_date < today || t.due_date > weekAhead))
        return false;
      return true;
    });
  }, [
    kpiTasks,
    statusFilter,
    ownerFilter,
    priorityFilter,
    pageFilterLocal,
    approvalFilter,
    dueFilter,
    latestApprovalByTask,
    today,
    weekAhead,
  ]);

  const isOverdue = (t: TaskRow) => t.due_date !== null && t.due_date < today && t.status !== "closed";

  return (
    <div className="kw-tasklist">
      <div className="kw-task-filters">
        <label className="kw-field-compact">
          <span className="kw-bar-label">Status</span>
          <select
            className="kw-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all" | "active")}
          >
            <option value="active">Aktive</option>
            <option value="all">Alle</option>
            {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="kw-field-compact">
          <span className="kw-bar-label">Owner</span>
          <select className="kw-select" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
            <option value="all">Alle</option>
            <option value="none">Nicht zugewiesen</option>
            {(["seeszn", "kluehspies"] as MemberCompany[]).map((company) => {
              const options = members
                .filter(
                  (m) =>
                    m.company === company &&
                    (m.status === "active" || m.status === "invited"),
                )
                .sort((a, b) => displayName(a).localeCompare(displayName(b), "de"));
              if (options.length === 0) return null;
              return (
                <optgroup key={company} label={COMPANY_LABEL[company]}>
                  {options.map((m) => (
                    <option key={m.profile_id} value={m.profile_id}>
                      {displayName(m)}
                      {m.status === "invited" ? " (eingeladen)" : ""}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </label>
        <label className="kw-field-compact">
          <span className="kw-bar-label">Priorität</span>
          <select
            className="kw-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
          >
            <option value="all">Alle</option>
            {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="kw-field-compact">
          <span className="kw-bar-label">Seite</span>
          <select
            className="kw-select"
            value={pageFilterLocal}
            onChange={(e) => setPageFilterLocal(e.target.value)}
          >
            <option value="all">Alle</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="kw-field-compact">
          <span className="kw-bar-label">Freigabe</span>
          <select
            className="kw-select"
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
          >
            <option value="all">Alle</option>
            <option value="none">Ohne Freigaberunde</option>
            <option value="requested">{APPROVAL_STATUS_LABEL.requested}</option>
            <option value="approved">{APPROVAL_STATUS_LABEL.approved}</option>
            <option value="changes_requested">{APPROVAL_STATUS_LABEL.changes_requested}</option>
            <option value="withdrawn">{APPROVAL_STATUS_LABEL.withdrawn}</option>
          </select>
        </label>
        <label className="kw-field-compact">
          <span className="kw-bar-label">Fälligkeit</span>
          <select
            className="kw-select"
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value as DueFilter)}
          >
            <option value="all">Alle</option>
            <option value="overdue">Überfällig</option>
            <option value="week">Nächste 7 Tage</option>
          </select>
        </label>
        <div className="kw-bar-spacer" />
        {canWrite && (
          <button
            type="button"
            className="kr-btn"
            onClick={() => openCreate({ source: "kpi", observation: undefined })}
          >
            Maßnahme erstellen
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="kw-empty-block">
          <p className="kr-meta">
            {kpiTasks.length === 0
              ? "Noch keine Maßnahmen zu diesem KPI. Die erste Maßnahme entsteht am besten direkt aus einer Erkenntnis im KPI-Detail."
              : "Keine Maßnahmen für diese Filter."}
          </p>
        </div>
      ) : (
        <ul className="kw-task-rows">
          {rows.map((t) => {
            const owner = profiles.find((p) => p.id === t.owner_id);
            const page = pages.find((p) => p.id === t.page_id);
            const latest = latestApprovalByTask.get(t.id);
            const overdue = isOverdue(t);
            const pending = t.id.startsWith("temp-");
            return (
              <li key={t.id} className="kw-task-row" data-overdue={overdue || undefined}>
                <button
                  type="button"
                  className="kw-task-open"
                  onClick={() => !pending && setTaskDrawerId(t.id)}
                  disabled={pending}
                >
                  <span className="kw-task-title">
                    {t.title}
                    {pending && <span className="kr-meta"> · wird gespeichert…</span>}
                  </span>
                  <span className="kw-task-meta">
                    <span
                      className="kr-status"
                      data-state={
                        t.status === "live" || t.status === "closed"
                          ? "done"
                          : t.status === "waiting_for_approval"
                            ? "open"
                            : undefined
                      }
                    >
                      <i className="olive-dot" aria-hidden="true" />
                      {TASK_STATUS_LABEL[t.status]}
                    </span>
                    <span className="kw-task-sep" aria-hidden="true">
                      ·
                    </span>
                    <span>{owner ? displayName(owner) : "Nicht zugewiesen"}</span>
                    <span className="kw-task-sep" aria-hidden="true">
                      ·
                    </span>
                    <span data-priority={t.priority}>Priorität {TASK_PRIORITY_LABEL[t.priority].toLowerCase()}</span>
                    {page && (
                      <>
                        <span className="kw-task-sep" aria-hidden="true">
                          ·
                        </span>
                        <span>{page.name}</span>
                      </>
                    )}
                    {t.due_date && (
                      <>
                        <span className="kw-task-sep" aria-hidden="true">
                          ·
                        </span>
                        <span className="kw-task-due" data-overdue={overdue || undefined}>
                          {overdue ? "Überfällig seit " : "Fällig "}
                          {formatDate(t.due_date)}
                        </span>
                      </>
                    )}
                    {latest && (
                      <>
                        <span className="kw-task-sep" aria-hidden="true">
                          ·
                        </span>
                        <span data-approval={latest.status}>{APPROVAL_STATUS_LABEL[latest.status]}</span>
                      </>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="kr-meta kw-task-foot">
        Stand {formatDate(anchor)} · Maßnahmen, Kommentare und Freigaben werden live synchronisiert.
      </p>

      {/* SEESZN-Admin-Ansicht: soft-gelöschte Maßnahmen einsehen und
          wiederherstellen. Für Editor/Viewer nicht sichtbar. */}
      {isAdmin && deletedTasks.length > 0 && (
        <div className="kw-deleted-block">
          <button
            type="button"
            className="kw-link"
            aria-expanded={showDeleted}
            onClick={() => setShowDeleted((v) => !v)}
          >
            Gelöschte Maßnahmen ({deletedTasks.length}) {showDeleted ? "ausblenden" : "anzeigen"}
          </button>
          {showDeleted && (
            <ul className="kw-task-rows kw-deleted-rows">
              {deletedTasks.map((t) => {
                const deletedBy = profiles.find((p) => p.id === t.deleted_by);
                const page = pages.find((p) => p.id === t.page_id);
                return (
                  <li key={t.id} className="kw-task-row">
                    <div className="kw-deleted-row">
                      <div>
                        <span className="kw-task-title">{t.title}</span>
                        <span className="kw-task-meta">
                          <span>
                            Gelöscht von {displayName(deletedBy)}
                            {t.deleted_at ? ` am ${formatDateTime(t.deleted_at)}` : ""}
                          </span>
                          {t.deletion_reason && (
                            <>
                              <span className="kw-task-sep" aria-hidden="true">
                                ·
                              </span>
                              <span>„{t.deletion_reason}“</span>
                            </>
                          )}
                          {page && (
                            <>
                              <span className="kw-task-sep" aria-hidden="true">
                                ·
                              </span>
                              <span>{page.name}</span>
                            </>
                          )}
                        </span>
                      </div>
                      <button type="button" className="kw-link" onClick={() => void restoreTask(t.id)}>
                        Wiederherstellen
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
