// ─── Die fünf Stufen der laufenden Prüfung ────────────────────────────────────
// Welche Serverzustände zu welcher sichtbaren Stufe gehören, ist keine Copy: es
// ist die Zuordnung zwischen Protokoll und Anzeige. Sie steht deshalb einmal
// hier und wird von beiden Sprachfassungen gelesen, damit eine neue Sprache die
// Zuordnung nicht versehentlich verschiebt.
//
// Eine Stufe gilt erst als erreicht, wenn der Server einen ihrer Zustände
// gemeldet hat. Es gibt keinen Timer und keinen Prozentwert.

export const SCAN_STAGE_STATES: readonly (readonly string[])[] = [
  ["normalizing_domain", "domain_reachable"],
  ["robots_checked", "sitemap_checked", "scope_detected"],
  ["public_pages_read", "technical_signals_checked"],
  ["semantic_patterns_found"],
  ["finding_qualifying", "public_finding_ready", "finding_ready", "not_qualified"],
];
