// ─── GSC-Provider: Auswahl (nur Legacy-Demo-Sync) ─────────────────────────────
// Diese Auswahl bedient ausschließlich den abgeschalteten Legacy-Endpunkt
// POST /api/sync/gsc. Der produktive Weg ist lib/gsc/apiSync.ts über die echte
// Search-Console-API.
//
// Bewusst KEIN stiller Rückfall mehr auf Demo-Daten: fehlten die Credentials,
// lieferte die alte Auswahl synthetische Zahlen, die im Dashboard nicht von
// echten zu unterscheiden waren. Ohne Credentials gibt es jetzt einen Fehler.
// Demo-Daten entstehen nur noch, wenn sie ausdrücklich über
// LEGACY_GSC_DEMO_SYNC_ENABLED=true angefordert werden.

import "server-only";
import { DemoGscProvider } from "./demoProvider";
import { GoogleGscProvider } from "./googleProvider";
import type { GscProvider } from "./types";

export class GscProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GscProviderUnavailableError";
  }
}

export function getGscProvider(): GscProvider {
  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const privateKey = process.env.GSC_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    return new GoogleGscProvider(clientEmail, privateKey);
  }
  if (process.env.LEGACY_GSC_DEMO_SYNC_ENABLED === "true") {
    return new DemoGscProvider();
  }
  throw new GscProviderUnavailableError(
    "Kein GSC-Provider verfügbar: GSC_CLIENT_EMAIL und GSC_PRIVATE_KEY fehlen.",
  );
}

export type { GscFetchParams, GscMetricRow, GscProvider } from "./types";
