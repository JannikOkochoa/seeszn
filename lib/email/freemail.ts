// ─── Company-email gate ────────────────────────────────────────────────────────
// The free scan stays open to everyone. The full diagnosis delivery requires a
// company email so we can cleanly map the request to a brand. Shared by the
// frontend (inline validation) and the backend (authoritative validation), so the
// blocked list never drifts. We never shame the user and never block the scan.

/** Freemail domains that may not receive the full diagnosis delivery. */
export const FREEMAIL_DOMAINS = new Set<string>([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "gmx.de",
  "gmx.com",
  "web.de",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "mail.com",
  "t-online.de",
]);

/** The single error message shown on both frontend and backend. No shaming. */
export const COMPANY_EMAIL_ERROR =
  "Bitte nutze eine E-Mail mit Firmendomain, damit wir Anfrage und Marke sauber zuordnen können.";

export function emailDomain(email: string): string {
  return email.split("@")[1]?.trim().toLowerCase() ?? "";
}

export function isFreemail(email: string): boolean {
  const domain = emailDomain(email);
  return domain ? FREEMAIL_DOMAINS.has(domain) : false;
}

/** A syntactically valid email on a non-freemail (company) domain. */
export function isCompanyEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email) && !isFreemail(email);
}
