"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function useDots(count: number) {
  return useMemo(() => {
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
      };
    };
    const rand = rng(42);
    return Array.from({ length: count }, () => ({
      x: rand() * 380 + 10,
      y: rand() * 380 + 10,
    }));
  }, [count]);
}

const CALLOUTS = [
  { x: 290, y: 55,  label: "PROMPT DRIFT",      olive: false, anchor: "end" },
  { x: 310, y: 165, label: "SOURCE GAPS",        olive: false, anchor: "end" },
  { x: 290, y: 265, label: "CITATION ABSENCE",   olive: true,  anchor: "end" },
  { x: 300, y: 335, label: "ENTITY WEAKNESS",    olive: false, anchor: "end" },
  { x: 195, y: 390, label: "COMPETITOR RECALL",  olive: false, anchor: "middle" },
];

export default function AbsenceIndex() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const dots = useDots(400);

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
      {/* Label */}
      <motion.div
        {...anim(0)}
        style={{ display: "flex", gap: 16, marginBottom: 64 }}
      >
        <span style={labelStyle}>03</span>
        <span style={labelStyle}>THE ABSENCE INDEX</span>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 80px",
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div>
          <motion.h2 {...anim(0.08)} style={headlineStyle}>
            Absence
            <br />
            is measurable.
          </motion.h2>

          {/* 83% */}
          <motion.div {...anim(0.16)} style={{ margin: "32px 0 16px" }}>
            <span
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(64px, 8vw, 112px)",
                color: "var(--olive)",
                lineHeight: 1,
                display: "block",
              }}
            >
              83%
            </span>
          </motion.div>

          <motion.p {...anim(0.22)} style={subStyle}>
            OF DEFINED PROMPTS IN A CATEGORY
            <br />
            CAN FORM ANSWERS WITHOUT THE
            <br />
            BRANDS THAT BELIEVE THEY OWN IT.
          </motion.p>

          <motion.div {...anim(0.28)} style={{ marginTop: 32 }}>
            <a
              href="#contact"
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                color: "var(--olive)",
                letterSpacing: "0.08em",
              }}
            >
              SEE THE DATA →
            </a>
          </motion.div>
        </div>

        {/* RIGHT — SVG scatter */}
        <motion.div {...anim(0.1)} style={{ position: "relative" }}>
          <svg
            width="420"
            height="420"
            viewBox="0 0 420 420"
            style={{ display: "block", width: "100%", maxWidth: 420 }}
          >
            {/* Background dots */}
            {dots.map((d, i) => (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={2}
                fill="var(--dust)"
                opacity={0.5}
              />
            ))}

            {/* Centre olive dot */}
            <circle
              className="olive-dot"
              cx={185}
              cy={195}
              r={5}
              fill="var(--olive)"
            />

            {/* Callout lines + labels */}
            {CALLOUTS.map((c) => (
              <g key={c.label}>
                <line
                  x1={185}
                  y1={195}
                  x2={c.x}
                  y2={c.y}
                  stroke="var(--dust)"
                  strokeWidth={0.5}
                  opacity={0.4}
                />
                <text
                  x={c.anchor === "end" ? c.x - 5 : c.x}
                  y={c.y + 4}
                  textAnchor={c.anchor as "end" | "middle" | "start"}
                  fontFamily="var(--font-mono), monospace"
                  fontSize={9}
                  letterSpacing="0.1em"
                  fill={c.olive ? "var(--olive)" : "var(--dust)"}
                >
                  {c.label}
                </text>
              </g>
            ))}

          </svg>
        </motion.div>
      </div>
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

const headlineStyle: React.CSSProperties = {
  fontFamily: "var(--font-editorial), serif",
  fontWeight: 400,
  fontSize: "clamp(36px, 5vw, 64px)",
  lineHeight: 1.1,
  color: "var(--warm-black)",
};

const subStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: 13,
  color: "var(--dust)",
  lineHeight: 1.7,
  maxWidth: 320,
};
