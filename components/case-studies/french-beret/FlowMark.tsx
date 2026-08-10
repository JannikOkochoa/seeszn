import type { FlowMark as Kind } from "@/lib/case-studies/french-beret";

// ─── Linienmarken für den Architektur-Flow ───────────────────────────────────
// Sechs Hairline-Zeichnungen, kein Icon-Set. Sie tragen keine Information, die
// nicht auch im Titel steht — der Text bleibt die Quelle, die Marke ist nur der
// Rhythmus. Deshalb aria-hidden und kein Titel im SVG.

const P = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "square",
} as const;

function Paths({ kind }: { kind: Kind }) {
  switch (kind) {
    // Suchnachfrage: drei Anfragen unterschiedlicher Länge.
    case "demand":
      return (
        <>
          <path {...P} d="M1 5h20" />
          <path {...P} d="M1 12h13" />
          <path {...P} d="M1 19h17" />
        </>
      );
    // Kategorien: ein geordnetes Raster.
    case "collections":
      return (
        <>
          <rect {...P} x="1.5" y="1.5" width="9" height="9" />
          <rect {...P} x="13.5" y="1.5" width="9" height="9" />
          <rect {...P} x="1.5" y="13.5" width="9" height="9" />
          <rect {...P} x="13.5" y="13.5" width="9" height="9" />
        </>
      );
    // Abdeckung: viele Einzelseiten, gleichmäßig verteilt.
    case "products":
      return (
        <>
          {[4, 12, 20].map((y) =>
            [4, 12, 20].map((x) => (
              <rect {...P} key={`${x}-${y}`} x={x - 1.5} y={y - 1.5} width="3" height="3" />
            )),
          )}
        </>
      );
    // Redaktioneller Inhalt: eine Seite mit Textfluss.
    case "editorial":
      return (
        <>
          <path {...P} d="M3.5 1.5h17v21h-17z" />
          <path {...P} d="M7 7h10" />
          <path {...P} d="M7 12h10" />
          <path {...P} d="M7 17h6" />
        </>
      );
    // Interne Verbindungen: Knoten, die sich gegenseitig stützen.
    case "links":
      return (
        <>
          <path {...P} d="M5 5l14 7L5 19" />
          <circle {...P} cx="5" cy="5" r="2" />
          <circle {...P} cx="19" cy="12" r="2" />
          <circle {...P} cx="5" cy="19" r="2" />
        </>
      );
    // Discovery: mehr Einstiegspunkte, nach außen.
    case "discovery":
      return (
        <>
          <circle {...P} cx="12" cy="12" r="3.5" />
          <path {...P} d="M12 1.5v4" />
          <path {...P} d="M12 18.5v4" />
          <path {...P} d="M1.5 12h4" />
          <path {...P} d="M18.5 12h4" />
          <path {...P} d="M4.6 4.6l2.8 2.8" />
          <path {...P} d="M16.6 16.6l2.8 2.8" />
          <path {...P} d="M19.4 4.6l-2.8 2.8" />
          <path {...P} d="M7.4 16.6l-2.8 2.8" />
        </>
      );
  }
}

export default function FlowMark({ kind }: { kind: Kind }) {
  return (
    <svg className="fbf-mark" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <Paths kind={kind} />
    </svg>
  );
}
