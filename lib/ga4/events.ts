// ─── GA4-Events: zentrale fachliche Einordnung ────────────────────────────────
// Die einzige Stelle, an der festgelegt ist, welches GA4-Event als Lead zählt.
// Bewusst keine verstreuten Eventnamen im Code und keine Ableitung aus der
// GA4-eigenen Key-Event-Markierung.
//
// Warum nicht die GA4-Markierung: In dieser Property sind 15 Events als Key
// Event markiert, darunter reine Klick- und Navigationsereignisse
// (reisefinder_liste, first_lvl_link, cta_header_*). Die GA4-Metrik keyEvents
// zählt über 5.000 Ereignisse in 28 Tagen – als "Leads" gelesen wäre das um
// zwei Größenordnungen falsch. Ein Lead ist hier ausschließlich eine
// tatsächlich abgeschickte Anfrage.
//
// Alle Namen unten stammen aus dem Event-Audit der Property (28 Tage), nicht
// aus Annahmen.

export type EventCategory =
  /** Echter Geschäftsabschluss: eine abgeschickte Anfrage. */
  | "primary_conversion"
  /** Ernsthafte Kontaktaufnahme, aber nicht der Hauptabschluss. */
  | "secondary_conversion"
  /** Interaktion, die Interesse zeigt, aber kein Abschluss ist. */
  | "engagement"
  /** Automatisch erfasste Basisereignisse ohne fachliche Aussage. */
  | "system";

export interface Ga4EventSpec {
  name: string;
  category: EventCategory;
  /** Ein Satz, warum das Event so eingeordnet ist. */
  rationale: string;
}

/**
 * Das Event, das einen Lead darstellt: der letzte Schritt der Anfragestrecke.
 * Die Strecke ist im Audit klar erkennbar (step0_anfrage_form_start → step1 …
 * → step9_anfrage_abgeschickt), und nur der letzte Schritt bedeutet, dass die
 * Anfrage tatsächlich raus ist.
 */
export const PRIMARY_CONVERSION_EVENT = "step9_anfrage_abgeschickt";

/** Abgeschicktes Kontaktformular: echte Kontaktaufnahme, aber keine Reiseanfrage. */
export const SECONDARY_CONVERSION_EVENT = "kontaktformular_abgeschickt";

/** Beide Abschluss-Events; nur diese werden je Seite mitsynchronisiert. */
export const CONVERSION_EVENTS: readonly string[] = [
  PRIMARY_CONVERSION_EVENT,
  SECONDARY_CONVERSION_EVENT,
];

/**
 * Fachliche Einordnung der in der Property vorhandenen Events. Ein Event, das
 * hier fehlt, wird als "engagement" behandelt, wenn es in GA4 als Key Event
 * markiert ist, sonst als "system" – geraten wird nichts, die Einordnung ist
 * nur eine Empfehlung für die Audit-Ansicht.
 */
export const EVENT_SPECS: readonly Ga4EventSpec[] = [
  {
    name: PRIMARY_CONVERSION_EVENT,
    category: "primary_conversion",
    rationale: "Letzter Schritt der Anfragestrecke: die Anfrage ist abgeschickt.",
  },
  {
    name: SECONDARY_CONVERSION_EVENT,
    category: "secondary_conversion",
    rationale: "Abgeschicktes Kontaktformular – echte Kontaktaufnahme, keine Reiseanfrage.",
  },
  { name: "step0_anfrage_form_start", category: "engagement", rationale: "Einstieg in die Anfragestrecke, noch kein Abschluss." },
  { name: "step1_anfrage_reisetyp", category: "engagement", rationale: "Zwischenschritt der Anfragestrecke." },
  { name: "step2_anfrage_reiseort", category: "engagement", rationale: "Zwischenschritt der Anfragestrecke." },
  { name: "step3_anfrage_thema", category: "engagement", rationale: "Zwischenschritt der Anfragestrecke." },
  { name: "step3_anfrage_travel_done", category: "engagement", rationale: "Zwischenschritt der Anfragestrecke." },
  { name: "step4_anfrage_add_to_cart", category: "engagement", rationale: "Zwischenschritt der Anfragestrecke." },
  { name: "step5_anfrage_abschließen", category: "engagement", rationale: "Zwischenschritt der Anfragestrecke." },
  { name: "step6_anfrage_datum", category: "engagement", rationale: "Zwischenschritt der Anfragestrecke." },
  { name: "step7_anfrage_teilnehmer", category: "engagement", rationale: "Zwischenschritt der Anfragestrecke." },
  { name: "step8_anfrage_kontankdaten", category: "engagement", rationale: "Zwischenschritt der Anfragestrecke." },
  { name: "add_to_cart", category: "engagement", rationale: "Reise gemerkt – Kaufabsicht, kein Abschluss." },
  { name: "reisefinder_reiseanfrage", category: "engagement", rationale: "Anfrage aus dem Reisefinder gestartet, nicht abgeschlossen." },
  { name: "reisefinder_liste", category: "engagement", rationale: "Nutzung des Reisefinders – Navigationsereignis." },
  { name: "reisefinder_karte", category: "engagement", rationale: "Nutzung des Reisefinders – Navigationsereignis." },
  { name: "klick_tel_nummer", category: "secondary_conversion", rationale: "Telefonklick: direkte Kontaktaufnahme." },
  { name: "click_anrufbutton_reise", category: "secondary_conversion", rationale: "Anrufbutton: direkte Kontaktaufnahme." },
  { name: "file_download", category: "engagement", rationale: "Download, z. B. Broschüre – Interesse, kein Abschluss." },
  { name: "cta_header_reisebarater_link", category: "engagement", rationale: "CTA-Klick, kein Abschluss." },
  { name: "cta_header_allgemeiner_link", category: "engagement", rationale: "CTA-Klick, kein Abschluss." },
  { name: "first_lvl_link", category: "engagement", rationale: "Navigationsklick." },
  { name: "second_lvl_link", category: "engagement", rationale: "Navigationsklick." },
  { name: "third_lvl_link", category: "engagement", rationale: "Navigationsklick." },
  { name: "footer_click", category: "engagement", rationale: "Navigationsklick." },
  { name: "view_search_results", category: "engagement", rationale: "Suchergebnisse angesehen." },
  { name: "page_view", category: "system", rationale: "Automatisch erfasst." },
  { name: "session_start", category: "system", rationale: "Automatisch erfasst." },
  { name: "first_visit", category: "system", rationale: "Automatisch erfasst." },
  { name: "user_engagement", category: "system", rationale: "Automatisch erfasst." },
  { name: "scroll", category: "system", rationale: "Automatisch erfasst." },
];

const SPEC_BY_NAME = new Map(EVENT_SPECS.map((s) => [s.name, s]));

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  primary_conversion: "PRIMARY CONVERSION",
  secondary_conversion: "SECONDARY CONVERSION",
  engagement: "ENGAGEMENT EVENT",
  system: "IRRELEVANT / SYSTEM",
};

/**
 * Empfohlene Einordnung eines Events. Unbekannte Events werden nicht geraten:
 * sie gelten als Engagement, wenn GA4 sie als Key Event führt, sonst als
 * System – und sind an der fehlenden Begründung als "nicht eingeordnet"
 * erkennbar.
 */
export function categorizeEvent(
  name: string,
  isKeyEventInGa4: boolean,
): { category: EventCategory; rationale: string | null } {
  const spec = SPEC_BY_NAME.get(name);
  if (spec) return { category: spec.category, rationale: spec.rationale };
  return {
    category: isKeyEventInGa4 ? "engagement" : "system",
    rationale: null,
  };
}
