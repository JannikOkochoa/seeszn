"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  };
}

export interface RoomHeroProps {
  /** local section index — every room opens at 01 */
  index: string;
  /** e.g. "WORK / EVIDENCE ARCHIVE" */
  room: string;
  /** accession code, right-aligned — e.g. "SZN-AR-02" */
  accession: string;
  /** display lines of the headline */
  roman: string[];
  /** italic editorial closing line */
  italic: string;
  /** mono sub copy, one array entry per line */
  sub: string[];
  /** dimmer second block of mono copy */
  note?: string[];
  /** vertical meta text on the column edge */
  meta?: string;
  /** optional entry point — omitted when the panel itself converts */
  cta?: { label: string; href: string };
  /** the room's instrument, rendered in the right column */
  panel: React.ReactNode;
}

export default function RoomHero({
  index,
  room,
  accession,
  roman,
  italic,
  sub,
  note,
  meta,
  cta,
  panel,
}: RoomHeroProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Ghost word — the italic line stripped to its bare letters
  const ghostWord = italic.replace(/[^\p{L}\s]/gu, "").trim().toUpperCase();

  // Scroll parallax — statement lifts away, ghost counter-drifts, panel lags
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-16%"]);
  const yGhost = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-55%"]);
  const yPanel = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "10%"]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={sectionRef} className="rh-section">
      {/* Ghost word — counter-parallax backdrop */}
      <motion.span className="rh-ghost" style={{ y: yGhost }} aria-hidden="true">
        {ghostWord}
      </motion.span>

      {/* Scan grid + sweep */}
      <div className="rh-grid-bg" aria-hidden="true" />
      <span className="rh-sweep" aria-hidden="true" />

      {/* LEFT — statement */}
      <motion.div className="rh-left" style={{ y: yContent, opacity: heroFade }}>
        <motion.div {...fadeUp(0)} className="rh-label-row">
          <span className="rh-label">{index}</span>
          <span className="rh-label">{room}</span>
          <span className="rh-label rh-label--acc">{accession}</span>
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} className="rh-headline">
          {roman.map((line) => (
            <span key={line} className="rh-hl-roman">
              {line}
            </span>
          ))}
          <span className="rh-hl-italic">{italic}</span>
        </motion.h1>

        <motion.div
          {...fadeUp(0.2)}
          style={{ width: 48, height: 2, background: "var(--olive)", margin: "18px 0" }}
        />

        <motion.p {...fadeUp(0.3)} className="rh-sub">
          {sub.map((line, i) => (
            <span key={line}>
              {line}
              {i < sub.length - 1 && <br />}
            </span>
          ))}
        </motion.p>

        {note && (
          <motion.p {...fadeUp(0.36)} className="rh-sub rh-sub--dim">
            {note.map((line, i) => (
              <span key={line}>
                {line}
                {i < note.length - 1 && <br />}
              </span>
            ))}
          </motion.p>
        )}

        {cta && (
          <motion.div {...fadeUp(0.44)} style={{ marginTop: 30 }}>
            <a href={cta.href} className="rh-cta">
              {cta.label} <span style={{ color: "var(--olive)" }}>→</span>
            </a>
          </motion.div>
        )}

        {meta && (
          <span aria-hidden="true" className="rh-vertical">
            {meta}
          </span>
        )}
      </motion.div>

      {/* RIGHT — room instrument, lagging parallax */}
      <motion.div className="rh-right" style={{ y: yPanel }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          className="rh-panel-slot"
        >
          {panel}
        </motion.div>
      </motion.div>

      <style>{`
        .rh-section {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 55% 45%;
          border-bottom: 1px solid var(--warm-black);
          padding-top: 106px;
          background: var(--paper);
          position: relative;
          overflow: hidden;
        }

        /* ── Ghost word ──────────────────────────────── */
        .rh-ghost {
          position: absolute;
          left: -2vw;
          bottom: -4vw;
          z-index: 0;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(110px, 17vw, 300px);
          letter-spacing: -0.05em;
          line-height: 0.8;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 16%, transparent);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          will-change: transform;
        }

        /* ── Scan grid + sweep ───────────────────────── */
        .rh-grid-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(color-mix(in srgb, var(--warm-black) 4%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--warm-black) 4%, transparent) 1px, transparent 1px);
          background-size: 120px 120px;
          mask-image: radial-gradient(ellipse 85% 85% at 65% 45%, black 0%, transparent 75%);
        }
        .rh-sweep {
          position: absolute;
          top: 0; bottom: 0;
          width: 1px;
          background: var(--olive);
          z-index: 1;
          opacity: 0;
          animation: rh-sweep 9s cubic-bezier(.16,1,.3,1) 2.2s infinite;
          pointer-events: none;
        }
        @keyframes rh-sweep {
          0%   { left: 0%; opacity: 0; }
          4%   { opacity: 0.45; }
          32%  { opacity: 0.1; }
          40%  { left: 100%; opacity: 0; }
          100% { left: 100%; opacity: 0; }
        }
        .rh-left {
          padding: 64px 56px 64px 64px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          position: relative;
          z-index: 2;
          will-change: transform;
        }
        .rh-label-row { display: flex; gap: 16px; margin-bottom: 24px; align-items: baseline; }
        .rh-label {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .rh-label--acc { margin-left: auto; font-size: 9px; opacity: 0.7; }
        .rh-headline { color: var(--warm-black); margin: 0; }
        .rh-hl-roman {
          display: block;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(42px, 5.4vw, 76px);
          letter-spacing: -0.02em;
          line-height: 0.97;
          text-transform: uppercase;
        }
        .rh-hl-italic {
          display: block;
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-style: italic;
          font-size: clamp(38px, 4.8vw, 68px);
          letter-spacing: -0.02em;
          line-height: 1.08;
        }
        .rh-sub {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-body);
          max-width: 440px;
        }
        .rh-sub--dim { margin-top: 16px; color: var(--text-muted); }
        .rh-cta {
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
          transition: background 0.25s, border-color 0.25s, color 0.25s;
        }
        .rh-cta:hover { background: var(--warm-black); border-color: var(--warm-black); color: var(--paper); }
        .rh-cta:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }
        .rh-vertical {
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
        .rh-right {
          border-left: 1px solid var(--warm-black);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 64px 64px 56px;
          position: relative;
          z-index: 2;
          will-change: transform;
        }
        .rh-panel-slot { width: 100%; display: flex; justify-content: center; }

        @media (prefers-reduced-motion: reduce) {
          .rh-sweep { animation: none; }
        }

        @media (max-width: 900px) {
          .rh-section {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .rh-left { padding: 48px 24px 40px; }
          .rh-vertical { display: none; }
          .rh-right {
            border-left: none;
            border-top: 1px solid var(--warm-black);
            padding: 44px 24px 56px;
          }
          .rh-ghost { font-size: 30vw; bottom: -6vw; }
        }
      `}</style>
    </section>
  );
}
