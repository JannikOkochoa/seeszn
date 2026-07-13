// ─── Executive Cockpit: deterministische Ableitungen ──────────────────────────
// Reine, getestete Funktionen über den echten GSC-Importdaten. Keine KI, keine
// Kausalitätsbehauptungen, keine erfundenen Werte: jede Aussage ist eine
// nachrechenbare Beobachtung aus comparePeriods/periodTotals (lib/kpi/gscData).
// Die UI-Komponenten rendern nur, was hier berechnet wurde.

import type { PeriodComparison, PeriodTotals, ScopeOption } from "./gscData";

/* ── Schwellen (dokumentiert, deterministisch) ──────────────────────────────── */

/** Unterhalb dieser relativen Veränderung gilt eine Metrik als stabil. */
export const STABLE_THRESHOLD_PCT = 5;
/** Positionsveränderung ab dieser Differenz gilt als spürbar. */
export const POSITION_SHIFT_THRESHOLD = 1;

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function direction(pct: number | null, threshold = STABLE_THRESHOLD_PCT): "up" | "down" | "flat" {
  if (pct === null) return "up"; // aus 0 heraus gewachsen
  if (pct > threshold) return "up";
  if (pct < -threshold) return "down";
  return "flat";
}

/* ── Executive Intro: Zusammenfassung in maximal zwei Sätzen ────────────────── */

/** Tageszeitabhängige Begrüßung; deterministisch aus der Stunde. */
export function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 11) return "Guten Morgen.";
  if (hour >= 11 && hour < 18) return "Guten Tag.";
  return "Guten Abend.";
}

/**
 * Deterministische Zusammenfassung aus dem 28-Tage-Vergleich des
 * Standard-Scopes. Regeln entsprechen der Auftragslogik; ohne Vergleich
 * (Gesamtzeitraum oder keine Daten) gibt es eine ehrliche Standardaussage.
 */
export function buildExecutiveSummary(comparison: PeriodComparison | null): string {
  if (!comparison) {
    return "Sobald ein Search-Console-Export importiert ist, erscheint hier die Entwicklung.";
  }
  const { current, previous } = comparison;
  const clicksPct = pctChange(current.clicks, previous.clicks);
  const imprPct = pctChange(current.impressions, previous.impressions);
  const clicksDir = direction(clicksPct);
  const imprDir = direction(imprPct);
  const positionWorse =
    current.position !== null &&
    previous.position !== null &&
    current.position - previous.position > POSITION_SHIFT_THRESHOLD;

  if (imprDir === "up" && clicksDir === "down") {
    return "Die Reichweite steigt, aber sie führt aktuell zu weniger Klicks.";
  }
  if (imprDir === "up" && clicksDir === "up") {
    return "Organische Nachfrage und Reichweite entwickeln sich positiv.";
  }
  if (clicksDir === "down" && positionWorse) {
    return "Die organische Sichtbarkeit hat sich in der aktuellen Periode abgeschwächt.";
  }
  if (clicksDir === "flat" && imprDir === "flat") {
    return "Die organische Entwicklung ist weitgehend stabil.";
  }
  if (clicksDir === "down") {
    return "Die organischen Klicks liegen unter der Vorperiode.";
  }
  if (clicksDir === "up") {
    return "Die organischen Klicks liegen über der Vorperiode.";
  }
  return "Die organische Entwicklung ist weitgehend stabil.";
}

/* ── Vier zentrale KPI-Werte, datengetrieben und austauschbar ───────────────── */

export interface ExecutiveKpiModel {
  key: "clicks" | "impressions" | "ctr" | "position";
  label: string;
  /** Formatierter Anzeigewert. */
  value: string;
  /** Prozentveränderung zur Vorperiode; null wenn nicht berechenbar. */
  deltaPct: number | null;
  /** Absoluter Vorperiodenwert, formatiert ("zuvor 90"). */
  previousValue: string;
  /** Fachliche Richtung: ist die Veränderung gut, schlecht oder neutral? */
  assessment: "better" | "worse" | "neutral";
  /** Kleine Basis: Prozentwert nicht hervorheben. */
  lowBase: boolean;
  /** Vollständiger Screenreader-Satz inkl. absoluter Werte. */
  srText: string;
  /** Dezente Quellenangabe. */
  source: string;
}

const de = (n: number, digits = 0) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: digits });

function srDelta(pct: number | null, currentText: string, previousText: string): string {
  if (pct === null) return `Kein Vorperiodenvergleich möglich, aktuell ${currentText}, zuvor ${previousText}.`;
  const rounded = Math.abs(pct).toLocaleString("de-DE", { maximumFractionDigits: 1 });
  const dir = pct === 0 ? "unverändert gegenüber" : pct > 0 ? "mehr als" : "weniger als";
  if (pct === 0) return `Unverändert gegenüber der vorherigen Periode, aktuell ${currentText}.`;
  return `${rounded} Prozent ${dir} in der vorherigen Periode, aktuell ${currentText}, zuvor ${previousText}.`;
}

/**
 * Baut die vier Standard-KPIs aus echten Zahlen. Die Slots sind austauschbar:
 * ein späterer GA4-Wert ("Organische Anfragen") ersetzt einen Eintrag dieser
 * Liste, ohne die Grid-Komponente zu ändern.
 */
export function buildExecutiveKpis(
  totals: PeriodTotals,
  comparison: PeriodComparison | null,
  source = "GSC Export",
): ExecutiveKpiModel[] {
  const prev = comparison?.previous ?? null;

  function model(
    key: ExecutiveKpiModel["key"],
    label: string,
    current: number | null,
    previous: number | null,
    format: (n: number) => string,
    betterWhen: "up" | "down",
    lowBase: boolean,
  ): ExecutiveKpiModel {
    const valueText = current === null ? "–" : format(current);
    const previousText = previous === null ? "–" : format(previous);
    const pct = current !== null && previous !== null ? pctChange(current, previous) : null;
    let assessment: ExecutiveKpiModel["assessment"] = "neutral";
    if (pct !== null && Math.abs(pct) > 0.05) {
      const improved = betterWhen === "up" ? pct > 0 : pct < 0;
      assessment = improved ? "better" : "worse";
    }
    return {
      key,
      label,
      value: valueText,
      deltaPct: pct,
      previousValue: previousText,
      assessment,
      lowBase,
      srText: `${label}: ${srDelta(pct, valueText, previousText)}`,
      source,
    };
  }

  const lowBase = comparison?.lowBase ?? false;
  return [
    model("clicks", "Organische Klicks", totals.clicks, prev?.clicks ?? null, (n) => de(n), "up", lowBase),
    model(
      "impressions",
      "Impressionen",
      totals.impressions,
      prev?.impressions ?? null,
      (n) => de(n),
      "up",
      false,
    ),
    model(
      "ctr",
      "Klickrate",
      totals.ctr !== null ? totals.ctr * 100 : null,
      prev && prev.ctr !== null ? prev.ctr * 100 : null,
      (n) => `${de(n, 2)} %`,
      "up",
      lowBase,
    ),
    // Position: eine kleinere Zahl ist besser (betterWhen "down").
    model(
      "position",
      "Ø Position",
      totals.position,
      prev?.position ?? null,
      (n) => de(n, 1),
      "down",
      false,
    ),
  ];
}

/* ── Benötigt Aufmerksamkeit: max. drei berechnete Beobachtungen ────────────── */

export interface AttentionItem {
  key: string;
  /** Faktische Beobachtung, direkt aus den Zahlen. */
  observation: string;
  /** Konkrete Zahlen für den Detailblick. */
  numbers: string;
  /** Vorsichtige Einordnung ohne Kausalitätsbehauptung; optional. */
  interpretation?: string;
}

export function buildAttentionItems(
  comparison: PeriodComparison | null,
  scopeBreakdown: Array<{ option: ScopeOption; comparison: PeriodComparison | null }>,
): AttentionItem[] {
  const items: AttentionItem[] = [];
  if (comparison) {
    const { current, previous } = comparison;
    const clicksPct = pctChange(current.clicks, previous.clicks);
    const imprPct = pctChange(current.impressions, previous.impressions);

    if (direction(imprPct) === "up" && direction(clicksPct) === "down") {
      items.push({
        key: "impr-up-clicks-down",
        observation: "Impressionen steigen, Klicks fallen.",
        numbers: `Impressionen ${de(current.impressions)} (zuvor ${de(previous.impressions)}), Klicks ${de(current.clicks)} (zuvor ${de(previous.clicks)}).`,
        interpretation: "Mögliche Einordnung: mehr Ausspielung ohne Klickgewinn. Ursache offen.",
      });
    }
    if (
      current.ctr !== null &&
      previous.ctr !== null &&
      previous.ctr > 0 &&
      current.ctr < previous.ctr
    ) {
      items.push({
        key: "ctr-below-previous",
        observation: "Die Klickrate liegt unter der Vorperiode.",
        numbers: `CTR ${de(current.ctr * 100, 2)} % (zuvor ${de(previous.ctr * 100, 2)} %).`,
      });
    }
  }

  // Produktseiten-Scopes: stärkstes prozentuales Wachstum auf kleiner Basis
  // und die klickstärkste Pilotseite – reine Beobachtungen.
  const productScopes = scopeBreakdown.filter(
    (s) => s.option.scopeType === "product_page" && s.comparison !== null,
  );
  if (productScopes.length > 0) {
    const growers = productScopes
      .filter((s) => (s.comparison!.clicksDeltaPct ?? 0) > STABLE_THRESHOLD_PCT && s.comparison!.lowBase)
      .sort((a, b) => (b.comparison!.clicksDeltaPct ?? 0) - (a.comparison!.clicksDeltaPct ?? 0));
    if (growers[0]) {
      const g = growers[0];
      items.push({
        key: `low-base-growth-${g.option.key}`,
        observation: `${g.option.label} wächst prozentual stark, basiert aber weiterhin auf wenigen Klicks.`,
        numbers: `${g.comparison!.comparisonLabel}.`,
      });
    }
    const top = [...productScopes].sort(
      (a, b) => b.comparison!.current.clicks - a.comparison!.current.clicks,
    )[0];
    if (top && top.comparison!.current.clicks > 0) {
      items.push({
        key: `top-scope-${top.option.key}`,
        observation: `${top.option.label} erzielt die meisten Klicks der ${productScopes.length} Pilotseiten.`,
        numbers: `${de(top.comparison!.current.clicks)} Klicks in der aktuellen Periode.`,
      });
    }
  }

  return items.slice(0, 3);
}

/* ── Live-Quellen: ehrliche Zustände, vorbereitet für spätere Anbindung ──────── */

export type LiveSourceKind =
  | "gsc_export"
  | "gsc_api"
  | "ga4_core"
  | "ga4_realtime"
  | "website_scanner"
  | "typo3_webhook"
  | "supabase_realtime";

export interface LiveSourceStatus {
  kind: LiveSourceKind;
  label: string;
  /** Ehrlicher Zustand; "live" nur für tatsächlich verbundene Live-Kanäle. */
  state: "verified" | "live" | "offline" | "not_connected";
  /** Kurztext für die Freshness-Zeile, z. B. "bis 10.07.2026". */
  detail: string | null;
}

/**
 * Zentrale Wahrheit über verbundene und (noch) nicht verbundene Quellen.
 * Neue Quellen (GSC API, GA4, Scanner, TYPO3) werden hier ergänzt, ohne die
 * Freshness-Bar oder den Drawer umzubauen. Keine Fake-Zustände: alles, was
 * nicht verbunden ist, heißt "Noch nicht verbunden".
 */
export function getLiveSourceStatuses(input: {
  gscDataAsOf: string | null;
  realtimeConnected: boolean;
}): LiveSourceStatus[] {
  return [
    {
      kind: "gsc_export",
      label: "GSC",
      state: input.gscDataAsOf ? "verified" : "not_connected",
      detail: input.gscDataAsOf ? "Export verifiziert" : null,
    },
    {
      kind: "supabase_realtime",
      label: "Dashboard",
      state: input.realtimeConnected ? "live" : "offline",
      detail: input.realtimeConnected
        ? "interne Änderungen live"
        : "Live-Verbindung getrennt",
    },
    { kind: "ga4_core", label: "Analytics", state: "not_connected", detail: null },
    { kind: "website_scanner", label: "Website-Prüfung", state: "not_connected", detail: null },
    { kind: "gsc_api", label: "GSC API", state: "not_connected", detail: null },
  ];
}