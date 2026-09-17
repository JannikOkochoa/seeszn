// ─── MOVES: BACKLINKS ─────────────────────────────────────────────────────────
// Preis, Staffel und Rechenweg des Backlink-Produkts. Einzige Quelle: Oberfläche,
// CTA, Checkout und Structured Data lesen ausschließlich hier.
//
// Gerechnet wird durchgehend in Cent als ganze Zahl. Ein Prozentabzug auf
// Gleitkommazahlen liefert in JavaScript Werte wie 161.10000000000002, und ein
// solcher Wert darf weder angezeigt noch an Stripe gereicht werden.
//
// MENGENSTUFEN, KEINE KURVE
// Der Stückpreis wird nicht mehr zwischen Ankern interpoliert. Er ist je
// Mengenstufe ein fester Wert und ändert sich ausschließlich an der Schwelle
// zur nächsten Stufe. Wählbar bleibt trotzdem jede ganze Menge: der Regler
// steht weiter auf Schrittweite 1, und 17 Stück sind 17 Stück zum Preis der
// Stufe 10 bis 19.
//
// Zwei Eigenschaften müssen über die gesamte Staffel gelten, und der Test in
// tests/backlink-pricing.test.mjs prüft beide für jede einzelne Menge:
//
//   1. Der Gesamtpreis steigt streng. Eine Einheit mehr kostet nie weniger.
//   2. Der Stückpreis steigt nie. Er fällt nur an den Stufenschwellen.
//
// Die zweite Eigenschaft allein genügt nicht. Fällt der Stückpreis an einer
// Schwelle zu stark, wird der Gesamtpreis dort billiger, obwohl die Menge
// steigt. Die Stufenwerte unten sind genau so gewählt, dass das nicht passiert.
//
// Die Monatsstaffel ist eine eigene, gepflegte Tabelle und wird NICHT aus der
// Einmalstaffel gerechnet. Sie liegt je Stufe rund zehn Prozent darunter,
// deshalb steht am Schalter "ca. 10 % günstiger" und nicht "10 %".

export type PurchaseMode = "once" | "monthly";

/** Die Formate. Gleicher Preis, deshalb keine Preislogik daran. */
export type BacklinkType = "mix" | "nad" | "blog" | "forum";

export const BACKLINK_TYPES: readonly { id: BacklinkType; label: string; note: string }[] = [
  { id: "mix", label: "SMART MIX", note: "Verteilung über alle drei Formate, nach Zielmarkt gewichtet." },
  { id: "nad", label: "NAD", note: "Name, Adresse, Domain. Einträge in Verzeichnissen und Registern." },
  { id: "blog", label: "BLOG", note: "Beiträge auf redaktionell geführten Blogs im Themenumfeld." },
  { id: "forum", label: "FORUM", note: "Beiträge in moderierten Fachforen und Communities." },
];

/**
 * Der Abzug auf die Monatsstaffel, gerundet. Er ist eine Beschreibung der
 * Tabelle, keine Rechenvorschrift: die tatsächlichen Abzüge liegen zwischen
 * 9,5 % und 9,9 %.
 */
export const MONTHLY_DISCOUNT_APPROX_PERCENT = 10;

/** Eine Mengenstufe: ab `from` Stück gilt `unitCents` je Backlink. */
interface Tier {
  readonly from: number;
  readonly unitCents: number;
}

/** Die Einmalstaffel. Feste Stückpreise je Stufe, nicht abgeleitet. */
const ONE_TIME_TIERS: readonly Tier[] = [
  { from: 5, unitCents: 1_980 },
  { from: 10, unitCents: 1_790 },
  { from: 20, unitCents: 1_775 },
  { from: 30, unitCents: 1_750 },
  { from: 50, unitCents: 1_720 },
  { from: 75, unitCents: 1_700 },
  { from: 100, unitCents: 1_690 },
];

/**
 * Die Monatsstaffel. Eigene Stückpreise, rund zehn Prozent unter der
 * Einmalstaffel. Fünf Stück gibt es hier nicht: eine Monatsmenge unterhalb von
 * zehn ist betrieblich nicht sinnvoll.
 */
const MONTHLY_TIERS: readonly Tier[] = [
  { from: 10, unitCents: 1_610 },
  { from: 20, unitCents: 1_595 },
  { from: 30, unitCents: 1_575 },
  { from: 50, unitCents: 1_545 },
  { from: 75, unitCents: 1_525 },
  { from: 100, unitCents: 1_520 },
];

/** Die Monatsstaffel beginnt bei 10. Fünf gibt es nur einmalig. */
export const MIN_QUANTITY: Record<PurchaseMode, number> = { once: 5, monthly: 10 };

/** Bis hierher rechnet die Seite selbst. Darüber entscheidet ein Mensch. */
export const MAX_SELF_SERVICE = 100;

/** Mindestlaufzeit der Monatsstaffel. Steht am Preis, nicht in den Bedingungen. */
export const MIN_TERM_MONTHS = 3;

function tiersFor(mode: PurchaseMode): readonly Tier[] {
  return mode === "monthly" ? MONTHLY_TIERS : ONE_TIME_TIERS;
}

/**
 * Der Stückpreis einer Menge: der Wert der höchsten Stufe, die sie erreicht.
 * Die Tabellen stehen aufsteigend, deshalb wird von hinten gesucht.
 */
function unitCentsFor(mode: PurchaseMode, quantity: number): number {
  const tiers = tiersFor(mode);
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (quantity >= tiers[i]!.from) return tiers[i]!.unitCents;
  }
  return tiers[0]!.unitCents;
}

/**
 * Die beschrifteten Stufenschwellen unter der Schiene. NICHT die wählbaren
 * Mengen: sonst stünden 96 Zahlen unter dem Regler.
 */
export function anchorQuantities(mode: PurchaseMode): readonly number[] {
  return tiersFor(mode).map((t) => t.from);
}

export interface Price {
  quantity: number;
  mode: PurchaseMode;
  /** Gesamtpreis in Cent. Der Wert, der an Stripe geht. */
  totalCents: number;
  /** Stückpreis der Mengenstufe in Cent. Der angezeigte Wert. */
  unitCents: number;
  /**
   * Ersparnis gegenüber derselben Menge einmalig. Null bei Einmalkauf.
   * Kommt aus der Differenz beider Kurven, nicht aus einem Prozentsatz.
   */
  savingCents: number;
}

/**
 * Der Preis einer Konfiguration. `null` außerhalb der Selbstbedienung; dort
 * übernimmt die Custom-Anfrage, und es wird nichts hochgerechnet.
 *
 * Menge mal Stufenpreis, beides ganze Zahlen. Es wird nichts gerundet, weil
 * nichts zu runden ist.
 */
export function priceFor(quantity: number, mode: PurchaseMode): Price | null {
  if (!Number.isInteger(quantity)) return null;
  if (quantity < MIN_QUANTITY[mode] || quantity > MAX_SELF_SERVICE) return null;

  const unitCents = unitCentsFor(mode, quantity);
  const totalCents = unitCents * quantity;

  return {
    quantity,
    mode,
    totalCents,
    unitCents,
    savingCents:
      mode === "monthly"
        ? Math.max(0, unitCentsFor("once", quantity) * quantity - totalCents)
        : 0,
  };
}

/** Die Preise an den Stufenschwellen. Für die Staffelansicht. */
export function priceTable(mode: PurchaseMode): readonly Price[] {
  return anchorQuantities(mode).map((q) => priceFor(q, mode)!);
}

// ── Anzeige ───────────────────────────────────────────────────────────────────
// Deutsches Zahlenformat, wie überall sonst auf der Seite (2.490 €). Ganze Euro
// stehen ohne Nachkommastellen, gebrochene Beträge mit zweien. Ein "161,00 €"
// neben einem "525 €" wäre Rauschen.

const nf = (locale: string, min: number, max: number) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: min, maximumFractionDigits: max });

/**
 * Betrag ohne Währungszeichen. Ganze Euro stehen ohne Nachkommastellen, weil
 * "179,00 €" neben "525 €" nur Rauschen wäre. Beträge mit Cent tragen zwei
 * Stellen: bei einem Stückpreis wie 17,75 € trifft das jede Menge, die kein
 * Vielfaches davon ist.
 */
export function amountIn(cents: number, locale: "de" | "en" = "de"): string {
  const whole = cents % 100 === 0;
  const l = locale === "en" ? "en-GB" : "de-DE";
  return nf(l, whole ? 0 : 2, whole ? 0 : 2).format(cents / 100);
}

/** Betrag mit Währungszeichen in der Stellung der jeweiligen Sprache. */
export function euroIn(cents: number, locale: "de" | "en" = "de"): string {
  return locale === "en" ? `€${amountIn(cents, "en")}` : `${amountIn(cents, "de")} €`;
}

/** Stückpreis. Immer zwei Nachkommastellen, weil er verglichen wird. */
export function unitEuroIn(cents: number, locale: "de" | "en" = "de"): string {
  const l = locale === "en" ? "en-GB" : "de-DE";
  const n = nf(l, 2, 2).format(cents / 100);
  return locale === "en" ? `€${n}` : `${n} €`;
}

/** Kurzformen für den deutschen Servercode, der keine Sprache kennt. */
export const amount = (cents: number) => amountIn(cents, "de");
export const euro = (cents: number) => euroIn(cents, "de");
export const unitEuro = (cents: number) => unitEuroIn(cents, "de");

export type ManualQuantityResult =
  | { kind: "valid"; quantity: number }
  | { kind: "custom"; requested: number }
  | { kind: "invalid" };

/**
 * Liest die von Hand eingetippte Menge.
 *
 * Geteilt zwischen der Preisfläche und ihren Tests, weil die Regeln hier
 * exakt festliegen und nirgendwo sonst dupliziert werden sollen:
 *
 *   - nur Ziffern, optional ein führendes Minus. Kommastellen, Buchstaben,
 *     Leerzeichen und ein leeres Feld sind ungültig und lösen kein Ergebnis
 *     aus; die aufrufende Stelle fällt dann auf den zuletzt bestätigten Wert
 *     zurück.
 *   - eine gültige ganze Zahl unterhalb der Mindestmenge wird auf die
 *     Mindestmenge angehoben, nicht verworfen. Wer "0" oder "1" eintippt,
 *     meint erkennbar eine kleine Menge, keinen Fehler.
 *   - eine gültige ganze Zahl oberhalb von 100 ist kein Rechenfall mehr,
 *     sondern eine Anfrage: sie schaltet in den Custom-Zustand und trägt die
 *     eingegebene Zahl als Kontext für die Anfrage weiter, ohne dass daraus
 *     ein erfundener Preis entsteht.
 */
export function parseManualQuantity(raw: string, mode: PurchaseMode): ManualQuantityResult {
  const trimmed = raw.trim();
  if (!/^-?\d+$/.test(trimmed)) return { kind: "invalid" };

  const n = Number(trimmed);
  if (!Number.isSafeInteger(n)) return { kind: "invalid" };

  if (n > MAX_SELF_SERVICE) return { kind: "custom", requested: n };

  const min = MIN_QUANTITY[mode];
  return { kind: "valid", quantity: Math.min(MAX_SELF_SERVICE, Math.max(min, n)) };
}

// ── Die Auswahl, wie sie in den Checkout geht ─────────────────────────────────

export interface BacklinkSelection {
  product: "backlinks";
  purchaseMode: PurchaseMode;
  quantity: number;
  /** Gesamtpreis in Cent, serverseitig neu berechnet. */
  totalCents: number;
  /** Stückpreis in Cent, gerundet. */
  unitCents: number;
  market: string;
  backlinkType: BacklinkType;
}

/**
 * Prüft eine Konfiguration und gibt die maßgeblichen Preise zurück.
 *
 * Diese Funktion ist der Grund, warum der Client keinen Preis schicken muss und
 * auch keinen schicken darf: der Server nimmt Menge, Kaufart, Markt und Format
 * entgegen und rechnet den Preis selbst aus der Tabelle oben. Ein manipulierter
 * Body kann damit keinen Betrag setzen.
 */
export function resolveSelection(input: {
  purchaseMode?: unknown;
  quantity?: unknown;
  market?: unknown;
  backlinkType?: unknown;
}): BacklinkSelection | null {
  const mode: PurchaseMode = input.purchaseMode === "monthly" ? "monthly" : "once";
  const quantity = typeof input.quantity === "number" ? input.quantity : Number(input.quantity);
  if (!Number.isInteger(quantity)) return null;

  const price = priceFor(quantity, mode);
  if (!price) return null;

  const type = BACKLINK_TYPES.find((t) => t.id === input.backlinkType)?.id ?? "mix";
  const market = typeof input.market === "string" ? input.market.slice(0, 8).toUpperCase() : "DE";

  return {
    product: "backlinks",
    purchaseMode: mode,
    quantity: price.quantity,
    totalCents: price.totalCents,
    unitCents: price.unitCents,
    market,
    backlinkType: type,
  };
}

/** Produktschlüssel für Stripe und für die Bestellung. */
export function selectionSku(selection: BacklinkSelection): string {
  return `backlinks-${selection.purchaseMode}-${selection.quantity}`;
}
