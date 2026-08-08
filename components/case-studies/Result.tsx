"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import type { CaseContent } from "@/lib/case-studies/types";
import { VALUES } from "@/lib/case-studies/de";
import { publish } from "@/lib/case-studies/gate";

// ─── 06 / Das Ergebnis ───────────────────────────────────────────────────────
// MAGIC MOMENT 4 — der Höhepunkt der Seite.
//
// Eine scroll-gesteuerte Ranking-Achse. Platz 1 liegt oben, deshalb wandert die
// Marke bei besserer Position nach OBEN. Beim Überschreiten von Platz 3 tritt
// die TOP-3-Referenzlinie kurz hervor.
//
// DATENEHRLICHKEIT
// Es existiert keine gemessene Zwischenreihe. Gemessen sind ausschliesslich
// Start- und Endwert des 45-Tage-Fensters. Deshalb bewegt sich zwar der Marker
// stufenlos, aber es wird zu keinem Zeitpunkt eine Zwischenzahl als Messwert
// ausgegeben: beschriftet sind nur 5,3 und 2,2. Die Bildunterschrift sagt das
// ausdrücklich.
//
// Kein Pinning: die Bewegung ist an den normalen Scroll durch die Section
// gekoppelt. Damit gibt es keine Spacer, keine Resize-Probleme und auf Mobile
// automatisch dieselbe, nur kürzere Choreografie.

// Achsenraum: Position 1 (oben) bis 7 (unten).
const AXIS_TOP = 1;
const AXIS_BOTTOM = 7;
const TOP3 = 3;

const posToPct = (pos: number) => ((pos - AXIS_TOP) / (AXIS_BOTTOM - AXIS_TOP)) * 100;

// Sprachunabhängige Rohwerte für die Geometrie — die Achse darf nicht davon
// abhängen, ob eine Sprachfassung Komma oder Punkt als Dezimaltrenner schreibt.
const FROM = VALUES.aiPositionBefore;
const TO = VALUES.aiPositionAfter;

export default function Result({ content }: { content: CaseContent }) {
  const c = content.result;
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start end", "end start"],
  });

  // Nutzbares Fenster innerhalb des Durchlaufs: davor Ruhe, danach Ruhe.
  const t = useTransform(scrollYProgress, [0.24, 0.62], [0, 1], { clamp: true });

  const markerTop = useTransform(t, (v) => `${posToPct(FROM + (TO - FROM) * v)}%`);
  // Der Endwert wird erst beschriftet, wenn er auch erreicht ist.
  const endOpacity = useTransform(t, [0.82, 1], [0, 1], { clamp: true });
  const trailHeight = useTransform(t, (v) => {
    const a = posToPct(FROM);
    const b = posToPct(FROM + (TO - FROM) * v);
    return `${Math.abs(a - b)}%`;
  });
  const trailTop = useTransform(t, (v) => `${posToPct(FROM + (TO - FROM) * v)}%`);

  // Sobald die Marke Platz 3 unterschreitet, tritt die Referenzlinie hervor.
  // Bewusst ein harter Umschlag am Schwellwert — die CSS-Transition auf dem
  // Element federt ihn ab, sodass ein kurzer, ruhiger Moment entsteht.
  const top3Opacity = useTransform(t, (v) => (FROM + (TO - FROM) * v <= TOP3 ? 1 : 0.45));
  const top3Scale = useTransform(t, (v) => (FROM + (TO - FROM) * v <= TOP3 ? 1 : 0.35));

  const fromValue = publish(c.from);
  const toValue = publish(c.to);
  if (!fromValue || !toValue) return null;

  const still = reduce ?? false;

  return (
    <section className="csr" id="ergebnis" ref={section} aria-labelledby="result-h">
      <div className="csr-inner">
        {/* ── Links: die Aussage ─────────────────────────────── */}
        <div className="csr-text">
          <p className="tc-label">
            <span>06</span>
            <span>{c.eyebrow}</span>
          </p>

          <h2 className="csr-h2" id="result-h">
            {c.headline}
          </h2>

          <p className="csr-metric">
            <span className="csr-metric-from">{c.averagePrefix} {fromValue}</span>
            <span className="csr-metric-arrow" aria-hidden="true">→</span>
            <span className="csr-metric-to">{c.averagePrefix} {toValue}</span>
          </p>

          <p className="csr-subline">{c.subline}</p>

          <p className="csr-statement">{c.statement}</p>

          <p className="csr-days">{c.daysLabel}</p>

          <dl className="csr-meta">
            {c.meta.map((m) => (
              <div key={m.key}>
                <dt>{m.key}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Rechts: die Achse ──────────────────────────────── */}
        <figure className="csr-figure">
          <div className="csr-axis">
            <p className="csr-axis-cap csr-axis-cap-top">{c.axis.top}</p>

            {/* TOP-3-Referenz */}
            <motion.div
              className="csr-top3"
              style={{
                top: `${posToPct(TOP3)}%`,
                opacity: still ? 1 : top3Opacity,
              }}
            >
              <motion.span
                className="csr-top3-line"
                style={{ scaleX: still ? 1 : top3Scale }}
              />
              <span className="csr-top3-label">{c.axis.top3}</span>
            </motion.div>

            {/* Startmarke */}
            <div className="csr-mark csr-mark-from" style={{ top: `${posToPct(FROM)}%` }}>
              <span className="csr-mark-dot" />
              <span className="csr-mark-label">{fromValue}</span>
            </div>

            {/* Verlaufsspur */}
            <motion.span
              className="csr-trail"
              style={
                still
                  ? { top: `${posToPct(TO)}%`, height: `${posToPct(FROM) - posToPct(TO)}%` }
                  : { top: trailTop, height: trailHeight }
              }
            />

            {/* Wandernde Marke — bewusst ohne Zahl, damit unterwegs kein
                Zwischenwert wie ein Messwert aussieht. */}
            <motion.span
              className="csr-mark-dot-live"
              style={still ? { top: `${posToPct(TO)}%` } : { top: markerTop }}
            />

            {/* Endwert — erscheint, sobald die Marke dort ankommt. */}
            <motion.div
              className="csr-mark csr-mark-end"
              style={{
                top: `${posToPct(TO)}%`,
                opacity: still ? 1 : endOpacity,
              }}
            >
              <span className="csr-mark-label csr-mark-label-live">{toValue}</span>
            </motion.div>

            <p className="csr-axis-cap csr-axis-cap-bottom">{c.axis.bottom}</p>
          </div>

          <figcaption className="csr-caption">
            {c.caption}
          </figcaption>
        </figure>
      </div>

      <style>{`
        .csr {
          position: relative;
          background: var(--paper-soft);
          border-bottom: 1px solid var(--line);
          padding: clamp(56px, 6vw, 96px) var(--gutter);
          scroll-margin-top: 108px;
        }
        .csr-inner {
          display: grid;
          grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
          gap: clamp(28px, 4vw, 72px);
          align-items: center;
        }
        .csr-text { min-width: 0; }

        .csr-h2 {
          margin-top: clamp(18px, 2vw, 28px);
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(34px, 4.4vw, 68px);
          line-height: 0.98;
          letter-spacing: -0.015em;
          text-transform: uppercase;
          color: var(--ink-strong);
        }

        .csr-metric {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: clamp(10px, 1.2vw, 20px);
          margin-top: clamp(20px, 2.2vw, 32px);
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(40px, 5.4vw, 84px);
          line-height: 1;
          letter-spacing: -0.03em;
          font-variant-numeric: lining-nums tabular-nums;
        }
        .csr-metric-from { color: var(--text-faint); }
        .csr-metric-arrow { color: var(--olive); font-size: 0.5em; }
        .csr-metric-to { color: var(--ink-strong); }

        .csr-subline {
          margin-top: clamp(14px, 1.5vw, 20px);
          font-family: var(--font-body), sans-serif;
          font-size: clamp(12px, 0.95vw, 13px);
          font-weight: 600;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .csr-statement {
          margin-top: clamp(18px, 2vw, 26px);
          max-width: 58ch;
          font-family: var(--font-body), sans-serif;
          font-size: clamp(13.5px, 1.05vw, 15px);
          line-height: 1.75;
          color: var(--text-body);
        }
        .csr-days {
          margin-top: clamp(18px, 2vw, 26px);
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(20px, 2vw, 30px);
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--ink-strong);
        }

        .csr-meta {
          margin-top: clamp(22px, 2.4vw, 34px);
          padding-top: 14px;
          border-top: 1px solid var(--line);
          display: grid;
          gap: 8px;
        }
        .csr-meta > div {
          display: grid;
          grid-template-columns: 88px minmax(0, 1fr);
          gap: 14px;
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.11em;
          line-height: 1.7;
          text-transform: uppercase;
        }
        .csr-meta dt { color: var(--text-faint); }
        .csr-meta dd { color: var(--text-secondary); }

        /* ── Die Achse ──────────────────────────────────────── */
        .csr-figure { min-width: 0; }
        .csr-axis {
          position: relative;
          height: clamp(280px, 34vw, 440px);
          max-width: 260px;
          border-left: 1px solid var(--line-strong);
          margin-left: clamp(30px, 4vw, 64px);
        }
        .csr-axis-cap {
          position: absolute;
          left: -1px;
          transform: translateX(-100%);
          padding-right: 12px;
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--text-faint);
          white-space: nowrap;
        }
        .csr-axis-cap-top { top: -4px; }
        .csr-axis-cap-bottom { bottom: -4px; }

        .csr-top3 {
          transition: opacity 520ms cubic-bezier(0.16, 1, 0.3, 1);
          position: absolute;
          left: 0;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .csr-top3-line {
          flex: 1;
          height: 1px;
          background: var(--line-strong);
          transform-origin: left;
          transition: transform 620ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .csr-top3-label {
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .csr-trail {
          position: absolute;
          left: -1px;
          width: 2px;
          background: var(--olive);
        }

        .csr-mark {
          position: absolute;
          left: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .csr-mark-dot {
          width: 7px;
          height: 7px;
          margin-left: -4px;
          background: var(--text-faint);
          border-radius: 50% !important;
          flex-shrink: 0;
        }
        .csr-mark-dot-live {
          position: absolute;
          left: 0;
          width: 9px;
          height: 9px;
          margin-left: -5px;
          background: var(--olive);
          border-radius: 50% !important;
          transform: translateY(-50%);
          z-index: 2;
        }
        .csr-mark-end { padding-left: 12px; }
        .csr-mark-label {
          font-family: var(--font-editorial), Georgia, serif;
          font-size: clamp(15px, 1.4vw, 20px);
          line-height: 1;
          color: var(--text-faint);
          font-variant-numeric: lining-nums tabular-nums;
        }
        .csr-mark-label-live {
          font-size: clamp(22px, 2.2vw, 32px);
          color: var(--ink-strong);
        }

        .csr-caption {
          margin-top: clamp(20px, 2.2vw, 30px);
          max-width: 46ch;
          font-family: var(--font-body), sans-serif;
          font-size: 11px;
          line-height: 1.65;
          color: var(--text-muted);
        }

        /* ── Mobile: gleiche Choreografie, kürzer und direkter ─ */
        /* Bei reduzierter Bewegung steht der Endzustand. Die Regeln müssen die
           von der Motion-Library gesetzten Inline-Styles überstimmen, sonst
           bliebe der Endwert unsichtbar. */
        @media (prefers-reduced-motion: reduce) {
          .csr-top3, .csr-top3-line { transition: none; }
          .csr-top3 { opacity: 1 !important; }
          .csr-top3-line { transform: scaleX(1) !important; }
          .csr-mark-end { opacity: 1 !important; }
        }
        @media (max-width: 900px) {
          .csr-inner { grid-template-columns: minmax(0, 1fr); gap: clamp(30px, 8vw, 48px); }
          .csr-axis {
            height: clamp(230px, 58vw, 320px);
            margin-left: clamp(46px, 16vw, 70px);
          }
          .csr-metric { font-size: clamp(38px, 13vw, 62px); }
        }
      `}</style>
    </section>
  );
}
