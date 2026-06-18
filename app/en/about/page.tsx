import type { Metadata } from "next";
import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import ManualContents from "@/components/about/ManualContents";
import OperatingManual from "@/components/about/OperatingManual";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About: The Operating Manual | SEESZN",
  description:
    "How SEESZN thinks: premise, operating model, principles and refusals. A visibility studio: strategy, search architecture, editorial design and engineering as one system.",
  path: "/en/about",
  locale: "en",
  altPath: "/about",
});

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/en/about#about`,
  url: `${SITE_URL}/en/about`,
  name: "About: The Operating Manual",
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  mainEntity: { "@id": `${SITE_URL}/#organization` },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          aboutSchema,
          breadcrumbSchema([
            { name: "Home", path: "/en" },
            { name: "About", path: "/en/about" },
          ]),
        ]}
      />
      <Nav />
      <main>
        <RoomHero
          index="01"
          room="ABOUT / OPERATING MANUAL"
          accession="SZN-OM-04"
          roman={["WE OPERATE WHERE", "MACHINES DECIDE"]}
          italic="what people see."
          sub={[
            "SEESZN IS A VISIBILITY STUDIO:",
            "STRATEGY, SEARCH, DESIGN AND ENGINEERING",
            "OPERATING AS ONE SYSTEM.",
          ]}
          note={[
            "THIS PAGE IS THE MANUAL.",
            "THE READING OF YOUR SURFACE IS PRIVATE.",
          ]}
          meta="THE OPERATING MANUAL"
          cta={{ label: "BOOK A DIAGNOSIS", href: "/en/diagnosis" }}
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
