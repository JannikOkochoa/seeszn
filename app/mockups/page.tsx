import type { Metadata } from "next";
import MockupGate from "@/components/mockups/MockupGate";
import MockupLibrary from "@/components/mockups/MockupLibrary";
import { buildMetadata } from "@/lib/seo";

// Interne Vorschauen. Sie stehen bewusst nicht in app/sitemap.ts und tragen
// hier robots-noindex; zusätzlich liegt ein X-Robots-Tag-Header auf
// /mockups/:path* in next.config.ts. Beides ist rein additiv und berührt
// weder Auth noch bestehende Kundenrouten.
export const metadata: Metadata = {
  ...buildMetadata({
    title: "Mockups | SEESZN",
    description:
      "Interne Mockup Library von SEESZN: klickbare Konzeptstände für Kundengespräche.",
    path: "/mockups",
    locale: "de",
    noindex: true,
  }),
  robots: { index: false, follow: false, nocache: true },
};

// Session-abhängig, nie vorrendern — wie /kluehspies-room.
export const dynamic = "force-dynamic";

export default function MockupsPage() {
  return (
    <MockupGate>
      <MockupLibrary />
    </MockupGate>
  );
}
