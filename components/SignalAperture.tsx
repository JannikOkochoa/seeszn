"use client";

import { useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

type Theme = "light" | "dark";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getClientTheme(): Theme {
  return (document.documentElement.getAttribute("data-theme") as Theme) || "light";
}

function getServerTheme(): Theme {
  return "light";
}

export default function SignalAperture({ mobile }: { mobile?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const reduced = useReducedMotion();

  const theme = useSyncExternalStore(subscribe, getClientTheme, getServerTheme);
  const isDark = theme === "dark";

  function toggle() {
    if (animating && !reduced) return;
    const next: Theme = isDark ? "light" : "dark";
    if (!reduced) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 800);
    }
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("seeszn-theme", next); } catch {}
  }

  const size = mobile ? 40 : 36;

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isDark ? "Switch to Surface Mode" : "Switch to Signal Mode"}
      title={isDark ? "Surface Mode" : "Signal Mode"}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: hovered ? "var(--surface)" : "transparent",
        border: `1px solid ${hovered ? "var(--signal)" : "var(--line-strong)"}`,
        borderRadius: 999,
        cursor: "pointer",
        flexShrink: 0,
        padding: 0,
        transition: [
          "background 400ms ease",
          "border-color 400ms ease",
          reduced ? "" : "transform 700ms cubic-bezier(0.16,1,0.3,1)",
        ].filter(Boolean).join(", "),
        transform: animating && !reduced ? "rotate(38deg)" : "rotate(0deg)",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        style={{ display: "block", overflow: "visible" }}
      >
        {/* Outer circle — always visible */}
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" fill="none" />

        {/* Surface mode: horizontal line */}
        <line
          x1="3.5" y1="8" x2="12.5" y2="8"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? "scaleX(0)" : "scaleX(1)",
            transformOrigin: "8px 8px",
            transition: reduced ? "none" : "opacity 400ms cubic-bezier(0.16,1,0.3,1), transform 400ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        {/* Signal mode: inner ring */}
        <circle
          cx="8" cy="8" r="3"
          stroke="var(--text-muted)"
          strokeWidth="0.8"
          fill="none"
          style={{
            opacity: isDark ? 0.9 : 0,
            transition: reduced ? "none" : "opacity 500ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        {/* Signal mode: central signal dot */}
        <circle
          cx="8" cy="8" r="1.5"
          fill="var(--signal)"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? "scale(1)" : "scale(0)",
            transformOrigin: "8px 8px",
            transition: reduced ? "none" : "opacity 600ms cubic-bezier(0.16,1,0.3,1) 80ms, transform 600ms cubic-bezier(0.16,1,0.3,1) 80ms",
          }}
        />
      </svg>
    </button>
  );
}
