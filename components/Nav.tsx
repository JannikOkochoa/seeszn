"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import SignalAperture from "./SignalAperture";
import LanguageSwitch from "./LanguageSwitch";
import ScrollProgress from "./ScrollProgress";
import { useTranslations } from "@/lib/i18n/context";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─── CTA button ───────────────────────────────────────────────────────────────

function CtaButton({
  onClick,
  reduced,
  mobile,
}: {
  onClick: () => void;
  reduced: boolean | null;
  mobile?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const t = useTranslations();
  const diagHref = t.locale === "de" ? "/de/diagnosis" : "/diagnosis";

  return (
    <Link
      href={diagHref}
      onClick={onClick}
      aria-label="Book a diagnosis"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        border: `1px solid ${hovered ? "var(--border-btn-hovered)" : "var(--border-btn)"}`,
        padding: mobile ? "16px 26px" : "10px 20px",
        color: "var(--text-primary)",
        background: hovered ? "var(--button-hover-bg)" : "transparent",
        textDecoration: "none",
        whiteSpace: "nowrap",
        display: mobile ? "flex" : "inline-flex",
        alignItems: "center",
        justifyContent: mobile ? "center" : undefined,
        gap: 6,
        minHeight: 44,
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      {t.nav.cta}
      <span
        aria-hidden="true"
        style={{
          color: "var(--signal)",
          display: "inline-block",
          transform: hovered && !reduced ? "translateX(4px)" : "translateX(0px)",
          transition: reduced ? "none" : "transform 300ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        →
      </span>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Nav() {
  const nt = useTranslations();
  const n = nt.nav;

  const isDE = nt.locale === "de";
  const base = isDE ? "/de" : "";

  // All four nav links as direct links — no dropdown, no mega panel
  const NAV_LINKS = [
    { label: n.services, href: `${base}/services` },
    { label: n.work,     href: `${base}/work`     },
    { label: n.insights, href: `${base}/insights` },
    { label: n.about,    href: `${base}/about`    },
  ];

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled,   setScrolled]     = useState(false);
  const [hoveredNav, setHoveredNav]   = useState<string | null>(null);
  const reduced = useReducedMotion();

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Body scroll lock while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Escape key closes mobile drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const closeAll = () => setMobileOpen(false);

  const mainBarH = scrolled ? 64 : 80;

  const signalLine = (active: boolean, thick?: boolean): React.CSSProperties => ({
    display: "block",
    width: "100%",
    height: thick && active ? 2 : 1,
    background: "var(--signal)",
    transform: active ? "scaleX(1)" : "scaleX(0)",
    transformOrigin: "left",
    transition: reduced
      ? "none"
      : `transform 520ms cubic-bezier(${EASE.join(",")})`,
    marginTop: 5,
  });

  return (
    <>
      {/* ── Site-wide scroll HUD ─────────────────────────────────────────── */}
      <ScrollProgress />

      {/* ── Sticky nav shell ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        {/* Utility bar */}
        <div
          aria-hidden="true"
          style={{
            height: scrolled ? 0 : 26,
            opacity: scrolled ? 0 : 1,
            overflow: "hidden",
            background: "var(--paper)",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: reduced
              ? "none"
              : "height 420ms cubic-bezier(0.16,1,0.3,1), opacity 240ms",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              whiteSpace: "nowrap",
            }}
          >
            {n.utilityBar}
          </p>
        </div>

        {/* Main header bar */}
        <header
          style={{
            height: mainBarH,
            background: "var(--paper)",
            borderBottom: `1px solid ${
              scrolled ? "var(--border-nav-scrolled)" : "var(--border-nav)"
            }`,
            transition: reduced
              ? "none"
              : "height 420ms cubic-bezier(0.16,1,0.3,1), border-color 420ms",
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
            <Link
              href={isDE ? "/de" : "/"}
              aria-label="SEESZN — Return to home"
              onClick={closeAll}
              style={{
                textDecoration: "none",
                display: "inline-block",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(24px, 2vw, 34px)",
                  letterSpacing: "-0.08em",
                  color: "var(--warm-black)",
                  lineHeight: 0.85,
                  display: "block",
                }}
              >
                SEESZN
              </span>
              <motion.div
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 2,
                  background: "var(--signal)",
                  marginTop: 6,
                  originX: 0,
                }}
                initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
              />
            </Link>

            {/* Desktop nav — four direct links, no dropdown */}
            <nav
              aria-label="Primary navigation"
              className="hidden md:flex"
              style={{ gap: 36, alignItems: "center" }}
            >
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeAll}
                  onMouseEnter={() => setHoveredNav(item.label)}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{
                    fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    padding: "8px 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    minHeight: 44,
                    justifyContent: "center",
                  }}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    style={signalLine(hoveredNav === item.label)}
                  />
                </Link>
              ))}
            </nav>

            {/* Language switch + theme toggle + CTA */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: 12 }}>
              <LanguageSwitch />
              <SignalAperture />
              <CtaButton onClick={closeAll} reduced={reduced} />
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-primary)",
                cursor: "pointer",
                padding: "12px 0",
                minHeight: 44,
              }}
            >
              {mobileOpen ? "CLOSE" : "MENU"}
            </button>
          </div>
        </header>
        {/* ── No mega panel — DISCOVER is a direct link ─────────────────── */}
      </div>

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={reduced ? undefined : { x: "100%" }}
            animate={reduced ? undefined : { x: 0 }}
            exit={reduced ? undefined : { x: "100%" }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{
              position: "fixed",
              inset: 0,
              background: "var(--paper)",
              zIndex: 200,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Drawer header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "24px 32px",
                borderBottom: "1px solid var(--line)",
                flexShrink: 0,
              }}
            >
              <Link
                href={isDE ? "/de" : "/"}
                onClick={closeAll}
                aria-label="SEESZN — Home"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 800,
                  fontSize: 28,
                  letterSpacing: "-0.08em",
                  color: "var(--warm-black)",
                  textDecoration: "none",
                  lineHeight: 1,
                }}
              >
                SEESZN
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  padding: "12px 0",
                  minHeight: 44,
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer links — all direct, no accordion */}
            <nav
              aria-label="Mobile navigation"
              style={{ flex: 1, padding: "32px 32px 0" }}
            >
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeAll}
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(28px, 8vw, 40px)",
                    letterSpacing: "-0.04em",
                    textTransform: "uppercase",
                    color: "var(--warm-black)",
                    textDecoration: "none",
                    display: "block",
                    padding: "16px 0",
                    borderBottom: "1px solid var(--line)",
                    minHeight: 44,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Drawer CTA + language */}
            <div style={{ padding: "32px", flexShrink: 0 }}>
              <div style={{ marginBottom: 20 }}>
                <LanguageSwitch mobile />
              </div>
              <CtaButton onClick={closeAll} reduced={reduced} mobile />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
