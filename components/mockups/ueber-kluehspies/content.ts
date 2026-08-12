// ─── Über Klühspies — sichtbare Inhalte ─────────────────────────────────────
// Einzige Quelle für alle sichtbaren Texte dieser Seite. Die Komponenten halten
// keine Copy inline, damit eine Textänderung an genau einer Stelle passiert.
//
// ── Kalibrierung der Copy ───────────────────────────────────────────────────
// Adressat ist eine zeitknappe Lehrkraft, die Verantwortung für fremde Kinder
// und fremdes Geld trägt und Anbietern eher skeptisch gegenübersteht. Sie sucht
// nicht das schönste Angebot, sondern das mit dem geringsten Risiko. Daraus
// folgen drei Regeln, die jeden Text hier binden:
//
// 1. Entlastung vor Begeisterung. „Sie müssen das nicht selbst machen" schlägt
//    „einzigartiges Erlebnis". Werbesprache der Bestandsseite („sensationell",
//    „unschlagbar", „Rundum-Sorglos") ist bewusst nicht übernommen; an ihre
//    Stelle tritt die Tatsache, die den Punkt tatsächlich belegt.
// 2. Überschrift plus erster Satz müssen die Nutzerfrage vollständig
//    beantworten, auch aus dem Seitenkontext gerissen. Das ist zugleich die
//    Einheit, die Retrieval-Systeme extrahieren.
// 3. Im ersten Satz eines Blocks steht „Klühspies" ausgeschrieben, nicht „wir".
//    Verbands- und Auszeichnungsnamen beim ersten Auftreten vollständig.
//
// ── Belege ──────────────────────────────────────────────────────────────────
// Kein Claim ohne Quelle in der Bestandsseite, den Serviceseiten oder dem
// Impressum. Die Herkunft strittiger Aussagen steht als Kommentar an der Zeile,
// die offenen Punkte in docs/mockups/ueber-kluehspies/OPEN_FACTS.md.
//
// CONTENT.md ist an mehreren Stellen überholt, siehe den Hinweis dort und
// OPEN_FACTS.md §B3.

/** Geschütztes Leerzeichen. Steht vor „%" und zwischen Zahl und Bezugswort. */
const NB = " ";

/** Ziel-URLs. Alle am 11.08.2026 auf HTTP 200 geprüft. Nichts erfunden. */
export const URLS = {
  anfrage: "https://www.klassenfahrten-kluehspies.de/reiseanfrage/",
  bezahlservice: "https://www.klassenfahrten-kluehspies.de/service/bezahlservice/",
  keineAnzahlung:
    "https://www.klassenfahrten-kluehspies.de/service/keine-anzahlung-bei-buchung/",
  portal: "https://portal.klassenfahrten-kluehspies.de/",
  kontakt: "https://www.klassenfahrten-kluehspies.de/kontakt/",
  telefon: "tel:+49235197860",
  ueber: "https://www.klassenfahrten-kluehspies.de/ueber-kluehspies/",
  home: "https://www.klassenfahrten-kluehspies.de/",
} as const;

/** Eine Schreibweise der Telefonnummer für die ganze Seite. */
export const TELEFON_LABEL = "+49 (0) 2351 / 97 86-0";
export const EMAIL = "info@kluehspies.com";
/** Aus der bestehenden TravelAgency-Auszeichnung der Produktionsseite:
 *  openingHours „Mo-Fr 08:00-17:00". Ausgeschrieben statt abgekürzt. */
export const ERREICHBARKEIT = "Montag bis Freitag von 8 bis 17 Uhr";

/** Stand der Inhalte, als sichtbares Aktualitätssignal und im Schema. */
export const CONTENT_STAND = { display: "12.08.2026", iso: "2026-08-12" } as const;

// ── SEO-Metadaten ───────────────────────────────────────────────────────────
export const PRODUCTION_SEO = {
  title: "Über Klühspies – Klassenfahrten seit über 40 Jahren | Klühspies",
  // 147 Zeichen, bleibt unter der 155-Zeichen-Grenze.
  description:
    "Klühspies organisiert seit über 40 Jahren Klassenfahrten: 110.000 Gäste pro Jahr, keine Anzahlung, kostenloser Bezahlservice, persönliche Beratung.",
  canonical: URLS.ueber,
  siteName: "Klühspies Reisen GmbH & Co. KG",
  ogImage: null,
} as const;

// ── Hero ────────────────────────────────────────────────────────────────────
// Beantwortet die erste Frage der Zielgruppe: Kann ich diesem Anbieter trauen?
// Der Ski-Claim steht hier in vollständiger Form, weil er im Siegel-Block noch
// einmal auftaucht. Ein Claim, der nur als Nebensatz an anderer Stelle steht,
// ist für ein Antwortsystem nicht verwertbar; die Wiederholung ist Absicht.
export const hero = {
  h1: { lead: "Über Klühspies", main: "Klassenfahrten seit über 40 Jahren" },
  intro: [
    "Klühspies ist ein Familienbetrieb und einer der größten Klassenfahrt-Anbieter Deutschlands sowie europaweit die Nummer 1 für Schulskifahrten.",
    `Mehr als 110.000${NB}Gäste pro Jahr vertrauen auf über 40 Jahre Erfahrung, geprüfte Qualität und persönliche Betreuung.`,
  ],
  primaryCta: { label: "Klassenfahrt anfragen", href: URLS.anfrage },
  // Die Reibung benennen, wo sie niedrig ist. Belegt auf der Bestandsseite:
  // „Wir reservieren Ihre Reise, sodass Sie uns erst nach Einholung sämtlicher
  // Genehmigungen die verbindliche Anmeldung schicken müssen."
  primaryNote:
    "Klühspies reserviert Ihre Reise. Die verbindliche Anmeldung senden Sie erst, wenn alle Genehmigungen vorliegen.",
  // Zweiter CTA statt drittem: „Bezahlservice ansehen" ist in die zugehörige
  // Karte gewandert, wo er ohnehin steht.
  secondaryCta: { label: "Anbieter vergleichen" },
  image: {
    src: "/mockups/ueber-kluehspies/assets/kluehspies-team.jpg",
    alt: "Das Klühspies-Team in weißen Trikots bei einem gemeinsamen Gruppenfoto im Freien",
  },
} as const;

// ── Trust Bar ───────────────────────────────────────────────────────────────
export type TrustStatIcon = "years" | "guests" | "calendar" | "card";

export const trustStats: { value: string; label: string; icon: TrustStatIcon }[] = [
  { value: "40+", label: "Jahre Erfahrung", icon: "years" },
  { value: "110.000+", label: "Gäste pro Jahr", icon: "guests" },
  { value: "Keine Anzahlung", label: "bei Buchung", icon: "calendar" },
  { value: "Kostenloser", label: "Bezahlservice", icon: "card" },
];

/**
 * Fließtext-Anker unter der Kachelreihe, zugleich der Entity-Anker der Seite:
 * Rechtsform und Sitz stehen hier einmal im sichtbaren Text und nicht nur im
 * Impressum und im Schema. Das ist der Satz, der Klühspies von gleichnamigen
 * oder ähnlich benannten Anbietern unterscheidbar macht.
 */
export const trustStatsAnchor = `Die Klühspies Reisen GmbH & Co. KG ist ein mittelständischer Reiseveranstalter mit Sitz in Halver-Oberbrügge. Seit über 40 Jahren organisiert Klühspies Klassenfahrten und Gruppenreisen für Schulklassen. Jährlich reisen mehr als 110.000${NB}Gäste mit dem Familienunternehmen. Eine Anzahlung bei Buchung fällt nicht an, der Bezahlservice ist für Schulen kostenlos.`;

// ── Was Klühspies anders macht ──────────────────────────────────────────────
// Reihenfolge nach Entscheidungsrelevanz für eine Lehrkraft, nicht nach
// Aufwand für Klühspies: Wer nimmt mir das Geldeinsammeln ab, wann muss ich
// zahlen, zahle ich als Begleitperson selbst, behalte ich den Überblick, wer
// hilft mir im Notfall.
//
// Jede Überschrift ist eine Aussage, kein Etikett. „Bezahlservice" wäre ein
// Etikett, „Eltern zahlen direkt an Klühspies" ist die Antwort selbst.
export type UspIcon = "noPayment" | "portal" | "chart" | "support" | "seat";

export const uspSection = {
  heading: "Was Klühspies anders macht",
  intro:
    "Viele Veranstalter organisieren Anreise, Unterkunft und Programm. Klühspies vereinfacht zusätzlich Abläufe, die Lehrkräften vor einer Klassenfahrt besonders viel Verwaltungsarbeit machen.",
  cards: [
    {
      id: "bezahlservice",
      heading: "Eltern zahlen direkt an Klühspies",
      text: "Mit dem Bezahlservice von Klühspies sammeln Sie kein Geld mehr ein und führen keine Zahlungsliste. Klühspies verschickt individuelle Rechnungen an die Eltern, überwacht die Zahlungseingänge und erinnert automatisch an offene Beträge. Für Schulen und Teilnehmende ist der Bezahlservice kostenfrei.",
      linkLabel: "Bezahlservice im Detail",
      href: URLS.bezahlservice,
      icon: "portal" as UspIcon,
    },
    {
      id: "keine-anzahlung",
      heading: "Keine Anzahlung bei Buchung",
      // Die 80 % gelten nur für die Gruppenzahlung. Ohne diese Unterscheidung
      // wäre die Zahl für jede Gruppe mit Einzelzahlung falsch. Quelle:
      // /service/keine-anzahlung-bei-buchung/, FAQ.
      text: `Sie reservieren Ihre Klassenfahrt bei Klühspies, bevor Genehmigungen und Elternzusagen vorliegen. Die verbindliche Anmeldung senden Sie erst danach. Bei Gruppenzahlung werden 80${NB}% der Gesamtsumme drei Wochen vor Fahrtantritt fällig, bei Einzelzahlung der volle Reisepreis sechs Wochen vor Reisebeginn. Die Endabrechnung erfolgt nach der Fahrt.`,
      linkLabel: "Zahlungstermine im Detail",
      href: URLS.keineAnzahlung,
      icon: "noPayment" as UspIcon,
    },
    {
      id: "freiplatz",
      heading: "Freiplatzregelung für Begleitpersonen",
      // Die Superlative der Bestandsseite („äußerst vorteilhaft",
      // „unschlagbares Preis-Leistungs-Verhältnis", „maximale Flexibilität")
      // sind bewusst nicht übernommen. Es bleibt die Regelung selbst, die den
      // Punkt belegt.
      // Dritter Satz aus Rankingschutz: „Preis-Leistungs-Verhältnis" ist ein
      // Begriff der Bestandsseite, der beim Streichen der Superlative
      // mitverloren ging. Er steht hier als sachliche Folge der Regelung, nicht
      // als Marktbehauptung. Siehe HANDOVER.md §B1.
      text: "Begleitende Lehrkräfte und Gruppenleiter tragen bei Klühspies kaum eigene Kosten. Auf Wunsch nimmt Klühspies zusätzliche Freiplätze ins Angebot auf, damit für die Gruppe kein finanzielles Risiko entsteht. Jeder Freiplatz verbessert das Preis-Leistungs-Verhältnis der Fahrt für die zahlenden Teilnehmenden.",
      // Ohne Link: zur Freiplatzregelung existiert keine Zielseite auf
      // klassenfahrten-kluehspies.de. Ein erfundener Link kommt nicht in Frage,
      // ein toter erst recht nicht.
      linkLabel: null,
      href: null,
      icon: "seat" as UspIcon,
    },
    {
      id: "portal",
      heading: "Sie sehen jederzeit, wer schon gezahlt hat",
      text: "Im Verwaltungsportal von Klühspies stehen Namen, Beträge und Zahlungsstand aller Teilnehmenden. Auch Zahlungen aus dem Bildungs- und Teilhabepaket erscheinen dort. Den Zugang erhalten Gruppen, die den Bezahlservice nutzen.",
      // Zeigt auf das Portal selbst, nicht noch einmal auf die
      // Bezahlservice-Seite: jedes Ziel wird auf dieser Seite genau einmal
      // verlinkt. Zwei Links auf dieselbe URL teilen den Ankertext-Wert und
      // erzeugen in Screenreader-Linklisten zwei Einträge für ein Ziel.
      linkLabel: "Zum Klühspies Portal",
      href: URLS.portal,
      icon: "chart" as UspIcon,
    },
    {
      id: "beratung",
      heading: "Persönliche Beratung, im Notfall 24/7 erreichbar",
      // „Reiseunterlagen" ist ein Begriff der Bestandsseite, der beim Auflösen
      // des Abschnitts „Kundenfreundliche Abwicklung" mitverloren ging. Ohne
      // das dortige „optimal". Siehe HANDOVER.md §B1.
      text: "Bei Klühspies unterstützt Sie eine persönliche Ansprechpartnerin bei der Planung. Vor der Fahrt erhalten Sie ausführliche Reiseunterlagen. Während der Klassenfahrt ist der Notrufservice von Klühspies 24/7 erreichbar.",
      // Kein Link: der Kontaktblock unmittelbar darunter trägt denselben CTA
      // auf dasselbe Ziel. Der stärkere von beiden bleibt.
      linkLabel: null,
      href: null,
      icon: "support" as UspIcon,
    },
  ],
} as const;

/** Karte nach id, damit die FAQ-Zuordnung eine Umsortierung überlebt. */
function usp(id: string) {
  const card = uspSection.cards.find((c) => c.id === id);
  if (!card) throw new Error(`USP-Karte "${id}" existiert nicht`);
  return card;
}

// ── Für welche Schulen ist Klühspies besonders interessant? ─────────────────
// Selbsteinordnung: Die Liste ist in Sie-Form geschrieben, damit die Lehrkraft
// sich beim Überfliegen wiedererkennt statt über sich in dritter Person zu
// lesen. Der Lead davor ist der Satz, der die frageförmige H2 auch isoliert
// beantwortet.
export const bestFitSection = {
  heading: "Für welche Schulen ist Klühspies besonders interessant?",
  lead: "Klühspies eignet sich besonders für Schulen und Lehrkräfte, die eine Klassenfahrt mit wenig Verwaltungsaufwand, planbaren Zahlungsterminen und persönlicher Beratung organisieren möchten.",
  items: [
    "Sie möchten den Verwaltungsaufwand einer Klassenfahrt verringern.",
    "Sie planen früh und wollen bei der Buchung keine Anzahlung leisten.",
    "Sie planen eine Skifahrt und suchen einen spezialisierten Anbieter.",
    "Sie möchten das Einsammeln des Reisepreises abgeben.",
    "Sie legen Wert auf persönliche Beratung und klare Abläufe.",
  ],
} as const;

// ── Qualität, auf die Schulen vertrauen ─────────────────────────────────────
// Adressiert vor allem die zweite Zielgruppe: Schulleitung und Sekretariat,
// die Seriosität und Formales prüfen. Verbandsnamen deshalb vollständig beim
// ersten Auftreten, Abkürzung erst danach.
//
// Keine CTAs: zu keiner der vier Auszeichnungen existiert eine Detailseite auf
// der Klühspies-Domain. Die Siegel tragen ihre Aussage vollständig im Text.
export const trustSection = {
  heading: "Qualität, auf die Schulen vertrauen",
  cards: [
    {
      heading: "„Sehr gut“ vom DSLV",
      text: "Prüfer des Deutschen Sportlehrerverbands (DSLV) bewerten Preise, Leistungen und schulgerechte Reisebedingungen von Klühspies in regelmäßigen Prüfungen mit „sehr gut“. Klühspies legt dafür in freiwilliger Selbstverpflichtung sämtliche abgegebenen Kundenbewertungen offen.",
      logo: {
        src: "/mockups/ueber-kluehspies/assets/siegel-dslv.png",
        alt: "Siegel „Sehr gut“ des Deutschen Sportlehrerverbands (DSLV)",
      },
    },
    {
      heading: "Geprüfte Reisenetz Qualität",
      text: "Der Kinder- und Jugendreiseverband Reisenetz hat Klühspies mit dem Gütesiegel „Geprüfte Reisenetz Qualität“ ausgezeichnet. Hinter dem Siegel stehen Qualitätskriterien, die die Sicherheit von Kinder- und Jugendreisen gewährleisten, sowie Anforderungen an eine ehrliche und fachkundige Beratung.",
      logo: {
        src: "/mockups/ueber-kluehspies/assets/siegel-reisenetz.png",
        alt: "Gütesiegel „Geprüfte Reisenetz Qualität“ des Kinder- und Jugendreiseverbands Reisenetz",
      },
    },
    {
      heading: "Mitglied im Schulfahrtenverband",
      text: "Klühspies ist Gründungsmitglied im Bundesverband führender Schulfahrtenveranstalter. Der Dachverband für schulische Bildungsreisen steht für Erfahrungsaustausch, Hilfestellung in Notfällen und die Einhaltung verbindlicher Qualitätsmerkmale.",
      logo: {
        src: "/mockups/ueber-kluehspies/assets/siegel-schulfahrtenverband.png",
        alt: "Logo des Bundesverbands führender Schulfahrtenveranstalter",
      },
    },
    {
      heading: "Engagement im DSV-Nachwuchsprojekt",
      text: "Klühspies engagiert sich als Nummer 1 für Ski-Klassenfahrten im Nachwuchsprojekt des Deutschen Skiverbands (DSV). Das Projekt soll Kinder und Jugendliche langfristig für den Schneesport begeistern. Grundlage ist die Zusammenarbeit mit Bildungsnetzwerken, Veranstaltern und dem DSV.",
      logo: {
        src: "/mockups/ueber-kluehspies/assets/siegel-dsv-nachwuchsprojekt.png",
        alt: "Logo des Nachwuchsprojekts des Deutschen Skiverbands (DSV)",
      },
    },
  ],
} as const;

// ── Vergleichs-Teaser ───────────────────────────────────────────────────────
// Für Nutzerinnen im Auswahlmodus. Der Vergleich lebt auf einer eigenen Seite;
// diese Section zeigt die Kriterien sichtbar und trägt den Link dorthin.
// Die Kriterien stammen aus dem bisherigen Teasertext, sie sind nicht neu.
// Keine Wettbewerbernamen auf der Über-uns-Seite.
export const compareSection = {
  heading: "Klassenfahrtanbieter vergleichen",
  text: "Bevor Sie sich für einen Anbieter entscheiden, lohnt der Vergleich dieser vier Punkte:",
  criteria: [
    "Zahlungsbedingungen und Fälligkeitstermine",
    "Umfang der Organisation",
    "Betreuung vor Ort und im Notfall",
    "Anreise und Verkehrsmittel",
  ],
  cta: "Zum Anbieter-Vergleich",
} as const;

// ── Persönliche Kontakt-CTA ─────────────────────────────────────────────────
// Name und Funktion der Ansprechpartnerin bleiben sichtbar: für eine skeptische
// Zielgruppe ist ein Gesicht mit Namen eines der stärksten Signale der Seite.
// Telefon und E-Mail stehen nebeneinander, weil ein Teil der Zielgruppe
// grundsätzlich nicht anruft.
export const contactSection = {
  heading: "Sie haben Fragen zu Klassenfahrten?",
  text: "Klühspies berät Sie persönlich und findet gemeinsam mit Ihnen die passende Reise für Ihre Klasse.",
  primaryCta: { label: "Beratung anfragen", href: URLS.kontakt },
  phoneCta: { label: TELEFON_LABEL, href: URLS.telefon },
  email: { label: EMAIL, href: `mailto:${EMAIL}` },
  availability: `Erreichbar ${ERREICHBARKEIT}`,
  person: {
    // {{VERIFY: Ansprechpartnerin}} Der Kontaktblock der Bestandsseite rotiert
    // serverseitig (Cookie „mindshape-cta-banner-currentperson"). Am 11.08.2026
    // stand dort Jennifer Brawansky. Siehe OPEN_FACTS.md §A1.
    name: "Kristina Emde",
    role: "Produktmanagerin",
    photo: {
      src: "/mockups/ueber-kluehspies/assets/kristina-emde.jpg",
      alt: "Porträt von Kristina Emde, Produktmanagerin bei Klühspies",
    },
  },
} as const;

// ── Aktualitätssignal am Ende der Content-Sektion ───────────────────────────
export const contentMeta = {
  standLabel: `Stand: ${CONTENT_STAND.display}`,
  responsibleLabel: `Inhaltlich verantwortlich: ${contactSection.person.name}, ${contactSection.person.role}`,
} as const;

// ── FAQ ─────────────────────────────────────────────────────────────────────
// Grundlage der FAQPage-Auszeichnung. Jede Antwort ist wörtlich sichtbarer
// Seitentext: die Werte kommen aus denselben Konstanten, die die Komponenten
// rendern. Schema und Sichtbares können nicht auseinanderlaufen.
export const faq = [
  {
    question: "Für welche Schulen ist Klühspies geeignet?",
    answer: [bestFitSection.lead, ...bestFitSection.items].join(" "),
  },
  {
    question: "Wann muss ich eine Klassenfahrt bei Klühspies bezahlen?",
    answer: usp("keine-anzahlung").text,
  },
  {
    question: "Fällt bei Klühspies eine Anzahlung an?",
    answer: trustStatsAnchor,
  },
  {
    question: "Was ist der Klühspies Bezahlservice?",
    answer: usp("bezahlservice").text,
  },
] as const;

// ── Unternehmensdaten für die strukturierten Daten ──────────────────────────
// Quellen: Impressum und die bestehende TravelAgency-Auszeichnung der
// Produktionsseite. Kein Wert ist abgeleitet oder geschätzt.
export const organization = {
  name: "Klühspies",
  legalName: "Klühspies Reisen GmbH & Co. KG",
  description:
    "Spezial-Reiseveranstalter für Klassenfahrten und Gruppenreisen mit über 40 Jahren Erfahrung.",
  // {{VERIFY: exaktes Gründungsjahr}} — Website und Impressum nennen nur
  // „über 40 Jahre Erfahrung". foundingDate bleibt deshalb aus dem Schema.
  foundingDate: null,
  address: {
    street: "Ohler Weg 10",
    postalCode: "58553",
    locality: "Halver-Oberbrügge",
    country: "DE",
  },
  telephone: "+49235197860",
  faxNumber: "+492351786078",
  email: EMAIL,
  openingHours: "Mo-Fr 08:00-17:00",
  awards: [
    "Bewertung „sehr gut“ des Deutschen Sportlehrerverbands (DSLV)",
    "Gütesiegel „Geprüfte Reisenetz Qualität“ des Kinder- und Jugendreiseverbands Reisenetz",
  ],
  /** Nur belegte Mitgliedschaften. Reisenetz steht unter award, nicht unter
   *  memberOf: belegt ist das Gütesiegel, nicht die Mitgliedschaft.
   *  {{VERIFY: Ist Klühspies Mitglied im Reisenetz?}} Siehe OPEN_FACTS.md §A4. */
  memberOf: ["Bundesverband führender Schulfahrtenveranstalter"],
  /** Nur nachweisbare Profile. LinkedIn und YouTube waren unter den
   *  naheliegenden Handles nicht auffindbar und werden nicht geraten.
   *  {{VERIFY: Vollständige Profilliste und richtiger Facebook-Auftritt}} —
   *  die Bestandsseite führt zwei verschiedene Facebook-Adressen, im Footer
   *  facebook.com/Kluehspies, im eigenen Schema
   *  facebook.com/klassenfahrtenkluehspies. Siehe OPEN_FACTS.md §A8. */
  sameAs: [
    "https://www.facebook.com/klassenfahrtenkluehspies",
    "https://www.instagram.com/klassenfahrtenkluehspies",
  ],
} as const;

// ── Header-Navigation ───────────────────────────────────────────────────────
// Labels und Ziele aus der bestehenden Klühspies-Hauptnavigation.
export const headerNav = [
  { label: "Ski-Klassenfahrten", href: "https://www.klassenfahrten-kluehspies.de/ski-klassenfahrten/" },
  { label: "Städte-Klassenfahrten", href: "https://www.klassenfahrten-kluehspies.de/staedte-klassenfahrten/" },
  { label: "Aktiv-Klassenfahrten", href: "https://www.klassenfahrten-kluehspies.de/aktiv-klassenfahrten/" },
  { label: "Klassenfahrt-Themen", href: "https://www.klassenfahrten-kluehspies.de/klassenfahrt-themen/" },
  { label: "Ski-Reise & Fortbildung", href: "https://www.klassenfahrten-kluehspies.de/ski-reise-fortbildung/" },
] as const;

// ── Footer ──────────────────────────────────────────────────────────────────
// Inhalte und Ziele 1:1 aus dem bestehenden Klühspies-Footer.
const K = "https://www.klassenfahrten-kluehspies.de";

export const footer = {
  company: organization.legalName,
  address: [
    organization.address.street,
    `${organization.address.postalCode} ${organization.address.locality}`,
  ],
  phone: { label: `Tel.: ${TELEFON_LABEL}`, href: URLS.telefon },
  fax: "Fax: +49 (0) 2351 / 78 60 78",
  email: { label: EMAIL, href: `mailto:${EMAIL}` },
  facebook: "https://www.facebook.com/Kluehspies/?locale=de_DE",
  columns: [
    {
      heading: "Lernen Sie uns kennen",
      links: [
        { label: "Über Klühspies", href: `${K}/ueber-kluehspies/` },
        { label: "Keine Anzahlung bei Buchung", href: `${K}/service/keine-anzahlung-bei-buchung/` },
        { label: "Stellenangebote", href: `${K}/stellenangebote/` },
        { label: "Klühspies’ Engagement", href: `${K}/ueber-kluehspies/engagement/` },
        { label: "Nachhaltigkeit", href: `${K}/ueber-kluehspies/nachhaltigkeit/` },
      ],
    },
    {
      heading: "Entdecken Sie unser Angebot",
      links: [
        { label: "Ski-Klassenfahrten", href: `${K}/ski-klassenfahrten/` },
        { label: "Aktiv-Klassenfahrten", href: `${K}/aktiv-klassenfahrten/` },
        { label: "Städte-Klassenfahrten", href: `${K}/staedte-klassenfahrten/` },
        { label: "Ski-Lager", href: `${K}/ski-lager/` },
        { label: "Ski-Fortbildungen", href: `${K}/ski-reise-fortbildung/ski-fortbildungen/` },
        { label: "Resilienztraining", href: `${K}/resilienzfoerderung-in-der-schule/` },
      ],
    },
    {
      heading: "Service",
      links: [
        { label: "Kataloge", href: `${K}/service/kataloge/` },
        { label: "Planung einer Klassenfahrt", href: `${K}/blog/organisation-einer-klassenfahrt/planung-der-klassenfahrt/` },
        { label: "Versicherungspakete", href: `${K}/service/reiseversicherung/` },
        { label: "Buchungsablauf", href: `${K}/blog/organisation-einer-klassenfahrt/buchungsablauf/` },
        { label: "Klassenfahrt Formulare", href: `${K}/service/formulare/` },
        { label: "Klühspies Portal", href: "https://portal.klassenfahrten-kluehspies.de" },
      ],
    },
  ],
  legal: [
    { label: "Impressum", href: `${K}/impressum/` },
    { label: "Datenschutz", href: `${K}/datenschutz/` },
    { label: "AGB", href: `${K}/agb/` },
  ],
  copyright: "© 2026 Klühspies Reisen GmbH & Co. KG",
} as const;
