// ─── Archive plates — pure SVG / HTML markup ─────────────────────────────────
// Animation states are driven by the parent `.arti--on` class;
// all plate CSS lives in EvidenceArchive.tsx so styles exist exactly once.

const MONO = "var(--font-mono), monospace";

const meta = {
  fontFamily: MONO,
  fontSize: 8.5,
  letterSpacing: "0.14em",
  fill: "var(--muted)",
} as const;

const tag = {
  fontFamily: MONO,
  fontSize: 8,
  letterSpacing: "0.115em",
  fill: "var(--text-secondary)",
} as const;

// ── A-01 — crawl map as depth rings ──────────────────────────────────────────

const SECTIONS = [
  [220, 135], [272, 173], [252, 242], [188, 242], [168, 173],
] as const;

const LEAVES = [
  [220, 85], [294, 116], [322, 150], [322, 205], [273, 280], [167, 280], [118, 205], [146, 116],
] as const;

// section index → leaf indices
const BRANCHES: Array<[number, number]> = [
  [0, 0], [0, 7], [1, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 6],
];

export function DepthMap() {
  return (
    <svg viewBox="0 0 480 370" className="ap-svg" role="img"
      aria-label="Crawl map — site structure as depth rings around the homepage, with one orphaned page outside the structure">
      <text x={40} y={16} {...meta}>CRAWL MAP — SZN-AR-01</text>

      {/* depth rings */}
      {[55, 105, 155].map((r, i) => (
        <circle key={r} cx={220} cy={190} r={r} fill="none"
          stroke="rgba(17,16,14,.18)" strokeWidth={0.7} strokeDasharray="2 4"
          className="ap1-ring" style={{ "--i": i } as React.CSSProperties} />
      ))}
      {["DEPTH 01", "DEPTH 02", "DEPTH 03"].map((d, i) => {
        const r = [55, 105, 155][i];
        return (
          <text key={d} x={220 - r * 0.707 - 6} y={190 + r * 0.707 + 12}
            textAnchor="end" {...tag} className="ap1-label">{d}</text>
        );
      })}

      {/* links — center to sections */}
      {SECTIONS.map(([x, y], i) => (
        <line key={`s${i}`} x1={220} y1={190} x2={x} y2={y}
          stroke="rgba(17,16,14,.35)" strokeWidth={0.8}
          className="ap1-link" style={{ "--i": i } as React.CSSProperties} />
      ))}
      {/* links — sections to leaves */}
      {BRANCHES.map(([s, l], i) => (
        <line key={`b${i}`} x1={SECTIONS[s][0]} y1={SECTIONS[s][1]}
          x2={LEAVES[l][0]} y2={LEAVES[l][1]}
          stroke="rgba(17,16,14,.22)" strokeWidth={0.7}
          className="ap1-link" style={{ "--i": i + 5 } as React.CSSProperties} />
      ))}

      {/* nodes */}
      <rect x={216} y={186} width={8} height={8} fill="var(--olive)"
        className="ap1-node" style={{ "--i": 0 } as React.CSSProperties} />
      {SECTIONS.map(([x, y], i) => (
        <rect key={`sn${i}`} x={x - 2.5} y={y - 2.5} width={5} height={5} fill="var(--ink)"
          className="ap1-node" style={{ "--i": i + 1 } as React.CSSProperties} />
      ))}
      {LEAVES.map(([x, y], i) => (
        <rect key={`ln${i}`} x={x - 1.8} y={y - 1.8} width={3.6} height={3.6}
          fill="var(--ink)" opacity={0.65}
          className="ap1-node" style={{ "--i": i + 6 } as React.CSSProperties} />
      ))}
      <text x={220} y={212} textAnchor="middle" {...tag} className="ap1-label">HOME</text>

      {/* orphan — outside every ring */}
      <g className="ap1-orphan">
        <rect x={389.5} y={69.5} width={5} height={5} fill="none"
          stroke="var(--dust)" strokeWidth={0.9} />
        <circle cx={392} cy={72} r={14} fill="none" stroke="var(--olive)"
          strokeWidth={0.8} strokeDasharray="3 3" />
        <text x={392} y={100} textAnchor="middle" {...tag}>ORPHAN</text>
        <text x={392} y={112} textAnchor="middle" {...tag} fill="var(--dust)">UNREACHABLE</text>
      </g>

      <text x={40} y={356} {...tag} className="ap1-label">
        STRUCTURE IS WHAT THE MACHINE CAN KNOW.
      </text>
    </svg>
  );
}

// ── A-02 — radial query fan-out ──────────────────────────────────────────────

const SPOKES = [
  { x: 240, y: 60, label: "COMPARISONS", anchor: "middle", lx: 240, ly: 48, owned: true },
  { x: 353, y: 130, label: "ALTERNATIVES", anchor: "start", lx: 362, ly: 128, owned: false },
  { x: 353, y: 260, label: "REVIEWS", anchor: "start", lx: 362, ly: 266, owned: false },
  { x: 240, y: 330, label: "PRICING", anchor: "middle", lx: 240, ly: 348, owned: false },
  { x: 127, y: 260, label: "GUIDES", anchor: "end", lx: 118, ly: 266, owned: true },
  { x: 127, y: 130, label: "FORUMS", anchor: "end", lx: 118, ly: 128, owned: false },
] as const;

export function RadialFanout() {
  return (
    <svg viewBox="0 0 480 370" className="ap-svg" role="img"
      aria-label="Query fan-out map — one query radiating into six hidden search paths, two of them covered">
      <text x={40} y={16} {...meta}>FAN-OUT MAP — SZN-AR-02</text>

      {SPOKES.map((s, i) => (
        <line key={s.label} x1={240} y1={195} x2={s.x} y2={s.y}
          stroke={s.owned ? "var(--olive)" : "rgba(17,16,14,.3)"}
          strokeWidth={s.owned ? 1 : 0.8}
          className="ap2-spoke" style={{ "--i": i } as React.CSSProperties} />
      ))}

      {SPOKES.map((s, i) => (
        <g key={s.label} className="ap2-end" style={{ "--i": i } as React.CSSProperties}>
          {s.owned ? (
            <rect x={s.x - 3} y={s.y - 3} width={6} height={6} fill="var(--olive)" />
          ) : (
            <rect x={s.x - 2.5} y={s.y - 2.5} width={5} height={5} fill="none"
              stroke="var(--ink)" strokeWidth={0.8} />
          )}
          <text x={s.lx} y={s.ly} textAnchor={s.anchor} {...tag}
            fill={s.owned ? "var(--olive)" : "var(--text-secondary)"}>{s.label}</text>
        </g>
      ))}

      <rect x={236} y={191} width={8} height={8} fill="var(--ink)" className="ap2-q" />
      <text x={240} y={218} textAnchor="middle" {...tag} className="ap2-q">QUERY</text>

      <text x={40} y={356} {...tag} className="ap2-caption">
        SPECIMEN READING — 2 OF 6 PATHS COVERED.
      </text>
    </svg>
  );
}

// ── A-03 — citation gap report (HTML sheet) ──────────────────────────────────

const GAP_ROWS = [
  { surface: "Editorial guide", retrieved: true, cited: false },
  { surface: "Listicle", retrieved: true, cited: false },
  { surface: "Forum thread", retrieved: true, cited: true },
  { surface: "Review page", retrieved: true, cited: false },
  { surface: "Category page", retrieved: true, cited: false },
];

export function CitationGapSheet() {
  return (
    <div className="apsh" role="img"
      aria-label="Citation gap report — five surface types retrieved by AI search, only one citing the brand">
      <div className="apsh-head">
        <span>CITATION GAP REPORT</span>
        <span>SZN-AR-03</span>
      </div>
      <div className="apsh-cols" aria-hidden="true">
        <span className="apsh-col-surface">SURFACE</span>
        <span className="apsh-col">RETRIEVED</span>
        <span className="apsh-col">CITES YOU</span>
      </div>
      <ul className="apsh-list">
        {GAP_ROWS.map((r, i) => (
          <li key={r.surface} className="apsh-row" style={{ "--i": i } as React.CSSProperties}>
            <span className="apsh-surface">{r.surface}</span>
            <span className="apsh-mark">■</span>
            <span className={`apsh-mark${r.cited ? "" : " apsh-mark--gap"}`}>
              {r.cited ? "■" : "□ GAP"}
            </span>
          </li>
        ))}
      </ul>
      <div className="apsh-foot">
        <span>PLAN FOLLOWS GAPS, NOT KEYWORDS</span>
      </div>
    </div>
  );
}

// ── A-04 — surface core sample ───────────────────────────────────────────────

const STRATA = [
  { y: 40, h: 50, label: "SPEED", thin: false },
  { y: 90, h: 60, label: "STRUCTURE", thin: false },
  { y: 150, h: 30, label: "CONTENT", thin: true },
  { y: 180, h: 70, label: "TRUST", thin: false },
  { y: 250, h: 80, label: "CONVERSION", thin: false },
] as const;

export function CoreSample() {
  return (
    <svg viewBox="0 0 480 370" className="ap-svg" role="img"
      aria-label="Surface core sample — a website read in cross-section: speed, structure, content, trust, conversion; the content layer is thin">
      <text x={40} y={16} {...meta}>CORE SAMPLE — SZN-AR-04</text>

      {STRATA.map((s, i) => (
        <g key={s.label} className="ap4-stratum" style={{ "--i": i } as React.CSSProperties}>
          <rect x={200} y={s.y} width={80} height={s.h}
            fill={`rgba(17,16,14,${0.03 + i * 0.012})`}
            stroke="rgba(17,16,14,.45)" strokeWidth={0.8} />
          <line x1={280} y1={s.y + s.h / 2} x2={304} y2={s.y + s.h / 2}
            stroke={s.thin ? "var(--olive)" : "rgba(17,16,14,.25)"} strokeWidth={0.8} />
          <text x={310} y={s.y + s.h / 2 + 3} {...tag}
            fill={s.thin ? "var(--olive)" : "var(--text-secondary)"}>
            {s.thin ? `${s.label} — THIN LAYER` : s.label}
          </text>
        </g>
      ))}

      {/* depth ticks */}
      {STRATA.map((s, i) => (
        <g key={`t${i}`} className="ap4-tick" style={{ "--i": i } as React.CSSProperties}>
          <line x1={188} y1={s.y} x2={200} y2={s.y} stroke="rgba(17,16,14,.3)" strokeWidth={0.7} />
          <text x={182} y={s.y + 3} textAnchor="end" {...tag} fill="var(--dust)">
            0{i}
          </text>
        </g>
      ))}
      <line x1={188} y1={330} x2={200} y2={330} stroke="rgba(17,16,14,.3)" strokeWidth={0.7}
        className="ap4-tick" style={{ "--i": 5 } as React.CSSProperties} />

      <text x={200} y={34} {...tag} className="ap4-caption">BORE — FULL SURFACE</text>
      <text x={40} y={356} {...tag} className="ap4-caption">
        EVERY LAYER MUST BE LEGIBLE.
      </text>
    </svg>
  );
}

// ── A-05 — source surface index (HTML sheet) ─────────────────────────────────

const SOURCES = [
  { surface: "Listicle", role: "ANSWER FEEDSTOCK" },
  { surface: "Category page", role: "RETRIEVAL SURFACE" },
  { surface: "Editorial guide", role: "ENTITY ANCHOR" },
  { surface: "Forum thread", role: "TRUST EVIDENCE" },
  { surface: "Review page", role: "JUDGMENT SIGNAL" },
  { surface: "Documentation", role: "PRECISION SOURCE" },
];

export function SourceIndexSheet() {
  return (
    <div className="apsh" role="img"
      aria-label="Source surface index — the surface types that feed AI answers and the role each plays">
      <div className="apsh-head">
        <span>SOURCE SURFACE INDEX</span>
        <span>SZN-AR-05</span>
      </div>
      <ul className="apsh-list">
        {SOURCES.map((s, i) => (
          <li key={s.surface} className="apsh-row apsh-row--src" style={{ "--i": i } as React.CSSProperties}>
            <span className="apsh-num">0{i + 1}</span>
            <span className="apsh-surface">{s.surface}</span>
            <span className="apsh-role">{s.role}</span>
          </li>
        ))}
      </ul>
      <div className="apsh-foot">
        <span>OWN OR EARN — NEVER IGNORE</span>
      </div>
    </div>
  );
}

// ── A-06 — conversion path trace ─────────────────────────────────────────────

const STATIONS = [
  { x: 50, label: "ANSWER" },
  { x: 140, label: "CLICK" },
  { x: 240, label: "SURFACE" },
  { x: 330, label: "EVIDENCE" },
  { x: 420, label: "ACTION" },
] as const;

export function PathTrace() {
  return (
    <svg viewBox="0 0 480 370" className="ap-svg" role="img"
      aria-label="Conversion path trace — the path from AI answer to action, with a leak located between surface and evidence">
      <text x={40} y={16} {...meta}>PATH TRACE — SZN-AR-06</text>

      <line x1={50} y1={180} x2={420} y2={180}
        stroke="rgba(17,16,14,.4)" strokeWidth={0.9} className="ap6-line" />

      {STATIONS.map((s, i) => (
        <g key={s.label} className="ap6-station" style={{ "--i": i } as React.CSSProperties}>
          <rect x={s.x - 3} y={177} width={6} height={6} fill="var(--ink)" />
          <text x={s.x} y={205} textAnchor="middle" {...tag}>{s.label}</text>
        </g>
      ))}

      {/* the leak — between SURFACE and EVIDENCE */}
      <g className="ap6-leak">
        <circle cx={285} cy={180} r={11} fill="none" stroke="var(--olive)" strokeWidth={1} />
        <line x1={285} y1={191} x2={285} y2={258} stroke="var(--olive)"
          strokeWidth={0.8} strokeDasharray="3 3" />
        <rect x={282} y={258} width={6} height={6} fill="none"
          stroke="var(--olive)" strokeWidth={0.9} />
        <text x={285} y={282} textAnchor="middle" {...tag} fill="var(--olive)">
          EXIT — LEAK LOCATED
        </text>
      </g>

      <text x={40} y={356} {...tag} className="ap6-caption">
        CITED, CLICKED — THEN LOST. THE TRACE SHOWS WHERE.
      </text>
    </svg>
  );
}
