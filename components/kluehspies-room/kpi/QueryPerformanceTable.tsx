"use client";

// ─── Suchanfragen-Tabelle ─────────────────────────────────────────────────────
// Queries mit Seite, Gerät und Kernmetriken. Suche, Sortierung und direkte
// Maßnahmen-Erstellung aus einer Query.

import { useMemo, useState } from "react";
import { formatDelta, formatNumber, formatPercent } from "@/lib/kpi/format";
import type { QueryStats } from "@/lib/kpi/aggregate";
import { useWorkspace } from "./workspace";

type SortKey = "clicks" | "delta" | "impressions" | "ctr" | "position";

const DEVICE_LABEL: Record<string, string> = { MOBILE: "Mobil", DESKTOP: "Desktop", TABLET: "Tablet" };

export default function QueryPerformanceTable() {
  const { queries, canWrite, openCreate, pages } = useWorkspace();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("clicks");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [limit, setLimit] = useState(12);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? queries.filter((q) => q.query.toLowerCase().includes(term) || q.pageName.toLowerCase().includes(term))
      : queries;
    const value = (q: QueryStats): number => {
      switch (sortKey) {
        case "clicks":
          return q.clicks;
        case "delta":
          return q.clicksDeltaPct ?? Number.NEGATIVE_INFINITY;
        case "impressions":
          return q.impressions;
        case "ctr":
          return q.ctr ?? -1;
        case "position":
          return q.position ?? Number.POSITIVE_INFINITY;
      }
    };
    return [...filtered].sort((a, b) => (value(a) - value(b)) * sortDir);
  }, [queries, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(key === "position" ? 1 : -1);
    }
  }

  function createFromQuery(q: QueryStats) {
    const page = pages.find((p) => p.id === q.pageId);
    openCreate({
      source: "query",
      observation: `Suchanfrage „${q.query}“ (${q.pageName}, ${DEVICE_LABEL[q.device] ?? q.device}): ${formatNumber(q.clicks)} Klicks, ${formatDelta(q.clicksDeltaPct)} zur Vorperiode, Ø Position ${q.position === null ? "unbekannt" : formatNumber(q.position, 1)}.`,
      pageId: q.pageId,
      pageUrl: page?.url,
      query: q.query,
      device: q.device,
      metrics: {
        clicks: q.clicks,
        previousClicks: q.previousClicks,
        impressions: q.impressions,
        ctr: q.ctr ?? undefined,
        position: q.position ?? undefined,
      },
    });
  }

  const visible = rows.slice(0, limit);
  const headers: Array<{ key: SortKey; label: string }> = [
    { key: "clicks", label: "Klicks" },
    { key: "delta", label: "Veränderung" },
    { key: "impressions", label: "Impr." },
    { key: "ctr", label: "CTR" },
    { key: "position", label: "Position" },
  ];

  return (
    <div>
      <div className="kw-query-tools">
        <label className="kw-visually-hidden" htmlFor="kw-query-search">
          Suchanfragen durchsuchen
        </label>
        <input
          id="kw-query-search"
          type="search"
          className="kw-input kw-input--search"
          placeholder="Suchanfrage oder Seite suchen…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setLimit(12);
          }}
        />
        <span className="kr-meta">{rows.length} Suchanfragen</span>
      </div>

      {rows.length === 0 ? (
        <p className="kr-meta kw-empty">Keine Suchanfragen für diesen Filter oder Suchbegriff.</p>
      ) : (
        <div className="kw-table-wrap">
          <table className="kw-table">
            <thead>
              <tr>
                <th scope="col" className="kw-th kw-th--name">
                  Query
                </th>
                <th scope="col" className="kw-th">
                  Seite
                </th>
                <th scope="col" className="kw-th">
                  Gerät
                </th>
                {headers.map((h) => (
                  <th
                    key={h.key}
                    scope="col"
                    className="kw-th kw-th--num"
                    aria-sort={h.key === sortKey ? (sortDir === 1 ? "ascending" : "descending") : undefined}
                  >
                    <button type="button" className="kw-th-btn" onClick={() => toggleSort(h.key)}>
                      {h.label}
                      <span aria-hidden="true" className="kw-th-dir">
                        {sortKey === h.key ? (sortDir === -1 ? "↓" : "↑") : ""}
                      </span>
                    </button>
                  </th>
                ))}
                {canWrite && <th scope="col" className="kw-th" aria-label="Aktion" />}
              </tr>
            </thead>
            <tbody>
              {visible.map((q) => (
                <tr key={q.key} className="kw-tr">
                  <td className="kw-td kw-td--name kw-td--query">{q.query}</td>
                  <td className="kw-td">{q.pageName}</td>
                  <td className="kw-td">{DEVICE_LABEL[q.device] ?? q.device}</td>
                  <td className="kw-td kw-td--num">{formatNumber(q.clicks)}</td>
                  <td className="kw-td kw-td--num">
                    <span className="kw-delta" data-dir={(q.clicksDeltaPct ?? 0) < 0 ? "down" : "up"}>
                      {formatDelta(q.clicksDeltaPct)}
                    </span>
                  </td>
                  <td className="kw-td kw-td--num">{formatNumber(q.impressions)}</td>
                  <td className="kw-td kw-td--num">{q.ctr === null ? "–" : formatPercent(q.ctr)}</td>
                  <td className="kw-td kw-td--num">
                    {q.position === null ? "–" : formatNumber(q.position, 1)}
                  </td>
                  {canWrite && (
                    <td className="kw-td kw-td--action">
                      <button type="button" className="kw-link" onClick={() => createFromQuery(q)}>
                        Maßnahme
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > limit && (
        <button type="button" className="kw-link kw-more" onClick={() => setLimit((l) => l + 12)}>
          Weitere Suchanfragen anzeigen ({rows.length - limit} verbleibend)
        </button>
      )}
    </div>
  );
}
