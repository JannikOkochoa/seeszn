"use client";

// ─── Google-Bewertungen: Quick-Win ────────────────────────────────────────────
// Kompakter Block unter „Benötigt Aufmerksamkeit" – kein zweites Dashboard.
// Ist-Zustand aus manuellen Check-ins, Ziele aus dem Zielmodell
// (lib/kpi/reviews.ts). Ohne erfasste Werte ehrlicher Zustand statt erfundener
// Zahlen. Eine dominante Aktion „Bewertungen anfragen"; Admin kann Werte
// aktualisieren. Keine Google-Farben, keine Sternekarte.

import { useMemo, useState } from "react";
import { deriveReviewModel } from "@/lib/kpi/reviews";
import { displayName, formatDateTime } from "@/lib/kpi/format";
import { useWorkspace } from "../workspace";
import ReviewEditForm from "./ReviewEditForm";
import ReviewRequestDrawer from "./ReviewRequestDrawer";

const fmt1 = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 1 });

export default function ReviewQuickWin() {
  const { reviewKpis, manualCheckIns, goalVersions, canEditTarget, profiles } = useWorkspace();
  const [editing, setEditing] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  const model = useMemo(
    () => deriveReviewModel(reviewKpis, manualCheckIns, goalVersions, new Date().toISOString().slice(0, 10)),
    [reviewKpis, manualCheckIns, goalVersions],
  );
  const updater = model.updatedById ? profiles.find((p) => p.id === model.updatedById) : undefined;

  return (
    <section className="kw-ex-reviews" aria-label="Google-Bewertungen">
      <p className="kr-eyebrow kw-ex-panel-label">Google-Bewertungen</p>

      {!model.configured ? (
        // Vor dem Bootstrap: KPIs noch nicht angelegt. Ehrlicher Hinweis, keine
        // Bearbeitung (Check-ins bräuchten die KPI-Definitionen).
        <p className="kr-meta">
          Noch nicht eingerichtet. Die Bewertungs-Kennzahlen werden einmalig angelegt, danach
          erscheinen hier Ist-Werte und Ziel.
        </p>
      ) : editing ? (
        <ReviewEditForm model={model} onDone={() => setEditing(false)} />
      ) : model.rating === null ? (
        <div className="kw-ex-review-empty">
          <p className="kr-meta">
            Noch keine Werte erfasst.
            {model.targetRating !== null ? ` Ziel ${fmt1(model.targetRating)} ★.` : ""}
          </p>
          <div className="kw-ex-review-actions">
            <button type="button" className="kr-btn" onClick={() => setRequestOpen(true)}>
              Bewertungen anfragen
            </button>
            {canEditTarget && (
              <button type="button" className="kw-link kw-ex-review-edit" onClick={() => setEditing(true)}>
                Werte erfassen
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="kw-ex-review-head">
            <span className="kw-ex-review-rating">{fmt1(model.rating)} ★</span>
            {model.count !== null && (
              <span className="kw-ex-review-count">{model.count.toLocaleString("de-DE")} Bewertungen</span>
            )}
          </div>
          <p className="kr-meta kw-ex-review-meta">
            {model.targetRating !== null ? `Ziel ${fmt1(model.targetRating)} ★` : "Noch kein Ziel"}
            {" · "}
            {model.newThisMonth === null
              ? `Neue Bewertungen diesen Monat: noch nicht erfasst${
                  model.monthlyGoal !== null ? ` · Ziel ${model.monthlyGoal}` : ""
                }`
              : `${model.newThisMonth}${
                  model.monthlyGoal !== null ? ` von ${model.monthlyGoal}` : ""
                } neue Bewertungen diesen Monat`}
          </p>
          {model.updatedAt && (
            <p className="kr-meta kw-ex-review-source">
              Manuell gepflegt · aktualisiert von {displayName(updater)} am{" "}
              {formatDateTime(model.updatedAt)}
            </p>
          )}
          <div className="kw-ex-review-actions">
            <button type="button" className="kr-btn" onClick={() => setRequestOpen(true)}>
              Bewertungen anfragen
            </button>
            {canEditTarget && (
              <button type="button" className="kw-link kw-ex-review-edit" onClick={() => setEditing(true)}>
                Werte aktualisieren
              </button>
            )}
          </div>
        </>
      )}

      {requestOpen && <ReviewRequestDrawer onClose={() => setRequestOpen(false)} />}
    </section>
  );
}
