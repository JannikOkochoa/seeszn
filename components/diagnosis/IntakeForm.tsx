"use client";

// ─── Sichtbarkeitsprüfung — intake instrument ─────────────────────────────────
// Not a contact form. The user enters a brand, we run real free checks, and
// they get a first reading before any email is asked for. Value first.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslations, useLocale } from "@/lib/i18n/context";
import type { ScanResult, ScanError } from "@/lib/scan/types";
import { sessionKeyFor } from "@/lib/scan/storage";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

type Phase = "idle" | "scanning" | "result" | "error";

export default function IntakeForm() {
  const t = useTranslations();
  const f = t.diagnosisPage.intakeForm;
  const locale = useLocale();
  const reduced = useReducedMotion();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [domain, setDomain] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const findingRef = useRef<HTMLParagraphElement>(null);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = f.loadingSteps;

  // Drive the honest progress readout while the real request runs. We never
  // race past the last step until the server actually answers.
  useEffect(() => {
    if (phase !== "scanning") {
      if (stepTimer.current) clearInterval(stepTimer.current);
      return;
    }
    // stepIndex is reset in runScan before entering this phase, so the effect
    // only owns the interval — no synchronous setState in the effect body.
    stepTimer.current = setInterval(
      () => setStepIndex((i) => Math.min(steps.length - 2, i + 1)),
      reduced ? 120 : 720,
    );
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, [phase, steps.length, reduced]);

  // Move focus to the finding once the reading is in.
  useEffect(() => {
    if (phase === "result") findingRef.current?.focus();
  }, [phase]);

  async function runScan(e?: React.FormEvent) {
    e?.preventDefault();
    const value = domain.trim();
    if (!value) {
      setErrorMsg(f.invalidDomain);
      setPhase("error");
      return;
    }
    setErrorMsg("");
    setStepIndex(0);
    setPhase("scanning");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: value, locale }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as ScanError | null;
        setErrorMsg(data?.error || f.scanError);
        setStepIndex(steps.length - 1);
        setPhase("error");
        return;
      }
      const data = (await res.json()) as ScanResult;
      // Fast-forward the readout to "done" before revealing the finding.
      setStepIndex(steps.length - 1);
      setResult(data);
      try {
        sessionStorage.setItem(sessionKeyFor(data.domain), JSON.stringify(data));
      } catch {
        /* sessionStorage may be unavailable — result page can re-run the scan */
      }
      window.setTimeout(() => setPhase("result"), reduced ? 0 : 420);
    } catch {
      setErrorMsg(f.scanError);
      setPhase("error");
    }
  }

  function openResult() {
    if (!result) return;
    const base = locale === "en" ? "/en/diagnosis/result" : "/diagnosis/result";
    router.push(`${base}?domain=${encodeURIComponent(result.domain)}`);
  }

  const gapLine =
    result &&
    (result.gapCount === 0
      ? f.noGaps
      : `${result.gapCount} ${result.gapCount === 1 ? f.gapsOne : f.gapsMany}`);

  return (
    <div className="itk">
      <div className="itk-head">
        <span className="itk-head-l">
          <span className="itk-pip" aria-hidden="true" />
          {f.header}
        </span>
        <span className="itk-head-r itk-free">{f.freeLabel}</span>
      </div>

      <div className="itk-body">
        <AnimatePresence mode="wait" initial={false}>
          {/* ── IDLE — the start question + domain input ───────────── */}
          {phase === "idle" && (
            <motion.form
              key="idle"
              onSubmit={runScan}
              className="itk-panel"
              {...stepMotion(reduced)}
              aria-label={f.header}
            >
              <label htmlFor="itk-domain" className="itk-q">{f.startQuestion}</label>
              <p className="itk-sub">{f.startSub}</p>
              <div className="itk-inputwrap">
                <input
                  id="itk-domain"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder={f.placeholder}
                  className="itk-input"
                  autoFocus
                />
              </div>

              <button type="submit" className="itk-cta" disabled={!domain.trim()}>
                <span className="itk-cta-line" aria-hidden="true" />
                <span className="itk-cta-label">{f.startCta}</span>
                <span className="itk-cta-arrow" aria-hidden="true">→</span>
              </button>

              <div className="itk-trustblock">
                <p className="itk-trust">{f.trustNote}</p>
                <p className="itk-trust itk-trust--dim">{f.scopeNote}</p>
              </div>
            </motion.form>
          )}

          {/* ── SCANNING — honest real-progress readout ────────────── */}
          {phase === "scanning" && (
            <motion.div key="scan" className="itk-panel" {...stepMotion(reduced)}>
              <div className="itk-scanhead">
                <span className="itk-scan-domain">{domain.trim()}</span>
                <span className="itk-scan-status" role="status" aria-live="polite">
                  {f.scanningLabel}
                </span>
              </div>

              <ol className="itk-steps" aria-label={f.scanningLabel}>
                {steps.map((label, i) => {
                  const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "todo";
                  return (
                    <li key={label} className={`itk-stepline itk-stepline--${state}`}>
                      <span className="itk-stepdot" aria-hidden="true" />
                      <span className="itk-steptext">{label}</span>
                      {state === "done" && <span className="itk-stepcheck" aria-hidden="true">✓</span>}
                    </li>
                  );
                })}
              </ol>

              <div className="itk-scanbar" aria-hidden="true">
                <span
                  className="itk-scanbar-fill"
                  style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* ── RESULT — first finding, then the reveal CTA ────────── */}
          {phase === "result" && result && (
            <motion.div key="result" className="itk-panel" {...stepMotion(reduced)}>
              <span className="itk-finding-label">{f.findingLabel}</span>
              <p className="itk-finding" ref={findingRef} tabIndex={-1}>
                {result.finding}
              </p>

              <div className="itk-gapline">
                <span className="itk-gap-dot" aria-hidden="true" />
                {gapLine}
              </div>

              <button type="button" className="itk-cta itk-cta--reveal" onClick={openResult}>
                <span className="itk-cta-line" aria-hidden="true" />
                <span className="itk-cta-label">{f.resultCta}</span>
                <span className="itk-cta-arrow" aria-hidden="true">→</span>
              </button>

              <div className="itk-trustblock">
                <p className="itk-trust">{f.freeReassure}</p>
                <p className="itk-trust itk-trust--dim">{result.domain}</p>
              </div>
            </motion.div>
          )}

          {/* ── ERROR — clear message + retry ──────────────────────── */}
          {phase === "error" && (
            <motion.div key="error" className="itk-panel" {...stepMotion(reduced)}>
              <p className="itk-q itk-q--error" role="alert">{errorMsg}</p>
              <button
                type="button"
                className="itk-cta"
                onClick={() => {
                  setPhase("idle");
                  setErrorMsg("");
                }}
              >
                <span className="itk-cta-line" aria-hidden="true" />
                <span className="itk-cta-label">{f.retry}</span>
                <span className="itk-cta-arrow" aria-hidden="true">→</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{css}</style>
    </div>
  );
}

function stepMotion(reduced: boolean | null) {
  if (reduced) return {};
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.32, ease: EASE },
  };
}

const css = `
  .itk {
    --d-bone:   #efe7d7;
    --d-muted:  #9b9484;
    --d-faint:  #6f695b;
    --d-line:   rgba(238, 230, 214, 0.14);
    --d-line2:  rgba(238, 230, 214, 0.28);
    --d-olive:  #c8df3f;
    width: 100%;
    max-width: 480px;
    background: #15150f;
    border: 1px solid #2a2a20;
    color: var(--d-bone);
  }
  .itk-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 15px 22px;
    border-bottom: 1px solid var(--d-line);
    font-family: var(--font-mono), monospace;
    font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--d-muted);
  }
  .itk-head-l { display: inline-flex; align-items: center; gap: 10px; }
  .itk-pip { width: 6px; height: 6px; background: var(--d-olive); animation: itk-blink 2.6s ease-in-out infinite; }
  @keyframes itk-blink { 50% { opacity: 0.3; } }
  .itk-free {
    color: #15150f; background: var(--d-olive);
    padding: 4px 8px; font-weight: 600; letter-spacing: 0.16em;
  }

  .itk-body { padding: 26px 22px 22px; min-height: 312px; display: flex; flex-direction: column; }
  .itk-panel { display: flex; flex-direction: column; flex: 1; }

  .itk-q {
    display: block;
    font-family: var(--font-body), "Helvetica Neue", sans-serif;
    font-size: 21px; font-weight: 600; line-height: 1.3; letter-spacing: -0.015em;
    color: var(--d-bone); margin-bottom: 10px;
  }
  .itk-q--error { color: #e8a07a; font-weight: 500; font-size: 18px; }
  .itk-sub {
    font-family: var(--font-body), "Helvetica Neue", sans-serif;
    font-size: 13px; line-height: 1.5; color: var(--d-muted); margin-bottom: 22px;
  }

  .itk-inputwrap { margin-bottom: 20px; }
  .itk-input {
    display: block; width: 100%;
    border: 1px solid var(--d-line2);
    background: rgba(0,0,0,0.18);
    font-family: var(--font-mono), monospace;
    font-size: 15px; color: var(--d-bone);
    padding: 16px 16px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .itk-input::placeholder { color: var(--d-faint); }
  .itk-input:focus {
    border-color: var(--d-olive);
    background: rgba(0,0,0,0.30);
    box-shadow: inset 0 -2px 0 0 var(--d-olive);
  }

  /* ── CTA — the examination starts ─────────────────── */
  .itk-cta {
    position: relative; display: flex; align-items: center; justify-content: space-between;
    gap: 14px; width: 100%; padding: 18px 22px;
    background: var(--d-bone); color: #15150f; border: 1px solid var(--d-bone);
    cursor: pointer; overflow: hidden; margin-top: auto;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
  .itk-cta-line {
    position: absolute; top: 0; left: 0; height: 2px; width: 100%;
    background: var(--d-olive); transform: scaleX(0); transform-origin: left;
    transition: transform 0.5s cubic-bezier(.16,1,.3,1);
  }
  .itk-cta-label {
    font-family: var(--font-body), "Helvetica Neue", sans-serif;
    font-size: 14px; font-weight: 600; letter-spacing: 0.01em; text-align: left; line-height: 1.25;
  }
  .itk-cta-arrow { font-size: 17px; flex-shrink: 0; transition: transform 0.3s cubic-bezier(.16,1,.3,1); }
  .itk-cta:hover:not(:disabled) { background: var(--d-olive); border-color: var(--d-olive); }
  .itk-cta:hover:not(:disabled) .itk-cta-line { transform: scaleX(1); }
  .itk-cta:hover:not(:disabled) .itk-cta-arrow { transform: translateX(5px); }
  .itk-cta:focus-visible { outline: 2px solid var(--d-olive); outline-offset: 3px; }
  .itk-cta:disabled { background: transparent; color: var(--d-faint); border-color: var(--d-line2); cursor: not-allowed; }
  .itk-cta--reveal { background: var(--d-olive); border-color: var(--d-olive); }
  .itk-cta--reveal:hover { background: var(--d-bone); }

  .itk-trustblock { margin-top: 16px; display: flex; flex-direction: column; gap: 6px; }
  .itk-trust {
    font-family: var(--font-mono), monospace;
    font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--d-muted);
    display: flex; align-items: center; gap: 8px;
  }
  .itk-trust::before {
    content: ""; width: 5px; height: 5px; flex-shrink: 0; background: var(--d-olive);
  }
  .itk-trust--dim { color: var(--d-faint); }
  .itk-trust--dim::before { background: var(--d-faint); }

  /* ── scanning readout ─────────────────────────────── */
  .itk-scanhead { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 22px; }
  .itk-scan-domain {
    font-family: var(--font-mono), monospace; font-size: 13px; color: var(--d-bone);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 65%;
  }
  .itk-scan-status {
    font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.2em;
    text-transform: uppercase; color: var(--d-olive);
  }
  .itk-steps { list-style: none; display: flex; flex-direction: column; gap: 11px; margin: 0 0 22px; }
  .itk-stepline { display: flex; align-items: center; gap: 12px; font-family: var(--font-mono), monospace; font-size: 12px; }
  .itk-stepdot { width: 7px; height: 7px; flex-shrink: 0; border: 1px solid var(--d-line2); transition: background 0.3s, border-color 0.3s; }
  .itk-steptext { transition: color 0.3s; }
  .itk-stepcheck { margin-left: auto; color: var(--d-olive); font-size: 11px; }
  .itk-stepline--todo .itk-steptext { color: var(--d-faint); }
  .itk-stepline--active .itk-steptext { color: var(--d-bone); }
  .itk-stepline--active .itk-stepdot { border-color: var(--d-olive); background: var(--d-olive); animation: itk-blink 1.1s ease-in-out infinite; }
  .itk-stepline--done .itk-steptext { color: var(--d-muted); }
  .itk-stepline--done .itk-stepdot { background: var(--d-olive); border-color: var(--d-olive); }
  .itk-scanbar { height: 2px; background: var(--d-line); margin-top: auto; }
  .itk-scanbar-fill { display: block; height: 100%; background: var(--d-olive); transition: width 0.6s cubic-bezier(.16,1,.3,1); }

  /* ── first finding ────────────────────────────────── */
  .itk-finding-label {
    font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.2em;
    text-transform: uppercase; color: var(--d-olive); margin-bottom: 14px; display: block;
  }
  .itk-finding {
    font-family: var(--font-body), "Helvetica Neue", sans-serif;
    font-size: 20px; font-weight: 500; line-height: 1.4; letter-spacing: -0.01em;
    color: var(--d-bone); margin-bottom: 22px; outline: none;
  }
  .itk-gapline {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--d-muted); margin-bottom: 26px;
  }
  .itk-gap-dot { width: 7px; height: 7px; background: var(--d-olive); flex-shrink: 0; }

  @media (prefers-reduced-motion: reduce) {
    .itk-pip, .itk-stepline--active .itk-stepdot { animation: none; }
    .itk-cta-line, .itk-cta-arrow, .itk-scanbar-fill { transition: none; }
  }
  @media (max-width: 480px) {
    .itk { max-width: none; }
    .itk-body { min-height: 280px; }
  }
`;
