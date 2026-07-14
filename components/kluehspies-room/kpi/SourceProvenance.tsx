"use client";

// ─── Quellenkennzeichnung ─────────────────────────────────────────────────────
// Eine ruhige Zeile unter wichtigen Modulen: Quelle, Scope, Zeitraum,
// Datenstand, Importzeitpunkt, Status. Keine Badges, keine Farben, keine
// internen UUIDs – nur eine feine Linie und lesbarer Text im Raumstil.

import { formatDate, formatDateTime } from "@/lib/kpi/format";

export type ProvenanceSource =
  | "Google Search Console Export"
  | "Google Search Console API"
  | "Automatischer Website-Scan"
  | "Berechnet"
  | "Manuell gepflegt"
  | "Demo";

export default function SourceProvenance({
  source,
  scope,
  periodStart,
  periodEnd,
  dataAsOf,
  importedAt,
  status,
  maintainedBy,
}: {
  source: ProvenanceSource;
  scope?: string;
  /** Zeitraum der zugrunde liegenden Daten (z. B. der Exportzeitraum). */
  periodStart?: string;
  periodEnd?: string;
  /** Letzter Tag mit Daten. */
  dataAsOf?: string | null;
  importedAt?: string | null;
  status?: string;
  /** Bei manuell gepflegten Werten: verantwortliche Person. */
  maintainedBy?: string;
}) {
  const parts: string[] = [`Quelle: ${source}`];
  if (scope) parts.push(`Scope: ${scope}`);
  if (periodStart && periodEnd) {
    parts.push(`Zeitraum ${formatDate(periodStart)} bis ${formatDate(periodEnd)}`);
  }
  if (dataAsOf) parts.push(`Datenstand ${formatDate(dataAsOf)}`);
  if (importedAt) parts.push(`importiert am ${formatDateTime(importedAt)}`);
  if (maintainedBy) parts.push(`gepflegt von ${maintainedBy}`);
  if (status) parts.push(status);

  return (
    <p className="kw-provenance kr-meta" data-source={source}>
      {parts.join(" · ")}
    </p>
  );
}
