// ─── MOVES: Typen der kommerziellen Schicht ───────────────────────────────────
// MOVES ist die Fläche, auf der ausgewählte Umsetzung direkt beauftragt wird,
// ohne Gespräch davor. Sie ergänzt den bestehenden Kaufweg (First Move), sie
// ersetzt ihn nicht: dort steht die Diagnose vor der Umsetzung, hier steht die
// Umsetzung für sich.
//
// Vokabular: ein Move ist eine abgegrenzte Umsetzung mit festem Umfang, festem
// Preis und dokumentiertem Nachweis. Derselbe Begriff wie auf der Startseite.

/** Die vier Flächen, auf denen ein Signal entstehen kann. */
export type MoveCategoryId = "authority" | "press" | "mentions" | "content";

/**
 * Die drei Kaufarten. Sie unterscheiden sich in der Bindung, nicht in der
 * Qualität: `one` ist eine Umsetzung, `momentum` ist laufende Umsetzung,
 * `system` ist ein zugeschnittenes Programm ohne Listenpreis.
 */
export type PurchaseMode = "one" | "momentum" | "system";

/** Abrechnungsart, wie Stripe sie kennt. `none` heißt: kein Online-Kauf. */
export type Billing = "once" | "monthly" | "none";

export interface MoveTier {
  mode: PurchaseMode;
  /** Stabiler Produktschlüssel. Wird an Stripe und an die Bestellung gereicht. */
  sku: string;
  /** Kurzname der Kaufart, wie er in der Auswahl steht. */
  name: string;
  /** Eine Zeile, die den Unterschied zur Nachbarstufe erklärt. */
  kicker: string;
  billing: Billing;
  /**
   * Nettopreis in Euro. `null` heißt: Preis nach Umfang, kein Online-Kauf.
   * Die Zahl ist die einzige Quelle; Anzeige und Structured Data lesen daraus.
   */
  priceEur: number | null;
  /** Anzeigeform, deutsches Zahlenformat. */
  priceDisplay: string;
  /** Was neben dem Preis steht: "netto, einmalig" oder "netto pro Monat". */
  priceNote: string;
  /** Für wen diese Stufe die richtige ist. Ein Satz. */
  bestFor: string;
  /** Umfang dieser Stufe. Drei bis sieben Zeilen, keine Marketingfloskeln. */
  deliverables: readonly string[];
  /** Lieferzeit oder Rhythmus. */
  timing: string;
  /** Bindung und Kündigung. Steht sichtbar an der Stufe, nicht nur in der FAQ. */
  commitment: string;
  /** Beschriftung der Handlung. */
  cta: string;
}

export interface ProcessStep {
  n: string;
  label: string;
  body: string;
  /** Aufwand auf Kundenseite, falls relevant. */
  effort?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

/** Eine kontextuelle Erweiterung. Genau eine je Produktseite. */
export interface Extension {
  /** Die Überschrift benennt den Grund, nicht das Produkt. */
  headline: string;
  body: string;
  targetCategory: MoveCategoryId;
  cta: string;
}

export interface MoveCategory {
  id: MoveCategoryId;
  slug: string;
  /** Laufende Nummer in der Übersicht. */
  index: string;
  /** Rubrikname in Versalien. */
  label: string;
  /** Wo das Signal entsteht. Eine Zeile für die Übersicht. */
  axis: string;
  /** Die Zeile in der Übersichtstabelle. */
  oneLiner: string;

  /** Überschrift, zweiteilig. `accentWord` steht in der Serifenschrift. */
  h1: string;
  accentWord: string;
  h1Tail?: string;
  /** Der Satz unter der Überschrift. */
  lead: string;
  /**
   * Die zitierfähige Definition. Bewusst 40 bis 60 Wörter am Stück, damit sie
   * als Ganzes aus der Seite gelöst werden kann.
   */
  definition: string;
  /** Drei kurze Belege im Kopfbereich. Keine Zahl ohne Quelle. */
  headFacts: readonly string[];

  tiers: readonly MoveTier[];
  process: readonly ProcessStep[];
  /** Was diese Fläche ausdrücklich nicht leistet. Steht sichtbar auf der Seite. */
  limits: readonly string[];
  /** Woran der Effekt gemessen wird. Nie ein Ranking. */
  measured: readonly string[];
  extension: Extension;
  faq: readonly FaqItem[];

  meta: { title: string; description: string };
}
