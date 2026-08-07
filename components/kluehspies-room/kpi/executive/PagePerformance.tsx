"use client";

// ─── Seiten-Performance ───────────────────────────────────────────────────────
// Ein Bereich für eine einzelne Seite: Klicks, Impressionen, CTR, Ø Position
// mit Vergleich zur vorherigen gleich langen Periode, die Entwicklung über die
// Zeit und die Suchanfragen, über die genau diese Seite gefunden wird.
//
// Bewusst keine Homepage-Sonderlösung: Welche Seiten hier auswählbar sind,
// steht ausschließlich in lib/gsc/pageScopes.ts (TRACKED_PAGES). Eine weitere
// Landingpage oder ein Blogartikel braucht dort einen Eintrag und einen
// Sync-Lauf — an dieser Komponente ändert sich nichts.
//
// Die Zahlen stammen aus denselben echten Search-Console-Zeilen wie das übrige
// Cockpit, gefiltert auf exakt diese URL (GSC-Operator "equals", keine
// Unterseiten). Fehlt der aktive Datensatz einer Seite, steht das hier —
// niemals ein Ersatzwert.

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  buildPagePerformance,
  type PagePerformanceModel,
} from "@/lib/kpi/pagePerformance";
import { cockpitRangeLabel, type CanvasMetric } from "@/lib/kpi/gscData";
import { formatDate, formatDateShort, formatNumber } from "@/lib/kpi/format";
import ExecutiveKpi from "./ExecutiveKpi";
import BrandSplitPanel from "./BrandSplitPanel";
import PageTrafficPanel from "./PageTrafficPanel";
import { buildGa4PageModel } from "@/lib/kpi/ga4Data";
import { ga4PageScopeKey } from "@/lib/ga4/pageMapping";
import { METRIC_EXPLAIN, METRIC_LABEL } from "./PerformanceControls";
import { useWorkspace } from "../workspace";

const W = 960;
const H = 200;
const PAD = { l: 48, r: 20, t: 14, b: 30 };

function formatMetric(metric: CanvasMetric, value: number): string {
  if (metric === "ctr") return `${formatNumber(value, 2)} %`;
  if (metric === "position") return formatNumber(value, 1);
  return formatNumber(value);
}

function buildPath(points: Array<{ x: number; y: number } | null>): string {
  let d = "";
  let pen = false;
  for (const p of points) {
    if (!p) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
    pen = true;
  }
  return d.trim();
}

/** Kompakter Verlauf einer Metrik: gleiche Sprache wie der Performance Canvas. */
function PageChart({ model, metric }: { model: PagePerformanceModel; metric: CanvasMetric }) {
  const reduced = useReducedMotion();

  const chart = useMemo(() => {
    const { series, previousSeries } = model;
    const n = series.length;
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const values = [...series, ...previousSeries]
      .map((p) => p.value)
      .filter((v): v is number => v !== null);

    let yMin = 0;
    let yMax = Math.max(1, ...values);
    if (metric === "position" && values.length > 0) {
      yMin = Math.max(0, Math.floor(Math.min(...values)) - 2);
      yMax = Math.ceil(Math.max(...values)) + 2;
    } else {
      yMax = yMax * 1.08;
    }

    // Wie im Canvas: bei Position liegt eine bessere (kleinere) Zahl oben.
    const invert = metric === "position";
    const x = (i: number) => PAD.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = (v: number) => {
      const frac = (v - yMin) / (yMax - yMin || 1);
      return invert ? PAD.t + frac * innerH : PAD.t + innerH - frac * innerH;
    };
    const toPoints = (list: typeof series) =>
      list.map((p, i) => (p.value === null ? null : { x: x(i), y: y(p.value) }));

    return {
      path: buildPath(toPoints(series)),
      previousPath: buildPath(toPoints(previousSeries)),
      yMin,
      yMax,
      hasValues: values.length > 0,
    };
  }, [model, metric]);

  if (!chart.hasValues) {
    return (
      <p className="kw-chart-empty kr-meta">
        Für diesen Zeitraum liegen keine Tageswerte dieser Seite vor.
      </p>
    );
  }

  const first = model.series[0];
  const last = model.series[model.series.length - 1];

  return (
    <figure className="kw-chart kw-page-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Verlauf ${METRIC_LABEL[metric]}`}>
        {/* Nur die Extremwerte beschriften: der Verlauf trägt die Aussage. */}
        <text className="kw-tick" x={PAD.l - 10} y={PAD.t + 4} textAnchor="end">
          {formatMetric(metric, chart.yMax)}
        </text>
        <text className="kw-tick" x={PAD.l - 10} y={H - PAD.b} textAnchor="end">
          {formatMetric(metric, chart.yMin)}
        </text>
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} className="kw-axis" />
        {first && (
          <text className="kw-tick" x={PAD.l} y={H - 10} textAnchor="start">
            {formatDateShort(first.date)}
          </text>
        )}
        {last && (
          <text className="kw-tick" x={W - PAD.r} y={H - 10} textAnchor="end">
            {formatDateShort(last.date)}
          </text>
        )}
        {chart.previousPath && (
          <path className="kw-line-prev" fill="none" d={chart.previousPath} />
        )}
        <motion.path
          className="kw-line-cur"
          fill="none"
          d={chart.path}
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>
      <figcaption className="kw-legend" aria-hidden="true">
        <span>
          <i className="kw-key" /> {formatDate(model.currentRange.from)} –{" "}
          {formatDate(model.currentRange.to)}
        </span>
        {model.previousRange && (
          <span>
            <i className="kw-key kw-key--prev" /> Vorperiode{" "}
            {formatDate(model.previousRange.from)} – {formatDate(model.previousRange.to)}
          </span>
        )}
      </figcaption>

      {/* Werte zusätzlich als Tabelle: der Chart ist nie die einzige Quelle. */}
      <table className="kw-visually-hidden">
        <caption>{`${METRIC_LABEL[metric]} je Tag, ${model.page.label}`}</caption>
        <tbody>
          {model.series.map((point) => (
            <tr key={point.date}>
              <th scope="row">{formatDate(point.date)}</th>
              <td>{point.value === null ? "keine Daten" : formatMetric(metric, point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export default function PagePerformance() {
  const { pageOptions, gscDaily, gscDimensions, range, ga4Daily, ga4TimeZone } =
    useWorkspace();
  const [pageKey, setPageKey] = useState<string | null>(null);
  const [metric, setMetric] = useState<CanvasMetric>("clicks");

  const activePage = pageOptions.find((p) => p.key === pageKey) ?? pageOptions[0] ?? null;

  const model = useMemo(
    () =>
      activePage
        ? buildPagePerformance({
            page: activePage,
            daily: gscDaily,
            dimensions: gscDimensions,
            range,
            metric,
          })
        : null,
    [activePage, gscDaily, gscDimensions, range, metric],
  );

  // GA4 rechnet über EXAKT den Zeitraum, den das SEO-Modell ermittelt hat.
  // Würde Analytics sein Fenster am eigenen Datenstand verankern, verglichen
  // die beiden Blöcke unbemerkt unterschiedliche Zeiträume.
  const ga4Model = useMemo(() => {
    if (!activePage || !model) return null;
    return buildGa4PageModel({
      rows: ga4Daily,
      scopeKey: ga4PageScopeKey(activePage.key),
      range: model.currentRange,
      previousRange: model.previousRange,
    });
  }, [activePage, model, ga4Daily]);

  // Keine einzige getrackte Seite hat einen aktiven Datensatz: ehrlich sagen,
  // statt einen leeren Bereich zu zeigen.
  if (pageOptions.length === 0) {
    return (
      <section className="kw-page-perf" aria-labelledby="kw-page-perf-title">
        <p className="kr-eyebrow kw-block-label">Seiten-Performance</p>
        <h3 className="kw-ex-canvas-title" id="kw-page-perf-title">
          Noch keine Seite ausgewertet
        </h3>
        <p className="kw-ex-canvas-explain">
          Für die in <code>lib/gsc/pageScopes.ts</code> hinterlegten Seiten liegt noch kein aktiver
          Datensatz vor. Nach dem nächsten erfolgreichen Sync erscheinen sie hier automatisch.
        </p>
      </section>
    );
  }

  return (
    <section className="kw-page-perf" aria-labelledby="kw-page-perf-title">
      <p className="kr-eyebrow kw-block-label">Seiten-Performance</p>

      <div className="kw-ex-canvas-head">
        <h3 className="kw-ex-canvas-title" id="kw-page-perf-title">
          {activePage?.label}
        </h3>
        {activePage && (
          <a className="kw-link kw-page-url" href={activePage.url} target="_blank" rel="noreferrer">
            {activePage.url.replace(/^https:\/\//, "")}
          </a>
        )}
      </div>
      <p className="kw-ex-canvas-explain">
        {activePage?.hint} Ausgewertet wird ausschließlich diese eine URL, ohne Unterseiten.
      </p>

      <div className="kw-ex-controls kw-page-controls">
        <div className="kw-bar-group" role="group" aria-label="Seite">
          {pageOptions.map((page) => (
            <button
              key={page.key}
              type="button"
              className="kw-chip"
              data-active={activePage?.key === page.key || undefined}
              aria-pressed={activePage?.key === page.key}
              onClick={() => setPageKey(page.key)}
            >
              {page.label}
            </button>
          ))}
        </div>
        <div className="kw-bar-group" role="group" aria-label="Metrik">
          {(Object.keys(METRIC_LABEL) as CanvasMetric[]).map((key) => (
            <button
              key={key}
              type="button"
              className="kw-chip"
              data-active={metric === key || undefined}
              aria-pressed={metric === key}
              onClick={() => setMetric(key)}
            >
              {METRIC_LABEL[key]}
            </button>
          ))}
        </div>
      </div>

      {!model ? (
        <p className="kw-chart-empty kr-meta">
          Für {activePage?.label} liegen im Zeitraum „{cockpitRangeLabel(range)}“ keine Daten vor.
        </p>
      ) : (
        <>
          <div className="kw-ex-kpis" role="list" aria-label={`Kennzahlen ${model.page.label}`}>
            {model.metrics.map((kpiModel) => (
              <div role="listitem" key={kpiModel.key}>
                <ExecutiveKpi model={kpiModel} />
              </div>
            ))}
          </div>

          <p className="kw-ex-canvas-explain kw-page-metric-explain">{METRIC_EXPLAIN[metric]}</p>
          <PageChart model={model} metric={metric} />

          <div className="kw-page-queries">
            <h4 className="kw-ex-canvas-title">Suchanfragen dieser Seite</h4>
            {model.topQueries.length === 0 ? (
              <p className="kr-meta">
                Für diese Seite hat Google keine Suchanfragen ausgewiesen. Sehr seltene Anfragen
                lässt Google aus Datenschutzgründen weg.
              </p>
            ) : (
              <>
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
                      {model.topQueries.map((row) => (
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
                {model.queryPeriod && (
                  <p className="kr-meta kw-page-query-note">
                    Suchanfragen sind ein Aggregat über {formatDate(model.queryPeriod.start)} bis{" "}
                    {formatDate(model.queryPeriod.end)} und folgen dem Zeitraum-Schalter oben nicht.
                  </p>
                )}
              </>
            )}
          </div>

          <PageTrafficPanel
            model={ga4Model}
            timeZone={ga4TimeZone}
            pageLabel={model.page.label}
          />

          {model.brandSplit && (
            <BrandSplitPanel split={model.brandSplit} rangeLabel={model.rangeLabel} />
          )}
        </>
      )}
    </section>
  );
}
