import "server-only";

// ─── First Move: interne Scan-Intelligenz zwischen Scan und Anfrage ───────────
// Der Browser bekommt nur die redigierte Sicht. Die vollständige Auswertung
// (Zielseiten, Umsetzungsvorschlag, Messhypothese, alle Beobachtungen) entsteht
// beim Scan und wäre sonst verloren, sobald der Request endet. Dann müsste
// SEESZN nach einer Anfrage bei null anfangen.
//
// Regel: REDACT EXTERNALLY. PRESERVE INTERNALLY.
//
// Ablage ist public.first_move_scan_context (Migration
// 20260809120000_first_move_scan_context.sql). Scan und Anfrage laufen in
// verschiedenen Requests, nach einem Deploy, auf einer zweiten Instanz oder in
// einer zweiten Serverless-Invocation. Ein Prozessspeicher hält das nicht aus,
// eine Tabelle schon.
//
// Grenzen, die hier bewusst gelten:
//   - Es gibt keine Route, die eine Zeile nach ID ausliefert. Diese Ablage ist
//     kein teilbares Ergebnis und kein öffentlicher Endpunkt.
//   - Zugriff nur mit dem Secret Key im Servercode. RLS ist aktiv, anon und
//     authenticated haben weder Grants noch Policies.
//   - Lebensdauer 6 Stunden. Ein Lesen danach gilt als "nicht vorhanden", auch
//     wenn die Zeile physisch noch existiert.
//   - Inhalt sind ausschließlich öffentlich abrufbare Beobachtungen zu einer
//     Domain. Keine Zugangsdaten, keine Tokens, keine Rohseiten, keine
//     personenbezogenen Daten.
//
// Entwicklung: lokal zeigt .env.local auf die Produktionsdatenbank. Deshalb
// schreibt die Entwicklung dort nichts hin, sondern nutzt einen Prozessspeicher
// mit derselben Lebensdauer. Die Entscheidung kommt aus lib/devGuard.ts, es
// gibt kein zweites Sicherheitssystem.

import { randomUUID } from "node:crypto";
import { persistenceAllowed } from "@/lib/devGuard";
import type { FirstMoveFinding, PublicFinding } from "./types";

/**
 * Der Admin-Client wird erst geladen, wenn wirklich persistiert wird. In der
 * Entwicklung und in Werkzeugen ohne Next-Laufzeit läuft der Prozessspeicher,
 * und dieses Modul bleibt ohne Next-Abhängigkeit importierbar.
 */
async function adminClient() {
  const { createSupabaseAdminClient } = await import("@/lib/supabase/server");
  return createSupabaseAdminClient();
}

const TABLE = "first_move_scan_context";

/** Lebensdauer der Brücke. Kurz gehalten, deutlich unter der 30-Tage-Grenze. */
const TTL_MS = 6 * 60 * 60 * 1000;

/** Obergrenze des lokalen Ersatzspeichers. */
const MEMORY_MAX_ENTRIES = 500;

export interface ScanContext {
  id: string;
  domain: string;
  url: string;
  route: string;
  finding: FirstMoveFinding;
}

interface MemoryEntry extends ScanContext {
  expiresAt: number;
}

const memory = new Map<string, MemoryEntry>();

/**
 * Eine nicht erratbare ID. Sie ist zugleich die id des öffentlichen Findings,
 * damit die spätere Anfrage den Kontext ohne Zusatzfeld wiederfindet.
 */
export function createScanContextId(): string {
  return `fm_${randomUUID().replace(/-/g, "")}`;
}

function pruneMemory(now: number): void {
  for (const [key, entry] of memory) {
    if (entry.expiresAt <= now) memory.delete(key);
  }
  while (memory.size > MEMORY_MAX_ENTRIES) {
    const oldest = memory.keys().next();
    if (oldest.done) break;
    memory.delete(oldest.value);
  }
}

/**
 * Legt die vollständige Auswertung unter der Kontext-ID ab.
 * Wirft nie: eine fehlgeschlagene Ablage darf einen laufenden Scan nicht
 * abbrechen. Sie kostet später nur den internen Kontext.
 */
export async function rememberScan(input: {
  context: ScanContext;
  publicFinding: PublicFinding;
}): Promise<void> {
  const now = Date.now();
  const expiresAt = new Date(now + TTL_MS);

  if (!persistenceAllowed()) {
    pruneMemory(now);
    memory.set(input.context.id, { ...input.context, expiresAt: expiresAt.getTime() });
    return;
  }

  try {
    const supabase = await adminClient();
    const { error } = await supabase.from(TABLE).insert({
      id: input.context.id,
      expires_at: expiresAt.toISOString(),
      domain: input.context.domain,
      url: input.context.url,
      route: input.context.route,
      public_finding: input.publicFinding,
      internal_finding: input.context.finding,
    });
    if (error) {
      console.error(`[first-move] scan context insert failed: ${error.message}`);
      return;
    }
    // Gelegenheitsaufräumen: kostet einen Aufruf, spart einen Cronjob.
    void supabase
      .from(TABLE)
      .delete()
      .lt("expires_at", new Date(now).toISOString())
      .then(({ error: cleanupError }) => {
        if (cleanupError) {
          console.error(`[first-move] scan context cleanup failed: ${cleanupError.message}`);
        }
      });
  } catch (err) {
    console.error(
      `[first-move] scan context insert failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * Holt die vollständige Auswertung zu einer Kontext-ID.
 *
 * Gibt null zurück, wenn die ID unbekannt, abgelaufen oder die Ablage gerade
 * nicht erreichbar ist. Der Aufrufer muss diesen Fall immer verkraften: die
 * Anfrage läuft dann mit der öffentlichen Sicht weiter, und die interne
 * Benachrichtigung sagt das ausdrücklich.
 */
export async function recallScan(contextId: string | undefined): Promise<ScanContext | null> {
  if (!contextId) return null;
  const now = Date.now();

  if (!persistenceAllowed()) {
    const entry = memory.get(contextId);
    if (!entry) return null;
    if (entry.expiresAt <= now) {
      memory.delete(contextId);
      return null;
    }
    return {
      id: entry.id,
      domain: entry.domain,
      url: entry.url,
      route: entry.route,
      finding: entry.finding,
    };
  }

  try {
    const supabase = await adminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, domain, url, route, internal_finding, expires_at")
      .eq("id", contextId)
      .maybeSingle();

    if (error) {
      console.error(`[first-move] scan context read failed: ${error.message}`);
      return null;
    }
    if (!data) return null;

    // Logischer Verfall. Physisch stehengebliebene Zeilen ändern daran nichts.
    if (new Date(data.expires_at).getTime() <= now) {
      void supabase.from(TABLE).delete().eq("id", contextId);
      return null;
    }

    return {
      id: data.id as string,
      domain: data.domain as string,
      url: data.url as string,
      route: data.route as string,
      finding: data.internal_finding as FirstMoveFinding,
    };
  } catch (err) {
    console.error(
      `[first-move] scan context read failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    return null;
  }
}

/**
 * Baut aus der internen Auswertung den Verifikationskontext für die interne
 * Benachrichtigung. Nur für SEESZN, nie für die Kundenmail.
 */
export function internalVerificationContext(entry: ScanContext): string {
  const f = entry.finding;
  const lines: string[] = [
    "── Interner Verifikationskontext (nicht an Kunden) ──",
    `Geprüfte URL: ${entry.url}`,
    `Route: ${f.route} · Impact: ${f.impact} · Confidence: ${f.confidence} · Effort: ${f.effort}`,
    `Komplexitätsvorschlag: ${f.suggestedComplexity ?? "n/a"} · Oberfläche: ${f.surfaceKind ?? "n/a"}`,
    `Eligibility: ${f.eligibility.eligible ? "eligible" : `blockiert (${f.eligibility.reason ?? "n/a"})`}`,
  ];

  if (f.proposedFirstMove) {
    lines.push(
      "",
      `Kandidat: ${f.proposedFirstMove.interventionType}`,
      `Titel: ${f.proposedFirstMove.title}`,
      `Scope: ${f.proposedFirstMove.scope}`,
      `Surface: ${f.proposedFirstMove.implementationSurface} · Modus: ${f.proposedFirstMove.implementationMode} · geschätzt: ${f.proposedFirstMove.expectedHours ?? "n/a"} h`,
    );
  }

  if (f.measurementHypothesis) {
    const m = f.measurementHypothesis;
    lines.push(
      "",
      `Messgröße: ${m.metric}`,
      `Basiswert: ${m.baselineDefinition}`,
      `Richtung: ${m.expectedDirection} · Fenster: ${m.measurementWindowWeeksMin} bis ${m.measurementWindowWeeksMax} Wochen`,
      m.attributionLimitations?.length ? `Grenzen: ${m.attributionLimitations.join(" ")}` : "",
    );
  }

  lines.push("", "Beobachtungen:");
  for (const item of f.evidence) {
    const urls = item.scope?.urls?.length ? ` [${item.scope.urls.slice(0, 5).join(" ")}]` : "";
    const measured = item.measuredValue !== undefined ? ` (${item.measuredValue})` : "";
    lines.push(`- ${item.source}/${item.type}: ${item.observation}${measured}${urls}`);
  }

  return lines.filter(Boolean).join("\n");
}

/** Wortlaut, wenn der Kontext nicht mehr auffindbar ist. */
export const NO_CONTEXT_NOTE =
  "Kein interner Scan-Kontext verfügbar (abgelaufen, anderer Zeitpunkt oder Ablage nicht erreichbar). Die Verifikation startet aus dem öffentlichen Signal.";

/** Nur für Tests und Entwicklungswerkzeuge. Leert ausschließlich den Prozessspeicher. */
export function clearScanStore(): void {
  memory.clear();
}
