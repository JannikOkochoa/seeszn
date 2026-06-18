"use client";

// Operating manual — table of contents. Hero instrument of /about.

const SECTIONS = [
  { code: "M-01", name: "THE PREMISE", href: "#premise" },
  { code: "M-02", name: "THE MODEL", href: "#model" },
  { code: "M-03", name: "PRINCIPLES", href: "#principles" },
  { code: "M-04", name: "REFUSALS", href: "#refusals" },
  { code: "M-05", name: "THE UNIT", href: "#unit" },
];

export default function ManualContents() {
  return (
    <div className="mtoc" role="navigation" aria-label="Operating manual, contents">
      <div className="mtoc-head">
        <span>OPERATING MANUAL</span>
        <span>EDITION 2026</span>
      </div>

      <ul className="mtoc-list">
        {SECTIONS.map((s, i) => (
          <li key={s.code}>
            <a href={s.href} className="mtoc-row" style={{ "--i": i } as React.CSSProperties}>
              <span className="mtoc-code">{s.code}</span>
              <span className="mtoc-name">
                {s.name}
                <span className="mtoc-scan" aria-hidden="true" />
              </span>
              <span className="mtoc-arrow" aria-hidden="true">→</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mtoc-foot">
        <span>BREMEN · BANGKOK</span>
        <span>SZN-OM-04</span>
      </div>

      <style>{`
        .mtoc {
          width: 100%;
          max-width: 440px;
          border: 1px solid var(--warm-black);
          background: var(--paper);
        }
        .mtoc-head {
          display: flex;
          justify-content: space-between;
          padding: 14px 22px;
          border-bottom: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--text-secondary);
        }
        .mtoc-list { list-style: none; }
        .mtoc-row {
          display: flex;
          align-items: baseline;
          gap: 16px;
          padding: 16px 22px;
          border-bottom: 1px solid var(--line);
          text-decoration: none;
          opacity: 0;
          transform: translateY(8px);
          animation: mtoc-in 600ms cubic-bezier(.16,1,.3,1) calc(700ms + var(--i, 0) * 100ms) both;
        }
        @keyframes mtoc-in { to { opacity: 1; transform: none; } }
        .mtoc-code {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--dust);
          width: 36px;
          flex-shrink: 0;
        }
        .mtoc-name {
          position: relative;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.03em;
          color: var(--warm-black);
          padding-bottom: 4px;
          flex: 1;
        }
        .mtoc-scan {
          position: absolute;
          left: 0; bottom: 0;
          width: 100%;
          height: 1px;
          background: var(--signal);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms cubic-bezier(.16,1,.3,1);
        }
        .mtoc-row:hover .mtoc-scan,
        .mtoc-row:focus-visible .mtoc-scan { transform: scaleX(1); }
        .mtoc-row:focus-visible { outline: 1px solid var(--warm-black); outline-offset: -1px; }
        .mtoc-arrow {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          color: var(--dust);
          transition: color 300ms ease;
        }
        .mtoc-row:hover .mtoc-arrow { color: var(--olive); }
        .mtoc-foot {
          display: flex;
          justify-content: space-between;
          padding: 14px 22px;
          border-top: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--text-secondary);
        }

        @media (prefers-reduced-motion: reduce) {
          .mtoc-row { animation: none; opacity: 1; transform: none; }
          .mtoc-scan { transition: none; }
        }
      `}</style>
    </div>
  );
}
