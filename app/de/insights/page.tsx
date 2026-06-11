import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import TheWatch from "@/components/insights/TheWatch";
import FieldNotes from "@/components/insights/FieldNotes";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import { de } from "@/lib/i18n/de";

export default function DeInsightsPage() {
  const h = de.insightsPage.hero;
  const sc = de.insightsPage.scanCta;
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
          panel={<TheWatch />}
        />
        <FieldNotes />
        <ScanCTA
          index="03"
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
