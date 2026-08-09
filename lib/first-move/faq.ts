// ─── First Move: FAQ ──────────────────────────────────────────────────────────
// Nur Fragen, die eine Kaufentscheidung tragen. Antworten direkt, mit den
// gesperrten Werten aus product.ts, ohne Marketingfloskeln. Der Text wird
// server-gerendert und identisch als FAQPage-Schema ausgegeben.

import {
  ACCESS_DEADLINE_DAYS,
  CLIENT_EFFORT_MINUTES,
  DELAY_CLAUSE,
  DELIVERY_DISPLAY,
  HOSTING_REGION,
  MEASUREMENT_WEEKS_MAX,
  MEASUREMENT_WEEKS_MIN,
  PRICE_DISPLAY,
  PRICE_DISPLAY_NET,
  RETENTION_DAYS,
  RISK_REVERSAL_FULL,
} from "./product";

export interface FaqItem {
  q: string;
  a: string;
}

export const MASTER_FAQ: readonly FaqItem[] = [
  {
    q: "Was ist ein SEESZN First Move?",
    a: `Ein First Move ist eine begrenzte Diagnose- und Umsetzungsleistung zum Festpreis von ${PRICE_DISPLAY_NET}. Wir belegen den wichtigsten Engpass in Search, AI Search oder Paid Acquisition, setzen genau eine passende Änderung um und dokumentieren danach den Vorher/Nachher-Zustand.`,
  },
  {
    q: `Was bekomme ich für ${PRICE_DISPLAY}?`,
    a: "Die Verifikation des Befunds, die Priorisierung eines First Move, einen kurzen Kickoff, die Umsetzung der begrenzten Änderung, QA mit einer Freigabeschleife, das Mess-Setup, einen Evidence Record und ein Follow-up nach dem Messfenster. Am Ende steht eine umgesetzte Änderung mit dokumentiertem Nachweis.",
  },
  {
    q: "Was zeigt der kostenlose Scan und was nicht?",
    a: "Der Scan zeigt die Beobachtung, ein bis zwei Belege dazu sowie Impact und Confidence. Er zeigt keine Zielseiten, keinen Umsetzungsplan und keine Messhypothese. Ein kurzer öffentlicher Scan erkennt ein Muster, er kennt damit noch nicht die Ursache. Die Verifikation und die Umsetzung gehören zum bezahlten First Move.",
  },
  {
    q: "Wie läuft der Kauf ab?",
    a: `Du schickst eine verbindliche Anfrage zum Festpreis von ${PRICE_DISPLAY_NET}. Wir verifizieren den Befund, bestätigen dir den Scope schriftlich und stellen danach die Rechnung. Auf der Seite selbst findet keine Zahlung statt.`,
  },
  {
    q: "Kann ich die Probleme nicht einfach selbst mit Claude oder einem SEO-Tool finden?",
    a: "Viele einzelne Probleme lassen sich heute schnell mit Tools oder KI finden. Schwieriger ist die Priorisierung: Welcher Befund hat wirtschaftliche Relevanz, welcher ist technisches Rauschen und welche Änderung sollte zuerst umgesetzt werden? First Move verbindet diese Auswahl mit der tatsächlichen Umsetzung und einer anschließenden Messung. Wenn dein Team die Priorisierung und die Umsetzung ohnehin selbst abdeckt, brauchst du uns dafür nicht.",
  },
  {
    q: "Welche Signale prüft SEESZN?",
    a: "Im ersten Schritt ausschließlich öffentlich lesbare Signale: Erreichbarkeit und Statuscodes, robots.txt, Sitemap, Indexierbarkeit, Canonical-Verhalten, Seitentemplates, Überschriftenstruktur, interne Verlinkung, inhaltliche Überschneidung, strukturierte Daten, Entity-Signale und Antwortstruktur. Für Paid Acquisition zusätzlich öffentlich sichtbare Mess- und Consent-Signale sowie die Struktur der Einstiegsseite. Alles Tiefere braucht Zugriff und passiert erst nach der Beauftragung.",
  },
  {
    q: "Kann ein First Move auch Google Ads betreffen?",
    a: "Ja. Paid Acquisition ist ein Diagnosepfad desselben Produkts zum selben Festpreis. Der Paid-Weg läuft in zwei Stufen: zuerst der öffentliche Vorcheck ohne Account-Zugriff, danach, wenn ein öffentliches Signal vorliegt, der Read-only-Zugriff auf den Google-Ads-Account für die Account-Ebene.",
  },
  {
    q: "Braucht SEESZN vor dem Kauf Zugriff auf meine Website?",
    a: "Nein. Das erste Signal entsteht ausschließlich aus öffentlich abrufbaren Daten. Zugriff brauchen wir für die Verifikation und die Umsetzung, also nach der Anfrage.",
  },
  {
    q: "Braucht SEESZN vor dem Kauf Schreibzugriff auf Google Ads?",
    a: "Nein. Vor dem Kauf gibt es keinen Schreibzugriff und keine Kampagnenänderung. Für den vollständigen Paid-Befund brauchen wir Read-only-Zugriff: lesen, nicht ändern, jederzeit widerrufbar.",
  },
  {
    q: "Wann ist der First Move umgesetzt?",
    a: `${DELIVERY_DISPLAY}. Dein Aufwand liegt bei maximal ${CLIENT_EFFORT_MINUTES} Minuten für Zugriff und Freigabe. ${DELAY_CLAUSE}`,
  },
  {
    q: "Wie wird die Wirkung gemessen?",
    a: `Vor der Umsetzung definieren wir Messgröße und Basiswert, danach dokumentieren wir die Entwicklung über ${MEASUREMENT_WEEKS_MIN} bis ${MEASUREMENT_WEEKS_MAX} Wochen mit derselben Messlogik. Wir nennen dabei auch, was die Daten nicht tragen. Wir garantieren keine Position und kein Umsatzergebnis.`,
  },
  {
    q: "Was passiert, wenn der öffentliche Scan kein Signal findet?",
    a: "Dann sagen wir das. Ein generischer Checklistenpunkt wird bei uns nicht zum Engpass erklärt, nur damit ein Ergebnis dasteht. Der öffentliche Scan sieht allerdings nur einen Ausschnitt: Search Console, Analytics und der Google-Ads-Account bleiben von außen unsichtbar. Du kannst einen First Move deshalb auch ohne öffentliches Signal anfragen. Wir prüfen die Lage dann mit den nötigen Zugängen und sagen vor der Umsetzung, ob ein begrenzter Move trägt.",
  },
  {
    q: "Was passiert, wenn der bestätigte Move nicht umsetzbar ist?",
    a: RISK_REVERSAL_FULL,
  },
  {
    q: "Wie lange werden Scan-Daten gespeichert?",
    a: `${RETENTION_DAYS} Tage. Die Verarbeitung läuft in ${HOSTING_REGION}. Wir speichern nur, was für die Leistung nötig ist.`,
  },
  {
    q: "Was passiert, wenn ich notwendige Zugänge nicht rechtzeitig bereitstelle?",
    a: `Die Lieferfrist startet erst mit vollständigem Zugriff und geklärtem Freigabeweg. Liegen die notwendigen Zugänge nach ${ACCESS_DEADLINE_DAYS} Tagen nicht vor, pausiert die Leistung, bis sie da sind. Eine so entstandene Verzögerung begründet keinen Erstattungsanspruch aus dieser Verzögerung.`,
  },
];

/**
 * Die vollständige FAQ der Google-Ads-Seite. Sie ist bewusst kurz und paid-nah:
 * acht Fragen, die ein Budgetverantwortlicher vor einer Anfrage wirklich stellt.
 *
 * V6-Korrektur: die Seite hängt nicht mehr die komplette Master-FAQ an. Wer
 * aus einer Anzeige kommt, sucht keine allgemeine Produkterklärung, sondern die
 * Grenze zwischen öffentlichem Check und Konto, den Preis und den Ablauf. Der
 * sichtbare Text und das FAQPage-Schema dieser Seite sind identisch, es gibt
 * kein verstecktes Zusatzschema.
 */
export const PAID_FAQ: readonly FaqItem[] = [
  {
    q: "Was prüft der öffentliche Paid Check?",
    a: "Nur das, was öffentlich sichtbar ist: welche Mess- und Tag-Signale im ausgelieferten HTML vorhanden sind, ob eine Consent-Plattform erkennbar ist, wie die Einstiegsseite strukturiert ist, wie viel Reibung das Formular erzeugt, ob es einen klaren Konversionspfad gibt und wie die Seite mobil lädt. Das ergibt einen begründeten Anfangsverdacht, keinen Account-Befund.",
  },
  {
    q: "Was kann der öffentliche Check ohne Google-Ads-Zugriff nicht sehen?",
    a: "Die vollständige Conversion-Konfiguration, Attributionseinstellungen, verschwendete Suchbegriffe, PMax-Incrementality, das Verhältnis von Brand zu Non-Brand, Offline-Conversion-Qualität und die tatsächliche Leadqualität. Diese Punkte behaupten wir vor dem Read-only-Zugriff nicht.",
  },
  {
    q: "Wann braucht SEESZN Read-only-Zugriff?",
    a: "Erst wenn der öffentliche Check ein relevantes Signal ergeben hat und die nächste Frage nur im Konto beantwortbar ist. Vor dem Kauf wird nichts verbunden und nichts geändert. Den Zugriff richten wir im Kickoff gemeinsam ein, in unter 15 Minuten.",
  },
  {
    q: "Was bekommt SEESZN mit Read-only-Zugriff?",
    a: "Lesenden Zugriff auf den Google-Ads-Account: keine Schreibrechte, keine Kampagnenänderung, jederzeit widerrufbar, Zugangsdaten werden nicht geloggt. Damit werden Brand Leakage, Search-Term Waste, PMax-Incrementality, Conversion-Signalqualität, Kampagnenstruktur und Landingpage-Zuordnung beurteilbar.",
  },
  {
    q: `Was kostet der First Move?`,
    a: `${PRICE_DISPLAY_NET} als Festpreis, unabhängig vom Kanal und vom Mediabudget. Komplexität verändert nicht den Preis, sondern die Frage, ob ein begrenzter Move verantwortbar ist. Braucht ein Befund einen kompletten Account-Rebuild, verkaufen wir dafür keinen First Move und grenzen vorher gemeinsam ein.`,
  },
  {
    q: "Wie läuft die Umsetzung ab?",
    a: `Wir verifizieren den Befund mit den nötigen Zugängen, setzen genau eine klar begrenzte Änderung um, prüfen sie in einer Freigabeschleife und dokumentieren das Ergebnis über ${MEASUREMENT_WEEKS_MIN} bis ${MEASUREMENT_WEEKS_MAX} Wochen. ${DELIVERY_DISPLAY}, mit maximal ${CLIENT_EFFORT_MINUTES} Minuten Aufwand auf eurer Seite.`,
  },
  {
    q: "Wie viel Zeit braucht unser Team?",
    a: `Maximal ${CLIENT_EFFORT_MINUTES} Minuten für Zugriff und Freigabe. Die Lieferfrist beginnt erst, wenn Zugriff und Freigabeweg stehen. ${DELAY_CLAUSE}`,
  },
  {
    q: "Was passiert, wenn der bestätigte Move nicht umsetzbar ist?",
    a: RISK_REVERSAL_FULL,
  },
];
