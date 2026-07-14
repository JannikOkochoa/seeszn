// ─── KPI-Workspace: Formatierung ──────────────────────────────────────────────
// Deutsche Zahlen- und Datumsformate, an einer Stelle.

export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toLocaleString("de-DE", { maximumFractionDigits: digits })} %`;
}

/** Vorzeichenbehaftete Prozentveränderung, z. B. "+12,4 %". */
export function formatDelta(pct: number | null): string {
  if (pct === null) return "neu";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}.${m}.`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}, ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`;
}

/** Dauer zwischen zwei Zeitpunkten, grob und lesbar. */
export function formatDuration(fromIso: string, toIso?: string | null): string {
  const from = new Date(fromIso).getTime();
  const to = toIso ? new Date(toIso).getTime() : Date.now();
  const mins = Math.max(0, Math.round((to - from) / 60_000));
  if (mins < 60) return `${mins} Min.`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} Std.`;
  return `${Math.round(hours / 24)} Tage`;
}

export function displayName(profile: { full_name: string | null; email: string | null } | undefined | null): string {
  if (!profile) return "Unbekannt";
  return profile.full_name?.trim() || profile.email || "Unbekannt";
}
