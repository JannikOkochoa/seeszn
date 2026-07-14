"use client";

// ─── Passwort ändern ──────────────────────────────────────────────────────────
// Sicherer Passwortwechsel für eingeloggte Nutzer, ausschließlich über den
// eingeloggten Supabase-Browser-Client (auth.updateUser). Kein Service-Role,
// kein Secret im Browser. Nach Erfolg: Bestätigung, Abmeldung, Rückleitung zur
// Login-Ansicht. Visuell konsistent mit den bestehenden KPI-Drawern; das
// Formular ist self-contained (eigener Öffnungszustand), berührt keine
// KPI-Funktionen, RLS, Memberships oder Einladungen.

import { useState } from "react";
import Drawer from "./Drawer";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MIN_LENGTH = 12;

export default function PasswordChangeDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="kw-link" onClick={() => setOpen(true)}>
        Passwort ändern
      </button>
      {open && <PasswordForm onClose={() => setOpen(false)} />}
    </>
  );
}

function PasswordForm({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit() {
    // Doppel-Submit und Aktion nach Erfolg verhindern.
    if (saving || success) return;

    if (currentPassword.length === 0) {
      setError("Bitte geben Sie Ihr aktuelles Passwort ein.");
      return;
    }
    if (password.length < MIN_LENGTH) {
      setError(`Das neue Passwort muss mindestens ${MIN_LENGTH} Zeichen lang sein.`);
      return;
    }
    if (password !== confirm) {
      setError("Die beiden Passwörter stimmen nicht überein.");
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({
      current_password: currentPassword,
      password,
    });
    if (updateError) {
      setSaving(false);
      setError("Das Passwort konnte nicht geändert werden. Bitte prüfen Sie Ihr aktuelles Passwort.");
      return;
    }

    // Erfolg anzeigen, danach abmelden und zur Login-Ansicht zurückleiten.
    setSuccess(true);
    window.setTimeout(async () => {
      await supabase.auth.signOut();
      window.history.replaceState(null, "", "/kluehspies-room");
      window.location.reload();
    }, 1600);
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <div>
          <span className="kr-eyebrow">Konto</span>
          <span className="kw-drawer-name">Passwort ändern</span>
        </div>
      }
    >
      <section className="kw-dsection kw-dsection--head" aria-label="Passwort ändern">
        {success ? (
          <p className="kr-body" role="status">
            Passwort geändert. Sie werden aus Sicherheitsgründen abgemeldet und zur Anmeldung
            zurückgeleitet …
          </p>
        ) : (
          <div className="kw-form">
            <label className="kw-field">
              <span className="kr-eyebrow">Aktuelles Passwort</span>
              <input
                type="password"
                className="kw-input"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={saving}
                data-autofocus
              />
            </label>
            <label className="kw-field">
              <span className="kr-eyebrow">Neues Passwort</span>
              <input
                type="password"
                className="kw-input"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={saving}
                aria-describedby="kw-pw-hint"
              />
            </label>
            <label className="kw-field">
              <span className="kr-eyebrow">Neues Passwort wiederholen</span>
              <input
                type="password"
                className="kw-input"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={saving}
              />
            </label>
            <p className="kr-meta" id="kw-pw-hint">
              Mindestens {MIN_LENGTH} Zeichen. Nach der Änderung werden Sie abgemeldet und müssen
              sich mit dem neuen Passwort erneut anmelden.
            </p>
            {error && (
              <p className="kw-form-error" role="alert">
                {error}
              </p>
            )}
            <div className="kw-form-actions">
              <button type="button" className="kr-btn" onClick={() => void submit()} disabled={saving}>
                {saving ? "Wird geändert …" : "Passwort ändern"}
              </button>
              <button type="button" className="kw-link" onClick={onClose} disabled={saving}>
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </section>
    </Drawer>
  );
}
