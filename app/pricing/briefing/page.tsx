// ─── /pricing/briefing ────────────────────────────────────────────────────────
// Die deutsche Rückkehr aus Stripe. Aufbau und Verhalten liegen in der
// geteilten Komponente, die Sprache im Wörterbuch.
//
// noindex: diese Seite hat nur für den Käufer einen Sinn und trägt eine
// Sitzungs-ID in der Adresse. Sie gehört weder in den Index noch in die
// Sitemap.

import type { Metadata } from "next";
import { briefingPage } from "@/components/moves/pricing/BriefingPage";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Briefing | SEESZN",
  description: "Die Angaben, mit denen SEESZN nach dem Kauf beginnt.",
  path: "/pricing/briefing",
  locale: "de",
  noindex: true,
});

export default briefingPage("de");
