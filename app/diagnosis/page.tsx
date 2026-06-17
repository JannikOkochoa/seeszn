import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import IntakeForm from "@/components/diagnosis/IntakeForm";
import ScanProtocol from "@/components/diagnosis/ScanProtocol";
import Footer from "@/components/Footer";
import { de } from "@/lib/i18n/de";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Diagnose anfragen — KI-Sichtbarkeits-Scan | SEESZN",
  description:
    "Fordere eine SEESZN-Diagnose an: Wir kartieren, wo deine Sichtbarkeit in Google und KI-Systemen bricht — eine Diagnose, kein Pitch. Eine Domain genügt zum Start.",
  path: "/diagnosis",
  locale: "de",
  altPath: "/en/diagnosis",
});

export default function DeDiagnosisPage() {
  const h = de.diagnosisPage.hero;
  return (
    <>
      <Nav />
      <main>
        <RoomHero
          index="01"
          room={h.room}
          accession={h.accession}
          roman={[...h.roman]}
          italic={h.italic}
          sub={[...h.sub]}
          meta={h.meta}
          panel={<IntakeForm />}
        />
        <ScanProtocol />
      </main>
      <Footer />
    </>
  );
}
