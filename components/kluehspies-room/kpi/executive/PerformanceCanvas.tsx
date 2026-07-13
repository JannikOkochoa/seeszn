"use client";

// ─── Performance Canvas ───────────────────────────────────────────────────────
// Der zentrale Chart des Executive Cockpits: eine Hauptmetrik (Klicks,
// Impressionen, CTR oder Position) über 7/28/90 Tage oder den Gesamtzeitraum,
// mit dünner, klar beschrifteter Vergleichslinie der Vorperiode. Bei Position
// gilt: eine kleinere Zahl ist besser – die Beschriftung sagt das explizit.
// Ziellinie nur, wenn ein echtes editierbares KPI-Ziel existiert (nur Klicks).
// Annotationen zeigen ausschließlich echte, von Nutzern angelegte Ereignisse;
// ohne Ereignisse bleibt der Chart ehrlich leer.
//
// Animation: Die Hauptlinie zeichnet sich nur beim ersten Laden dezent ein
// (~0,6 s); Daten-/Zeitraumwechsel blenden ruhig über (~0,18 s). Bei
// prefers-reduced-motion entfällt beides. Vollständig per Tastatur bedienbar,
// Werte stehen zusätzlich in einer visuell versteckten Tabelle.

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  cockpitRangeLabel,
  metricDailySeries,
  type CanvasMetric,
} from "@/lib/kpi/gscData";
import type { SeriesPoint } from "@/lib/kpi/aggregate";
import { formatDate, formatDateShort, formatNumber } from "@/lib/kpi/format";
import PerformanceControls, { METRIC_LABEL } from "./PerformanceControls";
import PerformanceTooltip from "./PerformanceTooltip";
import { useWorkspace } from "../workspace";

const W = 960;
const H = 320;
const PAD = { l: 52, r: 24, t: 18, b: 42 };

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

export default function PerformanceCanvas() {
  const {
    scopeDailyRows,
    currentRange,
    previousRange,
    gscComparison,
    gscProvenance,
    activeScope,
    range,
    annotations,
    activeTarget,
    targetLine,
    setKpiDrawerOpen,
  } = useWorkspace();

  const [metric, setMetric] = useState<CanvasMetric>("clicks");
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();
  // Die Einzeichnen-Animation läuft nur beim ersten Laden; danach blenden
  // Daten- und Metrikwechsel nur noch ruhig über.
  const [hasDrawn, setHasDrawn] = useState(false);

  const hasPrevious = gscComparison !== null;

  const { series, previousSeries } = useMemo(() => {
    const current = metricDailySeries(scopeDailyRows, currentRange, metric);
    const previous = hasPrevious
      ? metricDailySeries(scopeDailyRows, previousRange, metric)
      : ([] as SeriesPoint[]);
    return { series: current, previousSeries: previous };
  }, [scopeDailyRows, currentRange, previousRange, metric, hasPrevious]);

  const showTarget = metric === "clicks" && activeTarget !== null;

  const chart = useMemo(() => {
    const n = series.length;
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const values = [
      ...series.map((p) => p.value),
      ...previousSeries.map((p) => p.value),
      ...(showTarget ? targetLine.map((p) => p.value) : []),
    ].filter((v): v is number => v !== null);

    let yMin = 0;
    let yMax = Math.max(1, ...values);
    if (metric === "position" && values.length > 0) {
      // Positionsskala eng an den Daten, nicht bei 0: die Achse bleibt lesbar.
      yMin = Math.max(0, Math.floor(Math.min(...values)) - 2);
      yMax = Math.ceil(Math.max(...values)) + 2;
    } else {
      yMax = yMax * 1.08;
    }

    const x = (i: number) => PAD.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = (v: number) => PAD.t + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH;

    const toPoints = (list: SeriesPoint[]) =>
      list.map((p, i) => (p.value === null ? null : { x: x(i), y: y(p.value) }));

    const gridValues = [0.25, 0.5, 0.75, 1].map((f) => yMin + (yMax - yMin) * f);

    const annotationsInRange = annotations.filter(
      (a) => a.date >= currentRange.from && a.date <= currentRange.to,
    );
    const dateIndex = new Map(series.map((p, i) => [p.date, i]));

    return {
      n,
      innerW,
      innerH,
      x,
      y,
      curPts: toPoints(series),
      prevPts: toPoints(previousSeries),
      targetPts: showTarget ? toPoints(targetLine) : [],
      gridValues,
      annotationsInRange,
      dateIndex,
    };
  }, [series, previousSeries, targetLine, showTarget, metric, annotations, currentRange]);

  const activePoint = active !== null ? series[active] : null;
  const activePrev = active !== null && hasPrevious ? previousSeries[active] : null;
  const tooltipLeft =
    active !== null && chart.n > 1
      ? ((PAD.l + (active / (chart.n - 1)) * chart.innerW) / W) * 100
      : 50;

  function onKeyDown(event: React.KeyboardEvent) {
    if (chart.n === 0) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive((i) => Math.min(chart.n - 1, (i ?? -1) + 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive((i) => Math.max(0, (i ?? chart.n) - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(chart.n - 1);
    } else if (event.key === "Escape") {
      setActive(null);
    }
  }

  const metricLabel = METRIC_LABEL[metric];
  const chartSummary =
    `${metricLabel} für ${activeScope?.label ?? "den gewählten Scope"}, ` +
    `${formatDate(currentRange.from)} bis ${formatDate(currentRange.to)}` +
    (hasPrevious ? ", mit Vergleichslinie der Vorperiode." : ", ohne Vorperiodenvergleich.") +
    (metric === "position" ? " Eine kleinere Position ist besser." : "");

  // key erzwingt bei Daten- oder Metrikwechsel einen ruhigen Crossfade.
  const dataKey = `${metric}|${String(range)}|${activeScope?.key ?? ""}`;

  return (
    <section className="kw-ex-canvas" aria-label="Organische Entwicklung">
      <div className="kw-ex-canvas-head">
        <h3 className="kw-ex-canvas-title">Organische Entwicklung</h3>
        <PerformanceControls metric={metric} onMetricChange={setMetric} />
      </div>

      <figure className="kw-chart kw-ex-chart">
        <div className="kw-chart-frame">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={chartSummary}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onMouseLeave={() => setActive(null)}
          >
            {/* Raster und Achsenwerte */}
            {chart.gridValues.map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={chart.y(v)} y2={chart.y(v)} className="kw-grid" />
                <text x={PAD.l - 10} y={chart.y(v) + 3} textAnchor="end" className="kw-tick">
                  {formatMetric(metric, v)}
                </text>
              </g>
            ))}
            <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} className="kw-axis" />

            {/* Datumsachse: Anfang, Mitte, Ende */}
            {chart.n > 0 && (
              <>
                <text x={chart.x(0)} y={H - 12} textAnchor="start" className="kw-tick">
                  {formatDateShort(series[0].date)}
                </text>
                {chart.n > 4 && (
                  <text
                    x={chart.x(Math.floor((chart.n - 1) / 2))}
                    y={H - 12}
                    textAnchor="middle"
                    className="kw-tick"
                  >
                    {formatDateShort(series[Math.floor((chart.n - 1) / 2)].date)}
                  </text>
                )}
                <text x={chart.x(chart.n - 1)} y={H - 12} textAnchor="end" className="kw-tick">
                  {formatDateShort(series[chart.n - 1].date)}
                </text>
              </>
            )}

            <motion.g
              key={dataKey}
              initial={reduced || !hasDrawn ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {/* Ziellinie: nur echtes, editierbares Ziel (Klicks pro Tag). */}
              {chart.targetPts.length > 0 && (
                <path d={buildPath(chart.targetPts)} fill="none" className="kw-line-target" />
              )}

              {/* Vorperiode: dünner, gedeckt, gestrichelt. */}
              {hasPrevious && (
                <path d={buildPath(chart.prevPts)} fill="none" className="kw-line-prev" />
              )}

              {/* Aktuelle Periode: die eine ruhige Hauptlinie. */}
              <motion.path
                d={buildPath(chart.curPts)}
                fill="none"
                className="kw-line-cur"
                initial={reduced || hasDrawn ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                onAnimationComplete={() => {
                  if (!hasDrawn) setHasDrawn(true);
                }}
              />
            </motion.g>

            {/* Echte Annotationen (von Nutzern angelegte Ereignisse). */}
            {chart.annotationsInRange.map((a) => {
              const index = chart.dateIndex.get(a.date);
              if (index === undefined) return null;
              return (
                <g
                  key={a.id}
                  className="kw-ann"
                  role="button"
                  tabIndex={0}
                  aria-label={`Ereignis am ${formatDate(a.date)}: ${a.title}. Öffnet die Detailansicht.`}
                  onClick={() => setKpiDrawerOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setKpiDrawerOpen(true);
                    }
                  }}
                >
                  <rect
                    x={chart.x(index) - 4}
                    y={H - PAD.b + 8}
                    width={8}
                    height={8}
                    className="kw-ann-mark"
                  >
                    <title>{`${formatDate(a.date)} · ${a.title}`}</title>
                  </rect>
                </g>
              );
            })}

            {/* Crosshair + aktiver Punkt */}
            {active !== null && activePoint?.value !== null && activePoint && (
              <g aria-hidden="true">
                <line
                  x1={chart.x(active)}
                  x2={chart.x(active)}
                  y1={PAD.t}
                  y2={H - PAD.b}
                  className="kw-cross"
                />
                <circle cx={chart.x(active)} cy={chart.y(activePoint.value)} r={4} className="kw-point" />
              </g>
            )}

            {/* Hover-Zonen */}
            {series.map((p, i) => (
              <rect
                key={p.date}
                x={chart.x(i) - chart.innerW / Math.max(1, chart.n - 1) / 2}
                y={PAD.t}
                width={chart.innerW / Math.max(1, chart.n - 1)}
                height={chart.innerH}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
              />
            ))}
          </svg>

          {active !== null && activePoint && activePoint.value !== null && (
            <PerformanceTooltip
              date={activePoint.date}
              currentLabel={metricLabel}
              currentValue={formatMetric(metric, activePoint.value)}
              previousDate={activePrev?.date ?? null}
              previousValue={
                activePrev && activePrev.value !== null
                  ? formatMetric(metric, activePrev.value)
                  : null
              }
              left={Math.min(Math.max(tooltipLeft, 12), 88)}
            />
          )}
        </div>

        {/* Werte zusätzlich als Tabelle für Screenreader. */}
        <figcaption className="kw-visually-hidden">
          <table>
            <caption>{chartSummary}</caption>
            <thead>
              <tr>
                <th scope="col">Datum</th>
                <th scope="col">{metricLabel}</th>
                {hasPrevious && <th scope="col">Vorperiode</th>}
              </tr>
            </thead>
            <tbody>
              {series.map((p, i) => (
                <tr key={p.date}>
                  <td>{formatDate(p.date)}</td>
                  <td>{p.value === null ? "keine Daten" : formatMetric(metric, p.value)}</td>
                  {hasPrevious && (
                    <td>
                      {previousSeries[i]?.value == null
                        ? "keine Daten"
                        : formatMetric(metric, previousSeries[i].value as number)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </figcaption>
      </figure>

      <div className="kw-legend" aria-hidden="true">
        <span>
          <i className="kw-key" /> Aktuelle Periode
        </span>
        {hasPrevious && (
          <span>
            <i className="kw-key kw-key--prev" /> Vorperiode
          </span>
        )}
        {chart.targetPts.length > 0 && (
          <span>
            <i className="kw-key kw-key--target" /> Ziel (manuell gepflegt)
          </span>
        )}
        {chart.annotationsInRange.length > 0 && (
          <span>
            <i className="kw-key kw-key--ann" /> Ereignis
          </span>
        )}
      </div>

      <p className="kr-meta kw-chart-note">
        {cockpitRangeLabel(range)} · {formatDate(currentRange.from)} bis{" "}
        {formatDate(currentRange.to)}
        {gscProvenance?.dataAsOf && <> · Datenstand {formatDate(gscProvenance.dataAsOf)}</>}
        {metric === "position" && <> · Position: niedriger ist besser</>}
        {!hasPrevious && <> · Gesamtzeitraum ohne Vorperiodenvergleich</>}
      </p>
    </section>
  );
}
