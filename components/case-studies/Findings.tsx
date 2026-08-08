"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseContent } from "@/lib/case-studies/types";

// ─── 04 / Was wir gefunden haben ─────────────────────────────────────────────
// MAGIC MOMENT 3 — die editoriale Sequenz.
//
// Desktop: die linke Schiene bleibt stehen (sticky), rechts wandern die vier
// Befunde nacheinander durch. Der Index in der Schiene markiert, welcher Befund
// gerade dran ist. Das ist bewusst kein Pinning der ganzen Section und kein
// Scroll-Hijacking — es ist derselbe Scroll wie überall, nur mit einem
// stehenden Titel. Dadurch gibt es keine Spacer, keine Resize-Probleme und
// nichts, wogegen der Nutzer anscrollen müsste.
//
// Mobile: normale vertikale Section, jeder Befund erscheint einmal beim
// Eintritt. Kein Sticky, kein horizontaler Scroll.

export default function Findings({ content }: { content: CaseContent }) {
  const c = content.findings;
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodes = items.current.filter(Boolean) as HTMLLIElement[];
    if (!nodes.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) root.current?.setAttribute("data-armed", "true");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.setAttribute("data-in", "true");
            const i = nodes.indexOf(el as HTMLLIElement);
            if (i >= 0) setActive(i);
          }
        }
      },
      // Ein schmales Band in der Bildschirmmitte bestimmt, was "dran" ist.
      { rootMargin: "-35% 0px -45% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));

    // Sicherheitsnetz gegen Sprung-Scrolls: alles oberhalb des Viewports gilt
    // als gesehen, damit kein Befund dauerhaft unsichtbar bleibt.
    let frame = 0;
    const sweep = () => {
      frame = 0;
      for (const n of nodes) {
        if (n.getBoundingClientRect().bottom < 0) n.setAttribute("data-in", "true");
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="tc-sec csf" id="befunde" aria-labelledby="findings-h">
      <div className="tc-rail csf-rail">
        <p className="tc-label">
          <span>04</span>
          <span>{c.label}</span>
        </p>
        <h2 className="tc-h2-serif" id="findings-h">
          {c.headline}
        </h2>

        <ol className="csf-index" aria-hidden="true">
          {c.items.map((f, i) => (
            <li key={f.index} data-active={i === active ? "true" : "false"}>
              <span className="csf-index-num">{f.index}</span>
              <span className="csf-index-rule" />
              <span className="csf-index-title">{f.title}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="tc-body" ref={root}>
        <ol className="csf-list">
          {c.items.map((f, i) => (
            <li
              className="csf-item"
              key={f.index}
              ref={(n) => {
                items.current[i] = n;
              }}
            >
              <p className="csf-num">{f.index}</p>
              <h3 className="csf-title">{f.title}</h3>
              <p className="csf-text">{f.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        /* ── Linke Schiene bleibt stehen ────────────────────── */
        @media (min-width: 901px) {
          .csf { align-items: start; }
          .csf-rail {
            position: sticky;
            top: 108px;
            align-self: start;
          }
        }
        .csf-index {
          list-style: none;
          margin-top: clamp(26px, 2.8vw, 40px);
          display: grid;
          gap: 2px;
        }
        .csf-index li {
          display: grid;
          grid-template-columns: 22px 18px minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          padding: 6px 0;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--text-faint);
          transition: color 400ms ease;
        }
        .csf-index li[data-active="true"] { color: var(--ink-strong); }
        .csf-index-rule {
          height: 1px;
          background: var(--line-strong);
          transform: scaleX(0.4);
          transform-origin: left;
          transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1), background 400ms ease;
        }
        .csf-index li[data-active="true"] .csf-index-rule {
          transform: scaleX(1);
          background: var(--olive);
        }
        .csf-index-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* ── Rechte Sequenz ─────────────────────────────────── */
        .csf-list { list-style: none; }
        .csf-item {
          padding: clamp(26px, 3vw, 44px) 0;
          border-top: 1px solid var(--line);
          max-width: 64ch;
        }
        .csf-item:first-child { padding-top: 0; border-top: 0; }
        .csf-item:last-child { padding-bottom: 0; }

        .csf-num {
          font-family: var(--font-mono), monospace;
          font-size: 9.5px;
          letter-spacing: 0.16em;
          color: var(--text-faint);
        }
        .csf-title {
          margin-top: clamp(10px, 1.1vw, 16px);
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(21px, 2.1vw, 31px);
          line-height: 1.05;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .csf-text {
          margin-top: clamp(12px, 1.3vw, 18px);
          font-family: var(--font-body), sans-serif;
          font-size: clamp(13.5px, 1.05vw, 15px);
          line-height: 1.75;
          color: var(--text-body);
        }

        /* Reveal — versteckt wird erst nach dem Scharfschalten. */
        [data-armed="true"] .csf-item > * {
          opacity: 0;
          transform: translateY(12px);
        }
        [data-armed="true"] .csf-item[data-in="true"] > * {
          opacity: 1;
          transform: none;
          transition: opacity 640ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 640ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-armed="true"] .csf-item[data-in="true"] > .csf-title { transition-delay: 90ms; }
        [data-armed="true"] .csf-item[data-in="true"] > .csf-text { transition-delay: 170ms; }

        /* ── Desktop: mehr Luft, damit es eine Sequenz wird ─── */
        @media (min-width: 901px) {
          .csf-item { min-height: 46vh; display: flex; flex-direction: column; justify-content: center; }
        }
        @media (max-width: 900px) {
          .csf-index { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .csf-index-rule { transition: none; }
          [data-armed="true"] .csf-item > * {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
