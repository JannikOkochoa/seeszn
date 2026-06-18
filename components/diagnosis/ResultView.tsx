"use client";

// ─── Sichtbarkeitsprüfung — result cockpit ────────────────────────────────────
// Reads the scan result from sessionStorage (written by the intake). If it is
// missing (direct link, new tab, cleared storage), it re-runs the free scan from
// the ?domain= query param. Email is requested only after the reading is shown.

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "@/lib/i18n/context";
import type { ScanResult, ScanStatus, ScoreCard } from "@/lib/scan/types";
import { sessionKeyFor } from "@/lib/scan/storage";

type Load = "loading" | "ready" | "error";

export default function ResultView() {
  const t = useTranslations();
  const r = t.diagnosisPage.result;
  const locale = useLocale();

  const [load, setLoad] = useState<Load>("loading");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [domainParam, setDomainParam] = useState("");

  const rescan = useCallback(
    async (domain: string) => {
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, locale }),
        });
        if (!res.ok) return setLoad("error");
        const data = (await res.json()) as ScanResult;
        setResult(data);
        setLoad("ready");
        try {
          sessionStorage.setItem(sessionKeyFor(data.domain), JSON.stringify(data));
        } catch {
          /* ignore */
        }
      } catch {
        setLoad("error");
      }
    },
    [locale],
  );

  useEffect(() => {
    // One-time bootstrap: read the target from the URL, then load the stored
    // reading or re-run the scan. Kept in a nested function so the effect body
    // synchronizes with external systems (URL, sessionStorage) rather than
    // setting state inline.
    function bootstrap() {
      const params = new URLSearchParams(window.location.search);
      const domain = (params.get("domain") || "").trim();
      setDomainParam(domain);
      if (!domain) {
        setLoad("error");
        return;
      }
      try {
        const stored = sessionStorage.getItem(sessionKeyFor(domain));
        if (stored) {
          setResult(JSON.parse(stored) as ScanResult);
          setLoad("ready");
          return;
        }
      } catch {
        /* fall through to rescan */
      }
      void rescan(domain);
    }
    bootstrap();
  }, [rescan]);

  const backHref = locale === "en" ? "/en/diagnosis" : "/diagnosis";

  if (load !== "ready" || !result) {
    return (
      <section className="rv-fallback">
        {load === "error" ? (
          <>
            <h1 className="rv-fallback-title">{r.missingTitle}</h1>
            <p className="rv-fallback-copy">{r.missingCopy}</p>
            <a href={backHref} className="rv-fallback-link">{r.back} →</a>
          </>
        ) : (
          <p className="rv-fallback-copy" role="status" aria-live="polite">
            {r.reloading} {domainParam}…
          </p>
        )}
        <style>{css}</style>
      </section>
    );
  }

  return (
    <section className="rv">
      <ResultHeader result={result} backHref={backHref} labels={r} locale={locale} />
      <ResultScores result={result} labels={r} />
      <ResultSeen result={result} labels={r} />
      <ResultReadings result={result} labels={r} />
      <EmailUnlock result={result} labels={r} locale={locale} />
      <style>{css}</style>
    </section>
  );
}

type Labels = ReturnType<typeof useTranslations>["diagnosisPage"]["result"];

function statusText(status: ScanStatus, l: Labels): string {
  return status === "schwach" ? l.statusSchwach : status === "mittel" ? l.statusMittel : l.statusStark;
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ResultHeader({
  result,
  backHref,
  labels,
  locale,
}: {
  result: ScanResult;
  backHref: string;
  labels: Labels;
  locale: string;
}) {
  return (
    <div className="rv-head">
      <div className="rv-head-top">
        <a href={backHref} className="rv-back"><span aria-hidden="true">←</span> {labels.back}</a>
        <span className="rv-meta">{labels.metaLabel} / SZN-VP-01</span>
      </div>

      <div className="rv-head-main">
        <div className="rv-head-id">
          <h1 className="rv-domain">{result.domain}</h1>
          <p className="rv-fetched">
            {labels.fetchedLabel}: {formatDate(result.fetchedAt, locale)}
          </p>
        </div>

        <div className="rv-overall" aria-label={`${labels.overallLabel}: ${result.overallScore} / 100`}>
          <span className="rv-overall-num">{result.overallScore}</span>
          <span className="rv-overall-of">/ 100</span>
          <span className={`rv-overall-status rv-status--${result.overallStatus}`}>
            {statusText(result.overallStatus, labels)}
          </span>
        </div>
      </div>

      <div className="rv-finding">
        <span className="rv-finding-label">{labels.findingLabel}</span>
        <p className="rv-finding-copy">{result.finding}</p>
      </div>
    </div>
  );
}

function ScoreCardView({ card, labels }: { card: ScoreCard; labels: Labels }) {
  return (
    <article className="rv-card">
      <header className="rv-card-head">
        <h3 className="rv-card-label">{card.label}</h3>
        <span className={`rv-card-status rv-status--${card.status}`}>{statusText(card.status, labels)}</span>
      </header>

      <div className="rv-card-score">
        <span className="rv-card-num">{card.score}</span>
        <span className="rv-card-of">/ 100</span>
      </div>
      <div className="rv-card-bar" aria-hidden="true">
        <span className={`rv-card-bar-fill rv-status--${card.status}`} style={{ width: `${card.score}%` }} />
      </div>

      <p className="rv-card-reason">{card.reason}</p>
      <p className="rv-card-next">
        <span className="rv-card-next-label">{labels.stepLabel}</span>
        {card.nextStep}
      </p>
    </article>
  );
}

function ResultScores({ result, labels }: { result: ScanResult; labels: Labels }) {
  return (
    <div className="rv-block">
      <div className="rv-block-head">
        <span className="rv-block-label">{labels.scoresLabel}</span>
        <span className="rv-block-note">{labels.scoresNote}</span>
      </div>
      <div className="rv-grid">
        {result.scores.map((card) => (
          <ScoreCardView key={card.id} card={card} labels={labels} />
        ))}
      </div>
    </div>
  );
}

function ResultSeen({ result, labels }: { result: ScanResult; labels: Labels }) {
  return (
    <div className="rv-block">
      <div className="rv-block-head">
        <span className="rv-block-label">{labels.seenLabel}</span>
      </div>
      <ul className="rv-obs">
        {result.observations.map((o) => (
          <li key={o.label} className="rv-obs-row">
            <span
              className={`rv-obs-dot rv-obs-dot--${o.ok === null ? "na" : o.ok ? "ok" : "no"}`}
              aria-hidden="true"
            />
            <span className="rv-obs-label">{o.label}</span>
            <span className="rv-obs-value">{o.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultReadings({ result, labels }: { result: ScanResult; labels: Labels }) {
  return (
    <div className="rv-block rv-block--readings">
      <div className="rv-reading">
        <span className="rv-block-label">{labels.meaningLabel}</span>
        <p className="rv-reading-copy">{result.meaning}</p>
      </div>
      <div className="rv-reading rv-reading--next">
        <span className="rv-block-label">{labels.nextLabel}</span>
        <p className="rv-reading-copy">{result.nextStep}</p>
      </div>
    </div>
  );
}

function buildSummary(result: ScanResult): string {
  const lines = [
    `Domain: ${result.domain}`,
    `URL: ${result.url}`,
    `Overall readiness: ${result.overallScore}/100 (${result.overallStatus})`,
    `Gaps: ${result.gapCount}`,
    "Scores:",
    ...result.scores.map((s) => `  - ${s.label}: ${s.score}/100 (${s.status})`),
    `Finding: ${result.finding}`,
  ];
  return lines.join("\n");
}

function EmailUnlock({ result, labels, locale }: { result: ScanResult; labels: Labels; locale: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const doneRef = useRef<HTMLDivElement>(null);

  const emailValid = /\S+@\S+\.\S+/.test(email);

  useEffect(() => {
    if (status === "success") doneRef.current?.focus();
  }, [status]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          note,
          url: result.domain,
          market: locale,
          scanSummary: buildSummary(result),
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rv-unlock rv-unlock--done" ref={doneRef} tabIndex={-1} role="status" aria-live="polite">
        <span className="rv-unlock-pip" aria-hidden="true" />
        <p className="rv-unlock-donetitle">{labels.unlockDoneTitle}</p>
        <p className="rv-unlock-donecopy">{labels.unlockDoneCopy}</p>
      </div>
    );
  }

  return (
    <form className="rv-unlock" onSubmit={submit} aria-label={labels.unlockHeadline}>
      <div className="rv-unlock-intro">
        <h2 className="rv-unlock-title">{labels.unlockHeadline}</h2>
        <p className="rv-unlock-copy">{labels.unlockCopy}</p>
      </div>

      <div className="rv-unlock-fields">
        <div className="rv-field">
          <label htmlFor="rv-email" className="rv-label">
            {labels.emailLabel} <span className="rv-req">{labels.emailHint}</span>
          </label>
          <input
            id="rv-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.emailPlaceholder}
            className="rv-input"
            autoComplete="email"
          />
        </div>

        <div className="rv-field">
          <label htmlFor="rv-name" className="rv-label">
            {labels.nameLabel} <span className="rv-opt">{labels.nameHint}</span>
          </label>
          <input
            id="rv-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={labels.namePlaceholder}
            className="rv-input"
            autoComplete="name"
          />
        </div>

        <div className="rv-field rv-field--wide">
          <label htmlFor="rv-note" className="rv-label">
            {labels.noteLabel} <span className="rv-opt">{labels.noteHint}</span>
          </label>
          <textarea
            id="rv-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={labels.notePlaceholder}
            className="rv-input rv-textarea"
            rows={2}
          />
        </div>
      </div>

      <button type="submit" className="rv-unlock-cta" disabled={!emailValid || status === "loading"}>
        <span className="rv-unlock-cta-label">
          {status === "loading" ? labels.unlockSending : labels.unlockCta}
        </span>
        <span className="rv-unlock-cta-arrow" aria-hidden="true">→</span>
      </button>

      {status === "error" && (
        <p className="rv-unlock-error" role="alert">
          {labels.unlockError}
          <a href="mailto:hello@seeszn.com">hello@seeszn.com</a>
        </p>
      )}
    </form>
  );
}

const css = `
  .rv { padding: calc(var(--hero-y) * 0.7) var(--gutter) var(--section-y); max-width: 1180px; margin: 0 auto; }

  /* ── fallback ─────────────────────────────────────── */
  .rv-fallback { padding: var(--hero-y) var(--gutter); max-width: 720px; margin: 0 auto; min-height: 60vh; display: flex; flex-direction: column; justify-content: center; }
  .rv-fallback-title { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.01em; color: var(--ink-strong); margin-bottom: 16px; }
  .rv-fallback-copy { font-family: var(--font-body), sans-serif; font-size: 15px; line-height: 1.6; color: var(--text-body); margin-bottom: 24px; }
  .rv-fallback-link { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-strong); border-bottom: 1px solid var(--signal); padding-bottom: 3px; }

  /* ── head ─────────────────────────────────────────── */
  .rv-head-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
  .rv-back, .rv-meta { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); }
  .rv-back:hover { color: var(--ink-strong); }
  .rv-back:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }

  .rv-head-main { display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; flex-wrap: wrap; padding-bottom: 28px; border-bottom: 1px solid var(--line); }
  .rv-domain { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: clamp(32px, 5.5vw, 64px); letter-spacing: -0.02em; line-height: 0.98; text-transform: none; color: var(--ink-strong); word-break: break-word; }
  .rv-fetched { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-top: 12px; }

  .rv-overall { display: flex; align-items: baseline; gap: 8px; }
  .rv-overall-num { font-family: var(--font-display), sans-serif; font-weight: 800; font-size: clamp(44px, 7vw, 76px); line-height: 0.9; letter-spacing: -0.02em; color: var(--ink-strong); }
  .rv-overall-of { font-family: var(--font-mono), monospace; font-size: 13px; color: var(--text-muted); }
  .rv-overall-status { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; padding: 5px 10px; margin-left: 8px; align-self: center; border: 1px solid currentColor; }

  .rv-finding { margin-top: 32px; max-width: 820px; }
  .rv-finding-label { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 14px; }
  .rv-finding-copy { font-family: var(--font-editorial), serif; font-size: clamp(22px, 3vw, 34px); line-height: 1.3; letter-spacing: -0.01em; color: var(--ink-strong); }

  /* ── status colors ────────────────────────────────── */
  .rv-status--schwach { color: var(--clay); }
  .rv-status--mittel { color: #9a7b2e; }
  .rv-status--stark { color: #4f7a2e; }
  [data-theme="dark"] .rv-status--schwach { color: #d98a64; }
  [data-theme="dark"] .rv-status--mittel { color: #d7c25a; }
  [data-theme="dark"] .rv-status--stark { color: var(--signal); }

  /* ── blocks ───────────────────────────────────────── */
  .rv-block { margin-top: 64px; }
  .rv-block-head { display: flex; align-items: baseline; gap: 18px; margin-bottom: 28px; flex-wrap: wrap; }
  .rv-block-label { font-family: var(--font-body), sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-strong); }
  .rv-block-note { font-family: var(--font-mono), monospace; font-size: 9.5px; letter-spacing: 0.06em; color: var(--text-muted); }

  /* ── score grid ───────────────────────────────────── */
  .rv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); }
  .rv-card { background: var(--paper); padding: 24px 22px 26px; display: flex; flex-direction: column; }
  .rv-card-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 16px; }
  .rv-card-label { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: 19px; letter-spacing: 0.01em; color: var(--ink-strong); }
  .rv-card-status { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap; }
  .rv-card-score { display: flex; align-items: baseline; gap: 6px; margin-bottom: 12px; }
  .rv-card-num { font-family: var(--font-display), sans-serif; font-weight: 800; font-size: 38px; line-height: 1; letter-spacing: -0.02em; color: var(--ink-strong); }
  .rv-card-of { font-family: var(--font-mono), monospace; font-size: 11px; color: var(--text-muted); }
  .rv-card-bar { height: 3px; background: var(--line); margin-bottom: 18px; }
  .rv-card-bar-fill { display: block; height: 100%; }
  .rv-card-bar-fill.rv-status--schwach { background: var(--clay); }
  .rv-card-bar-fill.rv-status--mittel { background: #b89233; }
  .rv-card-bar-fill.rv-status--stark { background: var(--signal); }
  .rv-card-reason { font-family: var(--font-body), sans-serif; font-size: 13.5px; line-height: 1.6; color: var(--text-body); margin-bottom: 16px; }
  .rv-card-next { font-family: var(--font-body), sans-serif; font-size: 13px; line-height: 1.55; color: var(--text-secondary); margin-top: auto; padding-top: 14px; border-top: 1px solid var(--line); }
  .rv-card-next-label { display: block; font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 7px; }

  /* ── observations ─────────────────────────────────── */
  .rv-obs { list-style: none; border-top: 1px solid var(--line); max-width: 920px; }
  .rv-obs-row { display: grid; grid-template-columns: 18px minmax(120px, 200px) 1fr; gap: 16px; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line); }
  .rv-obs-dot { width: 8px; height: 8px; }
  .rv-obs-dot--ok { background: var(--signal); }
  .rv-obs-dot--no { background: var(--clay); }
  .rv-obs-dot--na { background: var(--text-faint); }
  .rv-obs-label { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-secondary); }
  .rv-obs-value { font-family: var(--font-body), sans-serif; font-size: 14px; color: var(--ink-strong); overflow: hidden; text-overflow: ellipsis; }

  /* ── readings ─────────────────────────────────────── */
  .rv-block--readings { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .rv-reading-copy { font-family: var(--font-body), sans-serif; font-size: 15.5px; line-height: 1.7; color: var(--text-body); margin-top: 16px; max-width: 520px; }
  .rv-reading--next { border-left: 2px solid var(--signal); padding-left: 26px; }
  .rv-reading--next .rv-reading-copy { color: var(--ink-strong); }

  /* ── email unlock ─────────────────────────────────── */
  .rv-unlock { margin-top: 80px; background: #15150f; color: #efe7d7; padding: clamp(32px, 5vw, 56px); border: 1px solid #2a2a20; }
  .rv-unlock-intro { max-width: 560px; margin-bottom: 32px; }
  .rv-unlock-title { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: clamp(26px, 3.4vw, 40px); letter-spacing: -0.01em; color: #efe7d7; margin-bottom: 14px; text-transform: none; }
  .rv-unlock-copy { font-family: var(--font-body), sans-serif; font-size: 15px; line-height: 1.65; color: #9b9484; }
  .rv-unlock-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 26px; }
  .rv-field--wide { grid-column: 1 / -1; }
  .rv-label { display: block; font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: #9b9484; margin-bottom: 9px; }
  .rv-req { color: #c8df3f; margin-left: 8px; }
  .rv-opt { color: #6f695b; margin-left: 8px; }
  .rv-input { display: block; width: 100%; border: 1px solid rgba(238,230,214,0.28); background: rgba(0,0,0,0.2); font-family: var(--font-mono), monospace; font-size: 14px; color: #efe7d7; padding: 14px 15px; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
  .rv-input::placeholder { color: #6f695b; }
  .rv-input:focus { border-color: #c8df3f; background: rgba(0,0,0,0.32); box-shadow: inset 0 -2px 0 0 #c8df3f; }
  .rv-textarea { resize: vertical; min-height: 56px; line-height: 1.5; }

  .rv-unlock-cta { position: relative; display: inline-flex; align-items: center; gap: 14px; padding: 18px 30px; background: #c8df3f; color: #15150f; border: 1px solid #c8df3f; cursor: pointer; transition: background 0.3s, color 0.3s; }
  .rv-unlock-cta-label { font-family: var(--font-body), sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.01em; }
  .rv-unlock-cta-arrow { font-size: 16px; transition: transform 0.3s cubic-bezier(.16,1,.3,1); }
  .rv-unlock-cta:hover:not(:disabled) { background: #efe7d7; border-color: #efe7d7; }
  .rv-unlock-cta:hover:not(:disabled) .rv-unlock-cta-arrow { transform: translateX(5px); }
  .rv-unlock-cta:focus-visible { outline: 2px solid #c8df3f; outline-offset: 3px; }
  .rv-unlock-cta:disabled { background: transparent; color: #6f695b; border-color: rgba(238,230,214,0.28); cursor: not-allowed; }
  .rv-unlock-error { margin-top: 16px; font-family: var(--font-mono), monospace; font-size: 11px; color: #e8a07a; }
  .rv-unlock-error a { color: #c8df3f; text-decoration: underline; }

  .rv-unlock--done { display: flex; flex-direction: column; outline: none; }
  .rv-unlock-pip { width: 9px; height: 9px; background: #c8df3f; margin-bottom: 22px; }
  .rv-unlock-donetitle { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: clamp(24px, 3vw, 34px); color: #efe7d7; margin-bottom: 14px; }
  .rv-unlock-donecopy { font-family: var(--font-body), sans-serif; font-size: 15px; line-height: 1.65; color: #9b9484; max-width: 520px; }

  @media (prefers-reduced-motion: reduce) {
    .rv-unlock-cta-arrow { transition: none; }
  }
  @media (max-width: 860px) {
    .rv-grid { grid-template-columns: 1fr 1fr; }
    .rv-block--readings { grid-template-columns: 1fr; gap: 36px; }
  }
  @media (max-width: 560px) {
    .rv-grid { grid-template-columns: 1fr; }
    .rv-unlock-fields { grid-template-columns: 1fr; }
    .rv-head-main { align-items: flex-start; }
    .rv-obs-row { grid-template-columns: 16px 1fr; gap: 6px 12px; }
    .rv-obs-value { grid-column: 2; }
  }
`;
