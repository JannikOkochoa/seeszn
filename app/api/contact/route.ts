// ─── POST /api/contact ─────────────────────────────────────────────────────────
// Delivers the full Sichtbarkeitsprüfung after a valid company email is submitted
// on the result page. Two emails go out:
//   1) internal lead to SEESZN_LEAD_EMAIL — must succeed for the request to count
//   2) a personal automatic email to the user (from Elana) with the full reading
//      — best effort; a failure here must never lose the lead.
//
// Safety: the email is validated server-side and must be a company domain; every
// user-controlled value is sanitized; we only ever send to the validated user
// address and the configured lead address. No secrets are exposed.

import { Resend } from "resend";
import { COMPANY_EMAIL_ERROR, isCompanyEmail, isFreemail } from "@/lib/email/freemail";
import {
  buildLeadEmailHtml,
  buildLeadEmailText,
  buildUserEmailHtml,
  buildUserEmailText,
  getFirstName,
  leadEmailSubject,
  userEmailSubject,
} from "@/lib/email/diagnosis";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import type { ScanResult } from "@/lib/scan/types";

export const runtime = "nodejs";

const FROM_DEFAULT = "SEESZN <hello@seeszn.com>";
const LEAD_DEFAULT = "hello@seeszn.com";

// Email delivery is more sensitive than the scan: cap harder (no-op outside prod).
const CONTACT_LIMIT = 3;
const CONTACT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit("contact", clientIp(request), CONTACT_LIMIT, CONTACT_WINDOW_MS);
  if (!limit.ok) {
    return Response.json(
      { error: "Zu viele Anfragen. Bitte versuche es in wenigen Minuten erneut.", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

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

  // Honeypot: a hidden field real users never see. If it carries a value, treat
  // the request as a bot. We soft-accept without sending any email or lead and
  // never reveal the rule.
  if (typeof companyUrlConfirm === "string" && companyUrlConfirm.trim() !== "") {
    return Response.json({ ok: true, userEmailSent: false });
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

  // Development-only env sanity check. Never logs the API key or user notes,
  // and never runs in production.
  if (process.env.NODE_ENV !== "production") {
    console.info("[contact] env check", {
      hasResendApiKey: Boolean(process.env.RESEND_API_KEY),
      from: process.env.SEESZN_FROM_EMAIL ?? `(fallback) ${FROM_DEFAULT}`,
      replyTo: process.env.SEESZN_REPLY_TO_EMAIL ?? `(fallback) ${LEAD_DEFAULT}`,
      lead: process.env.SEESZN_LEAD_EMAIL ?? `(fallback) ${LEAD_DEFAULT}`,
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Not configured" }, { status: 503 });
  }

  const str = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : "";

  const loc = str(locale, 8) === "en" || str(market, 8) === "en" ? "en" : "de";
  const cleanName = str(name, 120);
  const cleanNote = str(note, 600);
  const scan = isScanResult(result) ? sanitizeResult(result) : undefined;
  const domain = scan?.domain ?? "";

  const fromAddress = process.env.SEESZN_FROM_EMAIL || FROM_DEFAULT;
  const leadAddress = process.env.SEESZN_LEAD_EMAIL || LEAD_DEFAULT;
  const replyTo = process.env.SEESZN_REPLY_TO_EMAIL || LEAD_DEFAULT;

  const resend = new Resend(apiKey);

  // ── 1) Internal lead briefing — must succeed ──────────────────────────────────
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
  const lead = await resend.emails.send({
    from: fromAddress,
    to: [leadAddress],
    replyTo: cleanEmail,
    subject: leadEmailSubject(domain, scan),
    html: buildLeadEmailHtml(leadInput),
    text: buildLeadEmailText(leadInput),
  });

  if (lead.error) {
    return Response.json({ error: "Send failed" }, { status: 500 });
  }

  // ── 2) Personal automatic email to the user — best effort ─────────────────────
  // A failure here must not lose the lead: we report userEmailSent=false and the
  // UI shows the "Analyse gespeichert" fallback.
  let userEmailSent = false;
  if (scan) {
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
    } catch {
      userEmailSent = false;
    }
  }

  return Response.json({ ok: true, userEmailSent });
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
    observations: (r.observations ?? []).slice(0, 20),
    aiAnswerChecks: (r.aiAnswerChecks ?? []).slice(0, 3),
  };
}
