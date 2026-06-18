"use client";

// ─── Sichtbarkeitsprüfung — result cockpit ────────────────────────────────────
// Reads the scan result from sessionStorage (written by the intake). If it is
// missing (direct link, new tab, cleared storage), it re-runs the free scan
// from the ?domain= query param.
//
// Gating strategy:
//   Free  — domain, overall, finding, first 3 score cards, first 3 observations
//   Gated — last 3 score cards, all remaining observations, interpretation,
//            prioritized steps, full reading
//
// "Unlocked" state is lifted to ResultView so score cards and observations can
// open the moment the email is submitted, not just the DiagnosisSection reveal.

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "@/lib/i18n/context";
import type { CategoryId, ScanResult, ScanStatus, ScoreCard } from "@/lib/scan/types";
import { sessionKeyFor } from "@/lib/scan/storage";

type Load = "loading" | "ready" | "error";

// First 3 categories are always visible. Last 3 are gated behind email.
const FREE_CATEGORY_IDS: CategoryId[] = [
  "indexierbarkeit",
  "entityClarity",
  "sourceSurface",
];
// First N observations are always visible.
const FREE_OBS = 3;

export default function ResultView() {
  const t = useTranslations();
  const r = t.diagnosisPage.result;
  const locale = useLocale();

  const [load, setLoad] = useState<Load>("loading");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [domainParam, setDomainParam] = useState("");
  const [unlocked, setUnlocked] = useState(false);

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
          <div className="rv-loading" role="status" aria-live="polite">
            <span className="rv-loading-pip" aria-hidden="true" />
            <p className="rv-fallback-copy">{r.reloading} {domainParam}…</p>
          </div>
        )}
        <style>{css}</style>
      </section>
    );
  }

  return (
    <section className="rv">
      <ResultHeader result={result} backHref={backHref} labels={r} locale={locale} />
      <ResultScores result={result} labels={r} unlocked={unlocked} />
      <ResultSeen result={result} labels={r} unlocked={unlocked} />
      <DiagnosisSection
        result={result}
        labels={r}
        locale={locale}
        onUnlock={() => setUnlocked(true)}
      />
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

// ── Result header — always visible ──────────────────────────────────────────────

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
        <span className="rv-meta">
          {labels.metaLabel}
          <span className="rv-meta-sub">{labels.metaSub}</span>
        </span>
      </div>

      <div className="rv-head-main">
        <div className="rv-head-id">
          <h1 className="rv-domain">{result.domain}</h1>
          <p className="rv-fetched">
            {labels.fetchedLabel}: {formatDate(result.fetchedAt, locale)}
          </p>
        </div>

        <div className="rv-overall">
          <span className="rv-overall-label">{labels.overallLabel}</span>
          <div className="rv-overall-num-row" aria-label={`${labels.overallLabel}: ${result.overallScore} / 100`}>
            <span className="rv-overall-num">{result.overallScore}</span>
            <span className="rv-overall-of">/ 100</span>
            <span className={`rv-overall-status rv-status--${result.overallStatus}`}>
              {statusText(result.overallStatus, labels)}
            </span>
          </div>
          <span className="rv-overall-caption">{labels.overallCaption}</span>
        </div>
      </div>

      <div className="rv-finding">
        <span className="rv-finding-label">{labels.findingLabel}</span>
        <p className="rv-finding-copy">{result.finding}</p>
      </div>
    </div>
  );
}

// ── Score cards ────────────────────────────────────────────────────────────────

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
    </article>
  );
}

function SealedScoreCard({ card, labels }: { card: ScoreCard; labels: Labels }) {
  return (
    <article className="rv-card rv-card--sealed" aria-label={`${card.label} — ${labels.sealedCardStatus}`}>
      <header className="rv-card-head">
        <h3 className="rv-card-label">{card.label}</h3>
        <span className="rv-card-sealed-icon" aria-hidden="true">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.75" y="6.25" width="10.5" height="7" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
            <path d="M3 6.25V4.25a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <circle cx="6" cy="9.75" r="1" fill="currentColor" />
          </svg>
        </span>
        <span className="rv-sr-only">{labels.sealedCardStatus}</span>
      </header>

      <div className="rv-card-score" aria-hidden="true">
        <span className="rv-card-num rv-card-num--sealed">••</span>
        <span className="rv-card-of">/ 100</span>
      </div>
      <div className="rv-card-bar rv-card-bar--sealed" aria-hidden="true">
        <span className="rv-card-bar-fill--sealed" />
      </div>

      <p className="rv-card-reason rv-card-reason--sealed">{labels.sealedStatus}</p>
    </article>
  );
}

function ResultScores({
  result,
  labels,
  unlocked,
}: {
  result: ScanResult;
  labels: Labels;
  unlocked: boolean;
}) {
  return (
    <div className="rv-block">
      <div className="rv-block-head">
        <span className="rv-block-label">{labels.scoresLabel}</span>
        <span className="rv-block-note">{labels.scoresNote}</span>
      </div>
      <div className="rv-grid">
        {result.scores.map((card) =>
          unlocked || FREE_CATEGORY_IDS.includes(card.id) ? (
            <ScoreCardView key={card.id} card={card} labels={labels} />
          ) : (
            <SealedScoreCard key={card.id} card={card} labels={labels} />
          ),
        )}
      </div>
    </div>
  );
}

// ── Observations ───────────────────────────────────────────────────────────────

function ResultSeen({
  result,
  labels,
  unlocked,
}: {
  result: ScanResult;
  labels: Labels;
  unlocked: boolean;
}) {
  const visible = unlocked ? result.observations : result.observations.slice(0, FREE_OBS);
  const hiddenCount = result.observations.length - FREE_OBS;

  return (
    <div className="rv-block">
      <div className="rv-block-head">
        <span className="rv-block-label">{labels.seenLabel}</span>
      </div>
      <ul className="rv-obs">
        {visible.map((o) => (
          <li key={o.label} className="rv-obs-row">
            <span
              className={`rv-obs-dot rv-obs-dot--${o.ok === null ? "na" : o.ok ? "ok" : "no"}`}
              aria-hidden="true"
            />
            <span className="rv-obs-label">{o.label}</span>
            <span className="rv-obs-value">{o.value}</span>
          </li>
        ))}
        {!unlocked && hiddenCount > 0 && (
          <li className="rv-obs-row rv-obs-row--sealed" aria-hidden="true">
            <span className="rv-obs-dot rv-obs-dot--sealed" />
            <span className="rv-obs-label rv-obs-label--sealed">
              {hiddenCount} {labels.seenMoreLabel}
            </span>
            <span className="rv-obs-value rv-obs-value--sealed">{labels.sealedStatus}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

// ── Scan summary for lead payload ──────────────────────────────────────────────

function buildSummary(result: ScanResult): string {
  const lines = [
    `Domain: ${result.domain}`,
    `URL: ${result.url}`,
    `Overall readiness: ${result.overallScore}/100 (${result.overallStatus})`,
    `Gaps: ${result.gapCount}`,
    "Scores (weakest first):",
    ...[...result.scores]
      .sort((a, b) => a.score - b.score)
      .map((s) => `  - ${s.label}: ${s.score}/100 (${s.status}) -> ${s.nextStep}`),
    `Finding: ${result.finding}`,
    `Meaning: ${result.meaning}`,
    `Most useful next step: ${result.nextStep}`,
  ];
  return lines.join("\n");
}

// Freemail providers — used only to set a non-blocking helper and a freemail flag.
// We never reject these addresses.
const FREEMAIL = new Set([
  "gmail.com", "googlemail.com", "outlook.com", "outlook.de", "hotmail.com", "hotmail.de",
  "live.com", "live.de", "msn.com", "icloud.com", "me.com", "mac.com", "gmx.de", "gmx.net",
  "gmx.com", "web.de", "yahoo.com", "yahoo.de", "ymail.com", "t-online.de", "freenet.de",
  "aol.com", "mail.com", "proton.me", "protonmail.com",
]);

function isFreemail(email: string): boolean {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  return domain ? FREEMAIL.has(domain) : false;
}

// ── Delivery gate ──────────────────────────────────────────────────────────────

function DiagnosisSection({
  result,
  labels,
  locale,
  onUnlock,
}: {
  result: ScanResult;
  labels: Labels;
  locale: string;
  onUnlock: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const revealRef = useRef<HTMLDivElement>(null);

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const showFreemailHelper = emailValid && isFreemail(email);
  const sent = status === "success";

  useEffect(() => {
    if (sent) revealRef.current?.focus();
  }, [sent]);

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
          finding: result.finding,
          freemail: isFreemail(email),
          scanSummary: buildSummary(result),
        }),
      });
      if (res.ok) {
        setStatus("success");
        onUnlock();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const prioritized = [...result.scores].sort((a, b) => a.score - b.score);

  if (sent) {
    return (
      <div className="rv-diag" ref={revealRef} tabIndex={-1}>
        <div className="rv-confirm" role="status" aria-live="polite">
          <span className="rv-confirm-pip" aria-hidden="true" />
          <div>
            <p className="rv-confirm-title">{labels.unlockDoneTitle}</p>
            <p className="rv-confirm-copy">{labels.unlockDoneCopy}</p>
          </div>
        </div>

        <div className="rv-revealed">
          <div className="rv-reading">
            <span className="rv-block-label">{labels.meaningLabel}</span>
            <p className="rv-reading-copy">{result.meaning}</p>
          </div>

          <div className="rv-priority">
            <span className="rv-block-label">{labels.prioritizedLabel}</span>
            <ol className="rv-priority-list">
              {prioritized.map((card, i) => (
                <li key={card.id} className="rv-priority-item">
                  <span className="rv-priority-num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <span className="rv-priority-area">
                      {card.label}
                      <span className={`rv-priority-status rv-status--${card.status}`}>
                        {statusText(card.status, labels)}
                      </span>
                    </span>
                    <p className="rv-priority-step">{card.nextStep}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rv-nextstep">
            <span className="rv-block-label">{labels.fullLabel}</span>
            <p className="rv-nextstep-copy">{result.nextStep}</p>
          </div>
        </div>
      </div>
    );
  }

  // Before email: sealed dossier rows + delivery module.
  const sealed = [labels.meaningLabel, labels.prioritizedLabel, labels.fullLabel];

  return (
    <div className="rv-diag">
      {/* Sealed dossier — honest labels, intentionally withheld, no skeleton */}
      <div className="rv-sealed">
        {sealed.map((label) => (
          <div key={label} className="rv-sealed-row">
            <span className="rv-sealed-mark" aria-hidden="true" />
            <span className="rv-sealed-label">{label}</span>
            <span className="rv-sealed-status">{labels.sealedStatus}</span>
          </div>
        ))}
      </div>

      {/* Delivery strip — light, calm, one dominant field */}
      <form className="rv-deliver" onSubmit={submit} aria-label={labels.unlockHeadline}>
        <div className="rv-deliver-left">
          <h2 className="rv-deliver-title">{labels.unlockHeadline}</h2>
          <p className="rv-deliver-copy">{labels.unlockCopy}</p>
        </div>

        <div className="rv-deliver-right">
          <div className="rv-field">
            <label htmlFor="rv-email" className="rv-label">{labels.emailLabel}</label>
            <input
              id="rv-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={labels.emailPlaceholder}
              className="rv-input rv-input--lead"
              autoComplete="email"
              aria-describedby={showFreemailHelper ? "rv-freemail" : undefined}
            />
            {showFreemailHelper && (
              <p id="rv-freemail" className="rv-helper">{labels.freemailHelper}</p>
            )}
          </div>

          <button type="submit" className="rv-deliver-cta" disabled={!emailValid || status === "loading"}>
            <span className="rv-deliver-cta-label">
              {status === "loading" ? labels.unlockSending : labels.unlockCta}
            </span>
            <span className="rv-deliver-cta-arrow" aria-hidden="true">→</span>
          </button>

          <div className="rv-deliver-secondary">
            <div className="rv-field">
              <label htmlFor="rv-name" className="rv-label rv-label--sec">{labels.nameLabel}</label>
              <input
                id="rv-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={labels.namePlaceholder}
                className="rv-input rv-input--sec"
                autoComplete="name"
              />
            </div>
            <div className="rv-field">
              <label htmlFor="rv-note" className="rv-label rv-label--sec">{labels.noteLabel}</label>
              <input
                id="rv-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={labels.notePlaceholder}
                className="rv-input rv-input--sec"
              />
            </div>
          </div>

          {status === "error" && (
            <p className="rv-deliver-error" role="alert">
              {labels.unlockError}
              <a href="mailto:hello@seeszn.com">hello@seeszn.com</a>
            </p>
          )}
        </div>
      </form>

      <p className="rv-deliver-trust">{labels.gateTrust}</p>
    </div>
  );
}

const css = `
  .rv { padding: calc(var(--hero-y) * 0.7) var(--gutter) var(--section-y); max-width: 1180px; margin: 0 auto; }

  /* ── fallback / loading ───────────────────────────── */
  .rv-fallback { padding: var(--hero-y) var(--gutter); max-width: 720px; margin: 0 auto; min-height: 60vh; display: flex; flex-direction: column; justify-content: center; }
  .rv-fallback-title { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.01em; color: var(--ink-strong); margin-bottom: 16px; }
  .rv-fallback-copy { font-family: var(--font-body), sans-serif; font-size: 15px; line-height: 1.6; color: var(--text-body); margin-bottom: 24px; }
  .rv-fallback-link { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-strong); border-bottom: 1px solid var(--signal); padding-bottom: 3px; width: fit-content; }
  .rv-loading { display: flex; align-items: center; gap: 14px; }
  .rv-loading .rv-fallback-copy { margin-bottom: 0; }
  .rv-loading-pip { width: 9px; height: 9px; background: var(--signal); animation: rv-blink 1.1s ease-in-out infinite; }
  @keyframes rv-blink { 50% { opacity: 0.25; } }

  /* ── head ─────────────────────────────────────────── */
  .rv-head-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .rv-back { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); }
  .rv-back:hover { color: var(--ink-strong); }
  .rv-back:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }
  .rv-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-strong); text-align: right; }
  .rv-meta-sub { color: var(--text-muted); letter-spacing: 0.1em; }

  .rv-head-main { display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; flex-wrap: wrap; padding-bottom: 28px; border-bottom: 1px solid var(--line); }
  .rv-domain { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: clamp(32px, 5.5vw, 64px); letter-spacing: -0.02em; line-height: 0.98; text-transform: none; color: var(--ink-strong); word-break: break-word; }
  .rv-fetched { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-top: 12px; }

  .rv-overall { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
  .rv-overall-label { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); }
  .rv-overall-num-row { display: flex; align-items: baseline; gap: 8px; }
  .rv-overall-num { font-family: var(--font-display), sans-serif; font-weight: 800; font-size: clamp(44px, 7vw, 76px); line-height: 0.9; letter-spacing: -0.02em; color: var(--ink-strong); }
  .rv-overall-of { font-family: var(--font-mono), monospace; font-size: 13px; color: var(--text-muted); }
  .rv-overall-status { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; padding: 5px 10px; margin-left: 4px; align-self: center; border: 1px solid currentColor; }
  .rv-overall-caption { font-family: var(--font-body), sans-serif; font-size: 11.5px; line-height: 1.4; color: var(--text-muted); max-width: 240px; }

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
  .rv-block-note { font-family: var(--font-mono), monospace; font-size: 9.5px; letter-spacing: 0.06em; color: var(--text-muted); max-width: 560px; line-height: 1.5; }

  /* ── score grid ───────────────────────────────────── */
  .rv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); }

  /* Free cards */
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
  .rv-card-reason { font-family: var(--font-body), sans-serif; font-size: 13.5px; line-height: 1.6; color: var(--text-body); }

  /* Sealed cards — intentionally held back, not broken, not loading */
  .rv-card--sealed { background: var(--paper-soft); }
  .rv-card-sealed-icon { display: flex; align-items: center; color: var(--text-muted); flex-shrink: 0; opacity: 0.7; }
  .rv-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  .rv-card-num--sealed { font-family: var(--font-display), sans-serif; font-weight: 800; font-size: 38px; line-height: 1; letter-spacing: 0.08em; color: var(--text-muted); }
  .rv-card-bar--sealed { height: 3px; background: var(--line); margin-bottom: 18px; }
  .rv-card-bar-fill--sealed { display: block; height: 100%; width: 38%; background: var(--line-strong); }
  .rv-card-reason--sealed { font-family: var(--font-body), sans-serif; font-size: 12.5px; line-height: 1.5; color: var(--text-muted); font-style: italic; }

  /* ── observations ─────────────────────────────────── */
  .rv-obs { list-style: none; border-top: 1px solid var(--line); max-width: 920px; }
  .rv-obs-row { display: grid; grid-template-columns: 18px minmax(120px, 200px) 1fr; gap: 16px; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line); }
  .rv-obs-dot { width: 8px; height: 8px; }
  .rv-obs-dot--ok { background: var(--signal); }
  .rv-obs-dot--no { background: var(--clay); }
  .rv-obs-dot--na { background: var(--text-faint); }
  .rv-obs-label { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-secondary); }
  .rv-obs-value { font-family: var(--font-body), sans-serif; font-size: 14px; color: var(--ink-strong); overflow: hidden; text-overflow: ellipsis; }

  /* Sealed observation teaser row */
  .rv-obs-row--sealed { border-bottom: none; background: transparent; }
  .rv-obs-dot--sealed { width: 8px; height: 2px; background: var(--line-strong); margin-top: 3px; }
  .rv-obs-label--sealed { color: var(--text-muted); text-transform: none; letter-spacing: 0.02em; font-size: 12px; }
  .rv-obs-value--sealed { font-family: var(--font-body), sans-serif; font-size: 12px; color: var(--text-muted); font-style: italic; }

  /* ── diagnosis gate — delivery module ─────────────── */
  .rv-diag { margin-top: 72px; outline: none; }

  /* Sealed dossier rows — honest section labels, no skeleton, no lock icon */
  .rv-sealed { border: 1px solid var(--line-strong); }
  .rv-sealed-row { display: flex; align-items: center; gap: 16px; padding: 19px 24px; border-bottom: 1px solid var(--line); }
  .rv-sealed-row:last-child { border-bottom: none; }
  .rv-sealed-mark { width: 6px; height: 6px; flex-shrink: 0; background: var(--ink-strong); transform: rotate(45deg); }
  .rv-sealed-label { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: clamp(16px, 1.7vw, 20px); letter-spacing: 0.01em; color: var(--ink-strong); }
  .rv-sealed-status { margin-left: auto; font-family: var(--font-body), sans-serif; font-size: 12px; line-height: 1.4; color: var(--text-muted); font-style: italic; text-align: right; max-width: 240px; }

  /* Delivery strip — light, calm, one dominant field */
  .rv-deliver { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 4vw, 56px); border: 1px solid var(--line-strong); border-top: none; padding: clamp(30px, 4vw, 48px); align-items: start; background: var(--surface-raised); }
  .rv-deliver-left { display: flex; flex-direction: column; }
  .rv-deliver-title { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: clamp(28px, 3.6vw, 42px); line-height: 1.02; letter-spacing: -0.01em; color: var(--ink-strong); text-transform: none; margin-bottom: 16px; }
  .rv-deliver-copy { font-family: var(--font-body), sans-serif; font-size: 15.5px; line-height: 1.6; color: var(--text-body); max-width: 380px; }
  .rv-deliver-right { display: flex; flex-direction: column; }

  .rv-field { display: flex; flex-direction: column; }
  .rv-label { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 9px; }
  .rv-label--sec { color: var(--text-faint); }
  .rv-input { display: block; width: 100%; border: 1px solid var(--line-strong); background: var(--paper-soft); font-family: var(--font-mono), monospace; font-size: 14px; color: var(--ink-strong); padding: 14px 15px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .rv-input::placeholder { color: var(--text-faint); }
  .rv-input:focus { border-color: var(--ink-strong); box-shadow: inset 0 -2px 0 0 var(--signal); }
  .rv-input--lead { font-size: 17px; padding: 17px 16px; }

  .rv-helper { margin-top: 9px; font-family: var(--font-body), sans-serif; font-size: 12px; line-height: 1.4; color: var(--text-muted); }

  .rv-deliver-cta { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 14px; width: 100%; margin-top: 14px; padding: 18px 24px; background: var(--ink-strong); color: var(--paper); border: 1px solid var(--ink-strong); cursor: pointer; transition: background 0.25s, color 0.25s; }
  .rv-deliver-cta-label { font-family: var(--font-body), sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.01em; }
  .rv-deliver-cta-arrow { font-size: 16px; transition: transform 0.3s cubic-bezier(.16,1,.3,1); }
  .rv-deliver-cta:hover:not(:disabled) { background: var(--signal); color: var(--ink-strong); border-color: var(--signal); }
  .rv-deliver-cta:hover:not(:disabled) .rv-deliver-cta-arrow { transform: translateX(5px); }
  .rv-deliver-cta:focus-visible { outline: 2px solid var(--ink-strong); outline-offset: 3px; }
  .rv-deliver-cta:disabled { background: transparent; color: var(--text-faint); border-color: var(--line-strong); cursor: not-allowed; }

  .rv-deliver-secondary { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 20px; }
  .rv-deliver-error { margin-top: 14px; font-family: var(--font-mono), monospace; font-size: 11px; color: var(--clay); }
  .rv-deliver-error a { color: var(--ink-strong); text-decoration: underline; }

  .rv-deliver-trust { margin-top: 18px; font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.1em; color: var(--text-muted); display: flex; align-items: center; gap: 9px; }
  .rv-deliver-trust::before { content: ""; width: 5px; height: 5px; background: var(--signal); flex-shrink: 0; }

  /* ── unlocked reveal ──────────────────────────────── */
  .rv-confirm { display: flex; gap: 16px; align-items: flex-start; background: var(--surface-raised); border: 1px solid var(--line-strong); border-left: 2px solid var(--signal); padding: 26px 28px; margin-bottom: 4px; }
  .rv-confirm-pip { width: 9px; height: 9px; background: var(--signal); margin-top: 6px; flex-shrink: 0; }
  .rv-confirm-title { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: 24px; color: var(--ink-strong); margin-bottom: 8px; text-transform: none; }
  .rv-confirm-copy { font-family: var(--font-body), sans-serif; font-size: 14.5px; line-height: 1.65; color: var(--text-body); max-width: 600px; }

  .rv-revealed { border: 1px solid var(--line); border-top: none; padding: clamp(28px, 4vw, 44px); display: flex; flex-direction: column; gap: 44px; }
  .rv-reading-copy { font-family: var(--font-body), sans-serif; font-size: 16px; line-height: 1.7; color: var(--text-body); margin-top: 16px; max-width: 720px; }

  .rv-priority-list { list-style: none; margin-top: 18px; border-top: 1px solid var(--line); }
  .rv-priority-item { display: grid; grid-template-columns: 44px 1fr; gap: 18px; padding: 20px 0; border-bottom: 1px solid var(--line); }
  .rv-priority-num { font-family: var(--font-mono), monospace; font-size: 12px; color: var(--text-muted); padding-top: 3px; }
  .rv-priority-area { display: flex; align-items: center; gap: 12px; font-family: var(--font-display), sans-serif; font-weight: 700; font-size: 18px; letter-spacing: 0.01em; color: var(--ink-strong); margin-bottom: 8px; }
  .rv-priority-status { font-family: var(--font-mono), monospace; font-size: 9px; font-weight: 400; letter-spacing: 0.14em; text-transform: uppercase; }
  .rv-priority-step { font-family: var(--font-body), sans-serif; font-size: 14.5px; line-height: 1.6; color: var(--text-body); max-width: 680px; }

  .rv-nextstep { border-left: 2px solid var(--signal); padding-left: 26px; }
  .rv-nextstep-copy { font-family: var(--font-editorial), serif; font-size: clamp(19px, 2.2vw, 26px); line-height: 1.4; color: var(--ink-strong); margin-top: 16px; max-width: 720px; }

  @media (prefers-reduced-motion: reduce) {
    .rv-deliver-cta-arrow { transition: none; }
    .rv-loading-pip { animation: none; }
  }
  @media (max-width: 860px) {
    .rv-grid { grid-template-columns: 1fr 1fr; }
    .rv-deliver { grid-template-columns: 1fr; gap: 28px; }
  }
  @media (max-width: 560px) {
    .rv-grid { grid-template-columns: 1fr; }
    .rv-deliver-secondary { grid-template-columns: 1fr; }
    .rv-head-main { align-items: flex-start; }
    .rv-overall-caption { max-width: none; }
    .rv-obs-row { grid-template-columns: 16px 1fr; gap: 6px 12px; }
    .rv-obs-value { grid-column: 2; }
    .rv-obs-row--sealed { grid-template-columns: 16px 1fr; }
    .rv-obs-value--sealed { grid-column: 2; }
    .rv-sealed-row { flex-wrap: wrap; gap: 6px 14px; }
    .rv-sealed-status { margin-left: 22px; text-align: left; max-width: none; }
  }
`;
