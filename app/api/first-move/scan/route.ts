// ─── POST /api/first-move/scan ────────────────────────────────────────────────
// Öffentlicher Scan für Search, AI Search und den unentschiedenen Pfad.
//
// Die Antwort ist ein NDJSON-Stream: jede Zeile ist ein Ereignis. Zustände gehen
// raus, sobald der jeweilige Schritt real fertig ist. Damit zeigt die Oberfläche
// echten Fortschritt statt eines Platzhalters, und es entsteht keine künstliche
// Wartezeit, wenn das Ergebnis früher da ist.
//
// Sicherheit: jede ausgehende Anfrage läuft über lib/scan/fetcher (SSRF-Schutz,
// nur http und https, private und Link-Local-Bereiche gesperrt, Redirects erneut
// geprüft, Timeout, Byte-Cap). Zusätzlich greift ein Rate Limit pro IP. Es wird
// nichts geloggt, was den Nutzer identifiziert.
//
// V6: das Ergebnis verlässt den Server nur als öffentliche Sicht. Umsetzungsplan,
// Zielseiten und Messhypothese bleiben hier und gehören zum bezahlten Produkt.

import { toPublicFinding } from "@/lib/first-move/disclosure";
import { runFirstMoveScan, scanErrorCode } from "@/lib/first-move/scan";
import { createScanContextId, rememberScan } from "@/lib/first-move/scanStore";
import type { FirstMoveRoute, ScanErrorEvent, ScanEvent } from "@/lib/first-move/types";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT = 8;
const WINDOW_MS = 10 * 60 * 1000;

const ROUTES: FirstMoveRoute[] = ["search", "ai_search", "paid_acquisition", "unsure"];

type ErrorCode = ScanErrorEvent["code"];

const ERROR_TEXT: Record<ErrorCode, string> = {
  invalid_domain: "Diese Eingabe können wir nicht prüfen. Bitte gib eine öffentliche Domain ein.",
  blocked_target: "Dieses Ziel können wir nicht prüfen.",
  unreachable: "Wir konnten die Website nicht abrufen. Prüfe die Schreibweise, oder der Server blockiert automatisierte Abrufe.",
  timeout: "Die Website hat zu lange gebraucht.",
  internal: "Die Prüfung ist fehlgeschlagen.",
  rate_limited: "Zu viele Anfragen. Bitte versuche es in wenigen Minuten erneut.",
};

function line(event: ScanEvent): string {
  return `${JSON.stringify(event)}\n`;
}

/** Einzelne Fehlerzeile als vollständiger Stream, damit das Frontend nur einen Pfad kennt. */
function errorStream(code: ErrorCode, status: number): Response {
  const body = line({ type: "error", code, message: ERROR_TEXT[code] });
  return new Response(body, {
    status,
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit("first-move-scan", clientIp(request), LIMIT, WINDOW_MS);
  if (!limit.ok) return errorStream("rate_limited", 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorStream("invalid_domain", 400);
  }

  const { domain, route } = (body ?? {}) as { domain?: unknown; route?: unknown };
  if (typeof domain !== "string" || !domain.trim()) {
    return errorStream("invalid_domain", 400);
  }
  const picked: FirstMoveRoute =
    typeof route === "string" && (ROUTES as string[]).includes(route)
      ? (route as FirstMoveRoute)
      : "unsure";

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ScanEvent) => {
        try {
          controller.enqueue(encoder.encode(line(event)));
        } catch {
          /* Verbindung vom Client geschlossen */
        }
      };

      try {
        const outcome = await runFirstMoveScan(domain, picked, send);

        // Die vollständige Auswertung bleibt serverseitig verfügbar, damit eine
        // spätere Anfrage nicht bei null anfängt. Die Kontext-ID ist zugleich
        // die id des öffentlichen Findings: nicht erratbar, und es gibt keine
        // Route, die damit etwas ausliefert.
        let publicFinding = null;
        if (outcome.finding) {
          const contextId = createScanContextId();
          publicFinding = { ...toPublicFinding(outcome.finding), id: contextId };
          await rememberScan({
            context: {
              id: contextId,
              domain: outcome.domain,
              url: outcome.url,
              route: picked,
              finding: outcome.finding,
            },
            publicFinding,
          });
        }

        send({
          type: "result",
          domain: outcome.domain,
          url: outcome.url,
          route: picked,
          finding: publicFinding,
          // Die Diagnose enthält nur aggregierte Beobachtungen, keine URLs und
          // keine Messwerte einzelner Seiten. Sie darf deshalb ungefiltert raus.
          diagnosis: outcome.diagnosis,
          notQualifiedReason: outcome.notQualifiedReason,
          at: new Date().toISOString(),
        });
      } catch (err) {
        const code = scanErrorCode(err);
        send({ type: "error", code, message: ERROR_TEXT[code] });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
