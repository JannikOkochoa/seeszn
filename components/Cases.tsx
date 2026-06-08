"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const CARDS = [
  {
    tag: "EDUCATION",
    headline: "From searchable to referenced.",
    img: "/seeszn-home-main-02.png",
  },
  {
    tag: "TRAVEL",
    headline: "From content to category memory.",
    img: "/seeszn-home-main-03.png",
  },
  {
    tag: "B2B SAAS",
    headline: "From mentions to machine trust.",
    img: "/seeszn-home-main-04.png",
  },
];

export default function Cases() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      ref={ref}
      style={{
        padding: "96px 64px",
        background: "var(--paper)",
        borderTop: "1px solid var(--warm-black)",
      }}
    >
      {/* Header row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 48,
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <span style={labelStyle}>04</span>
          <span style={labelStyle}>SELECTED PROOFS</span>
        </div>
        <a
          href="#"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--olive)",
          }}
        >
          VIEW ALL CASES →
        </a>
      </motion.div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
        }}
      >
        {CARDS.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
            style={{
              position: "relative",
              minHeight: 280,
              overflow: "hidden",
              border: "1px solid var(--warm-black)",
              marginLeft: i > 0 ? -1 : 0,
            }}
          >
            {/* Full-bleed image */}
            <Image
              src={card.img}
              alt={card.tag}
              fill
              style={{ objectFit: "cover" }}
            />

            {/* Dark overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                zIndex: 1,
              }}
            />

            {/* Content at bottom */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: 24,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 8,
                  display: "block",
                }}
              >
                {card.tag}
              </span>
              <p
                style={{
                  fontFamily: "var(--font-editorial), serif",
                  fontStyle: "italic",
                  fontSize: 22,
                  color: "#ffffff",
                  lineHeight: 1.2,
                  marginBottom: 16,
                }}
              >
                {card.headline}
              </p>
              <a
                href="#"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 11,
                  color: "var(--olive)",
                  letterSpacing: "0.08em",
                  display: "inline-block",
                }}
              >
                VIEW CASE →
              </a>
            </div>
          </motion.div>
        ))}
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
