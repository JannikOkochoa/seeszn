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
  // Produkt: SEESZN First Move. /first-move ist die Master-Produktseite,
  // /google-ads/first-move der kontextspezifische Einstieg aus bezahlter Suche.
  // Beide sind self-canonical und index,follow.
  { path: "/first-move", priority: 1.0, changeFrequency: "weekly" },
  { path: "/google-ads/first-move", priority: 0.9, changeFrequency: "monthly" },
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
  { path: "/case-studies/seo-aio-tourismus", priority: 0.9, changeFrequency: "monthly" },
  { path: "/case-studies/french-beret-ecommerce-seo", priority: 0.9, changeFrequency: "monthly" },
  { path: "/insights", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  // /diagnosis ist bewusst nicht mehr gelistet: die Seite bleibt als Werkzeug
  // live, trägt aber seit der First-Move-Einführung noindex, damit es nur eine
  // indexierbare deutsche Produktseite für diese Suchintention gibt.
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
  { path: "/en/case-studies/seo-aio-tourism", priority: 0.6, changeFrequency: "monthly" },
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
