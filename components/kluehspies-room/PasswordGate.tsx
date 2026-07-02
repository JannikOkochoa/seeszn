"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { KLUE } from "./data";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface PasswordGateProps {
  expectedPassword: string;
  onUnlock: () => void;
}

/**
 * Zugangstür zum Website Lab. Bewusst einfach gehalten: ein Passwort,
 * lokal gespeichert — kein Auth-System, kein Account. Der Anspruch ist
 * trotzdem derselbe wie im Raum dahinter: ruhig, präzise, SEESZN.
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
      <div className="kg-grid" aria-hidden="true" />

      <motion.div
        className="kg-card"
        initial={reduced ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* Kopfzeile — Klühspies-Farbmarke trifft SEESZN-Meta */}
        <div className="kg-head">
          <span className="kg-mark" aria-hidden="true">
            <i style={{ background: KLUE.blue }} />
            <i style={{ background: KLUE.yellow }} />
          </span>
          <span className="t-mono">Privater Bereich</span>
        </div>

        <h1 className="kg-title">
          Klühspies <span className="t-accent kg-title-accent">Website Lab</span>
        </h1>
        <p className="kg-sub">Private strategy room powered by SEESZN</p>

        <motion.form
          onSubmit={submit}
          className="kg-form"
          key={shake}
          animate={
            shake > 0 && !reduced ? { x: [0, -7, 7, -4, 4, 0] } : undefined
          }
          transition={{ duration: 0.4 }}
        >
          <label className="t-mono kg-label" htmlFor="kg-password">
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

        <p className="kg-foot t-mono">
          Zugang nur für Klühspies Reisen &amp; SEESZN
        </p>
      </motion.div>

      <style>{`
        .kg {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--paper);
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .kg-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(color-mix(in srgb, var(--warm-black) 4%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--warm-black) 4%, transparent) 1px, transparent 1px);
          background-size: 120px 120px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 42%, black 0%, transparent 78%);
        }
        .kg-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: var(--surface-raised);
          border: 1px solid var(--line);
          padding: clamp(32px, 5vw, 48px);
        }
        .kg-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 34px;
        }
        .kg-mark { display: inline-flex; gap: 4px; }
        .kg-mark i { width: 10px; height: 10px; display: block; }
        .kg-title {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(30px, 5vw, 38px);
          line-height: 1.02;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: var(--ink-strong);
          margin: 0 0 10px;
        }
        .kg-title-accent {
          display: block;
          text-transform: none;
          font-size: 0.88em;
        }
        .kg-sub {
          font-family: var(--font-body), sans-serif;
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0 0 34px;
        }
        .kg-form { display: flex; flex-direction: column; }
        .kg-label { display: block; margin-bottom: 8px; }
        .kg-input {
          appearance: none;
          width: 100%;
          border: 1px solid var(--border-btn);
          background: var(--paper-soft);
          color: var(--ink-strong);
          font-family: var(--font-body), sans-serif;
          font-size: 15px;
          letter-spacing: 0.14em;
          padding: 13px 16px;
          min-height: 48px;
          outline: none;
          transition: border-color 0.25s;
        }
        .kg-input:focus { border-color: var(--warm-black); }
        .kg-input[aria-invalid="true"] { border-color: var(--clay); }
        .kg-input::placeholder { color: var(--text-faint); letter-spacing: 0.2em; }
        .kg-error {
          font-family: var(--font-body), sans-serif;
          font-size: 12.5px;
          color: var(--clay);
          margin: 8px 0 0;
        }
        .kg-btn {
          margin-top: 16px;
          border: 1px solid var(--warm-black);
          background: var(--warm-black);
          color: var(--paper);
          font-family: var(--font-body), sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          padding: 14px 26px;
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.25s, color 0.25s;
        }
        .kg-btn:hover { background: transparent; color: var(--ink-strong); }
        .kg-btn:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }
        .kg-foot {
          margin: 30px 0 0;
          padding-top: 18px;
          border-top: 1px solid var(--line-soft);
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
