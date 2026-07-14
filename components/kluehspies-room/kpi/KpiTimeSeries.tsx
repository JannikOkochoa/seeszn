"use client";

// ─── KPI-Zeitverlauf ──────────────────────────────────────────────────────────
// Sehr reduzierte Linien im Raumstil: aktuelle Periode (Ink, durchgezogen),
// Vorperiode (gedeckt, gestrichelt), Zielkurve (dünne Schwelle) und
// Annotationen als kleine Marker. Crosshair-Tooltip zeigt alle Reihen am
// selben Tag; vollständig per Tastatur bedienbar; die Daten stehen zusätzlich
// in einer visuell versteckten Tabelle.

import { useMemo, useRef, useState } from "react";
import type { AnnotationRow } from "@/lib/kpi/types";
import type { SeriesPoint } from "@/lib/kpi/aggregate";
import { formatDate, formatDateShort, formatNumber } from "@/lib/kpi/format";

interface KpiTimeSeriesProps {
  series: SeriesPoint[];
  previousSeries: SeriesPoint[];
  targetLine: SeriesPoint[];
  annotations: AnnotationRow[];
  isFiltered: boolean;
  onAnnotationOpen: (annotation: AnnotationRow) => void;
}

const W = 860;
const H = 300;
const PAD = { l: 44, r: 78, t: 16, b: 44 };

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

export default function KpiTimeSeries({
  series,
  previousSeries,
  targetLine,
  annotations,
  isFiltered,
  onAnnotationOpen,
}: KpiTimeSeriesProps) {
  const [active, setActive] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const n = series.length;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const { x, y, yMax, curPts, prevPts, targetPts, annByIndex } = useMemo(() => {
    const values = [
      ...series.map((p) => p.value ?? 0),
      ...previousSeries.map((p) => p.value ?? 0),
      ...targetLine.map((p) => p.value ?? 0),
    ];
    const rawMax = Math.max(1, ...values);
    const yMax = Math.ceil((rawMax * 1.12) / 10) * 10;
    const x = (i: number) => PAD.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = (v: number) => PAD.t + innerH - (v / yMax) * innerH;
    const toPts = (s: SeriesPoint[]) =>
      s.map((p, i) => (p.value === null ? null : { x: x(i), y: y(p.value) }));
    const dateIndex = new Map(series.map((p, i) => [p.date, i]));
    const annByIndex = new Map<number, AnnotationRow[]>();
    for (const a of annotations) {
      const idx = dateIndex.get(a.date);
      if (idx === undefined) continue;
      annByIndex.set(idx, [...(annByIndex.get(idx) ?? []), a]);
    }
    return {
      x,
      y,
      yMax,
      curPts: toPts(series),
      prevPts: toPts(previousSeries),
      targetPts: toPts(targetLine),
      annByIndex,
    };
  }, [series, previousSeries, targetLine, annotations, n, innerW, innerH]);

  const gridValues = [Math.round(yMax / 3), Math.round((yMax * 2) / 3), yMax];
  const lastIdx = (() => {
    for (let i = n - 1; i >= 0; i--) if (series[i].value !== null) return i;
    return null;
  })();
  const activeTargetValue = targetLine.length > 0 ? targetLine[targetLine.length - 1].value : null;
  const hasTarget = targetLine.some((p) => p.value !== null);
  const hasData = series.some((p) => p.value !== null);

  function indexFromPointer(clientX: number): number {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const rel = ((clientX - rect.left) / rect.width) * W;
    const t = (rel - PAD.l) / innerW;
    return Math.max(0, Math.min(n - 1, Math.round(t * (n - 1))));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (n === 0) return;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = Math.min(n - 1, (active ?? -1) + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, (active ?? n) - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else if (e.key === "Escape") {
      setActive(null);
      return;
    } else return;
    e.preventDefault();
    setActive(next);
  }

  if (!hasData) {
    return (
      <div className="kw-chart-empty">
        <p className="kr-meta">
          Für diesen Zeitraum und Filter liegen keine Daten vor. Zeitraum wechseln oder Filter
          zurücksetzen.
        </p>
      </div>
    );
  }

  const activePoint = active !== null ? series[active] : null;
  const tooltipLeftPct = active !== null ? (x(active) / W) * 100 : 0;

  return (
    <figure className="kw-chart">
      <div className="kw-chart-frame">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Zeitverlauf der organischen Klicks: aktuelle Periode, Vorperiode und Zielkurve. Mit den Pfeiltasten lassen sich die Tageswerte ablesen.`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerMove={(e) => setActive(indexFromPointer(e.clientX))}
          onPointerLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
        >
          {/* Ruhiges Raster: zwei Hilfslinien + Basislinie, alles Hairlines */}
          {gridValues.map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="kw-grid" />
              <text x={PAD.l - 8} y={y(v) + 3} textAnchor="end" className="kw-tick">
                {formatNumber(v)}
              </text>
            </g>
          ))}
          <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} className="kw-axis" />

          {/* Zielkurve: dünne Schwelle mit Label */}
          <path d={buildPath(targetPts)} className="kw-line-target" fill="none" />
          {activeTargetValue !== null && (
            <text x={W - PAD.r + 8} y={y(activeTargetValue) + 3} className="kw-target-label">
              Ziel {formatNumber(activeTargetValue)}
            </text>
          )}

          {/* Vorperiode */}
          <path d={buildPath(prevPts)} className="kw-line-prev" fill="none" />

          {/* Aktuelle Periode */}
          <path d={buildPath(curPts)} className="kw-line-cur" fill="none" />

          {/* Direktlabel am Endpunkt */}
          {lastIdx !== null && curPts[lastIdx] && (
            <>
              <circle cx={curPts[lastIdx]!.x} cy={curPts[lastIdx]!.y} r={4} className="kw-point" />
              <text x={curPts[lastIdx]!.x + 10} y={curPts[lastIdx]!.y + 4} className="kw-dl">
                {formatNumber(series[lastIdx].value ?? 0)}
              </text>
            </>
          )}

          {/* Achse: erster und letzter Tag */}
          <text x={PAD.l} y={H - 24} textAnchor="start" className="kw-tick">
            {formatDateShort(series[0].date)}
          </text>
          <text x={W - PAD.r} y={H - 24} textAnchor="end" className="kw-tick">
            {formatDateShort(series[n - 1].date)}
          </text>

          {/* Annotationen: kleine Marker unter der Basislinie */}
          {[...annByIndex.entries()].map(([idx, list]) => (
            <g
              key={idx}
              role="button"
              tabIndex={0}
              className="kw-ann"
              aria-label={`Annotation am ${formatDate(series[idx].date)}: ${list.map((a) => a.title).join(", ")}. Öffnen mit Enter.`}
              onClick={() => onAnnotationOpen(list[0])}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onAnnotationOpen(list[0]);
                }
              }}
            >
              <rect x={x(idx) - 9} y={y(0) + 4} width={18} height={16} fill="transparent" />
              <rect x={x(idx) - 4} y={y(0) + 7} width={8} height={8} className="kw-ann-mark" />
            </g>
          ))}

          {/* Crosshair */}
          {active !== null && (
            <g aria-hidden="true">
              <line x1={x(active)} x2={x(active)} y1={PAD.t} y2={y(0)} className="kw-cross" />
              {curPts[active] && (
                <circle cx={curPts[active]!.x} cy={curPts[active]!.y} r={4.5} className="kw-point" />
              )}
              {prevPts[active] && (
                <circle cx={prevPts[active]!.x} cy={prevPts[active]!.y} r={3.5} className="kw-point kw-point--prev" />
              )}
            </g>
          )}
        </svg>

        {/* Tooltip: eine Anzeige, alle Reihen */}
        {active !== null && activePoint && (
          <div
            className="kw-tip"
            style={{ left: `${tooltipLeftPct}%` }}
            role="status"
            aria-live="polite"
          >
            <span className="kw-tip-date">{formatDate(activePoint.date)}</span>
            <span className="kw-tip-row">
              <i className="kw-key kw-key--cur" aria-hidden="true" />
              <strong>{activePoint.value === null ? "–" : formatNumber(activePoint.value)}</strong>
              <span>Aktuell</span>
            </span>
            <span className="kw-tip-row">
              <i className="kw-key kw-key--prev" aria-hidden="true" />
              <strong>
                {previousSeries[active]?.value == null ? "–" : formatNumber(previousSeries[active].value!)}
              </strong>
              <span>Vorperiode ({formatDateShort(previousSeries[active]?.date ?? "")})</span>
            </span>
            {targetLine[active]?.value != null && (
              <span className="kw-tip-row">
                <i className="kw-key kw-key--target" aria-hidden="true" />
                <strong>{formatNumber(targetLine[active].value!)}</strong>
                <span>Ziel</span>
              </span>
            )}
            {annByIndex.has(active) && (
              <span className="kw-tip-ann">{annByIndex.get(active)!.map((a) => a.title).join(" · ")}</span>
            )}
          </div>
        )}
      </div>

      {/* Legende */}
      <div className="kw-legend" aria-hidden="true">
        <span>
          <i className="kw-key kw-key--cur" /> Aktuelle Periode
        </span>
        <span>
          <i className="kw-key kw-key--prev" /> Vorperiode
        </span>
        {hasTarget && (
          <span>
            <i className="kw-key kw-key--target" /> Ziel
          </span>
        )}
        {annotations.length > 0 && (
          <span>
            <i className="kw-key kw-key--ann" /> Annotation
          </span>
        )}
      </div>
      {isFiltered && (
        <p className="kr-meta kw-chart-note">
          Gefilterte Ansicht aus den Rohdaten. Das Ziel bezieht sich auf alle Produktseiten und Geräte.
        </p>
      )}

      {/* Vollständige Werte ohne Hover erreichbar */}
      <figcaption className="kw-visually-hidden">
        <table>
          <caption>Organische Klicks pro Tag: aktuelle Periode, Vorperiode und Ziel</caption>
          <thead>
            <tr>
              <th scope="col">Datum</th>
              <th scope="col">Klicks</th>
              <th scope="col">Vorperiode</th>
              <th scope="col">Ziel</th>
            </tr>
          </thead>
          <tbody>
            {series.map((p, i) => (
              <tr key={p.date}>
                <td>{formatDate(p.date)}</td>
                <td>{p.value ?? "–"}</td>
                <td>{previousSeries[i]?.value ?? "–"}</td>
                <td>{targetLine[i]?.value ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
