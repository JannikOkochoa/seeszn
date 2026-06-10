import Link from "next/link";

// The room register — the institution's floor plan, kept in the footer.
const ROOMS = [
  { num: "01", name: "OPERATING ROOM", href: "/services" },
  { num: "02", name: "EVIDENCE ARCHIVE", href: "/work" },
  { num: "03", name: "INTELLIGENCE ROOM", href: "/insights" },
  { num: "04", name: "OPERATING MANUAL", href: "/about" },
  { num: "05", name: "SCAN ROOM", href: "/diagnosis" },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--warm-black)",
        background: "var(--paper)",
      }}
    >
      <div
        style={{
          padding: "24px 64px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className="ftr-top"
      >
        <span style={metaStyle}>BERLIN — BANGKOK</span>

        <span
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "-0.01em",
            color: "var(--warm-black)",
          }}
        >
          SEESZN
        </span>

        <a href="mailto:hello@seeszn.com" style={metaStyle}>
          HELLO@SEESZN.COM
        </a>
      </div>

      {/* Room register */}
      <nav
        aria-label="Room register"
        className="ftr-register"
        style={{
          borderTop: "1px solid var(--line)",
          padding: "16px 64px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px 28px",
          alignItems: "baseline",
        }}
      >
        {ROOMS.map((room) => (
          <Link key={room.href} href={room.href} className="ftr-room">
            <span className="ftr-room-num">{room.num}</span>
            {room.name}
          </Link>
        ))}
      </nav>

      <style>{`
        .ftr-room {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
          text-decoration: none;
          display: inline-flex;
          gap: 7px;
          align-items: baseline;
          padding: 4px 0;
          transition: color 0.25s;
        }
        .ftr-room:hover { color: var(--warm-black); }
        .ftr-room:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 3px; }
        .ftr-room-num { font-size: 8px; color: var(--dust); }

        @media (max-width: 768px) {
          .ftr-top {
            padding: 20px 24px !important;
            flex-direction: column;
            gap: 10px;
          }
          .ftr-register { padding: 16px 24px !important; }
        }
      `}</style>
    </footer>
  );
}

const metaStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#5E574F",
};
