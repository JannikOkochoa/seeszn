import type { Metadata } from "next";
import BriefLanding from "./BriefLanding";

export const metadata: Metadata = {
  title: "KI-Sichtbarkeits-Brief 2026 — SEESZN Research Brief",
  description:
    "Warum gute B2B-Firmen in KI-Suchen unsichtbar werden. Ein unabhängiger Leitfaden für Marken, die gefunden, verstanden und zitiert werden wollen. 20 Seiten, 5-Ebenen-Modell, Checkliste.",
  openGraph: {
    title: "KI-Sichtbarkeits-Brief 2026",
    description:
      "Warum gute B2B-Firmen in KI-Suchen unsichtbar werden — ein unabhängiger strategischer Leitfaden von SEESZN.",
    siteName: "SEESZN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BriefPage() {
  return <BriefLanding />;
}
