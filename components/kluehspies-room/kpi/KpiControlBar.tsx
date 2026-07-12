"use client";

// ─── KPI-Steuerleiste ─────────────────────────────────────────────────────────
// Eine ruhige Zeile über den Zahlen: Zeitraum, Vergleich, Segment, Gerät,
// Datenfrische und der Sync-Auslöser. Filter wirken auf alles darunter.

import { formatDate, formatDateTime } from "@/lib/kpi/format";
import type { DeviceFilter, RangeDays } from "@/lib/kpi/aggregate";
import { useWorkspace } from "./workspace";

const RANGES: RangeDays[] = [7, 28, 90];
const DEVICES: Array<{ value: DeviceFilter; label: string }> = [
  { value: "all", label: "Alle Geräte" },
  { value: "MOBILE", label: "Mobil" },
  { value: "DESKTOP", label: "Desktop" },
];

export function SyncStatus() {
  const { dataSource, checkingFreshness, syncing, realtime } = useWorkspace();

  let text: string;
  let state: "checking" | "syncing" | "ok" | "error" = "ok";
  if (syncing || dataSource?.status === "syncing") {
    text = "Daten werden synchronisiert…";
    state = "syncing";
  } else if (dataSource?.status === "error") {
    text = "Sync fehlgeschlagen. Der letzte gültige Datenstand wird angezeigt.";
    state = "error";
  } else if (checkingFreshness && !dataSource) {
    text = "Daten werden geprüft…";
    state = "checking";
  } else if (dataSource?.data_available_until) {
    text = `Daten aktuell bis ${formatDate(dataSource.data_available_until)}`;
  } else {
    text = "Noch keine Daten vorhanden";
  }

  return (
    <span className="kw-sync" data-state={state} role="status">
      <i className="olive-dot" aria-hidden="true" />
      <span>
        {text}
        {checkingFreshness && state === "ok" && <span className="kw-sync-checking"> · wird geprüft…</span>}
      </span>
      {realtime === "live" && state !== "error" && (
        <span
          className="kw-sync-rt"
          title="Aufgaben, Kommentare und Freigaben werden zwischen allen angemeldeten Personen live synchronisiert."
        >
          · interne Änderungen live synchronisiert
        </span>
      )}
      {realtime === "offline" && (
        <span className="kw-sync-rt kw-sync-rt--off">· Live-Verbindung getrennt, Anzeige ggf. verzögert</span>
      )}
    </span>
  );
}

export default function KpiControlBar() {
  const {
    days,
    setDays,
    device,
    setDevice,
    pageFilter,
    setPageFilter,
    productPages,
    dataSource,
    canSync,
    syncing,
    syncMessage,
    runSync,
    currentRange,
    previousRange,
  } = useWorkspace();

  return (
    <div className="kw-bar">
      <div className="kw-bar-row">
        <div className="kw-bar-group" role="group" aria-label="Zeitraum">
          <span className="kw-bar-label">Zeitraum</span>
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className="kw-chip"
              data-active={days === r || undefined}
              aria-pressed={days === r}
              onClick={() => setDays(r)}
            >
              {r} Tage
            </button>
          ))}
        </div>

        <div className="kw-bar-group">
          <label className="kw-bar-label" htmlFor="kw-segment">
            Segment
          </label>
          <select
            id="kw-segment"
            className="kw-select"
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
          >
            <option value="all">Alle Produktseiten</option>
            {productPages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="kw-bar-group">
          <label className="kw-bar-label" htmlFor="kw-device">
            Gerät
          </label>
          <select
            id="kw-device"
            className="kw-select"
            value={device}
            onChange={(e) => setDevice(e.target.value as DeviceFilter)}
          >
            {DEVICES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="kw-bar-spacer" />

        <div className="kw-bar-group kw-bar-group--sync">
          <SyncStatus />
          <button
            type="button"
            className="kw-link"
            onClick={() => void runSync()}
            disabled={!canSync || syncing}
            title={
              canSync
                ? "Search-Console-Daten jetzt aktualisieren"
                : "Die Aktualisierung stößt SEESZN an. Der Status ist hier trotzdem jederzeit sichtbar."
            }
          >
            {syncing ? "Wird aktualisiert…" : "Jetzt aktualisieren"}
          </button>
        </div>
      </div>

      <p className="kw-bar-meta">
        {formatDate(currentRange.from)} bis {formatDate(currentRange.to)} · Vergleich: Vorperiode{" "}
        {formatDate(previousRange.from)} bis {formatDate(previousRange.to)}
        {dataSource?.last_successful_sync_at && (
          <> · letzter erfolgreicher Sync {formatDateTime(dataSource.last_successful_sync_at)}</>
        )}
        {" · Quelle: Google Search Console"}
      </p>

      {syncMessage && (
        <p className="kw-bar-error" role="alert">
          {syncMessage}
        </p>
      )}
      {dataSource?.status === "error" && dataSource.last_error && (
        <p className="kw-bar-error" role="alert">
          Letzter Sync-Fehler: {dataSource.last_error}
        </p>
      )}
    </div>
  );
}
