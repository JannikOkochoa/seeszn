"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function BuiltFor() {
  const t = useTranslations();
  const b = t.builtFor;
  const diagHref = t.locale === "de" ? "/diagnosis" : "/en/diagnosis";
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.18 });

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <section ref={ref} className={`bf-section${inView ? " bf--on" : ""}`} aria-label={b.sectionLabel}>
      <motion.div {...anim(0)} className="bf-label-row">
        <span className="bf-label">{b.sectionLabel}</span>
      </motion.div>

      <div className="bf-grid">
        <motion.h2 {...anim(0.08)} className="bf-headline">
          {b.headlineRoman}
          <br />
          <em>{b.headlineItalic}</em>
        </motion.h2>
        <motion.p {...anim(0.14)} className="bf-intro">{b.intro}</motion.p>
      </div>

      <div className="bf-cols">
        <div className="bf-col">
          <span className="bf-col-label bf-col-label--for">{b.forLabel}</span>
          <ul className="bf-list">
            {b.for.map((item, i) => (
              <li key={item} className="bf-item" style={{ "--i": i } as React.CSSProperties}>
                <span className="bf-mark bf-mark--for" aria-hidden="true" />
                <span className="bf-item-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bf-col">
          <span className="bf-col-label">{b.notForLabel}</span>
          <ul className="bf-list">
            {b.notFor.map((item, i) => (
              <li key={item} className="bf-item bf-item--not" style={{ "--i": i } as React.CSSProperties}>
                <span className="bf-mark bf-mark--not" aria-hidden="true">✕</span>
                <span className="bf-item-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <motion.p {...anim(0.2)} className="bf-note">
        <Link href={diagHref}>{b.note}</Link>
      </motion.p>

      <style>{`
        .bf-section {
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
          padding: 72px 64px 88px;
        }
        .bf-label-row { display: flex; gap: 16px; margin-bottom: 52px; align-items: baseline; }
        .bf-label {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .bf-grid {
          display: grid;
          grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
          gap: 0 64px;
          align-items: end;
          margin-bottom: 64px;
        }
        .bf-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(32px, 4.2vw, 56px);
          line-height: 1.08;
          color: var(--warm-black);
          margin: 0;
        }
        .bf-headline em { font-style: normal; }
        .bf-intro {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          line-height: 1.65;
          color: var(--text-body);
          max-width: 420px;
        }

        .bf-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 64px;
          border-top: 1px solid var(--warm-black);
        }
        .bf-col { padding-top: 32px; }
        .bf-col + .bf-col { border-left: 1px solid var(--line); padding-left: 64px; }
        .bf-col-label {
          display: block;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 28px;
        }
        .bf-col-label--for { color: var(--warm-black); }
        .bf-list { list-style: none; }
        .bf-item {
          display: flex;
          gap: 16px;
          align-items: baseline;
          padding: 18px 0;
          border-top: 1px solid var(--line);
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 600ms ease calc(150ms + var(--i, 0) * 90ms),
            transform 700ms cubic-bezier(.16,1,.3,1) calc(150ms + var(--i, 0) * 90ms);
        }
        .bf--on .bf-item { opacity: 1; transform: none; }
        .bf-item:first-child { border-top: none; }
        .bf-mark { flex-shrink: 0; }
        .bf-mark--for {
          width: 7px;
          height: 7px;
          background: var(--olive);
          transform: translateY(-1px);
        }
        .bf-mark--not {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1;
        }
        .bf-item-text {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          line-height: 1.55;
          color: var(--text-body);
        }
        .bf-item--not .bf-item-text { color: var(--text-muted); }

        .bf-note {
          margin-top: 48px;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          color: var(--text-muted);
        }
        .bf-note a {
          color: var(--warm-black);
          border-bottom: 1px solid var(--signal);
          padding-bottom: 2px;
        }
        .bf-note a:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {
          .bf-item { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
        @media (max-width: 900px) {
          .bf-section { padding: 52px 24px 64px; }
          .bf-label-row { margin-bottom: 36px; }
          .bf-grid { grid-template-columns: 1fr; gap: 24px 0; margin-bottom: 44px; }
          .bf-cols { grid-template-columns: 1fr; }
          .bf-col + .bf-col { border-left: none; padding-left: 0; border-top: 1px solid var(--line); margin-top: 8px; }
        }
      `}</style>
    </section>
  );
}
