import type { CaseContent } from "@/lib/case-studies/types";
import Reveal from "./Reveal";

// ─── 10 / Drei Erkenntnisse ──────────────────────────────────────────────────
// Drei Sätze, die jeweils auf eine Zahl oder einen Befund aus diesem Case
// zurückgehen. Grosse Nummer, kurze Aussage, feine Trennlinie — kein Essay.

export default function Takeaways({ content }: { content: CaseContent }) {
  const c = content.takeaways;
  return (
    <section className="tc-sec" id="erkenntnisse" aria-labelledby="takeaways-h">
      <div className="tc-rail">
        <p className="tc-label">
          <span>10</span>
          <span>{c.label}</span>
        </p>
        <h2 className="tc-h2-display" id="takeaways-h">
          {c.headline}
        </h2>
      </div>

      <div className="tc-body">
        <Reveal stagger={110}>
          <ol className="cst-list">
            {c.items.map((t) => (
              <li className="cst-item" key={t.index} data-reveal>
                <p className="cst-index" aria-hidden="true">
                  {t.index}
                </p>
                <div className="cst-body">
                  <h3 className="cst-title">{t.title}</h3>
                  <p className="cst-text">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <style>{`
        .cst-list { list-style: none; }
        .cst-item {
          display: grid;
          grid-template-columns: clamp(64px, 7vw, 104px) minmax(0, 1fr);
          gap: clamp(16px, 2vw, 36px);
          padding: clamp(24px, 2.6vw, 38px) 0;
          border-top: 1px solid var(--line);
        }
        .cst-item:first-child { padding-top: 0; border-top: 0; }
        .cst-item:last-child { padding-bottom: 0; }
        .cst-index {
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(34px, 3.4vw, 52px);
          line-height: 0.86;
          letter-spacing: -0.03em;
          color: var(--ink-strong);
          font-variant-numeric: lining-nums tabular-nums;
        }
        .cst-body { min-width: 0; }
        .cst-title {
          font-family: var(--font-body), sans-serif;
          font-size: clamp(13px, 1.05vw, 15px);
          font-weight: 600;
          letter-spacing: 0.08em;
          line-height: 1.45;
          text-transform: uppercase;
          color: var(--ink-strong);
          max-width: 44ch;
        }
        .cst-text {
          margin-top: 11px;
          max-width: 66ch;
          font-family: var(--font-body), sans-serif;
          font-size: clamp(13px, 1.02vw, 14.5px);
          line-height: 1.75;
          color: var(--text-body);
        }

        @media (max-width: 780px) {
          .cst-item { grid-template-columns: minmax(0, 1fr); gap: 12px; }
          .cst-index { font-size: 30px; line-height: 1; }
        }
      `}</style>
    </section>
  );
}
