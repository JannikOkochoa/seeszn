"use client";

// ─── Kommentarfeld mit @-Erwähnungen ──────────────────────────────────────────
// Tippt jemand „@“, öffnet sich eine Vorschlagsliste aller erwähnbaren
// Mitglieder der Organisation; die Filterung läuft während der Eingabe und
// ignoriert Groß-/Kleinschreibung („@m“ zeigt Maxim, sofern kein weiterer
// Name mit m beginnt). Pfeiltasten navigieren, Enter/Tab wählen aus, Escape
// schließt; Maus und Touch wählen per Pointer. ARIA-Combobox-Semantik über
// aria-expanded / aria-controls / aria-activedescendant am Textfeld; der
// Fokus bleibt durchgehend im Textfeld.
//
// Gespeichert wird die profile_id (comment_mentions), nicht nur der sichtbare
// Text: extractMentionedProfileIds liest die IDs beim Absenden aus dem Text.

import { useMemo, useRef, useState } from "react";
import type { MemberRow } from "@/lib/kpi/types";
import { displayName } from "@/lib/kpi/format";

interface MentionState {
  /** Position des auslösenden "@" im Text. */
  start: number;
  /** Bisher getippter Namensanfang hinter dem "@". */
  query: string;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Aktives @-Token unmittelbar vor der Cursorposition, sonst null. */
function mentionAtCaret(value: string, caret: number): MentionState | null {
  const before = value.slice(0, caret);
  const match = before.match(/(^|\s)@([\p{L}\p{M}'’-]*)$/u);
  if (!match) return null;
  return { start: before.length - match[2].length - 1, query: match[2] };
}

/** Profile-IDs aller im Text erwähnten Mitglieder (case-insensitiv). */
export function extractMentionedProfileIds(body: string, members: MemberRow[]): string[] {
  const ids: string[] = [];
  for (const member of members) {
    const name = displayName(member);
    if (!name || name === "Unbekannt") continue;
    const pattern = new RegExp(`(^|\\s)@${escapeRegExp(name)}(?=$|[\\s.,;:!?)])`, "iu");
    if (pattern.test(body)) ids.push(member.profile_id);
  }
  return ids;
}

/** Kommentartext mit optisch markierten Erwähnungen rendern. */
export function renderWithMentions(body: string, members: MemberRow[]): React.ReactNode {
  const names = members
    .map((m) => displayName(m))
    .filter((name) => name && name !== "Unbekannt")
    .sort((a, b) => b.length - a.length);
  if (names.length === 0) return body;

  const pattern = new RegExp(
    `@(${names.map(escapeRegExp).join("|")})(?=$|[\\s.,;:!?)])`,
    "giu",
  );
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const match of body.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(body.slice(last, index));
    nodes.push(
      <mark key={`${index}-${match[0]}`} className="kw-mention">
        {match[0]}
      </mark>,
    );
    last = index + match[0].length;
  }
  if (nodes.length === 0) return body;
  if (last < body.length) nodes.push(body.slice(last));
  return nodes;
}

export default function MentionTextarea({
  id,
  value,
  onChange,
  members,
  placeholder,
  rows = 2,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  members: MemberRow[];
  placeholder?: string;
  rows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mention, setMention] = useState<MentionState | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(() => {
    if (mention === null) return [];
    const q = mention.query.toLowerCase();
    return members
      .map((member) => ({ member, name: displayName(member) }))
      .filter(({ name }) => name && name !== "Unbekannt" && name.toLowerCase().startsWith(q))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [mention, members]);

  const open = mention !== null && suggestions.length > 0;

  // Auswahl beim Weitertippen zurücksetzen (State-Anpassung im Render statt
  // Effect, siehe react.dev "adjusting state when props change").
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  if ((mention?.query ?? null) !== lastQuery) {
    setLastQuery(mention?.query ?? null);
    setActiveIndex(0);
  }
  const active = suggestions.length > 0 ? Math.min(activeIndex, suggestions.length - 1) : 0;

  function syncMentionState() {
    const el = textareaRef.current;
    if (!el) return;
    setMention(mentionAtCaret(el.value, el.selectionStart ?? el.value.length));
  }

  function insertMention(member: MemberRow) {
    const el = textareaRef.current;
    if (!el || mention === null) return;
    const name = displayName(member);
    const caret = el.selectionStart ?? value.length;
    const next = `${value.slice(0, mention.start)}@${name} ${value.slice(caret)}`;
    onChange(next);
    setMention(null);
    // Fokus bleibt im Textfeld, Cursor hinter der Erwähnung.
    const nextCaret = mention.start + name.length + 2;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((active + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((active - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      insertMention(suggestions[active].member);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setMention(null);
    }
  }

  const listId = `${id}-mention-listbox`;

  return (
    <div className="kw-mention-field">
      <textarea
        ref={textareaRef}
        id={id}
        className="kw-input kw-textarea"
        rows={rows}
        placeholder={placeholder}
        value={value}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          open && suggestions[active]
            ? `${id}-mention-${suggestions[active].member.profile_id}`
            : undefined
        }
        onChange={(event) => {
          onChange(event.target.value);
          requestAnimationFrame(syncMentionState);
        }}
        onKeyDown={onKeyDown}
        onClick={syncMentionState}
        onKeyUp={(event) => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) syncMentionState();
        }}
        onBlur={() => setMention(null)}
      />
      {open && (
        <div className="kw-mention-panel" role="listbox" id={listId} aria-label="Mitglied erwähnen">
          {suggestions.map(({ member, name }, index) => (
            <div
              key={member.profile_id}
              id={`${id}-mention-${member.profile_id}`}
              role="option"
              aria-selected={index === active}
              className="kw-picker-option"
              data-active={index === active || undefined}
              onPointerDown={(event) => {
                // pointerdown statt click: kommt vor dem Blur des Textfelds.
                event.preventDefault();
                insertMention(member);
              }}
              onPointerMove={() => setActiveIndex(index)}
            >
              <span className="kw-picker-option-label">{name}</span>
              {member.status === "invited" && (
                <span className="kw-picker-option-meta">eingeladen</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
