"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const IMGS = [
  "/seeszn-home-main-01.png",
  "/seeszn-home-main-02.png",
  "/seeszn-home-main-03.png",
  "/seeszn-home-main-04.png",
];

export default function Services() {
  const t = useTranslations();
  const ROWS = t.homepageServices.rows;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section ref={ref} className={`svc-section${inView ? " svc-section--visible" : ""}`}>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: EASE }}
        className="svc-label-row"
      >
        <span className="svc-label">02</span>
        <span className="svc-label">{t.homepageServices.sectionLabel}</span>
      </motion.div>

      {/* Accordion rows */}
      {ROWS.map((row, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE, delay: i * 0.07 }}
          className="svc-row"
          style={{ "--reveal-delay": `${i * 130 + 180}ms` } as React.CSSProperties}
        >
          {/* Clickable strip */}
          <div
            className="svc-row-grid"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {/* Left: number + name/sub */}
            <div className="svc-left">
              <div className="svc-top">
                <span className="svc-num">{row.num}</span>
                <span
                  className={`svc-toggle${open === i ? " svc-toggle--open" : ""}`}
                  aria-hidden="true"
                />
              </div>
              <div className="svc-bottom">
                <p className="svc-name">{row.name}</p>
                <p className="svc-sub">{row.sub}</p>
              </div>
            </div>

            {/* Right: image */}
            <div className="svc-img-wrap">
              <img src={IMGS[i]} alt={row.name} className="svc-img" />
              <div className="svc-img-overlay" />
            </div>
          </div>

          {/* Expanded detail */}
          <AnimatePresence>
            {open === i && (
              <motion.div
                key="detail"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                style={{ overflow: "hidden" }}
              >
                <p className="svc-detail">{row.detail}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      <style>{`
        /* ── Section ─────────────────────────────────── */
        .svc-section {
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
          padding-top: 48px;
        }

        /* ── Header label ────────────────────────────── */
        .svc-label-row {
          display: flex;
          gap: 16px;
          align-items: center;
          padding-left: 64px;
          margin-bottom: 32px;
        }
        .svc-label {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ── Row wrapper ─────────────────────────────── */
        .svc-row {
          border-top: 1px solid var(--warm-black);
        }
        .svc-row:last-child {
          border-bottom: 1px solid var(--warm-black);
        }

        /* ── Clickable two-column grid ───────────────── */
        .svc-row-grid {
          display: grid;
          grid-template-columns: 1fr 38%;
          min-height: 180px;
          cursor: pointer;
          transition: background 350ms ease;
        }
        .svc-row-grid:hover {
          background: rgba(17, 16, 14, 0.02);
        }

        /* ── Left column ─────────────────────────────── */
        .svc-left {
          padding: 28px 40px 28px 64px;
          border-right: 1px solid var(--warm-black);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Number + toggle */
        .svc-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .svc-num {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(36px, 4.5vw, 56px);
          color: var(--warm-black);
          line-height: 1;
        }

        /* ── Toggle — CSS cross ──────────────────────── */
        .svc-toggle {
          display: block;
          width: 14px;
          height: 14px;
          position: relative;
          flex-shrink: 0;
          margin-top: 8px;
        }
        .svc-toggle::before,
        .svc-toggle::after {
          content: '';
          position: absolute;
          background: var(--warm-black);
          transition:
            transform 600ms cubic-bezier(.16,1,.3,1),
            opacity   400ms ease;
        }
        /* Horizontal bar — always visible */
        .svc-toggle::before {
          width: 100%;
          height: 1px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }
        /* Vertical bar — visible when closed */
        .svc-toggle::after {
          width: 1px;
          height: 100%;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        /* Open state: vertical collapses → shows − */
        .svc-toggle--open::after {
          transform: translateX(-50%) scaleY(0);
          opacity: 0;
        }
        /* Hover (closed): rotate bars to × */
        .svc-row-grid:hover .svc-toggle:not(.svc-toggle--open)::before {
          transform: translateY(-50%) rotate(45deg);
        }
        .svc-row-grid:hover .svc-toggle:not(.svc-toggle--open)::after {
          transform: translateX(-50%) rotate(-45deg);
        }

        /* ── Name + sub ──────────────────────────────── */
        .svc-bottom {
          /* sits at bottom of flex column */
        }
        .svc-name {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: var(--warm-black);
          letter-spacing: 0.01em;
          margin-bottom: 5px;
        }
        .svc-sub {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: var(--text-body);
          line-height: 1.6;
          transition: color 400ms ease;
        }
        .svc-row-grid:hover .svc-sub {
          color: var(--text-primary);
        }

        /* ── Image column ────────────────────────────── */
        .svc-img-wrap {
          position: relative;
          overflow: hidden;
          /* Clip-path reveal on scroll — left to right */
          clip-path: inset(0 100% 0 0);
          transition: clip-path 900ms cubic-bezier(.16,1,.3,1) var(--reveal-delay, 180ms);
        }
        .svc-section--visible .svc-img-wrap {
          clip-path: inset(0 0% 0 0);
        }
        .svc-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          /* Blur-to-sharp: starts after clip begins to open */
          filter: blur(7px);
          transition:
            transform 700ms cubic-bezier(.16,1,.3,1),
            filter   1050ms cubic-bezier(.16,1,.3,1) calc(var(--reveal-delay, 180ms) + 260ms);
        }
        .svc-section--visible .svc-img {
          filter: blur(0);
        }
        .svc-row-grid:hover .svc-img {
          transform: scale(1.025);
        }
        @media (prefers-reduced-motion: reduce) {
          .svc-img-wrap { clip-path: none !important; transition: none !important; }
          .svc-img      { filter: none !important;
                          transition: transform 700ms cubic-bezier(.16,1,.3,1) !important; }
        }
        /* Very subtle dark veil on hover */
        .svc-img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(17, 16, 14, 0);
          transition: background 600ms cubic-bezier(.16,1,.3,1);
          pointer-events: none;
          z-index: 1;
        }
        .svc-row-grid:hover .svc-img-overlay {
          background: rgba(17, 16, 14, 0.07);
        }

        /* ── Expanded detail ─────────────────────────── */
        .svc-detail {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: var(--text-body);
          line-height: 1.65;
          max-width: 640px;
          padding: 0 64px 28px;
        }

        /* ── Mobile ──────────────────────────────────── */
        @media (max-width: 768px) {
          .svc-section {
            padding-top: 36px;
          }
          .svc-label-row {
            padding-left: 24px;
          }
          .svc-row-grid {
            grid-template-columns: 1fr;
          }
          .svc-img-wrap {
            display: none;
          }
          .svc-left {
            padding: 24px;
            border-right: none;
          }
          .svc-detail {
            padding: 0 24px 24px;
          }
        }
      `}</style>
    </section>
  );
}
