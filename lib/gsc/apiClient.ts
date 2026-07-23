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

async function fetchAccessToken(config: GscConfig): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
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

export interface SearchAnalyticsQuery {
  startDate: string;
  endDate: string;
  /** GSC-Dimensionen, z. B. ["date"] oder ["query"]. */
  dimensions: string[];
  pageFilter: PageFilter;
}

/** Genau eine AND-Gruppe mit einem page-Filter (oder keiner). */
function dimensionFilterGroups(filter: PageFilter) {
  if (filter.kind === "none") return undefined;
  const pageFilter =
    filter.kind === "equals"
      ? { dimension: "page", operator: "equals", expression: filter.url }
      : { dimension: "page", operator: "includingRegex", expression: filter.regex };
  return [{ groupType: "and", filters: [pageFilter] }];
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
 * Führt eine Search-Analytics-Abfrage aus und blättert bei Bedarf durch alle
 * Zeilen. Ein einmaliger Retry bei 401 (Token gerade abgelaufen) mit frischem
 * Access Token; danach saubere, secret-freie Fehler inklusive HTTP-Status und
 * Googles message/reason für die Diagnose.
 */
export async function querySearchAnalytics(
  query: SearchAnalyticsQuery,
): Promise<GscApiMetricRow[]> {
  const config = readGscConfig();
  const endpoint = `${API_BASE}/${encodeURIComponent(config.property)}/searchAnalytics/query`;
  const filterGroups = dimensionFilterGroups(query.pageFilter);

  const rows: GscApiMetricRow[] = [];
  let startRow = 0;
  let retriedAuth = false;

  for (;;) {
    let token = await getAccessToken(config);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: query.startDate,
        endDate: query.endDate,
        dimensions: query.dimensions,
        type: "web",
        dataState: "final",
        // Nie "byProperty" bei page-Filter/-Dimension: "auto" lässt Google die
        // korrekte Aggregation (byPage) wählen und verhindert HTTP 400.
        aggregationType: "auto",
        ...(filterGroups ? { dimensionFilterGroups: filterGroups } : {}),
        rowLimit: ROW_LIMIT,
        startRow,
      }),
      cache: "no-store",
    });

    if (res.status === 401 && !retriedAuth) {
      // Access Token verworfen und einmal mit frischem Token wiederholen.
      cachedToken = null;
      retriedAuth = true;
      token = await fetchAccessToken(config);
      continue;
    }

    if (!res.ok) {
      const detail = await readGoogleError(res);
      if (res.status === 401 || res.status === 403) {
        throw new GscApiError(
          `Kein Zugriff auf die konfigurierte Property (HTTP ${res.status}${detail}). ` +
            "Refresh Token, Scope oder Property-Berechtigung prüfen.",
        );
      }
      throw new GscApiError(`GSC-Abfrage fehlgeschlagen (HTTP ${res.status}${detail}).`);
    }

    const data = (await res.json()) as { rows?: GscApiMetricRow[] };
    const batch = data.rows ?? [];
    rows.push(...batch);

    if (batch.length < ROW_LIMIT) return rows;
    startRow += ROW_LIMIT;
  }
}
