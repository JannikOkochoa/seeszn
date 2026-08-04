// ─── POST /api/contact ─────────────────────────────────────────────────────────
// Nimmt die Anfrage aus der Sichtbarkeitsprüfung entgegen, nachdem eine gültige
// Firmen-E-Mail eingegeben wurde.
//
// Reihenfolge (Lead-Schutz):
//   1) serverseitige Validierung
//   2) Lead in Supabase speichern  ← Source of Truth
//   3) interne Lead-Benachrichtigung an SEESZN_LEAD_EMAIL
//   4) automatische Auswertungs-Mail an den Nutzer (best effort)
//   5) Versandstatus am Lead nachtragen
//   6) Response ans Frontend
//
// Ein Mailfehler darf den Lead nie vernichten: liegt der Datensatz in Supabase,
// antworten wir mit ok=true und leadStored=true, markieren aber
// email_delivery_status=failed und loggen serverseitig. Nur wenn weder
// Speichern noch interner Mailversand geklappt haben, gibt es einen echten
// Fehlerstatus — sonst würden wir einen Erfolg vortäuschen.
//
// Safety: jede E-Mail wird serverseitig validiert und muss eine Firmendomain
// haben; jeder nutzerkontrollierte Wert wird gekappt; Empfänger sind nur die
// validierte Nutzeradresse und die konfigurierte Lead-Adresse. Logs enthalten
// nur die E-Mail-Domain, nie Adresse, Name oder Notiz.

import { Resend } from "resend";
import { COMPANY_EMAIL_ERROR, emailDomain, isCompanyEmail, isFreemail } from "@/lib/email/freemail";
import {
  buildLeadEmailHtml,
  buildLeadEmailText,
  buildUserEmailHtml,
  buildUserEmailText,
  getFirstName,
  leadEmailSubject,
  userEmailSubject,
} from "@/lib/email/diagnosis";
import { saveLead, updateLeadDelivery } from "@/lib/leads/store";
import type { DeliveryStatus } from "@/lib/leads/types";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import type { ScanResult } from "@/lib/scan/types";

export const runtime = "nodejs";

const FROM_DEFAULT = "SEESZN <hello@seeszn.com>";
const LEAD_DEFAULT = "hello@seeszn.com";
const PAGE = "/diagnosis/result";

// Per email-domain + IP: 5 submissions per 10 min (no-op outside production).
// Keyed by domain rather than IP alone so a shared Hostinger reverse-proxy IP
// does not pool every user into one rate-limit bucket.
const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 10 * 60 * 1000;

/** Antwortform für das Frontend. `ok` heißt: die Anfrage ist sicher angenommen. */
interface ContactResponse {
  ok: true;
  /** Lead liegt in der Datenbank. */
  leadStored: boolean;
  /** Interne Benachrichtigung ist rausgegangen. */
  leadNotified: boolean;
  /** Die automatische Auswertungs-Mail an den Nutzer ist rausgegangen. */
  userEmailSent: boolean;
}

/** Provider-Fehler auf eine loggbare Zeile reduzieren. Keine PII. */
function errText(err: unknown): string {
  if (!err) return "unknown error";
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return String(err);
}

export async function POST(request: Request): Promise<Response> {
  // Parse body first — the composite rate-limit key needs the email domain.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email, name, note, result, market, locale, companyUrlConfirm } = (body ?? {}) as {
    email?: unknown;
    name?: unknown;
    note?: unknown;
    result?: unknown;
    market?: unknown;
    locale?: unknown;
    companyUrlConfirm?: unknown;
  };

  const str = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : "";

  const loc = str(locale, 8) === "en" || str(market, 8) === "en" ? "en" : "de";
  const cleanName = str(name, 120);
  const cleanNote = str(note, 600);
  const scan = isScanResult(result) ? sanitizeResult(result) : undefined;
  const domain = scan?.domain ?? "";

  // Composite key: email domain + client IP.
  // IP alone is unsafe behind Hostinger's shared reverse proxy where all requests
  // arrive from the same upstream IP; adding the email domain gives per-company
  // scoping so one sender can't exhaust another company's budget.
  //
  // Läuft bewusst vor dem Honeypot: seit der Honeypot-Treffer den Datensatz
  // speichert, wäre er sonst ein ungedrosselter Schreibpfad in die Datenbank.
  const ip = clientIp(request);
  const senderDomain = typeof email === "string" ? emailDomain(email.trim().slice(0, 200)) : "unknown";
  const limit = rateLimit("contact", `${senderDomain}:${ip}`, CONTACT_LIMIT, CONTACT_WINDOW_MS);
  if (!limit.ok) {
    return Response.json(
      { error: "Zu viele Anfragen. Bitte versuche es in wenigen Minuten erneut.", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  // Honeypot: a hidden field real users never see. If it carries a value, treat
  // the request as a bot: no email goes out and the rule is never revealed.
  // Der Datensatz wird trotzdem gespeichert — als 'spam_suspected'. Ein
  // Falschpositiv (Passwortmanager füllt das Feld) darf keinen echten Lead
  // kosten.
  if (typeof companyUrlConfirm === "string" && companyUrlConfirm.trim() !== "") {
    let stored = false;
    if (typeof email === "string" && isCompanyEmail(email.trim().slice(0, 200))) {
      const saved = await saveLead({
        email: email.trim().slice(0, 200),
        name: cleanName,
        message: cleanNote,
        companyDomain: domain,
        source: "diagnosis_result",
        page: PAGE,
        locale: loc,
        status: "spam_suspected",
        scanResult: scan,
      });
      stored = saved.stored;
      await updateLeadDelivery(saved.id, {
        emailDeliveryStatus: "skipped",
        userEmailStatus: "skipped",
      });
    }
    return Response.json({
      ok: true,
      leadStored: stored,
      leadNotified: false,
      userEmailSent: false,
    } satisfies ContactResponse);
  }

  // 1) Email present + syntactically valid.
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  const cleanEmail = email.trim().slice(0, 200);

  // 2) Company-email requirement (authoritative, server-side).
  if (!isCompanyEmail(cleanEmail)) {
    return Response.json({ error: COMPANY_EMAIL_ERROR, code: "freemail" }, { status: 422 });
  }

  // ── 3) Lead speichern, bevor irgendeine Mail versucht wird ────────────────────
  // Ab hier ist die Anfrage aus Nutzersicht angenommen, solange `stored` gilt.
  const { id: leadId, stored: leadStored } = await saveLead({
    email: cleanEmail,
    name: cleanName,
    message: cleanNote,
    companyDomain: domain,
    source: "diagnosis_result",
    page: PAGE,
    locale: loc,
    scanResult: scan,
  });

  // Development-only env sanity check. Never logs the API key or user notes,
  // and never runs in production.
  if (process.env.NODE_ENV !== "production") {
    console.info("[contact] env check", {
      hasResendApiKey: Boolean(process.env.RESEND_API_KEY),
      leadStored,
      from: process.env.SEESZN_FROM_EMAIL ?? `(fallback) ${FROM_DEFAULT}`,
      replyTo: process.env.SEESZN_REPLY_TO_EMAIL ?? `(fallback) ${LEAD_DEFAULT}`,
      lead: process.env.SEESZN_LEAD_EMAIL ?? `(fallback) ${LEAD_DEFAULT}`,
    });
  }

  /** Antwort, wenn keine Mail rausging: nur ok, wenn der Lead gespeichert ist. */
  async function respondWithoutMail(reason: string): Promise<Response> {
    await updateLeadDelivery(leadId, {
      emailDeliveryStatus: "failed",
      userEmailStatus: "skipped",
      emailError: reason,
    });
    if (leadStored) {
      return Response.json({
        ok: true,
        leadStored: true,
        leadNotified: false,
        userEmailSent: false,
      } satisfies ContactResponse);
    }
    return Response.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[contact] RESEND_API_KEY is not set — email delivery is disabled. Set it in the Hostinger environment variables. leadStored=${leadStored} domain=${senderDomain}`,
    );
    return respondWithoutMail("RESEND_API_KEY missing");
  }

  const fromAddress = process.env.SEESZN_FROM_EMAIL || FROM_DEFAULT;
  const leadAddress = process.env.SEESZN_LEAD_EMAIL || LEAD_DEFAULT;
  const replyTo = process.env.SEESZN_REPLY_TO_EMAIL || LEAD_DEFAULT;

  const resend = new Resend(apiKey);

  // ── 4) Interne Lead-Benachrichtigung ──────────────────────────────────────────
  // Sender identity comes from env (Elana); reply-to is the submitted user email
  // so a reply lands with the prospect directly.
  const leadInput = {
    email: cleanEmail,
    name: cleanName,
    note: cleanNote,
    locale: loc,
    freemail: isFreemail(cleanEmail),
    result: scan,
  };

  let leadNotified = false;
  let leadError: string | null = null;
  try {
    const lead = await resend.emails.send({
      from: fromAddress,
      to: [leadAddress],
      replyTo: cleanEmail,
      subject: leadEmailSubject(domain || senderDomain, scan),
      html: buildLeadEmailHtml(leadInput),
      text: buildLeadEmailText(leadInput),
    });
    leadNotified = !lead.error;
    if (lead.error) leadError = errText(lead.error);
  } catch (err) {
    leadError = errText(err);
  }

  if (!leadNotified) {
    console.error(
      `[contact] lead notification failed domain=${senderDomain} leadStored=${leadStored} leadId=${leadId ?? "none"}: ${leadError ?? "unknown error"}`,
    );
    // Ohne gespeicherten Lead ist die Anfrage jetzt wirklich weg — echter Fehler.
    if (!leadStored) {
      return Response.json({ error: "Send failed" }, { status: 500 });
    }
  }

  // ── 5) Automatische Auswertungs-Mail an den Nutzer — best effort ──────────────
  // Ein Fehler hier kostet keinen Lead: wir melden userEmailSent=false und die
  // UI zeigt den "Analyse gespeichert"-Zustand.
  let userEmailSent = false;
  let userStatus: DeliveryStatus = "skipped";
  if (scan) {
    userStatus = "failed";
    try {
      const userInput = {
        firstName: getFirstName(cleanName),
        domain,
        result: scan,
        company: !isFreemail(cleanEmail),
      };
      const sent = await resend.emails.send({
        from: fromAddress,
        to: [cleanEmail],
        replyTo,
        subject: userEmailSubject(domain),
        html: buildUserEmailHtml(userInput),
        text: buildUserEmailText(userInput),
      });
      userEmailSent = !sent.error;
      if (sent.error) {
        console.error(`[contact] user email failed domain=${senderDomain}: ${errText(sent.error)}`);
      }
    } catch (err) {
      console.error(`[contact] user email threw domain=${senderDomain}: ${errText(err)}`);
    }
    if (userEmailSent) userStatus = "sent";
  }

  // ── 6) Versandstatus nachtragen ───────────────────────────────────────────────
  await updateLeadDelivery(leadId, {
    emailDeliveryStatus: leadNotified ? "sent" : "failed",
    userEmailStatus: userStatus,
    emailError: leadNotified ? null : leadError,
  });

  return Response.json({
    ok: true,
    leadStored,
    leadNotified,
    userEmailSent,
  } satisfies ContactResponse);
}

// ── narrow + sanitize the incoming scan result ──────────────────────────────────
// We never trust the client payload: it is shape-checked and clamped before it is
// used to build emails. Strings stay raw here (the HTML builder escapes them).

function isScanResult(v: unknown): v is ScanResult {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.domain === "string" &&
    typeof r.overallScore === "number" &&
    Array.isArray(r.scores) &&
    Array.isArray(r.aiAnswerChecks)
  );
}

function sanitizeResult(r: ScanResult): ScanResult {
  const cap = (s: unknown, max: number) => (typeof s === "string" ? s.slice(0, max) : "");
  return {
    ...r,
    domain: cap(r.domain, 200),
    finding: cap(r.finding, 600),
    meaning: cap(r.meaning, 1200),
    nextStep: cap(r.nextStep, 600),
    scores: (r.scores ?? []).slice(0, 6),
    // Beobachtungen kommen aus dem sessionStorage und können nach einem Deploy
    // eine ältere Shape haben. Nur wohlgeformte Einträge weiterreichen, sonst
    // baut der Mail-Builder auf undefined auf.
    observations: (r.observations ?? [])
      .filter((o) => o && typeof o === "object" && typeof o.label === "string" && typeof o.value === "string")
      .slice(0, 20),
    aiAnswerChecks: (r.aiAnswerChecks ?? []).slice(0, 3),
  };
}
