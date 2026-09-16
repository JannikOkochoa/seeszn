// ─── MOVES: BACKLINKS ─────────────────────────────────────────────────────────
// Preis, Staffel und Rechenweg des Backlink-Produkts. Einzige Quelle: Oberfläche,
// CTA, Checkout und Structured Data lesen ausschließlich hier.
//
// Gerechnet wird durchgehend in Cent als ganze Zahl. Ein Prozentabzug auf
// Gleitkommazahlen liefert in JavaScript Werte wie 161.10000000000002, und ein
// solcher Wert darf weder angezeigt noch an Stripe gereicht werden.
//
// Die Monatsstaffel ist eine eigene, gepflegte Tabelle und wird NICHT aus der
// Einmalstaffel gerechnet. Ein Abzug von exakt zehn Prozent liefert Beträge wie
// 161,10 € oder 472,50 €; das sind rechnerisch richtige und kaufmännisch
// schlechte Preise. Die Monatsbeträge unten sind glatt gewählt und liegen je
// nach Stufe zwischen 9,5 und 9,9 Prozent unter dem Einmalpreis.
//
// Genau deshalb steht am Schalter "ca. 10 % günstiger" und nicht "10 %".

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

/** Die Einmalstaffel. Feste Werte, nicht gerundet, nicht abgeleitet. */
const ONE_TIME_TOTALS: readonly { quantity: number; totalCents: number }[] = [
  { quantity: 5, totalCents: 9_900 },
  { quantity: 10, totalCents: 17_900 },
  { quantity: 20, totalCents: 35_500 },
  { quantity: 30, totalCents: 52_500 },
  { quantity: 50, totalCents: 84_900 },
  { quantity: 75, totalCents: 123_500 },
  { quantity: 100, totalCents: 159_900 },
];

/**
 * Die Monatsstaffel. Eigene Beträge, glatt gewählt. Fünf Stück gibt es hier
 * nicht: eine Monatsmenge unterhalb von zehn ist betrieblich nicht sinnvoll.
 */
const MONTHLY_TOTALS: readonly { quantity: number; totalCents: number }[] = [
  { quantity: 10, totalCents: 16_200 },
  { quantity: 20, totalCents: 32_000 },
  { quantity: 30, totalCents: 47_500 },
  { quantity: 50, totalCents: 76_500 },
  { quantity: 75, totalCents: 111_500 },
  { quantity: 100, totalCents: 144_500 },
];

/** Die Monatsstaffel beginnt bei 10. Fünf gibt es nur einmalig. */
export const MIN_QUANTITY: Record<PurchaseMode, number> = { once: 5, monthly: 10 };

/** Bis hierher rechnet die Seite selbst. Darüber entscheidet ein Mensch. */
export const MAX_SELF_SERVICE = 100;

/** Mindestlaufzeit der Monatsstaffel. Steht am Preis, nicht in den Bedingungen. */
export const MIN_TERM_MONTHS = 3;

/**
 * Die Ankerpunkte sind Stützstellen einer Kurve, keine Paketgrößen.
 *
 * Wählbar ist jede ganze Zahl von der Mindestmenge bis 100. Zwischen zwei
 * Ankern wird der STÜCKPREIS linear interpoliert, nicht der Gesamtpreis. Das
 * ist der entscheidende Unterschied: eine Gerade durch die Gesamtpreise ergäbe
 * zwischen den Ankern einen steigenden Stückpreis, und wer eine Einheit mehr
 * kauft, zahlte je Einheit mehr. Über den Stückpreis interpoliert fällt er auf
 * jeder ganzen Zahl.
 *
 * Der Gesamtpreis entsteht danach aus Menge × angezeigtem Stückpreis. Damit
 * passen die drei angezeigten Zahlen zueinander und niemand muss nachrechnen.
 *
 * Auf einem Anker gilt immer der Ankerwert, nie das Rechenergebnis.
 */
function anchorsFor(mode: PurchaseMode): readonly { quantity: number; totalCents: number }[] {
  return mode === "monthly" ? MONTHLY_TOTALS : ONE_TIME_TOTALS;
}

/** Kaufmännisch auf Cent runden, ohne die Gleitkomma-Eigenheiten. */
function roundCents(value: number): number {
  return Math.round(value + (value >= 0 ? 1e-9 : -1e-9));
}

/**
 * Die beschrifteten Stützstellen unter der Schiene. NICHT die wählbaren
 * Mengen: sonst stünden 96 Zahlen unter dem Regler.
 */
export function anchorQuantities(mode: PurchaseMode): readonly number[] {
  return anchorsFor(mode).map((t) => t.quantity);
}

export interface Price {
  quantity: number;
  mode: PurchaseMode;
  /** Gesamtpreis in Cent. Der Wert, der an Stripe geht. */
  totalCents: number;
  /** Stückpreis in Cent, ungerundet. Nur zum Rechnen. */
  unitCentsExact: number;
  /** Stückpreis in Cent, kaufmännisch gerundet. Der angezeigte Wert. */
  unitCents: number;
  /**
   * Ersparnis gegenüber derselben Menge einmalig. Null bei Einmalkauf.
   * Kommt aus der Differenz beider Kurven, nicht aus einem Prozentsatz.
   */
  savingCents: number;
}

/** Stückpreis zwischen zwei Ankern, daraus der Gesamtpreis. */
function interpolatedTotalCents(
  anchors: readonly { quantity: number; totalCents: number }[],
  quantity: number,
): number {
  let lower = anchors[0]!;
  let upper = anchors[anchors.length - 1]!;
  for (let i = 0; i < anchors.length - 1; i++) {
    if (quantity > anchors[i]!.quantity && quantity < anchors[i + 1]!.quantity) {
      lower = anchors[i]!;
      upper = anchors[i + 1]!;
      break;
    }
  }

  const lowerUnit = lower.totalCents / lower.quantity;
  const upperUnit = upper.totalCents / upper.quantity;
  const t = (quantity - lower.quantity) / (upper.quantity - lower.quantity);
  // Erst der Stückpreis auf Cent, dann daraus der Gesamtpreis: der angezeigte
  // Stückpreis ist genau der, mit dem gerechnet wurde.
  const unitCents = roundCents(lowerUnit + (upperUnit - lowerUnit) * t);
  return roundCents(unitCents * quantity);
}

/** Der Einmalpreis derselben Menge. Bezugsgröße der Monatsersparnis. */
function oneTimeTotalCents(quantity: number): number {
  const exact = ONE_TIME_TOTALS.find((a) => a.quantity === quantity);
  return exact ? exact.totalCents : interpolatedTotalCents(ONE_TIME_TOTALS, quantity);
}

/**
 * Der Preis einer Konfiguration. `null` außerhalb der Selbstbedienung; dort
 * übernimmt die Custom-Anfrage, und es wird nichts hochgerechnet.
 */
export function priceFor(quantity: number, mode: PurchaseMode): Price | null {
  if (!Number.isInteger(quantity)) return null;
  if (quantity < MIN_QUANTITY[mode] || quantity > MAX_SELF_SERVICE) return null;

  const anchors = anchorsFor(mode);
  const exact = anchors.find((a) => a.quantity === quantity);
  const totalCents = exact ? exact.totalCents : interpolatedTotalCents(anchors, quantity);
  const unitCents = roundCents(totalCents / quantity);

  return {
    quantity,
    mode,
    totalCents,
    unitCentsExact: totalCents / quantity,
    unitCents,
    savingCents: mode === "monthly" ? Math.max(0, oneTimeTotalCents(quantity) - totalCents) : 0,
  };
}

/** Die Ankerpreise einer Kaufart. Für die Staffelansicht. */
export function priceTable(mode: PurchaseMode): readonly Price[] {
  return anchorQuantities(mode).map((q) => priceFor(q, mode)!);
}

/** Die Mindestbindung der Monatsstaffel in Cent: drei Monatsbeträge. */
export function minimumCommitmentCents(monthlyTotalCents: number): number {
  return monthlyTotalCents * MIN_TERM_MONTHS;
}

// ── Anzeige ───────────────────────────────────────────────────────────────────
// Deutsches Zahlenformat, wie überall sonst auf der Seite (2.490 €). Ganze Euro
// stehen ohne Nachkommastellen, gebrochene Beträge mit zweien. Ein "161,00 €"
// neben einem "525 €" wäre Rauschen.

const nf = (locale: string, min: number, max: number) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: min, maximumFractionDigits: max });

/**
 * Betrag ohne Währungszeichen. Ganze Euro stehen ohne Nachkommastellen, weil
 * die Ankerpreise glatt sind und "179,00 €" neben "116,52 €" nur Rauschen wäre.
 * Zwischenbeträge tragen Cent, weil sie sonst die streng fallende Staffel
 * zerstören würden.
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
