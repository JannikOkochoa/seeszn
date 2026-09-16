"use client";

// ─── MOVES: kleine Client-Bausteine ───────────────────────────────────────────
// Drei Stellen brauchen JavaScript, und zwar nur, um ein Ereignis zu melden oder
// eine native Interaktion zu begleiten. Sie stehen zusammen in einer Datei,
// damit daraus keine drei Abstraktionen werden.

import { useEffect } from "react";
import Link from "next/link";
import { track, type MovesEvent } from "@/lib/moves/analytics";
import type { FaqItem } from "@/lib/moves/types";

/** Meldet einmal, dass eine Fläche gesehen wurde. Rendert nichts. */
export function ViewTracker({
  event,
  payload,
}: {
  event: Extract<MovesEvent, "pricing_view" | "moves_view" | "product_view" | "checkout_completed">;
  payload?: Record<string, string | number | boolean | undefined>;
}) {
  useEffect(() => {
    track(event, payload);
    // Absichtlich nur beim Mount: eine Seitenansicht ist ein Ereignis, kein Zustand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/**
 * Die FAQ. Nativ über <details>, damit sie ohne JavaScript funktioniert und in
 * der Suche als Text vorliegt. Der Client-Anteil meldet lediglich, welche Frage
 * geöffnet wurde: das ist die verlässlichste Quelle dafür, welche Unsicherheit
 * einen Kauf tatsächlich aufhält.
 */
export function Faq({ items, category }: { items: readonly FaqItem[]; category: string }) {
  return (
    <div className="mv-faq">
      {items.map((item, i) => (
        <details
          key={item.q}
          name={`mv-faq-${category}`}
          onToggle={(e) => {
            if ((e.currentTarget as HTMLDetailsElement).open) {
              track("faq_opened", { category, position: i + 1 });
            }
          }}
        >
          <summary>{item.q}</summary>
          <p className="mv-faq-a">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Die kontextuelle Erweiterung. Ein Link, der seine Annahme meldet. */
export function ExtensionLink({
  href,
  label,
  from,
  to,
}: {
  href: string;
  label: string;
  from: string;
  to: string;
}) {
  return (
    <Link
      href={href}
      className="mv-ext-target"
      onClick={() => track("extension_selected", { from, to })}
    >
      {label}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
