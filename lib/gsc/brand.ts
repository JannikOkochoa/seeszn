// ─── Markenerkennung in Suchanfragen ──────────────────────────────────────────
// Die einzige Stelle, an der entschieden wird, ob eine Suchanfrage eine
// Marken-Suche ist. Bewusst keine verstreuten String-Prüfungen: sowohl die
// GSC-Abfrage (RE2-Filter) als auch die Auswertung im Dashboard lesen von hier.
//
// Warum die Unterscheidung zählt: Marken-Suchen finden das Unternehmen, weil
// man es bereits kennt. Nicht-Marken-Suchen sind die eigentliche SEO-Leistung
// - dort entsteht neue Nachfrage. Beides in einer Zahl zu mischen verdeckt
// genau diesen Unterschied.

/**
 * Schreibvarianten des Markennamens, wie sie tatsächlich in Suchanfragen
 * vorkommen. Es genügt der Wortstamm: gesucht wird als Teilzeichenkette, damit
 * "klühspies reisen", "klassenfahrten klühspies" und "klühspies.de"
 * automatisch mitzählen, ohne dass jede Kombination hier stehen muss.
 *
 * Neue Varianten (Tippfehler, die in den Daten auftauchen) gehören hierher -
 * und nirgendwo sonst.
 */
export const BRAND_VARIANTS: readonly string[] = [
  "klühspies",
  "kluehspies",
  "klühspieß",
  "kluehspiess",
  "klüspies",
  "kluespies",
  "klühspiess",
  "kluhspies",
];

export const BRAND_LABEL = "Klühspies";

/**
 * Vereinheitlicht eine Suchanfrage für den Vergleich: Kleinschreibung,
 * Umlaute und ß ausgeschrieben, alles Übrige entfernt. Dadurch fallen
 * "Klühspies", "kluehspies" und "klüh spies" auf dieselbe Form zusammen.
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "");
}

const NORMALIZED_VARIANTS = Array.from(new Set(BRAND_VARIANTS.map(normalizeQuery)));

/** true = die Suchanfrage enthält den Markennamen in irgendeiner Schreibweise. */
export function isBrandedQuery(query: string): boolean {
  const normalized = normalizeQuery(query);
  return NORMALIZED_VARIANTS.some((variant) => normalized.includes(variant));
}

/** RE2-Metazeichen escapen (Google nutzt RE2 für die Query-Filter). */
function escapeRe2(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * RE2-Muster für Googles dimensionFilter auf der Query-Dimension. Nicht
 * verankert: der Markenname darf an beliebiger Stelle der Suchanfrage stehen.
 * (?i) macht die Suche unabhängig von der Schreibweise, auch wenn Google
 * Suchanfragen ohnehin klein ausliefert.
 */
export function brandQueryRegex(): string {
  return `(?i)(${BRAND_VARIANTS.map(escapeRe2).join("|")})`;
}
