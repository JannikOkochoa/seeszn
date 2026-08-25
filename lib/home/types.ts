// ─── Startseite: die Form der Copy ────────────────────────────────────────────
// Eine Struktur, zwei Sprachen. Die Komponenten kennen nur dieses Interface und
// bekommen den fertigen Datensatz als Prop. Damit steht in keiner visuellen
// Komponente eine Sprachbedingung, und jede Sprache ist an einer Stelle
// vollständig lesbar und prüfbar.
//
// Die Sprachregel des Systems bleibt in beiden Fassungen dieselbe:
//   Englisch für Produktnamen, Systemlabels und Metadaten.
//   Erklärender Text folgt der Sprache der Seite.
//   "First Move" wird nie übersetzt.

export interface HomeHero {
  eyebrow: string;
  line1: string;
  line2: string;
  accent: string;
  /** Geisterwort im Hintergrund. Ohne Satzzeichen. */
  ghost: string;
  lead: string;
  fieldLabel: string;
  placeholder: string;
  cta: string;
  /** Kurzform des CTA für den Produktkopf unter 600px. */
  ctaShort: string;
  ctaBusy: string;
  micro: string;
  emptyError: string;
  scanFailed: string;
}

export interface HomeConstraint {
  index: string;
  label: string;
  line1: string;
  line2: string;
  body: string;
  note: string;
  surfacesLabel: string;
  surfaces: readonly string[];
}

export interface HomeScan {
  index: string;
  label: string;
  title: string;
  question: string;
  sub: string;
  instrumentLabel: string;
  free: string;
  cta: string;
  again: string;
  checked: string;
  reads: string;
  readsList: readonly string[];
  trust: readonly string[];
  runningNote: string;
  idleNote: string;
  headings: { evidence: string; ruledOut: string; route: string };
  confidencePrefix: string;
  primaryCta: string;
  secondaryCta: string;
  scanningTitle: string;
  scanningFallback: string;
  scanningNote: string;
  stages: readonly { id: string; label: string; states: readonly string[] }[];
}

export interface HomeAnswers {
  index: string;
  label: string;
  line1: string;
  line2: string;
  definition: string;
  rows: readonly { num: string; label: string; title: string; body: string }[];
}

export interface HomeProof {
  index: string;
  label: string;
  line1: string;
  accent: string;
  lead: string;
  keys: {
    result: string;
    beforeAfter: string;
    metric: string;
    window: string;
    source: string;
    scope: string;
    limits: string;
  };
  caseLink: string;
  cases: Record<ProofCaseId, HomeProofCase>;
  order: readonly ProofCaseId[];
}

export type ProofCaseId = "transform" | "scale" | "build";

export interface HomeProofCase {
  name: string;
  descriptor: string;
  scope: string;
  href?: string;
  /**
   * Nur in der englischen Fassung gesetzt. Die Zahlen sind dieselben wie in
   * lib/first-move/proof.ts, geschrieben in englischer Konvention: Punkt als
   * Dezimaltrenner, Komma als Tausendertrenner. Ohne diese Angabe rendert die
   * Karte unverändert die Werte aus lib/first-move/proof.ts.
   *
   * tests/home-locales.test.mjs prüft, dass die Ziffernfolgen beider Fassungen
   * übereinstimmen. Eine englische Zahl kann damit nicht von der deutschen
   * Quelle wegdriften.
   */
  display?: {
    leadValue: string;
    leadCaption: string;
    secondary: readonly { value: string; caption: string }[];
    window?: string;
    metric?: string;
    source?: string;
    limits?: string;
    note?: string;
    attribution?: string;
  };
}

export interface HomeSystem {
  index: string;
  label: string;
  line1: string;
  accent: string;
  lead: string;
  stages: readonly { num: string; label: string; meta: string; body: string }[];
  note: string;
}

export interface HomeRecognition {
  index: string;
  label: string;
  line1: string;
  accent: string;
  items: readonly string[];
}

export interface HomeOffer {
  index: string;
  label: string;
  name: string;
  priceCaption: string;
  includedLabel: string;
  riskLabel: string;
  cta: string;
  ctaHref: string;
  /** Preis, Fakten und Zusagen in der Anzeigeform der jeweiligen Sprache. */
  price: string;
  priceFrame: string;
  pricePromise: string;
  facts: readonly { k: string; v: string }[];
  included: readonly string[];
  riskReversal: string;
  reassurance: readonly string[];
}

export interface HomeDecision {
  index: string;
  label: string;
  line1: string;
  line2: string;
  accent: string;
  body: string;
  cta: string;
  secondary: string;
}

export interface HomeContent {
  locale: "de" | "en";
  /** Sprungziel der Startseite selbst, für Anker und CTA-Ziele. */
  homePath: string;
  hero: HomeHero;
  trustStrip: readonly string[];
  constraint: HomeConstraint;
  scan: HomeScan;
  answers: HomeAnswers;
  proof: HomeProof;
  system: HomeSystem;
  recognition: HomeRecognition;
  offer: HomeOffer;
  decision: HomeDecision;
}
