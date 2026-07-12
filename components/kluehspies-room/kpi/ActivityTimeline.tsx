"use client";

// ─── Aktivitätsverlauf ────────────────────────────────────────────────────────
// audit_events als lesbare Sätze: wer, was, wann. Keine IDs, kein JSON, keine
// technischen Metadaten. Audit-Einträge entstehen nur serverseitig und sind
// nicht editierbar.

import { useEffect } from "react";
import { TASK_STATUS_LABEL, type AuditEventRow, type TaskStatus } from "@/lib/kpi/types";
import { displayName, formatDateTime } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

function sentence(
  event: AuditEventRow,
  actorName: string,
  resolveOwner: (id: string) => string,
): string {
  const meta = event.metadata ?? {};
  switch (event.action) {
    case "task.created":
      return `${actorName} hat die Maßnahme erstellt.`;
    case "task.status_changed": {
      const to = meta.to as TaskStatus | undefined;
      return to
        ? `${actorName} hat den Status auf „${TASK_STATUS_LABEL[to] ?? to}“ gesetzt.`
        : `${actorName} hat den Status geändert.`;
    }
    case "task.assigned": {
      const ownerId = typeof meta.ownerId === "string" ? meta.ownerId : "";
      return ownerId
        ? `${actorName} hat die Maßnahme ${resolveOwner(ownerId)} zugewiesen.`
        : `${actorName} hat die Zuweisung entfernt.`;
    }
    case "task.updated":
      return `${actorName} hat die Maßnahme bearbeitet.`;
    case "approval.requested":
      return `${actorName} hat eine Freigabe angefordert.`;
    case "approval.decided": {
      const status = meta.status;
      if (status === "approved") return `${actorName} hat die Freigabe erteilt.`;
      if (status === "changes_requested") return `${actorName} hat Änderungen angefordert.`;
      if (status === "withdrawn") return `${actorName} hat die Freigabe zurückgezogen.`;
      return `${actorName} hat über die Freigabe entschieden.`;
    }
    case "annotation.created":
      return `${actorName} hat eine Annotation ergänzt.`;
    case "annotation.updated":
      return `${actorName} hat eine Annotation bearbeitet.`;
    case "comment.created":
      return `${actorName} hat kommentiert.`;
    case "sync.stale_claim_takeover":
      return "Ein unterbrochener Sync wurde automatisch bereinigt.";
    default:
      return `${actorName} hat eine Änderung vorgenommen.`;
  }
}

export default function ActivityTimeline({ taskId }: { taskId: string }) {
  const { activityByTask, loadActivity, profiles } = useWorkspace();
  const events = activityByTask.get(taskId);

  useEffect(() => {
    void loadActivity(taskId);
  }, [taskId, loadActivity]);

  const resolveOwner = (id: string) => displayName(profiles.find((p) => p.id === id));

  if (events === undefined) {
    return <p className="kr-meta">Verlauf wird geladen…</p>;
  }
  if (events.length === 0) {
    return <p className="kr-meta">Noch keine protokollierten Aktivitäten zu dieser Maßnahme.</p>;
  }

  return (
    <ul className="kw-activity">
      {events.map((e) => {
        const actor = displayName(profiles.find((p) => p.id === e.actor_id));
        return (
          <li key={e.id} className="kw-activity-row">
            <span className="kr-meta kw-activity-time">{formatDateTime(e.created_at)}</span>
            <span className="kw-activity-text">{sentence(e, actor, resolveOwner)}</span>
          </li>
        );
      })}
    </ul>
  );
}
