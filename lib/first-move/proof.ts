// ─── First Move: Proof ────────────────────────────────────────────────────────
// Drei kompakte Belegmodule, keine ausgelagerten Case Studies im Kaufweg.
//
// Zwei Regeln, die hier nicht verhandelbar sind:
//
//   1. Vertrauliche Kunden heißen "Client confidential". Das Wort für die
//      Unkenntlichmachung eines Kunden kommt in sichtbarer Copy nicht vor. Die
//      Geschichte ist der überprüfbare Kontext, nicht das fehlende Logo.
//   2. Der SCALE-Case nennt niemals eine Umsatzzahl und behauptet nie, SEESZN
//      habe den Account bereits 2020 als Unternehmen betreut. Die Expertise
//      liegt bei Philipp Ehrhardt, heute Paid Acquisition bei SEESZN.

import { ASSETS } from "./product";
import type { FirstMoveRoute, SurfaceKind } from "./types";

export interface ProofCase {
  id: "build" | "transform" | "scale";
  label: string;
  name: string;
  descriptor: string;
  /** Der eine große Wert. Bewusst nicht der größte, sondern der aussagekräftigste. */
  leadValue: string;
  leadCaption: string;
  secondary: { value: string; caption: string }[];
  /** Kleine Zeile unter der Karte, z. B. Vertraulichkeit oder Attribution. */
  note?: string;
  attribution?: string;
  image: string | null;
  imageAlt: string;
  /** Aufklappbare Methodik. Zeitraum, Messgröße, Quelle, Methodik, Attribution. */
  evidence: { label: string; value: string }[];
}

export const PROOF_CASES: Record<ProofCase["id"], ProofCase> = {
  transform: {
    id: "transform",
    label: "TRANSFORM",
    name: "Established DACH Tourism Provider",
    descriptor: "DACH · SEO + AI Search",
    leadValue: "5,3 → 2,2",
    leadCaption: "Average Position in AI Search",
    secondary: [{ value: "45 Tage", caption: "Messzeitraum" }],
    note: "Client confidential",
    image: ASSETS.transform,
    imageAlt: "Mittelmeerküste mit Felsen im Wasser, Motiv des Tourismus-Cases.",
    evidence: [
      { label: "Zeitraum", value: "45 Tage, Messung vorher und nachher" },
      { label: "Messgröße", value: "Durchschnittliche Position der Marke innerhalb eines konstanten Prompt-Sets" },
      { label: "Quellen", value: "ChatGPT, Gemini, Perplexity, Google AI Overviews" },
      {
        label: "Methodik",
        value:
          "Dasselbe Prompt-Set, dieselbe Messlogik und dieselbe Auswertung vor und nach der Umsetzung. Keine nachträglich hinzugefügten Prompts.",
      },
      {
        label: "Grenzen",
        value:
          "Antwortsysteme sind nicht deterministisch. Die Zahl beschreibt die gemessene Veränderung im Prompt-Set, keine garantierte Nennung.",
      },
    ],
  },
  build: {
    id: "build",
    label: "BUILD",
    name: "French Beret",
    descriptor: "E-Commerce · International · SEO + GEO",
    leadValue: "3.59K",
    leadCaption: "Organic Clicks in 3 Monaten",
    // Ø 8,3 steht bewusst nicht mehr auf der Karte: eine durchschnittliche
    // Position über alle Queries hinweg ist als Marketingzahl schwach und lenkt
    // vom Leitwert ab. Als Kontext bleibt sie in der Methodik erhalten.
    secondary: [{ value: "752K", caption: "Google Impressions" }],
    image: ASSETS.build,
    imageAlt: "Produktaufnahme aus dem French-Beret-Sortiment.",
    evidence: [
      { label: "Zeitraum", value: "3 Monate nach Aufbau der Suchoberfläche" },
      {
        label: "Messgröße",
        value:
          "Organische Klicks als Leitwert, Impressionen als Kontext. Die durchschnittliche Position über alle Queries lag bei 8,3 und ist nur als Kontextwert dokumentiert.",
      },
      { label: "Quelle", value: "Google Search Console, Property des Shops" },
      {
        label: "Methodik",
        value:
          "Aufbau von Sucharchitektur und zitierfähigen Inhalten für einen international ausgerichteten Shop. Klicks sind der Leitwert, weil sie tatsächliche Nachfrage abbilden.",
      },
    ],
  },
  scale: {
    id: "scale",
    label: "SCALE",
    name: "European B2B Workspace Brand",
    descriptor: "DACH · Google Ads",
    leadValue: "2,5 bis 3,0 Mio. €",
    leadCaption: "Annual Media Spend",
    secondary: [
      { value: "167 bis 216 € → 100 bis 130 €", caption: "CPL" },
      { value: "14K → 37K", caption: "Conversion Value" },
    ],
    note: "Client confidential",
    attribution: "Led by Philipp Ehrhardt · Paid Acquisition at SEESZN",
    image: ASSETS.scale,
    imageAlt: "Arbeitsumgebung der europäischen B2B-Workspace-Marke.",
    evidence: [
      { label: "Zeitraum", value: "2020 bis 2025" },
      { label: "Messgrößen", value: "Cost per Lead und Conversion Value im Google-Ads-Account" },
      { label: "Quelle", value: "Google Ads Account des Kunden" },
      {
        label: "Attribution",
        value:
          "Verantwortet von Philipp Ehrhardt, heute Full-Time Paid Acquisition bei SEESZN. Die Arbeit begann vor seiner Zeit bei SEESZN, die Kompetenz ist heute Teil des Teams.",
      },
      {
        label: "Grenzen",
        value:
          "Über fünf Jahre wirken Markt, Produkt und Nachfrage mit. Wir weisen die Paid-Kennzahlen aus, keine Gesamtwirkung des Unternehmens.",
      },
    ],
  },
};

/** Reihenfolge auf der Master-Seite. */
export const MASTER_PROOF_ORDER: ProofCase["id"][] = ["transform", "build", "scale"];

/** Reihenfolge auf der Google-Ads-Seite. Paid zuerst. */
export const PAID_PROOF_ORDER: ProofCase["id"][] = ["scale", "transform", "build"];

/**
 * Welcher Case nach einem öffentlichen Signal zuerst gezeigt wird. Nicht alle
 * drei auf einmal: relevant ist der, der zur gefundenen Situation passt. Die
 * übrigen bleiben über "Weitere Ergebnisse ansehen" und den Proof-Abschnitt
 * erreichbar.
 */
export function relevantCaseId(
  route: FirstMoveRoute | undefined,
  surfaceKind?: SurfaceKind,
): ProofCase["id"] {
  if (route === "paid_acquisition") return "scale";
  if (surfaceKind === "commerce") return "build";
  return "transform";
}
