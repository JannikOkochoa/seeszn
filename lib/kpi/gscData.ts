// ─── GSC-Import: zentrale Berechnungslogik ────────────────────────────────────
// Reine, testbare Funktionen über den importierten echten Search-Console-Daten
// (gsc_scope_daily_metrics der aktiven Batches). Keine Berechnung in
// React-Komponenten, keine hart codierten Zahlen, keine Demo-Vermischung:
// alles hier rechnet ausschließlich auf Zeilen, die über gsc_active_datasets
// an einen importierten Batch gebunden sind.

import type {
  GscActiveDatasetRow,
  GscImportBatchRow,
  GscScopeDailyRow,
  GscScopeType,
} from "./types";
import {
  addDaysIso,
  buildRanges,
  deltaPct,
  listDays,
  type PeriodRange,
  type RangeDays,
  type SeriesPoint,
} from "./aggregate";

/** Stabiler Schlüssel eines Scopes ("path_prefix|/staedte-klassenfahrten/"). */
export function scopeKeyOf(scopeType: GscScopeType, scopeValue: string | null): string {
  return `${scopeType}|${scopeValue ?? ""}`;
}

export interface ScopeOption {
  key: string;
  scopeType: GscScopeType;
  scopeValue: string | null;
  label: string;
  batchId: string;
}

/**
 * Auswahlbare Scopes für den primären KPI, in fachlicher Reihenfolge:
 * erst alle Städtereisen (path_prefix), dann die einzelnen Produktseiten.
 * Der Sitewide-Export bleibt bewusst außen vor (Kontext, kein KPI-Filter).
 */
export function buildScopeOptions(
  activeDatasets: GscActiveDatasetRow[],
  batches: GscImportBatchRow[],
): ScopeOption[] {
  const batchById = new Map(batches.map((b) => [b.id, b]));
  const options: ScopeOption[] = [];
  for (const ds of activeDatasets) {
    if (ds.scope_type === "sitewide") continue;
    if (!batchById.has(ds.import_batch_id)) continue;
    options.push({
      key: scopeKeyOf(ds.scope_type, ds.scope_value),
      scopeType: ds.scope_type,
      scopeValue: ds.scope_value,
      label: ds.scope_type === "path_prefix" ? "Alle Städtereisen" : (ds.scope_value ?? "Unbenannt"),
      batchId: ds.import_batch_id,
    });
  }
  return options.sort((a, b) => {
    if (a.scopeType !== b.scopeType) return a.scopeType === "path_prefix" ? -1 : 1;
    return a.label.localeCompare(b.label, "de");
  });
}

/** Der Standard-Scope des primären KPI: alle Städtereise-Produktseiten. */
export function defaultScopeKey(options: ScopeOption[]): string | null {
  return (options.find((o) => o.scopeType === "path_prefix") ?? options[0])?.key ?? null;
}

/**
 * Der Sitewide-Datensatz als eigener Scope. Er bleibt bewusst außerhalb der
 * KPI-Scope-Auswahl (buildScopeOptions), ist aber die reichste Quelle für die
 * Intelligence-Ableitungen (Quick Wins, Content-Chancen, SEO Health).
 */
export function sitewideOption(
  activeDatasets: GscActiveDatasetRow[],
  batches: GscImportBatchRow[],
): ScopeOption | null {
  const batchIds = new Set(batches.map((b) => b.id));
  const ds = activeDatasets.find(
    (d) => d.scope_type === "sitewide" && batchIds.has(d.import_batch_id),
  );
  if (!ds) return null;
  return {
    key: scopeKeyOf(ds.scope_type, ds.scope_value),
    scopeType: ds.scope_type,
    scopeValue: ds.scope_value,
    label: "Gesamte Website",
    batchId: ds.import_batch_id,
  };
}

/** Tageszeilen eines Batches, nach Datum sortiert. */
export function dailyForBatch(daily: GscScopeDailyRow[], batchId: string): GscScopeDailyRow[] {
  return daily
    .filter((d) => d.import_batch_id === batchId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Letzter Tag mit Daten; Anker aller Zeitraumrechnungen ("Datenstand"). */
export function dataAsOf(rows: GscScopeDailyRow[]): string | null {
  return rows.length > 0 ? rows[rows.length - 1].date : null;
}

/** Zeitraum + Vorperiode relativ zum Datenstand des Batches. */
export function rangesForBatch(
  rows: GscScopeDailyRow[],
  days: RangeDays,
): { current: PeriodRange; previous: PeriodRange } | null {
  const anchor = dataAsOf(rows);
  if (!anchor) return null;
  return buildRanges(days, anchor);
}

export function clicksSeries(rows: GscScopeDailyRow[], range: PeriodRange): SeriesPoint[] {
  const byDate = new Map(rows.map((r) => [r.date, Number(r.clicks)]));
  return listDays(range).map((date) => ({ date, value: byDate.get(date) ?? null }));
}

export interface PeriodTotals {
  clicks: number;
  impressions: number;
  /** Anteil 0..1, aus den Summen berechnet. */
  ctr: number | null;
  /** Mit Impressionen gewichteter Mittelwert der täglichen GSC-Positionen. */
  position: number | null;
  daysWithData: number;
}

export function periodTotals(rows: GscScopeDailyRow[], range: PeriodRange): PeriodTotals {
  let clicks = 0;
  let impressions = 0;
  let positionWeighted = 0;
  let positionWeight = 0;
  let daysWithData = 0;
  for (const row of rows) {
    if (row.date < range.from || row.date > range.to) continue;
    daysWithData += 1;
    clicks += Number(row.clicks);
    impressions += Number(row.impressions);
    if (Number(row.impressions) > 0) {
      positionWeighted += Number(row.position) * Number(row.impressions);
      positionWeight += Number(row.impressions);
    }
  }
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : null,
    position: positionWeight > 0 ? positionWeighted / positionWeight : null,
    daysWithData,
  };
}

export interface PeriodComparison {
  current: PeriodTotals;
  previous: PeriodTotals;
  clicksDeltaPct: number | null;
  /**
   * Absoluter Vergleich, immer zusammen mit dem Prozentwert zeigen
   * (z. B. "6 statt 2 Klicks"); bei sehr kleiner Vorperiode trägt der
   * Prozentwert allein keine belastbare Aussage.
   */
  comparisonLabel: string;
  /** Vorperiode zu klein für eine belastbare Prozent-Hervorhebung. */
  lowBase: boolean;
}

/** Schwelle, unter der eine Vorperiode als zu klein für Prozentwerte gilt. */
export const LOW_BASE_THRESHOLD = 10;

export function comparePeriods(
  rows: GscScopeDailyRow[],
  current: PeriodRange,
  previous: PeriodRange,
): PeriodComparison {
  const cur = periodTotals(rows, current);
  const prev = periodTotals(rows, previous);
  const fmt = (n: number) => n.toLocaleString("de-DE");
  return {
    current: cur,
    previous: prev,
    clicksDeltaPct: deltaPct(cur.clicks, prev.clicks),
    comparisonLabel: `${fmt(cur.clicks)} statt ${fmt(prev.clicks)} Klicks`,
    lowBase: prev.clicks < LOW_BASE_THRESHOLD,
  };
}

/** Herkunftsangaben eines aktiven Datensatzes für die Quellenkennzeichnung. */
export interface DatasetProvenance {
  source: "Google Search Console Export";
  scopeLabel: string;
  periodStart: string;
  periodEnd: string;
  dataAsOf: string | null;
  importedAt: string | null;
  fileName: string;
}

export function provenanceFor(
  option: ScopeOption,
  batches: GscImportBatchRow[],
  rows: GscScopeDailyRow[],
): DatasetProvenance | null {
  const batch = batches.find((b) => b.id === option.batchId);
  if (!batch) return null;
  return {
    source: "Google Search Console Export",
    scopeLabel: option.label,
    periodStart: batch.period_start,
    periodEnd: batch.period_end,
    dataAsOf: dataAsOf(rows),
    importedAt: batch.imported_at,
    fileName: batch.original_file_name,
  };
}

/** Ladefenster für Tageszeilen: 90 Tage + Vorperiode + Puffer. */
export const DAILY_WINDOW_DAYS = 200;

export function dailyWindowStart(todayIso: string): string {
  return addDaysIso(todayIso, -DAILY_WINDOW_DAYS);
}

/* ── Executive Cockpit: Zeiträume inkl. "Gesamter Zeitraum" ─────────────────── */

/** 7/28/90 Tage oder der komplette verfügbare Exportzeitraum. */
export type CockpitRange = RangeDays | "all";

export const COCKPIT_RANGES: CockpitRange[] = [7, 28, 90, "all"];

export function cockpitRangeLabel(range: CockpitRange): string {
  return range === "all" ? "Gesamter Zeitraum" : `${range} Tage`;
}

export interface RangeComputation {
  current: PeriodRange;
  /** Null beim Gesamtzeitraum: es gibt keine Vorperiode gleicher Länge. */
  previous: PeriodRange | null;
  /** Kennwerte der aktuellen Periode, immer vorhanden. */
  totals: PeriodTotals;
  /** Vergleich zur Vorperiode; null beim Gesamtzeitraum. */
  comparison: PeriodComparison | null;
}

/**
 * Einzige Zeitraumrechnung des Cockpits: 7/28/90 Tage laufen über
 * buildRanges + comparePeriods; "all" umfasst alle vorhandenen Tage ohne
 * Vorperiodenvergleich (ehrlich statt einer erfundenen Vergleichsbasis).
 */
export function computeRange(rows: GscScopeDailyRow[], range: CockpitRange): RangeComputation | null {
  if (rows.length === 0) return null;
  if (range === "all") {
    const current: PeriodRange = { from: rows[0].date, to: rows[rows.length - 1].date };
    return { current, previous: null, totals: periodTotals(rows, current), comparison: null };
  }
  const ranges = rangesForBatch(rows, range);
  if (!ranges) return null;
  const comparison = comparePeriods(rows, ranges.current, ranges.previous);
  return {
    current: ranges.current,
    previous: ranges.previous,
    totals: comparison.current,
    comparison,
  };
}

/* ── Metrik-Serien für den Performance Canvas ───────────────────────────────── */

export type CanvasMetric = "clicks" | "impressions" | "ctr" | "position";

/**
 * Tagesserie einer Metrik. Tage ohne Datenzeile bleiben null (keine
 * erfundenen Nullwerte); CTR wird als Prozent geliefert, Position unverändert
 * (niedriger ist besser – die Interpretation übernimmt die Oberfläche).
 */
export function metricDailySeries(
  rows: GscScopeDailyRow[],
  range: PeriodRange,
  metric: CanvasMetric,
): SeriesPoint[] {
  const byDate = new Map(rows.map((r) => [r.date, r]));
  return listDays(range).map((date) => {
    const row = byDate.get(date);
    if (!row) return { date, value: null };
    if (metric === "clicks") return { date, value: Number(row.clicks) };
    if (metric === "impressions") return { date, value: Number(row.impressions) };
    if (metric === "ctr") return { date, value: Number(row.ctr) * 100 };
    return { date, value: Number(row.position) };
  });
}
