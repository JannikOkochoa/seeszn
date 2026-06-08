"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const POINTS = [
  { year: "2000", label: "Rankings" },
  { year: "2010", label: "Traffic" },
  { year: "2020", label: "Attention" },
  { year: "2024+", label: "AI Answers" },
];

export default function TheShift() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  const anim = {
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
  };

  return (
    <section
      ref={ref}
      style={{
        background: "var(--warm-black)",
        padding: "64px 64px 80px",
      }}
    >
      {/* Headline */}
      <motion.div
        {...anim}
        transition={{ duration: 0.5, ease: EASE, delay: 0 }}
      >
        <p
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 48px)",
            color: "var(--paper)",
            letterSpacing: "0.02em",
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          SEARCH WAS ONCE A PAGE.
          <br />
          NOW IT IS AN ANSWER.
          <br />
          ANSWERS NEED SOURCES.
        </p>
      </motion.div>

      {/* Timeline */}
      <motion.div
        {...anim}
        transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
        style={{
          marginTop: 64,
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 800,
        }}
      >
        {/* Horizontal connecting line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "4px",
            right: "4px",
            height: 1,
            background: "var(--dust)",
            transform: "translateY(-50%)",
            zIndex: 0,
          }}
        />

        {POINTS.map((pt, i) => (
          <div
            key={pt.year}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Label above */}
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: i === 3 ? "var(--olive)" : "var(--dust)",
              }}
            >
              {pt.label}
            </span>

            {/* Dot */}
            <span
              className="olive-dot"
              style={{
                width: 8,
                height: 8,
                background: "var(--olive)",
                display: "block",
                flexShrink: 0,
              }}
            />

            {/* Year below */}
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 13,
                color: "var(--paper)",
              }}
            >
              {pt.year}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Bottom link */}
      <motion.div
        {...anim}
        transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
        style={{ marginTop: 48, textAlign: "right", maxWidth: 800 }}
      >
        <a
          href="#contact"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
            color: "var(--olive)",
            letterSpacing: "0.08em",
          }}
        >
          THE SHIFT →
        </a>
      </motion.div>
    </section>
  );
}
