import type { Metadata } from "next";
import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ManualContents from "@/components/about/ManualContents";
import OperatingManual from "@/components/about/OperatingManual";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About — The Operating Manual | SEESZN",
  description:
    "How SEESZN thinks: premise, operating model, principles and refusals. A visibility studio — strategy, search architecture, editorial design and engineering as one system.",
  path: "/en/about",
  locale: "en",
  altPath: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main>
        <RoomHero
          index="01"
          room="ABOUT / OPERATING MANUAL"
          accession="SZN-OM-04"
          roman={["WE OPERATE WHERE", "MACHINES DECIDE"]}
          italic="what people see."
          sub={[
            "SEESZN IS A VISIBILITY STUDIO —",
            "STRATEGY, SEARCH, DESIGN AND ENGINEERING",
            "OPERATING AS ONE SYSTEM.",
          ]}
          note={[
            "THIS PAGE IS THE MANUAL.",
            "THE READING OF YOUR SURFACE IS PRIVATE.",
          ]}
          meta="THE OPERATING MANUAL"
          cta={{ label: "BOOK A DIAGNOSIS", href: "/diagnosis" }}
          panel={<ManualContents />}
        />
        <OperatingManual />
        <ScanCTA
          index="02"
          roman="The manual is public."
          italic="The reading is private."
          sub={[
            "WE MAP YOUR SURFACE BEFORE",
            "WE DISCUSS WORKING TOGETHER.",
          ]}
          closing="We build the surfaces machines retrieve and people trust."
        />
      </main>
      <Footer />
    </>
  );
}
