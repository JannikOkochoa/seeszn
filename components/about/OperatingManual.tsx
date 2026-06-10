"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ── Manual content ────────────────────────────────────────────────────────────

const PHASES = [
  {
    name: "DIAGNOSE",
    desc: "Locate where visibility breaks before any work begins.",
  },
  {
    name: "ARCHITECT",
    desc: "Structure entities, pages and paths for retrieval.",
  },
  {
    name: "BUILD",
    desc: "Design and engineer the surface — fast, editorial, legible.",
  },
  {
    name: "OBSERVE",
    desc: "Watch answers, citations and conversion. Correct the system.",
  },
];

const PRINCIPLES = [
  {
    name: "STRUCTURE BEFORE SCALE",
    gloss: "Content volume without architecture is noise the machine skips.",
  },
  {
    name: "RETRIEVAL BEFORE REACH",
    gloss: "Be quotable before being loud.",
  },
  {
    name: "EVIDENCE OVER OPINION",
    gloss: "We read systems. We do not guess at them.",
  },
  {
    name: "ONE SYSTEM, NOT SILOS",
    gloss: "SEO, AI search and the website are the same surface.",
  },
  {
    name: "TASTE IS A PERFORMANCE SYSTEM",
    gloss: "Restraint, hierarchy and speed are what conversion feels like.",
  },
  {
    name: "SPEED IS PART OF TRUST",
    gloss: "A slow surface reads as a neglected one.",
  },
];

const REFUSALS = [
  { name: "Work without a diagnosis", gloss: "We do not build before we locate the leak." },
  { name: "Keyword volume as strategy", gloss: "Volume feeds dashboards, not answers." },
  { name: "Dashboards instead of decisions", gloss: "A metric is not a move." },
  { name: "AI theater", gloss: "No glow, no magic, no neon intelligence." },
  { name: "Brochure websites", gloss: "A surface that cannot be retrieved is decoration." },
  { name: "Growth language", gloss: "Nothing is boosted, unlocked or taken to the next level." },
];

// ── Section shells ────────────────────────────────────────────────────────────

function useReveal(amount = 0.25) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });
  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.6, ease: EASE, delay },
  });
  return { ref, inView, anim };
}

function Premise() {
  const { ref, anim } = useReveal();
  return (
    <section ref={ref} id="premise" className="om-block">
      <motion.div {...anim(0)} className="om-label-row">
        <span className="om-label">M-01</span>
        <span className="om-label">THE PREMISE</span>
      </motion.div>
      <div className="om-grid">
        <motion.h2 {...anim(0.08)} className="om-headline">
          Search became retrieval.
          <br />
          <em>Ranking became citation.</em>
        </motion.h2>
        <motion.div {...anim(0.16)} className="om-copy-col">
          <p className="om-copy">
            ANSWERS ARE ASSEMBLED FROM SURFACES MACHINES TRUST. THE BRANDS THAT
            REMAIN VISIBLE ARE READABLE, VERIFIABLE AND QUOTABLE — TO PARSERS
            AND TO PEOPLE.
          </p>
          <p className="om-copy om-copy--dim">
            WE BUILD FOR BOTH READERS. THAT IS THE ENTIRE STUDIO.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Model() {
  const { ref, inView, anim } = useReveal();
  return (
    <section ref={ref} id="model" className={`om-block${inView ? " om-block--on" : ""}`}>
      <motion.div {...anim(0)} className="om-label-row">
        <span className="om-label">M-02</span>
        <span className="om-label">THE MODEL</span>
        <span className="om-label om-label--right">ONE LOOP — NOT A FUNNEL</span>
      </motion.div>

      <div className="om-model">
        <div className="om-model-track" aria-hidden="true">
          <span className="om-model-line" />
        </div>
        <ol className="om-phases">
          {PHASES.map((p, i) => (
            <li key={p.name} className="om-phase" style={{ "--i": i } as React.CSSProperties}>
              <span className="om-phase-num">0{i + 1}</span>
              <span className="om-phase-name">{p.name}</span>
              <span className="om-phase-desc">{p.desc}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Principles() {
  const { ref, inView, anim } = useReveal(0.12);
  return (
    <section ref={ref} id="principles" className={`om-block${inView ? " om-block--on" : ""}`}>
      <motion.div {...anim(0)} className="om-label-row">
        <span className="om-label">M-03</span>
        <span className="om-label">PRINCIPLES</span>
      </motion.div>
      <ol className="om-principles">
        {PRINCIPLES.map((p, i) => (
          <li key={p.name} className="om-principle" style={{ "--i": i } as React.CSSProperties}>
            <span className="om-principle-num">0{i + 1}</span>
            <div>
              <h3 className="om-principle-name">{p.name}</h3>
              <p className="om-principle-gloss">{p.gloss}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Refusals() {
  const { ref, inView, anim } = useReveal(0.12);
  return (
    <section ref={ref} id="refusals" className={`om-block${inView ? " om-block--on" : ""}`}>
      <motion.div {...anim(0)} className="om-label-row">
        <span className="om-label">M-04</span>
        <span className="om-label">REFUSALS</span>
        <span className="om-label om-label--right">REFUSAL IS A DESIGN TOOL</span>
      </motion.div>
      <div className="om-grid om-grid--top">
        <motion.h2 {...anim(0.08)} className="om-headline om-headline--small">
          What we decline
          <br />
          <em>defines the work.</em>
        </motion.h2>
        <ul className="om-refusals">
          {REFUSALS.map((r, i) => (
            <li key={r.name} className="om-refusal" style={{ "--i": i } as React.CSSProperties}>
              <span className="om-refusal-x" aria-hidden="true">✕</span>
              <div>
                <p className="om-refusal-name">{r.name}</p>
                <p className="om-refusal-gloss">{r.gloss}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Unit() {
  const { ref, anim } = useReveal();
  return (
    <section ref={ref} id="unit" className="om-block">
      <motion.div {...anim(0)} className="om-label-row">
        <span className="om-label">M-05</span>
        <span className="om-label">THE UNIT</span>
      </motion.div>
      <div className="om-grid">
        <motion.h2 {...anim(0.08)} className="om-headline">
          A small unit.
          <br />
          <em>One table.</em>
        </motion.h2>
        <motion.div {...anim(0.16)} className="om-copy-col">
          <p className="om-copy">
            STRATEGY, SEARCH ARCHITECTURE, EDITORIAL DESIGN AND ENGINEERING —
            OPERATING BETWEEN BERLIN AND BANGKOK.
          </p>
          <p className="om-copy om-copy--dim">
            SENIOR ONLY. NO HANDOFFS. NO ACCOUNT LAYERS.
            <br />
            THE PEOPLE WHO DIAGNOSE YOUR SURFACE BUILD IT.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ── Assembly ──────────────────────────────────────────────────────────────────

export default function OperatingManual() {
  return (
    <div className="om-wrap">
      <Premise />
      <Model />
      <Principles />
      <Refusals />
      <Unit />

      <style>{`
        .om-wrap { background: var(--paper); }
        .om-block {
          border-top: 1px solid var(--warm-black);
          padding: 72px 64px 88px;
          scroll-margin-top: 124px;
        }
        .om-wrap > .om-block:first-child { border-top: none; }
        .om-label-row { display: flex; gap: 16px; margin-bottom: 52px; align-items: baseline; }
        .om-label {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dust);
        }
        .om-label--right { margin-left: auto; font-size: 9px; }

        .om-grid {
          display: grid;
          grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
          gap: 0 64px;
          align-items: end;
        }
        .om-grid--top { align-items: start; }
        .om-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(36px, 4.6vw, 62px);
          line-height: 1.07;
          color: var(--warm-black);
          margin: 0;
        }
        .om-headline--small { font-size: clamp(30px, 3.6vw, 48px); }
        .om-headline em { font-style: italic; }
        .om-copy-col { display: flex; flex-direction: column; gap: 18px; max-width: 420px; }
        .om-copy {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          line-height: 1.8;
          letter-spacing: 0.04em;
          color: #5E574F;
        }
        .om-copy--dim { color: var(--muted); }

        /* ── M-02 — model line ───────────────────────── */
        .om-model { position: relative; }
        .om-model-track {
          position: absolute;
          top: 3px;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--line);
        }
        .om-model-line {
          display: block;
          height: 100%;
          background: var(--signal);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1400ms cubic-bezier(.16,1,.3,1) 250ms;
        }
        .om-block--on .om-model-line { transform: scaleX(1); }
        .om-phases {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0 40px;
        }
        .om-phase {
          display: flex;
          flex-direction: column;
          padding-top: 24px;
          position: relative;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 600ms ease calc(350ms + var(--i, 0) * 160ms),
            transform 700ms cubic-bezier(.16,1,.3,1) calc(350ms + var(--i, 0) * 160ms);
        }
        .om-block--on .om-phase { opacity: 1; transform: none; }
        .om-phase::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 7px;
          height: 7px;
          background: var(--warm-black);
        }
        .om-phase-num {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          color: var(--dust);
          margin-bottom: 8px;
        }
        .om-phase-name {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 21px;
          letter-spacing: 0.02em;
          color: var(--warm-black);
          margin-bottom: 10px;
        }
        .om-phase-desc {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          line-height: 1.7;
          color: #5E574F;
          max-width: 230px;
        }

        /* ── M-03 — principles index ─────────────────── */
        .om-principles { list-style: none; }
        .om-principle {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 32px;
          align-items: baseline;
          padding: 26px 0;
          border-top: 1px solid var(--line);
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 600ms ease calc(150ms + var(--i, 0) * 110ms),
            transform 700ms cubic-bezier(.16,1,.3,1) calc(150ms + var(--i, 0) * 110ms);
        }
        .om-block--on .om-principle { opacity: 1; transform: none; }
        .om-principle-num {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(30px, 3.4vw, 44px);
          line-height: 1;
          color: var(--dust);
        }
        .om-principle-name {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(20px, 2.4vw, 30px);
          letter-spacing: 0.01em;
          color: var(--warm-black);
          margin-bottom: 6px;
        }
        .om-principle-gloss {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          line-height: 1.65;
          color: #5E574F;
          max-width: 520px;
        }

        /* ── M-04 — refusals ─────────────────────────── */
        .om-refusals { list-style: none; }
        .om-refusal {
          display: flex;
          gap: 18px;
          align-items: baseline;
          padding: 16px 0;
          border-top: 1px solid var(--line);
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 600ms ease calc(200ms + var(--i, 0) * 100ms),
            transform 700ms cubic-bezier(.16,1,.3,1) calc(200ms + var(--i, 0) * 100ms);
        }
        .om-block--on .om-refusal { opacity: 1; transform: none; }
        .om-refusal-x {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          color: var(--olive);
          flex-shrink: 0;
        }
        .om-refusal-name {
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          letter-spacing: 0.04em;
          color: var(--warm-black);
          margin-bottom: 3px;
        }
        .om-refusal-gloss {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          line-height: 1.6;
          color: var(--muted);
        }

        /* ── Reduced motion ──────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .om-phase, .om-principle, .om-refusal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .om-model-line { transform: scaleX(1) !important; transition: none !important; }
        }

        /* ── Mobile ──────────────────────────────────── */
        @media (max-width: 900px) {
          .om-block { padding: 52px 24px 64px; }
          .om-label-row { margin-bottom: 36px; }
          .om-grid { grid-template-columns: 1fr; gap: 28px 0; }
          .om-model-track { display: none; }
          .om-phases { grid-template-columns: 1fr; gap: 36px 0; }
          .om-phase { padding-top: 0; padding-left: 22px; }
          .om-phase::before { top: 4px; }
          .om-principle { grid-template-columns: 64px 1fr; gap: 20px; }
        }
      `}</style>
    </div>
  );
}
