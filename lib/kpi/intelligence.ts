// ─── SEO Intelligence: Decision Layer ─────────────────────────────────────────
// Reine, getestete Ableitungen über den importierten GSC-Daten. Jede Karte im
// Dashboard beantwortet drei Fragen: Was ist passiert? Warum? Was tun wir
// jetzt? Alles hier ist deterministisch nachrechenbar – keine KI, keine
// erfundenen Werte, keine Kausalitätsbehauptungen. Zwei Datenwelten, sauber
// getrennt: Tageszeilen je Scope liefern Trends (28-Tage-Vergleich),
// Dimensions-Snapshots liefern Tiefe (Queries/Seiten, aggregiert über den
// gesamten Exportzeitraum – nie als Tagesdaten interpretiert).

import type { GscDimensionSnapshotRow, LevelDe, TaskRow } from "./types";
import type { PeriodComparison, ScopeOption } from "./gscData";

/* ── Schwellen (dokumentiert, deterministisch) ──────────────────────────────── */

/** Positionsfenster, in dem Snippet-/Content-Optimierung am schnellsten wirkt. */
export const QUICK_WIN_POSITION_MIN = 4;
export const QUICK_WIN_POSITION_MAX = 15;
/** Mindest-Impressionen im Exportzeitraum, damit eine Zeile relevant ist. */
export const QUICK_WIN_MIN_IMPRESSIONS = 200;
/** CTR unterhalb dieses Anteils der üblichen Klickrate gilt als auffällig. */
export const QUICK_WIN_CTR_FACTOR = 0.65;
/** Content-Chancen: viel Nachfrage, aber Position jenseits dieser Schwelle. */
export const CONTENT_MIN_IMPRESSIONS = 250;
export const CONTENT_POSITION_MIN = 12;
/** Unterhalb dieser relativen Veränderung gilt ein Scope als stabil. */
export const MOVEMENT_THRESHOLD_PCT = 5;
/** Positionsverschiebung ab dieser Differenz gilt als spürbar. */
export const POSITION_SHIFT = 0.5;
/** Kleine Basis: absolute Klickdifferenz, die trotzdem als Bewegung zählt. */
export const LOW_BASE_ABS_MOVEMENT = 3;

const de = (n: number, digits = 0) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: digits });

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function fmtDelta(pct: number): string {
  return `${pct > 0 ? "+" : ""}${de(pct, 1)} %`;
}

/* ── Übliche Klickrate je Position ──────────────────────────────────────────────
   Konservativ gerundete Richtwerte aus öffentlichen CTR-Studien; sie dienen
   ausschließlich als Vergleichsmaßstab ("üblich wären etwa …"), nie als
   Versprechen. Obergrenze inklusive. */
const EXPECTED_CTR_STEPS: Array<[number, number]> = [
  [1.5, 0.25],
  [2.5, 0.13],
  [3.5, 0.09],
  [4.5, 0.06],
  [5.5, 0.045],
  [6.5, 0.035],
  [7.5, 0.03],
  [8.5, 0.025],
  [9.5, 0.02],
  [10.5, 0.017],
  [12.5, 0.012],
  [15.5, 0.009],
  [20.5, 0.006],
];

/** Übliche Klickrate (Anteil 0..1) für eine durchschnittliche Position. */
export function expectedCtr(position: number): number {
  for (const [max, ctr] of EXPECTED_CTR_STEPS) {
    if (position <= max) return ctr;
  }
  return 0.004;
}

/* ── Opportunity Score ──────────────────────────────────────────────────────────
   Drei dokumentierte Faktoren: Nachfrage (Impressionen), Positionsnähe zur
   ersten Seite und Abstand zur üblichen Klickrate. Optionaler Trend-Aufschlag,
   wenn ein Vergleich vorliegt. 0..100 Punkte -> hoch / mittel / niedrig. */

export interface OpportunityScore {
  points: number;
  level: LevelDe;
  /** 1..5 für den Action Feed. */
  stars: 1 | 2 | 3 | 4 | 5;
}

function volumePoints(impressions: number): number {
  if (impressions >= 5000) return 30;
  if (impressions >= 2000) return 24;
  if (impressions >= 1000) return 18;
  if (impressions >= 500) return 12;
  if (impressions >= 200) return 6;
  return 2;
}

function positionPoints(position: number): number {
  if (position >= 4 && position <= 10) return 35;
  if (position > 10 && position <= 12) return 28;
  if (position > 12 && position <= 15) return 20;
  if (position > 15 && position <= 20) return 12;
  if (position < 4) return 10; // bereits oben, wenig Hebel nach oben
  return 6;
}

function ctrGapPoints(ctr: number, expected: number): number {
  if (expected <= 0) return 4;
  const ratio = ctr / expected;
  if (ratio <= 0.3) return 35;
  if (ratio <= 0.5) return 28;
  if (ratio <= QUICK_WIN_CTR_FACTOR) return 20;
  if (ratio <= 0.85) return 10;
  return 4;
}

function starsForPoints(points: number): OpportunityScore["stars"] {
  if (points >= 85) return 5;
  if (points >= 65) return 4;
  if (points >= 45) return 3;
  if (points >= 25) return 2;
  return 1;
}

function levelForPoints(points: number): LevelDe {
  return points >= 65 ? "hoch" : points >= 40 ? "mittel" : "niedrig";
}

export function scoreOpportunity(input: {
  impressions: number;
  position: number;
  ctr: number;
  /** Klick-Trend in Prozent; deutlicher Rückgang erhöht die Dringlichkeit. */
  trendDeltaPct?: number | null;
}): OpportunityScore {
  let points =
    volumePoints(input.impressions) +
    positionPoints(input.position) +
    ctrGapPoints(input.ctr, expectedCtr(input.position));
  if (input.trendDeltaPct !== undefined && input.trendDeltaPct !== null && input.trendDeltaPct < -15) {
    points += 10;
  }
  points = Math.min(100, points);
  return { points, level: levelForPoints(points), stars: starsForPoints(points) };
}

/**
 * Bewertung einer Content-Chance: hier zählt die Nachfrage doppelt, denn weit
 * hinter Seite 1 ist eine niedrige Klickrate normal und sagt nichts über das
 * Potenzial des Themas aus. Frageähnliche Suchanfragen erhalten einen
 * Aufschlag, weil ein Ratgeber die Intention direkt beantworten kann.
 */
export function scoreContentOpportunity(input: {
  impressions: number;
  position: number;
  guideIntent: boolean;
}): OpportunityScore {
  let points = Math.min(60, volumePoints(input.impressions) * 2);
  if (input.position <= 20) points += 25;
  else if (input.position <= 30) points += 15;
  else points += 8;
  if (input.guideIntent) points += 15;
  points = Math.min(100, points);
  return { points, level: levelForPoints(points), stars: starsForPoints(points) };
}

/* ── Gemeinsame Bausteine ───────────────────────────────────────────────────── */

export interface ScopeComparison {
  option: ScopeOption;
  comparison: PeriodComparison | null;
}

interface DimensionEntry {
  value: string;
  clicks: number;
  impressions: number;
  /** Anteil 0..1. */
  ctr: number;
  position: number;
  periodStart: string;
  periodEnd: string;
}

function entriesOf(
  dimensions: GscDimensionSnapshotRow[],
  batchId: string,
  type: GscDimensionSnapshotRow["dimension_type"],
): DimensionEntry[] {
  return dimensions
    .filter((d) => d.import_batch_id === batchId && d.dimension_type === type)
    .map((d) => ({
      value: d.dimension_value,
      clicks: Number(d.clicks),
      impressions: Number(d.impressions),
      ctr: Number(d.ctr),
      position: Number(d.position),
      periodStart: d.period_start,
      periodEnd: d.period_end,
    }));
}

/** Monate im Exportzeitraum (für vorsichtige "pro Monat"-Normalisierung). */
export function monthsInPeriod(startIso: string, endIso: string): number {
  const start = new Date(`${startIso}T00:00:00Z`).getTime();
  const end = new Date(`${endIso}T00:00:00Z`).getTime();
  const days = Math.max(1, Math.round((end - start) / 86_400_000) + 1);
  return Math.max(1, days / 30.44);
}

/** URL-Pfad ohne Domain, für ruhige Seitenbezeichnungen. */
export function pathOfUrl(url: string): string {
  const m = url.match(/^https?:\/\/[^/]+(\/.*)?$/);
  return m ? (m[1] ?? "/") : url;
}

/* ── Quick Wins ─────────────────────────────────────────────────────────────────
   Sichtbar, aber unterdurchschnittlich geklickt: Position 4–15, spürbare
   Nachfrage, Klickrate deutlich unter dem Richtwert. Die Empfehlung folgt
   deterministisch aus dem Positionsfenster. */

export type QuickWinAction = "meta" | "faq" | "links";

export interface QuickWin {
  key: string;
  kind: "query" | "page";
  /** Suchanfrage oder Seitenpfad. */
  subject: string;
  pageUrl: string | null;
  what: string;
  why: string;
  action: string;
  actionKind: QuickWinAction;
  score: OpportunityScore;
  /** Rechnerisches Zusatzpotenzial pro Monat; null, wenn zu klein für eine Aussage. */
  potentialMonthlyClicks: number | null;
  metrics: { clicks: number; impressions: number; ctrPct: number; position: number };
  periodStart: string;
  periodEnd: string;
}

const QUICK_WIN_ACTION_TEXT: Record<QuickWinAction, string> = {
  meta: "Meta-Titel und Description schärfen: das Ergebnis ist sichtbar, gewinnt den Klick aber nicht.",
  faq: "Snippet schärfen und die Seite um eine FAQ zur Suchintention ergänzen.",
  links:
    "Interne Links von starken Seiten setzen und den Inhalt vertiefen, um stabil auf Seite 1 zu kommen.",
};

function quickWinActionFor(position: number): QuickWinAction {
  if (position <= 7.5) return "meta";
  if (position <= 12) return "faq";
  return "links";
}

function buildQuickWin(entry: DimensionEntry, kind: QuickWin["kind"]): QuickWin {
  const expected = expectedCtr(entry.position);
  const actionKind = quickWinActionFor(entry.position);
  const months = monthsInPeriod(entry.periodStart, entry.periodEnd);
  const potential = Math.round((entry.impressions / months) * Math.max(0, expected - entry.ctr));
  const subject = kind === "page" ? pathOfUrl(entry.value) : entry.value;
  return {
    key: `qw-${kind}-${entry.value}`,
    kind,
    subject,
    pageUrl: kind === "page" ? entry.value : null,
    what: `${de(entry.impressions)} Impressionen im Exportzeitraum, Ø Position ${de(entry.position, 1)}, CTR ${de(entry.ctr * 100, 2)} %.`,
    why: `Bei Position ${de(entry.position, 1)} sind rechnerisch etwa ${de(expected * 100, 1)} % Klickrate üblich; aktuell ${de(entry.ctr * 100, 2)} %. Die Sichtbarkeit ist da, der Klick geht an andere Ergebnisse.`,
    action: QUICK_WIN_ACTION_TEXT[actionKind],
    actionKind,
    score: scoreOpportunity({
      impressions: entry.impressions,
      position: entry.position,
      ctr: entry.ctr,
    }),
    potentialMonthlyClicks: potential >= 3 ? potential : null,
    metrics: {
      clicks: entry.clicks,
      impressions: entry.impressions,
      ctrPct: entry.ctr * 100,
      position: entry.position,
    },
    periodStart: entry.periodStart,
    periodEnd: entry.periodEnd,
  };
}

function isQuickWinCandidate(e: DimensionEntry): boolean {
  return (
    e.impressions >= QUICK_WIN_MIN_IMPRESSIONS &&
    e.position >= QUICK_WIN_POSITION_MIN &&
    e.position <= QUICK_WIN_POSITION_MAX &&
    e.ctr < expectedCtr(e.position) * QUICK_WIN_CTR_FACTOR
  );
}

export function buildQuickWins(
  dimensions: GscDimensionSnapshotRow[],
  batchId: string,
  limits: { queries?: number; pages?: number } = {},
): QuickWin[] {
  const queryWins = entriesOf(dimensions, batchId, "query")
    .filter(isQuickWinCandidate)
    .map((e) => buildQuickWin(e, "query"));
  const pageWins = entriesOf(dimensions, batchId, "page")
    .filter(isQuickWinCandidate)
    .map((e) => buildQuickWin(e, "page"));
  const byScore = (a: QuickWin, b: QuickWin) =>
    b.score.points - a.score.points || b.metrics.impressions - a.metrics.impressions;
  return [
    ...queryWins.sort(byScore).slice(0, limits.queries ?? 4),
    ...pageWins.sort(byScore).slice(0, limits.pages ?? 2),
  ].sort(byScore);
}

/* ── Geräte-Beobachtung ─────────────────────────────────────────────────────────
   Aus dem Geräte-Snapshot: klickt Mobil deutlich schlechter als Desktop,
   obwohl ein relevanter Teil der Reichweite mobil ist, lohnt der Blick auf
   die mobile Darstellung. Reine Beobachtung mit vorsichtiger Einordnung. */

export interface DeviceInsight {
  what: string;
  why: string;
  action: string;
  mobileCtrPct: number;
  desktopCtrPct: number;
  /** Mobiler Anteil an allen Impressionen, 0..1. */
  mobileShare: number;
}

export const DEVICE_MIN_SHARE = 0.35;
export const DEVICE_CTR_FACTOR = 0.6;
export const DEVICE_MIN_IMPRESSIONS = 500;

export function buildDeviceInsight(
  dimensions: GscDimensionSnapshotRow[],
  batchId: string,
): DeviceInsight | null {
  const devices = entriesOf(dimensions, batchId, "device");
  const mobile = devices.find((d) => d.value.toLowerCase().startsWith("mobil"));
  const desktop = devices.find((d) => d.value.toLowerCase() === "desktop");
  if (!mobile || !desktop) return null;
  if (mobile.impressions < DEVICE_MIN_IMPRESSIONS || desktop.impressions < DEVICE_MIN_IMPRESSIONS) {
    return null;
  }
  const total = devices.reduce((acc, d) => acc + d.impressions, 0);
  const mobileShare = total > 0 ? mobile.impressions / total : 0;
  if (mobileShare < DEVICE_MIN_SHARE) return null;
  if (mobile.ctr >= desktop.ctr * DEVICE_CTR_FACTOR) return null;
  return {
    what: `Mobil liegt die CTR bei ${de(mobile.ctr * 100, 2)} %, am Desktop bei ${de(desktop.ctr * 100, 2)} % – bei ${de(mobileShare * 100, 0)} % mobiler Reichweite.`,
    why: "Mobile Suchergebnisse zeigen weniger Text und andere Elemente; ein Snippet, das am Desktop funktioniert, kann mobil untergehen. Ursache offen.",
    action: "Titel und Description der wichtigsten Seiten in der mobilen Suche prüfen und kürzen, wo sie abgeschnitten werden.",
    mobileCtrPct: mobile.ctr * 100,
    desktopCtrPct: desktop.ctr * 100,
    mobileShare,
  };
}

/* ── Gewinner & Verlierer ───────────────────────────────────────────────────────
   Bewegungen je Scope aus den täglichen Exportwerten (aktuelle Periode gegen
   Vorperiode). "Warum" ist der dominante messbare Treiber – Reichweite,
   Position oder Klickrate – ohne Kausalitätsbehauptung darüber hinaus. */

export type MovementDriver = "impressions" | "position" | "ctr";

export interface ScopeMovement {
  option: ScopeOption;
  direction: "winner" | "loser";
  what: string;
  why: string;
  action: string;
  driver: MovementDriver;
  clicks: number;
  previousClicks: number;
  deltaPct: number | null;
  positionNow: number | null;
  positionPrev: number | null;
  lowBase: boolean;
  /** Klickstärkste Suchanfragen des Scopes, aggregiert über den Exportzeitraum. */
  topQueries: Array<{ query: string; clicks: number }>;
}

function movementDriver(c: PeriodComparison, direction: "winner" | "loser"): MovementDriver {
  const posNow = c.current.position;
  const posPrev = c.previous.position;
  const posShift = posNow !== null && posPrev !== null ? posNow - posPrev : 0;
  const imprPct = pctChange(c.current.impressions, c.previous.impressions);
  if (direction === "winner") {
    if (posShift <= -POSITION_SHIFT) return "position";
    if (imprPct !== null && imprPct > MOVEMENT_THRESHOLD_PCT) return "impressions";
    return "ctr";
  }
  if (posShift >= POSITION_SHIFT) return "position";
  if (imprPct !== null && imprPct < -MOVEMENT_THRESHOLD_PCT) return "impressions";
  return "ctr";
}

function movementWhy(c: PeriodComparison, direction: "winner" | "loser", driver: MovementDriver): string {
  const posNow = c.current.position;
  const posPrev = c.previous.position;
  const imprPct = pctChange(c.current.impressions, c.previous.impressions);
  const ctrNow = c.current.ctr !== null ? c.current.ctr * 100 : null;
  const ctrPrev = c.previous.ctr !== null ? c.previous.ctr * 100 : null;

  if (driver === "position" && posNow !== null && posPrev !== null) {
    return direction === "winner"
      ? `Die Ø Position hat sich von ${de(posPrev, 1)} auf ${de(posNow, 1)} verbessert.`
      : `Rankings geben nach: Ø Position ${de(posNow, 1)} statt ${de(posPrev, 1)}.`;
  }
  if (driver === "impressions" && imprPct !== null) {
    return direction === "winner"
      ? `Google spielt die Seite häufiger aus (Impressionen ${fmtDelta(imprPct)}).`
      : `Google spielt die Seite seltener aus (Impressionen ${fmtDelta(imprPct)}).`;
  }
  if (ctrNow !== null && ctrPrev !== null) {
    return direction === "winner"
      ? `Bei ähnlicher Reichweite stieg die Klickrate von ${de(ctrPrev, 2)} % auf ${de(ctrNow, 2)} %.`
      : `Die Reichweite ist stabil, aber der Klick geht häufiger an andere Suchergebnisse (CTR ${de(ctrNow, 2)} % statt ${de(ctrPrev, 2)} %).`;
  }
  return direction === "winner" ? "Mehr Klicks als in der Vorperiode." : "Weniger Klicks als in der Vorperiode.";
}

const LOSER_ACTION: Record<MovementDriver, string> = {
  position: "Inhalt und interne Verlinkung der Seite prüfen; die wichtigsten Rankings gezielt stützen.",
  impressions:
    "Indexierung und Nachfrage beobachten; prüfen, für welche Suchanfragen die Sichtbarkeit zurückging.",
  ctr: "Meta-Titel und Description gegen die aktuell besser klickenden Ergebnisse prüfen.",
};

const WINNER_ACTION: Record<MovementDriver, string> = {
  position: "Absichern: Inhalt aktuell halten und die gewonnenen Rankings nicht umbauen.",
  impressions: "Die zusätzliche Reichweite nutzen: Snippet prüfen, damit aus Einblendungen Klicks werden.",
  ctr: "Festhalten, was am Snippet funktioniert, und auf ähnliche Seiten übertragen.",
};

/** Klickstärkste Suchanfragen eines Batches (Aggregat über den Exportzeitraum). */
export function topQueriesFor(
  dimensions: GscDimensionSnapshotRow[],
  batchId: string,
  limit = 3,
): Array<{ query: string; clicks: number }> {
  return entriesOf(dimensions, batchId, "query")
    .filter((e) => e.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit)
    .map((e) => ({ query: e.value, clicks: e.clicks }));
}

export function buildScopeMovements(
  scopes: ScopeComparison[],
  dimensions: GscDimensionSnapshotRow[] = [],
): {
  winners: ScopeMovement[];
  losers: ScopeMovement[];
} {
  const winners: ScopeMovement[] = [];
  const losers: ScopeMovement[] = [];

  for (const { option, comparison: c } of scopes) {
    if (!c) continue;
    const cur = c.current.clicks;
    const prev = c.previous.clicks;
    const delta = c.clicksDeltaPct;
    const posShift =
      c.current.position !== null && c.previous.position !== null
        ? c.current.position - c.previous.position
        : 0;

    const grows = c.lowBase
      ? cur - prev >= LOW_BASE_ABS_MOVEMENT
      : (delta !== null && delta > MOVEMENT_THRESHOLD_PCT) || (delta === null && cur > 0);
    const shrinks = c.lowBase
      ? prev - cur >= LOW_BASE_ABS_MOVEMENT || posShift >= 1
      : delta !== null && delta < -MOVEMENT_THRESHOLD_PCT;

    if (!grows && !shrinks) continue;
    const direction: ScopeMovement["direction"] = grows ? "winner" : "loser";
    const driver = movementDriver(c, direction);
    const what = c.lowBase
      ? `${c.comparisonLabel}.`
      : `${de(cur)} statt ${de(prev)} Klicks (${delta === null ? "aus dem Stand" : fmtDelta(delta)}).`;

    const movement: ScopeMovement = {
      option,
      direction,
      what,
      why: movementWhy(c, direction, driver),
      action: direction === "winner" ? WINNER_ACTION[driver] : LOSER_ACTION[driver],
      driver,
      clicks: cur,
      previousClicks: prev,
      deltaPct: delta,
      positionNow: c.current.position,
      positionPrev: c.previous.position,
      lowBase: c.lowBase,
      topQueries: topQueriesFor(dimensions, option.batchId),
    };
    (direction === "winner" ? winners : losers).push(movement);
  }

  winners.sort((a, b) => (b.deltaPct ?? Infinity) - (a.deltaPct ?? Infinity) || b.clicks - a.clicks);
  losers.sort((a, b) => (a.deltaPct ?? 0) - (b.deltaPct ?? 0) || b.previousClicks - a.previousClicks);
  return { winners, losers };
}

/* ── Content Opportunities ──────────────────────────────────────────────────────
   Suchanfragen mit spürbarer Nachfrage, für die Klühspies (noch) nicht auf
   Seite 1 steht. Frageähnliche Suchanfragen werden als Ratgeber-Thema
   empfohlen, übrige als Ausbau bestehender Inhalte. */

const INTENT_WORDS = [
  "wie",
  "was",
  "warum",
  "welche",
  "wann",
  "wo",
  "kosten",
  "teuer",
  "preis",
  "dauer",
  "ideen",
  "tipps",
  "checkliste",
  "planen",
  "organisieren",
];

export function hasGuideIntent(query: string): boolean {
  const words = query.toLowerCase().split(/\s+/);
  return INTENT_WORDS.some((w) => words.includes(w));
}

export interface ContentOpportunity {
  key: string;
  topic: string;
  format: "Ratgeber-Beitrag" | "Bestehende Seite ausbauen";
  what: string;
  why: string;
  action: string;
  score: OpportunityScore;
  metrics: { clicks: number; impressions: number; ctrPct: number; position: number };
  periodStart: string;
  periodEnd: string;
}

export function buildContentOpportunities(
  dimensions: GscDimensionSnapshotRow[],
  batchId: string,
  limit = 4,
): ContentOpportunity[] {
  const candidates = entriesOf(dimensions, batchId, "query")
    .filter((e) => e.impressions >= CONTENT_MIN_IMPRESSIONS && e.position > CONTENT_POSITION_MIN)
    .sort((a, b) => b.impressions - a.impressions);

  const chosen: ContentOpportunity[] = [];
  for (const e of candidates) {
    if (chosen.length >= limit) break;
    // Nahezu identische Themen nicht doppelt empfehlen ("kosten klassenfahrt"
    // vs. "klassenfahrt kosten"): gleiche Wortmenge oder Teilmenge überspringen.
    const tokens = new Set(e.value.toLowerCase().split(/\s+/));
    const duplicate = chosen.some((c) => {
      const other = new Set(c.topic.toLowerCase().split(/\s+/));
      const [small, large] = tokens.size <= other.size ? [tokens, other] : [other, tokens];
      let contained = 0;
      for (const t of small) if (large.has(t)) contained += 1;
      return contained === small.size;
    });
    if (duplicate) continue;

    const guide = hasGuideIntent(e.value);
    const demand = e.impressions >= 2000 ? "hohe" : "spürbare";
    chosen.push({
      key: `co-${e.value}`,
      topic: e.value,
      format: guide ? "Ratgeber-Beitrag" : "Bestehende Seite ausbauen",
      what: `${de(e.impressions)} Impressionen im Exportzeitraum, aber nur ${de(e.clicks)} Klicks bei Ø Position ${de(e.position, 1)}.`,
      why: `Es gibt ${demand} Nachfrage, die aktuell an besser platzierte Ergebnisse geht – Klühspies ist dafür noch nicht auf Seite 1 sichtbar.`,
      action: guide
        ? `Einen Ratgeber-Beitrag zu „${e.value}“ erstellen, der die Frage konkret beantwortet, und intern von den Produktseiten verlinken.`
        : `Den bestehenden Inhalt zu „${e.value}“ ausbauen und intern stärker verlinken, um die Position Richtung Seite 1 zu bewegen.`,
      score: scoreContentOpportunity({
        impressions: e.impressions,
        position: e.position,
        guideIntent: guide,
      }),
      metrics: {
        clicks: e.clicks,
        impressions: e.impressions,
        ctrPct: e.ctr * 100,
        position: e.position,
      },
      periodStart: e.periodStart,
      periodEnd: e.periodEnd,
    });
  }
  return chosen;
}

/* ── SEO Health ─────────────────────────────────────────────────────────────────
   Ein ruhiger Zustand je Scope: wächst, stabil oder braucht Aufmerksamkeit.
   Bei kleiner Basis entscheidet die Positionsentwicklung statt Prozentwerten. */

export type HealthStatus = "growing" | "stable" | "attention";

export const HEALTH_STATUS_LABEL: Record<HealthStatus, string> = {
  growing: "Wächst",
  stable: "Stabil",
  attention: "Braucht Aufmerksamkeit",
};

export interface HealthRow {
  option: ScopeOption;
  status: HealthStatus;
  statusLabel: string;
  what: string;
  action: string;
}

const HEALTH_ACTION: Record<HealthStatus, string> = {
  growing: "Gewinn absichern: nichts Grundlegendes umbauen, Entwicklung weiter beobachten.",
  stable: "Kein akuter Handlungsbedarf; Chancen aus Quick Wins und Content nutzen.",
  attention: "Maßnahme priorisieren und die Ursache auf Seiten- und Query-Ebene eingrenzen.",
};

export function buildSeoHealth(scopes: ScopeComparison[]): HealthRow[] {
  const rows: HealthRow[] = [];
  for (const { option, comparison: c } of scopes) {
    if (!c) continue;
    const delta = c.clicksDeltaPct;
    const posShift =
      c.current.position !== null && c.previous.position !== null
        ? c.current.position - c.previous.position
        : 0;

    let status: HealthStatus = "stable";
    if (c.lowBase) {
      if (posShift >= 1) status = "attention";
      else if (c.current.clicks - c.previous.clicks >= LOW_BASE_ABS_MOVEMENT) status = "growing";
    } else if ((delta !== null && delta < -MOVEMENT_THRESHOLD_PCT) || posShift >= 1) {
      status = "attention";
    } else if (delta !== null && delta > MOVEMENT_THRESHOLD_PCT) {
      status = "growing";
    }

    const positionText =
      c.current.position !== null ? `, Ø Position ${de(c.current.position, 1)}` : "";
    const what = c.lowBase
      ? `${c.comparisonLabel}${positionText}.`
      : `${de(c.current.clicks)} statt ${de(c.previous.clicks)} Klicks (${delta === null ? "aus dem Stand" : fmtDelta(delta)})${positionText}.`;

    rows.push({ option, status, statusLabel: HEALTH_STATUS_LABEL[status], what, action: HEALTH_ACTION[status] });
  }
  const rank: Record<HealthStatus, number> = { attention: 0, growing: 1, stable: 2 };
  return rows.sort((a, b) => rank[a.status] - rank[b.status]);
}

/* ── Executive-Zusammenfassung ──────────────────────────────────────────────────
   Konkrete Lage in wenigen Sätzen: Gesamtentwicklung, stärkste positive und
   negative Bewegung mit Namen und Zahlen, dazu genau eine Priorität. Jede
   Aussage ist aus den 28-Tage-Vergleichen nachrechenbar. */

export interface ExecutiveNarrative {
  statements: string[];
  /** Scope-Label mit höchster Priorität; null, wenn nichts drängt. */
  priorityLabel: string | null;
  prioritySentence: string | null;
}

export function buildExecutiveNarrative(
  base: PeriodComparison | null,
  productScopes: ScopeComparison[],
): ExecutiveNarrative {
  if (!base) {
    return {
      statements: [
        "Sobald ein Search-Console-Export importiert ist, erscheint hier die Entwicklung.",
      ],
      priorityLabel: null,
      prioritySentence: null,
    };
  }

  const statements: string[] = [];
  const delta = base.clicksDeltaPct;
  if (base.lowBase) {
    statements.push(
      `Die organischen Klicks der Städtereise-Seiten: ${base.comparisonLabel} in 28 Tagen.`,
    );
  } else if (delta !== null && delta > MOVEMENT_THRESHOLD_PCT) {
    statements.push(
      `Die organischen Klicks der Städtereise-Seiten liegen ${de(delta, 1)} % über der Vorperiode (${base.comparisonLabel}).`,
    );
  } else if (delta !== null && delta < -MOVEMENT_THRESHOLD_PCT) {
    statements.push(
      `Die organischen Klicks der Städtereise-Seiten liegen ${de(Math.abs(delta), 1)} % unter der Vorperiode (${base.comparisonLabel}).`,
    );
  } else {
    statements.push(
      `Die organischen Klicks der Städtereise-Seiten sind stabil (${base.comparisonLabel}).`,
    );
  }

  const { winners, losers } = buildScopeMovements(productScopes);
  const topWinner = winners[0] ?? null;
  const topLoser = losers[0] ?? null;

  if (topWinner) {
    statements.push(`${topWinner.option.label} entwickelt sich positiv: ${topWinner.what}`);
  }
  if (topLoser) {
    const posPart =
      topLoser.driver === "position" && topLoser.positionNow !== null && topLoser.positionPrev !== null
        ? ` Ø Position ${de(topLoser.positionNow, 1)} statt ${de(topLoser.positionPrev, 1)}.`
        : "";
    statements.push(`${topLoser.option.label} verliert: ${topLoser.what}${posPart}`);
  }

  if (topLoser) {
    return {
      statements,
      priorityLabel: topLoser.option.label,
      prioritySentence: `Die höchste Priorität liegt aktuell bei ${topLoser.option.label}.`,
    };
  }

  // Ohne Verlierer: der wichtigste Hebel aus dem Gesamtbild.
  const imprPct = pctChange(base.current.impressions, base.previous.impressions);
  if (imprPct !== null && imprPct > MOVEMENT_THRESHOLD_PCT && (delta === null || delta <= MOVEMENT_THRESHOLD_PCT)) {
    return {
      statements,
      priorityLabel: null,
      prioritySentence:
        "Die höchste Priorität liegt darin, die gewachsene Reichweite in Klicks zu übersetzen.",
    };
  }
  return { statements, priorityLabel: null, prioritySentence: null };
}

/* ── Action Feed ────────────────────────────────────────────────────────────────
   Aus allen Ableitungen wird eine priorisierte Aufgabenliste: konkrete Titel,
   Begründung mit Zahlen, Sterne aus dem Opportunity Score bzw. der Schwere
   des Rückgangs. Bereits angelegte (offene) Maßnahmen werden nicht erneut
   empfohlen. */

export interface ActionDraftSeed {
  source: "query" | "page" | "loser" | "device";
  observation: string;
  query?: string;
  pageUrl?: string;
  metrics?: { clicks?: number; previousClicks?: number; impressions?: number; ctr?: number; position?: number };
}

export interface ActionFeedItem {
  key: string;
  stars: 1 | 2 | 3 | 4 | 5;
  title: string;
  why: string;
  sourceLabel: string;
  draft: ActionDraftSeed;
}

const QUICK_WIN_TITLE: Record<QuickWinAction, (subject: string) => string> = {
  meta: (s) => `Meta-Snippet für „${s}“ optimieren`,
  faq: (s) => `FAQ zur Suchanfrage „${s}“ ergänzen`,
  links: (s) => `Interne Links für „${s}“ stärken`,
};

function loserStars(l: ScopeMovement): ActionFeedItem["stars"] {
  const severe =
    (l.deltaPct !== null && l.deltaPct <= -30) ||
    (l.positionNow !== null && l.positionPrev !== null && l.positionNow - l.positionPrev >= 2);
  return severe ? 5 : 4;
}

export function buildActionFeed(input: {
  quickWins: QuickWin[];
  losers: ScopeMovement[];
  opportunities: ContentOpportunity[];
  deviceInsight: DeviceInsight | null;
  /** Offene Maßnahmen; bereits adressierte Empfehlungen werden ausgeblendet. */
  openTasks: TaskRow[];
  limit?: number;
}): ActionFeedItem[] {
  const items: Array<ActionFeedItem & { rank: number }> = [];

  for (const l of input.losers) {
    items.push({
      key: `af-loser-${l.option.key}`,
      stars: loserStars(l),
      title:
        l.driver === "position"
          ? `Rankings der Seite ${l.option.label} stabilisieren`
          : l.driver === "ctr"
            ? `Snippet der Seite ${l.option.label} überarbeiten`
            : `Sichtbarkeitsverlust bei ${l.option.label} eingrenzen`,
      why: `${l.what} ${l.why}`,
      sourceLabel: "Verlierer · 28 Tage",
      draft: {
        source: "loser",
        observation: `${l.option.label}: ${l.what} ${l.why}`,
        metrics: { clicks: l.clicks, previousClicks: l.previousClicks },
      },
      rank: 100 + (l.deltaPct !== null ? -l.deltaPct : 50),
    });
  }

  for (const w of input.quickWins) {
    items.push({
      key: `af-${w.key}`,
      stars: w.score.stars,
      title:
        w.kind === "page"
          ? `Meta-Description von ${w.subject} optimieren`
          : QUICK_WIN_TITLE[w.actionKind](w.subject),
      why: `${w.what} ${w.why}`,
      sourceLabel: "Quick Win · Exportzeitraum",
      draft: {
        source: w.kind === "page" ? "page" : "query",
        observation: `${w.kind === "page" ? w.subject : `Suchanfrage „${w.subject}“`}: ${w.what} ${w.why}`,
        query: w.kind === "query" ? w.subject : undefined,
        pageUrl: w.pageUrl ?? undefined,
        metrics: {
          clicks: w.metrics.clicks,
          impressions: w.metrics.impressions,
          ctr: w.metrics.ctrPct,
          position: w.metrics.position,
        },
      },
      rank: w.score.points,
    });
  }

  for (const o of input.opportunities) {
    items.push({
      key: `af-${o.key}`,
      stars: o.score.stars,
      title:
        o.format === "Ratgeber-Beitrag"
          ? `Ratgeber zu „${o.topic}“ schreiben`
          : `Inhalt zu „${o.topic}“ ausbauen`,
      why: `${o.what} ${o.why}`,
      sourceLabel: "Content-Chance · Exportzeitraum",
      draft: {
        source: "query",
        observation: `Suchanfrage „${o.topic}“: ${o.what} ${o.why}`,
        query: o.topic,
        metrics: {
          clicks: o.metrics.clicks,
          impressions: o.metrics.impressions,
          ctr: o.metrics.ctrPct,
          position: o.metrics.position,
        },
      },
      rank: o.score.points - 5,
    });
  }

  if (input.deviceInsight) {
    const d = input.deviceInsight;
    items.push({
      key: "af-device-mobile",
      stars: 3,
      title: "Mobile Darstellung der Suchergebnisse prüfen",
      why: `${d.what} ${d.why}`,
      sourceLabel: "Geräte · Exportzeitraum",
      draft: { source: "device", observation: `${d.what} ${d.why}` },
      rank: 50,
    });
  }

  // Bereits als offene Maßnahme vorhanden? Dann nicht erneut empfehlen.
  const open = input.openTasks.filter((t) => t.deleted_at === null && t.status !== "closed");
  const addressed = (item: ActionFeedItem) =>
    open.some((t) => {
      const ic = t.insight_context;
      if (t.title.trim().toLowerCase() === item.title.trim().toLowerCase()) return true;
      if (item.draft.query && ic?.query === item.draft.query) return true;
      if (item.draft.pageUrl && ic?.pageUrl === item.draft.pageUrl) return true;
      return false;
    });

  return items
    .filter((i) => !addressed(i))
    .sort((a, b) => b.stars - a.stars || b.rank - a.rank)
    .slice(0, input.limit ?? 6)
    .map((i) => ({
      key: i.key,
      stars: i.stars,
      title: i.title,
      why: i.why,
      sourceLabel: i.sourceLabel,
      draft: i.draft,
    }));
}
