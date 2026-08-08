"use client";

import { useEffect, useRef } from "react";
import type { CaseContent } from "@/lib/case-studies/types";
import { publicOnly } from "@/lib/case-studies/gate";

// ─── 08 / Technische Belege ──────────────────────────────────────────────────
// MAGIC MOMENT 5 — editoriale Datenvisualisierung, kein Dashboard.
//
// Jeder Befund erklärt sich beim Eintritt selbst:
//   Heading   — H1 und H3 stehen untereinander, dazwischen bleibt die Lücke
//               sichtbar leer, in der die H2 fehlt.
//   Duplicate — dieselbe Zeile erscheint, dann versetzt ein zweites Mal.
//   Weight    — die Balken der drei Dokumentgrössen laufen gegeneinander ein.
//   Crawl     — die beiden robots-Regeln als ruhiger Code-Ausschnitt.
//
// Alle Zahlen und Codezeilen sind echter DOM-Text. Berichtet wird ausschliesslich
// der Befund — nirgends steht, dass etwas bereits behoben sei.

export default function TechnicalProof({ content }: { content: CaseContent }) {
  const c = content.proof;
  const SOURCES = content.sources;
  const MAX_KB = Math.max(...c.weights.map((d) => d.kb));
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-proof]"));
    if (!cards.length) return;
    const pending = new Set(cards);
    el.setAttribute("data-armed", "true");

    const show = (n: HTMLElement) => {
      n.setAttribute("data-in", "true");
      pending.delete(n);
      io.unobserve(n);
      if (!pending.size) teardown();
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) show(e.target as HTMLElement);
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.2 },
    );
    pending.forEach((n) => io.observe(n));

    let frame = 0;
    const sweep = () => {
      frame = 0;
      for (const n of Array.from(pending)) {
        if (n.getBoundingClientRect().bottom < 0) show(n);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };
    function teardown() {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return teardown;
  }, []);

  const proofs = publicOnly(c.proofs);
  if (!proofs.length) return null;

  return (
    <section className="tc-sec" id="belege" aria-labelledby="proof-h">
      <div className="tc-rail">
        <p className="tc-label">
          <span>08</span>
          <span>{c.label}</span>
        </p>
        <h2 className="tc-h2-serif" id="proof-h">
          {c.headline}
        </h2>
        <p className="tc-rail-note">{c.railNote}</p>
      </div>

      <div className="tc-body" ref={root}>
        <div className="csp-grid">
          {proofs.map((p) => (
            <article className="csp-card" key={p.id} data-proof data-kind={p.kind}>
              <header className="csp-head">
                <h3 className="csp-title">{p.label}</h3>
                <p className="tc-meta csp-date">{p.date}</p>
              </header>

              {/* ── Die erklärende Visualisierung je Befundtyp ── */}
              {p.kind === "heading" && (
                <div className="csp-viz csp-viz-heading" aria-hidden="true">
                  <span className="csp-tag">h1</span>
                  <span className="csp-gap">
                    <span className="csp-gap-label">{c.gapLabel}</span>
                  </span>
                  <span className="csp-tag">h3</span>
                </div>
              )}

              {p.kind === "duplicate" && (
                <div className="csp-viz csp-viz-dup" aria-hidden="true">
                  <span className="csp-dupline csp-dupline-a" />
                  <span className="csp-dupline csp-dupline-b" />
                </div>
              )}

              {p.kind === "weight" && (
                <div className="csp-viz csp-viz-weight" aria-hidden="true">
                  {c.weights.map((d) => (
                    <span className="csp-wbar" key={d.label}>
                      <span
                        className="csp-wbar-fill"
                        style={{ width: `${(d.kb / MAX_KB) * 100}%` }}
                      />
                    </span>
                  ))}
                </div>
              )}

              <dl className="csp-rows">
                {p.rows.map((r) => (
                  <div className="csp-row" key={r.key}>
                    <dt>{r.key}</dt>
                    <dd className={r.code ? "csp-code" : undefined}>{r.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="csp-note">{p.note}</p>
              <p className="tc-meta csp-src">
                {SOURCES[p.source].code} · {SOURCES[p.source].label}
              </p>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .csp-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          border-top: 1px solid var(--line);
          border-left: 1px solid var(--line);
        }
        .csp-card {
          padding: clamp(20px, 2.2vw, 30px);
          border-right: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          min-width: 0;
        }
        .csp-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--line-soft);
        }
        .csp-title {
          font-family: var(--font-body), sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .csp-date { text-transform: none; letter-spacing: 0.06em; white-space: nowrap; }

        /* ── Visualisierungen ──────────────────────────────── */
        .csp-viz { margin: clamp(18px, 2vw, 26px) 0; }

        .csp-viz-heading {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
        }
        .csp-tag {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          letter-spacing: 0.06em;
          color: var(--ink-strong);
          border: 1px solid var(--line-strong);
          padding: 5px 10px;
        }
        .csp-gap {
          position: relative;
          height: 1px;
          background: repeating-linear-gradient(
            90deg, var(--line-strong) 0 4px, transparent 4px 9px
          );
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .csp-gap-label {
          position: absolute;
          top: -8px;
          background: var(--paper);
          padding: 0 8px;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--olive);
          white-space: nowrap;
        }

        .csp-viz-dup { display: grid; gap: 7px; }
        .csp-dupline {
          height: 9px;
          width: 62%;
          background: var(--line-strong);
          opacity: 0.5;
        }
        .csp-dupline-b { background: var(--olive); opacity: 1; }

        .csp-viz-weight { display: grid; gap: 7px; }
        .csp-wbar {
          display: block;
          height: 9px;
          background: var(--line-soft);
        }
        .csp-wbar-fill {
          display: block;
          height: 100%;
          background: var(--line-strong);
          transform-origin: left;
        }
        .csp-wbar:first-child .csp-wbar-fill { background: var(--olive); }

        /* Bewegung erst nach dem Scharfschalten. */
        [data-armed="true"] .csp-viz-heading .csp-tag,
        [data-armed="true"] .csp-viz-heading .csp-gap-label { opacity: 0; }
        [data-armed="true"] [data-proof][data-in="true"] .csp-viz-heading .csp-tag {
          opacity: 1;
          transition: opacity 520ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-armed="true"] [data-proof][data-in="true"] .csp-viz-heading .csp-tag:last-of-type {
          transition-delay: 260ms;
        }
        [data-armed="true"] [data-proof][data-in="true"] .csp-viz-heading .csp-gap-label {
          opacity: 1;
          transition: opacity 620ms cubic-bezier(0.16, 1, 0.3, 1) 620ms;
        }

        [data-armed="true"] .csp-dupline { transform: scaleX(0); transform-origin: left; }
        [data-armed="true"] [data-proof][data-in="true"] .csp-dupline {
          transform: scaleX(1);
          transition: transform 620ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-armed="true"] [data-proof][data-in="true"] .csp-dupline-b { transition-delay: 480ms; }

        [data-armed="true"] .csp-wbar-fill { transform: scaleX(0); }
        [data-armed="true"] [data-proof][data-in="true"] .csp-wbar-fill {
          transform: scaleX(1);
          transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-armed="true"] [data-proof][data-in="true"] .csp-wbar:nth-child(2) .csp-wbar-fill { transition-delay: 140ms; }
        [data-armed="true"] [data-proof][data-in="true"] .csp-wbar:nth-child(3) .csp-wbar-fill { transition-delay: 260ms; }

        /* ── Zeilen ────────────────────────────────────────── */
        .csp-rows { display: grid; gap: 8px; margin-top: clamp(16px, 1.8vw, 22px); }
        .csp-row { display: grid; gap: 3px; min-width: 0; }
        .csp-row dt {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-faint);
        }
        .csp-row dd {
          font-family: var(--font-body), sans-serif;
          font-size: 11.5px;
          line-height: 1.5;
          color: var(--text-body);
          overflow-wrap: anywhere;
        }
        .csp-code {
          font-family: var(--font-mono), monospace !important;
          font-size: 10.5px !important;
          color: var(--ink-strong) !important;
        }

        .csp-note {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid var(--line-soft);
          font-family: var(--font-body), sans-serif;
          font-size: 11.5px;
          line-height: 1.65;
          color: var(--text-secondary);
        }
        .csp-src { margin-top: 10px; text-transform: none; letter-spacing: 0.05em; }

        @media (max-width: 780px) {
          .csp-grid { grid-template-columns: minmax(0, 1fr); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-armed="true"] .csp-viz-heading .csp-tag,
          [data-armed="true"] .csp-viz-heading .csp-gap-label { opacity: 1 !important; }
          [data-armed="true"] .csp-dupline,
          [data-armed="true"] .csp-wbar-fill { transform: scaleX(1) !important; }
        }
      `}</style>
    </section>
  );
}
