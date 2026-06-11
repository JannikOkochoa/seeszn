"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function TheShift() {
  const t = useTranslations();
  const ts = t.theShift;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    transition: { duration: 0.5, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="shift-section">

      {/* LEFT — headline */}
      <div className="shift-left">
        <motion.p {...fadeIn(0)} className="shift-headline">
          {ts.headline.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </motion.p>
      </div>

      {/* RIGHT — timeline + cta */}
      <div className="shift-right">
        {/* Timeline outer — clips the scanner sweep */}
        <motion.div {...fadeIn(0.1)} className="shift-timeline-outer">
          <div className="shift-timeline">
            <div className="shift-scanner" aria-hidden="true" />
            <div className="tl-line-base" />
            <div className="tl-line-active" />

            {ts.points.map((pt, i) => (
              <div
                key={pt.year}
                className={`tl-point${i === 3 ? " tl-point--active" : ""}`}
                style={{ "--tl-delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <span className="tl-label">{pt.label}</span>
                <span className="tl-dot" />
                <span className="tl-year">{pt.year}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeIn(0.18)} className="shift-cta-wrap">
          <a href="#contact" className="shift-cta-link">{ts.cta}</a>
        </motion.div>
      </div>

      <style>{`
        /* ── Section ─────────────────────────────────── */
        .shift-section {
          background: var(--paper);
          display: grid;
          grid-template-columns: 36% 64%;
          align-items: center;
          min-height: 260px;
          padding: 0 5vw;
          border-top: 1px solid rgba(20, 20, 20, .14);
          border-bottom: 1px solid rgba(20, 20, 20, .14);
        }

        /* ── Left column ─────────────────────────────── */
        .shift-left {
          padding: 32px 0;
        }

        .shift-headline {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(28px, 3.2vw, 52px);
          color: var(--warm-black);
          letter-spacing: -0.03em;
          line-height: 0.95;
          max-width: 420px;
          text-transform: uppercase;
          text-align: left;
        }

        /* ── Right column ────────────────────────────── */
        .shift-right {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 32px 0;
        }

        /* ── Timeline outer — clips scanner ──────────── */
        .shift-timeline-outer {
          width: 88%;
          margin-left: auto;
          overflow: hidden;
          position: relative;
        }

        /* ── Timeline flex row ───────────────────────── */
        .shift-timeline {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
        }

        /* ── Scanner sweep ───────────────────────────── */
        .shift-scanner {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 80px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(199, 214, 58, 0.14),
            transparent
          );
          transform: translateX(-100%);
          opacity: 0;
          pointer-events: none;
          z-index: 2;
        }

        .shift-section:hover .shift-scanner {
          animation: seesznScan 900ms cubic-bezier(.16,1,.3,1) 120ms forwards;
        }

        @keyframes seesznScan {
          0%   { transform: translateX(-100%); opacity: 1; }
          75%  { opacity: 0.75; }
          100% { transform: translateX(720px); opacity: 0; }
        }

        /* ── Connector lines ─────────────────────────── */
        .tl-line-base {
          position: absolute;
          top: 50%;
          left: 4px;
          right: 4px;
          height: 1px;
          background: rgba(20, 20, 20, 0.18);
          transform: translateY(-50%);
          z-index: 0;
        }

        .tl-line-active {
          position: absolute;
          top: 50%;
          left: 4px;
          right: 4px;
          height: 1px;
          background: var(--olive);
          opacity: 0.6;
          transform: translateY(-50%) scaleX(0);
          transform-origin: left center;
          z-index: 0;
          transition: transform 1100ms cubic-bezier(.16,1,.3,1) 60ms;
        }

        .shift-section:hover .tl-line-active {
          transform: translateY(-50%) scaleX(1);
        }

        /* ── Point ───────────────────────────────────── */
        .tl-point {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        /* Label */
        .tl-label {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
          transition:
            transform 500ms cubic-bezier(.16,1,.3,1) var(--tl-delay, 0ms),
            color      350ms ease                    var(--tl-delay, 0ms);
        }

        .tl-point--active .tl-label {
          color: var(--olive);
        }

        .shift-section:hover .tl-label {
          transform: translateY(-3px);
        }

        .shift-section:hover .tl-point--active .tl-label {
          color: var(--olive);
        }

        /* Dot */
        .tl-dot {
          width: 7px;
          height: 7px;
          background: var(--warm-black);
          display: block;
          flex-shrink: 0;
          transition:
            transform  500ms cubic-bezier(.16,1,.3,1) var(--tl-delay, 0ms),
            box-shadow 400ms ease                     var(--tl-delay, 0ms);
        }

        .tl-point--active .tl-dot {
          background: var(--olive);
        }

        .shift-section:hover .tl-dot {
          transform: scale(1.16);
        }

        .shift-section:hover .tl-point--active .tl-dot {
          box-shadow:
            0 0 0 3px rgba(199, 214, 58, 0.2),
            0 0 10px rgba(199, 214, 58, 0.18);
        }

        /* Year */
        .tl-year {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          color: var(--text-secondary);
          transition: color 350ms ease var(--tl-delay, 0ms);
        }

        .tl-point--active .tl-year {
          color: var(--warm-black);
        }

        .shift-section:hover .tl-year {
          color: var(--warm-black);
        }

        /* ── CTA ─────────────────────────────────────── */
        .shift-cta-wrap {
          width: 88%;
          margin-left: auto;
          text-align: right;
        }

        .shift-cta-link {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          transition: color 300ms ease;
        }

        .shift-section:hover .shift-cta-link {
          color: var(--olive);
        }

        /* ── Mobile ──────────────────────────────────── */
        @media (max-width: 768px) {
          .shift-section {
            grid-template-columns: 1fr;
            min-height: auto;
            padding: 48px 24px;
            gap: 32px;
          }

          .shift-left {
            padding: 0;
          }

          .shift-right {
            padding: 0;
          }

          .shift-timeline-outer,
          .shift-cta-wrap {
            width: 100%;
            margin-left: 0;
          }
        }
      `}</style>
    </section>
  );
}
