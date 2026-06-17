import Nav from "@/components/Nav";
import IntelHero from "@/components/insights/IntelHero";
import FanOut from "@/components/insights/FanOut";
import Observatory from "@/components/insights/Observatory";
import SignalMarquee from "@/components/insights/SignalMarquee";
import FieldNotes from "@/components/insights/FieldNotes";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import { de } from "@/lib/i18n/de";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Insights — Field Notes zur KI-Sichtbarkeit | SEESZN",
  description:
    "Field Notes aus der Retrieval-Schicht: Was AI Search liest, zitiert und ignoriert. Grundlagen zu KI-Sichtbarkeit, GEO und AIO von SEESZN.",
  path: "/insights",
  locale: "de",
  altPath: "/en/insights",
});

export default function DeInsightsPage() {
  const sc = de.insightsPage.scanCta;
  return (
    <>
      <Nav />
      <main>
        <IntelHero />
        <FanOut />
        <Observatory />
        <SignalMarquee />
        <FieldNotes />
        <ScanCTA
          index="05"
          roman={sc.roman}
          italic={sc.italic}
          sub={[...sc.sub]}
          closing={sc.closing}
        />
      </main>
      <Footer />
    </>
  );
}
