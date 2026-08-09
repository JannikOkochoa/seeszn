// ─── POST /api/first-move/paid-check ──────────────────────────────────────────
// Stufe 1 des Paid-Flows: der öffentliche Vorcheck. Eingang sind ausschließlich
// Domain und Budgetband. Kein OAuth, kein Account-Zugriff, keine E-Mail.
//
// Der Read-only-Zugriff auf Google Ads ist ausdrücklich NICHT Teil dieser Route.
// Er wird erst angeboten, nachdem hier ein echter öffentlicher Befund vorlag.
//
// Antwortformat wie /api/first-move/scan: NDJSON, ein Ereignis pro Zeile.
//
// V6: auch hier verlässt nur die öffentliche Sicht den Server.

import { toPublicFinding } from "@/lib/first-move/disclosure";
import { runPaidPublicCheck, scanErrorCode } from "@/lib/first-move/scan";
import { createScanContextId, rememberScan } from "@/lib/first-move/scanStore";
import type { ScanErrorEvent, ScanEvent, SpendBand } from "@/lib/first-move/types";
import { SPEND_BANDS } from "@/lib/first-move/types";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT = 8;
const WINDOW_MS = 10 * 60 * 1000;

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

function errorStream(code: ErrorCode, status: number): Response {
  return new Response(line({ type: "error", code, message: ERROR_TEXT[code] }), {
    status,
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit("first-move-paid", clientIp(request), LIMIT, WINDOW_MS);
  if (!limit.ok) return errorStream("rate_limited", 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorStream("invalid_domain", 400);
  }

  const { domain, spendBand } = (body ?? {}) as { domain?: unknown; spendBand?: unknown };
  if (typeof domain !== "string" || !domain.trim()) {
    return errorStream("invalid_domain", 400);
  }
  const validBands = SPEND_BANDS.map((b) => b.id) as string[];
  const band: SpendBand =
    typeof spendBand === "string" && validBands.includes(spendBand)
      ? (spendBand as SpendBand)
      : "unknown";

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
        const outcome = await runPaidPublicCheck(domain, band, send);

        let publicFinding = null;
        if (outcome.finding) {
          const contextId = createScanContextId();
          publicFinding = { ...toPublicFinding(outcome.finding), id: contextId };
          await rememberScan({
            context: {
              id: contextId,
              domain: outcome.domain,
              url: outcome.url,
              route: "paid_acquisition",
              finding: outcome.finding,
            },
            publicFinding,
          });
        }

        send({
          type: "result",
          domain: outcome.domain,
          url: outcome.url,
          route: "paid_acquisition",
          finding: publicFinding,
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
