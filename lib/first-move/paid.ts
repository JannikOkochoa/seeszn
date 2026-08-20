// ─── First Move: Paid Acquisition, Stufe 1 ────────────────────────────────────
// Der öffentliche Vorcheck. Er arbeitet ausschließlich mit Signalen, die im
// ausgelieferten HTML sichtbar sind, und mit dem vom Nutzer angegebenen
// Budgetband. Kein OAuth, kein Account-Zugriff, keine E-Mail.
//
// Was hier NIE behauptet wird, weil es öffentlich nicht erkennbar ist:
// vollständige Conversion-Konfiguration, Attributionseinstellungen,
// Search-Term-Waste, PMax-Incrementality, Brand gegen Non-Brand, Leadqualität.
// Diese Punkte brauchen Read-only-Zugriff und werden erst danach geprüft.
//
// Rauschregel: ein einzelnes Signal qualifiziert nie. Es braucht mindestens zwei
// unabhängige, direkt gemessene Beobachtungen.
//
// Seit der Paid-Validierung im August 2026 gilt zusätzlich: die ABWESENHEIT eines
// öffentlich sichtbaren Mess-Tags oder einer bekannten Consent-Plattform ist kein
// Beleg. Beides ist bei sauber gebauten Seiten der Normalfall, weil Tags über
// einen Container, serverseitig oder erst nach Einwilligung laden. Vorher hat
// genau diese Abwesenheit auf stripe.com, mailchimp.com und manufactum.de einen
// Befund erzeugt. Der öffentliche Check kann die Messqualität nicht beurteilen,
// nur den öffentlich sichtbaren Aufbau der Einstiegsseite. Messqualität ist ein
// Read-only-Thema und steht so auch in READ_ONLY_UNLOCKS.

import type { EvidenceItem, Level, PaidCategory, PaidFinding, SpendBand } from "./types";
import type { PageSurface } from "./surface";
import { MEASUREMENT_WEEKS_MAX, MEASUREMENT_WEEKS_MIN } from "./product";
import { CONTENT_WORD_FLOOR, looksLikeHtmlDocument } from "./diagnosis";

export interface PaidCheckInput {
  domain: string;
  spendBand: SpendBand;
  /** Die Einstiegsseite und optional weitere öffentlich geprüfte Seiten. */
  landing: PageSurface;
  samples: PageSurface[];
  /** Lighthouse-Performance der Einstiegsseite, falls messbar. */
  performance: number | null;
}

let counter = 0;
function ev(item: Omit<EvidenceItem, "id" | "observedAt">): EvidenceItem {
  counter += 1;
  return { id: `p${counter}`, observedAt: new Date().toISOString(), ...item };
}

export const BAND_LABEL: Record<SpendBand, string> = {
  lt_10k: "unter 10.000 € pro Monat",
  "10k_50k": "10.000 bis 50.000 € pro Monat",
  "50k_250k": "50.000 bis 250.000 € pro Monat",
  gt_250k: "über 250.000 € pro Monat",
  unknown: "nicht angegeben",
};

/**
 * Wertet die öffentlichen Signale aus. Gibt null zurück, wenn die Oberfläche
 * keinen belastbaren öffentlichen Befund hergibt. Dann sagt die Seite genau das
 * und bietet den Read-only-Weg als nächsten ehrlichen Schritt an.
 */
export function qualifyPublicPaid(input: PaidCheckInput): PaidFinding | null {
  const { landing, spendBand } = input;

  // Ohne lesbare Einstiegsseite gibt es keinen Befund. Eine Bot-Schutzseite
  // antwortet mit 403 und hat weder Tag noch H1 noch Formular. Daraus würden
  // sonst mehrere "fehlende" Signale entstehen, die über die echte Landingpage
  // nichts aussagen.
  if (landing.status !== 200) return null;

  // Kein HTML-Dokument, keine Landingpage-Bewertung. Eine als text/plain
  // ausgelieferte Datei hat weder Title noch Überschrift; "keine H1" wäre dort
  // eine wahre und zugleich nichtssagende Aussage.
  if (!looksLikeHtmlDocument(landing)) return null;

  // Eine Seite, deren Text erst im Browser entsteht, liefert uns eine Hülle.
  // Aus fehlender H1, fehlendem Formular und fehlendem Tag würden daraus drei
  // "Defekte", die ausschließlich unser Leseverfahren beschreiben.
  if (landing.wordCount < CONTENT_WORD_FLOOR) return null;

  // ── Was wir öffentlich WIRKLICH messen können ───────────────────────────────
  //
  // Getrennt von dem, was wir öffentlich nur NICHT sehen können. Der Unterschied
  // ist der ganze Punkt dieser Datei:
  //
  //   messbar        Es gibt kein Formular und keinen weiterführenden Pfad.
  //                  Das Formular hat 14 Felder. Lighthouse meldet 31 von 100.
  //   nicht sichtbar Kein Google-Ads-Tag im ausgelieferten HTML.
  //                  Keine bekannte Consent-Plattform im HTML.
  //
  // Die zweite Gruppe ist der Normalfall bei sauber gebauten Seiten: Tags laufen
  // über einen Container, serverseitig oder erst nach Einwilligung. Aus ihrer
  // Abwesenheit einen Befund zu bauen hieß, jede zweite gut gebaute Landingpage
  // zu beschuldigen. Sie zählt deshalb NIE als Beleg und erzeugt nie einen
  // Befund; sie erscheint als Grenze der Prüfung in den Dimensionen.
  const signals: EvidenceItem[] = [];
  const category: PaidCategory = "landing_page_mismatch";

  // 1) Konversionspfad auf der Einstiegsseite.
  const hasPath = landing.formCount > 0 || landing.internalLinks.length > 3;
  if (!hasPath) {
    signals.push(
      ev({
        source: "landing_page",
        type: "conversion_path_absent",
        observation:
          "Auf der Einstiegsseite ist weder ein Formular noch ein klar weiterführender interner Pfad erkennbar. Bezahlter Traffic landet ohne nächsten Schritt.",
        scope: { urls: [landing.url] },
        reproducible: true,
      }),
    );
  }

  // 2) Formularreibung. Nur wenn es wirklich ein Formular gibt: lose Felder
  // gehören meist zu Suche oder Filtern und sagen über den Anfrageweg nichts.
  if (landing.formCount > 0 && (landing.inputCount >= 9 || landing.requiredInputCount >= 6)) {
    signals.push(
      ev({
        source: "landing_page",
        type: "form_friction",
        observation: `Das Formular auf der Einstiegsseite hat ${landing.inputCount} sichtbare Felder, davon ${landing.requiredInputCount} als Pflichtfeld ausgezeichnet.`,
        measuredValue: landing.inputCount,
        comparisonValue: landing.requiredInputCount,
        scope: { urls: [landing.url] },
        reproducible: true,
      }),
    );
  }

  // 3) Aussageklarheit. Nur eine FEHLENDE H1 zählt. "Mehr als eine H1" hat
  // technisch einwandfreie Seiten getroffen: stripe.com setzt zwei, mailchimp.com
  // sechs, beide völlig legitim. Dieselbe Korrektur wie im Search-Klassifikator.
  if (landing.h1.length === 0) {
    signals.push(
      ev({
        source: "landing_page",
        type: "message_clarity",
        observation:
          "Die Einstiegsseite liefert keine H1 aus. Das Versprechen der Seite ist weder für Nutzer noch maschinell eindeutig.",
        measuredValue: landing.h1.length,
        scope: { urls: [landing.url] },
        reproducible: true,
      }),
    );
  }

  // 4) Performance der Einstiegsseite, nur wenn wirklich gemessen.
  if (typeof input.performance === "number" && input.performance < 50) {
    signals.push(
      ev({
        source: "performance",
        type: "landing_page_performance",
        observation: `Die Einstiegsseite erreicht einen mobilen Lighthouse-Performance-Wert von ${input.performance} von 100. Bezahlte Klicks tragen die Ladezeit mit.`,
        measuredValue: input.performance,
        scope: { urls: [landing.url] },
        reproducible: true,
      }),
    );
  }

  // Rauschregel: unter zwei unabhängigen, direkt gemessenen Beobachtungen
  // entsteht kein Befund.
  if (signals.length < 2) return null;

  // Der Impact folgt der Evidenz, nicht dem selbst angegebenen Budget. Aus einem
  // eingetippten Budgetband einen höheren Schweregrad abzuleiten hieße, die
  // wirtschaftliche Wirkung zu behaupten, die dieser Check gerade nicht messen
  // kann. Das Band bleibt als Kontext im economicSignal stehen.
  const impact: Level = signals.length >= 3 ? "high" : "medium";

  // Der Titel benennt den stärksten wirklich gemessenen Defekt, nicht eine
  // Gesamtbewertung der Paid-Aktivität. "Der Funnel konvertiert schlecht" wäre
  // aus diesen Signalen nicht belegbar.
  const types = new Set(signals.map((sig) => sig.type));
  const title = types.has("conversion_path_absent")
    ? "Auf der Einstiegsseite ist kein nächster Schritt erkennbar."
    : types.has("landing_page_performance")
      ? "Die Einstiegsseite zeigt einen messbaren Ladezeit-Engpass."
      : types.has("form_friction")
        ? "Das Formular der Einstiegsseite verlangt auffällig viele Felder."
        : "Die Einstiegsseite liefert keine eindeutige Hauptaussage aus.";

  return {
    id: `fmp_${Date.now().toString(36)}`,
    route: "paid_acquisition",
    // Der Paid-Check liest den Aufbau der Einstiegsseite. Was er messen kann,
    // liegt hinter dem Klick, nie davor: deshalb immer CONVERSION_GAP.
    category: "CONVERSION_GAP",
    paidCategory: category,
    status: "qualified",
    title,
    summary:
      "Der bezahlte Klick landet auf einer Seite, deren Aufbau an einer öffentlich messbaren Stelle nicht trägt. Das wirkt vor jeder Account-Optimierung. Über Kampagnen, Gebote, Suchbegriffe oder die tatsächliche Conversion Rate sagt dieser Befund nichts.",
    evidence: signals,
    publicEvidence: signals,
    impact,
    confidence: "medium",
    effort: "low",
    economicSignal: {
      metric: "Monatliches Mediabudget, Angabe des Kunden",
      currentValue: BAND_LABEL[spendBand],
      source: "derived",
    },
    proposedFirstMove: {
      interventionType: "Konversionspfad der Einstiegsseite begradigen",
      title: "Den Konversionspfad der Einstiegsseite begradigen.",
      scope:
        "Auf der wichtigsten Einstiegsseite werden Aussage, primäre Handlung und Formular auf einen Pfad reduziert und gemessen. Eine Seite, kein Relaunch.",
      implementationSurface: "website",
      implementationMode: "SEESZN_access",
      expectedHours: 12,
      bounded: true,
      reversibleOrControlled: true,
    },
    measurementHypothesis: {
      metric: "Conversion Rate der Einstiegsseite aus bezahltem Traffic",
      baselineDefinition:
        "Google Ads und Web-Analytics, gleicher Zeitraum und gleiche Kampagnenauswahl vor und nach der Umsetzung.",
      expectedDirection: "increase",
      measurementWindowWeeksMin: MEASUREMENT_WEEKS_MIN,
      measurementWindowWeeksMax: MEASUREMENT_WEEKS_MAX,
      attributionLimitations: [
        "Ohne Read-only-Zugriff sind Kampagnenstruktur, Suchbegriffe und Attribution nicht bewertbar.",
        "Auktionsdynamik und Saisonalität sind nicht kontrollierbar.",
      ],
    },
    eligibility: {
      eligible: false,
      reason: "paid_read_only_required",
      nextAction:
        "Für den vollständigen Paid-Befund brauchen wir Read-only-Zugriff auf den Google-Ads-Account.",
    },
    publicEvidenceOnly: true,
    requiresReadOnly: true,
    suggestedComplexity: "medium",
    createdAt: new Date().toISOString(),
  };
}

// ─── Stufe 2: Read-only ───────────────────────────────────────────────────────
//
// Die Google-Ads-Anbindung ist bewusst hinter eine Integrationsgrenze gelegt.
// Solange sie nicht produktionsreif ist, zeigt die Seite keinen Verbinden-Button
// und täuscht keine Verbindung vor. Der Read-only-Schritt findet dann im Kickoff
// statt, was inhaltlich dasselbe ist und ehrlich benannt wird.
//
// Wird die Anbindung scharf geschaltet, genügt die Umgebungsvariable. Die UI ist
// dafür bereits gebaut.

/**
 * Schalter für die Existenz der Verbindungsroute. Solange
 * /api/first-move/ads/connect nicht existiert, darf kein Verbinden-Button
 * erscheinen, auch nicht mit gesetztem Flag. Ein CTA, der ins Leere führt, ist
 * schlimmer als ein fehlender CTA.
 *
 * Wird die Route gebaut, wird dieser Wert auf true gesetzt. Beides zusammen,
 * Flag und Implementierung, schaltet die Verbindung frei.
 */
const ADS_CONNECT_ROUTE_IMPLEMENTED = false;

/** True, wenn der Read-only-Verbindungsschritt in der UI angeboten werden darf. */
export function isAdsOAuthEnabled(): boolean {
  const flagged = process.env.FIRST_MOVE_ADS_OAUTH === "enabled";
  if (flagged && !ADS_CONNECT_ROUTE_IMPLEMENTED) {
    console.warn(
      "[first-move] FIRST_MOVE_ADS_OAUTH=enabled, aber /api/first-move/ads/connect existiert nicht. Der Verbinden-Schritt bleibt ausgeblendet.",
    );
    return false;
  }
  return flagged && ADS_CONNECT_ROUTE_IMPLEMENTED;
}

/** Was nach einer Read-only-Verbindung zusätzlich prüfbar wird. */
export const READ_ONLY_UNLOCKS: readonly string[] = [
  "Brand Leakage",
  "Search-Term Waste",
  "PMax Incrementality",
  "Conversion Signal Quality",
  "Campaign Fragmentation",
  "Landingpage Mismatch",
  "Lead- und Wertsignale, soweit Daten vorhanden",
];

/** Was Read-only ausdrücklich nicht umfasst. */
export const READ_ONLY_GUARANTEES: readonly string[] = [
  "keine Schreibrechte",
  "keine Kampagnenänderung",
  "jederzeit widerrufbar",
  "keine Änderung vor dem Kauf",
];
