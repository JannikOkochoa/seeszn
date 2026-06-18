"use client";

import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Fragment row positions inside the diagram viewBox
const FRAG_Y = [44, 112, 180, 248, 316];

export default function MachineMemory() {
  const t = useTranslations();
  const mm = t.servicesPage.machineMemory;
  const reduced = useReducedMotion();

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  // The diagram is drawn by the scroll position itself —
  // pull the page down and the question fans out into sources.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "end 0.45"],
  });
  const one = useTransform(scrollYProgress, [0, 1], [1, 1]);
  const fanLen = useTransform(scrollYProgress, [0.05, 0.45], [0, 1]);
  const convLen = useTransform(scrollYProgress, [0.4, 0.78], [0, 1]);
  const fragOp = useTransform(scrollYProgress, [0.3, 0.55], [0, 1]);
  const answerOp = useTransform(scrollYProgress, [0.7, 0.92], [0, 1]);
  const inOp = useTransform(scrollYProgress, [0, 0.12], [0, 1]);

  const pFan = reduced ? one : fanLen;
  const pConv = reduced ? one : convLen;
  const oFrag = reduced ? one : fragOp;
  const oAnswer = reduced ? one : answerOp;
  const oIn = reduced ? one : inOp;

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.75, ease: EASE, delay },
  });

  return (
    <section
      ref={ref}
      className="mm-section"
      aria-label="Machine memory: how AI search retrieves"
    >
      {/* Ghost backdrop word */}
      <span className="mm-ghost" aria-hidden="true">{mm.sectionLabel}</span>

      <motion.div {...anim(0)} className="mm-label-row">
        <span className="mm-label">04</span>
        <span className="mm-label">{mm.sectionLabel}</span>
      </motion.div>

      <div className="mm-grid">
        {/* Text */}
        <div className="mm-text">
          <motion.h2 {...anim(0.08)} className="mm-headline">
            {mm.headline}
            <br />
            <em>{mm.headlineItalic}</em>
          </motion.h2>
          <motion.p {...anim(0.16)} className="mm-copy">
            {mm.copy}
          </motion.p>
          <motion.p {...anim(0.24)} className="mm-footnote">
            {mm.footnote}
          </motion.p>
        </div>

        {/* Scroll-drawn diagram */}
        <div
          className="mm-diagram"
          role="img"
          aria-label={`${mm.input} → ${mm.fragments.join(", ")} → ${mm.output}`}
        >
          <svg viewBox="0 0 560 360" className="mm-svg" aria-hidden="true">
            {/* Input node */}
            <motion.g style={{ opacity: oIn }}>
              <rect x="2" y="164" width="92" height="32" fill="none" stroke="currentColor" strokeWidth="1" />
              <text x="48" y="184" textAnchor="middle" className="mm-svg-label">{mm.input}</text>
            </motion.g>

            {/* Fan-out lines — drawn by scroll */}
            {FRAG_Y.map((y, i) => (
              <motion.path
                key={`fan-${i}`}
                d={`M 96 180 C 160 180, 170 ${y}, 218 ${y}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.55"
                style={{ pathLength: pFan }}
              />
            ))}

            {/* Fragments */}
            {mm.fragments.map((frag, i) => (
              <motion.g key={frag} style={{ opacity: oFrag }}>
                <circle cx="224" cy={FRAG_Y[i]} r="2.5" fill="currentColor" />
                <text x="238" y={FRAG_Y[i] + 3.5} className="mm-svg-label mm-svg-label--dim">
                  {frag}
                </text>
              </motion.g>
            ))}

            {/* Reconvergence lines */}
            {FRAG_Y.map((y, i) => (
              <motion.path
                key={`conv-${i}`}
                d={`M 330 ${y} C 380 ${y}, 390 180, 438 180`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.55"
                style={{ pathLength: pConv }}
              />
            ))}

            {/* Answer surface */}
            <motion.g style={{ opacity: oAnswer }}>
              <rect x="440" y="156" width="118" height="48" fill="none" stroke="currentColor" strokeWidth="1" />
              <text x="499" y="183" textAnchor="middle" className="mm-svg-label">{mm.output}</text>
              <rect x="440" y="156" width="4" height="48" className="mm-answer-flag" />
            </motion.g>
          </svg>
        </div>
      </div>

      <style>{`
        .mm-section {
          position: relative;
          background: var(--paper);
          border-bottom: 1px solid var(--warm-black);
          padding: 120px 64px 130px;
          overflow: hidden;
        }
        .mm-ghost {
          position: absolute;
          right: -2vw;
          top: 36px;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(70px, 10vw, 160px);
          letter-spacing: -0.03em;
          line-height: 1;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 10%, transparent);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
        }
        .mm-label-row { display: flex; gap: 16px; margin-bottom: 56px; position: relative; }
        .mm-label {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .mm-grid {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 45fr) minmax(0, 55fr);
          gap: 0 72px;
          align-items: center;
        }
        .mm-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(36px, 4.4vw, 64px);
          line-height: 1.06;
          color: var(--warm-black);
          margin: 0 0 28px;
        }
        .mm-headline em { font-style: normal; }
        .mm-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-body);
          max-width: 420px;
          margin: 0 0 28px;
        }
        .mm-footnote {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          color: var(--dust);
          line-height: 1.8;
          margin: 0;
          max-width: 380px;
        }

        .mm-diagram { color: var(--warm-black); }
        .mm-svg {
          display: block;
          width: 100%;
          max-width: 600px;
          height: auto;
          overflow: visible;
        }
        .mm-svg-label {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          fill: var(--warm-black);
        }
        .mm-svg-label--dim { fill: var(--text-secondary); font-size: 10px; }
        .mm-answer-flag { fill: var(--olive); }

        @media (max-width: 900px) {
          .mm-section { padding: 72px 24px 80px; }
          .mm-ghost { font-size: 22vw; top: 20px; }
          .mm-label-row { margin-bottom: 40px; }
          .mm-grid {
            grid-template-columns: 1fr;
            gap: 48px 0;
          }
        }
      `}</style>
    </section>
  );
}
