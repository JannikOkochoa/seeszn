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

export const NO_SIGNAL_LABEL = "Kein starkes Signal";

export const NO_SIGNAL_TITLE =
  "Öffentlich ist hier noch kein Befund stark genug für eine Empfehlung.";

export const NO_SIGNAL_BODY =
  "Öffentlich lesbare Signale zeigen nur einen Ausschnitt. Search Console, Analytics und der Google-Ads-Account bleiben von außen unsichtbar. Mit den nötigen Zugängen prüfen wir die Lage direkt, statt hier etwas zum Engpass zu erklären.";
