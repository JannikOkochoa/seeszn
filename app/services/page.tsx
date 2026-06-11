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

export const metadata: Metadata = {
  title: "Discover — The SEESZN Visibility System",
  description:
    "Visibility systems for brands entering machine memory. SEESZN connects search architecture, AI retrieval, digital surfaces and diagnosis into one operating system.",
  openGraph: {
    title: "SEESZN — Discover the Visibility System",
    description:
      "We build the surfaces machines retrieve and people trust. Search, AI visibility, websites and diagnosis — one operating system.",
    siteName: "SEESZN",
  },
};

export default function ServicesPage() {
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
