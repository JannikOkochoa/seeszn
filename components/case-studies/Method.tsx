import type { CaseContent } from "@/lib/case-studies/types";

// ─── 09 / So messen wir ──────────────────────────────────────────────────────
// Kurz statt monumental. Fünf Zeilen erklären den Messaufbau; die ausführlichen
// Kriterien liegen in einem nativen <details>, das ohne JavaScript funktioniert
// und vollständig tastaturbedienbar ist.

export default function Method({ content }: { content: CaseContent }) {
  const c = content.method;
  return (
    <section className="tc-sec" id="methodik" aria-labelledby="method-h">
      <div className="tc-rail">
        <p className="tc-label">
          <span>09</span>
          <span>{c.label}</span>
        </p>
        <h2 className="tc-h2-serif" id="method-h">
          {c.headline}
        </h2>
      </div>

      <div className="tc-body">
        <p className="tc-copy-lead">{c.copy}</p>

        <dl className="csm-facts">
          {c.facts.map((f) => (
            <div className="csm-fact" key={f.key}>
              <dt>{f.key}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>

        <details className="csm-details">
          <summary>
            {c.detailsLabel}
            <span className="csm-sign" aria-hidden="true" />
          </summary>

          <dl className="csm-criteria">
            {c.criteria.map((crit) => (
              <div key={crit.key}>
                <dt>{crit.key}</dt>
                <dd>{crit.value}</dd>
              </div>
            ))}
          </dl>

          <p className="csm-caveat">{c.caveat}</p>
        </details>
      </div>

      <style>{`
        .csm-facts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0;
          margin-top: clamp(26px, 2.8vw, 40px);
          border-top: 1px solid var(--line);
        }
        .csm-fact {
          padding: clamp(15px, 1.6vw, 21px) clamp(14px, 1.6vw, 26px) clamp(15px, 1.6vw, 21px) 0;
          border-bottom: 1px solid var(--line-soft);
          min-width: 0;
        }
        .csm-fact:nth-child(even) {
          border-left: 1px solid var(--line-soft);
          padding-left: clamp(14px, 1.6vw, 26px);
        }
        .csm-fact:last-child:nth-child(odd) { grid-column: 1 / -1; }
        .csm-fact dt {
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-faint);
        }
        .csm-fact dd {
          margin-top: 7px;
          font-family: var(--font-body), sans-serif;
          font-size: 12.5px;
          line-height: 1.6;
          color: var(--text-body);
        }

        .csm-details { margin-top: clamp(24px, 2.6vw, 36px); }
        .csm-details > summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 0;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          cursor: pointer;
          list-style: none;
          font-family: var(--font-mono), monospace;
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .csm-details > summary::-webkit-details-marker { display: none; }
        .csm-sign {
          position: relative;
          width: 11px;
          height: 11px;
          flex-shrink: 0;
        }
        .csm-sign::before, .csm-sign::after {
          content: "";
          position: absolute;
          background: var(--olive);
          transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .csm-sign::before { left: 0; top: 5px; width: 11px; height: 1px; }
        .csm-sign::after { left: 5px; top: 0; width: 1px; height: 11px; }
        .csm-details[open] .csm-sign::after { transform: scaleY(0); }

        .csm-criteria {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(14px, 1.6vw, 22px) clamp(24px, 3vw, 48px);
          padding-top: clamp(20px, 2.2vw, 28px);
        }
        .csm-criteria dt {
          font-family: var(--font-body), sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .csm-criteria dd {
          margin-top: 6px;
          font-family: var(--font-body), sans-serif;
          font-size: 12px;
          line-height: 1.65;
          color: var(--text-secondary);
        }
        .csm-caveat {
          margin-top: clamp(20px, 2.2vw, 30px);
          padding-left: 14px;
          border-left: 1px solid var(--olive);
          max-width: 76ch;
          font-family: var(--font-body), sans-serif;
          font-size: 12px;
          line-height: 1.7;
          color: var(--text-primary);
        }

        @media (max-width: 780px) {
          .csm-facts { grid-template-columns: minmax(0, 1fr); }
          .csm-fact:nth-child(even) { border-left: 0; padding-left: 0; }
          .csm-criteria { grid-template-columns: minmax(0, 1fr); }
        }
        @media (prefers-reduced-motion: reduce) {
          .csm-sign::before, .csm-sign::after { transition: none; }
        }
      `}</style>
    </section>
  );
}
