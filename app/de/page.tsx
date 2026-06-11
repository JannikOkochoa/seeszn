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
        <Manifesto />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
