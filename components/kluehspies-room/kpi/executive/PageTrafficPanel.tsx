"use client";

// ─── Traffic und Geschäftsergebnis einer Seite ────────────────────────────────
// Schließt die Kette, die das Cockpit vorher nur zur Hälfte zeigte:
//
//   Impression → Position → Klick   (Search Console)
//   Sitzung → Engagement → Anfrage  (Analytics)
//
// Beide Blöcke rechnen über EXAKT denselben Zeitraum wie die SEO-Kennzahlen
// darüber. Das ist der Grund, warum der Zeitraum hier nicht neu berechnet,
// sondern hereingereicht wird — zwei Quellen mit eigenen Datenständen würden
// sonst unbemerkt unterschiedliche Fenster vergleichen.
//
// Fehlt GA4 oder hat der Zeitraum keine Analytics-Daten, steht das hier —
// niemals eine geschätzte Zahl.

import type { Ga4MetricModel, Ga4PageModel } from "@/lib/kpi/ga4Data";
import { formatDate } from "@/lib/kpi/format";

function deltaText(pct: number | null): string {
  if (pct === null) return "kein Vergleich";
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "±";
  return `${sign}${Math.abs(pct).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}

function MetricRow({ metric }: { metric: Ga4MetricModel }) {
  return (
    <div className="kw-ga4-metric" data-assess={metric.assessment}>
      <dt className="kr-eyebrow">{metric.label}</dt>
      <dd>
        <span className="kw-ga4-metric-value">{metric.value}</span>
        <span className="kr-meta kw-ga4-metric-delta">
          {" "}
          {deltaText(metric.deltaPct)}
          {metric.deltaPct !== null && ` · zuvor ${metric.previousValue}`}
        </span>
        <span className="kr-meta kw-ga4-metric-hint">{metric.hint}</span>
      </dd>
    </div>
  );
}

export default function PageTrafficPanel({
  model,
  timeZone,
  pageLabel,
}: {
  model: Ga4PageModel | null;
  timeZone: string | null;
  pageLabel: string;
}) {
  if (!model) {
    return (
      <section className="kw-ga4-block" aria-label="Traffic und Anfragen">
        <h4 className="kw-ex-canvas-title">Traffic und Anfragen</h4>
        <p className="kr-meta kw-ga4-empty">
          Für {pageLabel} liegen im gewählten Zeitraum keine Analytics-Daten vor.
        </p>
      </section>
    );
  }

  return (
    <section className="kw-ga4-block" aria-label="Traffic und Anfragen">
      <h4 className="kw-ex-canvas-title">Traffic und Anfragen</h4>
      <p className="kw-ex-canvas-explain">
        Aus Google Analytics, über denselben Zeitraum wie die SEO-Kennzahlen oben:{" "}
        {formatDate(model.range.from)} bis {formatDate(model.range.to)}
        {model.previousRange && (
          <>
            {" "}
            (Vorperiode {formatDate(model.previousRange.from)} bis{" "}
            {formatDate(model.previousRange.to)})
          </>
        )}
        . Anders als die Search Console zählt Analytics alle Kanäle, nicht nur Google.
      </p>

      <div className="kw-ga4-grid">
        <div className="kw-ga4-column">
          <p className="kr-eyebrow kw-ga4-column-label">Traffic</p>
          <dl className="kw-ga4-metrics">
            {model.traffic.map((m) => (
              <MetricRow key={m.key} metric={m} />
            ))}
          </dl>
        </div>
        <div className="kw-ga4-column">
          <p className="kr-eyebrow kw-ga4-column-label">Geschäftsergebnis</p>
          <dl className="kw-ga4-metrics">
            {model.conversion.map((m) => (
              <MetricRow key={m.key} metric={m} />
            ))}
          </dl>
        </div>
      </div>

      <p className="kr-meta kw-ga4-note">
        {model.missingDays > 0 && (
          <>
            <strong>{model.missingDays} Tage</strong> im Zeitraum haben keine Analytics-Daten; die
            Summen sind entsprechend unvollständig.{" "}
          </>
        )}
        Analytics zählt Tage in der Zeitzone der Property
        {timeZone ? ` (${timeZone})` : ""}, die Search Console in Pacific Time. Über eine Woche
        oder mehr fällt das nicht ins Gewicht, tagesgenau können beide Quellen minimal
        auseinanderliegen.
      </p>
    </section>
  );
}
