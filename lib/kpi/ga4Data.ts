// ─── GA4: Auswertung der gespeicherten Tageswerte ─────────────────────────────
// Reine, testbare Funktionen über ga4_daily_metrics. Kein server-only, keine
// eigene Zeitraumlogik: Die Perioden kommen von außen herein — in der Regel
// exakt dieselben, die das GSC-Modell berechnet hat.
//
// Warum das wichtig ist: Search Console und Analytics haben eigene
// Datenstände. Würde jede Quelle ihr Fenster selbst am eigenen letzten Tag
// verankern, verglichen die beiden Blöcke nebeneinander unterschiedliche
// Zeiträume — und niemand sähe es. Stattdessen rechnet GA4 über den GSC-
// Zeitraum und meldet mit daysWithData, wie viele Tage darin tatsächlich
// Daten haben.
//
// Zeitzone: GA4-Tage stehen in der Zeitzone der Property (Europe/Berlin), die
// Search Console bucht ihre Tage in Pacific Time. Ein "Tag" ist also nicht
// bitgenau derselbe Ausschnitt. Für Zeiträume ab einer Woche ist der Effekt
// vernachlässigbar; verschwiegen wird er trotzdem nicht (siehe UI-Hinweis).

import type { PeriodRange } from "./aggregate";

export interface Ga4DailyRow {
  scope_key: string;
  date: string;
  sessions: number;
  active_users: number;
  total_users: number;
  new_users: number;
  engaged_sessions: number;
  user_engagement_duration: number;
  screen_page_views: number;
  primary_conversions: number;
  secondary_conversions: number;
}

export interface Ga4Totals {
  /**
   * Additiv, mit einer bekannten Unschärfe von rund 0,2 %: GA4 ordnet eine
   * Sitzung ihrem Starttag zu, Sitzungen über Mitternacht erscheinen in einer
   * Tagesaufteilung deshalb in beiden Tagen. Gemessen an der Property.
   */
  sessions: number;
  /**
   * ACHTUNG: Tagessummen, keine eindeutigen Personen. Über 28 Tage liegen sie
   * gemessen 17,9 % (aktive) bzw. 32,7 % (gesamt) über dem, was GA4 für den
   * Zeitraum ausweist – dieselbe Person kommt an mehreren Tagen. Diese Werte
   * gehören deshalb NICHT als Nutzerzahl in die Oberfläche; sie stehen hier
   * für Tagesverläufe und spätere Auswertungen.
   */
  activeUsersDailySum: number;
  totalUsersDailySum: number;
  /**
   * Exakt additiv (gemessen: 0,0 % Abweichung) – jemand ist an genau einem Tag
   * neu. Das ist deshalb die einzige Nutzerzahl, die über einen Zeitraum
   * belastbar ist.
   */
  newUsers: number;
  engagedSessions: number;
  screenPageViews: number;
  primaryConversions: number;
  secondaryConversions: number;
  /** Anteil 0..1; aus den Summen, nicht als Mittelwert von Tagesraten. */
  engagementRate: number | null;
  /** Sekunden je Sitzung (GA4: durchschnittliche Interaktionszeit). */
  averageEngagementTime: number | null;
  /** Leads je Sitzung, Anteil 0..1. */
  conversionRate: number | null;
  /** Tage mit Daten im Zeitraum – macht Lücken sichtbar. */
  daysWithData: number;
}

export function ga4RowsForScope(rows: Ga4DailyRow[], scopeKey: string): Ga4DailyRow[] {
  return rows.filter((r) => r.scope_key === scopeKey).sort((a, b) => a.date.localeCompare(b.date));
}

/** Letzter Tag mit Sitzungen; Grundlage des Datenstands. */
export function ga4DataAsOf(rows: Ga4DailyRow[]): string | null {
  const withData = rows.filter((r) => Number(r.sessions) > 0);
  return withData.length > 0 ? withData[withData.length - 1].date : null;
}

export function ga4PeriodTotals(rows: Ga4DailyRow[], range: PeriodRange): Ga4Totals {
  let sessions = 0;
  let activeUsersDailySum = 0;
  let totalUsersDailySum = 0;
  let newUsers = 0;
  let engagedSessions = 0;
  let engagementDuration = 0;
  let screenPageViews = 0;
  let primaryConversions = 0;
  let secondaryConversions = 0;
  let daysWithData = 0;

  for (const row of rows) {
    if (row.date < range.from || row.date > range.to) continue;
    daysWithData += 1;
    sessions += Number(row.sessions);
    // Nicht additiv – siehe Ga4Totals. Wird summiert vorgehalten, aber nicht
    // als Nutzerzahl angezeigt.
    activeUsersDailySum += Number(row.active_users);
    totalUsersDailySum += Number(row.total_users);
    newUsers += Number(row.new_users);
    engagedSessions += Number(row.engaged_sessions);
    engagementDuration += Number(row.user_engagement_duration);
    screenPageViews += Number(row.screen_page_views);
    primaryConversions += Number(row.primary_conversions);
    secondaryConversions += Number(row.secondary_conversions);
  }

  return {
    sessions,
    activeUsersDailySum,
    totalUsersDailySum,
    newUsers,
    engagedSessions,
    screenPageViews,
    primaryConversions,
    secondaryConversions,
    engagementRate: sessions > 0 ? engagedSessions / sessions : null,
    averageEngagementTime: sessions > 0 ? engagementDuration / sessions : null,
    conversionRate: sessions > 0 ? primaryConversions / sessions : null,
    daysWithData,
  };
}

/* ── Anzeigemodelle ─────────────────────────────────────────────────────────── */

export interface Ga4MetricModel {
  key: string;
  label: string;
  value: string;
  previousValue: string;
  deltaPct: number | null;
  assessment: "better" | "worse" | "neutral";
  hint: string;
}

const de = (n: number, digits = 0) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: digits });

/** Sekunden als "2:14 Min." – Minuten sind hier lesbarer als 134 Sekunden. */
export function formatEngagementTime(seconds: number | null): string {
  if (seconds === null) return "–";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = String(total % 60).padStart(2, "0");
  return `${minutes}:${rest} Min.`;
}

function pctChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function model(
  key: string,
  label: string,
  hint: string,
  current: number | null,
  previous: number | null,
  format: (n: number) => string,
  betterWhen: "up" | "down" = "up",
): Ga4MetricModel {
  const pct = pctChange(current, previous);
  let assessment: Ga4MetricModel["assessment"] = "neutral";
  if (pct !== null && Math.abs(pct) > 0.05) {
    const improved = betterWhen === "up" ? pct > 0 : pct < 0;
    assessment = improved ? "better" : "worse";
  }
  return {
    key,
    label,
    hint,
    value: current === null ? "–" : format(current),
    previousValue: previous === null ? "–" : format(previous),
    deltaPct: pct,
    assessment,
  };
}

/** Traffic-Kennzahlen: was auf der Seite tatsächlich passiert ist. */
export function buildGa4TrafficMetrics(
  current: Ga4Totals,
  previous: Ga4Totals | null,
): Ga4MetricModel[] {
  const p = previous;
  return [
    model(
      "sessions",
      "Sitzungen",
      "Besuche auf dieser Seite, aus allen Kanälen – nicht nur aus Google.",
      current.sessions,
      p?.sessions ?? null,
      (n) => de(n),
    ),
    // Bewusst "Neue Nutzer" statt "Aktive Nutzer": Nur diese Zahl lässt sich
    // aus Tageswerten korrekt über einen Zeitraum summieren (nachgemessen:
    // exakte Übereinstimmung mit GA4). Aktive und gesamte Nutzer wären als
    // Tagessumme deutlich zu hoch und damit schlicht falsch.
    model(
      "newUsers",
      "Neue Nutzer",
      "Erstbesucher im Zeitraum. Eindeutige Nutzer insgesamt lassen sich aus Tageswerten nicht summieren.",
      current.newUsers,
      p?.newUsers ?? null,
      (n) => de(n),
    ),
    model(
      "engagementRate",
      "Engagement-Rate",
      "Anteil der Sitzungen, in denen wirklich etwas passiert ist.",
      current.engagementRate !== null ? current.engagementRate * 100 : null,
      p && p.engagementRate !== null ? p.engagementRate * 100 : null,
      (n) => `${de(n, 1)} %`,
    ),
    model(
      "averageEngagementTime",
      "Ø Interaktionszeit",
      "Wie lange eine Sitzung im Schnitt aktiv war.",
      current.averageEngagementTime,
      p?.averageEngagementTime ?? null,
      (n) => formatEngagementTime(n),
    ),
    model(
      "screenPageViews",
      "Seitenaufrufe",
      "Wie oft Seiten in diesen Sitzungen aufgerufen wurden.",
      current.screenPageViews,
      p?.screenPageViews ?? null,
      (n) => de(n),
    ),
  ];
}

/** Business-Kennzahlen: was am Ende dabei herauskommt. */
export function buildGa4ConversionMetrics(
  current: Ga4Totals,
  previous: Ga4Totals | null,
): Ga4MetricModel[] {
  const p = previous;
  return [
    model(
      "primaryConversions",
      "Anfragen (Leads)",
      "Tatsächlich abgeschickte Reiseanfragen – keine Klicks, keine Zwischenschritte.",
      current.primaryConversions,
      p?.primaryConversions ?? null,
      (n) => de(n),
    ),
    model(
      "conversionRate",
      "Anfrage-Rate",
      "Anteil der Sitzungen, aus denen eine abgeschickte Anfrage wurde.",
      current.conversionRate !== null ? current.conversionRate * 100 : null,
      p && p.conversionRate !== null ? p.conversionRate * 100 : null,
      (n) => `${de(n, 2)} %`,
    ),
    model(
      "secondaryConversions",
      "Kontaktformular",
      "Abgeschickte Kontaktformulare – Kontaktaufnahme ohne Reiseanfrage.",
      current.secondaryConversions,
      p?.secondaryConversions ?? null,
      (n) => de(n),
    ),
  ];
}

/* ── Zusammengesetztes Modell je Seite ──────────────────────────────────────── */

export interface Ga4PageModel {
  scopeKey: string;
  current: Ga4Totals;
  previous: Ga4Totals | null;
  traffic: Ga4MetricModel[];
  conversion: Ga4MetricModel[];
  /** Letzter Tag mit Sitzungen in diesem Scope. */
  dataAsOf: string | null;
  /** Zeitraum, über den gerechnet wurde – derselbe wie bei GSC. */
  range: PeriodRange;
  previousRange: PeriodRange | null;
  /** Tage ohne Daten im aktuellen Zeitraum; > 0 heißt Lücke. */
  missingDays: number;
}

function daysInRange(range: PeriodRange): number {
  return (
    Math.round(
      (Date.parse(`${range.to}T00:00:00Z`) - Date.parse(`${range.from}T00:00:00Z`)) / 86_400_000,
    ) + 1
  );
}

/**
 * Baut das GA4-Modell eines Scopes über GENAU die übergebenen Zeiträume.
 * Gibt null zurück, wenn im aktuellen Zeitraum keine einzige Zeile liegt —
 * dann gibt es nichts ehrlich anzuzeigen.
 */
export function buildGa4PageModel(input: {
  rows: Ga4DailyRow[];
  scopeKey: string;
  range: PeriodRange;
  previousRange: PeriodRange | null;
}): Ga4PageModel | null {
  const { rows, scopeKey, range, previousRange } = input;
  const scopeRows = ga4RowsForScope(rows, scopeKey);
  if (scopeRows.length === 0) return null;

  const current = ga4PeriodTotals(scopeRows, range);
  if (current.daysWithData === 0) return null;

  const previous = previousRange ? ga4PeriodTotals(scopeRows, previousRange) : null;

  return {
    scopeKey,
    current,
    previous,
    traffic: buildGa4TrafficMetrics(current, previous),
    conversion: buildGa4ConversionMetrics(current, previous),
    dataAsOf: ga4DataAsOf(scopeRows),
    range,
    previousRange,
    missingDays: Math.max(0, daysInRange(range) - current.daysWithData),
  };
}
