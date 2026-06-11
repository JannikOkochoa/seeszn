"use client";

import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
  type MotionStyle,
} from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Each case file carries its own material accent — drawn from the client's
// world, not from a palette generator. Mid-tones that hold in both themes.
//   01 RISCHO        — oxidized copper (steel & metalwork)
//   02 SIVIUS        — slate blue (real estate, mineral)
//   03 CONTENTKÜCHE  — saffron (the kitchen)
const ACCENTS = ["#c08552", "#8aa3bb", "#d9a441"];

interface CaseFile {
  id: string;
  index: string;
  name: string;
  fullName: string;
  domain: string;
  url: string;
  sector: string;
  scope: string[];
  status: string;
  statementRoman: string;
  statementItalic: string;
  body: string;
}

interface Labels {
  visitLabel: string;
  surfaceKey: string;
  sectorKey: string;
  scopeKey: string;
  statusKey: string;
}

// One sticky case file — pins to the viewport, scales back and dims as the
// next record slides over it. Inside, layers move at their own speeds.
function CaseCard({
  file,
  accent,
  labels,
  isLast,
  flip,
}: {
  file: CaseFile;
  accent: string;
  labels: Labels;
  isLast: boolean;
  flip: boolean;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(slotRef, { once: true, amount: 0.2 });

  // Progress while the next card covers this one
  const { scrollYProgress } = useScroll({
    target: slotRef,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], reduced || isLast ? [1, 1] : [1, 0.94]);
  const dim = useTransform(scrollYProgress, [0, 1], reduced || isLast ? [0, 0] : [0, 0.45]);

  // Internal parallax while the card crosses the viewport
  const { scrollYProgress: crossProgress } = useScroll({
    target: slotRef,
    offset: ["start end", "end start"],
  });
  const ghostY = useTransform(crossProgress, [0, 1], reduced ? ["0%", "0%"] : ["14%", "-22%"]);
  const ghostRotate = useTransform(crossProgress, [0, 1], reduced ? [0, 0] : [2.5, -2.5]);
  const panelY = useTransform(crossProgress, [0, 1], reduced ? ["0%", "0%"] : ["6%", "-6%"]);

  return (
    <div ref={slotRef} className={`cf-slot${isLast ? " cf-slot--last" : ""}`}>
      <motion.article
        className={`cf-card${inView ? " cf-card--on" : ""}`}
        style={{ scale, "--cfa": accent } as MotionStyle}
        aria-label={`Case file ${file.id} — ${file.fullName}`}
      >
        {/* Accent spine — draws in from top */}
        <span className="cf-spine" aria-hidden="true" />

        {/* Ghost index — drifts and tilts inside the card */}
        <motion.span
          className="cf-ghost"
          style={{ y: ghostY, rotate: ghostRotate }}
          aria-hidden="true"
        >
          {file.index}
        </motion.span>

        {/* File header strip */}
        <div className="cf-head">
          <span className="cf-head-id">CASE FILE — {file.id}</span>
          <span className="cf-head-status">
            <span className="cf-status-dot" aria-hidden="true" />
            {file.status}
          </span>
        </div>

        <div className={`cf-grid${flip ? " cf-grid--flip" : ""}`}>
          {/* The record */}
          <div className="cf-main">
            {/* Client name — letters rise out of a mask, one by one */}
            <h3 className="cf-name" aria-label={file.name}>
              {file.name.split("").map((ch, i) => (
                <span key={i} className="cf-name-mask" aria-hidden="true">
                  <span
                    className="cf-name-letter"
                    style={{ "--li": i } as React.CSSProperties}
                  >
                    {ch === " " ? " " : ch}
                  </span>
                </span>
              ))}
            </h3>
            <p className="cf-sector cf-reveal" style={{ "--d": "260ms" } as React.CSSProperties}>
              {file.sector}
            </p>

            <p className="cf-statement cf-reveal" style={{ "--d": "340ms" } as React.CSSProperties}>
              {file.statementRoman} <em>{file.statementItalic}</em>
            </p>

            <p className="cf-body cf-reveal" style={{ "--d": "420ms" } as React.CSSProperties}>
              {file.body}
            </p>

            <div className="cf-tags cf-reveal" style={{ "--d": "500ms" } as React.CSSProperties}>
              {file.scope.map((s) => (
                <span key={s} className="cf-tag">{s}</span>
              ))}
            </div>
          </div>

          {/* Specimen readout — lags on its own parallax track */}
          <motion.div
            className="cf-panel cf-reveal"
            style={{ y: panelY, "--d": "380ms" } as MotionStyle}
          >
            <div className="cf-panel-row">
              <span className="cf-panel-key">{labels.surfaceKey}</span>
              <span className="cf-panel-val">{file.domain}</span>
            </div>
            <div className="cf-panel-row">
              <span className="cf-panel-key">{labels.sectorKey}</span>
              <span className="cf-panel-val">{file.sector}</span>
            </div>
            <div className="cf-panel-row cf-panel-row--list">
              <span className="cf-panel-key">{labels.scopeKey}</span>
              <span className="cf-panel-list">
                {file.scope.map((s, i) => (
                  <span key={s} className="cf-panel-item" style={{ "--i": i } as React.CSSProperties}>
                    <span className="cf-panel-tick" aria-hidden="true" />
                    {s}
                  </span>
                ))}
              </span>
            </div>
            <div className="cf-panel-row">
              <span className="cf-panel-key">{labels.statusKey}</span>
              <span className="cf-panel-val cf-panel-val--live">{file.status}</span>
            </div>

            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cf-visit"
            >
              {labels.visitLabel} <span className="cf-visit-arrow">↗</span>
            </a>
          </motion.div>
        </div>

        {/* Marquee band — the client name as a drifting outline frieze */}
        <div className="cf-marquee" aria-hidden="true">
          <div className={`cf-marquee-track${flip ? " cf-marquee-track--reverse" : ""}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="cf-marquee-word">
                {file.name}
                <span className="cf-marquee-sep">✕</span>
              </span>
            ))}
          </div>
        </div>

        {/* Scan sweep on arrival */}
        <span className="cf-sweep" aria-hidden="true" />

        {/* Dim layer — darkens as the next file covers this one */}
        <motion.span className="cf-dim" style={{ opacity: dim }} aria-hidden="true" />
      </motion.article>
    </div>
  );
}

export default function CaseFiles() {
  const t = useTranslations();
  const cf = t.workPage.caseFiles;
  const reduced = useReducedMotion();

  const introRef = useRef<HTMLDivElement>(null);
  const headIn = useInView(introRef, { once: true, amount: 0.4 });

  // The vault word slides horizontally as the intro crosses the viewport
  const { scrollYProgress: introProgress } = useScroll({
    target: introRef,
    offset: ["start end", "end start"],
  });
  const vaultX = useTransform(introProgress, [0, 1], reduced ? ["0%", "0%"] : ["6%", "-14%"]);

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: headIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.65, ease: EASE, delay },
  });

  const labels: Labels = {
    visitLabel: cf.visitLabel,
    surfaceKey: cf.surfaceKey,
    sectorKey: cf.sectorKey,
    scopeKey: cf.scopeKey,
    statusKey: cf.statusKey,
  };

  return (
    <section className="cf-section" aria-label={cf.sectionLabel}>
      {/* Vault intro — giant word slides under the headline */}
      <div ref={introRef} className="cf-intro">
        <motion.span className="cf-vault" style={{ x: vaultX }} aria-hidden="true">
          {cf.sectionLabel}
        </motion.span>
        <motion.div {...anim(0)} className="cf-chips">
          <span className="cf-chip">02</span>
          <span className="cf-chip">{cf.sectionLabel}</span>
        </motion.div>
        <motion.h2 {...anim(0.08)} className="cf-headline">
          {cf.headline} <em>{cf.headlineItalic}</em>
        </motion.h2>
        <motion.p {...anim(0.16)} className="cf-intro-copy">{cf.intro}</motion.p>

        {/* Accent index — one tick per case, in its file color */}
        <motion.div {...anim(0.24)} className="cf-index-row" aria-hidden="true">
          {cf.cases.map((c, i) => (
            <span key={c.id} className="cf-index-cell" style={{ "--cfa": ACCENTS[i] } as React.CSSProperties}>
              <span className="cf-index-tick" />
              <span className="cf-index-num">{c.index}</span>
              <span className="cf-index-name">{c.name}</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* The stack */}
      {cf.cases.map((file, i) => (
        <CaseCard
          key={file.id}
          file={file}
          accent={ACCENTS[i % ACCENTS.length]}
          labels={labels}
          isLast={i === cf.cases.length - 1}
          flip={i % 2 === 1}
        />
      ))}

      <style>{`
        .cf-section {
          background: var(--paper);
        }

        /* ── Vault intro ───────────────────────────────── */
        .cf-intro {
          position: relative;
          padding: 120px 64px 88px;
          overflow: hidden;
        }
        .cf-vault {
          position: absolute;
          left: 0;
          bottom: -2vw;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(120px, 19vw, 340px);
          letter-spacing: -0.04em;
          line-height: 0.8;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 10%, transparent);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          will-change: transform;
        }
        .cf-chips { display: flex; gap: 16px; margin-bottom: 28px; position: relative; }
        .cf-chip {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .cf-headline {
          position: relative;
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(40px, 5.4vw, 76px);
          line-height: 1.04;
          color: var(--warm-black);
          margin: 0 0 24px;
        }
        .cf-headline em { font-style: italic; }
        .cf-intro-copy {
          position: relative;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 460px;
          margin: 0 0 44px;
        }
        .cf-index-row {
          position: relative;
          display: flex;
          gap: 44px;
          flex-wrap: wrap;
        }
        .cf-index-cell {
          display: inline-flex;
          align-items: baseline;
          gap: 10px;
        }
        .cf-index-tick {
          width: 14px;
          height: 2px;
          background: var(--cfa);
          align-self: center;
        }
        .cf-index-num {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          color: var(--dust);
        }
        .cf-index-name {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          color: var(--text-secondary);
        }

        /* ── Sticky stack ──────────────────────────────── */
        .cf-slot {
          height: 135vh;
          position: relative;
        }
        .cf-slot--last { height: auto; padding-bottom: 110px; }
        .cf-card {
          position: sticky;
          top: 96px;
          margin: 0 64px;
          min-height: calc(100svh - 180px);
          border: 1px solid var(--warm-black);
          background:
            linear-gradient(
              140deg,
              color-mix(in srgb, var(--cfa) 7%, var(--paper)) 0%,
              var(--paper) 52%
            );
          overflow: hidden;
          display: flex;
          flex-direction: column;
          will-change: transform;
          transform-origin: top center;
        }
        .cf-slot--last .cf-card { position: relative; top: 0; }

        /* ── Accent spine ──────────────────────────────── */
        .cf-spine {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: var(--cfa);
          z-index: 2;
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 1100ms cubic-bezier(.16,1,.3,1) 200ms;
        }
        .cf-card--on .cf-spine { transform: scaleY(1); }

        /* ── Ghost index ───────────────────────────────── */
        .cf-ghost {
          position: absolute;
          right: -1vw;
          bottom: 2vw;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(220px, 26vw, 460px);
          line-height: 0.8;
          letter-spacing: -0.05em;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--cfa) 38%, transparent);
          pointer-events: none;
          user-select: none;
          z-index: 0;
          will-change: transform;
        }

        /* ── File header strip ─────────────────────────── */
        .cf-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px 16px 36px;
          border-bottom: 1px solid var(--warm-black);
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }
        .cf-head-id, .cf-head-status {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .cf-status-dot {
          width: 6px;
          height: 6px;
          background: var(--cfa);
          border-radius: 50%;
          animation: cf-blink 2.4s ease-in-out infinite;
        }
        @keyframes cf-blink { 50% { opacity: 0.25; } }

        /* ── Card grid ─────────────────────────────────── */
        .cf-grid {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
          gap: 0 64px;
          padding: 48px 32px 48px 36px;
          position: relative;
          z-index: 1;
          align-content: center;
        }
        .cf-grid--flip .cf-main { order: 2; }
        .cf-grid--flip .cf-panel { order: 1; justify-self: start; }

        /* ── Client name — letter stagger ──────────────── */
        .cf-name {
          margin: 0 0 10px;
          line-height: 0.92;
          white-space: nowrap;
        }
        .cf-name-mask {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
        }
        .cf-name-letter {
          display: inline-block;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(40px, 5.6vw, 92px);
          letter-spacing: -0.03em;
          text-transform: uppercase;
          color: var(--warm-black);
          transform: translateY(115%);
          transition: transform 800ms cubic-bezier(.16,1,.3,1) calc(120ms + var(--li, 0) * 36ms);
        }
        .cf-card--on .cf-name-letter { transform: translateY(0); }

        .cf-sector {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--dust);
          margin: 0 0 32px;
        }
        .cf-statement {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(22px, 2.4vw, 34px);
          line-height: 1.2;
          color: var(--warm-black);
          max-width: 520px;
          margin: 0 0 22px;
        }
        .cf-statement em { font-style: italic; }
        .cf-body {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-body);
          max-width: 460px;
          margin: 0 0 32px;
        }
        .cf-tags { display: flex; flex-wrap: wrap; gap: 10px; }
        .cf-tag {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-secondary);
          border: 1px solid var(--line-strong);
          padding: 7px 14px;
          transition: border-color 0.3s, color 0.3s;
        }
        .cf-card:hover .cf-tag {
          border-color: color-mix(in srgb, var(--cfa) 65%, transparent);
          color: var(--text-primary);
        }

        /* ── Specimen readout panel ────────────────────── */
        .cf-panel {
          align-self: center;
          border: 1px solid var(--warm-black);
          background: var(--paper);
          padding: 6px 0 0;
          width: 100%;
          max-width: 380px;
          justify-self: end;
          will-change: transform;
        }
        .cf-panel-row {
          display: flex;
          gap: 18px;
          padding: 14px 22px;
          border-bottom: 1px solid var(--line);
          align-items: baseline;
        }
        .cf-panel-row--list { align-items: flex-start; }
        .cf-panel-key {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          color: var(--dust);
          width: 64px;
          flex-shrink: 0;
        }
        .cf-panel-val {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--warm-black);
        }
        .cf-panel-val--live { color: var(--cfa); }
        .cf-panel-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cf-panel-item {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--warm-black);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transform: translateX(-6px);
          transition:
            opacity 500ms ease calc(600ms + var(--i, 0) * 120ms),
            transform 500ms cubic-bezier(.16,1,.3,1) calc(600ms + var(--i, 0) * 120ms);
        }
        .cf-card--on .cf-panel-item { opacity: 1; transform: none; }
        .cf-panel-tick {
          width: 10px;
          height: 1px;
          background: var(--cfa);
          flex-shrink: 0;
        }
        .cf-visit {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 22px;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-primary);
          text-decoration: none;
          transition: background 0.3s, color 0.3s;
          min-height: 44px;
        }
        .cf-visit:hover {
          background: var(--cfa);
          color: var(--paper);
        }
        .cf-visit:hover .cf-visit-arrow { color: var(--paper); }
        .cf-visit:focus-visible { outline: 1px solid var(--warm-black); outline-offset: -4px; }
        .cf-visit-arrow { color: var(--cfa); font-size: 14px; transition: color 0.3s; }

        /* ── Marquee band ──────────────────────────────── */
        .cf-marquee {
          border-top: 1px solid var(--warm-black);
          overflow: hidden;
          white-space: nowrap;
          padding: 10px 0;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }
        .cf-marquee-track {
          display: inline-flex;
          align-items: baseline;
          animation: cf-drift 40s linear infinite;
        }
        .cf-marquee-track--reverse { animation-direction: reverse; }
        @keyframes cf-drift {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .cf-marquee-word {
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: 34px;
          letter-spacing: -0.02em;
          line-height: 1.1;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--cfa) 55%, transparent);
          display: inline-flex;
          align-items: baseline;
          flex-shrink: 0;
        }
        .cf-marquee-sep {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: var(--cfa);
          -webkit-text-stroke: 0;
          margin: 0 1.2em;
          transform: translateY(-0.8em);
        }

        /* ── Reveal + sweep + dim ──────────────────────── */
        .cf-reveal {
          opacity: 0;
          transform: translateY(16px);
          transition:
            opacity 700ms cubic-bezier(.16,1,.3,1) var(--d, 0ms),
            transform 700ms cubic-bezier(.16,1,.3,1) var(--d, 0ms);
        }
        .cf-card--on .cf-reveal { opacity: 1; transform: none; }
        /* the panel's transform belongs to the parallax — only fade it */
        .cf-panel.cf-reveal {
          transform: none;
          transition: opacity 700ms cubic-bezier(.16,1,.3,1) var(--d, 0ms);
        }

        .cf-sweep {
          position: absolute;
          top: 0; bottom: 0;
          left: -1px;
          width: 1px;
          background: var(--cfa);
          opacity: 0;
          z-index: 2;
          pointer-events: none;
        }
        .cf-card--on .cf-sweep {
          animation: cf-sweep 1100ms cubic-bezier(.16,1,.3,1) 600ms both;
        }
        @keyframes cf-sweep {
          0%   { left: 0; opacity: 0; }
          6%   { opacity: 0.5; }
          90%  { opacity: 0.15; }
          100% { left: 100%; opacity: 0; }
        }

        .cf-dim {
          position: absolute;
          inset: 0;
          background: var(--warm-black);
          z-index: 3;
          pointer-events: none;
        }

        /* ── Reduced motion ────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .cf-reveal { opacity: 1; transform: none; transition: none; }
          .cf-name-letter { transform: none; transition: none; }
          .cf-panel-item { opacity: 1; transform: none; transition: none; }
          .cf-card--on .cf-sweep { animation: none; }
          .cf-status-dot { animation: none; }
          .cf-marquee-track { animation: none; }
          .cf-spine { transform: scaleY(1); transition: none; }
          .cf-slot { height: auto; padding-bottom: 64px; }
          .cf-card { position: relative; top: 0; }
        }

        /* ── Mobile ────────────────────────────────────── */
        @media (max-width: 900px) {
          .cf-intro { padding: 72px 24px 56px; }
          .cf-vault { font-size: 32vw; }
          .cf-index-row { gap: 24px; }
          .cf-slot { height: auto; padding-bottom: 32px; }
          .cf-slot--last { padding-bottom: 72px; }
          .cf-card {
            position: relative;
            top: 0;
            margin: 0 16px;
            min-height: auto;
          }
          .cf-head { padding: 14px 20px; }
          .cf-grid,
          .cf-grid--flip {
            grid-template-columns: 1fr;
            gap: 40px 0;
            padding: 36px 20px 44px;
          }
          .cf-grid--flip .cf-main { order: 1; }
          .cf-grid--flip .cf-panel { order: 2; }
          .cf-name { white-space: normal; }
          .cf-name-letter { font-size: clamp(34px, 10vw, 56px); }
          .cf-sector { margin-bottom: 24px; }
          .cf-panel { justify-self: stretch; max-width: none; }
          .cf-ghost { font-size: 50vw; bottom: 6vw; }
          .cf-marquee-word { font-size: 24px; }
        }
      `}</style>
    </section>
  );
}
