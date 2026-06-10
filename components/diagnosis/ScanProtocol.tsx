"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// What the scan reads — the five measures of the SEESZN system.
const MEASURES = [
  {
    name: "CRAWL",
    question: "Can machines walk your structure?",
    reads: "INDEX ROUTES · DEPTH · DEAD ENDS · ORPHANS",
  },
  {
    name: "ENTITY",
    question: "Does the machine know who you are?",
    reads: "CANONICAL RECORD · NAMING · CORROBORATION",
  },
  {
    name: "CITATION",
    question: "Do answers quote you?",
    reads: "FAN-OUT COVERAGE · SOURCE SURFACES · GAPS",
  },
  {
    name: "TRUST",
    question: "Does the surface read as credible?",
    reads: "SPEED · CLARITY · EVIDENCE DESIGN",
  },
  {
    name: "CONVERSION",
    question: "Does retrieval become revenue?",
    reads: "ANSWER-TO-ACTION PATH · LANDING EVIDENCE",
  },
];

const STEPS = [
  {
    name: "INTAKE",
    desc: "You send the surface. One email, one domain — that is enough to begin.",
  },
  {
    name: "SCAN",
    desc: "We read it across search and AI systems: structure, entities, citations, trust, conversion.",
  },
  {
    name: "READING",
    desc: "You receive the leak map — where visibility breaks, and why. In plain language.",
  },
  {
    name: "ROADMAP",
    desc: "The highest-leverage moves, sequenced. Whether we build them together is a separate decision.",
  },
];

export default function ScanProtocol() {
  const readRef = useRef(null);
  const readInView = useInView(readRef, { once: true, amount: 0.15 });
  const stepRef = useRef(null);
  const stepInView = useInView(stepRef, { once: true, amount: 0.2 });

  const anim = (inView: boolean, delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <>
      {/* ── 02 — WHAT THE SCAN READS ── */}
      <section
        ref={readRef}
        className={`scp-section${readInView ? " scp--on" : ""}`}
        aria-label="What the scan reads"
      >
        <motion.div {...anim(readInView, 0)} className="scp-label-row">
          <span className="scp-label">02</span>
          <span className="scp-label">WHAT THE SCAN READS</span>
          <span className="scp-label scp-label--right">FIVE MEASURES — ONE SURFACE</span>
        </motion.div>

        <ul className="scp-measures">
          {MEASURES.map((m, i) => (
            <li key={m.name} className="scp-measure" style={{ "--i": i } as React.CSSProperties}>
              <span className="scp-measure-num">0{i + 1}</span>
              <span className="scp-measure-name">{m.name}</span>
              <span className="scp-measure-q">{m.question}</span>
              <span className="scp-measure-reads">{m.reads}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 03 — PROTOCOL ── */}
      <section
        ref={stepRef}
        className={`scp-section${stepInView ? " scp--on" : ""}`}
        aria-label="The protocol"
      >
        <motion.div {...anim(stepInView, 0)} className="scp-label-row">
          <span className="scp-label">03</span>
          <span className="scp-label">THE PROTOCOL</span>
        </motion.div>

        <div className="scp-steps-wrap">
          <div className="scp-rail" aria-hidden="true">
            <span className="scp-rail-fill" />
          </div>
          <ol className="scp-steps">
            {STEPS.map((s, i) => (
              <li key={s.name} className="scp-step" style={{ "--i": i } as React.CSSProperties}>
                <span className="scp-step-num">0{i + 1}</span>
                <div>
                  <h3 className="scp-step-name">{s.name}</h3>
                  <p className="scp-step-desc">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <motion.p {...anim(stepInView, 0.3)} className="scp-note">
          PREFER MAIL? <a href="mailto:hello@seeszn.com">HELLO@SEESZN.COM</a>
        </motion.p>
      </section>

      <style>{`
        .scp-section {
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
          padding: 72px 64px 88px;
        }
        .scp-label-row { display: flex; gap: 16px; margin-bottom: 56px; align-items: baseline; }
        .scp-label {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dust);
        }
        .scp-label--right { margin-left: auto; font-size: 9px; }

        /* ── measures table ──────────────────────────── */
        .scp-measures { list-style: none; }
        .scp-measure {
          display: grid;
          grid-template-columns: 56px 170px 1fr minmax(0, 300px);
          gap: 24px;
          align-items: baseline;
          padding: 22px 0;
          border-top: 1px solid var(--line);
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 600ms ease calc(150ms + var(--i, 0) * 110ms),
            transform 700ms cubic-bezier(.16,1,.3,1) calc(150ms + var(--i, 0) * 110ms);
        }
        .scp--on .scp-measure { opacity: 1; transform: none; }
        .scp-measure-num {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: var(--dust);
        }
        .scp-measure-name {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(19px, 2vw, 26px);
          letter-spacing: 0.02em;
          color: var(--warm-black);
        }
        .scp-measure-q {
          font-family: var(--font-editorial), serif;
          font-style: italic;
          font-size: clamp(15px, 1.6vw, 19px);
          color: var(--ink);
        }
        .scp-measure-reads {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--muted);
          text-align: right;
        }

        /* ── protocol rail ───────────────────────────── */
        .scp-steps-wrap {
          position: relative;
          padding-left: 26px;
          max-width: 640px;
        }
        .scp-rail {
          position: absolute;
          left: 3px;
          top: 6px;
          bottom: 6px;
          width: 1px;
          background: var(--line);
        }
        .scp-rail-fill {
          display: block;
          width: 100%;
          height: 100%;
          background: var(--signal);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 1500ms cubic-bezier(.16,1,.3,1) 250ms;
        }
        .scp--on .scp-rail-fill { transform: scaleY(1); }
        .scp-steps { list-style: none; display: flex; flex-direction: column; gap: 40px; }
        .scp-step {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 20px;
          align-items: baseline;
          position: relative;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 600ms ease calc(350ms + var(--i, 0) * 180ms),
            transform 700ms cubic-bezier(.16,1,.3,1) calc(350ms + var(--i, 0) * 180ms);
        }
        .scp--on .scp-step { opacity: 1; transform: none; }
        .scp-step::before {
          content: '';
          position: absolute;
          left: -27px;
          top: 2px;
          width: 7px;
          height: 7px;
          background: var(--warm-black);
        }
        .scp-step-num {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: var(--dust);
        }
        .scp-step-name {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: 0.02em;
          color: var(--warm-black);
          margin-bottom: 8px;
        }
        .scp-step-desc {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          line-height: 1.7;
          color: #5E574F;
          max-width: 460px;
        }

        .scp-note {
          margin-top: 64px;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          color: var(--muted);
        }
        .scp-note a {
          color: var(--warm-black);
          border-bottom: 1px solid var(--signal);
          padding-bottom: 2px;
        }
        .scp-note a:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {
          .scp-measure, .scp-step {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .scp-rail-fill { transform: scaleY(1) !important; transition: none !important; }
        }

        @media (max-width: 900px) {
          .scp-section { padding: 52px 24px 64px; }
          .scp-label-row { margin-bottom: 40px; }
          .scp-label--right { display: none; }
          .scp-measure {
            grid-template-columns: 40px 1fr;
            gap: 8px 16px;
            padding: 20px 0;
          }
          .scp-measure-q { grid-column: 2; }
          .scp-measure-reads { grid-column: 2; text-align: left; }
        }
      `}</style>
    </>
  );
}
