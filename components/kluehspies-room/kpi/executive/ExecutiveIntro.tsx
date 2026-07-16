"use client";

// ─── Executive Intro ──────────────────────────────────────────────────────────
// Begrüßung plus konkrete Lage in wenigen Sätzen: Gesamtentwicklung, stärkste
// positive und negative Bewegung mit Namen und Zahlen, dazu genau eine
// Priorität. Deterministisch aus den stabilen 28-Tage-Vergleichen
// (lib/kpi/intelligence.ts) – keine KI, keine Kausalitätsbehauptung.

import { greetingForHour } from "@/lib/kpi/executive";
import { useWorkspace } from "../workspace";

export default function ExecutiveIntro() {
  const { intelligence } = useWorkspace();
  const { narrative } = intelligence;

  return (
    <header className="kw-ex-intro">
      {/* suppressHydrationWarning: die Stunde kann zwischen Server und Client
          abweichen; der Text korrigiert sich beim Hydrieren ohne Layoutsprung. */}
      <h3 className="kw-ex-greeting" suppressHydrationWarning>
        {greetingForHour(new Date().getHours())}
      </h3>
      <p className="kw-ex-summary">{narrative.statements.join(" ")}</p>
      {narrative.prioritySentence && (
        <p className="kw-ex-priority">{narrative.prioritySentence}</p>
      )}
    </header>
  );
}
