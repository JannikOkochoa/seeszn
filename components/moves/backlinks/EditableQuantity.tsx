"use client";

// ─── BACKLINKS: die Menge als Eingabefeld ─────────────────────────────────────
// Die große Zahl ist die Eingabe. Kein Formularfeld daneben, keine Modalfläche:
// derselbe Platz zeigt im Ruhezustand die editorische Ziffer mit ihrer
// gewohnten Wechselanimation und wird bei Berührung zum echten <input>.
//
// Der Entwurf bleibt lokal, solange getippt wird. Erst ein Commit (Enter,
// Verlassen des Felds, Pfeiltaste) schreibt in den Preiszustand der Seite;
// ein einzelnes "4" auf dem Weg zu "40" darf nicht zwischendurch auf die
// Mindestmenge springen.

import { useEffect, useRef, useState } from "react";
import { parseManualQuantity, type PurchaseMode } from "@/lib/moves/backlinks";
import SwapNumber from "./SwapNumber";

export default function EditableQuantity({
  quantity,
  custom,
  customLabel,
  requested,
  mode,
  direction,
  live,
  instant,
  label,
  className,
  onCommitQuantity,
  onCommitCustom,
}: {
  /** Die zuletzt bestätigte reguläre Menge, auch während des Custom-Zustands. */
  quantity: number;
  custom: boolean;
  /** Beschriftung im Custom-Zustand, ruhend: "100+". */
  customLabel: string;
  /** Die zuletzt eingetippte Menge über 100, falls es eine gab. */
  requested?: number;
  mode: PurchaseMode;
  direction: number;
  live: boolean;
  instant: boolean;
  label: string;
  className: string;
  onCommitQuantity: (next: number) => void;
  onCommitCustom: (requested: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(quantity));
  const inputRef = useRef<HTMLInputElement>(null);

  // Kein Effekt, der den Entwurf synchron hält: solange nicht editiert wird,
  // liest niemand `draft`, die Ansicht kommt direkt aus `quantity`. Der Entwurf
  // wird ausschließlich beim Öffnen des Feldes neu gesetzt.
  const beginEdit = () => {
    setDraft(String(custom ? (requested ?? quantity) : quantity));
    setEditing(true);
  };

  useEffect(() => {
    if (!editing) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const result = parseManualQuantity(draft, mode);
    if (result.kind === "valid") onCommitQuantity(result.quantity);
    else if (result.kind === "custom") onCommitCustom(result.requested);
    // "invalid": nichts weiter. Der Effekt oben stellt beim nächsten Rendern
    // den zuletzt bestätigten Wert wieder her, weil editing dann false ist.
  };

  const cancel = () => {
    setDraft(String(custom ? (requested ?? quantity) : quantity));
    setEditing(false);
  };

  const step = (delta: number) => {
    const base = custom ? (requested ?? quantity) : quantity;
    const result = parseManualQuantity(String(base + delta), mode);
    if (result.kind === "valid") {
      onCommitQuantity(result.quantity);
      setDraft(String(result.quantity));
    } else if (result.kind === "custom") {
      onCommitCustom(result.requested);
      setDraft(String(result.requested));
    }
  };

  if (!editing) {
    return (
      <button type="button" className="mv-qty-edit" aria-label={label} onClick={beginEdit}>
        {custom ? (
          <span className={className}>{customLabel}</span>
        ) : (
          <SwapNumber value={quantity} direction={direction} live={live} instant={instant} className={className}>
            {quantity}
          </SwapNumber>
        )}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      className={`${className} mv-qty-input`}
      aria-label={label}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
        if (e.key === "Escape") { e.preventDefault(); cancel(); }
        if (e.key === "ArrowUp") { e.preventDefault(); step(1); }
        if (e.key === "ArrowDown") { e.preventDefault(); step(-1); }
      }}
    />
  );
}
