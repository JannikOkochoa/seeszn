// ─── Sichtbarkeitsprüfung — email content ──────────────────────────────────────
// Builds the personal automatic user email (from Tobias) and the internal lead
// email from a scan result. The user email reads like a personal note, not a
// dashboard export: no JSON dumps, calm and direct. Every user-controlled value
// is escaped before it touches the HTML. German, premium, no long dashes.

import type { AiAnswerCheck, ScanResult } from "@/lib/scan/types";

// Mandatory disclaimer — identical wording in email and UI.
export const AI_DISCLAIMER =
  "Diese Auswertung ist ein Web-Signalcheck rund um Fragen, bei denen KI-Systeme deine Marke nennen müssten. Sie ist kein dauerhaftes Ranking in ChatGPT, Gemini, Perplexity oder Google AI Overviews.";

const AI_SECTION_TITLE = "Fragen, bei denen KI-Systeme deine Marke nennen müssten";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function firstNameFrom(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first.length > 1 && first.length <= 40 ? first : "";
}

function statusWord(check: AiAnswerCheck): string {
  if (!check.checked) return "Nicht live geprüft";
  return check.status === "gefunden" ? "Marke sichtbar" : "Marke nicht gefunden";
}

function domainsLine(check: AiAnswerCheck): string {
  const list = check.visibleCompetitors.length ? check.visibleCompetitors : check.visibleDomains;
  if (!list.length) return "";
  return list.slice(0, 5).map((d) => d.domain).join(", ");
}

// ── plain-text question block (shared by user + lead text) ──────────────────────

function questionTextBlock(checks: AiAnswerCheck[]): string[] {
  const lines: string[] = [];
  checks.forEach((c, i) => {
    lines.push(`${i + 1}. ${c.question}`);
    lines.push(`   Status: ${statusWord(c)} (${c.label})`);
    if (c.checked && c.ownDomainFound && typeof c.ownDomainPosition === "number") {
      lines.push(`   Position der eigenen Domain: ${c.ownDomainPosition}`);
    }
    const dl = domainsLine(c);
    if (dl) lines.push(`   Sichtbares Webumfeld: ${dl}`);
    if (c.leakType) lines.push(`   Einordnung: ${c.leakType}`);
    lines.push(`   ${c.interpretation}`);
    lines.push("");
  });
  return lines;
}

// ── user email (personal, from Tobias) ──────────────────────────────────────────

export interface UserEmailInput {
  firstName: string;
  domain: string;
  result: ScanResult;
}

export function userEmailSubject(domain: string): string {
  return `Deine SEESZN Auswertung für ${domain}`;
}

export function buildUserEmailText({ firstName, domain, result }: UserEmailInput): string {
  const weakest = [...result.scores].sort((a, b) => a.score - b.score).slice(0, 3);
  const greeting = firstName ? `Hi ${firstName},` : "Hallo,";
  const parts: string[] = [
    greeting,
    "",
    `deine Sichtbarkeitsprüfung für ${domain} liegt vor.`,
    "",
    "Ich habe die sichtbaren Signale deiner Website geprüft und daraus eine erste Einordnung erstellt: Wie klar versteht eine Maschine, wer du bist, wofür du relevant bist und bei welchen Antworten deine Marke auftauchen müsste?",
    "",
    `Gesamtwert: ${result.overallScore}/100 (${result.overallStatus})`,
    "",
    "Erste Einordnung:",
    result.finding,
    "",
    "Die wichtigsten Lücken:",
    ...weakest.map((c) => `- ${c.label} (${c.score}/100): ${c.nextStep}`),
    "",
    AI_SECTION_TITLE,
    "",
    ...questionTextBlock(result.aiAnswerChecks),
    "Was wir gesehen haben:",
    ...result.observations.slice(0, 8).map((o) => `- ${o.label}: ${o.value}`),
    "",
    "Was das bedeutet:",
    result.meaning,
    "",
    "Nächster sinnvoller Schritt:",
    result.nextStep,
    "",
    "Ich prüfe die Einordnung zusätzlich manuell und melde mich mit einer persönlichen Rückmeldung.",
    "",
    AI_DISCLAIMER,
    "",
    "Beste Grüße",
    "Tobias",
    "SEESZN",
  ];
  return parts.join("\n");
}

export function buildUserEmailHtml({ firstName, domain, result }: UserEmailInput): string {
  const e = escapeHtml;
  const weakest = [...result.scores].sort((a, b) => a.score - b.score).slice(0, 3);
  const greeting = firstName ? `Hi ${e(firstName)},` : "Hallo,";

  const muted = "color:#6b6b63;";
  const h = (t: string) =>
    `<p style="margin:28px 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;color:#1a1a17;">${t}</p>`;
  const p = (t: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#2a2a26;">${t}</p>`;

  const questionsHtml = result.aiAnswerChecks
    .map((c, i) => {
      const rows: string[] = [];
      rows.push(
        `<p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#1a1a17;">${i + 1}. ${e(c.question)}</p>`,
      );
      rows.push(
        `<p style="margin:0 0 4px;font-size:13px;${muted}">Status: ${e(statusWord(c))} · ${e(c.label)}</p>`,
      );
      if (c.checked && c.ownDomainFound && typeof c.ownDomainPosition === "number") {
        rows.push(`<p style="margin:0 0 4px;font-size:13px;${muted}">Position der eigenen Domain: ${c.ownDomainPosition}</p>`);
      }
      const dl = domainsLine(c);
      if (dl) rows.push(`<p style="margin:0 0 4px;font-size:13px;${muted}">Sichtbares Webumfeld: ${e(dl)}</p>`);
      if (c.leakType) rows.push(`<p style="margin:0 0 4px;font-size:13px;${muted}">Einordnung: ${e(c.leakType)}</p>`);
      rows.push(`<p style="margin:0 0 0;font-size:14px;line-height:1.6;color:#2a2a26;">${e(c.interpretation)}</p>`);
      return `<div style="padding:16px 0;border-bottom:1px solid #ecebe5;">${rows.join("")}</div>`;
    })
    .join("");

  const gapsHtml = weakest
    .map((c) => `<li style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#2a2a26;">${e(c.label)} (${c.score}/100): ${e(c.nextStep)}</li>`)
    .join("");

  const seenHtml = result.observations
    .slice(0, 8)
    .map((o) => `<li style="margin:0 0 6px;font-size:14px;line-height:1.55;color:#2a2a26;">${e(o.label)}: ${e(o.value)}</li>`)
    .join("");

  return `<!doctype html><html lang="de"><body style="margin:0;background:#f6f5f0;padding:24px;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6e5dd;padding:36px 32px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  ${p(greeting)}
  ${p(`deine Sichtbarkeitsprüfung für <strong>${e(domain)}</strong> liegt vor.`)}
  ${p("Ich habe die sichtbaren Signale deiner Website geprüft und daraus eine erste Einordnung erstellt: Wie klar versteht eine Maschine, wer du bist, wofür du relevant bist und bei welchen Antworten deine Marke auftauchen müsste?")}

  ${h("Gesamtwert")}
  <p style="margin:0 0 14px;font-size:34px;font-weight:700;color:#1a1a17;">${result.overallScore}<span style="font-size:15px;font-weight:400;${muted}"> / 100 · ${e(result.overallStatus)}</span></p>

  ${h("Erste Einordnung")}
  ${p(e(result.finding))}

  ${h("Die wichtigsten Lücken")}
  <ul style="margin:0 0 14px;padding-left:18px;">${gapsHtml}</ul>

  ${h(AI_SECTION_TITLE)}
  ${questionsHtml}

  ${h("Was wir gesehen haben")}
  <ul style="margin:0 0 14px;padding-left:18px;">${seenHtml}</ul>

  ${h("Was das bedeutet")}
  ${p(e(result.meaning))}

  ${h("Nächster sinnvoller Schritt")}
  ${p(e(result.nextStep))}

  ${p("Ich prüfe die Einordnung zusätzlich manuell und melde mich mit einer persönlichen Rückmeldung.")}

  <p style="margin:24px 0 0;padding:14px 16px;background:#f6f5f0;border-left:2px solid #c8c6bb;font-size:12.5px;line-height:1.6;${muted}">${e(AI_DISCLAIMER)}</p>

  <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#2a2a26;">Beste Grüße<br/>Tobias<br/>SEESZN</p>
</div></body></html>`;
}

// ── internal lead email ──────────────────────────────────────────────────────────

export interface LeadEmailInput {
  email: string;
  name: string;
  note: string;
  locale: string;
  freemail: boolean;
  result?: ScanResult;
}

export function leadEmailSubject(domain: string, overallScore: number | null): string {
  if (domain && overallScore !== null) {
    return `Neue Sichtbarkeitsprüfung: ${domain} (${overallScore}/100)`;
  }
  return domain ? `Neue Sichtbarkeitsprüfung: ${domain}` : "Neue Sichtbarkeitsprüfung";
}

export function buildLeadEmailText({ email, name, note, locale, freemail, result }: LeadEmailInput): string {
  const lines: string[] = [];
  lines.push("Neue Sichtbarkeitsprüfung");
  lines.push("");
  if (result) lines.push(`Domain: ${result.domain}`);
  lines.push(`E-Mail: ${email}`);
  if (name) lines.push(`Name: ${name}`);
  if (note) lines.push(`Notiz: ${note}`);
  lines.push(`Firmendomain: ${freemail ? "nein (Freemail)" : "ja"}`);
  lines.push(`Locale: ${locale}`);
  lines.push(`Zeitpunkt: ${new Date().toISOString()}`);
  lines.push("Quelle: sichtbarkeitspruefung");

  if (result) {
    lines.push("");
    lines.push(`Gesamtwert: ${result.overallScore}/100 (${result.overallStatus})`);
    lines.push(`Lücken (schwach): ${result.gapCount}`);
    lines.push(`Erste Einordnung: ${result.finding}`);
    lines.push("");
    lines.push("── Bereiche (schwächste zuerst) ──");
    [...result.scores]
      .sort((a, b) => a.score - b.score)
      .forEach((s) => lines.push(`- ${s.label}: ${s.score}/100 (${s.status}) -> ${s.nextStep}`));

    lines.push("");
    lines.push("── Beobachtete Signale ──");
    result.observations.forEach((o) =>
      lines.push(`- ${o.label}: ${o.value} [${o.ok === null ? "n/a" : o.ok ? "ok" : "schwach"}]`),
    );

    lines.push("");
    lines.push(`── ${AI_SECTION_TITLE} ──`);
    lines.push("");
    lines.push(...questionTextBlock(result.aiAnswerChecks));

    // Suggested follow-up angle: the weakest area drives the personal reply.
    const weakest = [...result.scores].sort((a, b) => a.score - b.score)[0];
    lines.push(`Follow-up-Ansatz: Einstieg über ${weakest.label} (${weakest.score}/100).`);

    lines.push("");
    lines.push("── Kompakte JSON-Zusammenfassung ──");
    lines.push(
      JSON.stringify({
        domain: result.domain,
        overall: result.overallScore,
        status: result.overallStatus,
        scores: result.scores.map((s) => ({ id: s.id, score: s.score })),
        aiChecks: result.aiAnswerChecks.map((c) => ({
          q: c.question,
          status: c.status,
          ownFound: c.ownDomainFound,
          leak: c.leakType,
        })),
      }),
    );
  }

  lines.push("");
  lines.push("── Web-Signalcheck Hinweis ──");
  lines.push(AI_DISCLAIMER);
  return lines.join("\n");
}
