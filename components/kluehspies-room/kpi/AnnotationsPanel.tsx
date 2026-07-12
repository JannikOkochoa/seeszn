"use client";

// ─── Annotationen ─────────────────────────────────────────────────────────────
// Ereignis-Markierungen auf der KPI-Zeitachse: Liste unter dem Diagramm,
// erstellen und bearbeiten für berechtigte Rollen, Viewer liest nur.
// Realtime hält die Liste über Sessions synchron (Publication vorhanden).

import { useEffect, useRef, useState } from "react";
import type { AnnotationRow } from "@/lib/kpi/types";
import { displayName, formatDate } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

interface AnnotationsPanelProps {
  /** Von außen (Chart-Marker) angesteuerte Annotation. */
  focusId: string | null;
  onFocusHandled: () => void;
}

export default function AnnotationsPanel({ focusId, onFocusHandled }: AnnotationsPanelProps) {
  const {
    annotations,
    currentRange,
    canWrite,
    createAnnotation,
    updateAnnotation,
    profiles,
    kpiTasks,
    setTaskDrawerId,
    anchor,
  } = useWorkspace();

  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ date: anchor, title: "", description: "", linkedTaskId: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const inRange = annotations
    .filter((a) => a.date >= currentRange.from && a.date <= currentRange.to)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Chart-Marker geklickt: Eintrag öffnen und in Sicht bringen.
  useEffect(() => {
    if (!focusId) return;
    const frame = requestAnimationFrame(() => {
      setOpenId(focusId);
      onFocusHandled();
      listRef.current
        ?.querySelector<HTMLElement>(`[data-annotation="${focusId}"]`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusId, onFocusHandled]);

  function startCreate() {
    setForm({ date: anchor, title: "", description: "", linkedTaskId: "" });
    setEditingId(null);
    setCreating(true);
    setError(null);
  }

  function startEdit(a: AnnotationRow) {
    setForm({
      date: a.date,
      title: a.title,
      description: a.description ?? "",
      linkedTaskId: a.linked_task_id ?? "",
    });
    setCreating(false);
    setEditingId(a.id);
    setError(null);
  }

  async function save() {
    if (!form.title.trim()) {
      setError("Bitte einen Titel angeben.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = editingId
      ? await updateAnnotation(editingId, {
          date: form.date,
          title: form.title.trim(),
          description: form.description.trim() || null,
          linked_task_id: form.linkedTaskId || null,
        })
      : await createAnnotation({
          date: form.date,
          title: form.title.trim(),
          description: form.description.trim(),
          linkedTaskId: form.linkedTaskId || null,
        });
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setCreating(false);
    setEditingId(null);
  }

  const showForm = creating || editingId !== null;

  return (
    <div ref={listRef}>
      <div className="kw-section-tools">
        <p className="kr-meta">
          {inRange.length === 0
            ? "Keine Annotationen im gewählten Zeitraum."
            : `${inRange.length} Annotationen im Zeitraum, im Diagramm markiert.`}
        </p>
        {canWrite && !showForm && (
          <button type="button" className="kw-link" onClick={startCreate}>
            Annotation ergänzen
          </button>
        )}
      </div>

      {showForm && (
        <div className="kw-form kw-form--inline">
          <div className="kw-form-row">
            <label className="kw-field">
              <span className="kr-eyebrow">Datum</span>
              <input
                type="date"
                className="kw-input"
                value={form.date}
                max={anchor}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </label>
            <label className="kw-field kw-field--grow">
              <span className="kr-eyebrow">Titel</span>
              <input
                type="text"
                className="kw-input"
                data-autofocus
                placeholder="z. B. Interne Verlinkung ergänzt"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
          </div>
          <label className="kw-field">
            <span className="kr-eyebrow">Beschreibung (optional)</span>
            <textarea
              className="kw-input kw-textarea"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label className="kw-field">
            <span className="kr-eyebrow">Verknüpfte Maßnahme (optional)</span>
            <select
              className="kw-select"
              value={form.linkedTaskId}
              onChange={(e) => setForm((f) => ({ ...f, linkedTaskId: e.target.value }))}
            >
              <option value="">Keine Verknüpfung</option>
              {kpiTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p className="kw-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="kw-form-actions">
            <button type="button" className="kr-btn" onClick={() => void save()} disabled={saving}>
              {saving ? "Wird gespeichert…" : editingId ? "Änderung speichern" : "Annotation speichern"}
            </button>
            <button
              type="button"
              className="kw-link"
              onClick={() => {
                setCreating(false);
                setEditingId(null);
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {inRange.length > 0 && (
        <ul className="kw-ann-list">
          {inRange.map((a) => {
            const author = profiles.find((p) => p.id === a.created_by);
            const linkedTask = a.linked_task_id ? kpiTasks.find((t) => t.id === a.linked_task_id) : null;
            const open = openId === a.id;
            return (
              <li key={a.id} className="kw-ann-item" data-annotation={a.id} data-open={open || undefined}>
                <button
                  type="button"
                  className="kw-ann-toggle"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : a.id)}
                >
                  <span className="kw-ann-date">{formatDate(a.date)}</span>
                  <span className="kw-ann-title">{a.title}</span>
                </button>
                {open && (
                  <div className="kw-ann-detail">
                    {a.description && <p className="kr-body">{a.description}</p>}
                    <p className="kr-meta">Erfasst von {displayName(author)}</p>
                    <div className="kw-ann-actions">
                      {linkedTask && (
                        <button
                          type="button"
                          className="kw-link"
                          onClick={() => setTaskDrawerId(linkedTask.id)}
                        >
                          Verknüpfte Maßnahme öffnen: {linkedTask.title}
                        </button>
                      )}
                      {canWrite && (
                        <button type="button" className="kw-link" onClick={() => startEdit(a)}>
                          Bearbeiten
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
