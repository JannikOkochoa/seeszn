// ─── Wiedervorlage-Zeiten ─────────────────────────────────────────────────────
// Das CRM zeigt alle Zeitpunkte in Europe/Berlin an. Ein <input type=
// "datetime-local"> liefert dagegen eine nackte Ortszeit ohne Zone
// ("2026-09-15T10:30"). Würde man die mit new Date(...) parsen, gälte die
// Zeitzone des Servers — auf dem Entwicklungsrechner eine andere als in
// Production. Wer 10:30 einträgt, bekäme je nach Host eine andere Uhrzeit
// zurück angezeigt.
//
// Deshalb wird hier explizit in beide Richtungen über Europe/Berlin gerechnet:
// Eingabe wird als Berliner Zeit gelesen, Anzeige im Formular wieder als
// Berliner Zeit gerendert. Sommer- und Winterzeit kommen aus Intl, nicht aus
// einem festen Offset.

const ZONE = "Europe/Berlin";

/** Offset der Zone gegenüber UTC zum gegebenen Zeitpunkt, in Millisekunden. */
function zoneOffsetMs(instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, number> = {};
  for (const p of dtf.formatToParts(instant)) {
    if (p.type !== "literal") parts[p.type] = Number(p.value);
  }
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour % 24,
    parts.minute,
    parts.second,
  );
  return asUtc - instant.getTime();
}

/**
 * "2026-09-15T10:30" (Berliner Ortszeit) → ISO-Zeitpunkt in UTC.
 * Null, wenn der Wert nicht wie eine Ortszeit aussieht.
 */
export function berlinInputToIso(value: string): string | null {
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;

  const [year, month, day, hour, minute, second] = [m[1], m[2], m[3], m[4], m[5], m[6] ?? "0"].map(Number);

  // Date.UTC rollt Unsinn stillschweigend weiter — aus dem 45. Monat 13 würde
  // ein Datum im Folgejahr. Lieber nichts speichern als eine falsche
  // Wiedervorlage.
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;

  const naiveAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const rollover = new Date(naiveAsUtc);
  if (rollover.getUTCMonth() !== month - 1 || rollover.getUTCDate() !== day) return null;

  // Zwei Durchläufe: der erste schätzt den Offset, der zweite korrigiert ihn
  // für den Fall, dass die Schätzung auf der anderen Seite eines
  // Zeitumstellungssprungs lag.
  let instant = new Date(naiveAsUtc - zoneOffsetMs(new Date(naiveAsUtc)));
  instant = new Date(naiveAsUtc - zoneOffsetMs(instant));

  return Number.isNaN(instant.getTime()) ? null : instant.toISOString();
}

/**
 * ISO-Zeitpunkt → "2026-09-15T10:30" in Berliner Ortszeit, passend als
 * defaultValue eines datetime-local-Feldes.
 */
export function isoToBerlinInput(iso: string | null): string {
  if (!iso) return "";
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return "";

  const shifted = new Date(instant.getTime() + zoneOffsetMs(instant));
  return shifted.toISOString().slice(0, 16);
}
