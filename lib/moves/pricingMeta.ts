// ─── PREISE: Metadaten und Sprachbeziehungen ──────────────────────────────────
// Eine Stelle für Titel, Beschreibung, Canonical und hreflang beider Fassungen.
// buildMetadata aus lib/seo setzt daraus die vollständige Beziehung: self
// canonical je Sprache, de und en über Kreuz, x-default auf die deutsche
// Fassung, wie überall sonst auf dieser Website.

import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SCAN_ANCHOR } from "@/lib/links";
import { EN_MASTER_PATH, MASTER_PATH } from "@/lib/first-move/product";
import type { MovesLocale } from "./i18n";

export const PRICING_PATH: Record<MovesLocale, string> = {
  de: "/pricing",
  en: "/en/pricing",
};

const META: Record<MovesLocale, { title: string; description: string }> = {
  de: {
    title: "Preise: First Move und Backlinks | SEESZN",
    description:
      "First Move zum Festpreis von 2.490 € netto. Backlinks ab 5 Platzierungen, jede exakte Menge bis 100. Monatspläne ab 10 mit drei Monaten Mindestlaufzeit.",
  },
  en: {
    title: "SEESZN Pricing | First Move + Backlinks",
    description:
      "First Move at a fixed price. Flexible backlinks from 5 placements, every exact quantity through 100. Monthly plans start at 10 with a 3 month minimum.",
  },
};

export function pricingMetadata(locale: MovesLocale): Metadata {
  const other: MovesLocale = locale === "de" ? "en" : "de";
  return buildMetadata({
    title: META[locale].title,
    description: META[locale].description,
    path: PRICING_PATH[locale],
    locale,
    altPath: PRICING_PATH[other],
  });
}

/**
 * Der Einstieg in die First-Move-Prüfung, je Sprache. Deutsch springt zum
 * eingebetteten Instrument auf der Produktseite, Englisch führt an den
 * Anfang der englischen Produktseite, die noch kein eingebettetes Instrument
 * mit eigenem Anker hat.
 */
export const PRICING_SCAN_HREF: Record<MovesLocale, string> = {
  de: `${MASTER_PATH}#${SCAN_ANCHOR}`,
  en: EN_MASTER_PATH,
};
