import Nav from "@/components/Nav";
import RoomHero from "@/components/rooms/RoomHero";
import IntakeForm from "@/components/diagnosis/IntakeForm";
import ScanProtocol from "@/components/diagnosis/ScanProtocol";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { de } from "@/lib/i18n/de";
import type { Metadata } from "next";
import { buildMetadata, serviceSchema, breadcrumbSchema, faqSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sichtbarkeit prüfen: KI-Sichtbarkeits-Diagnose | SEESZN",
  description:
    "Die SEESZN Sichtbarkeits-Diagnose prüft, wo deine B2B-Marke in Google und KI-Antworten wie ChatGPT, Perplexity, Gemini und Google AI Overviews fehlt, falsch gelesen oder nicht zitiert wird. Kein generisches SEO-Audit, sondern eine GEO-/AIO-Diagnose mit priorisierten Maßnahmen.",
  path: "/diagnosis",
  locale: "de",
  altPath: "/en/diagnosis",
});

export default function DeDiagnosisPage() {
  const h = de.diagnosisPage.hero;
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "KI-Sichtbarkeits-Audit & Search-Diagnose",
            description:
              "Diagnose, wo eine B2B-Marke in Google und in KI-Antworten (ChatGPT, Perplexity, Gemini, Google AI Overviews) fehlt, falsch gelesen oder nicht zitiert wird, mit priorisierter Roadmap.",
            path: "/diagnosis",
            serviceType: "KI-Sichtbarkeits-Audit",
          }),
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: "Diagnose", path: "/diagnosis" },
          ]),
          faqSchema(de.diagnosisPage.faq.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <Nav />
      <main>
        <RoomHero
          index="01"
          room={h.room}
          accession={h.accession}
          roman={[...h.roman]}
          italic={h.italic}
          sub={[...h.sub]}
          meta={h.meta}
          panel={<IntakeForm />}
        />
        <ScanProtocol />
      </main>
      <Footer />
    </>
  );
}
