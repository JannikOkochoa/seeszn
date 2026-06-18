import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/landing/Breadcrumbs";
import SectionLabel from "@/components/landing/SectionLabel";
import { LANDING_CSS } from "@/components/landing/LandingPage";
import { LANDING_CTA } from "@/lib/landing";
import type { CaseStudy } from "@/lib/cases";
import { breadcrumbSchema, SITE_URL } from "@/lib/seo";

export default function CasePage({ study }: { study: CaseStudy }) {
  const path = `/cases/${study.slug}`;
  const crumbs = [
    { name: "Start", path: "/" },
    { name: "Arbeit", path: "/work" },
    { name: study.name, path },
  ];

  const caseSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${SITE_URL}${path}#case`,
    name: `${study.fullName} · Case`,
    headline: study.statement,
    abstract: study.problem,
    genre: "Case Study",
    about: study.sector,
    keywords: [study.sector, ...study.scope, "KI-Sichtbarkeit", "SEO", "GEO", "AIO"],
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    inLanguage: "de-DE",
    author: { "@id": `${SITE_URL}/#organization` },
    creator: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <JsonLd data={[caseSchema, breadcrumbSchema(crumbs)]} />
      <Nav />
      <main className="lp">
        <header className="lp-hero">
          <Breadcrumbs items={crumbs} />
          <p className="lp-kicker">CASE · {study.sector.toUpperCase()}</p>
          <h1 className="lp-h1">{study.fullName}</h1>
          <p className="lp-lead">{study.statement}</p>

          <dl className="cs-meta">
            <div><dt>Branche</dt><dd>{study.sector}</dd></div>
            <div><dt>Scope</dt><dd>{study.scope.join(" · ")}</dd></div>
            <div><dt>Status</dt><dd>{study.status}</dd></div>
            {study.url && (
              <div>
                <dt>Surface</dt>
                <dd>
                  <a href={study.url} target="_blank" rel="noopener noreferrer">
                    {study.domain} ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </header>

        <section className="lp-section">
          <SectionLabel num="01">AUSGANGSLAGE</SectionLabel>
          <h2 className="lp-h2">Ausgangslage</h2>
          <p className="lp-body">{study.ausgangslage}</p>
        </section>

        <section className="lp-section lp-section-alt">
          <SectionLabel num="02">PROBLEM</SectionLabel>
          <h2 className="lp-h2 lp-h2-editorial">{study.statement}</h2>
          <p className="lp-body">{study.problem}</p>
        </section>

        <section className="lp-section">
          <SectionLabel num="03">UMSETZUNG</SectionLabel>
          <h2 className="lp-h2">Was SEESZN gebaut hat</h2>
          <ul className="lp-list">
            {study.umsetzung.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </section>

        <section className="lp-section lp-section-alt">
          <SectionLabel num="04">SEO- / AIO-RELEVANZ</SectionLabel>
          <h2 className="lp-h2">Warum das für Such- und KI-Sichtbarkeit zählt</h2>
          <p className="lp-body">{study.relevanz}</p>
        </section>

        <section className="lp-section">
          <SectionLabel num="05">STATUS</SectionLabel>
          <h2 className="lp-h2">Status</h2>
          <p className="lp-body">{study.statusText}</p>
        </section>

        <section className="lp-final">
          <h2 className="lp-final-h">Das nächste Case File könnte deins sein.</h2>
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
            {study.related.map((link) => (
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
      <style>{`
        .cs-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1px;
          margin-top: 12px;
          border: 1px solid var(--lp-panel-line);
          background: var(--lp-panel-line);
          max-width: 820px;
        }
        .cs-meta > div {
          background: var(--lp-ink-panel);
          padding: 22px 22px 24px;
          transition: background 0.3s;
        }
        .cs-meta > div:hover { background: var(--lp-ink-panel-2); }
        .cs-meta dt {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--lp-bone-faint);
          margin-bottom: 12px;
        }
        .cs-meta dd {
          font-family: var(--font-mono), monospace;
          font-size: 13.5px;
          color: var(--lp-bone);
          line-height: 1.45;
        }
        .cs-meta a { color: var(--lp-acid); transition: opacity 0.25s; }
        .cs-meta a:hover { opacity: 0.7; }
      `}</style>
    </>
  );
}
