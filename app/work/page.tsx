import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ArchiveRegister from "@/components/work/ArchiveRegister";
import CaseFiles from "@/components/work/CaseFiles";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import { de } from "@/lib/i18n/de";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Arbeit — Cases & Evidence Archive | SEESZN",
  description:
    "Ausgewählte SEESZN-Cases: RISCHO, SIVIUS und Contentküche. Websites, Sucharchitektur und KI-Sichtbarkeit (GEO/AIO) in laufender Betreuung.",
  path: "/work",
  locale: "de",
  altPath: "/en/work",
});

export default function DeWorkPage() {
  const h = de.workPage.hero;
  const c = de.workPage.closer;
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
        <CaseFiles />
        <ScanCTA
          index={c.index}
          label={c.label}
          roman={c.roman}
          italic={c.italic}
          sub={[...c.sub]}
          closing={c.closing}
        />
      </main>
      <Footer />
    </>
  );
}
