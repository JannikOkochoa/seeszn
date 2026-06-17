import type { Metadata } from "next";
import CasePage from "@/components/landing/CasePage";
import { CASES } from "@/lib/cases";
import { buildMetadata } from "@/lib/seo";

const STUDY = CASES["sivius"];

export const metadata: Metadata = buildMetadata({
  title: STUDY.meta.title,
  description: STUDY.meta.description,
  path: "/cases/sivius",
  locale: "de",
  type: "article",
});

export default function Page() {
  return <CasePage study={STUDY} />;
}
