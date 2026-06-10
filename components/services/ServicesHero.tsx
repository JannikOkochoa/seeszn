"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  };
}

// Diagnosis interface — readings of an unexamined brand surface
const READINGS = [
  { label: "CRAWL", value: 61 },
  { label: "ENTITY", value: 38 },
  { label: "CITATION", value: 12, leak: true },
  { label: "TRUST", value: 46 },
  { label: "CONVERSION", value: 29 },
];

export default function ServicesHero() {
  return (
    <section className="sh-section">
      {/* LEFT — statement */}
      <div className="sh-left">
        <motion.div {...fadeUp(0)} className="sh-label-row">
          <span className="sh-label">01</span>
          <span className="sh-label">SERVICES / OPERATING ROOM</span>
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} className="sh-headline">
          <span className="sh-hl-roman">Visibility breaks</span>
          <span className="sh-hl-roman">before the customer</span>
          <span className="sh-hl-italic">sees you.</span>
        </motion.h1>

        <motion.div
          {...fadeUp(0.2)}
          style={{ width: 48, height: 2, background: "var(--olive)", margin: "18px 0" }}
        />

        <motion.p {...fadeUp(0.3)} className="sh-sub">
          WE DIAGNOSE, REBUILD AND STRUCTURE
          <br />
          THE SURFACES MACHINES RETRIEVE
          <br />
          AND PEOPLE TRUST.
        </motion.p>

        <motion.p {...fadeUp(0.36)} className="sh-sub sh-sub--dim">
          SEO, AI SEARCH, WEBSITES AND AUDITS —
          <br />
          BUILT AS ONE VISIBILITY SYSTEM.
        </motion.p>

        <motion.div {...fadeUp(0.44)} style={{ marginTop: 30 }}>
          <a href="/diagnosis" className="sh-cta">
            BOOK A DIAGNOSIS <span style={{ color: "var(--olive)" }}>→</span>
          </a>
        </motion.div>

        <span aria-hidden="true" className="sh-vertical">
          THE VISIBILITY OPERATING ROOM
        </span>
      </div>

      {/* RIGHT — diagnosis interface */}
      <div className="sh-right">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          className="shp"
          role="img"
          aria-label="Diagnosis interface — brand surface partially retrievable: crawl 61, entity 38, citation 12, trust 46, conversion 29 percent. Next move: diagnosis."
        >
          <div className="shp-head">
            <span>SPECIMEN 001 — BRAND SURFACE</span>
            <span>SZN-OR-01</span>
          </div>

          <div className="shp-status">
            <p>
              <span className="shp-key">INPUT</span>
              <span className="shp-val">BRAND SURFACE</span>
            </p>
            <p>
              <span className="shp-key">STATUS</span>
              <span className="shp-val">PARTIALLY RETRIEVABLE</span>
            </p>
          </div>

          <div className="shp-readings">
            {READINGS.map((r, i) => (
              <div key={r.label} className="shp-row">
                <span className={`shp-row-label${r.leak ? " shp-row-label--leak" : ""}`}>
                  {r.label}
                </span>
                <span className="shp-track" aria-hidden="true">
                  <span
                    className={`shp-fill${r.leak ? " shp-fill--leak" : ""}`}
                    style={{ width: `${r.value}%`, "--i": i } as React.CSSProperties}
                  />
                </span>
                <span className={`shp-row-value${r.leak ? " shp-row-value--leak" : ""}`}>
                  {r.value}%
                </span>
              </div>
            ))}
          </div>

          <div className="shp-foot">
            <span>NEXT MOVE</span>
            <span className="shp-next">
              DIAGNOSIS
              <span className="shp-caret" aria-hidden="true" />
            </span>
          </div>
        </motion.div>
      </div>

      <style>{`
        /* ── Section ─────────────────────────────────── */
        .sh-section {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 55% 45%;
          border-bottom: 1px solid var(--warm-black);
          padding-top: 106px;
          background: var(--paper);
        }

        /* ── Left column ─────────────────────────────── */
        .sh-left {
          padding: 64px 56px 64px 64px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          position: relative;
        }
        .sh-label-row { display: flex; gap: 16px; margin-bottom: 24px; }
        .sh-label {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dust);
        }
        .sh-headline { color: var(--warm-black); margin: 0; }
        .sh-hl-roman {
          display: block;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(42px, 5.4vw, 76px);
          letter-spacing: -0.02em;
          line-height: 0.97;
          text-transform: uppercase;
        }
        .sh-hl-italic {
          display: block;
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-style: italic;
          font-size: clamp(38px, 4.8vw, 68px);
          letter-spacing: -0.02em;
          line-height: 1.08;
        }
        .sh-sub {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          line-height: 1.75;
          letter-spacing: 0.04em;
          color: #5E574F;
          max-width: 420px;
        }
        .sh-sub--dim { margin-top: 16px; color: var(--muted); }
        .sh-cta {
          display: inline-block;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1px solid var(--warm-black);
          padding: 14px 26px;
          color: var(--warm-black);
          background: transparent;
          transition: background 0.2s, color 0.2s;
        }
        .sh-cta:hover { background: var(--warm-black); color: var(--paper); }
        .sh-cta:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }
        .sh-vertical {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateX(50%) rotate(90deg);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dust);
          opacity: 0.28;
          white-space: nowrap;
        }

        /* ── Right column — interface ────────────────── */
        .sh-right {
          border-left: 1px solid var(--warm-black);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 64px 64px 56px;
        }
        .shp {
          width: 100%;
          max-width: 460px;
          border: 1px solid var(--warm-black);
          background: var(--paper);
          position: relative;
          overflow: hidden;
        }
        /* single scan pass after the panel settles */
        .shp::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 1px;
          background: var(--olive);
          opacity: 0;
          animation: shp-scan 900ms cubic-bezier(.16,1,.3,1) 1.9s both;
          pointer-events: none;
        }
        @keyframes shp-scan {
          0%   { left: -1px; opacity: 0; }
          8%   { opacity: 0.45; }
          88%  { opacity: 0.2; }
          100% { left: 101%; opacity: 0; }
        }

        .shp-head {
          display: flex;
          justify-content: space-between;
          padding: 14px 22px;
          border-bottom: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: #5E574F;
        }
        .shp-status {
          padding: 20px 22px 4px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .shp-status p { display: flex; gap: 16px; }
        .shp-key {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          color: var(--dust);
          width: 64px;
          flex-shrink: 0;
        }
        .shp-val {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--warm-black);
        }

        .shp-readings {
          padding: 22px 22px 26px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .shp-row { display: flex; align-items: center; gap: 14px; }
        .shp-row-label {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          color: #5E574F;
          width: 92px;
          flex-shrink: 0;
        }
        .shp-row-label--leak { color: var(--warm-black); }
        .shp-track {
          flex: 1;
          height: 2px;
          background: var(--line);
          position: relative;
          display: block;
        }
        .shp-fill {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          background: var(--warm-black);
          transform: scaleX(0);
          transform-origin: left;
          animation: shp-fill 1000ms cubic-bezier(.16,1,.3,1) calc(800ms + var(--i, 0) * 120ms) both;
        }
        .shp-fill--leak { background: var(--olive); }
        @keyframes shp-fill { to { transform: scaleX(1); } }
        .shp-row-value {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: #5E574F;
          width: 34px;
          text-align: right;
          flex-shrink: 0;
        }
        .shp-row-value--leak { color: var(--olive); }

        .shp-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 22px;
          border-top: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: #5E574F;
        }
        .shp-next {
          font-size: 11px;
          color: var(--warm-black);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .shp-caret {
          width: 6px;
          height: 11px;
          background: var(--olive);
          animation: shp-blink 1.3s steps(1) 2.4s infinite;
        }
        @keyframes shp-blink { 50% { opacity: 0; } }

        /* ── Reduced motion ──────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .shp::after { display: none; }
          .shp-fill { animation: none; transform: scaleX(1); }
          .shp-caret { animation: none; }
        }

        /* ── Mobile ──────────────────────────────────── */
        @media (max-width: 900px) {
          .sh-section {
            grid-template-columns: 1fr;
            min-height: auto;
            padding-top: 106px;
          }
          .sh-left { padding: 48px 24px 40px; }
          .sh-vertical { display: none; }
          .sh-right {
            border-left: none;
            border-top: 1px solid var(--warm-black);
            padding: 44px 24px 56px;
          }
        }
      `}</style>
    </section>
  );
}
