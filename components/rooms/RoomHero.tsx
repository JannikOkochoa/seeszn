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
  return (
    <section className="rh-section">
      {/* LEFT — statement */}
      <div className="rh-left">
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
      </div>

      {/* RIGHT — room instrument */}
      <div className="rh-right">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          className="rh-panel-slot"
        >
          {panel}
        </motion.div>
      </div>

      <style>{`
        .rh-section {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 55% 45%;
          border-bottom: 1px solid var(--warm-black);
          padding-top: 106px;
          background: var(--paper);
        }
        .rh-left {
          padding: 64px 56px 64px 64px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          position: relative;
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
        }
        .rh-panel-slot { width: 100%; display: flex; justify-content: center; }

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
        }
      `}</style>
    </section>
  );
}
