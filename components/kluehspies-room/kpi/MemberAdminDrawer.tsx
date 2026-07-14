"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { MemberCompany, Role } from "@/lib/kpi/types";
import Drawer from "./Drawer";
import { useWorkspace } from "./workspace";

const ROLE_LABEL: Record<Role, string> = {
  seeszn_admin: "SEESZN Admin",
  kluehspies_editor: "Klühspies Editor",
  viewer: "Nur lesen",
};

const COMPANY_LABEL: Record<MemberCompany, string> = {
  seeszn: "SEESZN",
  kluehspies: "Klühspies",
};

export default function MemberAdminDrawer() {
  const { memberAdminOpen, setMemberAdminOpen, isAdmin } = useWorkspace();

  if (!memberAdminOpen || !isAdmin) return null;

  return <MemberAdminForm onClose={() => setMemberAdminOpen(false)} />;
}

function MemberAdminForm({ onClose }: { onClose: () => void }) {
  const { members } = useWorkspace();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState<MemberCompany>("kluehspies");
  const [role, setRole] = useState<Role>("kluehspies_editor");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        if (a.company !== b.company) {
          return (a.company ?? "").localeCompare(b.company ?? "");
        }
        return (a.full_name ?? a.email ?? "").localeCompare(
          b.full_name ?? b.email ?? "",
          "de",
        );
      }),
    [members],
  );

  function changeCompany(nextCompany: MemberCompany) {
    setCompany(nextCompany);
    setRole(nextCompany === "seeszn" ? "seeszn_admin" : "kluehspies_editor");
    setError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();

    if (!normalizedName || !normalizedEmail) {
      setError("Name und E-Mail-Adresse sind erforderlich.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: normalizedName,
          email: normalizedEmail,
          company,
          role,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "Die Einladung konnte nicht versendet werden.");
        return;
      }

      setSuccess(`Einladung an ${normalizedEmail} wurde versendet.`);
      setFullName("");
      setEmail("");

      window.setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch {
      setError("Die Verbindung zum Server ist fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <div>
          <span className="kr-eyebrow">Administration</span>
          <span className="kw-drawer-name">Mitglieder verwalten</span>
        </div>
      }
    >
      <section className="kw-dsection kw-dsection--head">
        <div className="kw-dsection-head">
          <h2 className="kw-dsection-title">Person einladen</h2>
        </div>

        <form className="kw-form kw-member-form" onSubmit={submit}>
          <label className="kw-field">
            <span className="kr-eyebrow">Vollständiger Name</span>
            <input
              type="text"
              className="kw-input"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setError(null);
              }}
              placeholder="z. B. Celine Mustermann"
              autoComplete="name"
              data-autofocus
            />
          </label>

          <label className="kw-field">
            <span className="kr-eyebrow">E-Mail-Adresse</span>
            <input
              type="email"
              className="kw-input"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              placeholder="name@kluehspies.de"
              autoComplete="email"
            />
          </label>

          <div className="kw-form-row">
            <label className="kw-field">
              <span className="kr-eyebrow">Unternehmen</span>
              <select
                className="kw-select"
                value={company}
                onChange={(event) =>
                  changeCompany(event.target.value as MemberCompany)
                }
              >
                <option value="kluehspies">Klühspies</option>
                <option value="seeszn">SEESZN</option>
              </select>
            </label>

            <label className="kw-field">
              <span className="kr-eyebrow">Rolle</span>
              <select
                className="kw-select"
                value={role}
                onChange={(event) => {
                  setRole(event.target.value as Role);
                  setError(null);
                }}
              >
                {company === "seeszn" ? (
                  <>
                    <option value="seeszn_admin">SEESZN Admin</option>
                    <option value="viewer">Nur lesen</option>
                  </>
                ) : (
                  <>
                    <option value="kluehspies_editor">Klühspies Editor</option>
                    <option value="viewer">Nur lesen</option>
                  </>
                )}
              </select>
            </label>
          </div>

          <p className="kr-meta kw-member-help">
            Editor können KPIs und Maßnahmen bearbeiten. Viewer erhalten
            ausschließlich Lesezugriff. SEESZN Admins können zusätzlich
            Mitglieder verwalten.
          </p>

          {error && (
            <p className="kw-member-message kw-member-message--error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="kw-member-message" role="status">
              {success}
            </p>
          )}

          <button type="submit" className="kw-member-submit" disabled={saving}>
            {saving ? "Einladung wird versendet…" : "Einladung versenden"}
          </button>
        </form>
      </section>

      <section className="kw-dsection kw-dsection--last">
        <div className="kw-dsection-head">
          <h2 className="kw-dsection-title">Aktuelle Mitglieder</h2>
          <span className="kr-meta">{members.length}</span>
        </div>

        <div className="kw-member-list">
          {sortedMembers.map((member) => (
            <article className="kw-member-row" key={member.profile_id}>
              <div>
                <strong>{member.full_name || member.email || "Ohne Namen"}</strong>
                {member.email && member.full_name && (
                  <span>{member.email}</span>
                )}
              </div>
              <div className="kw-member-meta">
                <span>
                  {member.company
                    ? COMPANY_LABEL[member.company]
                    : ROLE_LABEL[member.role]}
                </span>
                <span>{ROLE_LABEL[member.role]}</span>
                <span>
                  {member.status === "active" ? "Aktiv" : "Eingeladen"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        .kw-member-form {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .kw-member-help {
          margin: -4px 0 0;
          line-height: 1.6;
        }

        .kw-member-submit {
          align-self: flex-start;
          min-height: 42px;
          padding: 10px 18px;
          border: 1px solid var(--warm-black);
          background: var(--warm-black);
          color: var(--paper);
          font: inherit;
          font-size: 13px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .kw-member-submit:disabled {
          cursor: default;
          opacity: 0.45;
        }

        .kw-member-submit:focus-visible {
          outline: 1px solid var(--ink-strong);
          outline-offset: 3px;
        }

        .kw-member-message {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .kw-member-message--error {
          color: var(--clay);
        }

        .kw-member-list {
          border-top: 1px solid var(--line);
        }

        .kw-member-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          padding: 18px 0;
          border-bottom: 1px solid var(--line);
        }

        .kw-member-row strong,
        .kw-member-row > div:first-child span {
          display: block;
        }

        .kw-member-row strong {
          color: var(--ink-strong);
          font-size: 14px;
          font-weight: 600;
        }

        .kw-member-row > div:first-child span {
          margin-top: 5px;
          color: var(--text-muted);
          font-size: 12px;
        }

        .kw-member-meta {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 7px 14px;
          color: var(--text-muted);
          font-size: 12px;
          text-align: right;
        }

        @media (max-width: 640px) {
          .kw-member-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .kw-member-meta {
            justify-content: flex-start;
            text-align: left;
          }
        }
      `}</style>
    </Drawer>
  );
}
