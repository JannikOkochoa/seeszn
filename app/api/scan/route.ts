// ─── POST /api/scan ───────────────────────────────────────────────────────────
// Free, server-side Sichtbarkeitsprüfung. Accepts a domain or brand URL, runs
// only free checks (see lib/scan/checks.ts) and returns heuristic readiness
// scores. No database, no paid services, no AI-system or SERP polling.
//
// Safety: input is validated and DNS-checked against private ranges before any
// request leaves the server (see lib/scan/fetcher.ts). Every check has a timeout
// and a byte cap; a single failing check never crashes the response.

import { normalizeUrl, SafeFetchError } from "@/lib/scan/fetcher";
import { runChecks } from "@/lib/scan/checks";
import { scoreSurface } from "@/lib/scan/score";
import { buildAiAnswers } from "@/lib/scan/aiCheck";
import type { Locale, ScanError } from "@/lib/scan/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(error: string, code: ScanError["code"], status: number): Response {
  return Response.json({ error, code } satisfies ScanError, { status });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Ungültige Anfrage.", "invalid_domain", 400);
  }

  const { domain, locale } = (body ?? {}) as { domain?: unknown; locale?: unknown };
  if (typeof domain !== "string" || !domain.trim()) {
    return fail("Bitte gib eine Domain oder einen Markennamen ein.", "invalid_domain", 400);
  }
  const loc: Locale = locale === "en" ? "en" : "de";

  // 1) Validate + normalize the target. Rejects non-public / unsafe hosts.
  let url: URL;
  try {
    url = normalizeUrl(domain);
  } catch (err) {
    if (err instanceof SafeFetchError) {
      const code = err.code === "blocked_target" ? "blocked_target" : "invalid_domain";
      return fail(
        loc === "de"
          ? "Diese Eingabe können wir nicht prüfen. Bitte gib eine öffentliche Domain ein."
          : "We can't check this input. Please enter a public domain.",
        code,
        400,
      );
    }
    return fail("Ungültige Domain.", "invalid_domain", 400);
  }

  // 2) Run all free checks. Transport / safety failures map to clean states.
  try {
    const { signals, finalUrl } = await runChecks(url);
    const displayDomain = new URL(finalUrl).hostname.replace(/^www\./, "");
    const result = scoreSurface({ domain: displayDomain, url: finalUrl, signals, locale: loc });
    // Generate the 3 KI-Antwortfragen and run the optional Web-Signalcheck.
    // Never breaks the scan: buildAiAnswers degrades to checked=false on failure.
    const { questions, checks } = await buildAiAnswers(displayDomain, signals, loc);
    result.aiAnswerQuestions = questions;
    result.aiAnswerChecks = checks;
    return Response.json(result);
  } catch (err) {
    if (err instanceof SafeFetchError) {
      if (err.code === "timeout") {
        return fail(
          loc === "de" ? "Die Website hat zu lange gebraucht." : "The site took too long to respond.",
          "timeout",
          504,
        );
      }
      if (err.code === "blocked_target") {
        return fail(
          loc === "de" ? "Dieses Ziel können wir nicht prüfen." : "We can't check this target.",
          "blocked_target",
          400,
        );
      }
      return fail(
        loc === "de"
          ? "Die Website ist nicht erreichbar. Prüfe die Schreibweise der Domain."
          : "The site is unreachable. Check the spelling of the domain.",
        "unreachable",
        502,
      );
    }
    return fail(
      loc === "de" ? "Die Prüfung ist fehlgeschlagen." : "The check failed.",
      "internal",
      500,
    );
  }
}
