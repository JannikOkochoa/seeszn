// ─── GSC-Provider: Google Search Console ──────────────────────────────────────
// Echter Provider über die Search Analytics API mit Service-Account-Auth
// (JWT, RS256 via node:crypto – ohne zusätzliche Abhängigkeiten). Wird nur
// aktiv, wenn GSC_CLIENT_EMAIL und GSC_PRIVATE_KEY gesetzt sind; bis dahin
// übernimmt der Demo-Provider mit identischer Schnittstelle.

import "server-only";
import { createSign } from "node:crypto";
import type { GscFetchParams, GscMetricRow, GscProvider } from "./types";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const ROW_LIMIT = 25_000;

interface GscApiRow {
  keys: string[]; // [date, page, query, device, country]
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

export class GoogleGscProvider implements GscProvider {
  readonly kind = "google" as const;

  constructor(
    private readonly clientEmail: string,
    private readonly privateKey: string,
  ) {}

  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = base64url(
      JSON.stringify({
        iss: this.clientEmail,
        scope: SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
      }),
    );
    // Env-Variablen liefern \n als Literal; für PEM zurückwandeln.
    const pem = this.privateKey.replace(/\\n/g, "\n");
    const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(pem);
    const assertion = `${header}.${claims}.${base64url(signature)}`;

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    if (!res.ok) {
      throw new Error(`GSC-Auth fehlgeschlagen (${res.status})`);
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new Error("GSC-Auth: kein Access Token erhalten");
    }
    return data.access_token;
  }

  async fetchDailyMetrics(params: GscFetchParams): Promise<GscMetricRow[]> {
    const token = await this.getAccessToken();
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      params.siteUrl,
    )}/searchAnalytics/query`;

    const rows: GscMetricRow[] = [];
    let startRow = 0;

    // Seitenweise abrufen, bis die API weniger als ROW_LIMIT Zeilen liefert.
    for (;;) {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: params.startDate,
          endDate: params.endDate,
          dimensions: ["date", "page", "query", "device", "country"],
          dimensionFilterGroups: [
            {
              groupType: "or",
              filters: params.pageUrls.map((url) => ({
                dimension: "page",
                operator: "equals",
                expression: url,
              })),
            },
          ],
          rowLimit: ROW_LIMIT,
          startRow,
          dataState: "final",
        }),
      });
      if (!res.ok) {
        throw new Error(`GSC-Abfrage fehlgeschlagen (${res.status})`);
      }

      const data = (await res.json()) as { rows?: GscApiRow[] };
      const batch = data.rows ?? [];

      for (const row of batch) {
        const [date, pageUrl, query, device, country] = row.keys;
        rows.push({
          date,
          pageUrl,
          query,
          device,
          country,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        });
      }

      if (batch.length < ROW_LIMIT) {
        return rows;
      }
      startRow += ROW_LIMIT;
    }
  }
}
