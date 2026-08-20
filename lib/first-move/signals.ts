// ─── First Move: die nicht-öffentlichen Signale ───────────────────────────────
// Nach der öffentlichen Prüfung und der Geschäftslage folgt der Schritt, der die
// Empfehlung präzise macht: der Abgleich mit den tatsächlichen Leistungsdaten.
//
// Die harte Regel dieser Datei: es gibt derzeit KEINE OAuth-Anbindung an Search
// Console, Analytics oder Google Ads. Deshalb steht hier auch kein Verbinden-
// Button, kein Ladezustand und keine Fortschrittsanzeige, die eine Verbindung
// andeutet. Ein CTA, der ins Leere führt, ist schlimmer als ein fehlender CTA.
// Dieselbe Regel setzt bereits `isAdsOAuthEnabled()` in ./paid durch.
//
// Was stattdessen passiert: die Quellen werden als das benannt, was sie sind,
// nämlich der Zugriff, den wir im Kickoff gemeinsam einrichten. Und der Funnel
// hat einen Weg, der ohne sie funktioniert. Ein Schritt, der ohne
// Datenverbindung nicht weitergeht, wäre eine Sackgasse mit Anmeldeformular.
//
// Wird eine Anbindung gebaut, wird `connectPath` gesetzt und `available` auf
// true gezogen. Erst beides zusammen macht aus einer Quelle eine Handlung.

export type SignalSourceId = "search_console" | "analytics" | "google_ads";

export interface SignalSource {
  id: SignalSourceId;
  label: string;
  /** Was diese Quelle beantwortet, was öffentlich unbeantwortbar bleibt. */
  answers: string;
  /**
   * Nur true, wenn eine echte Verbindungsroute existiert UND freigeschaltet ist.
   * Solange false, wird die Quelle als Bestandteil des Kickoffs beschrieben und
   * nicht als klickbare Verbindung.
   */
  available: boolean;
  /** Pfad der Verbindungsroute. Nur gesetzt, wenn sie wirklich existiert. */
  connectPath?: string;
}

export const SIGNAL_SOURCES: readonly SignalSource[] = [
  {
    id: "search_console",
    label: "Google Search Console",
    answers: "Für welche Suchanfragen ihr wirklich erscheint und wo Klicks verloren gehen.",
    available: false,
  },
  {
    id: "analytics",
    label: "Google Analytics 4",
    answers: "Was nach dem Klick passiert und an welcher Stelle der Weg abbricht.",
    available: false,
  },
  {
    id: "google_ads",
    label: "Google Ads",
    answers: "Welche Suchbegriffe Budget binden und welches Signal die Gebote steuert.",
    available: false,
  },
];

/** Gibt es überhaupt eine Quelle, die sich jetzt verbinden lässt? */
export function hasConnectableSource(sources: readonly SignalSource[] = SIGNAL_SOURCES): boolean {
  return sources.some((s) => s.available && Boolean(s.connectPath));
}

/**
 * Der Text des Schritts. Er erklärt den Gewinn, ohne zu drohen: mehr Daten
 * machen die Empfehlung präziser, ihr Fehlen macht sie nicht wertlos.
 */
export const SIGNALS_STEP = {
  label: "Schritt 03",
  headline: "Jetzt zählen die Signale, die öffentlich nicht sichtbar sind.",
  body: "Damit wir nicht raten, gleichen wir die öffentliche Prüfung mit euren tatsächlichen Leistungsdaten ab.",
  /** Erscheint, solange keine Quelle verbindbar ist. Beschreibt den echten Ablauf. */
  unavailableNote:
    "Diese Zugänge richten wir im Kickoff gemeinsam ein, lesend und in unter 15 Minuten. Vor einer Beauftragung wird hier nichts verbunden.",
  /** Der Weg, der immer offen bleibt. */
  skipCta: "Ohne Zugang weitermachen",
  skipNote:
    "Der First Move entsteht dann aus der öffentlichen Prüfung und eurer Geschäftslage. Mit euren Daten wird er präziser, ohne sie bleibt er belastbar.",
  continueCta: "Analyse vervollständigen",
} as const;
