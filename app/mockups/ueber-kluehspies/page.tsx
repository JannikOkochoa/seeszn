import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import MockupGate from "@/components/mockups/MockupGate";
import MockupNotice from "@/components/mockups/MockupNotice";
import UeberKluehspiesMockup from "@/components/mockups/ueber-kluehspies/UeberKluehspiesMockup";
import { findMockup } from "@/components/mockups/registry";
import { PRODUCTION_SEO } from "@/components/mockups/ueber-kluehspies/content";
import { buildMetadata } from "@/lib/seo";

// Klühspies-CI-Schrift, nur in diesem Mockup geladen. Die Produktionsseite
// nutzt Source Sans Pro; bei Google Fonts heißt dieselbe Familie inzwischen
// Source Sans 3. Gleiches Muster wie in app/kluehspies-room/page.tsx.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-kluehspies",
  display: "swap",
});

const entry = findMockup("ueber-kluehspies");

// Titel und Description der späteren Produktionsversion stehen in CONTENT.md §4
// und werden hier als Preview mitgeführt. Kein Canonical auf die Live-Seite:
// buildMetadata setzt self-canonical auf die Mockup-Route, und die Route ist
// über robots-Meta plus X-Robots-Tag-Header ausgeschlossen.
export const metadata: Metadata = {
  ...buildMetadata({
    title: `Mockup: ${PRODUCTION_SEO.title}`,
    description: PRODUCTION_SEO.description,
    path: "/mockups/ueber-kluehspies",
    locale: "de",
    noindex: true,
  }),
  robots: { index: false, follow: false, nocache: true },
};

// Session-abhängig, nie vorrendern — wie /kluehspies-room.
export const dynamic = "force-dynamic";

export default function UeberKluehspiesMockupPage() {
  return (
    <MockupGate>
      <div className={sourceSans.variable}>
        <MockupNotice title="Über Klühspies" stand={entry?.stand ?? "11.08.2026"} />
        <UeberKluehspiesMockup />
      </div>
    </MockupGate>
  );
}
