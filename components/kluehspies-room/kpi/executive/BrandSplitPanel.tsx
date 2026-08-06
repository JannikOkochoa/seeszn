"use client";

// ─── Marken- vs. Nicht-Marken-Suchen ──────────────────────────────────────────
// Die wichtigste Unterscheidung im organischen Bild einer Startseite: Wer nach
// "Klühspies" sucht, kennt das Unternehmen schon. Wer nach "Klassenfahrt
// buchen" sucht, nicht. Nur die zweite Gruppe ist gewonnene Nachfrage.
//
// Beide Segmente haben eigene Tageszeitreihen (eigene Scopes im Sync), deshalb
// ist der Vergleich zur Vorperiode hier genauso belastbar wie bei der Seite
// selbst — keine Momentaufnahme über den Exportzeitraum.
//
// Ehrlich bleibt auch die Lücke: Google ordnet nicht jeden Klick einer
// Suchanfrage zu. Die Differenz steht ausdrücklich da, statt die Anteile
// stillschweigend schönzurechnen.

import type { BrandSegmentModel, BrandSplitModel } from "@/lib/kpi/pagePerformance";
import { formatNumber, formatPercent } from "@/lib/kpi/format";

function shareText(value: number | null): string {
  return value === null ? "–" : formatPercent(value * 100, 1);
}

function deltaText(pct: number | null): string {
  if (pct === null) return "kein Vergleich";
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "±";
  return `${sign}${Math.abs(pct).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}

function SegmentCard({ segment }: { segment: BrandSegmentModel }) {
  const clicks = segment.metrics.find((m) => m.key === "clicks");
  const impressions = segment.metrics.find((m) => m.key === "impressions");
  const ctr = segment.metrics.find((m) => m.key === "ctr");
  const position = segment.metrics.find((m) => m.key === "position");

  return (
    <article className="kw-brand-card" data-kind={segment.kind}>
      <h5 className="kw-brand-card-title">{segment.label}</h5>

      <p className="kw-brand-share">
        <span className="kw-brand-share-value">{shareText(segment.shareOfClicks)}</span>
        <span className="kr-meta"> der zugeordneten Klicks</span>
      </p>
      <p className="kr-meta kw-brand-share-second">
        {shareText(segment.shareOfImpressions)} der zugeordneten Impressionen
      </p>

      <dl className="kw-brand-metrics">
        {[clicks, impressions, ctr, position].map(
          (metric) =>
            metric && (
              <div key={metric.key}>
                <dt className="kr-eyebrow">{metric.label}</dt>
                <dd>
                  <span className="kw-brand-metric-value">{metric.value}</span>
                  <span className="kr-meta kw-brand-metric-delta">
                    {" "}
                    {deltaText(metric.deltaPct)}
                    {metric.deltaPct !== null && ` · zuvor ${metric.previousValue}`}
                  </span>
                </dd>
              </div>
            ),
        )}
      </dl>
    </article>
  );
}

export default function BrandSplitPanel({ split }: { split: BrandSplitModel }) {
  const { branded, nonBranded, unattributed, attributed } = split;

  return (
    <section className="kw-brand-split" aria-labelledby="kw-brand-split-title">
      <h4 className="kw-ex-canvas-title" id="kw-brand-split-title">
        Marken- und Nicht-Marken-Suchen
      </h4>
      <p className="kw-ex-canvas-explain">
        Marken-Suchen enthalten den Namen Klühspies in irgendeiner Schreibweise. Wer so sucht,
        kennt das Unternehmen bereits. Nicht-Marken-Suchen sind neu gewonnene Nachfrage.
      </p>

      <div className="kw-brand-grid">
        <SegmentCard segment={branded} />
        <SegmentCard segment={nonBranded} />
      </div>

      {nonBranded.topQueries.length > 0 && (
        <div className="kw-brand-queries">
          <h5 className="kw-brand-card-title">Top Nicht-Marken-Suchanfragen</h5>
          <div className="kw-table-wrap">
            <table className="kw-table">
              <thead>
                <tr>
                  <th className="kw-th">Suchanfrage</th>
                  <th className="kw-th kw-th--num">Klicks</th>
                  <th className="kw-th kw-th--num">Impressionen</th>
                  <th className="kw-th kw-th--num">CTR</th>
                  <th className="kw-th kw-th--num">Ø Position</th>
                </tr>
              </thead>
              <tbody>
                {nonBranded.topQueries.map((row) => (
                  <tr key={row.query}>
                    <td className="kw-td kw-td--query">{row.query}</td>
                    <td className="kw-td kw-td--num">{formatNumber(row.clicks)}</td>
                    <td className="kw-td kw-td--num">{formatNumber(row.impressions)}</td>
                    <td className="kw-td kw-td--num">{formatNumber(row.ctr * 100, 2)} %</td>
                    <td className="kw-td kw-td--num">{formatNumber(row.position, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Die Lücke wird benannt, nicht weggerechnet. */}
      {(unattributed.clicks > 0 || unattributed.impressions > 0) && (
        <p className="kr-meta kw-brand-note">
          Grundlage der Anteile sind {formatNumber(attributed.clicks)} Klicks und{" "}
          {formatNumber(attributed.impressions)} Impressionen, die Google einer Suchanfrage
          zuordnet. Weitere {formatNumber(unattributed.clicks)} Klicks und{" "}
          {formatNumber(unattributed.impressions)} Impressionen der Seite bleiben ohne Zuordnung,
          weil Google sehr seltene Suchanfragen aus Datenschutzgründen auslässt.
        </p>
      )}
    </section>
  );
}
