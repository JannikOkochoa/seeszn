// ─── Zugriffsschutz für das interne Lead-CRM ──────────────────────────────────
// Derselbe Auth-Ansatz wie im Klühspies Room: Supabase-Cookie-Session,
// serverseitig validiert, Rolle aus public.memberships. Das frühere
// ADMIN_LEADS_PASSWORD, das SHA-256-Cookie und die JSONL-Magic-Links sind
// ersatzlos entfallen — ein geteiltes Passwort ist kein Zugriffsschutz für
// personenbezogene Daten.
//
// Zutritt hat ausschließlich, wer eine Membership mit der Rolle 'seeszn_admin'
// besitzt. Das ist die interne Rolle; kluehspies_editor und viewer sind
// Kundenrollen und haben in der Lead-Liste nichts verloren.
//
// Wichtig: Die Prüfung läuft mit dem Session-Client, nicht mit dem Secret Key.
// Damit greift RLS auch hier — ein Nutzer kann nur seine eigene Membership
// lesen. Erst nach bestandener Prüfung darf der Aufrufer die Leads über
// admin.ts mit dem Secret Key laden.

import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminGate =
  /** Niemand angemeldet — die Login-Ansicht ist fällig. */
  | { state: "anonymous" }
  /** Angemeldet, aber ohne seeszn_admin-Rolle. */
  | { state: "denied"; email: string }
  | { state: "granted"; email: string; userId: string };

const ADMIN_ROLE = "seeszn_admin";

/**
 * Prüft die aktuelle Session. Wirft nie — der Aufrufer entscheidet, ob daraus
 * eine Login-Ansicht, ein Hinweis oder ein 403 wird.
 */
export async function checkSeesznAdmin(): Promise<AdminGate> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "anonymous" };

  const email = user.email ?? "diesem Konto";

  const { data, error } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", ADMIN_ROLE)
    .limit(1)
    .maybeSingle();

  if (error) {
    // Im Zweifel kein Zugang. Ein Fehler beim Rollen-Lookup darf nie als
    // Freigabe durchgehen.
    console.error(`[leads/access] membership lookup failed: ${error.message}`);
    return { state: "denied", email };
  }

  if (!data) return { state: "denied", email };

  return { state: "granted", email, userId: user.id };
}

/**
 * Harte Variante für Server Actions und Route Handler: entweder die Rolle
 * steht, oder es fliegt.
 *
 * Server Actions sind per POST direkt erreichbar, nicht nur über die
 * gerenderte UI. Die Prüfung auf der Seite reicht deshalb nicht — jede Action
 * muss selbst prüfen.
 */
export async function assertSeesznAdmin(): Promise<string> {
  const gate = await checkSeesznAdmin();
  if (gate.state !== "granted") {
    throw new Error("Kein Zugriff auf das Lead-CRM.");
  }
  return gate.userId;
}
