"use server";

// ─── Server Actions des Lead-CRM ──────────────────────────────────────────────
// Workflow aus dem früheren CRM, unverändert im Verhalten, aber gegen
// public.leads statt gegen eine JSONL-Datei.
//
// Jede Action prüft selbst auf seeszn_admin. Server Actions sind per POST
// direkt erreichbar, nicht nur über die gerenderte Seite — eine Prüfung allein
// beim Rendern wäre kein Schutz.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertSeesznAdmin } from "@/lib/leads/access";
import { appendInternalNote, updateLead } from "@/lib/leads/admin";
import { berlinInputToIso } from "@/lib/leads/time";
import { isLeadPriority, isLeadStatus } from "@/lib/leads/types";

/** Liste und Detailseite nach jeder Änderung neu aufbauen. */
function revalidate(id: string): void {
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function actionUpdateStatus(id: string, formData: FormData): Promise<void> {
  await assertSeesznAdmin();
  const status = formData.get("status");
  if (isLeadStatus(status)) {
    await updateLead(id, { status });
  }
  revalidate(id);
  redirect(`/admin/leads/${id}`);
}

export async function actionUpdatePriority(id: string, formData: FormData): Promise<void> {
  await assertSeesznAdmin();
  const raw = formData.get("priority");
  // Leere Auswahl heißt "keine Priorität", nicht "unverändert".
  await updateLead(id, { priority: isLeadPriority(raw) ? raw : null });
  revalidate(id);
  redirect(`/admin/leads/${id}`);
}

export async function actionAddNote(id: string, formData: FormData): Promise<void> {
  await assertSeesznAdmin();
  const note = formData.get("note");
  if (typeof note === "string" && note.trim()) {
    await appendInternalNote(id, note);
  }
  revalidate(id);
  redirect(`/admin/leads/${id}`);
}

/**
 * Setzt Status und Kontaktzeitpunkt in einem Schritt — der häufigste Handgriff
 * in der Liste. Ein bereits geschlossener oder als kein Fit markierter Lead
 * wird nicht zurückgesetzt.
 */
export async function actionMarkContacted(id: string, from?: "list"): Promise<void> {
  await assertSeesznAdmin();
  await updateLead(id, {
    status: "contacted",
    lastContactedAt: new Date().toISOString(),
  });
  revalidate(id);
  // Bewusst kein freier Redirect-Parameter: gebundene Action-Argumente gehen
  // durch den Client und wären damit ein offener Redirect.
  redirect(from === "list" ? "/admin/leads" : `/admin/leads/${id}`);
}

export async function actionSetNextFollowUp(id: string, formData: FormData): Promise<void> {
  await assertSeesznAdmin();
  const raw = formData.get("date");
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      // Leeres Feld löscht die Wiedervorlage.
      await updateLead(id, { nextFollowUpAt: null });
    } else {
      // Die Eingabe ist Berliner Ortszeit — genau die Zone, in der das CRM
      // alle Zeitpunkte anzeigt.
      const iso = berlinInputToIso(trimmed);
      if (iso) await updateLead(id, { nextFollowUpAt: iso });
    }
  }
  revalidate(id);
  redirect(`/admin/leads/${id}`);
}
