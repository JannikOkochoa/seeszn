// ─── First Move: der Beispielbefund ───────────────────────────────────────────
// Vor der ersten Prüfung steht im Ergebnisbereich ein Beispiel. Es erklärt die
// Form des Ergebnisses, bevor jemand seine Domain eingibt.
//
// Warum das erlaubt ist: die V6-Regel über zurückgehaltene Umsetzungsdetails
// gilt für echte Befunde zu einer echten Besucherdomain. Ein sichtbar als
// Beispiel gekennzeichneter, erfundener Fall nimmt niemandem Arbeit vorweg, er
// zeigt nur, was der Scan ausgibt.
//
// Harte Regeln für dieses Objekt:
//   - Es gehört zu keiner Domain. Kein Kunde, kein Interessent, keine echte
//     Adresse. Der Fall ist abstrakt formuliert.
//   - Es ist ein eigener Typ, kein `PublicFinding`. Damit kann es nicht
//     versehentlich in den Zustand eines echten Ergebnisses geraten, nicht in
//     einen Lead-Payload wandern und nicht als Scanergebnis getrackt werden.
//   - Es verschwindet, sobald eine echte Prüfung startet.
//   - Es darf nie aus /api/first-move/* zurückkommen.

export interface ExampleFinding {
  /** Wird als sichtbares Label gerendert. Nie entfernen. */
  label: string;
  title: string;
  summary: string;
  evidence: { id: string; observation: string }[];
  impact: string;
  confidence: string;
  interventionType: string;
  /** Was der bezahlte Schritt ergänzt. Erklärt das Produkt, verspricht nichts. */
  afterVerification: string;
  /** Aufforderung unter dem Beispiel. */
  cta: string;
}

export const EXAMPLE_FINDING: ExampleFinding = {
  label: "Beispiel · noch keine Prüfung gelaufen",
  title: "Drei Seiten konkurrieren um dieselbe kommerzielle Absicht.",
  summary:
    "Ein erfundener Fall zur Veranschaulichung: Drei eigenständig indexierbare Seiten adressieren dieselbe Suchabsicht. Relevanz und interne Verlinkung verteilen sich auf mehrere Ziele, statt sich auf einem zu bündeln.",
  evidence: [
    {
      id: "x1",
      observation:
        "Die Seiten sind indexierbar und bedienen stark überlappende Themen- und Intent-Signale.",
    },
    {
      id: "x2",
      observation:
        "Keine der Seiten verweist per Canonical auf eine der anderen. Sie stehen als eigenständige Ziele nebeneinander.",
    },
  ],
  impact: "Hoch",
  confidence: "Mittel",
  interventionType: "Konsolidierung auf eine zentrale Zielseite",
  afterVerification:
    "Im bezahlten First Move prüfen wir mit Zugriff auf Search Console und Website, welche Seite das Ziel wird, setzen die Zusammenführung um und dokumentieren Klicks und Position vorher und nachher.",
  cta: "Gib deine Domain ein. Danach erscheint hier ein Befund zu deiner Website.",
};

/**
 * Dieselbe Rolle für die Google-Ads-Seite. Wer aus einer Anzeige kommt, soll im
 * Beispiel seinen eigenen Kanal wiedererkennen und nicht einen Search-Fall.
 * Ebenfalls erfunden und ebenfalls ohne echte Domain.
 */
export const EXAMPLE_FINDING_PAID: ExampleFinding = {
  label: "Beispiel · noch keine Prüfung gelaufen",
  title: "Das Messsignal hinter dem bezahlten Traffic ist öffentlich nicht nachvollziehbar.",
  summary:
    "Ein erfundener Fall zur Veranschaulichung: Die Einstiegsseite lädt Mess-Tags, aber kein erkennbares Google-Ads-Conversion-Signal. Was der Account als Conversion zurückbekommt, entscheidet über Gebotssteuerung und Budgeteffizienz.",
  evidence: [
    {
      id: "y1",
      observation:
        "Im ausgelieferten HTML ist ein Tag-Container sichtbar, aber kein Google-Ads-Conversion- oder Remarketing-Signal.",
    },
    {
      id: "y2",
      observation:
        "Eine gängige Consent-Plattform ist nicht erkennbar. Wie die Einwilligung die Messung steuert, lässt sich von außen nicht bestätigen.",
    },
  ],
  impact: "Hoch",
  confidence: "Mittel",
  interventionType: "Conversion-Signal messbar und prüfbar machen",
  afterVerification:
    "Im bezahlten First Move prüfen wir das mit Read-only-Zugriff auf den Google-Ads-Account, setzen ein sauber definiertes primäres Conversion-Signal und dokumentieren den Anteil der Klicks mit gültigem Signal vorher und nachher.",
  cta: "Gib deine Domain ein. Danach erscheint hier ein Befund zu deiner Einstiegsseite.",
};
