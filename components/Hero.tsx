"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  };
}

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "55% 45%",
        borderBottom: "1px solid var(--warm-black)",
        paddingTop: 64, // nav height
      }}
    >
      {/* LEFT COLUMN */}
      <div
        style={{
          padding: "80px 64px 80px 64px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          position: "relative",
        }}
      >
        {/* Section label */}
        <motion.span {...fadeUp(0)} style={labelStyle}>
          01
        </motion.span>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.1)} style={headlineStyle}>
          You are not
          <br />
          in the{" "}
          <em
            style={{
              fontStyle: "italic",
              fontFamily: "inherit",
              fontSize: "inherit",
              color: "inherit",
            }}
          >
            answer.
          </em>
        </motion.h1>

        {/* Olive rule */}
        <motion.div
          {...fadeUp(0.2)}
          style={{
            width: 48,
            height: 2,
            background: "var(--olive)",
            margin: "24px 0",
          }}
        />

        {/* Sub */}
        <motion.p {...fadeUp(0.3)} style={subStyle}>
          VISIBILITY SYSTEMS FOR BRANDS
          <br />
          ENTERING MACHINE MEMORY.
        </motion.p>

        {/* CTA */}
        <motion.div {...fadeUp(0.4)} style={{ marginTop: 40 }}>
          <a href="#contact" className="hero-cta">
            START A DIAGNOSIS{" "}
            <span style={{ color: "var(--olive)" }}>→</span>
          </a>
        </motion.div>

        {/* Vertical location text */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateX(50%) rotate(90deg)",
            transformOrigin: "center center",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--dust)",
            whiteSpace: "nowrap",
          }}
        >
          PARIS — BREMEN — BANGKOK
        </span>
      </div>

      {/* RIGHT COLUMN — image */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Image
          src="/seeszn-home-main-picture.png"
          alt="Carved concrete form"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        {/* Caption */}
        <span
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--dust)",
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          CARVED FORM
        </span>
      </div>

      <style>{`
        .hero-cta {
          display: inline-block;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1.5px solid var(--warm-black);
          padding: 14px 28px;
          color: var(--warm-black);
          background: transparent;
          transition: background 0.2s, color 0.2s;
        }
        .hero-cta:hover {
          background: var(--warm-black);
          color: var(--paper);
        }
        @media (max-width: 768px) {
          section { grid-template-columns: 1fr !important; }
          section > div:last-child { display: none; }
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
  marginBottom: 32,
};

const headlineStyle: React.CSSProperties = {
  fontFamily: "var(--font-editorial), serif",
  fontWeight: 400,
  fontSize: "clamp(40px, 5.5vw, 72px)",
  lineHeight: 1.05,
  color: "var(--warm-black)",
};

const subStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: 13,
  lineHeight: 1.7,
  color: "var(--dust)",
  maxWidth: 360,
};
