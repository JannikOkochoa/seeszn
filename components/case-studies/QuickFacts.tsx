import type { CaseContent } from "@/lib/case-studies/types";
import Reveal from "./Reveal";

// ─── 02 / Der Case in 20 Sekunden ────────────────────────────────────────────
// Muss in fünf Sekunden scanbar sein. Eine Definitionsliste im bestehenden
// Raster, keine Tabelle: Schlüssel klein und mono, Wert gross und ruhig.

export default function QuickFacts({ content }: { content: CaseContent }) {
  const c = content.quickFacts;
  return (
    <section className="tc-sec" id="ueberblick" aria-labelledby="quickfacts-h">
      <div className="tc-rail">
        <p className="tc-label">
          <span>02</span>
          <span>{c.label}</span>
        </p>
        <h2 className="tc-h2-display" id="quickfacts-h">
          {c.headline[0]}{" "}
          <br />
          {c.headline[1]}
        </h2>
      </div>

      <div className="tc-body">
        <Reveal stagger={45}>
          <dl className="cqf-grid">
            {c.facts.map((f) => (
              <div
                className={f.wide ? "cqf-cell cqf-cell-wide" : "cqf-cell"}
                key={f.key}
                data-reveal
              >
                <dt>{f.key}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <style>{`
        .cqf-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border-top: 1px solid var(--line);
        }
        .cqf-cell {
          padding: clamp(16px, 1.7vw, 24px) clamp(14px, 1.6vw, 26px) clamp(16px, 1.7vw, 24px) 0;
          border-bottom: 1px solid var(--line);
          border-left: 1px solid var(--line-soft);
          padding-left: clamp(14px, 1.6vw, 26px);
          min-width: 0;
        }
        .cqf-cell:nth-child(3n + 1) { border-left: 0; padding-left: 0; }
        .cqf-cell-wide { grid-column: span 2; }

        .cqf-cell dt {
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-faint);
        }
        .cqf-cell dd {
          margin-top: 9px;
          font-family: var(--font-body), sans-serif;
          font-size: clamp(13px, 1.05vw, 15px);
          line-height: 1.5;
          color: var(--ink-strong);
        }

        @media (max-width: 780px) {
          .cqf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .cqf-cell:nth-child(3n + 1) {
            border-left: 1px solid var(--line-soft);
            padding-left: clamp(14px, 1.6vw, 26px);
          }
          .cqf-cell:nth-child(odd) { border-left: 0; padding-left: 0; }
          .cqf-cell-wide { grid-column: span 2; border-left: 0; padding-left: 0; }
        }
      `}</style>
    </section>
  );
}
