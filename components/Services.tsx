"use client";

import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const ROWS = [
  {
    num: "01",
    name: "PRESENCE",
    sub: "Appear where intent begins.",
    detail:
      "We structure your brand's content, entity data, and authority signals so it surfaces at the moment a user or AI begins forming a question — before they've finished asking it.",
    img: "/seeszn-home-main-01.png",
  },
  {
    num: "02",
    name: "SOURCES",
    sub: "Become the material machines pull from.",
    detail:
      "AI systems cite sources. We engineer your brand to be among them — through structured data, authoritative content architecture, and cross-platform signal consistency.",
    img: "/seeszn-home-main-02.png",
  },
  {
    num: "03",
    name: "CITATIONS",
    sub: "Turn mentions into memory.",
    detail:
      "Being mentioned is not enough. We convert brand mentions into durable citations that AI models treat as confirmed knowledge — moving you from noise to record.",
    img: "/seeszn-home-main-03.png",
  },
  {
    num: "04",
    name: "TIMING",
    sub: "Enter before the category hardens.",
    detail:
      "The brands that dominate AI answers are the ones that entered the machine's memory early. We identify your window and execute before your competitors close it.",
    img: "/seeszn-home-main-04.png",
  },
];

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      style={{
        background: "var(--paper)",
        borderTop: "1px solid var(--warm-black)",
        paddingTop: 96,
      }}
    >
      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 48, paddingLeft: 64 }}
      >
        <span style={labelStyle}>02</span>
        <span style={labelStyle}>WHAT WE BUILD</span>
      </motion.div>

      {/* Rows */}
      {ROWS.map((row, i) => (
        <motion.div
          key={row.num}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
          style={{
            borderTop: "1px solid var(--warm-black)",
            ...(i === ROWS.length - 1
              ? { borderBottom: "1px solid var(--warm-black)" }
              : {}),
          }}
        >
          {/* Row grid */}
          <div
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              minHeight: 200,
              cursor: "pointer",
            }}
          >
            {/* Left: number, name, sub, toggle */}
            <div
              style={{
                padding: "40px 32px 40px 64px",
                borderRight: "1px solid var(--warm-black)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(40px, 5vw, 64px)",
                    color: "var(--warm-black)",
                    lineHeight: 1,
                  }}
                >
                  {row.num}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 20,
                    color: "var(--warm-black)",
                    lineHeight: 1,
                  }}
                >
                  {open === i ? "−" : "+"}
                </span>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 700,
                    fontSize: 24,
                    color: "var(--warm-black)",
                    letterSpacing: "0.01em",
                    marginBottom: 8,
                  }}
                >
                  {row.name}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 13,
                    color: "var(--dust)",
                    lineHeight: 1.6,
                  }}
                >
                  {row.sub}
                </p>
              </div>
            </div>

            {/* Right: image fills full height */}
            <div style={{ position: "relative", overflow: "hidden" }}>
              <Image
                src={row.img}
                alt={row.name}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          {/* Expandable detail */}
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{ overflow: "hidden" }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 14,
                    color: "var(--warm-black)",
                    lineHeight: 1.7,
                    maxWidth: 640,
                    padding: "0 64px 32px",
                  }}
                >
                  {row.detail}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
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
