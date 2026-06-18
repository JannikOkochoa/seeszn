"use client";

import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/context";

// Deep-parallax editorial spread — images drift inside their frames while
// museum labels and giant ghost indices counter-move.
const IMAGES = [
  "/seeszn-visible-surface-01.png",
  "/seeszn-mashine-memory-02.png",
  "/seeszn-source-signal-03.png",
];

function ParallaxImage({ src, strength = 10 }: { src: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : [`-${strength}%`, `${strength}%`]
  );

  return (
    <div ref={ref} className="iw-pimg">
      <motion.div className="iw-pimg-inner" style={{ y }}>
        <Image
          src={src}
          alt=""
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 820px) 100vw, 60vw"
        />
      </motion.div>
    </div>
  );
}

function MuseumLabel({
  num,
  caption,
  body,
  on,
}: {
  num: string;
  caption: string;
  body: string;
  on: boolean;
}) {
  return (
    <div className={`iw-label${on ? " iw-label--on" : ""}`}>
      <span className="iw-label-num">{num}</span>
      <span className="iw-label-rule" aria-hidden="true" />
      <span className="iw-label-caption">{caption}</span>
      <p className="iw-label-body">{body}</p>
    </div>
  );
}

export default function OperatingRooms() {
  const t = useTranslations();
  const iw = t.servicesPage.imageWorld;
  const panels = iw.panels;
  const reduced = useReducedMotion();

  const leadRef = useRef<HTMLDivElement>(null);
  const pairARef = useRef(null);
  const pairBRef = useRef(null);
  const leadOn = useInView(leadRef, { once: true, amount: 0.25 });
  const pairAOn = useInView(pairARef, { once: true, amount: 0.3 });
  const pairBOn = useInView(pairBRef, { once: true, amount: 0.3 });

  // Lead image zooms out slightly as it crosses the viewport
  const { scrollYProgress: leadProgress } = useScroll({
    target: leadRef,
    offset: ["start end", "end start"],
  });
  const leadScale = useTransform(leadProgress, [0, 1], reduced ? [1, 1] : [1.16, 1]);

  return (
    <section className="iw-section" aria-label="The surface world">
      {/* Section chip */}
      <div className="iw-head">
        <span className="iw-chip">03</span>
        <span className="iw-chip">{iw.sectionLabel}</span>
      </div>

      {/* Panoramic lead — scale-out parallax + overlaid label */}
      <div ref={leadRef} className="iw-lead">
        <motion.div className="iw-lead-img" style={{ scale: leadScale }}>
          <Image
            src={IMAGES[0]}
            alt=""
            fill
            style={{ objectFit: "cover" }}
            sizes="100vw"
          />
        </motion.div>
        <span className="iw-lead-scan" aria-hidden="true" />
        <div className="iw-lead-label">
          <MuseumLabel {...panels[0]} on={leadOn} />
        </div>
      </div>

      {/* Pair A — image left, ghost index + label right */}
      <div ref={pairARef} className="iw-pair">
        <div className="iw-pair-img">
          <ParallaxImage src={IMAGES[1]} />
        </div>
        <div className="iw-pair-text">
          <span className="iw-ghost-num" aria-hidden="true">{panels[1].num}</span>
          <MuseumLabel {...panels[1]} on={pairAOn} />
        </div>
      </div>

      {/* Pair B — flipped */}
      <div ref={pairBRef} className="iw-pair iw-pair--flip">
        <div className="iw-pair-text">
          <span className="iw-ghost-num" aria-hidden="true">{panels[2].num}</span>
          <MuseumLabel {...panels[2]} on={pairBOn} />
        </div>
        <div className="iw-pair-img">
          <ParallaxImage src={IMAGES[2]} strength={14} />
        </div>
      </div>

      <style>{`
        .iw-section {
          background: var(--paper);
          border-bottom: 1px solid var(--warm-black);
        }
        .iw-head {
          display: flex;
          gap: 16px;
          padding: 44px 64px 36px;
        }
        .iw-chip {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ── Parallax image frame ──────────────────────── */
        .iw-pimg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .iw-pimg-inner {
          position: absolute;
          inset: -14% 0;
          will-change: transform;
        }

        /* ── Panoramic lead ────────────────────────────── */
        .iw-lead {
          position: relative;
          height: 64vw;
          min-height: 420px;
          max-height: 760px;
          overflow: hidden;
          border-top: 1px solid var(--warm-black);
        }
        .iw-lead-img {
          position: absolute;
          inset: 0;
          will-change: transform;
        }
        .iw-lead-scan {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: var(--olive);
          opacity: 0;
          z-index: 2;
          animation: iw-scan 9s cubic-bezier(.16,1,.3,1) 1s infinite;
          pointer-events: none;
        }
        @keyframes iw-scan {
          0%   { top: 0%; opacity: 0; }
          5%   { opacity: 0.45; }
          40%  { opacity: 0.1; }
          50%  { top: 100%; opacity: 0; }
          100% { top: 100%; opacity: 0; }
        }
        .iw-lead-label {
          position: absolute;
          left: 64px;
          bottom: 48px;
          z-index: 3;
          background: var(--paper);
          border: 1px solid var(--warm-black);
          padding: 22px 28px;
          max-width: 320px;
        }

        /* ── Asymmetric pairs ──────────────────────────── */
        .iw-pair {
          display: grid;
          grid-template-columns: 60% 40%;
          border-top: 1px solid var(--warm-black);
          min-height: 480px;
        }
        .iw-pair--flip { grid-template-columns: 40% 60%; }
        .iw-pair-img {
          position: relative;
          overflow: hidden;
          min-height: 480px;
        }
        .iw-pair .iw-pair-img { border-right: 1px solid var(--warm-black); }
        .iw-pair--flip .iw-pair-img { border-right: none; border-left: 1px solid var(--warm-black); }
        .iw-pair-text {
          position: relative;
          display: flex;
          align-items: center;
          padding: 64px;
          overflow: hidden;
        }
        .iw-ghost-num {
          position: absolute;
          right: -8px;
          top: -28px;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(160px, 16vw, 280px);
          line-height: 1;
          letter-spacing: -0.04em;
          color: transparent;
          -webkit-text-stroke: 1px color-mix(in srgb, var(--warm-black) 14%, transparent);
          pointer-events: none;
          user-select: none;
        }
        .iw-pair--flip .iw-ghost-num { right: auto; left: -8px; }

        /* ── Museum label ──────────────────────────────── */
        .iw-label {
          position: relative;
          opacity: 0;
          transform: translateY(14px);
          transition:
            opacity 800ms ease 500ms,
            transform 800ms cubic-bezier(.16,1,.3,1) 500ms;
        }
        .iw-label--on { opacity: 1; transform: none; }
        .iw-label-num {
          display: block;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--dust);
          margin-bottom: 12px;
        }
        .iw-label-rule {
          display: block;
          width: 24px;
          height: 1px;
          background: var(--olive);
          margin-bottom: 14px;
        }
        .iw-label-caption {
          display: block;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--warm-black);
          margin-bottom: 10px;
        }
        .iw-label-body {
          font-family: var(--font-editorial), serif;
          font-style: normal;
          font-size: 17px;
          line-height: 1.55;
          color: var(--text-muted);
          margin: 0;
          max-width: 260px;
        }

        /* ── Reduced motion ────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .iw-lead-scan { animation: none; }
          .iw-label { opacity: 1; transform: none; transition: none; }
        }

        /* ── Mobile ────────────────────────────────────── */
        @media (max-width: 820px) {
          .iw-head { padding: 36px 24px 28px; }
          .iw-lead {
            height: 80vw;
            min-height: 300px;
            max-height: 480px;
          }
          .iw-lead-label {
            left: 24px;
            right: 24px;
            bottom: 24px;
            max-width: none;
            padding: 18px 20px;
          }
          .iw-pair,
          .iw-pair--flip {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .iw-pair .iw-pair-img,
          .iw-pair--flip .iw-pair-img {
            order: 1;
            border-right: none;
            border-left: none;
            min-height: 68vw;
          }
          .iw-pair-text {
            order: 2;
            padding: 44px 24px 52px;
            border-top: 1px solid var(--line);
          }
          .iw-ghost-num { font-size: 40vw; top: -12px; }
        }
      `}</style>
    </section>
  );
}
