// ─── SEESZN First Move: gesperrte Produktwerte ────────────────────────────────
// Eine einzige Quelle für alle kaufentscheidenden Zahlen. Preis, Lieferfrist,
// Messfenster, Aufbewahrung, Hosting und Risk Reversal stehen NUR hier. Sichtbare
// Copy, Structured Data, E-Mails und API-Antworten lesen aus dieser Datei, damit
// Seite und Schema nie auseinanderlaufen.
//
// Referenz: docs/first-move/CLAUDE_PRODUCT_PAGE_v6.md, docs/first-move/scope-builder.v6.json.
// V6 löst V5 für den Produktfunnel ab. Ändert sich hier ein Wert, ändert sich
// die gesamte Produktoberfläche mit.
//
// Schreibregel für jede Copy in diesem Verzeichnis: keine Gedankenstriche, keine
// erfundene Knappheit, kein Gratis-Audit-Versprechen, keine Slogan-Dreiklänge,
// kein "nicht X, sondern Y", und für vertrauliche Kunden ausschließlich die
// Formulierung "Client confidential".

/** Öffentlicher Produktname. */
export const PRODUCT_NAME = "SEESZN First Move";

/** Kurzlabel im Product Header. */
export const PRODUCT_LABEL = "FIRST MOVE";

/** Netto-Festpreis in Euro. Nie rabattiert, nie dynamisch. */
export const PRICE_EUR = 2490;

/** Anzeigeform des Preises, deutsches Zahlenformat. */
export const PRICE_DISPLAY = "2.490 €";
export const PRICE_DISPLAY_NET = "2.490 € netto";

/** Lieferfrist in Werktagen, beginnt erst bei vollständigem Zugriff. */
export const DELIVERY_DAYS_MIN = 5;
export const DELIVERY_DAYS_MAX = 7;
export const DELIVERY_DISPLAY = "5–7 Werktage nach vollständigem Zugriff";
export const DELIVERY_SHORT = "5–7 Werktage";

/** Maximaler Aufwand auf Kundenseite für Zugriff und Freigabe. */
export const CLIENT_EFFORT_MINUTES = 15;
export const CLIENT_EFFORT_DISPLAY = "max. 15 Minuten Aufwand auf Kundenseite";
export const CLIENT_EFFORT_SHORT = "max. 15 Min. auf Kundenseite";

/** Fenster, in dem die Wirkung dokumentiert wird. */
export const MEASUREMENT_WEEKS_MIN = 4;
export const MEASUREMENT_WEEKS_MAX = 8;
export const MEASUREMENT_DISPLAY = "4–8 Wochen Messfenster";

/** Aufbewahrung der Scan-Daten in Tagen. */
export const RETENTION_DAYS = 30;
export const RETENTION_DISPLAY = "Scan-Daten 30 Tage";

/** Hostingregion der Verarbeitung. */
export const HOSTING_REGION = "Frankreich / EU";
export const HOSTING_DISPLAY = "Hosting Frankreich / EU";

/** Frist, nach der die Leistung bei fehlenden Zugängen pausiert. */
export const ACCESS_DEADLINE_DAYS = 14;

/** Risk Reversal, kurze Fassung für den CTA-Bereich. */
export const RISK_REVERSAL_SHORT = "Ersatz-Move oder 100 % Erstattung";

/** Risk Reversal, vollständige Fassung. Der Kunde wählt. */
export const RISK_REVERSAL_FULL =
  "Ist der bestätigte First Move nach der Verifikation nicht umsetzbar, bekommst du wahlweise einen gleichwertigen Ersatz-Move oder 100 % Erstattung.";

/** Verzögerungsregel. Gehört in Detailcopy und FAQ, nicht in den Hero. */
export const DELAY_CLAUSE =
  "Die Lieferfrist beginnt nach vollständigem Zugriff und geklärtem Freigabeweg. Werden notwendige Zugänge nicht innerhalb von 14 Tagen bereitgestellt, pausiert die Leistung. Eine vom Kunden verursachte Verzögerung begründet keinen Erstattungsanspruch aus dieser Verzögerung.";

/** Kanonische Produkt-URLs. */
export const MASTER_PATH = "/first-move";
export const PAID_PATH = "/google-ads/first-move";

/**
 * Die kompakte Faktenzeile unter dem Domainfeld.
 *
 * Sie trug bis August 2026 den Preis. Das war zu früh: der Besucher hat an
 * dieser Stelle noch kein Ergebnis gesehen und bewertet eine Zahl, zu der er
 * keinen Gegenwert kennt. Der Preis steht deshalb jetzt erst im Angebot, also
 * nach Diagnose, Geschäftslage und formuliertem Move, und dort vollständig.
 * Verschwiegen wird er nirgends: PRICE_FRAME sagt vorher, was ihn begrenzt.
 */
export const HERO_FACT_LINE = `Festpreis · ${DELIVERY_SHORT} · ${CLIENT_EFFORT_SHORT}`;

/**
 * Was vor dem Preis über den Preis gesagt wird. Nimmt die Angst vor einem
 * offenen Ende, ohne den Besucher früh auf eine Zahl zu ankern.
 */
export const PRICE_FRAME =
  "Ein klar abgegrenzter erster Move zum Festpreis. Kein Retainer, kein Paket aus zwölf Maßnahmen.";

/** Die Zusage direkt vor dem Angebot. Der Preis kommt vor jeder Bindung. */
export const PRICE_PROMISE =
  "Preis und Umfang siehst du vollständig, bevor du irgendetwas beauftragst.";

/**
 * Die Definition nahe am Hero. Normaler Nutzercontent, server-gerendert,
 * bewusst 40 bis 60 Wörter, damit sie als Ganzes zitierbar bleibt.
 */
export const PRODUCT_DEFINITION =
  "SEESZN First Move ist eine begrenzte Diagnose- und Umsetzungsleistung. SEESZN identifiziert anhand belegbarer Signale den wichtigsten Engpass in Search, AI Search oder Paid Acquisition, setzt genau eine passende Änderung um und dokumentiert anschließend den Vorher/Nachher-Zustand.";

/** Die sachliche Einordnung über dem Preis. */
export const OFFER_POSITIONING =
  "Wir verifizieren den Befund, setzen eine klar begrenzte Änderung um und dokumentieren anschließend das Ergebnis.";

/** Was im Festpreis enthalten ist. */
export const INCLUDED: readonly string[] = [
  "Verifikation des Befunds mit den nötigen Zugängen",
  "Priorisierung eines First Move",
  "kurzer Kickoff",
  "Umsetzung der begrenzten Änderung",
  "QA und eine Freigabeschleife",
  "Mess-Setup",
  "Evidence Record",
  "Follow-up nach dem Messfenster",
];

/** Was ausdrücklich nicht enthalten ist. */
export const NOT_INCLUDED: readonly string[] = [
  "Relaunch",
  "Migration",
  "Massen-Content",
  "laufender Linkaufbau",
  "laufende Ads-Betreuung",
  "kompletter Account Rebuild",
  "Multi-Market Rollout",
];

/**
 * Die harten Fakten direkt am Angebot. Sie stehen prominent, weil sie Zeit,
 * Aufwand und Umfang beantworten, bevor jemand eine Anfrage schickt.
 */
export const OFFER_FACTS: readonly { k: string; v: string }[] = [
  { k: "Lieferung", v: DELIVERY_DISPLAY },
  { k: "Dein Aufwand", v: CLIENT_EFFORT_DISPLAY },
  { k: "Umsetzung", v: "enthalten" },
  { k: "QA", v: "enthalten" },
  { k: "Messung", v: `enthalten, ${MEASUREMENT_WEEKS_MIN}–${MEASUREMENT_WEEKS_MAX} Wochen` },
  { k: "Nachweis", v: "Evidence Record, dokumentiertes Vorher/Nachher" },
];

/** Sekundäre Zusicherungen unter dem Angebot. */
export const REASSURANCE: readonly string[] = [
  RISK_REVERSAL_SHORT,
  RETENTION_DISPLAY,
  HOSTING_DISPLAY,
];

/**
 * Der öffentliche Ablauf. Drei Schritte, eine Sprache. V6 verzichtet bewusst auf
 * die parallelen Dreiklänge aus V5 (Diagnose/Intervention/Messnachweis,
 * Find/Ship/Prove, Finden/Umsetzen/Belegen).
 */
export const PROCESS_STEPS: readonly { num: string; title: string; body: string }[] = [
  {
    num: "01",
    title: "Befund verifizieren",
    body: "Wir prüfen den Befund mit den nötigen Zugängen und entscheiden, ob er eine Umsetzung trägt.",
  },
  {
    num: "02",
    title: "Änderung umsetzen",
    body: "Wir setzen genau eine klar begrenzte Änderung um, inklusive QA und einer Freigabeschleife.",
  },
  {
    num: "03",
    title: "Ergebnis dokumentieren",
    body: `Messgröße und Basiswert stehen vorher fest. Danach dokumentieren wir die Entwicklung über ${MEASUREMENT_WEEKS_MIN} bis ${MEASUREMENT_WEEKS_MAX} Wochen.`,
  },
];

/**
 * Die Qualifikationsregel in einem Satz. Sie ersetzt den alten Dreiklang
 * "Beobachtung vor Meinung. Mindestens zwei Signale. Kein generisches Rauschen."
 */
export const QUALIFICATION_RULE =
  "Ein Finding wird erst berücksichtigt, wenn mehrere Signale auf denselben Engpass hindeuten.";

/**
 * Interne Prozessnamen. Sie dürfen in Code und Produktlogik weiterleben, tauchen
 * aber nicht mehr als öffentliche Slogans auf der Seite auf.
 */
export const INTERNAL_STAGES = ["find", "ship", "prove"] as const;

/** Bildpfade. Existieren als echte Dateien unter public/first-move. */
export const ASSETS = {
  hero: "/first-move/first-move-hero-stone.webp",
  build: "/first-move/case-build-french-beret.webp",
  /**
   * Fällt eine Platte einmal aus, rendert die Proof-Karte statt eines
   * Platzhalters eine typografische Evidence-Platte. Der Pfad hier ist der
   * einzige Schalter dafür.
   */
  transform: "/first-move/case-transform-tourism.webp" as string | null,
  scale: "/first-move/case-scale-b2b-workspace.webp",
  footerTexture: "/first-move/first-move-footer-texture.webp",
} as const;
