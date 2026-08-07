// ─── Seiten-Performance: wiederverwendbare Berechnung je Einzelseite ──────────
// Eine Funktion für alle getrackten Seiten – Homepage, Berlin, Hamburg,
// München und jede spätere Landingpage oder Blogartikel. Es gibt bewusst keine
// Homepage-Sonderlogik: welche Seiten es gibt, steht ausschließlich in
// lib/gsc/pageScopes.ts (TRACKED_PAGES); hier wird nur gerechnet.
//
// Alles rechnet auf denselben echten Zeilen wie der Rest des Cockpits
// (gsc_scope_daily_metrics + gsc_dimension_snapshots der aktiven Batches).
// Keine eigene Abfrage, kein zweites Zahlenwerk, keine Ersatzwerte: fehlt der
// aktive Datensatz einer Seite, liefert die Funktion null und die Oberfläche
// sagt das.

import {
  segmentsForPage,
  TRACKED_PAGES,
  type PageSegmentKind,
  type TrackedPage,
} from "@/lib/gsc/pageScopes";
import { isBrandedQuery } from "@/lib/gsc/brand";
import type { SeriesPoint } from "./aggregate";
import { buildExecutiveKpis, type ExecutiveKpiModel } from "./executive";
import { formatDate } from "./format";
import {
  cockpitRangeLabel,
  computeRange,
  dailyForBatch,
  dataAsOf,
  metricDailySeries,
  scopeKeyOf,
  type CanvasMetric,
  type CockpitRange,
  type PeriodComparison,
  type PeriodTotals,
} from "./gscData";
import type {
  GscActiveDatasetRow,
  GscDimensionSnapshotRow,
  GscImportBatchRow,
  GscScopeDailyRow,
} from "./types";

/** Ein Marken-/Nicht-Marken-Segment mit seinem aktiven Batch. */
export interface PageSegmentOption {
  kind: PageSegmentKind;
  label: string;
  batchId: string;
}

/** Eine getrackte Seite plus der aktive Batch, der ihre Zahlen trägt. */
export interface PageOption extends TrackedPage {
  batchId: string;
  /** Vorhandene Segment-Datensätze; leer, solange sie nie synchronisiert wurden. */
  segments: PageSegmentOption[];
}

/**
 * Die getrackten Seiten, für die tatsächlich ein aktiver Datensatz vorliegt –
 * in der Reihenfolge von TRACKED_PAGES. Eine neu ergänzte Seite erscheint hier
 * automatisch, sobald der Sync sie das erste Mal aktiviert hat.
 */
export function buildPageOptions(
  activeDatasets: GscActiveDatasetRow[],
  batches: GscImportBatchRow[],
): PageOption[] {
  const batchIds = new Set(batches.map((b) => b.id));
  const activeByKey = new Map(
    activeDatasets.map((ds) => [scopeKeyOf(ds.scope_type, ds.scope_value), ds]),
  );

  return TRACKED_PAGES.flatMap((page) => {
    const ds = activeByKey.get(scopeKeyOf(page.scopeType, page.scopeValue));
    if (!ds || !batchIds.has(ds.import_batch_id)) return [];

    const segments = segmentsForPage(page.key).flatMap((segment) => {
      const segmentDs = activeByKey.get(scopeKeyOf(segment.scopeType, segment.scopeValue));
      if (!segmentDs || !batchIds.has(segmentDs.import_batch_id)) return [];
      return [{ kind: segment.kind, label: segment.label, batchId: segmentDs.import_batch_id }];
    });

    return [{ ...page, batchId: ds.import_batch_id, segments }];
  });
}

/** Eine Suchanfrage, über die diese Seite gefunden wird. */
export interface PageQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  /** Anteil 0..1. */
  ctr: number;
  position: number;
}

export interface PagePerformanceModel {
  page: PageOption;
  /** Klicks, Impressionen, CTR, Ø Position – inklusive Vorperiodenvergleich. */
  metrics: ExecutiveKpiModel[];
  totals: PeriodTotals;
  /** Null beim Gesamtzeitraum: dann gibt es keine vergleichbare Vorperiode. */
  comparison: PeriodComparison | null;
  rangeLabel: string;
  currentRange: { from: string; to: string };
  previousRange: { from: string; to: string } | null;
  /** Entwicklung über die Zeit für die gewählte Metrik. */
  series: SeriesPoint[];
  /** Dieselbe Metrik in der Vorperiode; leer beim Gesamtzeitraum. */
  previousSeries: SeriesPoint[];
  /** Top-Suchanfragen dieser Seite, nach Klicks. */
  topQueries: PageQueryRow[];
  /**
   * Zeitraum der Query-Tabelle. Dimensionswerte sind Aggregate über den
   * gesamten Batch-Zeitraum und folgen dem 7/28/90-Schalter NICHT – das muss
   * die Oberfläche so benennen.
   */
  queryPeriod: { start: string; end: string } | null;
  /** Letzter Tag mit Zahlen für diese Seite. */
  dataAsOf: string | null;
  /** Marken- vs. Nicht-Marken-Suchen; null, wenn die Seite das nicht nutzt. */
  brandSplit: BrandSplitModel | null;
}

export const TOP_QUERY_LIMIT = 10;

/* ── Marken- vs. Nicht-Marken-Suchen ────────────────────────────────────────── */

export interface BrandSegmentModel {
  kind: PageSegmentKind;
  label: string;
  totals: PeriodTotals;
  comparison: PeriodComparison | null;
  /** Klicks, Impressionen, CTR, Ø Position inklusive Vorperiodenvergleich. */
  metrics: ExecutiveKpiModel[];
  /** Anteil an den zuordenbaren Klicks (0..1); null wenn es keine gibt. */
  shareOfClicks: number | null;
  shareOfImpressions: number | null;
  topQueries: PageQueryRow[];
  /**
   * Zeitraum der Query-Tabelle. Zwingend zusammen mit topQueries anzuzeigen:
   * Dimensionswerte sind Aggregate über den gesamten Batch-Zeitraum und folgen
   * dem 7/28/90-Schalter NICHT. Ohne diese Angabe stehen Kennzahlen aus 28
   * Tagen direkt neben Query-Zahlen aus ~200 Tagen, und eine einzelne Zeile
   * kann dann mehr Impressionen ausweisen als das Segment insgesamt — was
   * unmöglich aussieht, obwohl beide Zahlen stimmen.
   */
  queryPeriod: { start: string; end: string } | null;
}

export interface BrandSplitModel {
  branded: BrandSegmentModel;
  nonBranded: BrandSegmentModel;
  /**
   * Klicks und Impressionen der Seite, die Google keiner Suchanfrage zuordnet.
   * Sehr seltene Anfragen lässt Google aus Datenschutzgründen weg – die Summe
   * beider Segmente ist deshalb systematisch kleiner als die Gesamtzahl der
   * Seite. Diese Differenz zu verschweigen würde die Anteile falsch aussehen
   * lassen, deshalb steht sie explizit im Modell.
   */
  unattributed: { clicks: number; impressions: number };
  /** Basis der Anteile: die zuordenbaren Summen beider Segmente. */
  attributed: { clicks: number; impressions: number };
}

function share(part: number, total: number): number | null {
  return total > 0 ? part / total : null;
}

function buildBrandSegment(input: {
  segment: PageSegmentOption;
  daily: GscScopeDailyRow[];
  dimensions: GscDimensionSnapshotRow[];
  range: CockpitRange;
  rangeLabel: string;
  attributedClicks: number;
  attributedImpressions: number;
}): BrandSegmentModel | null {
  const { segment, daily, dimensions, range, rangeLabel } = input;
  const rows = dailyForBatch(daily, segment.batchId);
  const computed = computeRange(rows, range);
  if (!computed) return null;

  const asOf = dataAsOf(rows);
  const queryRows = dimensions.filter(
    (d) => d.import_batch_id === segment.batchId && d.dimension_type === "query",
  );
  const topQueries = [...queryRows]
    .sort((a, b) => Number(b.clicks) - Number(a.clicks) || Number(b.impressions) - Number(a.impressions))
    .slice(0, TOP_QUERY_LIMIT)
    .map((d) => ({
      query: d.dimension_value,
      clicks: Number(d.clicks),
      impressions: Number(d.impressions),
      ctr: Number(d.ctr),
      position: Number(d.position),
    }));
  const firstQueryRow = queryRows[0];

  return {
    kind: segment.kind,
    label: segment.label,
    totals: computed.totals,
    comparison: computed.comparison,
    metrics: buildExecutiveKpis(
      computed.totals,
      computed.comparison,
      { rangeLabel, dataAsOfLabel: asOf ? formatDate(asOf) : null },
      `Search Console · ${segment.label}`,
    ),
    shareOfClicks: share(computed.totals.clicks, input.attributedClicks),
    shareOfImpressions: share(computed.totals.impressions, input.attributedImpressions),
    topQueries,
    queryPeriod: firstQueryRow
      ? { start: firstQueryRow.period_start, end: firstQueryRow.period_end }
      : null,
  };
}

/**
 * Zerlegt eine Seite in Marken- und Nicht-Marken-Suchen. Beide Segmente haben
 * eigene Tageszeitreihen (eigene Scopes im Sync), deshalb ist der Vergleich zur
 * Vorperiode hier genauso belastbar wie bei der Seite selbst.
 *
 * Gibt null zurück, wenn eines der beiden Segmente noch keinen aktiven
 * Datensatz hat – ein halber Split wäre irreführend.
 */
export function buildBrandSplit(input: {
  page: PageOption;
  pageTotals: PeriodTotals;
  daily: GscScopeDailyRow[];
  dimensions: GscDimensionSnapshotRow[];
  range: CockpitRange;
  rangeLabel: string;
}): BrandSplitModel | null {
  const { page, pageTotals, daily, dimensions, range, rangeLabel } = input;
  const brandedSegment = page.segments.find((s) => s.kind === "branded");
  const nonBrandedSegment = page.segments.find((s) => s.kind === "non_branded");
  if (!brandedSegment || !nonBrandedSegment) return null;

  // Anteile brauchen erst die Summen beider Segmente; deshalb zwei Durchgänge.
  const totalsFor = (segment: PageSegmentOption): PeriodTotals | null =>
    computeRange(dailyForBatch(daily, segment.batchId), range)?.totals ?? null;

  const brandedTotals = totalsFor(brandedSegment);
  const nonBrandedTotals = totalsFor(nonBrandedSegment);
  if (!brandedTotals || !nonBrandedTotals) return null;

  const attributedClicks = brandedTotals.clicks + nonBrandedTotals.clicks;
  const attributedImpressions = brandedTotals.impressions + nonBrandedTotals.impressions;

  // Die Segmente sind per Query-Filter echte Teilmengen der Seite; sie können
  // sie nie übertreffen. Tun sie es doch, stammen Seite und Segmente aus
  // unterschiedlichen Ständen — etwa weil ein Scope beim letzten Sync nicht
  // aktiviert wurde und noch ältere Zahlen trägt. Ein Split auf dieser Basis
  // wäre still falsch: die Anteile bezögen sich auf eine Grundmenge, die es so
  // nicht gibt. Lieber gar keinen Split zeigen als einen unstimmigen.
  if (
    attributedClicks > pageTotals.clicks ||
    attributedImpressions > pageTotals.impressions
  ) {
    return null;
  }

  const common = {
    daily,
    dimensions,
    range,
    rangeLabel,
    attributedClicks,
    attributedImpressions,
  };
  const branded = buildBrandSegment({ segment: brandedSegment, ...common });
  const nonBranded = buildBrandSegment({ segment: nonBrandedSegment, ...common });
  if (!branded || !nonBranded) return null;

  return {
    branded,
    nonBranded,
    attributed: { clicks: attributedClicks, impressions: attributedImpressions },
    unattributed: {
      clicks: Math.max(0, pageTotals.clicks - attributedClicks),
      impressions: Math.max(0, pageTotals.impressions - attributedImpressions),
    },
  };
}

/**
 * Fällt eine Suchanfrage unter die Marke? Zentral in lib/gsc/brand.ts
 * definiert; hier nur weitergereicht, damit die Auswertungsschicht eine
 * einzige Anlaufstelle hat.
 */
export { isBrandedQuery };

/**
 * Rechnet eine Seite durch. `daily` und `dimensions` sind die bereits geladenen
 * Zeilen aller aktiven Batches; gefiltert wird über die Batch-ID der Seite.
 * Gibt null zurück, wenn für den gewählten Zeitraum keine Zeilen vorliegen.
 */
export function buildPagePerformance(input: {
  page: PageOption;
  daily: GscScopeDailyRow[];
  dimensions: GscDimensionSnapshotRow[];
  range: CockpitRange;
  metric: CanvasMetric;
}): PagePerformanceModel | null {
  const { page, daily, dimensions, range, metric } = input;

  const rows = dailyForBatch(daily, page.batchId);
  const computed = computeRange(rows, range);
  if (!computed) return null;

  const rangeLabel = cockpitRangeLabel(range);
  const asOf = dataAsOf(rows);

  const queryRows = dimensions.filter(
    (d) => d.import_batch_id === page.batchId && d.dimension_type === "query",
  );
  const topQueries: PageQueryRow[] = [...queryRows]
    .sort((a, b) => Number(b.clicks) - Number(a.clicks) || Number(b.impressions) - Number(a.impressions))
    .slice(0, TOP_QUERY_LIMIT)
    .map((d) => ({
      query: d.dimension_value,
      clicks: Number(d.clicks),
      impressions: Number(d.impressions),
      ctr: Number(d.ctr),
      position: Number(d.position),
    }));

  const first = queryRows[0];
  return {
    page,
    metrics: buildExecutiveKpis(
      computed.totals,
      computed.comparison,
      { rangeLabel, dataAsOfLabel: asOf ? formatDate(asOf) : null },
      "Search Console · nur diese Seite",
    ),
    totals: computed.totals,
    comparison: computed.comparison,
    rangeLabel,
    currentRange: computed.current,
    previousRange: computed.previous,
    series: metricDailySeries(rows, computed.current, metric),
    previousSeries: computed.previous
      ? metricDailySeries(rows, computed.previous, metric)
      : [],
    topQueries,
    queryPeriod: first ? { start: first.period_start, end: first.period_end } : null,
    dataAsOf: asOf,
    brandSplit: buildBrandSplit({
      page,
      pageTotals: computed.totals,
      daily,
      dimensions,
      range,
      rangeLabel,
    }),
  };
}
