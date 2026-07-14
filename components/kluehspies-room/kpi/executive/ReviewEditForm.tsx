"use client";

// ─── Google-Bewertungen: Werte erfassen/aktualisieren ─────────────────────────
// Kleines Formular für SEESZN Admin. Speichern erzeugt neue, append-only
// Check-ins (Ist) und – bei Änderung – neue Zielversionen; alte Werte bleiben
// historisch erhalten (updateReviewValues). Server-RLS bleibt die eigentliche
// Sicherheitsgrenze.

import { useState } from "react";
import type { ReviewModel } from "@/lib/kpi/reviews";
import { useWorkspace } from "../workspace";

function toInput(n: number | null): string {
  return n === null ? "" : String(n);
}

export default function ReviewEditForm({
  model,
  onDone,
}: {
  model: ReviewModel;
  onDone: () => void;
}) {
  const { updateReviewValues } = useWorkspace();
  const [rating, setRating] = useState(toInput(model.rating));
  const [reviewCount, setReviewCount] = useState(toInput(model.count));
  const [targetRating, setTargetRating] = useState(toInput(model.targetRating ?? 4.3));
  const [newThisMonth, setNewThisMonth] = useState(toInput(model.newThisMonth));
  const [monthlyGoal, setMonthlyGoal] = useState(toInput(model.monthlyGoal ?? 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const ratingNum = Number(rating.replace(",", "."));
    const reviewCountNum = Number(reviewCount);
    const targetRatingNum = Number(targetRating.replace(",", "."));
    const monthlyGoalNum = Number(monthlyGoal);
    const newThisMonthNum = newThisMonth.trim() === "" ? null : Number(newThisMonth);

    if (!Number.isFinite(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      setError("Bitte eine Sternebewertung zwischen 0 und 5 angeben.");
      return;
    }
    if (!Number.isFinite(reviewCountNum) || reviewCountNum < 0) {
      setError("Bitte eine gültige Gesamtzahl an Bewertungen angeben.");
      return;
    }
    if (!Number.isFinite(targetRatingNum) || targetRatingNum < 0 || targetRatingNum > 5) {
      setError("Bitte eine Zielbewertung zwischen 0 und 5 angeben.");
      return;
    }
    if (!Number.isFinite(monthlyGoalNum) || monthlyGoalNum < 0) {
      setError("Bitte ein gültiges Monatsziel angeben.");
      return;
    }
    if (newThisMonthNum !== null && (!Number.isFinite(newThisMonthNum) || newThisMonthNum < 0)) {
      setError("Bitte eine gültige Zahl für neue Bewertungen angeben, oder das Feld leer lassen.");
      return;
    }

    setSaving(true);
    setError(null);
    const result = await updateReviewValues({
      rating: ratingNum,
      reviewCount: reviewCountNum,
      targetRating: targetRatingNum,
      newThisMonth: newThisMonthNum,
      monthlyGoal: monthlyGoalNum,
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
          <span className="kr-eyebrow">Sternebewertung</span>
          <input
            type="text"
            inputMode="decimal"
            className="kw-input"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="4,2"
          />
        </label>
        <label className="kw-field">
          <span className="kr-eyebrow">Gesamtzahl Bewertungen</span>
          <input
            type="text"
            inputMode="numeric"
            className="kw-input"
            value={reviewCount}
            onChange={(e) => setReviewCount(e.target.value)}
            placeholder="202"
          />
        </label>
      </div>
      <div className="kw-form-row">
        <label className="kw-field">
          <span className="kr-eyebrow">Zielbewertung</span>
          <input
            type="text"
            inputMode="decimal"
            className="kw-input"
            value={targetRating}
            onChange={(e) => setTargetRating(e.target.value)}
            placeholder="4,3"
          />
        </label>
        <label className="kw-field">
          <span className="kr-eyebrow">Neue Bewertungen diesen Monat</span>
          <input
            type="text"
            inputMode="numeric"
            className="kw-input"
            value={newThisMonth}
            onChange={(e) => setNewThisMonth(e.target.value)}
            placeholder="Leer lassen, falls noch nicht erfasst"
          />
        </label>
        <label className="kw-field">
          <span className="kr-eyebrow">Monatsziel</span>
          <input
            type="text"
            inputMode="numeric"
            className="kw-input"
            value={monthlyGoal}
            onChange={(e) => setMonthlyGoal(e.target.value)}
            placeholder="10"
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
