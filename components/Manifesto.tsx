"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const CONTRASTS = [
  { left: "NOT RANKINGS", right: "RECALL" },
  { left: "NOT TRAFFIC", right: "PRESENCE" },
  { left: "NOT CONTENT", right: "CITATIONS" },
  { left: "NOT REACH", right: "AUTHORITY" },
];

export default function Manifesto() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.5, ease: EASE, delay },
  });

  return (
    <section
      ref={ref}
      style={{
        padding: "96px 64px",
        background: "var(--paper)",
        borderTop: "1px solid var(--warm-black)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "55fr 45fr",
          gap: 80,
          alignItems: "start",
        }}
      >
        {/* LEFT — headline */}
        <div>
          <motion.div {...anim(0)} style={{ display: "flex", gap: 16, marginBottom: 40 }}>
            <span style={labelStyle}>05</span>
            <span style={labelStyle}>OUR MANIFESTO</span>
          </motion.div>

          <motion.h2
            {...anim(0.08)}
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 700,
              fontSize: "clamp(40px, 6vw, 80px)",
              lineHeight: 0.95,
              letterSpacing: "0.01em",
              color: "var(--warm-black)",
            }}
          >
            IF THE MODEL
            <br />
            CANNOT{" "}
            <span style={{ color: "var(--olive)" }}>CITE</span> YOU,
            <br />
            YOU DO NOT EXIST.
          </motion.h2>
        </div>

        {/* RIGHT — contrasts */}
        <div style={{ paddingTop: 80 }}>
          {CONTRASTS.map((row, i) => (
            <motion.div
              key={row.left}
              {...anim(0.08 + i * 0.06)}
              className={`mfst-pair${i === CONTRASTS.length - 1 ? " mfst-pair--last" : ""}`}
            >
              <span className="mfst-left">{row.left}</span>
              <span className="mfst-arrow">→</span>
              <span className="mfst-right">{row.right}</span>
            </motion.div>
          ))}

          <motion.div {...anim(0.34)} style={{ textAlign: "right", marginTop: 24 }}>
            <a
              href="#contact"
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                color: "var(--olive)",
                letterSpacing: "0.08em",
              }}
            >
              READ MORE →
            </a>
          </motion.div>
        </div>
      </div>
      <style>{`
        /* ── Contrast pair row ───────────────────────── */
        .mfst-pair {
          border-top: 1px solid var(--dust);
          padding: 16px 0;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .mfst-pair--last {
          border-bottom: 1px solid var(--dust);
        }

        /* ── Left — old metric (struck out) ─────────── */
        .mfst-left {
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          color: var(--dust);
          text-decoration: line-through;
          flex: 1;
          transition:
            opacity 320ms ease 40ms,
            filter  320ms ease;
        }
        .mfst-pair:hover .mfst-left {
          opacity: 0.18;
          filter: blur(0.6px);
        }

        /* ── Arrow ───────────────────────────────────── */
        .mfst-arrow {
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          color: var(--dust);
          transition: color 350ms ease 80ms;
        }
        .mfst-pair:hover .mfst-arrow {
          color: var(--olive);
        }

        /* ── Right — new metric (confirmed) ─────────── */
        .mfst-right {
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          font-weight: 500;
          color: var(--warm-black);
          flex: 1;
          text-align: right;
          position: relative;
          transition: letter-spacing 500ms cubic-bezier(.16,1,.3,1) 100ms;
        }
        /* Olive underline sweeps right-to-left */
        .mfst-right::after {
          content: '';
          position: absolute;
          bottom: -2px;
          right: 0;
          width: 100%;
          height: 1px;
          background: var(--olive);
          transform: scaleX(0);
          transform-origin: right center;
          transition: transform 560ms cubic-bezier(.16,1,.3,1) 180ms;
        }
        .mfst-pair:hover .mfst-right {
          letter-spacing: 0.02em;
        }
        .mfst-pair:hover .mfst-right::after {
          transform: scaleX(1);
        }

        @media (prefers-reduced-motion: reduce) {
          .mfst-left, .mfst-arrow, .mfst-right, .mfst-right::after {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--dust)",
};
