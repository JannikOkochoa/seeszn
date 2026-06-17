import type { Metadata } from "next";
import ArticlePage from "@/components/landing/ArticlePage";
import { ARTICLES } from "@/lib/insights";
import { buildMetadata } from "@/lib/seo";

const ARTICLE = ARTICLES["insights/was-ist-aio"];

export const metadata: Metadata = buildMetadata({
  title: ARTICLE.meta.title,
  description: ARTICLE.meta.description,
  path: "/insights/was-ist-aio",
  locale: "de",
  type: "article",
});

export default function Page() {
  return <ArticlePage article={ARTICLE} />;
}
