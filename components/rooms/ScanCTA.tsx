"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export interface ScanCTAProps {
  /** local section index of the closing section */
  index: string;
  label?: string;
  /** roman part of the headline */
  roman: string;
  /** italic part of the headline */
  italic: string;
  /** mono supporting lines */
  sub: string[];
  /** optional italic closing sentence under the olive rule */
  closing?: string;
}

export default function ScanCTA({
  index,
  label = "NEXT MOVE",
  roman,
  italic,
  sub,
  closing,
}: ScanCTAProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="scta-section">
      <motion.div {...anim(0)} className="scta-label-row">
        <span className="scta-label">{index}</span>
        <span className="scta-label">{label}</span>
      </motion.div>

      <div className="scta-center">
        <motion.h2 {...anim(0.08)} className="scta-headline">
          {roman}
          <br />
          <em>{italic}</em>
        </motion.h2>

        <motion.p {...anim(0.16)} className="scta-copy">
          {sub.map((line, i) => (
            <span key={line}>
              {line}
              {i < sub.length - 1 && <br />}
            </span>
          ))}
        </motion.p>

        <motion.div {...anim(0.24)}>
          <Link href="/diagnosis" className="scta-cta">
            BOOK A DIAGNOSIS <span style={{ color: "var(--olive)" }}>→</span>
          </Link>
        </motion.div>

        {closing && (
          <motion.div {...anim(0.34)} className="scta-close">
            <span className="scta-rule" aria-hidden="true" />
            <p className="scta-sentence">{closing}</p>
          </motion.div>
        )}
      </div>

      <style>{`
        .scta-section {
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
          padding: 72px 64px 110px;
        }
        .scta-label-row { display: flex; gap: 16px; margin-bottom: 72px; }
        .scta-label {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .scta-center {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .scta-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(38px, 5vw, 66px);
          line-height: 1.06;
          color: var(--warm-black);
          margin: 0 0 28px;
        }
        .scta-headline em { font-style: italic; }
        .scta-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-body);
          margin-bottom: 40px;
        }
        .scta-cta {
          display: inline-block;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          border: 1px solid var(--button-border);
          padding: 15px 32px;
          min-height: 44px;
          color: var(--text-primary);
          background: transparent;
          transition: background 0.25s, border-color 0.25s, color 0.25s;
        }
        .scta-cta:hover { background: var(--warm-black); border-color: var(--warm-black); color: var(--paper); }
        .scta-cta:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }
        .scta-close {
          margin-top: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }
        .scta-rule { width: 32px; height: 1px; background: var(--olive); display: block; }
        .scta-sentence {
          font-family: var(--font-editorial), serif;
          font-style: italic;
          font-size: 15px;
          line-height: 1.6;
          color: var(--muted);
        }
        @media (max-width: 768px) {
          .scta-section { padding: 52px 24px 80px; }
          .scta-label-row { margin-bottom: 52px; }
          .scta-close { margin-top: 48px; }
        }
      `}</style>
    </section>
  );
}
