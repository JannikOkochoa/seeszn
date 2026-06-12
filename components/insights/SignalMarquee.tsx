"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "@/lib/i18n/context";

// The signal band — two counter-running rows of giant outline type.
// Scroll velocity feeds their speed and shears the whole band, so the
// section physically reacts to how hard you scroll.

const BASE_SPEED = 55; // px/s at rest

function Row({
  words,
  direction,
  boost,
}: {
  words: readonly string[];
  direction: 1 | -1;
  boost: ReturnType<typeof useSpring>;
}) {
  const x = useMotionValue(0);
  const halfRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    const half = halfRef.current?.offsetWidth ?? 0;
    if (!half) return;
    const v = (BASE_SPEED + Math.abs(boost.get())) * direction;
    let next = x.get() + (v * delta) / 1000;
    // wrap on the duplicated half for a seamless loop
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
  });

  const seq = (key: string, ref?: React.Ref<HTMLDivElement>) => (
    <div className="sm-seq" ref={ref} key={key} aria-hidden="true">
      {words.map((w, i) => (
        <span key={i} className="sm-word">
          {w}
          <span className="sm-pip" />
        </span>
      ))}
    </div>
  );

  return (
    <motion.div className="sm-row" style={{ x }}>
      {seq("a", halfRef)}
      {seq("b")}
    </motion.div>
  );
}

export default function SignalMarquee() {
  const t = useTranslations();
  const mq = t.insightsPage.marquee;
  const reduced = useReducedMotion();

  // Scroll velocity → speed boost + shear
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const boost = useSpring(useTransform(velocity, (v) => v * 0.35), {
    stiffness: 120,
    damping: 40,
  });
  const skew = useSpring(useTransform(velocity, [-2400, 2400], [9, -9]), {
    stiffness: 150,
    damping: 30,
  });

  if (reduced) {
    return (
      <section className="sm-band sm-band--static" aria-label={mq.ariaLabel}>
        <div className="sm-seq sm-seq--static">
          {mq.words.map((w, i) => (
            <span key={i} className="sm-word">
              {w}
              <span className="sm-pip" />
            </span>
          ))}
        </div>
        <Styles />
      </section>
    );
  }

  return (
    <section className="sm-band" aria-label={mq.ariaLabel}>
      <motion.div style={{ skewY: skew }}>
        <Row words={mq.words} direction={-1} boost={boost} />
        <Row words={mq.words} direction={1} boost={boost} />
      </motion.div>
      <Styles />
    </section>
  );
}

function Styles() {
  return (
    <style>{`
      .sm-band {
        background: var(--paper);
        border-bottom: 1px solid var(--warm-black);
        padding: 56px 0;
        overflow: hidden;
      }
      .sm-row {
        display: flex;
        width: max-content;
        will-change: transform;
      }
      .sm-row + .sm-row { margin-top: -0.18em; }
      .sm-seq {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        padding-right: 0.6em;
      }
      .sm-word {
        display: inline-flex;
        align-items: center;
        gap: 0.32em;
        padding-right: 0.6em;
        font-family: var(--font-display), sans-serif;
        font-weight: 800;
        font-size: clamp(64px, 9vw, 150px);
        line-height: 1.05;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        white-space: nowrap;
        color: transparent;
        -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 55%, transparent);
        user-select: none;
      }
      /* the second row reads solid — figure against the outline ground */
      .sm-row + .sm-row .sm-word {
        color: var(--warm-black);
        -webkit-text-stroke: 0;
      }
      .sm-pip {
        width: 0.11em;
        height: 0.11em;
        background: var(--olive);
        flex-shrink: 0;
      }

      .sm-band--static { padding: 48px 24px; }
      .sm-seq--static { flex-wrap: wrap; gap: 0.2em 0; }
      .sm-seq--static .sm-word {
        font-size: clamp(34px, 6vw, 80px);
        color: var(--warm-black);
        -webkit-text-stroke: 0;
      }

      @media (max-width: 900px) {
        .sm-band { padding: 36px 0; }
      }
    `}</style>
  );
}
