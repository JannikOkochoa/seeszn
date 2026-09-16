// ─── MOVES: der Katalog ───────────────────────────────────────────────────────
// Eine einzige Quelle für alles Kaufentscheidende: Preis, Umfang, Lieferzeit,
// Bindung, Grenzen und Messgrößen. Sichtbare Copy, Structured Data, Stripe-
// Schlüssel, Bestätigungsmails und API-Antworten lesen aus dieser Datei.
//
// ⚠ PREISE SIND VORLÄUFIG.
// Die Zahlen unten sind Platzhalter in marktüblicher Größenordnung, damit die
// Oberfläche vollständig funktioniert. Sie sind nicht mit SEESZN abgestimmt.
// Bevor MOVES öffentlich geht, muss jede Zahl hier bestätigt und in Stripe als
// Price angelegt werden. Es gibt genau diese eine Stelle zum Ändern.
//
// Schreibregeln für jede Copy in diesem Verzeichnis, gleich wie in
// lib/first-move: keine Gedankenstriche, kein Mittelpunkt als Trenner, keine
// erfundene Knappheit, keine erfundenen Kundenzahlen, kein "nicht X, sondern Y",
// keine Ranking-Zusage, keine Zusage über AI Overviews.
//
// Positionierung, die hier nicht verhandelbar ist: SEESZN verkauft keine Links.
// Verkauft wird redaktionelle Arbeit auf Quellen, die ein echtes Publikum haben.
// Bezahlte Platzierungen werden gekennzeichnet. Was nicht in diese Regeln passt,
// wird abgelehnt.

import type { MoveCategory, MoveCategoryId, MoveTier, PurchaseMode } from "./types";

/**
 * Die kommerzielle Rubrik heißt PREISE und liegt unter /pricing.
 *
 * Der Name MOVES stammt aus der Konzeptphase. Er ist nicht öffentlich geworden:
 * "Preise" ist das Wort, das ein Einkäufer in der Navigation sucht, und es
 * verspricht genau das, was die Seite liefert. Die Dateien unter lib/moves
 * behalten ihren Ordnernamen, weil ein Umbenennen des Verzeichnisses Bewegung
 * ohne Gewinn wäre.
 */
export const MOVES_LABEL = "PREISE";
export const MOVES_PATH = "/pricing";

/** Wohin ein Besucher geht, der lieber erst prüfen lässt. */
export const STRATEGIC_PATH = "/first-move";
export const STRATEGIC_REQUEST_PATH = "/first-move#start";

/** Frist, innerhalb derer eine nicht lieferbare Einheit ersetzt oder erstattet wird. */
export const REPLACEMENT_WINDOW_DAYS = 45;

/** Die Zusage am Kauf. Kurzform für den CTA-Bereich. */
export const GUARANTEE_SHORT = "Ersatz oder volle Erstattung, wenn nicht lieferbar";

export const GUARANTEE_FULL =
  `Ist eine gekaufte Einheit innerhalb von ${REPLACEMENT_WINDOW_DAYS} Tagen nicht in der zugesagten Qualität lieferbar, bekommst du wahlweise eine gleichwertige Einheit oder die volle Erstattung dieser Einheit.`;

/**
 * Der Steuerhinweis am Preis. Bewusst die neutrale Formulierung: sie stimmt
 * unabhängig davon, ob Stripe Tax aktiv ist und ob im Einzelfall Reverse Charge
 * greift. Sobald automatic_tax im Checkout eingeschaltet ist, kann hier auf
 * "wird im Checkout ausgewiesen" umgestellt werden, vorher wäre das falsch.
 */
export const PRICE_TAX_NOTE = "Alle Preise netto zuzüglich gesetzlicher Umsatzsteuer.";

/** Die Vertragsgrundlage, verlinkt direkt unter der Handlung. */
export const TERMS_NOTE = "Es gelten der Umfang auf dieser Seite und die Angaben im";
export const TERMS_PATH = "/legal";
export const TERMS_LABEL = "Impressum";

/** Was in keinem Preis enthalten ist und nirgends zugesagt wird. */
export const NEVER_PROMISED: readonly string[] = [
  "Positionen in Google oder in einem anderen Index",
  "Aufnahme in AI Overviews, ChatGPT, Perplexity oder Gemini",
  "eine bestimmte Anzahl an Backlinks aus einem Verteiler",
  "Veröffentlichung gegen den Willen einer Redaktion",
];

/**
 * Die Qualifizierung. Sie gilt für alle vier Flächen und steht deshalb an einer
 * Stelle. Diese Liste ist der Unterschied zu einem anonymen Linkverkauf und
 * gehört sichtbar auf jede Produktseite.
 */
export const STANDARDS: readonly { label: string; body: string }[] = [
  {
    label: "THEMATISCHE NÄHE VOR METRIK",
    body: "Eine Quelle kommt infrage, wenn sie zu deiner Kategorie regelmäßig etwas veröffentlicht. Eine hohe Domainmetrik allein qualifiziert nichts.",
  },
  {
    label: "ECHTE REDAKTION, ECHTES PUBLIKUM",
    body: "Wir arbeiten mit Publikationen, die eine erkennbare Redaktion, eine erkennbare Leserschaft und eine eigene Linie haben. Keine Linknetzwerke, keine Private-Blog-Strukturen, kein Tausch.",
  },
  {
    label: "KENNZEICHNUNG NACH VORGABE",
    body: "Eine bezahlte Platzierung wird als solche gekennzeichnet und trägt das Linkattribut, das die Publikation und die Google-Richtlinien dafür vorsehen. Das ist keine Schwäche der Platzierung, sondern die Bedingung dafür, dass sie Bestand hat.",
  },
  {
    label: "DU SIEHST DIE QUELLE VORHER",
    body: "Publikation und Themenvorschlag gehen zur Freigabe an dich, bevor gepitcht wird. Es gibt keine Platzierung auf einer Quelle, die du nicht kennst.",
  },
  {
    label: "ABLEHNUNGSRECHT",
    body: "Passt eine Anfrage nicht in diese Regeln, nehmen wir sie nicht an und erstatten vollständig. Das betrifft auch Branchen und Ziel-URLs, für die wir keine glaubwürdige Platzierung finden.",
  },
  {
    label: "JEDE EINHEIT WIRD DOKUMENTIERT",
    body: `Du bekommst ein Protokoll je Einheit: Quelle, Datum, URL, Attribut, Kontext. Nachvollziehbar auch Monate später.`,
  },
];

// ── Preise ────────────────────────────────────────────────────────────────────
// Netto in Euro. Anzeigeform deutsch. Beide Werte stehen bewusst nebeneinander,
// damit Structured Data die Zahl und die Seite die Schreibweise nutzt.

const eur = (n: number) => `${n.toLocaleString("de-DE")} €`;

function oneTier(input: {
  sku: string;
  price: number;
  kicker: string;
  bestFor: string;
  deliverables: readonly string[];
  timing: string;
  cta?: string;
}): MoveTier {
  return {
    mode: "one",
    sku: input.sku,
    name: "ONE",
    kicker: input.kicker,
    billing: "once",
    priceEur: input.price,
    priceDisplay: eur(input.price),
    priceNote: "netto, einmalig",
    bestFor: input.bestFor,
    deliverables: input.deliverables,
    timing: input.timing,
    commitment: "Einmalige Zahlung. Keine Laufzeit, kein Abo.",
    cta: input.cta ?? "EINHEIT KAUFEN",
  };
}

function momentumTier(input: {
  sku: string;
  price: number;
  kicker: string;
  bestFor: string;
  deliverables: readonly string[];
  timing: string;
}): MoveTier {
  return {
    mode: "momentum",
    sku: input.sku,
    name: "MOMENTUM",
    kicker: input.kicker,
    billing: "monthly",
    priceEur: input.price,
    priceDisplay: eur(input.price),
    priceNote: "netto pro Monat",
    bestFor: input.bestFor,
    deliverables: input.deliverables,
    timing: input.timing,
    commitment: "Monatlich, zum Ende des laufenden Abrechnungszeitraums kündbar. Keine Mindestlaufzeit.",
    cta: "MOMENTUM STARTEN",
  };
}

function systemTier(input: { sku: string; kicker: string; bestFor: string; deliverables: readonly string[] }): MoveTier {
  return {
    mode: "system",
    sku: input.sku,
    name: "SYSTEM",
    kicker: input.kicker,
    billing: "none",
    priceEur: null,
    priceDisplay: "Nach Umfang",
    priceNote: "Angebot nach Prüfung",
    bestFor: input.bestFor,
    deliverables: input.deliverables,
    timing: "Erstgespräch innerhalb von zwei Werktagen",
    commitment: "Kein Online-Kauf. Umfang und Preis stehen vor jeder Bindung fest.",
    cta: "UMFANG BESPRECHEN",
  };
}

// ── Die vier Flächen ──────────────────────────────────────────────────────────

const authority: MoveCategory = {
  id: "authority",
  slug: "authority",
  index: "01",
  label: "AUTHORITY",
  axis: "Fremde Publikationen, in denen du stattfindest",
  oneLiner: "Redaktionelle Platzierungen auf Quellen, die zu deiner Kategorie veröffentlichen.",

  h1: "Platzierungen auf Quellen, die",
  accentWord: "zitiert",
  h1Tail: "werden.",
  lead: "SEESZN wählt die Publikation, schreibt den Beitrag entlang ihrer Redaktionslinie und platziert ihn. Du siehst die Quelle vor dem Pitch und bekommst danach das vollständige Protokoll.",
  definition:
    "Eine Authority-Platzierung ist ein redaktioneller Beitrag auf einer fremden Publikation, die zu deinem Thema tatsächlich Leser hat. SEESZN prüft die Publikation vor dem Pitch, schreibt den Beitrag entlang der Redaktionslinie und kennzeichnet eine bezahlte Platzierung so, wie die Publikation und die Google-Richtlinien zur Linkattribution es vorsehen.",
  headFacts: [
    "Quelle vor dem Pitch zur Freigabe",
    "Protokoll je Platzierung",
    GUARANTEE_SHORT,
  ],

  tiers: [
    oneTier({
      sku: "authority-one",
      price: 1490,
      kicker: "Eine Platzierung, ein Thema, ein Ziel",
      bestFor: "Eine einzelne Seite oder Entität braucht eine glaubwürdige externe Quelle.",
      deliverables: [
        "Recherche und Prüfung passender Publikationen",
        "Themenvorschlag entlang der Redaktionslinie, Freigabe bei dir",
        "Beitrag von SEESZN geschrieben, eine Korrekturschleife",
        "Platzierung mit Kontextlink auf deine Ziel-URL",
        "Kennzeichnung und Linkattribut nach Vorgabe der Publikation",
        "Protokoll: Quelle, Datum, URL, Attribut, Kontext",
      ],
      timing: "18 bis 30 Tage bis zur Veröffentlichung, abhängig von der Redaktion",
    }),
    momentumTier({
      sku: "authority-momentum",
      price: 3900,
      kicker: "Drei Platzierungen im Monat mit laufender Themenplanung",
      bestFor: "Eine Kategorie soll über mehrere Quellen hinweg belegt sein, nicht über eine.",
      deliverables: [
        "Drei Platzierungen je Monat nach denselben Kriterien",
        "Quellenplan über den Quartalshorizont, monatlich nachgeführt",
        "Themenplanung entlang deiner Prioritäten",
        "Abstimmung in einem festen Rhythmus, keine Meetingpflicht",
        "Monatliches Protokoll aller Einheiten",
        "Wirkungsübersicht: Nennungen, Referral, Brand-Suchanfragen",
      ],
      timing: "Erste Platzierung innerhalb der ersten 30 Tage",
    }),
    systemTier({
      sku: "authority-system",
      kicker: "Ein Programm über mehrere Flächen statt einzelner Einheiten",
      bestFor: "Mehrere Märkte, mehrere Sprachen oder ein Thema, das erst aufgebaut werden muss.",
      deliverables: [
        "Prüfung der bestehenden Sichtbarkeit vor jedem Vorschlag",
        "Quellenarchitektur über Authority, Press, Mentions und Content",
        "Priorisierung nach belegbarem Engpass",
        "Festpreis je Abschnitt, kein offener Retainer",
      ],
    }),
  ],

  process: [
    { n: "01", label: "BRIEFING", body: "Domain, Ziel-URL, Markt, Sprache und Thema. Das Formular kommt direkt nach der Zahlung.", effort: "5 Minuten" },
    { n: "02", label: "QUALIFIZIERUNG", body: "Wir prüfen, ob sich für dein Thema und deine Ziel-URL eine glaubwürdige Platzierung finden lässt. Finden wir keine, erstatten wir vollständig." },
    { n: "03", label: "AUSWAHL", body: "Du bekommst die vorgeschlagene Publikation und den Themenvorschlag zur Freigabe, bevor gepitcht wird." },
    { n: "04", label: "UMSETZUNG", body: "Beitrag schreiben, mit der Redaktion abstimmen, platzieren. Eine Korrekturschleife auf deiner Seite ist eingeplant." },
    { n: "05", label: "NACHWEIS", body: "Protokoll mit Quelle, Datum, URL, Attribut und Kontext. Danach liegt die Einheit dokumentiert bei dir." },
  ],

  limits: [
    "Eine Redaktion entscheidet über Aufnahme, Titel und Kürzungen. Diese Entscheidung kaufst du nicht mit.",
    "Es gibt keine Zusage über eine bestimmte Domainmetrik der Quelle. Zugesagt ist thematische Nähe und eine erkennbare Redaktion.",
    "Eine Platzierung verbessert keine Position in einem Index. Sie stellt eine Quelle her, auf die verwiesen werden kann.",
  ],
  measured: [
    "Veröffentlichte Quelle mit Datum und URL",
    "Referral-Zugriffe aus der Quelle",
    "Nennungen der Marke im Umfeld des Themas",
    "Entwicklung der Brand-Suchanfragen im Messfenster",
  ],

  extension: {
    headline: "MACH DIE QUELLE ZITIERFÄHIG",
    body: "Die Platzierung verweist auf eine Seite. Ist diese Seite für ein Antwortsystem schwer zu lesen, endet die Aufmerksamkeit dort. Eine zitierfähige Zielseite verlängert die Wirkung der Platzierung.",
    targetCategory: "content",
    cta: "CONTENT ANSEHEN",
  },

  faq: [
    { q: "Ist das gekaufter Linkaufbau?", a: "Gekauft wird redaktionelle Arbeit auf einer Publikation mit echtem Publikum: Recherche, Pitch, Text, Abstimmung, Platzierung, Protokoll. Ist die Platzierung bezahlt, wird sie gekennzeichnet und trägt das dafür vorgesehene Linkattribut. Anonyme Verkäuferlisten, Linktausch und Netzwerke sind ausgeschlossen." },
    { q: "Verbessert das mein Ranking?", a: "Das sagen wir nicht zu, und niemand kann es seriös zusagen. Eine Platzierung stellt eine Quelle her, die Menschen lesen und Systeme abrufen können. Gemessen wird an Veröffentlichung, Referral, Nennungen und Brand-Suchanfragen." },
    { q: "Wer schreibt den Beitrag?", a: "SEESZN. Der Text entsteht entlang der Redaktionslinie der Publikation und geht vor dem Einreichen zu dir in eine Korrekturschleife. Wenn deine Fachperson zitiert werden soll, kommt das aus MENTIONS dazu." },
    { q: "Welche Publikationen sind das?", a: "Das hängt von Thema, Markt und Sprache ab und wird deshalb nicht als Liste verkauft. Du siehst den konkreten Vorschlag zur Freigabe, bevor gepitcht wird, und kannst ihn ohne Begründung ablehnen." },
    { q: "Was passiert nach der Zahlung?", a: "Du kommst auf ein kurzes Briefing-Formular: Domain, Ziel-URL, Markt, Sprache, Thema, Hinweise. Fünf Minuten. Danach beginnt die Qualifizierung, und du hörst mit dem Quellenvorschlag wieder von uns." },
    { q: "Was ist, wenn ihr nichts Passendes findet?", a: GUARANTEE_FULL },
    { q: "Könnt ihr eine Anfrage ablehnen?", a: "Ja. Wir lehnen ab, wenn sich für Thema oder Ziel-URL keine glaubwürdige Platzierung finden lässt, und erstatten dann vollständig. Das ist die Bedingung dafür, dass die Fläche insgesamt Bestand hat." },
    { q: "Wie unterscheidet sich MOMENTUM von ONE?", a: "Der Umfang je Einheit ist derselbe. MOMENTUM plant über den Monat hinaus: ein Quellenplan über das Quartal, drei Einheiten je Monat, ein gemeinsamer Themenfaden. Monatlich kündbar, keine Mindestlaufzeit." },
    { q: "Wann lohnt sich SYSTEM?", a: "Wenn mehrere Märkte oder Sprachen im Spiel sind oder wenn erst geklärt werden muss, wo der Engpass überhaupt liegt. Dann steht die Prüfung vor dem Einkauf, und der Umfang wird zugeschnitten." },
  ],

  meta: {
    title: "Authority Placements kaufen | Redaktionelle Platzierungen | SEESZN",
    description:
      "Redaktionelle Platzierungen auf Publikationen mit echtem Publikum. Quelle vor dem Pitch zur Freigabe, Kennzeichnung nach Vorgabe, Protokoll je Einheit. Einmalig oder monatlich, Festpreis.",
  },
};

const press: MoveCategory = {
  id: "press",
  slug: "press",
  index: "02",
  label: "PRESS",
  axis: "Meldungen, die in Redaktionen ankommen",
  oneLiner: "Meldung schreiben, an zuständige Redaktionen aussenden, Aufnahme dokumentieren.",

  h1: "Eine Meldung, die eine",
  accentWord: "Redaktion",
  h1Tail: "aufnehmen kann.",
  lead: "SEESZN schreibt die Meldung, wählt den Verteiler nach Ressort und Markt, versendet und dokumentiert, wo sie aufgenommen wurde. Ob sie aufgenommen wird, entscheidet die Redaktion.",
  definition:
    "Press ist die Aufbereitung und Aussendung einer Meldung an Redaktionen, die für dein Thema zuständig sind. SEESZN formuliert den Anlass, baut den Verteiler nach Ressort, Markt und Sprache, versendet und dokumentiert jede Aufnahme mit Quelle, Datum und URL. Die Entscheidung über eine Veröffentlichung liegt bei der Redaktion.",
  headFacts: [
    "Verteiler nach Ressort, nicht nach Menge",
    "Aufnahme wird belegt, nicht geschätzt",
    "Kein Versand ohne echten Anlass",
  ],

  tiers: [
    oneTier({
      sku: "press-one",
      price: 1900,
      kicker: "Ein Anlass, eine Meldung, eine Aussendung",
      bestFor: "Es gibt einen echten Anlass: Produkt, Zahl, Studie, Personalie, Markteintritt.",
      deliverables: [
        "Anlassprüfung vor dem Schreiben",
        "Meldung in deutscher oder englischer Fassung",
        "Verteiler nach Ressort, Markt und Sprache",
        "Aussendung und Nachfassen bei den relevantesten Redaktionen",
        "Aufnahmeprotokoll mit Quelle, Datum und URL",
        "Ablage der Meldung als zitierfähige Seite auf deiner Domain",
      ],
      timing: "10 bis 14 Tage von der Freigabe bis zur Aussendung",
      cta: "MELDUNG BEAUFTRAGEN",
    }),
    momentumTier({
      sku: "press-momentum",
      price: 4500,
      kicker: "Ein Newsroom, der nicht nach jeder Meldung stillsteht",
      bestFor: "Es gibt regelmäßig etwas zu melden und bisher niemanden, der es aufbereitet.",
      deliverables: [
        "Zwei Meldungen je Monat inklusive Aussendung",
        "Anlassplanung über das Quartal",
        "Pflege des Verteilers je Ressort und Markt",
        "Nachfassen und Beziehungsaufbau zu wiederkehrenden Redaktionen",
        "Newsroom-Seite auf deiner Domain, laufend gepflegt",
        "Monatliches Aufnahmeprotokoll",
      ],
      timing: "Erste Aussendung innerhalb der ersten 21 Tage",
    }),
    systemTier({
      sku: "press-system",
      kicker: "Kommunikation über mehrere Märkte und Sprachen",
      bestFor: "Mehrsprachige Aussendung, abgestimmte Sprecherrollen oder ein laufendes Thema mit Risiko.",
      deliverables: [
        "Anlassarchitektur über zwölf Monate",
        "Sprecherrollen und Freigabewege",
        "Verteiler je Markt, getrennt gepflegt",
        "Festpreis je Abschnitt",
      ],
    }),
  ],

  process: [
    { n: "01", label: "BRIEFING", body: "Anlass, Zahlen, Zitatgeber, Markt und Sprache. Das Formular kommt direkt nach der Zahlung.", effort: "10 Minuten" },
    { n: "02", label: "ANLASSPRÜFUNG", body: "Wir prüfen, ob der Anlass für eine Redaktion tragfähig ist. Trägt er nicht, sagen wir das, bevor geschrieben wird." },
    { n: "03", label: "MELDUNG", body: "Text, Zitat und Bildhinweis. Eine Freigabeschleife bei dir, danach steht die Fassung." },
    { n: "04", label: "AUSSENDUNG", body: "Verteiler nach Ressort und Markt. Nachfassen bei den Redaktionen, für die der Anlass am stärksten passt." },
    { n: "05", label: "NACHWEIS", body: "Protokoll jeder Aufnahme mit Quelle, Datum und URL. Ausbleibende Aufnahmen werden ebenso ausgewiesen." },
  ],

  limits: [
    "Eine Aufnahme ist nicht käuflich. Bezahlt wird die Aufbereitung und die Aussendung, nicht die Entscheidung der Redaktion.",
    "Ohne echten Anlass senden wir nicht aus. Eine Meldung ohne Substanz beschädigt den Verteiler für die nächste.",
    "Reichweitenzahlen von Verteilern sind Potenzial, kein Ergebnis. Ausgewiesen wird die belegte Aufnahme.",
  ],
  measured: [
    "Belegte Aufnahmen mit Quelle, Datum und URL",
    "Referral-Zugriffe aus den aufnehmenden Quellen",
    "Nennungen der Marke im Zeitraum der Aussendung",
    "Sichtbarkeit der Meldung als eigene Seite in der Suche",
  ],

  extension: {
    headline: "HALTE DAS SIGNAL WARM",
    body: "Eine Meldung erzeugt für einige Tage Aufmerksamkeit bei Redaktionen, die das Thema gerade bearbeiten. Wer in diesem Fenster als Quelle zitierbar ist, bleibt auch nach der Meldung im Text.",
    targetCategory: "mentions",
    cta: "MENTIONS ANSEHEN",
  },

  faq: [
    { q: "Garantiert ihr Veröffentlichungen?", a: "Nein. Über eine Veröffentlichung entscheidet immer die Redaktion. Zugesagt sind Aufbereitung, Verteiler, Aussendung, Nachfassen und ein vollständiges Protokoll, in dem auch die ausbleibenden Aufnahmen stehen." },
    { q: "Was zählt als Anlass?", a: "Etwas, das für Leser außerhalb deines Unternehmens neu oder überprüfbar ist: eine Zahl, eine Studie, ein Produkt, ein Markteintritt, eine Personalie, eine belegbare Entwicklung im Markt. Ein Rebrand allein trägt selten." },
    { q: "Ist das ein Presseverteiler-Abo?", a: "Die Aussendung läuft über kuratierte Ressortverteiler, nicht über einen Massenversand. Der Unterschied zeigt sich am Nachfassen: es gibt eine überschaubare Zahl an Redaktionen, für die der Anlass wirklich passt, und mit denen wird gesprochen." },
    { q: "Was ist, wenn niemand aufnimmt?", a: "Dann steht das im Protokoll. Wir ersetzen keine Redaktionsentscheidung durch eine Zahl. Trägt der Anlass aus unserer Sicht nicht, sagen wir das vor der Aussendung, und die Erstattung gilt." },
    { q: "In welchen Sprachen?", a: "Deutsch und Englisch. Weitere Sprachen laufen über SYSTEM, weil dort auch der Verteiler je Markt getrennt aufgebaut wird." },
    { q: "Bekomme ich die Meldung auch für die eigene Seite?", a: "Ja. Die Meldung wird als eigene Seite auf deiner Domain abgelegt, strukturiert und datiert. Damit bleibt der Anlass auffindbar, auch wenn eine Redaktion ihn nicht aufnimmt." },
    { q: "Kann ich monatlich kündigen?", a: "MOMENTUM ist monatlich kündbar, zum Ende des laufenden Abrechnungszeitraums, ohne Mindestlaufzeit. ONE ist eine einmalige Zahlung ohne Laufzeit." },
  ],

  meta: {
    title: "Pressemeldung und Distribution kaufen | Digital PR | SEESZN",
    description:
      "Meldung schreiben, an zuständige Redaktionen aussenden, jede Aufnahme mit Quelle und URL belegen. Kein Massenversand, kein Versand ohne Anlass. Einmalig oder monatlich.",
  },
};

const mentions: MoveCategory = {
  id: "mentions",
  slug: "mentions",
  index: "03",
  label: "MENTIONS",
  axis: "Fremde Texte, in denen deine Leute als Quelle stehen",
  oneLiner: "Deine Fachperson als zitierte Quelle in Beiträgen, die ohnehin geschrieben werden.",

  h1: "Deine Fachleute als",
  accentWord: "Quelle",
  h1Tail: "im fremden Text.",
  lead: "Journalisten suchen laufend Zitatgeber. SEESZN beobachtet diese Anfragen, formuliert mit deiner Fachperson eine brauchbare Antwort und reicht sie ein. Ob zitiert wird, entscheidet die Redaktion.",
  definition:
    "Mentions bringt eine benannte Person aus deinem Unternehmen als zitierte Quelle in fremde Beiträge. SEESZN beobachtet Rechercheanfragen von Journalisten, wählt die passenden aus, formuliert gemeinsam mit deiner Fachperson eine belastbare Antwort und reicht sie fristgerecht ein. Über die Aufnahme des Zitats entscheidet die Redaktion.",
  headFacts: [
    "Antwort innerhalb der Recherchefrist",
    "Nur Anfragen aus deinem Fachgebiet",
    "Zitat wird namentlich belegt",
  ],

  tiers: [
    oneTier({
      sku: "mentions-one",
      price: 890,
      kicker: "Ein platziertes Zitat",
      bestFor: "Eine Person soll im Markt als Stimme erkennbar werden, ohne dass sie selbst recherchiert.",
      deliverables: [
        "Auswahl passender Rechercheanfragen in deinem Fachgebiet",
        "Abstimmung der Kernaussage mit deiner Fachperson",
        "Formulierung und fristgerechte Einreichung",
        "Nachfassen, solange die Recherche offen ist",
        "Protokoll: Publikation, Autor, Datum, URL, Zitatstelle",
        "Ersatzanfrage, solange kein Zitat erschienen ist",
      ],
      timing: "Ein erschienenes Zitat, in der Regel innerhalb von 30 bis 60 Tagen",
      cta: "ZITAT BEAUFTRAGEN",
    }),
    momentumTier({
      sku: "mentions-momentum",
      price: 2400,
      kicker: "Laufende Präsenz als Zitatgeber",
      bestFor: "Eine Person soll dauerhaft zu ihrem Thema gefragt werden, nicht einmal auftauchen.",
      deliverables: [
        "Laufende Beobachtung der Rechercheanfragen in deinem Feld",
        "Bis zu acht eingereichte Antworten je Monat",
        "Aufbau eines Zitatprofils: Themen, Positionen, Belege",
        "Kurzinterviews mit deiner Fachperson statt Fragebögen",
        "Monatliches Protokoll aller erschienenen Zitate",
        "Autorenseite auf deiner Domain, gepflegt und strukturiert",
      ],
      timing: "Erste Einreichungen innerhalb der ersten 14 Tage",
    }),
    systemTier({
      sku: "mentions-system",
      kicker: "Mehrere Sprecher, mehrere Themen, abgestimmte Positionen",
      bestFor: "Mehrere Fachpersonen sollen unterschiedliche Themen besetzen, ohne sich zu widersprechen.",
      deliverables: [
        "Themenverteilung über die Sprecher",
        "Positionspapiere als Grundlage der Zitate",
        "Freigabewege für heikle Themen",
        "Festpreis je Abschnitt",
      ],
    }),
  ],

  process: [
    { n: "01", label: "BRIEFING", body: "Fachperson, Themen, Positionen und Freigabeweg. Das Formular kommt direkt nach der Zahlung.", effort: "15 Minuten" },
    { n: "02", label: "BEOBACHTUNG", body: "Wir sichten laufende Rechercheanfragen und wählen die aus, die zu deiner Fachperson wirklich passen." },
    { n: "03", label: "ABSTIMMUNG", body: "Kernaussage kurz mit der Fachperson klären. Wir schreiben, sie bestätigt." },
    { n: "04", label: "EINREICHUNG", body: "Fristgerecht einreichen und nachfassen, solange die Recherche offen ist." },
    { n: "05", label: "NACHWEIS", body: "Protokoll mit Publikation, Autor, Datum, URL und der Stelle, an der das Zitat steht." },
  ],

  limits: [
    "Ein Zitat erscheint nur, wenn eine Redaktion es aufnimmt. Wir reichen ein und fassen nach, mehr ist an dieser Stelle nicht möglich.",
    "Eine Antwort ohne Substanz wird nicht zitiert. Ohne kurze Beteiligung deiner Fachperson funktioniert die Fläche nicht.",
    "Wir formulieren keine Aussagen, die deine Fachperson nicht vertreten würde.",
  ],
  measured: [
    "Erschienene Zitate mit Publikation, Autor und URL",
    "Nennungen der Person und der Marke im Zeitverlauf",
    "Referral aus den zitierenden Beiträgen",
    "Wiederkehrende Anfragen derselben Redaktionen",
  ],

  extension: {
    headline: "GIB DEM ZITAT EINE HEIMAT",
    body: "Wer zitiert wird, wird nachgeschlagen. Eine gepflegte Quelle auf deiner eigenen Domain entscheidet, was der Leser danach vorfindet und was ein Antwortsystem abrufen kann.",
    targetCategory: "content",
    cta: "CONTENT ANSEHEN",
  },

  faq: [
    { q: "Wie viel Zeit kostet mich das?", a: "Bei ONE eine kurze Abstimmung je Anfrage, meist unter 15 Minuten. Bei MOMENTUM ersetzen wir Fragebögen durch kurze Interviews, damit die Beteiligung deiner Fachperson bei etwa einer Stunde im Monat bleibt." },
    { q: "Was, wenn kein Zitat erscheint?", a: "Bei ONE reichen wir weitere Anfragen ein, bis ein Zitat erschienen ist. Erscheint innerhalb von " + REPLACEMENT_WINDOW_DAYS + " Tagen keines, bekommst du die volle Erstattung." },
    { q: "Schreibt ihr im Namen meiner Fachperson?", a: "Wir formulieren den Entwurf und die Fachperson bestätigt ihn, bevor etwas eingereicht wird. Nichts geht ohne diese Bestätigung raus." },
    { q: "Ist das dasselbe wie ein Gastbeitrag?", a: "Ein Gastbeitrag ist ein ganzer Text von dir und liegt in AUTHORITY. Hier geht es um einen Absatz in einem fremden Text, der ohnehin entsteht, und um die Erkennbarkeit der Person als Quelle." },
    { q: "Welche Publikationen?", a: "Das ergibt sich aus den laufenden Recherchen und lässt sich nicht vorab versprechen. Ausgewiesen wird jedes erschienene Zitat mit Publikation und URL." },
    { q: "Kann ich Themen ausschließen?", a: "Ja. Ausgeschlossene Themen, Wettbewerber und heikle Felder stehen im Briefing und werden nicht bedient." },
  ],

  meta: {
    title: "Expert Quote Placements | Zitatplatzierungen für Fachleute | SEESZN",
    description:
      "Deine Fachperson als zitierte Quelle in fremden Beiträgen. Rechercheanfragen beobachten, fristgerecht einreichen, jedes erschienene Zitat belegen. Einmalig oder monatlich.",
  },
};

const content: MoveCategory = {
  id: "content",
  slug: "content",
  index: "04",
  label: "CONTENT",
  axis: "Deine eigenen Seiten, aus denen zitiert werden kann",
  oneLiner: "Seiten bauen oder überarbeiten, bis ein Antwortsystem sie als Quelle benutzen kann.",

  h1: "Seiten, aus denen sich",
  accentWord: "zitieren",
  h1Tail: "lässt.",
  lead: "Antwortsysteme zitieren Passagen, keine Seiten. SEESZN baut oder überarbeitet eine Seite so, dass die entscheidende Passage eindeutig, belegt und abrufbar ist.",
  definition:
    "Content baut oder überarbeitet eine Seite deiner Domain so, dass sie als Quelle taugt: klar abgegrenzte Passagen, eindeutige Entitäten, belegte Aussagen, saubere Struktur und ein Datum, das stimmt. Die Seite bleibt deine. Gemessen wird an Impressionen, Nennungen und Zitaten in einem festen Prompt-Set.",
  headFacts: [
    "Arbeit an deiner Domain, nicht an fremder",
    "Messung im festen Prompt-Set",
    "Vorher- und Nachher-Stand dokumentiert",
  ],

  tiers: [
    oneTier({
      sku: "content-one",
      price: 1290,
      kicker: "Eine Seite, zitierfähig gebaut oder überarbeitet",
      bestFor: "Eine Seite trägt das Thema bereits, wird aber nicht als Quelle benutzt.",
      deliverables: [
        "Analyse der Seite gegen ein Prompt-Set deiner Kategorie",
        "Neuaufbau der Passagenstruktur, zitierfähig auf Absatzebene",
        "Eindeutige Entitäten, Definitionen und Belege",
        "Strukturierte Daten, soweit sie für diese Seite gültig sind",
        "Interne Verlinkung aus dem relevanten Umfeld",
        "Vorher- und Nachher-Stand mit Datum",
      ],
      timing: "10 bis 14 Werktage nach vollständigem Zugriff",
      cta: "SEITE BEAUFTRAGEN",
    }),
    momentumTier({
      sku: "content-momentum",
      price: 3200,
      kicker: "Drei Seiten im Monat, nach Wirkung priorisiert",
      bestFor: "Ein ganzes Themenfeld soll zitierfähig werden, nicht eine einzelne Seite.",
      deliverables: [
        "Drei Seiten je Monat, neu gebaut oder überarbeitet",
        "Priorisierung nach Impressionen, Position und Prompt-Abdeckung",
        "Laufende Pflege bereits überarbeiteter Seiten",
        "Themenkarte des Felds, monatlich nachgeführt",
        "Monatliche Messung im konstanten Prompt-Set",
        "Protokoll je Seite mit Vorher- und Nachher-Stand",
      ],
      timing: "Erste Seite innerhalb der ersten 14 Werktage",
    }),
    systemTier({
      sku: "content-system",
      kicker: "Die Architektur unter den Seiten, nicht nur die Seiten",
      bestFor: "Die Struktur der Domain begrenzt die Wirkung jeder einzelnen Seite.",
      deliverables: [
        "Sucharchitektur und Entity-Modell",
        "Templatearbeit statt Einzelseiten",
        "Messaufbau über Search Console und Prompt-Set",
        "Festpreis je Abschnitt",
      ],
    }),
  ],

  process: [
    { n: "01", label: "BRIEFING", body: "Domain, Ziel-URL, Markt, Sprache und Thema. Das Formular kommt direkt nach der Zahlung.", effort: "5 Minuten" },
    { n: "02", label: "AUSGANGSSTAND", body: "Wir messen die Seite gegen ein Prompt-Set deiner Kategorie und halten den Stand mit Datum fest." },
    { n: "03", label: "UMSETZUNG", body: "Passagen, Entitäten, Belege, Struktur und interne Verlinkung. Eine Freigabeschleife bei dir." },
    { n: "04", label: "VERÖFFENTLICHUNG", body: "Entweder wir spielen über deinen Zugang aus, oder du bekommst die fertige Fassung zum Einspielen." },
    { n: "05", label: "NACHWEIS", body: "Zweite Messung im selben Prompt-Set, Vorher- und Nachher-Stand mit Datum und Quelle." },
  ],

  limits: [
    "Antwortsysteme sind nicht deterministisch. Eine gemessene Veränderung im Prompt-Set ist keine zugesagte Nennung.",
    "Ohne Zugriff auf die Seite oder ohne Freigabeweg verschiebt sich die Lieferzeit.",
    "Eine einzelne Seite trägt selten ein ganzes Themenfeld. Wo das absehbar ist, sagen wir es vor dem Kauf.",
  ],
  measured: [
    "Impressionen und Klicks der Seite in der Search Console",
    "Abdeckung im konstanten Prompt-Set, vorher und nachher",
    "Nennungen der Marke in Antworten zu diesem Thema",
    "Position in den Top-10-Queries der Seite",
  ],

  extension: {
    headline: "GIB DER SEITE EINE EXTERNE QUELLE",
    body: "Eine zitierfähige Seite ohne externe Bestätigung bleibt eine Behauptung. Eine redaktionelle Platzierung auf einer passenden Publikation liefert den Beleg, auf den sich Leser und Systeme stützen können.",
    targetCategory: "authority",
    cta: "AUTHORITY ANSEHEN",
  },

  faq: [
    { q: "Arbeitet ihr auf meiner Domain?", a: "Ja. Content ist die einzige Fläche in MOVES, die auf deinen eigenen Seiten stattfindet. Entweder wir bekommen einen Zugang, oder du bekommst die fertige Fassung zum Einspielen." },
    { q: "Was ist ein Prompt-Set?", a: "Eine feste Liste von Fragen aus deiner Kategorie, die vor und nach der Arbeit identisch abgefragt wird. Dadurch ist die Veränderung vergleichbar. Nachträglich hinzugefügte Fragen gibt es nicht." },
    { q: "Ist das SEO oder GEO?", a: "Beides greift hier ineinander. Struktur, Entitäten und interne Verlinkung wirken auf die klassische Suche, die Passagenarbeit auf die Zitierbarkeit in Antwortsystemen. Getrennt verkaufen wir das nicht." },
    { q: "Schreibt eine KI die Texte?", a: "Nein. Die Texte entstehen redaktionell. Antwortsysteme werden zur Messung benutzt, nicht zum Schreiben." },
    { q: "Wie lange dauert es, bis etwas messbar ist?", a: "Die zweite Messung im Prompt-Set läuft direkt nach der Veröffentlichung. Für Search-Console-Daten sind vier bis acht Wochen der sinnvolle Rahmen, weil vorher zu wenig Datenpunkte vorliegen." },
    { q: "Was, wenn die Seite danach nicht besser läuft?", a: "Dann steht das im Protokoll, mit beiden Ständen. Wir weisen die gemessene Veränderung aus, auch wenn sie klein ist. Zugesagt ist die Arbeit und die Messung, nicht ein Ergebniswert." },
  ],

  meta: {
    title: "Citation-Ready Content und Content Refresh kaufen | SEESZN",
    description:
      "Seiten so bauen und überarbeiten, dass Antwortsysteme daraus zitieren können. Passagenstruktur, Entitäten, Belege, Messung im konstanten Prompt-Set. Einmalig oder monatlich.",
  },
};

function fromPriceOf(category: MoveCategory): string {
  const prices = category.tiers.map((t) => t.priceEur).filter((p): p is number => p !== null);
  return prices.length ? `ab ${eur(Math.min(...prices))}` : "Nach Umfang";
}

export const CATEGORIES: readonly MoveCategory[] = [authority, press, mentions, content];

export const CATEGORY_BY_ID: Record<MoveCategoryId, MoveCategory> = {
  authority,
  press,
  mentions,
  content,
};

export function categoryBySlug(slug: string): MoveCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/**
 * Das Register der Übersicht. BACKLINKS steht vorn und ist die einzige Fläche
 * mit einem Konfigurator: sie ist direkt kaufbar, ohne dass vorher irgendetwas
 * geklärt werden muss. Die vier Flächen darunter führen weiterhin über ihre
 * eigenen Produktseiten.
 */
export interface RegisterEntry {
  id: string;
  index: string;
  label: string;
  axis: string;
  oneLiner: string;
  href: string;
  from: string;
}

export const REGISTER: readonly RegisterEntry[] = [
  {
    id: "backlinks",
    index: "01",
    label: "BACKLINKS",
    axis: "Verzeichnisse, Blogs und Foren deines Zielmarkts",
    oneLiner: "Menge, Format und Zielmarkt wählen, Preis steht sofort daneben.",
    href: `${MOVES_PATH}/backlinks`,
    from: "ab 99 €",
  },
  ...CATEGORIES.map((category, i) => ({
    id: category.id,
    index: String(i + 2).padStart(2, "0"),
    label: category.label,
    axis: category.axis,
    oneLiner: category.oneLiner,
    href: `${MOVES_PATH}/${category.slug}`,
    from: fromPriceOf(category),
  })),
];

export function categoryHref(id: MoveCategoryId): string {
  return `${MOVES_PATH}/${CATEGORY_BY_ID[id].slug}`;
}

/** True, wenn der Schlüssel aus dem Backlink-Konfigurator stammt. */
export function isBacklinkSku(sku: string): boolean {
  return sku.startsWith("backlinks-");
}

/** Findet eine Stufe über ihren Produktschlüssel. Grundlage für den Checkout. */
export function tierBySku(sku: string): { category: MoveCategory; tier: MoveTier } | undefined {
  for (const category of CATEGORIES) {
    const tier = category.tiers.find((t) => t.sku === sku);
    if (tier) return { category, tier };
  }
  return undefined;
}

export function tierByMode(category: MoveCategory, mode: PurchaseMode): MoveTier {
  return category.tiers.find((t) => t.mode === mode) ?? category.tiers[0]!;
}

/** Der niedrigste Einstiegspreis einer Fläche. Für die Übersichtstabelle. */
export function fromPrice(category: MoveCategory): string {
  return fromPriceOf(category);
}
