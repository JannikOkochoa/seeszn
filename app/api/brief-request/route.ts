// ─── POST /api/brief-request ───────────────────────────────────────────────────
// Anforderung des KI-Sichtbarkeits-Briefs. Gleiche Fehlerklasse wie
// /api/contact: bis hierher wurde die Anfrage nur an einen optionalen Webhook
// weitergereicht — war BRIEF_REQUEST_WEBHOOK_URL nicht gesetzt (so wie in
// Production), landete die E-Mail lediglich in einem console.log, während der
// Nutzer eine Erfolgsmeldung sah.
//
// Ablauf jetzt: validieren → Lead in Supabase speichern → optionalen Webhook
// auslösen → Versandstatus nachtragen → antworten. `ok: true` nur, wenn die
// Anfrage wirklich gespeichert oder zugestellt wurde.

import { saveLead, updateLeadDelivery } from "@/lib/leads/store";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const PAGE = "/brief/ki-sichtbarkeit";
const SOURCE = "ki-sichtbarkeits-brief-2026";

// Öffentliches Formular: Bursts pro IP begrenzen (no-op außerhalb Production).
const BRIEF_LIMIT = 5;
const BRIEF_WINDOW_MS = 10 * 60 * 1000;

interface BriefPayload {
  email: string;
  source: typeof SOURCE;
  page: typeof PAGE;
  language: "de";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email } = (body ?? {}) as { email?: unknown };
  const trimmed = typeof email === "string" ? email.trim() : "";

  if (!trimmed || trimmed.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return Response.json(
      { error: "Bitte gib eine gültige E-Mail-Adresse ein." },
      { status: 400 }
    );
  }

  const limit = rateLimit("brief", clientIp(request), BRIEF_LIMIT, BRIEF_WINDOW_MS);
  if (!limit.ok) {
    return Response.json(
      { error: "Zu viele Anfragen. Bitte versuche es in wenigen Minuten erneut." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  const payload: BriefPayload = {
    email: trimmed.toLowerCase(),
    source: SOURCE,
    page: PAGE,
    language: "de",
  };

  // 1) Lead zuerst speichern — Source of Truth, unabhängig vom Webhook.
  const { id: leadId, stored } = await saveLead({
    email: payload.email,
    source: "brief_ki_sichtbarkeit",
    page: PAGE,
    locale: "de",
  });

  // 2) Optionaler Webhook (Make/Zapier: Verteiler + PDF-Versand).
  const webhookUrl = process.env.BRIEF_REQUEST_WEBHOOK_URL;
  let delivered = false;
  let deliveryError: string | null = null;

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      delivered = res.ok;
      if (!res.ok) {
        deliveryError = `webhook returned ${res.status}`;
        console.error(`[brief-request] Webhook returned ${res.status} leadStored=${stored}`);
      }
    } catch (err) {
      deliveryError = err instanceof Error ? err.message : "unknown error";
      console.error(`[brief-request] Webhook error leadStored=${stored}: ${deliveryError}`);
    }
  } else {
    deliveryError = "BRIEF_REQUEST_WEBHOOK_URL missing";
    console.warn(
      `[brief-request] BRIEF_REQUEST_WEBHOOK_URL is not set — kein PDF-/Verteilerversand. Der Lead liegt nur in Supabase. leadStored=${stored}`
    );
  }

  // 3) Versandstatus nachtragen.
  await updateLeadDelivery(leadId, {
    emailDeliveryStatus: delivered ? "sent" : "failed",
    emailError: delivered ? null : deliveryError,
  });

  // 4) Nur echten Erfolg melden — kein ok:true auf eine verlorene Anfrage.
  if (!stored && !delivered) {
    return Response.json(
      { error: "Das hat gerade nicht funktioniert. Bitte versuche es erneut." },
      { status: 503 }
    );
  }

  return Response.json({ ok: true, leadStored: stored, delivered });
}
