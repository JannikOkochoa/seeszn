"use client";

import { useState, useEffect, useId, startTransition } from "react";
import Link from "next/link";

type FormState = "idle" | "loading" | "success" | "error";

// ── Preview card thumbnails ──────────────────────────────────────────────────

function PreviewCard({
  pageNum,
  title,
  dark,
  variant,
}: {
  pageNum: string;
  title: string;
  dark?: boolean;
  variant: "cover" | "staircase" | "layers" | "case" | "checklist";
}) {
  return (
    <div className={`prev-card ${dark ? "prev-card--dark" : ""}`}>
      <div className="prev-inner">
        {/* Abstract page content by variant */}
        {variant === "cover" && (
          <div className="prev-cover">
            <div className="prev-eyebrow" />
            <div className="prev-rule" />
            <div className="prev-title-lg" />
            <div className="prev-title-md" />
            <div className="prev-spacer" />
            <div className="prev-sub" />
          </div>
        )}
        {variant === "staircase" && (
          <div className="prev-staircase">
            <div className="prev-label-sm" />
            <div className="prev-stair-wrap">
              {["01", "02", "03", "04", "05"].map((n) => (
                <div key={n} className="prev-stair-row">
                  <span className="prev-stair-n">{n}</span>
                  <div className="prev-stair-line" style={{ width: `${40 + parseInt(n) * 10}%` }} />
                </div>
              ))}
            </div>
            <div className="prev-merksatz-block" />
          </div>
        )}
        {variant === "layers" && (
          <div className="prev-layers">
            <div className="prev-headline-pale" />
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="prev-layer-row">
                <div className="prev-layer-bar" style={{ opacity: 0.3 + n * 0.14 }} />
              </div>
            ))}
          </div>
        )}
        {variant === "case" && (
          <div className="prev-case">
            <div className="prev-eyebrow-sm" />
            <div className="prev-body-lines">
              {[80, 100, 72, 95, 60, 88].map((w, i) => (
                <div key={i} className="prev-body-line" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="prev-rule-light" />
            <div className="prev-cite" />
          </div>
        )}
        {variant === "checklist" && (
          <div className="prev-checklist">
            {["IDENTITÄT", "STRUKTUR", "EVIDENZ", "QUELLEN", "DIAGNOSE"].map((l) => (
              <div key={l} className="prev-check-group">
                <div className="prev-check-label" />
                <div className="prev-check-row"><div className="prev-check-box" /><div className="prev-check-text" /></div>
                <div className="prev-check-row"><div className="prev-check-box" /><div className="prev-check-text" style={{ width: "75%" }} /></div>
              </div>
            ))}
          </div>
        )}
        {/* Page number */}
        <span className="prev-pagenum">{pageNum}</span>
      </div>
      <p className="prev-title">{title}</p>
    </div>
  );
}

// ── Email form ────────────────────────────────────────────────────────────────

function BriefForm({
  onSuccess,
  dark,
}: {
  onSuccess: () => void;
  dark?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const emailId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    setState("loading");

    try {
      const res = await fetch("/api/brief-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (res.ok) {
        try {
          localStorage.setItem("seesznBriefSubmitted", "true");
          localStorage.setItem("seesznBriefEmail", trimmed);
        } catch {
          // localStorage may be blocked in some environments
        }
        setState("success");
        onSuccess();
      } else {
        const data = (await res.json()) as { error?: string };
        setErrorMsg(data.error ?? "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
        setState("error");
      }
    } catch {
      setErrorMsg("Verbindungsfehler. Bitte versuche es erneut.");
      setState("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bf-form ${dark ? "bf-form--dark" : ""}`}
      noValidate
      aria-label="Brief anfordern"
    >
      <div className="bf-field">
        <label htmlFor={emailId} className="bf-label">
          E-Mail-Adresse
        </label>
        <input
          id={emailId}
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@firma.de"
          className="bf-input"
          autoComplete="email"
          disabled={state === "loading"}
          aria-required="true"
          aria-invalid={state === "error" ? "true" : undefined}
          aria-describedby={errorMsg ? `${emailId}-error` : undefined}
        />
        {(state === "error" || errorMsg) && (
          <p
            id={`${emailId}-error`}
            className="bf-error"
            role="alert"
            aria-live="assertive"
          >
            {errorMsg}
          </p>
        )}
      </div>

      <button
        type="submit"
        className={`bf-btn ${state === "loading" ? "bf-btn--loading" : ""}`}
        disabled={state === "loading"}
      >
        {state === "loading" ? "Einen Moment …" : "Brief erhalten"}
        {state !== "loading" && <span className="bf-btn-arrow" aria-hidden="true">→</span>}
      </button>

      <p className="bf-consent">
        Mit der Anfrage erlaubst du uns, dir den Brief und gelegentliche SEESZN Visibility Notes
        zu senden. Du kannst dich jederzeit abmelden.{" "}
        <Link href="/privacy" className="bf-privacy-link">
          Datenschutz
        </Link>
      </p>
    </form>
  );
}

// ── Download button ───────────────────────────────────────────────────────────

function DownloadButton({ dark }: { dark?: boolean }) {
  return (
    <a
      href="/briefs/ki-sichtbarkeits-brief-2026.pdf"
      download="ki-sichtbarkeits-brief-2026.pdf"
      className={`bf-download ${dark ? "bf-download--dark" : ""}`}
    >
      PDF herunterladen
      <span className="bf-btn-arrow" aria-hidden="true">↓</span>
    </a>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BriefLanding() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const submitted = localStorage.getItem("seesznBriefSubmitted") === "true";
      if (submitted) {
        startTransition(() => setSubmitted(true));
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  function handleSuccess() {
    setSubmitted(true);
  }

  return (
    <>
      {/* ── Minimal header ── */}
      <header className="bh-header">
        <Link href="/" className="bh-wordmark">
          SEESZN
        </Link>
        <span className="bh-pill">Research Brief · 2026</span>
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="bl-hero">
          <div className="bl-hero-inner">
            <div className="bl-hero-text">
              <p className="bl-eyebrow">SEESZN Research Brief · 2026</p>
              <div className="bl-rule" aria-hidden="true" />
              <h1 className="bl-headline">
                Warum gute B2B-Firmen in KI-Suchen unsichtbar werden
              </h1>
              <p className="bl-subtitle">
                Ein unabhängiger Leitfaden für Marken, die gefunden, verstanden und zitiert werden wollen.
              </p>
              <p className="bl-body">
                Viele B2B-Firmen sind fachlich stark, aber digital nicht lesbar genug.
                Dieser Brief erklärt, warum klassische Sichtbarkeit nicht mehr reicht —
                und wie Unternehmen abrufbar, zitierbar und vertrauenswürdig werden.
              </p>
            </div>

            <div className="bl-hero-form">
              {submitted ? (
                <div
                  className="bl-success"
                  role="status"
                  aria-live="polite"
                >
                  <p className="bl-success-headline">Brief ist freigeschaltet.</p>
                  <p className="bl-success-sub">Du kannst ihn jetzt herunterladen.</p>
                  <DownloadButton />
                </div>
              ) : (
                <BriefForm onSuccess={handleSuccess} />
              )}
              <p className="bl-footnote">
                20 Seiten. Kein Sales-PDF. Ein strategischer Leitfaden mit Fallbeispiel und Checkliste.
              </p>
            </div>
          </div>
        </section>

        {/* ── Preview section ── */}
        <section className="bl-previews">
          <div className="bl-section-inner">
            <p className="bl-section-label">Aus dem Brief</p>
            <div className="bl-preview-row" role="list">
              <div role="listitem">
                <PreviewCard pageNum="01" title="Cover" variant="cover" />
              </div>
              <div role="listitem">
                <PreviewCard
                  pageNum="05"
                  title="Indexiert ist nicht abrufbar"
                  variant="staircase"
                />
              </div>
              <div role="listitem">
                <PreviewCard
                  pageNum="08"
                  title="Das 5-Ebenen-Modell"
                  variant="layers"
                  dark
                />
              </div>
              <div role="listitem">
                <PreviewCard
                  pageNum="14"
                  title="Fallbeispiel Firma A"
                  variant="case"
                />
              </div>
              <div role="listitem">
                <PreviewCard
                  pageNum="17"
                  title="Checkliste"
                  variant="checklist"
                  dark
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── What you'll learn — dark section ── */}
        <section className="bl-learn">
          <div className="bl-section-inner">
            <h2 className="bl-section-headline">Was du im Brief lernst</h2>
            <ul className="bl-learn-list">
              {[
                "warum indexiert nicht abrufbar bedeutet",
                "warum B2B-Firmen besonders betroffen sind",
                "wie KI-Systeme Quellen, Vergleiche und Belege nutzen",
                "warum Websites zu Beweisflächen werden müssen",
                "wie das 5-Ebenen-Modell funktioniert",
                "wie Firma A ihre Sichtbarkeit strategisch verbessert",
                "welche 14 Fragen zeigen, ob deine Firma abrufbar ist",
              ].map((item) => (
                <li key={item} className="bl-learn-item">
                  <span className="bl-learn-dash" aria-hidden="true">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── No hype section ── */}
        <section className="bl-nohype">
          <div className="bl-section-inner bl-section-inner--narrow">
            <h2 className="bl-nohype-headline">Kein KI-Hype. Kein SEO-Blabla.</h2>
            <p className="bl-nohype-body">
              Der Brief erklärt Sichtbarkeit ohne Buzzwords. Er zeigt, warum gute Firmen
              verschwinden können, obwohl sie fachlich stark sind — und wie Unternehmen
              beginnen können, ihre Substanz so zu strukturieren, dass Menschen und
              Maschinen sie verstehen.
            </p>
          </div>
        </section>

        {/* ── Contents section ── */}
        <section className="bl-contents">
          <div className="bl-section-inner">
            <div className="bl-rule" aria-hidden="true" />
            <h2 className="bl-contents-headline">Enthalten</h2>
            <ul className="bl-contents-list">
              {[
                "20 Seiten",
                "5-Ebenen-Modell",
                "fiktives B2B-Fallbeispiel",
                "Checkliste",
                "Glossar",
                "konkrete erste Schritte",
              ].map((item) => (
                <li key={item} className="bl-contents-item">
                  <span className="bl-contents-dot" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Bottom CTA — dark section ── */}
        <section className="bl-bottom-cta">
          <div className="bl-section-inner bl-section-inner--narrow">
            <p className="bl-eyebrow bl-eyebrow--dark">SEESZN Research Brief · 2026</p>
            <div className="bl-rule bl-rule--dark" aria-hidden="true" />
            <h2 className="bl-cta-headline">
              Brief erhalten
            </h2>
            <p className="bl-cta-sub">
              Kostenlos. Ohne Pitch. Ein strategischer Leitfaden.
            </p>

            {submitted ? (
              <div
                className="bl-success bl-success--dark"
                role="status"
                aria-live="polite"
              >
                <p className="bl-success-headline">Brief ist freigeschaltet.</p>
                <p className="bl-success-sub bl-success-sub--dark">Du kannst ihn jetzt herunterladen.</p>
                <DownloadButton dark />
              </div>
            ) : (
              <BriefForm onSuccess={handleSuccess} dark />
            )}
          </div>
        </section>

        {/* ── Minimal footer ── */}
        <footer className="bl-footer">
          <div className="bl-footer-inner">
            <div className="bl-footer-rule" aria-hidden="true" />
            <div className="bl-footer-row">
              <span className="bl-footer-copy">DER KI-SICHTBARKEITS-BRIEF · 2026</span>
              <nav className="bl-footer-nav" aria-label="Brief navigation">
                <Link href="/" className="bl-footer-link">SEESZN.COM</Link>
                <Link href="/privacy" className="bl-footer-link">Datenschutz</Link>
                <Link href="/brief/ki-sichtbarkeit/print" className="bl-footer-link bl-footer-link--subtle">
                  Druckversion
                </Link>
              </nav>
            </div>
          </div>
        </footer>

      </main>

      <style>{`
        /* ── Reset / base ───────────────────────────────────── */
        .bh-header,
        .bl-hero,
        .bl-previews,
        .bl-learn,
        .bl-nohype,
        .bl-contents,
        .bl-bottom-cta,
        .bl-footer {
          box-sizing: border-box;
        }

        /* ── Header ─────────────────────────────────────────── */
        .bh-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 64px;
          border-bottom: 1px solid #c9c0ae;
          background: #ebe5d8;
        }
        .bh-wordmark {
          font-family: var(--font-display), sans-serif;
          font-weight: 800;
          font-size: 18px;
          letter-spacing: 0.02em;
          color: #1f1e1a;
          text-decoration: none;
        }
        .bh-pill {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #81796a;
        }

        /* ── Shared inner wrapper ────────────────────────────── */
        .bl-section-inner {
          max-width: 1040px;
          margin: 0 auto;
          padding: 0 64px;
        }
        .bl-section-inner--narrow {
          max-width: 680px;
          padding: 0 64px;
        }

        /* ── Shared rule ─────────────────────────────────────── */
        .bl-rule {
          height: 1px;
          background: #c9c0ae;
          margin: 28px 0;
        }
        .bl-rule--dark {
          background: #343226;
        }

        /* ── Shared eyebrow ──────────────────────────────────── */
        .bl-eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #81796a;
          margin: 0;
        }
        .bl-eyebrow--dark {
          color: #8f897b;
        }

        /* ── Hero section ────────────────────────────────────── */
        .bl-hero {
          background: #ebe5d8;
          padding: 80px 0 96px;
        }
        .bl-hero-inner {
          max-width: 1040px;
          margin: 0 auto;
          padding: 0 64px;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 80px;
          align-items: start;
        }
        .bl-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 500;
          font-size: clamp(2rem, 3.5vw, 3rem);
          line-height: 1.18;
          letter-spacing: -0.02em;
          color: #1f1e1a;
          margin: 0 0 24px;
          max-width: 18ch;
        }
        .bl-subtitle {
          font-family: var(--font-editorial), serif;
          font-style: normal;
          font-size: 1.05rem;
          line-height: 1.6;
          color: #4a463d;
          margin: 0 0 24px;
          max-width: 52ch;
        }
        .bl-body {
          font-family: var(--font-body), sans-serif;
          font-size: 0.94rem;
          line-height: 1.7;
          color: #4a463d;
          margin: 0;
          max-width: 55ch;
        }
        .bl-footnote {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #81796a;
          margin: 20px 0 0;
          line-height: 1.5;
        }

        /* ── Hero form card ──────────────────────────────────── */
        .bl-hero-form {
          padding: 36px 36px 32px;
          border: 1px solid #c9c0ae;
          background: #f2eee5;
        }

        /* ── Success state ───────────────────────────────────── */
        .bl-success {
          padding: 8px 0 0;
        }
        .bl-success-headline {
          font-family: var(--font-editorial), serif;
          font-size: 1.15rem;
          font-weight: 500;
          color: #1f1e1a;
          margin: 0 0 6px;
        }
        .bl-success-sub {
          font-family: var(--font-body), sans-serif;
          font-size: 0.88rem;
          color: #81796a;
          margin: 0 0 20px;
        }
        .bl-success-sub--dark {
          color: #8f897b;
        }

        /* ── Form styles ─────────────────────────────────────── */
        .bf-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .bf-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .bf-label {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #81796a;
        }
        .bf-form--dark .bf-label {
          color: #8f897b;
        }
        .bf-input {
          width: 100%;
          padding: 14px 16px;
          font-family: var(--font-body), sans-serif;
          font-size: 0.94rem;
          color: #1f1e1a;
          background: transparent;
          border: 1px solid #c9c0ae;
          outline: none;
          transition: border-color 0.2s;
          border-radius: 0 !important;
        }
        .bf-form--dark .bf-input {
          color: #eee6d6;
          border-color: #343226;
          background: rgba(238,230,214,0.04);
        }
        .bf-input::placeholder {
          color: #a69d8c;
        }
        .bf-form--dark .bf-input::placeholder {
          color: #6f695d;
        }
        .bf-input:focus {
          border-color: #8d8372;
        }
        .bf-form--dark .bf-input:focus {
          border-color: #5a5544;
        }
        .bf-input:focus-visible {
          outline: 2px solid #1f1e1a;
          outline-offset: -2px;
        }
        .bf-error {
          font-family: var(--font-body), sans-serif;
          font-size: 0.82rem;
          color: #9a4f32;
          margin: 4px 0 0;
        }
        .bf-form--dark .bf-error {
          color: #c4894b;
        }
        .bf-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          padding: 15px 20px;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #1f1e1a;
          background: transparent;
          border: 1px solid #8d8372;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          margin-top: 4px;
        }
        .bf-btn:hover:not(:disabled) {
          background: #e2dbcc;
          border-color: #1f1e1a;
        }
        .bf-form--dark .bf-btn {
          color: #eee6d6;
          border-color: #5a5544;
        }
        .bf-form--dark .bf-btn:hover:not(:disabled) {
          background: rgba(238,230,214,0.06);
          border-color: #8f897b;
        }
        .bf-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .bf-btn:focus-visible {
          outline: 2px solid #1f1e1a;
          outline-offset: 2px;
        }
        .bf-btn-loading {
          justify-content: center;
        }
        .bf-btn-arrow {
          font-family: var(--font-body), sans-serif;
          font-size: 14px;
          letter-spacing: 0;
          color: #c4d83f;
        }
        .bf-form--dark .bf-btn-arrow {
          color: #c8df3f;
        }
        .bf-consent {
          font-family: var(--font-body), sans-serif;
          font-size: 0.75rem;
          line-height: 1.6;
          color: #81796a;
          margin: 14px 0 0;
        }
        .bf-form--dark .bf-consent {
          color: #6f695d;
        }
        .bf-privacy-link {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 2px;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .bf-privacy-link:hover {
          opacity: 1;
        }

        /* ── Download button ─────────────────────────────────── */
        .bf-download {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 15px 24px;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #1f1e1a;
          border: 1px solid #8d8372;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .bf-download:hover {
          background: #e2dbcc;
          border-color: #1f1e1a;
        }
        .bf-download--dark {
          color: #eee6d6;
          border-color: #5a5544;
        }
        .bf-download--dark:hover {
          background: rgba(238,230,214,0.06);
          border-color: #8f897b;
        }
        .bf-download:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }

        /* ── Preview cards ───────────────────────────────────── */
        .bl-previews {
          background: #f2eee5;
          padding: 80px 0;
          border-top: 1px solid #c9c0ae;
          border-bottom: 1px solid #c9c0ae;
        }
        .bl-section-label {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #81796a;
          margin: 0 0 40px;
        }
        .bl-preview-row {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .bl-preview-row::-webkit-scrollbar { display: none; }
        .bl-preview-row > div {
          flex: 0 0 auto;
        }
        .prev-card {
          width: 168px;
          cursor: default;
          user-select: none;
        }
        .prev-inner {
          width: 168px;
          height: 238px;
          background: #ebe5d8;
          border: 1px solid #c9c0ae;
          padding: 16px 14px 12px;
          position: relative;
          overflow: hidden;
        }
        .prev-card--dark .prev-inner {
          background: #0f100d;
          border-color: #343226;
        }
        .prev-title {
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #81796a;
          margin: 10px 0 0;
          line-height: 1.4;
        }
        .prev-pagenum {
          position: absolute;
          bottom: 8px;
          right: 10px;
          font-family: var(--font-editorial), serif;
          font-size: 40px;
          font-weight: 400;
          color: #c9c0ae;
          line-height: 1;
          opacity: 0.45;
        }
        .prev-card--dark .prev-pagenum {
          color: #343226;
          opacity: 0.8;
        }

        /* Cover variant */
        .prev-cover { display: flex; flex-direction: column; gap: 0; }
        .prev-eyebrow { height: 3px; background: #8d8372; width: 70%; margin-bottom: 10px; opacity: 0.5; }
        .prev-rule { height: 1px; background: #c9c0ae; margin-bottom: 12px; }
        .prev-title-lg { height: 7px; background: #4a463d; width: 90%; margin-bottom: 7px; opacity: 0.7; }
        .prev-title-md { height: 7px; background: #4a463d; width: 65%; margin-bottom: 20px; opacity: 0.7; }
        .prev-spacer { flex: 1; }
        .prev-sub { height: 3px; background: #81796a; width: 45%; opacity: 0.5; }

        /* Staircase variant */
        .prev-staircase { display: flex; flex-direction: column; gap: 0; height: 100%; }
        .prev-label-sm { height: 3px; background: #8d8372; width: 50%; margin-bottom: 12px; opacity: 0.4; }
        .prev-stair-wrap { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .prev-stair-row { display: flex; align-items: center; gap: 6px; }
        .prev-stair-n { font-family: var(--font-mono), monospace; font-size: 7px; color: #81796a; width: 12px; flex-shrink: 0; }
        .prev-stair-line { height: 1px; background: #8d8372; transition: none; }
        .prev-merksatz-block { height: 22px; border-top: 1px solid #c9c0ae; margin-top: 8px; padding-top: 6px; }

        /* Layers variant (dark) */
        .prev-layers { display: flex; flex-direction: column; gap: 0; height: 100%; }
        .prev-headline-pale { height: 6px; background: #eee6d6; width: 80%; opacity: 0.2; margin-bottom: 14px; }
        .prev-layer-row { margin-bottom: 6px; }
        .prev-layer-bar { height: 18px; background: #eee6d6; width: 100%; }

        /* Case variant */
        .prev-case { display: flex; flex-direction: column; gap: 0; height: 100%; }
        .prev-eyebrow-sm { height: 2px; background: #81796a; width: 40%; margin-bottom: 10px; opacity: 0.4; }
        .prev-body-lines { display: flex; flex-direction: column; gap: 5px; flex: 1; }
        .prev-body-line { height: 2px; background: #4a463d; opacity: 0.25; }
        .prev-rule-light { height: 1px; background: #c9c0ae; margin: 8px 0; }
        .prev-cite { height: 4px; background: #8d8372; width: 85%; opacity: 0.5; }

        /* Checklist variant (dark) */
        .prev-checklist { display: flex; flex-direction: column; gap: 5px; height: 100%; }
        .prev-check-group { display: flex; flex-direction: column; gap: 3px; }
        .prev-check-label { height: 2px; background: #8f897b; width: 40%; margin-bottom: 2px; opacity: 0.6; }
        .prev-check-row { display: flex; align-items: center; gap: 5px; }
        .prev-check-box { width: 6px; height: 6px; border: 1px solid #5a5544; flex-shrink: 0; }
        .prev-check-text { height: 2px; background: #eee6d6; opacity: 0.2; width: 88%; }

        /* ── Learn section (dark) ────────────────────────────── */
        .bl-learn {
          background: #0f100d;
          padding: 96px 0;
        }
        .bl-section-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(1.6rem, 2.5vw, 2.2rem);
          color: #eee6d6;
          margin: 0 0 44px;
          letter-spacing: -0.01em;
        }
        .bl-learn-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .bl-learn-item {
          display: flex;
          gap: 16px;
          align-items: baseline;
          padding: 16px 0;
          border-bottom: 1px solid #343226;
          font-family: var(--font-body), sans-serif;
          font-size: 0.95rem;
          color: #d8cfbd;
          line-height: 1.55;
        }
        .bl-learn-item:first-child {
          border-top: 1px solid #343226;
        }
        .bl-learn-dash {
          color: #c8df3f;
          flex-shrink: 0;
          font-size: 0.85rem;
        }

        /* ── No hype section ─────────────────────────────────── */
        .bl-nohype {
          background: #ebe5d8;
          padding: 96px 0;
        }
        .bl-nohype-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(1.4rem, 2vw, 1.9rem);
          color: #1f1e1a;
          margin: 0 0 28px;
          letter-spacing: -0.01em;
        }
        .bl-nohype-body {
          font-family: var(--font-body), sans-serif;
          font-size: 1rem;
          line-height: 1.75;
          color: #4a463d;
          margin: 0;
          max-width: 60ch;
        }

        /* ── Contents section ────────────────────────────────── */
        .bl-contents {
          background: #f2eee5;
          padding: 64px 0 80px;
          border-top: 1px solid #c9c0ae;
        }
        .bl-contents-headline {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #81796a;
          margin: 0 0 24px;
        }
        .bl-contents-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bl-contents-item {
          display: flex;
          gap: 14px;
          align-items: center;
          font-family: var(--font-body), sans-serif;
          font-size: 0.95rem;
          color: #4a463d;
        }
        .bl-contents-dot {
          width: 4px;
          height: 4px;
          background: #c4d83f;
          flex-shrink: 0;
        }

        /* ── Bottom CTA (dark) ───────────────────────────────── */
        .bl-bottom-cta {
          background: #171812;
          padding: 96px 0 112px;
        }
        .bl-cta-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(2rem, 4vw, 3.5rem);
          color: #eee6d6;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }
        .bl-cta-sub {
          font-family: var(--font-body), sans-serif;
          font-size: 0.9rem;
          color: #8f897b;
          margin: 0 0 40px;
        }

        /* ── Success states ──────────────────────────────────── */
        .bl-success--dark .bl-success-headline {
          color: #eee6d6;
        }

        /* ── Footer ──────────────────────────────────────────── */
        .bl-footer {
          background: #ebe5d8;
          border-top: 1px solid #c9c0ae;
        }
        .bl-footer-inner {
          max-width: 1040px;
          margin: 0 auto;
          padding: 0 64px;
        }
        .bl-footer-rule {
          height: 1px;
          background: #1f1e1a;
          margin-bottom: 0;
        }
        .bl-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 20px 0;
        }
        .bl-footer-copy {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #81796a;
        }
        .bl-footer-nav {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .bl-footer-link {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #81796a;
          text-decoration: none;
          transition: color 0.2s;
        }
        .bl-footer-link:hover { color: #1f1e1a; }
        .bl-footer-link--subtle { opacity: 0.6; }
        .bl-footer-link:focus-visible {
          outline: 1px solid #1f1e1a;
          outline-offset: 3px;
        }

        /* ── Responsive ──────────────────────────────────────── */
        @media (max-width: 900px) {
          .bh-header { padding: 16px 24px; }
          .bl-hero { padding: 56px 0 64px; }
          .bl-hero-inner {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 0 24px;
          }
          .bl-section-inner { padding: 0 24px; }
          .bl-section-inner--narrow { padding: 0 24px; max-width: 100%; }
          .bl-hero-form { padding: 28px 24px 24px; }
          .bl-previews { padding: 56px 0; }
          .bl-learn { padding: 64px 0; }
          .bl-nohype { padding: 64px 0; }
          .bl-contents { padding: 48px 0 56px; }
          .bl-bottom-cta { padding: 72px 0 80px; }
          .bl-footer-inner { padding: 0 24px; }
          .bl-footer-row { flex-direction: column; align-items: flex-start; gap: 12px; padding: 16px 0; }
          .prev-card { width: 148px; }
          .prev-inner { width: 148px; height: 210px; }
        }

        @media (max-width: 480px) {
          .bh-pill { display: none; }
          .bl-headline { font-size: 1.75rem; }
        }
      `}</style>
    </>
  );
}
