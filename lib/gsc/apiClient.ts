// ─── GSC-API: OAuth2-Client (Read-only) ───────────────────────────────────────
// Serverseitiger Zugriff auf die Search Analytics API über einen OAuth2-
// Refresh-Token-Flow. Client ID, Client Secret und Refresh Token stammen
// ausschließlich aus den serverseitigen Env-Variablen (nie NEXT_PUBLIC_, nie an
// den Browser). Der Access Token wird bei Bedarf erneuert und nur im
// Prozessspeicher gehalten – niemals in Supabase, Logs oder Responses.
//
// Fehler sind typisiert, damit der Aufrufer sauber unterscheiden kann:
//   GscConfigError – fehlende Env-Variablen (nennt nur Namen, nie Werte)
//   GscAuthError   – invalid_grant / widerrufener oder ungültiger Token
//   GscApiError    – Query-Fehler, fehlender Property-Zugriff (403)
// Keine Fehlermeldung enthält Secrets oder rohe Google-Fehlerdetails.

import "server-only";

// Read-only-Scope (webmasters.readonly) ist an den Refresh Token gebunden und
// muss beim Token-Refresh nicht erneut gesendet werden.
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE = "https://www.googleapis.com/webmasters/v3/sites";
const ROW_LIMIT = 25_000;

/** Harte Obergrenze je HTTP-Aufruf: ein hängender Request darf den Sync nicht blockieren. */
const REQUEST_TIMEOUT_MS = 20_000;
/** Versuche je Abfrage bei Kontingent-/Serverfehlern (429, 5xx), inklusive Erstversuch. */
const MAX_ATTEMPTS = 4;

export class GscConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GscConfigError";
  }
}
export class GscAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GscAuthError";
  }
}
export class GscApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GscApiError";
  }
}

interface GscConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  /** GOOGLE_GSC_PROPERTY, z. B. "sc-domain:…" oder "https://…". */
  property: string;
}

/**
 * Liest die vier Pflicht-Variablen serverseitig. Fehlt etwas, wird nur der
 * Variablenname gemeldet – niemals ein Wert.
 */
export function readGscConfig(): GscConfig {
  const clientId = process.env.GOOGLE_GSC_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_GSC_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_GSC_REFRESH_TOKEN;
  const property = process.env.GOOGLE_GSC_PROPERTY;

  const missing = [
    ["GOOGLE_GSC_CLIENT_ID", clientId],
    ["GOOGLE_GSC_CLIENT_SECRET", clientSecret],
    ["GOOGLE_GSC_REFRESH_TOKEN", refreshToken],
    ["GOOGLE_GSC_PROPERTY", property],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new GscConfigError(`Fehlende GSC-Umgebungsvariablen: ${missing.join(", ")}`);
  }
  return {
    clientId: clientId!,
    clientSecret: clientSecret!,
    refreshToken: refreshToken!,
    property: property!,
  };
}

/** Prozessweiter Access-Token-Cache. Nur im Speicher, nie persistiert. */
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * fetch mit hartem Zeitlimit. Ohne dieses Limit kann ein hängender Google-
 * Request den gesamten Sync bis zum Plattform-Timeout blockieren – von außen
 * nicht von "läuft noch" zu unterscheiden.
 */
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      throw new GscApiError(`Google hat innerhalb von ${REQUEST_TIMEOUT_MS / 1000} s nicht geantwortet.`);
    }
    throw new GscApiError("Google war nicht erreichbar (Netzwerkfehler).");
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAccessToken(config: GscConfig): Promise<string> {
  const res = await fetchWithTimeout(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!res.ok || !data.access_token) {
    // invalid_grant = Refresh Token widerrufen/abgelaufen: klar erkennbar,
    // aber ohne Token-Wert.
    if (data.error === "invalid_grant") {
      throw new GscAuthError(
        "Google-Refresh-Token ungültig oder widerrufen (invalid_grant). Neuer Token nötig.",
      );
    }
    throw new GscAuthError(`Google-Token-Erneuerung fehlgeschlagen (HTTP ${res.status}).`);
  }

  const ttlMs = (data.expires_in ?? 3600) * 1000;
  cachedToken = { token: data.access_token, expiresAt: Date.now() + ttlMs };
  return data.access_token;
}

async function getAccessToken(config: GscConfig): Promise<string> {
  // 60 s Sicherheitspuffer, damit ein Token nicht mitten in einem Request kippt.
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  return fetchAccessToken(config);
}

export interface GscApiMetricRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * Seiten-Filter einer Abfrage. Google unterstützt in dimensionFilterGroups nur
 * groupType "and"; jeder Scope kommt deshalb mit genau einem page-Filter aus.
 *   none           – kein Seitenfilter (ganze Property)
 *   equals         – exakt eine kanonische URL (inkl. Trailing Slash)
 *   includingRegex – verankerter RE2 über genau die gewünschten Seiten
 */
export type PageFilter =
  | { kind: "none" }
  | { kind: "equals"; url: string }
  | { kind: "includingRegex"; regex: string };

/**
 * Optionaler Filter auf der Query-Dimension. Damit lässt sich derselbe
 * Seiten-Scope in Marken- und Nicht-Marken-Suchen zerlegen, ohne eine zweite
 * Abfragestrecke zu bauen: Google rechnet CTR und Position je Segment selbst
 * korrekt aus.
 */
export type QueryFilter =
  | { kind: "includingRegex"; regex: string }
  | { kind: "excludingRegex"; regex: string };

export interface SearchAnalyticsQuery {
  startDate: string;
  endDate: string;
  /** GSC-Dimensionen, z. B. ["date"] oder ["query"]. */
  dimensions: string[];
  pageFilter: PageFilter;
  queryFilter?: QueryFilter;
}

/**
 * Genau eine AND-Gruppe. Google unterstützt in dimensionFilterGroups nur
 * groupType "and"; Seiten- und Query-Filter liegen deshalb gemeinsam darin und
 * greifen beide.
 */
function dimensionFilterGroups(page: PageFilter, query?: QueryFilter) {
  const filters: Array<{ dimension: string; operator: string; expression: string }> = [];

  if (page.kind === "equals") {
    filters.push({ dimension: "page", operator: "equals", expression: page.url });
  } else if (page.kind === "includingRegex") {
    filters.push({ dimension: "page", operator: "includingRegex", expression: page.regex });
  }

  if (query) {
    filters.push({ dimension: "query", operator: query.kind, expression: query.regex });
  }

  return filters.length > 0 ? [{ groupType: "and", filters }] : undefined;
}

/**
 * Extrahiert Googles nicht-sensible Fehlerdetails (message/reason) aus dem
 * Response-Body. Es werden ausschließlich diese Felder gelesen – niemals
 * Header, Tokens oder der Authorization-Wert.
 */
async function readGoogleError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as {
      error?: { message?: string; errors?: Array<{ reason?: string; message?: string }> };
    };
    const reason = data.error?.errors?.[0]?.reason ?? null;
    const message = data.error?.message ?? data.error?.errors?.[0]?.message ?? null;
    const detail = [reason, message].filter(Boolean).join(": ").slice(0, 300);
    return detail ? ` – ${detail}` : "";
  } catch {
    return "";
  }
}

/**
 * Ein einzelner Seitenaufruf der Search-Analytics-Abfrage, inklusive
 * Fehlerbehandlung:
 *   401 – Access Token verworfen und einmal mit frischem Token wiederholt.
 *   429 / 5xx – Googles Kontingent- und Serverfehler sind vorübergehend; bis zu
 *   MAX_ATTEMPTS Versuche mit exponentiellem Backoff. Genau diese Fehler haben
 *   den Sync bisher stillschweigend halb befüllt zurückgelassen.
 *   403 – fehlender Property-Zugriff, ist nie vorübergehend: sofortiger Abbruch.
 */
async function queryPage(
  config: GscConfig,
  endpoint: string,
  body: Record<string, unknown>,
): Promise<GscApiMetricRow[]> {
  let retriedAuth = false;

  for (let attempt = 1; ; attempt += 1) {
    const token = await getAccessToken(config);
    const res = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = (await res.json()) as { rows?: GscApiMetricRow[] };
      return data.rows ?? [];
    }

    if (res.status === 401 && !retriedAuth) {
      cachedToken = null;
      retriedAuth = true;
      continue;
    }

    const retryable = res.status === 429 || res.status >= 500;
    if (retryable && attempt < MAX_ATTEMPTS) {
      // 1 s, 2 s, 4 s – deutlich unter maxDuration des Route Handlers.
      await sleep(2 ** (attempt - 1) * 1000);
      continue;
    }

    const detail = await readGoogleError(res);
    if (res.status === 401 || res.status === 403) {
      throw new GscApiError(
        `Kein Zugriff auf die konfigurierte Property (HTTP ${res.status}${detail}). ` +
          "Refresh Token, Scope oder Property-Berechtigung prüfen.",
      );
    }
    if (res.status === 429) {
      throw new GscApiError(
        `Google-Kontingent erschöpft (HTTP 429${detail}). Der nächste Lauf holt die Daten nach.`,
      );
    }
    throw new GscApiError(`GSC-Abfrage fehlgeschlagen (HTTP ${res.status}${detail}).`);
  }
}

/**
 * Führt eine Search-Analytics-Abfrage aus und blättert bei Bedarf durch alle
 * Zeilen. Fehler sind typisiert und secret-frei, inklusive HTTP-Status und
 * Googles message/reason für die Diagnose.
 */
export async function querySearchAnalytics(
  query: SearchAnalyticsQuery,
): Promise<GscApiMetricRow[]> {
  const config = readGscConfig();
  const endpoint = `${API_BASE}/${encodeURIComponent(config.property)}/searchAnalytics/query`;
  const filterGroups = dimensionFilterGroups(query.pageFilter, query.queryFilter);

  const rows: GscApiMetricRow[] = [];
  for (let startRow = 0; ; startRow += ROW_LIMIT) {
    const batch = await queryPage(config, endpoint, {
      startDate: query.startDate,
      endDate: query.endDate,
      dimensions: query.dimensions,
      type: "web",
      // "final" liefert ausschließlich abgeschlossene Tage. Die letzten ein bis
      // zwei Tage fehlen dadurch bewusst – lieber ein ehrlich fehlender Tag als
      // ein Wert, der sich morgen rückwirkend ändert.
      dataState: "final",
      // Nie "byProperty" bei page-Filter/-Dimension: "auto" lässt Google die
      // korrekte Aggregation (byPage) wählen und verhindert HTTP 400.
      aggregationType: "auto",
      ...(filterGroups ? { dimensionFilterGroups: filterGroups } : {}),
      rowLimit: ROW_LIMIT,
      startRow,
    });
    rows.push(...batch);
    if (batch.length < ROW_LIMIT) return rows;
  }
}

/* ── Live-Diagnose ──────────────────────────────────────────────────────────── */

export interface GscAccessCheck {
  /** true = Anmeldung und Property-Zugriff sind nachweislich in Ordnung. */
  ok: boolean;
  /** Woran es scheitert; null wenn ok. */
  problem: "config" | "auth" | "property" | "api" | null;
  /** Klartext für die Oberfläche, niemals mit Secrets. */
  message: string;
  /** Konfigurierte Property (kein Secret). */
  property: string | null;
  /** Properties, auf die das verbundene Google-Konto Zugriff hat. */
  availableProperties: string[];
}

/**
 * Prüft in einem Zug Konfiguration, Refresh Token und Property-Berechtigung.
 * Grundlage der Statusanzeige: Damit lässt sich im Dashboard unterscheiden, ob
 * echte Daten fließen oder ein konkreter Fehler vorliegt – ohne den vollen
 * Sync auszulösen.
 */
export async function verifyGscAccess(): Promise<GscAccessCheck> {
  let config: GscConfig;
  try {
    config = readGscConfig();
  } catch (err) {
    return {
      ok: false,
      problem: "config",
      message: err instanceof Error ? err.message : "GSC-Konfiguration unvollständig.",
      property: null,
      availableProperties: [],
    };
  }

  let token: string;
  try {
    token = await fetchAccessToken(config);
  } catch (err) {
    return {
      ok: false,
      problem: "auth",
      message: err instanceof Error ? err.message : "Google-Anmeldung fehlgeschlagen.",
      property: config.property,
      availableProperties: [],
    };
  }

  const res = await fetchWithTimeout(API_BASE, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return {
      ok: false,
      problem: "api",
      message: `Property-Liste nicht abrufbar (HTTP ${res.status}${await readGoogleError(res)}).`,
      property: config.property,
      availableProperties: [],
    };
  }

  const data = (await res.json()) as {
    siteEntry?: Array<{ siteUrl?: string; permissionLevel?: string }>;
  };
  const available = (data.siteEntry ?? [])
    .map((entry) => entry.siteUrl)
    .filter((url): url is string => typeof url === "string");

  if (!available.includes(config.property)) {
    return {
      ok: false,
      problem: "property",
      message:
        `Das verbundene Google-Konto hat keinen Zugriff auf "${config.property}". ` +
        (available.length > 0
          ? `Verfügbar ist: ${available.join(", ")}.`
          : "Es ist keine einzige Property freigegeben."),
      property: config.property,
      availableProperties: available,
    };
  }

  return {
    ok: true,
    problem: null,
    message: `Verbunden mit ${config.property}.`,
    property: config.property,
    availableProperties: available,
  };
}
