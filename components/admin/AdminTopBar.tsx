"use client";

// ─── Kopfleiste des internen Lead-CRM ─────────────────────────────────────────
// Client Component, weil der Logout über den Supabase-Browser-Client läuft:
// signOut() räumt das Session-Cookie ab, danach greift die serverseitige
// Prüfung wieder und zeigt das Login.

import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface AdminTopBarProps {
  /** Text rechts neben dem Wortzeichen. */
  label: string;
  /** Wenn gesetzt, steht links ein Zurück-Link statt des Wortzeichens. */
  backHref?: string;
  backLabel?: string;
  /** Blendet den CSV-Link ein (nur auf der Liste sinnvoll). */
  exportHref?: string;
  /** E-Mail des angemeldeten Kontos, klein rechts. */
  email?: string;
}

const linkStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#9a9486",
  textDecoration: "none",
};

export default function AdminTopBar({
  label,
  backHref,
  backLabel,
  exportHref,
  email,
}: AdminTopBarProps) {
  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.assign("/admin/leads");
  }

  return (
    <div
      style={{
        background: "#1a1a17",
        padding: "13px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {backHref ? (
          <Link href={backHref} style={linkStyle}>
            ← {backLabel ?? "Zurück"}
          </Link>
        ) : (
          <span style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, color: "#fff" }}>
            SEESZN
          </span>
        )}
        <span style={{ fontSize: 11, color: "#6b6b63" }}>{label}</span>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {email && <span style={{ fontSize: 11, color: "#6b6b63" }}>{email}</span>}
        {exportHref && (
          <a href={exportHref} style={linkStyle}>
            ↓ CSV Export
          </a>
        )}
        <button
          type="button"
          onClick={signOut}
          style={{ ...linkStyle, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
