"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/context";

interface Section {
  num: string;
  heading: string;
  body: string;
}

interface LegalLayoutProps {
  accession: string;
  meta: string;
  title: string;
  subtitle: string;
  sections: Section[];
  footer?: string;
  /** Which tab is active — for the sibling nav */
  active: "legal" | "privacy";
}

export default function LegalLayout({
  accession,
  meta,
  title,
  subtitle,
  sections,
  footer,
  active,
}: LegalLayoutProps) {
  const t = useTranslations();
  const ln = t.legalNav;

  return (
    <article className="ll-root">
      {/* Page header */}
      <header className="ll-header">
        <div className="ll-header-top">
          <span className="ll-meta">{meta}</span>
          <span className="ll-accession">{accession}</span>
        </div>

        <h1 className="ll-title">{title}</h1>
        <p className="ll-subtitle">{subtitle}</p>

        {/* Sibling nav */}
        <nav className="ll-sibnav" aria-label="Legal pages">
          <Link
            href={active === "legal" ? "#" : (t.locale === "de" ? "/legal" : "/en/legal")}
            className={`ll-siblink${active === "legal" ? " ll-siblink--active" : ""}`}
            aria-current={active === "legal" ? "page" : undefined}
          >
            {ln.legal}
          </Link>
          <span className="ll-sibdiv" aria-hidden="true" />
          <Link
            href={active === "privacy" ? "#" : (t.locale === "de" ? "/privacy" : "/en/privacy")}
            className={`ll-siblink${active === "privacy" ? " ll-siblink--active" : ""}`}
            aria-current={active === "privacy" ? "page" : undefined}
          >
            {ln.privacy}
          </Link>
          <span className="ll-sibdiv" aria-hidden="true" />
          <a href="mailto:contact@okriholdings.com" className="ll-siblink">
            {ln.contact}
          </a>
        </nav>
      </header>

      {/* Sections */}
      <div className="ll-body">
        {sections.map((s, i) => (
          <section key={s.num} className="ll-section">
            {i === 0 && <div className="ll-rule" aria-hidden="true" />}
            <div className="ll-section-inner">
              <div className="ll-section-left">
                <span className="ll-num">{s.num}</span>
              </div>
              <div className="ll-section-right">
                <h2 className="ll-heading">{s.heading}</h2>
                <div className="ll-text">
                  {s.body.split("\n\n").map((para, pi) => (
                    <p key={pi} className="ll-para">
                      {para.split("\n").map((line, li, arr) => (
                        <span key={li}>
                          {line}
                          {li < arr.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <div className="ll-rule" aria-hidden="true" />
          </section>
        ))}

        {footer && (
          <p className="ll-footer-note">{footer}</p>
        )}
      </div>

      <style>{`
        .ll-root {
          background: var(--paper);
          min-height: 60vh;
        }

        /* ── Header ────────────────────────────────────── */
        .ll-header {
          padding: 120px 64px 64px;
          border-bottom: 1px solid var(--warm-black);
          max-width: 1200px;
        }
        .ll-header-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 40px;
        }
        .ll-meta {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .ll-accession {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--dust);
        }
        .ll-title {
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: clamp(44px, 6vw, 96px);
          line-height: 0.95;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: var(--warm-black);
          margin: 0 0 20px;
        }
        .ll-subtitle {
          font-family: var(--font-editorial), serif;
          font-style: normal;
          font-size: clamp(17px, 1.6vw, 22px);
          color: var(--text-secondary);
          margin: 0 0 44px;
          max-width: 540px;
        }

        /* ── Sibling nav ───────────────────────────────── */
        .ll-sibnav {
          display: inline-flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--line-strong);
        }
        .ll-siblink {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          padding: 10px 18px;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .ll-siblink:hover { color: var(--text-primary); background: var(--surface); }
        .ll-siblink--active {
          color: var(--warm-black);
          background: var(--surface);
          pointer-events: none;
        }
        .ll-sibdiv {
          display: block;
          width: 1px;
          height: 36px;
          background: var(--line-strong);
          flex-shrink: 0;
        }

        /* ── Body ──────────────────────────────────────── */
        .ll-body {
          padding: 0 64px 96px;
          max-width: 1200px;
        }

        /* ── Section ───────────────────────────────────── */
        .ll-section { }
        .ll-rule {
          height: 1px;
          background: var(--line);
        }
        .ll-section-inner {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 0 48px;
          padding: 40px 0;
        }
        .ll-section-left {
          padding-top: 4px;
        }
        .ll-num {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: var(--dust);
        }
        .ll-heading {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(14px, 1.1vw, 18px);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--warm-black);
          margin: 0 0 16px;
        }
        .ll-text { max-width: 680px; }
        .ll-para {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          line-height: 1.75;
          color: var(--text-body);
          margin: 0 0 14px;
        }
        .ll-para:last-child { margin-bottom: 0; }

        .ll-footer-note {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--dust);
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid var(--line);
        }

        /* ── Mobile ────────────────────────────────────── */
        @media (max-width: 768px) {
          .ll-header { padding: 100px 24px 48px; }
          .ll-body { padding: 0 24px 72px; }
          .ll-section-inner {
            grid-template-columns: 1fr;
            gap: 8px 0;
            padding: 28px 0;
          }
          .ll-sibnav { flex-wrap: wrap; }
        }
      `}</style>
    </article>
  );
}
