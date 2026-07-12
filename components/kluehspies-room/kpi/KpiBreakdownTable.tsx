"use client";

// ─── Produktseiten-Tabelle ────────────────────────────────────────────────────
// Klare Zeilen, feine Trenner, sortierbar. Aus jeder auffälligen Zeile lässt
// sich direkt eine Maßnahme erstellen.

import { useMemo, useState } from "react";
import { formatDelta, formatNumber, formatPercent } from "@/lib/kpi/format";
import type { PageStats } from "@/lib/kpi/aggregate";
import { useWorkspace } from "./workspace";

type SortKey = "clicks" | "delta" | "impressions" | "ctr" | "position";

export default function KpiBreakdownTable() {
  const { stats, pageFilter, canWrite, openCreate, currentRange, device, days } = useWorkspace();
  const [sortKey, setSortKey] = useState<SortKey>("clicks");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [openRow, setOpenRow] = useState<string | null>(null);

  const rows = useMemo(() => {
    const filtered = pageFilter === "all" ? stats : stats.filter((s) => s.pageId === pageFilter);
    const value = (s: PageStats): number => {
      switch (sortKey) {
        case "clicks":
          return s.clicks;
        case "delta":
          return s.clicksDeltaPct ?? Number.NEGATIVE_INFINITY;
        case "impressions":
          return s.impressions;
        case "ctr":
          return s.ctr ?? -1;
        case "position":
          return s.position ?? Number.POSITIVE_INFINITY;
      }
    };
    return [...filtered].sort((a, b) => (value(a) - value(b)) * sortDir);
  }, [stats, pageFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(key === "position" ? 1 : -1);
    }
  }

  function ariaSort(key: SortKey): "ascending" | "descending" | undefined {
    if (key !== sortKey) return undefined;
    return sortDir === 1 ? "ascending" : "descending";
  }

  function createFromPage(s: PageStats) {
    openCreate({
      source: (s.clicksDeltaPct ?? 0) < 0 ? "loser" : "page",
      observation: `${s.name}: ${formatNumber(s.clicks)} Klicks in ${days} Tagen, ${formatDelta(s.clicksDeltaPct)} zur Vorperiode.`,
      pageId: s.pageId,
      pageUrl: s.url,
      device: device !== "all" ? device : undefined,
      metrics: {
        clicks: s.clicks,
        previousClicks: s.previousClicks,
        impressions: s.impressions,
        ctr: s.ctr ?? undefined,
        position: s.position ?? undefined,
      },
    });
  }

  if (rows.length === 0) {
    return <p className="kr-meta kw-empty">Keine Produktseiten für diesen Filter.</p>;
  }

  const headers: Array<{ key: SortKey; label: string }> = [
    { key: "clicks", label: "Klicks" },
    { key: "delta", label: "Veränderung" },
    { key: "impressions", label: "Impressionen" },
    { key: "ctr", label: "CTR" },
    { key: "position", label: "Position" },
  ];

  return (
    <div className="kw-table-wrap">
      <table className="kw-table">
        <thead>
          <tr>
            <th scope="col" className="kw-th kw-th--name">
              Seite
            </th>
            {headers.map((h) => (
              <th key={h.key} scope="col" className="kw-th kw-th--num" aria-sort={ariaSort(h.key)}>
                <button type="button" className="kw-th-btn" onClick={() => toggleSort(h.key)}>
                  {h.label}
                  <span aria-hidden="true" className="kw-th-dir">
                    {sortKey === h.key ? (sortDir === -1 ? "↓" : "↑") : ""}
                  </span>
                </button>
              </th>
            ))}
            <th scope="col" className="kw-th kw-th--status">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const negative = (s.clicksDeltaPct ?? 0) < 0;
            const expanded = openRow === s.pageId;
            return (
              <tr key={s.pageId} className="kw-tr" data-open={expanded || undefined}>
                <td className="kw-td kw-td--name">
                  <button
                    type="button"
                    className="kw-row-open"
                    onClick={() => setOpenRow(expanded ? null : s.pageId)}
                    aria-expanded={expanded}
                  >
                    {s.name}
                  </button>
                  {expanded && (
                    <div className="kw-row-detail">
                      <span className="kr-meta">{s.url}</span>
                      <span className="kr-meta">
                        Vorperiode: {formatNumber(s.previousClicks)} Klicks · Zeitraum {currentRange.from} bis{" "}
                        {currentRange.to}
                      </span>
                      {s.mobileDeltaPct !== null && s.desktopDeltaPct !== null && (
                        <span className="kr-meta">
                          Mobil {formatDelta(s.mobileDeltaPct)} · Desktop {formatDelta(s.desktopDeltaPct)}
                        </span>
                      )}
                      {canWrite && (
                        <button type="button" className="kw-link" onClick={() => createFromPage(s)}>
                          Maßnahme aus dieser Seite erstellen
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="kw-td kw-td--num">{formatNumber(s.clicks)}</td>
                <td className="kw-td kw-td--num">
                  <span className="kw-delta" data-dir={negative ? "down" : "up"}>
                    {formatDelta(s.clicksDeltaPct)}
                  </span>
                </td>
                <td className="kw-td kw-td--num">{formatNumber(s.impressions)}</td>
                <td className="kw-td kw-td--num">{s.ctr === null ? "–" : formatPercent(s.ctr)}</td>
                <td className="kw-td kw-td--num">
                  {s.position === null ? "–" : formatNumber(s.position, 1)}
                </td>
                <td className="kw-td kw-td--status">
                  <span className="kr-status" data-state={negative ? "open" : "done"}>
                    <i className="olive-dot" aria-hidden="true" />
                    {negative ? "Rückläufig" : "Stabil"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
