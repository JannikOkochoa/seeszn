import type { Metadata } from "next";
import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import IntakeForm from "@/components/diagnosis/IntakeForm";
import ScanProtocol from "@/components/diagnosis/ScanProtocol";
import Footer from "@/components/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Diagnosis — The Scan Room | SEESZN",
  description:
    "Before we build, we locate the leak. The scan reads your surface across search and AI systems: crawl, entity, citation, trust, conversion. A reading, not a pitch.",
  path: "/en/diagnosis",
  locale: "en",
  altPath: "/diagnosis",
});

export default function DiagnosisPage() {
  return (
    <>
      <Nav />
      <main>
        <RoomHero
          index="01"
          room="DIAGNOSIS / SCAN ROOM"
          accession="SZN-SC-05"
          roman={["BEFORE WE BUILD,", "WE LOCATE"]}
          italic="the leak."
          sub={[
            "A DIAGNOSIS, NOT A PITCH.",
            "WE MAP WHERE YOUR VISIBILITY BREAKS",
            "BEFORE WE DISCUSS WORKING TOGETHER.",
          ]}
          meta="THE SCAN ROOM"
          panel={<IntakeForm />}
        />
        <ScanProtocol />
      </main>
      <Footer />
    </>
  );
}
