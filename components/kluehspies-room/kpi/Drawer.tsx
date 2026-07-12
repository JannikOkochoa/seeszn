"use client";

// ─── Drawer-Primitiv ──────────────────────────────────────────────────────────
// Großzügiges Panel von rechts, ruhig statt Standard-Sidebar. Fokusfalle,
// Escape schließt nur den obersten Drawer, Fokus kehrt zum Auslöser zurück,
// Body-Scroll wird gesperrt. Zweite Ebene (Maßnahme erstellen) liegt sichtbar
// über der ersten.

import { useEffect, useId, useRef } from "react";

const openStack: string[] = [];
let scrollLocks = 0;

function lockScroll() {
  scrollLocks += 1;
  if (scrollLocks === 1) document.body.style.overflow = "hidden";
}
function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.style.overflow = "";
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Sichtbarer Titel-Knoten; wird für aria-labelledby verwendet. */
  title: React.ReactNode;
  /** Zweite Ebene: schmaler, liegt über dem ersten Drawer. */
  layer?: 1 | 2;
  wide?: boolean;
  children: React.ReactNode;
}

export default function Drawer({ open, onClose, title, layer = 1, wide = false, children }: DrawerProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    openStack.push(id);
    lockScroll();

    // Ersten sinnvollen Fokuspunkt setzen.
    const panel = panelRef.current;
    const initial =
      panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector<HTMLElement>(FOCUSABLE) ??
      panel;
    initial?.focus({ preventScroll: true });

    function onKeyDown(e: KeyboardEvent) {
      if (openStack[openStack.length - 1] !== id) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null || el === document.activeElement,
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const idx = openStack.lastIndexOf(id);
      if (idx !== -1) openStack.splice(idx, 1);
      unlockScroll();
      returnFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open, id]);

  if (!open) return null;

  return (
    <div className="kw-drawer-root" data-layer={layer}>
      <div className="kw-drawer-backdrop" onClick={() => onCloseRef.current()} aria-hidden="true" />
      <div
        ref={panelRef}
        className="kw-drawer"
        data-wide={wide || undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        tabIndex={-1}
      >
        <header className="kw-drawer-head">
          <div id={`${id}-title`} className="kw-drawer-title">
            {title}
          </div>
          <button
            type="button"
            className="kw-drawer-close"
            onClick={() => onCloseRef.current()}
            aria-label="Drawer schließen"
          >
            Schließen <span aria-hidden="true">✕</span>
          </button>
        </header>
        <div className="kw-drawer-body">{children}</div>
      </div>
    </div>
  );
}
