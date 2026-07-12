// ─── Supabase Server-Clients ──────────────────────────────────────────────────
// Zwei getrennte Clients:
//   createSupabaseServerClient – Cookie-basierte Session des angemeldeten
//     Nutzers (Publishable Key, RLS greift). Für Auth-Checks und Leseabfragen
//     im Kontext des Nutzers.
//   createSupabaseAdminClient  – Secret Key (service_role, umgeht RLS). Nur in
//     sicherem Servercode verwenden, niemals in Client-Bundles importieren.

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Fehlende Environment-Variable: ${name}`);
  }
  return value;
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
