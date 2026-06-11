"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// Site-wide HUD — a spring-smoothed olive signal line that tracks
// reading progress across the top of the viewport.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "var(--olive)",
        transformOrigin: "left",
        scaleX,
        zIndex: 110,
        pointerEvents: "none",
      }}
    />
  );
}
