import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import CaseStudyPage from "@/components/case-studies/CaseStudyPage";
import { en } from "@/lib/case-studies/en";
import { caseMetadata, caseJsonLd } from "@/lib/case-studies/meta";

// ─── Case study: SEO + AIO in tourism — English edition ──────────────────────
// Shares layout, motion and metadata logic with the German page at
// /case-studies/seo-aio-tourismus. Only the content differs. The document
// language comes from app/en/layout.tsx, which applies to the whole /en tree.

export const metadata: Metadata = caseMetadata(en);

export default function Page() {
  return (
    <>
      <JsonLd data={caseJsonLd(en)} />
      <CaseStudyPage content={en} />
      {/* The headline finding, also machine readable. Identical to the visible
          sentence in section 06, not an additional claim. */}
      <p className="tc-sr">{en.result.statement}</p>
    </>
  );
}
