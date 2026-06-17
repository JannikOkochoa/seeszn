import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Robots policy.
// Stance: SEESZN *wants* to be discovered, indexed and cited — by classic
// search engines AND by AI answer/search systems. So we explicitly allow the
// major search and AI-search crawlers and only block private/API routes.
//
// We deliberately do NOT block GPTBot, ClaudeBot, PerplexityBot, Google-Extended
// etc.: for a visibility studio, presence in AI training/answer corpora is the
// product. Only training-only/aggressive scrapers are left to the default rule.

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/brief/ki-sichtbarkeit/print"];

  return {
    rules: [
      // Default: allow everything except private/API routes.
      { userAgent: "*", allow: "/", disallow },

      // ── Classic search crawlers (must never be blocked) ──────────────────
      { userAgent: "Googlebot", allow: "/", disallow },
      { userAgent: "Bingbot", allow: "/", disallow },
      { userAgent: "DuckDuckBot", allow: "/", disallow },
      { userAgent: "Applebot", allow: "/", disallow },

      // ── AI search / answer-discovery crawlers (explicitly welcomed) ──────
      // These power live AI answers and citations — exactly where we want to appear.
      { userAgent: "OAI-SearchBot", allow: "/", disallow }, // ChatGPT Search
      { userAgent: "ChatGPT-User", allow: "/", disallow }, // ChatGPT live browsing
      { userAgent: "PerplexityBot", allow: "/", disallow },
      { userAgent: "Perplexity-User", allow: "/", disallow },
      { userAgent: "Google-Extended", allow: "/", disallow }, // Gemini / AI Overviews grounding
      { userAgent: "Applebot-Extended", allow: "/", disallow },

      // ── AI training crawlers (allowed — presence in corpora is the goal) ──
      { userAgent: "GPTBot", allow: "/", disallow },
      { userAgent: "ClaudeBot", allow: "/", disallow },
      { userAgent: "anthropic-ai", allow: "/", disallow },
      { userAgent: "CCBot", allow: "/", disallow }, // Common Crawl
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
