"use client";

// The Watch — systems under observation. Hero instrument of the Intelligence Room.

const SYSTEMS = [
  { name: "GOOGLE AI MODE / AI OVERVIEWS", status: "OBSERVED" },
  { name: "CHATGPT SEARCH", status: "OBSERVED" },
  { name: "PERPLEXITY", status: "OBSERVED" },
  { name: "GEMINI", status: "OBSERVED" },
  { name: "COPILOT", status: "OBSERVED" },
  { name: "CLASSIC SERP", status: "STILL COUNTS" },
];

export default function TheWatch() {
  return (
    <div
      className="watch"
      role="img"
      aria-label="The Watch — retrieval systems under observation: Google AI Mode and AI Overviews, ChatGPT Search, Perplexity, Gemini, Copilot — and the classic search results page, which still counts"
    >
      <div className="watch-head">
        <span>THE WATCH — SYSTEMS UNDER OBSERVATION</span>
        <span>SZN-IN-03</span>
      </div>

      <ul className="watch-list">
        {SYSTEMS.map((s, i) => (
          <li key={s.name} className="watch-row" style={{ "--i": i } as React.CSSProperties}>
            <span className="watch-pip" aria-hidden="true" />
            <span className="watch-name">{s.name}</span>
            <span className={`watch-status${s.status !== "OBSERVED" ? " watch-status--note" : ""}`}>
              {s.status}
            </span>
          </li>
        ))}
      </ul>

      <div className="watch-foot">
        <span>READINGS FILED AS FIELD NOTES</span>
        <span className="watch-caret" aria-hidden="true" />
      </div>

      <style>{`
        .watch {
          width: 100%;
          max-width: 460px;
          border: 1px solid var(--warm-black);
          background: var(--paper);
          position: relative;
          overflow: hidden;
        }
        /* single scan pass after the panel settles */
        .watch::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 1px;
          background: var(--olive);
          opacity: 0;
          animation: watch-scan 900ms cubic-bezier(.16,1,.3,1) 1.9s both;
          pointer-events: none;
        }
        @keyframes watch-scan {
          0%   { left: -1px; opacity: 0; }
          8%   { opacity: 0.45; }
          88%  { opacity: 0.2; }
          100% { left: 101%; opacity: 0; }
        }
        .watch-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 22px;
          border-bottom: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.16em;
          color: #5E574F;
        }
        .watch-list { list-style: none; padding: 8px 0; }
        .watch-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 22px;
          opacity: 0;
          transform: translateY(8px);
          animation: watch-in 600ms cubic-bezier(.16,1,.3,1) calc(700ms + var(--i, 0) * 100ms) both;
        }
        @keyframes watch-in { to { opacity: 1; transform: none; } }
        .watch-pip {
          width: 5px;
          height: 5px;
          background: var(--olive);
          flex-shrink: 0;
        }
        .watch-row:last-child .watch-pip { background: var(--dust); }
        .watch-name {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--warm-black);
          flex: 1;
        }
        .watch-status {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.18em;
          color: var(--muted);
        }
        .watch-status--note { color: var(--olive); }
        .watch-foot {
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
        .watch-caret {
          width: 6px;
          height: 11px;
          background: var(--olive);
          animation: watch-blink 1.3s steps(1) 2.4s infinite;
        }
        @keyframes watch-blink { 50% { opacity: 0; } }

        @media (prefers-reduced-motion: reduce) {
          .watch::after { display: none; }
          .watch-row { animation: none; opacity: 1; transform: none; }
          .watch-caret { animation: none; }
        }
      `}</style>
    </div>
  );
}
