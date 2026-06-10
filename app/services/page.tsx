import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ServicesHero from "@/components/services/ServicesHero";
import SystemStatement from "@/components/services/SystemStatement";
import OperatingRooms from "@/components/services/OperatingRooms";
import DiagnosisCTA from "@/components/services/DiagnosisCTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Services — The Visibility Operating Room | SEESZN",
  description:
    "One system that diagnoses, rebuilds and controls modern visibility: SEO, AI Search (GEO / AIO), websites and audits — built as the surfaces machines retrieve and people trust.",
  openGraph: {
    title: "SEESZN — The Visibility Operating Room",
    description:
      "Visibility breaks before the customer sees you. SEO, AI Search, websites and audits — built as one visibility system.",
    siteName: "SEESZN",
  },
};

export default function ServicesPage() {
  return (
    <>
      <Nav />
      <main>
        <ServicesHero />
        <SystemStatement />
        <OperatingRooms />
        <DiagnosisCTA />
      </main>
      <Footer />
    </>
  );
}
