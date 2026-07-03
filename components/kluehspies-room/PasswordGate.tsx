"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface PasswordGateProps {
  expectedPassword: string;
  onUnlock: () => void;
}

/**
 * Zugangstür zum Website Lab. Bewusst einfach gehalten: ein Passwort,
 * lokal gespeichert — kein Auth-System, kein Account. Gestaltet wie der
 * Raum dahinter: ein Serif, ein Sans, eine Hairline, viel Ruhe.
 */
export default function PasswordGate({ expectedPassword, onUnlock }: PasswordGateProps) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() === expectedPassword) {
      onUnlock();
      return;
    }
    setError(true);
    setShake((n) => n + 1);
  }

  return (
    <div className="kg">
      <motion.div
        className="kg-inner"
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <p className="kg-eyebrow">Privater Bereich · Klühspies × SEESZN</p>

        <h1 className="kg-title">
          Klühspies <span className="kg-resolve">Website Lab.</span>
        </h1>
        <p className="kg-sub">Privater Strategieraum, powered by SEESZN.</p>

        <motion.form
          onSubmit={submit}
          className="kg-form"
          key={shake}
          animate={shake > 0 && !reduced ? { x: [0, -7, 7, -4, 4, 0] } : undefined}
          transition={{ duration: 0.4 }}
        >
          <label className="kg-eyebrow kg-label" htmlFor="kg-password">
            Passwort
          </label>
          <input
            id="kg-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            className="kg-input"
            placeholder="••••••••••"
            aria-invalid={error}
          />
          {error && (
            <p className="kg-error" role="alert">
              Das Passwort ist nicht korrekt. Bitte erneut versuchen.
            </p>
          )}
          <button type="submit" className="kg-btn">
            Raum betreten <span aria-hidden="true">→</span>
          </button>
        </motion.form>

        <p className="kg-foot">Zugang nur für Klühspies Reisen &amp; SEESZN</p>
      </motion.div>

      <style>{`
        .kg {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--paper);
          padding: 24px;
        }
        .kg-inner {
          width: 100%;
          max-width: 400px;
        }
        .kg-eyebrow {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 26px;
        }
        .kg-title {
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(32px, 6vw, 40px);
          line-height: 1.15;
          letter-spacing: -0.01em;
          color: var(--ink-strong);
          margin: 0 0 12px;
        }
        .kg-resolve {
          display: inline-block;
          animation: kg-resolve 1.28s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }
        @keyframes kg-resolve {
          0%   { filter: blur(6px);   opacity: 0.16; }
          42%  { filter: blur(2.5px); opacity: 0.55; }
          74%  { filter: blur(0.4px); opacity: 0.96; }
          100% { filter: blur(0);     opacity: 1; }
        }
        .kg-sub {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0 0 44px;
        }
        .kg-form { display: flex; flex-direction: column; }
        .kg-label { margin-bottom: 6px; }
        .kg-input {
          appearance: none;
          width: 100%;
          border: none;
          border-bottom: 1px solid var(--border-btn);
          background: transparent;
          color: var(--ink-strong);
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 16px;
          letter-spacing: 0.12em;
          padding: 10px 0 12px;
          min-height: 44px;
          outline: none;
          transition: border-color 0.25s;
        }
        .kg-input:focus { border-color: var(--warm-black); }
        .kg-input[aria-invalid="true"] { border-color: var(--clay); }
        .kg-input::placeholder { color: var(--text-faint); letter-spacing: 0.2em; }
        .kg-error {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 13px;
          color: var(--clay);
          margin: 10px 0 0;
        }
        .kg-btn {
          margin-top: 30px;
          border: 1px solid var(--warm-black);
          background: var(--warm-black);
          color: var(--paper);
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.01em;
          padding: 13px 26px;
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.25s, color 0.25s;
        }
        .kg-btn:hover { background: transparent; color: var(--ink-strong); }
        .kg-btn:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 4px; }
        .kg-foot {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          margin: 44px 0 0;
          padding-top: 18px;
          border-top: 1px solid var(--line);
        }
        @media (prefers-reduced-motion: reduce) {
          .kg-resolve { animation: none; }
        }
      `}</style>
    </div>
  );
}
