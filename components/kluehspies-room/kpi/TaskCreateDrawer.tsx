"use client";

// ─── Maßnahme aus Erkenntnis ──────────────────────────────────────────────────
// Minimalistisches Erstellformular als zweite Drawer-Ebene. KPI, Seite,
// Zeitraum, Gerät, Query und Ausgangsmetriken werden aus der Erkenntnis
// vorbefüllt; die Statuswerte kommen aus dem Backend-Modell.

import { useState } from "react";
import Drawer from "./Drawer";
import {
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type LevelDe,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/kpi/types";
import { displayName, formatDate, formatNumber } from "@/lib/kpi/format";
import { useWorkspace, type TaskDraft } from "./workspace";

const SOURCE_LABEL: Record<string, string> = {
  kpi: "Aus dem KPI-Kopf",
  page: "Aus einer Produktseite",
  winner: "Aus einem Gewinner",
  loser: "Aus einem Verlierer",
  query: "Aus einer Suchanfrage",
  device: "Aus einer Geräteabweichung",
  annotation: "Aus einer Annotation",
};

const DEVICE_LABEL: Record<string, string> = { MOBILE: "Mobil", DESKTOP: "Desktop" };
const LEVELS: LevelDe[] = ["niedrig", "mittel", "hoch"];

export default function TaskCreateDrawer() {
  const { createDraft, createNonce, canWrite } = useWorkspace();
  if (createDraft === null || !canWrite) return null;
  // key erzwingt bei jedem Öffnen ein frisches, aus der Erkenntnis
  // vorbefülltes Formular ohne Reset-Effekte.
  return <CreateForm key={createNonce} draft={createDraft} />;
}

function CreateForm({ draft }: { draft: TaskDraft }) {
  const { closeCreate, createTask, profiles, pages, kpi, currentRange } = useWorkspace();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(draft.observation ?? "");
  const [pageId, setPageId] = useState<string>(draft.pageId ?? "");
  const [ownerId, setOwnerId] = useState<string>("");
  const [priority, setPriority] = useState<TaskPriority>(
    draft.source === "loser" || draft.source === "device" ? "high" : "medium",
  );
  const [status, setStatus] = useState<TaskStatus>("open");
  const [dueDate, setDueDate] = useState("");
  const [impact, setImpact] = useState<LevelDe>("mittel");
  const [effort, setEffort] = useState<LevelDe>("mittel");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const createDraft = draft;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Bitte einen Titel angeben.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await createTask({
      title: title.trim(),
      description: description.trim(),
      pageId: pageId || null,
      ownerId: ownerId || null,
      priority,
      status,
      dueDate: dueDate || null,
      expectedImpact: impact,
      estimatedEffort: effort,
      requestApproval: needsApproval,
      insight: {
        source: createDraft.source,
        observation: createDraft.observation,
        pageUrl: createDraft.pageUrl,
        query: createDraft.query,
        device: createDraft.device,
        period: { from: currentRange.from, to: currentRange.to },
        metrics: createDraft.metrics,
      },
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    closeCreate();
  }

  return (
    <Drawer
      open
      onClose={closeCreate}
      layer={2}
      title={
        <div>
          <span className="kr-eyebrow">{SOURCE_LABEL[createDraft.source] ?? "Neue Maßnahme"}</span>
          <span className="kw-drawer-name">Maßnahme erstellen</span>
        </div>
      }
    >
      <form onSubmit={submit} className="kw-form">
        {/* Erkenntniskontext, unveränderlich mitgespeichert */}
        <div className="kw-insight">
          <span className="kr-eyebrow">Erkenntnis</span>
          {createDraft.observation ? (
            <p className="kr-body">{createDraft.observation}</p>
          ) : (
            <p className="kr-meta">Ohne konkrete Einzelbeobachtung, direkt am KPI erstellt.</p>
          )}
          <p className="kr-meta">
            KPI: {kpi?.name ?? "–"} · Zeitraum {formatDate(currentRange.from)} bis{" "}
            {formatDate(currentRange.to)}
            {createDraft.device && <> · Gerät {DEVICE_LABEL[createDraft.device] ?? createDraft.device}</>}
            {createDraft.query && <> · Query „{createDraft.query}“</>}
            {createDraft.metrics?.clicks !== undefined && (
              <>
                {" "}
                · Ausgangswert {formatNumber(createDraft.metrics.clicks)} Klicks
                {createDraft.metrics.previousClicks !== undefined &&
                  ` (Vorperiode ${formatNumber(createDraft.metrics.previousClicks)})`}
              </>
            )}
          </p>
        </div>

        <label className="kw-field">
          <span className="kr-eyebrow">Titel</span>
          <input
            type="text"
            className="kw-input"
            data-autofocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. Mobile Darstellung der Hamburg-Seite prüfen"
            required
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

        <div className="kw-form-row">
          <label className="kw-field">
            <span className="kr-eyebrow">Produktseite</span>
            <select className="kw-select" value={pageId} onChange={(e) => setPageId(e.target.value)}>
              <option value="">Keine Seite</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="kw-field">
            <span className="kr-eyebrow">Owner</span>
            <select className="kw-select" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">Später zuweisen</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {displayName(p)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="kw-form-row">
          <label className="kw-field">
            <span className="kr-eyebrow">Priorität</span>
            <select
              className="kw-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="kw-field">
            <span className="kr-eyebrow">Status</span>
            <select
              className="kw-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              disabled={needsApproval}
            >
              {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="kw-field">
            <span className="kr-eyebrow">Fälligkeit</span>
            <input
              type="date"
              className="kw-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
        </div>

        <div className="kw-form-row">
          <label className="kw-field">
            <span className="kr-eyebrow">Erwarteter Impact</span>
            <select className="kw-select" value={impact} onChange={(e) => setImpact(e.target.value as LevelDe)}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="kw-field">
            <span className="kr-eyebrow">Geschätzter Aufwand</span>
            <select className="kw-select" value={effort} onChange={(e) => setEffort(e.target.value as LevelDe)}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="kw-check">
          <input
            type="checkbox"
            checked={needsApproval}
            onChange={(e) => setNeedsApproval(e.target.checked)}
          />
          <span>
            Freigabe erforderlich
            <span className="kr-meta kw-check-note">
              Eröffnet direkt eine Freigaberunde; der Status wechselt auf „Wartet auf Freigabe“.
            </span>
          </span>
        </label>

        {error && (
          <p className="kw-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="kw-form-actions kw-form-actions--end">
          <button type="button" className="kw-link" onClick={closeCreate}>
            Abbrechen
          </button>
          <button type="submit" className="kr-btn" disabled={saving}>
            {saving ? "Wird gespeichert…" : "Maßnahme speichern"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
