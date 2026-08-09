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
// unabhängige Beobachtungen oder eine klare wirtschaftliche Relevanz plus eine
// bestätigende Beobachtung.

import type { EvidenceItem, Level, PaidCategory, PaidFinding, SpendBand } from "./types";
import type { PageSurface } from "./surface";
import { MEASUREMENT_WEEKS_MAX, MEASUREMENT_WEEKS_MIN } from "./product";

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

/** Wirtschaftliches Gewicht des Budgetbands. Nur für Impact, nie für den Preis. */
const BAND_WEIGHT: Record<SpendBand, number> = {
  lt_10k: 1,
  "10k_50k": 2,
  "50k_250k": 3,
  gt_250k: 4,
  unknown: 1,
};

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

  const signals: EvidenceItem[] = [];
  let category: PaidCategory = "other";

  const adsTag = landing.tagSignals.find((t) => t.startsWith("Google Ads"));
  const anyGoogleTag = landing.tagSignals.some((t) => t.startsWith("Google"));

  // 1) Öffentlich erkennbares Google-Ads-Messsignal.
  if (!adsTag) {
    signals.push(
      ev({
        source: "public_tag_signal",
        type: "ads_conversion_tag_not_visible",
        observation: anyGoogleTag
          ? `Im ausgelieferten HTML ist ein Google-Tag-Container sichtbar (${landing.tagSignals.join(", ")}), aber kein Google-Ads-Conversion- oder Remarketing-Tag. Ob Conversions serverseitig oder über den Container laufen, ist öffentlich nicht erkennbar.`
          : "Im ausgelieferten HTML ist kein Google-Tag und kein Google-Ads-Signal sichtbar. Womit Conversions gemessen werden, ist von außen nicht nachvollziehbar.",
        scope: { urls: [landing.url] },
        measuredValue: landing.tagSignals.length,
        reproducible: true,
      }),
    );
    category = "conversion_signal_quality";
  }

  // 2) Consent-Implementierung im Verhältnis zu den geladenen Tags.
  if (landing.tagSignals.length > 0 && !landing.consentPlatform) {
    signals.push(
      ev({
        source: "consent_signal",
        type: "no_cmp_detected",
        observation: `Es sind ${landing.tagSignals.length} Mess-Tags sichtbar, aber keine gängige Consent-Plattform im HTML erkennbar. Wie die Einwilligung die Messung steuert, lässt sich von außen nicht bestätigen.`,
        scope: { urls: [landing.url] },
        reproducible: true,
      }),
    );
    if (category === "other") category = "conversion_signal_quality";
  }

  // 3) Konversionspfad auf der Einstiegsseite.
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
    category = "landing_page_mismatch";
  }

  // 4) Formularreibung. Nur wenn es wirklich ein Formular gibt: lose Felder
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
    if (category === "other") category = "landing_page_mismatch";
  }

  // 5) Aussageklarheit der Einstiegsseite.
  if (landing.h1.length !== 1) {
    signals.push(
      ev({
        source: "landing_page",
        type: "message_clarity",
        observation:
          landing.h1.length === 0
            ? "Die Einstiegsseite hat keine H1. Das Versprechen der Seite ist weder für Nutzer noch maschinell eindeutig."
            : `Die Einstiegsseite hat ${landing.h1.length} H1-Überschriften. Es gibt keine eindeutige Hauptaussage.`,
        measuredValue: landing.h1.length,
        scope: { urls: [landing.url] },
        reproducible: true,
      }),
    );
  }

  // 6) Performance der Einstiegsseite, nur wenn wirklich gemessen.
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
    if (category === "other") category = "landing_page_mismatch";
  }

  // Rauschregel: unter zwei unabhängigen Beobachtungen entsteht kein Befund.
  if (signals.length < 2) return null;

  const weight = BAND_WEIGHT[spendBand];
  const impact: Level = weight >= 3 ? "high" : signals.length >= 3 ? "medium" : "medium";

  return {
    id: `fmp_${Date.now().toString(36)}`,
    route: "paid_acquisition",
    paidCategory: category,
    status: "qualified",
    title:
      category === "conversion_signal_quality"
        ? "Das Messsignal hinter dem bezahlten Traffic ist öffentlich nicht nachvollziehbar."
        : "Die Einstiegsseite trägt den bezahlten Traffic nicht sauber weiter.",
    summary:
      category === "conversion_signal_quality"
        ? "Was der Account als Conversion zurückbekommt, entscheidet über Gebotssteuerung und Budgeteffizienz. Öffentlich ist dieses Signal auf der Einstiegsseite nicht belegbar. Das ist ein begründeter Anfangsverdacht, kein Account-Befund."
        : "Der bezahlte Klick landet auf einer Seite, deren Weg zum nächsten Schritt öffentlich erkennbar unterbrochen oder unklar ist. Das wirkt vor jeder Account-Optimierung.",
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
      interventionType:
        category === "conversion_signal_quality"
          ? "Conversion-Signal messbar und prüfbar machen"
          : "Konversionspfad der Einstiegsseite begradigen",
      title:
        category === "conversion_signal_quality"
          ? "Das Conversion-Signal messbar und prüfbar machen."
          : "Den Konversionspfad der Einstiegsseite begradigen.",
      scope:
        category === "conversion_signal_quality"
          ? "Ein sauber definiertes primäres Conversion-Signal wird gesetzt, ausgelöst und gegengeprüft, inklusive Consent-Verhalten. Ein Signal, eine Seite, kein Account-Rebuild."
          : "Auf der wichtigsten Einstiegsseite werden Aussage, primäre Handlung und Formular auf einen Pfad reduziert und gemessen. Eine Seite, kein Relaunch.",
      implementationSurface: category === "conversion_signal_quality" ? "measurement" : "website",
      implementationMode: "SEESZN_access",
      expectedHours: 12,
      bounded: true,
      reversibleOrControlled: true,
    },
    measurementHypothesis: {
      metric:
        category === "conversion_signal_quality"
          ? "Anteil der Klicks mit gültigem Conversion-Signal"
          : "Conversion Rate der Einstiegsseite aus bezahltem Traffic",
      baselineDefinition:
        "Google Ads und Web-Analytics, gleicher Zeitraum und gleiche Kampagnenauswahl vor und nach der Umsetzung.",
      expectedDirection: category === "conversion_signal_quality" ? "clarify" : "increase",
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
