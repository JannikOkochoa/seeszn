"use client";

// ─── Datenquellen-Drawer ──────────────────────────────────────────────────────
// Die ausführliche Wahrheit hinter der dezenten Quellenangabe: Quelle, Scope,
// Zeitraum, Datenstand, Importzeitpunkt, Datentyp, aktive Datenbasis sowie die
// Hinweise zum aggregierten Exportzeitraum und zu den GSC-Query-Limits.
// Keine internen UUIDs, keine Dateihashes, keine Rohdatenbank-Details.
// Nicht verbundene Quellen stehen ehrlich als „Noch nicht verbunden“.

import Drawer from "../Drawer";
import { getLiveSourceStatuses } from "@/lib/kpi/executive";
import { formatDate, formatDateTime } from "@/lib/kpi/format";
import { useWorkspace } from "../workspace";

export default function DataSourceDrawer() {
  const {
    dataSourceDrawerOpen,
    setDataSourceDrawerOpen,
    gscProvenance,
    activeScope,
    scopeOptions,
    realtime,
  } = useWorkspace();

  const statuses = getLiveSourceStatuses({
    gscDataAsOf: gscProvenance?.dataAsOf ?? null,
    realtimeConnected: realtime === "live",
  });

  return (
    <Drawer
      open={dataSourceDrawerOpen}
      onClose={() => setDataSourceDrawerOpen(false)}
      title={
        <div>
          <span className="kr-eyebrow">Datenquellen</span>
          <span className="kw-drawer-name">Woher die Zahlen kommen</span>
        </div>
      }
    >
      {/* Aktive Datenbasis */}
      <section className="kw-dsection kw-dsection--head" aria-label="Aktive Datenbasis">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Aktive Datenbasis</h3>
        </div>
        {gscProvenance ? (
          <dl className="kw-ex-source-list">
            <div>
              <dt className="kr-eyebrow">Quelle</dt>
              <dd>{gscProvenance.source}</dd>
            </div>
            <div>
              <dt className="kr-eyebrow">Scope</dt>
              <dd>{activeScope?.label ?? "–"}</dd>
            </div>
            <div>
              <dt className="kr-eyebrow">Zeitraum der Daten</dt>
              <dd>
                {formatDate(gscProvenance.periodStart)} bis {formatDate(gscProvenance.periodEnd)}
              </dd>
            </div>
            <div>
              <dt className="kr-eyebrow">Datenstand</dt>
              <dd>{gscProvenance.dataAsOf ? formatDate(gscProvenance.dataAsOf) : "–"}</dd>
            </div>
            <div>
              <dt className="kr-eyebrow">Importiert</dt>
              <dd>{gscProvenance.importedAt ? formatDateTime(gscProvenance.importedAt) : "–"}</dd>
            </div>
            <div>
              <dt className="kr-eyebrow">Datentyp</dt>
              <dd>
                Tägliche Zeitreihe (Klicks, Impressionen, CTR, Position) plus aggregierte
                Dimensionswerte für den gesamten Exportzeitraum
              </dd>
            </div>
            <div>
              <dt className="kr-eyebrow">Verfügbare Scopes</dt>
              <dd>{scopeOptions.map((o) => o.label).join(" · ") || "–"}</dd>
            </div>
          </dl>
        ) : (
          <p className="kr-meta">Noch keine Datenquelle verbunden.</p>
        )}
      </section>

      {/* Hinweise zur Interpretation */}
      <section className="kw-dsection" aria-label="Hinweise">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Wichtig für die Interpretation</h3>
        </div>
        <ul className="kw-ex-note-list">
          <li className="kr-meta">
            Suchanfragen, Seiten, Geräte, Länder und Darstellung gelten für den{" "}
            <strong>aggregierten Exportzeitraum</strong>
            {gscProvenance && (
              <>
                {" "}
                ({formatDate(gscProvenance.periodStart)} bis {formatDate(gscProvenance.periodEnd)})
              </>
            )}{" "}
            und reagieren nicht auf den 7-, 28- oder 90-Tage-Schalter.
          </li>
          <li className="kr-meta">
            Google lässt anonymisierte und sehr seltene Suchanfragen aus; die Summe der
            Query-Zeilen entspricht deshalb nicht exakt der Gesamtzahl der Klicks.
          </li>
          <li className="kr-meta">
            Bei der durchschnittlichen Position ist eine kleinere Zahl besser.
          </li>
        </ul>
      </section>

      {/* Systemstatus aller Quellen */}
      <section className="kw-dsection kw-dsection--last" aria-label="Systemstatus">
        <div className="kw-dsection-head">
          <h3 className="kw-dsection-title">Verbundene und geplante Quellen</h3>
        </div>
        <ul className="kw-ex-status-list">
          {statuses.map((status) => (
            <li key={status.kind} className="kw-ex-status-row">
              <span className="kw-ex-status-label">{status.label}</span>
              <span className="kr-meta">
                {status.state === "verified" && `Export verifiziert${gscProvenance?.dataAsOf ? ` · bis ${formatDate(gscProvenance.dataAsOf)}` : ""}`}
                {status.state === "live" && status.detail}
                {status.state === "offline" && status.detail}
                {status.state === "not_connected" && "Noch nicht verbunden · wird im nächsten Schritt eingerichtet"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Drawer>
  );
}
