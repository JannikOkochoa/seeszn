// ─── MOVES: Stripe ────────────────────────────────────────────────────────────
// Bewusst ohne zusätzliche Abhängigkeit. Stripe hat eine stabile, formkodierte
// REST-Schnittstelle; der Umfang, den MOVES braucht, sind drei Aufrufe und eine
// Signaturprüfung. Das SDK würde dafür rund drei Megabyte in die Installation
// ziehen, ohne etwas beizutragen, das hier nicht in achtzig Zeilen steht.
//
// Konfiguration:
//   STRIPE_SECRET_KEY       Pflicht, damit überhaupt gekauft werden kann.
//   STRIPE_WEBHOOK_SECRET   Pflicht für /api/moves/webhook.
//   STRIPE_PRICE_<SKU>      Optional. Ohne diese Variable baut der Checkout den
//                           Preis inline aus dem Katalog (price_data). Damit
//                           funktioniert der Kauf, sobald der Secret Key steht,
//                           und lässt sich später auf im Dashboard gepflegte
//                           Prices umstellen, ohne dass sich Code ändert.
//                           Beispiel: STRIPE_PRICE_AUTHORITY_ONE=price_123
//
// Fehlt der Secret Key, ist das kein Fehlerzustand: die Oberfläche fällt sichtbar
// auf den Anfrageweg zurück. Siehe checkoutAvailability().

import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { MoveCategory, MoveTier } from "./types";
import type { BacklinkSelection } from "./backlinks";

const API = "https://api.stripe.com/v1";
const API_VERSION = "2026-03-31.preview";

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Env-Name des optional gepflegten Price-Objekts zu einem Produktschlüssel. */
export function priceEnvName(sku: string): string {
  return `STRIPE_PRICE_${sku.replace(/-/g, "_").toUpperCase()}`;
}

function configuredPriceId(sku: string): string | undefined {
  const value = process.env[priceEnvName(sku)];
  return value && value.startsWith("price_") ? value : undefined;
}

/**
 * Formkodierung mit Stripes Klammernotation. Verschachtelte Objekte und Listen
 * werden zu a[b][0][c]. Undefined-Werte fallen weg, damit optionale Felder nicht
 * als leerer String ankommen.
 */
function encode(value: unknown, prefix = "", out = new URLSearchParams()): URLSearchParams {
  if (value === undefined || value === null) return out;
  if (Array.isArray(value)) {
    value.forEach((item, i) => encode(item, `${prefix}[${i}]`, out));
    return out;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      encode(v, prefix ? `${prefix}[${k}]` : k, out);
    }
    return out;
  }
  out.append(prefix, String(value));
  return out;
}

async function stripeRequest<T>(
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY fehlt");

  const encoded = body ? encode(body).toString() : undefined;
  const url = method === "GET" && encoded ? `${API}${path}?${encoded}` : `${API}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Stripe-Version": API_VERSION,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" ? encoded : undefined,
    cache: "no-store",
  });

  const json = (await response.json()) as T & { error?: { message?: string; type?: string } };
  if (!response.ok) {
    // Stripe-Fehlertext ist providerseitig und enthält keine Kundendaten.
    throw new Error(json.error?.message ?? `Stripe ${response.status}`);
  }
  return json;
}

export interface CheckoutSession {
  id: string;
  url: string | null;
  status?: string;
  payment_status?: string;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: Record<string, string> | null;
  amount_total?: number | null;
  currency?: string | null;
  mode?: string;
}

/**
 * Legt die Checkout-Sitzung an. Der Preis kommt aus einem konfigurierten Price,
 * sonst inline aus dem Katalog. Beträge sind netto in Cent.
 *
 * `tax_id_collection` ist aktiv, weil der überwiegende Teil der Käufer in DACH
 * mit Umsatzsteuer-Identifikationsnummer kauft und die Rechnung sonst nachgepflegt
 * werden müsste. Die Adresse wird aus demselben Grund erhoben.
 */
export async function createCheckoutSession(input: {
  category: MoveCategory;
  tier: MoveTier;
  successUrl: string;
  cancelUrl: string;
  orderRef: string;
}): Promise<CheckoutSession> {
  const { category, tier, successUrl, cancelUrl, orderRef } = input;
  if (tier.priceEur === null || tier.billing === "none") {
    throw new Error("Diese Stufe ist nicht online kaufbar");
  }

  const configured = configuredPriceId(tier.sku);
  const recurring = tier.billing === "monthly" ? { interval: "month" } : undefined;

  const lineItem = configured
    ? { price: configured, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: tier.priceEur * 100,
          recurring,
          product_data: {
            name: `SEESZN ${category.label} ${tier.name}`,
            description: tier.kicker,
          },
        },
      };

  const metadata = {
    sku: tier.sku,
    category: category.id,
    mode: tier.mode,
    order_ref: orderRef,
  };

  return stripeRequest<CheckoutSession>("POST", "/checkout/sessions", {
    mode: tier.billing === "monthly" ? "subscription" : "payment",
    line_items: [lineItem],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    locale: "de",
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    client_reference_id: orderRef,
    metadata,
    // Bei Abos hängt die Metadata zusätzlich am Abo selbst, sonst ist sie nach
    // der ersten Rechnung nicht mehr auffindbar.
    ...(tier.billing === "monthly"
      ? { subscription_data: { metadata } }
      : { payment_intent_data: { metadata } }),
  });
}

export async function retrieveSession(id: string): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>("GET", `/checkout/sessions/${encodeURIComponent(id)}`);
}

/**
 * Prüft die Stripe-Signatur eines Webhooks gegen den rohen Body.
 * Entspricht dem Verfahren des offiziellen SDK: aus dem Header werden t und v1
 * gelesen, daraus "t.payload" per HMAC-SHA256 signiert und konstantzeitig
 * verglichen. Ein zu alter Zeitstempel gilt als ungültig (Replay-Schutz).
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSec = 300,
): boolean {
  if (!signatureHeader) return false;

  let timestamp = "";
  const candidates: string[] = [];
  for (const part of signatureHeader.split(",")) {
    const [k, v] = part.split("=", 2);
    if (k?.trim() === "t" && v) timestamp = v.trim();
    if (k?.trim() === "v1" && v) candidates.push(v.trim());
  }
  if (!timestamp || !candidates.length) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSec) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest();
  return candidates.some((candidate) => {
    const given = Buffer.from(candidate, "hex");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

/**
 * Die Checkout-Sitzung für eine Backlink-Konfiguration.
 *
 * Anders als bei den Katalogstufen gibt es hier kein im Dashboard gepflegtes
 * Price-Objekt und kann es auch keines geben: die Kombination aus Menge,
 * Kaufart, Format und Markt ergibt zu viele Varianten, um sie einzeln
 * anzulegen. Der Preis wird deshalb inline gesetzt, aus dem Betrag, den
 * resolveSelection serverseitig errechnet hat.
 */
export async function createBacklinkSession(input: {
  selection: BacklinkSelection;
  successUrl: string;
  cancelUrl: string;
  orderRef: string;
  description: string;
}): Promise<CheckoutSession> {
  const { selection, successUrl, cancelUrl, orderRef, description } = input;
  const monthly = selection.purchaseMode === "monthly";

  const metadata = {
    product: "backlinks",
    quantity: String(selection.quantity),
    purchase_mode: selection.purchaseMode,
    backlink_type: selection.backlinkType,
    market: selection.market,
    order_ref: orderRef,
  };

  return stripeRequest<CheckoutSession>("POST", "/checkout/sessions", {
    mode: monthly ? "subscription" : "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          // Der Gesamtbetrag in Cent, wie er auf der Seite steht. Bewusst nicht
          // Stückpreis mal Menge: der Stückpreis ist gerundet, das Produkt
          // daraus wiche bei 20, 50 und 100 Backlinks vom Staffelpreis ab.
          unit_amount: selection.totalCents,
          ...(monthly ? { recurring: { interval: "month" } } : {}),
          product_data: {
            name: `SEESZN Backlinks, ${selection.quantity} Stück`,
            description,
          },
        },
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    locale: "de",
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    client_reference_id: orderRef,
    metadata,
    ...(monthly ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
  });
}
