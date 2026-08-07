"use client";

// ─── Sync-Monitor ─────────────────────────────────────────────────────────────
// Die vollständige Wahrheit über die automatische Aktualisierung, an einer
// Stelle: letzter Versuch, letzter Erfolg, Datenstand, Status, Anzahl der
// Scopes und – falls etwas schiefging – der Grund in einem Satz.
//
// Darunter die Kette vom Zeitplan bis zum Ergebnis. Sie beantwortet die Frage,
// die ein reiner Fehlertext nicht beantwortet: an welcher Stelle es hakt.
// Ein toter Zeitplan sieht sonst aus wie ein ruhiger Tag ohne Änderungen.
//
// Bewusst keine technischen Innereien: keine IDs, keine Endpunkte, keine
// Stacktraces, keine Secrets. Nur Zeitpunkte, Zustände und ein Klartextgrund.

import { formatDate, formatDateTime } from "@/lib/kpi/format";
import type { GscSyncStatus, SyncTriggerSource } from "@/lib/kpi/syncStatus";
import { useWorkspace } from "../workspace";

const STATE_LABEL: Record<GscSyncStatus["state"], string> = {
  live: "Aktuell",
  stale: "Nicht mehr aktuell",
  failed: "Letzter Lauf fehlgeschlagen",
  unlogged: "Aktuell, ohne Protokoll",
  never: "Noch nicht verbunden",
};

const TRIGGER_LABEL: Record<SyncTriggerSource, string> = {
  scheduler: "automatisch",
  self_heal: "automatischer Nachholer",
  admin: "manuell durch einen Admin",
  manual: "manuell",
};

function triggerText(source: SyncTriggerSource | null | undefined): string {
  return source ? TRIGGER_LABEL[source] : "Quelle unbekannt";
}

/** Eine Stufe der Kette: erledigt, offen oder abgerissen. */
function ChainStep({
  label,
  value,
  state,
}: {
  label: string;
  value: string;
  state: "done" | "pending" | "broken";
}) {
  return (
    <li className="kw-chain-step" data-state={state}>
      <span className="kw-chain-label">{label}</span>
      <span className="kw-chain-value kr-meta">{value}</span>
    </li>
  );
}

function SyncChainList({ status }: { status: GscSyncStatus }) {
  const { chain } = status;
  const broke = chain.brokeAt;

  const scheduledState = chain.scheduled ? "done" : broke === "scheduler" ? "broken" : "pending";
  const deliveredState =
    chain.delivered === true ? "done" : chain.delivered === false ? "broken" : "pending";
  const startedState = chain.started ? "done" : broke === "start" ? "broken" : "pending";
  const finishedState =
    chain.finished?.status === "success"
      ? "done"
      : chain.finished?.status === "error"
        ? "broken"
        : "pending";

  return (
    <ol className="kw-chain">
      <ChainStep
        label="Zeitplan ausgelöst"
        state={scheduledState}
        value={
          chain.scheduled
            ? `${formatDateTime(chain.scheduled.at)}${
                chain.scheduled.reason === "self_heal" ? " · Nachholer" : ""
              }`
            : "Noch keine automatische Auslösung protokolliert"
        }
      />
      <ChainStep
        label="Aufruf angekommen"
        state={deliveredState}
        value={
          chain.delivered === true
            ? `Ja${chain.httpStatus ? ` · HTTP ${chain.httpStatus}` : ""}`
            : chain.delivered === false
              ? "Nein · die App hat den Aufruf nicht angenommen"
              : "Wird gerade geprüft"
        }
      />
      <ChainStep
        label="Lauf gestartet"
        state={startedState}
        value={
          chain.started
            ? `${formatDateTime(chain.started.at)} · ${triggerText(chain.started.triggerSource)}`
            : "Kein Lauf entstanden"
        }
      />
      <ChainStep
        label="Ergebnis"
        state={finishedState}
        value={
          chain.finished
            ? `${chain.finished.status === "success" ? "Erfolgreich" : "Fehlgeschlagen"} · ${formatDateTime(chain.finished.at)}`
            : chain.started
              ? "Läuft noch"
              : "–"
        }
      />
    </ol>
  );
}

/**
 * Zeigt eine Datenquelle. Beide Quellen nutzen dieselbe Darstellung, melden
 * ihren Zustand aber vollständig eigenständig: ein GA4-Ausfall darf nicht wie
 * ein GSC-Ausfall aussehen und umgekehrt.
 */
export default function SyncMonitor({
  status,
  extra,
}: {
  status?: GscSyncStatus;
  /** Zusätzliche Zeilen der Quelle, z. B. GA4-Property und Zeitzone. */
  extra?: Array<{ label: string; value: string }>;
}) {
  const workspace = useWorkspace();
  const syncStatus = status ?? workspace.syncStatus;

  return (
    <div className="kw-sync-monitor">
      <dl className="kw-ex-source-list">
        <div>
          <dt className="kr-eyebrow">Status</dt>
          <dd data-state={syncStatus.state}>{STATE_LABEL[syncStatus.state]}</dd>
        </div>
        <div>
          <dt className="kr-eyebrow">Daten verfügbar bis</dt>
          <dd>
            {syncStatus.dataAsOf ? formatDate(syncStatus.dataAsOf) : "–"}
            {syncStatus.ageDays !== null && ` (vor ${syncStatus.ageDays} Tagen)`}
          </dd>
        </div>
        <div>
          <dt className="kr-eyebrow">Letzter Versuch</dt>
          <dd>
            {syncStatus.lastAttempt
              ? `${formatDateTime(syncStatus.lastAttempt.started_at)} · ${triggerText(
                  syncStatus.lastAttempt.trigger_source,
                )}`
              : "Noch keiner protokolliert"}
          </dd>
        </div>
        <div>
          <dt className="kr-eyebrow">Letzter erfolgreicher Sync</dt>
          <dd>
            {syncStatus.lastSuccess
              ? formatDateTime(syncStatus.lastSuccess.completed_at ?? syncStatus.lastSuccess.started_at)
              : "Noch keiner"}
          </dd>
        </div>
        <div>
          <dt className="kr-eyebrow">Synchronisierte Bereiche</dt>
          <dd>
            {syncStatus.scopeCount > 0
              ? `${syncStatus.scopeCount} Scopes mit aktivem Datensatz`
              : "Keine"}
          </dd>
        </div>
        {(extra ?? []).map((row) => (
          <div key={row.label}>
            <dt className="kr-eyebrow">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
        {syncStatus.lastError && (
          <div>
            <dt className="kr-eyebrow">Letzter Fehler</dt>
            <dd className="kw-sync-error">{syncStatus.lastError}</dd>
          </div>
        )}
      </dl>

      <p className="kr-eyebrow kw-chain-title">Ablauf der letzten Aktualisierung</p>
      <SyncChainList status={syncStatus} />
    </div>
  );
}
