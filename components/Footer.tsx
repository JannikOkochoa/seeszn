"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/context";

export default function Footer() {
  const t = useTranslations();
  const f = t.footer;
  const ROOMS = f.rooms;
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
        <span style={metaStyle}>{f.location}</span>

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
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          display: inline-flex;
          gap: 7px;
          align-items: baseline;
          padding: 4px 0;
          transition: color 0.25s;
        }
        .ftr-room:hover { color: var(--text-primary); }
        .ftr-room:focus-visible { outline: 1px solid var(--text-primary); outline-offset: 3px; }
        .ftr-room-num { font-size: 9px; color: var(--text-faint); font-family: var(--font-mono), monospace; }

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
  fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--text-body)",
};
