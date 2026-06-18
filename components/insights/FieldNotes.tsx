"use client";

import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Intelligence Room accent — matches the Observatory
const INS = "#66aabf";

// The dossier line — vertical scroll drives a horizontal ride through
// the field notes. On mobile and reduced motion it falls back to a
// native swipeable rail with scroll-snap.
export default function FieldNotes() {
  const t = useTranslations();
  const fn = t.insightsPage.fieldNotes;
  const NOTES = fn.notes;
  const reduced = useReducedMotion();

  const outerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const introRef = useRef(null);
  const introIn = useInView(introRef, { once: true, amount: 0.4 });

  const [endX, setEndX] = useState(0);
  const pinned = endX < 0;

  useEffect(() => {
    const measure = () => {
      if (reduced || window.innerWidth < 900 || !trackRef.current) {
        setEndX(0);
        return;
      }
      const total = trackRef.current.scrollWidth;
      setEndX(Math.min(0, window.innerWidth - total));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reduced]);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, endX]);

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: introIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.65, ease: EASE, delay },
  });

  return (
    <>
      {/* Intro */}
      <section
        ref={introRef}
        className="dl-intro"
        style={{ "--ins": INS } as React.CSSProperties}
      >
        <motion.div {...anim(0)} className="dl-chips">
          <span className="dl-chip">04</span>
          <span className="dl-chip">{fn.chip}</span>
          <span className="dl-chip dl-chip--right">{fn.dateLabel}</span>
        </motion.div>
        <motion.h2 {...anim(0.08)} className="dl-headline">
          {fn.introHeadlineRoman} <em>{fn.introHeadlineItalic}</em>
        </motion.h2>
        <motion.p {...anim(0.16)} className="dl-copy">
          {fn.introCopy.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </motion.p>
      </section>

      {/* The dossier line */}
      <section
        ref={outerRef}
        className={`dl-outer${pinned ? " dl-outer--pinned" : ""}`}
        style={{ "--ins": INS, "--n": NOTES.length } as React.CSSProperties}
        aria-label={fn.chip}
      >
        <div className="dl-sticky">
          <motion.div
            ref={trackRef}
            className="dl-track"
            style={{ x: pinned ? x : 0 }}
          >
            {NOTES.map((note, i) => (
              <article key={note.id} className="dl-card">
                {/* Ghost number */}
                <span className="dl-ghost" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Classification stamp */}
                <span className="dl-stamp" aria-hidden="true">{note.cls}</span>

                <div className="dl-card-head">
                  <span className="dl-card-id">{note.id}</span>
                  <span className="dl-card-cls">{note.cls}</span>
                </div>

                <div className="dl-card-body">
                  <h3 className="dl-card-title">{note.title}</h3>
                  <p className="dl-card-abstract">{note.abstract}</p>
                  <p className="dl-card-observation">{note.observation}</p>
                </div>

                <div className="dl-card-move">
                  <span className="dl-move-label">OPERATIVE MOVE</span>
                  <p className="dl-move-text">{note.move}</p>
                </div>
              </article>
            ))}
          </motion.div>

          {/* Progress rail — only meaningful while pinned */}
          {pinned && (
            <div className="dl-rail" aria-hidden="true">
              <motion.span className="dl-rail-fill" style={{ scaleX: scrollYProgress }} />
            </div>
          )}
        </div>
      </section>

      <style>{`
        /* ── Intro ─────────────────────────────────────── */
        .dl-intro {
          background: var(--paper);
          padding: 88px 64px 48px;
        }
        .dl-chips { display: flex; gap: 16px; margin-bottom: 26px; align-items: baseline; }
        .dl-chip {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .dl-chip--right { margin-left: auto; color: var(--dust); }
        .dl-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(32px, 4.2vw, 56px);
          line-height: 1.08;
          color: var(--warm-black);
          margin: 0 0 18px;
          max-width: 760px;
        }
        .dl-headline em { font-style: normal; }
        .dl-copy {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          line-height: 2;
          color: var(--dust);
          margin: 0;
        }

        /* ── Outer / sticky ────────────────────────────── */
        .dl-outer {
          background: var(--paper);
          border-bottom: 1px solid var(--warm-black);
        }
        .dl-outer--pinned {
          height: calc(var(--n) * 42vh + 100vh);
        }
        .dl-sticky { position: relative; }
        .dl-outer--pinned .dl-sticky {
          position: sticky;
          top: 0;
          height: 100svh;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        /* ── Track ─────────────────────────────────────── */
        .dl-track {
          display: flex;
          gap: 28px;
          padding: 96px 64px 64px;
          will-change: transform;
        }
        /* fallback rail — swipe natively when not pinned */
        .dl-outer:not(.dl-outer--pinned) .dl-track {
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 48px 24px 56px;
        }

        /* ── Card ──────────────────────────────────────── */
        .dl-card {
          position: relative;
          flex-shrink: 0;
          width: min(520px, 84vw);
          min-height: min(62vh, 620px);
          border: 1px solid var(--warm-black);
          background:
            linear-gradient(
              150deg,
              color-mix(in srgb, var(--ins) 6%, var(--paper)) 0%,
              var(--paper) 55%
            );
          display: flex;
          flex-direction: column;
          overflow: hidden;
          scroll-snap-align: start;
          transition: border-color 0.3s;
        }
        .dl-card:hover { border-color: color-mix(in srgb, var(--ins) 60%, var(--warm-black)); }

        .dl-ghost {
          position: absolute;
          right: -12px;
          bottom: -34px;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: 200px;
          line-height: 0.8;
          letter-spacing: -0.05em;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--ins) 26%, transparent);
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }

        .dl-stamp {
          position: absolute;
          top: 52px;
          right: 20px;
          transform: rotate(-7deg);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--ins);
          border: 1px solid color-mix(in srgb, var(--ins) 60%, transparent);
          padding: 6px 10px 6px 13px;
          z-index: 1;
          opacity: 0.85;
        }

        .dl-card-head {
          display: flex;
          justify-content: space-between;
          padding: 14px 24px;
          border-bottom: 1px solid var(--warm-black);
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }
        .dl-card-id {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          color: var(--text-secondary);
        }
        .dl-card-cls {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.24em;
          color: var(--ins);
          align-self: center;
        }

        .dl-card-body {
          flex: 1;
          padding: 28px 24px 20px;
          position: relative;
          z-index: 1;
        }
        .dl-card-title {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(22px, 2.2vw, 30px);
          line-height: 1.16;
          color: var(--warm-black);
          margin: 0 0 14px;
          max-width: 380px;
        }
        .dl-card-abstract {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.6;
          color: var(--text-primary);
          margin: 0 0 18px;
          max-width: 380px;
        }
        .dl-card-observation {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 13px;
          line-height: 1.7;
          color: var(--text-muted);
          margin: 0;
          max-width: 400px;
        }

        .dl-card-move {
          border-top: 1px solid var(--warm-black);
          padding: 16px 24px 20px;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          background: color-mix(in srgb, var(--ins) 8%, var(--paper));
        }
        .dl-move-label {
          display: block;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.26em;
          color: var(--ins);
          margin-bottom: 7px;
        }
        .dl-move-text {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          line-height: 1.55;
          color: var(--text-primary);
          margin: 0;
        }

        /* ── Progress rail ─────────────────────────────── */
        .dl-rail {
          position: absolute;
          left: 64px;
          right: 64px;
          bottom: 30px;
          height: 2px;
          background: var(--line);
          overflow: hidden;
        }
        .dl-rail-fill {
          position: absolute;
          inset: 0;
          background: var(--ins);
          transform-origin: left;
          display: block;
        }

        /* ── Mobile ────────────────────────────────────── */
        @media (max-width: 900px) {
          .dl-intro { padding: 60px 24px 36px; }
          .dl-chip--right { display: none; }
          .dl-card { min-height: 480px; }
          .dl-ghost { font-size: 150px; }
        }
      `}</style>
    </>
  );
}
