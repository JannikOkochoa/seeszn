import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ArchiveRegister from "@/components/work/ArchiveRegister";
import EvidenceArchive from "@/components/work/EvidenceArchive";
import Footer from "@/components/Footer";
import { de } from "@/lib/i18n/de";

export default function DeWorkPage() {
  const h = de.workPage.hero;
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
          panel={<ArchiveRegister />}
        />
        <EvidenceArchive />
      </main>
      <Footer />
    </>
  );
}
