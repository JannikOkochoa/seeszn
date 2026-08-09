// ─── Leads: geteiltes Datenmodell ─────────────────────────────────────────────
// Eine Quelle für alles, was einen Lead beschreibt. Genutzt von:
//   store.ts  – Writes aus den öffentlichen Formularen (/api/contact,
//               /api/brief-request)
//   admin.ts  – Reads und Updates des internen CRM unter /admin/leads
//
// Bewusst frei von Supabase- und React-Importen, damit beide Seiten dieselben
// Typen teilen können, ohne sich gegenseitig etwas mitzuschleppen.

import type { ScanResult } from "@/lib/scan/types";

/**
 * Formular-Herkunft eines Leads. `first_move_request` ist die verbindliche
 * Anfrage aus dem First-Move-Kaufweg, `first_move_result_email` der sekundäre
 * Wunsch, den Befund per Mail zu bekommen. Die Spalte hat DB-seitig keine
 * Check-Constraint, neue Werte brauchen deshalb keine Migration.
 *
 * Bis August 2026 hieß die Anfrage `first_move_checkout`. Der Name war falsch:
 * es gibt keinen Online-Checkout, der Kaufweg endet mit einer verbindlichen
 * Anfrage. Neue Leads schreiben ausschließlich `first_move_request`. Der alte
 * Wert wird nicht mehr erzeugt und bleibt nur als Label für Altbestand
 * bestehen, damit historische Zeilen im CRM lesbar bleiben.
 */
export type LeadSource =
  | "diagnosis_result"
  | "brief_ki_sichtbarkeit"
  | "first_move_request"
  | "first_move_result_email";

/** Nicht mehr geschriebene Quellen. Nur für die Anzeige von Altbestand. */
export type LegacyLeadSource = "first_move_checkout";

/**
 * Bearbeitungszustand im CRM. 'new' ist der Eingangszustand (bis August 2026
 * hieß er 'received'), 'spam_suspected' setzt der Honeypot-Pfad in
 * /api/contact — der Datensatz bleibt erhalten, damit ein Falschpositiv keinen
 * echten Lead kostet.
 */
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "not_a_fit"
  | "closed"
  | "spam_suspected";

export type LeadPriority = "high" | "medium" | "low";

/** Versandstatus einer der beiden Mails zu diesem Lead. */
export type DeliveryStatus = "pending" | "sent" | "failed" | "skipped";

/**
 * Ein Lead, wie ihn das CRM sieht: die Zeile aus public.leads in camelCase.
 *
 * Scores, KI-Fragen und technische Signale stehen absichtlich nicht als eigene
 * Felder hier, sondern vollständig in `scanResult`. Sie werden nicht in Spalten
 * dupliziert; die Detailansicht liest sie aus dem jsonb.
 */
export interface LeadRow {
  id: string;
  createdAt: string;
  updatedAt: string;

  // Kontakt
  email: string;
  emailDomain: string | null;
  name: string | null;
  message: string | null;

  // Kontext der Anfrage
  companyDomain: string | null;
  source: string;
  page: string | null;
  locale: string | null;

  // CRM
  status: LeadStatus;
  priority: LeadPriority | null;
  internalNotes: string | null;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;

  // Mailversand
  emailDeliveryStatus: DeliveryStatus;
  userEmailStatus: DeliveryStatus;
  emailError: string | null;

  /** Sanitisiertes Scan-Ergebnis, sofern die Anfrage aus einer Prüfung kam. */
  scanResult: ScanResult | null;
}

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "not_a_fit",
  "closed",
  "spam_suspected",
];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  qualified: "Qualifiziert",
  not_a_fit: "Kein Fit",
  closed: "Geschlossen",
  spam_suspected: "Spamverdacht",
};

export const LEAD_PRIORITY_LABEL: Record<LeadPriority, string> = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
};

export const DELIVERY_LABEL: Record<DeliveryStatus, string> = {
  pending: "offen",
  sent: "zugestellt",
  failed: "fehlgeschlagen",
  skipped: "übersprungen",
};

export const LEAD_SOURCE_LABEL: Record<string, string> = {
  diagnosis_result: "Sichtbarkeitsprüfung",
  brief_ki_sichtbarkeit: "KI-Sichtbarkeits-Brief",
  first_move_request: "First Move Anfrage",
  first_move_result_email: "First Move Ergebnisversand",
  // Altbestand vor der Umbenennung im August 2026. Wird nicht mehr geschrieben.
  first_move_checkout: "First Move Anfrage (alt)",
};

/** Ist `value` ein gültiger CRM-Status? */
export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUS_ORDER as string[]).includes(value);
}

/** Ist `value` eine gültige Priorität? */
export function isLeadPriority(value: unknown): value is LeadPriority {
  return value === "high" || value === "medium" || value === "low";
}

/**
 * Prüft ein aus der Datenbank gelesenes scan_result auf die Form, die die
 * Detailansicht erwartet.
 *
 * Der Wert stammt ursprünglich aus dem sessionStorage des Browsers und wurde
 * beim Schreiben zwar gekappt, aber die Shape kann nach einem Deploy älter sein
 * als der heutige Code. Lieber kein Diagnose-Panel als eine Detailseite, die
 * an einem Bestandslead abstürzt.
 */
export function asScanResult(value: unknown): ScanResult | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Record<string, unknown>;
  if (typeof r.domain !== "string") return null;
  if (typeof r.overallScore !== "number") return null;
  if (!Array.isArray(r.scores)) return null;
  return value as ScanResult;
}
