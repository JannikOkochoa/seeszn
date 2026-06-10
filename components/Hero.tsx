"use client";

import { motion } from "framer-motion";

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
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "55% 45%",
        borderBottom: "1px solid var(--warm-black)",
        paddingTop: 106,
      }}
    >
      {/* LEFT COLUMN */}
      <div
        style={{
          padding: "56px 56px 56px 64px",
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
        <motion.h1 {...fadeUp(0.1)} className="hero-headline">
          <span className="hero-hl-roman">You are not</span>
          <span className="hero-hl-roman">
            in the{" "}
            {/*
              .answer-wrap isolates the word:
              overflow:hidden clips the scan-line to the word bounds
              and keeps particles from visually bleeding into "in the"
            */}
            <span className="answer-wrap">
              <em className="hero-hl-italic">answer.</em>
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
          VISIBILITY SYSTEMS FOR BRANDS
          <br />
          ENTERING MACHINE MEMORY.
        </motion.p>

        {/* CTA */}
        <motion.div {...fadeUp(0.4)} style={{ marginTop: 28 }}>
          <a href="#contact" className="hero-cta">
            START A DIAGNOSIS{" "}
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
      </div>

      {/* RIGHT COLUMN — image */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src="/seeszn-home-main-picture.png"
          alt="Carved concrete form"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
            display: "block",
          }}
        />
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
        }

        /*
          "answer." — Bodoni 72 editorial italic.
          Animation sequence:
            0%  → blurred, faint, letterforms slightly wide (unresolved)
            42% → partial blur, opacity climbing, letter-spacing tightening
            74% → nearly sharp, brief letter-spacing overshoot (lock tension)
            88% → fully sharp and locked
           100% → settled at final letter-spacing
        */
        .hero-hl-italic {
          font-family: "Bodoni 72", "Didot", "Bodoni Moda", Georgia, serif;
          font-weight: 400;
          font-style: italic;
          font-size: 0.88em;
          letter-spacing: -0.055em;
          font-feature-settings: "swsh" 0, "calt" 0;
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
        }

        /* ── Mobile — strip heavy effects ────────────── */
        @media (max-width: 768px) {
          .sig-node           { display: none; }
          .answer-wrap::after { display: none; }
        }

        /* ── CTA ─────────────────────────────────────── */
        .hero-cta {
          display: inline-block;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1px solid var(--warm-black);
          padding: 12px 24px;
          color: var(--warm-black);
          background: transparent;
          transition: background 0.2s, color 0.2s;
        }
        .hero-cta:hover {
          background: var(--warm-black);
          color: var(--paper);
        }

        /* ── Mobile layout ───────────────────────────── */
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
  marginBottom: 20,
};

const subStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: 13,
  lineHeight: 1.7,
  color: "#5E574F",
  maxWidth: 360,
};
