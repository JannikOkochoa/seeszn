"use client";

// ─── Maßnahmen ────────────────────────────────────────────────────────────────
// Priorisierte Handlungskarten statt Tabellenzeilen: jede Karte zeigt genau das
// Nötige – Titel, warum sie zählt, Seite, Owner, Status und den nächsten
// Schritt. Oben nur ein schmaler Statusfilter und eine dominante Primäraktion.
// Sortiert nach Dringlichkeit (überfällig, dann Priorität), damit das Wichtige
// oben steht. Die ganze Karte öffnet den Detail-Drawer.

import { useMemo, useState } from "react";
import {
  TASK_STATUS_LABEL,
  type TaskRow,
  type TaskStatus,
} from "@/lib/kpi/types";
import { displayName, formatDate, formatDateTime } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

type StatusFilter = "active" | "overdue" | "all";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "active", label: "Aktive" },
  { key: "overdue", label: "Überfällig" },
  { key: "all", label: "Alle" },
];

// Der nächste Schritt ergibt sich deterministisch aus dem Status – kein
// erfundener Inhalt, sondern die naheliegende Handlung zur aktuellen Phase.
const NEXT_STEP_BY_STATUS: Record<TaskStatus, string> = {
  open: "Bearbeitung einplanen",
  in_progress: "Umsetzung weiterführen",
  waiting_for_approval: "Freigabe bei Klühspies einholen",
  live: "Wirkung beobachten",
  measuring: "Ergebnis auswerten",
  closed: "Abgeschlossen",
};

const PRIORITY_RANK: Record<TaskRow["priority"], number> = { high: 0, medium: 1, low: 2 };

export default function TaskList() {
  const {
    kpiTasks,
    profiles,
    pages,
    setTaskDrawerId,
    canWrite,
    isAdmin,
    deletedTasks,
    restoreTask,
    openCreate,
    anchor,
  } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [showDeleted, setShowDeleted] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = (t: TaskRow) =>
    t.due_date !== null && t.due_date < today && t.status !== "closed";

  const rows = useMemo(() => {
    const filtered = kpiTasks.filter((t) => {
      if (statusFilter === "active") return t.status !== "closed";
      if (statusFilter === "overdue") return isOverdue(t);
      return true;
    });
    // Dringlichstes zuerst: überfällig, dann Priorität, dann Fälligkeit.
    return [...filtered].sort((a, b) => {
      const oa = isOverdue(a) ? 0 : 1;
      const ob = isOverdue(b) ? 0 : 1;
      if (oa !== ob) return oa - ob;
      if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority])
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return b.created_at.localeCompare(a.created_at);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiTasks, statusFilter, today]);

  return (
    <div className="kw-tasklist">
      <div className="kw-tasks-bar">
        <div className="kw-tasks-filter" role="group" aria-label="Maßnahmen filtern">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className="kw-chip"
              data-active={statusFilter === f.key || undefined}
              aria-pressed={statusFilter === f.key}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
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
              ? "Noch keine Maßnahmen. Die erste entsteht am besten direkt aus einer Beobachtung oben."
              : statusFilter === "overdue"
                ? "Nichts ist überfällig."
                : "Keine Maßnahmen in dieser Auswahl."}
          </p>
        </div>
      ) : (
        <ul className="kw-cards">
          {rows.map((t) => {
            const owner = profiles.find((p) => p.id === t.owner_id);
            const page = pages.find((p) => p.id === t.page_id);
            const overdue = isOverdue(t);
            const pending = t.id.startsWith("temp-");
            const context =
              t.insight_context?.observation?.trim() || t.description?.trim() || null;
            const statusState =
              t.status === "live" || t.status === "closed"
                ? "done"
                : t.status === "waiting_for_approval"
                  ? "open"
                  : undefined;

            return (
              <li
                key={t.id}
                className="kw-card"
                data-overdue={overdue || undefined}
                data-priority={t.priority}
                data-pending={pending || undefined}
              >
                <div className="kw-card-head">
                  <button
                    type="button"
                    className="kw-card-open"
                    onClick={() => !pending && setTaskDrawerId(t.id)}
                    disabled={pending}
                    aria-label={`${t.title} – Details öffnen`}
                  >
                    <span className="kw-card-title">{t.title}</span>
                  </button>
                  <span className="kw-card-flags">
                    {t.priority === "high" && <span className="kw-card-flag">Priorität hoch</span>}
                    {overdue && (
                      <span className="kw-card-flag kw-card-flag--overdue">
                        Überfällig seit {formatDate(t.due_date as string)}
                      </span>
                    )}
                    {pending && <span className="kw-card-flag">wird gespeichert…</span>}
                  </span>
                </div>

                {context && <p className="kw-card-context">{context}</p>}

                <dl className="kw-card-meta">
                  <div>
                    <dt className="kr-eyebrow">Seite</dt>
                    <dd>{page ? page.name : "Seitenübergreifend"}</dd>
                  </div>
                  <div>
                    <dt className="kr-eyebrow">Owner</dt>
                    <dd>{owner ? displayName(owner) : "Nicht zugewiesen"}</dd>
                  </div>
                  <div>
                    <dt className="kr-eyebrow">Status</dt>
                    <dd>
                      <span className="kr-status" data-state={statusState}>
                        <i className="olive-dot" aria-hidden="true" />
                        {TASK_STATUS_LABEL[t.status]}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="kr-eyebrow">Nächster Schritt</dt>
                    <dd>{NEXT_STEP_BY_STATUS[t.status]}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}

      <p className="kr-meta kw-tasks-foot">
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
            <ul className="kw-deleted-list">
              {deletedTasks.map((t) => {
                const deletedBy = profiles.find((p) => p.id === t.deleted_by);
                const page = pages.find((p) => p.id === t.page_id);
                return (
                  <li key={t.id} className="kw-deleted-row">
                    <div>
                      <span className="kw-card-title">{t.title}</span>
                      <span className="kr-meta">
                        Gelöscht von {displayName(deletedBy)}
                        {t.deleted_at ? ` am ${formatDateTime(t.deleted_at)}` : ""}
                        {t.deletion_reason ? ` · „${t.deletion_reason}“` : ""}
                        {page ? ` · ${page.name}` : ""}
                      </span>
                    </div>
                    <button type="button" className="kw-link" onClick={() => void restoreTask(t.id)}>
                      Wiederherstellen
                    </button>
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
