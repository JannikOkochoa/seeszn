// ─── Domain aus einer Nutzereingabe lesen ─────────────────────────────────────
// Niemand tippt eine Domain zweimal gleich. Eingegeben wird, was gerade in der
// Adresszeile stand: mit Schema, mit www, mit Pfad, mit Parametern, manchmal mit
// einer Mailadresse darin. Der Nutzer soll nichts davon selbst wegräumen.
//
// Zurückgegeben wird die nackte, kleingeschriebene Domain. Abgelehnt wird nur,
// was beim besten Willen keine sein kann; im Zweifel wird angenommen. Eine zu
// strenge Prüfung kostet hier echte Anfragen, eine zu lockere kostet nichts:
// am Ende schaut ohnehin ein Mensch darauf.

/** Endungen, die häufiger vertippt als gemeint sind, bleiben trotzdem gültig. */
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function normalizeDomain(input: string): string | null {
  let value = input.trim().toLowerCase();
  if (!value) return null;

  // Eine Mailadresse statt einer Domain: den Teil hinter dem @ nehmen.
  if (value.includes("@") && !value.includes("/")) {
    value = value.slice(value.lastIndexOf("@") + 1);
  }

  // Schema, Zugangsdaten, Pfad, Query und Fragment entfernen.
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  value = value.replace(/^[^/@]*@/, "");
  value = value.split(/[/?#]/)[0] ?? "";
  // Port.
  value = value.split(":")[0] ?? "";
  // Ein führendes www gehört nicht zur Domain, ein Punkt am Ende auch nicht.
  value = value.replace(/^www\./, "").replace(/\.$/, "");

  if (!value || value.length > 253) return null;

  const labels = value.split(".");
  // Mindestens ein Punkt, und jede Stelle muss eine gültige Marke sein.
  if (labels.length < 2) return null;
  if (!labels.every((l) => LABEL.test(l))) return null;
  // Die Endung trägt keine Ziffern und ist mindestens zwei Zeichen lang.
  const tld = labels[labels.length - 1]!;
  if (tld.length < 2 || /\d/.test(tld)) return null;

  return value;
}

/** Sehr einfache Mailprüfung. Freemail ist ausdrücklich erlaubt. */
export function isEmail(input: string): boolean {
  const value = input.trim();
  return value.length > 4 && value.length <= 200 && /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/.test(value);
}
