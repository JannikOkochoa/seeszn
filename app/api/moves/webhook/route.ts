// ─── POST /api/moves/webhook ──────────────────────────────────────────────────
// Stripe meldet hier den Abschluss. Nur dieses Ereignis macht aus einer
// angelegten Bestellung eine bezahlte.
//
// Warum ein Webhook und nicht die Rückkehr auf die Erfolgsseite: die Rückkehr
// ist eine Browser-Navigation und damit fälschbar und unzuverlässig. Wer den Tab
// schließt, bevor Stripe zurückleitet, hat trotzdem bezahlt. Die Erfolgsseite
// zeigt an, der Webhook entscheidet.
//
// Sicherheit: der rohe Body wird gegen die Stripe-Signatur geprüft, bevor
// irgendetwas gelesen wird. Ohne STRIPE_WEBHOOK_SECRET antwortet die Route mit
// 503 und schreibt nichts.

import { markPaid } from "@/lib/moves/orders";
import { verifyWebhookSignature } from "@/lib/moves/stripe";

export const runtime = "nodejs";

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      client_reference_id?: string | null;
      payment_intent?: string | null;
      subscription?: string | null;
      customer?: string | null;
      amount_total?: number | null;
      currency?: string | null;
      customer_details?: { email?: string | null } | null;
      metadata?: Record<string, string> | null;
    };
  };
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[moves] webhook called without STRIPE_WEBHOOK_SECRET");
    return Response.json({ error: "Webhook nicht konfiguriert" }, { status: 503 });
  }

  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("stripe-signature"), secret)) {
    return Response.json({ error: "Signatur ungültig" }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(raw) as StripeEvent;
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  // Nur der abgeschlossene Checkout zählt. Weitere Ereignistypen werden
  // quittiert, damit Stripe sie nicht endlos wiederholt.
  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true, ignored: event.type }, { status: 200 });
  }

  const session = event.data.object;
  const orderRef = session.client_reference_id ?? session.metadata?.order_ref;

  if (!orderRef) {
    console.error("[moves] webhook without order reference", event.id);
    // 200, weil ein Wiederholungsversuch daran nichts ändern würde.
    return Response.json({ received: true, matched: false }, { status: 200 });
  }

  const { updated } = await markPaid(orderRef, {
    sessionId: session.id,
    paymentIntent: session.payment_intent ?? null,
    subscriptionId: session.subscription ?? null,
    customerId: session.customer ?? null,
    amountTotalCents: session.amount_total ?? null,
    currency: session.currency ?? null,
    email: session.customer_details?.email ?? null,
  });

  // Kein Fehler, wenn nichts aktualisiert wurde: markPaid ist idempotent, eine
  // zweite Zustellung desselben Ereignisses trifft eine bereits bezahlte oder
  // bereits gebriefte Bestellung und lässt sie in Ruhe.
  console.log("[moves] webhook handled", orderRef, updated ? "paid" : "no-op");
  return Response.json({ received: true, matched: true }, { status: 200 });
}
