// ─── First Move: der Kontextübergang zwischen Startseite und Kaufweg ──────────
// Die Prüfung läuft auf der Startseite, die Anfrage liegt auf /first-move. Ohne
// Brücke käme der Besucher dort mit leeren Händen an und müsste seine Domain ein
// zweites Mal eintippen, obwohl er sie gerade eingegeben hat.
//
// Was diese Datei transportiert, ist genau das, was der Besucher schon gesehen
// hat: die normalisierte Domain, die Kontext-ID des Scans, den öffentlichen
// Befund und den Diagnosezustand. Nichts davon ist neu, nichts davon ist mehr,
// als bereits auf dem Bildschirm stand.
//
// Regeln:
//   1. Nichts davon steht in der URL. Ein Befund gehört niemandem außer dem
//      Besucher, und eine URL wird geteilt, geloggt und weitergereicht.
//   2. sessionStorage, nicht localStorage. Der Übergang gilt für diesen Tab und
//      diese Sitzung; ein geschlossener Tab lässt nichts zurück.
//   3. Eine eigene Lebensdauer von sechs Stunden, dieselbe wie die des
//      serverseitigen Scan-Kontexts (lib/first-move/scanStore). Danach gilt der
//      Übergang als nicht vorhanden, auch wenn der Eintrag noch existiert. Die
//      30-Tage-Grenze der Scan-Daten bleibt davon unberührt: hier wird nichts
//      länger gehalten, sondern deutlich kürzer.
//   4. Die Kontext-ID ist die id des öffentlichen Befunds. Es gibt keine Route,
//      die damit etwas ausliefert; sie erlaubt dem Server nur, seine eigene,
//      bereits vorhandene Auswertung wiederzufinden.

import type { PublicDiagnosis } from "./diagnosis";
import type { FmLocale } from "./copy";
import type { PublicFinding } from "./types";

const KEY = "seeszn-first-move-handoff";
const VERSION = 1;

/** Sechs Stunden, gleichlaufend mit dem serverseitigen Scan-Kontext. */
const TTL_MS = 6 * 60 * 60 * 1000;

/** Wofür der Besucher weitergegangen ist. */
export type HandoffIntent = "checkout" | "review";

export interface ScanHandoff {
  v: typeof VERSION;
  /** Die normalisierte Domain, wie der Server sie gelesen hat. */
  domain: string;
  /** Die Kontext-ID des Scans. Fehlt, wenn kein qualifizierter Befund entstand. */
  contextId?: string;
  finding: PublicFinding | null;
  diagnosis: PublicDiagnosis;
  /** Kategorie und Art des Ergebnisses, für Anzeige und Auswertung. */
  category: string;
  kind: string;
  /** Sicherheitsband oder, bei dünner Evidenz, die benannte Grenze. */
  confidence: string;
  limitation?: string;
  /** Die nächste Prüfroute, so wie sie dem Besucher angezeigt wurde. */
  verificationRoute: string;
  intent: HandoffIntent;
  locale: FmLocale;
  createdAt: number;
}

/** Legt den Übergang für diesen Tab ab. Wirft nie. */
export function saveHandoff(input: Omit<ScanHandoff, "v" | "createdAt">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ScanHandoff = { ...input, v: VERSION, createdAt: Date.now() };
    window.sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* Privater Modus oder volles Kontingent: der Kaufweg läuft auch ohne. */
  }
}

/**
 * Liest den Übergang. Ein abgelaufener oder fremdformatiger Eintrag gilt als
 * nicht vorhanden und wird dabei entfernt.
 */
export function readHandoff(): ScanHandoff | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ScanHandoff>;
    if (parsed?.v !== VERSION || typeof parsed.createdAt !== "number") {
      window.sessionStorage.removeItem(KEY);
      return null;
    }
    if (Date.now() - parsed.createdAt > TTL_MS) {
      window.sessionStorage.removeItem(KEY);
      return null;
    }
    if (typeof parsed.domain !== "string" || !parsed.diagnosis) {
      window.sessionStorage.removeItem(KEY);
      return null;
    }
    return parsed as ScanHandoff;
  } catch {
    return null;
  }
}

/** Entfernt den Übergang, etwa nach einer abgeschickten Anfrage. */
export function clearHandoff(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nichts zu tun */
  }
}
