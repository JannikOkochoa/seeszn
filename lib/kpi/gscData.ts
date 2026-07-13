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
