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
              style={{
                borderTop: "1px solid var(--dust)",
                padding: "16px 0",
                display: "flex",
                alignItems: "center",
                gap: 16,
                ...(i === CONTRASTS.length - 1
                  ? { borderBottom: "1px solid var(--dust)" }
                  : {}),
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 13,
                  color: "var(--dust)",
                  textDecoration: "line-through",
                  flex: 1,
                }}
              >
                {row.left}
              </span>
              <span style={{ color: "var(--dust)", fontSize: 13, fontFamily: "var(--font-mono), monospace" }}>→</span>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--warm-black)",
                  flex: 1,
                  textAlign: "right",
                }}
              >
                {row.right}
              </span>
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
