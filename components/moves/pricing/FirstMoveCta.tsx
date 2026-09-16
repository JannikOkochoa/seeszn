"use client";

// Der eine Weg in die Prüfung. Eigene Datei, weil er das Ereignis meldet und
// an drei Stellen derselben Fläche steht: Preisblock, Abschluss, klebende Leiste.

import Link from "next/link";
import { track } from "@/lib/moves/analytics";

export default function FirstMoveCta({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mv-cta"
      onClick={() => track("first_move_scan_started", { surface: "pricing" })}
    >
      {label}
      <span className="mv-cta-arrow" aria-hidden="true">→</span>
    </Link>
  );
}
