import Nav from "@/components/Nav";
import IntelHero from "@/components/insights/IntelHero";
import FanOut from "@/components/insights/FanOut";
import Observatory from "@/components/insights/Observatory";
import SignalMarquee from "@/components/insights/SignalMarquee";
import FieldNotes from "@/components/insights/FieldNotes";
import ScanCTA from "@/components/rooms/ScanCTA";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { de } from "@/lib/i18n/de";
import { ARTICLES, ARTICLE_SLUGS } from "@/lib/insights";
import type { Metadata } from "next";
import { buildMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Insights: Field Notes zur KI-Sichtbarkeit | SEESZN",
  description:
    "Field Notes aus der Retrieval-Schicht: Was AI Search liest, zitiert und ignoriert. Grundlagen zu KI-Sichtbarkeit, GEO und AIO von SEESZN.",
  path: "/insights",
  locale: "de",
  altPath: "/en/insights",
});

const insightsCollectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/insights#collection`,
  url: `${SITE_URL}/insights`,
  name: "Insights: Field Notes zur KI-Sichtbarkeit",
  inLanguage: "de-DE",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  hasPart: ARTICLE_SLUGS.map((slug) => ({
    "@type": "Article",
    "@id": `${SITE_URL}/${slug}`,
    headline: ARTICLES[slug].h1,
    url: `${SITE_URL}/${slug}`,
  })),
};

export default function DeInsightsPage() {
  const sc = de.insightsPage.scanCta;
  return (
    <>
      <JsonLd
        data={[
          insightsCollectionSchema,
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: "Insights", path: "/insights" },
          ]),
        ]}
      />
      <Nav />
      <main>
        <IntelHero />
        <FanOut />
        <Observatory />
        <SignalMarquee />
        <FieldNotes />
        <ScanCTA
          index="05"
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
