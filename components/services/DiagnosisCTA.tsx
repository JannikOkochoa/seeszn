"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function DiagnosisCTA() {
  const t = useTranslations();
  const dc = t.servicesPage.diagnosisCta;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  // The headline grows slightly as the section arrives — a final inhale
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [0.92, 1]);
  const ghostY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["30%", "-10%"]);

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="dcta-section">
      {/* Counter-parallax ghost word */}
      <motion.span className="dcta-ghost" style={{ y: ghostY, x: "-50%" }} aria-hidden="true">
        {dc.cta.split(" ").pop()}
      </motion.span>

      <motion.div {...anim(0)} className="dcta-label-row">
        <span className="dcta-label">06</span>
        <span className="dcta-label">{dc.sectionLabel}</span>
      </motion.div>

      <div className="dcta-center">
        <motion.h2 {...anim(0.08)} className="dcta-headline" style={{ scale }}>
          {dc.headlineRoman}
          <br />
          <em>{dc.headlineItalic}</em>
        </motion.h2>

        <motion.p {...anim(0.16)} className="dcta-copy">
          {dc.copy.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </motion.p>

        <motion.div {...anim(0.24)}>
          <a href={t.locale === "de" ? "/de/diagnosis" : "/diagnosis"} className="dcta-cta">
            {dc.cta} <span style={{ color: "var(--olive)" }}>→</span>
          </a>
        </motion.div>

        <motion.div {...anim(0.34)} className="dcta-close">
          <span className="dcta-rule" aria-hidden="true" />
          <p className="dcta-sentence">
            {dc.closing}
          </p>
        </motion.div>
      </div>

      <style>{`
        .dcta-section {
          position: relative;
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
          padding: 72px 64px 110px;
          overflow: hidden;
        }
        .dcta-ghost {
          position: absolute;
          left: 50%;
          top: 38%;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(120px, 20vw, 340px);
          letter-spacing: -0.04em;
          line-height: 1;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 8%, transparent);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          z-index: 0;
        }
        .dcta-label-row, .dcta-center { position: relative; z-index: 1; }
        .dcta-label-row { display: flex; gap: 16px; margin-bottom: 72px; }
        .dcta-label {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .dcta-center {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .dcta-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(40px, 5.4vw, 72px);
          line-height: 1.06;
          color: var(--warm-black);
          margin: 0 0 28px;
        }
        .dcta-headline em { font-style: italic; }
        .dcta-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-body);
          margin-bottom: 40px;
        }
        .dcta-cta {
          display: inline-block;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          border: 1px solid var(--button-border);
          padding: 15px 32px;
          min-height: 44px;
          color: var(--text-primary);
          background: transparent;
          transition: background 0.25s, border-color 0.25s, color 0.25s;
        }
        .dcta-cta:hover { background: var(--warm-black); border-color: var(--warm-black); color: var(--paper); }
        .dcta-cta:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }

        .dcta-close {
          margin-top: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }
        .dcta-rule {
          width: 32px;
          height: 1px;
          background: var(--olive);
          display: block;
        }
        .dcta-sentence {
          font-family: var(--font-editorial), serif;
          font-style: italic;
          font-size: 15px;
          line-height: 1.6;
          color: var(--muted);
        }

        @media (max-width: 768px) {
          .dcta-section { padding: 52px 24px 80px; }
          .dcta-label-row { margin-bottom: 52px; }
          .dcta-close { margin-top: 48px; }
        }
      `}</style>
    </section>
  );
}
