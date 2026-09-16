// ─── MOVES: Analytics-Brücke ──────────────────────────────────────────────────
// Dieselbe Mechanik wie lib/first-move/analytics.ts und bewusst kein zweites
// Tracking-System: geschrieben wird in window.dataLayer und window.gtag, sofern
// vorhanden. Fehlt beides, ist jeder Aufruf ein No-op ohne Netzwerkverkehr.
//
// Payloads tragen nur Produktzustände: Fläche, Kaufart, Produktschlüssel,
// Schritt. Nie Domain, E-Mail, Name oder Inhalt eines Briefings.

export type MovesEvent =
  /** Die Preisfläche wurde gesehen. */
  | "pricing_view"
  /** Die Übersichtsseite wurde gesehen. */
  | "moves_view"
  /** Der First-Move-Weg wurde aus der Preisfläche heraus begonnen. */
  | "first_move_scan_started"
  /** Der Beleg zu First Move wurde geöffnet. */
  | "first_move_proof_opened"
  /** Menge, Abrechnung, Format oder Markt im Rechner geändert. */
  | "backlink_quantity_changed"
  | "backlink_billing_changed"
  | "backlink_format_changed"
  | "backlink_market_changed"
  /** Die Bestellübersicht vor der Zahlung wurde geöffnet. */
  | "backlink_review_opened"
  /** Über 100: der Weg in die Preisanfrage statt in die Zahlung. */
  | "backlink_custom_opened"
  | "backlink_custom_requested"
  /**
   * Die kostenlose Mengenempfehlung. Diese Ereignisse tragen niemals die
   * Mailadresse und niemals die Domain: beides ist personenbeziehbar, und für
   * die Auswertung reicht, dass eine Anfrage stattgefunden hat.
   */
  | "pricing_recommendation_opened"
  | "pricing_recommendation_submitted"
  | "pricing_recommendation_success"
  | "pricing_recommendation_error"
  /** Der Kernfunnel der Preisfläche, sprachunabhängig benannt. */
  | "pricing_quantity_changed"
  | "pricing_billing_changed"
  | "pricing_format_changed"
  | "pricing_market_changed"
  | "pricing_custom_100plus_selected"
  | "pricing_checkout_started"
  /** Eine Produktseite wurde gesehen. */
  | "product_view"
  /** Auf der Preisfläche wurde zwischen First Move und Backlinks gewechselt. */
  | "pricing_product_selected"
  /** Der Besucher hat die Kaufart gewechselt. */
  | "pricing_mode_selected"
  /** Der Kauf wurde ausgelöst, die Sitzung wird angelegt. */
  | "checkout_started"
  /** Stripe ist nicht konfiguriert oder hat abgelehnt. Wichtig für die Diagnose. */
  | "checkout_unavailable"
  /** Rückkehr aus Stripe auf die Bestätigungsseite. */
  | "checkout_completed"
  /** SYSTEM wurde gewählt, also der Weg über die Prüfung. */
  | "custom_strategy_clicked"
  /** Ein Beleg wurde aufgeklappt. */
  | "case_study_opened"
  /** Eine FAQ-Frage wurde geöffnet. */
  | "faq_opened"
  /** Die kontextuelle Erweiterung wurde angenommen. */
  | "extension_selected"
  /** Das Briefing nach dem Kauf hat begonnen. */
  | "brief_started"
  /** Das Briefing ist beim Backend angekommen. */
  | "brief_completed";

type Payload = Record<string, string | number | boolean | undefined>;

interface TrackingWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (command: string, eventName: string, params?: Payload) => void;
}

/** Meldet ein MOVES-Ereignis. Wirft nie: Analytics ist nie kaufkritisch. */
export function track(event: MovesEvent, payload: Payload = {}): void {
  if (typeof window === "undefined") return;
  const w = window as TrackingWindow;
  const params: Payload = { product: "moves", ...payload };

  try {
    if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...params });
    if (typeof w.gtag === "function") w.gtag("event", event, params);
  } catch {
    /* Analytics darf keinen Kaufschritt blockieren */
  }
}
