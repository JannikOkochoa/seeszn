import Nav from "@/components/Nav";
import ServicesHero from "@/components/services/ServicesHero";
import DiscoverMarquee from "@/components/services/DiscoverMarquee";
import SystemStatement from "@/components/services/SystemStatement";
import OperatingRooms from "@/components/services/OperatingRooms";
import MachineMemory from "@/components/services/MachineMemory";
import ScanSection from "@/components/services/ScanSection";
import DiagnosisCTA from "@/components/services/DiagnosisCTA";
import Footer from "@/components/Footer";

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
