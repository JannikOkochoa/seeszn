"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  };
}

// Deterministic particle field — seeded RNG so server/client renders match.
// 24 particles distributed within the word bounds with individual inward drift vectors.
const PARTICLES: Array<{
  left: string; top: string; dx: string; dy: string;
  delay: string; size: string; pop: string;
}> = (() => {
  let s = 73;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  return Array.from({ length: 24 }, () => {
    const px = r() * 90 + 5;          // left: 5–95% — stays within word bounds
    const py = r() * 76 + 10;         // top: 10–86% — avoids extreme edges
    // Drift vector pointing inward toward word center (50%, 50%).
    // Multiplied by 0.17/0.11 to keep movement subtle (≤ ~8px at desktop).
    const dx = ((50 - px) * 0.17).toFixed(1);
    const dy = ((50 - py) * 0.11).toFixed(1);
    return {
      left:  `${px.toFixed(1)}%`,
      top:   `${py.toFixed(1)}%`,
      dx:    `${dx}px`,
      dy:    `${dy}px`,
      delay: `${Math.round(260 + r() * 460)}ms`,
      size:  `${1 + Math.round(r())}px`,
      pop:   `${(0.52 + r() * 0.43).toFixed(2)}`,
    };
  });
})();

export default function Hero() {
  const t = useTranslations();
  const h = t.hero;
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Ghost word — the italic headline word, stripped to its bare form
  const ghostWord = h.italic.replace(/[^\p{L}]/gu, "").toUpperCase();

  // ── Scroll parallax — image sinks and swells, ghost counter-drifts ──
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "22%"]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.16]);
  const yGhost = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-55%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-14%"]);
  const heroFade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  // ── Mouse parallax — the carved form leans toward the cursor ──
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 40, damping: 18 });
  const smy = useSpring(my, { stiffness: 40, damping: 18 });

  const onMouseMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const { innerWidth, innerHeight } = window;
    mx.set((e.clientX / innerWidth - 0.5) * -18);
    my.set((e.clientY / innerHeight - 0.5) * -12);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "55% 45%",
        borderBottom: "1px solid var(--warm-black)",
        paddingTop: 106,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Giant ghost word — counter-scrolls behind everything */}
      <motion.span className="hero-ghost" style={{ y: yGhost }} aria-hidden="true">
        {ghostWord}
      </motion.span>
      {/* LEFT COLUMN */}
      <motion.div
        style={{
          padding: "var(--hero-y) clamp(40px, 4vw, 56px) var(--hero-y) var(--gutter)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          y: yContent,
          opacity: heroFade,
          zIndex: 1,
        }}
      >
        {/* Section label */}
        <motion.span {...fadeUp(0)} style={labelStyle}>
          01
        </motion.span>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.1)} className="hero-headline">
          <span className="hero-hl-roman">{h.line1}</span>
          <span className="hero-hl-roman">
            {h.line2}{" "}
            {/*
              .answer-wrap isolates the word:
              overflow:hidden clips the scan-line to the word bounds
              and keeps particles from visually bleeding into line2
            */}
            <span className="answer-wrap">
              <em className="hero-hl-italic">{h.italic}</em>
              {PARTICLES.map((p, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="sig-node"
                  style={{
                    left:    p.left,
                    top:     p.top,
                    width:   p.size,
                    height:  p.size,
                    "--dx":    p.dx,
                    "--dy":    p.dy,
                    "--delay": p.delay,
                    "--pop":   p.pop,
                  } as React.CSSProperties}
                />
              ))}
            </span>
          </span>
        </motion.h1>

        {/* Olive rule */}
        <motion.div
          {...fadeUp(0.2)}
          style={{
            width: 48,
            height: 2,
            background: "var(--olive)",
            margin: "14px 0",
          }}
        />

        {/* Sub */}
        <motion.p {...fadeUp(0.3)} style={subStyle}>
          {h.sub.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </motion.p>

        {/* CTA */}
        <motion.div {...fadeUp(0.4)} style={{ marginTop: 28 }}>
          <a href="#contact" className="hero-cta">
            {h.cta}{" "}
            <span style={{ color: "var(--olive)" }}>→</span>
          </a>
        </motion.div>

        {/* Vertical location text — very subtle */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateX(50%) rotate(90deg)",
            transformOrigin: "center center",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--dust)",
            opacity: 0.28,
            whiteSpace: "nowrap",
          }}
        >
          PARIS — BREMEN — BANGKOK
        </span>
      </motion.div>

      {/* RIGHT COLUMN — parallax image */}
      <div className="hero-img-col" style={{ position: "relative", overflow: "hidden" }}>
        <motion.div
          style={{
            position: "absolute",
            inset: "-8% -4%",
            y: yImage,
            scale: scaleImage,
            willChange: "transform",
          }}
        >
          <motion.div style={{ position: "absolute", inset: 0, x: smx, y: smy }}>
            <Image
              src="/seeszn-home-main-picture.png"
              alt="Carved concrete form"
              fill
              priority
              style={{ objectFit: "cover", objectPosition: "center 20%" }}
              sizes="(max-width: 768px) 0px, 45vw"
            />
          </motion.div>
        </motion.div>

        {/* Scan sweep over the carved form */}
        <span className="hero-img-sweep" aria-hidden="true" />

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

      {/* Scroll indicator — falling signal line */}
      <motion.div
        className="hero-scroll-hint"
        style={{ opacity: heroFade }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        aria-hidden="true"
      >
        <span className="hero-scroll-line" />
      </motion.div>

      <style>{`
        /* ── Ghost word — counter-parallax backdrop ──── */
        .hero-ghost {
          position: absolute;
          left: -2vw;
          bottom: -5vw;
          z-index: 0;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(140px, 23vw, 380px);
          letter-spacing: -0.05em;
          line-height: 0.8;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 16%, transparent);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          will-change: transform;
        }

        /* ── Image scan sweep ────────────────────────── */
        .hero-img-sweep {
          position: absolute;
          top: 0; bottom: 0;
          width: 1px;
          background: var(--olive);
          z-index: 2;
          opacity: 0;
          animation: hero-sweep 8s cubic-bezier(.16,1,.3,1) 2.4s infinite;
          pointer-events: none;
        }
        @keyframes hero-sweep {
          0%   { left: 0%; opacity: 0; }
          4%   { opacity: 0.5; }
          34%  { opacity: 0.12; }
          42%  { left: 100%; opacity: 0; }
          100% { left: 100%; opacity: 0; }
        }

        /* ── Scroll indicator ────────────────────────── */
        .hero-scroll-hint {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          height: 56px;
          width: 1px;
          overflow: hidden;
          z-index: 2;
        }
        .hero-scroll-line {
          position: absolute;
          left: 0; top: -100%;
          width: 1px;
          height: 100%;
          background: var(--warm-black);
          animation: hero-drop 2.2s cubic-bezier(.16,1,.3,1) infinite;
        }
        @keyframes hero-drop {
          0%   { top: -100%; }
          55%  { top: 0%; }
          100% { top: 100%; }
        }

        /* ── Headline ────────────────────────────────── */
        .hero-headline {
          color: var(--warm-black);
          margin: 0;
        }

        .hero-hl-roman {
          display: block;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(48px, 6.5vw, 88px);
          letter-spacing: -0.02em;
          line-height: 0.97;
          font-style: normal;
        }

        /* ── answer. wrapper — contains particles + scan line ─ */
        .answer-wrap {
          position: relative;
          display: inline-block;
          overflow: hidden;
          /* overflow:hidden shifts the inline-block baseline to its bottom
             edge, dropping "nicht." below the roman words — lift it back
             into optical alignment. */
          top: -0.07em;
        }

        /*
          The accent word — upright editorial serif (Source Serif 4),
          the calm counterpoint to the condensed roman lines.
          The blur-resolve animation stays: it reads as the answer
          "resolving into focus" — a deliberate design element, not decoration.
        */
        .hero-hl-italic {
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-style: normal;
          font-size: 0.92em;
          letter-spacing: -0.01em;
          display: inline-block;
          animation: answer-resolve 1.28s cubic-bezier(.16,1,.3,1) 0.6s both;
        }

        /*
          scaleX starts at 1.042 (letterforms spread apart) and settles to 1.
          Using transform avoids layout shift — letter-spacing animations cause CLS.
          The slight horizontal compression into lock position gives the
          "letterforms snapping into place" feeling without changing layout.
        */
        @keyframes answer-resolve {
          0%   { filter: blur(6px);   opacity: 0.16; transform: scaleX(1.042); }
          42%  { filter: blur(2.5px); opacity: 0.55; transform: scaleX(1.018); }
          74%  { filter: blur(0.4px); opacity: 0.96; transform: scaleX(0.997); }
          88%  { filter: blur(0);     opacity: 1;    transform: scaleX(0.997); }
          100% { filter: blur(0);     opacity: 1;    transform: scaleX(1);     }
        }

        /* ── Scan line — single pass after word resolves ─── */
        /*
          Slides left→right across the word once.
          Starts at 0% (left edge) and exits at 100%+.
          overflow:hidden on .answer-wrap keeps it within the word.
        */
        .answer-wrap::after {
          content: '';
          position: absolute;
          top: 8%;
          bottom: 8%;
          left: 0;
          width: 1px;
          background: var(--olive);
          opacity: 0;
          animation: answer-scan 620ms cubic-bezier(.16,1,.3,1) 1.52s both;
        }

        @keyframes answer-scan {
          0%   { left: -1px;  opacity: 0;    }
          5%   { opacity: 0.42; }
          90%  { opacity: 0.22; }
          100% { left: 102%;   opacity: 0;   }
        }

        /* ── Particles — magnetic collapse into letterforms ─ */
        /*
          Each particle holds its drift vector in --dx/--dy CSS custom props.
          Keyframes:
            0%   → invisible at rest position
            10%  → appears at peak opacity (var(--pop))
            82%  → drifted 1× toward center, dimming
           100%  → drifted 1.7× toward center, collapsed to nothing
        */
        .sig-node {
          position: absolute;
          background: var(--olive);
          display: block;
          pointer-events: none;
          opacity: 0;
          animation: particle-in 1.25s cubic-bezier(.16,1,.3,1) var(--delay, 300ms) both;
        }

        @keyframes particle-in {
          0%   {
            opacity: 0;
            transform: translate(0, 0) scale(1);
          }
          10%  {
            opacity: var(--pop, 0.7);
            transform: translate(0, 0) scale(1);
          }
          82%  {
            opacity: 0.28;
            transform: translate(var(--dx), var(--dy)) scale(0.6);
          }
          100% {
            opacity: 0;
            transform:
              translate(
                calc(var(--dx) * 1.7),
                calc(var(--dy) * 1.7)
              )
              scale(0);
          }
        }

        /* ── Accessibility + reduced motion ──────────── */
        @media (prefers-reduced-motion: reduce) {
          .hero-hl-italic      { animation: none; }
          .sig-node            { display: none !important; }
          .answer-wrap::after  { display: none !important; }
          .hero-img-sweep      { animation: none; }
          .hero-scroll-line    { animation: none; }
        }

        /* ── Mobile — strip heavy effects ────────────── */
        @media (max-width: 768px) {
          .sig-node           { display: none; }
          .answer-wrap::after { display: none; }
        }

        /* ── CTA ─────────────────────────────────────── */
        .hero-cta {
          display: inline-block;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          border: 1px solid var(--button-border);
          padding: 13px 26px;
          min-height: 44px;
          color: var(--text-primary);
          background: transparent;
          transition: background 0.25s, border-color 0.25s, color 0.25s;
        }
        .hero-cta:hover {
          background: var(--warm-black);
          border-color: var(--warm-black);
          color: var(--paper);
        }

        /* ── Mobile layout ───────────────────────────── */
        @media (max-width: 768px) {
          section { grid-template-columns: 1fr !important; }
          .hero-img-col { display: none; }
          .hero-scroll-hint { display: none; }
          .hero-ghost { font-size: 36vw; bottom: -8vw; }
        }
      `}</style>
    </section>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: 20,
};

const subStyle: React.CSSProperties = {
  fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1.65,
  letterSpacing: "0.01em",
  color: "var(--text-body)",
  maxWidth: 430,
};

