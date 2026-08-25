// ─── First Move: das Ergebnis als Produktobjekt ───────────────────────────────
// Bis August 2026 endete der Funnel in zwei Zuständen: ein Befund oder nichts.
// "Nichts" wurde im Interface zu "Kein starkes Signal" und danach zur Frage, ob
// der Besucher sein Problem eher in Search, AI Search oder Paid vermutet. Beides
// war falsch. Der erste Satz nimmt die diagnostische Autorität zurück, die die
// Prüfung gerade aufgebaut hat, und die zweite Frage verlangt vom Besucher genau
// die Einordnung, die er bei uns kaufen wollte.
//
// Die Regel, die diese Datei durchsetzt:
//
//   SEESZN muss nicht immer einen Fehler finden.
//   SEESZN muss immer einen nächsten sinnvollen Move finden.
//
// Deshalb gibt `buildOutcome()` nie null zurück. Jeder Ausgang der Prüfung ist
// ein Ergebnis mit Kategorie, Beleg und Fortsetzung. Ein technischer Fehler ist
// KEIN Ausgang der Prüfung: er wird vorher abgefangen und nie hierher gereicht.
//
// Was hier ausdrücklich nicht passiert: eine Kategorie behaupten, die aus den
// vorliegenden Signalen nicht ableitbar ist. Siehe SEARCH_GAP.

import { outcomeStringsEn, type FmLocale, type OutcomeStrings } from "./copy";
import {
  CLIENT_EFFORT_DISPLAY_EN,
  DELIVERY_DISPLAY_EN,
  MEASUREMENT_DISPLAY_EN,
} from "./productEn";
import { SIGNALS_STEP, SIGNAL_SOURCES } from "./signals";
import type { DimensionId, PublicDiagnosis } from "./diagnosis";
import {
  DIAGNOSIS_COPY,
  LIMITATION_BODY,
  OBSERVATIONS_LABEL,
  PAID_DIAGNOSIS_COPY,
  PAID_LIMITATION_BODY,
  PUBLIC_EVIDENCE_LABEL,
} from "./disclosure";
import {
  CLIENT_EFFORT_DISPLAY,
  DELIVERY_DISPLAY,
  MEASUREMENT_DISPLAY,
} from "./product";
import type { Level, PublicFinding } from "./types";

// ─── Taxonomie ────────────────────────────────────────────────────────────────

/**
 * Die Art des Engpasses. Zentral definiert, damit sie nicht als verstreute
 * UI-Bedingung existiert.
 *
 * SEARCH_GAP ist bewusst vorbereitet und wird vom öffentlichen Scan NIE
 * ausgespielt: "Nachfrage existiert, ihr seid dort nicht sichtbar" setzt
 * Suchvolumen und Rankings voraus. Beides ist aus öffentlich lesbaren
 * Website-Signalen nicht ableitbar. Die Kategorie wird erst tragfähig, wenn
 * Search-Console-Daten vorliegen. Bis dahin wäre jede Ausspielung eine
 * Behauptung, kein Befund. `PUBLICLY_DERIVABLE` hält das fest, ein Test sichert es.
 */
export type DiagnosisCategory =
  | "SEARCH_GAP"
  | "AI_VISIBILITY_GAP"
  | "DEMAND_CAPTURE_GAP"
  | "CONVERSION_GAP"
  | "AUTHORITY_GAP"
  | "TECHNICAL_GAP"
  | "HIDDEN_SIGNAL";

/** Kategorien, die eine öffentliche Prüfung tatsächlich belegen kann. */
export const PUBLICLY_DERIVABLE: readonly DiagnosisCategory[] = [
  "AI_VISIBILITY_GAP",
  "DEMAND_CAPTURE_GAP",
  "CONVERSION_GAP",
  "AUTHORITY_GAP",
  "TECHNICAL_GAP",
  "HIDDEN_SIGNAL",
];

/**
 * Wie belastbar das Ergebnis ist. Vier Ausgänge, keiner davon eine Sackgasse.
 *
 *   measured_signal  ein gemessener Befund trägt eine Empfehlung
 *   narrowed         gemessene Schwächen, aber keine dominiert; Richtung benannt
 *   hidden_signal    die öffentliche Basis trägt; die Ursache liegt woanders
 *   limited_read     die Oberfläche war öffentlich nicht ausreichend lesbar
 */
export type OutcomeKind = "measured_signal" | "narrowed" | "hidden_signal" | "limited_read";

/**
 * Sicherheit als Band, nicht als Prozentwert. Es gibt keine kalibrierte
 * Wahrscheinlichkeit hinter dieser Einschätzung, also wird auch keine
 * behauptet. "Confidence: 82 %" wäre eine erfundene Präzision.
 */
export type ConfidenceBand = "high" | "medium" | "limited";

export const CONFIDENCE_BAND_LABEL: Record<ConfidenceBand, string> = {
  high: "Hohe Sicherheit",
  medium: "Mittlere Sicherheit",
  limited: "Begrenzte öffentliche Evidenz",
};

export type EvidenceStatus = "positive" | "opportunity" | "neutral";

/** Ein Beleg in der Ergebnisansicht. Immer aus einer echten Beobachtung. */
export interface OutcomeEvidence {
  id: string;
  label: string;
  value: string;
  status: EvidenceStatus;
}

/** Das Ergebnis der öffentlichen Prüfung. Nie null, nie ein Fehlerzustand. */
export interface FunnelOutcome {
  category: DiagnosisCategory;
  kind: OutcomeKind;
  /** Kurzes Label über der Überschrift. */
  label: string;
  /** Die Überschrift. Sie ist der Befund, nicht das Angebot. */
  headline: string;
  /** Ein bis zwei Sätze Einordnung. */
  body: string;
  /** Der kommerzielle Sinn des Befunds. Leer, wenn er nicht belegbar ist. */
  meaning: string;
  /** Dynamisch aus solide gemessenen Dimensionen. Nie statisch. */
  ruledOut: string[];
  evidence: OutcomeEvidence[];
  /** Was eine öffentliche Prüfung grundsätzlich nicht sehen kann. */
  limits: string;
  confidence: ConfidenceBand;
  /** Beschriftung der einen dominanten Fortsetzung. */
  cta: string;
}

// ─── Zuordnung Dimension → Kategorie ──────────────────────────────────────────
//
// Greift nur, wenn kein qualifizierter Befund vorliegt. Dann benennt die
// stärkste gemessene Schwäche die Richtung, ohne eine Empfehlung zu tragen.

const DIMENSION_CATEGORY: Record<DimensionId, DiagnosisCategory> = {
  indexability: "TECHNICAL_GAP",
  crawl_access: "TECHNICAL_GAP",
  page_identity: "DEMAND_CAPTURE_GAP",
  entity: "AUTHORITY_GAP",
  answer_structure: "AI_VISIBILITY_GAP",
  measurement: "CONVERSION_GAP",
  consent: "CONVERSION_GAP",
  conversion_path: "CONVERSION_GAP",
  message_clarity: "CONVERSION_GAP",
  page_speed: "TECHNICAL_GAP",
};

/**
 * Rangfolge, wenn mehrere Dimensionen schwach sind. Ein technischer Engpass
 * steht vorn, weil er alles darunter unwirksam macht: eine Seite, die nicht
 * indexierbar ist, hat kein Autoritätsproblem, sie hat ein Zugangsproblem.
 */
const CATEGORY_PRIORITY: readonly DiagnosisCategory[] = [
  "TECHNICAL_GAP",
  "DEMAND_CAPTURE_GAP",
  "CONVERSION_GAP",
  "AI_VISIBILITY_GAP",
  "AUTHORITY_GAP",
];

// ─── Kategorie-Texte ──────────────────────────────────────────────────────────
//
// Zentral, damit Varianten testbar bleiben, ohne durch zwanzig Komponenten zu
// wandern. Jeder Satz beschreibt eine Richtung, keine Zusicherung.

interface CategoryCopy {
  /** Der Name der Kategorie in der Oberfläche. */
  name: string;
  /** Was das kommerziell bedeutet. Nie eine Zahl, nie ein Versprechen. */
  meaning: string;
}

export const CATEGORY_COPY: Record<DiagnosisCategory, CategoryCopy> = {
  SEARCH_GAP: {
    name: "Search Gap",
    meaning:
      "Nachfrage entsteht, ohne dass ihr an der Stelle sichtbar seid, an der sie entsteht.",
  },
  AI_VISIBILITY_GAP: {
    name: "AI Visibility Gap",
    meaning:
      "Antwortsysteme beantworten Fragen aus eurer Kategorie. Als Quelle könnt ihr dabei aktuell nicht geführt werden.",
  },
  DEMAND_CAPTURE_GAP: {
    name: "Demand Capture Gap",
    meaning:
      "Die vorhandene Nachfrage trifft auf eine Struktur, die sie auf mehrere Ziele verteilt, statt sie zu bündeln.",
  },
  CONVERSION_GAP: {
    name: "Conversion Gap",
    meaning: "Der Hebel liegt eher nach dem Klick als davor.",
  },
  AUTHORITY_GAP: {
    name: "Authority Gap",
    meaning:
      "Inhalt ist vorhanden. Der Absender dahinter ist maschinell nicht eindeutig benannt.",
  },
  TECHNICAL_GAP: {
    name: "Technical Gap",
    meaning:
      "Ein technischer Engpass verhindert, dass vorhandene Nachfrage überhaupt ankommt.",
  },
  HIDDEN_SIGNAL: {
    name: "Hidden Signal",
    meaning: "",
  },
};

// ─── Der Hidden-Signal-Zustand ────────────────────────────────────────────────
//
// Kein Ausweichtext für "nichts gefunden", sondern ein eigener Befund mit
// eigenen Bedingungen (siehe buildOutcome): die öffentliche Basis trägt, keine
// gemessene Schwäche dominiert, und die Signale, die jetzt zählen, sind
// öffentlich nicht lesbar. Das grenzt den Engpass ein, statt ihn offenzulassen.

export const HIDDEN_SIGNAL_COPY = {
  label: "Öffentliche Prüfung",
  headline: "Der offensichtliche Fehler ist es nicht.",
  body: "Eure öffentlich sichtbare Basis ist sauber. Wir sehen keinen einzelnen technischen, strukturellen oder Search-Fehler, der die Situation ausreichend erklärt.",
  narrowing:
    "Das grenzt den Engpass ein. Die relevanten Signale liegen dort, wo öffentliche Prüfungen nicht hinkommen: tatsächliche Nachfrage, Rankings, Conversion und Paid Performance.",
  limits:
    "Rankings, Suchvolumen, Conversion-Raten und Paid-Effizienz sind mit öffentlichen Website-Signalen allein nicht messbar.",
  cta: "First Move finden",
  ctaMicro: "Dafür brauchen wir noch 2 bis 3 Signale. Das dauert etwa eine Minute.",
} as const;

/**
 * Der Fall, in dem die Oberfläche selbst nicht ausreichend lesbar war.
 *
 * Die Überschrift lautete bis August 2026 "Öffentlich ist zu wenig lesbar, um
 * daraus etwas abzuleiten." Das war eine Sackgasse: sie beschreibt einen
 * Fehlschlag und lässt den Besucher ohne Fortsetzung stehen, obwohl es eine
 * gibt. Sie sagt jetzt, was der Zustand für die Entscheidung bedeutet und
 * welche Route als Nächstes trägt. Erfunden wird dabei nichts: die Grenze der
 * Methode bleibt genauso deutlich benannt.
 */
export const LIMITED_READ_COPY = {
  label: "Öffentliche Prüfung",
  headline: "Die öffentlichen Signale reichen noch nicht für einen verantwortbaren First Move.",
  narrowing:
    "Zwei zusätzliche Angaben öffnen die nächste Prüfroute: was von außen nicht lesbar ist, beantworten eure eigenen Leistungsdaten zuverlässiger als jede weitere öffentliche Prüfung.",
  cta: "First Move finden",
} as const;

// ─── Business Context ─────────────────────────────────────────────────────────
//
// Was hier NICHT gefragt wird: welche Marketingdisziplin wir verkaufen sollen.
// Die Einordnung in Search, AI Search oder Paid ist die Arbeit, die der Besucher
// bei uns sucht. Sie ihm zurückzugeben war der eigentliche Fehler des alten
// Funnels. Gefragt wird deshalb nach dem Geschäftsproblem.

export type BusinessSituation =
  | "low_demand"
  | "traffic_no_business"
  | "growth_stalled"
  | "unclear_lever";

export interface BusinessSituationOption {
  id: BusinessSituation;
  label: string;
  /** Was diese Angabe für die Priorisierung ändert. */
  note: string;
}

export const BUSINESS_SITUATIONS: readonly BusinessSituationOption[] = [
  {
    id: "low_demand",
    label: "Wir bekommen zu wenig neue Nachfrage",
    note: "Wir prüfen zuerst, wo Nachfrage entsteht und ob ihr dort überhaupt erreichbar seid.",
  },
  {
    id: "traffic_no_business",
    label: "Wir bekommen Traffic, aber zu wenig Geschäft",
    note: "Wir prüfen zuerst, was nach dem Klick passiert, statt mehr Reichweite zu empfehlen.",
  },
  {
    id: "growth_stalled",
    label: "Wachstum stagniert",
    note: "Wir vergleichen zuerst den Verlauf, um zwischen Marktbewegung und eigenem Engpass zu trennen.",
  },
  {
    id: "unclear_lever",
    label: "Wir wissen nicht, wo der größte Hebel liegt",
    note: "Wir priorisieren zuerst die Bereiche mit der größten Lücke zwischen Aufwand und Ergebnis.",
  },
];

// ─── First Move als Produktobjekt ─────────────────────────────────────────────

export interface FirstMoveProposal {
  id: string;
  category: DiagnosisCategory;
  /** Die Klasse des Eingriffs. Nie das konkrete Ziel: das ist die bezahlte Arbeit. */
  title: string;
  /** Warum genau dieser Move. Bezieht Befund und Geschäftslage aufeinander. */
  rationale: string;
  evidence: OutcomeEvidence[];
  /** Nur gesetzt, wenn ein gemessener Befund ihn trägt. */
  expectedImpact?: Level;
  confidence: ConfidenceBand;
  clientEffort: string;
  deliveryWindow: string;
  measurementWindow: string;
  /** Was die Umsetzung einschließt. Aus den gesperrten Produktwerten. */
  scope: readonly string[];
}

// ─── Aufbau ───────────────────────────────────────────────────────────────────

function evidenceFromDimensions(diagnosis: PublicDiagnosis): OutcomeEvidence[] {
  return diagnosis.dimensions
    .filter((d) => d.verdict !== "unknown")
    .map((d) => ({
      id: d.id,
      label: d.label,
      value: d.observation,
      status:
        d.verdict === "solid"
          ? ("positive" as const)
          : d.verdict === "weak"
            ? ("opportunity" as const)
            : ("neutral" as const),
    }));
}

/**
 * Was die Prüfung positiv ausschließen konnte. Ausschließlich aus Dimensionen
 * mit verdict "solid": ein Punkt, der nicht gemessen wurde oder schwach war,
 * darf hier nie als abgehakt erscheinen.
 */
function ruledOutFrom(diagnosis: PublicDiagnosis): string[] {
  return diagnosis.dimensions
    .filter((d) => d.verdict === "solid")
    .map((d) => d.observation);
}

function bandFrom(level: Level): ConfidenceBand {
  return level === "high" ? "high" : level === "medium" ? "medium" : "limited";
}

/** Die stärkste gemessene Schwäche benennt die Richtung. */
function categoryFromWeakness(diagnosis: PublicDiagnosis): DiagnosisCategory | null {
  const weak = diagnosis.dimensions.filter((d) => d.verdict === "weak");
  if (weak.length === 0) return null;
  const categories = new Set(weak.map((d) => DIMENSION_CATEGORY[d.id]));
  return CATEGORY_PRIORITY.find((c) => categories.has(c)) ?? null;
}

/**
 * Der einzige Weg vom Prüfergebnis zur Ergebnisansicht.
 *
 * Bewusst total: es gibt keinen Eingabewert, für den diese Funktion nichts
 * zurückgibt. Damit ist ausgeschlossen, dass die Oberfläche aus `null` wieder
 * einen Dead-End-Zustand baut.
 */
/**
 * Die deutschen Sätze der Ergebnisansicht, zusammengesetzt aus den bestehenden
 * Konstanten. Sie bleiben die einzige Quelle: diese Funktion kopiert keinen
 * Text, sie bündelt ihn nur in dieselbe Form wie die englische Fassung.
 */
function outcomeStringsDe(): OutcomeStrings {
  return {
    confidence: CONFIDENCE_BAND_LABEL,
    observationsLabel: OBSERVATIONS_LABEL,
    evidenceLabel: PUBLIC_EVIDENCE_LABEL,
    category: CATEGORY_COPY,
    state: DIAGNOSIS_COPY,
    limitation: LIMITATION_BODY,
    hiddenSignal: HIDDEN_SIGNAL_COPY,
    limitedRead: LIMITED_READ_COPY,
    cta: HIDDEN_SIGNAL_COPY.cta,
    ctaMicro: HIDDEN_SIGNAL_COPY.ctaMicro,
    situations: {
      low_demand: {
        label: BUSINESS_SITUATIONS[0].label,
        note: BUSINESS_SITUATIONS[0].note,
        rationale: SITUATION_RATIONALE.low_demand,
      },
      traffic_no_business: {
        label: BUSINESS_SITUATIONS[1].label,
        note: BUSINESS_SITUATIONS[1].note,
        rationale: SITUATION_RATIONALE.traffic_no_business,
      },
      growth_stalled: {
        label: BUSINESS_SITUATIONS[2].label,
        note: BUSINESS_SITUATIONS[2].note,
        rationale: SITUATION_RATIONALE.growth_stalled,
      },
      unclear_lever: {
        label: BUSINESS_SITUATIONS[3].label,
        note: BUSINESS_SITUATIONS[3].note,
        rationale: SITUATION_RATIONALE.unclear_lever,
      },
    },
    moveTitle: MOVE_TITLE,
    rationaleHidden:
      "Die öffentlich prüfbare Basis trägt. Den nächsten Erkenntnisgewinn bringt deshalb keine weitere öffentliche Prüfung. Er liegt in euren eigenen Leistungsdaten.",
    rationaleNarrowed:
      "Die öffentliche Prüfung benennt die Richtung, trägt aber allein noch keine Empfehlung. Der Move beginnt deshalb damit, sie zu bestätigen oder zu verwerfen.",
    signals: {
      label: SIGNALS_STEP.label,
      headline: SIGNALS_STEP.headline,
      body: SIGNALS_STEP.body,
      unavailableNote: SIGNALS_STEP.unavailableNote,
      skipCta: SIGNALS_STEP.skipCta,
      skipNote: SIGNALS_STEP.skipNote,
      continueCta: SIGNALS_STEP.continueCta,
      connectCta: "Read-only verbinden",
      inKickoff: "Im Kickoff, lesend",
      sources: {
        search_console: SIGNAL_SOURCES[0].answers,
        analytics: SIGNAL_SOURCES[1].answers,
        google_ads: SIGNAL_SOURCES[2].answers,
      },
    },
  };
}

/** Die Sätze der Ergebnisansicht in der gewünschten Sprache. */
export function outcomeStrings(locale: FmLocale = "de"): OutcomeStrings {
  return locale === "en" ? outcomeStringsEn() : outcomeStringsDe();
}

export function buildOutcome(
  diagnosis: PublicDiagnosis,
  finding: PublicFinding | null,
  isPaid = false,
  /**
   * Nur die Sprache der Sätze. Kategorie, Art und Sicherheit des Ergebnisses
   * entstehen aus denselben Regeln und sind für beide Sprachen identisch.
   * Der Paid Check bleibt deutsch: er hat keine englische Oberfläche.
   */
  locale: FmLocale = "de",
): FunnelOutcome {
  const c = isPaid ? outcomeStringsDe() : outcomeStrings(locale);
  const stateCopy = isPaid ? PAID_DIAGNOSIS_COPY[diagnosis.state] : c.state[diagnosis.state];
  const limitationBody = isPaid ? PAID_LIMITATION_BODY : c.limitation;
  const evidence = evidenceFromDimensions(diagnosis);
  const ruledOut = ruledOutFrom(diagnosis);

  // 1) Ein gemessener Befund trägt eine Empfehlung. Die Kategorie kommt aus dem
  //    Befund selbst, nicht aus einer Textprüfung in der Oberfläche.
  if (finding && diagnosis.state === "clear_signal") {
    const category = finding.category;
    return {
      category,
      kind: "measured_signal",
      label: c.category[category].name,
      headline: finding.title,
      body: finding.summary,
      meaning: c.category[category].meaning,
      ruledOut,
      evidence: [
        ...finding.evidence.map((e) => ({
          id: e.id,
          label: "Beobachtung",
          value: e.observation,
          status: "opportunity" as const,
        })),
        ...evidence,
      ],
      limits: stateCopy.limits,
      confidence: bandFrom(finding.confidence),
      cta: c.cta,
    };
  }

  // 2) Die Oberfläche war nicht ausreichend lesbar. Das ist kein Fehler der
  //    Website und keiner der Prüfung, sondern eine Grenze der Methode.
  if (diagnosis.state === "insufficient_public_evidence") {
    return {
      category: "HIDDEN_SIGNAL",
      kind: "limited_read",
      label: c.limitedRead.label,
      headline: c.limitedRead.headline,
      body: diagnosis.limitation
        ? limitationBody[diagnosis.limitation]
        : stateCopy.body,
      meaning: c.limitedRead.narrowing,
      ruledOut,
      evidence,
      limits: stateCopy.limits,
      confidence: "limited",
      cta: c.cta,
    };
  }

  // 3) Gemessene Schwächen, aber keine dominiert. Wir benennen die Richtung und
  //    sagen ausdrücklich, dass sie noch keine Empfehlung trägt. Eine harte
  //    Empfehlung wäre hier erfunden.
  const narrowed = categoryFromWeakness(diagnosis);
  if (diagnosis.state === "mixed_signal" && narrowed) {
    return {
      category: narrowed,
      kind: "narrowed",
      label: c.category[narrowed].name,
      headline: stateCopy.title,
      body: stateCopy.body,
      meaning: c.category[narrowed].meaning,
      ruledOut,
      evidence,
      limits: stateCopy.limits,
      confidence: diagnosis.confidence === "high" ? "medium" : "limited",
      cta: c.cta,
    };
  }

  // 4) Hidden Signal. Kein Auffangbecken: die öffentliche Basis trägt, keine
  //    gemessene Schwäche dominiert, und die Signale, die jetzt zählen, sind
  //    öffentlich nicht lesbar.
  return {
    category: "HIDDEN_SIGNAL",
    kind: "hidden_signal",
    label: c.hiddenSignal.label,
    headline: c.hiddenSignal.headline,
    body: c.hiddenSignal.body,
    meaning: c.hiddenSignal.narrowing,
    ruledOut,
    evidence,
    limits: c.hiddenSignal.limits,
    confidence: diagnosis.confidence === "high" ? "medium" : "limited",
    cta: c.cta,
  };
}

// ─── Vom Ergebnis zum First Move ──────────────────────────────────────────────

const MOVE_TITLE: Record<DiagnosisCategory, string> = {
  SEARCH_GAP: "Sichtbarkeit dort herstellen, wo die Kaufabsicht entsteht.",
  AI_VISIBILITY_GAP: "Eine zitierfähige Kernseite mit eindeutigem Absender aufbauen.",
  DEMAND_CAPTURE_GAP: "Die konkurrierenden Ziele auf eine zentrale Seite bündeln.",
  CONVERSION_GAP: "Den Weg nach dem Klick auf eine Handlung ausrichten.",
  AUTHORITY_GAP: "Den Absender maschinell eindeutig benennen.",
  TECHNICAL_GAP: "Den technischen Engpass beheben und die Behebung verifizieren.",
  HIDDEN_SIGNAL: "Den Engpass mit euren eigenen Leistungsdaten eingrenzen.",
};

const SITUATION_RATIONALE: Record<BusinessSituation, string> = {
  low_demand:
    "Ihr bekommt zu wenig neue Nachfrage. Dieser Move setzt deshalb an der Stelle an, an der Nachfrage bei euch ankommt oder eben nicht ankommt.",
  traffic_no_business:
    "Ihr bekommt Traffic, aber zu wenig Geschäft. Dieser Move setzt deshalb hinter dem Klick an, nicht davor.",
  growth_stalled:
    "Das Wachstum stagniert. Dieser Move ist so geschnitten, dass sein Effekt im Messfenster von einer Marktbewegung unterscheidbar bleibt.",
  unclear_lever:
    "Der größte Hebel ist noch unklar. Dieser Move ist deshalb bewusst der, der die Unsicherheit am schnellsten auflöst.",
};

/**
 * Baut den vorgeschlagenen First Move. Kein Marketingtext: Titel und Kategorie
 * stammen aus dem Ergebnis, Aufwand, Lieferfrist und Messfenster aus den
 * gesperrten Produktwerten, die Begründung aus Befund plus Geschäftslage.
 *
 * `expectedImpact` wird nur gesetzt, wenn ein gemessener Befund ihn trägt. Ohne
 * Befund bleibt das Feld leer, statt eine Einschätzung zu erfinden.
 */
export function buildFirstMove(
  outcome: FunnelOutcome,
  situation: BusinessSituation | null,
  finding: PublicFinding | null,
  scope: readonly string[],
  /** Nur die Sprache. Auswahl und Rahmen des Moves sind identisch. */
  locale: FmLocale = "de",
): FirstMoveProposal {
  const c = outcomeStrings(locale);
  const measured = outcome.kind === "measured_signal";
  const title = (measured ? finding?.interventionType : null) ?? c.moveTitle[outcome.category];

  const rationale = [
    measured
      ? outcome.body
      : outcome.kind === "hidden_signal"
        ? c.rationaleHidden
        : c.rationaleNarrowed,
    situation ? c.situations[situation].rationale : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: `fm_${outcome.category.toLowerCase()}`,
    category: outcome.category,
    title,
    rationale,
    evidence: outcome.evidence.slice(0, 4),
    expectedImpact: measured ? finding?.impact : undefined,
    confidence: outcome.confidence,
    clientEffort: locale === "en" ? CLIENT_EFFORT_DISPLAY_EN : CLIENT_EFFORT_DISPLAY,
    deliveryWindow: locale === "en" ? DELIVERY_DISPLAY_EN : DELIVERY_DISPLAY,
    measurementWindow: locale === "en" ? MEASUREMENT_DISPLAY_EN : MEASUREMENT_DISPLAY,
    scope,
  };
}
