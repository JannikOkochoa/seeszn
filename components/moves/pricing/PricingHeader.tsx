"use client";

// ─── PREISE: der reduzierte Kopf ──────────────────────────────────────────────
// Wer auf PREISE klickt, hat sich entschieden, über Geld nachzudenken. Ab hier
// ist jede weitere Rubrik im Kopf eine Einladung, das wieder zu lassen. Der Kopf
// trägt deshalb nur noch, was zur Entscheidung gehört: Marke, Ort, Sprache und
// den Schalter für die Darstellung.
//
// Das ist eine Reduktion, keine Falle. Ausdrücklich erhalten bleiben:
//
//   - die Wortmarke führt zur Startseite
//   - der Zurück-Knopf des Browsers funktioniert unverändert
//   - jedes Bedienelement ist über die Tastatur erreichbar
//   - der Footer trägt weiterhin die vollständige Navigation
//
// Es gibt bewusst kein Hamburger-Menü mit den entfernten Rubriken: ein Menü,
// das die gerade entfernten Links wieder anbietet, hebt die Reduktion auf.

import Link from "next/link";
import LanguageSwitch from "@/components/LanguageSwitch";
import SignalAperture from "@/components/SignalAperture";
import ScrollProgress from "@/components/ScrollProgress";

export default function PricingHeader({
  locale = "de",
  /** Der Ort, an dem der Besucher steht. */
  context = "PREISE",
  homeLabel = "SEESZN, zur Startseite",
}: {
  locale?: "de" | "en";
  context?: string;
  homeLabel?: string;
}) {
  return (
    <>
      <ScrollProgress />
      <div className="pk-shell">
        <header className="pk-bar">
          <Link href={locale === "en" ? "/en" : "/"} className="pk-mark" aria-label={homeLabel}>
            SEESZN
          </Link>

          <span className="pk-context">{context}</span>

          <div className="pk-tools">
            <LanguageSwitch />
            <SignalAperture />
          </div>
        </header>
      </div>

      <style>{`
        .pk-shell { position: fixed; top: 0; left: 0; right: 0; z-index: 100; }
        .pk-bar {
          height: 72px;
          background: var(--paper);
          border-bottom: 1px solid var(--border-nav);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 20px;
          padding: 0 var(--gutter);
        }
        .pk-mark {
          justify-self: start;
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(22px, 1.9vw, 30px);
          letter-spacing: -0.08em;
          line-height: 0.85;
          color: var(--warm-black);
          text-decoration: none;
          position: relative;
          padding-bottom: 6px;
        }
        /* Dieselbe Signallinie wie im großen Kopf, hier als Hinweis darauf, dass
           die Wortmarke der Weg zurück ist. */
        .pk-mark::after {
          content: "";
          position: absolute; left: 0; bottom: 0;
          width: 40px; height: 2px; background: var(--accent);
          transform: scaleX(1); transform-origin: left;
          transition: width 420ms cubic-bezier(.16,1,.3,1);
        }
        .pk-mark:hover::after { width: 100%; }
        .pk-mark:focus-visible { outline: 2px solid var(--ink-strong); outline-offset: 4px; }

        .pk-context {
          justify-self: center;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .pk-tools { justify-self: end; display: flex; align-items: center; gap: 12px; }

        /* Auf dem Telefon rückt der Ort unter die Wortmarke, statt sich in einer
           Zeile mit Marke und Werkzeugen zu drängeln. */
        @media (max-width: 640px) {
          .pk-bar {
            height: auto;
            grid-template-columns: 1fr auto;
            grid-template-areas: "mark tools" "context context";
            gap: 2px 16px;
            padding-block: 12px 10px;
          }
          .pk-mark { grid-area: mark; }
          .pk-tools { grid-area: tools; }
          .pk-context { grid-area: context; justify-self: start; letter-spacing: 0.18em; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pk-mark::after { transition: none; }
        }
      `}</style>
    </>
  );
}
