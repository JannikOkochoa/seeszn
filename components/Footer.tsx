"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/context";

export default function Footer() {
  const t = useTranslations();
  const f = t.footer;
  const diagHref = t.locale === "de" ? "/diagnosis" : "/en/diagnosis";

  return (
    <footer className="ft-root" role="contentinfo">

      {/* ── Main row ──────────────────────────────────────────── */}
      <div className="ft-main">

        {/* LEFT — wordmark + tagline */}
        <div className="ft-left">
          <span className="ft-wordmark">SEESZN</span>
          <p className="ft-tagline">{f.tagline}</p>
        </div>

        {/* CENTER — nav */}
        <nav className="ft-nav" aria-label="Footer navigation">
          {f.nav.map((item) => (
            <Link key={item.href} href={item.href} className="ft-nav-link">
              {item.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT — email + CTA */}
        <div className="ft-right">
          <a href="mailto:hello@seeszn.com" className="ft-email">
            {f.email}
          </a>
          <Link href={diagHref} className="ft-cta">
            {f.cta}
            <span className="ft-cta-arrow" aria-hidden="true">→</span>
          </Link>
        </div>

      </div>

      {/* ── Legal row ─────────────────────────────────────────── */}
      <div className="ft-legal">
        <nav className="ft-legal-links" aria-label="Legal">
          {f.legal.map((item) => (
            <Link key={item.href} href={item.href} className="ft-legal-link">
              {item.name}
            </Link>
          ))}
        </nav>
        <span className="ft-copy">{f.copy}</span>
      </div>

      <style>{`
        /* ── Root ──────────────────────────────────────────────── */
        .ft-root {
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
        }

        /* ── Main row ─────────────────────────────────────────── */
        .ft-main {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0 48px;
          align-items: start;
          padding: clamp(64px, 7vw, 88px) var(--gutter) clamp(56px, 6vw, 72px);
          border-bottom: 1px solid var(--line);
        }

        /* LEFT */
        .ft-left {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ft-wordmark {
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.01em;
          color: var(--warm-black);
          line-height: 1;
        }
        .ft-tagline {
          font-family: var(--font-editorial), serif;
          font-style: normal;
          font-size: 14px;
          line-height: 1.55;
          color: var(--text-secondary);
          max-width: 280px;
          margin: 0;
        }

        /* CENTER */
        .ft-nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          padding-top: 4px;
        }
        .ft-nav-link {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
          position: relative;
        }
        .ft-nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0;
          height: 1px;
          background: var(--olive);
          transition: width 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .ft-nav-link:hover { color: var(--text-primary); }
        .ft-nav-link:hover::after { width: 100%; }
        .ft-nav-link:focus-visible {
          outline: 1px solid var(--text-primary);
          outline-offset: 4px;
        }

        /* RIGHT */
        .ft-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 16px;
          padding-top: 4px;
        }
        .ft-email {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ft-email:hover { color: var(--text-primary); }
        .ft-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--warm-black);
          border: 1px solid var(--border-btn);
          padding: 12px 20px;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .ft-cta:hover {
          border-color: var(--border-btn-hovered);
          background: var(--button-hover-bg);
        }
        .ft-cta:focus-visible {
          outline: 1px solid var(--text-primary);
          outline-offset: 3px;
        }
        .ft-cta-arrow {
          font-family: var(--font-body), sans-serif;
          font-size: 12px;
          letter-spacing: 0;
          color: var(--olive);
        }

        /* ── Legal row ───────────────────────────────────────── */
        .ft-legal {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px var(--gutter);
        }
        .ft-legal-links {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        .ft-legal-link {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.06em;
          color: var(--text-faint);
          text-decoration: none;
          transition: color 0.2s;
          padding: 2px 0;
        }
        .ft-legal-link:hover { color: var(--text-muted); }
        .ft-legal-link:focus-visible {
          outline: 1px solid var(--text-primary);
          outline-offset: 3px;
        }
        .ft-copy {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          color: var(--text-faint);
          white-space: nowrap;
        }

        /* ── Mobile ──────────────────────────────────────────── */
        @media (max-width: 900px) {
          .ft-main {
            grid-template-columns: 1fr;
            gap: 40px 0;
            padding: 44px 24px 40px;
          }
          .ft-nav {
            align-items: flex-start;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 12px 24px;
          }
          .ft-right {
            align-items: flex-start;
            gap: 14px;
          }
          .ft-legal {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 16px 24px;
          }
          .ft-legal-links { gap: 16px; }
        }
      `}</style>
    </footer>
  );
}
