import Nav from "@/components/Nav";
import ServicesHero from "@/components/services/ServicesHero";
import DiscoverMarquee from "@/components/services/DiscoverMarquee";
import SystemStatement from "@/components/services/SystemStatement";
import OperatingRooms from "@/components/services/OperatingRooms";
import MachineMemory from "@/components/services/MachineMemory";
import ScanSection from "@/components/services/ScanSection";
import DiagnosisCTA from "@/components/services/DiagnosisCTA";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Leistungen — Das SEESZN Sichtbarkeitssystem | SEESZN",
  description:
    "SEESZN verbindet SEO-Architektur, AI-Retrieval (GEO/AIO), Website-Entwicklung und Diagnose zu einem Sichtbarkeitssystem für B2B-Marken im DACH-Raum.",
  path: "/services",
  locale: "de",
  altPath: "/en/services",
});

export default function DeServicesPage() {
  return (
    <>
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
