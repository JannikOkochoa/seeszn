// ─── MOVES: Zielmärkte ────────────────────────────────────────────────────────
// Der Zielmarkt entscheidet, in welchem Sprach- und Länderraum Quellen gesucht
// werden. Er gehört deshalb an die Konfiguration und nicht in ein Briefing nach
// dem Kauf.
//
// Die Liste ist bewusst eine flache Datenstruktur mit Aliassen: ein neuer Markt
// ist eine Zeile, kein Eingriff in die Komponente. Die Suche trifft Landesname,
// Eigenbezeichnung, ISO-Code und Domain-Endung, weil Einkäufer genau so tippen
// ("Deutschland", "DE", ".de").
//
// Automatische Vorauswahl: bewusst noch nicht verdrahtet. Es gibt in diesem
// Projekt keinen Geo-Dienst, und ein erfundener Aufruf wäre schlechter als
// keiner. `detectMarket` ist die eine Stelle, an der ein solcher Dienst später
// andockt; die Regel dahinter steht schon fest und ist getestet: eine manuelle
// Auswahl gewinnt immer gegen eine automatische.

export interface Market {
  /** ISO-3166-1 alpha-2, oder GLOBAL für die länderübergreifende Auswahl. */
  code: string;
  /** Deutscher Name. */
  label: string;
  /** Englischer Name. Gleich, wo die Sprachen sich nicht unterscheiden. */
  labelEn: string;
  flag: string;
  /** Schreibweisen, unter denen dieser Markt gefunden werden soll. */
  aliases: readonly string[];
}

export const MARKETS: readonly Market[] = [
  { code: "DE", label: "Deutschland", labelEn: "Germany", flag: "🇩🇪", aliases: ["germany", "deutschland", "de", "ger", "deu", ".de"] },
  { code: "AT", label: "Österreich", labelEn: "Austria", flag: "🇦🇹", aliases: ["austria", "oesterreich", "österreich", "at", "aut", ".at"] },
  { code: "CH", label: "Schweiz", labelEn: "Switzerland", flag: "🇨🇭", aliases: ["switzerland", "schweiz", "suisse", "ch", "che", ".ch"] },
  { code: "GB", label: "United Kingdom", labelEn: "United Kingdom", flag: "🇬🇧", aliases: ["united kingdom", "great britain", "england", "uk", "gb", "gbr", ".co.uk", ".uk"] },
  { code: "US", label: "United States", labelEn: "United States", flag: "🇺🇸", aliases: ["united states", "usa", "america", "us", "usa", ".com", ".us"] },
  { code: "FR", label: "Frankreich", labelEn: "France", flag: "🇫🇷", aliases: ["france", "frankreich", "fr", "fra", ".fr"] },
  { code: "ES", label: "Spanien", labelEn: "Spain", flag: "🇪🇸", aliases: ["spain", "spanien", "españa", "espana", "es", "esp", ".es"] },
  { code: "IT", label: "Italien", labelEn: "Italy", flag: "🇮🇹", aliases: ["italy", "italien", "italia", "it", "ita", ".it"] },
  { code: "NL", label: "Niederlande", labelEn: "Netherlands", flag: "🇳🇱", aliases: ["netherlands", "niederlande", "nederland", "holland", "nl", "nld", ".nl"] },
  { code: "TH", label: "Thailand", labelEn: "Thailand", flag: "🇹🇭", aliases: ["thailand", "th", "tha", ".th", ".co.th"] },
  { code: "GLOBAL", label: "Global", labelEn: "Global", flag: "🌐", aliases: ["global", "international", "worldwide", "weltweit", "eu"] },
];

export const DEFAULT_MARKET = "DE";

export function marketByCode(code: string): Market {
  return MARKETS.find((m) => m.code === code) ?? MARKETS[0]!;
}

/** Freitextsuche über Label, Code und Aliasse. Leere Eingabe gibt alles zurück. */
export function searchMarkets(query: string): readonly Market[] {
  const q = query.trim().toLowerCase();
  if (!q) return MARKETS;
  return MARKETS.filter(
    (m) =>
      m.label.toLowerCase().includes(q) ||
      m.labelEn.toLowerCase().includes(q) ||
      m.code.toLowerCase().startsWith(q) ||
      m.aliases.some((a) => a.includes(q) || q.includes(a)),
  );
}

/**
 * Vorauswahl des Marktes.
 *
 * Reihenfolge, und zwar endgültig:
 *   1. eine manuelle Auswahl des Besuchers
 *   2. ein erkanntes Land, sobald ein Dienst dafür existiert
 *   3. Deutschland
 *
 * Schritt 2 ist heute ein No-op. Sobald ein Header oder ein Dienst das Land
 * liefert, wird `detected` von außen übergeben; an dieser Funktion und an der
 * Komponente ändert sich dabei nichts.
 */
export function resolveMarket(input: { manual?: string | null; detected?: string | null }): string {
  if (input.manual && MARKETS.some((m) => m.code === input.manual)) return input.manual;
  if (input.detected && MARKETS.some((m) => m.code === input.detected)) return input.detected;
  return DEFAULT_MARKET;
}

/** Der Name in der jeweiligen Sprache. */
export function marketLabel(market: Market, locale: "de" | "en"): string {
  return locale === "en" ? market.labelEn : market.label;
}
