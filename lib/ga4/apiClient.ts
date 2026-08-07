// ─── GA4-API: OAuth2-Client und Data-API-Zugriff ─────────────────────────────
// Serverseitiger Zugriff auf die Google Analytics Data API über denselben
// OAuth2-Refresh-Token-Flow wie die Search Console – aber mit eigenem Token
// und eigenem Scope (analytics.readonly).
//
// Herkunft der Zugangsdaten, in dieser Reihenfolge:
//   1. Umgebungsvariablen (GA4_REFRESH_TOKEN, GA4_PROPERTY_ID)
//   2. Supabase Vault
// Der Vault ist der Regelfall: Dort landet der Token direkt nach der
// Zustimmung, ohne Umweg über die Hosting-Oberfläche. Genau diese Strecke hat
// sich bei der Search Console als die belastbare erwiesen.
//
// Fehler sind typisiert und secret-frei:
//   Ga4ConfigError – Zugangsdaten fehlen
//   Ga4AuthError   – Token widerrufen/ungültig
//   Ga4ApiError    – Abfragefehler, fehlende Berechtigung, API nicht aktiv

import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DATA_API = "https://analyticsdata.googleapis.com/v1beta";

const REQUEST_TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 4;
/** Die Data API erlaubt höchstens zehn Metriken je Abfrage. */
export const MAX_METRICS_PER_REQUEST = 10;

export class Ga4ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Ga4ConfigError";
  }
}
export class Ga4AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Ga4AuthError";
  }
}
export class Ga4ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Ga4ApiError";
  }
}

export interface Ga4Credentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  propertyId: string;
}

function envValue(name: string, raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  let value = raw.trim().replace(/^["']|["']$/g, "");
  if (value.startsWith(`${name}=`)) value = value.slice(name.length + 1).trim();
  return value || undefined;
}

async function fromVault(fn: "ga4_refresh_token" | "ga4_property_id"): Promise<string | undefined> {
  try {
    const { data, error } = await createSupabaseAdminClient().rpc(fn);
    return !error && typeof data === "string" && data.length > 0 ? data : undefined;
  } catch {
    return undefined;
  }
}

/** Liest die Zugangsdaten. Fehlt etwas, werden nur Namen genannt, nie Werte. */
export async function resolveGa4Credentials(): Promise<Ga4Credentials> {
  const clientId =
    envValue("GA4_CLIENT_ID", process.env.GA4_CLIENT_ID) ??
    envValue("GOOGLE_GSC_CLIENT_ID", process.env.GOOGLE_GSC_CLIENT_ID);
  const clientSecret =
    envValue("GA4_CLIENT_SECRET", process.env.GA4_CLIENT_SECRET) ??
    envValue("GOOGLE_GSC_CLIENT_SECRET", process.env.GOOGLE_GSC_CLIENT_SECRET);

  const refreshToken =
    envValue("GA4_REFRESH_TOKEN", process.env.GA4_REFRESH_TOKEN) ??
    (await fromVault("ga4_refresh_token"));
  const propertyId =
    envValue("GA4_PROPERTY_ID", process.env.GA4_PROPERTY_ID) ?? (await fromVault("ga4_property_id"));

  const missing = [
    ["GA4_CLIENT_ID", clientId],
    ["GA4_CLIENT_SECRET", clientSecret],
    ["GA4_REFRESH_TOKEN", refreshToken],
    ["GA4_PROPERTY_ID", propertyId],
  ]
    .filter(([, v]) => !v)
    .map(([n]) => n as string);

  if (missing.length > 0) {
    throw new Ga4ConfigError(
      `GA4 ist nicht eingerichtet. Es fehlt: ${missing.join(", ")}. ` +
        "Einrichtung über scripts/ga4-authorize.mjs.",
    );
  }
  if (!/^[0-9]+$/.test(propertyId!)) {
    throw new Ga4ConfigError("GA4_PROPERTY_ID muss rein numerisch sein.");
  }

  return {
    clientId: clientId!,
    clientSecret: clientSecret!,
    refreshToken: refreshToken!,
    propertyId: propertyId!,
  };
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      throw new Ga4ApiError(`Google hat innerhalb von ${REQUEST_TIMEOUT_MS / 1000} s nicht geantwortet.`);
    }
    throw new Ga4ApiError("Google war nicht erreichbar (Netzwerkfehler).");
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let cachedToken: { token: string; expiresAt: number } | null = null;

async function fetchAccessToken(creds: Ga4Credentials): Promise<string> {
  const res = await fetchWithTimeout(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      refresh_token: creds.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!res.ok || !data.access_token) {
    if (data.error === "invalid_grant") {
      throw new Ga4AuthError(
        "GA4-Refresh-Token ungültig oder widerrufen (invalid_grant). Neue Zustimmung nötig.",
      );
    }
    throw new Ga4AuthError(`GA4-Token-Erneuerung fehlgeschlagen (HTTP ${res.status}).`);
  }
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

async function getAccessToken(creds: Ga4Credentials): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;
  return fetchAccessToken(creds);
}

/* ── Abfragen ───────────────────────────────────────────────────────────────── */

export interface Ga4ReportRequest {
  dateRanges: Array<{ startDate: string; endDate: string }>;
  dimensions?: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
  dimensionFilter?: unknown;
  orderBys?: unknown;
  limit?: number;
  offset?: number;
  keepEmptyRows?: boolean;
}

export interface Ga4ReportRow {
  dimensionValues: Array<{ value: string }>;
  metricValues: Array<{ value: string }>;
}

export interface Ga4Report {
  rows: Ga4ReportRow[];
  dimensionHeaders: string[];
  metricHeaders: string[];
  /** Zeitzone der Property – Grundlage jeder Datumsinterpretation. */
  timeZone: string | null;
  currencyCode: string | null;
  /** true = Google hat Werte aus Datenschutzgründen zurückgehalten. */
  subjectToThresholding: boolean;
}

/**
 * Führt einen Report aus und blättert bei Bedarf durch alle Zeilen.
 * Retry mit Backoff bei 429/5xx; 401 einmal mit frischem Token.
 */
export async function runGa4Report(request: Ga4ReportRequest): Promise<Ga4Report> {
  if (request.metrics.length > MAX_METRICS_PER_REQUEST) {
    throw new Ga4ApiError(
      `Zu viele Metriken in einer Abfrage (${request.metrics.length}); die Data API erlaubt ${MAX_METRICS_PER_REQUEST}.`,
    );
  }

  const creds = await resolveGa4Credentials();
  const endpoint = `${DATA_API}/properties/${creds.propertyId}:runReport`;
  const pageSize = request.limit ?? 100_000;

  const rows: Ga4ReportRow[] = [];
  let dimensionHeaders: string[] = [];
  let metricHeaders: string[] = [];
  let timeZone: string | null = null;
  let currencyCode: string | null = null;
  let subjectToThresholding = false;
  let offset = request.offset ?? 0;

  for (;;) {
    let retriedAuth = false;
    let body: Record<string, unknown> | null = null;

    for (let attempt = 1; ; attempt += 1) {
      const token = await getAccessToken(creds);
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, limit: pageSize, offset }),
      });

      if (res.ok) {
        body = (await res.json()) as Record<string, unknown>;
        break;
      }

      if (res.status === 401 && !retriedAuth) {
        cachedToken = null;
        retriedAuth = true;
        continue;
      }

      const detail = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      const message = detail.error?.message ?? "";

      if ((res.status === 429 || res.status >= 500) && attempt < MAX_ATTEMPTS) {
        await sleep(2 ** (attempt - 1) * 1000);
        continue;
      }
      if (res.status === 403) {
        throw new Ga4ApiError(
          `Kein Zugriff auf die GA4-Property (HTTP 403). ${message.slice(0, 200)}`.trim(),
        );
      }
      if (res.status === 429) {
        throw new Ga4ApiError("GA4-Kontingent erschöpft (HTTP 429). Der nächste Lauf holt es nach.");
      }
      throw new Ga4ApiError(`GA4-Abfrage fehlgeschlagen (HTTP ${res.status}). ${message.slice(0, 200)}`.trim());
    }

    const page = body as {
      rows?: Ga4ReportRow[];
      rowCount?: number;
      dimensionHeaders?: Array<{ name: string }>;
      metricHeaders?: Array<{ name: string }>;
      metadata?: { timeZone?: string; currencyCode?: string; subjectToThresholding?: boolean };
    };

    dimensionHeaders = (page.dimensionHeaders ?? []).map((h) => h.name);
    metricHeaders = (page.metricHeaders ?? []).map((h) => h.name);
    timeZone = page.metadata?.timeZone ?? timeZone;
    currencyCode = page.metadata?.currencyCode ?? currencyCode;
    subjectToThresholding = subjectToThresholding || Boolean(page.metadata?.subjectToThresholding);

    const batch = page.rows ?? [];
    rows.push(...batch);

    const rowCount = page.rowCount ?? rows.length;
    offset += batch.length;
    if (batch.length === 0 || rows.length >= rowCount) break;
  }

  return { rows, dimensionHeaders, metricHeaders, timeZone, currencyCode, subjectToThresholding };
}

export interface Ga4AccessCheck {
  ok: boolean;
  problem: "config" | "auth" | "api" | null;
  message: string;
  propertyId: string | null;
  timeZone: string | null;
}

/**
 * Prüft Zugangsdaten, Token und Property-Zugriff in einem Zug – ohne einen
 * vollen Sync auszulösen. Grundlage der ehrlichen Statusanzeige.
 */
export async function verifyGa4Access(): Promise<Ga4AccessCheck> {
  let creds: Ga4Credentials;
  try {
    creds = await resolveGa4Credentials();
  } catch (err) {
    return {
      ok: false,
      problem: "config",
      message: err instanceof Error ? err.message : "GA4-Konfiguration unvollständig.",
      propertyId: null,
      timeZone: null,
    };
  }

  try {
    const report = await runGa4Report({
      dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
      metrics: [{ name: "sessions" }],
      limit: 1,
    });
    return {
      ok: true,
      problem: null,
      message: `Verbunden mit GA4-Property ${creds.propertyId}.`,
      propertyId: creds.propertyId,
      timeZone: report.timeZone,
    };
  } catch (err) {
    const isAuth = err instanceof Ga4AuthError;
    return {
      ok: false,
      problem: isAuth ? "auth" : "api",
      message: err instanceof Error ? err.message : "GA4-Abfrage fehlgeschlagen.",
      propertyId: creds.propertyId,
      timeZone: null,
    };
  }
}
