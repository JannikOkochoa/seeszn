// ─── Intelligence → Maßnahme ──────────────────────────────────────────────────
// Übersetzt einen berechneten Vorschlag (Action Feed, Quick Win, Verlierer) in
// den TaskDraft des Erstellen-Drawers. Die Produktseite wird über die URL bzw.
// den Scope-Namen aus dem Seitenbestand aufgelöst – nie hart codiert.

import type { ActionDraftSeed } from "@/lib/kpi/intelligence";
import type { PageRow } from "@/lib/kpi/types";
import type { TaskDraft } from "../workspace";

/** Produktseite zu einer URL (mit/ohne Slash) im Seitenbestand. */
export function pageIdForUrl(url: string | undefined, pages: PageRow[]): string | null {
  if (!url) return null;
  const normalized = url.replace(/\/$/, "");
  return pages.find((p) => p.url === url || p.url.replace(/\/$/, "") === normalized)?.id ?? null;
}

/** Produktseite zu einem Scope-Label ("Berlin") über Stadt oder Namen. */
export function pageIdForScopeLabel(label: string, pages: PageRow[]): string | null {
  return (
    pages.find((p) => p.city === label)?.id ??
    pages.find((p) => p.name.toLowerCase().includes(label.toLowerCase()))?.id ??
    null
  );
}

export function draftFromSeed(seed: ActionDraftSeed, pages: PageRow[]): TaskDraft {
  return {
    source: seed.source,
    observation: seed.observation,
    query: seed.query,
    pageUrl: seed.pageUrl,
    pageId: pageIdForUrl(seed.pageUrl, pages),
    metrics: seed.metrics,
  };
}
