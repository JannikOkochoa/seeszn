// ─── Leads: interne CRM-Zugriffe ──────────────────────────────────────────────
// Reads und Updates für das interne Lead-CRM unter /admin/leads.
//
// Abgrenzung zu store.ts: dort stehen ausschließlich die Writes aus den
// öffentlichen Formularen (Lead anlegen, Versandstatus nachtragen). Hier steht
// alles, was das CRM danach mit dem Lead macht. Beide teilen sich types.ts.
//
// Zugriff: ausschließlich über den Secret Key (service_role). public.leads hat
// RLS aktiv und keine Policy für anon oder authenticated — es gibt also keinen
// Browser-Pfad zu diesen Daten, und es soll auch keinen geben. Die
// Rollenprüfung (seeszn_admin) passiert eine Ebene höher in access.ts und muss
// vor jedem Aufruf hier stattgefunden haben.
//
// Anders als der frühere JSONL-Vorgänger sind alle Funktionen async: gefiltert,
// sortiert und gezählt wird in der Datenbank, nicht im Speicher.

import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  asScanResult,
  type DeliveryStatus,
  type LeadPriority,
  type LeadRow,
  type LeadStatus,
} from "./types";

/** Spalten, die die Liste sortieren darf. Alles andere fällt auf Eingang zurück. */
export type LeadSortKey =
  | "createdAt"
  | "updatedAt"
  | "companyDomain"
  | "email"
  | "status"
  | "priority"
  | "nextFollowUpAt";

const SORT_COLUMN: Record<LeadSortKey, string> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  companyDomain: "company_domain",
  email: "email",
  status: "status",
  priority: "priority",
  nextFollowUpAt: "next_follow_up_at",
};

export function isLeadSortKey(value: unknown): value is LeadSortKey {
  return typeof value === "string" && value in SORT_COLUMN;
}

/**
 * Filter der Lead-Liste. `status` nimmt zusätzlich zu den CRM-Status den
 * Sonderwert 'mail_failed' — die Leads, die zwar gespeichert wurden, bei denen
 * aber niemand benachrichtigt wurde. Das ist die einzige Ansicht, die wirklich
 * dringend ist.
 */
export interface LeadFilter {
  status?: string;
  search?: string;
  sort?: LeadSortKey;
  dir?: "asc" | "desc";
}

export const MAIL_FAILED_FILTER = "mail_failed";

export interface LeadPatch {
  status?: LeadStatus;
  priority?: LeadPriority | null;
  internalNotes?: string | null;
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;
}

const SELECT_COLUMNS =
  "id, created_at, updated_at, email, email_domain, name, message, company_domain, " +
  "source, page, locale, status, priority, internal_notes, last_contacted_at, " +
  "next_follow_up_at, email_delivery_status, user_email_status, email_error, scan_result";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Datenbankzeile → CRM-Modell. Unbekannte Statuswerte bleiben sichtbar. */
function mapRow(row: Record<string, unknown>): LeadRow {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    email: String(row.email ?? ""),
    emailDomain: (row.email_domain as string | null) ?? null,
    name: (row.name as string | null) ?? null,
    message: (row.message as string | null) ?? null,
    companyDomain: (row.company_domain as string | null) ?? null,
    source: String(row.source ?? ""),
    page: (row.page as string | null) ?? null,
    locale: (row.locale as string | null) ?? null,
    status: row.status as LeadStatus,
    priority: (row.priority as LeadPriority | null) ?? null,
    internalNotes: (row.internal_notes as string | null) ?? null,
    lastContactedAt: (row.last_contacted_at as string | null) ?? null,
    nextFollowUpAt: (row.next_follow_up_at as string | null) ?? null,
    emailDeliveryStatus: row.email_delivery_status as DeliveryStatus,
    userEmailStatus: row.user_email_status as DeliveryStatus,
    emailError: (row.email_error as string | null) ?? null,
    scanResult: asScanResult(row.scan_result),
  };
}

/**
 * Entschärft den Suchbegriff für den PostgREST-`or`-Ausdruck.
 *
 * Komma und Klammern trennen dort Bedingungen; % und * sind ilike-Wildcards.
 * Beides muss raus, sonst kann eine Eingabe die Filterbedingung umschreiben
 * statt nur zu suchen.
 */
function sanitizeSearch(raw: string): string {
  return raw.trim().slice(0, 80).replace(/[,()*%\\":]/g, "").trim();
}

export interface LeadListResult {
  leads: LeadRow[];
  /** Treffer im aktuellen Filter. */
  matched: number;
  /** Leads insgesamt, ungefiltert. */
  total: number;
}

/**
 * Liest die Lead-Liste. Wirft nie — bei einem Fehler kommt eine leere Liste
 * zurück und der Grund steht im Log. Eine kaputte Query darf keine 500er-Seite
 * für die einzige Ansicht produzieren, über die Leads überhaupt erreichbar sind.
 */
export async function readAllLeads(filter: LeadFilter = {}): Promise<LeadListResult> {
  try {
    const supabase = createSupabaseAdminClient();

    let query = supabase.from("leads").select(SELECT_COLUMNS, { count: "exact" });

    if (filter.status === MAIL_FAILED_FILTER) {
      query = query.eq("email_delivery_status", "failed");
    } else if (filter.status) {
      query = query.eq("status", filter.status);
    }

    const term = filter.search ? sanitizeSearch(filter.search) : "";
    if (term) {
      query = query.or(
        [
          `email.ilike.%${term}%`,
          `name.ilike.%${term}%`,
          `company_domain.ilike.%${term}%`,
          `email_domain.ilike.%${term}%`,
        ].join(","),
      );
    }

    const column = SORT_COLUMN[filter.sort ?? "createdAt"];
    const ascending = filter.dir === "asc";
    query = query.order(column, { ascending, nullsFirst: false });
    // Stabile Reihenfolge bei Gleichstand, damit Zeilen nicht springen.
    if (column !== "created_at") query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) {
      console.error(`[leads/admin] list failed: ${error.message}`);
      return { leads: [], matched: 0, total: 0 };
    }

    const leads = (data ?? []).map((row) => mapRow(row as unknown as Record<string, unknown>));
    const matched = count ?? leads.length;
    const total = filter.status || term ? await countAllLeads() : matched;

    return { leads, matched, total };
  } catch (err) {
    console.error(
      `[leads/admin] list threw: ${err instanceof Error ? err.message : "unknown error"}`,
    );
    return { leads: [], matched: 0, total: 0 };
  }
}

/** Gesamtzahl der Leads, unabhängig vom Filter. */
async function countAllLeads(): Promise<number> {
  try {
    const supabase = createSupabaseAdminClient();
    const { count, error } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true });
    if (error) {
      console.error(`[leads/admin] count failed: ${error.message}`);
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Einen Lead laden. Null, wenn die ID unbekannt oder keine UUID ist. */
export async function getLeadById(id: string): Promise<LeadRow | null> {
  if (!UUID_RE.test(id)) return null;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("leads")
      .select(SELECT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(`[leads/admin] get failed id=${id}: ${error.message}`);
      return null;
    }
    return data ? mapRow(data as unknown as Record<string, unknown>) : null;
  } catch (err) {
    console.error(
      `[leads/admin] get threw id=${id}: ${err instanceof Error ? err.message : "unknown error"}`,
    );
    return null;
  }
}

/**
 * Schreibt CRM-Felder. Rührt bewusst weder Kontaktdaten noch scan_result noch
 * die Versandfelder an — die gehören dem Eingangspfad in store.ts.
 *
 * Gibt zurück, ob das Update durchging.
 */
export async function updateLead(id: string, patch: LeadPatch): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;

  const update: Record<string, unknown> = {};
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.priority !== undefined) update.priority = patch.priority;
  if (patch.internalNotes !== undefined) update.internal_notes = patch.internalNotes;
  if (patch.lastContactedAt !== undefined) update.last_contacted_at = patch.lastContactedAt;
  if (patch.nextFollowUpAt !== undefined) update.next_follow_up_at = patch.nextFollowUpAt;
  if (Object.keys(update).length === 0) return true;

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("leads").update(update).eq("id", id);
    if (error) {
      console.error(`[leads/admin] update failed id=${id}: ${error.message}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `[leads/admin] update threw id=${id}: ${err instanceof Error ? err.message : "unknown error"}`,
    );
    return false;
  }
}

/** Zeichenlimit einer einzelnen Notiz; das Feld wächst sonst unbegrenzt. */
const MAX_NOTE = 2000;

/**
 * Hängt eine datierte Notiz an `internal_notes` an, statt sie zu ersetzen.
 * Die Historie eines Leads ist der halbe Wert der Notizen.
 */
export async function appendInternalNote(id: string, note: string): Promise<boolean> {
  const trimmed = note.trim().slice(0, MAX_NOTE);
  if (!trimmed) return true;

  const lead = await getLeadById(id);
  if (!lead) return false;

  const stamp = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
  const entry = `[${stamp}]\n${trimmed}`;
  const combined = lead.internalNotes ? `${lead.internalNotes}\n\n${entry}` : entry;

  return updateLead(id, { internalNotes: combined });
}
