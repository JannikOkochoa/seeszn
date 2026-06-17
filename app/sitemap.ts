import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// German-first sitemap. German is the canonical surface at the root; the
// English tree lives under /en and carries lower priority.

const now = new Date();

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

// ── German surface (primary, at root) ────────────────────────────────────────
const deRoutes: Entry[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  // Commercial landing pages
  { path: "/ki-sichtbarkeit-agentur", priority: 0.9, changeFrequency: "monthly" },
  { path: "/ki-sichtbarkeits-audit", priority: 0.9, changeFrequency: "monthly" },
  { path: "/geo-agentur", priority: 0.9, changeFrequency: "monthly" },
  { path: "/aio-optimierung", priority: 0.9, changeFrequency: "monthly" },
  { path: "/chatgpt-sichtbarkeit", priority: 0.9, changeFrequency: "monthly" },
  { path: "/b2b-seo-agentur", priority: 0.9, changeFrequency: "monthly" },
  { path: "/seo-agentur-bremen", priority: 0.8, changeFrequency: "monthly" },
  // Rooms
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/work", priority: 0.7, changeFrequency: "monthly" },
  { path: "/insights", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/diagnosis", priority: 0.9, changeFrequency: "monthly" },
  // Cases
  { path: "/cases/rischo", priority: 0.6, changeFrequency: "monthly" },
  { path: "/cases/sivius", priority: 0.6, changeFrequency: "monthly" },
  { path: "/cases/contentkueche", priority: 0.6, changeFrequency: "monthly" },
  // Insights / research
  { path: "/insights/was-ist-ki-sichtbarkeit", priority: 0.7, changeFrequency: "monthly" },
  { path: "/insights/was-ist-geo", priority: 0.7, changeFrequency: "monthly" },
  { path: "/insights/was-ist-aio", priority: 0.7, changeFrequency: "monthly" },
  { path: "/insights/seo-vs-geo-vs-aio", priority: 0.7, changeFrequency: "monthly" },
  { path: "/research/absence-index", priority: 0.7, changeFrequency: "monthly" },
  // Research brief
  { path: "/brief/ki-sichtbarkeit", priority: 0.8, changeFrequency: "monthly" },
  // Legal
  { path: "/legal", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
];

// ── English surface (secondary, under /en) ───────────────────────────────────
const enRoutes: Entry[] = [
  { path: "/en", priority: 0.7, changeFrequency: "weekly" },
  { path: "/en/services", priority: 0.5, changeFrequency: "monthly" },
  { path: "/en/work", priority: 0.4, changeFrequency: "monthly" },
  { path: "/en/insights", priority: 0.4, changeFrequency: "monthly" },
  { path: "/en/about", priority: 0.3, changeFrequency: "monthly" },
  { path: "/en/diagnosis", priority: 0.5, changeFrequency: "monthly" },
  { path: "/en/legal", priority: 0.1, changeFrequency: "yearly" },
  { path: "/en/privacy", priority: 0.1, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...deRoutes, ...enRoutes].map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
