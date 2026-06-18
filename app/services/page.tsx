import Nav from "@/components/Nav";
import ServicesHero from "@/components/services/ServicesHero";
import DiscoverMarquee from "@/components/services/DiscoverMarquee";
import SystemStatement from "@/components/services/SystemStatement";
import OperatingRooms from "@/components/services/OperatingRooms";
import MachineMemory from "@/components/services/MachineMemory";
import ScanSection from "@/components/services/ScanSection";
import DiagnosisCTA from "@/components/services/DiagnosisCTA";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";
import { buildMetadata, serviceSchema, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Leistungen: Das SEESZN Sichtbarkeitssystem | SEESZN",
  description:
    "SEESZN verbindet SEO-Architektur, AI-Retrieval (GEO/AIO), Website-Entwicklung und Diagnose zu einem Sichtbarkeitssystem für B2B-Marken im DACH-Raum.",
  path: "/services",
  locale: "de",
  altPath: "/en/services",
});

export default function DeServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "SEESZN Sichtbarkeitssystem: SEO, GEO & AIO",
            description:
              "SEO-Architektur, AI-Retrieval (GEO/AIO), Website-Entwicklung und Diagnose als ein Sichtbarkeitssystem für B2B-Marken in Google, ChatGPT, Perplexity, Gemini und Google AI Overviews.",
            path: "/services",
            serviceType:
              "SEO, Generative Engine Optimization (GEO) & Answer Engine Optimization (AIO)",
          }),
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: "Leistungen", path: "/services" },
          ]),
        ]}
      />
      <Nav />
      <main>
        <ServicesHero />
        <DiscoverMarquee />
        <SystemStatement />
        <OperatingRooms />
        <MachineMemory />
        <ScanSection />
        <DiagnosisCTA />
      </main>
      <Footer />
    </>
  );
}
