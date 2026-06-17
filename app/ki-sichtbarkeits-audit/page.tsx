import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import { LANDING_PAGES } from "@/lib/landing";
import { buildMetadata } from "@/lib/seo";

const PAGE = LANDING_PAGES["ki-sichtbarkeits-audit"];

export const metadata: Metadata = buildMetadata({
  title: PAGE.meta.title,
  description: PAGE.meta.description,
  path: "/ki-sichtbarkeits-audit",
  locale: "de",
});

export default function Page() {
  return <LandingPage page={PAGE} />;
}
