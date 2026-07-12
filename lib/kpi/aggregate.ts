// ─── KPI-Workspace: Aggregation ───────────────────────────────────────────────
// Reine Funktionen ohne Seiteneffekte. Alle Berechnungen laufen über den vom
// Server geladenen Rohbestand (Snapshots + GSC-Tagesmetriken); es gibt keine
// zweite Datenlogik und keine hart codierten fachlichen Werte.

import type {
  AnnotationRow,
  MetricRow,
  PageRow,
  SnapshotRow,
  TargetRow,
} from "./types";

export type RangeDays = 7 | 28 | 90;
export type DeviceFilter = "all" | "MOBILE" | "DESKTOP";

export interface PeriodRange {
  /** inklusive, YYYY-MM-DD */
  from: string;
  /** inklusive, YYYY-MM-DD */
  to: string;
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function listDays(range: PeriodRange): string[] {
  const days: string[] = [];
  let cursor = range.from;
  while (cursor <= range.to) {
    days.push(cursor);
    cursor = addDaysIso(cursor, 1);
  }
  return days;
}

/** Aktuelle Periode + direkt davorliegende Vorperiode gleicher Länge. */
export function buildRanges(days: RangeDays, anchor: string): {
  current: PeriodRange;
  previous: PeriodRange;
} {
  const current = { from: addDaysIso(anchor, -(days - 1)), to: anchor };
  const prevTo = addDaysIso(current.from, -1);
  return { current, previous: { from: addDaysIso(prevTo, -(days - 1)), to: prevTo } };
}

function inRange(date: string, range: PeriodRange): boolean {
  return date >= range.from && date <= range.to;
}

export function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

/* ── Filter ───────────────────────────────────────────────────────────────── */

export interface MetricFilter {
  device: DeviceFilter;
  /** "all" oder eine page_id */
  pageId: string;
  /** nur diese Seiten zählen für den KPI */
  productPageIds: ReadonlySet<string>;
}

export function filterMetrics(
  metrics: MetricRow[],
  range: PeriodRange,
  filter: MetricFilter,
): MetricRow[] {
  return metrics.filter((m) => {
    if (!inRange(m.date, range)) return false;
    if (filter.device !== "all" && m.device !== filter.device) return false;
    if (filter.pageId !== "all") return m.page_id === filter.pageId;
    return filter.productPageIds.has(m.page_id);
  });
}

/* ── Zeitreihe ────────────────────────────────────────────────────────────── */

export interface SeriesPoint {
  date: string;
  value: number | null;
}

/** Offizielle KPI-Reihe aus Snapshots (ungefiltert, alle Produktseiten). */
export function snapshotSeries(snapshots: SnapshotRow[], range: PeriodRange): SeriesPoint[] {
  const byDate = new Map(snapshots.map((s) => [s.date, Number(s.value)]));
  return listDays(range).map((date) => ({ date, value: byDate.get(date) ?? null }));
}

/** Gefilterte Reihe aus den Rohmetriken (Gerät / einzelne Seite). */
export function metricSeries(
  metrics: MetricRow[],
  range: PeriodRange,
  filter: MetricFilter,
): SeriesPoint[] {
  const byDate = new Map<string, number>();
  for (const m of filterMetrics(metrics, range, filter)) {
    byDate.set(m.date, (byDate.get(m.date) ?? 0) + Number(m.clicks));
  }
  return listDays(range).map((date) => ({ date, value: byDate.get(date) ?? null }));
}

export function sumSeries(series: SeriesPoint[]): number {
  return series.reduce((acc, p) => acc + (p.value ?? 0), 0);
}

export function latestValue(series: SeriesPoint[]): { date: string; value: number } | null {
  for (let i = series.length - 1; i >= 0; i--) {
    const p = series[i];
    if (p.value !== null) return { date: p.date, value: p.value };
  }
  return null;
}

/* ── Ziele ────────────────────────────────────────────────────────────────── */

export function targetForDate(targets: TargetRow[], date: string): TargetRow | null {
  return (
    targets.find(
      (t) => t.start_date <= date && (t.end_date === null || t.end_date >= date),
    ) ?? null
  );
}

/** Zielkurve über den Zeitraum (Stufenverlauf, null = kein Ziel definiert). */
export function targetSeries(targets: TargetRow[], range: PeriodRange): SeriesPoint[] {
  return listDays(range).map((date) => {
    const t = targetForDate(targets, date);
    return { date, value: t ? Number(t.target_value) : null };
  });
}

/* ── Seiten-Aggregation ───────────────────────────────────────────────────── */

export interface PageStats {
  pageId: string;
  name: string;
  url: string;
  segment: string | null;
  clicks: number;
  previousClicks: number;
  clicksDeltaPct: number | null;
  impressions: number;
  previousImpressions: number;
  impressionsDeltaPct: number | null;
  ctr: number | null;
  position: number | null;
  /** Klick-Delta Mobil minus Desktop, in Prozentpunkten (nur bei device=all). */
  deviceGapPct: number | null;
  mobileDeltaPct: number | null;
  desktopDeltaPct: number | null;
}

interface Bucket {
  clicks: number;
  impressions: number;
  positionWeighted: number;
  positionWeight: number;
}

function emptyBucket(): Bucket {
  return { clicks: 0, impressions: 0, positionWeighted: 0, positionWeight: 0 };
}

function addToBucket(bucket: Bucket, m: MetricRow) {
  bucket.clicks += Number(m.clicks);
  bucket.impressions += Number(m.impressions);
  if (m.position !== null && Number(m.impressions) > 0) {
    bucket.positionWeighted += Number(m.position) * Number(m.impressions);
    bucket.positionWeight += Number(m.impressions);
  }
}

function bucketPosition(bucket: Bucket): number | null {
  return bucket.positionWeight > 0 ? bucket.positionWeighted / bucket.positionWeight : null;
}

export function pageStats(
  metrics: MetricRow[],
  pages: PageRow[],
  current: PeriodRange,
  previous: PeriodRange,
  device: DeviceFilter,
): PageStats[] {
  const productPages = pages.filter((p) => p.segment === "product");
  const stats: PageStats[] = [];

  for (const page of productPages) {
    const filter: MetricFilter = {
      device,
      pageId: page.id,
      productPageIds: new Set([page.id]),
    };
    const cur = emptyBucket();
    const prev = emptyBucket();
    for (const m of filterMetrics(metrics, current, filter)) addToBucket(cur, m);
    for (const m of filterMetrics(metrics, previous, filter)) addToBucket(prev, m);

    // Geräte-Abweichung nur in der ungefilterten Ansicht sinnvoll.
    let deviceGapPct: number | null = null;
    let mobileDeltaPct: number | null = null;
    let desktopDeltaPct: number | null = null;
    if (device === "all") {
      const perDevice = (dev: DeviceFilter, range: PeriodRange) => {
        const b = emptyBucket();
        for (const m of filterMetrics(metrics, range, { ...filter, device: dev })) {
          addToBucket(b, m);
        }
        return b.clicks;
      };
      mobileDeltaPct = deltaPct(perDevice("MOBILE", current), perDevice("MOBILE", previous));
      desktopDeltaPct = deltaPct(perDevice("DESKTOP", current), perDevice("DESKTOP", previous));
      if (mobileDeltaPct !== null && desktopDeltaPct !== null) {
        deviceGapPct = mobileDeltaPct - desktopDeltaPct;
      }
    }

    stats.push({
      pageId: page.id,
      name: page.name,
      url: page.url,
      segment: page.segment,
      clicks: cur.clicks,
      previousClicks: prev.clicks,
      clicksDeltaPct: deltaPct(cur.clicks, prev.clicks),
      impressions: cur.impressions,
      previousImpressions: prev.impressions,
      impressionsDeltaPct: deltaPct(cur.impressions, prev.impressions),
      ctr: cur.impressions > 0 ? (cur.clicks / cur.impressions) * 100 : null,
      position: bucketPosition(cur),
      deviceGapPct,
      mobileDeltaPct,
      desktopDeltaPct,
    });
  }

  return stats;
}

/* ── Query-Aggregation ────────────────────────────────────────────────────── */

export interface QueryStats {
  key: string;
  query: string;
  pageId: string;
  pageName: string;
  device: string;
  clicks: number;
  previousClicks: number;
  clicksDeltaPct: number | null;
  impressions: number;
  ctr: number | null;
  position: number | null;
}

export function queryStats(
  metrics: MetricRow[],
  pages: PageRow[],
  current: PeriodRange,
  previous: PeriodRange,
  filter: MetricFilter,
): QueryStats[] {
  const pageById = new Map(pages.map((p) => [p.id, p]));
  const groups = new Map<string, { cur: Bucket; prev: Bucket; sample: MetricRow }>();

  const keyOf = (m: MetricRow) => `${m.query}|${m.page_id}|${m.device}`;

  for (const m of filterMetrics(metrics, current, filter)) {
    const key = keyOf(m);
    if (!groups.has(key)) groups.set(key, { cur: emptyBucket(), prev: emptyBucket(), sample: m });
    addToBucket(groups.get(key)!.cur, m);
  }
  for (const m of filterMetrics(metrics, previous, filter)) {
    const key = keyOf(m);
    if (!groups.has(key)) groups.set(key, { cur: emptyBucket(), prev: emptyBucket(), sample: m });
    addToBucket(groups.get(key)!.prev, m);
  }

  const rows: QueryStats[] = [];
  for (const [key, g] of groups) {
    rows.push({
      key,
      query: g.sample.query,
      pageId: g.sample.page_id,
      pageName: pageById.get(g.sample.page_id)?.name ?? g.sample.page_id,
      device: g.sample.device,
      clicks: g.cur.clicks,
      previousClicks: g.prev.clicks,
      clicksDeltaPct: deltaPct(g.cur.clicks, g.prev.clicks),
      impressions: g.cur.impressions,
      ctr: g.cur.impressions > 0 ? (g.cur.clicks / g.cur.impressions) * 100 : null,
      position: bucketPosition(g.cur),
    });
  }
  return rows.sort((a, b) => b.clicks - a.clicks);
}

/* ── Gewinner, Verlierer, Auffälligkeiten ─────────────────────────────────── */

export interface Finding {
  kind: "winner" | "loser" | "device" | "impressions" | "threshold";
  pageId: string;
  pageName: string;
  /** Faktische Beobachtung, direkt aus den Zahlen. */
  observation: string;
  /** Vorsichtige Einordnung; nie eine behauptete Ursache. */
  interpretation: string | null;
  /** Für die Maßnahmen-Vorbefüllung. */
  device?: string;
  metrics: { clicks: number; previousClicks: number; deltaPct: number | null };
}

export function buildFindings(stats: PageStats[], days: RangeDays): Finding[] {
  const findings: Finding[] = [];
  const fmt = (n: number) => n.toLocaleString("de-DE");
  const fmtPct = (p: number) =>
    `${p > 0 ? "+" : ""}${p.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;

  const changed = stats.filter((s) => s.clicksDeltaPct !== null);

  const winners = [...changed]
    .filter((s) => (s.clicksDeltaPct ?? 0) > 0)
    .sort((a, b) => (b.clicksDeltaPct ?? 0) - (a.clicksDeltaPct ?? 0))
    .slice(0, 2);
  for (const s of winners) {
    findings.push({
      kind: "winner",
      pageId: s.pageId,
      pageName: s.name,
      observation: `${s.name}: ${fmt(s.clicks)} Klicks in ${days} Tagen, ${fmtPct(s.clicksDeltaPct!)} gegenüber der Vorperiode (${fmt(s.previousClicks)}).`,
      interpretation: null,
      metrics: { clicks: s.clicks, previousClicks: s.previousClicks, deltaPct: s.clicksDeltaPct },
    });
  }

  const losers = [...changed]
    .filter((s) => (s.clicksDeltaPct ?? 0) < 0)
    .sort((a, b) => (a.clicksDeltaPct ?? 0) - (b.clicksDeltaPct ?? 0))
    .slice(0, 2);
  for (const s of losers) {
    findings.push({
      kind: "loser",
      pageId: s.pageId,
      pageName: s.name,
      observation: `${s.name}: ${fmt(s.clicks)} Klicks in ${days} Tagen, ${fmtPct(s.clicksDeltaPct!)} gegenüber der Vorperiode (${fmt(s.previousClicks)}).`,
      interpretation: "Ursache noch ungeklärt, Rückgang zuerst auf Seiten- und Query-Ebene eingrenzen.",
      metrics: { clicks: s.clicks, previousClicks: s.previousClicks, deltaPct: s.clicksDeltaPct },
    });
  }

  // Auffällige Geräteunterschiede: Mobil- und Desktop-Trend laufen auseinander.
  for (const s of stats) {
    if (s.deviceGapPct === null || Math.abs(s.deviceGapPct) < 15) continue;
    const weaker = s.deviceGapPct < 0 ? "Mobil" : "Desktop";
    const weakerDelta = s.deviceGapPct < 0 ? s.mobileDeltaPct : s.desktopDeltaPct;
    const strongerDelta = s.deviceGapPct < 0 ? s.desktopDeltaPct : s.mobileDeltaPct;
    findings.push({
      kind: "device",
      pageId: s.pageId,
      pageName: s.name,
      device: weaker === "Mobil" ? "MOBILE" : "DESKTOP",
      observation: `${s.name}: ${weaker} ${fmtPct(weakerDelta ?? 0)}, während ${weaker === "Mobil" ? "Desktop" : "Mobil"} bei ${fmtPct(strongerDelta ?? 0)} liegt.`,
      interpretation: `Mögliche Interpretation: ein gerätespezifisches Problem auf ${weaker}. Noch ungeklärt.`,
      metrics: { clicks: s.clicks, previousClicks: s.previousClicks, deltaPct: weakerDelta ?? null },
    });
  }

  // Steigende Impressionen bei schwachen Klicks.
  for (const s of stats) {
    if (
      s.impressionsDeltaPct !== null &&
      s.impressionsDeltaPct > 8 &&
      s.ctr !== null &&
      s.ctr < 4 &&
      (s.clicksDeltaPct ?? 0) < s.impressionsDeltaPct / 2
    ) {
      findings.push({
        kind: "impressions",
        pageId: s.pageId,
        pageName: s.name,
        observation: `${s.name}: Impressionen ${fmtPct(s.impressionsDeltaPct)}, aber CTR nur ${s.ctr.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %.`,
        interpretation:
          "Mögliche Interpretation: die Seite wird häufiger ausgespielt, ohne den Klick zu gewinnen. Snippet und Suchintention prüfen. Noch ungeklärt.",
        metrics: { clicks: s.clicks, previousClicks: s.previousClicks, deltaPct: s.clicksDeltaPct },
      });
    }
  }

  // Ranking-Schwellen: knapp hinter Top 3 oder an der Schwelle zu Seite 1.
  for (const s of stats) {
    if (s.position === null) continue;
    if (s.position > 3 && s.position <= 5.5) {
      findings.push({
        kind: "threshold",
        pageId: s.pageId,
        pageName: s.name,
        observation: `${s.name}: Ø Position ${s.position.toLocaleString("de-DE", { maximumFractionDigits: 1 })}, knapp hinter den Top 3.`,
        interpretation: "Kleine Verbesserungen können hier überproportional Klicks bringen.",
        metrics: { clicks: s.clicks, previousClicks: s.previousClicks, deltaPct: s.clicksDeltaPct },
      });
    } else if (s.position >= 8.5 && s.position <= 12.5) {
      findings.push({
        kind: "threshold",
        pageId: s.pageId,
        pageName: s.name,
        observation: `${s.name}: Ø Position ${s.position.toLocaleString("de-DE", { maximumFractionDigits: 1 })}, an der Schwelle zwischen Seite 1 und Seite 2.`,
        interpretation: "Sichtbarkeit reagiert an dieser Schwelle stark auf Positionsänderungen.",
        metrics: { clicks: s.clicks, previousClicks: s.previousClicks, deltaPct: s.clicksDeltaPct },
      });
    }
  }

  return findings;
}

/* ── Annotationen im Zeitraum ─────────────────────────────────────────────── */

export function annotationsInRange(
  annotations: AnnotationRow[],
  range: PeriodRange,
): AnnotationRow[] {
  return annotations
    .filter((a) => inRange(a.date, range))
    .sort((a, b) => a.date.localeCompare(b.date));
}
