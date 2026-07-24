"use client";

// ─── Quick Win bearbeiten ─────────────────────────────────────────────────────
// Editor-Drawer für die QUICK-WINS-Section: Titel, „Was ist passiert", „Warum"
// und „Empfehlung" einer Karte anlegen oder ändern. Nur für Schreibberechtigte
// (seeszn_admin / kluehspies_editor); die eigentliche Absicherung liegt in der
// RLS. Der Empfehlungstext wird zeilenweise gepflegt – jede Zeile eine Zeile in
// der Karte, leere Zeilen erzeugen einen Absatzabstand.

import { useState } from "react";
import Drawer from "../Drawer";
import { useWorkspace, type QuickWinEditTarget } from "../workspace";

export default function QuickWinEditDrawer() {
  const { quickWinEdit, quickWinEditNonce, canWrite } = useWorkspace();
  if (quickWinEdit === null || !canWrite) return null;
  return <EditForm key={quickWinEditNonce} target={quickWinEdit} />;
}

function EditForm({ target }: { target: QuickWinEditTarget }) {
  const { closeQuickWinEdit, createQuickWin, updateQuickWin } = useWorkspace();
  const existing = target.mode === "edit" ? target.row : null;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [what, setWhat] = useState(existing?.what ?? "");
  const [why, setWhy] = useState(existing?.why ?? "");
  const [recommendation, setRecommendation] = useState(existing?.recommendation ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Bitte einen Titel angeben.");
      return;
    }
    setSaving(true);
    setError(null);
    const input = {
      title: title.trim(),
      what: what.trim(),
      why: why.trim(),
      // Empfehlung so belassen, wie eingegeben (inkl. Leerzeilen für Absätze);
      // nur außen umschließende Leerzeilen entfernen.
      recommendation: recommendation.replace(/^\n+|\n+$/g, ""),
    };
    const result = existing
      ? await updateQuickWin(existing.id, input)
      : await createQuickWin(input);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    closeQuickWinEdit();
  }

  return (
    <Drawer
      open
      onClose={closeQuickWinEdit}
      layer={2}
      title={
        <div>
          <span className="kr-eyebrow">Quick Win</span>
          <span className="kw-drawer-name">
            {existing ? "Quick Win bearbeiten" : "Quick Win hinzufügen"}
          </span>
        </div>
      }
    >
      <form onSubmit={submit} className="kw-form">
        <label className="kw-field">
          <span className="kr-eyebrow">Titel</span>
          <input
            type="text"
            className="kw-input"
            data-autofocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. Zentralen „Was ist Klühspies?“-Block ergänzen"
            required
          />
        </label>

        <label className="kw-field">
          <span className="kr-eyebrow">Was ist passiert</span>
          <textarea
            className="kw-input kw-textarea"
            rows={4}
            value={what}
            onChange={(e) => setWhat(e.target.value)}
          />
        </label>

        <label className="kw-field">
          <span className="kr-eyebrow">Warum</span>
          <textarea
            className="kw-input kw-textarea"
            rows={4}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
          />
        </label>

        <label className="kw-field">
          <span className="kr-eyebrow">Empfehlung</span>
          <textarea
            className="kw-input kw-textarea"
            rows={12}
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            placeholder="Eine Zeile je Zeile in der Karte. Leerzeile = Absatz."
          />
          <span className="kr-meta">
            Jede Zeile erscheint als eigene Zeile in der Karte; eine leere Zeile erzeugt einen
            Absatzabstand.
          </span>
        </label>

        {error && (
          <p className="kw-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="kw-form-actions kw-form-actions--end">
          <button type="button" className="kw-link" onClick={closeQuickWinEdit}>
            Abbrechen
          </button>
          <button type="submit" className="kr-btn" disabled={saving}>
            {saving ? "Wird gespeichert…" : existing ? "Änderungen speichern" : "Quick Win speichern"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
