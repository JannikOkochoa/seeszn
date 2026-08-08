import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import CaseStudyPage from "@/components/case-studies/CaseStudyPage";
import { de } from "@/lib/case-studies/de";
import { caseMetadata, caseJsonLd } from "@/lib/case-studies/meta";

// ─── Case Study: SEO + AIO im Tourismus — deutsche Fassung ───────────────────
// Aufbau, Motion und Metadatenlogik teilt sich diese Route mit der englischen
// Schwesterseite unter /en/case-studies/seo-aio-tourism. Unterschiedlich ist
// nur der Inhalt.

export const metadata: Metadata = caseMetadata(de);

export default function Page() {
  return (
    <>
      <JsonLd data={caseJsonLd(de)} />
      <CaseStudyPage content={de} />
      {/* Kernaussage zusätzlich maschinenlesbar — identisch zum sichtbaren
          Satz in Abschnitt 06, kein zusätzlicher Claim. */}
      <p className="tc-sr">{de.result.statement}</p>
    </>
  );
}
