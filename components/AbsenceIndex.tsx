"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ── Cluster origin in SVG space ──────────────────────────────────
const CX = 248;
const CY = 222;

// ── Diagnostic callouts ──────────────────────────────────────────
// lx/ly = line endpoint, tx/ty = text anchor, len = stroke-dasharray length
const CALLOUTS = [
  { lx: 458, ly: 74,  tx: 464, ty: 74,  label: "PROMPT DRIFT",     anchor: "start", olive: false, len: 253, li: 0 },
  { lx: 483, ly: 182, tx: 489, ty: 182, label: "SOURCE GAPS",       anchor: "start", olive: false, len: 236, li: 1 },
  { lx: 460, ly: 295, tx: 466, ty: 295, label: "CITATION ABSENCE",  anchor: "start", olive: true,  len: 216, li: 2 },
  { lx: 444, ly: 372, tx: 450, ty: 372, label: "ENTITY WEAKNESS",   anchor: "start", olive: false, len: 246, li: 3 },
  { lx: CX,  ly: 412, tx: CX,  ty: 417, label: "COMPETITOR RECALL", anchor: "middle", olive: false, len: 190, li: 4 },
] as const;

// ── Dot field ────────────────────────────────────────────────────
// Generated center-outward so stagger delay creates outward materialization.
// Seeded RNG for hydration-safe determinism.
interface Dot { cx: number; cy: number; r: number; op: number; }

const DOTS: Dot[] = (() => {
  let s = 42;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  // Round to fixed precision so server-rendered HTML attributes match client re-render exactly.
  const f2 = (v: number) => Number(v.toFixed(2));
  const f3 = (v: number) => Number(v.toFixed(3));

  const out: Dot[] = [];

  // Core (r ≤ 22): densest, most opaque — appears first in animation
  for (let i = 0; i < 45; i++) {
    const a = rand() * Math.PI * 2, d = rand() * 22;
    out.push({ cx: f2(CX + d * Math.cos(a)), cy: f2(CY + d * Math.sin(a)), r: f2(1.6 + rand() * 1.8), op: f3(0.40 + rand() * 0.40) });
  }
  // Inner ring (r 18–55)
  for (let i = 0; i < 85; i++) {
    const a = rand() * Math.PI * 2, d = 18 + rand() * 37;
    out.push({ cx: f2(CX + d * Math.cos(a)), cy: f2(CY + d * Math.sin(a)), r: f2(1.2 + rand() * 1.6), op: f3(0.22 + rand() * 0.35) });
  }
  // Mid ring (r 48–102)
  for (let i = 0; i < 120; i++) {
    const a = rand() * Math.PI * 2, d = 48 + rand() * 54;
    out.push({ cx: f2(CX + d * Math.cos(a)), cy: f2(CY + d * Math.sin(a)), r: f2(0.9 + rand() * 1.3), op: f3(0.12 + rand() * 0.24) });
  }
  // Outer halo (r 90–186) — sparse, barely visible, fixed during hover
  for (let i = 0; i < 150; i++) {
    const a = rand() * Math.PI * 2, d = 90 + rand() * 96;
    out.push({ cx: f2(CX + d * Math.cos(a)), cy: f2(CY + d * Math.sin(a)), r: f2(0.7 + rand() * 1.1), op: f3(0.05 + rand() * 0.16) });
  }

  return out;
})();

export default function AbsenceIndex() {
  const t = useTranslations();
  const ai = t.absenceIndex;
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const nearRef    = useRef<SVGGElement>(null);  // dots 0–129, full repulsion
  const midRef     = useRef<SVGGElement>(null);  // dots 130–249, 38% repulsion

  const inView = useInView(sectionRef, { once: true, amount: 0.12 });

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.5, ease: EASE, delay },
  });

  // ── Hover repulsion — direct DOM writes, no React re-render ──
  function onSvgEnter() {
    nearRef.current && (nearRef.current.style.transition = "transform 55ms linear");
    midRef.current  && (midRef.current.style.transition  = "transform 55ms linear");
  }
  function onSvgMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left)  / rect.width)  * 600;
    const sy = ((e.clientY - rect.top)   / rect.height) * 460;
    const dx = sx - CX, dy = sy - CY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    // Repulsion strength: max 4px, fades with distance
    const str = Math.min(140 / dist, 1) * 4;
    const tx = -(dx / dist) * str;
    const ty = -(dy / dist) * str;
    if (nearRef.current) nearRef.current.style.transform = `translate(${tx}px,${ty}px)`;
    if (midRef.current)  midRef.current.style.transform  = `translate(${tx * .38}px,${ty * .38}px)`;
  }
  function onSvgLeave() {
    if (nearRef.current) {
      nearRef.current.style.transition = "transform 720ms cubic-bezier(.16,1,.3,1)";
      nearRef.current.style.transform  = "";
    }
    if (midRef.current) {
      midRef.current.style.transition = "transform 720ms cubic-bezier(.16,1,.3,1)";
      midRef.current.style.transform  = "";
    }
  }

  return (
    <section
      ref={sectionRef}
      className={`abs-section${inView ? " abs-visible" : ""}`}
    >
      {/* ── Label ── */}
      <motion.div {...anim(0)} className="abs-header">
        <span className="abs-chip">03</span>
        <span className="abs-chip">{ai.chip}</span>
      </motion.div>

      {/* ── Two-column grid ── */}
      <div className="abs-grid">

        {/* LEFT — text */}
        <div className="abs-left">
          <motion.h2 {...anim(0.08)} className="abs-headline">
            {ai.headlineRoman}
            <br />
            <em>{ai.headlineItalic}</em>
          </motion.h2>

          <motion.div {...anim(0.15)}>
            <span className="abs-stat">{ai.stat}</span>
          </motion.div>

          <motion.p {...anim(0.22)} className="abs-copy">
            {ai.copy.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </motion.p>

          <motion.div {...anim(0.28)} style={{ marginTop: 32 }}>
            <a
              href={t.locale === "de" ? "/research/absence-index" : "#contact"}
              className="abs-cta"
            >
              {t.locale === "de" ? "METHODIK ANSEHEN →" : ai.cta}
            </a>
          </motion.div>
        </div>

        {/* RIGHT — diagnostic cluster SVG */}
        <div className="abs-right">
          <svg
            ref={svgRef}
            viewBox="0 0 600 460"
            className="abs-svg"
            aria-label="Absence Index — diagnostic signal cluster"
            role="img"
            onMouseEnter={onSvgEnter}
            onMouseMove={onSvgMove}
            onMouseLeave={onSvgLeave}
          >
            {/* ── Outer halo — fixed, no repulsion ── */}
            <g id="absence-scatter-outer">
              {DOTS.slice(250).map((d, i) => (
                <circle
                  key={250 + i}
                  cx={d.cx} cy={d.cy} r={d.r}
                  fill="var(--ink)"
                  className="abs-dot"
                  style={{ "--di": 250 + i, "--op": d.op } as React.CSSProperties}
                />
              ))}
            </g>

            {/* ── Mid ring — partial repulsion ── */}
            <g id="absence-scatter-mid" ref={midRef}>
              {DOTS.slice(130, 250).map((d, i) => (
                <circle
                  key={130 + i}
                  cx={d.cx} cy={d.cy} r={d.r}
                  fill="var(--ink)"
                  className="abs-dot"
                  style={{ "--di": 130 + i, "--op": d.op } as React.CSSProperties}
                />
              ))}
            </g>

            {/* ── Core + inner ring — full repulsion ── */}
            <g id="absence-scatter-near" ref={nearRef}>
              {DOTS.slice(0, 130).map((d, i) => (
                <circle
                  key={i}
                  cx={d.cx} cy={d.cy} r={d.r}
                  fill="var(--ink)"
                  className="abs-dot"
                  style={{ "--di": i, "--op": d.op } as React.CSSProperties}
                />
              ))}
            </g>

            {/* ── Connector lines ── */}
            <g id="absence-callouts">
              {CALLOUTS.map((c) => (
                <line
                  key={c.label}
                  x1={CX} y1={CY}
                  x2={c.lx} y2={c.ly}
                  stroke="#BCB4AA"
                  strokeWidth={0.7}
                  className="abs-line"
                  style={{ "--len": c.len, "--li": c.li } as React.CSSProperties}
                />
              ))}
            </g>

            {/* ── Labels ── */}
            <g id="absence-labels">
              {CALLOUTS.map((c) => (
                <text
                  key={c.label}
                  x={c.tx} y={c.ty}
                  textAnchor={c.anchor}
                  fontFamily="var(--font-mono), monospace"
                  fontSize={8.5}
                  letterSpacing="0.115em"
                  fill={c.olive ? "var(--olive)" : "var(--text-secondary)"}
                  className={`abs-label${c.olive ? " abs-label--citation" : ""}`}
                  style={{ "--li": c.li } as React.CSSProperties}
                >
                  {c.label}
                </text>
              ))}
            </g>

            {/* ── Central cluster — appears last ── */}
            <g id="absence-cluster">
              {/* Pulse ring */}
              <circle
                className="abs-pulse"
                cx={CX} cy={CY} r={7}
                fill="none"
                stroke="var(--olive)"
                strokeWidth={0.9}
              />
              {/* Dark compression halo — gravitational center feel */}
              <circle
                cx={CX} cy={CY} r={10}
                fill="var(--ink)"
                className="abs-core-halo"
              />
              {/* Olive signal point */}
              <circle
                cx={CX} cy={CY} r={4.5}
                fill="var(--olive)"
                className="abs-core"
              />
            </g>
          </svg>
        </div>
      </div>

      <style>{`
        /* ── Section shell ───────────────────────────── */
        .abs-section {
          padding: var(--section-y) var(--gutter);
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
        }

        /* ── Header label ────────────────────────────── */
        .abs-header {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 52px;
        }
        .abs-chip {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ── Two-column grid ─────────────────────────── */
        .abs-grid {
          display: grid;
          grid-template-columns: 37% 63%;
          align-items: center;
          gap: 0;
        }

        /* ── Left column ─────────────────────────────── */
        .abs-left {
          padding-right: 48px;
        }
        .abs-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(34px, 4.2vw, 56px);
          line-height: 1.08;
          color: var(--warm-black);
          margin: 0 0 24px;
        }
        .abs-stat {
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(68px, 9vw, 116px);
          color: var(--olive);
          line-height: 1;
          letter-spacing: -0.02em;
          display: block;
          margin-bottom: 22px;
        }
        .abs-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-body);
          line-height: 1.65;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .abs-cta {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--signal);
          transition: opacity 200ms ease;
        }
        .abs-cta:hover { opacity: 0.72; }

        /* ── SVG cluster ─────────────────────────────── */
        .abs-right {
          /* fills grid cell */
        }
        .abs-svg {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
        }

        /* ─── Dot field — CSS transition triggered by .abs-visible ─── */
        .abs-dot {
          opacity: 0;
          /*
            Stagger: each dot delays by --di * 1.8ms + 60ms.
            Core (di 0–44) → inner (di 45–129) → mid (di 130–249) → outer (di 250–399).
            Full field materialises over ~780ms after section enters view.
          */
          transition:
            opacity 480ms cubic-bezier(.16,1,.3,1)
            calc(var(--di) * 1.8ms + 60ms);
        }
        .abs-visible .abs-dot {
          opacity: var(--op);
        }

        /* ─── Connector lines — stroke-dashoffset draw ─── */
        .abs-line {
          stroke-dasharray: var(--len, 260);
          stroke-dashoffset: var(--len, 260);
        }
        .abs-visible .abs-line {
          animation:
            abs-draw 920ms cubic-bezier(.16,1,.3,1)
            calc(640ms + var(--li) * 88ms) both;
        }
        @keyframes abs-draw {
          to { stroke-dashoffset: 0; }
        }

        /* ─── Labels — fade in after lines complete ─── */
        .abs-label {
          opacity: 0;
          transition:
            opacity 420ms ease
            calc(1240ms + var(--li) * 88ms);
        }
        .abs-visible .abs-label {
          opacity: 1;
        }

        /* ─── Central compression halo ─── */
        .abs-core-halo {
          opacity: 0;
          transform-origin: 50% 50%;
          transform: scale(0);
          transition:
            opacity 380ms cubic-bezier(.16,1,.3,1) 1540ms,
            transform 480ms cubic-bezier(.16,1,.3,1) 1540ms;
        }
        .abs-visible .abs-core-halo {
          opacity: 0.52;
          transform: scale(1);
        }

        /* ─── Core olive signal point — last to appear ─── */
        .abs-core {
          opacity: 0;
          transform-origin: 50% 50%;
          transform: scale(0);
          transition:
            opacity 520ms cubic-bezier(.16,1,.3,1) 1660ms,
            transform 620ms cubic-bezier(.16,1,.3,1) 1660ms;
        }
        .abs-visible .abs-core {
          opacity: 1;
          transform: scale(1);
        }

        /* ─── Pulse ring — starts after core appears ─── */
        .abs-pulse {
          transform-origin: 50% 50%;
          opacity: 0;
          transition: opacity 200ms ease 2050ms;
        }
        .abs-visible .abs-pulse {
          opacity: 0.42;
          animation: abs-pulse 3.8s ease-in-out 2.1s infinite;
        }
        @keyframes abs-pulse {
          0%, 100% { transform: scale(1);   opacity: 0.42; }
          50%       { transform: scale(3.8); opacity: 0;    }
        }

        /* ─── Hover — cluster-level effects ─── */
        .abs-svg {
          cursor: default;
        }
        /* Citation label becomes fully vivid on cluster hover */
        .abs-svg:hover .abs-label--citation {
          opacity: 1 !important;
          transition: opacity 300ms ease, fill 300ms ease;
        }
        /* Connector lines become slightly crisper */
        .abs-svg:hover .abs-line {
          stroke: #A8A098;
          transition: stroke 400ms ease;
        }

        /* ─── Reduced motion ─── */
        @media (prefers-reduced-motion: reduce) {
          .abs-dot        { opacity: var(--op) !important; transition: none !important; }
          .abs-line       { stroke-dashoffset: 0 !important; }
          .abs-visible .abs-line { animation: none !important; }
          .abs-label      { opacity: 1 !important; transition: none !important; }
          .abs-core-halo,
          .abs-core       { opacity: 1 !important; transform: scale(1) !important; transition: none !important; }
          .abs-pulse      { opacity: 0.42 !important; animation: none !important; transition: none !important; }
        }

        /* ─── Mobile ─── */
        @media (max-width: 820px) {
          .abs-section { padding: 56px 24px 64px; }
          .abs-header  { margin-bottom: 36px; }
          .abs-grid    { grid-template-columns: 1fr; gap: 44px 0; }
          .abs-left    { padding-right: 0; }
        }
      `}</style>
    </section>
  );
}
