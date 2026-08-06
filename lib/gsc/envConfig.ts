// ─── Env-Werte robust lesen ───────────────────────────────────────────────────
// Reine Hilfsfunktionen, bewusst ohne server-only: so sind sie einzeln testbar.

/**
 * Räumt einen Env-Wert auf, der versehentlich seinen eigenen Namen enthält.
 *
 * In Hosting-Oberflächen wird beim Anlegen einer Variablen gern die ganze
 * Zeile "NAME=wert" in das Wertfeld kopiert. Der Wert lautet dann "NAME=wert"
 * – syntaktisch gültig, fachlich Unsinn. Bei GOOGLE_GSC_PROPERTY führte genau
 * das dazu, dass jede einzelne Google-Abfrage mit HTTP 400 auflief, ohne dass
 * die Fehlermeldung auf die Ursache zeigte. Umschließende Anführungszeichen
 * werden ebenfalls entfernt.
 */
export function normalizeEnvValue(name: string, raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  let value = raw.trim().replace(/^["']|["']$/g, "");
  if (value.startsWith(`${name}=`)) {
    value = value.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
  }
  return value || undefined;
}

/** Eine Property ist entweder eine Domain-Property oder eine URL-Property. */
export function isValidProperty(value: string | undefined): value is string {
  return typeof value === "string" && /^(sc-domain:|https?:\/\/)/.test(value);
}
