"use client";

import { useState } from "react";

const NAV_ITEMS = ["WORK", "METHOD", "INTELLIGENCE", "ABOUT"];

export default function Nav() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "var(--paper)",
        borderBottom: "1px solid var(--warm-black)",
        height: 64,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 64px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "-0.01em",
              color: "var(--warm-black)",
              lineHeight: 1,
            }}
          >
            SEESZN
          </span>
          <div
            style={{
              width: 32,
              height: 2,
              background: "var(--olive)",
              marginTop: 4,
            }}
          />
        </div>

        {/* Center nav — hidden on mobile */}
        <div
          className="hidden md:flex"
          style={{ gap: 40, alignItems: "center" }}
        >
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item}
              onClick={() => setActive(active === i ? null : i)}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--warm-black)",
                background: "none",
                border: "none",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              {item}
              <span
                className="olive-dot"
                style={{
                  width: 4,
                  height: 4,
                  background: "var(--olive)",
                  opacity: active === i ? 1 : 0,
                  transition: "opacity 0.15s",
                }}
              />
            </button>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#contact"
          className="nav-cta hidden md:inline-block"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            border: "1px solid var(--warm-black)",
            padding: "10px 20px",
            color: "var(--warm-black)",
            background: "transparent",
            transition: "background 0.2s, color 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "var(--warm-black)";
            el.style.color = "var(--paper)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "transparent";
            el.style.color = "var(--warm-black)";
          }}
        >
          START A DIAGNOSIS{" "}
          <span style={{ color: "var(--olive)" }}>→</span>
        </a>

        {/* Mobile: wordmark already left, just show CTA */}
        <a
          href="#contact"
          className="md:hidden"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            border: "1px solid var(--warm-black)",
            padding: "8px 14px",
            color: "var(--warm-black)",
            background: "transparent",
          }}
        >
          DIAGNOSE <span style={{ color: "var(--olive)" }}>→</span>
        </a>
      </div>
    </nav>
  );
}
