// ─── Zugangsprüfung für den Klühspies-Bereich ────────────────────────────────
// Spiegelt exakt die Bedingung, unter der loadWorkspace() Zugang gewährt: eine
// Membership zu genau diesem Nutzer, gelesen mit dem Cookie-Session-Client, also
// unter RLS. Kein zweites Rollenmodell, keine neue Regel, keine Datenänderung.
//
// Warum nicht direkt loadWorkspace() aufrufen: der Loader zieht den kompletten
// KPI-Initialzustand (rund ein Dutzend Abfragen) und schaltet nebenbei eine
// eingeladene Membership auf "active". Beides gehört zum KPI Dashboard, nicht zu
// einer statischen Mockup-Ansicht. Hier wird deshalb nur das Tor geprüft, ohne
// den Raum zu laden und ohne Schreibzugriff.
//
// Bewusst kein Filter auf status: loadWorkspace lässt "invited" ebenfalls
// passieren. Wer den Klühspies Room öffnen darf, darf auch die Mockups öffnen.

import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function hasKluehspiesAccess(
  supabase: SupabaseClient,
  user: User,
): Promise<boolean> {
  const membership = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return !membership.error && Boolean(membership.data);
}
