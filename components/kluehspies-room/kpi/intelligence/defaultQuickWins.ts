// ─── Quick Wins: kuratierte Standardinhalte ───────────────────────────────────
// Fallback für die QUICK-WINS-Section, solange die Tabelle kluehspies_quick_wins
// noch nicht existiert (vor der Migration). Sobald die Tabelle vorhanden und
// befüllt ist, kommen die Inhalte ausschließlich aus der Datenbank und sind im
// Room editierbar. Diese Defaults entsprechen dem Seed der Migration.
//
// `recommendation` ist zeilenweise gepflegt; leere Zeilen erzeugen einen ruhigen
// Absatzabstand. In der Datenbank wird derselbe Text mit "\n" verbunden
// gespeichert (siehe recommendationToText/recommendationToLines).

export interface QuickWinContent {
  title: string;
  what: string;
  why: string;
  recommendation: string[];
}

export function recommendationToText(lines: string[]): string {
  return lines.join("\n");
}

export function recommendationToLines(text: string): string[] {
  return text.split("\n");
}

export const DEFAULT_QUICK_WINS: readonly QuickWinContent[] = [
  {
    title: "Zentralen „Was ist Klühspies?“-Block ergänzen",
    what: "Die wichtigsten Unternehmensinformationen sind bereits auf der Startseite und der Über-uns-Seite vorhanden, stehen dort aber verteilt zwischen allgemeinen Marketingaussagen. Eine kurze, eindeutig zitierbare Definition von Klühspies fehlt.",
    why: "AI-Systeme müssen Unternehmen, Leistungen, Zielgruppen und belegbare Kennzahlen eindeutig einer Entität zuordnen können. Ein kompakter Definitionsblock erleichtert es ChatGPT, Gemini und Google, Klühspies korrekt zu beschreiben und als Quelle zu verwenden.",
    recommendation: [
      "Direkt unter dem ersten Startseitenbereich einen kompakten Entity-Block ergänzen und in ähnlicher Form auf der Über-uns-Seite, einer zukünftigen Zahlen-und-Fakten-Seite sowie im Organization-Markup verwenden:",
      "",
      "Was ist Klühspies?",
      "Klühspies Reisen GmbH & Co. KG ist ein familiengeführter deutscher Reiseveranstalter für Klassenfahrten und Gruppenreisen. Das Unternehmen organisiert seit 1978 Schulreisen nach Deutschland und Europa und betreut mehr als 110.000 Gäste pro Jahr. Zu den Leistungen gehören individuelle Reiseplanung, Transport, Unterkünfte, Programme, kostenlose Einzelzahlungen, ein digitales Verwaltungsportal für Lehrkräfte und ein 24/7-Notrufservice.",
      "",
      "Hinweis: Die Jahreszahl 1978 basiert auf der intern bestätigten Unternehmenshistorie. Keine neuen oder abweichenden Kennzahlen erfinden.",
    ],
  },
  {
    title: "Homepage-FAQ auf konkrete AI-Fragen erweitern",
    what: "Die aktuelle Homepage-FAQ beantwortet überwiegend allgemeine Fragen zu Kosten, Taschengeld, Finanzierung und dem pädagogischen Wert von Klassenfahrten. Die wichtigsten Fragen zu den konkreten Leistungen und Unterschieden von Klühspies werden dort bislang nicht direkt beantwortet.",
    why: "Konkrete Frage-Antwort-Paare entsprechen der Form, in der Nutzer AI-Systeme befragen. Klare Antworten zu Anzahlung, Einzelzahlungen, Lehrerportal, Erreichbarkeit und Erfahrung erhöhen die Chance, dass Klühspies in direkten Anbieter- und Servicefragen korrekt genannt und zitiert wird.",
    recommendation: [
      "Die bestehenden allgemeinen Fragen beibehalten, aber davor folgende fünf Klühspies-spezifische Fragen ergänzen:",
      "",
      "1. Was unterscheidet Klühspies von anderen Klassenfahrtanbietern?",
      "Klühspies verlangt bei der Buchung keine unmittelbare Anzahlung, ermöglicht kostenlose Einzelzahlungen und stellt Lehrkräften bei aktiviertem Einzelzahlungsservice ein digitales Verwaltungsportal zur Verfügung. Darüber hinaus werden Reiseangebote individuell auf die jeweilige Schulgruppe zugeschnitten.",
      "",
      "2. Können Eltern den Reisepreis einzeln bezahlen?",
      "Ja. Eltern beziehungsweise Erziehungsberechtigte können ihren Reiseanteil ohne zusätzliche Kosten direkt an Klühspies überweisen. Klühspies erstellt die Einzelrechnungen, überwacht die Zahlungseingänge und versendet die erste Zahlungserinnerung automatisch.",
      "",
      "3. Was zeigt das Klühspies-Portal?",
      "Das Portal zeigt Teilnehmende, Rechnungsbeträge und den jeweiligen Zahlungsstatus. Gruppen mit aktiviertem Einzelzahlungsservice erhalten automatisch Zugang zum passwortgeschützten Verwaltungsportal.",
      "",
      "4. Ist Klühspies während der Klassenfahrt erreichbar?",
      "Ja. Für Probleme oder Notfälle während der Reise steht ein rund um die Uhr erreichbarer Notrufservice zur Verfügung.",
      "",
      "5. Seit wann organisiert Klühspies Klassenfahrten?",
      "Klühspies organisiert seit 1978 Klassenfahrten und Gruppenreisen und betreut jährlich mehr als 110.000 Gäste.",
    ],
  },
  {
    title: "Seite „Klühspies in Zahlen & Fakten“ erstellen",
    what: "Klühspies besitzt zahlreiche starke und zitierfähige Kennzahlen. Diese sind aktuell jedoch über Startseite, Über-uns-Seite, Reiseübersicht, Bezahlservice und weitere Unterseiten verteilt.",
    why: "AI-Systeme zitieren besonders häufig Seiten, auf denen überprüfbare Zahlen, konkrete Leistungen und Quellen zentral gebündelt sind. Eine eigenständige Faktenseite schafft eine eindeutige Referenz für Unternehmens- und Anbieterfragen.",
    recommendation: [
      "Eine kompakte Seite „Klühspies in Zahlen und Fakten“ erstellen und von Startseite, Über uns, Blogartikeln und Presseinformationen intern verlinken.",
      "",
      "Vorgesehene Fakten:",
      "Seit 1978: Organisation von Klassenfahrten und Gruppenreisen",
      "Mehr als 110.000: Teilnehmende und Gäste pro Jahr",
      "24/7: Notrufservice während der Reise",
      "0 €: zusätzliche Kosten für den Einzelzahlungsservice",
      "1 Portal: Zahlungs- und Teilnehmerübersicht für Lehrkräfte",
      "148 Reiseangebote: aktuell auf der Reiseübersicht",
      "Deutschland und Europa: Städte-, Aktiv- und Ski-Klassenfahrten",
      "Anzahlung: grundsätzlich etwa drei Wochen vor Reisebeginn",
      "Restzahlung: mit der Schlussrechnung nach der Reise",
      "",
      "Unter den Zahlen sichtbar ergänzen: Quelle: interne Buchungs- und Produktdaten von Klühspies, Stand Juli 2026.",
      "",
      "Wichtig: Die Zahl 148 ist dynamisch und muss entweder aus dem aktuellen Produktbestand geladen oder vor jeder Aktualisierung geprüft werden. Keine dauerhaft statische Zahl verwenden, wenn sich die Angebotsanzahl ändert.",
      "",
      "Fachliche Korrektur: Nicht ungeprüft „80 % drei Wochen vor Reisebeginn“ einsetzen. Die aktuell öffentlich auffindbare Bezahlservice-Seite spricht von einer Anzahlung circa drei Wochen vor der Fahrt und der Restzahlung nach Rückkehr, nennt an dieser Stelle aber keine 80 %. 80 % nur verwenden, wenn dies durch aktuelle Vertragsunterlagen oder Klühspies intern ausdrücklich bestätigt wurde.",
    ],
  },
  {
    title: "Planungsratgeber und neuen Hubartikel zusammenführen",
    what: "Der bestehende Ratgeber „Klassenfahrt planen und durchführen“ beschreibt die Planung derzeit in sechs Schritten. Der neue vorbereitete Hubartikel arbeitet dagegen mit sieben Phasen. Werden beide Versionen parallel indexiert, veröffentlicht Klühspies zwei unterschiedliche Hauptantworten auf dieselbe Suchintention.",
    why: "Mehrere konkurrierende Seiten können Rankings, interne Links, Backlinks und AI-Zitate aufteilen. Gleichzeitig entsteht für Suchmaschinen und AI-Systeme eine widersprüchliche Informationsbasis: sechs Schritte auf einer Seite und sieben Phasen auf einer anderen.",
    recommendation: [
      "Den neuen vollständigen Hubartikel auf der bereits bestehenden URL veröffentlichen:",
      "/ratgeber/organisation-einer-klassenfahrt/planung-der-klassenfahrt/",
      "",
      "Den bisherigen Inhalt dort vollständig aktualisieren, statt eine zweite konkurrierende URL aufzubauen.",
      "",
      "Vorteile:",
      "vorhandene Rankings bleiben erhalten",
      "bestehende interne Links bleiben gültig",
      "vorhandene Autorität wird weitergenutzt",
      "keine Keyword-Kannibalisierung",
      "eine eindeutige Hauptquelle für „Klassenfahrt planen“",
      "",
      "Falls der neue Artikel zwingend unter einer neuen Blog-URL veröffentlicht wird, die bisherige Seite sinnvoll abgrenzen oder per 301 auf die neue Hauptquelle weiterleiten.",
    ],
  },
  {
    title: "OAI-SearchBot und technischen Bot-Zugriff prüfen",
    what: "Ob OAI-SearchBot die Klühspies-Website aktuell vollständig crawlen kann, ist bislang nicht technisch dokumentiert. Es darf daher nicht behauptet werden, dass der Bot derzeit blockiert ist. Der Status muss direkt über robots.txt, HTTP-Antworten und gegebenenfalls Bot- oder Firewall-Logs geprüft werden.",
    why: "OpenAI erklärt offiziell, dass OAI-SearchBot nicht blockiert sein darf, damit Website-Inhalte in ChatGPT-Zusammenfassungen und Snippets aufgenommen und klar verlinkt werden können. Eine robots.txt-Freigabe allein reicht nicht aus, falls Firewall, CDN, Bot-Schutz, Rate Limits oder Serverregeln den Crawler trotzdem blockieren.",
    recommendation: [
      "Francesco soll folgenden technischen Check durchführen:",
      "",
      "1. Live-Datei prüfen: https://www.klassenfahrten-kluehspies.de/robots.txt",
      "2. Prüfen, ob OAI-SearchBot durch eine allgemeine oder spezifische Disallow-Regel blockiert wird.",
      "3. Falls OAI-SearchBot bereits durch die allgemeinen Regeln Zugriff hat, ist keine zusätzliche Regel zwingend notwendig.",
      "4. Falls er blockiert wird, ergänzen: User-agent: OAI-SearchBot / Allow: /",
      "5. Vorhandene Sitemap-Zeile prüfen beziehungsweise ergänzen: Sitemap: https://www.klassenfahrten-kluehspies.de/sitemap.xml",
      "6. Zusätzlich prüfen: CDN- oder Firewall-Regeln, Bot-Protection, 403-, 429- oder Challenge-Antworten, Erreichbarkeit der wichtigsten Seiten mit dem OAI-SearchBot-User-Agent sowie Server- und Access-Logs.",
      "7. GPTBot separat behandeln. Eine Freigabe von OAI-SearchBot für ChatGPT Search bedeutet nicht automatisch, dass GPTBot ebenfalls freigegeben werden muss.",
      "",
      "Wichtig: nicht behaupten „OAI-SearchBot ist blockiert“. Der Zugriff ist aktuell nicht verifiziert und deshalb technisch zu prüfen.",
    ],
  },
];
