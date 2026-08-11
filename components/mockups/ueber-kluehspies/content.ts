// ─── Über Klühspies — sichtbare Inhalte ─────────────────────────────────────
// Einzige Quelle für alle sichtbaren Texte dieser Mockup-Seite ist
// docs/mockups/ueber-kluehspies/CONTENT.md. Diese Datei ist die 1:1-Übernahme
// davon in typisierte Form, damit die Komponenten keine Copy inline halten und
// eine Änderung in CONTENT.md an genau einer Stelle nachgezogen wird.
//
// Bewusst NICHT übernommen (CONTENT.md §1 und §7): der Claim „europaweit die
// Nr. 1 für Schulskifahrten", Superlative wie „unschlagbar", die Accordions der
// Bestandsseite und die Section „Kundenfreundliche Abwicklung". Texte aus dem
// PNG-Mockup wurden nicht per OCR übernommen; wo PNG und CONTENT.md abweichen,
// gilt CONTENT.md.

/** Ziel-URLs laut CONTENT.md §3. Nichts hier ist erfunden. */
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

export const TELEFON_LABEL = "+49 (0) 2351 / 97 86-0";

// ── SEO-Metadaten für die spätere Produktionsversion (CONTENT.md §4) ─────────
export const PRODUCTION_SEO = {
  title: "Über Klühspies | Klassenfahrten seit über 40 Jahren",
  description:
    "Klühspies organisiert seit über 40 Jahren Klassenfahrten. 110.000 Gäste pro Jahr, keine Anzahlung, kostenloser Bezahlservice und persönliche Betreuung.",
} as const;

// ── Hero ────────────────────────────────────────────────────────────────────
export const hero = {
  eyebrow: "Über Klühspies",
  h1: ["Klassenfahrten", "seit über 40 Jahren"],
  intro: [
    "Klühspies ist ein Familienbetrieb und einer der größten Klassenfahrt-Anbieter Deutschlands.",
    "Mehr als 110.000 Gäste pro Jahr vertrauen auf unsere Erfahrung, Qualität und persönliche Betreuung.",
  ],
  primaryCta: { label: "Klassenfahrt anfragen", href: URLS.anfrage },
  secondaryCta: { label: "Bezahlservice ansehen", href: URLS.bezahlservice },
  tertiaryCta: { label: "Klassenfahrtanbieter vergleichen" },
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

// ── Was Klühspies anders macht ──────────────────────────────────────────────
export type UspIcon = "noPayment" | "portal" | "chart" | "support";

export const uspSection = {
  heading: "Was Klühspies anders macht",
  intro:
    "Viele Veranstalter organisieren Anreise, Unterkunft und Programm. Klühspies vereinfacht zusätzlich Abläufe, die Lehrkräften vor einer Klassenfahrt besonders viel Verwaltungsarbeit machen.",
  cards: [
    {
      heading: "Keine Anzahlung bei Buchung",
      text: "Sichern Sie Ihre Klassenfahrt frühzeitig, ohne bereits bei der Buchung eine Anzahlung leisten zu müssen.",
      linkLabel: "Mehr erfahren",
      href: URLS.keineAnzahlung,
      icon: "noPayment" as UspIcon,
    },
    {
      heading: "Kostenloser Bezahlservice inkl. Lehrer-Portal",
      text: "Eltern zahlen individuell und direkt an Klühspies. Wir verwalten die Zahlungseingänge und entlasten Sie bei der Abwicklung.",
      linkLabel: "Bezahlservice ansehen",
      href: URLS.bezahlservice,
      icon: "portal" as UspIcon,
    },
    {
      heading: "Zahlungsstand jederzeit im Blick",
      text: "Im Verwaltungsportal sehen Sie transparent, welche Zahlungen eingegangen sind und welche noch offen sind.",
      linkLabel: "Portal kennenlernen",
      href: URLS.bezahlservice,
      icon: "chart" as UspIcon,
    },
    {
      heading: "Persönliche Beratung + 24/7 Notfallservice",
      text: "Persönliche Ansprechpartner unterstützen Sie bei der Planung. Während der Reise ist unser Notrufservice rund um die Uhr erreichbar.",
      linkLabel: "Kontakt aufnehmen",
      href: URLS.kontakt,
      icon: "support" as UspIcon,
    },
  ],
} as const;

// ── Für welche Schulen ist Klühspies besonders interessant? ─────────────────
export const bestFitSection = {
  heading: "Für welche Schulen ist Klühspies besonders interessant?",
  items: [
    "Für Lehrkräfte, die weniger Verwaltungsaufwand möchten",
    "Für früh geplante Klassenfahrten ohne Anzahlung",
    "Für Schulen, die persönliche Beratung und klare Abläufe schätzen",
  ],
} as const;

// ── Qualität, auf die Schulen vertrauen ─────────────────────────────────────
// CTA-Ziele: CONTENT.md erlaubt nur bereits im Projekt eindeutig definierte
// URLs. Für die Verbands- und Siegel-Karten existiert keine bestätigte
// Ziel-URL, deshalb tragen sie kein href und werden als Mockup-CTA behandelt.
export const trustSection = {
  heading: "Qualität, auf die Schulen vertrauen",
  cards: [
    {
      heading: "„Sehr gut“ vom DSLV",
      text: "Regelmäßig geprüft und vom Deutschen Sportlehrerverband mit „sehr gut“ bewertet.",
      cta: "Mehr erfahren",
      logo: {
        src: "/mockups/ueber-kluehspies/assets/siegel-dslv.png",
        alt: "Siegel des Deutschen Sportlehrerverbands DSLV",
      },
    },
    {
      heading: "Geprüfte Reisenetz Qualität",
      text: "Ausgezeichnet mit dem Qualitätssiegel des Kinder- und Jugendreiseverbands Reisenetz.",
      cta: "Mehr erfahren",
      logo: {
        src: "/mockups/ueber-kluehspies/assets/siegel-reisenetz.png",
        alt: "Qualitätssiegel Geprüfte Reisenetz Qualität",
      },
    },
    {
      heading: "Mitglied im Schulfahrtenverband",
      text: "Gründungsmitglied im Bundesverband führender Schulfahrtenveranstalter für professionelle Standards.",
      cta: "Mehr erfahren",
      logo: {
        src: "/mockups/ueber-kluehspies/assets/siegel-schulfahrtenverband.png",
        alt: "Logo Bundesverband führender Schulfahrtenveranstalter",
      },
    },
    {
      heading: "Engagement im DSV-Nachwuchsprojekt",
      text: "Klühspies engagiert sich gemeinsam mit dem DSV für Kinder und Jugendliche im Schneesport.",
      cta: "Mehr erfahren",
      logo: {
        src: "/mockups/ueber-kluehspies/assets/siegel-dsv-nachwuchsprojekt.png",
        alt: "Logo DSV-Nachwuchsprojekt",
      },
    },
  ],
} as const;

// ── Vergleichs-Teaser ───────────────────────────────────────────────────────
// Ziel-URL laut CONTENT.md §3 noch nicht definiert. Der CTA bleibt sichtbar
// und bedienbar, navigiert aber nicht.
export const compareSection = {
  heading: "Klassenfahrtanbieter vergleichen",
  text: "Vergleichen Sie Anbieter nach Zahlungsbedingungen, Organisation, Betreuung und Anreise, neutral und übersichtlich.",
  cta: "Zum Vergleich",
} as const;

// ── Persönliche Kontakt-CTA ─────────────────────────────────────────────────
export const contactSection = {
  eyebrow: "Persönliche Reiseberatung",
  heading: "Sie haben Fragen zu Klassenfahrten?",
  text: "Wir beraten Sie persönlich und finden gemeinsam mit Ihnen die passende Reise für Ihre Klasse.",
  primaryCta: { label: "Kontakt aufnehmen", href: URLS.kontakt },
  secondaryCta: { label: TELEFON_LABEL, href: URLS.telefon },
  person: {
    name: "Kristina Emde",
    role: "Produktmanagerin",
    photo: {
      src: "/mockups/ueber-kluehspies/assets/kristina-emde.jpg",
      alt: "Porträt von Kristina Emde, Produktmanagerin bei Klühspies",
    },
  },
} as const;

// ── Header-Navigation ───────────────────────────────────────────────────────
// Labels und Ziele stammen aus der bestehenden Klühspies-Hauptnavigation.
export const headerNav = [
  { label: "Ski-Klassenfahrten", href: "https://www.klassenfahrten-kluehspies.de/ski-klassenfahrten/" },
  { label: "Städte-Klassenfahrten", href: "https://www.klassenfahrten-kluehspies.de/staedte-klassenfahrten/" },
  { label: "Aktiv-Klassenfahrten", href: "https://www.klassenfahrten-kluehspies.de/aktiv-klassenfahrten/" },
  { label: "Klassenfahrt-Themen", href: "https://www.klassenfahrten-kluehspies.de/klassenfahrt-themen/" },
  { label: "Ski-Reise & Fortbildung", href: "https://www.klassenfahrten-kluehspies.de/ski-reise-fortbildung/" },
] as const;

// ── Footer ──────────────────────────────────────────────────────────────────
// Inhalte und Ziele 1:1 aus dem bestehenden Klühspies-Footer (CONTENT.md §6).
// „Widerrufsrecht" aus dem PNG ist nicht übernommen: die URL existiert auf der
// Produktionsseite nicht (404), und erfundene Links sind ausgeschlossen.
const K = "https://www.klassenfahrten-kluehspies.de";

export const footer = {
  company: "Klühspies Reisen GmbH & Co. KG",
  address: ["Ohler Weg 10", "58553 Halver-Oberbrügge"],
  phone: { label: `Tel.: ${TELEFON_LABEL}`, href: URLS.telefon },
  fax: "Fax: +49 (0) 2351 / 78 60 78",
  email: { label: "info@kluehspies.com", href: "mailto:info@kluehspies.com" },
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
