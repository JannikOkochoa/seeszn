// ─── /en/pricing/briefing ──────────────────────────────────────────────────────
// The English return from Stripe. Same shared component, same behaviour, only
// the language differs. Reached exclusively from an English checkout, since
// the Stripe success URL is chosen by the locale that started the purchase.
//
// noindex: this page only makes sense to the buyer plus carries a session id
// in the address. It belongs neither in the index nor in the sitemap.

import type { Metadata } from "next";
import { briefingPage } from "@/components/moves/pricing/BriefingPage";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Briefing | SEESZN",
  description: "The details SEESZN needs to start work after purchase.",
  path: "/en/pricing/briefing",
  locale: "en",
  noindex: true,
});

export default briefingPage("en");
