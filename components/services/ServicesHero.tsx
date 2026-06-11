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
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE, delay },
  };
}

export default function ServicesHero() {
  const t = useTranslations();
  const h = t.servicesPage.hero;
  const diagHref = t.locale === "de" ? "/de/diagnosis" : "/diagnosis";
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);

  // ── Scroll parallax — layers drift apart as you leave the hero ──
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "28%"]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.18]);
  const yGhost = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-60%"]);
  const yTitle = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-22%"]);
  const heroFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // ── Mouse parallax — the image breathes toward the cursor ──
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 40, damping: 18 });
  const smy = useSpring(my, { stiffness: 40, damping: 18 });

  const onMouseMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const { innerWidth, innerHeight } = window;
    mx.set((e.clientX / innerWidth - 0.5) * -24);
    my.set((e.clientY / innerHeight - 0.5) * -16);
  };

  return (
    <section ref={sectionRef} className="xh-section" onMouseMove={onMouseMove}>
      {/* ── Layer 0 — full-bleed parallax image ── */}
      <motion.div className="xh-bg" style={{ y: yImage, scale: scaleImage }}>
        <motion.div style={{ x: smx, y: smy }} className="xh-bg-inner">
          <Image
            src="/seeszn-home-main-picture.png"
            alt=""
            fill
            priority
            style={{ objectFit: "cover" }}
            sizes="100vw"
          />
        </motion.div>
      </motion.div>

      {/* ── Layer 1 — paper gradient for legibility ── */}
      <div className="xh-veil" aria-hidden="true" />

      {/* ── Layer 2 — giant ghost word, counter-parallax ── */}
      <motion.span className="xh-ghost" style={{ y: yGhost }} aria-hidden="true">
        {h.roomLabel}
      </motion.span>

      {/* ── Layer 3 — scan grid + sweeping line ── */}
      <div className="xh-grid" aria-hidden="true" />
      <span className="xh-sweep" aria-hidden="true" />

      {/* ── Layer 4 — HUD corner labels ── */}
      <motion.div className="xh-hud" style={{ opacity: heroFade }} aria-hidden="true">
        <span className="xh-hud-tl">SZN-OS / {h.roomLabel}</span>
        <span className="xh-hud-tr">{h.imageCaption}</span>
        <span className="xh-hud-bl">52.5200° N — 13.4050° E</span>
        <span className="xh-hud-br">SURFACE / SIGNAL / MEMORY</span>
      </motion.div>

      {/* ── Layer 5 — content ── */}
      <motion.div className="xh-content" style={{ y: yTitle, opacity: heroFade }}>
        <motion.div {...fadeUp(0.1)} className="xh-label-row">
          <span className="xh-tick" aria-hidden="true" />
          <span className="xh-label">{h.roomLabel}</span>
        </motion.div>

        <h1 className="xh-headline">
          <motion.span {...fadeUp(0.2)} className="xh-hl-roman">{h.roman1}</motion.span>
          <motion.span {...fadeUp(0.32)} className="xh-hl-roman">{h.roman2}</motion.span>
          <motion.span {...fadeUp(0.44)} className="xh-hl-italic">{h.italic}</motion.span>
        </h1>

        <motion.p {...fadeUp(0.58)} className="xh-sub">
          {h.sub1}
          <br />
          <span className="xh-sub-dim">{h.sub2}</span>
        </motion.p>

        <motion.div {...fadeUp(0.7)} className="xh-cta-row">
          <a href={diagHref} className="xh-cta">
            <span className="xh-cta-fill" aria-hidden="true" />
            <span className="xh-cta-text">
              {h.cta} <span className="xh-cta-arrow">→</span>
            </span>
          </a>
          <a href="#system" className="xh-secondary">
            {h.secondary} <span className="xh-secondary-arrow">↓</span>
          </a>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="xh-scroll"
        style={{ opacity: heroFade }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        aria-hidden="true"
      >
        <span className="xh-scroll-line" />
      </motion.div>

      <style>{`
        /* ── Shell ───────────────────────────────────── */
        .xh-section {
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          background: var(--paper);
          border-bottom: 1px solid var(--warm-black);
          display: flex;
          align-items: center;
        }

        /* ── Parallax image ──────────────────────────── */
        .xh-bg {
          position: absolute;
          inset: -6% -3%;
          z-index: 0;
          will-change: transform;
        }
        .xh-bg-inner { position: absolute; inset: 0; }

        /* ── Paper veil ──────────────────────────────── */
        .xh-veil {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            100deg,
            var(--paper) 0%,
            var(--paper) 34%,
            color-mix(in srgb, var(--paper) 62%, transparent) 58%,
            color-mix(in srgb, var(--paper) 14%, transparent) 100%
          );
        }

        /* ── Ghost word ──────────────────────────────── */
        .xh-ghost {
          position: absolute;
          left: -2vw;
          bottom: -4vw;
          z-index: 2;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(140px, 24vw, 400px);
          letter-spacing: -0.05em;
          line-height: 0.8;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 30%, transparent);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          will-change: transform;
        }

        /* ── Scan grid ───────────────────────────────── */
        .xh-grid {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background-image:
            linear-gradient(color-mix(in srgb, var(--warm-black) 5%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--warm-black) 5%, transparent) 1px, transparent 1px);
          background-size: 120px 120px;
          mask-image: radial-gradient(ellipse 90% 90% at 70% 50%, black 0%, transparent 75%);
        }
        .xh-sweep {
          position: absolute;
          top: 0; bottom: 0;
          width: 1px;
          background: var(--olive);
          z-index: 3;
          opacity: 0;
          animation: xh-sweep 7s cubic-bezier(.16,1,.3,1) 2s infinite;
          pointer-events: none;
        }
        @keyframes xh-sweep {
          0%   { left: 0%; opacity: 0; }
          4%   { opacity: 0.5; }
          38%  { opacity: 0.12; }
          46%  { left: 100%; opacity: 0; }
          100% { left: 100%; opacity: 0; }
        }

        /* ── HUD corners ─────────────────────────────── */
        .xh-hud { position: absolute; inset: 0; z-index: 4; pointer-events: none; }
        .xh-hud span {
          position: absolute;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--dust);
        }
        .xh-hud-tl { top: 122px; left: 64px; }
        .xh-hud-tr { top: 122px; right: 64px; }
        .xh-hud-bl { bottom: 40px; left: 64px; }
        .xh-hud-br { bottom: 40px; right: 64px; }

        /* ── Content ─────────────────────────────────── */
        .xh-content {
          position: relative;
          z-index: 5;
          padding: 160px 64px 120px;
          max-width: 1100px;
          will-change: transform;
        }
        .xh-label-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 32px;
        }
        .xh-tick {
          width: 32px;
          height: 2px;
          background: var(--olive);
          display: block;
        }
        .xh-label {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .xh-headline { margin: 0; color: var(--warm-black); }
        .xh-hl-roman {
          display: block;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(52px, 8vw, 124px);
          letter-spacing: -0.03em;
          line-height: 0.92;
          text-transform: uppercase;
        }
        .xh-hl-italic {
          display: block;
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-style: italic;
          font-size: clamp(46px, 7vw, 110px);
          letter-spacing: -0.02em;
          line-height: 1.02;
          margin-top: 6px;
        }

        .xh-sub {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.85;
          letter-spacing: 0.04em;
          color: var(--text-body);
          max-width: 480px;
          margin: 36px 0 0;
        }
        .xh-sub-dim { color: var(--text-muted); font-weight: 400; }

        /* ── CTA — sliding fill ──────────────────────── */
        .xh-cta-row {
          margin-top: 44px;
          display: flex;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
        }
        .xh-cta {
          position: relative;
          display: inline-block;
          border: 1px solid var(--warm-black);
          text-decoration: none;
          overflow: hidden;
          min-height: 44px;
        }
        .xh-cta-fill {
          position: absolute;
          inset: 0;
          background: var(--warm-black);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 480ms cubic-bezier(.16,1,.3,1);
        }
        .xh-cta:hover .xh-cta-fill { transform: scaleY(1); }
        .xh-cta-text {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 30px;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--text-primary);
          transition: color 320ms ease;
        }
        .xh-cta:hover .xh-cta-text { color: var(--paper); }
        .xh-cta:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }
        .xh-cta-arrow { color: var(--olive); }

        .xh-secondary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          padding-bottom: 3px;
          border-bottom: 1px solid var(--line);
          transition: color 0.25s, border-color 0.25s;
        }
        .xh-secondary:hover { color: var(--text-primary); border-color: var(--signal); }
        .xh-secondary-arrow { color: var(--olive); }

        /* ── Scroll indicator ────────────────────────── */
        .xh-scroll {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          height: 64px;
          width: 1px;
          overflow: hidden;
        }
        .xh-scroll-line {
          position: absolute;
          left: 0; top: -100%;
          width: 1px;
          height: 100%;
          background: var(--warm-black);
          animation: xh-drop 2.2s cubic-bezier(.16,1,.3,1) infinite;
        }
        @keyframes xh-drop {
          0%   { top: -100%; }
          55%  { top: 0%; }
          100% { top: 100%; }
        }

        /* ── Reduced motion ──────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .xh-sweep, .xh-scroll-line { animation: none; }
          .xh-cta-fill { transition: none; }
        }

        /* ── Mobile ──────────────────────────────────── */
        @media (max-width: 900px) {
          .xh-content { padding: 150px 24px 110px; }
          .xh-hud-tl, .xh-hud-tr { top: 116px; }
          .xh-hud-tl, .xh-hud-bl { left: 24px; }
          .xh-hud-tr, .xh-hud-br { right: 24px; }
          .xh-hud-tr, .xh-hud-bl { display: none; }
          .xh-ghost { font-size: 38vw; bottom: -6vw; }
          .xh-veil {
            background: linear-gradient(
              165deg,
              var(--paper) 0%,
              var(--paper) 30%,
              color-mix(in srgb, var(--paper) 55%, transparent) 65%,
              color-mix(in srgb, var(--paper) 20%, transparent) 100%
            );
          }
          .xh-cta-row { gap: 22px; }
        }
      `}</style>
    </section>
  );
}
