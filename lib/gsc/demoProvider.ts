// ─── GSC-Provider: Demo ───────────────────────────────────────────────────────
// Erzeugt deterministische Demo-Daten mit derselben Struktur wie die echte
// Search Console: Wochenend-Einbruch, leichter Aufwärtstrend, hash-basierter
// Jitter. Deterministisch pro (Datum, Query, Gerät), damit wiederholte Syncs
// identische Werte liefern und Upserts idempotent bleiben.

import type { GscFetchParams, GscMetricRow, GscProvider } from "./types";

const DEVICES: ReadonlyArray<{ device: string; factor: number }> = [
  { device: "DESKTOP", factor: 0.8 },
  { device: "MOBILE", factor: 1.2 },
];

// Query-Muster pro Seite; {topic} wird aus dem letzten URL-Segment abgeleitet.
const QUERY_PATTERNS: ReadonlyArray<{ suffix: string; baseClicks: number; basePosition: number }> = [
  { suffix: "", baseClicks: 9, basePosition: 4.2 },
  { suffix: " kosten", baseClicks: 5, basePosition: 6.8 },
  { suffix: " programm", baseClicks: 2.5, basePosition: 8.9 },
];

/** FNV-1a, 32 Bit – stabiler Jitter ohne Zufallszustand. */
function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function jitter(key: string, range: number): number {
  return (hash32(key) % (2 * range + 1)) - range;
}

function topicFromUrl(pageUrl: string): string {
  const segments = new URL(pageUrl).pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "reisen";
}

function* isoDates(startDate: string, endDate: string): Generator<string> {
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (cursor.getTime() <= end.getTime()) {
    yield cursor.toISOString().slice(0, 10);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

export class DemoGscProvider implements GscProvider {
  readonly kind = "demo" as const;

  async fetchDailyMetrics(params: GscFetchParams): Promise<GscMetricRow[]> {
    const rows: GscMetricRow[] = [];

    for (const pageUrl of params.pageUrls) {
      const topic = topicFromUrl(pageUrl);
      // Seiten unterscheiden sich leicht im Grundniveau (0.75–1.05).
      const pageFactor = 0.75 + (hash32(pageUrl) % 31) / 100;

      for (const date of isoDates(params.startDate, params.endDate)) {
        const day = new Date(`${date}T00:00:00Z`).getUTCDay();
        const weekendFactor = day === 0 || day === 6 ? 0.45 : 1.0;
        const trendFactor = 1 + 0.007 * dayIndex(params.startDate, date);

        for (const pattern of QUERY_PATTERNS) {
          const query = `klassenfahrt ${topic}${pattern.suffix}`;

          for (const { device, factor } of DEVICES) {
            const key = `${query}|${device}|${date}`;
            const clicks = Math.max(
              0,
              Math.round(
                pattern.baseClicks * pageFactor * factor * weekendFactor * trendFactor +
                  jitter(key, 1),
              ),
            );
            const impressions = Math.max(
              20,
              Math.round(
                pattern.baseClicks * pageFactor * factor * 17 * weekendFactor * trendFactor +
                  Math.abs(jitter(`${device}|${key}`, 12)),
              ),
            );
            const position =
              Math.round((pattern.basePosition + jitter(`${date}|${query}`, 7) / 10) * 10) / 10;

            rows.push({
              date,
              pageUrl,
              query,
              device,
              country: "deu",
              clicks,
              impressions,
              ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 10000 : 0,
              position: Math.max(1, position),
            });
          }
        }
      }
    }

    return rows;
  }
}

function dayIndex(startDate: string, date: string): number {
  const ms = new Date(`${date}T00:00:00Z`).getTime() - new Date(`${startDate}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000);
}
