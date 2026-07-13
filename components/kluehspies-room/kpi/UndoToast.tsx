"use client";

// ─── Rückgängig-Hinweis nach dem Löschen ──────────────────────────────────────
// Erscheint für zehn Sekunden nach einem Soft Delete (Zeitfenster steuert der
// Workspace-Provider). Ruhig gehalten: Papier, Hairline, ein Satz, eine Aktion.

import { useWorkspace } from "./workspace";

export default function UndoToast() {
  const { pendingUndo, restoreTask } = useWorkspace();
  if (!pendingUndo) return null;

  return (
    <div className="kw-undo" role="status">
      <span className="kw-undo-text">
        „{pendingUndo.title}“ wurde gelöscht.
      </span>
      <button
        type="button"
        className="kw-link"
        onClick={() => void restoreTask(pendingUndo.taskId)}
      >
        Rückgängig
      </button>
    </div>
  );
}
