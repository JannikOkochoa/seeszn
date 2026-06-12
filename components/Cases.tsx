"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const CARD_IMGS = [
  "/rischo-design-01.png",
  "/sivius-design-02.png",
  "/contentkueche-design-03.png",
];

const CARD_NAMES = ["RISCHO", "SIVIUS", "CONTENTKUECHE"];

const CARD_HREFS = ["/work", "/work", "/work"];

export default function Cases() {
  const t = useTranslations();
  const cs = t.cases;
  const CARDS = cs.cards;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} className="cases-section">

      {/* ── Header row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: EASE }}
        className="cases-header"
      >
        <div className="cases-labels">
          <span className="cases-chip">04</span>
          <span className="cases-chip">{cs.chip}</span>
        </div>
        <a href="/work" className="cases-viewall">
          {cs.viewAll}
          <span className="cases-viewall-arrow">→</span>
        </a>
      </motion.div>

      {/* ── Cards grid ── */}
      <div className="cases-grid">
        {CARDS.map((card, i) => (
          <motion.a
            key={i}
            href={CARD_HREFS[i]}
            className="cases-card"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: EASE, delay: i * 0.1 }}
          >
            {/* Full-bleed image */}
            <img
              src={CARD_IMGS[i]}
              alt={`${CARD_NAMES[i]} — Case ${card.index}`}
              className="cases-img"
            />

            {/* Permanent dark overlay */}
            <div className="cases-overlay-base" />
            {/* Additional hover darkening */}
            <div className="cases-overlay-hover" />

            {/* Diagonal scan line — single pass on hover */}
            <div className="cases-scan" aria-hidden="true" />

            {/* Top-left: case index + sector */}
            <span className="cases-meta">
              CASE {card.index} — {card.sector}
            </span>

            {/* Top-right: machine trace label — appears on hover */}
            <span className="cases-trace">{card.trace}</span>

            {/* Corner crop marks */}
            <div className="cases-corner cases-corner--tl" aria-hidden="true" />
            <div className="cases-corner cases-corner--br" aria-hidden="true" />

            {/* Bottom content */}
            <div className="cases-body">
              <p className="cases-client">{CARD_NAMES[i]}</p>
              <p className="cases-headline">{card.headline}</p>
              <span className="cases-cta">
                VIEW CASE
                <span className="cases-cta-dot" aria-hidden="true" />
                <span className="cases-cta-arrow">→</span>
              </span>
            </div>
          </motion.a>
        ))}
      </div>

      <style>{`
        /* ── Section ─────────────────────────────────── */
        .cases-section {
          padding: 80px 64px 88px;
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
        }

        /* ── Header ──────────────────────────────────── */
        .cases-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .cases-labels {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .cases-chip {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dust);
        }
        .cases-viewall {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--olive);
          display: inline-flex;
          align-items: center;
          gap: 7px;
          position: relative;
          padding-bottom: 3px;
        }
        .cases-viewall::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 100%;
          height: 1px;
          background: var(--olive);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 440ms cubic-bezier(.16,1,.3,1);
        }
        .cases-viewall:hover::after { transform: scaleX(1); }
        .cases-viewall-arrow {
          display: inline-block;
          transition: transform 420ms cubic-bezier(.16,1,.3,1);
        }
        .cases-viewall:hover .cases-viewall-arrow { transform: translateX(4px); }

        /* ── Grid ────────────────────────────────────── */
        .cases-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        /* ── Card shell ──────────────────────────────── */
        .cases-card {
          position: relative;
          aspect-ratio: 1 / 1.52;
          overflow: hidden;
          border: 1px solid var(--warm-black);
          cursor: pointer;
          display: block;
          text-decoration: none;
        }
        .cases-card + .cases-card { margin-left: -1px; }

        /* ── Image ───────────────────────────────────── */
        .cases-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          display: block;
          filter: saturate(0.72) contrast(1.08);
          transition:
            transform 880ms cubic-bezier(.16,1,.3,1),
            filter    880ms cubic-bezier(.16,1,.3,1);
          will-change: transform;
        }
        .cases-card:hover .cases-img {
          transform: scale(1.025);
          filter: saturate(0.58) contrast(1.16);
        }

        /* ── Overlays ────────────────────────────────── */
        .cases-overlay-base {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(17,16,14,0.05)  0%,
            rgba(17,16,14,0.18) 42%,
            rgba(17,16,14,0.80) 100%
          );
          z-index: 1;
          pointer-events: none;
        }
        .cases-overlay-hover {
          position: absolute;
          inset: 0;
          background: rgba(17,16,14,0.24);
          z-index: 2;
          opacity: 0;
          transition: opacity 760ms cubic-bezier(.16,1,.3,1);
          pointer-events: none;
        }
        .cases-card:hover .cases-overlay-hover { opacity: 1; }

        /* ── Scan line — diagonal machine pass ────────── */
        /*
          1px rotated element sweeps left → right across the card once.
          Gradient fades out at top/bottom so it reads as a trace, not a rule.
          12° rotation: recognisably diagonal, not 45°-cliché.
        */
        .cases-scan {
          position: absolute;
          top: -20%;
          left: 0;
          width: 1px;
          height: 140%;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(199,214,58,0.30) 18%,
            rgba(199,214,58,0.30) 82%,
            transparent 100%
          );
          transform: rotate(12deg);
          z-index: 7;
          opacity: 0;
          pointer-events: none;
        }
        .cases-card:hover .cases-scan {
          animation: cases-scan-sweep 880ms cubic-bezier(.16,1,.3,1) forwards;
        }
        @keyframes cases-scan-sweep {
          0%   { left: -4%;  opacity: 0;    }
          7%   { left: -4%;  opacity: 1;    }
          91%  { opacity: 0.38; }
          100% { left: 108%; opacity: 0;    }
        }

        /* ── Case meta — top-left ────────────────────── */
        .cases-meta {
          position: absolute;
          top: 18px; left: 20px;
          z-index: 5;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(184,174,160,0.52);
          pointer-events: none;
        }

        /* ── Machine trace label — top-right, hover only ─ */
        .cases-trace {
          position: absolute;
          top: 18px; right: 18px;
          z-index: 6;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(184,174,160,0);
          pointer-events: none;
          transition: color 600ms cubic-bezier(.16,1,.3,1) 80ms;
        }
        .cases-card:hover .cases-trace {
          color: rgba(184,174,160,0.46);
        }

        /* ── Corner crop marks ───────────────────────── */
        .cases-corner {
          position: absolute;
          width: 8px; height: 8px;
          z-index: 5;
          opacity: 0;
          transition: opacity 580ms cubic-bezier(.16,1,.3,1);
          pointer-events: none;
        }
        .cases-card:hover .cases-corner { opacity: 0.45; }
        .cases-corner::before,
        .cases-corner::after {
          content: '';
          position: absolute;
          background: rgba(184,174,160,0.7);
        }
        /* Top-left */
        .cases-corner--tl { top: 12px; left: 12px; }
        .cases-corner--tl::before { top: 0; left: 0; width: 100%; height: 1px; }
        .cases-corner--tl::after  { top: 0; left: 0; width: 1px; height: 100%; }
        /* Bottom-right */
        .cases-corner--br { bottom: 12px; right: 12px; }
        .cases-corner--br::before { bottom: 0; right: 0; width: 100%; height: 1px; }
        .cases-corner--br::after  { bottom: 0; right: 0; width: 1px; height: 100%; }

        /* ── Bottom content ──────────────────────────── */
        .cases-body {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 5;
          padding: 0 28px 30px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        /* Client name */
        .cases-client {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--olive);
          margin: 0;
          transition: transform 760ms cubic-bezier(.16,1,.3,1);
        }
        .cases-card:hover .cases-client { transform: translateY(-3px); }

        /* Proof statement — cold, diagnostic */
        .cases-headline {
          font-family: var(--font-editorial), serif;
          font-style: normal;
          font-weight: 400;
          font-size: clamp(22px, 2.6vw, 32px);
          line-height: 1.15;
          color: #ECE6DA;
          white-space: pre-line;
          margin: 0;
          transition: transform 760ms cubic-bezier(.16,1,.3,1);
        }
        .cases-card:hover .cases-headline { transform: translateY(-3px); }

        /* CTA */
        .cases-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--olive);
          pointer-events: all;
        }
        /* Olive signal dot — appears on hover */
        .cases-cta-dot {
          display: inline-block;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--olive);
          opacity: 0;
          transform: scale(0);
          transition:
            opacity   400ms cubic-bezier(.16,1,.3,1) 80ms,
            transform 400ms cubic-bezier(.16,1,.3,1) 80ms;
        }
        .cases-card:hover .cases-cta-dot {
          opacity: 1;
          transform: scale(1);
        }
        /* Arrow moves right */
        .cases-cta-arrow {
          display: inline-block;
          transition: transform 540ms cubic-bezier(.16,1,.3,1) 40ms;
        }
        .cases-card:hover .cases-cta-arrow { transform: translateX(4px); }

        /* ── Reduced motion ──────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .cases-img,
          .cases-overlay-hover,
          .cases-headline,
          .cases-cta-dot,
          .cases-cta-arrow,
          .cases-trace,
          .cases-corner { transition: none !important; }
          .cases-scan { display: none !important; }
          .cases-viewall-arrow,
          .cases-viewall::after { transition: none !important; }
        }

        /* ── Mobile ──────────────────────────────────── */
        @media (max-width: 820px) {
          .cases-section { padding: 56px 24px 64px; }
          .cases-grid    { grid-template-columns: 1fr; }
          .cases-card {
            aspect-ratio: 4 / 3;
            margin-left: 0 !important;
            margin-top: -1px;
          }
          .cases-card:first-child { margin-top: 0; }
        }
      `}</style>
    </section>
  );
}
