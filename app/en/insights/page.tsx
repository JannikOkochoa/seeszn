import type { Metadata } from "next";
import Nav from "@/components/Nav";
import IntelHero from "@/components/insights/IntelHero";
import FanOut from "@/components/insights/FanOut";
import Observatory from "@/components/insights/Observatory";
import SignalMarquee from "@/components/insights/SignalMarquee";
import FieldNotes from "@/components/insights/FieldNotes";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Insights — The Intelligence Room | SEESZN",
  description:
    "Field notes from the retrieval layer: query fan-out, citation surfaces, chunk-level retrieval, entity clarity, schema, performance and the surfaces that feed AI answers.",
  path: "/en/insights",
  locale: "en",
  altPath: "/insights",
});

export default function InsightsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/en" },
          { name: "Insights", path: "/en/insights" },
        ])}
      />
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
