"use client";

// ─── Kommentare ───────────────────────────────────────────────────────────────
// Chronologischer Thread pro Maßnahme mit Realtime-Aktualisierung und echten
// @-Erwähnungen: Vorschlagsliste beim Tippen, Speicherung der profile_id in
// comment_mentions, optische Markierung erwähnter Namen. Die Oberfläche
// spiegelt die Backend-Rechte: Viewer liest nur.

import { useEffect, useState } from "react";
import { displayName, formatDateTime } from "@/lib/kpi/format";
import MentionTextarea, {
  extractMentionedProfileIds,
  renderWithMentions,
} from "./MentionTextarea";
import { useWorkspace } from "./workspace";

export default function CommentThread({ taskId }: { taskId: string }) {
  const { commentsByTask, loadComments, addComment, profiles, members, canWrite, viewer } =
    useWorkspace();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const comments = commentsByTask.get(taskId);

  useEffect(() => {
    if (!commentsByTask.has(taskId)) void loadComments(taskId);
  }, [taskId, commentsByTask, loadComments]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    const text = body.trim();
    const result = await addComment(taskId, text, extractMentionedProfileIds(text, members));
    setSending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setBody("");
  }

  return (
    <div className="kw-comments">
      {comments === undefined ? (
        <p className="kr-meta">Kommentare werden geladen…</p>
      ) : comments.length === 0 ? (
        <p className="kr-meta">Noch keine Kommentare. {canWrite ? "Der erste Hinweis hilft allen." : ""}</p>
      ) : (
        <ul className="kw-comment-list">
          {comments.map((c) => {
            const author = profiles.find((p) => p.id === c.profile_id);
            const mine = c.profile_id === viewer.id;
            return (
              <li key={c.id} className="kw-comment" data-mine={mine || undefined}>
                <div className="kw-comment-head">
                  <span className="kw-comment-author">{displayName(author)}</span>
                  <span className="kr-meta">{formatDateTime(c.created_at)}</span>
                </div>
                <p className="kw-comment-body">{renderWithMentions(c.body, members)}</p>
              </li>
            );
          })}
        </ul>
      )}

      {canWrite ? (
        <form onSubmit={submit} className="kw-comment-form">
          <label className="kw-visually-hidden" htmlFor={`kw-comment-${taskId}`}>
            Kommentar schreiben
          </label>
          <MentionTextarea
            id={`kw-comment-${taskId}`}
            value={body}
            onChange={setBody}
            members={members}
            placeholder="Kommentar schreiben… (@Name für Erwähnungen)"
          />
          {error && (
            <p className="kw-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="kw-form-actions kw-form-actions--end">
            <button type="submit" className="kr-btn" disabled={sending || !body.trim()}>
              {sending ? "Wird gesendet…" : "Kommentieren"}
            </button>
          </div>
        </form>
      ) : (
        <p className="kr-meta kw-comment-hint">Kommentare sind für die Viewer-Rolle lesend.</p>
      )}
    </div>
  );
}
