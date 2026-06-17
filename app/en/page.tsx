import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ScrollReset from "@/components/ScrollReset";
import TheShift from "@/components/TheShift";
import Services from "@/components/Services";
import AbsenceIndex from "@/components/AbsenceIndex";
import Cases from "@/components/Cases";
import Manifesto from "@/components/Manifesto";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "SEESZN — For brands that intend to be found.",
  description:
    "Visibility systems for brands entering machine memory. SEO, GEO and AIO for B2B brands — search architecture, AI retrieval, websites and diagnosis as one system.",
  path: "/en",
  locale: "en",
  altPath: "/",
});

export default function Home() {
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
        <Manifesto />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
