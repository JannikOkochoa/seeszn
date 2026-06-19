// ─── Web-Signalcheck — optional Google Custom Search provider ──────────────────
// For each of the three KI-Antwortfragen we may run exactly one Google Custom
// Search query (three total per scan, never more). This is a Web-Signalcheck of
// the visible web surface at the time of the scan — not a live ChatGPT, Gemini,
// Perplexity or Google AI Overview ranking. If the provider is "none", missing or
// failing, we still return the three questions as a Prüfset with checked=false.

import { generateAiQuestions, interpretCheck, leakTypeFor } from "./aiQuestions";
import type { AiAnswerCheck, AiAnswerQuestion, Locale, RawSignals, VisibleDomain } from "./types";

type Provider = "none" | "google_cse";

function resolveProvider(): Provider {
  const p = (process.env.AI_ANSWER_PROVIDER || "none").trim().toLowerCase();
  if (p === "google_cse" && process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_CX) {
    return "google_cse";
  }
  return "none";
}

function rootDomain(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

/** A result domain looks like a competitor when it is neither the own domain nor a
 *  generic aggregator / directory / social surface. Transparent, lightweight list. */
const GENERIC_HOSTS = new Set([
  "wikipedia.org", "youtube.com", "facebook.com", "instagram.com", "linkedin.com",
  "x.com", "twitter.com", "tiktok.com", "reddit.com", "amazon.de", "amazon.com",
  "google.com", "yelp.com", "trustpilot.com", "provenexpert.com", "gelbeseiten.de",
  "11880.com", "kununu.com", "xing.com", "pinterest.com", "medium.com",
]);

function isCompetitor(domain: string, ownRoot: string): boolean {
  if (domain === ownRoot) return false;
  // Strip the registrable suffix for the generic check.
  return ![...GENERIC_HOSTS].some((g) => domain === g || domain.endsWith(`.${g}`));
}

interface CseItem {
  link?: string;
  title?: string;
  displayLink?: string;
}

async function runCseQuery(query: string): Promise<VisibleDomain[]> {
  const api = new URL("https://www.googleapis.com/customsearch/v1");
  api.searchParams.set("key", process.env.GOOGLE_CSE_API_KEY!);
  api.searchParams.set("cx", process.env.GOOGLE_CSE_CX!);
  api.searchParams.set("q", query);
  api.searchParams.set("num", "10");
  api.searchParams.set("hl", "de");
  api.searchParams.set("gl", "de");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(api.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: CseItem[] };
    const items = data.items ?? [];
    const out: VisibleDomain[] = [];
    items.forEach((item, i) => {
      const link = item.link || (item.displayLink ? `https://${item.displayLink}` : "");
      if (!link) return;
      try {
        const domain = rootDomain(new URL(link).hostname);
        out.push({ domain, title: item.title?.slice(0, 120), position: i + 1 });
      } catch {
        /* skip unparseable result */
      }
    });
    return out;
  } catch {
    clearTimeout(timer);
    return [];
  }
}

function unchecked(q: AiAnswerQuestion, locale: Locale): AiAnswerCheck {
  return {
    question: q.question,
    kind: q.kind,
    provider: "none",
    checked: false,
    label: "Nicht live geprüft",
    ownDomainFound: false,
    visibleDomains: [],
    visibleCompetitors: [],
    status: "nicht_geprueft",
    leakType: undefined,
    interpretation: interpretCheck(q.kind, false, false, locale),
  };
}

export interface AiAnswers {
  questions: string[];
  checks: AiAnswerCheck[];
}

/**
 * Generate the three KI-Antwortfragen and, if a provider is configured, run the
 * three-query Web-Signalcheck. Never throws: any failure degrades to checked=false.
 */
export async function buildAiAnswers(
  domain: string,
  signals: RawSignals,
  locale: Locale,
): Promise<AiAnswers> {
  const questions = generateAiQuestions(domain, signals);
  const provider = resolveProvider();

  if (provider === "none") {
    return {
      questions: questions.map((q) => q.question),
      checks: questions.map((q) => unchecked(q, locale)),
    };
  }

  const ownRoot = rootDomain(domain);
  // Exactly three queries, one per question. No more.
  const resultSets = await Promise.all(questions.map((q) => runCseQuery(q.question)));

  const checks: AiAnswerCheck[] = questions.map((q, i) => {
    const results = resultSets[i];
    if (results.length === 0) return unchecked(q, locale);

    const ownHit = results.find((r) => r.domain === ownRoot);
    const ownDomainFound = !!ownHit;
    const visibleDomains = dedupeByDomain(results).slice(0, 5);
    const visibleCompetitors = dedupeByDomain(results.filter((r) => isCompetitor(r.domain, ownRoot))).slice(0, 5);

    return {
      question: q.question,
      kind: q.kind,
      provider: "google_cse",
      checked: true,
      label: "Web-Signalcheck",
      ownDomainFound,
      ownDomainPosition: ownHit?.position,
      visibleDomains,
      visibleCompetitors,
      status: ownDomainFound ? "gefunden" : "nicht_gefunden",
      leakType: leakTypeFor(q.kind, ownDomainFound, true),
      interpretation: interpretCheck(q.kind, ownDomainFound, true, locale),
    };
  });

  return { questions: questions.map((q) => q.question), checks };
}

function dedupeByDomain(list: VisibleDomain[]): VisibleDomain[] {
  const seen = new Set<string>();
  const out: VisibleDomain[] = [];
  for (const item of list) {
    if (seen.has(item.domain)) continue;
    seen.add(item.domain);
    out.push(item);
  }
  return out;
}
