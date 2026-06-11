import Nav from "@/components/Nav";
import ServicesHero from "@/components/services/ServicesHero";
import SystemStatement from "@/components/services/SystemStatement";
import OperatingRooms from "@/components/services/OperatingRooms";
import DiagnosisCTA from "@/components/services/DiagnosisCTA";
import Footer from "@/components/Footer";

export default function DeServicesPage() {
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
