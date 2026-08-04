"use client";

// ─── Login: internes Lead-CRM ─────────────────────────────────────────────────
// Zugangstür zu /admin/leads. Bewusst nüchtern gehalten und ohne SEESZN-Chrome:
// das hier ist ein Werkzeug, keine Marketingfläche. Optik folgt der Lead-Liste
// (Systemschrift, #f4f3ee, dunkle Kopfleiste).
//
// Anmeldung läuft über Supabase Auth mit dem Publishable Key; die Session liegt
// im Cookie und wird bei jedem Aufruf serverseitig geprüft. Ob das Konto
// wirklich seeszn_admin ist, entscheidet danach der Server — dieses Formular
// meldet nur an.

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface AdminLoginProps {
  /** Gesetzt, wenn jemand angemeldet ist, aber die Rolle seeszn_admin fehlt. */
  noAccessEmail?: string;
}

const shell: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f4f3ee",
  fontFamily: "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  display: "flex",
  flexDirection: "column",
};

const inputStyle: React.CSSProperties = {
  padding: "9px 11px",
  fontSize: 13,
  border: "1px solid #d8d6ce",
  background: "#fff",
  color: "#1a1a17",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 12,
  background: "#1a1a17",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  letterSpacing: "0.04em",
  fontWeight: 600,
};

export default function AdminLogin({ noAccessEmail }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    // Neu laden, damit der Server die Session sieht und die Liste rendert.
    window.location.reload();
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div style={shell}>
      <div
        style={{
          background: "#1a1a17",
          padding: "13px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, color: "#fff" }}>
          SEESZN
        </span>
        <span style={{ fontSize: 11, color: "#6b6b63" }}>Lead-CRM</span>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            background: "#fff",
            border: "1px solid #e6e4dc",
            borderTop: "3px solid #1a1a17",
            borderRadius: 4,
            padding: "26px 26px 28px",
          }}
        >
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#9a9486",
              margin: "0 0 10px",
            }}
          >
            Interner Bereich
          </p>
          <h1 style={{ margin: "0 0 6px", fontSize: 21, fontWeight: 700, color: "#1a1a17" }}>
            Lead-CRM
          </h1>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6f6a5f", lineHeight: 1.55 }}>
            Zugang nur für SEESZN-Administratoren.
          </p>

          {noAccessEmail ? (
            <div>
              <p
                role="alert"
                style={{
                  margin: "0 0 16px",
                  fontSize: 13,
                  color: "#8a1a1a",
                  lineHeight: 1.6,
                  background: "#fdf3f3",
                  border: "1px solid #f2dcdc",
                  padding: "11px 13px",
                  borderRadius: 3,
                }}
              >
                {noAccessEmail} hat keinen Zugriff auf das Lead-CRM. Dieser Bereich ist auf die
                Rolle <strong>seeszn_admin</strong> beschränkt.
              </p>
              <button type="button" onClick={signOut} style={btnStyle}>
                Mit anderem Konto anmelden
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label
                htmlFor="admin-email"
                style={{ display: "block", fontSize: 12, color: "#6f6a5f", marginBottom: 6 }}
              >
                E-Mail
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ ...inputStyle, marginBottom: 14 }}
              />

              <label
                htmlFor="admin-password"
                style={{ display: "block", fontSize: 12, color: "#6f6a5f", marginBottom: 6 }}
              >
                Passwort
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, marginBottom: 18 }}
              />

              {error && (
                <p role="alert" style={{ margin: "0 0 14px", fontSize: 12, color: "#8a1a1a" }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={busy} style={{ ...btnStyle, opacity: busy ? 0.6 : 1 }}>
                {busy ? "Anmelden …" : "Anmelden"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
