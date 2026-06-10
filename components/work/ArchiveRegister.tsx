"use client";

// Archive register — the hero instrument of the Evidence Archive.
// Doubles as the table of contents: each row anchors to its artifact.

const ROWS = [
  { code: "SZN-AR-01", name: "CRAWL MAP", cls: "SEARCH ARCHITECTURE", href: "#a-01" },
  { code: "SZN-AR-02", name: "QUERY FAN-OUT MAP", cls: "MACHINE CITATION", href: "#a-02" },
  { code: "SZN-AR-03", name: "CITATION GAP REPORT", cls: "MACHINE CITATION", href: "#a-03" },
  { code: "SZN-AR-04", name: "SURFACE CORE SAMPLE", cls: "DIGITAL SURFACE", href: "#a-04" },
  { code: "SZN-AR-05", name: "SOURCE SURFACE INDEX", cls: "MACHINE CITATION", href: "#a-05" },
  { code: "SZN-AR-06", name: "CONVERSION PATH TRACE", cls: "DIAGNOSTICS", href: "#a-06" },
];

export default function ArchiveRegister() {
  return (
    <div className="areg" role="navigation" aria-label="Archive register — list of artifacts">
      <div className="areg-head">
        <span>ARCHIVE REGISTER</span>
        <span>PUBLIC</span>
      </div>

      <ul className="areg-list">
        {ROWS.map((r, i) => (
          <li key={r.code}>
            <a href={r.href} className="areg-row" style={{ "--i": i } as React.CSSProperties}>
              <span className="areg-code">{r.code}</span>
              <span className="areg-name">
                {r.name}
                <span className="areg-scan" aria-hidden="true" />
              </span>
              <span className="areg-cls">{r.cls}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="areg-foot">
        <span>06 ARTIFACTS ON DISPLAY</span>
        <span className="areg-foot-note">CLIENT READINGS — PRIVATE</span>
      </div>

      <style>{`
        .areg {
          width: 100%;
          max-width: 460px;
          border: 1px solid var(--warm-black);
          background: var(--paper);
        }
        .areg-head {
          display: flex;
          justify-content: space-between;
          padding: 14px 22px;
          border-bottom: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: #5E574F;
        }
        .areg-list { list-style: none; }
        .areg-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          padding: 13px 22px;
          border-bottom: 1px solid var(--line);
          text-decoration: none;
          opacity: 0;
          transform: translateY(8px);
          animation: areg-in 600ms cubic-bezier(.16,1,.3,1) calc(700ms + var(--i, 0) * 90ms) both;
        }
        @keyframes areg-in { to { opacity: 1; transform: none; } }
        .areg-code {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.1em;
          color: var(--dust);
          width: 64px;
          flex-shrink: 0;
        }
        .areg-name {
          position: relative;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--warm-black);
          padding-bottom: 3px;
          flex: 1;
        }
        .areg-scan {
          position: absolute;
          left: 0; bottom: 0;
          width: 100%;
          height: 1px;
          background: var(--signal);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms cubic-bezier(.16,1,.3,1);
        }
        .areg-row:hover .areg-scan,
        .areg-row:focus-visible .areg-scan { transform: scaleX(1); }
        .areg-row:focus-visible { outline: 1px solid var(--warm-black); outline-offset: -1px; }
        .areg-cls {
          font-family: var(--font-mono), monospace;
          font-size: 7.5px;
          letter-spacing: 0.14em;
          color: var(--muted);
          text-align: right;
        }
        .areg-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 22px;
          border-top: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: #5E574F;
        }
        .areg-foot-note { color: var(--olive); font-size: 8px; }

        @media (prefers-reduced-motion: reduce) {
          .areg-row { animation: none; opacity: 1; transform: none; }
          .areg-scan { transition: none; }
        }
      `}</style>
    </div>
  );
}
