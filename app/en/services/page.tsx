import type { Metadata } from "next";
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
import { buildMetadata, serviceSchema, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Discover — The SEESZN Visibility System | SEESZN",
  description:
    "Visibility systems for brands entering machine memory. SEESZN connects search architecture, AI retrieval, digital surfaces and diagnosis into one operating system.",
  path: "/en/services",
  locale: "en",
  altPath: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "SEESZN Visibility System — SEO, GEO & AIO",
            description:
              "Search architecture, AI retrieval (GEO/AIO), website development and diagnosis as one visibility system for B2B brands across Google, ChatGPT, Perplexity, Gemini and Google AI Overviews.",
            path: "/en/services",
            serviceType:
              "SEO, Generative Engine Optimization (GEO) & Answer Engine Optimization (AIO)",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/en" },
            { name: "Discover", path: "/en/services" },
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
