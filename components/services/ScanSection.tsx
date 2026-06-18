"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Readings of an unexamined brand surface — third value is the leak
const VALUES = [
  { value: 61 },
  { value: 24, leak: true },
  { value: 52 },
  { value: 38 },
];

export default function ScanSection() {
  const t = useTranslations();
  const sc = t.servicesPage.scan;
  const diagHref = t.locale === "de" ? "/diagnosis" : "/en/diagnosis";
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  // 3D tilt — the specimen panel leans toward the cursor like an object on a table
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 16 });
  const sry = useSpring(ry, { stiffness: 120, damping: 16 });

  const onPanelMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -8);
  };
  const onPanelLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.65, ease: EASE, delay },
  });

  return (
    <section
      ref={ref}
      className={`scn-section${inView ? " scn--on" : ""}`}
      aria-label="The scan, diagnostic reading"
    >
      <motion.div {...anim(0)} className="scn-label-row">
        <span className="scn-label">05</span>
        <span className="scn-label">{sc.sectionLabel}</span>
      </motion.div>

      <div className="scn-grid">
        {/* Text */}
        <div className="scn-text">
          <motion.h2 {...anim(0.08)} className="scn-headline">
            {sc.headlineRoman}
            <br />
            <em>{sc.headlineItalic}</em>
          </motion.h2>
          <motion.p {...anim(0.16)} className="scn-copy">
            {sc.copy}
          </motion.p>
          <motion.div {...anim(0.24)}>
            <a href={diagHref} className="scn-cta">
              {sc.cta} <span style={{ color: "var(--olive)" }}>→</span>
            </a>
          </motion.div>
        </div>

        {/* Scan panel — tilts in 3D toward the cursor */}
        <motion.div
          {...anim(0.2)}
          className="scn-panel-stage"
          onMouseMove={onPanelMove}
          onMouseLeave={onPanelLeave}
        >
        <motion.div
          className="scn-panel"
          style={{ rotateX: srx, rotateY: sry }}
          role="img"
          aria-label={`Scan panel: brand surface ${sc.statusVal.toLowerCase()}. Readings: ${sc.readings.join(", ")}. ${sc.nextKey}: ${sc.nextVal}.`}
        >
          <div className="scn-head">
            <span>{sc.panelTitle}</span>
            <span>{sc.panelRef}</span>
          </div>

          <div className="scn-status">
            <span className="scn-key">{sc.statusKey}</span>
            <span className="scn-val">{sc.statusVal}</span>
          </div>

          <div className="scn-readings">
            {sc.readings.map((label, i) => (
              <div key={label} className="scn-row">
                <span className={`scn-row-label${VALUES[i].leak ? " scn-row-label--leak" : ""}`}>
                  {label}
                </span>
                <span className="scn-track" aria-hidden="true">
                  <span
                    className={`scn-fill${VALUES[i].leak ? " scn-fill--leak" : ""}`}
                    style={{ width: `${VALUES[i].value}%`, "--i": i } as React.CSSProperties}
                  />
                </span>
                <span className={`scn-row-value${VALUES[i].leak ? " scn-row-value--leak" : ""}`}>
                  {VALUES[i].value}%
                </span>
              </div>
            ))}
          </div>

          <div className="scn-foot">
            <span>{sc.nextKey}</span>
            <span className="scn-next">
              {sc.nextVal}
              <span className="scn-caret" aria-hidden="true" />
            </span>
          </div>
        </motion.div>
        </motion.div>
      </div>

      <style>{`
        .scn-section {
          background: var(--paper);
          padding: 96px 64px 104px;
        }
        .scn-label-row { display: flex; gap: 16px; margin-bottom: 52px; }
        .scn-label {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .scn-grid {
          display: grid;
          grid-template-columns: minmax(0, 55fr) minmax(0, 45fr);
          gap: 0 80px;
          align-items: center;
        }
        .scn-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(36px, 4.4vw, 62px);
          line-height: 1.08;
          color: var(--warm-black);
          margin: 0 0 28px;
        }
        .scn-headline em { font-style: normal; }
        .scn-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.7;
          color: var(--text-body);
          max-width: 440px;
          margin: 0 0 36px;
        }
        .scn-cta {
          display: inline-block;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          border: 1px solid var(--button-border);
          padding: 13px 26px;
          min-height: 44px;
          color: var(--text-primary);
          background: transparent;
          text-decoration: none;
          transition: background 0.25s, border-color 0.25s, color 0.25s;
        }
        .scn-cta:hover { background: var(--warm-black); border-color: var(--warm-black); color: var(--paper); }
        .scn-cta:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }

        /* ── Scan panel ────────────────────────────────── */
        .scn-panel-stage {
          perspective: 900px;
          justify-self: end;
          width: 100%;
          max-width: 460px;
        }
        .scn-panel {
          width: 100%;
          border: 1px solid var(--warm-black);
          background: var(--paper);
          position: relative;
          overflow: hidden;
          will-change: transform;
          transform-style: preserve-3d;
        }
        /* single scan pass once the panel is in view */
        .scn--on .scn-panel::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 1px;
          background: var(--olive);
          opacity: 0;
          animation: scn-scan 1000ms cubic-bezier(.16,1,.3,1) 1.4s both;
          pointer-events: none;
        }
        @keyframes scn-scan {
          0%   { left: -1px; opacity: 0; }
          8%   { opacity: 0.45; }
          88%  { opacity: 0.2; }
          100% { left: 101%; opacity: 0; }
        }

        .scn-head {
          display: flex;
          justify-content: space-between;
          padding: 14px 22px;
          border-bottom: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--text-secondary);
        }
        .scn-status {
          padding: 20px 22px 4px;
          display: flex;
          gap: 16px;
        }
        .scn-key {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          color: var(--dust);
          width: 64px;
          flex-shrink: 0;
        }
        .scn-val {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--warm-black);
        }

        .scn-readings {
          padding: 22px 22px 26px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .scn-row { display: flex; align-items: center; gap: 14px; }
        .scn-row-label {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          color: var(--text-secondary);
          width: 92px;
          flex-shrink: 0;
        }
        .scn-row-label--leak { color: var(--warm-black); }
        .scn-track {
          flex: 1;
          height: 2px;
          background: var(--line);
          position: relative;
          display: block;
        }
        .scn-fill {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          background: var(--warm-black);
          transform: scaleX(0);
          transform-origin: left;
        }
        .scn--on .scn-fill {
          animation: scn-fill 1000ms cubic-bezier(.16,1,.3,1) calc(500ms + var(--i, 0) * 130ms) both;
        }
        .scn-fill--leak { background: var(--olive); }
        @keyframes scn-fill { to { transform: scaleX(1); } }
        .scn-row-value {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: var(--text-secondary);
          width: 34px;
          text-align: right;
          flex-shrink: 0;
        }
        .scn-row-value--leak { color: var(--olive); }

        .scn-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 22px;
          border-top: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--text-secondary);
        }
        .scn-next {
          font-size: 11px;
          color: var(--warm-black);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .scn-caret {
          width: 6px;
          height: 11px;
          background: var(--olive);
        }
        .scn--on .scn-caret {
          animation: scn-blink 1.3s steps(1) 2s infinite;
        }
        @keyframes scn-blink { 50% { opacity: 0; } }

        /* ── Reduced motion ────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .scn--on .scn-panel::after { display: none; }
          .scn--on .scn-fill { animation: none; transform: scaleX(1); }
          .scn--on .scn-caret { animation: none; }
        }

        /* ── Mobile ────────────────────────────────────── */
        @media (max-width: 900px) {
          .scn-section { padding: 64px 24px 72px; }
          .scn-label-row { margin-bottom: 36px; }
          .scn-grid {
            grid-template-columns: 1fr;
            gap: 48px 0;
          }
          .scn-panel-stage { justify-self: stretch; max-width: none; }
        }
      `}</style>
    </section>
  );
}
