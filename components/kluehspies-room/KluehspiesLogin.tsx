"use client";

// ─── Login: Klühspies Website Lab ─────────────────────────────────────────────
// Ersetzt den früheren Passwortschutz durch Supabase Auth. Gestaltet wie die
// alte Zugangstür: ein Serif, ein Sans, eine Hairline, viel Ruhe. Zwei Wege:
// E-Mail + Passwort direkt, oder ein Anmeldelink über /auth/callback.

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const AFTER_LOGIN = "/kluehspies-room#kpi-monitoring";

interface KluehspiesLoginProps {
  /** Gesetzt, wenn jemand angemeldet ist, aber keine Membership besitzt. */
  noAccessEmail?: string;
}

export default function KluehspiesLogin({ noAccessEmail }: KluehspiesLoginProps) {
  const reduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setBusy(false);
      setError("Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.");
      return;
    }
    // Ziel unterscheidet sich nur um den Hash; ohne Reload würde der Server
    // die eingeloggte Ansicht nie rendern. Hash zuerst synchron setzen,
    // dann neu laden, damit der Anker den Reload sicher überlebt.
    window.location.hash = "kpi-monitoring";
    window.location.reload();
  }

  async function sendLink() {
    if (!email.trim()) {
      setError("Bitte zuerst die E-Mail-Adresse eintragen.");
      return;
    }
    setError(null);
    setBusy(true);
    const supabase = getSupabaseBrowserClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(AFTER_LOGIN)}`,
      },
    });
    setBusy(false);
    if (otpError) {
      setError("Der Anmeldelink konnte nicht versendet werden. Bitte später erneut versuchen.");
      return;
    }
    setLinkSent(true);
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.history.replaceState(null, "", "/kluehspies-room");
    window.location.reload();
  }

  return (
    <div className="kg">
      <motion.div
        className="kg-inner"
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <p className="kg-eyebrow">Privater Arbeitsraum · Klühspies × SEESZN</p>

        <h1 className="kg-title">
          Klühspies <span className="kg-resolve">Website Lab.</span>
        </h1>
        <p className="kg-sub">Anmeldung nur für eingeladene Konten von Klühspies Reisen und SEESZN.</p>

        {noAccessEmail ? (
          <div className="kg-noaccess">
            <p className="kg-error" role="alert">
              Für {noAccessEmail} ist noch kein Zugang zu diesem Arbeitsraum freigeschaltet.
              Bitte bei SEESZN melden.
            </p>
            <button type="button" className="kg-btn" onClick={signOut}>
              Mit anderem Konto anmelden
            </button>
          </div>
        ) : linkSent ? (
          <p className="kg-sent" role="status">
            Der Anmeldelink ist unterwegs. Bitte das Postfach von {email.trim()} prüfen und den
            Link auf diesem Gerät öffnen.
          </p>
        ) : (
          <form onSubmit={submit} className="kg-form">
            <label className="kg-eyebrow kg-label" htmlFor="kg-email">
              E-Mail
            </label>
            <input
              id="kg-email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="kg-input"
              placeholder="name@kluehspies.de"
            />
            <label className="kg-eyebrow kg-label kg-label--gap" htmlFor="kg-password">
              Passwort
            </label>
            <input
              id="kg-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="kg-input"
              placeholder="••••••••••"
              aria-invalid={error !== null}
            />
            {error && (
              <p className="kg-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="kg-btn" disabled={busy}>
              {busy ? "Wird geprüft…" : "Raum betreten"} <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="kg-alt" onClick={sendLink} disabled={busy}>
              Stattdessen Anmeldelink per E-Mail erhalten
            </button>
          </form>
        )}

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
        .kg-inner { width: 100%; max-width: 400px; }
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
          margin: 0 0 40px;
        }
        .kg-form { display: flex; flex-direction: column; }
        .kg-label { margin-bottom: 6px; }
        .kg-label--gap { margin-top: 24px; }
        .kg-input {
          appearance: none;
          width: 100%;
          border: none;
          border-bottom: 1px solid var(--border-btn);
          background: transparent;
          color: var(--ink-strong);
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 16px;
          padding: 10px 0 12px;
          min-height: 44px;
          outline: none;
          transition: border-color 0.25s;
        }
        .kg-input:focus { border-color: var(--warm-black); }
        .kg-input[aria-invalid="true"] { border-color: var(--clay); }
        .kg-input::placeholder { color: var(--text-faint); }
        .kg-error {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 13px;
          line-height: 1.55;
          color: var(--clay);
          margin: 12px 0 0;
        }
        .kg-sent {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-body);
          border-top: 1px solid var(--line);
          padding-top: 20px;
          margin: 0;
        }
        .kg-noaccess { display: flex; flex-direction: column; align-items: flex-start; gap: 22px; }
        .kg-noaccess .kg-error { margin: 0; }
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
          transition: background 0.25s, color 0.25s, opacity 0.25s;
        }
        .kg-noaccess .kg-btn { margin-top: 0; }
        .kg-btn:hover:not(:disabled) { background: transparent; color: var(--ink-strong); }
        .kg-btn:disabled { opacity: 0.5; cursor: default; }
        .kg-btn:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 4px; }
        .kg-alt {
          margin-top: 18px;
          align-self: flex-start;
          background: none;
          border: none;
          padding: 0 0 2px;
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 13px;
          color: var(--ink-strong);
          border-bottom: 1px solid var(--border-btn);
          cursor: pointer;
          transition: border-color 0.25s, opacity 0.25s;
        }
        .kg-alt:hover:not(:disabled) { border-color: var(--warm-black); }
        .kg-alt:disabled { opacity: 0.5; cursor: default; }
        .kg-alt:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }
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
