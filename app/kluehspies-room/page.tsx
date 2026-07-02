import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import KluehspiesRoom from "@/components/kluehspies-room/KluehspiesRoom";
import { buildMetadata } from "@/lib/seo";

// Klühspies-CI-Schrift, nur in diesem Raum geladen. Source Sans Pro heißt
// bei Google Fonts inzwischen Source Sans 3 — gleiche Familie, neuere Version.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-kluehspies",
  display: "swap",
});

// Privater Client Room: nicht indexieren, nicht in der Sitemap.
export const metadata: Metadata = buildMetadata({
  title: "Klühspies Website Lab | SEESZN",
  description:
    "Privater Arbeitsraum für Klühspies Reisen: Website-Empfehlungen, Homepage-Mockup, H-Struktur und Freigaben. Powered by SEESZN.",
  path: "/kluehspies-room",
  locale: "de",
  noindex: true,
});

export default function KluehspiesRoomPage() {
  // Einfache Zugangskontrolle, bewusst noch ohne echtes Auth-System.
  // Produktiv KLUEHSPIES_ROOM_PASSWORD als Env-Variable setzen;
  // der Fallback ist ein klar markiertes Übergangspasswort.
  const expectedPassword = process.env.KLUEHSPIES_ROOM_PASSWORD ?? "kluehspies2026"; // TEMP-Fallback

  return (
    <div className={sourceSans.variable}>
      <KluehspiesRoom expectedPassword={expectedPassword} />
    </div>
  );
}
