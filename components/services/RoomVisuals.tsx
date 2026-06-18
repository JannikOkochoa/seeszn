// ─── Room instruments — pure SVG / HTML markup ───────────────────────────────
// Animation states are driven by the parent `.vroom--on` class;
// all visual CSS lives in OperatingRooms.tsx so styles exist exactly once.

const MONO = "var(--font-mono), monospace";

const meta = {
  fontFamily: MONO,
  fontSize: 8.5,
  letterSpacing: "0.14em",
  fill: "var(--muted)",
} as const;

const tag = {
  fontFamily: MONO,
  fontSize: 8.5,
  letterSpacing: "0.115em",
  fill: "var(--text-secondary)",
} as const;

// ── 01 / CRAWL — architectural crawl map ─────────────────────────────────────

export function CrawlMap() {
  return (
    <svg viewBox="0 0 480 370" className="rv-svg" role="img"
      aria-label="Crawl map: site structure drawn as a floorplan with an indexing route and one dead end">
      <text x={40} y={16} {...meta}>CRAWL MAP · SZN-CR-01</text>

      {/* floorplan walls */}
      <g className="cm-walls">
        <rect x={40} y={30} width={400} height={300} fill="none"
          stroke="rgba(17,16,14,.34)" strokeWidth={0.8} className="cm-wall" />
        <line x1={200} y1={30} x2={200} y2={330} stroke="rgba(17,16,14,.2)" strokeWidth={0.8} className="cm-wall" />
        <line x1={40} y1={150} x2={200} y2={150} stroke="rgba(17,16,14,.2)" strokeWidth={0.8} className="cm-wall" />
        <line x1={200} y1={220} x2={440} y2={220} stroke="rgba(17,16,14,.2)" strokeWidth={0.8} className="cm-wall" />
        <line x1={330} y1={220} x2={330} y2={330} stroke="rgba(17,16,14,.2)" strokeWidth={0.8} className="cm-wall" />
        <line x1={320} y1={30} x2={320} y2={120} stroke="rgba(17,16,14,.2)" strokeWidth={0.8} className="cm-wall" />
        <line x1={320} y1={120} x2={440} y2={120} stroke="rgba(17,16,14,.2)" strokeWidth={0.8} className="cm-wall" />
      </g>

      {/* dead-end branch — crawled, never indexed */}
      <polyline points="200,160 120,160 120,200" fill="none"
        stroke="var(--dust)" strokeWidth={0.9} className="cm-dead" />
      <rect x={116.5} y={196.5} width={7} height={7} fill="none"
        stroke="var(--dust)" strokeWidth={0.9} className="cm-dead" />
      <text x={120} y={218} textAnchor="middle" {...tag} fill="var(--dust)" className="cm-label">
        DEAD END · NOT INDEXED
      </text>

      {/* indexing route */}
      <polyline points="40,90 200,90 200,250 330,250 330,300 420,300" fill="none"
        stroke="var(--olive)" strokeWidth={1} className="cm-route" />

      {/* route nodes */}
      <rect x={36.5} y={86.5} width={7} height={7} fill="var(--olive)" className="cm-node" style={{ "--i": 0 } as React.CSSProperties} />
      <rect x={197} y={87} width={6} height={6} fill="var(--ink)" className="cm-node" style={{ "--i": 1 } as React.CSSProperties} />
      <rect x={197} y={247} width={6} height={6} fill="var(--ink)" className="cm-node" style={{ "--i": 2 } as React.CSSProperties} />
      <rect x={327} y={247} width={6} height={6} fill="var(--ink)" className="cm-node" style={{ "--i": 3 } as React.CSSProperties} />
      <circle cx={420} cy={300} r={4.5} fill="none" stroke="var(--olive)" strokeWidth={1} className="cm-node" style={{ "--i": 4 } as React.CSSProperties} />

      {/* annotations */}
      <text x={48} y={78} {...tag} fill="var(--olive)" className="cm-label">ENTRY</text>
      <text x={208} y={132} {...tag} className="cm-label">INDEX ROUTE</text>
      <text x={338} y={268} {...tag} className="cm-label">DEPTH 03</text>
      <text x={420} y={320} textAnchor="middle" {...tag} className="cm-label">INDEXED</text>
    </svg>
  );
}

// ── 02 / RETRIEVE — query fan-out ────────────────────────────────────────────

const FRAGMENTS = [
  { y: 64, label: "SOURCES" },
  { y: 112, label: "SNIPPETS" },
  { y: 160, label: "ENTITIES", olive: true },
  { y: 208, label: "LISTICLES" },
  { y: 256, label: "DISCUSSIONS" },
  { y: 304, label: "CATEGORIES" },
];

export function FanOut() {
  return (
    <svg viewBox="0 0 480 370" className="rv-svg" role="img"
      aria-label="Query fan-out: one query splits into retrieval fragments that assemble into an answer field with citations">
      <text x={28} y={16} {...meta}>QUERY FAN-OUT · SZN-RT-02</text>

      {/* query node */}
      <rect x={36.5} y={181.5} width={7} height={7} fill="var(--ink)" className="fo-q" />
      <text x={40} y={206} textAnchor="middle" {...tag} className="fo-q">QUERY</text>

      {/* fan-out paths */}
      {FRAGMENTS.map((f, i) => (
        <path
          key={f.label}
          d={`M46 185 C 120 185, 130 ${f.y}, 196 ${f.y}`}
          fill="none"
          stroke={f.olive ? "var(--olive)" : "rgba(17,16,14,.3)"}
          strokeWidth={f.olive ? 1 : 0.8}
          className="fo-fan"
          style={{ "--i": i } as React.CSSProperties}
        />
      ))}

      {/* fragments */}
      {FRAGMENTS.map((f, i) => (
        <g key={f.label} className="fo-frag" style={{ "--i": i } as React.CSSProperties}>
          <line x1={196} y1={f.y} x2={208} y2={f.y}
            stroke={f.olive ? "var(--olive)" : "var(--ink)"} strokeWidth={1} />
          <text x={214} y={f.y + 3} {...tag}
            fill={f.olive ? "var(--olive)" : "var(--text-secondary)"}>{f.label}</text>
        </g>
      ))}

      {/* convergence paths */}
      {FRAGMENTS.map((f, i) => (
        <path
          key={f.label}
          d={`M300 ${f.y} C 336 ${f.y}, 344 ${150 + i * 15}, 376 ${150 + i * 15}`}
          fill="none"
          stroke={f.olive ? "var(--olive)" : "rgba(17,16,14,.3)"}
          strokeWidth={f.olive ? 1 : 0.8}
          className="fo-conv"
          style={{ "--i": i } as React.CSSProperties}
        />
      ))}

      {/* answer / citation field */}
      <rect x={376} y={136} width={80} height={98} fill="none"
        stroke="var(--warm-black)" strokeWidth={0.9} className="fo-box" />
      <g className="fo-cites">
        {[156, 172, 204, 220].map((y) => (
          <line key={y} x1={388} y1={y} x2={444} y2={y}
            stroke="rgba(17,16,14,.25)" strokeWidth={1} />
        ))}
        <line x1={388} y1={188} x2={444} y2={188} stroke="var(--olive)" strokeWidth={1.4} />
        <rect x={381} y={186} width={4} height={4} fill="var(--olive)" />
      </g>
      <text x={416} y={252} textAnchor="middle" {...tag} className="fo-caption">ANSWER FIELD</text>
      <text x={416} y={266} textAnchor="middle" {...meta} className="fo-caption">CITATION · YOUR SURFACE</text>
    </svg>
  );
}

// ── 03 / TRUST — website as layered object ───────────────────────────────────

const LAYERS = [
  { y: 70, label: "05 · CONVERSION" },
  { y: 124, label: "04 · TRUST" },
  { y: 178, label: "03 · CONTENT" },
  { y: 232, label: "02 · STRUCTURE" },
  { y: 286, label: "01 · SPEED" },
];

export function SurfaceLayers() {
  return (
    <svg viewBox="0 0 480 370" className="rv-svg" role="img"
      aria-label="Website as a layered object: speed, structure, content, trust and conversion stacked on one axis">
      <text x={40} y={16} {...meta}>SURFACE OBJECT · SZN-SF-03</text>

      {/* system axis */}
      <line x1={200} y1={26} x2={200} y2={330}
        stroke="var(--olive)" strokeWidth={1} className="sl-axis" />

      {LAYERS.map((l, i) => (
        <g key={l.label} className="sl-layer"
          style={{ "--i": i, "--sy": `${(178 - l.y) * 0.55}px` } as React.CSSProperties}>
          <polygon
            points={`200,${l.y - 38} 310,${l.y} 200,${l.y + 38} 90,${l.y}`}
            fill="var(--paper)"
            fillOpacity={0.55}
            stroke="rgba(17,16,14,.55)"
            strokeWidth={0.9}
          />
          <line x1={310} y1={l.y} x2={336} y2={l.y}
            stroke="rgba(17,16,14,.25)" strokeWidth={0.8} />
          <text x={342} y={l.y + 3} {...tag}>{l.label}</text>
        </g>
      ))}

      <text x={90} y={348} {...tag} className="sl-caption">A SITE IS NOT DECORATION. IT IS EVIDENCE.</text>
    </svg>
  );
}

// ── 04 / DIAGNOSE — forensic visibility report ───────────────────────────────

const LEAKS = [
  { leak: "Weak entity structure", locus: "ENTITY" },
  { leak: "Missing citation surfaces", locus: "CITATION" },
  { leak: "Fragmented content", locus: "CONTENT" },
  { leak: "Slow page experience", locus: "PERFORMANCE" },
  { leak: "No AI-search source strategy", locus: "SOURCES" },
];

export function DiagnosisReport() {
  return (
    <div className="dxr" role="img"
      aria-label="Visibility report: five detected leaks, next move: diagnosis">
      <div className="dxr-head">
        <span>VISIBILITY REPORT</span>
        <span>SZN-DX-04</span>
      </div>

      <p className="dxr-status">
        <span className="dxr-flag" aria-hidden="true" />
        VISIBILITY LEAKS DETECTED
      </p>

      <ol className="dxr-list">
        {LEAKS.map((l, i) => (
          <li key={l.locus} className="dxr-row" style={{ "--i": i } as React.CSSProperties}>
            <span className="dxr-num">0{i + 1}</span>
            <span className="dxr-leak">{l.leak}</span>
            <span className="dxr-locus">{l.locus}</span>
          </li>
        ))}
      </ol>

      <div className="dxr-foot">
        <span>NEXT MOVE</span>
        <span className="dxr-next">DIAGNOSIS</span>
      </div>
    </div>
  );
}
