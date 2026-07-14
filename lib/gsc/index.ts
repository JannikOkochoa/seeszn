// ─── GSC-Provider: Auswahl ────────────────────────────────────────────────────
// Echter Provider nur bei vorhandenen Credentials, sonst Demo-Daten mit
// identischer Schnittstelle. Der Aufrufer merkt keinen Unterschied.

import "server-only";
import { DemoGscProvider } from "./demoProvider";
import { GoogleGscProvider } from "./googleProvider";
import type { GscProvider } from "./types";

export function getGscProvider(): GscProvider {
  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const privateKey = process.env.GSC_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    return new GoogleGscProvider(clientEmail, privateKey);
  }
  return new DemoGscProvider();
}

export type { GscFetchParams, GscMetricRow, GscProvider } from "./types";
