import type { Metadata } from "next";
import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ArchiveRegister from "@/components/work/ArchiveRegister";
import EvidenceArchive from "@/components/work/EvidenceArchive";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Work — The Evidence Archive | SEESZN",
  description:
    "An archive of instruments, not logos: crawl maps, query fan-outs, citation gap reports, surface core samples and conversion path traces. Client readings remain confidential.",
  openGraph: {
    title: "SEESZN — The Evidence Archive",
    description: "Proof is what the system reveals. The archive shows instruments, not trophies.",
    siteName: "SEESZN",
  },
};

export default function WorkPage() {
  return (
    <>
      <Nav />
      <main>
        <RoomHero
          index="01"
          room="WORK / EVIDENCE ARCHIVE"
          accession="SZN-AR-02"
          roman={["PROOF IS WHAT", "THE SYSTEM"]}
          italic="reveals."
          sub={[
            "AN ARCHIVE OF INSTRUMENTS, NOT LOGOS.",
            "THE FORMS OUR EVIDENCE TAKES —",
            "CATALOGUED LIKE SPECIMENS.",
          ]}
          note={[
            "CLIENT READINGS REMAIN CONFIDENTIAL.",
            "THE INSTRUMENTS ARE PUBLIC.",
          ]}
          meta="THE EVIDENCE ARCHIVE"
          cta={{ label: "BOOK A DIAGNOSIS", href: "/diagnosis" }}
          panel={<ArchiveRegister />}
        />
        <EvidenceArchive />
      </main>
      <Footer />
    </>
  );
}
