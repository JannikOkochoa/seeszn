"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function DiagnosisCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="dcta-section">
      <motion.div {...anim(0)} className="dcta-label-row">
        <span className="dcta-label">04</span>
        <span className="dcta-label">NEXT MOVE</span>
      </motion.div>

      <div className="dcta-center">
        <motion.h2 {...anim(0.08)} className="dcta-headline">
          Not sure where
          <br />
          <em>visibility breaks?</em>
        </motion.h2>

        <motion.p {...anim(0.16)} className="dcta-copy">
          WE MAP YOUR CURRENT SEARCH VISIBILITY,
          <br />
          AI CITATION POTENTIAL, WEBSITE STRUCTURE
          <br />
          AND HIGHEST-LEVERAGE NEXT MOVES.
        </motion.p>

        <motion.div {...anim(0.24)}>
          <a href="/diagnosis" className="dcta-cta">
            BOOK A DIAGNOSIS <span style={{ color: "var(--olive)" }}>→</span>
          </a>
        </motion.div>

        <motion.div {...anim(0.34)} className="dcta-close">
          <span className="dcta-rule" aria-hidden="true" />
          <p className="dcta-sentence">
            We build the surfaces machines retrieve and people trust.
          </p>
        </motion.div>
      </div>

      <style>{`
        .dcta-section {
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
          padding: 72px 64px 110px;
        }
        .dcta-label-row { display: flex; gap: 16px; margin-bottom: 72px; }
        .dcta-label {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dust);
        }

        .dcta-center {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .dcta-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(40px, 5.4vw, 72px);
          line-height: 1.06;
          color: var(--warm-black);
          margin: 0 0 28px;
        }
        .dcta-headline em { font-style: italic; }
        .dcta-copy {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          line-height: 1.8;
          letter-spacing: 0.05em;
          color: #5E574F;
          margin-bottom: 40px;
        }
        .dcta-cta {
          display: inline-block;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1px solid var(--warm-black);
          padding: 16px 32px;
          color: var(--warm-black);
          background: transparent;
          transition: background 0.2s, color 0.2s;
        }
        .dcta-cta:hover { background: var(--warm-black); color: var(--paper); }
        .dcta-cta:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }

        .dcta-close {
          margin-top: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }
        .dcta-rule {
          width: 32px;
          height: 1px;
          background: var(--olive);
          display: block;
        }
        .dcta-sentence {
          font-family: var(--font-editorial), serif;
          font-style: italic;
          font-size: 15px;
          line-height: 1.6;
          color: var(--muted);
        }

        @media (max-width: 768px) {
          .dcta-section { padding: 52px 24px 80px; }
          .dcta-label-row { margin-bottom: 52px; }
          .dcta-close { margin-top: 48px; }
        }
      `}</style>
    </section>
  );
}
