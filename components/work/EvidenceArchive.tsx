"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  DepthMap,
  RadialFanout,
  CitationGapSheet,
  CoreSample,
  SourceIndexSheet,
  PathTrace,
} from "./ArtifactPlates";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface Artifact {
  id: string;
  code: string;
  name: string;
  cls: string;
  medium: string;
  statement: string;
  problem: string;
  diagnosis: string;
  output: string;
  Plate: React.ComponentType;
  flip: boolean;
}

const ARTIFACTS: Artifact[] = [
  {
    id: "a-01",
    code: "SZN-AR-01",
    name: "CRAWL MAP",
    cls: "SEARCH ARCHITECTURE",
    medium: "MEDIUM — SITE STRUCTURE · FORMAT — DEPTH RINGS",
    statement: "The shape of a site decides what a machine can know.",
    problem: "Pages exist; the machine cannot reach them in order.",
    diagnosis: "Flat link mass, orphaned depth, no semantic hierarchy.",
    output: "An architecture machines can walk — and rank.",
    Plate: DepthMap,
    flip: false,
  },
  {
    id: "a-02",
    code: "SZN-AR-02",
    name: "QUERY FAN-OUT MAP",
    cls: "MACHINE CITATION",
    medium: "MEDIUM — SEARCH BEHAVIOUR · FORMAT — RADIAL FAN",
    statement: "One question becomes thirty searches. Each path has a winner.",
    problem: "AI search decomposes one prompt into hidden sub-queries.",
    diagnosis: "The brand competes on two paths and is absent from the rest.",
    output: "A map of every path — and the surface that wins each one.",
    Plate: RadialFanout,
    flip: true,
  },
  {
    id: "a-03",
    code: "SZN-AR-03",
    name: "CITATION GAP REPORT",
    cls: "MACHINE CITATION",
    medium: "MEDIUM — SOURCE ANALYSIS · FORMAT — GAP TABLE",
    statement: "Mentioned in the category. Absent from the answer.",
    problem: "Models assemble answers from surfaces the brand never built.",
    diagnosis: "Listicles, guides and forums carry the category — citing others.",
    output: "A citation plan per surface, not per keyword.",
    Plate: CitationGapSheet,
    flip: false,
  },
  {
    id: "a-04",
    code: "SZN-AR-04",
    name: "SURFACE CORE SAMPLE",
    cls: "DIGITAL SURFACE",
    medium: "MEDIUM — WEBSITE · FORMAT — CROSS-SECTION",
    statement: "A surface read in cross-section, speed to conversion.",
    problem: "The site looks premium and reads as noise.",
    diagnosis: "Unchunked content, thin entity layer, slow first response.",
    output: "A surface where every layer is legible — to people and parsers.",
    Plate: CoreSample,
    flip: true,
  },
  {
    id: "a-05",
    code: "SZN-AR-05",
    name: "SOURCE SURFACE INDEX",
    cls: "MACHINE CITATION",
    medium: "MEDIUM — ANSWER ECOLOGY · FORMAT — INDEX SHEET",
    statement: "Answers are fed by surfaces. Most brands own none of them.",
    problem: "Content everywhere; sources nowhere.",
    diagnosis: "Nothing in the brand's estate is built to be quoted.",
    output: "An index of the surfaces that feed answers — and which to own.",
    Plate: SourceIndexSheet,
    flip: false,
  },
  {
    id: "a-06",
    code: "SZN-AR-06",
    name: "CONVERSION PATH TRACE",
    cls: "DIAGNOSTICS",
    medium: "MEDIUM — USER PATH · FORMAT — STATION TRACE",
    statement: "From citation to customer, traced step by step.",
    problem: "Cited, clicked — then lost.",
    diagnosis: "The path from answer to action breaks at the landing surface.",
    output: "A conversion path with evidence at every step.",
    Plate: PathTrace,
    flip: true,
  },
];

function ArtifactBlock({ artifact }: { artifact: Artifact }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const { Plate } = artifact;

  return (
    <article
      ref={ref}
      id={artifact.id}
      className={`arti${artifact.flip ? " arti--flip" : ""}${inView ? " arti--on" : ""}`}
    >
      <div className="arti-grid">
        <div className="arti-text">
          <header className="ar-reveal" style={{ "--d": "0ms" } as React.CSSProperties}>
            <div className="arti-top">
              <span className="arti-code">{artifact.code}</span>
              <span className="arti-cls">
                {artifact.cls}
                <span className="arti-scan" aria-hidden="true" />
              </span>
            </div>
            <h3 className="arti-name">{artifact.name}</h3>
            <p className="arti-medium">{artifact.medium}</p>
          </header>

          <p className="arti-statement ar-reveal" style={{ "--d": "90ms" } as React.CSSProperties}>
            {artifact.statement}
          </p>

          <dl className="arti-pdo ar-reveal" style={{ "--d": "180ms" } as React.CSSProperties}>
            <div className="arti-pdo-row">
              <dt>PROBLEM</dt>
              <dd>{artifact.problem}</dd>
            </div>
            <div className="arti-pdo-row">
              <dt>DIAGNOSIS</dt>
              <dd>{artifact.diagnosis}</dd>
            </div>
            <div className="arti-pdo-row">
              <dt>OUTPUT</dt>
              <dd className="arti-pdo-output">{artifact.output}</dd>
            </div>
          </dl>
        </div>

        <div className="arti-plate">
          <Plate />
        </div>
      </div>
    </article>
  );
}

export default function EvidenceArchive() {
  const closeRef = useRef(null);
  const closeInView = useInView(closeRef, { once: true, amount: 0.3 });

  return (
    <section className="ea-section" aria-label="The artifacts — evidence archive">
      <div className="ea-header">
        <div className="ea-chips">
          <span className="ea-chip">02</span>
          <span className="ea-chip">THE ARTIFACTS</span>
        </div>
        <span className="ea-chip ea-chip--right">CATALOGUED 2026 — ONGOING</span>
      </div>

      {ARTIFACTS.map((a) => (
        <ArtifactBlock key={a.id} artifact={a} />
      ))}

      {/* ── Closing plate — the honest one ── */}
      <motion.div
        ref={closeRef}
        initial={{ opacity: 0, y: 16 }}
        animate={closeInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="ea-confidential"
      >
        <div className="ea-conf-inner">
          <span className="ea-conf-stamp">CLIENT READINGS — PRESENTED IN PERSON</span>
          <h2 className="ea-conf-headline">
            The archive shows instruments,
            <br />
            <em>not trophies.</em>
          </h2>
          <p className="ea-conf-copy">
            SPECIFIC CLIENT EVIDENCE IS CONFIDENTIAL.
            <br />
            IT IS WALKED THROUGH DURING A DIAGNOSIS —
            <br />
            READ AGAINST YOUR OWN SURFACE.
          </p>
          <Link href="/diagnosis" className="ea-conf-cta">
            BOOK A DIAGNOSIS <span style={{ color: "var(--olive)" }}>→</span>
          </Link>
        </div>
      </motion.div>

      <style>{`
        /* ── Section shell ───────────────────────────── */
        .ea-section {
          background: var(--paper);
        }
        .ea-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 44px 64px 36px;
        }
        .ea-chips { display: flex; gap: 16px; align-items: center; }
        .ea-chip {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ── Artifact blocks ─────────────────────────── */
        .arti {
          border-top: 1px solid var(--warm-black);
          scroll-margin-top: 124px;
        }
        .arti-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
        }
        .arti-text { padding: 60px 56px 64px 64px; }
        .arti-plate {
          border-left: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 52px 64px 52px 40px;
        }
        .arti--flip .arti-text { order: 2; padding: 60px 64px 64px 56px; }
        .arti--flip .arti-plate {
          order: 1;
          border-left: none;
          border-right: 1px solid var(--line);
          padding: 52px 40px 52px 64px;
        }

        .arti-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 16px;
        }
        .arti-code {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          color: var(--dust);
        }
        .arti-cls {
          position: relative;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: var(--text-secondary);
          padding-bottom: 6px;
        }
        .arti-scan {
          position: absolute;
          left: 0; bottom: 0;
          width: 100%;
          height: 1px;
          background: var(--signal);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 800ms cubic-bezier(.16,1,.3,1) 240ms;
        }
        .arti--on .arti-scan { transform: scaleX(1); }

        .arti-name {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(24px, 2.4vw, 34px);
          letter-spacing: 0.01em;
          text-transform: uppercase;
          color: var(--warm-black);
          margin-bottom: 6px;
        }
        .arti-medium {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--dust);
        }
        .arti-statement {
          font-family: var(--font-editorial), serif;
          font-style: italic;
          font-size: clamp(22px, 2.3vw, 31px);
          line-height: 1.2;
          color: var(--warm-black);
          max-width: 480px;
          margin: 34px 0 32px;
        }

        /* problem → diagnosis → output */
        .arti-pdo { max-width: 480px; }
        .arti-pdo-row {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 18px;
          padding: 12px 0;
          border-top: 1px solid var(--line);
        }
        .arti-pdo-row dt {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.2em;
          color: var(--dust);
          padding-top: 2px;
        }
        .arti-pdo-row dd {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-body);
        }
        .arti-pdo-output { color: var(--warm-black) !important; }

        /* reveal system */
        .ar-reveal {
          opacity: 0;
          transform: translateY(12px);
          transition:
            opacity 700ms cubic-bezier(.16,1,.3,1) var(--d, 0ms),
            transform 700ms cubic-bezier(.16,1,.3,1) var(--d, 0ms);
        }
        .arti--on .ar-reveal { opacity: 1; transform: none; }

        /* ═══ Plate animations ════════════════════════ */
        .ap-svg {
          display: block;
          width: 100%;
          max-width: 540px;
          height: auto;
          overflow: visible;
        }

        /* — A-01 depth map — */
        .ap1-ring {
          opacity: 0;
          transition: opacity 700ms ease calc(150ms + var(--i, 0) * 150ms);
        }
        .arti--on .ap1-ring { opacity: 1; }
        .ap1-link {
          stroke-dasharray: 130;
          stroke-dashoffset: 130;
          transition: stroke-dashoffset 800ms cubic-bezier(.16,1,.3,1) calc(350ms + var(--i, 0) * 60ms);
        }
        .arti--on .ap1-link { stroke-dashoffset: 0; }
        .ap1-node {
          opacity: 0;
          transition: opacity 400ms ease calc(500ms + var(--i, 0) * 55ms);
        }
        .arti--on .ap1-node { opacity: 1; }
        .ap1-orphan, .ap1-label {
          opacity: 0;
          transition: opacity 600ms ease 1350ms;
        }
        .arti--on .ap1-orphan, .arti--on .ap1-label { opacity: 1; }

        /* — A-02 radial fan-out — */
        .ap2-spoke {
          stroke-dasharray: 145;
          stroke-dashoffset: 145;
          transition: stroke-dashoffset 850ms cubic-bezier(.16,1,.3,1) calc(250ms + var(--i, 0) * 90ms);
        }
        .arti--on .ap2-spoke { stroke-dashoffset: 0; }
        .ap2-end {
          opacity: 0;
          transition: opacity 500ms ease calc(650ms + var(--i, 0) * 90ms);
        }
        .arti--on .ap2-end { opacity: 1; }
        .ap2-q {
          opacity: 0;
          transition: opacity 500ms ease 150ms;
        }
        .arti--on .ap2-q { opacity: 1; }
        .ap2-caption {
          opacity: 0;
          transition: opacity 600ms ease 1400ms;
        }
        .arti--on .ap2-caption { opacity: 1; }

        /* — A-04 core sample — */
        .ap4-stratum {
          opacity: 0;
          transform: translateY(-8px);
          transition:
            opacity 600ms ease calc(250ms + var(--i, 0) * 140ms),
            transform 700ms cubic-bezier(.16,1,.3,1) calc(250ms + var(--i, 0) * 140ms);
        }
        .arti--on .ap4-stratum { opacity: 1; transform: none; }
        .ap4-tick {
          opacity: 0;
          transition: opacity 500ms ease calc(400ms + var(--i, 0) * 140ms);
        }
        .arti--on .ap4-tick { opacity: 1; }
        .ap4-caption {
          opacity: 0;
          transition: opacity 600ms ease 1200ms;
        }
        .arti--on .ap4-caption { opacity: 1; }

        /* — A-06 path trace — */
        .ap6-line {
          stroke-dasharray: 380;
          stroke-dashoffset: 380;
          transition: stroke-dashoffset 1100ms cubic-bezier(.16,1,.3,1) 250ms;
        }
        .arti--on .ap6-line { stroke-dashoffset: 0; }
        .ap6-station {
          opacity: 0;
          transition: opacity 450ms ease calc(450ms + var(--i, 0) * 140ms);
        }
        .arti--on .ap6-station { opacity: 1; }
        .ap6-leak {
          opacity: 0;
          transition: opacity 700ms ease 1300ms;
        }
        .arti--on .ap6-leak { opacity: 1; }
        .ap6-caption {
          opacity: 0;
          transition: opacity 600ms ease 1500ms;
        }
        .arti--on .ap6-caption { opacity: 1; }

        /* — HTML sheets (A-03, A-05) — */
        .apsh {
          width: 100%;
          max-width: 440px;
          border: 1px solid var(--warm-black);
          background: var(--paper);
        }
        .apsh-head {
          display: flex;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--text-secondary);
        }
        .apsh-cols {
          display: flex;
          align-items: baseline;
          gap: 14px;
          padding: 12px 20px 8px;
          font-family: var(--font-mono), monospace;
          font-size: 7.5px;
          letter-spacing: 0.16em;
          color: var(--dust);
        }
        .apsh-col-surface { flex: 1; }
        .apsh-col { width: 72px; text-align: right; }
        .apsh-list { list-style: none; }
        .apsh-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          padding: 12px 20px;
          border-top: 1px solid var(--line);
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity 600ms ease calc(300ms + var(--i, 0) * 120ms),
            transform 600ms cubic-bezier(.16,1,.3,1) calc(300ms + var(--i, 0) * 120ms);
        }
        .arti--on .apsh-row { opacity: 1; transform: none; }
        .apsh-num {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          color: var(--dust);
          flex-shrink: 0;
        }
        .apsh-surface {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          color: var(--ink);
          flex: 1;
        }
        .apsh-mark {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: var(--text-secondary);
          width: 72px;
          text-align: right;
        }
        .apsh-mark--gap { color: var(--olive); letter-spacing: 0.08em; }
        .apsh-role {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.14em;
          color: var(--muted);
        }
        .apsh-foot {
          padding: 14px 20px;
          border-top: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.18em;
          color: var(--olive);
          opacity: 0;
          transition: opacity 700ms ease 1100ms;
        }
        .arti--on .apsh-foot { opacity: 1; }

        /* ── Confidential closing plate ──────────────── */
        .ea-confidential {
          border-top: 1px solid var(--warm-black);
          padding: 96px 64px;
        }
        .ea-conf-inner {
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ea-conf-stamp {
          display: inline-block;
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.22em;
          color: var(--text-secondary);
          border: 1px solid rgba(17,16,14,.4);
          padding: 8px 14px;
          margin-bottom: 36px;
        }
        .ea-conf-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(34px, 4.4vw, 56px);
          line-height: 1.08;
          color: var(--warm-black);
          margin: 0 0 26px;
        }
        .ea-conf-headline em { font-style: italic; }
        .ea-conf-copy {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          line-height: 1.8;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 38px;
        }
        .ea-conf-cta {
          display: inline-block;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1px solid var(--warm-black);
          padding: 16px 32px;
          color: var(--warm-black);
          background: transparent;
          transition: background 0.2s, color 0.2s;
        }
        .ea-conf-cta:hover { background: var(--warm-black); color: var(--paper); }
        .ea-conf-cta:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }

        /* ── Reduced motion ──────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .ar-reveal, .apsh-row, .apsh-foot,
          .ap1-ring, .ap1-node, .ap1-orphan, .ap1-label,
          .ap2-end, .ap2-q, .ap2-caption,
          .ap4-stratum, .ap4-tick, .ap4-caption,
          .ap6-station, .ap6-leak, .ap6-caption {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .ap1-link, .ap2-spoke, .ap6-line {
            stroke-dashoffset: 0 !important;
            transition: none !important;
          }
          .arti-scan { transform: scaleX(1) !important; transition: none !important; }
        }

        /* ── Mobile ──────────────────────────────────── */
        @media (max-width: 820px) {
          .ea-header { padding: 36px 24px 28px; }
          .ea-chip--right { display: none; }
          .arti-grid { grid-template-columns: 1fr; }
          .arti-text,
          .arti--flip .arti-text {
            order: 1;
            padding: 40px 24px 8px;
          }
          .arti-plate,
          .arti--flip .arti-plate {
            order: 2;
            border-left: none;
            border-right: none;
            padding: 20px 24px 48px;
          }
          .arti-statement { margin: 26px 0 24px; }
          .arti-pdo-row { grid-template-columns: 84px 1fr; gap: 12px; }
          .ea-confidential { padding: 64px 24px; }
        }
      `}</style>
    </section>
  );
}
