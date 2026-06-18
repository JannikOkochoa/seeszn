"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/context";

// The Intelligence Room's own accent — cold radar phosphor,
// distinct from the olive signal used everywhere else.
const INS = "#66aabf";

// Contact geometry — angle (deg clockwise from 12 o'clock) and radius
// in SVG units (viewBox 600, center 300). One contact per observed system.
const CONTACTS = [
  { a: 25,  x: 395.1, y: 96.1  },
  { a: 85,  x: 429.5, y: 288.7 },
  { a: 140, x: 415.7, y: 437.9 },
  { a: 205, x: 196.5, y: 522.0 },
  { a: 260, x: 201.5, y: 317.4 },
  { a: 320, x: 174.7, y: 150.6 },
];

// Total sweep rotation across the pinned scene — a bit over one revolution
const SWEEP_TOTAL = 400;

export default function Observatory() {
  const t = useTranslations();
  const ob = t.insightsPage.observatory;
  const reduced = useReducedMotion();

  const outerRef = useRef<HTMLElement>(null);
  const [contacts, setContacts] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  // The radar beam — scroll rotates it; a spring keeps it heavy and analog
  const sweepRaw = useTransform(scrollYProgress, [0, 1], [0, SWEEP_TOTAL]);
  const sweep = useSpring(sweepRaw, { stiffness: 60, damping: 20 });

  useMotionValueEvent(sweepRaw, "change", (deg) => {
    const n = CONTACTS.filter((c) => deg >= c.a + 14).length;
    setContacts((prev) => (prev === n ? prev : n));
  });

  const allOn = reduced === true;
  const lit = allOn ? CONTACTS.length : contacts;

  return (
    <section
      ref={outerRef}
      className={`ob-outer${allOn ? " ob-outer--static" : ""}`}
      style={{ "--ins": INS } as React.CSSProperties}
      aria-label={ob.sectionLabel}
    >
      <div className="ob-sticky">
        {/* LEFT — statement + readout */}
        <div className="ob-left">
          <div className="ob-chips">
            <span className="ob-chip">03</span>
            <span className="ob-chip">{ob.sectionLabel}</span>
          </div>

          <h2 className="ob-headline">
            {ob.headline} <em>{ob.headlineItalic}</em>
          </h2>
          <p className="ob-copy">{ob.copy}</p>

          {/* Contact register — rows light as the beam finds them */}
          <ul className="ob-register">
            {ob.systems.map((s, i) => {
              const on = i < lit;
              return (
                <li key={s.name} className={`ob-row${on ? " ob-row--on" : ""}`}>
                  <span className="ob-row-pip" aria-hidden="true" />
                  <span className="ob-row-name">{s.name}</span>
                  <span className="ob-row-status">{s.status}</span>
                </li>
              );
            })}
          </ul>

          <div className="ob-meter" aria-hidden="true">
            <span className="ob-meter-key">{ob.contactsKey}</span>
            <span className="ob-meter-val">
              {String(lit).padStart(2, "0")} / {String(CONTACTS.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* RIGHT — the instrument */}
        <div className="ob-right">
          <div className="ob-radar" role="img" aria-label={`${ob.sectionLabel} — ${ob.systems.map((s) => s.name).join(", ")}`}>
            {/* Rotating beam */}
            <motion.div
              className="ob-beam"
              style={{ rotate: allOn ? 0 : sweep }}
              aria-hidden="true"
            />

            {/* Dial */}
            <svg viewBox="0 0 600 600" className="ob-svg" aria-hidden="true">
              {/* Rings */}
              {[70, 130, 190, 250].map((r) => (
                <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.16" />
              ))}
              <circle cx="300" cy="300" r="288" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />

              {/* Cross hairs */}
              <line x1="300" y1="12" x2="300" y2="588" stroke="currentColor" strokeWidth="0.6" opacity="0.12" />
              <line x1="12" y1="300" x2="588" y2="300" stroke="currentColor" strokeWidth="0.6" opacity="0.12" />

              {/* Degree ticks every 30° */}
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                // rounded so server- and client-rendered attributes stringify identically
                const r2 = (v: number) => Math.round(v * 100) / 100;
                const x1 = r2(300 + 280 * Math.sin(a));
                const y1 = r2(300 - 280 * Math.cos(a));
                const x2 = r2(300 + 288 * Math.sin(a));
                const y2 = r2(300 - 288 * Math.cos(a));
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.5" />
                );
              })}

              {/* Contacts */}
              {CONTACTS.map((c, i) => {
                const on = i < lit;
                const label = ob.systems[i]?.name ?? "";
                const left = c.x > 300;
                return (
                  <g key={c.a} className={`ob-blip${on ? " ob-blip--on" : ""}`}>
                    <circle cx={c.x} cy={c.y} r="20" fill="none" stroke="var(--ins)" strokeWidth="1" className="ob-blip-ring" />
                    <circle cx={c.x} cy={c.y} r="4" className="ob-blip-dot" />
                    <text
                      x={left ? c.x - 14 : c.x + 14}
                      y={c.y - 12}
                      textAnchor={left ? "end" : "start"}
                      className="ob-blip-label"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Center */}
              <circle cx="300" cy="300" r="3" fill="currentColor" />
            </svg>

            {/* Sweep readout */}
            <div className="ob-readout" aria-hidden="true">
              <span>{ob.sweepKey}</span>
              <ObSweepDeg sweep={sweepRaw} isStatic={allOn} />
            </div>
          </div>

          <p className="ob-footnote">{ob.footnote}</p>
        </div>
      </div>

      <style>{`
        .ob-outer {
          position: relative;
          height: 280vh;
          background: var(--paper);
          border-bottom: 1px solid var(--warm-black);
        }
        .ob-outer--static { height: auto; }
        .ob-sticky {
          position: sticky;
          top: 0;
          height: 100svh;
          display: grid;
          grid-template-columns: minmax(0, 44fr) minmax(0, 56fr);
          gap: 0 48px;
          padding: 120px 64px 48px;
          overflow: hidden;
          align-items: center;
        }
        .ob-outer--static .ob-sticky {
          position: static;
          height: auto;
          padding: 96px 64px 88px;
        }

        /* ── Left ──────────────────────────────────────── */
        .ob-chips { display: flex; gap: 16px; margin-bottom: 26px; }
        .ob-chip {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .ob-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(28px, 3.2vw, 46px);
          line-height: 1.1;
          color: var(--warm-black);
          margin: 0 0 20px;
          max-width: 480px;
        }
        .ob-headline em { font-style: normal; }
        .ob-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 400px;
          margin: 0 0 40px;
        }

        /* ── Contact register ──────────────────────────── */
        .ob-register { list-style: none; max-width: 440px; }
        .ob-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          padding: 11px 0;
          border-top: 1px solid var(--line);
          opacity: 0.34;
          transition: opacity 600ms ease;
        }
        .ob-row--on { opacity: 1; }
        .ob-row-pip {
          width: 7px;
          height: 7px;
          border: 1px solid var(--dust);
          border-radius: 50%;
          align-self: center;
          flex-shrink: 0;
          transition: background 400ms ease, border-color 400ms ease;
        }
        .ob-row--on .ob-row-pip {
          background: var(--ins);
          border-color: var(--ins);
        }
        .ob-row-name {
          font-family: var(--font-mono), monospace;
          font-size: 10.5px;
          letter-spacing: 0.1em;
          color: var(--warm-black);
          flex: 1;
        }
        .ob-row-status {
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.18em;
          color: var(--ins);
        }

        .ob-meter {
          display: flex;
          gap: 18px;
          align-items: baseline;
          margin-top: 28px;
          padding-top: 16px;
          border-top: 1px solid var(--warm-black);
          max-width: 440px;
        }
        .ob-meter-key {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: var(--dust);
        }
        .ob-meter-val {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 28px;
          letter-spacing: 0.02em;
          color: var(--warm-black);
          font-variant-numeric: tabular-nums;
        }

        /* ── Radar ─────────────────────────────────────── */
        .ob-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          min-width: 0;
        }
        .ob-radar {
          position: relative;
          width: min(58vh, 100%);
          aspect-ratio: 1;
          border-radius: 50%;
          overflow: hidden;
          color: var(--warm-black);
        }
        .ob-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .ob-beam {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            color-mix(in srgb, var(--ins) 26%, transparent) 0deg,
            color-mix(in srgb, var(--ins) 7%, transparent) 38deg,
            transparent 72deg
          );
          will-change: transform;
          z-index: 0;
        }

        /* ── Blips ─────────────────────────────────────── */
        .ob-blip { opacity: 0; transition: opacity 500ms ease; }
        .ob-blip--on { opacity: 1; }
        .ob-blip-dot { fill: var(--ins); }
        .ob-blip-ring {
          transform-origin: center;
          transform-box: fill-box;
          opacity: 0;
        }
        .ob-blip--on .ob-blip-ring {
          animation: ob-ping 1.6s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes ob-ping {
          0%   { transform: scale(0.2); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .ob-blip-label {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          fill: var(--warm-black);
        }

        .ob-readout {
          position: absolute;
          left: 50%;
          bottom: 10%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          align-items: baseline;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: var(--dust);
          z-index: 2;
        }
        .ob-footnote {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          color: var(--dust);
          text-align: center;
          margin: 0;
        }

        /* ── Reduced motion ────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .ob-blip--on .ob-blip-ring { animation: none; }
          .ob-row { transition: none; }
          .ob-beam { animation: none !important; }
        }

        /* ── Mobile — static scene, beam free-runs ─────── */
        @media (max-width: 900px) {
          .ob-outer { height: auto; }
          .ob-sticky {
            position: static;
            height: auto;
            grid-template-columns: 1fr;
            gap: 36px 0;
            padding: 64px 24px 60px;
            align-content: start;
            overflow: visible;
          }
          .ob-beam { animation: ob-rotate 14s linear infinite; }
          @keyframes ob-rotate { to { transform: rotate(360deg); } }
          .ob-headline { font-size: clamp(26px, 7vw, 36px); }
          .ob-copy { margin-bottom: 24px; }
          .ob-register { max-width: none; }
          .ob-row { padding: 9px 0; }
          .ob-radar { width: min(64vw, 340px); }
          .ob-blip-label { font-size: 13px; }
          .ob-footnote { display: none; }
          .ob-meter { margin-top: 18px; }
          .ob-meter-val { font-size: 22px; }
        }
      `}</style>
    </section>
  );
}

// Live degree readout — subscribes to the raw sweep value
function ObSweepDeg({
  sweep,
  isStatic,
}: {
  sweep: MotionValue<number>;
  isStatic: boolean;
}) {
  const [deg, setDeg] = useState(0);
  useMotionValueEvent(sweep, "change", (v) => setDeg(Math.round(v % 360)));
  return (
    <span style={{ color: "var(--warm-black)", fontVariantNumeric: "tabular-nums" }}>
      {isStatic ? "360°" : `${String(deg).padStart(3, "0")}°`}
    </span>
  );
}
