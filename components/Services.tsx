"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "@/lib/i18n/context";
import VisibilityField from "@/components/home/VisibilityField";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const IMGS = [
  "/seeszn-home-main-01.png",
  "/seeszn-home-main-02.png",
  "/seeszn-home-main-03.png",
  "/seeszn-home-main-04.png",
];

export default function Services() {
  const t = useTranslations();
  const s = t.homepageServices;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });

  return (
    <section ref={ref} className={`eng-section${inView ? " eng-section--visible" : ""}`}>
      {/* Visibility Field — cinematic header stage (label + headline + intro) */}
      <VisibilityField
        index="02"
        label={s.sectionLabel}
        headline={s.headline}
        headlineAccent={s.headlineItalic}
        intro={s.intro}
      />

      {/* Three engagements — emerging from the visibility system above */}
      {s.rows.map((row, i) => (
        <motion.article
          key={i}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: EASE, delay: i * 0.12 }}
          className="eng-row"
          style={{ "--reveal-delay": `${i * 120 + 160}ms` } as React.CSSProperties}
        >
          {/* Text column */}
          <div className="eng-main">
            <div className="eng-row-head">
              <span className="eng-num">{row.num}</span>
              <span className="t-mono eng-discipline">{row.discipline}</span>
            </div>

            <h3 className="eng-name">{row.name}</h3>
            <p className="eng-tag">{row.tag}</p>

            <div className="eng-rule" />

            <div className="eng-cols">
              <div className="eng-block">
                <span className="t-eyebrow">{s.problemLabel}</span>
                <p className="eng-copy">{row.problem}</p>
              </div>
              <div className="eng-block">
                <span className="t-eyebrow">{s.workLabel}</span>
                <p className="eng-copy">{row.work}</p>
              </div>
            </div>

            <div className="eng-gain">
              <span className="t-eyebrow">{s.gainLabel}</span>
              <ul className="eng-gain-list">
                {row.gain.map((g, gi) => (
                  <li key={gi} className="eng-gain-item">
                    <span className="olive-dot eng-dot" aria-hidden="true" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a href="#contact" className="eng-cta">
              {t.common.bookDiagnosis} <span style={{ color: "var(--olive)" }}>→</span>
            </a>
          </div>

          {/* Image column */}
          <div className="eng-img-wrap">
            <img src={IMGS[i]} alt="" className="eng-img" />
            <div className="eng-img-overlay" />
          </div>
        </motion.article>
      ))}

      <style>{`
        .eng-section {
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
          padding-top: clamp(32px, 4vw, 56px);
        }

        /* Header lives in <VisibilityField /> — see components/home/VisibilityField.tsx */

        /* ── Row ────────────────────────────────────── */
        .eng-row {
          display: grid;
          grid-template-columns: 1fr 34%;
          border-top: 1px solid var(--warm-black);
        }
        .eng-row:last-child {
          border-bottom: 1px solid var(--warm-black);
        }

        .eng-main {
          padding: clamp(48px, 5vw, 72px) clamp(40px, 4vw, 64px) clamp(52px, 5.5vw, 80px) var(--gutter);
          border-right: 1px solid var(--warm-black);
        }

        .eng-row-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 18px;
        }
        .eng-num {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(40px, 4.5vw, 58px);
          line-height: 1;
          color: var(--ink-strong);
        }
        .eng-discipline {
          text-align: right;
        }

        .eng-name {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(26px, 3vw, 36px);
          line-height: 1.05;
          letter-spacing: -0.01em;
          color: var(--ink-strong);
          margin-bottom: 8px;
        }
        .eng-tag {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .eng-rule {
          width: 40px;
          height: 2px;
          background: var(--olive);
          margin: 26px 0;
        }

        /* Problem + What we do */
        .eng-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(40px, 4vw, 56px);
          margin-bottom: 44px;
        }
        .eng-block .t-eyebrow { display: block; margin-bottom: 12px; }
        .eng-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          line-height: 1.62;
          color: var(--text-body);
        }

        /* What you get */
        .eng-gain { margin-bottom: 40px; }
        .eng-gain .t-eyebrow { display: block; margin-bottom: 14px; }
        .eng-gain-list { list-style: none; display: grid; gap: 11px; }
        .eng-gain-item {
          display: flex;
          align-items: baseline;
          gap: 12px;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          line-height: 1.5;
          color: var(--text-primary);
        }
        .eng-dot {
          width: 5px;
          height: 5px;
          background: var(--olive);
          flex-shrink: 0;
          transform: translateY(-2px);
        }

        /* CTA */
        .eng-cta {
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
          transition: background 0.25s, border-color 0.25s, color 0.25s;
        }
        .eng-cta:hover {
          background: var(--warm-black);
          border-color: var(--warm-black);
          color: var(--paper);
        }
        .eng-cta:hover span { color: var(--paper) !important; }

        /* ── Image ──────────────────────────────────── */
        .eng-img-wrap {
          position: relative;
          overflow: hidden;
          clip-path: inset(0 100% 0 0);
          transition: clip-path 900ms cubic-bezier(.16,1,.3,1) var(--reveal-delay, 180ms);
        }
        .eng-section--visible .eng-img-wrap {
          clip-path: inset(0 0% 0 0);
        }
        .eng-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: blur(7px);
          transition: filter 1050ms cubic-bezier(.16,1,.3,1) calc(var(--reveal-delay, 180ms) + 260ms);
        }
        .eng-section--visible .eng-img { filter: blur(0); }
        .eng-img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(17, 16, 14, 0.04);
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .eng-img-wrap { clip-path: none !important; transition: none !important; }
          .eng-img { filter: none !important; transition: none !important; }
        }

        /* ── Mobile ─────────────────────────────────── */
        @media (max-width: 768px) {
          .eng-section { padding-top: 40px; }
          .eng-head { padding: 0 24px 32px; }
          .eng-row { grid-template-columns: 1fr; }
          .eng-main { padding: 28px 24px 32px; border-right: none; }
          .eng-cols { grid-template-columns: 1fr; gap: 24px; }
          .eng-img-wrap { display: none; }
        }
      `}</style>
    </section>
  );
}
