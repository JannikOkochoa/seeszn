// ─── GET /auth/callback ───────────────────────────────────────────────────────
// Unterstützt beide Supabase-Auth-Flows:
// 1. PKCE-Code aus Magic Links / OAuth
// 2. Token-Hash aus SSR-kompatiblen Einladungslinks
//
// `next` wird strikt auf relative Pfade begrenzt, damit der Callback nicht als
// Open Redirect missbraucht werden kann.

import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_NEXT = "/kluehspies-room#kpi-monitoring";

const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return DEFAULT_NEXT;
  }

  return raw;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");
  const next = safeNextPath(url.searchParams.get("next"));
  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, base));
    }
  }

  if (
    tokenHash &&
    rawType &&
    ALLOWED_OTP_TYPES.has(rawType as EmailOtpType)
  ) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: rawType as EmailOtpType,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, base));
    }
  }

  return NextResponse.redirect(
    new URL("/kluehspies-room?auth=error", base),
  );
}
