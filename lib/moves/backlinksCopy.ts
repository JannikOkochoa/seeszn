// ─── BACKLINKS: Copy ──────────────────────────────────────────────────────────
// Kurz gehalten. Wer hier landet, kommt aus einer Mail und will konfigurieren,
// nicht lesen. Alles Erklärende steht unter dem Konfigurator und ist zugeklappt.
//
// ⚠ PLATZHALTER
// Betriebliche Angaben, die SEESZN noch bestätigen muss, stehen als [ANGABE: …].
// Sie sind bewusst sichtbar und nicht durch plausible Zahlen ersetzt: eine
// erfundene Lieferzeit oder eine erfundene Domainmetrik wäre auf dieser Seite
// der teuerste mögliche Fehler.

export const BACKLINKS = {
  label: "BACKLINKS",
  index: "01",

  h1a: "Autorität dort, wo dein",
  accent: "Markt",
  h1b: "liegt.",
  lead: "Wähl Menge, Format und Zielmarkt. Preis und Stückpreis stehen sofort daneben.",

  facts: [
    "Staffelpreis, kein Angebot nötig",
    "Einmalig oder monatlich",
    "Zielmarkt frei wählbar",
  ],

  meta: {
    title: "Backlinks kaufen | Staffelpreise nach Menge und Zielmarkt | SEESZN",
    description:
      "Backlinks als NAD, Blog oder Forum, einmalig oder monatlich. Menge, Zielmarkt und Format im Konfigurator wählen, Preis und Stückpreis stehen sofort daneben.",
  },

  /**
   * Die Ersatzzusage. Sie ist bewusst getrennt von der First-Move-Zusage
   * formuliert: dort geht es um eine nicht umsetzbare Maßnahme und endet bei
   * Ersatz oder Erstattung, hier um eine verschwundene oder mangelhafte
   * Platzierung und endet bei einer neuen Platzierung. Zwei Produkte, zwei
   * Zusagen, kein gemeinsamer Wortlaut.
   *
   * Ohne Frist: eine Dauer steht in keinen abgestimmten Bedingungen, und eine
   * erfundene wäre die teuerste Art, hier Vertrauen zu gewinnen.
   */
  protection: {
    label: "PLATZIERUNGSSCHUTZ",
    short: "Ersatz · inklusive",
    full: "Wird eine gelieferte Platzierung entfernt oder erfüllt sie den vereinbarten Qualitätsstandard nicht, ersetzt SEESZN sie ohne Aufpreis durch eine neue Platzierung.",
  },

  // ── Was unter dem Konfigurator steht ───────────────────────────────────────
  detail: {
    index: "02",
    label: "WAS DU KAUFST",
    h2a: "Drei Formate, ein",
    accent: "Zielmarkt",
    h2b: ".",
    lead: "Der Zielmarkt entscheidet über Sprache und Herkunft der Quellen. Das Format entscheidet, wo die Erwähnung steht.",
  },

  formats: [
    {
      label: "NAD",
      title: "Name, Adresse, Domain",
      body: "Einträge in Verzeichnissen und Registern des Zielmarkts. Sie bestätigen, dass ein Unternehmen existiert, wo es sitzt und unter welcher Domain es auftritt. Grundlage für die Auflösung als Entität.",
    },
    {
      label: "BLOG",
      title: "Redaktionell geführte Blogs",
      body: "Beiträge auf Blogs, die zu deinem Themenfeld regelmäßig veröffentlichen. Die Erwähnung steht im Text, nicht in einer Fußzeile oder einer Linkliste.",
    },
    {
      label: "FORUM",
      title: "Moderierte Fachforen",
      body: "Beiträge in Communities, in denen die Frage tatsächlich gestellt wird. Sie erreichen Leser mit konkreter Absicht und bleiben über Jahre auffindbar.",
    },
    {
      label: "SMART MIX",
      title: "Verteilung über alle drei",
      body: "Die Voreinstellung. Die Verteilung richtet sich nach dem Zielmarkt und nach dem, was dort tatsächlich verfügbar ist. Ein Markt ohne brauchbare Foren bekommt keine Foren.",
    },
  ],

  process: {
    index: "03",
    label: "ABLAUF",
    h2a: "Vier Schritte, davon",
    accent: "einer",
    h2b: "bei dir.",
    steps: [
      { n: "01", label: "KONFIGURATION", body: "Menge, Format und Zielmarkt stehen mit dem Kauf fest. Nichts davon wird später neu verhandelt." },
      { n: "02", label: "BRIEFING", body: "Domain, Ziel-URLs und Themen. Ein kurzes Formular direkt nach der Zahlung.", effort: "5 Minuten" },
      { n: "03", label: "UMSETZUNG", body: "Quellen suchen, prüfen, platzieren. [ANGABE: Bearbeitungszeit je Menge bestätigen.]" },
      { n: "04", label: "REPORT", body: "Eine Liste jeder Platzierung mit Quelle, Datum, URL und Linkattribut. [ANGABE: Format und Übergabeweg des Reports bestätigen.]" },
    ],
  },

  standards: {
    index: "04",
    label: "QUALIFIZIERUNG",
    h2a: "Woran eine Quelle",
    accent: "scheitert",
    h2b: ".",
    items: [
      { label: "THEMATISCHE NÄHE", body: "Eine Quelle kommt infrage, wenn sie zum Thema und zum Zielmarkt etwas veröffentlicht. Eine hohe Domainmetrik allein qualifiziert nichts." },
      { label: "ERKENNBARER BETRIEB", body: "Die Quelle wird gepflegt, hat Leser und eine eigene Linie. Keine Linknetzwerke, keine Private-Blog-Strukturen, kein Tausch." },
      { label: "KENNZEICHNUNG NACH VORGABE", body: "Eine bezahlte Platzierung trägt das Linkattribut, das die Quelle und die Google-Richtlinien dafür vorsehen." },
      { label: "SPRACHE DES ZIELMARKTS", body: "Quellen stammen aus dem gewählten Markt und veröffentlichen in dessen Sprache. Ein deutscher Zielmarkt bekommt keine englischen Quellen." },
      { label: "KEINE DOPPELUNG", body: "Innerhalb einer Bestellung wird jede Quelle einmal belegt. [ANGABE: Regel für Wiederholungen über mehrere Monate bestätigen.]" },
      { label: "ABLEHNUNGSRECHT", body: "Passt eine Anfrage nicht in diese Regeln, nehmen wir sie nicht an und erstatten vollständig. Das betrifft auch Branchen, für die wir keine glaubwürdigen Quellen finden." },
    ],
  },

  limits: {
    index: "05",
    label: "GRENZEN",
    h2a: "Was wir",
    accent: "nicht",
    h2b: "zusagen.",
    items: [
      "Positionen in Google oder in einem anderen Index.",
      "Aufnahme in AI Overviews, ChatGPT, Perplexity oder Gemini.",
      "Eine bestimmte Domainmetrik oder ein bestimmtes Besucheraufkommen der Quelle.",
      "Dass eine Erwähnung dauerhaft online bleibt. Wir dokumentieren den Stand bei Lieferung.",
    ],
    note: "Was wir zusagen, ist die Anzahl belegter Platzierungen nach den Regeln oben, jede mit Quelle, Datum, URL und Attribut.",
  },

  /**
   * Die Antwortschicht. Sichtbares HTML, keine Klappelemente: jede Antwort
   * beginnt mit dem Satz, der die Frage beantwortet, danach kommt nur, was
   * wirklich hilft. Sie ersetzt keine FAQ-Auszeichnung und jagt keinem
   * SERP-Format hinterher; sie steht hier, weil Käufer genau das fragen und
   * ein Abrufsystem den Absatz sonst aus der Slider-Logik erraten müsste.
   */
  answers: {
    index: "05",
    label: "HÄUFIGE FRAGEN",
    h2a: "Was Käufer vorher",
    accent: "wissen",
    h2b: "wollen",
    items: [
      {
        q: "Was kostet ein Backlink bei SEESZN?",
        a: "Der Stückpreis liegt zwischen 19,80 € und 14,45 € netto und sinkt mit der Menge. Einmalig kosten 5 Platzierungen 99 €, 100 Platzierungen 1.599 €. Monatlich beginnt die Staffel bei 10 Platzierungen für 162 € im Monat und endet bei 100 für 1.445 € im Monat.",
      },
      {
        q: "Kann ich genau 6 oder 17 Backlinks bestellen?",
        a: "Ja. Backlink-Bestellungen lassen sich in Schritten von einer Platzierung konfigurieren. Einmalbestellungen beginnen bei 5 Platzierungen, Monatspläne bei 10. Jede exakte Menge bis 100 ist wählbar, also auch 6, 17 oder 43. Der Preis je Platzierung sinkt dabei auf jeder ganzen Zahl.",
      },
      {
        q: "Wie viele Backlinks sollte ich pro Monat aufbauen?",
        a: "Eine sinnvolle Monatsmenge hängt vom bestehenden Referring-Domain-Profil ab, von der bisherigen Entwicklung und vom Abstand zu vergleichbaren Websites im Markt. Eine einzelne Kennzahl reicht dafür nicht. Wer unsicher ist, kann seine Domain kostenlos prüfen lassen und bekommt eine von einem Menschen geprüfte Startempfehlung.",
      },
      {
        q: "Wie lange läuft ein monatlicher Backlink-Plan?",
        a: "Monatliche Backlink-Pläne haben eine Mindestlaufzeit von drei Monaten. Der Monatspreis und die Mindestbindung über drei Monate stehen vor dem Checkout, nicht erst in den Bedingungen. Bei 20 Platzierungen im Monat sind das 320 € monatlich und 960 € netto Mindestbindung.",
      },
      {
        q: "Was passiert, wenn ein Backlink entfernt wird?",
        a: "Wird eine gelieferte Platzierung entfernt oder erfüllt sie den vereinbarten Qualitätsstandard nicht, ersetzt SEESZN sie ohne Aufpreis durch eine neue Platzierung. Der Ersatz ist im Preis enthalten und muss nicht gesondert beauftragt werden.",
      },
      {
        q: "Kann ich mehr als 100 Backlinks bestellen?",
        a: "Mengen von 5 bis 100 lassen sich direkt konfigurieren. Bestellungen über 100 Platzierungen bekommen einen eigenen Preis, der sich nach Umfang, Zielmarkt und Format richtet. Dafür genügt eine kurze Anfrage, es gibt keinen automatisch hochgerechneten Preis.",
      },
      {
        q: "Kann SEESZN mir eine Startmenge empfehlen?",
        a: "Ja. SEESZN prüft auf Wunsch die Domain kostenlos und schickt innerhalb eines Werktags eine konkrete Empfehlung für die Startmenge. Die Einschätzung wird von einem Menschen geprüft und nicht automatisch aus einer einzelnen Kennzahl berechnet. Nötig sind Domain und E-Mail, sonst nichts.",
      },
    ],
  },

  faq: {
    index: "06",
    label: "FRAGEN",
    h2a: "Was vor dem Kauf",
    accent: "offen",
    h2b: "bleibt.",
    items: [
      { q: "Ist das gekaufter Linkaufbau?", a: "Gekauft wird die Arbeit an einer Quelle mit echtem Betrieb: Recherche, Prüfung, Platzierung, Protokoll. Ist eine Platzierung bezahlt, wird sie gekennzeichnet und trägt das dafür vorgesehene Linkattribut. Anonyme Verkäuferlisten, Linktausch und Netzwerke sind ausgeschlossen." },
      { q: "Verbessert das mein Ranking?", a: "Das sagen wir nicht zu, und niemand kann es seriös zusagen. Eine Platzierung stellt eine Quelle her, die Menschen lesen und Systeme abrufen können. Was daraus folgt, hängt vom Rest deiner Sichtbarkeit ab." },
      { q: "Was ist der Unterschied zwischen NAD, Blog und Forum?", a: "NAD sind Einträge in Verzeichnissen und Registern, sie bestätigen die Existenz und den Sitz des Unternehmens. Blog sind Beiträge auf redaktionell geführten Blogs. Forum sind Beiträge in moderierten Communities. Der Preis ist bei allen dreien gleich." },
      { q: "Warum ist der Zielmarkt wichtig?", a: "Quellen aus dem falschen Land erreichen die falschen Leser und passen nicht zur Sprache deiner Seiten. Der gewählte Markt bestimmt Herkunft und Sprache der Quellen." },
      { q: "Was passiert nach der Zahlung?", a: "Du kommst auf ein kurzes Briefing: Domain, Ziel-URLs, Themen, Hinweise. Fünf Minuten. Danach beginnt die Umsetzung." },
      { q: "Kann ich monatlich kündigen?", a: "Ja. Die Monatsstaffel ist zum Ende des laufenden Abrechnungszeitraums kündbar, ohne Mindestlaufzeit. Der Einmalkauf hat ohnehin keine Laufzeit." },
      {
        q: "Wie viele Backlinks sollte ich pro Monat aufbauen?",
        a: "Die passende Menge hängt nicht allein von der Zahl vorhandener Backlinks ab. Sinnvoll sind unter anderem das bestehende Referring-Domain-Profil, die bisherige Entwicklung und vergleichbare Websites im Markt. Wer unsicher ist, kann seine Domain kostenlos von SEESZN prüfen lassen und erhält eine menschlich geprüfte Startempfehlung.",
      },
      {
        q: "Kann SEESZN mir eine Backlink-Menge empfehlen?",
        a: "Ja. SEESZN prüft auf Wunsch die Domain kostenlos und schickt innerhalb eines Werktags eine konkrete Empfehlung für die Startmenge. Die Einschätzung wird von einem Menschen geprüft und nicht automatisch aus einer einzelnen Kennzahl berechnet.",
      },
      { q: "Warum ist die Monatsstaffel günstiger?", a: "Laufende Mengen lassen sich vorausplanen. Quellenrecherche und Abstimmung fallen einmal an und tragen über mehrere Monate, deshalb geben wir 10 Prozent davon weiter." },
      { q: "Wie lange dauert die Lieferung?", a: "[ANGABE: Bearbeitungszeit je Menge bestätigen, bevor diese Seite live geht.]" },
      { q: "Was ist, wenn eine Platzierung nicht geliefert werden kann?", a: "[ANGABE: Ersatz- und Erstattungsregel für einzelne Einheiten bestätigen.]" },
    ],
  },
} as const;
