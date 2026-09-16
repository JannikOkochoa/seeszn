// ─── /pricing ─────────────────────────────────────────────────────────────────
// Die deutsche Preisfläche. Aufbau und Verhalten liegen in der geteilten
// Komponente, die Sprache im Wörterbuch. Diese Datei setzt nur die Sprache, den
// Pfad und die Metadaten.

import type { Metadata } from "next";
import { pricingPage } from "@/components/moves/pricing/PricingPage";
import { pricingMetadata } from "@/lib/moves/pricingMeta";

export const metadata: Metadata = pricingMetadata("de");

export default pricingPage("de");
