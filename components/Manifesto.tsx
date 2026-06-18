"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Manifesto() {
  const t = useTranslations();
  const m = t.manifesto;
  const diagHref = t.locale === "de" ? "/diagnosis" : "/en/diagnosis";
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduced = useReducedMotion();

  // The manifesto inhales as it arrives; the ghost word counter-drifts
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.45], reduced ? [1, 1] : [0.94, 1]);
  const ghostY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["40%", "-40%"]);

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.5, ease: EASE, delay },
  });

  return (
    <section
      ref={ref}
      style={{
        padding: "var(--section-y) var(--gutter)",
        background: "var(--paper)",
        borderTop: "1px solid var(--warm-black)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Counter-parallax ghost word */}
      <motion.span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "-3vw",
          top: "8%",
          y: ghostY,
          fontFamily: "var(--font-display), sans-serif",
          fontWeight: 800,
          fontSize: "clamp(140px, 22vw, 360px)",
          letterSpacing: "-0.05em",
          lineHeight: 1,
          textTransform: "uppercase",
          color: "transparent",
          WebkitTextStroke: "1px color-mix(in srgb, var(--olive) 36%, transparent)",
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
          zIndex: 0,
        }}
      >
        {m.headlineCiteWord}
      </motion.span>
      <motion.div
        style={{
          display: "grid",
          gridTemplateColumns: "55fr 45fr",
          gap: 80,
          alignItems: "start",
          scale,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* LEFT — headline */}
        <div>
          <motion.div {...anim(0)} style={{ display: "flex", gap: 16, marginBottom: 40 }}>
            <span style={labelStyle}>05</span>
            <span style={labelStyle}>{m.sectionLabel}</span>
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
            {m.headlinePart1}
            <br />
            {m.headlinePart2}<span style={{ color: "var(--olive)" }}>{m.headlineCiteWord}</span>{m.headlinePart3}
            <br />
            {m.headlinePart4}
          </motion.h2>
        </div>

        {/* RIGHT — contrasts */}
        <div style={{ paddingTop: 80 }}>
          {m.contrasts.map((row, i) => (
            <motion.div
              key={row.left}
              {...anim(0.08 + i * 0.06)}
              className={`mfst-pair${i === m.contrasts.length - 1 ? " mfst-pair--last" : ""}`}
            >
              <span className="mfst-left">{row.left}</span>
              <span className="mfst-arrow">→</span>
              <span className="mfst-right">{row.right}</span>
            </motion.div>
          ))}

          <motion.div {...anim(0.34)} style={{ textAlign: "right", marginTop: 24 }}>
            <Link
              href={diagHref}
              style={{
                fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--signal)",
                letterSpacing: "0.06em",
              }}
            >
              {m.readMore}
            </Link>
          </motion.div>
        </div>
      </motion.div>
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
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: var(--text-faint);
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
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          color: var(--text-faint);
          transition: color 350ms ease 80ms;
        }
        .mfst-pair:hover .mfst-arrow {
          color: var(--olive);
        }

        /* ── Right — new metric (confirmed) ─────────── */
        .mfst-right {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
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
  fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};
