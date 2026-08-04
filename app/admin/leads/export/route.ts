// ─── GET /admin/leads/export — CSV der Lead-Liste ─────────────────────────────
// Wiederhergestellt aus dem früheren CRM, Spalten auf public.leads umgestellt.
//
// scan_result bleibt bewusst draußen: das jsonb ist mehrere Kilobyte pro Lead
// und macht die Datei in jedem Tabellenprogramm unbrauchbar. Wer die Diagnose
// braucht, öffnet den Lead.
//
// Die Filter der Liste werden übernommen, wenn sie in der URL stehen — so
// exportiert man genau das, was man gerade sieht.

import { checkSeesznAdmin } from "@/lib/leads/access";
import { isLeadSortKey, readAllLeads, type LeadSortKey } from "@/lib/leads/admin";
import { LEAD_STATUS_LABEL, type LeadRow } from "@/lib/leads/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const COLUMNS: [string, (lead: LeadRow) => unknown][] = [
  ["created_at", (l) => l.createdAt],
  ["updated_at", (l) => l.updatedAt],
  ["name", (l) => l.name],
  ["email", (l) => l.email],
  ["email_domain", (l) => l.emailDomain],
  ["company_domain", (l) => l.companyDomain],
  ["source", (l) => l.source],
  ["page", (l) => l.page],
  ["locale", (l) => l.locale],
  ["status", (l) => l.status],
  ["status_label", (l) => LEAD_STATUS_LABEL[l.status] ?? l.status],
  ["priority", (l) => l.priority],
  ["email_delivery_status", (l) => l.emailDeliveryStatus],
  ["user_email_status", (l) => l.userEmailStatus],
  ["email_error", (l) => l.emailError],
  ["last_contacted_at", (l) => l.lastContactedAt],
  ["next_follow_up_at", (l) => l.nextFollowUpAt],
  ["internal_notes", (l) => l.internalNotes],
  ["id", (l) => l.id],
];

function buildCsv(leads: LeadRow[]): string {
  const header = COLUMNS.map(([label]) => csvEscape(label)).join(",");
  const rows = leads.map((lead) =>
    COLUMNS.map(([, read]) => csvEscape(read(lead))).join(","),
  );
  return [header, ...rows].join("\r\n");
}

export async function GET(request: Request): Promise<Response> {
  const gate = await checkSeesznAdmin();
  if (gate.state !== "granted") {
    return new Response("Kein Zugriff auf das Lead-CRM.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const url = new URL(request.url);
  const sortRaw = url.searchParams.get("sort");
  const sort: LeadSortKey = isLeadSortKey(sortRaw) ? sortRaw : "createdAt";

  const { leads } = await readAllLeads({
    status: url.searchParams.get("status") ?? "",
    search: url.searchParams.get("search") ?? "",
    sort,
    dir: url.searchParams.get("dir") === "asc" ? "asc" : "desc",
  });

  // BOM voran, sonst zerlegt Excel die Umlaute.
  const csv = `﻿${buildCsv(leads)}`;
  const filename = `seeszn-leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
