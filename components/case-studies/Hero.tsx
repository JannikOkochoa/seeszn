"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CaseContent } from "@/lib/case-studies/types";

// ─── 01 / Hero ───────────────────────────────────────────────────────────────
// MAGIC MOMENT 1 — die Zahl der Case Study.
//
// Beide Werte stehen von Anfang an im DOM und im Layout: die H1 ist ein
// vollständiger, korrekter Satz, der sich nie verändert, und es gibt keinen
// Layout-Shift. Bewegt wird nur die Aufmerksamkeit — beim ersten Scroll zieht
// eine feine Achse von 5,3 nach 2,2, der Zielwert wird demaskiert, der
// Ausgangswert tritt zurück, danach erscheint "In 45 Tagen."
//
// Kein Counter, kein Scroll-Pinning, kein Scroll-Hijacking: der Auslöser ist
// ein einziger Schwellwert, den der Nutzer nach wenigen Pixeln überschreitet.
// Ohne JavaScript und bei prefers-reduced-motion ist der Endzustand sofort da.

// Läuft synchron beim Parsen, also vor dem ersten Paint des Heros — dieselbe
// Technik wie das Theme-Script im Root-Layout. Erst dieses Skript versteckt den
// Zielwert (`data-armed`), und es bringt seinen eigenen Fallback-Timer mit.
// Damit ist der Endzustand garantiert, auch wenn React nie hydriert: ohne
// JavaScript wird nie etwas versteckt, mit JavaScript spätestens nach 4s
// aufgedeckt.
const ARM_SCRIPT = `(function(){try{
var el=document.getElementById('cs-hero');
if(!el)return;
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
if(window.scrollY>40)return;
el.setAttribute('data-armed','true');
setTimeout(function(){el.setAttribute('data-advanced','true');},4000);
}catch(e){}})();`;

export default function Hero({ content }: { content: CaseContent }) {
  const c = content.hero;
  const from = content.result.from.value;
  const to = content.result.to.value;
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // Nicht scharfgeschaltet heisst: reduzierte Bewegung, kein JavaScript beim
    // Parsen oder bereits weiter unten gestartet. Dann ist der Endzustand schon da.
    if (el.getAttribute("data-armed") !== "true") return;

    // Der Zustand hängt an einem Attribut, nicht an React-State: die CSS-Regeln
    // lesen ohnehin nur das Attribut, und so entstehen keine Folge-Renders.
    const advance = () => el.setAttribute("data-advanced", "true");

    if (window.scrollY > 40) {
      advance();
      return;
    }

    let frame = 0;
    const check = () => {
      frame = 0;
      if (window.scrollY > 40) {
        advance();
        cleanup();
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return cleanup;
  }, []);

  return (
    <header
      className="csh"
      id="cs-hero"
      ref={root}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: ARM_SCRIPT }} />
      <div className="csh-text">
        <p className="csh-eyebrow">{c.eyebrow}</p>

        <h1 className="csh-h1">
          <span className="csh-lead">{c.h1Lead}</span>{" "}

          <span className="csh-pair">
            <span className="csh-num csh-num-from">{from}</span>
            <span className="tc-sr">{c.h1Join}</span>
            <span className="csh-axis" aria-hidden="true">
              <span className="csh-axis-line" />
            </span>
            <span className="csh-num csh-num-to">{to}</span>
          </span>{" "}

          <span className="csh-tail">{c.h1Tail}</span>
        </h1>

        <p className="csh-days">{c.days}</p>

        <p className="csh-supporting">{c.supporting}</p>

        <p className="csh-systems">{c.systems}</p>

        <dl className="csh-meta">
          {c.meta.map((m) => (
            <div key={m.key} className="csh-meta-row">
              <dt>{m.key}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>

        <p className="csh-scroll">
          <a href={c.scrollLink.href} className="tc-link">
            {c.scrollLink.label}
            <span className="tc-arrow" aria-hidden="true">↓</span>
          </a>
        </p>
      </div>

      <div className="csh-media">
        <div className="csh-frame">
          <Image
            src={c.image.src}
            alt={c.image.alt}
            width={c.image.width}
            height={c.image.height}
            sizes="(max-width: 900px) 100vw, 54vw"
            priority
            fetchPriority="high"
            className="csh-img"
          />
        </div>
      </div>

      <style>{`
        .csh {
          padding-top: 98px;
          display: grid;
          grid-template-columns: minmax(0, 46fr) minmax(0, 54fr);
          align-items: stretch;
          border-bottom: 1px solid var(--line);
        }

        /* ── Links: Typografie ──────────────────────────────── */
        .csh-text {
          padding: 18px clamp(20px, 2.2vw, 32px) clamp(36px, 4vw, 56px) var(--gutter);
          min-width: 0;
        }
        .csh-eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .csh-h1 { margin-top: clamp(16px, 1.8vw, 26px); }
        .csh-lead {
          display: block;
          font-family: var(--font-body), sans-serif;
          font-size: clamp(11px, 0.86vw, 12.5px);
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        /* Das Zahlenpaar — dominantes visuelles Element des Heros. */
        .csh-pair {
          display: flex;
          align-items: center;
          gap: clamp(12px, 1.4vw, 22px);
          margin-top: clamp(8px, 1vw, 14px);
        }
        .csh-num {
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(56px, 8.2vw, 122px);
          line-height: 0.9;
          letter-spacing: -0.03em;
          color: var(--ink-strong);
          font-variant-numeric: lining-nums tabular-nums;
          transition: color 900ms cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* Ausgangswert tritt zurück, sobald die Geschichte weitergeht. */
        .csh[data-advanced="true"] .csh-num-from {
          color: var(--text-faint);
          opacity: 0.55;
        }
        /* Zielwert wird demaskiert — kein Layout-Shift, nur clip-path. */
        .csh-num-to {
          clip-path: inset(0 0 0 0);
          opacity: 1;
        }
        .csh[data-armed="true"]:not([data-advanced="true"]) .csh-num-to {
          clip-path: inset(0 0 100% 0);
          opacity: 0;
        }
        .csh[data-advanced="true"] .csh-num-to {
          transition: clip-path 900ms cubic-bezier(0.16, 1, 0.3, 1) 260ms,
                      opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 260ms;
        }

        /* Die Ranking-Achse zwischen den beiden Werten. */
        .csh-axis {
          position: relative;
          flex: 1;
          min-width: 34px;
          max-width: 130px;
          height: 1px;
          background: var(--line);
          align-self: center;
        }
        .csh-axis-line {
          position: absolute;
          inset: 0;
          background: var(--olive);
          transform: scaleX(1);
          transform-origin: left;
        }
        .csh[data-armed="true"]:not([data-advanced="true"]) .csh-axis-line {
          transform: scaleX(0);
        }
        .csh[data-advanced="true"] .csh-axis-line {
          transform: scaleX(1);
          transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1) 80ms;
        }

        .csh-tail {
          display: block;
          margin-top: clamp(10px, 1.2vw, 16px);
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(22px, 2.3vw, 34px);
          line-height: 1.12;
          letter-spacing: -0.018em;
          color: var(--ink-strong);
        }

        .csh-days {
          margin-top: clamp(12px, 1.4vw, 20px);
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(24px, 2.5vw, 38px);
          line-height: 1;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: var(--ink-strong);
          opacity: 1;
          transform: none;
        }
        .csh[data-armed="true"]:not([data-advanced="true"]) .csh-days {
          opacity: 0;
          transform: translateY(10px);
        }
        .csh[data-advanced="true"] .csh-days {
          transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 620ms,
                      transform 700ms cubic-bezier(0.16, 1, 0.3, 1) 620ms;
        }

        .csh-supporting {
          margin-top: clamp(20px, 2.2vw, 30px);
          max-width: 46ch;
          font-family: var(--font-body), sans-serif;
          font-size: clamp(13.5px, 1.05vw, 15px);
          line-height: 1.72;
          color: var(--text-body);
        }
        .csh-systems {
          margin-top: clamp(16px, 1.8vw, 24px);
          padding-top: 12px;
          border-top: 1px solid var(--line);
          max-width: 46ch;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          line-height: 1.7;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .csh-meta { margin-top: clamp(16px, 1.8vw, 24px); }
        .csh-meta-row {
          display: grid;
          grid-template-columns: 96px minmax(0, 1fr);
          gap: 16px;
          padding: 4px 0;
          font-family: var(--font-mono), monospace;
          font-size: 9.5px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }
        .csh-meta-row dt { color: var(--text-faint); }
        .csh-meta-row dd { color: var(--text-secondary); }

        .csh-scroll { margin-top: clamp(22px, 2.4vw, 34px); }

        /* ── Rechts: Fotografie ─────────────────────────────── */
        .csh-media {
          position: relative;
          min-width: 0;
          min-height: clamp(300px, 36vw, 560px);
        }
        .csh-frame {
          position: absolute;
          inset: 0;
          overflow: hidden;
          clip-path: inset(0 0 100% 0);
          animation: csh-reveal 1100ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards;
        }
        .csh-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 42%;
          transform: scale(1.03);
          animation: csh-settle 1400ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards;
        }
        @keyframes csh-reveal { to { clip-path: inset(0 0 0 0); } }
        @keyframes csh-settle { to { transform: scale(1); } }

        @media (max-width: 1080px) {
          .csh { grid-template-columns: minmax(0, 50fr) minmax(0, 50fr); }
        }

        /* ── Mobile: Bild führt, Zahlen bleiben gross ───────── */
        @media (max-width: 780px) {
          .csh { grid-template-columns: minmax(0, 1fr); }
          .csh-media { order: -1; aspect-ratio: 3 / 2; min-height: 0; }
          .csh-img { object-position: 50% 46%; }
          .csh-text {
            padding: clamp(24px, 6vw, 34px) var(--gutter) clamp(40px, 10vw, 56px);
          }
          .csh-num { font-size: clamp(48px, 15vw, 82px); }
          .csh-axis { min-width: 24px; }
          .csh-meta-row { grid-template-columns: 84px minmax(0, 1fr); gap: 12px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .csh-frame { animation: none; clip-path: none; }
          .csh-img { animation: none; transform: none; }
          .csh-num, .csh-num-to, .csh-axis-line, .csh-days { transition: none !important; }
        }
      `}</style>
    </header>
  );
}
