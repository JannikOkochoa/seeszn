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
  /** Die Frage nach dem Kanal, passend zum Zustand gestellt. */
  question: string;
}

export const DIAGNOSIS_COPY: Record<PublicDiagnosisState, StateCopy> = {
  clear_signal: {
    label: "Relevantes Signal",
    title: "", // Die Überschrift ist der Befund selbst.
    body: "",
    limits:
      "Der Befund stützt sich auf öffentlich abrufbare Signale. Vor einer Umsetzung verifizieren wir ihn mit den nötigen Zugängen.",
    cta: "Diesen Engpass vertiefen",
    question: "Wo merkst du den Engpass aktuell am stärksten?",
  },
  mixed_signal: {
    label: "Gemischtes Signalbild",
    title: "Kein einzelner Engpass dominiert das Bild.",
    body: "Die öffentlich sichtbaren Signale ergeben kein eindeutiges Hauptproblem. Ein Teil der Grundlage trägt, ein Teil nicht.",
    limits:
      "Für eine belastbare Priorisierung zwischen Search, AI Search und Paid Acquisition fehlen interne Leistungsdaten. Search Console, Analytics und der Google-Ads-Account sind von außen nicht lesbar.",
    cta: "First Move vertiefen",
    question: "Wo spürst du aktuell am meisten Unsicherheit?",
  },
  healthy_public_foundation: {
    label: "Solide öffentliche Basis",
    title: "Öffentlich sieht die Grundlage solide aus.",
    body: "In den öffentlich prüfbaren Signalen zeigt sich aktuell kein technischer oder struktureller Engpass.",
    limits:
      "Das schließt Probleme bei Rankings, AI Search, Conversion oder Paid Performance nicht aus. Diese Bereiche sind mit öffentlichen Website-Signalen allein nicht messbar.",
    cta: "Interne Signale prüfen",
    question: "Welchen Bereich möchtest du trotzdem genauer prüfen?",
  },
  insufficient_public_evidence: {
    label: "Begrenzte öffentliche Daten",
    title: "Öffentlich ist noch zu wenig sichtbar.",
    body: "", // Kommt aus LIMITATION_BODY, damit der Grund konkret benannt wird.
    limits:
      "Ohne belastbare öffentliche Evidenz raten wir hier nichts. Eine tiefere Diagnose braucht Zugriff auf Search Console, Analytics oder das Ads-Konto.",
    cta: "Mit internen Daten weiterprüfen",
    question: "Welchen Bereich sollen wir mit internen Daten zuerst vertiefen?",
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
    cta: "Diesen Engpass vertiefen",
    question: "Wo merkst du den Engpass aktuell am stärksten?",
  },
  mixed_signal: {
    label: "Gemischtes Signalbild",
    title: "Kein einzelner Conversion-Engpass dominiert das Bild.",
    body: "Die öffentlich sichtbare Landingpage zeigt sowohl solide als auch uneindeutige Signale. Ein Teil des Aufbaus trägt, ein Teil ist von außen nicht beurteilbar.",
    limits:
      "Für eine belastbare Priorisierung fehlen Kampagnen- und Conversion-Daten. Suchbegriffe, Attribution, Budgetverteilung und Leadqualität sind öffentlich nicht lesbar.",
    cta: "First Move vertiefen",
    question: "Wo spürst du aktuell am meisten Unsicherheit?",
  },
  healthy_public_foundation: {
    label: "Solide öffentliche Basis",
    title: "Die öffentlich sichtbare Conversion-Basis wirkt solide.",
    body: "Im öffentlich prüfbaren Aufbau der Einstiegsseite zeigt sich aktuell kein technischer oder struktureller Conversion-Engpass.",
    limits:
      "Ob Kampagnen, Zielgruppen, Angebote und tatsächliche Conversion-Raten effizient arbeiten, lässt sich ohne interne Daten nicht beurteilen. Das ist eine Aussage über den Aufbau der Seite, keine über die Wirtschaftlichkeit deiner Paid Acquisition.",
    cta: "Account-Ebene prüfen",
    question: "Welchen Bereich möchtest du trotzdem genauer prüfen?",
  },
  insufficient_public_evidence: {
    label: "Begrenzte öffentliche Daten",
    title: "Die Landingpage ist öffentlich nicht ausreichend prüfbar.",
    body: "",
    limits:
      "Ohne belastbare öffentliche Evidenz raten wir hier nichts. Für einen echten Paid-Befund brauchen wir lesenden Zugriff auf das Google-Ads-Konto.",
    cta: "Mit Account-Daten weiterprüfen",
    question: "Welchen Bereich sollen wir mit internen Daten zuerst vertiefen?",
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
