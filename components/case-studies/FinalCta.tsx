"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CaseContent } from "@/lib/case-studies/types";

// ─── 11 / CTA ────────────────────────────────────────────────────────────────
// MAGIC MOMENT 6 — der Abspann.
//
// Die Frage wird zeilenweise maskiert aufgedeckt, der Button folgt verzögert,
// im Hintergrund greift eine feine Achse die Ranking-Linie aus dem Ergebnis
// wieder auf und schliesst die Geschichte visuell.
//
// Der CTA führt in den bestehenden Diagnosis-Flow. Es gibt noch keine Product
// Page, also wird auch keine verlinkt.

export default function FinalCta({ content }: { content: CaseContent }) {
  const c = content.cta;
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.setAttribute("data-armed", "true");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.setAttribute("data-in", "true");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.15 },
    );
    io.observe(el);

    // Sprung-Scroll-Netz: nichts darf dauerhaft unsichtbar bleiben.
    let frame = 0;
    const sweep = () => {
      frame = 0;
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.setAttribute("data-in", "true");
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
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

  const words = c.headline.split(" ");
  const mid = Math.ceil(words.length / 2);
  const lines = [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];

  return (
    <section className="csc" id="sichtbarkeit" ref={root} aria-labelledby="cta-h">
      <div className="csc-text">
        <p className="tc-label">
          <span>11</span>
          <span>{c.label}</span>
        </p>

        <h2 className="csc-h2" id="cta-h">
          {lines.map((l, i) => (
            <span className="csc-line" key={i}>
              <span className="csc-line-inner">{i > 0 ? " " : ""}{l}</span>
            </span>
          ))}
        </h2>

        <p className="csc-copy">{c.copy}</p>

        <p className="csc-action">
          <Link href={c.primary.href} className="csc-btn">
            {c.primary.label}
            <span className="csc-btn-arrow" aria-hidden="true">→</span>
          </Link>
        </p>

        <p className="csc-systems">{c.systems}</p>

        <nav className="csc-related" aria-label={c.relatedLabel}>
          {c.related.map((l) => (
            <Link key={l.href} href={l.href} className="csc-related-link">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="csc-media">
        <Image
          src={c.image.src}
          alt={c.image.alt}
          width={c.image.width}
          height={c.image.height}
          sizes="(max-width: 900px) 100vw, 62vw"
          loading="lazy"
          className="csc-img"
        />
        <span className="csc-axis" aria-hidden="true">
          <span className="csc-axis-line" />
        </span>
      </div>

      <style>{`
        .csc {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 40fr) minmax(0, 60fr);
          border-bottom: 1px solid var(--line);
          scroll-margin-top: 108px;
        }
        .csc-text {
          position: relative;
          z-index: 2;
          padding: clamp(48px, 5.4vw, 84px) clamp(24px, 3vw, 48px)
                   clamp(48px, 5.4vw, 84px) var(--gutter);
          display: grid;
          align-content: center;
          min-width: 0;
        }

        .csc-h2 {
          margin-top: clamp(18px, 2vw, 28px);
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(30px, 3.5vw, 54px);
          line-height: 1.08;
          letter-spacing: -0.025em;
          color: var(--ink-strong);
        }
        /* Zeilenweise Maske — Basiszustand ist sichtbar. */
        .csc-line { display: block; overflow: hidden; }
        .csc-line-inner { display: block; }
        .csc[data-armed="true"]:not([data-in="true"]) .csc-line-inner {
          transform: translateY(105%);
        }
        .csc[data-in="true"] .csc-line-inner {
          transform: translateY(0);
          transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .csc[data-in="true"] .csc-line:nth-child(2) .csc-line-inner { transition-delay: 110ms; }

        .csc-copy {
          margin-top: clamp(16px, 1.8vw, 24px);
          max-width: 46ch;
          font-family: var(--font-body), sans-serif;
          font-size: clamp(13.5px, 1.05vw, 15px);
          line-height: 1.72;
          color: var(--text-body);
        }

        .csc-action { margin-top: clamp(24px, 2.6vw, 36px); }
        .csc-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          padding: 13px 26px;
          border: 1px solid var(--border-btn);
          background: transparent;
          font-family: var(--font-body), sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          color: var(--text-primary);
          transition: background 300ms ease, border-color 300ms ease;
        }
        .csc-btn:hover {
          background: var(--button-hover-bg);
          border-color: var(--border-btn-hovered);
        }
        .csc-btn-arrow {
          color: var(--olive);
          transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .csc-btn:hover .csc-btn-arrow { transform: translateX(5px); }

        .csc-systems {
          margin-top: clamp(14px, 1.5vw, 20px);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .csc-related {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 20px;
          margin-top: clamp(28px, 3vw, 42px);
          padding-top: 14px;
          border-top: 1px solid var(--line);
        }
        .csc-related-link {
          font-family: var(--font-body), sans-serif;
          font-size: 11.5px;
          line-height: 1.6;
          color: var(--text-secondary);
          border-bottom: 1px solid transparent;
          transition: color 240ms ease, border-color 240ms ease;
        }
        .csc-related-link:hover {
          color: var(--ink-strong);
          border-bottom-color: var(--olive);
        }

        /* ── Bild + Abschluss-Achse ─────────────────────────── */
        .csc-media {
          position: relative;
          min-width: 0;
          min-height: clamp(260px, 28vw, 420px);
        }
        .csc-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 62% 50%;
          display: block;
        }
        .csc-media::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 42%;
          background: linear-gradient(90deg, var(--paper) 0%, rgba(235, 229, 216, 0) 100%);
          z-index: 1;
          pointer-events: none;
        }
        [data-theme="dark"] .csc-media::before {
          background: linear-gradient(90deg, var(--paper) 0%, rgba(15, 16, 13, 0) 100%);
        }
        /* Greift die Ranking-Achse aus dem Ergebnis wieder auf. */
        .csc-axis {
          position: absolute;
          left: 46%;
          top: 22%;
          bottom: 22%;
          width: 1px;
          background: rgba(255, 255, 255, 0.18);
          z-index: 1;
          pointer-events: none;
        }
        .csc-axis-line {
          position: absolute;
          inset: 0;
          background: var(--olive);
          transform: scaleY(1);
          transform-origin: bottom;
        }
        .csc[data-armed="true"]:not([data-in="true"]) .csc-axis-line { transform: scaleY(0); }
        .csc[data-in="true"] .csc-axis-line {
          transform: scaleY(1);
          transition: transform 1200ms cubic-bezier(0.16, 1, 0.3, 1) 320ms;
        }

        @media (max-width: 900px) {
          .csc { grid-template-columns: minmax(0, 1fr); }
          .csc-media { order: -1; aspect-ratio: 16 / 9; min-height: 0; }
          .csc-media::before {
            inset: auto 0 0 0;
            width: auto;
            height: 32%;
            background: linear-gradient(180deg, rgba(235, 229, 216, 0) 0%, var(--paper) 100%);
          }
          [data-theme="dark"] .csc-media::before {
            background: linear-gradient(180deg, rgba(15, 16, 13, 0) 0%, var(--paper) 100%);
          }
          .csc-text { padding: clamp(36px, 9vw, 56px) var(--gutter); }
        }

        @media (prefers-reduced-motion: reduce) {
          .csc-line-inner { transform: none !important; transition: none !important; }
          .csc-axis-line { transform: scaleY(1) !important; transition: none !important; }
          .csc-btn-arrow { transition: none; }
        }
      `}</style>
    </section>
  );
}
