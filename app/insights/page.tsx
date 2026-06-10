import type { Metadata } from "next";
import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import TheWatch from "@/components/insights/TheWatch";
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
        <RoomHero
          index="01"
          room="INSIGHTS / INTELLIGENCE ROOM"
          accession="SZN-IN-03"
          roman={["MOST SEARCH NOW", "HAPPENS WHERE"]}
          italic="you cannot see it."
          sub={[
            "FIELD NOTES FROM THE RETRIEVAL LAYER —",
            "WHAT AI SEARCH READS, CITES AND IGNORES,",
            "RECORDED IN OPERATION.",
          ]}
          note={[
            "NO TREND ESSAYS. NO PREDICTION THEATER.",
            "ONLY WHAT WE VERIFY.",
          ]}
          meta="THE INTELLIGENCE ROOM"
          cta={{ label: "BOOK A DIAGNOSIS", href: "/diagnosis" }}
          panel={<TheWatch />}
        />
        <FieldNotes />
        <ScanCTA
          index="03"
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
