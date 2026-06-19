// ─── Sichtbarkeitsprüfung — email content ──────────────────────────────────────
// Builds the personal automatic user email (from Elana) and the internal lead
// briefing from a scan result. The user email reads like a personal SEESZN
// readout, not a dashboard export: no JSON dumps, no raw internal fields, calm and
// direct. Every user-controlled value is escaped before it touches the HTML.
// The internal lead briefing keeps the operational detail (incl. compact JSON).
// German, premium, no long dashes.

import type { AiAnswerCheck, AiQuestionKind, CategoryId, ScanResult, ScoreCard } from "@/lib/scan/types";

// Mandatory disclaimer — identical wording in email and UI.
export const AI_DISCLAIMER =
  "Diese Auswertung ist ein Web-Signalcheck rund um Fragen, bei denen KI-Systeme deine Marke nennen müssten. Sie ist kein dauerhaftes Ranking in ChatGPT, Gemini, Perplexity oder Google AI Overviews.";

const AI_SECTION_TITLE = "Fragen, bei denen KI-Systeme deine Marke nennen müssten";

const USER_EMAIL_PREHEADER =
  "Die ersten Signale zeigen, wo deine Marke in KI-Antworten sichtbar sein müsste.";

// When no live check ran, each question still earns a strong, role-specific
// reading so the Prüfset never feels broken or repetitive.
const PRUEFSET_INTERPRETATION: Record<AiQuestionKind, string> = {
  category:
    "Diese Frage entscheidet, ob deine Marke als Kategorie-Antwort verstanden wird, nicht nur als eigene Website.",
  brand: "Diese Frage zeigt, ob genug Vertrauenssignale rund um deine Marke vorhanden sind.",
  problem:
    "Diese Frage zeigt, ob deine Angebotsseite ein konkretes Problem direkt genug beantwortet.",
};

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Extract a usable first name from a submitted full name. Returns null when there
 * is nothing human to greet (callers then fall back to "Hallo,"). German
 * characters are preserved; obvious company suffixes are not treated as names. We
 * never derive a name from the email local part.
 */
export function getFirstName(name?: string | null): string | null {
  if (!name) return null;
  const first = name.trim().split(/\s+/).filter(Boolean)[0];
  if (!first) return null;
  const NON_NAME = /^(gmbh|ug|ag|kg|ohg|gbr|inc|llc|ltd|co|company|team|mbh|ek|e\.k\.)$/i;
  if (NON_NAME.test(first)) return null;
  if (first.length < 2 || first.length > 40) return null;
  if (!/[a-zA-ZäöüÄÖÜß]/.test(first)) return null;
  return first;
}

/** Warm, personal German greeting. Never "Hi", never "Sehr geehrte". */
function greetingDe(firstName: string | null): string {
  return firstName ? `Hallo ${firstName},` : "Hallo,";
}

/** Company email -> the website is the company's ("eure"); otherwise "deine". */
function siteRef(company: boolean): string {
  return company ? "eure Seite" : "deine Seite";
}

// Area-specific, human personalization keyed off the weakest readiness area.
// AREA_OBSERVATION  — the calm "first glance" sentence (user email).
// AREA_GAP_CLAUSE   — just the gap clause, for the internal reply's colon line.
// AREA_WHY          — why it matters, in plain language.
// AREA_HUMAN        — what Elana would look at, in human German (no product jargon).
const AREA_OBSERVATION: Record<CategoryId, string> = {
  conversionSurface: "Man erkennt schon, worum es geht, aber der Weg von Interesse zu Anfrage ist noch nicht klar genug.",
  sourceSurface: "Man erkennt schon, worum es geht, aber die Seite liefert noch zu wenig Substanz, auf die Google oder KI-Systeme wirklich gut zurückgreifen können.",
  entityClarity: "Man erkennt die Richtung, aber die Marke wird noch nicht schnell genug als eindeutiger Anbieter greifbar.",
  answerReadiness: "Die Grundlage ist da, aber die Seite beantwortet noch zu wenige Fragen so konkret, dass man sie wirklich als gute Antwort nutzen würde.",
  technicalTrust: "Inhaltlich ist schon etwas da, aber die technischen Signale sollten sauberer abgesichert werden.",
  indexierbarkeit: "Die Seite ist auffindbar, aber die Struktur wirkt noch nicht konsequent genug.",
};

// Human, customer-safe area labels — never show the internal technical labels
// (Conversion Surface, Source Surface Quality, …) in the hero, summary or reply.
const HUMAN_AREA_LABEL: Record<CategoryId, string> = {
  conversionSurface: "Weg zur Anfrage",
  sourceSurface: "Substanz als Quelle",
  entityClarity: "klare Markenwahrnehmung",
  answerReadiness: "Antworten auf Käuferfragen",
  technicalTrust: "technische Vertrauenssignale",
  indexierbarkeit: "saubere Auffindbarkeit",
};

// Short, human next step per area for the "Kurze Diagnose" list.
const AREA_SHORT_STEP: Record<CategoryId, string> = {
  conversionSurface: "Den nächsten Schritt auf wichtigen Seiten klarer machen.",
  sourceSurface: "Die wichtigsten Fragen klarer beantworten und belegen.",
  entityClarity: "Markenname, Angebot und Absender konsistenter zeigen.",
  answerReadiness: "Käuferfragen direkter und konkreter beantworten.",
  technicalTrust: "Struktur, Daten und Performance stabiler absichern.",
  indexierbarkeit: "Wichtige Einstiege klarer auffindbar und verlinkt machen.",
};

const AREA_WHY: Record<CategoryId, string> = {
  indexierbarkeit: "Die Seite ist grundsätzlich auffindbar, aber die Struktur ist noch nicht konsequent genug, damit jede wichtige Seite sicher gefunden wird.",
  entityClarity: "Damit Such- und KI-Systeme die Marke klar einordnen, muss schnell erkennbar sein, wer dahintersteht und wofür sie steht. Diese eindeutigen Signale sind noch nicht stark genug.",
  sourceSurface: "Such- und KI-Systeme greifen am liebsten auf Seiten zurück, die etwas wirklich erklären und mit Belegen unterlegen. Genau diese Substanz ist noch zu dünn, deshalb wird die Marke seltener als gute Antwort genutzt.",
  answerReadiness: "Käufer stellen oft sehr konkrete Fragen. Je direkter die Seite diese Fragen beantwortet, desto eher wird sie als gute Antwort genutzt. Da ist noch Luft.",
  technicalTrust: "Inhaltlich ist die Basis da, aber die technischen Signale sollten sauberer abgesichert sein, damit Maschinen der Seite leichter vertrauen.",
  conversionSurface: "Sobald klar ist, worum es geht, sollte der nächste Schritt sofort sichtbar sein. Im Moment muss man noch zu lange suchen, wie man eine Anfrage stellt.",
};

const AREA_HUMAN: Record<CategoryId, string> = {
  indexierbarkeit: "die Struktur und Auffindbarkeit der Seite",
  entityClarity: "die klare Einordnung der Marke",
  sourceSurface: "die Substanz und Belege auf der Seite",
  answerReadiness: "die Fragen, die Käufer wirklich stellen",
  technicalTrust: "die technische Absicherung der Seite",
  conversionSurface: "den Weg zur Anfrage",
};

// User-facing status word — calm and never "nicht live geprüft".
function userStatusWord(check: AiAnswerCheck): string {
  if (!check.checked) return "Prüfset erstellt";
  return check.status === "gefunden" ? "Marke sichtbar" : "Marke nicht gefunden";
}

// User-facing interpretation — strong role-specific reading when no live check ran.
function userInterpretation(check: AiAnswerCheck): string {
  if (check.checked) return check.interpretation;
  return PRUEFSET_INTERPRETATION[check.kind];
}

// Intro line for the user email's KI section — reframes the no-check case.
function aiSectionIntro(checks: AiAnswerCheck[]): string {
  const anyChecked = checks.some((c) => c.checked);
  if (anyChecked) {
    return "Diese drei Fragen bilden das Prüfset für deine KI-Sichtbarkeit. Hier siehst du, wo deine Marke schon auftaucht und wo noch nicht.";
  }
  return "Diese drei Fragen zeigen, wo deine Marke in KI-Antworten relevant sein müsste. Der Live-Web-Signalcheck ist für diesen Scan noch nicht aktiv, aber das Prüfset zeigt bereits, welche Antwortflächen wichtig werden.";
}

function domainsLine(check: AiAnswerCheck): string {
  const list = check.visibleCompetitors.length ? check.visibleCompetitors : check.visibleDomains;
  if (!list.length) return "";
  return list.slice(0, 5).map((d) => d.domain).join(", ");
}

// User-facing plain-text question block — strong readings, no technical labels.
function userQuestionTextBlock(checks: AiAnswerCheck[]): string[] {
  const lines: string[] = [];
  checks.forEach((c, i) => {
    lines.push(`${i + 1}. ${c.question}`);
    lines.push(`   Status: ${userStatusWord(c)}`);
    if (c.checked && c.ownDomainFound && typeof c.ownDomainPosition === "number") {
      lines.push(`   Position der eigenen Domain: ${c.ownDomainPosition}`);
    }
    if (c.checked) {
      const dl = domainsLine(c);
      if (dl) lines.push(`   Sichtbares Webumfeld: ${dl}`);
      if (c.leakType) lines.push(`   Einordnung: ${c.leakType}`);
    }
    lines.push(`   ${userInterpretation(c)}`);
    lines.push("");
  });
  return lines;
}

// ── user email (personal, from Elana) ──────────────────────────────────────────

export interface UserEmailInput {
  firstName: string | null;
  domain: string;
  result: ScanResult;
  /** true when the prospect used a company email (changes "deine"/"eure"). */
  company: boolean;
}

export function userEmailSubject(domain: string): string {
  return `Deine SEESZN Auswertung für ${domain}`;
}

export function buildUserEmailText({ firstName, domain, result, company }: UserEmailInput): string {
  const weakest = weakestCard(result);
  const topGaps = [...result.scores].sort((a, b) => a.score - b.score).slice(0, 3);
  const parts: string[] = [
    greetingDe(firstName),
    "",
    `deine Auswertung für ${domain} ist da. Beim ersten Blick auf ${siteRef(company)} fällt auf: ${AREA_OBSERVATION[weakest.id]}`,
    "",
    AREA_WHY[weakest.id],
    "",
    `Gesamtwert: ${result.overallScore}/100 (${result.overallStatus})`,
    "",
    "Die wichtigsten Lücken:",
    ...topGaps.map((c) => `- ${HUMAN_AREA_LABEL[c.id]} (${c.score}/100): ${AREA_SHORT_STEP[c.id]}`),
    "",
    AI_SECTION_TITLE,
    aiSectionIntro(result.aiAnswerChecks),
    "",
    ...userQuestionTextBlock(result.aiAnswerChecks),
    "Was wir gesehen haben:",
    ...result.observations.slice(0, 8).map((o) => `- ${o.label}: ${o.value}`),
    "",
    `Ich würde als Nächstes vor allem auf ${AREA_HUMAN[weakest.id]} schauen. Da wird aus Sichtbarkeit meistens ein klarer nächster Schritt.`,
    "",
    "Ich melde mich, dann gehen wir das gemeinsam durch.",
    "",
    AI_DISCLAIMER,
    "",
    "Liebe Grüße",
    "Elana",
    "SEESZN",
  ];
  return parts.join("\n");
}

export function buildUserEmailHtml({ firstName, domain, result, company }: UserEmailInput): string {
  const e = escapeHtml;
  const weakest = weakestCard(result);
  const topGaps = [...result.scores].sort((a, b) => a.score - b.score).slice(0, 3);
  const greeting = greetingDe(firstName ? e(firstName) : null);

  const muted = "color:#6b6b63;";
  const h = (t: string) =>
    `<p style="margin:28px 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;color:#1a1a17;">${t}</p>`;
  const p = (t: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#2a2a26;">${t}</p>`;

  const questionsHtml = result.aiAnswerChecks
    .map((c, i) => {
      const rows: string[] = [];
      rows.push(
        `<p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#1a1a17;line-height:1.45;">${i + 1}. ${e(c.question)}</p>`,
      );
      rows.push(
        `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;${muted}">${e(userStatusWord(c))}</p>`,
      );
      if (c.checked && c.ownDomainFound && typeof c.ownDomainPosition === "number") {
        rows.push(`<p style="margin:0 0 4px;font-size:13px;${muted}">Position der eigenen Domain: ${c.ownDomainPosition}</p>`);
      }
      if (c.checked) {
        const dl = domainsLine(c);
        if (dl) rows.push(`<p style="margin:0 0 4px;font-size:13px;${muted}">Sichtbares Webumfeld: ${e(dl)}</p>`);
        if (c.leakType) rows.push(`<p style="margin:0 0 4px;font-size:13px;${muted}">Einordnung: ${e(c.leakType)}</p>`);
      }
      rows.push(`<p style="margin:0;font-size:14px;line-height:1.6;color:#2a2a26;">${e(userInterpretation(c))}</p>`);
      const border = i < result.aiAnswerChecks.length - 1 ? "border-bottom:1px solid #ecebe5;" : "";
      return `<div style="padding:18px 0;${border}">${rows.join("")}</div>`;
    })
    .join("");

  const gapsHtml = topGaps
    .map((c) => `<li style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#2a2a26;">${e(HUMAN_AREA_LABEL[c.id])} (${c.score}/100): ${e(AREA_SHORT_STEP[c.id])}</li>`)
    .join("");

  const seenHtml = result.observations
    .slice(0, 8)
    .map((o) => `<li style="margin:0 0 6px;font-size:14px;line-height:1.55;color:#2a2a26;">${e(o.label)}: ${e(o.value)}</li>`)
    .join("");

  // Hidden preheader — controls the inbox preview line, then collapses.
  const preheader = `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f6f5f0;opacity:0;">${e(USER_EMAIL_PREHEADER)}</div>`;

  return `<!doctype html><html lang="de"><body style="margin:0;background:#f6f5f0;padding:24px;">
${preheader}
<div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e6e5dd;padding:40px 36px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  ${p(greeting)}
  ${p(`deine Auswertung für <strong>${e(domain)}</strong> ist da. Beim ersten Blick auf ${siteRef(company)} fällt auf: ${e(AREA_OBSERVATION[weakest.id])}`)}
  ${p(e(AREA_WHY[weakest.id]))}

  ${h("Gesamtwert")}
  <p style="margin:0 0 14px;font-size:34px;font-weight:700;color:#1a1a17;">${result.overallScore}<span style="font-size:15px;font-weight:400;${muted}"> / 100 · ${e(result.overallStatus)}</span></p>

  ${h("Die wichtigsten Lücken")}
  <ul style="margin:0 0 14px;padding-left:18px;">${gapsHtml}</ul>

  ${h(AI_SECTION_TITLE)}
  ${p(e(aiSectionIntro(result.aiAnswerChecks)))}
  ${questionsHtml}

  ${h("Was wir gesehen haben")}
  <ul style="margin:14px 0 14px;padding-left:18px;">${seenHtml}</ul>

  ${p(`Ich würde als Nächstes vor allem auf ${e(AREA_HUMAN[weakest.id])} schauen. Da wird aus Sichtbarkeit meistens ein klarer nächster Schritt.`)}
  ${p("Ich melde mich, dann gehen wir das gemeinsam durch.")}

  <p style="margin:24px 0 0;padding:14px 16px;background:#f6f5f0;border-left:2px solid #c8c6bb;font-size:12.5px;line-height:1.6;${muted}">${e(AI_DISCLAIMER)}</p>

  <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#2a2a26;">Liebe Grüße<br/>Elana<br/>SEESZN</p>
</div></body></html>`;
}

// ── internal lead intelligence email ─────────────────────────────────────────────
// A premium, conversion-oriented briefing for the SEESZN team — not a raw tool log.
// Sent as proper HTML (buildLeadEmailHtml) with a clean plain-text fallback
// (buildLeadEmailText). No raw JSON, no ISO timestamps, no [ok] markers in the body.

export interface LeadEmailInput {
  email: string;
  name: string;
  note: string;
  locale: string;
  freemail: boolean;
  result?: ScanResult;
}

function weakestCard(result: ScanResult): ScoreCard {
  return [...result.scores].sort((a, b) => a.score - b.score)[0];
}

/** Human, unambiguous, no raw ISO. UTC keeps it deterministic across servers. */
function humanDate(date = new Date()): string {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
  return `${formatted} UTC`;
}

// Commercial reading for the hero — German, team-facing, by score band.
function commercialReadingDe(overall: number): string {
  if (overall >= 85) {
    return "Das ist kein kalter Education-Lead. Die Seite hat bereits eine sichtbare Grundlage. Das Gespräch sollte nicht erklären, warum Sichtbarkeit wichtig ist, sondern zeigen, wo sie noch zu schmal ist.";
  }
  if (overall >= 65) {
    return "Die Seite hat genug Substanz, um das Problem sofort greifbar zu machen. Der Lead muss nicht erst davon überzeugt werden, dass Sichtbarkeit wichtig ist. Der nächste Schritt ist, die Lücke in ein klares erstes Projekt zu übersetzen.";
  }
  return "Die Seite braucht zuerst mehr Klarheit, Vertrauen und Struktur. Der beste Einstieg ist kein großes AI-Versprechen, sondern eine sichtbare Grundlage, die Käufer und Suchsysteme verstehen.";
}

// "Elanas Einschätzung" — warm, practical, per weakest area. German.
const ELANA_ANGLE: Record<CategoryId, string> = {
  conversionSurface: "Sichtbarkeit bringt wenig, wenn der nächste Schritt nicht klar ist. Bei dieser Seite ist der stärkste Ansatz, den Weg von Interesse zu Anfrage ruhiger und eindeutiger zu machen: weniger Suchen, klarere Belege, ein nächster Schritt, der sofort verständlich ist.",
  sourceSurface: "Die Seite ist grundsätzlich lesbar, aber sie liefert noch zu wenig Substanz, auf die Google, KI-Systeme oder Käufer wirklich gut zurückgreifen können. Der stärkste Ansatz ist, die wichtigsten Fragen klarer zu beantworten und die Seite stärker als Quelle aufzubauen.",
  entityClarity: "Die Richtung ist erkennbar, aber die Marke wird noch nicht schnell genug als eindeutiger Anbieter greifbar. Der stärkste Ansatz ist, Angebot, Kategorie und Absender so zu schärfen, dass man schneller versteht, wofür die Marke steht.",
  answerReadiness: "Die Grundlage ist da, aber die Seite beantwortet noch zu wenige echte Käuferfragen konkret genug. Der stärkste Ansatz ist, aus vorhandenen Seiten bessere Antworten zu machen: klarer, spezifischer, leichter zitierbar.",
  technicalTrust: "Inhaltlich ist schon etwas da, aber die technischen Signale sollten sauberer abgesichert werden. Der stärkste Ansatz ist, Struktur, Daten und Performance so zu stabilisieren, dass gute Inhalte nicht unnötig ausgebremst werden.",
  indexierbarkeit: "Die Seite ist auffindbar, aber die Struktur wirkt noch nicht konsequent genug. Der stärkste Ansatz ist, die wichtigsten Einstiege klarer indexierbar und besser miteinander verbunden zu machen.",
};

// Suggested-reply inserts — the draft must read like a real, warm Hamburg
// marketing person wrote it, no agency buzzwords.
const REPLY_OBSERVATION: Record<CategoryId, string> = {
  conversionSurface: "der Weg von Interesse zu Anfrage ist noch nicht klar genug.",
  sourceSurface: "die Seite liefert noch zu wenig Substanz, auf die Google oder KI-Systeme wirklich gut zurückgreifen können.",
  entityClarity: "man versteht noch nicht schnell genug, wer genau dahintersteht, wofür die Marke steht und warum sie in der Kategorie relevant ist.",
  answerReadiness: "die Seite beantwortet noch zu wenige Fragen so konkret, dass man sie wirklich als gute Antwort nutzen würde.",
  technicalTrust: "die technischen Signale sollten sauberer abgesichert werden.",
  indexierbarkeit: "die Struktur ist noch nicht konsequent genug aufgebaut.",
};

const REPLY_WHY: Record<CategoryId, string> = {
  conversionSurface: "Gerade bei einem erklärungsbedürftigen Angebot müssen Besucher schnell verstehen, warum sie euch vertrauen sollen, was genau passiert und was sie als Nächstes tun können.",
  sourceSurface: "Es geht also nicht darum, einfach mehr Text auf die Seite zu packen. Spannender ist, die wichtigsten Fragen besser zu beantworten und mit klaren Beispielen, Belegen und Vergleichspunkten zu stützen.",
  entityClarity: "Das ist wichtig, weil Suchsysteme und Käufer beide Klarheit brauchen. Wenn die Marke nicht eindeutig eingeordnet wird, wirkt selbst ein gutes Angebot schneller austauschbar.",
  answerReadiness: "Gerade für KI-Sichtbarkeit reicht es nicht, nur sichtbar zu sein. Die Seite muss Fragen so beantworten, dass sie verständlich, hilfreich und zitierbar wirkt.",
  technicalTrust: "Das klingt trocken, ist aber wichtig: Wenn Struktur, Daten und Performance nicht stabil sind, wird guter Inhalt unnötig ausgebremst.",
  indexierbarkeit: "Relevante Inhalte können nur wirken, wenn Suchsysteme sie eindeutig finden, verstehen und einordnen können.",
};

const REPLY_NEXT: Record<CategoryId, string> = {
  conversionSurface: "die Startseite, die Belege und den Weg zur Anfrage",
  sourceSurface: "die wichtigsten Inhalte, fehlende Fragen und die Stellen, an denen die Seite als Quelle noch zu dünn wirkt",
  entityClarity: "die Positionierung, die Startseite und die Signale, die die Marke eindeutiger machen",
  answerReadiness: "die wichtigsten Käuferfragen, Antwortabschnitte und fehlenden Erklärungen",
  technicalTrust: "die technischen Grundlagen, strukturierte Daten und die Stellen, an denen Vertrauen verloren gehen kann",
  indexierbarkeit: "die Seitenstruktur, interne Verlinkung und die wichtigsten auffindbaren Einstiege",
};

// Suggested first reply — reads as if Elana personally wrote it. Inside this
// internal draft she may say "ich habe mir die Auswertung angesehen".
function suggestedReply(locale: string, firstName: string | null, domain: string, weakest: ScoreCard): string {
  if (locale === "en") {
    return [
      firstName ? `Hi ${firstName},` : "Hi,",
      "",
      `I looked at the diagnosis for ${domain}. The direction is already clear, which is exactly why the next gap matters: ${HUMAN_AREA_LABEL[weakest.id]} is where the biggest improvement sits right now.`,
      "",
      "I would start there, since that is usually where visibility turns into a clearer next step for buyers.",
      "",
      "Best,",
      "Elana",
    ].join("\n");
  }
  return [
    greetingDe(firstName),
    "",
    `ich habe mir die Auswertung für ${domain} angesehen. Man erkennt schon, worum es geht, und genau deshalb wird die nächste Lücke interessant: ${REPLY_OBSERVATION[weakest.id]}`,
    "",
    REPLY_WHY[weakest.id],
    "",
    `Ich würde mir deshalb vor allem ${REPLY_NEXT[weakest.id]} anschauen. Da liegt wahrscheinlich der größte Hebel.`,
    "",
    "Liebe Grüße",
    "Elana",
  ].join("\n");
}

function leadAiStatus(check: AiAnswerCheck): string {
  if (!check.checked) return "Prüfset erstellt";
  return check.status === "gefunden" ? "Marke sichtbar" : "Marke nicht gefunden";
}

function leadAiInterpretation(check: AiAnswerCheck, locale: string): string {
  if (check.checked) return check.interpretation;
  return locale === "de"
    ? "Diese Frage wurde ins Prüfset aufgenommen. Der Live-Antwortcheck ist für diesen Scan noch nicht aktiv, aber die Frage zeigt eine kommerziell relevante Antwortfläche."
    : "This question was added to the test set. Live answer checks are not active for this scan yet, but the question shows a commercially relevant answer surface.";
}

export function leadEmailSubject(domain: string, result?: ScanResult): string {
  if (result) {
    return `SEESZN Lead Briefing: ${domain} · ${result.overallScore}/100 · ${HUMAN_AREA_LABEL[weakestCard(result).id]}`;
  }
  return domain ? `SEESZN Lead Briefing: ${domain}` : "SEESZN Lead Briefing";
}

export function buildLeadEmailText({ email, name, note, locale, freemail, result }: LeadEmailInput): string {
  const firstName = getFirstName(name);
  const lines: string[] = [];
  // A. Brand
  lines.push("SEESZN");
  lines.push("Lead Briefing");
  lines.push("");

  // Internal details block — kept at the very bottom only.
  const internalDetails = () => {
    lines.push("");
    lines.push("INTERNE DETAILS");
    if (name) lines.push(`Name: ${name}`);
    lines.push(`Email: ${email}`);
    lines.push(`Company email: ${freemail ? "no" : "yes"}`);
    lines.push(`Language: ${locale}`);
    lines.push(`Submitted: ${humanDate()}`);
    lines.push("Source: Diagnosis intake");
    if (note) lines.push(`Note: ${note}`);
    lines.push("");
    lines.push("Elana");
    lines.push("SEESZN Intake");
    lines.push("");
    lines.push("Internes Briefing aus dem Diagnosis Intake. Kein vollständiges Audit.");
  };

  if (!result) {
    lines.push("Neue Diagnose-Anfrage");
    if (name) lines.push(`Name: ${name}`);
    lines.push(`Kontakt: ${email}`);
    internalDetails();
    return lines.join("\n");
  }

  const weakest = weakestCard(result);
  const humanWeakest = HUMAN_AREA_LABEL[weakest.id];
  const anyLive = result.aiAnswerChecks.some((c) => c.checked);

  // B. Hero
  lines.push("Neue Diagnose-Anfrage");
  lines.push(result.domain);
  lines.push(`${result.overallScore}/100 · ${result.overallStatus}`);
  lines.push(`Hauptlücke: ${humanWeakest} · ${weakest.score}/100`);
  lines.push("");
  lines.push(commercialReadingDe(result.overallScore));
  lines.push("");

  // C. Contact mini row
  if (name) lines.push(`Name: ${name}`);
  lines.push(`Kontakt: ${email}`);
  lines.push("");

  // D. Elanas Einschätzung
  lines.push("ELANAS EINSCHÄTZUNG");
  lines.push(ELANA_ANGLE[weakest.id]);
  lines.push("");

  // E. Vorschlag für Elanas Antwort
  lines.push("VORSCHLAG FÜR ELANAS ANTWORT");
  lines.push(suggestedReply(locale, firstName, result.domain, weakest));
  lines.push("");

  // F. Kurze Diagnose
  lines.push("KURZE DIAGNOSE");
  lines.push(`${result.overallScore}/100 · ${result.overallStatus}`);
  lines.push(`Hauptlücke: ${humanWeakest} · ${weakest.score}/100`);
  lines.push(result.finding);
  lines.push("");
  [...result.scores]
    .sort((a, b) => a.score - b.score)
    .forEach((s) => {
      lines.push(`${HUMAN_AREA_LABEL[s.id]} · ${s.score}/100`);
      lines.push(AREA_SHORT_STEP[s.id]);
    });

  // G. Technischer Anhang (quiet, lower priority)
  lines.push("");
  lines.push("TECHNISCHER ANHANG");
  result.observations.forEach((o) => lines.push(`${o.label}: ${o.value}`));
  if (anyLive) {
    result.aiAnswerChecks.forEach((c, i) => {
      lines.push(`${i + 1}. ${c.question}: ${leadAiStatus(c)}`);
      if (c.ownDomainFound && typeof c.ownDomainPosition === "number") {
        lines.push(`   Eigene Domain: Position ${c.ownDomainPosition}`);
      }
      const dl = domainsLine(c);
      if (dl) lines.push(`   Sichtbares Webumfeld: ${dl}`);
      lines.push(`   ${leadAiInterpretation(c, locale)}`);
    });
  } else {
    lines.push("KI-Antwortflächen: Prüfset erstellt, Live-Check nicht aktiv.");
  }

  // H + I. Internal details + signature (bottom)
  internalDetails();
  return lines.join("\n");
}

export function buildLeadEmailHtml({ email, name, note, locale, freemail, result }: LeadEmailInput): string {
  const e = escapeHtml;
  const domain = result?.domain ?? "";
  const firstName = getFirstName(name);

  // Email-safe building blocks (all styles inline).
  const eyebrow = (t: string) =>
    `<p style="margin:0 0 12px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9a9486;font-weight:700;">${t}</p>`;
  const card = (inner: string) =>
    `<div style="background:#ffffff;border:1px solid #e6e4dc;border-radius:10px;padding:24px 22px;margin:0 0 14px;">${inner}</div>`;
  const para = (t: string) =>
    `<p style="margin:0;font-size:14px;line-height:1.62;color:#45423b;">${t}</p>`;
  const snapRow = (label: string, value: string) =>
    `<tr><td style="padding:7px 16px 7px 0;font-size:12px;color:#8a8478;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:7px 0;font-size:14px;color:#1a1a17;line-height:1.45;">${value}</td></tr>`;
  const detailRow = (label: string, value: string) =>
    `<tr><td style="padding:4px 14px 4px 0;font-size:10.5px;color:#a8a294;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:4px 0;font-size:11px;color:#8a8478;line-height:1.4;">${value}</td></tr>`;

  const brandStrip = `<div style="padding:0 4px 18px;">
    <div style="font-size:12px;letter-spacing:0.24em;font-weight:700;color:#1a1a17;">SEESZN</div>
    <div style="margin-top:4px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9a9486;">Lead Briefing</div>
  </div>`;

  // H. Internal details — muted, bottom only.
  const detailsCard = `<div style="padding:10px 6px 0;">
    ${eyebrow("Interne Details")}
    <table role="presentation" style="width:100%;border-collapse:collapse;">
      ${name ? detailRow("Name", e(name)) : ""}
      ${detailRow("Email", e(email))}
      ${detailRow("Company email", freemail ? "no" : "yes")}
      ${detailRow("Language", e(locale))}
      ${detailRow("Submitted", e(humanDate()))}
      ${detailRow("Source", "Diagnosis intake")}
      ${note ? detailRow("Note", e(note)) : ""}
    </table>
  </div>`;

  // I. Signature
  const footer = `<div style="padding:16px 6px 6px;">
    <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a17;">Elana</p>
    <p style="margin:2px 0 0;font-size:12px;color:#8a8478;">SEESZN Intake</p>
    <p style="margin:16px 0 0;font-size:11px;line-height:1.55;color:#a8a294;">Internes Briefing aus dem Diagnosis Intake. Kein vollständiges Audit.</p>
  </div>`;

  // No scan attached (rare edge case): keep it short.
  if (!result) {
    const preheaderMin = `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f4f3ee;opacity:0;">${e("Neue Diagnose-Anfrage.")}</div>`;
    const miniCard = card(eyebrow("Neue Diagnose-Anfrage") + para(`${name ? `Name: ${e(name)}<br/>` : ""}Kontakt: ${e(email)}`));
    return wrapLeadHtml(locale, preheaderMin, brandStrip + miniCard + detailsCard + footer);
  }

  const weakest = weakestCard(result);
  const humanWeakest = HUMAN_AREA_LABEL[weakest.id];
  const anyLive = result.aiAnswerChecks.some((c) => c.checked);

  const preheader = `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f4f3ee;opacity:0;">${e(`Neue Diagnose-Anfrage. Hauptlücke: ${humanWeakest}.`)}</div>`;

  // B. Hero
  const hero = `<div style="background:#ffffff;border:1px solid #e6e4dc;border-top:3px solid #1a1a17;border-radius:10px;padding:26px 22px;margin:0 0 14px;">
    ${eyebrow("Neue Diagnose-Anfrage")}
    <div style="font-size:26px;font-weight:700;color:#1a1a17;line-height:1.15;word-break:break-word;">${e(domain)}</div>
    <div style="margin-top:10px;font-size:15px;color:#45423b;"><strong style="color:#1a1a17;">${result.overallScore}/100</strong> · ${e(result.overallStatus)}</div>
    <div style="margin-top:4px;font-size:13px;color:#8a8478;">Hauptlücke: ${e(humanWeakest)} · ${weakest.score}/100</div>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.62;color:#45423b;">${e(commercialReadingDe(result.overallScore))}</p>
  </div>`;

  // C. Contact mini row
  const contactCard = card(
    eyebrow("Kontakt") +
      `<table role="presentation" style="width:100%;border-collapse:collapse;">
        ${name ? snapRow("Name", e(name)) : ""}
        ${snapRow("Kontakt", e(email))}
      </table>`,
  );

  // D. Elanas Einschätzung
  const angleCard = card(eyebrow("Elanas Einschätzung") + para(e(ELANA_ANGLE[weakest.id])));

  // E. Vorschlag für Elanas Antwort
  const replyHtml = e(suggestedReply(locale, firstName, domain, weakest)).replace(/\n/g, "<br/>");
  const replyCard = card(
    eyebrow("Vorschlag für Elanas Antwort") +
      `<div style="background:#faf9f5;border:1px solid #ecebe3;border-radius:8px;padding:18px;font-size:13.5px;line-height:1.62;color:#2f2c26;">${replyHtml}</div>`,
  );

  // F. Kurze Diagnose
  const scoreRows = [...result.scores]
    .sort((a, b) => a.score - b.score)
    .map(
      (s) =>
        `<div style="padding:12px 0;border-top:1px solid #efeee8;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a17;">${e(HUMAN_AREA_LABEL[s.id])} · ${s.score}/100</p>
          <p style="margin:4px 0 0;font-size:13px;line-height:1.5;color:#6f6a5f;">${e(AREA_SHORT_STEP[s.id])}</p>
        </div>`,
    )
    .join("");
  const summaryCard = card(
    eyebrow("Kurze Diagnose") +
      `<p style="margin:0 0 4px;font-size:14px;color:#1a1a17;"><strong>${result.overallScore}/100</strong> · ${e(result.overallStatus)}</p>
       <p style="margin:0 0 4px;font-size:13px;color:#8a8478;">Hauptlücke: ${e(humanWeakest)} · ${weakest.score}/100</p>
       <p style="margin:0 0 6px;font-size:13.5px;line-height:1.55;color:#45423b;">${e(result.finding)}</p>
       ${scoreRows}`,
  );

  // G. Technischer Anhang — quiet, lower priority. AI only expands when live.
  const signalRows = result.observations
    .map(
      (o) =>
        `<tr><td style="padding:6px 16px 6px 0;font-size:11.5px;color:#9a9486;vertical-align:top;white-space:nowrap;">${e(o.label)}</td><td style="padding:6px 0;font-size:12px;color:#6f6a5f;line-height:1.45;">${e(o.value)}</td></tr>`,
    )
    .join("");
  const aiAppendix = anyLive
    ? result.aiAnswerChecks
        .map(
          (c, i) =>
            `<p style="margin:8px 0 0;font-size:11.5px;color:#6f6a5f;line-height:1.5;">${i + 1}. ${e(c.question)} · ${e(leadAiStatus(c))}${c.ownDomainFound && typeof c.ownDomainPosition === "number" ? ` · Position ${c.ownDomainPosition}` : ""}<br/><span style="color:#9a9486;">${e(leadAiInterpretation(c, locale))}</span></p>`,
        )
        .join("")
    : `<p style="margin:12px 0 0;font-size:11.5px;color:#9a9486;line-height:1.5;">KI-Antwortflächen: Prüfset erstellt, Live-Check nicht aktiv.</p>`;
  const appendixCard = `<div style="background:#faf9f5;border:1px solid #ecebe3;border-radius:10px;padding:20px;margin:0 0 14px;">
    ${eyebrow("Technischer Anhang")}
    <table role="presentation" style="width:100%;border-collapse:collapse;">${signalRows}</table>
    ${aiAppendix}
  </div>`;

  const body =
    brandStrip + hero + contactCard + angleCard + replyCard + summaryCard + appendixCard + detailsCard + footer;
  return wrapLeadHtml(locale, preheader, body);
}

/** Outer shell: off-white canvas, centered 640px column, system fonts. */
function wrapLeadHtml(locale: string, preheader: string, body: string): string {
  const lang = locale === "de" ? "de" : "en";
  return `<!doctype html><html lang="${lang}"><body style="margin:0;padding:0;background:#f4f3ee;">
${preheader}
<div style="background:#f4f3ee;padding:24px 14px;">
  <div style="max-width:640px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#45423b;">
    ${body}
  </div>
</div></body></html>`;
}
