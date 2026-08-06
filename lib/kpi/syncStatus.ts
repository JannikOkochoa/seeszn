// ─── Verbindungsstatus der Search-Console-Anbindung ───────────────────────────
// Beantwortet genau eine Frage: Sind die angezeigten Zahlen aktuell, oder liegt
// ein Problem vor? Reine, testbare Funktion über vier Eingaben:
//
//   * den letzten protokollierten Läufen (public.sync_runs),
//   * dem Datenstand der aktiven Datensätze (letzter Tag mit Zahlen),
//   * der Zahl aktiver Scopes,
//   * der letzten Scheduler-Auslösung (public.gsc_sync_dispatches).
//
// Grundsatz: Ein ausgefallener Sync sah bisher exakt aus wie ein gesunder – das
// Dashboard zeigte einfach weiter die zuletzt importierten Zahlen. Die Zahlen
// bleiben stehen (sie sind echt, nur älter), aber der Zustand wird hier
// benannt, statt ihn zu verschweigen. Es entstehen niemals Ersatzwerte.

/** Google veröffentlicht endgültige Tageswerte mit ein bis zwei Tagen Verzug. */
export const EXPECTED_LAG_DAYS = 3;
/** Ab diesem Alter des Datenstands gilt die Anbindung als nicht mehr aktuell. */
export const STALE_AFTER_DAYS = EXPECTED_LAG_DAYS + 2;
/** Fehlertexte werden gekürzt: die Oberfläche braucht die Ursache, nicht das Protokoll. */
const MAX_ERROR_LENGTH = 220;

export type SyncRunStatus = "running" | "success" | "error";
export type SyncTriggerSource = "scheduler" | "self_heal" | "admin" | "manual";

export interface SyncRunRow {
  status: SyncRunStatus;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  records_processed: number | null;
  trigger_source?: SyncTriggerSource | null;
  dispatch_id?: string | null;
}

/** Eine Auslösung des Schedulers (pg_cron → pg_net → App). */
export interface SyncDispatchRow {
  id: string;
  job_name: string;
  reason: "scheduled" | "self_heal";
  scheduled_at: string;
  http_status: number | null;
  delivered: boolean | null;
  error_message: string | null;
  reconciled_at: string | null;
}

export type GscConnectionState =
  /** Sync läuft, Datenstand innerhalb des erwarteten Google-Verzugs. */
  | "live"
  /** Zahlen sind echt, aber älter als erwartet: der Sync läuft nicht mehr. */
  | "stale"
  /** Der letzte Lauf ist mit einem Fehler beendet worden. */
  | "failed"
  /** Es gibt Daten, aber keinen protokollierten Lauf (z. B. reiner Export-Import). */
  | "unlogged"
  /** Noch nie Daten geladen. */
  | "never";

/**
 * Die Kette vom Zeitplan bis zum Ergebnis. Jede Stufe ist einzeln beobachtet,
 * damit ein Ausfall genau dort sichtbar wird, wo er passiert – ein toter
 * Scheduler sieht sonst aus wie ein fehlerfreier Tag ohne Änderungen.
 */
export interface SyncChain {
  /** Der Scheduler hat ausgelöst (pg_cron → gsc_sync_dispatches). */
  scheduled: { at: string; reason: SyncDispatchRow["reason"]; jobName: string } | null;
  /** Der HTTP-Aufruf hat die App erreicht. null = noch nicht geprüft. */
  delivered: boolean | null;
  /** HTTP-Status der App-Antwort, sofern schon bekannt. */
  httpStatus: number | null;
  /** Ein Lauf wurde tatsächlich gestartet (sync_runs). */
  started: { at: string; triggerSource: SyncTriggerSource | null } | null;
  /** Ergebnis des Laufs. */
  finished: { at: string; status: SyncRunStatus } | null;
  /** Wo die Kette abgerissen ist; null wenn sie vollständig durchlief. */
  brokeAt: "scheduler" | "delivery" | "start" | "run" | null;
}

export interface GscSyncStatus {
  state: GscConnectionState;
  /** Letzter Tag mit Zahlen. */
  dataAsOf: string | null;
  /** Alter des Datenstands in Tagen; null ohne Daten. */
  ageDays: number | null;
  /** Letzter Lauf, unabhängig vom Ergebnis. */
  lastAttempt: SyncRunRow | null;
  /** Letzter erfolgreich abgeschlossener Lauf. */
  lastSuccess: SyncRunRow | null;
  /** Anzahl der Scopes mit aktivem Datensatz. */
  scopeCount: number;
  /** Kurzer, verständlicher Fehlergrund des letzten Versuchs; null wenn keiner. */
  lastError: string | null;
  /** Zustand der Automatisierungskette. */
  chain: SyncChain;
  /** Ein Satz für die Oberfläche. */
  headline: string;
  /** Was das konkret bedeutet bzw. zu tun ist. */
  detail: string;
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

function formatDe(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** Kürzt einen Fehlertext auf Satzlänge, ohne ihn zu verfälschen. */
export function shortenError(message: string | null | undefined): string | null {
  const trimmed = message?.trim();
  if (!trimmed) return null;
  if (trimmed.length <= MAX_ERROR_LENGTH) return trimmed;
  return `${trimmed.slice(0, MAX_ERROR_LENGTH - 1).trimEnd()}…`;
}

/**
 * Setzt die Beobachtungskette zusammen. Der Dispatch und der Lauf gehören
 * zusammen, wenn der Lauf die Dispatch-ID trägt; ein Lauf ohne Dispatch ist ein
 * manueller Anstoß und lässt die Scheduler-Stufe bewusst leer.
 */
function buildChain(
  dispatch: SyncDispatchRow | null,
  runs: SyncRunRow[],
): SyncChain {
  const scheduled = dispatch
    ? { at: dispatch.scheduled_at, reason: dispatch.reason, jobName: dispatch.job_name }
    : null;

  const run = dispatch
    ? (runs.find((r) => r.dispatch_id === dispatch.id) ?? null)
    : (runs[0] ?? null);

  const started = run ? { at: run.started_at, triggerSource: run.trigger_source ?? null } : null;
  const finished =
    run && run.status !== "running" && run.completed_at
      ? { at: run.completed_at, status: run.status }
      : null;

  let brokeAt: SyncChain["brokeAt"] = null;
  if (!dispatch) {
    brokeAt = "scheduler";
  } else if (dispatch.delivered === false) {
    brokeAt = "delivery";
  } else if (!started && dispatch.reconciled_at) {
    // Zugestellt, aber kein Lauf entstanden: die App hat den Aufruf abgewiesen.
    brokeAt = "start";
  } else if (finished?.status === "error") {
    brokeAt = "run";
  }

  return {
    scheduled,
    delivered: dispatch?.delivered ?? null,
    httpStatus: dispatch?.http_status ?? null,
    started,
    finished,
    brokeAt,
  };
}

/**
 * Leitet den Verbindungszustand ab. `todayIso` wird übergeben, damit die
 * Funktion deterministisch testbar bleibt.
 */
export function buildGscSyncStatus(input: {
  /** Letzte Läufe, absteigend nach started_at. */
  runs: SyncRunRow[];
  dataAsOf: string | null;
  todayIso: string;
  scopeCount?: number;
  /** Jüngste Scheduler-Auslösung. */
  dispatch?: SyncDispatchRow | null;
}): GscSyncStatus {
  const { runs, dataAsOf, todayIso, scopeCount = 0, dispatch = null } = input;

  const lastAttempt = runs[0] ?? null;
  const lastSuccess = runs.find((r) => r.status === "success") ?? null;
  const lastError = lastAttempt?.status === "error" ? shortenError(lastAttempt.error_message) : null;
  const ageDays = dataAsOf ? daysBetween(dataAsOf, todayIso) : null;

  const base = {
    dataAsOf,
    ageDays,
    lastAttempt,
    lastSuccess,
    scopeCount,
    lastError,
    chain: buildChain(dispatch, runs),
  };

  if (!dataAsOf) {
    return {
      ...base,
      state: "never",
      headline: "Noch keine Search-Console-Daten geladen.",
      detail:
        "Es liegt kein aktiver Datensatz vor. Bis der erste Sync durchgelaufen ist, zeigt das " +
        "Dashboard bewusst keine Kennzahlen statt Platzhalter.",
    };
  }

  if (lastAttempt?.status === "error") {
    return {
      ...base,
      state: "failed",
      headline: "Die letzte Aktualisierung ist fehlgeschlagen.",
      detail:
        `Die angezeigten Zahlen stammen unverändert vom ${formatDe(dataAsOf)} und sind echt, ` +
        "aber möglicherweise nicht mehr aktuell. Grund des Fehlers: " +
        (lastError ?? "nicht protokolliert") +
        ".",
    };
  }

  if (ageDays !== null && ageDays > STALE_AFTER_DAYS) {
    return {
      ...base,
      state: "stale",
      headline: `Die Daten sind ${ageDays} Tage alt.`,
      detail:
        (lastSuccess
          ? `Der letzte erfolgreiche Lauf war am ${formatDe(lastSuccess.started_at.slice(0, 10))}, seitdem ` +
            "ist keine Aktualisierung mehr angekommen."
          : "Es ist kein erfolgreicher Lauf protokolliert.") +
        " Die automatische Aktualisierung holt das beim nächsten Durchgang selbstständig nach.",
    };
  }

  if (!lastAttempt) {
    return {
      ...base,
      state: "unlogged",
      headline: `Datenstand ${formatDe(dataAsOf)}.`,
      detail:
        "Die Zahlen sind aktuell, stammen aber aus einem Lauf ohne Protokoll (z. B. einem " +
        "manuellen Export-Import).",
    };
  }

  return {
    ...base,
    state: "live",
    headline: `Live verbunden, Datenstand ${formatDe(dataAsOf)}.`,
    detail:
      `Google gibt endgültige Tageswerte mit rund ${EXPECTED_LAG_DAYS} Tagen Verzug frei; ` +
      "der jüngste Tag fehlt deshalb planmäßig.",
  };
}
