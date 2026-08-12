import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import MockupGate from "@/components/mockups/MockupGate";
import UeberKluehspiesMockup from "@/components/mockups/ueber-kluehspies/UeberKluehspiesMockup";
import { PRODUCTION_SEO } from "@/components/mockups/ueber-kluehspies/content";

// Klühspies-CI-Schrift, nur in diesem Mockup geladen. Die Produktionsseite
// nutzt Source Sans Pro; bei Google Fonts heißt dieselbe Familie inzwischen
// Source Sans 3. Gleiches Muster wie in app/kluehspies-room/page.tsx.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-kluehspies",
  display: "swap",
});

// Metadaten der späteren Produktionsversion, hier 1:1 als Preview.
//
// Bewusst ohne lib/seo#buildMetadata: der Helfer hängt „| SEESZN" an jeden
// Titel, setzt og:site_name auf SEESZN und ein SEESZN-og:image. Diese Seite
// beschreibt Klühspies, und ein Preview-Link, der unter Klühspies-Titel eine
// SEESZN-Karte ausspielt, wäre schlicht falsch beschriftet.
//
// ── Achtung beim Übernehmen nach TYPO3 ────────────────────────────────────
// robots und Canonical sind hier bewusst ANDERS als in der Produktion. Sie
// gehören zu der Domain, auf der die Seite gerade liegt, nicht zum Entwurf:
//
//   hier (seeszn.com)          Produktion (klassenfahrten-kluehspies.de)
//   robots: noindex, nofollow  robots: index, follow
//   kein Canonical             Canonical: PRODUCTION_SEO.canonical
//   kein og:url                og:url: PRODUCTION_SEO.canonical
//
// Grund: Die Seite ist vollständig Klühspies-gebrandet. Indexiert auf einer
// fremden Domain wäre sie ein Duplikat der echten /ueber-kluehspies/, und ein
// Canonical von hier auf die Klühspies-URL würde Entwurfsinhalte der
// Produktionsadresse zuschreiben. Alles andere in diesem Metadaten-Objekt,
// Title, Description, og:site_name, ist bereits der Produktionswert.
//
// Die Produktionsfassung steht vollständig in
// docs/mockups/ueber-kluehspies/HANDOVER.md §3 und §B1.
export const metadata: Metadata = {
  title: PRODUCTION_SEO.title,
  description: PRODUCTION_SEO.description,
  // Ohne dieses null erbt die Route das Canonical des Root-Layouts, also
  // https://seeszn.com. openGraph und twitter werden komplett ersetzt, sobald
  // sie hier gesetzt sind; nur alternates muss ausdrücklich geleert werden.
  alternates: { canonical: null },
  openGraph: {
    type: "website",
    siteName: PRODUCTION_SEO.siteName,
    title: PRODUCTION_SEO.title,
    description: PRODUCTION_SEO.description,
    locale: "de_DE",
    // {{TODO: OG-Image im Klühspies-Branding}}, siehe OPEN_FACTS.md.
    // Bis dahin kein Bild statt eines markenfremden.
  },
  twitter: {
    card: "summary",
    title: PRODUCTION_SEO.title,
    description: PRODUCTION_SEO.description,
  },
  robots: { index: false, follow: false, nocache: true },
};

// Session-abhängig, nie vorrendern — wie /kluehspies-room.
export const dynamic = "force-dynamic";

/**
 * Die Seite rendert ohne SEESZN-Hinweisleiste: sie ist die Bauvorlage, nach der
 * die TYPO3-Umsetzung entsteht, und muss deshalb genau das zeigen, was später
 * live steht. Der frühere MockupNotice-Balken hätte in jedem Screenshot und
 * jeder Abnahme mitgemessen.
 *
 * Die Zugangstür bleibt: ohne SEESZN-Session gibt es die Login-Ansicht statt
 * der Seite. Sie ist kein sichtbarer Teil des Entwurfs, sondern verhindert,
 * dass eine ungekennzeichnete Klühspies-Seite auf einer fremden Domain
 * öffentlich erreichbar wird.
 */
export default function UeberKluehspiesMockupPage() {
  return (
    <MockupGate>
      <div className={sourceSans.variable}>
        <UeberKluehspiesMockup />
      </div>
    </MockupGate>
  );
}
