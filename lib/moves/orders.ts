// ─── MOVES: Bestellungen ──────────────────────────────────────────────────────
// Persistenz für den Kaufweg. Gleiche Grundregel wie lib/leads/store.ts: dieses
// Modul wirft nie. Ein Fehler beim Schreiben darf keinen Kauf abbrechen, der
// sonst durchgelaufen wäre. Jede Funktion meldet ihr Ergebnis zurück, der
// Aufrufer entscheidet.
//
// Logging: nur Referenz, Produktschlüssel und E-Mail-Domain. Nie die Adresse,
// nie der Inhalt eines Briefings.

import "server-only";
import { randomBytes } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { emailDomain } from "@/lib/email/freemail";
import type { Billing, MoveCategoryId, PurchaseMode } from "./types";

export type OrderStatus = "initiated" | "paid" | "briefed" | "cancelled" | "failed";

export interface MoveBrief {
  domain: string;
  targetUrl: string;
  market: string;
  language: string;
  topic: string;
  notes: string;
  contactEmail?: string;
}

const MAX = { url: 500, short: 120, topic: 400, notes: 1500, email: 200 };

/**
 * Menschlich lesbare Referenz, die in Stripe, in der Bestätigung und im
 * Postfach dieselbe ist. Kurz genug, um sie am Telefon zu nennen.
 */
export function newOrderRef(): string {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `MV-${stamp}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

export interface CreateOrderInput {
  orderRef: string;
  sku: string;
  category: MoveCategoryId;
  mode: PurchaseMode;
  billing: Exclude<Billing, "none">;
  priceEur: number;
  locale?: string;
}

/** Legt die Bestellung an, bevor Stripe aufgerufen wird. */
export async function createOrder(input: CreateOrderInput): Promise<{ stored: boolean }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("move_orders").insert({
      order_ref: input.orderRef,
      sku: input.sku,
      category: input.category,
      mode: input.mode,
      billing: input.billing,
      price_eur: input.priceEur,
      status: "initiated",
      locale: input.locale === "en" ? "en" : "de",
    });
    if (error) {
      console.error("[moves] order insert failed", input.orderRef, error.message);
      return { stored: false };
    }
    return { stored: true };
  } catch (err) {
    console.error("[moves] order insert threw", input.orderRef, errText(err));
    return { stored: false };
  }
}

/** Trägt die Stripe-Sitzung nach, sobald sie angelegt ist. */
export async function attachSession(orderRef: string, sessionId: string): Promise<void> {
  await safeUpdate(orderRef, { stripe_session_id: sessionId });
}

export interface PaidInput {
  sessionId: string;
  paymentIntent?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  amountTotalCents?: number | null;
  currency?: string | null;
  email?: string | null;
}

/**
 * Markiert eine Bestellung als bezahlt. Wird vom Webhook aufgerufen und ist
 * bewusst idempotent.
 *
 * Der Statuswert wird gelesen, bevor er geschrieben wird: der Käufer kann das
 * Briefing ausgefüllt haben, bevor Stripe den Webhook zugestellt hat. In dem
 * Fall dürfen die Stripe-Kennungen nachgetragen werden, der Status aber nicht
 * von 'briefed' auf 'paid' zurückfallen.
 */
export async function markPaid(orderRef: string, input: PaidInput): Promise<{ updated: boolean }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: current } = await supabase
      .from("move_orders")
      .select("status")
      .eq("order_ref", orderRef)
      .maybeSingle();

    const nextStatus = current?.status === "briefed" ? "briefed" : "paid";

    const { data, error } = await supabase
      .from("move_orders")
      .update({
        status: nextStatus,
        stripe_session_id: input.sessionId,
        stripe_payment_intent: input.paymentIntent ?? null,
        stripe_subscription_id: input.subscriptionId ?? null,
        stripe_customer_id: input.customerId ?? null,
        amount_total_cents: input.amountTotalCents ?? null,
        currency: input.currency ?? null,
        email: cut(input.email ?? undefined, MAX.email),
        email_domain: input.email ? emailDomain(input.email) || null : null,
      })
      .eq("order_ref", orderRef)
      .in("status", ["initiated", "briefed"])
      .select("id");

    if (error) {
      console.error("[moves] markPaid failed", orderRef, error.message);
      return { updated: false };
    }
    return { updated: Boolean(data?.length) };
  } catch (err) {
    console.error("[moves] markPaid threw", orderRef, errText(err));
    return { updated: false };
  }
}

/** Legt das Briefing ab und setzt den Status auf 'briefed'. */
export async function saveBrief(
  orderRef: string,
  brief: MoveBrief,
): Promise<{ stored: boolean }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("move_orders")
      .update({
        status: "briefed",
        brief: {
          domain: cut(brief.domain, MAX.short),
          targetUrl: cut(brief.targetUrl, MAX.url),
          market: cut(brief.market, MAX.short),
          language: cut(brief.language, MAX.short),
          topic: cut(brief.topic, MAX.topic),
          notes: cut(brief.notes, MAX.notes),
          contactEmail: cut(brief.contactEmail, MAX.email),
        },
        brief_submitted_at: new Date().toISOString(),
      })
      .eq("order_ref", orderRef);

    if (error) {
      console.error("[moves] saveBrief failed", orderRef, error.message);
      return { stored: false };
    }
    return { stored: true };
  } catch (err) {
    console.error("[moves] saveBrief threw", orderRef, errText(err));
    return { stored: false };
  }
}

/** Liest die Bestellung zur Stripe-Sitzung. Für die Bestätigungsseite. */
export async function orderBySession(sessionId: string): Promise<{
  orderRef: string;
  sku: string;
  status: OrderStatus;
  briefed: boolean;
} | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("move_orders")
      .select("order_ref, sku, status, brief_submitted_at")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      orderRef: data.order_ref as string,
      sku: data.sku as string,
      status: data.status as OrderStatus,
      briefed: Boolean(data.brief_submitted_at),
    };
  } catch {
    return null;
  }
}

async function safeUpdate(orderRef: string, patch: Record<string, unknown>): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("move_orders").update(patch).eq("order_ref", orderRef);
    if (error) console.error("[moves] update failed", orderRef, error.message);
  } catch (err) {
    console.error("[moves] update threw", orderRef, errText(err));
  }
}

function cut(value: string | undefined, max: number): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function errText(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
