// ─── MOVES: Belegdarstellung ──────────────────────────────────────────────────
// Ein Beleg besteht aus drei Spalten, immer in derselben Reihenfolge:
//
//   was umgesetzt wurde  |  was gemessen wurde  |  woher die Zahl kommt
//
// Die mittlere Spalte ist die einzige Stelle mit einer großen Zahl. Wo zwei
// gemessene Stände vorliegen, stehen sie auf einer Achse nebeneinander; es gibt
// bewusst keine Kurve dazwischen, weil keine Zwischenmessung existiert. Wo nur
// ein Endstand vorliegt, steht auch nur einer.
//
// Server-Komponente: der gesamte Beleg steht im ausgelieferten HTML. Die
// Bewegung entsteht ausschließlich über die data-in-Markierung von <Reveal>.

import Link from "next/link";
import { PROOF_LABELS } from "@/lib/moves/copy";
import type { ProofRecord } from "@/lib/moves/proof";

/** Position eines Werts auf der Achse in Prozent, mit Rand für die Beschriftung. */
function pct(value: number, min: number, max: number): number {
  const raw = ((value - min) / (max - min)) * 100;
  return Math.min(92, Math.max(8, raw));
}

function Axis({ record }: { record: ProofRecord }) {
  const axis = record.axis;
  if (!axis) return null;

  const a = pct(axis.from, axis.min, axis.max);
  const b = pct(axis.to, axis.min, axis.max);
  const left = Math.min(a, b);
  const width = Math.abs(a - b);

  return (
    <div className="mv-axis" aria-hidden="true">
      <span className="mv-axis-track" />
      <span
        className="mv-axis-bracket"
        style={{ left: `${left}%`, width: `${width}%`, ["--bracket-origin" as string]: a < b ? "left" : "right" }}
      />
      <span className="mv-axis-pt mv-axis-pt--before" style={{ left: `${a}%` }}>
        <b>{record.before}</b>
        <i />
        <em>{PROOF_LABELS.before}</em>
      </span>
      <span className="mv-axis-pt mv-axis-pt--after" style={{ left: `${b}%` }}>
        <b>{record.after}</b>
        <i />
        <em>{PROOF_LABELS.after}</em>
      </span>
    </div>
  );
}

export default function ProofComparison({ record }: { record: ProofRecord }) {
  return (
    <article className="mv-record" data-reveal>
      {/* ── Was umgesetzt wurde ──────────────────────────────────────────── */}
      <div>
        <span className="mv-micro">{record.label}</span>
        <span className="mv-record-name">{record.client}</span>
        <span className="mv-record-scope mv-micro">{record.scope}</span>

        <span className="mv-k" style={{ marginTop: 22 }}>
          {PROOF_LABELS.deployed}
        </span>
        <ul className="mv-deployed">
          {record.deployed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {/* ── Was gemessen wurde ───────────────────────────────────────────── */}
      <div>
        <span className="mv-k" style={{ marginBottom: 10 }}>
          {PROOF_LABELS.metric}
        </span>
        <p className="mv-body" style={{ fontSize: 13.5, marginBottom: 18 }}>
          {record.metric}
        </p>

        {record.axis ? (
          <>
            <Axis record={record} />
            {record.axisNote ? (
              <p className="mv-micro" style={{ letterSpacing: "0.08em", textTransform: "none" }}>
                {record.axisNote}
              </p>
            ) : null}
          </>
        ) : (
          <p
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 700,
              fontSize: "clamp(38px, 4.4vw, 60px)",
              lineHeight: 0.94,
              letterSpacing: "-0.03em",
              color: "var(--ink-strong)",
              margin: "4px 0 10px",
            }}
          >
            {record.after}
          </p>
        )}

        {record.shot ? (
          <figure className="mv-shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={record.shot.src} alt={record.shot.alt} loading="lazy" />
            <figcaption className="mv-micro">{record.shot.caption}</figcaption>
          </figure>
        ) : null}
      </div>

      {/* ── Woher die Zahl kommt ─────────────────────────────────────────── */}
      <div className="mv-record-ev">
        <dl className="mv-evidence">
          <div className="mv-ev">
            <dt>{PROOF_LABELS.period}</dt>
            <dd>{record.period}</dd>
          </div>
          <div className="mv-ev">
            <dt>{PROOF_LABELS.source}</dt>
            <dd>{record.source}</dd>
          </div>
          <div className="mv-ev">
            <dt>{PROOF_LABELS.method}</dt>
            <dd>{record.method}</dd>
          </div>
          <div className="mv-ev">
            <dt>{PROOF_LABELS.limits}</dt>
            <dd>{record.limits}</dd>
          </div>
        </dl>
        {record.caseHref ? (
          <Link href={record.caseHref} className="mv-case-link">
            Vollständige Case Study
          </Link>
        ) : null}
      </div>
    </article>
  );
}
