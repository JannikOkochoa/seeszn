import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ManualContents from "@/components/about/ManualContents";
import OperatingManual from "@/components/about/OperatingManual";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import { de } from "@/lib/i18n/de";

export default function DeAboutPage() {
  const h = de.aboutPage.hero;
  const sc = de.aboutPage.scanCta;
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
          note={h.note ? [...h.note] : undefined}
          meta={h.meta}
          cta={h.cta}
          panel={<ManualContents />}
        />
        <OperatingManual />
        <ScanCTA
          index="02"
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
