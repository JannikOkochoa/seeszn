"use client";

// ─── Executive Intro ──────────────────────────────────────────────────────────
// Sehr einfache Begrüßung plus eine deterministisch berechnete Zusammenfassung
// aus dem 28-Tage-Vergleich des Standard-Scopes (alle Städtereisen). Keine KI,
// keine Kausalität, maximal zwei kurze Sätze (lib/kpi/executive.ts).

import { buildExecutiveSummary, greetingForHour } from "@/lib/kpi/executive";
import { useWorkspace } from "../workspace";

export default function ExecutiveIntro() {
  const { executiveBase, executiveScopeBreakdown } = useWorkspace();

  return (
    <header className="kw-ex-intro">
      {/* suppressHydrationWarning: die Stunde kann zwischen Server und Client
          abweichen; der Text korrigiert sich beim Hydrieren ohne Layoutsprung. */}
      <h3 className="kw-ex-greeting" suppressHydrationWarning>
        {greetingForHour(new Date().getHours())}
      </h3>
      <p className="kw-ex-summary">
        {buildExecutiveSummary(executiveBase, executiveScopeBreakdown)}
      </p>
    </header>
  );
}
