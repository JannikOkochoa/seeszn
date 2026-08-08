import type { CaseContent } from "@/lib/case-studies/types";
import { publish } from "@/lib/case-studies/gate";
import Reveal from "./Reveal";

// ─── 03 / Ausgangslage ───────────────────────────────────────────────────────
// MAGIC MOMENT 2 — der Abstand zwischen Reichweite und Zugriff.
//
// Zwei Balken, native SVG-freie CSS-Geometrie in der bestehenden Farbwelt. Die
// Balken wachsen über `transform: scaleX` (kein Layout-Property) beim Eintritt
// in den Viewport; die Zahlen daneben sind echter DOM-Text und stehen auch dann,
// wenn nie animiert wird. Erst danach erscheint der erklärende Satz.
//
// Massstab: 28 % Vollausschlag, damit 25,9 % fast die volle Breite einnimmt und
// die 3,7 % daneben sichtbar klein bleiben.
const SCALE_MAX = 28;

export default function Baseline({ content }: { content: CaseContent }) {
  const c = content.baseline;
  const SOURCES = content.sources;
  const metrics = c.metrics.filter((m) => publish(m.value) !== null);

  return (
    <section className="tc-sec" id="ausgangslage" aria-labelledby="baseline-h">
      <div className="tc-rail">
        <p className="tc-label">
          <span>03</span>
          <span>{c.label}</span>
        </p>
        <h2 className="tc-h2-serif" id="baseline-h">
          {c.headline}
        </h2>
      </div>

      <div className="tc-body">
        <Reveal stagger={70}>
          <p className="tc-copy-lead" data-reveal>
            {c.copy}
          </p>

          <dl className="csb-metrics">
            {metrics.map((m) => (
              <div className="csb-metric" key={m.id} data-reveal>
                <dt className="csb-value">{publish(m.value)}</dt>
                <dd>
                  <p className="csb-label">{m.label}</p>
                  <p className="csb-note">{m.note}</p>
                  <p className="tc-meta csb-src">
                    {SOURCES[m.source].code} · {SOURCES[m.source].window}
                  </p>
                </dd>
              </div>
            ))}
          </dl>

          {/* ── Der Gap, visualisiert ────────────────────────── */}
          <figure className="csb-gap" data-reveal>
            <div className="csb-bars">
              {c.gap.bars.map((b) => (
                <div className="csb-bar-row" key={b.id}>
                  <p className="csb-bar-label">{b.label}</p>
                  <div className="csb-track">
                    <span
                      className={`csb-fill csb-fill-${b.id}`}
                      style={{ width: `${(b.value / SCALE_MAX) * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="csb-bar-value">{b.display}</p>
                </div>
              ))}
            </div>

            <p className="csb-punch">{c.gap.punchline}</p>

            <figcaption className="csb-caption">
              {c.gap.caption} {c.gap.sourceNote}
            </figcaption>
          </figure>

          <p className="csb-conclusion" data-reveal>
            {c.conclusion}
          </p>

          <p className="csb-historical" data-reveal>
            {c.historicalNote}
          </p>
        </Reveal>
      </div>

      <style>{`
        /* ── Kennzahlen ────────────────────────────────────── */
        .csb-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin-top: clamp(30px, 3.2vw, 48px);
          border-top: 1px solid var(--line);
        }
        .csb-metric {
          padding: clamp(20px, 2.2vw, 30px) clamp(14px, 1.6vw, 24px) 0;
          border-left: 1px solid var(--line-soft);
          min-width: 0;
        }
        .csb-metric:first-child { border-left: 0; padding-left: 0; }
        .csb-metric:last-child { padding-right: 0; }
        .csb-value {
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(28px, 2.9vw, 42px);
          line-height: 1;
          letter-spacing: -0.02em;
          color: var(--ink-strong);
          font-variant-numeric: lining-nums tabular-nums;
        }
        .csb-label {
          margin-top: clamp(11px, 1.2vw, 16px);
          font-family: var(--font-body), sans-serif;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          line-height: 1.45;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .csb-note {
          margin-top: 8px;
          font-family: var(--font-body), sans-serif;
          font-size: 11.5px;
          line-height: 1.6;
          color: var(--text-muted);
        }
        .csb-src { margin-top: 10px; text-transform: none; letter-spacing: 0.05em; }

        /* ── Gap-Visualisierung ────────────────────────────── */
        .csb-gap {
          margin-top: clamp(34px, 3.6vw, 54px);
          padding-top: clamp(24px, 2.6vw, 36px);
          border-top: 1px solid var(--line);
        }
        .csb-bars { display: grid; gap: clamp(16px, 1.8vw, 26px); }
        .csb-bar-row {
          display: grid;
          grid-template-columns: clamp(96px, 11vw, 148px) minmax(0, 1fr) clamp(58px, 6vw, 80px);
          align-items: center;
          gap: clamp(12px, 1.4vw, 22px);
        }
        .csb-bar-label {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .csb-track {
          position: relative;
          height: 10px;
          border-bottom: 1px solid var(--line);
        }
        .csb-fill {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 10px;
          transform: scaleX(1);
          transform-origin: left;
        }
        .csb-fill-impressions { background: var(--line-strong); }
        .csb-fill-clicks { background: var(--olive); }
        .csb-bar-value {
          text-align: right;
          font-family: var(--font-editorial), Georgia, serif;
          font-size: clamp(16px, 1.5vw, 22px);
          line-height: 1;
          color: var(--ink-strong);
          font-variant-numeric: lining-nums tabular-nums;
        }

        /* Wachsen erst, wenn der Beobachter scharf ist. */
        [data-reveal-root][data-armed="true"] .csb-gap .csb-fill { transform: scaleX(0); }
        [data-reveal-root][data-armed="true"] .csb-gap[data-in="true"] .csb-fill {
          transform: scaleX(1);
          transition: transform 1100ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-reveal-root][data-armed="true"] .csb-gap[data-in="true"] .csb-bar-row:nth-child(2) .csb-fill {
          transition-delay: 220ms;
        }
        [data-reveal-root][data-armed="true"] .csb-gap .csb-punch { opacity: 0; }
        [data-reveal-root][data-armed="true"] .csb-gap[data-in="true"] .csb-punch {
          opacity: 1;
          transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 900ms;
        }

        .csb-punch {
          margin-top: clamp(22px, 2.4vw, 34px);
          font-family: var(--font-editorial), Georgia, serif;
          font-size: clamp(19px, 1.85vw, 27px);
          line-height: 1.25;
          letter-spacing: -0.015em;
          color: var(--ink-strong);
        }
        .csb-caption {
          margin-top: 12px;
          max-width: 62ch;
          font-family: var(--font-body), sans-serif;
          font-size: 11.5px;
          line-height: 1.6;
          color: var(--text-muted);
        }

        .csb-conclusion {
          margin-top: clamp(30px, 3.2vw, 46px);
          padding-top: clamp(20px, 2.2vw, 30px);
          border-top: 1px solid var(--line);
          max-width: 56ch;
          font-family: var(--font-body), sans-serif;
          font-size: clamp(14px, 1.15vw, 16.5px);
          line-height: 1.7;
          color: var(--text-primary);
        }
        .csb-historical {
          margin-top: 16px;
          max-width: 68ch;
          font-family: var(--font-body), sans-serif;
          font-size: 11.5px;
          line-height: 1.7;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .csb-metrics { grid-template-columns: minmax(0, 1fr); }
          .csb-metric {
            padding: 20px 0;
            border-left: 0;
            border-bottom: 1px solid var(--line-soft);
          }
          .csb-metric:last-child { border-bottom: 0; }
        }
        @media (max-width: 640px) {
          .csb-bar-row {
            grid-template-columns: minmax(0, 1fr) clamp(52px, 14vw, 72px);
            gap: 8px 12px;
          }
          .csb-bar-label { grid-column: 1 / -1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal-root][data-armed="true"] .csb-gap .csb-fill { transform: scaleX(1) !important; }
          [data-reveal-root][data-armed="true"] .csb-gap .csb-punch { opacity: 1 !important; }
        }
      `}</style>
    </section>
  );
}
