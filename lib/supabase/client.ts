// ─── Supabase Browser-Client ──────────────────────────────────────────────────
// Publishable Key + Cookie-Sessions (geteilt mit dem Server-Client). RLS greift
// bei jedem Zugriff; der Secret Key existiert im Browser nicht.

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return client;
}
