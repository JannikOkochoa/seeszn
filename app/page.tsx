import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ScrollReset from "@/components/ScrollReset";
import TheShift from "@/components/TheShift";
import Services from "@/components/Services";
import AbsenceIndex from "@/components/AbsenceIndex";
import Cases from "@/components/Cases";
import BuiltFor from "@/components/home/BuiltFor";
import Manifesto from "@/components/Manifesto";
import HomeFaqDe from "@/components/home/HomeFaqDe";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "KI-Sichtbarkeit & SEO für B2B-Marken | SEESZN",
  description:
    "SEESZN macht B2B-Marken sichtbar in Google, ChatGPT, Perplexity, Gemini und AI Overviews. SEO, GEO, AIO, Content-Architektur und KI-Sichtbarkeits-Audits.",
  path: "/",
  locale: "de",
  altPath: "/en",
});

export default function DeHomePage() {
  return (
    <>
      <ScrollReset />
      <Nav />
      <main>
        <Hero />
        <TheShift />
        <Services />
        <AbsenceIndex />
        <Cases />
        <BuiltFor />
        <Manifesto />
        <HomeFaqDe />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
