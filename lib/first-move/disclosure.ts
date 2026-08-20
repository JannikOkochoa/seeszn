// ─── First Move: was ein kostenloser Scan zeigen darf ─────────────────────────
// V6 trennt Diagnose und Umsetzung sauber. Der öffentliche Scan zeigt, dass wir
// ein Muster erkennen und woran wir es festmachen. Er zeigt nicht, wie wir es
// beheben würden.
//
// Öffentlich sichtbar:
//   - die Beobachtung
//   - ein bis zwei knappe Belege
//   - Impact und Confidence
//   - die Art des möglichen Eingriffs (Intervention Type)
//   - der Hinweis, dass vor einer Umsetzung verifiziert wird
//
// Die Art des Eingriffs zeigt die Einschätzung, nicht die Arbeit:
// "Konsolidierung auf eine zentrale Zielseite" sagt, was zu tun wäre, und
// verrät nicht, welche Seite das Ziel wird.
//
// Bleibt am Server und im bezahlten Produkt:
//   - konkrete URLs und die Zielseite
//   - Canonical-, Redirect- und Verlinkungsplan
//   - Scope und Titel des vorgeschlagenen First Move
//   - Messhypothese, Basiswert, QA- und Umsetzungsschritte
//
// Diese Redaktion passiert serverseitig, bevor das Ergebnis den Prozess
// verlässt. Der Client bekommt die vollständige Auswertung nie zu sehen.

import type { FirstMoveFinding, PublicEvidencePoint, PublicFinding } from "./types";

/** Höchstens so viele Belege gehen nach außen. */
const MAX_PUBLIC_EVIDENCE = 2;

/** Absolute URLs und Pfadangaben aus einer Beobachtung entfernen. */
function stripLocators(text: string): string {
  return text
    .replace(/https?:\/\/\S+/gi, "eine der geprüften Seiten")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Reduziert einen vollständigen Befund auf die öffentliche Sicht.
 * Reihenfolge der Belege bleibt erhalten, sie sind bereits nach Aussagekraft
 * sortiert: die erste Beobachtung trägt das Muster, die zweite bestätigt es.
 */
export function toPublicFinding(finding: FirstMoveFinding): PublicFinding {
  const evidence: PublicEvidencePoint[] = finding.evidence
    .slice(0, MAX_PUBLIC_EVIDENCE)
    .map((item) => ({ id: item.id, observation: stripLocators(item.observation) }));

  return {
    id: finding.id,
    route: finding.route,
    category: finding.category,
    status: finding.status,
    title: stripLocators(finding.title),
    summary: stripLocators(finding.summary),
    evidence,
    impact: finding.impact,
    confidence: finding.confidence,
    interventionType: finding.proposedFirstMove?.interventionType,
    eligibility: finding.eligibility,
    publicEvidenceOnly: true,
    requiresReadOnly: finding.requiresReadOnly,
    surfaceKind: finding.surfaceKind,
    suggestedComplexity: finding.suggestedComplexity,
    createdAt: finding.createdAt,
  };
}

// ─── Sprachregeln für den öffentlichen Befund ─────────────────────────────────
//
// Ein kurzer öffentlicher Scan kann ein Muster sehen. Er kann nicht wissen, ob
// es die Ursache ist. Deshalb heißt das Ergebnis Signal und nicht Diagnose.

export const PUBLIC_SIGNAL_LABEL = "Relevantes Signal";

export const PUBLIC_SIGNAL_INTRO = "Wir sehen ein relevantes Signal.";

export const PUBLIC_VERIFY_LINE =
  "Wir würden diesen Befund vor einer Umsetzung verifizieren.";

export const PUBLIC_EVIDENCE_LABEL = "Belege";

export const PUBLIC_INTERVENTION_LABEL = "Möglicher First Move";

// ─── Die vier Ergebniszustände ────────────────────────────────────────────────
//
// Vorher gab es genau zwei Texte: einen Befund oder "Kein starkes Signal". Der
// zweite musste drei völlig verschiedene Wahrheiten tragen und hat deshalb keine
// davon gut getragen. Jetzt hat jeder Zustand seinen eigenen Satz, und jeder
// Satz sagt genau das, was gemessen wurde.
//
// Zwei Regeln, die diese Texte seit dem Umbau im August 2026 zusätzlich halten:
//
//   1. Kein Zustand formuliert ein Nichtergebnis. "Kein starkes Signal", "kein
//      Befund" und "trotzdem prüfen" gibt es nicht mehr. Ein Zustand ohne
//      dominanten Engpass ist ein Ergebnis: er grenzt ein, wo die Ursache NICHT
//      liegt, und das ist eine Information, die der Besucher vorher nicht hatte.
//
//   2. Kein Zustand fragt den Besucher, welche Marketingdisziplin sein Problem
//      ist. Diese Einordnung ist die Arbeit, die er hier sucht. Sie ihm
//      zurückzugeben war der eigentliche Konstruktionsfehler des alten Funnels.
//      Die Frage nach der Geschäftslage steht in ./outcome.
//
// Was in KEINEM dieser Texte steht, weil ein öffentlicher Scan es nicht sehen
// kann: Rankings, Conversion, Paid-Effizienz, Umsatz.

import type { EvidenceLimitation, PublicDiagnosisState } from "./diagnosis";

interface StateCopy {
  /** Kurzes Label über der Überschrift. */
  label: string;
  /** Die Überschrift. Sagt den Zustand, nicht das Angebot. */
  title: string;
  /** Ein bis zwei Sätze Einordnung. */
  body: string;
  /** Was der öffentliche Scan grundsätzlich nicht sehen kann. */
  limits: string;
  /** Beschriftung des weiterführenden CTA. */
  cta: string;
}

export const DIAGNOSIS_COPY: Record<PublicDiagnosisState, StateCopy> = {
  clear_signal: {
    label: "Relevantes Signal",
    title: "", // Die Überschrift ist der Befund selbst.
    body: "",
    limits:
      "Der Befund stützt sich auf öffentlich abrufbare Signale. Vor einer Umsetzung verifizieren wir ihn mit den nötigen Zugängen.",
    cta: "First Move finden",
  },
  mixed_signal: {
    label: "Eingegrenzt",
    title: "Ein Bereich fällt auf, trägt aber allein noch keine Empfehlung.",
    body: "Ein Teil der öffentlich prüfbaren Grundlage trägt, ein Teil nicht. Damit ist die Richtung benannt und der Rest ausgeschlossen.",
    limits:
      "Ob dieser Bereich wirklich der Engpass ist, entscheiden eure Leistungsdaten. Search Console, Analytics und der Google-Ads-Account sind von außen nicht lesbar.",
    cta: "First Move finden",
  },
  healthy_public_foundation: {
    label: "Öffentliche Prüfung",
    title: "Der offensichtliche Fehler ist es nicht.",
    body: "Eure öffentlich sichtbare Basis ist sauber. Wir sehen keinen einzelnen technischen oder strukturellen Fehler, der die Situation ausreichend erklärt.",
    limits:
      "Rankings, Suchvolumen, Conversion-Raten und Paid-Effizienz sind mit öffentlichen Website-Signalen allein nicht messbar.",
    cta: "First Move finden",
  },
  insufficient_public_evidence: {
    label: "Öffentliche Prüfung",
    title: "Öffentlich ist zu wenig lesbar, um daraus etwas abzuleiten.",
    body: "", // Kommt aus LIMITATION_BODY, damit der Grund konkret benannt wird.
    limits:
      "Ohne belastbare öffentliche Evidenz raten wir hier nichts. Die nächste belastbare Ebene sind eure eigenen Leistungsdaten.",
    cta: "First Move finden",
  },
};

/**
 * Paid-Fassung. Der Check liest genau eine Einstiegsseite, deshalb muss jede
 * Aussage enger sein als im Search-Scan.
 *
 * Die Grenze, die diese Texte halten müssen: der öffentliche Check beurteilt den
 * sichtbaren AUFBAU einer Landingpage. Er beurteilt nicht Kampagnen, Gebote,
 * Suchbegriffe, Attribution, CAC, ROAS, Leadqualität oder die tatsächliche
 * Conversion Rate. "Solide öffentliche Basis" heißt deshalb ausdrücklich nicht
 * "dein CRO ist gut" und nicht "deine Paid Acquisition ist gesund".
 */
export const PAID_DIAGNOSIS_COPY: Record<PublicDiagnosisState, StateCopy> = {
  clear_signal: {
    label: "Relevantes Signal",
    title: "",
    body: "",
    limits:
      "Der Befund beschreibt den öffentlich sichtbaren Aufbau der Einstiegsseite. Über Kampagnen, Gebote, Suchbegriffe und die tatsächliche Conversion Rate sagt er nichts; das liegt im Konto und braucht lesenden Zugriff.",
    cta: "First Move finden",
  },
  mixed_signal: {
    label: "Eingegrenzt",
    title: "Ein Teil des Aufbaus fällt auf, trägt aber allein noch keine Empfehlung.",
    body: "Die Einstiegsseite zeigt sowohl solide als auch uneindeutige Signale. Damit ist die Richtung benannt und der Rest ausgeschlossen.",
    limits:
      "Ob dieser Punkt wirklich der Engpass ist, entscheidet das Konto. Suchbegriffe, Attribution, Budgetverteilung und Leadqualität sind öffentlich nicht lesbar.",
    cta: "First Move finden",
  },
  healthy_public_foundation: {
    label: "Öffentliche Prüfung",
    title: "Die öffentlich sichtbare Conversion-Basis wirkt solide.",
    body: "Im öffentlich prüfbaren Aufbau der Einstiegsseite zeigt sich kein struktureller Engpass, der die Situation ausreichend erklärt.",
    limits:
      "Ob Kampagnen, Zielgruppen, Angebote und tatsächliche Conversion-Raten effizient arbeiten, lässt sich ohne interne Daten nicht beurteilen. Das ist eine Aussage über den Aufbau der Seite, keine über die Wirtschaftlichkeit deiner Paid Acquisition.",
    cta: "First Move finden",
  },
  insufficient_public_evidence: {
    label: "Öffentliche Prüfung",
    title: "Die Landingpage ist öffentlich nicht ausreichend lesbar.",
    body: "",
    limits:
      "Ohne belastbare öffentliche Evidenz raten wir hier nichts. Die nächste belastbare Ebene ist der lesende Zugriff auf das Google-Ads-Konto.",
    cta: "First Move finden",
  },
};

/** Der konkrete Grund, warum die öffentliche Evidenz nicht gereicht hat. */
export const LIMITATION_BODY: Record<EvidenceLimitation, string> = {
  surface_not_readable:
    "Die Startseite antwortet auf einen automatisierten Abruf nicht mit einer normalen Seite. Was ein Bot-Schutz ausliefert, sagt über die echte Website nichts aus, deshalb leiten wir daraus nichts ab.",
  too_few_pages:
    "Es waren zu wenige Unterseiten öffentlich lesbar, um über Muster etwas zu sagen. Für einen Vergleich braucht es mehrere abrufbare Seiten.",
  pages_without_content:
    "Die abgerufenen Seiten liefern im HTML fast keinen Text aus; der Inhalt entsteht erst im Browser. Was wir hier lesen, wäre eine Aussage über das Rendering, nicht über die Website.",
  too_little_measured:
    "Zu wenige der geprüften Dimensionen waren belastbar messbar, um daraus ein Bild zu bilden.",
};

/** Paid-Fassung der Evidenzgrenzen: es geht immer um genau eine Seite. */
export const PAID_LIMITATION_BODY: Record<EvidenceLimitation, string> = {
  surface_not_readable:
    "Die angegebene Adresse liefert auf einen automatisierten Abruf keine normale Seite aus. Das kann ein Bot-Schutz sein oder ein Dokument, das gar keine Landingpage ist. Aus beidem leiten wir nichts ab.",
  pages_without_content:
    "Die Einstiegsseite liefert im HTML fast keinen Text aus; der Inhalt entsteht erst im Browser. Was wir hier lesen, wäre eine Aussage über das Rendering, nicht über die Seite.",
  too_few_pages:
    "Die Einstiegsseite war nicht ausreichend lesbar, um ihren Aufbau zu beurteilen.",
  too_little_measured:
    "Zu wenige der geprüften Dimensionen waren belastbar messbar, um über den Aufbau der Seite etwas zu sagen.",
};

/** Überschrift über der Beobachtungsliste im Ergebnis. */
export const OBSERVATIONS_LABEL = "Was wir gelesen haben";

/** Beschriftung der Sicherheit der Interpretation. */
export const CONFIDENCE_LABEL: Record<"low" | "medium" | "high", string> = {
  low: "geringe Sicherheit",
  medium: "mittlere Sicherheit",
  high: "hohe Sicherheit",
};
