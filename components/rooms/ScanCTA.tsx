"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export interface ScanCTAProps {
  /** local section index of the closing section */
  index: string;
  label?: string;
  /** roman part of the headline */
  roman: string;
  /** italic part of the headline */
  italic: string;
  /** mono supporting lines */
  sub: string[];
  /** optional italic closing sentence under the olive rule */
  closing?: string;
}

export default function ScanCTA({
  index,
  label = "NEXT MOVE",
  roman,
  italic,
  sub,
  closing,
}: ScanCTAProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const t = useTranslations();
  const diagHref = t.locale === "de" ? "/de/diagnosis" : "/diagnosis";

  // Final inhale — headline grows in, ghost word counter-drifts behind
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [0.93, 1]);
  const ghostY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["35%", "-15%"]);

  const ghostWord = italic.replace(/[^\p{L}\s]/gu, "").trim().toUpperCase();

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="scta-section">
      {/* Counter-parallax ghost word */}
      <motion.span className="scta-ghost" style={{ y: ghostY, x: "-50%" }} aria-hidden="true">
        {ghostWord}
      </motion.span>

      <motion.div {...anim(0)} className="scta-label-row">
        <span className="scta-label">{index}</span>
        <span className="scta-label">{label}</span>
      </motion.div>

      <div className="scta-center">
        <motion.h2 {...anim(0.08)} className="scta-headline" style={{ scale }}>
          {roman}
          <br />
          <em>{italic}</em>
        </motion.h2>

        <motion.p {...anim(0.16)} className="scta-copy">
          {sub.map((line, i) => (
            <span key={line}>
              {line}
              {i < sub.length - 1 && <br />}
            </span>
          ))}
        </motion.p>

        <motion.div {...anim(0.24)}>
          <Link href={diagHref} className="scta-cta">
            {t.nav.cta} <span style={{ color: "var(--olive)" }}>→</span>
          </Link>
        </motion.div>

        {closing && (
          <motion.div {...anim(0.34)} className="scta-close">
            <span className="scta-rule" aria-hidden="true" />
            <p className="scta-sentence">{closing}</p>
          </motion.div>
        )}
      </div>

      <style>{`
        .scta-section {
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
          padding: 72px 64px 110px;
          position: relative;
          overflow: hidden;
        }
        .scta-ghost {
          position: absolute;
          left: 50%;
          top: 34%;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(100px, 16vw, 280px);
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
        .scta-label-row, .scta-center { position: relative; z-index: 1; }
        .scta-label-row { display: flex; gap: 16px; margin-bottom: 72px; }
        .scta-label {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .scta-center {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .scta-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(38px, 5vw, 66px);
          line-height: 1.06;
          color: var(--warm-black);
          margin: 0 0 28px;
        }
        .scta-headline em { font-style: italic; }
        .scta-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-body);
          margin-bottom: 40px;
        }
        .scta-cta {
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
        .scta-cta:hover { background: var(--warm-black); border-color: var(--warm-black); color: var(--paper); }
        .scta-cta:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }
        .scta-close {
          margin-top: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }
        .scta-rule { width: 32px; height: 1px; background: var(--olive); display: block; }
        .scta-sentence {
          font-family: var(--font-editorial), serif;
          font-style: italic;
          font-size: 15px;
          line-height: 1.6;
          color: var(--muted);
        }
        @media (max-width: 768px) {
          .scta-section { padding: 52px 24px 80px; }
          .scta-label-row { margin-bottom: 52px; }
          .scta-close { margin-top: 48px; }
        }
      `}</style>
    </section>
  );
}
