import type { PaMark as Kind } from "@/lib/case-studies/paid-acquisition";

// ─── Line marks for the scaling problem ──────────────────────────────────────
// Four hairline drawings, not an icon set. They carry no information that the
// heading does not already carry — the text is the source, the mark is only the
// rhythm. Hence aria-hidden and no <title>.

const P = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "square",
} as const;

function Paths({ kind }: { kind: Kind }) {
  switch (kind) {
    // Compounding: an interval that keeps doubling.
    case "compound":
      return (
        <>
          <path {...P} d="M1.5 22.5h2" />
          <path {...P} d="M6.5 22.5h4" />
          <path {...P} d="M13.5 22.5h9" />
          <path {...P} d="M1.5 1.5v14" />
          <path {...P} d="M6.5 5.5v10" />
          <path {...P} d="M13.5 9.5v6" />
        </>
      );
    // Control: many lines entering, one narrow gate leaving.
    case "control":
      return (
        <>
          <path {...P} d="M1.5 4h9" />
          <path {...P} d="M1.5 9h9" />
          <path {...P} d="M1.5 15h9" />
          <path {...P} d="M1.5 20h9" />
          <path {...P} d="M14.5 1.5v21" />
          <path {...P} d="M14.5 12h8" />
        </>
      );
    // Signal: a clean wave and a broken one reading the same axis.
    case "signal":
      return (
        <>
          <path {...P} d="M1.5 7.5h6l3-4 3 8 3-4h6" />
          <path {...P} d="M1.5 17.5h3l2 2 2-4 2 3 2-2 2 2 2-3 2 2h4" />
        </>
      );
    // Value: many equal units, one that carries weight.
    case "value":
      return (
        <>
          {[3.5, 8.5, 13.5, 18.5].map((x) => (
            <path {...P} key={x} d={`M${x} 16.5v6`} />
          ))}
          <rect {...P} x="1.5" y="1.5" width="21" height="9" />
          <path {...P} d="M18.5 10.5v12" />
        </>
      );
  }
}

export default function PaMark({ kind }: { kind: Kind }) {
  return (
    <svg className="pa-mark" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <Paths kind={kind} />
    </svg>
  );
}
