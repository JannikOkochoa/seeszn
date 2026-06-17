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
// Architectural visibility-system surface: sharp sans typography, a sticky
// index rail, thin precise borders, controlled dark "diagnostic" panels and
// zero-JS scroll-driven reveal motion.
export const LANDING_CSS = `
  .lp {
    /* Scoped architectural palette — literal so dark panels stay dark in
       both global themes. The canvas still follows the theme tokens. */
    --lp-rail: 184px;
    --lp-gap: clamp(28px, 5vw, 72px);
    --lp-max: 1120px;
    --lp-pad: clamp(20px, 5vw, 48px);
    --lp-ink-panel: #111308;
    --lp-ink-panel-2: #0b0c06;
    --lp-bone: #ece6d6;
    --lp-bone-soft: #b9b3a3;
    --lp-bone-faint: #7c776a;
    --lp-panel-line: rgba(236, 230, 214, 0.14);
    --lp-acid: #c8df3f;

    background: var(--paper);
    color: var(--text-body);
    overflow-x: clip;
  }

  /* ── Hero ────────────────────────────────────────────── */
  .lp-hero {
    max-width: var(--lp-max);
    margin: 0 auto;
    padding: clamp(116px, 14vw, 168px) var(--lp-pad) clamp(48px, 7vw, 88px);
    position: relative;
  }
  .lp-hero::before {
    /* technical document header rule */
    content: '';
    position: absolute;
    left: var(--lp-pad); right: var(--lp-pad);
    top: clamp(100px, 12vw, 148px);
    height: 1px;
    background: var(--line);
  }
  .lp-kicker {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 22px 0 30px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .lp-kicker::before {
    content: '';
    width: 7px; height: 7px;
    background: var(--lp-acid);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--lp-acid) 60%, transparent);
    display: inline-block;
  }
  .lp-h1 {
    font-family: var(--font-display), sans-serif;
    font-weight: 700;
    font-size: clamp(42px, 7.4vw, 92px);
    line-height: 0.92;
    letter-spacing: -0.018em;
    color: var(--ink-strong);
    max-width: 18ch;
    margin-bottom: 30px;
    text-wrap: balance;
  }
  .lp-lead {
    font-family: var(--font-body), sans-serif;
    font-weight: 400;
    font-size: clamp(18px, 2.1vw, 24px);
    line-height: 1.45;
    letter-spacing: -0.005em;
    color: var(--text-secondary);
    max-width: 56ch;
    margin-bottom: 44px;
  }
  .lp-cta-row { display: flex; flex-wrap: wrap; gap: 14px; }

  /* ── Buttons ─────────────────────────────────────────── */
  .lp-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-mono), monospace;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-primary);
    border: 1px solid var(--border-btn);
    padding: 16px 28px;
    min-height: 50px;
    position: relative;
    transition: color 0.45s cubic-bezier(.16,1,.3,1), border-color 0.45s;
    overflow: hidden;
    isolation: isolate;
  }
  .lp-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: var(--ink-strong);
    transform: translateY(101%);
    transition: transform 0.5s cubic-bezier(.16,1,.3,1);
    z-index: -1;
  }
  .lp-btn:hover { color: var(--paper); border-color: var(--ink-strong); }
  .lp-btn:hover::before { transform: translateY(0); }
  .lp-btn:hover .lp-arrow { color: var(--lp-acid); transform: translateX(5px); }
  .lp-btn:focus-visible { outline: 1px solid var(--lp-acid); outline-offset: 3px; }
  .lp-btn-primary {
    background: var(--ink-strong);
    color: var(--paper);
    border-color: var(--ink-strong);
  }
  .lp-btn-primary::before { background: var(--lp-acid); }
  .lp-btn-primary:hover { color: var(--lp-ink-panel); border-color: var(--lp-acid); }
  .lp-btn-primary:hover .lp-arrow { color: var(--lp-ink-panel); }
  .lp-arrow { color: var(--lp-acid); transition: transform 0.4s cubic-bezier(.16,1,.3,1), color 0.4s; }

  /* ── Section — sticky index rail grid ────────────────── */
  .lp-section {
    max-width: var(--lp-max);
    margin: 0 auto;
    padding: clamp(48px, 6vw, 88px) var(--lp-pad);
    border-top: 1px solid var(--line);
    display: grid;
    grid-template-columns: var(--lp-rail) minmax(0, 1fr);
    column-gap: var(--lp-gap);
    align-items: start;
  }
  .lp-section > * { grid-column: 2; }
  .lp-section > .lp-label {
    grid-column: 1;
    grid-row: 1 / span 50;
    align-self: start;
    position: sticky;
    top: 116px;
  }

  /* ── Dark cinematic band ─────────────────────────────── */
  .lp-section-alt {
    position: relative;
    color: var(--lp-bone);
    border-top: none;
    margin: 0 auto;
  }
  .lp-section-alt::before {
    content: '';
    position: absolute;
    z-index: 0;
    top: 0; bottom: 0;
    left: calc(50% - 50vw); right: calc(50% - 50vw);
    background:
      radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--lp-acid) 6%, transparent), transparent 42%),
      var(--lp-ink-panel);
  }
  .lp-section-alt > * { position: relative; z-index: 1; }
  .lp-section-alt .lp-h2 { color: var(--lp-bone); }
  .lp-section-alt .lp-body { color: var(--lp-bone-soft); }
  .lp-section-alt .lp-label { color: var(--lp-bone-faint); }
  .lp-section-alt .lp-list li { color: var(--lp-bone-soft); border-color: var(--lp-panel-line); }

  /* ── Headings ────────────────────────────────────────── */
  .lp-h2 {
    font-family: var(--font-display), sans-serif;
    font-weight: 700;
    font-size: clamp(28px, 3.8vw, 46px);
    line-height: 1.0;
    letter-spacing: -0.016em;
    color: var(--ink-strong);
    max-width: 20ch;
    margin: 0 0 26px;
    text-wrap: balance;
  }
  /* repurposed: the former serif "editorial" headline is now a sharp,
     oversized display statement used inside dark bands */
  .lp-h2-editorial {
    font-weight: 700;
    font-size: clamp(32px, 5vw, 60px);
    line-height: 0.98;
    letter-spacing: -0.02em;
    max-width: 16ch;
  }
  .lp-body {
    font-size: 17px;
    line-height: 1.72;
    color: var(--text-body);
    max-width: 64ch;
    margin-bottom: 18px;
  }

  /* ── Bullet list ─────────────────────────────────────── */
  .lp-list { list-style: none; max-width: 72ch; }
  .lp-list li {
    position: relative;
    padding: 16px 0 16px 30px;
    border-top: 1px solid var(--line-soft);
    font-size: 16.5px;
    line-height: 1.55;
    color: var(--text-body);
  }
  .lp-list li:last-child { border-bottom: 1px solid var(--line-soft); }
  .lp-list li::before {
    content: '';
    position: absolute;
    left: 0; top: 25px;
    width: 14px; height: 1px;
    background: var(--lp-acid);
  }

  /* ── Definition grid (Was wir bauen) ─────────────────── */
  .lp-defs { display: grid; gap: 0; }
  .lp-def {
    display: grid;
    grid-template-columns: minmax(160px, 220px) 1fr;
    gap: 28px;
    padding: 24px 0;
    border-top: 1px solid var(--line-soft);
    transition: padding-left 0.4s cubic-bezier(.16,1,.3,1);
  }
  .lp-def:last-child { border-bottom: 1px solid var(--line-soft); }
  .lp-def:hover { padding-left: 10px; }
  .lp-def dt {
    font-family: var(--font-mono), monospace;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-strong);
    font-weight: 500;
    position: relative;
  }
  .lp-def dt::before {
    content: '';
    display: inline-block;
    width: 6px; height: 6px;
    margin-right: 10px;
    vertical-align: middle;
    background: var(--lp-acid);
    opacity: 0;
    transition: opacity 0.4s;
  }
  .lp-def:hover dt::before { opacity: 1; }
  .lp-def dd { font-size: 16px; line-height: 1.62; color: var(--text-body); }

  /* ── Process steps ───────────────────────────────────── */
  .lp-steps { list-style: none; counter-reset: step; }
  .lp-step {
    display: grid;
    grid-template-columns: 64px 1fr;
    gap: 24px;
    padding: 26px 0;
    border-top: 1px solid var(--line-soft);
  }
  .lp-step:last-child { border-bottom: 1px solid var(--line-soft); }
  .lp-step-num {
    font-family: var(--font-mono), monospace;
    font-size: 13px;
    letter-spacing: 0.1em;
    color: var(--lp-acid);
    padding-top: 5px;
  }
  .lp-step-name {
    font-family: var(--font-display), sans-serif;
    font-size: clamp(20px, 2.4vw, 26px);
    font-weight: 700;
    letter-spacing: 0.005em;
    text-transform: uppercase;
    color: var(--ink-strong);
    margin-bottom: 8px;
  }

  /* ── Final CTA — full dark band ──────────────────────── */
  .lp-final {
    position: relative;
    text-align: center;
    padding: clamp(80px, 11vw, 150px) var(--lp-pad);
    color: var(--lp-bone);
    overflow: hidden;
  }
  .lp-final::before {
    content: '';
    position: absolute; inset: 0;
    z-index: 0;
    background:
      radial-gradient(80% 120% at 50% 0%, color-mix(in srgb, var(--lp-acid) 8%, transparent), transparent 55%),
      var(--lp-ink-panel-2);
  }
  .lp-final > * { position: relative; z-index: 1; }
  .lp-final-h {
    font-family: var(--font-display), sans-serif;
    font-weight: 700;
    font-size: clamp(30px, 5.4vw, 64px);
    line-height: 0.98;
    letter-spacing: -0.02em;
    color: var(--lp-bone);
    max-width: 18ch;
    margin: 0 auto 40px;
    text-wrap: balance;
  }
  .lp-final .lp-cta-row { justify-content: center; }
  .lp-final .lp-btn { color: var(--lp-bone); border-color: var(--lp-panel-line); }
  .lp-final .lp-btn::before { background: var(--lp-bone); }
  .lp-final .lp-btn:hover { color: var(--lp-ink-panel); border-color: var(--lp-bone); }
  .lp-final .lp-btn-primary { background: var(--lp-acid); color: var(--lp-ink-panel); border-color: var(--lp-acid); }
  .lp-final .lp-btn-primary::before { background: var(--lp-bone); }
  .lp-final .lp-btn-primary:hover { color: var(--lp-ink-panel); border-color: var(--lp-bone); }
  .lp-final .lp-btn-primary .lp-arrow { color: var(--lp-ink-panel); }

  /* ── Related links ───────────────────────────────────── */
  .lp-related {
    max-width: var(--lp-max);
    margin: 0 auto;
    padding: clamp(48px, 6vw, 72px) var(--lp-pad) clamp(96px, 12vw, 140px);
    display: grid;
    grid-template-columns: var(--lp-rail) minmax(0, 1fr);
    column-gap: var(--lp-gap);
    align-items: start;
  }
  .lp-related > .lp-label { grid-column: 1; }
  .lp-related ul { grid-column: 2; list-style: none; }
  .lp-related li { border-top: 1px solid var(--line); }
  .lp-related li:last-child { border-bottom: 1px solid var(--line); }
  .lp-related li a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 0;
    font-family: var(--font-display), sans-serif;
    font-size: clamp(18px, 2vw, 23px);
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--text-primary);
    transition: color 0.3s, padding-left 0.4s cubic-bezier(.16,1,.3,1);
  }
  .lp-related li a:hover { color: var(--ink-strong); padding-left: 12px; }
  .lp-related li a .lp-arrow { transition: transform 0.4s cubic-bezier(.16,1,.3,1); }
  .lp-related li a:hover .lp-arrow { transform: translateX(6px); }

  /* ── Breadcrumbs ─────────────────────────────────────── */
  .lp-crumbs { margin-bottom: 0; }
  .lp-crumbs ol { list-style: none; display: flex; flex-wrap: wrap; gap: 9px; align-items: center; }
  .lp-crumbs li { display: flex; align-items: center; gap: 9px; }
  .lp-crumbs a, .lp-crumbs span {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
    transition: color 0.25s;
  }
  .lp-crumbs a:hover { color: var(--lp-acid); }
  .lp-crumbs li[aria-current] span { color: var(--text-primary); }
  .lp-crumbs .lp-sep { color: var(--text-faint); }

  /* ── Section label / index rail ──────────────────────── */
  .lp-label {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    line-height: 1.4;
  }
  .lp-label .lp-label-num {
    color: var(--lp-acid);
    font-size: 13px;
    letter-spacing: 0.06em;
    padding-bottom: 12px;
    border-bottom: 1px solid currentColor;
    min-width: 38px;
  }

  /* ── Answer block — signature diagnostic panel ───────── */
  .lp-answer {
    max-width: var(--lp-max);
    margin: 0 auto;
    padding: clamp(28px, 4vw, 48px) var(--lp-pad);
  }
  .lp-answer-inner {
    position: relative;
    background:
      radial-gradient(110% 130% at 100% 0%, color-mix(in srgb, var(--lp-acid) 7%, transparent), transparent 45%),
      var(--lp-ink-panel);
    color: var(--lp-bone);
    padding: clamp(28px, 4vw, 44px) clamp(26px, 4vw, 48px);
    border: 1px solid var(--lp-panel-line);
  }
  .lp-answer-tick {
    position: absolute;
    width: 9px; height: 9px;
    border: 1px solid var(--lp-acid);
    opacity: 0.55;
  }
  .lp-answer-tick.tl { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
  .lp-answer-tick.tr { top: -1px; right: -1px; border-left: 0; border-bottom: 0; }
  .lp-answer-tick.bl { bottom: -1px; left: -1px; border-right: 0; border-top: 0; }
  .lp-answer-tick.br { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }
  .lp-answer-q {
    font-family: var(--font-mono), monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--lp-acid);
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .lp-answer-q::before {
    content: 'A';
    font-size: 10px;
    width: 22px; height: 22px;
    display: inline-flex; align-items: center; justify-content: center;
    border: 1px solid var(--lp-panel-line);
    color: var(--lp-bone);
  }
  .lp-answer-a {
    font-family: var(--font-display), sans-serif;
    font-weight: 600;
    font-size: clamp(20px, 2.6vw, 30px);
    line-height: 1.32;
    letter-spacing: -0.01em;
    color: var(--lp-bone);
    max-width: 56ch;
  }

  /* ── FAQ ─────────────────────────────────────────────── */
  .lp-faq { list-style: none; }
  .lp-faq > div {
    padding: 26px 0;
    border-top: 1px solid var(--line-soft);
    transition: padding-left 0.4s cubic-bezier(.16,1,.3,1);
  }
  .lp-faq > div:last-child { border-bottom: 1px solid var(--line-soft); }
  .lp-faq > div:hover { padding-left: 10px; }
  .lp-faq dt {
    font-family: var(--font-display), sans-serif;
    font-size: clamp(19px, 2.1vw, 24px);
    font-weight: 700;
    letter-spacing: -0.008em;
    color: var(--ink-strong);
    margin-bottom: 12px;
  }
  .lp-faq dd { font-size: 16.5px; line-height: 1.72; color: var(--text-body); max-width: 66ch; }

  /* ── Scroll-driven reveal motion (progressive, zero-JS) ─ */
  @media (prefers-reduced-motion: no-preference) {
    @supports (animation-timeline: view()) {
      .lp-section, .lp-answer, .lp-related, .lp-final {
        animation: lp-rise linear both;
        animation-timeline: view();
        animation-range: entry 0% entry 46%;
      }
      @keyframes lp-rise {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: none; }
      }
      .lp-hero > * {
        animation: lp-load 0.9s cubic-bezier(.16,1,.3,1) both;
      }
      .lp-hero .lp-kicker  { animation-delay: 0.04s; }
      .lp-hero .lp-h1      { animation-delay: 0.10s; }
      .lp-hero .lp-lead    { animation-delay: 0.18s; }
      .lp-hero .lp-cta-row { animation-delay: 0.26s; }
      .lp-hero .cs-meta    { animation-delay: 0.26s; }
      @keyframes lp-load {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: none; }
      }
    }
  }

  /* ── Mobile ──────────────────────────────────────────── */
  @media (max-width: 860px) {
    .lp-section, .lp-related {
      grid-template-columns: 1fr;
      row-gap: 26px;
    }
    .lp-section > .lp-label {
      grid-column: 1;
      grid-row: auto;
      position: static;
      flex-direction: row;
      align-items: center;
      gap: 12px;
    }
    .lp-label .lp-label-num { border-bottom: none; padding-bottom: 0; min-width: 0; }
    .lp-related ul { grid-column: 1; }
    .lp-def { grid-template-columns: 1fr; gap: 8px; }
    .lp-def:hover, .lp-faq > div:hover { padding-left: 0; }
    .lp-step { grid-template-columns: 40px 1fr; gap: 16px; }
  }
`;
