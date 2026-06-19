// ─── KI-Antwortfragen — heuristic generator ───────────────────────────────────
// Generates exactly three German AI-style questions from the surface signals we
// already collected. These are questions where a clearly understood, well sourced
// brand should appear in an AI answer. They are not generic SEO keywords and they
// are not a ranking. Industry detection is a transparent, lightweight keyword map.

import type { AiAnswerQuestion, AiQuestionKind, Locale, RawSignals } from "./types";

// ── brand-name detection ───────────────────────────────────────────────────────
// Prefer the explicit og:site_name, then a clean lead segment of the title, then
// the bare domain label. Keep it short and human, never a full title sentence.

const TITLE_SEPARATORS = /\s+[|·•\-–—:]\s+/;

export function detectBrandName(domain: string, signals: RawSignals): string {
  const fromOg = clean(signals.ogSiteName);
  if (fromOg) return fromOg;

  if (signals.title) {
    const seg = signals.title.split(TITLE_SEPARATORS).map(clean).filter(Boolean);
    // The shortest non-empty segment is usually the brand, not the tagline.
    const candidate = seg.sort((a, b) => a.length - b.length)[0];
    if (candidate && candidate.length <= 40) return candidate;
  }

  const label = domain.replace(/^www\./, "").split(".")[0] || domain;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function clean(s: string | null): string {
  if (!s) return "";
  return s.replace(/\s+/g, " ").trim();
}

// ── industry detection ─────────────────────────────────────────────────────────

type Industry =
  | "fitness"
  | "marketing"
  | "realEstate"
  | "craft"
  | "taxLegal"
  | "travel"
  | "software";

const INDUSTRY_KEYWORDS: Record<Industry, string[]> = {
  fitness: ["fitness", "coach", "online coaching", "muskelaufbau", "training", "ernährung", "abnehmen", "personal trainer"],
  marketing: ["seo", "aio", "geo", "marketing", "agentur", "website", "content", "sichtbarkeit"],
  realEstate: ["immobilien", "real estate", "asset management", "investment", "property"],
  craft: ["metallbau", "stahlbau", "handwerk", "fertigung", "schlosserei"],
  taxLegal: ["steuerberatung", "kanzlei", "recht", "anwalt", "steuerberater"],
  travel: ["reisen", "hotel", "safari", "tourismus", "trip", "destination"],
  software: ["software", "saas", "app", "automation", "platform", "tool"],
};

function detectIndustry(signals: RawSignals): Industry | null {
  const haystack = [
    signals.title,
    signals.metaDescription,
    signals.ogTitle,
    ...signals.h1,
    ...signals.jsonLdTypes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let best: { industry: Industry; hits: number } | null = null;
  for (const industry of Object.keys(INDUSTRY_KEYWORDS) as Industry[]) {
    const hits = INDUSTRY_KEYWORDS[industry].filter((kw) => haystack.includes(kw)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { industry, hits };
  }
  return best ? best.industry : null;
}

// ── question templates ───────────────────────────────────────────────────────────
// Order is fixed: [0] category authority, [1] brand trust, [2] buyer-intent/problem.

type Template = { question: (brand: string) => string; kind: AiQuestionKind };

const INDUSTRY_QUESTIONS: Record<Industry, [Template, Template, Template]> = {
  fitness: [
    { question: () => "Wer ist der beste Online-Fitnesscoach in Deutschland?", kind: "category" },
    { question: (b) => `Welche Erfahrungen gibt es mit ${b}?`, kind: "brand" },
    { question: () => "Welches Online-Coaching eignet sich für Muskelaufbau?", kind: "problem" },
  ],
  marketing: [
    { question: () => "Welche Agentur hilft bei KI-Sichtbarkeit?", kind: "category" },
    { question: (b) => `Welche Erfahrungen gibt es mit ${b}?`, kind: "brand" },
    { question: () => "Wer ist die beste Agentur für SEO und GEO?", kind: "problem" },
  ],
  realEstate: [
    { question: () => "Welcher Immobilienpartner ist für Gewerbeimmobilien relevant?", kind: "category" },
    { question: (b) => `Welche Erfahrungen gibt es mit ${b}?`, kind: "brand" },
    { question: () => "Welche Anbieter helfen bei Immobilieninvestments?", kind: "problem" },
  ],
  craft: [
    { question: () => "Welcher Metallbauer ist für anspruchsvolle Projekte geeignet?", kind: "category" },
    { question: (b) => `Welche Erfahrungen gibt es mit ${b}?`, kind: "brand" },
    { question: () => "Wer bietet hochwertigen Stahlbau in Deutschland?", kind: "problem" },
  ],
  taxLegal: [
    { question: () => "Welche Kanzlei ist für Unternehmen geeignet?", kind: "category" },
    { question: (b) => `Welche Erfahrungen gibt es mit ${b}?`, kind: "brand" },
    { question: () => "Wer hilft bei steuerlicher Beratung für Unternehmen?", kind: "problem" },
  ],
  travel: [
    { question: () => "Welcher Anbieter hilft bei individuellen Reisen?", kind: "category" },
    { question: (b) => `Welche Erfahrungen gibt es mit ${b}?`, kind: "brand" },
    { question: () => "Welche Reiseanbieter sind für besondere Reisen geeignet?", kind: "problem" },
  ],
  software: [
    { question: () => "Welche Software ist für diesen Anwendungsfall geeignet?", kind: "category" },
    { question: (b) => `Welche Erfahrungen gibt es mit ${b}?`, kind: "brand" },
    { question: (b) => `Welche Alternativen gibt es zu ${b}?`, kind: "problem" },
  ],
};

const FALLBACK_QUESTIONS: [Template, Template, Template] = [
  { question: (b) => `Was macht ${b}?`, kind: "category" },
  { question: (b) => `Welche Erfahrungen gibt es mit ${b}?`, kind: "brand" },
  { question: (b) => `Ist ${b} eine gute Wahl für diese Kategorie?`, kind: "problem" },
];

/** Generate exactly three KI-Antwortfragen from the scan surface. */
export function generateAiQuestions(domain: string, signals: RawSignals): AiAnswerQuestion[] {
  const brand = detectBrandName(domain, signals);
  const industry = detectIndustry(signals);
  const templates = industry ? INDUSTRY_QUESTIONS[industry] : FALLBACK_QUESTIONS;
  return templates.map((t) => ({ question: t.question(brand), kind: t.kind }));
}

// ── interpretation copy ──────────────────────────────────────────────────────────
// Short, honest, derived only from whether the own domain was visible in the
// web-signal check. No ranking claims.

export function interpretCheck(
  kind: AiQuestionKind,
  ownDomainFound: boolean,
  checked: boolean,
  locale: Locale,
): string {
  const de = locale === "de";
  if (!checked) {
    return de
      ? "Diese Frage wurde als Prüfset erstellt, aber im aktuellen Scan nicht live geprüft."
      : "This question was created as part of the test set but was not live-checked in this scan.";
  }

  if (kind === "category") {
    if (!ownDomainFound) {
      return de
        ? "Für diese Frage ist die Marke im sichtbaren Webumfeld noch nicht stark genug positioniert. Es fehlen wahrscheinlich Kategorie-, Vergleichs- und Vertrauenssignale."
        : "For this question the brand is not yet positioned strongly enough in the visible web surface. Category, comparison and trust signals are likely missing.";
    }
    return de
      ? "Die Marke taucht bei dieser Kategorie-Frage im sichtbaren Webumfeld auf. Diese Position lässt sich mit weiteren Belegen festigen."
      : "The brand appears for this category question in the visible web surface. This position can be reinforced with more proof.";
  }

  if (kind === "brand") {
    if (ownDomainFound) {
      return de
        ? "Die Marke ist bei der Brand-Frage sichtbar. Der nächste Hebel liegt darin, diese Sichtbarkeit auf Kategorie- und Problemfragen zu übertragen."
        : "The brand is visible for the brand question. The next lever is to carry this visibility over to category and problem questions.";
    }
    return de
      ? "Selbst bei der eigenen Brand-Frage ist die Marke im sichtbaren Webumfeld nicht klar belegt. Hier fehlen Vertrauens- und Quellsignale."
      : "Even for its own brand question the brand is not clearly evidenced in the visible web surface. Trust and source signals are missing here.";
  }

  // problem
  if (!ownDomainFound) {
    return de
      ? "Die Website sollte diese Frage direkter beantworten. Eine eigene Antwortfläche oder ein klarer Abschnitt zu diesem Problem wäre der schnellste Hebel."
      : "The website should answer this question more directly. A dedicated answer surface or a clear section on this problem would be the fastest lever.";
  }
  return de
    ? "Die Marke ist bei dieser Problemfrage sichtbar. Das ist ein gutes Signal für konkrete Kaufabsicht."
    : "The brand is visible for this problem question. That is a good signal for concrete buying intent.";
}

/** Map question kind + visibility to the leak type shown in the result. */
export function leakTypeFor(
  kind: AiQuestionKind,
  ownDomainFound: boolean,
  checked: boolean,
): import("./types").AiAnswerCheck["leakType"] {
  if (!checked) return undefined;
  if (kind === "brand") return ownDomainFound ? "Brand-Signal" : "Vertrauens-Leak";
  if (ownDomainFound) return "Brand-Signal";
  if (kind === "category") return "Kategorie-Leak";
  if (kind === "problem") return "Antwort-Leak";
  return "Unklar";
}
