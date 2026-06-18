"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function ScanProtocol() {
  const t = useTranslations();
  const p = t.diagnosisPage.protocol;

  const readRef = useRef(null);
  const readInView = useInView(readRef, { once: true, amount: 0.15 });
  const delRef = useRef(null);
  const delInView = useInView(delRef, { once: true, amount: 0.2 });
  const stepRef = useRef(null);
  const stepInView = useInView(stepRef, { once: true, amount: 0.2 });
  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, amount: 0.15 });

  const anim = (inView: boolean, delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <>
      {/* ── 02 — WHAT WE CHECK ── */}
      <section
        ref={readRef}
        className={`scp-section${readInView ? " scp--on" : ""}`}
        aria-label={p.measuresLabel}
      >
        {/* What we look for — the diagnostic stance, near the intake */}
        <motion.div {...anim(readInView, 0)} className="scp-lookfor">
          <span className="scp-label">{p.lookForLabel}</span>
          <p className="scp-lookfor-copy">{p.lookForCopy}</p>
        </motion.div>

        <motion.div {...anim(readInView, 0.08)} className="scp-label-row">
          <span className="scp-label">02</span>
          <span className="scp-label">{p.measuresLabel}</span>
          <span className="scp-label scp-label--right">{p.measuresRight}</span>
        </motion.div>

        <ul className="scp-measures">
          {p.measures.map((m, i) => (
            <li key={m.name} className="scp-measure" style={{ "--i": i } as React.CSSProperties}>
              <span className="scp-measure-num">0{i + 1}</span>
              <span className="scp-measure-name">{m.name}</span>
              <span className="scp-measure-q">{m.question}</span>
              <span className="scp-measure-reads">{m.reads}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 03 — WHAT YOU RECEIVE ── */}
      <section
        ref={delRef}
        className={`scp-section${delInView ? " scp--on" : ""}`}
        aria-label={p.deliverablesLabel}
      >
        <motion.div {...anim(delInView, 0)} className="scp-label-row">
          <span className="scp-label">03</span>
          <span className="scp-label">{p.deliverablesLabel}</span>
          <span className="scp-label scp-label--right">{p.deliverablesRight}</span>
        </motion.div>

        <ul className="scp-measures">
          {p.deliverables.map((d, i) => (
            <li key={d.name} className="scp-measure scp-measure--del" style={{ "--i": i } as React.CSSProperties}>
              <span className="scp-measure-num">0{i + 1}</span>
              <span className="scp-measure-name scp-del-name">{d.name}</span>
              <span className="scp-measure-q">{d.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 04 — PROTOCOL ── */}
      <section
        ref={stepRef}
        className={`scp-section${stepInView ? " scp--on" : ""}`}
        aria-label={p.stepsLabel}
      >
        <motion.div {...anim(stepInView, 0)} className="scp-label-row">
          <span className="scp-label">04</span>
          <span className="scp-label">{p.stepsLabel}</span>
        </motion.div>

        <div className="scp-steps-wrap">
          <div className="scp-rail" aria-hidden="true">
            <span className="scp-rail-fill" />
          </div>
          <ol className="scp-steps">
            {p.steps.map((s, i) => (
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
          {p.mailNote} <a href="mailto:hello@seeszn.com">HELLO@SEESZN.COM</a>
        </motion.p>
      </section>

      {/* ── 05 — QUESTIONS (visible FAQ, matches FAQPage schema) ── */}
      <section
        ref={faqRef}
        className={`scp-section${faqInView ? " scp--on" : ""}`}
        aria-label={t.diagnosisPage.faqLabel}
      >
        <motion.div {...anim(faqInView, 0)} className="scp-label-row">
          <span className="scp-label">05</span>
          <span className="scp-label">{t.diagnosisPage.faqLabel}</span>
        </motion.div>

        <dl className="scp-faq">
          {t.diagnosisPage.faq.map((item) => (
            <div key={item.q} className="scp-faq-item">
              <dt className="scp-faq-q">{item.q}</dt>
              <dd className="scp-faq-a">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <style>{`
        .scp-section {
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
          padding: 72px 64px 88px;
        }
        .scp-label-row { display: flex; gap: 16px; margin-bottom: 56px; align-items: baseline; }
        .scp-label {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .scp-label--right { margin-left: auto; font-size: 9px; }

        /* ── what we look for — diagnostic stance ─────── */
        .scp-lookfor {
          max-width: 760px;
          margin-bottom: 64px;
          padding-bottom: 40px;
          border-bottom: 1px solid var(--line);
        }
        .scp-lookfor .scp-label { display: block; margin-bottom: 18px; }
        .scp-lookfor-copy {
          font-family: var(--font-editorial), serif;
          font-style: normal;
          font-size: clamp(20px, 2.4vw, 30px);
          line-height: 1.3;
          letter-spacing: -0.01em;
          color: var(--ink-strong);
        }

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
        /* deliverables reuse the measures row, minus the right "reads" column */
        .scp-measure--del { grid-template-columns: 56px 230px 1fr; }
        .scp-del-name {
          font-size: clamp(16px, 1.7vw, 21px) !important;
          letter-spacing: 0 !important;
        }
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
          font-style: normal;
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
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-body);
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

        /* ── FAQ — definition list, fully crawlable ───── */
        .scp-faq {
          max-width: 760px;
          border-top: 1px solid var(--line);
        }
        .scp-faq-item {
          padding: 26px 0;
          border-bottom: 1px solid var(--line);
        }
        .scp-faq-q {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(17px, 1.8vw, 22px);
          letter-spacing: 0.01em;
          color: var(--warm-black);
          margin-bottom: 12px;
        }
        .scp-faq-a {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14.5px;
          line-height: 1.65;
          color: var(--text-body);
          max-width: 620px;
        }

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
