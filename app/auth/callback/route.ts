// ─── GET /auth/callback ───────────────────────────────────────────────────────
// Tauscht den Auth-Code aus Magic-Link / OAuth gegen eine Cookie-Session und
// leitet danach in den Client Room weiter. `next` wird strikt auf relative
// Pfade begrenzt, damit der Callback nicht als Open Redirect missbraucht
// werden kann.

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_NEXT = "/kluehspies-room#kpi-monitoring";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return DEFAULT_NEXT;
  }
  return raw;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, base));
    }
  }

  return NextResponse.redirect(new URL("/kluehspies-room?auth=error", base));
}
