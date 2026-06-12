"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/context";

// The fan — one visible question detonating into the hidden sub-queries
// that actually feed the answer. Scroll drives the decomposition.

const N = 24; // nodes drawn in frame
const TOTAL = 30; // paths the counter reports — the fan exceeds the frame
const CX = 600;
const CY = 410;

// Golden-angle spread — organic, deterministic, no two nodes collinear.
// Three depth layers; nearer layers parallax harder and read larger.
const NODES = Array.from({ length: N }, (_, i) => {
  const angle = i * 2.39996; // golden angle in radians
  const layer = i % 3;
  const r = 195 + (i % 6) * 38 + layer * 26;
  // round so server- and client-rendered SVG attributes stringify identically
  const x = Math.round((CX + Math.cos(angle) * r * 1.42) * 100) / 100; // widen into the landscape frame
  const y = Math.round((CY + Math.sin(angle) * r * 0.74) * 100) / 100;
  return { x, y, layer };
});

export default function FanOut() {
  const t = useTranslations();
  const fo = t.insightsPage.fanout;
  const reduced = useReducedMotion();

  const outerRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(0);
  const [count, setCount] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const r = Math.max(0, Math.min(N, Math.floor(((p - 0.07) / 0.55) * N)));
    setRevealed((prev) => (prev === r ? prev : r));
    const c = Math.max(0, Math.min(TOTAL, Math.floor(((p - 0.07) / 0.6) * TOTAL)));
    setCount((prev) => (prev === c ? prev : c));
  });

  const isStatic = reduced === true;
  const lit = isStatic ? N : revealed;
  const num = isStatic ? TOTAL : count;

  // Depth parallax — each layer drifts at its own rate while the fan opens
  const spring = { stiffness: 70, damping: 22 };
  const yFar = useSpring(useTransform(scrollYProgress, [0, 1], [30, -30]), spring);
  const yMid = useSpring(useTransform(scrollYProgress, [0, 1], [60, -70]), spring);
  const yNear = useSpring(useTransform(scrollYProgress, [0, 1], [110, -130]), spring);
  const scaleNear = useTransform(scrollYProgress, [0, 1], [0.98, 1.05]);

  // End state — the fan dims, the verdict lands
  const fanDim = useTransform(scrollYProgress, [0.66, 0.82], [1, 0.14]);
  const endIn = useTransform(scrollYProgress, [0.74, 0.88], [0, 1]);
  const endY = useTransform(scrollYProgress, [0.74, 0.88], [36, 0]);
  const pillDim = useTransform(scrollYProgress, [0.66, 0.82], [1, 0.25]);

  const layerY = [yFar, yMid, yNear];

  return (
    <section
      ref={outerRef}
      className={`fo-outer${isStatic ? " fo-outer--static" : ""}`}
      aria-label={fo.chip}
    >
      <div className="fo-sticky">
        {/* Header row */}
        <div className="fo-head">
          <span className="fo-chip">02</span>
          <span className="fo-chip">{fo.chip}</span>
          <span className="fo-chip fo-chip--live">
            <span className="fo-live-pip" aria-hidden="true" />
            {fo.label}
          </span>
        </div>

        {/* Statement — top left, above the fan */}
        <div className="fo-statement">
          <h2 className="fo-headline">
            {fo.headline} <em>{fo.headlineItalic}</em>
          </h2>
          <p className="fo-copy">{fo.copy}</p>
        </div>

        {/* The fan — three parallax depth layers */}
        <motion.div
          className="fo-fan"
          style={{ opacity: isStatic ? 1 : fanDim }}
          aria-hidden="true"
        >
          {[0, 1, 2].map((layer) => (
            <motion.svg
              key={layer}
              viewBox="0 0 1200 820"
              preserveAspectRatio="xMidYMid slice"
              className={`fo-svg fo-svg--l${layer}`}
              style={
                isStatic
                  ? undefined
                  : { y: layerY[layer], scale: layer === 2 ? scaleNear : 1 }
              }
            >
              {NODES.map((n, i) => {
                if (n.layer !== layer) return null;
                const on = i < lit;
                const label = fo.subqueries[i] ?? "";
                const left = n.x < CX;
                return (
                  <g key={i} className={`fo-node${on ? " fo-node--on" : ""}`}>
                    <line
                      x1={CX}
                      y1={CY}
                      x2={n.x}
                      y2={n.y}
                      pathLength={1}
                      className="fo-line"
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle cx={n.x} cy={n.y} r={3.5} className="fo-dot" />
                    <circle cx={n.x} cy={n.y} r={14} className="fo-ping" />
                    <text
                      x={left ? n.x - 12 : n.x + 12}
                      y={n.y + 4}
                      textAnchor={left ? "end" : "start"}
                      className={`fo-label fo-label--l${layer}`}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </motion.svg>
          ))}

          {/* The visible question — origin of the fan */}
          <motion.div className="fo-pill" style={{ opacity: isStatic ? 1 : pillDim }}>
            <span className="fo-pill-key">{fo.queryKey}</span>
            <span className="fo-pill-query">“{fo.query}”</span>
          </motion.div>
        </motion.div>

        {/* Counter */}
        <div className="fo-counter" aria-hidden="true">
          <span className="fo-counter-key">{fo.counterKey}</span>
          <span className="fo-counter-val">
            {String(num).padStart(2, "0")}
            <span className="fo-counter-total"> / {TOTAL}</span>
          </span>
        </div>

        {/* The verdict */}
        <div className="fo-end-wrap">
          <motion.div
            className="fo-end"
            style={isStatic ? undefined : { opacity: endIn, y: endY }}
          >
            <p className="fo-end-statement">
              {fo.endRoman} <em>{fo.endItalic}</em>
            </p>
            <p className="fo-end-note">{fo.endNote}</p>
          </motion.div>
        </div>
      </div>

      <style>{`
        .fo-outer {
          position: relative;
          height: 380vh;
          background: var(--paper);
          border-bottom: 1px solid var(--warm-black);
        }
        .fo-outer--static { height: auto; }
        .fo-sticky {
          position: sticky;
          top: 0;
          height: 100svh;
          overflow: hidden;
        }
        .fo-outer--static .fo-sticky {
          position: static;
          height: auto;
          min-height: 720px;
        }

        .fo-head {
          position: absolute;
          top: 0;
          left: 64px;
          right: 64px;
          z-index: 4;
          display: flex;
          gap: 16px;
          padding: 96px 0 0;
        }
        .fo-chip {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .fo-chip--live {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: var(--text-secondary);
        }
        .fo-live-pip {
          width: 6px;
          height: 6px;
          background: var(--olive);
          animation: fo-blink 1.2s steps(1) infinite;
        }
        @keyframes fo-blink { 50% { opacity: 0.25; } }

        .fo-statement {
          position: absolute;
          top: 132px;
          left: 64px;
          z-index: 4;
          max-width: 460px;
        }
        .fo-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(28px, 3vw, 44px);
          line-height: 1.1;
          color: var(--warm-black);
          margin: 0 0 14px;
        }
        .fo-headline em { font-style: italic; }
        .fo-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 13px;
          line-height: 1.65;
          color: var(--text-muted);
          margin: 0;
          max-width: 360px;
        }

        /* ── Fan ───────────────────────────────────────── */
        .fo-fan { position: absolute; inset: 0; }
        .fo-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .fo-svg--l0 { opacity: 0.45; }
        .fo-svg--l1 { opacity: 0.72; }

        .fo-node .fo-line {
          stroke: var(--warm-black);
          stroke-width: 1;
          opacity: 0;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          transition: stroke-dashoffset 750ms cubic-bezier(.16,1,.3,1), opacity 300ms ease;
        }
        .fo-node--on .fo-line {
          opacity: 0.32;
          stroke-dashoffset: 0;
        }
        .fo-dot {
          fill: var(--olive);
          opacity: 0;
          transform: scale(0);
          transform-origin: center;
          transform-box: fill-box;
          transition: opacity 300ms ease 480ms, transform 500ms cubic-bezier(.16,1,.3,1) 480ms;
        }
        .fo-node--on .fo-dot { opacity: 1; transform: scale(1); }
        .fo-ping {
          fill: none;
          stroke: var(--olive);
          stroke-width: 1;
          opacity: 0;
          transform-origin: center;
          transform-box: fill-box;
        }
        .fo-node--on .fo-ping {
          animation: fo-ping 1.4s cubic-bezier(.16,1,.3,1) 0.5s both;
        }
        @keyframes fo-ping {
          0%   { transform: scale(0.2); opacity: 0.8; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .fo-label {
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          letter-spacing: 0.06em;
          fill: var(--text-secondary);
          opacity: 0;
          transition: opacity 500ms ease 550ms;
        }
        .fo-label--l0 { font-size: 11px; fill: var(--text-muted); }
        .fo-label--l2 { font-size: 14.5px; fill: var(--warm-black); }
        .fo-node--on .fo-label { opacity: 1; }

        /* ── The pill ──────────────────────────────────── */
        .fo-pill {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 18px 26px;
          border: 1px solid var(--warm-black);
          background: var(--paper);
          box-shadow: 0 0 0 8px color-mix(in srgb, var(--paper) 65%, transparent);
          max-width: min(460px, 86vw);
        }
        .fo-pill-key {
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.26em;
          color: var(--dust);
        }
        .fo-pill-query {
          font-family: var(--font-editorial), serif;
          font-style: italic;
          font-size: clamp(17px, 1.8vw, 23px);
          line-height: 1.3;
          color: var(--warm-black);
        }

        /* ── Counter ───────────────────────────────────── */
        .fo-counter {
          position: absolute;
          left: 64px;
          bottom: 40px;
          z-index: 4;
          display: flex;
          align-items: baseline;
          gap: 18px;
          padding-top: 14px;
          border-top: 1px solid var(--warm-black);
          min-width: 280px;
        }
        .fo-counter-key {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          color: var(--dust);
        }
        .fo-counter-val {
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: 46px;
          line-height: 1;
          color: var(--warm-black);
          font-variant-numeric: tabular-nums;
        }
        .fo-counter-total {
          font-size: 18px;
          font-weight: 700;
          color: var(--dust);
        }

        /* ── The verdict ───────────────────────────────── */
        .fo-end-wrap {
          position: absolute;
          inset: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .fo-end {
          text-align: center;
          width: min(820px, 90vw);
        }
        .fo-end-statement {
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(36px, 5.4vw, 84px);
          line-height: 1.02;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: var(--warm-black);
          margin: 0 0 22px;
        }
        .fo-end-statement em {
          display: block;
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-style: italic;
          text-transform: none;
          font-size: 0.78em;
          letter-spacing: 0;
        }
        .fo-end-note {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.24em;
          color: var(--text-muted);
          margin: 0;
        }

        /* Static / reduced-motion verdict sits in flow */
        .fo-outer--static .fo-end-wrap {
          position: static;
        }
        .fo-outer--static .fo-end {
          margin: 0 auto;
          padding: 48px 24px 80px;
        }
        .fo-outer--static .fo-sticky { padding-bottom: 0; }

        /* ── Mobile — compact static fan ───────────────── */
        @media (max-width: 900px) {
          .fo-outer { height: 300vh; }
          .fo-head { left: 24px; right: 24px; padding-top: 76px; }
          .fo-chip--live { display: none; }
          .fo-statement { left: 24px; right: 24px; top: 104px; }
          .fo-copy { display: none; }
          .fo-label { font-size: 17px; }
          .fo-label--l0 { display: none; }
          .fo-counter { left: 24px; bottom: 28px; min-width: 0; }
          .fo-counter-val { font-size: 34px; }
          .fo-pill { padding: 14px 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .fo-node .fo-line, .fo-dot, .fo-label {
            transition: none;
            opacity: 1;
          }
          .fo-node .fo-line { stroke-dashoffset: 0; opacity: 0.32; }
          .fo-dot { transform: scale(1); }
          .fo-node--on .fo-ping, .fo-live-pip { animation: none; }
        }
      `}</style>
    </section>
  );
}
