import type { Metadata } from "next";
import Nav from "@/components/Nav";
import IntelHero from "@/components/insights/IntelHero";
import FanOut from "@/components/insights/FanOut";
import Observatory from "@/components/insights/Observatory";
import SignalMarquee from "@/components/insights/SignalMarquee";
import FieldNotes from "@/components/insights/FieldNotes";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Insights — The Intelligence Room | SEESZN",
  description:
    "Field notes from the retrieval layer: query fan-out, citation surfaces, chunk-level retrieval, entity clarity, schema, performance and the surfaces that feed AI answers.",
  openGraph: {
    title: "SEESZN — The Intelligence Room",
    description: "Most search now happens where you cannot see it. We publish what we verify in operation.",
    siteName: "SEESZN",
  },
};

export default function InsightsPage() {
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
          roman="Reading is not"
          italic="visibility."
          sub={[
            "THE NOTES ARE GENERAL.",
            "YOUR LEAK IS SPECIFIC.",
          ]}
          closing="We build the surfaces machines retrieve and people trust."
        />
      </main>
      <Footer />
    </>
  );
}
