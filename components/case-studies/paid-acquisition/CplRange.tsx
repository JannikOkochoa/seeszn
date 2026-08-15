import { PA_CPL_BOUNDS, PA_FIGURES } from "@/lib/case-studies/paid-acquisition";

// ─── Cost per lead — observed ranges ─────────────────────────────────────────
// A range chart, not a time series. Only two things are documented: the earlier
// observed CPL range and the later one. There is no monthly history, so none is
// drawn — the horizontal axis carries two positions and no dates.
//
// The two numbers are HTML set at display scale and the band between them is
// the only drawn element. There is no plot frame, no axis and no gridline: the
// chart is two numerals with a falling shape between them, which is the whole
// finding. Anything else would be analytics-software furniture.
//
// Rendered on the server as plain SVG geometry — no chart library, no client
// JavaScript.

const VB = { w: 1000, h: 360 };
const TOP = 30;
const BOTTOM = 330;
// Inset so the 6px end markers are not half-clipped by the viewBox edge.
const X_FROM = 5;
const X_TO = 995;

// Value domain, derived from the observed bounds with a little air above and
// below so the band never touches the edge of its box.
const MIN = PA_CPL_BOUNDS.toLow - 10;
const MAX = PA_CPL_BOUNDS.fromHigh + 14;

const y = (v: number) => TOP + ((MAX - v) / (MAX - MIN)) * (BOTTOM - TOP);

const yFromHigh = y(PA_CPL_BOUNDS.fromHigh);
const yFromLow = y(PA_CPL_BOUNDS.fromLow);
const yToHigh = y(PA_CPL_BOUNDS.toHigh);
const yToLow = y(PA_CPL_BOUNDS.toLow);

// Two eased curves. Same shape, offset — they read as one falling band.
const upper = `M${X_FROM} ${yFromHigh} C 340 ${yFromHigh + 26} 620 ${yToHigh - 24} ${X_TO} ${yToHigh}`;
const lower = `M${X_FROM} ${yFromLow} C 340 ${yFromLow + 24} 620 ${yToLow - 14} ${X_TO} ${yToLow}`;
const band =
  `${upper} L ${X_TO} ${yToLow} ` +
  `C 620 ${yToLow - 14} 340 ${yFromLow + 24} ${X_FROM} ${yFromLow} Z`;

export default function CplRange() {
  return (
    <figure className="pa-chart" data-reveal>
      <div className="pa-chart-row">
        <p className="pa-cpl-end pa-cpl-from">
          <b>{PA_FIGURES.cplFrom}</b>
          <span>Earlier period</span>
        </p>

        <div className="pa-plot">
          <svg
            className="pa-plot-svg"
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path className="pa-band" d={band} />
            <line className="pa-range pa-range-from" x1={X_FROM} y1={yFromHigh} x2={X_FROM} y2={yFromLow} />
            <line className="pa-range pa-range-to" x1={X_TO} y1={yToHigh} x2={X_TO} y2={yToLow} />
            <path className="pa-draw pa-curve" d={upper} pathLength={1} />
            <path className="pa-draw pa-curve" d={lower} pathLength={1} />
          </svg>
        </div>

        <p className="pa-cpl-end pa-cpl-to">
          <b>{PA_FIGURES.cplTo}</b>
          <span>Later period</span>
        </p>
      </div>

      <figcaption className="pa-chart-foot">
        <span>Observed CPL ranges</span>
        <i>Two observed ranges, not a monthly history.</i>
      </figcaption>
    </figure>
  );
}
