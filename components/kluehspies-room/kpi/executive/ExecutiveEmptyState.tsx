"use client";

// ─── Executive Empty State ────────────────────────────────────────────────────
// Ehrlicher Zustand ohne aktiven Datensatz: keine Demo-Zahlen, keine
// Platzhalter-Trends – ein ruhiger Hinweis, was als Nächstes passiert.

export default function ExecutiveEmptyState() {
  return (
    <div className="kw-primary kw-primary--empty kw-ex-empty">
      <span className="kr-eyebrow">Executive Cockpit</span>
      <p className="kr-body kw-ex-empty-lead">Noch keine Datenquelle verbunden.</p>
      <p className="kr-meta kw-primary-pending">
        Sobald SEESZN einen Search-Console-Export importiert hat, erscheinen hier die echten
        Kennzahlen mit Zeitraum, Scope und Datenstand – ohne Demo- oder Platzhalterwerte.
      </p>
    </div>
  );
}
