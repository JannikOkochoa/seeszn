import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/landing/Breadcrumbs";
import SectionLabel from "@/components/landing/SectionLabel";
import AnswerBlock from "@/components/landing/AnswerBlock";
import FaqList from "@/components/landing/FaqList";
import {
  type LandingPage as LP,
  LANDING_CTA,
} from "@/lib/landing";
import {
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from "@/lib/seo";

export default function LandingPage({ page }: { page: LP }) {
  const path = `/${page.slug}`;
  const crumbs = [
    { name: "Start", path: "/" },
    { name: page.kicker.replace(/—.*/, "").trim(), path },
  ];

  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: page.meta.title.replace(" | SEESZN", ""),
            description: page.meta.description,
            path,
            serviceType: page.serviceType,
          }),
          faqSchema(page.faq.map((f) => ({ q: f.q, a: f.a }))),
          breadcrumbSchema(crumbs),
        ]}
      />
      <Nav />
      <main className="lp">
        {/* ── Hero ───────────────────────────────────────────── */}
        <header className="lp-hero">
          <Breadcrumbs items={crumbs} />
          <p className="lp-kicker">{page.kicker}</p>
          <h1 className="lp-h1">{page.h1}</h1>
          <p className="lp-lead">{page.lead}</p>
          <div className="lp-cta-row">
            <Link href={LANDING_CTA.primary.href} className="lp-btn lp-btn-primary">
              {LANDING_CTA.primary.label}
              <span aria-hidden="true" className="lp-arrow">→</span>
            </Link>
            <Link href={LANDING_CTA.secondary.href} className="lp-btn">
              {LANDING_CTA.secondary.label}
            </Link>
          </div>
        </header>

        {/* ── Quotable answer block ──────────────────────────── */}
        <AnswerBlock question={page.answer.question} body={page.answer.body} />

        {/* ── Für wen ────────────────────────────────────────── */}
        <section className="lp-section" aria-labelledby="lp-forwhom">
          <SectionLabel num="01">FÜR WEN</SectionLabel>
          <h2 id="lp-forwhom" className="lp-h2">Für wen diese Seite gedacht ist</h2>
          <p className="lp-body">{page.forWhom.intro}</p>
          <ul className="lp-list">
            {page.forWhom.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {/* ── Problem ────────────────────────────────────────── */}
        <section className="lp-section lp-section-alt" aria-labelledby="lp-problem">
          <SectionLabel num="02">DAS PROBLEM</SectionLabel>
          <h2 id="lp-problem" className="lp-h2 lp-h2-editorial">{page.problem.headline}</h2>
          {page.problem.body.map((p, i) => (
            <p key={i} className="lp-body">{p}</p>
          ))}
        </section>

        {/* ── Was SEESZN macht ───────────────────────────────── */}
        <section className="lp-section" aria-labelledby="lp-do">
          <SectionLabel num="03">WAS SEESZN MACHT</SectionLabel>
          <h2 id="lp-do" className="lp-h2">{page.whatWeDo.intro}</h2>
          <dl className="lp-defs">
            {page.whatWeDo.items.map((item) => (
              <div key={item.name} className="lp-def">
                <dt>{item.name}</dt>
                <dd>{item.desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Prozess ────────────────────────────────────────── */}
        <section className="lp-section lp-section-alt" aria-labelledby="lp-process">
          <SectionLabel num="04">DER PROZESS</SectionLabel>
          <h2 id="lp-process" className="lp-h2">So gehen wir vor</h2>
          <ol className="lp-steps">
            {page.process.map((step, i) => (
              <li key={step.name} className="lp-step">
                <span className="lp-step-num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="lp-step-name">{step.name}</h3>
                  <p className="lp-body">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="lp-section" aria-labelledby="lp-faq">
          <SectionLabel num="05">HÄUFIGE FRAGEN</SectionLabel>
          <h2 id="lp-faq" className="lp-h2">Häufige Fragen</h2>
          <FaqList items={page.faq} />
        </section>

        {/* ── Final CTA ──────────────────────────────────────── */}
        <section className="lp-final" aria-labelledby="lp-final-h">
          <h2 id="lp-final-h" className="lp-final-h">
            Lass prüfen, wo deine Marke aus Antworten verschwindet.
          </h2>
          <div className="lp-cta-row">
            <Link href={LANDING_CTA.primary.href} className="lp-btn lp-btn-primary">
              {LANDING_CTA.primary.label}
              <span aria-hidden="true" className="lp-arrow">→</span>
            </Link>
            <Link href="/ki-sichtbarkeits-audit" className="lp-btn">
              Mehr zum Audit
            </Link>
          </div>
        </section>

        {/* ── Related / internal links ───────────────────────── */}
        <nav className="lp-related" aria-label="Weiterführende Seiten">
          <SectionLabel num="→">WEITERLESEN</SectionLabel>
          <ul>
            {page.related.map((link) => (
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
    </>
  );
}

// Shared styles for the landing + article + case templates.
export const LANDING_CSS = `
  .lp { background: var(--paper); color: var(--text-body); }
  .lp-hero {
    max-width: 1080px;
    margin: 0 auto;
    padding: 140px 32px 64px;
  }
  .lp-kicker {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .lp-kicker::before {
    content: '';
    width: 6px; height: 6px;
    background: var(--signal);
    border-radius: 50% !important;
    display: inline-block;
  }
  .lp-h1 {
    font-family: var(--font-display), sans-serif;
    font-weight: 700;
    font-size: clamp(38px, 6vw, 72px);
    line-height: 0.98;
    letter-spacing: -0.01em;
    color: var(--ink-strong);
    max-width: 17ch;
    margin-bottom: 28px;
  }
  .lp-lead {
    font-family: var(--font-editorial), serif;
    font-size: clamp(19px, 2.4vw, 26px);
    line-height: 1.5;
    color: var(--text-secondary);
    max-width: 60ch;
    margin-bottom: 40px;
  }
  .lp-cta-row { display: flex; flex-wrap: wrap; gap: 16px; }
  .lp-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-body), sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--text-primary);
    border: 1px solid var(--border-btn);
    padding: 14px 26px;
    min-height: 48px;
    transition: border-color 0.25s, background 0.25s;
  }
  .lp-btn:hover { border-color: var(--border-btn-hovered); background: var(--button-hover-bg); }
  .lp-btn:focus-visible { outline: 1px solid var(--text-primary); outline-offset: 3px; }
  .lp-btn-primary { background: var(--ink-strong); color: var(--paper); border-color: var(--ink-strong); }
  .lp-btn-primary:hover { background: transparent; color: var(--text-primary); }
  .lp-arrow { color: var(--signal); }

  .lp-section { max-width: 1080px; margin: 0 auto; padding: 64px 32px; border-top: 1px solid var(--line); }
  .lp-section-alt { background: var(--paper-soft); border-top: 1px solid var(--line); }
  .lp-section-alt { max-width: none; padding-left: 0; padding-right: 0; }
  .lp-section-alt > * { max-width: 1080px; margin-left: auto; margin-right: auto; padding-left: 32px; padding-right: 32px; }

  .lp-h2 {
    font-family: var(--font-display), sans-serif;
    font-weight: 700;
    font-size: clamp(26px, 3.4vw, 40px);
    line-height: 1.05;
    letter-spacing: -0.01em;
    color: var(--ink-strong);
    max-width: 22ch;
    margin: 18px 0 24px;
  }
  .lp-h2-editorial {
    font-family: var(--font-editorial), serif;
    font-weight: 500;
    font-style: italic;
    letter-spacing: 0;
  }
  .lp-body {
    font-size: 16px;
    line-height: 1.7;
    color: var(--text-body);
    max-width: 65ch;
    margin-bottom: 16px;
  }

  .lp-list { list-style: none; max-width: 70ch; }
  .lp-list li {
    position: relative;
    padding: 14px 0 14px 26px;
    border-bottom: 1px solid var(--line-soft);
    font-size: 16px;
    color: var(--text-body);
  }
  .lp-list li::before {
    content: '—';
    position: absolute;
    left: 0;
    color: var(--signal);
  }

  .lp-defs { display: grid; gap: 0; max-width: 80ch; }
  .lp-def {
    display: grid;
    grid-template-columns: minmax(180px, 240px) 1fr;
    gap: 24px;
    padding: 22px 0;
    border-top: 1px solid var(--line-soft);
  }
  .lp-def dt {
    font-family: var(--font-mono), monospace;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-strong);
    font-weight: 500;
  }
  .lp-def dd { font-size: 15.5px; line-height: 1.65; color: var(--text-body); }

  .lp-steps { list-style: none; counter-reset: step; max-width: 80ch; }
  .lp-step {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 20px;
    padding: 22px 0;
    border-top: 1px solid var(--line-soft);
  }
  .lp-step-num {
    font-family: var(--font-mono), monospace;
    font-size: 13px;
    color: var(--text-faint);
    padding-top: 3px;
  }
  .lp-step-name {
    font-family: var(--font-display), sans-serif;
    font-size: 19px;
    font-weight: 600;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    color: var(--ink-strong);
    margin-bottom: 6px;
  }

  .lp-final {
    max-width: 1080px;
    margin: 0 auto;
    padding: 96px 32px;
    border-top: 1px solid var(--warm-black);
    text-align: center;
  }
  .lp-final-h {
    font-family: var(--font-editorial), serif;
    font-style: italic;
    font-weight: 500;
    font-size: clamp(26px, 4vw, 46px);
    line-height: 1.15;
    color: var(--ink-strong);
    max-width: 20ch;
    margin: 0 auto 36px;
  }
  .lp-final .lp-cta-row { justify-content: center; }

  .lp-related {
    max-width: 1080px;
    margin: 0 auto;
    padding: 56px 32px 120px;
    border-top: 1px solid var(--line);
  }
  .lp-related ul { list-style: none; margin-top: 20px; }
  .lp-related li { border-top: 1px solid var(--line-soft); }
  .lp-related li a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 0;
    font-family: var(--font-body), sans-serif;
    font-size: 16px;
    color: var(--text-primary);
    transition: color 0.2s, padding-left 0.2s;
  }
  .lp-related li a:hover { color: var(--ink-strong); padding-left: 8px; }

  /* ── Breadcrumbs ─────────────────────────────────────── */
  .lp-crumbs { margin-bottom: 28px; }
  .lp-crumbs ol { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .lp-crumbs li { display: flex; align-items: center; gap: 8px; }
  .lp-crumbs a, .lp-crumbs span {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .lp-crumbs a:hover { color: var(--text-primary); }
  .lp-crumbs li[aria-current] span { color: var(--text-primary); }
  .lp-crumbs .lp-sep { color: var(--text-faint); }

  /* ── Section label ───────────────────────────────────── */
  .lp-label {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .lp-label .lp-label-num { color: var(--signal); }

  /* ── Answer block (quotable) ─────────────────────────── */
  .lp-answer {
    max-width: 1080px;
    margin: 0 auto;
    padding: 8px 32px 8px;
  }
  .lp-answer-inner {
    border-left: 2px solid var(--signal);
    padding: 22px 0 22px 28px;
  }
  .lp-answer-q {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 12px;
  }
  .lp-answer-a {
    font-size: clamp(17px, 2vw, 21px);
    line-height: 1.6;
    color: var(--ink-strong);
    max-width: 62ch;
  }

  /* ── FAQ ─────────────────────────────────────────────── */
  .lp-faq { list-style: none; max-width: 75ch; }
  .lp-faq > div { padding: 24px 0; border-top: 1px solid var(--line-soft); }
  .lp-faq dt {
    font-family: var(--font-display), sans-serif;
    font-size: 19px;
    font-weight: 600;
    color: var(--ink-strong);
    margin-bottom: 10px;
    letter-spacing: 0.005em;
  }
  .lp-faq dd { font-size: 16px; line-height: 1.7; color: var(--text-body); max-width: 65ch; }

  @media (max-width: 720px) {
    .lp-hero { padding-top: 120px; }
    .lp-def { grid-template-columns: 1fr; gap: 6px; }
    .lp-step { grid-template-columns: 36px 1fr; gap: 12px; }
  }
`;
