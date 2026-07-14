"use client";

// ─── Google-Präsenz (sekundäre KPI-Gruppe) ────────────────────────────────────
// Kompakte, manuell bestätigte Baseline (Profilaufrufe, Interaktionen,
// ungefährer Monatswert). KEIN erfundener Trend: bis zur zweiten Messung
// „Noch kein Vergleich verfügbar". Die vier Search-KPIs bleiben unberührt und
// dominant. Keine Google-Farben, keine Charts, keine Animationen.

import { useState } from "react";
import { deriveGooglePresence, PRESENCE_COMPARISON_DAYS } from "@/lib/kpi/operational";
import { displayName, formatDate, formatDateTime, formatNumber } from "@/lib/kpi/format";
import { useWorkspace } from "../workspace";

function EditForm({ measuredAt, onDone }: { measuredAt: string | null; onDone: () => void }) {
  const { updateGooglePresence } = useWorkspace();
  const today = new Date().toISOString().slice(0, 10);
  const [profileViews, setProfileViews] = useState("");
  const [interactions, setInteractions] = useState("");
  const [monthlyEstimate, setMonthlyEstimate] = useState("");
  const [measured, setMeasured] = useState(measuredAt ?? today);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const pv = Number(profileViews);
    const ia = Number(interactions);
    const mv = Number(monthlyEstimate);
    if (![pv, ia, mv].every((n) => Number.isFinite(n) && n >= 0)) {
      setError("Bitte gültige, nicht negative Zahlen für alle drei Werte angeben.");
      return;
    }
    if (!measured) {
      setError("Bitte ein Messdatum angeben.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await updateGooglePresence({
      profileViews: pv,
      interactions: ia,
      monthlyEstimate: mv,
      measuredAt: measured,
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
          <span className="kr-eyebrow">Profilaufrufe</span>
          <input
            type="text"
            inputMode="numeric"
            className="kw-input"
            value={profileViews}
            onChange={(e) => setProfileViews(e.target.value)}
            placeholder="2860"
          />
        </label>
        <label className="kw-field">
          <span className="kr-eyebrow">Interaktionen</span>
          <input
            type="text"
            inputMode="numeric"
            className="kw-input"
            value={interactions}
            onChange={(e) => setInteractions(e.target.value)}
            placeholder="1000"
          />
        </label>
      </div>
      <div className="kw-form-row">
        <label className="kw-field">
          <span className="kr-eyebrow">Monatliche Aufrufe (ungefähr)</span>
          <input
            type="text"
            inputMode="numeric"
            className="kw-input"
            value={monthlyEstimate}
            onChange={(e) => setMonthlyEstimate(e.target.value)}
            placeholder="505"
          />
        </label>
        <label className="kw-field">
          <span className="kr-eyebrow">Messdatum</span>
          <input
            type="date"
            className="kw-input"
            value={measured}
            onChange={(e) => setMeasured(e.target.value)}
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
          placeholder="z. B. Stand laut Google Business Profile"
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

export default function GooglePresence() {
  const { manualKpis, manualCheckIns, canEditTarget, profiles } = useWorkspace();
  const [editing, setEditing] = useState(false);

  const model = deriveGooglePresence(manualKpis, manualCheckIns);
  const updater = model.updatedById ? profiles.find((p) => p.id === model.updatedById) : undefined;

  if (!model.configured) {
    return (
      <section className="kw-ex-presence" aria-label="Google-Präsenz">
        <p className="kr-eyebrow kw-ex-panel-label">Google-Präsenz</p>
        <p className="kr-meta">
          Noch nicht eingerichtet. Die Baseline-Werte werden einmalig angelegt.
        </p>
      </section>
    );
  }

  return (
    <section className="kw-ex-presence" aria-label="Google-Präsenz">
      <p className="kr-eyebrow kw-ex-panel-label">Google-Präsenz</p>

      {editing ? (
        <EditForm measuredAt={model.baselineDate} onDone={() => setEditing(false)} />
      ) : model.profileViews === null ? (
        <div className="kw-ex-review-empty">
          <p className="kr-meta">Ausgangswert noch nicht erfasst.</p>
          {canEditTarget && (
            <button type="button" className="kr-btn" onClick={() => setEditing(true)}>
              Werte erfassen
            </button>
          )}
        </div>
      ) : (
        <>
          <dl className="kw-ex-presence-values">
            <div>
              <dd>{formatNumber(model.profileViews)}</dd>
              <dt>Profilaufrufe</dt>
            </div>
            {model.interactions !== null && (
              <div>
                <dd>{formatNumber(model.interactions)}</dd>
                <dt>Interaktionen</dt>
              </div>
            )}
            {model.monthlyEstimate !== null && (
              <div>
                <dd>ca. {formatNumber(model.monthlyEstimate)}</dd>
                <dt>monatliche Aufrufe</dt>
              </div>
            )}
          </dl>
          <p className="kr-meta kw-ex-presence-meta">
            {model.baselineDate && <>Baseline {formatDate(model.baselineDate)} · </>}
            Nächster Vergleich in {PRESENCE_COMPARISON_DAYS} Tagen
            {model.nextComparisonDate && <> (≈ {formatDate(model.nextComparisonDate)})</>}
          </p>
          <p className="kr-meta">
            {model.hasComparison
              ? "Vergleich verfügbar."
              : "Ausgangswert erfasst, noch kein Vergleich verfügbar."}
          </p>
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
