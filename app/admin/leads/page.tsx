// ─── /admin/leads — interne Lead-Liste ────────────────────────────────────────
// Wiederhergestelltes CRM aus d9897b2 / ca20cc9, umgestellt von der früheren
// JSONL-Datei auf public.leads. Layout, Filterleiste, Sortierpfeile und
// Status-Chips sind übernommen; die Spalten folgen dem heutigen Datenmodell.
//
// Zugang: ausschließlich Supabase-Session mit Rolle seeszn_admin, serverseitig
// geprüft. Gelesen wird danach mit dem Secret Key — public.leads bleibt für
// anon und authenticated gesperrt.

import type { Metadata } from "next";
import Link from "next/link";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { checkSeesznAdmin } from "@/lib/leads/access";
import { isLeadSortKey, readAllLeads, MAIL_FAILED_FILTER, type LeadSortKey } from "@/lib/leads/admin";
import {
  LEAD_SOURCE_LABEL,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_ORDER,
  type LeadRow,
} from "@/lib/leads/types";
import { actionMarkContacted } from "./actions";
import {
  DeliveryBadge,
  PriorityText,
  StatusBadge,
  btnStyle,
  formatDate,
  formatDay,
  mutedStyle,
  shellStyle,
  tdStyle,
  thStyle,
} from "./ui";

// Interner Bereich: nie indexieren, nie in die Sitemap.
export const metadata: Metadata = {
  title: "Lead-CRM | SEESZN",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Filteroptionen der Kopfleiste, in der Reihenfolge des Arbeitsablaufs. */
const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Alle" },
  ...LEAD_STATUS_ORDER.map((s) => ({ value: s, label: LEAD_STATUS_LABEL[s] })),
  { value: MAIL_FAILED_FILTER, label: "Mail fehlgeschlagen" },
];

function SortTh({
  col,
  label,
  sortBy,
  sortDir,
  filterStatus,
  filterSearch,
}: {
  col: LeadSortKey;
  label: string;
  sortBy: string;
  sortDir: string;
  filterStatus: string;
  filterSearch: string;
}) {
  const newDir = sortBy === col && sortDir === "desc" ? "asc" : "desc";
  const arrow = sortBy === col ? (sortDir === "desc" ? " ↓" : " ↑") : "";
  const params = new URLSearchParams({ sort: col, dir: newDir });
  if (filterStatus) params.set("status", filterStatus);
  if (filterSearch) params.set("search", filterSearch);
  return (
    <th style={thStyle}>
      <Link
        href={`/admin/leads?${params.toString()}`}
        style={{ color: "inherit", textDecoration: "none" }}
      >
        {label}
        {arrow}
      </Link>
    </th>
  );
}

function LeadRowView({ lead }: { lead: LeadRow }) {
  const markContacted = actionMarkContacted.bind(null, lead.id, "list");
  const open = lead.status === "new";
  return (
    <tr style={{ background: open ? "#fffdf8" : "#fff" }}>
      <td style={tdStyle}>{formatDate(lead.createdAt)}</td>
      <td style={{ ...tdStyle, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
        {lead.name ?? <span style={mutedStyle}>–</span>}
      </td>
      <td style={{ ...tdStyle, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
        <Link href={`/admin/leads/${lead.id}`} style={{ color: "#1a1a17", fontWeight: 600, textDecoration: "none" }}>
          {lead.email}
        </Link>
      </td>
      <td style={{ ...tdStyle, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
        {lead.companyDomain ?? <span style={mutedStyle}>–</span>}
      </td>
      <td style={tdStyle}>{LEAD_SOURCE_LABEL[lead.source] ?? lead.source}</td>
      <td style={tdStyle}>
        <StatusBadge status={lead.status} />
      </td>
      <td style={tdStyle}>
        <PriorityText priority={lead.priority} />
      </td>
      <td style={tdStyle}>
        <DeliveryBadge status={lead.emailDeliveryStatus} />
      </td>
      <td style={tdStyle}>
        <DeliveryBadge status={lead.userEmailStatus} />
      </td>
      <td style={tdStyle}>
        {lead.nextFollowUpAt ? formatDay(lead.nextFollowUpAt) : <span style={mutedStyle}>–</span>}
      </td>
      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
        <Link
          href={`/admin/leads/${lead.id}`}
          style={{ fontSize: 11, color: "#1a4a8a", textDecoration: "none", marginRight: 10 }}
        >
          Öffnen
        </Link>
        {lead.status !== "contacted" && lead.status !== "closed" && (
          <form style={{ display: "inline" }} action={markContacted}>
            <button
              type="submit"
              style={{
                fontSize: 11,
                color: "#1a6b3a",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Kontaktiert ✓
            </button>
          </form>
        )}
      </td>
    </tr>
  );
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const gate = await checkSeesznAdmin();
  if (gate.state === "anonymous") return <AdminLogin />;
  if (gate.state === "denied") return <AdminLogin noAccessEmail={gate.email} />;

  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

  const filterStatus = one(sp.status);
  const filterSearch = one(sp.search);
  const sortRaw = one(sp.sort);
  const sortBy: LeadSortKey = isLeadSortKey(sortRaw) ? sortRaw : "createdAt";
  const sortDir = one(sp.dir) === "asc" ? "asc" : "desc";

  const { leads, matched, total } = await readAllLeads({
    status: filterStatus,
    search: filterSearch,
    sort: sortBy,
    dir: sortDir,
  });

  const sortProps = { sortBy, sortDir, filterStatus, filterSearch };
  const filtered = Boolean(filterStatus || filterSearch);

  return (
    <div style={shellStyle}>
      <AdminTopBar label="Lead-Liste" exportHref="/admin/leads/export" email={gate.email} />

      <div style={{ padding: "18px 24px" }}>
        <form
          method="GET"
          action="/admin/leads"
          style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}
        >
          <input
            type="text"
            name="search"
            defaultValue={filterSearch}
            placeholder="E-Mail, Name oder Domain …"
            style={{
              padding: "7px 10px",
              fontSize: 13,
              border: "1px solid #d8d6ce",
              background: "#fff",
              width: 240,
              color: "#1a1a17",
              outline: "none",
            }}
          />
          <select
            name="status"
            defaultValue={filterStatus}
            style={{
              padding: "7px 10px",
              fontSize: 13,
              border: "1px solid #d8d6ce",
              background: "#fff",
              color: "#1a1a17",
              outline: "none",
            }}
          >
            {FILTERS.map((f) => (
              <option key={f.value || "all"} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <input type="hidden" name="sort" value={sortBy} />
          <input type="hidden" name="dir" value={sortDir} />
          <button type="submit" style={{ ...btnStyle, padding: "7px 14px" }}>
            Filtern
          </button>
          <Link href="/admin/leads" style={{ fontSize: 12, color: "#8a8478", textDecoration: "none" }}>
            Reset
          </Link>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#8a8478" }}>
            {filtered ? `${matched} von ${total} Leads` : `${total} Leads`}
          </span>
        </form>

        <div style={{ overflowX: "auto", border: "1px solid #e6e4dc", borderRadius: 2 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", fontSize: 12 }}>
            <thead>
              <tr>
                <SortTh col="createdAt" label="Eingang" {...sortProps} />
                <th style={thStyle}>Name</th>
                <SortTh col="email" label="E-Mail" {...sortProps} />
                <SortTh col="companyDomain" label="Domain" {...sortProps} />
                <th style={thStyle}>Quelle</th>
                <SortTh col="status" label="Status" {...sortProps} />
                <SortTh col="priority" label="Priorität" {...sortProps} />
                <th style={thStyle}>Interne Mail</th>
                <th style={thStyle}>Nutzer-Mail</th>
                <SortTh col="nextFollowUpAt" label="Follow-up" {...sortProps} />
                <th style={thStyle}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ padding: 28, textAlign: "center", color: "#8a8478", fontSize: 13 }}>
                    {total === 0 ? "Noch keine Leads." : "Keine Leads für diesen Filter."}
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <LeadRowView key={lead.id} lead={lead} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
