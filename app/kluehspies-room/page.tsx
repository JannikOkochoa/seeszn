import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import KluehspiesRoom from "@/components/kluehspies-room/KluehspiesRoom";
import KluehspiesLogin from "@/components/kluehspies-room/KluehspiesLogin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadWorkspace } from "@/lib/kpi/loadWorkspace";
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

// Session-abhängig, nie vorrendern.
export const dynamic = "force-dynamic";

export default async function KluehspiesRoomPage() {
  // Cookie-Session serverseitig validieren; ohne Session gibt es keine
  // Kundendaten, nur die Login-Ansicht.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className={sourceSans.variable}>
        <KluehspiesLogin />
      </div>
    );
  }

  // Initialdaten mit dem Session-Client laden: RLS begrenzt alles auf die
  // Organisation des Nutzers. Ohne Membership gibt es keinen Zugang.
  const workspace = await loadWorkspace(supabase, user);
  if (!workspace) {
    return (
      <div className={sourceSans.variable}>
        <KluehspiesLogin noAccessEmail={user.email ?? "diesem Konto"} />
      </div>
    );
  }

  return (
    <div className={sourceSans.variable}>
      <KluehspiesRoom workspace={workspace} />
    </div>
  );
}
