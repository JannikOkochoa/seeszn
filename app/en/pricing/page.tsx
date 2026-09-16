// ─── /en/pricing ──────────────────────────────────────────────────────────────
// Die englische Preisfläche. Dieselbe Komponente, dasselbe Verhalten, dieselben
// Preisfunktionen; nur die Sprache und der Pfad unterscheiden sich.

import type { Metadata } from "next";
import { pricingPage } from "@/components/moves/pricing/PricingPage";
import { pricingMetadata } from "@/lib/moves/pricingMeta";

export const metadata: Metadata = pricingMetadata("en");

export default pricingPage("en");
