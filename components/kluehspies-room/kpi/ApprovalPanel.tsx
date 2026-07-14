"use client";

// ─── Freigaben ────────────────────────────────────────────────────────────────
// Nutzt die approvals-Tabelle als einzige Wahrheit: eine Zeile pro Runde,
// entschiedene Runden sind unveränderlich, neue Runde nach jeder Entscheidung.
// Die vier Zustände sind klar unterschieden; die Historie bleibt vollständig.

import { useState } from "react";
import { APPROVAL_STATUS_LABEL, type ApprovalRow } from "@/lib/kpi/types";
import { displayName, formatDateTime, formatDuration } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

export default function ApprovalPanel({ taskId }: { taskId: string }) {
  const { approvals, profiles, canWrite, requestApproval, decideApproval } = useWorkspace();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const rounds = approvals
    .filter((a) => a.task_id === taskId)
    .sort((a, b) => b.requested_at.localeCompare(a.requested_at));
  const openRound = rounds.find((a) => a.status === "requested") ?? null;

  async function request() {
    setBusy("request");
    setError(null);
    const result = await requestApproval(taskId);
    setBusy(null);
    if (!result.ok) setError(result.message);
  }

  async function decide(round: ApprovalRow, status: "approved" | "changes_requested" | "withdrawn") {
    setBusy(status);
    setError(null);
    const result = await decideApproval(round, status, note);
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setNote("");
  }

  return (
    <div className="kw-approvals">
      {openRound ? (
        <div className="kw-approval-open">
          <div className="kw-approval-state" data-status="requested">
            <i className="olive-dot" aria-hidden="true" />
            <span>
              {APPROVAL_STATUS_LABEL.requested} · angefordert von{" "}
              {displayName(profiles.find((p) => p.id === openRound.requested_by))} ·{" "}
              {formatDateTime(openRound.requested_at)} · offen seit{" "}
              {formatDuration(openRound.requested_at)}
            </span>
          </div>
          {canWrite && (
            <>
              <label className="kw-field">
                <span className="kr-eyebrow">Notiz zur Entscheidung (optional)</span>
                <textarea
                  className="kw-input kw-textarea"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <div className="kw-form-actions">
                <button
                  type="button"
                  className="kr-btn"
                  onClick={() => void decide(openRound, "approved")}
                  disabled={busy !== null}
                >
                  Freigeben
                </button>
                <button
                  type="button"
                  className="kw-link"
                  onClick={() => void decide(openRound, "changes_requested")}
                  disabled={busy !== null}
                >
                  Änderungen anfordern
                </button>
                <button
                  type="button"
                  className="kw-link"
                  onClick={() => void decide(openRound, "withdrawn")}
                  disabled={busy !== null}
                >
                  Zurückziehen
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="kw-approval-none">
          <p className="kr-meta">
            {rounds.length === 0
              ? "Für diese Maßnahme wurde noch keine Freigabe angefordert."
              : "Keine offene Freigaberunde. Nach einer Entscheidung kann jederzeit eine neue Runde starten."}
          </p>
          {canWrite && (
            <button type="button" className="kr-btn" onClick={() => void request()} disabled={busy !== null}>
              {busy === "request" ? "Wird angefordert…" : "Freigabe anfordern"}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="kw-form-error" role="alert">
          {error}
        </p>
      )}

      {rounds.length > 0 && (
        <div className="kw-approval-history">
          <span className="kr-eyebrow">Historie</span>
          <ul>
            {rounds.map((r) => (
              <li key={r.id} className="kw-approval-round" data-status={r.status}>
                <div className="kw-approval-state" data-status={r.status}>
                  <i className="olive-dot" aria-hidden="true" />
                  <span>{APPROVAL_STATUS_LABEL[r.status]}</span>
                </div>
                <p className="kr-meta">
                  Angefordert von {displayName(profiles.find((p) => p.id === r.requested_by))} am{" "}
                  {formatDateTime(r.requested_at)}
                  {r.decided_at && (
                    <>
                      {" "}
                      · entschieden von {displayName(profiles.find((p) => p.id === r.decided_by))} am{" "}
                      {formatDateTime(r.decided_at)} · offene Dauer{" "}
                      {formatDuration(r.requested_at, r.decided_at)}
                    </>
                  )}
                </p>
                {r.note && <p className="kw-approval-note">„{r.note}“</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
