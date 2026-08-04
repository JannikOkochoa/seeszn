// ─── Lead-Persistierung ───────────────────────────────────────────────────────
// Die Tabelle public.leads ist die Source of Truth für eingehende Anfragen. Der
// Ablauf in jeder Route ist gleich: erst speichern, dann versenden, danach den
// Versandstatus nachtragen. Fällt der Mail-Provider aus, bleibt der Lead hier.
//
// Grundregel dieses Moduls: es wirft nie. Ein Fehler beim Speichern darf keinen
// Request abbrechen, der sonst noch eine Mail rausbekommen hätte — deshalb
// meldet jede Funktion ihr Ergebnis zurück, statt zu eskalieren. Der Aufrufer
// entscheidet dann, ob der Lead insgesamt als angenommen gilt.
//
// Logging: nur E-Mail-Domain, Quelle und Lead-ID. Nie die Adresse selbst, nie
// Name oder Notiz.
//
// Abgrenzung: hier stehen ausschließlich die Writes aus den öffentlichen
// Formularen. Alles, was das interne CRM danach mit einem Lead macht — lesen,
// Status setzen, Notizen anhängen — liegt in admin.ts. Beide teilen sich das
// Datenmodell in types.ts.

import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { emailDomain } from "@/lib/email/freemail";
import type { DeliveryStatus, LeadSource, LeadStatus } from "./types";

/**
 * Der Eingangspfad vergibt nur diese beiden Zustände. Die übrigen Werte von
 * LeadStatus sind CRM-Zustände und werden ausschließlich in admin.ts gesetzt.
 */
type IntakeStatus = Extract<LeadStatus, "new" | "spam_suspected">;

export interface LeadInput {
  email: string;
  name?: string;
  message?: string;
  /** Geprüfte Domain aus dem Scan, falls vorhanden. */
  companyDomain?: string;
  source: LeadSource;
  page: string;
  locale?: string;
  status?: IntakeStatus;
  /** Bereits sanitisiertes Scan-Ergebnis. */
  scanResult?: unknown;
}

export interface SaveLeadResult {
  /** Lead-ID bei Erfolg, sonst null. */
  id: string | null;
  /** True, wenn die Anfrage sicher in der Datenbank liegt. */
  stored: boolean;
}

export interface DeliveryUpdate {
  emailDeliveryStatus?: DeliveryStatus;
  userEmailStatus?: DeliveryStatus;
  /** Provider-Fehlermeldung, wird gekürzt. Keine personenbezogenen Daten. */
  emailError?: string | null;
}

/** Zeichenlimits, damit ein manipulierter Payload die Tabelle nicht aufbläht. */
const MAX = { email: 200, name: 120, message: 2000, domain: 253, page: 120 };

function cut(value: string | undefined, max: number): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

/**
 * Schreibt den Lead, bevor irgendeine Mail versendet wird.
 * Wirft nie — bei einem Fehler ist `stored: false` und der Aufrufer muss den
 * Mailversand als einzigen verbleibenden Zustellweg behandeln.
 */
export async function saveLead(input: LeadInput): Promise<SaveLeadResult> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        email: input.email.trim().slice(0, MAX.email),
        email_domain: emailDomain(input.email) || null,
        name: cut(input.name, MAX.name),
        message: cut(input.message, MAX.message),
        company_domain: cut(input.companyDomain, MAX.domain),
        source: input.source,
        page: cut(input.page, MAX.page),
        locale: input.locale === "en" ? "en" : "de",
        status: input.status ?? "new",
        email_delivery_status: "pending",
        user_email_status: "pending",
        scan_result: input.scanResult ?? null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error(
        `[leads] insert failed source=${input.source} domain=${emailDomain(input.email) || "unknown"}: ${error?.message ?? "no row returned"}`,
      );
      return { id: null, stored: false };
    }

    return { id: data.id as string, stored: true };
  } catch (err) {
    // Fehlende Supabase-Env oder Netzwerkfehler. Der Request läuft weiter.
    console.error(
      `[leads] insert threw source=${input.source}: ${err instanceof Error ? err.message : "unknown error"}`,
    );
    return { id: null, stored: false };
  }
}

/**
 * Trägt den Versandstatus nach. Best effort: schlägt das Update fehl, bleibt
 * der Lead mit `pending` stehen — sichtbar über den leads_undelivered_idx.
 */
export async function updateLeadDelivery(
  id: string | null,
  update: DeliveryUpdate,
): Promise<void> {
  if (!id) return;

  try {
    const supabase = createSupabaseAdminClient();
    const patch: Record<string, unknown> = {};
    if (update.emailDeliveryStatus) patch.email_delivery_status = update.emailDeliveryStatus;
    if (update.userEmailStatus) patch.user_email_status = update.userEmailStatus;
    if (update.emailError !== undefined) {
      patch.email_error = update.emailError ? update.emailError.slice(0, 500) : null;
    }
    if (Object.keys(patch).length === 0) return;

    const { error } = await supabase.from("leads").update(patch).eq("id", id);
    if (error) {
      console.error(`[leads] delivery update failed id=${id}: ${error.message}`);
    }
  } catch (err) {
    console.error(
      `[leads] delivery update threw id=${id}: ${err instanceof Error ? err.message : "unknown error"}`,
    );
  }
}
