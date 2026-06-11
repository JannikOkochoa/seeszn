"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ROOMS } from "@/lib/services";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// CRAWL = SEO, RETRIEVE = AI Search, TRUST = Websites, DIAGNOSE = Audits (fixed English labels)
const MAPPING: Record<string, string> = {
  crawl: "SEO",
  retrieve: "AI SEARCH / GEO / AIO",
  trust: "WEBSITES",
  diagnose: "AUDITS",
};

export default function SystemStatement() {
  const t = useTranslations();
  const sys = t.servicesPage.system;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="sys-section">
      <motion.div {...anim(0)} className="sys-label-row">
        <span className="sys-label">02</span>
        <span className="sys-label">{sys.sectionLabel}</span>
      </motion.div>

      <div className="sys-grid">
        <motion.h2 {...anim(0.08)} className="sys-headline">
          {sys.headline}
          <br />
          <em>{sys.headlineItalic}</em>
        </motion.h2>

        <motion.div {...anim(0.16)} className="sys-copy-col">
          <p className="sys-copy">{sys.copy1}</p>
          <p className="sys-copy sys-copy--dim">{sys.copy2}</p>
        </motion.div>
      </div>

      {/* Room legend — instrument index */}
      <motion.ul {...anim(0.26)} className="sys-legend">
        {ROOMS.map((room) => (
          <li key={room.id}>
            <a href={`#${room.id}`} className="sys-cell">
              <span className="sys-cell-num">{room.index}</span>
              <span className="sys-cell-station">
                {room.station}
                <span className="sys-cell-scan" aria-hidden="true" />
              </span>
              <span className="sys-cell-map">{MAPPING[room.id]}</span>
            </a>
          </li>
        ))}
      </motion.ul>

      <style>{`
        .sys-section {
          background: var(--paper);
          padding: 88px 64px 0;
        }
        .sys-label-row { display: flex; gap: 16px; margin-bottom: 48px; }
        .sys-label {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .sys-grid {
          display: grid;
          grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
          gap: 0 64px;
          align-items: end;
          margin-bottom: 72px;
        }
        .sys-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(38px, 5vw, 68px);
          line-height: 1.06;
          color: var(--warm-black);
          margin: 0;
        }
        .sys-headline em { font-style: italic; }
        .sys-copy-col { display: flex; flex-direction: column; gap: 18px; max-width: 420px; }
        .sys-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-body);
        }
        .sys-copy--dim { color: var(--text-muted); }

        /* ── Legend strip — 01 CRAWL … 04 DIAGNOSE ───── */
        .sys-legend {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0 40px;
          padding-bottom: 64px;
        }
        .sys-cell {
          display: block;
          border-top: 1px solid var(--warm-black);
          padding: 16px 0 8px;
          text-decoration: none;
        }
        .sys-cell-num {
          display: block;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          color: var(--dust);
          margin-bottom: 10px;
        }
        .sys-cell-station {
          position: relative;
          display: inline-block;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 19px;
          letter-spacing: 0.02em;
          color: var(--warm-black);
          padding-bottom: 6px;
          margin-bottom: 8px;
        }
        .sys-cell-scan {
          position: absolute;
          left: 0; bottom: 0;
          width: 100%;
          height: 1px;
          background: var(--signal);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 600ms cubic-bezier(.16,1,.3,1);
        }
        .sys-cell:hover .sys-cell-scan,
        .sys-cell:focus-visible .sys-cell-scan { transform: scaleX(1); }
        .sys-cell:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }
        .sys-cell-map {
          display: block;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--muted);
        }

        @media (prefers-reduced-motion: reduce) {
          .sys-cell-scan { transition: none; }
        }

        @media (max-width: 900px) {
          .sys-section { padding: 60px 24px 0; }
          .sys-label-row { margin-bottom: 32px; }
          .sys-grid {
            grid-template-columns: 1fr;
            gap: 28px 0;
            margin-bottom: 48px;
          }
          .sys-legend {
            grid-template-columns: 1fr 1fr;
            gap: 28px 24px;
            padding-bottom: 52px;
          }
        }
      `}</style>
    </section>
  );
}
