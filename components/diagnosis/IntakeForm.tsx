"use client";

import { useState } from "react";

// Scan intake — the conversion instrument. Posts to the existing
// /api/contact endpoint (Resend); url + suspect ride along as optional fields.

const SUSPECTS = [
  "SEARCH RANKINGS",
  "AI ANSWERS",
  "WEBSITE",
  "CONVERSION",
  "UNKNOWN",
];

export default function IntakeForm() {
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [suspect, setSuspect] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, url, suspect }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="itk">
      <div className="itk-head">
        <span>SCAN INTAKE — NEW SPECIMEN</span>
        <span>SZN-SC-05</span>
      </div>

      {status === "success" ? (
        <div className="itk-done" role="status">
          <span className="itk-done-pip" aria-hidden="true" />
          <p className="itk-done-title">INTAKE RECEIVED.</p>
          <p className="itk-done-copy">
            Your surface enters the scan. We reply from hello@seeszn.com — a
            reading, not a pitch.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="itk-form">
          <div className="itk-field">
            <label htmlFor="itk-email" className="itk-label">
              FIELD 01 — CONTACT <span className="itk-req">REQUIRED</span>
            </label>
            <input
              id="itk-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="itk-input"
              autoComplete="email"
            />
          </div>

          <div className="itk-field">
            <label htmlFor="itk-url" className="itk-label">
              FIELD 02 — SURFACE <span className="itk-opt">OPTIONAL</span>
            </label>
            <input
              id="itk-url"
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourdomain.com"
              className="itk-input"
              autoComplete="url"
            />
          </div>

          <fieldset className="itk-field itk-fieldset">
            <legend className="itk-label">
              FIELD 03 — SUSPECTED LEAK <span className="itk-opt">OPTIONAL</span>
            </legend>
            <div className="itk-chips">
              {SUSPECTS.map((s) => (
                <label key={s} className={`itk-chip${suspect === s ? " itk-chip--on" : ""}`}>
                  <input
                    type="radio"
                    name="suspect"
                    value={s}
                    checked={suspect === s}
                    onChange={() => setSuspect(s)}
                    className="itk-radio"
                  />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" disabled={status === "loading"} className="itk-submit">
            {status === "loading" ? "TRANSMITTING…" : "REQUEST THE SCAN"}
            <span aria-hidden="true" style={{ color: "var(--olive)" }}> →</span>
          </button>

          {status === "error" && (
            <p className="itk-error" role="alert">
              TRANSMISSION FAILED. WRITE TO{" "}
              <a href="mailto:hello@seeszn.com">HELLO@SEESZN.COM</a>
            </p>
          )}
        </form>
      )}

      <div className="itk-foot">
        <span>NO PITCH DECK. NO RETAINER TALK.</span>
        <span className="itk-foot-note">A READING OF YOUR SURFACE</span>
      </div>

      <style>{`
        .itk {
          width: 100%;
          max-width: 480px;
          border: 1px solid var(--warm-black);
          background: var(--paper);
        }
        .itk-head {
          display: flex;
          justify-content: space-between;
          padding: 14px 22px;
          border-bottom: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: #5E574F;
        }
        .itk-form { padding: 24px 22px 28px; }
        .itk-field { margin-bottom: 22px; }
        .itk-fieldset { border: none; padding: 0; margin: 0 0 26px; }
        .itk-label {
          display: block;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          color: #5E574F;
          margin-bottom: 10px;
        }
        .itk-req { color: var(--olive); margin-left: 8px; font-size: 8px; }
        .itk-opt { color: var(--dust); margin-left: 8px; font-size: 8px; }
        .itk-input {
          display: block;
          width: 100%;
          border: 1px solid rgba(17,16,14,.45);
          background: transparent;
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          color: var(--warm-black);
          padding: 13px 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .itk-input::placeholder { color: var(--dust); }
        .itk-input:focus { border-color: var(--olive); }
        .itk-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .itk-chip {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: #5E574F;
          border: 1px solid rgba(17,16,14,.35);
          padding: 9px 12px;
          cursor: pointer;
          transition: border-color 0.25s, color 0.25s, background 0.25s;
          position: relative;
        }
        .itk-chip--on {
          border-color: var(--warm-black);
          color: var(--warm-black);
          background: rgba(199,214,58,.16);
        }
        .itk-chip:hover { border-color: rgba(17,16,14,.65); }
        .itk-chip:has(.itk-radio:focus-visible) {
          outline: 1px solid var(--warm-black);
          outline-offset: 3px;
        }
        .itk-radio {
          position: absolute;
          opacity: 0;
          width: 1px;
          height: 1px;
        }
        .itk-submit {
          display: block;
          width: 100%;
          background: var(--warm-black);
          color: var(--paper);
          border: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          padding: 16px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .itk-submit:hover { opacity: 0.88; }
        .itk-submit:disabled { opacity: 0.6; cursor: wait; }
        .itk-submit:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }
        .itk-error {
          margin-top: 14px;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--clay);
        }
        .itk-error a { text-decoration: underline; }

        .itk-done { padding: 36px 22px 40px; }
        .itk-done-pip {
          display: block;
          width: 7px;
          height: 7px;
          background: var(--olive);
          margin-bottom: 18px;
        }
        .itk-done-title {
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          letter-spacing: 0.14em;
          color: var(--warm-black);
          margin-bottom: 12px;
        }
        .itk-done-copy {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          line-height: 1.75;
          color: #5E574F;
          max-width: 360px;
        }

        .itk-foot {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 22px;
          border-top: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.16em;
          color: #5E574F;
        }
        .itk-foot-note { color: var(--olive); }

        @media (max-width: 480px) {
          .itk-foot { flex-direction: column; gap: 6px; }
        }
      `}</style>
    </div>
  );
}
