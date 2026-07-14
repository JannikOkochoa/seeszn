"use client";

// ─── Content & Authority (sekundäre KPI-Gruppe) ───────────────────────────────
// Genau zwei operative KPIs: Blogartikel (Ziel 1 pro Kalenderwoche) und Reddit
// (Ziel 1 pro Kalendermonat). Fehlende Werte zeigen ehrlich „Noch nicht
// erfasst". Der spätere Blogwert (2/Woche) ist nur ein Hinweis, kein aktives
// Ziel. Manuell gepflegt; keine automatische Reddit-Verbindung.

import { useState } from "react";
import { computeGoalStatus, specForMetricKey } from "@/lib/kpi/goals";
import { deriveContentAuthority } from "@/lib/kpi/operational";
import { displayName, formatDateTime } from "@/lib/kpi/format";
import { useWorkspace } from "../workspace";

function statusLabel(value: number | null, goal: number | null): string {
  if (value === null) return "Noch nicht erfasst";
  const blogSpec = specForMetricKey("blog_posts_published");
  if (goal === null || !blogSpec) return `${value} erfasst`;
  const s = computeGoalStatus(value, { targetValue: goal, comparator: "at_least" }, blogSpec, {
    hasEnoughData: true,
  });
  return s.statusLabel;
}

function EditForm({ onDone }: { onDone: () => void }) {
  const { updateContentAuthority } = useWorkspace();
  const [blog, setBlog] = useState("");
  const [reddit, setReddit] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const blogNum = blog.trim() === "" ? null : Number(blog);
    const redditNum = reddit.trim() === "" ? null : Number(reddit);
    if (blogNum !== null && (!Number.isFinite(blogNum) || blogNum < 0)) {
      setError("Bitte eine gültige Zahl für Blogartikel angeben, oder leer lassen.");
      return;
    }
    if (redditNum !== null && (!Number.isFinite(redditNum) || redditNum < 0)) {
      setError("Bitte eine gültige Zahl für Reddit angeben, oder leer lassen.");
      return;
    }
    if (blogNum === null && redditNum === null) {
      setError("Bitte mindestens einen Wert angeben.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await updateContentAuthority({
      blogThisWeek: blogNum,
      redditThisMonth: redditNum,
      note: note.trim() || null,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onDone();
  }

  return (
    <div className="kw-form kw-form--inline">
      <div className="kw-form-row">
        <label className="kw-field">
          <span className="kr-eyebrow">Blogartikel diese Woche</span>
          <input
            type="text"
            inputMode="numeric"
            className="kw-input"
            value={blog}
            onChange={(e) => setBlog(e.target.value)}
            placeholder="Leer lassen, falls noch nicht erfasst"
          />
        </label>
        <label className="kw-field">
          <span className="kr-eyebrow">Qualifizierte Reddit-Beiträge diesen Monat</span>
          <input
            type="text"
            inputMode="numeric"
            className="kw-input"
            value={reddit}
            onChange={(e) => setReddit(e.target.value)}
            placeholder="Leer lassen, falls noch nicht erfasst"
          />
        </label>
      </div>
      <label className="kw-field">
        <span className="kr-eyebrow">Notiz (optional)</span>
        <input
          type="text"
          className="kw-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="z. B. Titel des Beitrags"
        />
      </label>
      {error && (
        <p className="kw-form-error" role="alert">
          {error}
        </p>
      )}
      <div className="kw-form-actions">
        <button type="button" className="kr-btn" onClick={() => void submit()} disabled={saving}>
          {saving ? "Wird gespeichert…" : "Werte speichern"}
        </button>
        <button type="button" className="kw-link" onClick={onDone} disabled={saving}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

export default function ContentAuthority() {
  const { manualKpis, manualCheckIns, goalVersions, canEditTarget, profiles } = useWorkspace();
  const [editing, setEditing] = useState(false);

  const model = deriveContentAuthority(
    manualKpis,
    manualCheckIns,
    goalVersions,
    new Date().toISOString().slice(0, 10),
  );
  const updater = model.updatedById ? profiles.find((p) => p.id === model.updatedById) : undefined;

  if (!model.configured) {
    return (
      <section className="kw-ex-content" aria-label="Content & Authority">
        <p className="kr-eyebrow kw-ex-panel-label">Content &amp; Authority</p>
        <p className="kr-meta">Noch nicht eingerichtet. Die operativen Ziele werden einmalig angelegt.</p>
      </section>
    );
  }

  return (
    <section className="kw-ex-content" aria-label="Content & Authority">
      <p className="kr-eyebrow kw-ex-panel-label">Content &amp; Authority</p>

      {editing ? (
        <EditForm onDone={() => setEditing(false)} />
      ) : (
        <>
          <ul className="kw-ex-content-list">
            <li>
              <span className="kw-ex-content-name">Blogartikel</span>
              <span className="kr-meta kw-ex-content-line">
                {statusLabel(model.blog.value, model.blog.goal)} · Ziel {model.blog.goal ?? 1} pro Woche
              </span>
              <span className="kr-meta kw-ex-content-hint">
                Nach Veröffentlichung der neuen Blogseite: 2 Beiträge pro Woche.
              </span>
            </li>
            <li>
              <span className="kw-ex-content-name">Reddit</span>
              <span className="kr-meta kw-ex-content-line">
                {statusLabel(model.reddit.value, model.reddit.goal)} · Ziel {model.reddit.goal ?? 1} pro Monat
              </span>
            </li>
          </ul>
          {model.updatedAt && (
            <p className="kr-meta kw-ex-review-source">
              Manuell gepflegt · aktualisiert von {displayName(updater)} am{" "}
              {formatDateTime(model.updatedAt)}
            </p>
          )}
          {canEditTarget && (
            <div className="kw-ex-review-actions">
              <button type="button" className="kw-link kw-ex-review-edit" onClick={() => setEditing(true)}>
                Werte aktualisieren
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
