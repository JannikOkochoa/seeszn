"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/context";

// Depth field geometry — position (vw/vh from top-left of the stage) and
// depth factor. Higher depth = closer to the viewer = moves more.
const FRAGMENTS = [
  { x: 58, y: 18, d: 0.9  },
  { x: 76, y: 11, d: 0.5  },
  { x: 76, y: 34, d: 1.1  },
  { x: 64, y: 47, d: 0.45 },
  { x: 78, y: 58, d: 0.8  },
  { x: 70, y: 72, d: 1.2  },
  { x: 44, y: 9,  d: 0.6  },
  { x: 82, y: 86, d: 0.4  },
  { x: 56, y: 88, d: 0.7  },
];

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·";

// Decode effect — characters resolve left to right out of static.
// When animations are enabled we start the state empty (server renders
// the full text as fallback), then an interval overwrites character by
// character. No synchronous setState inside the effect body.
function useDecode(text: string, enabled: boolean) {
  const [out, setOut] = useState(() => (enabled ? "" : text));
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const fixed = Math.floor(frame * 0.8);
      if (fixed >= text.length) {
        setOut(text);
        clearInterval(id);
        return;
      }
      setOut(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " " || i < fixed) return ch;
            return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
          })
          .join("")
      );
    }, 38);
    return () => clearInterval(id);
  }, [text, enabled]);
  return out;
}

export default function IntelHero() {
  const t = useTranslations();
  const h = t.insightsPage.hero;
  const c = t.insightsPage.cinema;
  const reduced = useReducedMotion();
  const still = reduced === true;

  const sectionRef = useRef<HTMLElement>(null);
  const decoded = useDecode(c.decode, !still);

  // Mouse parallax — normalized [-1, 1], heavy spring so the field feels
  // like it has mass rather than tracking the cursor
  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const mx = useSpring(mxRaw, { stiffness: 40, damping: 18 });
  const my = useSpring(myRaw, { stiffness: 40, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    if (still) return;
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    mxRaw.set(((e.clientX - r.left) / r.width) * 2 - 1);
    myRaw.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  // Scroll exit parallax — layers leave at different rates
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const yHead = useTransform(scrollYProgress, [0, 1], ["0%", still ? "0%" : "-22%"]);
  const yGhost = useTransform(scrollYProgress, [0, 1], ["0%", still ? "0%" : "-70%"]);
  const yField = useTransform(scrollYProgress, [0, 1], ["0%", still ? "0%" : "30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const ghostX = useTransform(mx, (v) => (still ? 0 : v * -24));

  return (
    <section
      ref={sectionRef}
      className="ih-section"
      onMouseMove={onMove}
      aria-label={h.room}
    >
      {/* Grid + vignette */}
      <div className="ih-grid" aria-hidden="true" />

      {/* Ghost word — deepest layer, counter-parallax */}
      <motion.span
        className="ih-ghost"
        style={{ y: yGhost, x: ghostX }}
        aria-hidden="true"
      >
        {c.ghost}
      </motion.span>

      {/* Depth field — floating retrieval fragments */}
      <motion.div className="ih-field" style={{ y: yField, opacity: fade }} aria-hidden="true">
        {c.fragments.map((text, i) => {
          const f = FRAGMENTS[i % FRAGMENTS.length];
          return (
            <Fragment
              key={text}
              text={text}
              x={f.x}
              y={f.y}
              depth={f.d}
              index={i}
              mx={mx}
              my={my}
              still={still}
            />
          );
        })}
      </motion.div>

      {/* Scanline — a single beam falls through the room */}
      {!still && <div className="ih-scanline" aria-hidden="true" />}

      {/* Statement */}
      <motion.div className="ih-stage" style={{ y: yHead, opacity: fade }}>
        <div className="ih-top">
          <span className="ih-chip">01</span>
          <span className="ih-chip">{h.room}</span>
          <span className="ih-chip ih-chip--right">{h.accession}</span>
        </div>

        <p className="ih-decode">
          <span className="ih-decode-pip" />
          {decoded}
        </p>

        <h1 className="ih-headline">
          {h.roman.map((line, i) => (
            <span key={line} className="ih-line-mask">
              <span className="ih-line" style={{ animationDelay: `${0.25 + i * 0.14}s` }}>
                {line}
              </span>
            </span>
          ))}
          <span className="ih-line-mask">
            <em className="ih-line ih-line--italic" style={{ animationDelay: `${0.25 + h.roman.length * 0.14}s` }}>
              {h.italic}
            </em>
          </span>
        </h1>

        <div className="ih-sub-row">
          <p className="ih-sub">
            {h.sub.map((line) => (
              <span key={line}>{line}<br /></span>
            ))}
          </p>
          {h.note && (
            <p className="ih-note">
              {h.note.map((line) => (
                <span key={line}>{line}<br /></span>
              ))}
            </p>
          )}
        </div>

        {h.cta && (
          <Link href={h.cta.href} className="ih-cta">
            <span className="ih-cta-pip" aria-hidden="true" />
            {h.cta.label}
          </Link>
        )}
      </motion.div>

      {/* Status bar */}
      <motion.div className="ih-status" style={{ opacity: fade }} aria-hidden="true">
        <span>{c.statusLeft}</span>
        <span className="ih-status-cue">
          {c.statusRight}
          <span className="ih-caret" />
        </span>
      </motion.div>

      <style>{`
        .ih-section {
          position: relative;
          min-height: 100svh;
          background: var(--paper);
          border-bottom: 1px solid var(--warm-black);
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .ih-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--line-soft) 1px, transparent 1px),
            linear-gradient(90deg, var(--line-soft) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(ellipse 90% 80% at 50% 45%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 45%, black 30%, transparent 100%);
        }

        .ih-ghost {
          position: absolute;
          top: 50%;
          left: 50%;
          translate: -50% -50%;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(160px, 26vw, 420px);
          letter-spacing: 0.02em;
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 11%, transparent);
          user-select: none;
          pointer-events: none;
          white-space: nowrap;
        }

        /* ── Depth field ───────────────────────────────── */
        .ih-field { position: absolute; inset: 0; pointer-events: none; }
        .ih-frag {
          position: absolute;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--text-muted);
          white-space: nowrap;
          padding: 5px 9px;
          border: 1px solid var(--line);
          background: color-mix(in srgb, var(--paper) 78%, transparent);
          opacity: 0;
          animation: ih-frag-in 900ms cubic-bezier(.16,1,.3,1) both;
        }
        .ih-frag--near {
          font-size: 10px;
          color: var(--text-secondary);
          border-color: var(--line-strong);
        }
        .ih-frag-dot {
          display: inline-block;
          width: 4px;
          height: 4px;
          background: var(--olive);
          margin-right: 8px;
          vertical-align: 1px;
        }
        @keyframes ih-frag-in { to { opacity: 1; } }
        .ih-frag-drift {
          animation: ih-drift 9s ease-in-out infinite alternate;
        }
        @keyframes ih-drift {
          from { transform: translateY(-6px); }
          to   { transform: translateY(6px); }
        }

        .ih-scanline {
          position: absolute;
          left: 0;
          right: 0;
          top: -2px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--olive) 30%, var(--olive) 70%, transparent);
          opacity: 0.5;
          animation: ih-scan 7s cubic-bezier(.45,0,.55,1) 2.4s infinite;
          pointer-events: none;
        }
        @keyframes ih-scan {
          0%, 64% { top: -2px; opacity: 0; }
          66% { opacity: 0.5; }
          82% { top: 100%; opacity: 0.5; }
          83%, 100% { top: 100%; opacity: 0; }
        }

        /* ── Statement ─────────────────────────────────── */
        .ih-stage {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 140px 64px 110px;
        }
        .ih-top {
          display: flex;
          gap: 16px;
          margin-bottom: 34px;
        }
        .ih-chip {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .ih-chip--right { margin-left: auto; color: var(--dust); }

        .ih-decode {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.26em;
          color: var(--olive);
          margin: 0 0 22px;
          min-height: 14px;
          filter: saturate(0.85) brightness(0.82);
        }
        [data-theme="dark"] .ih-decode { filter: none; }
        .ih-decode-pip {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: var(--olive);
          margin-right: 12px;
          animation: ih-blink 1.2s steps(1) infinite;
        }
        @keyframes ih-blink { 50% { opacity: 0.25; } }

        .ih-headline {
          margin: 0 0 30px;
          max-width: 1280px;
        }
        .ih-line-mask {
          display: block;
          overflow: hidden;
          padding-bottom: 0.06em;
        }
        .ih-line {
          display: block;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(44px, 7.6vw, 132px);
          line-height: 0.92;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: var(--warm-black);
          transform: translateY(110%);
          animation: ih-rise 1s cubic-bezier(.16,1,.3,1) both;
        }
        .ih-line--italic {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-style: normal;
          text-transform: none;
          font-size: clamp(40px, 6.6vw, 100px);
          line-height: 1.04;
          letter-spacing: 0;
          color: var(--warm-black);
        }
        @keyframes ih-rise { to { transform: translateY(0); } }

        .ih-sub-row {
          display: flex;
          gap: 64px;
          flex-wrap: wrap;
          margin-bottom: 36px;
        }
        .ih-sub, .ih-note {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          line-height: 2;
          margin: 0;
          opacity: 0;
          animation: ih-frag-in 800ms ease 0.9s both;
        }
        .ih-sub { color: var(--text-secondary); }
        .ih-note { color: var(--dust); animation-delay: 1.05s; }

        .ih-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.22em;
          color: var(--warm-black);
          border: 1px solid var(--border-btn);
          padding: 15px 26px;
          transition: border-color 0.3s, background 0.3s;
          opacity: 0;
          animation: ih-frag-in 800ms ease 1.2s both;
        }
        .ih-cta:hover {
          border-color: var(--border-btn-hovered);
          background: var(--button-hover-bg);
        }
        .ih-cta-pip { width: 6px; height: 6px; background: var(--olive); }

        .ih-status {
          position: absolute;
          left: 64px;
          right: 64px;
          bottom: 26px;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding-top: 14px;
          border-top: 1px solid var(--line);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: var(--dust);
        }
        .ih-status-cue { display: inline-flex; align-items: center; gap: 10px; }
        .ih-caret {
          width: 5px;
          height: 10px;
          background: var(--olive);
          animation: ih-blink 1.3s steps(1) infinite;
        }

        /* ── Reduced motion ────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .ih-line { animation: none; transform: none; }
          .ih-frag, .ih-sub, .ih-note, .ih-cta { animation: none; opacity: 1; }
          .ih-frag-drift { animation: none; }
          .ih-scanline { display: none; }
          .ih-decode-pip, .ih-caret { animation: none; }
        }

        /* ── Mobile ────────────────────────────────────── */
        @media (max-width: 900px) {
          .ih-stage { padding: 120px 24px 96px; }
          .ih-status { left: 24px; right: 24px; }
          .ih-frag { display: none; }
          .ih-line { font-size: clamp(38px, 11.5vw, 56px); }
          .ih-line--italic { font-size: clamp(30px, 8.6vw, 44px); }
          .ih-sub-row { gap: 24px; }
          .ih-ghost { font-size: clamp(120px, 38vw, 240px); }
        }
      `}</style>
    </section>
  );
}

// One floating fragment — its own mouse-parallax transform scaled by depth
function Fragment({
  text,
  x,
  y,
  depth,
  index,
  mx,
  my,
  still,
}: {
  text: string;
  x: number;
  y: number;
  depth: number;
  index: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  still: boolean;
}) {
  const px = useTransform(mx, (v) => (still ? 0 : v * depth * -34));
  const py = useTransform(my, (v) => (still ? 0 : v * depth * -22));
  const near = depth >= 0.9;
  return (
    <motion.span
      className={`ih-frag${near ? " ih-frag--near" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        x: px,
        y: py,
        animationDelay: `${1.1 + index * 0.12}s`,
      }}
    >
      <span className="ih-frag-drift" style={{ animationDelay: `${index * -1.3}s`, display: "inline-block" }}>
        {near && <span className="ih-frag-dot" aria-hidden="true" />}
        {text}
      </span>
    </motion.span>
  );
}
