"use client";

// ─── Dimensionstabelle (aggregierter Exportzeitraum) ──────────────────────────
// Zeigt die Dimensions-Snapshots eines aktiven GSC-Batch: Suchanfragen,
// Seiten, Geräte, Länder, Darstellung in der Suche. Diese Werte gelten für
// den KOMPLETTEN Exportzeitraum und reagieren bewusst nicht auf den
// 7-/28-/90-Tage-Filter; der Zeitraum steht direkt über der Tabelle.

import { useMemo, useState } from "react";
import type { GscDimensionSnapshotRow, GscDimensionType, PageRow } from "@/lib/kpi/types";
import { formatDate, formatNumber, formatPercent } from "@/lib/kpi/format";
import { useWorkspace } from "./workspace";

const INITIAL_ROWS = 10;

const DEVICE_LABEL: Record<string, string> = {
  Mobile: "Mobil",
  Desktop: "Desktop",
  Tablet: "Tablet",
};

const VALUE_HEADER: Record<GscDimensionType, string> = {
  query: "Suchanfrage",
  page: "URL",
  device: "Gerät",
  country: "Land",
  search_appearance: "Darstellung",
};

/** Produktseite zur URL, sofern im pages-Bestand vorhanden. */
function matchProductPage(url: string, pages: PageRow[]): PageRow | null {
  return pages.find((p) => p.url === url || p.url === url.replace(/\/$/, "") + "/") ?? null;
}

export default function DimensionTable({
  rows,
  dimensionType,
  searchable = false,
}: {
  rows: GscDimensionSnapshotRow[];
  dimensionType: GscDimensionType;
  /** Suchfeld für lange Tabellen (Queries, Seiten, Länder). */
  searchable?: boolean;
}) {
  const { pages, canWrite, openCreate, activeScope } = useWorkspace();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const relevant = rows
      .filter((r) => r.dimension_type === dimensionType)
      .sort((a, b) => Number(b.clicks) - Number(a.clicks));
    const q = query.trim().toLowerCase();
    if (!q) return relevant;
    return relevant.filter((r) => r.dimension_value.toLowerCase().includes(q));
  }, [rows, dimensionType, query]);

  const visible = expanded ? filtered : filtered.slice(0, INITIAL_ROWS);
  const period = filtered[0] ?? rows[0];

  if (rows.filter((r) => r.dimension_type === dimensionType).length === 0) {
    return <p className="kr-meta kw-empty">Für diese Dimension liegen im Export keine Zeilen vor.</p>;
  }

  return (
    <div>
      {period && (
        <p className="kr-meta kw-dim-period">
          Aggregierter Exportzeitraum: {formatDate(period.period_start)} bis{" "}
          {formatDate(period.period_end)} · reagiert nicht auf den Tage-Filter
        </p>
      )}

      {searchable && (
        <div className="kw-query-tools">
          <label className="kw-visually-hidden" htmlFor={`kw-dim-search-${dimensionType}`}>
            In der Tabelle suchen
          </label>
          <input
            id={`kw-dim-search-${dimensionType}`}
            type="text"
            className="kw-input kw-input--search"
            placeholder="Suchen…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <div className="kw-table-wrap">
        <table className="kw-table">
          <thead>
            <tr>
              <th className="kw-th">{VALUE_HEADER[dimensionType]}</th>
              {dimensionType === "page" && <th className="kw-th">Produktseite</th>}
              <th className="kw-th kw-th--num">Klicks</th>
              <th className="kw-th kw-th--num">Impressionen</th>
              <th className="kw-th kw-th--num">CTR</th>
              <th className="kw-th kw-th--num">Position</th>
              {dimensionType === "query" && canWrite && <th className="kw-th" aria-label="Aktion" />}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const product = dimensionType === "page" ? matchProductPage(r.dimension_value, pages) : null;
              return (
                <tr key={r.dimension_value} className="kw-tr">
                  <td className="kw-td kw-td--name">
                    {dimensionType === "page" ? (
                      <a
                        className="kw-link"
                        href={r.dimension_value}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {r.dimension_value.replace("https://www.klassenfahrten-kluehspies.de", "")}
                      </a>
                    ) : dimensionType === "device" ? (
                      (DEVICE_LABEL[r.dimension_value] ?? r.dimension_value)
                    ) : (
                      <span className={dimensionType === "query" ? "kw-td--query" : undefined}>
                        {r.dimension_value}
                      </span>
                    )}
                  </td>
                  {dimensionType === "page" && (
                    <td className="kw-td">{product ? product.name : <span className="kw-muted">–</span>}</td>
                  )}
                  <td className="kw-td kw-td--num">{formatNumber(Number(r.clicks))}</td>
                  <td className="kw-td kw-td--num">{formatNumber(Number(r.impressions))}</td>
                  <td className="kw-td kw-td--num">{formatPercent(Number(r.ctr) * 100)}</td>
                  <td className="kw-td kw-td--num">{formatNumber(Number(r.position), 1)}</td>
                  {dimensionType === "query" && canWrite && (
                    <td className="kw-td kw-td--action">
                      <button
                        type="button"
                        className="kw-link"
                        onClick={() =>
                          openCreate({
                            source: "query",
                            query: r.dimension_value,
                            observation: `Suchanfrage „${r.dimension_value}“ (${activeScope?.label ?? ""}): ${formatNumber(Number(r.clicks))} Klicks, ${formatNumber(Number(r.impressions))} Impressionen im Exportzeitraum ${formatDate(r.period_start)} bis ${formatDate(r.period_end)}.`,
                            metrics: {
                              clicks: Number(r.clicks),
                              impressions: Number(r.impressions),
                              ctr: Number(r.ctr) * 100,
                              position: Number(r.position),
                            },
                          })
                        }
                      >
                        Maßnahme
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > INITIAL_ROWS && (
        <button type="button" className="kw-link kw-more" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Weniger anzeigen" : `Alle ${formatNumber(filtered.length)} Zeilen anzeigen`}
        </button>
      )}
    </div>
  );
}
