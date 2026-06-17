import type { Metadata } from "next";
import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ArchiveRegister from "@/components/work/ArchiveRegister";
import CaseFiles from "@/components/work/CaseFiles";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Work — The Evidence Archive | SEESZN",
  description:
    "Three live systems, built and held in care: Rischo (website + SEO), SIVIUS (website, software, AIO/GEO) and Contentküche (GEO + SEO). Client readings remain confidential — the surfaces are live.",
  path: "/en/work",
  locale: "en",
  altPath: "/work",
});

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
            "THREE LIVE SYSTEMS — BUILT, MEASURED",
            "AND HELD IN CONTINUOUS CARE.",
            "FILED AS CASE RECORDS.",
          ]}
          note={[
            "CLIENT READINGS REMAIN CONFIDENTIAL.",
            "THE SURFACES ARE LIVE.",
          ]}
          meta="THE EVIDENCE ARCHIVE"
          cta={{ label: "BOOK A DIAGNOSIS", href: "/diagnosis" }}
          panel={<ArchiveRegister />}
        />
        <CaseFiles />
        <ScanCTA
          index="03"
          roman="The next case file"
          italic="could be yours."
          sub={[
            "WE MAP THE LEAK BEFORE WE BUILD.",
            "THE SCAN COMES FIRST.",
          ]}
          closing="We build the surfaces machines retrieve and people trust."
        />
      </main>
      <Footer />
    </>
  );
}
