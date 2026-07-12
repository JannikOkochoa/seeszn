// ─── GSC-Provider: Schnittstelle ──────────────────────────────────────────────
// Externe Search-Console-Strukturen bleiben hinter dieser Schnittstelle
// gekapselt. Route Handler und Sync-Service kennen nur GscMetricRow; ob die
// Daten von der echten API oder dem Demo-Provider kommen, ist austauschbar.

/** Ein Tageswert pro (Seite, Query, Gerät, Land) – normalisiert. */
export interface GscMetricRow {
  /** ISO-Datum YYYY-MM-DD */
  date: string;
  pageUrl: string;
  query: string;
  device: string;
  country: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscFetchParams {
  /** GSC-Property, z. B. "https://www.kluehspies.de/" oder "sc-domain:kluehspies.de" */
  siteUrl: string;
  /** inklusive, YYYY-MM-DD */
  startDate: string;
  /** inklusive, YYYY-MM-DD */
  endDate: string;
  /** Nur diese Seiten werden abgefragt bzw. generiert. */
  pageUrls: string[];
}

export interface GscProvider {
  readonly kind: "google" | "demo";
  fetchDailyMetrics(params: GscFetchParams): Promise<GscMetricRow[]>;
}
