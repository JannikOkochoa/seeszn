import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CaseStyles from "@/components/case-studies/CaseStyles";
import Reveal from "@/components/case-studies/Reveal";
import FrenchBeretStyles from "./FrenchBeretStyles";
import FlowMark from "./FlowMark";
import {
  FB_CLIENT_URL,
  FB_DISCIPLINE,
  FB_FACTS,
  FB_FACTS_EN,
  FB_FIGURES,
  FB_FIGURES_EN,
  FB_FLOW,
  FB_FLOW_EN,
  FB_HERO_IMAGE,
  FB_HERO_IMAGE_EN,
  FB_HERO_KPIS,
  FB_HERO_KPIS_EN,
  FB_INDEX_PATH,
  FB_INDEX_PATH_EN,
  FB_KPIS,
  FB_KPIS_EN,
  FB_LEARNINGS,
  FB_LEARNINGS_EN,
  FB_METHOD_FACTS,
  FB_METHOD_FACTS_EN,
  FB_MODULES,
  FB_MODULES_EN,
  FB_RELATED,
  FB_RELATED_EN,
  FB_TAXONOMY,
  FB_TAXONOMY_EN,
  FB_UI,
  FB_VISUAL_CAPTION,
  FB_VISUAL_CAPTION_EN,
} from "@/lib/case-studies/french-beret";

// ─── Case Study: French Beret ────────────────────────────────────────────────
// Vollständig serverseitig gerendert. Der einzige Client-Anteil ist <Reveal />,
// das ausschliesslich Sichtbarkeit steuert: der Inhalt steht in der ersten
// Antwort vollständig im HTML, auch ohne JavaScript.
//
// Aufbau, Farben, Typo-Rollen und Hairlines kommen aus dem bestehenden
// Case-Study-Chrome (<CaseStyles />). Neu sind nur die breiten Bahnen, die
// diese Case Study braucht, weil sie mehr Raster als Erzählung ist.
//
// Eine Implementierung, zwei Sprachen: welche Konstante gelesen wird, hängt
// nur von `locale` ab. Die deutsche Fassung bleibt die kanonische Quelle für
// jede Zahl; die englische übernimmt sie unverändert, nur umformatiert.

const CLIENT_HOST = FB_CLIENT_URL.replace(/^https?:\/\//, "");

export default function FrenchBeretCase({ locale = "de" }: { locale?: "de" | "en" }) {
  const u = FB_UI[locale];
  const figures = locale === "en" ? FB_FIGURES_EN : FB_FIGURES;
  const heroImage = locale === "en" ? FB_HERO_IMAGE_EN : FB_HERO_IMAGE;
  const heroKpis = locale === "en" ? FB_HERO_KPIS_EN : FB_HERO_KPIS;
  const facts = locale === "en" ? FB_FACTS_EN : FB_FACTS;
  const flow = locale === "en" ? FB_FLOW_EN : FB_FLOW;
  const taxonomy = locale === "en" ? FB_TAXONOMY_EN : FB_TAXONOMY;
  const kpis = locale === "en" ? FB_KPIS_EN : FB_KPIS;
  const modules = locale === "en" ? FB_MODULES_EN : FB_MODULES;
  const learnings = locale === "en" ? FB_LEARNINGS_EN : FB_LEARNINGS;
  const methodFacts = locale === "en" ? FB_METHOD_FACTS_EN : FB_METHOD_FACTS;
  const related = locale === "en" ? FB_RELATED_EN : FB_RELATED;
  const visualCaption = locale === "en" ? FB_VISUAL_CAPTION_EN : FB_VISUAL_CAPTION;
  const indexPath = locale === "en" ? FB_INDEX_PATH_EN : FB_INDEX_PATH;

  const gridModules = modules.filter((m) => !m.band);
  const bandModules = modules.filter((m) => m.band);

  return (
    <>
      <Nav />
      <main className="tc-root" lang={locale}>
        <CaseStyles />
        <FrenchBeretStyles />

        <nav className="fb-crumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href={u.breadcrumb.homeHref}>{u.breadcrumb.home}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={indexPath}>{u.breadcrumb.index}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{u.breadcrumb.leaf}</li>
          </ol>
        </nav>

        <article>
          {/* ── 01 · Hero ───────────────────────────────────────── */}
          <header className="fbh" id="case-hero">
            <div className="fbh-text">
              <p className="fbh-eyebrow">
                <b>{u.eyebrow.num}</b>
                <span>{u.eyebrow.label}</span>
              </p>

              <h1 className="fbh-h1">
                <span className="fbh-num">{figures.clicks}</span>
                <span className="fbh-tail">
                  {u.heroTail}
                  <br />
                  in {figures.windowMonthsIn}.
                </span>
              </h1>

              <p className="fbh-sub">{u.heroSub}</p>

              <p className="fbh-disc">{FB_DISCIPLINE}</p>

              <dl className="fbh-kpis">
                {heroKpis.map((k) => (
                  <div className="fbh-kpi" key={k.label}>
                    <dt>{k.value}</dt>
                    <dd>{k.label}</dd>
                  </div>
                ))}
              </dl>

              <dl className="fbh-meta">
                <div className="fbh-meta-row">
                  <dt>{u.heroMeta.client}</dt>
                  <dd>French Beret</dd>
                </div>
                <div className="fbh-meta-row">
                  <dt>{u.heroMeta.period}</dt>
                  <dd>{figures.windowMonths}</dd>
                </div>
                <div className="fbh-meta-row">
                  <dt>{u.heroMeta.website}</dt>
                  <dd>
                    <a
                      className="fbh-out"
                      href={FB_CLIENT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {CLIENT_HOST}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="fbh-media">
              <div className="fbh-frame">
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  width={heroImage.width}
                  height={heroImage.height}
                  sizes="(max-width: 780px) 100vw, 45vw"
                  priority
                  fetchPriority="high"
                  className="fbh-img"
                />
              </div>
            </div>
          </header>

          {/* ── 02 · Der Case in 20 Sekunden ────────────────────── */}
          <section className="tc-sec" id="ueberblick" aria-labelledby="fb-overview-h">
            <div className="tc-rail">
              <p className="tc-label">
                <span>02</span>
                <span>{u.overview.label}</span>
              </p>
              <h2 className="tc-h2-display" id="fb-overview-h">
                {u.overview.h2a}
                <br />
                {u.overview.h2b}
              </h2>
            </div>

            <div className="tc-body">
              <Reveal stagger={45}>
                <dl className="fbq">
                  {facts.map((f) => (
                    <div className="fbq-cell" key={f.key} data-reveal>
                      <dt>{f.key}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </section>

          {/* ── 03 · Kein Legacy-SEO ────────────────────────────── */}
          <section className="tc-sec" id="ansatz" aria-labelledby="fb-approach-h">
            <div className="tc-rail">
              <p className="tc-label">
                <span>03</span>
                <span>{u.approach.label}</span>
              </p>
              <h2 className="tc-h2-display" id="fb-approach-h">
                {u.approach.h2a}
                <br />
                {u.approach.h2b}
              </h2>
            </div>

            <div className="tc-body">
              <p className="tc-copy-lead">{u.approach.p1}</p>
              <p className="tc-copy" style={{ marginTop: "clamp(16px, 1.8vw, 24px)" }}>
                {u.approach.p2}
              </p>

              <div className="fbs">
                <p>
                  <span className="fbs-a">{u.approach.quoteA}</span>{" "}
                  <span className="fbs-b">{u.approach.quoteB}</span>
                </p>
              </div>
            </div>
          </section>

          {/* ── 04 · Von Suchnachfrage zur Shop-Architektur ─────── */}
          <section className="fb-wide" id="architektur" aria-labelledby="fb-flow-h">
            <div className="fb-wide-head">
              <div>
                <p className="tc-label">
                  <span>04</span>
                  <span>{u.flow.label}</span>
                </p>
                <h2 className="tc-h2-display" id="fb-flow-h">
                  {u.flow.h2}
                </h2>
              </div>
              <p className="fb-wide-head-note">{u.flow.note}</p>
            </div>

            <Reveal stagger={70}>
              <ol className="fbf-grid">
                {flow.map((s) => (
                  <li className="fbf-step" key={s.index} data-reveal>
                    <span className="tc-dot fbf-dot" aria-hidden="true" />
                    <FlowMark kind={s.mark} />
                    <p className="fbf-index">{s.index}</p>
                    <h3 className="fbf-title">{s.title}</h3>
                    <p className="fbf-text">{s.text}</p>
                  </li>
                ))}
              </ol>
            </Reveal>

            <p className="fbt-label">{u.flow.taxonomyLabel}</p>
            <ul className="fbt">
              {taxonomy.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          {/* ── 05 · Sortiment ──────────────────────────────────── */}
          <section className="fb-wide" id="sortiment" aria-labelledby="fb-range-h">
            <div className="fb-wide-head">
              <div>
                <p className="tc-label">
                  <span>05</span>
                  <span>{u.range.label}</span>
                </p>
                <h2 className="tc-h2-display" id="fb-range-h">
                  {u.range.h2(figures.products)}
                </h2>
              </div>
              <p className="fb-wide-head-note">{u.range.note(figures.products)}</p>
            </div>

            <div className="fbp">
              <figure>
                <div className="fbp-media">
                  <Image
                    src={modules[0].image.src}
                    alt={modules[0].image.alt}
                    width={modules[0].image.width}
                    height={modules[0].image.height}
                    sizes="(max-width: 900px) 100vw, 62vw"
                    loading="lazy"
                    className="fbp-img"
                  />
                </div>
                <figcaption className="fb-caption">{visualCaption}</figcaption>
              </figure>

              <div className="fbp-side">
                <div className="fbp-block">
                  <h3>{u.range.collectionsBy}</h3>
                  <ul className="fbp-list">
                    {u.range.collectionsList.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="fbp-block">
                  <h3>{u.range.editorial}</h3>
                  <p>{u.range.editorialText}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 06 · Das Ergebnis ───────────────────────────────── */}
          <section className="fb-wide" id="ergebnis" aria-labelledby="fb-result-h">
            <div className="fb-wide-head">
              <div>
                <p className="tc-label">
                  <span>06</span>
                  <span>{u.result.label}</span>
                </p>
                <h2 className="tc-h2-display" id="fb-result-h">
                  {u.result.h2}
                </h2>
              </div>
              <p className="fb-wide-head-note">{u.result.note}</p>
            </div>

            <Reveal stagger={80}>
              <dl className="fbk">
                {kpis.map((k) => (
                  <div className="fbk-cell" key={k.label} data-reveal>
                    <span className="tc-dot fbk-dot" aria-hidden="true" />
                    <dt>{k.value}</dt>
                    <dd>{k.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <p className="fbk-source">{u.result.source(figures.windowMonthsIn)}</p>
            <p className="fbk-hard">{u.result.hard}</p>
          </section>

          {/* ── 07 · Die Systembausteine ────────────────────────── */}
          <section className="fb-wide" id="bausteine" aria-labelledby="fb-modules-h">
            <div className="fb-wide-head">
              <div>
                <p className="tc-label">
                  <span>07</span>
                  <span>{u.modules.label}</span>
                </p>
                <h2 className="tc-h2-display" id="fb-modules-h">
                  {u.modules.h2}
                </h2>
              </div>
              <p className="fb-wide-head-note">{u.modules.note}</p>
            </div>

            <p className="fb-caption fb-caption-lead">{visualCaption}</p>

            <Reveal stagger={90}>
              <div className="fbm-grid">
                {gridModules.map((m) => (
                  <article className="fbm-item" key={m.index} data-reveal>
                    <div className="fbm-media">
                      <Image
                        src={m.image.src}
                        alt={m.image.alt}
                        width={m.image.width}
                        height={m.image.height}
                        sizes="(max-width: 780px) 100vw, (max-width: 1080px) 50vw, 32vw"
                        loading="lazy"
                        className="fbm-img"
                      />
                    </div>
                    <p className="fbm-index">{m.index}</p>
                    <h3 className="fbm-title">{m.title}</h3>
                    <p className="fbm-text">{m.text}</p>
                  </article>
                ))}
              </div>
            </Reveal>

            {bandModules.map((m) => (
              <article className="fbm-band" key={m.index}>
                <div className="fbm-band-media">
                  <Image
                    src={m.image.src}
                    alt={m.image.alt}
                    width={m.image.width}
                    height={m.image.height}
                    sizes="100vw"
                    loading="lazy"
                    className="fbm-img"
                  />
                </div>
                <div className="fbm-band-foot">
                  <div>
                    <p className="fbm-index">{m.index}</p>
                    <h3 className="fbm-title">{m.title}</h3>
                  </div>
                  <p className="fbm-text">{m.text}</p>
                </div>
              </article>
            ))}
          </section>

          {/* ── 08 · Was funktioniert hat ───────────────────────── */}
          <section className="tc-sec" id="erkenntnisse" aria-labelledby="fb-learnings-h">
            <div className="tc-rail">
              <p className="tc-label">
                <span>08</span>
                <span>{u.learnings.label}</span>
              </p>
              <h2 className="tc-h2-display" id="fb-learnings-h">
                {u.learnings.h2}
              </h2>
            </div>

            <div className="tc-body">
              <Reveal stagger={70}>
                <ol className="tc-numlist">
                  {learnings.map((l) => (
                    <li className="tc-numitem" key={l.index} data-reveal>
                      <span className="tc-numindex">{l.index}</span>
                      <div>
                        <h3 className="tc-numtitle">{l.title}</h3>
                        <p className="tc-numtext">{l.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </section>

          {/* ── 09 · So messen wir ──────────────────────────────── */}
          <section className="tc-sec" id="methodik" aria-labelledby="fb-method-h">
            <div className="tc-rail">
              <p className="tc-label">
                <span>09</span>
                <span>{u.method.label}</span>
              </p>
              <h2 className="tc-h2-serif" id="fb-method-h">
                {u.method.h2}
              </h2>
            </div>

            <div className="tc-body">
              <p className="tc-copy-lead">{u.method.lead}</p>

              <dl className="fbq" style={{ marginTop: "clamp(26px, 2.8vw, 40px)" }}>
                {methodFacts.map((f) => (
                  <div className="fbq-cell" key={f.key}>
                    <dt>{f.key}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="fbk-source">{u.method.footnote(figures.position)}</p>
            </div>
          </section>

          {/* ── 10 · Nächster Schritt ───────────────────────────── */}
          <section className="fbc" id="naechster-schritt" aria-labelledby="fb-cta-h">
            <div>
              <p className="tc-label">
                <span>10</span>
                <span>{u.cta.label}</span>
              </p>
              <h2 className="fbc-h2" id="fb-cta-h">
                {u.cta.h2a}
                <br />
                {u.cta.h2b}
              </h2>
            </div>

            <div className="fbc-side">
              <p className="fbc-copy">{u.cta.copy}</p>

              <p className="fbc-action">
                <Link href={u.cta.buttonHref} className="fbc-btn">
                  {u.cta.button}
                  <span aria-hidden="true">→</span>
                </Link>
              </p>

              <nav className="fbc-related" aria-label={u.cta.relatedLabel}>
                {related.map((r) => (
                  <Link key={r.href} href={r.href}>
                    {r.label}
                  </Link>
                ))}
              </nav>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
