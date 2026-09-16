// ─── POST /api/moves/recommendation ───────────────────────────────────────────
// Die kostenlose Mengenempfehlung aus dem Backlink-Rechner.
//
// Was hier NICHT passiert: es wird keine externe SEO-Schnittstelle aufgerufen,
// kein Backlink-Profil abgefragt, keine Kennzahl berechnet und keine Empfehlung
// erzeugt. Die Route nimmt zwei Felder entgegen und legt sie so ab, dass ein
// Mensch die Domain danach ansieht. Genau das steht auch auf der Seite.
//
// Reihenfolge, wie bei /api/contact:
//   1) serverseitig prüfen und die Domain normalisieren
//   2) Lead speichern  ← Source of Truth
//   3) interne Benachrichtigung senden (best effort)
//   4) antworten
//
// Ein Mailfehler darf die Anfrage nie vernichten: liegt der Datensatz in der
// Datenbank, ist die Antwort ok. Nur wenn weder Speichern noch Mailversand
// geklappt haben, gibt es einen Fehlerstatus.

import { Resend } from "resend";
import { saveLead } from "@/lib/leads/store";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { isEmail, normalizeDomain } from "@/lib/moves/domain";

export const runtime = "nodejs";

const FROM_DEFAULT = "SEESZN <hello@seeszn.com>";
const LEAD_DEFAULT = "hello@seeszn.com";
const PAGE = "/pricing";

// Drei Anfragen in zehn Minuten je Absender. Wer wirklich mehrere Domains
// prüfen lassen will, schafft das; ein Automat läuft auf.
const LIMIT = 3;
const WINDOW_MS = 10 * 60 * 1000;

const str = (v: unknown, max: number): string =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : "";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const rawDomain = str(b.domain, 300);
  const email = str(b.email, 200);

  if (!rawDomain) return Response.json({ error: "domain_missing" }, { status: 400 });
  if (!email) return Response.json({ error: "email_missing" }, { status: 400 });

  const domain = normalizeDomain(rawDomain);
  if (!domain) return Response.json({ error: "domain_invalid" }, { status: 400 });
  // Freemail ist ausdrücklich erlaubt: eine Mengenempfehlung ist keine
  // Ausschreibung, und eine Hürde an dieser Stelle kostet echte Anfragen.
  if (!isEmail(email)) return Response.json({ error: "email_invalid" }, { status: 400 });

  // Schlüssel aus Domain und IP, damit eine geteilte Proxy-Adresse nicht alle
  // Besucher in denselben Topf wirft.
  const limit = rateLimit("moves_recommendation", `${domain}:${clientIp(request)}`, LIMIT, WINDOW_MS);
  if (!limit.ok) {
    return Response.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  // Honigtopf. Ein ausgefülltes, für Menschen unsichtbares Feld heißt Automat.
  // Der Datensatz wird trotzdem gespeichert, nur als 'spam_suspected': ein
  // Falschpositiv soll keine echte Anfrage kosten.
  const trapped = str(b.companyUrlConfirm, 200) !== "";

  // Kontext aus dem Rechner. Er kommt ohne zusätzliches Feld zustande und hilft
  // dem Menschen, der gleich draufschaut. Der Besucher sieht davon nichts.
  const context = {
    market: str(b.market, 8) || null,
    format: str(b.backlinkType, 20) || null,
    billingMode: str(b.purchaseMode, 20) || null,
    currentlySelectedQuantity:
      typeof b.quantity === "number" && Number.isInteger(b.quantity) ? b.quantity : null,
  };

  const locale = str(b.locale, 8) === "en" ? "en" : "de";

  const { stored } = await saveLead({
    email,
    companyDomain: domain,
    source: "pricing_backlink_recommendation",
    page: PAGE,
    locale,
    status: trapped ? "spam_suspected" : "new",
    // Der Rechnerzustand liegt im selben jsonb-Feld wie sonst das Scan-Ergebnis.
    // Kein Schemawechsel für vier optionale Werte.
    scanResult: { recommendationContext: context },
  });

  const notified = trapped ? false : await notify({ domain, email, locale, context });

  if (!stored && !notified) {
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 200 });
}

/** Interne Benachrichtigung. Best effort, blockiert nie. */
async function notify(input: {
  domain: string;
  email: string;
  locale: string;
  context: Record<string, string | number | null>;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const lines = [
    "Kostenlose Backlink-Mengenempfehlung angefragt.",
    "",
    `Domain:  ${input.domain}`,
    `E-Mail:  ${input.email}`,
    `Sprache: ${input.locale}`,
    "",
    "Stand im Rechner zum Zeitpunkt der Anfrage:",
    `  Zielmarkt:        ${input.context.market ?? "nicht gesetzt"}`,
    `  Format:           ${input.context.format ?? "nicht gesetzt"}`,
    `  Abrechnung:       ${input.context.billingMode ?? "nicht gesetzt"}`,
    `  Gewählte Menge:   ${input.context.currentlySelectedQuantity ?? "nicht gesetzt"}`,
    "",
    "Zugesagt ist eine Antwort innerhalb eines Werktags.",
  ];

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: process.env.SEESZN_FROM_EMAIL || FROM_DEFAULT,
      to: process.env.SEESZN_LEAD_EMAIL || LEAD_DEFAULT,
      replyTo: input.email,
      subject: `Mengenempfehlung angefragt: ${input.domain}`,
      text: lines.join("\n"),
    });
    if (error) {
      console.error("[moves] recommendation mail failed", input.domain, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[moves] recommendation mail threw", input.domain, err instanceof Error ? err.message : String(err));
    return false;
  }
}
