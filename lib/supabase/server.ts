// ─── Supabase Server-Clients ──────────────────────────────────────────────────
// Zwei getrennte Clients:
//   createSupabaseServerClient – Cookie-basierte Session des angemeldeten
//     Nutzers (Publishable Key, RLS greift). Für Auth-Checks und Leseabfragen
//     im Kontext des Nutzers.
//   createSupabaseAdminClient  – Secret Key (service_role, umgeht RLS). Nur in
//     sicherem Servercode verwenden, niemals in Client-Bundles importieren.

import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Variablen, ohne die kein Session-Client gebaut werden kann. */
const SESSION_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Fehlende Environment-Variable: ${name}`);
  }
  return value;
}

/**
 * Prüft die Session-Konfiguration, ohne zu werfen.
 *
 * Hintergrund: `createSupabaseServerClient` wirft bei fehlender Variable, und in
 * einer Server Component beendet das die ganze Antwort mit einem 500 plus
 * undurchsichtigem Error-Digest. Für Seiten, die ohne Session ohnehin nur die
 * Zugangstür zeigen, ist das die falsche Reaktion: sie sollen erreichbar
 * bleiben und benennen, dass die Konfiguration fehlt.
 *
 * Für Route Handler bleibt das Werfen richtig — dort ist ein 500 die ehrliche
 * Antwort, und niemand liest eine gerenderte Seite.
 *
 * `.env.local` ist nicht im Repository. Auf Servern, die per Git deployt werden,
 * ist genau das die typische Ursache: das Deployment ersetzt das
 * Arbeitsverzeichnis, die lokale Env-Datei ist weg, und alle Auth-Routen
 * fallen gleichzeitig aus.
 */
export function missingSessionEnv(): string[] {
  return SESSION_ENV.filter((name) => !process.env[name]);
}

export function isSupabaseConfigured(): boolean {
  return missingSessionEnv().length === 0;
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // In Server Components sind Cookies read-only. Der Token-Refresh
            // passiert dann in Route Handlern (z. B. /auth/callback).
          }
        },
      },
    },
  );
}

export function createSupabaseAdminClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseAdminClient darf nur auf dem Server laufen.");
  }

  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
