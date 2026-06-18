"use client";

import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/context";

// Pinned scroll scene — the four system words ignite as the user scrolls
// through 280vh while the viewport stays locked on the scene.
export default function SystemStatement() {
  const t = useTranslations();
  const sys = t.servicesPage.system;
  const reduced = useReducedMotion();

  const outerRef = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });
  const lineProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // 5 stages: 0 = nothing lit, 1..4 = words lit cumulatively
    setStage(Math.min(4, Math.max(0, Math.floor(v * 6.2))));
  });

  const allOn = reduced === true;

  return (
    <section
      ref={outerRef}
      id="system"
      className={`sys-outer${allOn ? " sys-outer--static" : ""}`}
      aria-label="The visibility system"
    >
      <div className="sys-sticky">
        <div className="sys-top">
          <div className="sys-chips">
            <span className="sys-chip">02</span>
            <span className="sys-chip">{sys.sectionLabel}</span>
          </div>
          <h2 className="sys-headline">
            {sys.headline} <em>{sys.headlineItalic}</em>
          </h2>
        </div>

        {/* The four words — outline until their stage arrives */}
        <div className="sys-words">
          {sys.ticks.map((word, i) => {
            const on = allOn || stage > i;
            return (
              <div key={word} className={`sys-word-row${on ? " sys-word-row--on" : ""}`}>
                <span className="sys-word-idx">0{i + 1}</span>
                <span className="sys-word">{word}</span>
                <span className="sys-word-mark" aria-hidden="true" />
              </div>
            );
          })}
        </div>

        {/* Signal line — driven by scroll */}
        <div className="sys-line-wrap" aria-hidden="true">
          <motion.span
            className="sys-line"
            style={{ scaleX: allOn ? 1 : lineProgress }}
          />
        </div>

        <div className="sys-copy-row">
          <p className="sys-copy">{sys.copy1}</p>
          <p className="sys-copy sys-copy--dim">{sys.copy2}</p>
        </div>
      </div>

      <style>{`
        /* ── Pinned scene ──────────────────────────────── */
        .sys-outer {
          position: relative;
          height: 280vh;
          background: var(--paper);
          border-bottom: 1px solid var(--warm-black);
          scroll-margin-top: 0;
        }
        .sys-outer--static { height: auto; }
        .sys-sticky {
          position: sticky;
          top: 0;
          height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 120px 64px 56px;
          overflow: hidden;
        }
        .sys-outer--static .sys-sticky {
          position: static;
          height: auto;
          padding: 96px 64px 88px;
        }

        .sys-top { margin-bottom: 40px; }
        .sys-chips { display: flex; gap: 16px; margin-bottom: 22px; }
        .sys-chip {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .sys-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(24px, 2.6vw, 38px);
          line-height: 1.15;
          color: var(--warm-black);
          margin: 0;
          max-width: 640px;
        }
        .sys-headline em { font-style: normal; }

        /* ── The words ─────────────────────────────────── */
        .sys-words { display: flex; flex-direction: column; }
        .sys-word-row {
          display: flex;
          align-items: baseline;
          gap: 28px;
          border-top: 1px solid var(--line);
          padding: 6px 0;
        }
        .sys-word-idx {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          color: var(--dust);
          width: 28px;
          flex-shrink: 0;
          transition: color 500ms ease;
        }
        .sys-word {
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(40px, 7.2vw, 104px);
          letter-spacing: -0.02em;
          line-height: 0.98;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 32%, transparent);
          transition: color 700ms cubic-bezier(.16,1,.3,1);
        }
        .sys-word-mark {
          width: 10px;
          height: 10px;
          background: var(--olive);
          align-self: center;
          margin-left: auto;
          flex-shrink: 0;
          transform: scale(0);
          transition: transform 500ms cubic-bezier(.16,1,.3,1);
        }
        .sys-word-row--on .sys-word {
          color: var(--warm-black);
          -webkit-text-stroke: 1px transparent;
        }
        .sys-word-row--on .sys-word-idx { color: var(--olive); }
        .sys-word-row--on .sys-word-mark { transform: scale(1); }

        /* ── Scroll-driven line ────────────────────────── */
        .sys-line-wrap {
          height: 2px;
          background: var(--line);
          margin: 36px 0 28px;
          position: relative;
          overflow: hidden;
        }
        .sys-line {
          position: absolute;
          inset: 0;
          background: var(--signal);
          transform-origin: left;
          display: block;
        }

        .sys-copy-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 64px;
          max-width: 920px;
        }
        .sys-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-body);
          margin: 0;
        }
        .sys-copy--dim { color: var(--text-muted); }

        /* ── Mobile ────────────────────────────────────── */
        @media (max-width: 900px) {
          .sys-outer { height: 240vh; }
          .sys-outer--static { height: auto; }
          .sys-sticky { padding: 110px 24px 40px; }
          .sys-outer--static .sys-sticky { padding: 64px 24px 60px; }
          .sys-word-row { gap: 16px; }
          .sys-copy-row { grid-template-columns: 1fr; gap: 14px 0; }
          .sys-copy { font-size: 13px; }
        }
      `}</style>
    </section>
  );
}
