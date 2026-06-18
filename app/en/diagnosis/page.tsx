import type { Metadata } from "next";
import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import IntakeForm from "@/components/diagnosis/IntakeForm";
import ScanProtocol from "@/components/diagnosis/ScanProtocol";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { en } from "@/lib/i18n/en";
import { buildMetadata, serviceSchema, breadcrumbSchema, faqSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Check brand visibility — AI Visibility Diagnosis | SEESZN",
  description:
    "The SEESZN visibility diagnosis checks where your B2B brand is missing, misread or uncited in Google and AI answers — ChatGPT, Perplexity, Gemini and Google AI Overviews. Not a generic SEO audit: a GEO/AIO diagnosis with prioritized next steps.",
  path: "/en/diagnosis",
  locale: "en",
  altPath: "/diagnosis",
});

export default function DiagnosisPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "AI Visibility Audit & Search Diagnosis",
            description:
              "We diagnose where a B2B brand is missing, misread or uncited in Google and in AI answers (ChatGPT, Perplexity, Gemini, Google AI Overviews) — with a prioritized roadmap.",
            path: "/en/diagnosis",
            serviceType: "AI Visibility Audit",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/en" },
            { name: "Diagnosis", path: "/en/diagnosis" },
          ]),
          faqSchema(en.diagnosisPage.faq.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <Nav />
      <main>
        <RoomHero
          index="01"
          room="DIAGNOSIS / SCAN ROOM"
          accession="SZN-VP-01"
          roman={["BEFORE WE BUILD,", "WE LOCATE"]}
          italic="the leak."
          sub={[
            "A DIAGNOSIS, NOT A PITCH.",
            "WE MAP WHERE YOUR BRAND IS MISSING OR MISREAD",
            "IN GOOGLE AND IN AI ANSWERS — BEFORE WE BUILD.",
          ]}
          meta="THE SCAN ROOM"
          panel={<IntakeForm />}
        />
        <ScanProtocol />
      </main>
      <Footer />
    </>
  );
}
