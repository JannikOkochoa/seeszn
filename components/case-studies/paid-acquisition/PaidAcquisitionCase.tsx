import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CaseStyles from "@/components/case-studies/CaseStyles";
import Reveal from "@/components/case-studies/Reveal";
import PaidAcquisitionStyles from "./PaidAcquisitionStyles";
import CplRange from "./CplRange";
import PaMark from "./PaMark";
import {
  PA_CHANNEL,
  PA_COMPARE,
  PA_COMPARE_SUMMARY,
  PA_CONFIDENTIAL,
  PA_CTA_HREF,
  PA_FIGURES,
  PA_HERO_KPIS,
  PA_ILLUSTRATIVE,
  PA_IMAGES,
  PA_INDEX_PATH,
  PA_PRINCIPLES,
  PA_PROBLEMS,
  PA_RELATED,
  PA_WORKSTREAMS,
} from "@/lib/case-studies/paid-acquisition";

// ─── Case Study: Paid Acquisition at Scale ───────────────────────────────────
// Rendered entirely on the server. The only client code is <Reveal />, which
// controls visibility and nothing else: the full content is in the first HTML
// response and stays readable without JavaScript.
//
// COMPOSITIONAL RULE
// No two adjacent sections share a composition. The three photographs each meet
// a different edge — the hero runs off the right, the scale image off the left,
// the closing image carries a full-bleed canvas — so the page never settles
// into a text-left / image-right rhythm. Spacing works in four tiers rather
// than one, so sections read as spreads with tension and release instead of a
// queue of equal blocks.
//
// The page is English inside a German-first site, so <main> carries lang="en"
// — the surrounding Nav and Footer stay in the document language.

export default function PaidAcquisitionCase() {
  return (
    <>
      <Nav />
      <main className="tc-root pa-root" lang="en">
        <CaseStyles />
        <PaidAcquisitionStyles />

        <nav className="pa-crumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={PA_INDEX_PATH}>Results</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Paid Acquisition at Scale</li>
          </ol>
        </nav>

        <article>
          {/* ── 01 · Hero ───────────────────────────────────────── */}
          {/* Three grid rows: copy, a hairline that crosses the photograph,
              then the metadata foot. The image spans all three and runs off the
              right edge of the viewport. */}
          <header className="pah" id="case-hero">
            <p className="pah-side" aria-hidden="true">
              SEESZN · Case 03 · Scale
            </p>

            <div className="pah-text">
              <p className="pah-eyebrow">
                <b>Anonymized case study</b>
                <span>Google Ads · DACH</span>
              </p>

              <h1 className="pah-h1">
                <span className="pah-l1">Scaling paid acquisition</span>
                <span className="pah-l2">without scaling</span>
                <span className="pah-l3 pa-accent">inefficiency.</span>
              </h1>

              <p className="pah-sub">
                How a high-growth European brand managed {PA_FIGURES.spend} in annual
                Google Ads spend while significantly reducing acquisition costs and
                increasing conversion value.
              </p>
            </div>

            <span className="pah-rule" aria-hidden="true" />

            <p className="pah-foot">{PA_CHANNEL}</p>

            <div className="pah-media">
              <Image
                src={PA_IMAGES.hero.src}
                alt={PA_IMAGES.hero.alt}
                width={PA_IMAGES.hero.width}
                height={PA_IMAGES.hero.height}
                sizes="(max-width: 860px) 100vw, 52vw"
                priority
                fetchPriority="high"
                className="pah-img"
              />
            </div>
          </header>

          {/* KPI strip — a descending scale, not three equal cells. */}
          <dl className="pak">
            {PA_HERO_KPIS.map((k) => (
              <div className="pak-cell" key={k.label}>
                <dt>{k.value}</dt>
                <dd>{k.label}</dd>
              </div>
            ))}
          </dl>

          {/* ── 02 · The situation ──────────────────────────────── */}
          <section className="pa-sit" id="situation" aria-labelledby="pa-sit-h">
            <div className="pa-sit-head">
              <p className="pa-label">
                <span>01</span>
                <span>The situation</span>
              </p>

              <h2 className="pa-h2" id="pa-sit-h">
                Growth wasn&rsquo;t the problem.
                <br />
                Efficient growth was.
              </h2>

              <p className="pa-copy-lead">
                At multi-million-euro media spend, inefficiency compounds quickly. Small
                changes in acquisition economics can translate into meaningful amounts of
                capital that can either be reinvested into growth &mdash; or quietly
                disappear into the platform.
              </p>
            </div>

            {/* Editorial interruption: a tall narrow crop running off the left
                edge, with its caption parked far away on the right. */}
            <figure className="pa-sit-figure">
              <div className="pa-sit-media">
                <Image
                  src={PA_IMAGES.scale.src}
                  alt={PA_IMAGES.scale.alt}
                  width={PA_IMAGES.scale.width}
                  height={PA_IMAGES.scale.height}
                  sizes="(max-width: 860px) 100vw, 66vw"
                  loading="lazy"
                  className="pa-sit-img"
                />
              </div>
              <figcaption className="pa-sit-caption">
                Scale is a material condition,
                <br />
                not a campaign setting.
              </figcaption>
            </figure>

            <div className="pa-sit-stat">
              <div className="pa-stat-side">
                <p className="pa-stat-pull">
                  10% <span aria-hidden="true">=</span>
                  <span className="tc-sr"> equals </span>{" "}
                  {PA_ILLUSTRATIVE.tenPercent}
                </p>
                <p className="pa-stat-flag">{PA_ILLUSTRATIVE.note}</p>
                <p className="pa-stat-note">
                  At this level, a 10% efficiency improvement can represent roughly{" "}
                  {PA_ILLUSTRATIVE.tenPercent} in monthly media efficiency.
                </p>
              </div>

              <div className="pa-stat-main">
                <p className="pa-stat-value">{PA_ILLUSTRATIVE.monthly}</p>
                <p className="pa-stat-label">{PA_ILLUSTRATIVE.monthlyLabel}</p>
              </div>
            </div>
          </section>

          {/* ── 03 · The scaling problem ────────────────────────── */}
          {/* Dense analytical spread: unequal columns, stepped baselines and
              oversized indices. A contents page, not four cards. */}
          <section className="pa-wide pa-wide-dense" id="scaling-problem" aria-labelledby="pa-prob-h">
            <div className="pa-wide-head">
              <div>
                <p className="pa-label">
                  <span>02</span>
                  <span>The scaling problem</span>
                </p>
                <h2 className="pa-h2" id="pa-prob-h">
                  What breaks
                  <br />
                  when spend grows.
                </h2>
              </div>
              <p className="pa-wide-note">
                Four failure modes that only appear at scale. None of them is a campaign
                problem, and none of them is solved by adding budget.
              </p>
            </div>

            <Reveal stagger={80}>
              <ol className="pap">
                {PA_PROBLEMS.map((p) => (
                  <li className="pap-col" key={p.index} data-reveal>
                    <p className="pap-top">
                      <span className="pap-index">{p.index}</span>
                      <PaMark kind={p.mark} />
                    </p>
                    <h3 className="pap-title">{p.title}</h3>
                    <p className="pap-text">{p.text}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>

          {/* ── 04 · What we focused on ─────────────────────────── */}
          {/* A vertical index — deliberately the opposite composition to the
              horizontal spread directly above it. */}
          <section className="pa-wide" id="focus" aria-labelledby="pa-focus-h">
            <div className="pa-wide-head">
              <div>
                <p className="pa-label">
                  <span>03</span>
                  <span>What we focused on</span>
                </p>
                <h2 className="pa-h2" id="pa-focus-h">
                  Four workstreams.
                </h2>
              </div>
              <p className="pa-wide-note">
                Described at the level they were run at. What sits below this &mdash; the
                specific mechanics inside the account &mdash; stays with the client.
              </p>
            </div>

            <Reveal stagger={70}>
              <ol className="paw">
                {PA_WORKSTREAMS.map((w) => (
                  <li className="paw-row" key={w.index} data-reveal>
                    <span className="paw-index">{w.index}</span>
                    <h3 className="paw-title">{w.title}</h3>
                    <p className="paw-text">{w.text}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>

          {/* ── 05 · Acquisition economics ──────────────────────── */}
          <section className="pa-wide pa-wide-open" id="acquisition-economics" aria-labelledby="pa-cpl-h">
            <div className="pa-wide-head">
              <div>
                <p className="pa-label">
                  <span>04</span>
                  <span>Acquisition economics</span>
                </p>
                <h2 className="pa-h2" id="pa-cpl-h">
                  Lower acquisition cost
                  <br />
                  at scale.
                </h2>
              </div>
              <p className="pa-wide-note">
                Cost per lead moved from approximately {PA_FIGURES.cplFrom} into the{" "}
                {PA_FIGURES.cplTo} range while the account continued operating at
                significant media scale.
              </p>
            </div>

            <Reveal stagger={0}>
              <CplRange />
            </Reveal>
          </section>

          {/* ── 06 · Conversion value ───────────────────────────── */}
          {/* The emptiest section on the page. Three stepped numerals and one
              multiple, set as objects rather than as a metric row. */}
          <section className="pa-val" id="conversion-value" aria-labelledby="pa-val-h">
            <p className="pa-label">
              <span>05</span>
              <span>Conversion value</span>
            </p>
            <h2 className="tc-sr" id="pa-val-h">
              Conversion value increased {PA_FIGURES.multiple}.
            </h2>

            <Reveal stagger={160}>
              <div className="pa-val-stage">
                <p className="pa-val-a" data-reveal>
                  {PA_FIGURES.valueFrom}
                </p>
                <p className="pa-val-arrow" data-reveal>
                  <span aria-hidden="true">→</span>
                  <span className="tc-sr">to</span>
                </p>
                <p className="pa-val-b" data-reveal>
                  {PA_FIGURES.valueTo}
                </p>
                <p className="pa-val-mult" data-reveal>
                  <b>{PA_FIGURES.multiple}</b>
                  <span>Increase</span>
                </p>
                <p className="pa-val-tag">Conversion Value</p>
              </div>
            </Reveal>

            <p className="pa-val-foot">
              More conversion value from a stronger acquisition system and improved
              economics.
            </p>
          </section>

          {/* ── 07 · Managed at scale ───────────────────────────── */}
          {/* Second hero moment. Left-aligned rather than centred, the label
              parked in the opposite corner, the texture bleeding past the
              container on both sides. */}
          <section className="pa-scale" id="scale" aria-labelledby="pa-scale-h">
            <div className="pa-scale-bg" aria-hidden="true">
              <Image
                src={PA_IMAGES.texture.src}
                alt=""
                aria-hidden="true"
                width={PA_IMAGES.texture.width}
                height={PA_IMAGES.texture.height}
                sizes="120vw"
                loading="lazy"
                className="pa-scale-img"
              />
            </div>

            <p className="pa-label pa-scale-label">
              <span>06</span>
              <span>Scale</span>
            </p>

            <div className="pa-scale-inner">
              <p className="pa-scale-num">{PA_FIGURES.spend}</p>
              <h2 className="pa-scale-cap" id="pa-scale-h">
                Google Ads spend managed annually
              </h2>
            </div>

            <p className="pa-scale-line">
              At this level, paid acquisition stops being a collection of campaigns and
              becomes a <span className="pa-accent">capital-allocation system.</span>
            </p>
          </section>

          {/* ── 08 · Before / After ─────────────────────────────── */}
          {/* Two opposing panels: the earlier state compressed on a tinted
              surface, the later state open on paper. */}
          <section className="pa-wide pa-wide-dense" id="before-after" aria-labelledby="pa-ba-h">
            <div className="pa-wide-head">
              <div>
                <p className="pa-label">
                  <span>07</span>
                  <span>Before / After</span>
                </p>
                <h2 className="pa-h2" id="pa-ba-h">
                  The same account,
                  <br />
                  different economics.
                </h2>
              </div>
              <p className="pa-wide-note">
                Two states of one system. The media scale did not shrink &mdash; what
                changed is what each euro had to do to produce a lead.
              </p>
            </div>

            <div className="pa-ba">
              <div className="pa-ba-col pa-ba-before">
                <p className="pa-ba-tag">Before</p>
                <dl className="pa-ba-rows">
                  {PA_COMPARE.map((r) => (
                    <div key={r.label}>
                      <dt>{r.label}</dt>
                      <dd>{r.before}</dd>
                    </div>
                  ))}
                </dl>
                <h3 className="pa-ba-title">{PA_COMPARE_SUMMARY.before.title}</h3>
                <p className="pa-ba-text">{PA_COMPARE_SUMMARY.before.text}</p>
              </div>

              <div className="pa-ba-col pa-ba-after">
                <p className="pa-ba-tag">After</p>
                <dl className="pa-ba-rows">
                  {PA_COMPARE.map((r) => (
                    <div key={r.label}>
                      <dt>{r.label}</dt>
                      <dd>{r.after}</dd>
                    </div>
                  ))}
                </dl>
                <h3 className="pa-ba-title">{PA_COMPARE_SUMMARY.after.title}</h3>
                <p className="pa-ba-text">{PA_COMPARE_SUMMARY.after.text}</p>
              </div>
            </div>
          </section>

          {/* ── 09 · What changed ───────────────────────────────── */}
          {/* The thesis dominates; the three principles are footnotes to it. */}
          <section className="pa-chg" id="what-changed" aria-labelledby="pa-chg-h">
            <p className="pa-label">
              <span>08</span>
              <span>What changed</span>
            </p>

            <h2 className="pa-chg-h2" id="pa-chg-h">
              Scaling isn&rsquo;t about spending more. It&rsquo;s about allocating{" "}
              <span className="pa-accent">capital better.</span>
            </h2>

            <Reveal stagger={70}>
              <ol className="pa-notes">
                {PA_PRINCIPLES.map((p) => (
                  <li className="pa-note" key={p.index} data-reveal>
                    <span className="pa-note-index">{p.index}</span>
                    <h3 className="pa-note-title">{p.title}</h3>
                    <p className="pa-note-text">{p.text}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>

          {/* ── Confidentiality — a museum label, not an alert ───── */}
          <aside className="pa-conf" aria-label="Confidentiality">
            <p className="pa-conf-idx">Confidentiality / 01</p>
            <p className="pa-conf-main">{PA_CONFIDENTIAL.headline}</p>
            <p className="pa-conf-sub">{PA_CONFIDENTIAL.detail}</p>
          </aside>

          {/* ── Final visual moment ─────────────────────────────── */}
          {/* The image carries the section. The copy is a small block in one
              corner and nothing else competes with it. */}
          <section className="pa-close" aria-labelledby="pa-close-h">
            <div className="pa-close-media">
              <Image
                src={PA_IMAGES.closing.src}
                alt={PA_IMAGES.closing.alt}
                width={PA_IMAGES.closing.width}
                height={PA_IMAGES.closing.height}
                sizes="(max-width: 860px) 100vw, 74vw"
                loading="lazy"
                className="pa-close-img"
              />
            </div>

            <div className="pa-close-copy">
              <h2 className="pa-close-h2" id="pa-close-h">
                Paid acquisition
                <br />
                becomes interesting
                <br />
                when scale meets{" "}
                <span className="pa-accent">discipline.</span>
              </h2>
              <p className="pa-close-text">
                More spend isn&rsquo;t the objective. More productive spend is.
              </p>
            </div>
          </section>

          {/* ── Final CTA ───────────────────────────────────────── */}
          <section className="pa-cta" id="next-step" aria-labelledby="pa-cta-h">
            <div>
              <p className="pa-label">
                <span>09</span>
                <span>Next step</span>
              </p>
              <h2 className="pa-cta-h2" id="pa-cta-h">
                Need scale with
                <br />
                stronger economics?
                <span className="pa-accent pa-cta-accent">Let&rsquo;s talk.</span>
              </h2>
            </div>

            <div className="pa-cta-side">
              <p className="pa-cta-action">
                <Link href={PA_CTA_HREF} className="pa-cta-btn">
                  Start First Move
                  <span aria-hidden="true">→</span>
                </Link>
              </p>

              <nav className="pa-cta-related" aria-label="Continue reading">
                {PA_RELATED.map((r) => (
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
