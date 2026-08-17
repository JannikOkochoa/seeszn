// ─── Zielrouten für Produkt- und Diagnose-CTAs ────────────────────────────────
// Eine Stelle für die Frage "wohin führt ein CTA?", damit Header, Footer, Hero,
// Rooms, Services und Case Studies nicht jeder für sich entscheiden.
//
// Architektur seit August 2026:
//
//   Marketing / Editorial  →  Produktseite  →  Produkt erklärt  →  eingebettete
//   Prüfung  →  Anfrage
//
// Es gibt keine eigenständige Scan-Seite mehr im deutschen Baum. Die Prüfung ist
// ein Mechanismus des Produkts, kein eigenes Ziel: sie liegt im Abschnitt
// #sichtbarkeit-pruefen auf der Produktseite.
//
// Die Absicht des CTAs entscheidet über das Ziel:
//   productHref  generische CTAs ("First Move", "Mehr erfahren") → Seitenanfang
//   scanHref     Prüf-CTAs ("Sichtbarkeit prüfen", "Scan starten") → Instrument
//
// Englisch: es gibt noch keine englische Produktseite. /en/diagnosis bleibt
// deshalb die englische Konversionsfläche und wird bewusst nicht umgeleitet.
// Sobald eine englische Produktseite existiert, ändert sich nur diese Datei.

import { MASTER_PATH, PAID_PATH } from "@/lib/first-move/product";

export type LinkLocale = "de" | "en";

/** Sprungziel des eingebetteten Diagnose-Instruments auf beiden Produktseiten. */
export const SCAN_ANCHOR = "sichtbarkeit-pruefen";

/** Die englische Sichtbarkeitsprüfung. Eigenständiges Werkzeug, eigene API. */
export const EN_DIAGNOSIS_PATH = "/en/diagnosis";

/** Die deutsche Master-Produktseite. */
export const PRODUCT_PATH = MASTER_PATH;

/** Die Produktseite für den Paid-Acquisition-Kontext (CRO / Google Ads). */
export const PAID_PRODUCT_PATH = PAID_PATH;

/** Produktseite von oben: für CTAs ohne ausgesprochene Prüf-Absicht. */
export function productHref(locale: LinkLocale): string {
  return locale === "de" ? PRODUCT_PATH : EN_DIAGNOSIS_PATH;
}

/**
 * Produktseite am eingebetteten Instrument: für CTAs, deren Absicht ausdrücklich
 * die Prüfung ist. Der Anker hält die Absicht durch den Seitenwechsel.
 */
export function scanHref(locale: LinkLocale): string {
  return locale === "de" ? `${PRODUCT_PATH}#${SCAN_ANCHOR}` : EN_DIAGNOSIS_PATH;
}

/** Anfrage- und Kontaktfläche: der Fit Check am Ende des Kaufwegs. */
export function contactHref(locale: LinkLocale): string {
  return locale === "de" ? `${PRODUCT_PATH}#start` : EN_DIAGNOSIS_PATH;
}
