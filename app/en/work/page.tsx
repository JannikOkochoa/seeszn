import type { Metadata } from "next";
import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ArchiveRegister from "@/components/work/ArchiveRegister";
import CaseFiles from "@/components/work/CaseFiles";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { CASES, CASE_SLUGS } from "@/lib/cases";
import { buildMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Work: The Evidence Archive | SEESZN",
  description:
    "Three live systems, built and held in care: Rischo (website + SEO), SIVIUS (website, software, AIO/GEO) and Contentküche (GEO + SEO). Client readings remain confidential, the surfaces are live.",
  path: "/en/work",
  locale: "en",
  altPath: "/work",
});

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/en/work#collection`,
  name: "Work: The Evidence Archive",
  url: `${SITE_URL}/en/work`,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  hasPart: CASE_SLUGS.map((slug) => ({
    "@type": "CreativeWork",
    "@id": `${SITE_URL}/cases/${slug}#case`,
    name: `${CASES[slug].fullName} · Case`,
    about: CASES[slug].sector,
    url: `${SITE_URL}/cases/${slug}`,
  })),
};

export default function WorkPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionSchema,
          breadcrumbSchema([
            { name: "Home", path: "/en" },
            { name: "Work", path: "/en/work" },
          ]),
        ]}
      />
      <Nav />
      <main>
        <RoomHero
          index="01"
          room="WORK / EVIDENCE ARCHIVE"
          accession="SZN-AR-02"
          roman={["PROOF IS WHAT", "THE SYSTEM"]}
          italic="reveals."
          sub={[
            "THREE LIVE SYSTEMS · BUILT, MEASURED",
            "AND HELD IN CONTINUOUS CARE.",
            "FILED AS CASE RECORDS.",
          ]}
          note={[
            "CLIENT READINGS REMAIN CONFIDENTIAL.",
            "THE SURFACES ARE LIVE.",
          ]}
          meta="THE EVIDENCE ARCHIVE"
          cta={{ label: "BOOK A DIAGNOSIS", href: "/en/diagnosis" }}
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
