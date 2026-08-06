// ─── GA4: Konfiguration und ehrlicher Verfügbarkeitsstatus ───────────────────
// GA4 ist derzeit NICHT angebunden. Diese Datei ist bewusst nur die Nahtstelle:
// sie liest die Konfiguration und sagt, was fehlt. Sie erzeugt keine Zahlen,
// keine Schätzungen und keine Platzhalter.
//
// Warum nicht mehr: Der vorhandene Google-Refresh-Token trägt ausschließlich
// den Scope webmasters.readonly. Die GA4 Data API antwortet damit
// nachweislich mit ACCESS_TOKEN_SCOPE_INSUFFICIENT. Google verlangt für
// analytics.readonly eine neue, menschliche OAuth-Zustimmung – die lässt sich
// nicht serverseitig umgehen, und das soll sie auch nicht.
//
// Sobald die drei Variablen unten gesetzt sind, ist die Anbindung eine reine
// Abfrage: Das Dashboard rendert GA4-Kennzahlen über dasselbe
// ExecutiveKpiModel und dieselbe ExecutiveKpi-Komponente wie die
// GSC-Kennzahlen. Es muss keine Dashboard-Komponente neu gebaut werden.

/** Scope, den Google für die GA4 Data API verlangt. */
export const GA4_REQUIRED_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export interface Ga4Config {
  /** Numerische GA4-Property-ID, z. B. "123456789". */
  propertyId: string;
  clientId: string;
  clientSecret: string;
  /** Refresh Token MIT analytics.readonly – nicht der GSC-Token. */
  refreshToken: string;
}

export type Ga4Availability =
  | { configured: true; config: Ga4Config }
  | { configured: false; missing: string[]; reason: string };

/**
 * Liest die GA4-Konfiguration. Fehlt etwas, werden ausschließlich die
 * Variablennamen gemeldet, niemals Werte.
 *
 * Bewusst eigene Client-Variablen statt der GSC-Variablen: Ein Refresh Token
 * ist an die Scopes gebunden, die bei der Zustimmung erteilt wurden. Den
 * GSC-Token mitzubenutzen würde nur so lange scheinbar funktionieren, bis die
 * erste GA4-Abfrage mit 403 zurückkommt.
 */
export function readGa4Availability(): Ga4Availability {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientId = process.env.GA4_CLIENT_ID ?? process.env.GOOGLE_GSC_CLIENT_ID;
  const clientSecret = process.env.GA4_CLIENT_SECRET ?? process.env.GOOGLE_GSC_CLIENT_SECRET;
  const refreshToken = process.env.GA4_REFRESH_TOKEN;

  const missing = [
    ["GA4_PROPERTY_ID", propertyId],
    ["GA4_CLIENT_ID", clientId],
    ["GA4_CLIENT_SECRET", clientSecret],
    ["GA4_REFRESH_TOKEN", refreshToken],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name as string);

  if (missing.length > 0) {
    return {
      configured: false,
      missing,
      reason:
        `GA4 ist nicht verbunden. Es fehlt: ${missing.join(", ")}. ` +
        `Der GA4_REFRESH_TOKEN muss über eine eigene Google-Zustimmung mit dem Scope ` +
        `${GA4_REQUIRED_SCOPE} erzeugt werden; der bestehende Search-Console-Token ` +
        "trägt diesen Scope nicht.",
    };
  }

  return {
    configured: true,
    config: {
      propertyId: propertyId!,
      clientId: clientId!,
      clientSecret: clientSecret!,
      refreshToken: refreshToken!,
    },
  };
}
