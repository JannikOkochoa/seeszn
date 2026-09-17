// ─── PREISE: Sprachschicht ────────────────────────────────────────────────────
// Eine Datei für jede kundenseitige Zeichenkette der Preisfläche, beide Sprachen
// nebeneinander. Bewusst kein i18n-Paket: es gibt zwei Sprachen, keine Plurale
// mit Sonderregeln, keine Datumsformate und keine Übersetzer, die außerhalb des
// Repositories arbeiten. Ein Objekt mit zwei Zweigen erfüllt denselben Zweck
// ohne Laufzeitkosten und ohne eine weitere Abhängigkeit.
//
// Geteilt bleibt alles, was keine Sprache hat: Preisfunktionen, Formularlogik,
// Validierung, Analytics, Komponenten. Hier liegt ausschließlich Text.
//
// Der Typ entsteht aus der deutschen Fassung. Fehlt im Englischen ein
// Schlüssel, schlägt der Build fehl; eine halb übersetzte Preisseite kann damit
// nicht versehentlich live gehen.

import {
  CLIENT_EFFORT_SHORT,
  DELIVERY_SHORT,
  MEASUREMENT_DISPLAY,
  PRICE_DISPLAY,
} from "@/lib/first-move/product";
import { PRICE_DISPLAY_EN } from "@/lib/first-move/productEn";

export type MovesLocale = "de" | "en";

/** Zahlenformat je Sprache. 1.235,00 € gegen €1,235.00 */
export const NUMBER_LOCALE: Record<MovesLocale, string> = { de: "de-DE", en: "en-GB" };

const de = {
  locale: "de" as MovesLocale,

  // ── Rahmen ────────────────────────────────────────────────────────────────
  header: { context: "PREISE", checkout: "PREISE / CHECKOUT", home: "SEESZN, zur Startseite" },

  // ── Einstieg ──────────────────────────────────────────────────────────────
  entry: {
    eyebrow: "PREISE",
    h1: "Wählen Sie Ihren Move",
    lead: "Wir finden den wichtigsten Hebel und setzen ihn um, oder Sie wählen die Menge direkt.",
    paths: [
      { product: "first-move" as const, n: "01", name: "FIRST MOVE", line: "Den Hebel finden", cta: "FIRST MOVE ANSEHEN" },
      { product: "backlinks" as const, n: "02", name: "BACKLINKS", line: "Die Menge wählen", cta: "BACKLINKS KONFIGURIEREN" },
    ],
  },

  pathbar: { label: "Weg wählen", firstMove: "FIRST MOVE", backlinks: "BACKLINKS" },

  // ── First Move ────────────────────────────────────────────────────────────
  firstMove: {
    eyebrow: "FIRST MOVE",
    h1: "Zuerst finden, was zählt",
    price: PRICE_DISPLAY,
    priceNote: "NETTO · FESTPREIS",
    definition:
      "SEESZN findet den wichtigsten Engpass Ihrer Sichtbarkeit, verifiziert ihn, setzt genau eine begrenzte Änderung um und dokumentiert danach das Ergebnis.",
    surfaces: "Geprüft werden Google Search, AI Search und Google Ads.",
    cta: "FIRST MOVE STARTEN",
    ctaNote: "Die Prüfung läuft auf öffentlichen Signalen. Beauftragt wird erst, wenn Befund und Move schriftlich vorliegen.",
    specs: [
      { v: DELIVERY_SHORT, k: "nach vollständigem Zugang" },
      { v: `≤ ${CLIENT_EFFORT_SHORT.replace("max. ", "").replace(" auf Kundenseite", "")}`, k: "Aufwand auf Ihrer Seite" },
      { v: "1 Move", k: "umgesetzt inklusive QA" },
      { v: MEASUREMENT_DISPLAY.replace(" Messfenster", ""), k: "Messung und Evidence Record" },
    ],
    steps: [
      { n: "01", label: "FINDEN", body: "Öffentliche Signale aus Search, AI Search und Google Ads lesen, den Engpass benennen, den Befund mit Ihren Zugängen verifizieren." },
      { n: "02", label: "UMSETZEN", body: "Genau eine begrenzte Änderung geht live, mit QA und einer Freigabeschleife auf Ihrer Seite." },
      { n: "03", label: "BELEGEN", body: "Messgröße und Ausgangswert stehen vorher fest. Danach wird der Vorher- und Nachher-Stand dokumentiert." },
    ],
    guaranteeLabel: "WENN ES NICHT GEHT",
    guaranteeH: "Nicht umsetzbar heißt nicht bezahlt",
    questionsLabel: "FRAGEN ZU FIRST MOVE",
    questions: [
      { q: "Was kostet First Move?", a: `${PRICE_DISPLAY} netto als Festpreis. Kein Stundensatz, keine Stufen, kein Retainer. Der Preis steht vor der Beauftragung fest und ändert sich nicht mit dem Kanal.` },
      { q: "Was ist enthalten?", a: "Eine verifizierte Diagnose, ein priorisierter Move, dessen Umsetzung mit QA und einer Freigabeschleife, das Mess-Setup und ein Evidence Record mit dem Vorher- und Nachher-Stand." },
      { q: "Wie lange dauert es?", a: `${DELIVERY_SHORT} nach vollständigem Zugang. Danach folgt ein Messfenster von ${MEASUREMENT_DISPLAY.replace(" Messfenster", "")}, in dem die Wirkung dokumentiert wird.` },
      { q: "Wie viel Zeit kostet mich das?", a: `${CLIENT_EFFORT_SHORT} auf Ihrer Seite. Die Prüfung läuft auf öffentlichen Signalen, Zugänge braucht erst die Umsetzung.` },
      { q: "Was, wenn der Move nicht umsetzbar ist?", a: "Stellt sich der bestätigte Move als tatsächlich nicht umsetzbar heraus, bekommen Sie wahlweise einen gleichwertigen Ersatz-Move oder 100 % Erstattung." },
    ],
  },

  // ── Backlinks ─────────────────────────────────────────────────────────────
  backlinks: {
    eyebrow: "BACKLINKS",
    h1: "Autorität dort, wo Ihr Markt liegt",
    lead: "Menge, Format und Zielmarkt selbst wählen. Der Preis steht sofort daneben.",
    quantityLabel: "MENGE",
    unitLabel: "Backlinks",
    totalLabelOnce: "GESAMT",
    totalLabelMonthly: "PRO MONAT",
    perUnit: "PRO BACKLINK",
    netOnce: "EINMALIG · NETTO",
    netMonthly: "MONATLICH · NETTO",
    billingLabel: "Abrechnung",
    once: "EINMALIG",
    monthly: "MONATLICH",
    monthlySave: "CA. 10 % GÜNSTIGER",
    minTerm: (m: number) => `MINDESTLAUFZEIT · ${m} MONATE`,
    sliderLabel: "Anzahl Backlinks",
    /** Beschriftung des editierbaren Mengenfelds, eigens vom Reglerlabel
        unterschieden: zwei Bedienelemente für denselben Wert brauchen zwei
        Namen, sonst kündigt ein Screenreader zwei gleich benannte Felder an. */
    quantityEditLabel: "Anzahl Backlinks",
    sliderTextOnce: (q: number, v: string) => `${q} Backlinks, ${v} netto, einmalig`,
    sliderTextMonthly: (q: number, v: string, m: number) => `${q} Backlinks pro Monat, ${v} netto pro Monat, Mindestlaufzeit ${m} Monate`,
    marketLabel: "ZIELMARKT",
    marketSearch: "Land, Code oder Endung",
    marketSearchLabel: "Zielmarkt suchen",
    marketEmpty: (n: number) => `Kein Treffer. ${n} Märkte stehen zur Auswahl.`,
    formatLabel: "FORMAT",
    formats: {
      mix: { label: "SMART MIX", note: "Verteilung über alle drei Formate, nach Zielmarkt gewichtet." },
      nad: { label: "NAD", note: "Name, Adresse, Domain. Einträge in Verzeichnissen und Registern des Zielmarkts." },
      blog: { label: "BLOG", note: "Beiträge auf redaktionell geführten Blogs im Themenumfeld." },
      forum: { label: "FORUM", note: "Beiträge in moderierten Fachforen und Communities." },
    },
    priceScale: {
      savingHeadMonthly: "ERSPARNIS PRO MONAT GEGENÜBER EINMALIG",
      savingHeadOnce: (q: number) => `ERSPARNIS JE BACKLINK GEGENÜBER ${q}`,
      reference: "Referenz",
      rowLabelReference: (q: number, total: string, unit: string) =>
        `${q} Backlinks für ${total}, ${unit} je Backlink`,
      rowLabelSaving: (q: number, total: string, unit: string, delta: string, monthly: boolean, baseline: number) =>
        `${q} Backlinks für ${total}, ${unit} je Backlink, ${delta} ${
          monthly ? "günstiger als derselbe Einmalkauf" : `je Backlink günstiger als bei ${baseline}`
        }`,
    },
    customN: "100+",
    customL: "CUSTOM",
    customS: "Mehr als 100 Platzierungen, Preis auf Anfrage",
    customPrice: "Custom",
    customPriceNote: "PREIS AUF ANFRAGE",
    customUnit: "Nach Umfang",
    customCta: "CUSTOM-PREIS ANFRAGEN",
    customSubject: "Backlinks über 100: Preisanfrage",
    customBody: (market: string, format: string, billing: string, requested?: number) =>
      `Zielmarkt: ${market}\nFormat: ${format}\nAbrechnung: ${billing}\nGewünschte Menge: ${requested ?? ""}`,
    billingOnceWord: "einmalig",
    billingMonthlyWord: "monatlich",
    ctaOnce: (q: number, v: string) => `WEITER MIT ${q} BACKLINKS · ${v}`,
    ctaMonthly: (q: number, v: string) => `WEITER · ${q} / MONAT · ${v}`,
    ctaBusy: "ZAHLUNG WIRD GEÖFFNET",
    trust: ["MENSCHLICH GEPRÜFT", "ERSATZ INKLUSIVE", "ZIELMARKT WÄHLBAR"],
    terms: () => "Alle Preise netto zuzüglich gesetzlicher Umsatzsteuer. Es gelten der Umfang auf dieser Seite und die Angaben im",
    termsLink: "Impressum",
    unavailable: "Der Online-Kauf ist gerade nicht verfügbar. Schreiben Sie an",
    unavailableRequestLead: "oder gehen Sie über die",
    unavailableRequestLink: "Anfrage",
    unavailableTail: "Preis und Umfang bleiben dieselben.",
    error: "Die Zahlung ließ sich nicht öffnen. Versuchen Sie es erneut oder schreiben Sie an",
    protectionLabel: "PLATZIERUNGSSCHUTZ",
    protectionShort: "ERSATZ · INKLUSIVE",
    protectionH: "Verschwindet eine Platzierung, kommt eine neue",
    protectionFull:
      "Wird eine gelieferte Platzierung entfernt oder erfüllt sie den vereinbarten Qualitätsstandard nicht, ersetzt SEESZN sie ohne Aufpreis durch eine neue Platzierung.",
    questionsLabel: "FRAGEN VOR DER BESTELLUNG",
    questions: [
      { q: "Was kostet ein Backlink?", a: "Der Stückpreis richtet sich nach der gewählten Mengenstufe und liegt zwischen 19,80 € und 16,90 € netto. Einmalig kosten 5 Platzierungen 99 €, 100 Platzierungen 1.690 €. Monatlich beginnt die Staffel bei 10 Platzierungen für 161 € im Monat." },
      { q: "Kann ich genau 17 Backlinks bestellen?", a: "Ja. Wählbar ist jede ganze Menge von 5 bis 100 bei Einmalbestellungen, von 10 bis 100 bei Monatsplänen. Also auch 6, 17 oder 43. 17 liegt in der Mengenstufe 10 bis 19." },
      { q: "Wie viele Backlinks sollte ich pro Monat aufbauen?", a: "Eine sinnvolle Monatsmenge hängt vom bestehenden Referring-Domain-Profil ab, von der bisherigen Entwicklung und vom Abstand zu vergleichbaren Websites im Markt. Eine einzelne Kennzahl reicht dafür nicht. Wer unsicher ist, lässt die Domain kostenlos prüfen und bekommt eine von einem Menschen geprüfte Startempfehlung." },
      { q: "Was passiert, wenn ein Backlink verschwindet?", a: "Wird eine gelieferte Platzierung entfernt oder erfüllt sie den vereinbarten Qualitätsstandard nicht, ersetzt SEESZN sie ohne Aufpreis durch eine neue Platzierung. Der Ersatz ist im Preis enthalten." },
      { q: "Wie lange läuft ein Monatsplan?", a: "Monatspläne haben eine Mindestlaufzeit von drei Monaten. Sie steht am Preis, nicht erst in den Bedingungen. Bei 20 Platzierungen im Monat sind das 319 € netto im Monat." },
      { q: "Was, wenn ich mehr als 100 brauche?", a: "Mengen von 5 bis 100 lassen sich direkt konfigurieren. Darüber richtet sich der Preis nach Umfang, Zielmarkt und Format. Eine kurze Anfrage genügt, es gibt keinen automatisch hochgerechneten Preis." },
    ],
  },

  // ── Bestellübersicht ──────────────────────────────────────────────────────
  review: {
    label: "BESTELLÜBERSICHT",
    back: "Ändern",
    quantity: "Menge",
    billing: "Abrechnung",
    billingOnce: "Einmalig · keine Laufzeit",
    billingMonthly: (m: number) => `Monatlich · Mindestlaufzeit ${m} Monate`,
    format: "Format",
    market: "Zielmarkt",
    perUnit: "Pro Backlink",
    totalOnce: "Gesamt",
    totalMonthly: "Gesamt pro Monat",
    net: "netto zuzüglich gesetzlicher Umsatzsteuer",
    savingSuffix: (v: string) => `, spart ${v} pro Monat gegenüber Einmalkauf`,
    pay: (v: string) => `ZUR ZAHLUNG · ${v}`,
    payBusy: "ZAHLUNG WIRD GEÖFFNET",
    unit: "Backlinks",
  },

  // ── Kostenlose Empfehlung ─────────────────────────────────────────────────
  recommendation: {
    eyebrow: "NICHT SICHER, WIE VIELE?",
    open: "Kostenlose Empfehlung erhalten",
    close: "Schließen",
    h: "Wir schauen uns Ihre Domain an. Kostenlos.",
    body: "Domain und E-Mail hinterlassen. Wir prüfen das bestehende Backlink-Profil und schicken innerhalb eines Werktags eine von einem Menschen geprüfte Startempfehlung.",
    domain: "Domain",
    domainPlaceholder: "ihredomain.de",
    domainError: "Das sieht nicht nach einer Domain aus. Mit oder ohne https und www ist beides in Ordnung.",
    email: "E-Mail",
    emailPlaceholder: "name@unternehmen.de",
    emailError: "Bitte eine gültige E-Mail-Adresse angeben.",
    trap: "Firmen-URL bestätigen",
    cta: "KOSTENLOSE EMPFEHLUNG ANFORDERN",
    ctaBusy: "WIRD GESENDET",
    trust: "MENSCHLICH GEPRÜFT · KOSTENLOS · KEIN VERKAUFSGESPRÄCH NÖTIG",
    getLabel: "Sie bekommen",
    get: [
      { k: "Menge", v: "Eine empfohlene Zahl Backlinks pro Monat" },
      { k: "Begründung", v: "Kurze Einschätzung zu Ihrem bestehenden Profil" },
      { k: "Start", v: "Ein konkreter Vorschlag für den ersten Monat" },
    ],
    doneH: "Anfrage ist drin.",
    doneBody: (email: string) => `Wir prüfen die Domain jetzt manuell und schicken die Empfehlung an ${email}.`,
    doneAlt: "Sie möchten trotzdem schon konfigurieren?",
    doneCta: "Backlinks selbst konfigurieren",
    errorBody: "Das hat gerade nicht geklappt. Versuchen Sie es erneut oder schreiben Sie an",
  },

  // ── Beleg ─────────────────────────────────────────────────────────────────
  proof: {
    label: "ECHTE ARBEIT · ECHTES ERGEBNIS",
    context: "Im Zeitraum liefen mehrere Maßnahmen gleichzeitig. Ausgewiesen ist die gemessene Veränderung im Zeitraum, nicht die Wirkung einer einzelnen Maßnahme.",
    cta: "CASE ANSEHEN",
  },

  sticky: { continueLabel: "WEITER", minTermShort: (m: number) => `${m} MON. MIND.` },

  // ── Briefing nach der Zahlung ─────────────────────────────────────────────
  briefing: {
    brand: "SEESZN",
    statusPaid: "ZAHLUNG EINGEGANGEN",
    statusNoOrder: "BESTELLUNG",
    thanksLine1: "Danke. Jetzt brauchen",
    thanksPre: "wir ",
    thanksAccent: "sechs",
    thanksPost: " Angaben.",
    receiptRef: "Referenz",
    receiptProduct: "Produkt",
    receiptAmount: "Betrag",
    receiptTime: "Zeit",
    receiptNext: "Danach",
    invoiceNote: "Die Rechnung kommt von Stripe an die Adresse, die du dort angegeben hast.",
    backlinkTitle: (q: number) => `BACKLINKS, ${q} Stück`,
    backlinkAmountMonthly: "pro Monat, netto",
    backlinkAmountOnce: "einmalig, netto",
    backlinkTiming: "Die Umsetzung beginnt nach dem Briefing.",
    backlinkNext: "Wir prüfen Domain und Ziel-URLs und melden uns mit dem ersten Schritt.",
    noOrderH1a: "Zu dieser Adresse finden",
    noOrderH1b: "wir keine ",
    noOrderAccent: "Bestellung",
    noOrderBodyPre: "Falls du gerade bezahlt hast, ist die Zahlung davon unberührt. Schreib an",
    noOrderBodyPost: ", am besten mit der Bestätigung von Stripe, und wir ordnen es zu.",
    noOrderCta: "ZURÜCK ZU DEN PREISEN",
    form: {
      domainLabel: "Domain",
      domainPlaceholder: "beispiel.de",
      domainError: "Ohne Domain können wir nicht qualifizieren.",
      targetLabel: "Ziel-URL",
      targetPlaceholder: "https://beispiel.de/die-seite",
      marketLabel: "Markt",
      marketPlaceholder: "DACH, Deutschland, EU",
      languageLabel: "Sprache",
      languagePlaceholder: "Deutsch",
      topicLabel: "Thema",
      topicPlaceholder: "Worum soll es gehen",
      topicError: "Ohne Thema können wir keine Quelle vorschlagen.",
      notesLabel: "Hinweise",
      notesPlaceholder: "Ausgeschlossene Wettbewerber, Fristen, Freigabeweg, alles, was wir wissen sollten",
      submit: "BRIEFING SENDEN",
      submitBusy: "WIRD GESENDET",
      errorLead: "Das Briefing ließ sich nicht senden. Versuch es erneut oder schick die Angaben an",
      errorTail: (ref: string) => `. Deine Bestellung ${ref} liegt bei uns.`,
      doneLabel: "BRIEFING ANGEKOMMEN",
      doneH: "Wir melden uns mit dem nächsten Schritt.",
      doneBodyFallback: "Wir prüfen die Angaben und beginnen mit der Umsetzung.",
      doneBodyTail: (ref: string) => ` Du hörst mit dem ersten Ergebnis von uns. Alles unter der Referenz ${ref}.`,
    },
  },
};

/**
 * Die englische Fassung. Kein Wort-für-Wort-Abbild: englische Werbetexte
 * vertragen weniger Nebensätze als deutsche, und der Mittelpunkt ersetzt dort
 * Bindestrichketten in Metadatenzeilen.
 */
const en: typeof de = {
  locale: "en",

  header: { context: "PRICING", checkout: "PRICING / CHECKOUT", home: "SEESZN, back to home" },

  entry: {
    eyebrow: "PRICING",
    h1: "Choose your move",
    lead: "We find the constraint that matters, then implement it. Or you choose the volume yourself.",
    paths: [
      { product: "first-move", n: "01", name: "FIRST MOVE", line: "Find the priority", cta: "VIEW FIRST MOVE" },
      { product: "backlinks", n: "02", name: "BACKLINKS", line: "Choose the volume", cta: "CONFIGURE BACKLINKS" },
    ],
  },

  pathbar: { label: "Choose a path", firstMove: "FIRST MOVE", backlinks: "BACKLINKS" },

  firstMove: {
    eyebrow: "FIRST MOVE",
    h1: "Find what matters first",
    price: PRICE_DISPLAY_EN,
    priceNote: "NET · FIXED PRICE",
    definition:
      "SEESZN identifies the highest priority visibility constraint, verifies it, implements one bounded change, then documents the result.",
    surfaces: "Diagnostic surfaces: Google Search, AI Search, Google Ads.",
    cta: "START FIRST MOVE",
    ctaNote: "The review runs on public signals. You commit only once the finding plus the proposed Move are in writing.",
    specs: [
      { v: "5–7 business days", k: "after complete access" },
      { v: "≤ 15 min.", k: "of your time" },
      { v: "1 Move", k: "implemented, QA included" },
      { v: "4–8 weeks", k: "measurement, Evidence Record" },
    ],
    steps: [
      { n: "01", label: "FIND", body: "Read the public signals across Search, AI Search, Google Ads. Name the constraint. Verify the finding with your access." },
      { n: "02", label: "DEPLOY", body: "One bounded change goes live, with QA plus a single approval loop on your side." },
      { n: "03", label: "PROVE", body: "The metric plus its baseline are fixed up front. The before/after state is then documented." },
    ],
    guaranteeLabel: "IF IT CANNOT BE DONE",
    guaranteeH: "Not implementable means not billed",
    questionsLabel: "QUESTIONS ABOUT FIRST MOVE",
    questions: [
      { q: "What does First Move cost?", a: `${PRICE_DISPLAY_EN} net, fixed. No hourly rate, no tiers, no retainer. The price is set before you commit. It does not change with the channel.` },
      { q: "What is included?", a: "A verified diagnosis, one prioritised Move, its implementation with QA plus one approval loop, the measurement setup, an Evidence Record holding the before/after state." },
      { q: "How long does it take?", a: "5 to 7 business days after complete access. A measurement window of 4 to 8 weeks follows, during which the effect is documented." },
      { q: "How much of my time does it need?", a: "Roughly 15 minutes at most. The review runs on public signals. Access is only needed for the implementation." },
      { q: "What if the Move cannot be implemented?", a: "If the confirmed Move proves genuinely impossible to implement, you receive either an equivalent replacement Move or a 100% refund." },
    ],
  },

  backlinks: {
    eyebrow: "BACKLINKS",
    h1: "Authority where your market is",
    lead: "Choose volume, format, target market. The price sits right next to it.",
    quantityLabel: "QUANTITY",
    unitLabel: "backlinks",
    totalLabelOnce: "TOTAL",
    totalLabelMonthly: "PER MONTH",
    perUnit: "PER BACKLINK",
    netOnce: "ONE TIME · NET",
    netMonthly: "MONTHLY · NET",
    billingLabel: "Billing",
    once: "ONE TIME",
    monthly: "MONTHLY",
    monthlySave: "APPROX. 10% LOWER",
    minTerm: (m: number) => `MINIMUM TERM · ${m} MONTHS`,
    sliderLabel: "Number of backlinks",
    quantityEditLabel: "Backlink quantity",
    sliderTextOnce: (q: number, v: string) => `${q} backlinks, ${v} net, one time`,
    sliderTextMonthly: (q: number, v: string, m: number) => `${q} backlinks per month, ${v} net per month, minimum term ${m} months`,
    marketLabel: "TARGET MARKET",
    marketSearch: "Country, code or domain ending",
    marketSearchLabel: "Search target market",
    marketEmpty: (n: number) => `No match. ${n} markets available.`,
    formatLabel: "FORMAT",
    formats: {
      mix: { label: "SMART MIX", note: "Spread across all three formats, weighted by target market." },
      // NAD steht so im Produkt und wird deshalb nicht übersetzt. Die Zeile
      // darunter nennt die Bedeutung, damit die Abkürzung niemanden ratlos
      // lässt; erfunden ist daran nichts, sie steht wortgleich im deutschen
      // Katalog.
      nad: { label: "NAD", note: "Name, address, domain. Listings in directories plus registers in the target market." },
      blog: { label: "BLOG", note: "Posts on editorially run blogs in the relevant subject area." },
      forum: { label: "FORUM", note: "Posts in moderated expert forums plus communities." },
    },
    priceScale: {
      savingHeadMonthly: "SAVINGS PER MONTH VS ONE TIME",
      savingHeadOnce: (q: number) => `SAVINGS PER BACKLINK VS ${q}`,
      reference: "Reference",
      rowLabelReference: (q: number, total: string, unit: string) =>
        `${q} backlinks for ${total}, ${unit} per backlink`,
      rowLabelSaving: (q: number, total: string, unit: string, delta: string, monthly: boolean, baseline: number) =>
        `${q} backlinks for ${total}, ${unit} per backlink, ${delta} ${
          monthly ? "cheaper than the same one time order" : `per backlink cheaper than at ${baseline}`
        }`,
    },
    customN: "100+",
    customL: "CUSTOM",
    customS: "More than 100 placements, price on request",
    customPrice: "Custom",
    customPriceNote: "PRICE ON REQUEST",
    customUnit: "By volume",
    customCta: "REQUEST CUSTOM PRICING",
    customSubject: "Backlinks above 100: pricing request",
    customBody: (market: string, format: string, billing: string, requested?: number) =>
      `Target market: ${market}\nFormat: ${format}\nBilling: ${billing}\nQuantity needed: ${requested ?? ""}`,
    billingOnceWord: "one time",
    billingMonthlyWord: "monthly",
    ctaOnce: (q: number, v: string) => `CONTINUE WITH ${q} BACKLINKS · ${v}`,
    ctaMonthly: (q: number, v: string) => `CONTINUE · ${q} / MONTH · ${v}`,
    ctaBusy: "OPENING PAYMENT",
    trust: ["HUMAN CHECKED", "REPLACEMENT INCLUDED", "TARGET MARKET SELECTABLE"],
    terms: () => "All prices net, plus VAT where applicable. The scope on this page applies, together with the",
    termsLink: "legal notice",
    unavailable: "Checkout is unavailable right now. Write to",
    unavailableRequestLead: "or go through the",
    unavailableRequestLink: "request form",
    unavailableTail: "The price plus scope stay the same.",
    error: "Payment could not be opened. Try again, or write to",
    protectionLabel: "PLACEMENT PROTECTION",
    protectionShort: "REPLACEMENT · INCLUDED",
    protectionH: "A placement disappears, a new one follows",
    protectionFull:
      "If a delivered backlink is removed or fails to meet the agreed quality standard, SEESZN replaces it with a new placement at no extra cost.",
    questionsLabel: "QUESTIONS BEFORE ORDERING",
    questions: [
      { q: "How much does a backlink cost?", a: "Unit pricing depends on the selected volume tier and runs from €19.80 down to €16.90 net. One time, 5 placements cost €99, 100 placements cost €1,690. Monthly plans start at 10 placements for €161 per month." },
      { q: "Can I order exactly 17 backlinks?", a: "Yes. Every whole quantity from 5 through 100 is selectable for one time orders, 10 through 100 for monthly plans. That includes 6, 17, 43. Seventeen sits in the 10 to 19 volume tier." },
      { q: "How many backlinks should I build per month?", a: "A useful monthly volume depends on the current referring domain profile, recent growth, the gap to comparable sites in the market. A single metric does not settle it. If you are unsure, have the domain reviewed for free. You receive a human checked starting recommendation." },
      { q: "What happens if a backlink disappears?", a: "If a delivered backlink is removed or fails to meet the agreed quality standard, SEESZN replaces it with a new placement at no extra cost. Replacement is included in the price." },
      { q: "How long does the monthly plan run?", a: "Monthly plans have a minimum term of three months. It is shown at the price, not buried in the terms. At 20 placements per month that is €319 net per month." },
      { q: "What if I need more than 100?", a: "Quantities from 5 through 100 can be configured directly. Above that, pricing follows volume, target market, format. A short request is enough. Nothing is extrapolated automatically." },
    ],
  },

  review: {
    label: "ORDER SUMMARY",
    back: "Change",
    quantity: "Quantity",
    billing: "Billing",
    billingOnce: "One time · no term",
    billingMonthly: (m: number) => `Monthly · minimum term ${m} months`,
    format: "Format",
    market: "Target market",
    perUnit: "Per backlink",
    totalOnce: "Total",
    totalMonthly: "Total per month",
    net: "net, plus VAT where applicable",
    savingSuffix: (v: string) => `, saving ${v} per month against a one time order`,
    pay: (v: string) => `CONTINUE TO PAYMENT · ${v}`,
    payBusy: "OPENING PAYMENT",
    unit: "backlinks",
  },

  recommendation: {
    eyebrow: "NOT SURE HOW MANY?",
    open: "Get a free recommendation",
    close: "Close",
    h: "We'll review your domain. Free.",
    body: "Leave your domain plus email. We'll review the current backlink profile, then send a human checked starting recommendation within one business day.",
    domain: "Domain",
    domainPlaceholder: "yourdomain.com",
    domainError: "That does not look like a domain. With or without https and www is fine.",
    email: "Email",
    emailPlaceholder: "name@company.com",
    emailError: "Please enter a valid email address.",
    trap: "Confirm company URL",
    cta: "GET MY FREE RECOMMENDATION",
    ctaBusy: "SENDING",
    trust: "HUMAN REVIEWED · FREE · NO SALES CALL REQUIRED",
    getLabel: "You'll get",
    get: [
      { k: "Volume", v: "A recommended number of backlinks per month" },
      { k: "Rationale", v: "A short read on your current profile" },
      { k: "Start", v: "A concrete starting point for month one" },
    ],
    doneH: "Request received.",
    doneBody: (email: string) => `We're reviewing the domain manually now. The recommendation goes to ${email}.`,
    doneAlt: "Want to keep configuring in the meantime?",
    doneCta: "Configure backlinks yourself",
    errorBody: "That did not go through. Try again, or write to",
  },

  proof: {
    label: "REAL WORK · REAL RESULT",
    context: "Several measures ran during this period. The figure shows the change measured across that period, not the effect of a single measure.",
    cta: "VIEW CASE",
  },

  sticky: { continueLabel: "CONTINUE", minTermShort: (m: number) => `${m} MO. MIN.` },

  briefing: {
    brand: "SEESZN",
    statusPaid: "PAYMENT RECEIVED",
    statusNoOrder: "ORDER",
    thanksLine1: "Thanks. Now we need",
    thanksPre: "",
    thanksAccent: "six",
    thanksPost: " details.",
    receiptRef: "Reference",
    receiptProduct: "Product",
    receiptAmount: "Amount",
    receiptTime: "Timing",
    receiptNext: "Next",
    invoiceNote: "The invoice comes from Stripe to the address you gave there.",
    backlinkTitle: (q: number) => `BACKLINKS, ${q}`,
    backlinkAmountMonthly: "per month, net",
    backlinkAmountOnce: "one time, net",
    backlinkTiming: "Work begins once the briefing is in.",
    backlinkNext: "We review the domain plus target URLs, then get back to you with the first step.",
    noOrderH1a: "We can't find an order",
    noOrderH1b: "for that ",
    noOrderAccent: "link",
    noOrderBodyPre: "If you just paid, the payment is unaffected. Write to",
    noOrderBodyPost: ", ideally with the Stripe confirmation, plus we'll match it up.",
    noOrderCta: "BACK TO PRICING",
    form: {
      domainLabel: "Domain",
      domainPlaceholder: "yourdomain.com",
      domainError: "We can't qualify the order without a domain.",
      targetLabel: "Target URL",
      targetPlaceholder: "https://yourdomain.com/the-page",
      marketLabel: "Market",
      marketPlaceholder: "DACH, Germany, EU",
      languageLabel: "Language",
      languagePlaceholder: "English",
      topicLabel: "Topic",
      topicPlaceholder: "What this should be about",
      topicError: "We can't propose a source without a topic.",
      notesLabel: "Notes",
      notesPlaceholder: "Excluded competitors, deadlines, approval path, anything we should know",
      submit: "SEND BRIEFING",
      submitBusy: "SENDING",
      errorLead: "The briefing did not go through. Try again, or send the details to",
      errorTail: (ref: string) => `. Your order ${ref} is on file with us.`,
      doneLabel: "BRIEFING RECEIVED",
      doneH: "We'll get back to you with the next step.",
      doneBodyFallback: "We're reviewing the details plus starting the work.",
      doneBodyTail: (ref: string) => ` You'll hear from us with the first result. Everything is filed under reference ${ref}.`,
    },
  },
};

export type PricingCopy = typeof de;

export function pricingCopy(locale: MovesLocale): PricingCopy {
  return locale === "en" ? en : de;
}
