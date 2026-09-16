// ─── POST /api/moves/brief ────────────────────────────────────────────────────
// Das kurze Briefing nach der Zahlung. Es ist der einzige Schritt, der Arbeit
// vom Käufer verlangt, und deshalb kurz gehalten: sechs Felder, davon zwei
// Pflicht.
//
// Reihenfolge (Auftragsschutz, gleiche Logik wie bei den Leads):
//   1) serverseitige Validierung
//   2) Briefing an der Bestellung ablegen  ← Source of Truth
//   3) interne Benachrichtigung an SEESZN (best effort)
//   4) Antwort ans Frontend
//
// Ein Mailfehler darf ein Briefing nie vernichten: liegt es in der Datenbank,
// antworten wir mit ok=true. Die Bestellung ist bezahlt, die Arbeit beginnt
// unabhängig vom Mailversand.
//
// Die Sitzungs-ID aus Stripe ist der Nachweis, dass ein Kauf stattgefunden hat.
// Ohne eine Bestellung zu dieser Sitzung wird nichts geschrieben.

import { Resend } from "resend";
import { tierBySku } from "@/lib/moves/catalog";
import { orderBySession, saveBrief } from "@/lib/moves/orders";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const FROM_DEFAULT = "SEESZN <hello@seeszn.com>";
const LEAD_DEFAULT = "hello@seeszn.com";

const LIMIT = 8;
const WINDOW_MS = 10 * 60 * 1000;

const str = (value: unknown, max: number): string =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : "";

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit("moves_brief", clientIp(request), LIMIT, WINDOW_MS);
  if (!limit.ok) {
    return Response.json(
      { error: "Zu viele Anfragen" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const sessionId = str(b.sessionId, 200);
  const domain = str(b.domain, 120);
  const targetUrl = str(b.targetUrl, 500);
  const market = str(b.market, 120);
  const language = str(b.language, 120);
  const topic = str(b.topic, 400);
  const notes = str(b.notes, 1500);
  const contactEmail = str(b.contactEmail, 200);

  if (!sessionId) return Response.json({ error: "Sitzung fehlt" }, { status: 400 });
  if (!domain) return Response.json({ error: "Domain fehlt" }, { status: 400 });
  if (!topic) return Response.json({ error: "Thema fehlt" }, { status: 400 });

  const order = await orderBySession(sessionId);
  if (!order) {
    // Entweder die Sitzung gehört nicht zu uns, oder der Webhook war schneller
    // als die Datenbank. In beiden Fällen ist Schweigen die richtige Antwort:
    // eine genauere Fehlermeldung wäre eine Auskunft über fremde Bestellungen.
    return Response.json({ error: "Bestellung nicht gefunden" }, { status: 404 });
  }

  const { stored } = await saveBrief(order.orderRef, {
    domain,
    targetUrl,
    market,
    language,
    topic,
    notes,
    contactEmail,
  });

  const notified = await notify({
    orderRef: order.orderRef,
    sku: order.sku,
    domain,
    targetUrl,
    market,
    language,
    topic,
    notes,
    contactEmail,
  });

  if (!stored && !notified) {
    return Response.json({ error: "Briefing konnte nicht gespeichert werden" }, { status: 500 });
  }

  return Response.json({ ok: true, orderRef: order.orderRef, stored, notified }, { status: 200 });
}

/** Interne Benachrichtigung. Best effort, blockiert nie. */
async function notify(input: {
  orderRef: string;
  sku: string;
  domain: string;
  targetUrl: string;
  market: string;
  language: string;
  topic: string;
  notes: string;
  contactEmail: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const product = tierBySku(input.sku);
  const heading = product ? `${product.category.label} ${product.tier.name}` : input.sku;

  const lines = [
    `Bestellung: ${input.orderRef}`,
    `Produkt: ${heading}`,
    `Domain: ${input.domain}`,
    `Ziel-URL: ${input.targetUrl || "keine"}`,
    `Markt: ${input.market || "keine Angabe"}`,
    `Sprache: ${input.language || "keine Angabe"}`,
    `Thema: ${input.topic}`,
    `Hinweise: ${input.notes || "keine"}`,
    `Kontakt: ${input.contactEmail || "über Stripe"}`,
  ];

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: process.env.SEESZN_FROM_EMAIL || FROM_DEFAULT,
      to: process.env.SEESZN_LEAD_EMAIL || LEAD_DEFAULT,
      subject: `MOVES Briefing ${input.orderRef} ${heading}`,
      text: lines.join("\n"),
    });
    if (error) {
      console.error("[moves] brief mail failed", input.orderRef, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[moves] brief mail threw", input.orderRef, err instanceof Error ? err.message : String(err));
    return false;
  }
}
