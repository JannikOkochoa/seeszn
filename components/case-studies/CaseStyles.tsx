// ─── Gemeinsames Case-Study-Chrome ───────────────────────────────────────────
// Unverändert die bestehende SEESZN-Design-Language: schmale linke Schiene mit
// Sektionsnummer und Überschrift, breiter rechter Körper mit dem Inhalt.
// Wird einmal von der Seite ausgegeben, damit die Regeln genau einmal im
// Dokument stehen.

export default function CaseStyles() {
  return (
    <style>{`
      .tc-root {
        --tc-rail: clamp(220px, 24.8vw, 366px);
        --tc-sec-y: clamp(46px, 4.8vw, 70px);
        --tc-pad-x: clamp(24px, 2.9vw, 42px);
        background: var(--paper);
      }

      /* ── Section shell ─────────────────────────────────────── */
      .tc-sec, .tc-root [id] { scroll-margin-top: 108px; }

      .tc-sec {
        display: grid;
        grid-template-columns: var(--tc-rail) minmax(0, 1fr);
        border-bottom: 1px solid var(--line);
      }
      .tc-rail {
        padding: var(--tc-sec-y) var(--tc-pad-x) var(--tc-sec-y) var(--gutter);
        min-width: 0;
      }
      .tc-body {
        padding: var(--tc-sec-y) var(--gutter) var(--tc-sec-y) var(--tc-pad-x);
        border-left: 1px solid var(--line);
        min-width: 0;
      }

      /* ── Rail typography ───────────────────────────────────── */
      .tc-label {
        display: flex;
        gap: 18px;
        font-family: var(--font-mono), monospace;
        font-size: 9.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .tc-h2-serif {
        margin-top: clamp(20px, 2.2vw, 32px);
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(30px, 3vw, 44px);
        line-height: 1.06;
        letter-spacing: -0.02em;
        color: var(--ink-strong);
      }
      .tc-h2-display {
        margin-top: clamp(20px, 2.2vw, 32px);
        font-family: var(--font-display), sans-serif;
        font-weight: 700;
        font-size: clamp(30px, 3.1vw, 46px);
        line-height: 1.0;
        letter-spacing: -0.01em;
        text-transform: uppercase;
        color: var(--ink-strong);
      }
      /* Lange deutsche Komposita passen in der schmalen Schiene sonst nicht
         ganz in ihre Zeile. Nur Deutsch: englische Wörter würden mit deutschen
         Trennregeln an den falschen Stellen brechen. */
      .tc-root:lang(de) .tc-h2-serif { hyphens: auto; }

      .tc-rail-note {
        margin-top: clamp(18px, 1.8vw, 26px);
        max-width: 30ch;
        font-family: var(--font-body), sans-serif;
        font-size: 12.5px;
        line-height: 1.68;
        color: var(--text-secondary);
      }

      /* ── Fliesstext — 55–70 Zeichen je Zeile ───────────────── */
      .tc-copy {
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13.5px, 1.05vw, 15px);
        line-height: 1.75;
        color: var(--text-body);
        max-width: 62ch;
      }
      .tc-copy-lead {
        font-family: var(--font-body), sans-serif;
        font-size: clamp(14px, 1.15vw, 16.5px);
        line-height: 1.7;
        color: var(--text-primary);
        max-width: 58ch;
      }

      /* ── Mono metadata ─────────────────────────────────────── */
      .tc-meta {
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.11em;
        line-height: 1.7;
        text-transform: uppercase;
        color: var(--text-faint);
      }
      .tc-meta-strong { color: var(--text-secondary); }

      /* Visuell versteckt, weiterhin im DOM und im Accessibility-Tree. */
      .tc-sr {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      /* ── Olive marks ───────────────────────────────────────── */
      .tc-dot {
        display: inline-block;
        width: 5px;
        height: 5px;
        background: var(--olive);
        border-radius: 50% !important;
      }

      /* ── Inline link ───────────────────────────────────────── */
      .tc-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-mono), monospace;
        font-size: 9.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--ink-strong);
        border-bottom: 1px solid var(--olive);
        padding-bottom: 3px;
        transition: color 240ms ease;
      }
      .tc-link:hover { color: var(--text-secondary); }
      .tc-link .tc-arrow { color: var(--olive); transition: transform 300ms cubic-bezier(0.16,1,0.3,1); }
      .tc-link:hover .tc-arrow { transform: translateX(4px); }
      .tc-root :focus-visible {
        outline: 1px solid var(--ink-strong);
        outline-offset: 3px;
      }

      /* ── Nummerierte Listenblöcke (04 / 05 / 07 / 10) ──────── */
      .tc-numlist { list-style: none; }
      .tc-numitem {
        display: grid;
        grid-template-columns: clamp(46px, 5vw, 72px) minmax(0, 1fr);
        gap: clamp(14px, 1.8vw, 30px);
        padding: clamp(20px, 2.2vw, 32px) 0;
        border-top: 1px solid var(--line);
      }
      .tc-numitem:first-child { padding-top: 0; border-top: 0; }
      .tc-numitem:last-child { padding-bottom: 0; }
      .tc-numindex {
        font-family: var(--font-mono), monospace;
        font-size: 9.5px;
        letter-spacing: 0.16em;
        color: var(--text-faint);
        padding-top: 5px;
      }
      .tc-numtitle {
        font-family: var(--font-body), sans-serif;
        font-size: clamp(12px, 0.95vw, 13px);
        font-weight: 600;
        letter-spacing: 0.11em;
        text-transform: uppercase;
        line-height: 1.4;
        color: var(--ink-strong);
      }
      .tc-numtext {
        margin-top: 10px;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13px, 1.02vw, 14.5px);
        line-height: 1.72;
        color: var(--text-body);
        max-width: 60ch;
      }

      /* ── Scroll-Reveal — Basiszustand ist SICHTBAR ─────────────
         Erst wenn JS den Beobachter scharf schaltet (data-armed),
         wird versteckt. Ohne JS oder bei einem Fehler bleibt der
         Inhalt vollständig lesbar. */
      [data-reveal-root][data-armed="true"] [data-reveal] {
        opacity: 0;
        transform: translateY(14px);
      }
      [data-reveal-root][data-armed="true"] [data-reveal][data-in="true"] {
        opacity: 1;
        transform: none;
        transition: opacity 620ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 620ms cubic-bezier(0.16, 1, 0.3, 1);
        transition-delay: var(--reveal-delay, 0ms);
      }

      /* ── Tablet / Mobile: Schiene wird zum gestapelten Header ─ */
      @media (max-width: 900px) {
        .tc-sec { grid-template-columns: minmax(0, 1fr); }
        .tc-rail { padding: var(--tc-sec-y) var(--gutter) 0; }
        .tc-body {
          padding: clamp(28px, 6vw, 40px) var(--gutter) var(--tc-sec-y);
          border-left: 0;
        }
        .tc-rail-note { max-width: 46ch; }
        .tc-numitem { grid-template-columns: minmax(0, 1fr); gap: 8px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .tc-link .tc-arrow { transition: none; }
        [data-reveal-root][data-armed="true"] [data-reveal] {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
      }
    `}</style>
  );
}
