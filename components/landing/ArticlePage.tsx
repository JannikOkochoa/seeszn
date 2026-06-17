import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/landing/Breadcrumbs";
import SectionLabel from "@/components/landing/SectionLabel";
import AnswerBlock from "@/components/landing/AnswerBlock";
import FaqList from "@/components/landing/FaqList";
import { LANDING_CSS } from "@/components/landing/LandingPage";
import { LANDING_CTA, type FaqItem, type RelatedLink } from "@/lib/landing";
import { articleSchema, faqSchema, breadcrumbSchema } from "@/lib/seo";

export interface ArticleSection {
  num: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface ComparisonTable {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface Article {
  /** Path under /de, e.g. "insights/was-ist-geo". */
  slug: string;
  kicker: string;
  h1: string;
  lead: string;
  answer: { question: string; body: string };
  datePublished: string;
  dateModified?: string;
  sections: ArticleSection[];
  table?: ComparisonTable;
  disclaimer?: string;
  faq: FaqItem[];
  related: RelatedLink[];
  crumbs: { name: string; path: string }[];
  meta: { title: string; description: string };
}

export default function ArticlePage({ article }: { article: Article }) {
  const path = `/${article.slug}`;
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: article.h1,
            description: article.meta.description,
            path,
            datePublished: article.datePublished,
            dateModified: article.dateModified,
          }),
          faqSchema(article.faq),
          breadcrumbSchema(article.crumbs),
        ]}
      />
      <Nav />
      <main className="lp">
        <article>
          <header className="lp-hero">
            <Breadcrumbs items={article.crumbs} />
            <p className="lp-kicker">{article.kicker}</p>
            <h1 className="lp-h1">{article.h1}</h1>
            <p className="lp-lead">{article.lead}</p>
          </header>

          <AnswerBlock question={article.answer.question} body={article.answer.body} />

          {article.sections.map((s) => (
            <section key={s.num} className="lp-section">
              <SectionLabel num={s.num}>{s.heading.toUpperCase()}</SectionLabel>
              <h2 className="lp-h2">{s.heading}</h2>
              {s.paragraphs?.map((p, i) => (
                <p key={i} className="lp-body">{p}</p>
              ))}
              {s.bullets && (
                <ul className="lp-list">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {article.table && (
            <section className="lp-section">
              <SectionLabel num="≡">VERGLEICH</SectionLabel>
              <h2 className="lp-h2">{article.table.caption}</h2>
              <div className="lp-table-wrap">
                <table className="lp-table">
                  <thead>
                    <tr>
                      {article.table.columns.map((c) => (
                        <th key={c} scope="col">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {article.table.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) =>
                          ci === 0 ? (
                            <th key={ci} scope="row">{cell}</th>
                          ) : (
                            <td key={ci}>{cell}</td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {article.disclaimer && (
            <section className="lp-section">
              <p className="lp-disclaimer">{article.disclaimer}</p>
            </section>
          )}

          <section className="lp-section" aria-labelledby="lp-faq">
            <SectionLabel num="?">HÄUFIGE FRAGEN</SectionLabel>
            <h2 id="lp-faq" className="lp-h2">Häufige Fragen</h2>
            <FaqList items={article.faq} />
          </section>
        </article>

        <section className="lp-final">
          <h2 className="lp-final-h">Lass prüfen, wo deine Marke aus Antworten verschwindet.</h2>
          <div className="lp-cta-row">
            <Link href={LANDING_CTA.primary.href} className="lp-btn lp-btn-primary">
              {LANDING_CTA.primary.label}
              <span aria-hidden="true" className="lp-arrow">→</span>
            </Link>
            <Link href="/ki-sichtbarkeits-audit" className="lp-btn">Mehr zum Audit</Link>
          </div>
        </section>

        <nav className="lp-related" aria-label="Weiterführende Seiten">
          <SectionLabel num="→">WEITERLESEN</SectionLabel>
          <ul>
            {article.related.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>
                  {link.label}
                  <span aria-hidden="true" className="lp-arrow">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <Footer />

      <style>{LANDING_CSS}</style>
      <style>{ARTICLE_CSS}</style>
    </>
  );
}

const ARTICLE_CSS = `
  .lp-table-wrap { overflow-x: auto; max-width: 100%; border: 1px solid var(--line); }
  .lp-table {
    border-collapse: collapse;
    width: 100%;
    font-size: 15px;
  }
  .lp-table th, .lp-table td {
    text-align: left;
    padding: 16px 20px;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    vertical-align: top;
    line-height: 1.55;
  }
  .lp-table th:last-child, .lp-table td:last-child { border-right: none; }
  .lp-table tbody tr:last-child th, .lp-table tbody tr:last-child td { border-bottom: none; }
  .lp-table thead th {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--lp-bone);
    background: var(--lp-ink-panel);
    border-right-color: var(--lp-panel-line);
    border-bottom-color: var(--lp-panel-line);
  }
  .lp-table thead th:first-child { color: var(--lp-acid); }
  .lp-table tbody th[scope="row"] {
    font-family: var(--font-display), sans-serif;
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    color: var(--ink-strong);
    white-space: nowrap;
  }
  .lp-table tbody tr { transition: background 0.25s; }
  .lp-table tbody tr:hover { background: var(--paper-soft); }
  .lp-table td { color: var(--text-body); }

  .lp-disclaimer {
    position: relative;
    font-family: var(--font-mono), monospace;
    font-size: 12.5px;
    line-height: 1.75;
    letter-spacing: 0.015em;
    color: var(--lp-bone-soft);
    background: var(--lp-ink-panel);
    border: 1px solid var(--lp-panel-line);
    padding: 24px 26px 24px 30px;
    max-width: 74ch;
  }
  .lp-disclaimer::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: var(--lp-acid);
  }
`;
