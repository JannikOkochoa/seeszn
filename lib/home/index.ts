// ─── Startseite: Zugriff auf die Copy ─────────────────────────────────────────
// Eine Stelle, an der eine Sprachfassung ausgewählt wird. Die Komponenten
// bekommen den fertigen Datensatz als Prop und kennen keine Sprachbedingung.

import { homeDe } from "./de";
import { homeEn } from "./en";
import type { HomeContent } from "./types";

/** Sprungziel der Prüfung auf beiden Startseiten. */
export const HOME_SCAN_ANCHOR = "pruefung";
/** Sprungziel des Angebots auf beiden Startseiten. */
export const HOME_OFFER_ANCHOR = "angebot";

export type HomeLocale = HomeContent["locale"];

export function homeContent(locale: HomeLocale): HomeContent {
  return locale === "en" ? homeEn : homeDe;
}

export type { HomeContent } from "./types";
