// ─── First Move: Analytics-Brücke ─────────────────────────────────────────────
// Die öffentliche Website lädt derzeit kein eigenes Tracking-Skript und hat kein
// eigenes Consent-Banner. Deshalb bringt diese Datei bewusst KEIN neues Skript
// mit und lädt nichts nach.
//
// Sie schreibt in die Kanäle, die ohnehin da sind, sobald sie da sind:
//   - window.dataLayer  (Google Tag Manager, falls über hPanel eingebunden)
//   - window.gtag       (Google Tag, falls eingebunden)
// Ist keiner davon vorhanden, ist jeder Aufruf ein No-op. Es entsteht kein
// Netzwerkverkehr und keine Speicherung.
//
// Payloads enthalten nur Produktzustände: Route, Zustand, Budgetband, Schritt.
// Nie E-Mail, Name, Nachricht oder vollständige URL einer Kundenseite.

/**
 * Alle Ereignisse des First-Move-Funnels. Die V5-Namen bleiben unverändert,
 * damit bestehende Auswertungen weiterlaufen.
 *
 * V6 benennt die beiden Abschlussereignisse um. Es gibt keinen Online-Checkout,
 * also heißen sie auch nicht so:
 *   - `first_move_request_start`  der Besucher beginnt die verbindliche Anfrage
 *   - `first_move_request_submit` die Anfrage ist beim Backend angekommen
 * Eine gesendete Anfrage ist kein Kauf, keine Zahlung und keine Conversion zum
 * zahlenden Kunden. Die alten Namen `checkout_start` und `checkout_complete`
 * gelten nur noch als historische Referenz in den V5-Dokumenten.
 *
 * V6 ergänzt außerdem zwei Ereignisse und eine Dimension:
 *   - `offer_view`   das kommerzielle Angebot war sichtbar
 *   - `proof_expand` der Besucher hat weitere Ergebnisse geöffnet
 *   - `lane`         "discovery" (über den Scan) oder "fast" (direkt zum Angebot)
 *
 * Mit dem Funnel-Umbau im August 2026 kommen die Schritte der neuen Journey
 * dazu. Zwei Änderungen sind dabei wichtig:
 *
 *   - `route_select` ist ersatzlos entfallen. Der Funnel fragt den Besucher
 *     nicht mehr, in welchem Kanal er sein Problem vermutet. An seiner Stelle
 *     steht `first_move_business_context_selected`: eine Geschäftslage, keine
 *     Serviceauswahl.
 *   - `first_move_result_classified` trägt die Ergebniskategorie und die
 *     Ergebnisart. Damit ist auswertbar, wie oft die Prüfung in HIDDEN_SIGNAL
 *     endet, und ob dieser Zustand schlechter konvertiert als ein Befund. Das
 *     war vorher nicht messbar, weil beide Fälle gleich aussahen.
 *
 * Für "das Angebot war sichtbar" und "die Anfrage beginnt" gibt es bewusst
 * keine neuen Namen: `offer_view` und `first_move_request_start` messen genau
 * das und laufen seit V6. Ein zweiter Name für dasselbe Ereignis hätte jede
 * bestehende Auswertung halbiert.
 *
 * Kein Ereignis trägt PII. Domain, E-Mail und Name bleiben draußen.
 */
export type FirstMoveEvent =
  | "first_move_view"
  | "domain_submit"
  | "spend_band_select"
  | "public_scan_start"
  | "public_scan_signal"
  | "public_scan_complete"
  | "finding_view"
  | "evidence_expand"
  // ── Die Schritte der Journey ──────────────────────────────────────────────
  | "first_move_result_classified"
  | "first_move_result_viewed"
  | "first_move_result_continue_clicked"
  | "first_move_business_context_selected"
  | "first_move_data_step_viewed"
  | "first_move_data_connection_started"
  | "first_move_continue_without_data"
  | "first_move_recommendation_generated"
  | "first_move_recommendation_viewed"
  | "proof_expand"
  | "offer_view"
  | "paid_connect_click"
  | "implementation_check_start"
  | "fit_check_step"
  | "fit_check_complete"
  | "first_move_request_start"
  | "first_move_request_submit";

type Payload = Record<string, string | number | boolean | undefined>;

interface TrackingWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (command: string, eventName: string, params?: Payload) => void;
}

/**
 * Meldet ein Funnel-Ereignis. Ohne vorhandenes Tag-System passiert nichts.
 * Wirft nie: ein Analytics-Fehler darf keinen Kaufschritt blockieren.
 */
export function track(event: FirstMoveEvent, payload: Payload = {}): void {
  if (typeof window === "undefined") return;
  const w = window as TrackingWindow;
  const params: Payload = { product: "first_move", ...payload };

  try {
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...params });
    }
    if (typeof w.gtag === "function") {
      w.gtag("event", event, params);
    }
  } catch {
    /* Analytics ist nie kaufkritisch */
  }
}
