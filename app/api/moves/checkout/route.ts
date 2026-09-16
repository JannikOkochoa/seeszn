// ─── POST /api/moves/checkout ─────────────────────────────────────────────────
// Legt die Stripe-Checkout-Sitzung für eine Stufe aus dem MOVES-Katalog an.
//
// Reihenfolge:
//   1) Produktschlüssel gegen den Katalog prüfen, nicht gegen die Eingabe
//   2) Bestellung anlegen  ← eigene Source of Truth, vor Stripe
//   3) Stripe-Sitzung anlegen
//   4) Sitzungs-ID an der Bestellung nachtragen
//   5) URL zurückgeben
//
// Sicherheit: Preis, Währung, Abrechnungsart und Produktname kommen ausnahmslos
// aus lib/moves/catalog.ts. Aus dem Request wird genau ein Wert gelesen, der
// Produktschlüssel, und der muss im Katalog existieren. Ein manipulierter Body
// kann damit weder einen Preis setzen noch eine Stufe kaufbar machen, die es
// nicht gibt.
//
// Ist Stripe nicht konfiguriert, ist das kein Fehler: die Antwort sagt
// available=false, und die Oberfläche bietet den Anfrageweg an.

import { tierBySku } from "@/lib/moves/catalog";
import { euro, resolveSelection, selectionSku } from "@/lib/moves/backlinks";
import { createOrder, attachSession, newOrderRef } from "@/lib/moves/orders";
import { createBacklinkSession, createCheckoutSession, stripeConfigured } from "@/lib/moves/stripe";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { SITE_URL } from "@/lib/seo";
import { PRICING_PATH } from "@/lib/moves/pricingMeta";

/**
 * Die Rückkehr aus Stripe bleibt in der Sprache, in der gekauft wurde. Wer auf
 * /en/pricing bezahlt, landet auf /en/pricing/briefing, nicht auf der
 * deutschen Seite: siehe die Regel dazu in der aktuellen Preisrunde.
 */
function localeFrom(payload: Record<string, unknown>): "de" | "en" {
  return payload.locale === "en" ? "en" : "de";
}

export const runtime = "nodejs";

// Ein Besucher legt selten mehr als ein paar Sitzungen an. 10 in 10 Minuten
// lässt Irrtümer und Wechsel zwischen Stufen zu und stoppt Automaten.
const LIMIT = 10;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit("moves_checkout", clientIp(request), LIMIT, WINDOW_MS);
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

  const payload = (body ?? {}) as Record<string, unknown>;

  // ── BACKLINKS: konfiguriertes Produkt ────────────────────────────────────
  // Der Client schickt Menge, Kaufart, Format und Markt. Er schickt keinen
  // Preis, und ein mitgeschickter würde ignoriert: resolveSelection rechnet den
  // Betrag aus derselben Staffel neu, aus der auch die Seite liest.
  if (payload.product === "backlinks") {
    const selection = resolveSelection(payload);
    if (!selection) {
      return Response.json({ error: "Ungültige Konfiguration" }, { status: 400 });
    }

    if (!stripeConfigured()) {
      console.warn("[moves] backlinks checkout without STRIPE_SECRET_KEY", selectionSku(selection));
      return Response.json({ available: false, reason: "not_configured" }, { status: 200 });
    }

    const locale = localeFrom(payload);
    const orderRef = newOrderRef();
    await createOrder({
      orderRef,
      sku: selectionSku(selection),
      category: "authority",
      mode: selection.purchaseMode === "monthly" ? "momentum" : "one",
      billing: selection.purchaseMode === "monthly" ? "monthly" : "once",
      priceEur: Math.round(selection.totalCents / 100),
      locale,
    });

    try {
      const session = await createBacklinkSession({
        selection,
        successUrl: `${SITE_URL}${PRICING_PATH[locale]}/briefing`,
        // Query statt Hash: die Preisfläche liest ihren Zustand aus ?product=,
        // nicht aus dem Anker. Ein Abbruch führt so direkt zurück in den
        // Rechner statt auf den allgemeinen Einstieg.
        cancelUrl: `${SITE_URL}${PRICING_PATH[locale]}?product=backlinks`,
        orderRef,
        description: `${selection.quantity} Backlinks, ${selection.backlinkType.toUpperCase()}, Markt ${selection.market}, ${euro(selection.totalCents)}`,
      });
      if (!session.url) throw new Error("Stripe lieferte keine Checkout-URL");
      await attachSession(orderRef, session.id);
      return Response.json({ url: session.url, orderRef }, { status: 200 });
    } catch (err) {
      console.error("[moves] backlinks checkout failed", err instanceof Error ? err.message : String(err));
      return Response.json({ error: "Checkout fehlgeschlagen" }, { status: 502 });
    }
  }

  const sku = typeof payload.sku === "string" ? payload.sku : "";
  const found = tierBySku(sku);

  if (!found) return Response.json({ error: "Unbekanntes Produkt" }, { status: 404 });
  const { category, tier } = found;

  if (tier.billing === "none" || tier.priceEur === null) {
    // SYSTEM ist bewusst nicht online kaufbar. Der Weg dorthin ist die Anfrage.
    return Response.json({ available: false, reason: "not_purchasable" }, { status: 200 });
  }

  if (!stripeConfigured()) {
    console.warn("[moves] checkout requested without STRIPE_SECRET_KEY", sku);
    return Response.json({ available: false, reason: "not_configured" }, { status: 200 });
  }

  const orderRef = newOrderRef();

  // Bewusst vor Stripe und bewusst ohne Abbruch bei Fehlschlag: eine fehlende
  // Zeile in der eigenen Datenbank darf keinen Kauf verhindern, der Webhook
  // trägt die Stripe-Kennungen ohnehin nach.
  await createOrder({
    orderRef,
    sku: tier.sku,
    category: category.id,
    mode: tier.mode,
    billing: tier.billing,
    priceEur: tier.priceEur,
    locale: "de",
  });

  try {
    const session = await createCheckoutSession({
      category,
      tier,
      successUrl: `${SITE_URL}/pricing/briefing`,
      cancelUrl: `${SITE_URL}/pricing`,
      orderRef,
    });

    if (!session.url) throw new Error("Stripe lieferte keine Checkout-URL");
    await attachSession(orderRef, session.id);

    return Response.json({ url: session.url, orderRef }, { status: 200 });
  } catch (err) {
    // Providerfehler, keine Kundendaten.
    console.error("[moves] checkout failed", sku, err instanceof Error ? err.message : String(err));
    return Response.json({ error: "Checkout fehlgeschlagen" }, { status: 502 });
  }
}
