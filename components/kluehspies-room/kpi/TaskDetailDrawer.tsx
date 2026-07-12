"use client";

// ─── Task-Detail-Drawer ───────────────────────────────────────────────────────
// Eine Maßnahme im Ganzen: Felder mit kontrollierten Editierzuständen
// (optimistisch mit Serverabgleich und Rollback), Erkenntniskontext,
// Kommentare, Freigaben, Annotationen und Aktivitätsverlauf. Die
// unveränderlichen Erstellerfelder sind nur lesend dargestellt.

import { useState } from "react";
import Drawer from "./Drawer";
import CommentThread from "./CommentThread";
import ApprovalPanel from "./ApprovalPanel";
import ActivityTimeline from "./ActivityTimeline";
import {
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type TaskPriority,
  type TaskRow,
  type TaskStatus,
} from "@/lib/kpi/types";
import { displayName, formatDate, formatDateTime, formatNumber } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

const DEVICE_LABEL: Record<string, string> = { MOBILE: "Mobil", DESKTOP: "Desktop" };

export default function TaskDetailDrawer() {
  const { tasks, taskDrawerId } = useWorkspace();
  const task = tasks.find((t) => t.id === taskDrawerId) ?? null;
  if (!task) return null;
  // key sorgt beim Taskwechsel für frische Editierzustände.
  return <TaskDetail key={task.id} task={task} />;
}

function TaskDetail({ task }: { task: TaskRow }) {
  const { setTaskDrawerId, profiles, pages, annotations, updateTask, canWrite, kpi } = useWorkspace();

  const [editingText, setEditingText] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const creator = profiles.find((p) => p.id === task.created_by);
  const page = pages.find((p) => p.id === task.page_id);
  const insight = task.insight_context;
  const linkedAnnotations = annotations.filter((a) => a.linked_task_id === task.id);

  async function patch(fields: Parameters<typeof updateTask>[1]) {
    if (!task) return;
    setSaving(true);
    setError(null);
    const result = await updateTask(task.id, fields);
    setSaving(false);
    if (!result.ok) setError(result.message);
    return result;
  }

  async function saveText() {
    if (!title.trim()) {
      setError("Der Titel darf nicht leer sein.");
      return;
    }
    const result = await patch({ title: title.trim(), description: description.trim() || null });
    if (result?.ok) setEditingText(false);
  }

  return (
    <Drawer
      open
      onClose={() => setTaskDrawerId(null)}
      title={
        <div>
          <span className="kr-eyebrow">Maßnahme · {kpi?.name ?? "KPI"}</span>
          <span className="kw-drawer-name">{task.title}</span>
        </div>
      }
    >
      {/* Kopf: Titel und Beschreibung */}
      <section className="kw-dsection kw-dsection--head" aria-label="Beschreibung">
        {editingText ? (
          <div className="kw-form">
            <label className="kw-field">
              <span className="kr-eyebrow">Titel</span>
              <input
                type="text"
                className="kw-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-autofocus
              />
            </label>
            <label className="kw-field">
              <span className="kr-eyebrow">Beschreibung</span>
              <textarea
                className="kw-input kw-textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <div className="kw-form-actions">
              <button type="button" className="kr-btn" onClick={() => void saveText()} disabled={saving}>
                {saving ? "Wird gespeichert…" : "Speichern"}
              </button>
              <button type="button" className="kw-link" onClick={() => setEditingText(false)}>
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <>
            {task.description ? (
              <p className="kr-body kw-task-desc">{task.description}</p>
            ) : (
              <p className="kr-meta">Keine Beschreibung hinterlegt.</p>
            )}
            {canWrite && (
              <button
                type="button"
                className="kw-link"
                onClick={() => {
                  setTitle(task.title);
                  setDescription(task.description ?? "");
                  setEditingText(true);
                }}
              >
                Titel und Beschreibung bearbeiten
              </button>
            )}
          </>
        )}
        <p className="kr-meta kw-task-created">
          Angelegt von {displayName(creator)} am {formatDateTime(task.created_at)} · Ersteller ist
          unveränderlich
        </p>
        {error && (
          <p className="kw-form-error" role="alert">
            {error}
          </p>
        )}
      </section>

      {/* Stammfelder */}
      <section className="kw-dsection" aria-label="Eigenschaften">
        <div className="kw-props">
          <label className="kw-field">
            <span className="kr-eyebrow">Status</span>
            <select
              className="kw-select"
              value={task.status}
              disabled={!canWrite || saving}
              onChange={(e) => void patch({ status: e.target.value as TaskStatus })}
            >
              {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="kw-field">
            <span className="kr-eyebrow">Owner</span>
            <select
              className="kw-select"
              value={task.owner_id ?? ""}
              disabled={!canWrite || saving}
              onChange={(e) => void patch({ owner_id: e.target.value || null })}
            >
              <option value="">Nicht zugewiesen</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {displayName(p)}
                </option>
              ))}
            </select>
          </label>
          <label className="kw-field">
            <span className="kr-eyebrow">Priorität</span>
            <select
              className="kw-select"
              value={task.priority}
              disabled={!canWrite || saving}
              onChange={(e) => void patch({ priority: e.target.value as TaskPriority })}
            >
              {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="kw-field">
            <span className="kr-eyebrow">Fälligkeit</span>
            <input
              type="date"
              className="kw-input"
              value={task.due_date ?? ""}
              disabled={!canWrite || saving}
              onChange={(e) => void patch({ due_date: e.target.value || null })}
            />
          </label>
          <label className="kw-field">
            <span className="kr-eyebrow">Produktseite</span>
            <select
              className="kw-select"
              value={task.page_id ?? ""}
              disabled={!canWrite || saving}
              onChange={(e) => void patch({ page_id: e.target.value || null })}
            >
              <option value="">Keine Seite</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <div className="kw-field">
            <span className="kr-eyebrow">Einschätzung</span>
            <span className="kw-prop-static">
              {insight?.expectedImpact ? `Impact ${insight.expectedImpact}` : "Impact offen"} ·{" "}
              {insight?.estimatedEffort ? `Aufwand ${insight.estimatedEffort}` : "Aufwand offen"}
            </span>
          </div>
        </div>
        {!canWrite && (
          <p className="kr-meta kw-props-hint">
            Die Viewer-Rolle kann Maßnahmen einsehen, aber nicht verändern.
          </p>
        )}
      </section>

      {/* Erkenntniskontext */}
      {insight && (insight.observation || insight.query || insight.metrics) && (
        <section className="kw-dsection" aria-label="Erkenntniskontext">
          <div className="kw-dsection-head">
            <h3 className="kw-dsection-title">Erkenntnis</h3>
          </div>
          <div className="kw-insight kw-insight--plain">
            {insight.observation && <p className="kr-body">{insight.observation}</p>}
            <p className="kr-meta">
              {page && <>Seite: {page.name}</>}
              {insight.pageUrl && !page && <>Seite: {insight.pageUrl}</>}
              {insight.query && <> · Query „{insight.query}“</>}
              {insight.device && <> · Gerät {DEVICE_LABEL[insight.device] ?? insight.device}</>}
              {insight.period && (
                <>
                  {" "}
                  · Zeitraum {formatDate(insight.period.from)} bis {formatDate(insight.period.to)}
                </>
              )}
              {insight.metrics?.clicks !== undefined && (
                <>
                  {" "}
                  · Ausgangswert {formatNumber(insight.metrics.clicks)} Klicks
                  {insight.metrics.previousClicks !== undefined &&
                    ` (Vorperiode ${formatNumber(insight.metrics.previousClicks)})`}
                </>
              )}
            </p>
          </div>
        </section>
      )}

      {/* Freigaben */}
      <section className="kw-dsection" aria-label="Freigaben">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Freigaben</h3>
        </div>
        <ApprovalPanel taskId={task.id} />
      </section>

      {/* Annotationen */}
      {linkedAnnotations.length > 0 && (
        <section className="kw-dsection" aria-label="Verknüpfte Annotationen">
          <div className="kw-dsection-head">
            <h3 className="kw-dsection-title">Verknüpfte Annotationen</h3>
          </div>
          <ul className="kw-ann-list">
            {linkedAnnotations.map((a) => (
              <li key={a.id} className="kw-ann-item">
                <div className="kw-ann-toggle kw-ann-toggle--static">
                  <span className="kw-ann-date">{formatDate(a.date)}</span>
                  <span className="kw-ann-title">{a.title}</span>
                </div>
                {a.description && <p className="kr-meta kw-ann-inline-desc">{a.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Kommentare */}
      <section className="kw-dsection" aria-label="Kommentare">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Kommentare</h3>
        </div>
        <CommentThread taskId={task.id} />
      </section>

      {/* Aktivitätsverlauf */}
      <section className="kw-dsection kw-dsection--last" aria-label="Aktivitätsverlauf">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Aktivität</h3>
        </div>
        <ActivityTimeline taskId={task.id} />
      </section>
    </Drawer>
  );
}
