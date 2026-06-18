"use client";

/*
  Visibility Field — the cinematic header stage for the homepage
  "SO ARBEITEN WIR" section.

  Concept: the section opens as quiet negative space. As it enters the
  viewport, an invisible visibility system is mapped — a faint architectural
  grid, three routes that draw themselves from a single origin, and one slow
  signal marker descending the central spine like an indexing/citation pass.
  The three routes fan toward the three engagement cards below: the three
  ways SEESZN builds visibility.

  Motion is scroll-bound (useScroll/useTransform/useSpring) for the field,
  and whileInView for the text — slow, quiet, deliberate. No scrolljacking,
  no sticky. prefers-reduced-motion shows the fully composed final state.
*/

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type Variants,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Three routes fanning from a single origin (50,6) toward the cards (y≈94).
// Drawn in a 0–100 viewBox, stretched to fill with non-scaling 1px strokes.
const ROUTES = [
  "M50 6 C 50 38, 22 60, 20 94",   // left route
  "M50 6 C 50 46, 50 70, 50 94",   // central spine — the signal travels here
  "M50 6 C 50 38, 78 60, 80 94",   // right route
];

interface VisibilityFieldProps {
  index: string;
  label: string;
  headline: string;
  headlineAccent: string;
  intro: string;
}

export default function VisibilityField({
  index,
  label,
  headline,
  headlineAccent,
  intro,
}: VisibilityFieldProps) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  // Scroll progress across the stage entering and crossing the viewport.
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start 85%", "end 40%"],
  });

  // Routes draw between 0 → 0.6 of the stage's scroll, smoothed by a spring.
  const drawRaw = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const draw = useSpring(drawRaw, { stiffness: 60, damping: 22, mass: 0.7 });

  // Signal marker descends the central spine (percent of stage height).
  const dotTopRaw = useTransform(scrollYProgress, [0.05, 0.85], [8, 90]);
  const dotTop = useSpring(dotTopRaw, { stiffness: 55, damping: 24, mass: 0.7 });
  const dotOpacity = useTransform(
    scrollYProgress,
    [0, 0.06, 0.8, 1],
    [0, 1, 1, 0],
  );
  const dotTopPct = useTransform(dotTop, (v) => `${v}%`);

  // For reduced motion: routes fully drawn, no moving marker.
  const pathLength: MotionValue<number> | number = reduced ? 1 : draw;

  // ── Text reveal — staggered, masked headline ──
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18, delayChildren: 0.08 } },
  };
  const labelV: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  };
  const headlineV: Variants = {
    hidden: { opacity: 0, y: "0.32em", clipPath: "inset(0 0 100% 0)" },
    visible: {
      opacity: 1,
      y: 0,
      clipPath: "inset(0 0 -12% 0)",
      transition: { duration: 1.15, ease: EASE },
    },
  };
  const introV: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  };

  return (
    <div ref={stageRef} className="vf-stage">
      {/* ── Background architecture ─────────────────────────── */}
      <div className="vf-grid" aria-hidden="true" />

      <svg
        className="vf-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {ROUTES.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={i === 1 ? "var(--signal)" : "var(--warm-black)"}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            opacity={i === 1 ? 0.28 : 0.14}
            style={{ pathLength }}
            initial={reduced ? false : { pathLength: 0 }}
          />
        ))}
      </svg>

      {/* Origin node + descending signal marker (real circles, never distorted) */}
      <span className="vf-origin olive-dot" aria-hidden="true" />
      {!reduced && (
        <motion.span
          className="vf-signal olive-dot"
          aria-hidden="true"
          style={{ top: dotTopPct, opacity: dotOpacity }}
        />
      )}

      {/* ── Text — optically centered, generous negative space ── */}
      <motion.div
        className="vf-content"
        variants={container}
        initial={reduced ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        <motion.div className="vf-label-row" variants={labelV}>
          <span className="t-eyebrow">{index}</span>
          <span className="t-eyebrow">{label}</span>
        </motion.div>

        <h2 className="vf-headline">
          <motion.span className="vf-headline-line" variants={headlineV}>
            {headline} <em className="t-accent">{headlineAccent}</em>
          </motion.span>
        </h2>

        <motion.p className="vf-intro" variants={introV}>
          {intro}
        </motion.p>
      </motion.div>

      <style>{`
        .vf-stage {
          position: relative;
          min-height: clamp(440px, 62vh, 660px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 var(--gutter);
          overflow: hidden;
        }

        /* Faint architectural grid — vertical lines, masked to fade at edges */
        .vf-grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: linear-gradient(
            90deg,
            color-mix(in srgb, var(--warm-black) 7%, transparent) 1px,
            transparent 1px
          );
          background-size: clamp(96px, 11vw, 168px) 100%;
          -webkit-mask-image: radial-gradient(ellipse 78% 72% at 50% 42%, #000 0%, transparent 80%);
          mask-image: radial-gradient(ellipse 78% 72% at 50% 42%, #000 0%, transparent 80%);
        }

        /* Routes SVG — stretches to fill, strokes stay 1px */
        .vf-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        /* Origin marker — top of the fan */
        .vf-origin {
          position: absolute;
          top: 8%;
          left: 50%;
          width: 6px;
          height: 6px;
          margin: -3px 0 0 -3px;
          background: var(--signal);
          opacity: 0.7;
          z-index: 1;
          pointer-events: none;
        }

        /* Descending signal marker — quiet, architectural, no glow */
        .vf-signal {
          position: absolute;
          left: 50%;
          width: 7px;
          height: 7px;
          margin: -3.5px 0 0 -3.5px;
          background: var(--signal);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--signal) 16%, transparent);
          z-index: 1;
          pointer-events: none;
        }

        /* ── Content ─────────────────────────────────── */
        .vf-content {
          position: relative;
          z-index: 2;
          max-width: 760px;
        }
        .vf-label-row {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 26px;
        }
        .vf-headline {
          margin-bottom: 22px;
        }
        .vf-headline-line {
          display: inline-block;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(34px, 4.6vw, 58px);
          line-height: 1.02;
          letter-spacing: -0.01em;
          color: var(--ink-strong);
          will-change: transform, clip-path;
        }
        .vf-headline-line .t-accent {
          font-size: 0.92em;
        }
        .vf-intro {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 560px;
        }

        /* ── Mobile — simpler, calmer, no overflow ───── */
        @media (max-width: 768px) {
          .vf-stage {
            min-height: clamp(380px, 56vh, 520px);
          }
          .vf-grid {
            background-size: 64px 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vf-signal { display: none; }
        }
      `}</style>
    </div>
  );
}
