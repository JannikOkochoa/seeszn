// ─── POST /api/first-move/request ─────────────────────────────────────────────
// Der einzige Schreibpfad des First-Move-Kaufwegs. Zwei Absichten:
//
//   intent: "checkout"      verbindliche Anfrage für den First Move
//   intent: "result_email"  der qualifizierte Befund geht per Mail raus
//
// Reihenfolge wie in /api/contact: erst den Lead speichern, dann versenden,
// danach den Versandstatus nachtragen. Ein Mailfehler darf einen Kaufwunsch nie
// vernichten.
//
// Es gibt hier bewusst keinen Zahlungsanbieter. Der Kaufweg endet mit einer
// verbindlichen Anfrage zum Festpreis; Scope-Bestätigung und Rechnung folgen im
// Kickoff. Es wird nichts vorgetäuscht, was das System nicht tut.
//
// Logging: nur E-Mail-Domain und Absicht. Nie Adresse, Name oder Befundtext.

import { Resend } from "resend";
import { COMPANY_EMAIL_ERROR, emailDomain, isCompanyEmail } from "@/lib/email/freemail";
import { saveLead, updateLeadDelivery } from "@/lib/leads/store";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import {
  DELIVERY_DISPLAY,
  MASTER_PATH,
  PAID_PATH,
  PRICE_DISPLAY_NET,
  RISK_REVERSAL_SHORT,
} from "@/lib/first-move/product";
import {
  NO_CONTEXT_NOTE,
  internalVerificationContext,
  recallScan,
} from "@/lib/first-move/scanStore";
import { mailIsRedirected, mailRecipient, outboundGuard } from "@/lib/devGuard";
import type { PublicFinding } from "@/lib/first-move/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FROM_DEFAULT = "SEESZN <hello@seeszn.com>";
const LEAD_DEFAULT = "hello@seeszn.com";
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

type Intent = "checkout" | "result_email";

interface RequestResponse {
  ok: true;
  intent: Intent;
  leadStored: boolean;
  leadNotified: boolean;
  userEmailSent: boolean;
  /** Nur in der Entwicklung gesetzt: Schreiben und Versand wurden unterdrückt. */
  devSuppressed?: boolean;
  devReason?: string;
}

const str = (v: unknown, max: number): string =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : "";

function errText(err: unknown): string {
  if (!err) return "unknown error";
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Reduziert einen Befund auf das, was gespeichert und verschickt werden darf.
 * Nur Felder aus dem eigenen Contract, gekappt, ohne Fremdinhalt.
 *
 * Der Client kennt seit V6 nur noch die öffentliche Sicht: Beobachtung, bis zu
 * zwei Belege, Impact und Confidence. Umsetzungsplan und Messhypothese kommen
 * hier deshalb nicht mehr an und werden bei der Verifikation neu erhoben.
 */
function sanitizeFinding(value: unknown): Partial<PublicFinding> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const f = value as Record<string, unknown>;
  if (typeof f.title !== "string") return undefined;
  const level = (v: unknown) => (v === "low" || v === "medium" || v === "high" ? v : undefined);
  const evidence = Array.isArray(f.evidence)
    ? f.evidence
        .slice(0, 2)
        .map((item, i) => {
          const e = (item ?? {}) as Record<string, unknown>;
          const observation = str(e.observation, 600);
          return observation ? { id: str(e.id, 32) || `e${i + 1}`, observation } : null;
        })
        .filter((e): e is { id: string; observation: string } => e !== null)
    : [];
  return {
    id: str(f.id, 64) || undefined,
    route: (["search", "ai_search", "paid_acquisition", "unsure"] as const).find((r) => r === f.route),
    status: f.status === "qualified" ? "qualified" : undefined,
    title: str(f.title, 300),
    summary: str(f.summary, 1200),
    evidence,
    impact: level(f.impact),
    confidence: level(f.confidence),
  };
}

function findingLines(finding: Partial<PublicFinding> | undefined): string {
  if (!finding) return "Kein öffentliches Signal übergeben.";
  return [
    `Öffentliches Signal: ${finding.title ?? ""}`,
    finding.summary ? `Beobachtung: ${finding.summary}` : "",
    ...(finding.evidence ?? []).map((e) => `Beleg: ${e.observation}`),
    `Impact: ${finding.impact ?? "n/a"} · Confidence: ${finding.confidence ?? "n/a"}`,
    "Umsetzungsplan und Messhypothese entstehen erst in der Verifikation.",
  ]
    .filter(Boolean)
    .join("\n");
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const intent: Intent = b.intent === "result_email" ? "result_email" : "checkout";
  const email = str(b.email, 200);
  const name = str(b.name, 120);
  const note = str(b.note, 600);
  const companyDomain = str(b.domain, 253);
  const fitCheck = str(b.fitCheck, 300);
  // Kanalkontext wird nur erfragt, wenn öffentlich kein Signal entstanden ist.
  const channelContext = str(b.channelContext, 60);
  const surface = b.surface === "google_ads" ? PAID_PATH : MASTER_PATH;
  const finding = sanitizeFinding(b.finding);

  // Der Browser kennt nur die redigierte Sicht. Die vollständige Auswertung des
  // Scans liegt serverseitig und wird hier wieder eingesammelt, damit die
  // Verifikation nicht bei null anfängt. Fehlt sie (anderer Prozess, Neustart,
  // abgelaufen), läuft die Anfrage unverändert weiter.
  const internal = await recallScan(finding?.id);

  const ip = clientIp(request);
  const senderDomain = email ? emailDomain(email) : "unknown";
  const limit = rateLimit("first-move-request", `${senderDomain}:${ip}`, LIMIT, WINDOW_MS);
  if (!limit.ok) {
    return Response.json(
      { error: "Zu viele Anfragen. Bitte versuche es in wenigen Minuten erneut.", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  // Honeypot: ein Feld, das kein Mensch sieht. Trägt es einen Wert, geht keine
  // Mail raus, der Datensatz bleibt aber erhalten.
  const honeypot = str(b.companyUrlConfirm, 200) !== "";

  if (!email.includes("@")) {
    return Response.json({ error: "Bitte gib eine gültige E-Mail-Adresse an." }, { status: 400 });
  }
  if (!isCompanyEmail(email)) {
    return Response.json({ error: COMPANY_EMAIL_ERROR, code: "freemail" }, { status: 422 });
  }

  const message = [
    intent === "checkout" ? "Verbindliche First-Move-Anfrage" : "Ergebnisversand angefordert",
    fitCheck ? `Fit Check: ${fitCheck}` : "",
    channelContext ? `Kanalkontext: ${channelContext}` : "",
    note,
    findingLines(finding),
    internal ? internalVerificationContext(internal) : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // In der Entwicklung wird standardmäßig weder geschrieben noch versendet.
  // Produktion ist davon nie betroffen.
  const guard = outboundGuard();
  if (!guard.allowed) {
    console.warn(`[first-move] ${guard.reason} intent=${intent} domain=${senderDomain}`);
    return Response.json({
      ok: true,
      intent,
      leadStored: false,
      leadNotified: false,
      userEmailSent: false,
      devSuppressed: true,
      devReason: guard.reason,
    } satisfies RequestResponse);
  }

  const { id: leadId, stored: leadStored } = await saveLead({
    email,
    name,
    message,
    companyDomain,
    source: intent === "checkout" ? "first_move_request" : "first_move_result_email",
    page: surface,
    locale: "de",
    status: honeypot ? "spam_suspected" : "new",
    // Öffentliche Sicht plus, falls noch vorhanden, die vollständige interne
    // Auswertung. Die Spalte ist ausschließlich intern lesbar. Die CRM-Ansicht
    // rendert dieses Format heute nicht, der Inhalt bleibt aber erhalten.
    scanResult: internal ? { public: finding ?? null, internal: internal.finding } : finding,
  });

  if (honeypot) {
    await updateLeadDelivery(leadId, { emailDeliveryStatus: "skipped", userEmailStatus: "skipped" });
    return Response.json({
      ok: true,
      intent,
      leadStored,
      leadNotified: false,
      userEmailSent: false,
    } satisfies RequestResponse);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    await updateLeadDelivery(leadId, {
      emailDeliveryStatus: "failed",
      userEmailStatus: "skipped",
      emailError: "RESEND_API_KEY missing",
    });
    if (leadStored) {
      return Response.json({
        ok: true,
        intent,
        leadStored: true,
        leadNotified: false,
        userEmailSent: false,
      } satisfies RequestResponse);
    }
    return Response.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  if (mailIsRedirected()) {
    console.warn("[first-move] Entwicklungsmodus: Mailversand wird auf SEESZN_DEV_MAIL_TO umgeleitet.");
  }
  const from = process.env.SEESZN_FROM_EMAIL ?? FROM_DEFAULT;
  const leadTo = process.env.SEESZN_LEAD_EMAIL ?? LEAD_DEFAULT;
  const replyTo = process.env.SEESZN_REPLY_TO_EMAIL ?? LEAD_DEFAULT;

  // 1) Interne Benachrichtigung. Diese Mail entscheidet, ob die Anfrage ankommt.
  let leadNotified = false;
  try {
    await resend.emails.send({
      from,
      to: mailRecipient(leadTo),
      replyTo: email,
      subject:
        intent === "checkout"
          ? `First Move Anfrage: ${companyDomain || senderDomain}`
          : `First Move Ergebnisversand: ${companyDomain || senderDomain}`,
      text: [
        intent === "checkout" ? "Verbindliche First-Move-Anfrage" : "Ergebnisversand angefordert",
        `Seite: ${surface}`,
        `Domain: ${companyDomain || "nicht angegeben"}`,
        `Name: ${name || "nicht angegeben"}`,
        `E-Mail: ${email}`,
        fitCheck ? `Fit Check: ${fitCheck}` : "",
        channelContext ? `Kanalkontext: ${channelContext}` : "",
        note ? `Notiz: ${note}` : "",
        "",
        findingLines(finding),
        // Nur intern: der vollständige Kandidat aus dem Scan, damit die
        // Verifikation nicht bei null anfängt.
        internal ? `\n${internalVerificationContext(internal)}` : `\n${NO_CONTEXT_NOTE}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    leadNotified = true;
  } catch (err) {
    console.error(`[first-move] lead mail failed intent=${intent} domain=${senderDomain}: ${errText(err)}`);
  }

  // 2) Bestätigung an den Absender. Best effort, nie kaufkritisch.
  let userEmailSent = false;
  try {
    const headline =
      intent === "checkout"
        ? "Deine First-Move-Anfrage ist da."
        : "Dein Befund im Überblick.";
    const bodyText =
      intent === "checkout"
        ? [
            `Wir haben deine Anfrage für den SEESZN First Move zum Festpreis von ${PRICE_DISPLAY_NET} erhalten.`,
            "",
            "So geht es weiter:",
            "1. Wir verifizieren den Befund und bestätigen dir den Scope schriftlich.",
            "2. Mit der Scope-Bestätigung bekommst du die Rechnung.",
            `3. ${DELIVERY_DISPLAY}.`,
            "",
            `Risk Reversal: ${RISK_REVERSAL_SHORT}.`,
            "",
            findingLines(finding),
          ].join("\n")
        : ["Hier ist der Befund aus deiner Prüfung.", "", findingLines(finding)].join("\n");

    // Die Kundenmail trägt ausschließlich die öffentliche Sicht. Der interne
    // Verifikationskontext bleibt in der internen Benachrichtigung.
    await resend.emails.send({
      from,
      to: mailRecipient(email),
      replyTo,
      subject: headline,
      text: bodyText,
      html: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1f1e1a"><p style="font-weight:600">${esc(headline)}</p><pre style="font-family:Helvetica,Arial,sans-serif;white-space:pre-wrap;margin:0">${esc(bodyText)}</pre></div>`,
    });
    userEmailSent = true;
  } catch (err) {
    console.error(`[first-move] user mail failed intent=${intent} domain=${senderDomain}: ${errText(err)}`);
  }

  await updateLeadDelivery(leadId, {
    emailDeliveryStatus: leadNotified ? "sent" : "failed",
    userEmailStatus: userEmailSent ? "sent" : "failed",
  });

  if (!leadStored && !leadNotified) {
    return Response.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  return Response.json({
    ok: true,
    intent,
    leadStored,
    leadNotified,
    userEmailSent,
  } satisfies RequestResponse);
}
