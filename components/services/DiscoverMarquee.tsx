"use client";

import {
  motion,
  useScroll,
  useVelocity,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";

// Brand-language terms — kept in English across locales (house style)
const WORDS = ["VISIBILITY", "MACHINE MEMORY", "SOURCE SIGNAL", "TRUST SURFACE"];

function Row({ reverse, solid }: { reverse?: boolean; solid?: boolean }) {
  const content = (
    <>
      {WORDS.map((w) => (
        <span key={w} className={`dm-word${solid ? " dm-word--solid" : ""}`}>
          {w}
          <span className="dm-sep" aria-hidden="true">✕</span>
        </span>
      ))}
    </>
  );
  return (
    <div className={`dm-row${reverse ? " dm-row--reverse" : ""}`} aria-hidden="true">
      <div className="dm-track">
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}

export default function DiscoverMarquee() {
  const reduced = useReducedMotion();

  // Scroll velocity bends the marquee — the page reacts to how hard you push it
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const skewRaw = useTransform(velocity, [-2400, 2400], [5, -5]);
  const skew = useSpring(skewRaw, { stiffness: 120, damping: 24 });

  return (
    <motion.section
      className="dm-section"
      style={{ skewY: reduced ? 0 : skew }}
      aria-label="Visibility, machine memory, source signal, trust surface"
    >
      <Row solid />
      <Row reverse />

      <style>{`
        .dm-section {
          background: var(--paper);
          border-bottom: 1px solid var(--warm-black);
          padding: 40px 0 44px;
          overflow: hidden;
          will-change: transform;
        }
        .dm-row { overflow: hidden; white-space: nowrap; }
        .dm-track {
          display: inline-flex;
          align-items: baseline;
          animation: dm-scroll 36s linear infinite;
        }
        .dm-row--reverse .dm-track {
          animation-direction: reverse;
          animation-duration: 44s;
        }
        @keyframes dm-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }

        .dm-word {
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(44px, 6.5vw, 96px);
          letter-spacing: -0.02em;
          line-height: 1.05;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 45%, transparent);
          display: inline-flex;
          align-items: baseline;
          flex-shrink: 0;
        }
        .dm-word--solid {
          color: var(--warm-black);
          -webkit-text-stroke: 0;
        }
        .dm-sep {
          font-family: var(--font-mono), monospace;
          font-size: 0.28em;
          color: var(--olive);
          -webkit-text-stroke: 0;
          margin: 0 0.9em;
          transform: translateY(-1.2em);
        }

        @media (prefers-reduced-motion: reduce) {
          .dm-track { animation: none; }
        }
        @media (max-width: 900px) {
          .dm-section { padding: 28px 0 30px; }
        }
      `}</style>
    </motion.section>
  );
}
