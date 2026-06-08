export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--warm-black)",
        padding: "24px 64px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "var(--paper)",
      }}
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
    </footer>
  );
}

const metaStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--dust)",
};
