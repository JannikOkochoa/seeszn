// ─── Mockup Library — Registry ──────────────────────────────────────────────
// Eine Liste, aus der /mockups seine Karten rendert. Neue Mockups werden hier
// ergänzt und bekommen eine eigene Route unter /mockups/<slug>. Bewusst ohne
// Backend: Mockups sind Dateien im Repo, kein Datenbestand.
//
// Es werden nur Einträge angezeigt, die wirklich existieren. Keine leeren
// Platzhalterkarten.

export interface MockupEntry {
  slug: string;
  title: string;
  badge: string;
  subline: string;
  /** Kunde bzw. Kontext, für den das Mockup entstanden ist. */
  client: string;
  /** Konzeptstand, als sichtbares Datum. */
  stand: string;
  /** Optionale Vorschau des Referenzbilds auf der Übersichtskarte. */
  preview?: { src: string; alt: string };
}

export const mockups: MockupEntry[] = [
  {
    slug: "ueber-kluehspies",
    title: "Über Klühspies",
    badge: "Konzept",
    subline: "SEO / GEO / UX Redesign",
    client: "Klühspies Reisen",
    stand: "12.08.2026",
    preview: {
      src: "/mockups/ueber-kluehspies/kluehspies-ueber-uns-redesign-mockup-v1.png",
      alt: "Verkleinerte Vorschau des Über-Klühspies-Redesign-Mockups",
    },
  },
];

export function findMockup(slug: string): MockupEntry | undefined {
  return mockups.find((m) => m.slug === slug);
}
