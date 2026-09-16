// ─── MOVES: Belege ────────────────────────────────────────────────────────────
// Diese Datei erfindet keine Zahl. Jeder Wert stammt aus einem bereits
// veröffentlichten und freigegebenen SEESZN-Beleg:
//
//   lib/first-move/proof.ts      die drei Belegmodule des Kaufwegs
//   lib/case-studies/de.ts       die Werte der Tourismus-Case-Study
//
// Die Aufbereitung ist hier eine andere, weil MOVES eine andere Frage
// beantwortet: nicht "kann SEESZN das", sondern "was ist in diesem Zeitraum
// tatsächlich passiert und was davon lässt sich zuordnen".
//
// Deshalb trägt jeder Datensatz zwei Felder, die anderswo fehlen:
//   deployed  alle Maßnahmen, die im Zeitraum liefen
//   limits    was die Zahl nicht sagt
//
// In keinem dieser Zeiträume lief genau eine Maßnahme. Eine einzelne Einheit aus
// MOVES ist an keiner dieser Zahlen allein ursächlich, und die Seite sagt das.

import { PROOF_CASES } from "@/lib/first-move/proof";
import { VALUES } from "@/lib/case-studies/de";
import type { MoveCategoryId } from "./types";

export interface ProofRecord {
  id: string;
  /** Rubrik des Belegs, wie im bestehenden Belegsystem. */
  label: string;
  /** Anonymisierter oder freigegebener Kundenname. */
  client: string;
  scope: string;

  /** Was im Zeitraum umgesetzt wurde. Mehrzahl, immer. */
  deployed: readonly string[];
  period: string;
  metric: string;
  before: string;
  after: string;
  /** Richtung der Veränderung, für die Achse. "down" heißt: kleiner ist besser. */
  direction: "up" | "down";
  /** Numerische Werte für die Achse. Nur Anfang und Ende sind gemessen. */
  axis?: { from: number; to: number; min: number; max: number };
  /**
   * Die Leserichtung der Achse. Pflicht, sobald axis gesetzt ist: bei einer
   * Positionsmessung steht der bessere Wert links, und ohne diese Zeile liest
   * sich die Bewegung von links nach rechts als Verschlechterung.
   */
  axisNote?: string;

  source: string;
  method: string;
  limits: string;
  /** Optional: eine anonymisierte Aufnahme aus der Search Console. */
  shot?: { src: string; alt: string; caption: string };
  caseHref?: string;
  /** Ziel der englischen Fassung, falls die Case Study auch englisch existiert. */
  caseHrefEn?: string;
  /** Für welche Flächen der Beleg etwas aussagt. */
  relevantFor: readonly MoveCategoryId[];
}

const transform = PROOF_CASES.transform;
const build = PROOF_CASES.build;

const evidence = (item: typeof transform, label: string): string =>
  item.evidence.find((e) => e.label === label)?.value ?? "";

export const PROOF_RECORDS: readonly ProofRecord[] = [
  {
    id: "transform",
    label: transform.label,
    client: transform.name,
    scope: transform.descriptor,
    deployed: [
      "Zitierfähige Inhalte auf der eigenen Domain",
      "Entity-Klarheit und Sucharchitektur",
      "Externe Quellen und Nennungen im Umfeld des Themas",
    ],
    period: evidence(transform, "Zeitraum"),
    metric: "Durchschnittliche Position der Marke im konstanten Prompt-Set",
    before: String(VALUES.aiPositionBefore).replace(".", ","),
    after: String(VALUES.aiPositionAfter).replace(".", ","),
    direction: "down",
    axis: { from: VALUES.aiPositionBefore, to: VALUES.aiPositionAfter, min: 1, max: 7 },
    axisNote: "Skala Position 1 bis 7, Platz 1 links. Der kleinere Wert ist der bessere.",
    source: evidence(transform, "Quellen"),
    method: evidence(transform, "Methodik"),
    limits:
      "Antwortsysteme sind nicht deterministisch, und im Zeitraum liefen mehrere Maßnahmen gleichzeitig. Die Zahl beschreibt die gemessene Veränderung im Prompt-Set, keine garantierte Nennung und keine Wirkung einer einzelnen Einheit.",
    caseHref: "/case-studies/seo-aio-tourismus",
    caseHrefEn: "/en/case-studies/seo-aio-tourism",
    relevantFor: ["authority", "mentions", "content"],
  },
  {
    id: "build",
    label: build.label,
    client: build.name,
    scope: build.descriptor,
    deployed: [
      "Aufbau der Sucharchitektur",
      "Zitierfähige Kategorie- und Produktoberflächen",
      "Interne Verlinkung und strukturierte Daten",
    ],
    period: evidence(build, "Zeitraum"),
    metric: "Organische Klicks als Leitwert, Impressionen als Kontext",
    before: "0",
    after: build.leadValue,
    direction: "up",
    source: evidence(build, "Quelle"),
    method: evidence(build, "Methodik"),
    limits:
      "Der Aufbau startete ohne bestehende organische Sichtbarkeit, der Vorherwert ist deshalb kein Vergleichswert im engeren Sinn. Die durchschnittliche Position über alle Queries lag bei 7,1 und ist nur Kontext.",
    caseHref: "/case-studies/french-beret-ecommerce-seo",
    caseHrefEn: "/en/case-studies/french-beret-ecommerce-seo",
    relevantFor: ["content", "authority"],
  },
];

/** Die Belege, die für eine Fläche etwas aussagen. Nie alle, nie keiner. */
export function proofFor(category: MoveCategoryId): readonly ProofRecord[] {
  const hits = PROOF_RECORDS.filter((r) => r.relevantFor.includes(category));
  return hits.length ? hits : PROOF_RECORDS.slice(0, 1);
}

/**
 * Der Satz, der über jedem Belegblock steht. Er trennt Korrelation von
 * Ursache und steht bewusst nicht im Kleingedruckten.
 */
export const CORRELATION_NOTE =
  "In jedem dieser Zeiträume liefen mehrere Maßnahmen gleichzeitig. Ausgewiesen ist die gemessene Veränderung im Zeitraum, nicht die Wirkung einer einzelnen Einheit.";
