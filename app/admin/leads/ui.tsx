// ─── Gemeinsame Bausteine des Lead-CRM ────────────────────────────────────────
// Optik übernommen aus dem früheren CRM: Systemschrift, Papierton #f4f3ee,
// Hairlines statt Kästen, farbige Status-Chips. Alles Inline-Styles — dieser
// Bereich hängt bewusst nicht am Design-System der öffentlichen Seiten, damit
// eine Änderung am Marketing-Layout nie ein internes Werkzeug verschiebt.

import type { CSSProperties } from "react";
import {
  DELIVERY_LABEL,
  LEAD_PRIORITY_LABEL,
  LEAD_STATUS_LABEL,
  type DeliveryStatus,
  type LeadPriority,
  type LeadStatus,
} from "@/lib/leads/types";

export const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f4f3ee",
  fontFamily: "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
};

export const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e6e4dc",
  borderRadius: 4,
  padding: "20px 22px",
  marginBottom: 16,
};

export const eyebrowStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: "#9a9486",
  marginBottom: 10,
  display: "block",
};

export const inputStyle: CSSProperties = {
  padding: "8px 10px",
  fontSize: 13,
  border: "1px solid #d8d6ce",
  background: "#faf9f5",
  color: "#1a1a17",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export const btnStyle: CSSProperties = {
  padding: "8px 16px",
  fontSize: 12,
  background: "#1a1a17",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  letterSpacing: "0.04em",
  fontWeight: 600,
};

export const thStyle: CSSProperties = {
  padding: "8px 11px",
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#8a8478",
  borderBottom: "2px solid #e6e4dc",
  fontWeight: 700,
  textAlign: "left",
  whiteSpace: "nowrap",
  background: "#faf9f5",
};

export const tdStyle: CSSProperties = {
  padding: "9px 11px",
  fontSize: 12,
  color: "#2a2a26",
  borderBottom: "1px solid #efeee8",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};

export const mutedStyle: CSSProperties = { color: "#b0aa9a" };

const STATUS_COLOR: Record<LeadStatus, { bg: string; fg: string }> = {
  new: { bg: "#d4edda", fg: "#1a6b3a" },
  contacted: { bg: "#d0e4f7", fg: "#1a4a8a" },
  qualified: { bg: "#fdecd3", fg: "#6b3a1a" },
  not_a_fit: { bg: "#fad7d7", fg: "#6b1a1a" },
  closed: { bg: "#e8e7e2", fg: "#5a5a52" },
  spam_suspected: { bg: "#efe7f3", fg: "#4a2a6b" },
};

const DELIVERY_COLOR: Record<DeliveryStatus, { bg: string; fg: string }> = {
  sent: { bg: "#d4edda", fg: "#1a6b3a" },
  failed: { bg: "#fad7d7", fg: "#8a1a1a" },
  pending: { bg: "#fdecd3", fg: "#6b3a1a" },
  skipped: { bg: "#e8e7e2", fg: "#5a5a52" },
};

const chipBase: CSSProperties = {
  padding: "2px 7px",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.06em",
  borderRadius: 2,
  display: "inline-block",
  whiteSpace: "nowrap",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const color = STATUS_COLOR[status] ?? STATUS_COLOR.closed;
  return (
    <span style={{ ...chipBase, background: color.bg, color: color.fg }}>
      {LEAD_STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function DeliveryBadge({ status }: { status: DeliveryStatus }) {
  const color = DELIVERY_COLOR[status] ?? DELIVERY_COLOR.skipped;
  return (
    <span style={{ ...chipBase, background: color.bg, color: color.fg }}>
      {DELIVERY_LABEL[status] ?? status}
    </span>
  );
}

export function PriorityText({ priority }: { priority: LeadPriority | null }) {
  if (!priority) return <span style={mutedStyle}>–</span>;
  const color = priority === "high" ? "#8a1a1a" : priority === "medium" ? "#7a5a1a" : "#5a5a52";
  return <span style={{ color, fontWeight: 600 }}>{LEAD_PRIORITY_LABEL[priority]}</span>;
}

/** Berliner Zeit, kurz. Das CRM wird aus einer Zeitzone bedient. */
export function formatDate(iso: string | null, withYear = false): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: withYear ? "numeric" : "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Nur Datum, für Wiedervorlagen. */
export function formatDay(iso: string | null): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toLocaleDateString("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

/** Ampelfarbe eines Scores, wie im alten CRM. */
export function scoreColor(score: number): string {
  if (score >= 75) return "#1a6b3a";
  if (score >= 60) return "#7a5a1a";
  return "#8a1a1a";
}
