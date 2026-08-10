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
  FB_FIGURES,
  FB_FLOW,
  FB_HERO_IMAGE,
  FB_HERO_KPIS,
  FB_INDEX_PATH,
  FB_KPIS,
  FB_LEARNINGS,
  FB_METHOD_FACTS,
  FB_MODULES,
  FB_RELATED,
  FB_TAXONOMY,
  FB_VISUAL_CAPTION,
} from "@/lib/case-studies/french-beret";

// ─── Case Study: French Beret ────────────────────────────────────────────────
// Vollständig serverseitig gerendert. Der einzige Client-Anteil ist <Reveal />,
// das ausschliesslich Sichtbarkeit steuert: der Inhalt steht in der ersten
// Antwort vollständig im HTML, auch ohne JavaScript.
//
// Aufbau, Farben, Typo-Rollen und Hairlines kommen aus dem bestehenden
// Case-Study-Chrome (<CaseStyles />). Neu sind nur die breiten Bahnen, die
// diese Case Study braucht, weil sie mehr Raster als Erzählung ist.

const CLIENT_HOST = FB_CLIENT_URL.replace(/^https?:\/\//, "");
const GRID_MODULES = FB_MODULES.filter((m) => !m.band);
const BAND_MODULES = FB_MODULES.filter((m) => m.band);

export default function FrenchBeretCase() {
  return (
    <>
      <Nav />
      <main className="tc-root" lang="de">
        <CaseStyles />
        <FrenchBeretStyles />

        <nav className="fb-crumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Start</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={FB_INDEX_PATH}>Ergebnisse</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">French Beret</li>
          </ol>
        </nav>

        <article>
          {/* ── 01 · Hero ───────────────────────────────────────── */}
          <header className="fbh" id="case-hero">
            <div className="fbh-text">
              <p className="fbh-eyebrow">
                <b>01 · Build</b>
                <span>Case Study</span>
              </p>

              <h1 className="fbh-h1">
                <span className="fbh-num">{FB_FIGURES.clicks}</span>
                <span className="fbh-tail">
                  organische Klicks
                  <br />
                  in {FB_FIGURES.windowMonthsIn}.
                </span>
              </h1>

              <p className="fbh-sub">
                Wie SEESZN für French Beret eine E-Commerce- und Search-Architektur von
                Grund auf aufgebaut hat.
              </p>

              <p className="fbh-disc">{FB_DISCIPLINE}</p>

              <dl className="fbh-kpis">
                {FB_HERO_KPIS.map((k) => (
                  <div className="fbh-kpi" key={k.label}>
                    <dt>{k.value}</dt>
                    <dd>{k.label}</dd>
                  </div>
                ))}
              </dl>

              <dl className="fbh-meta">
                <div className="fbh-meta-row">
                  <dt>Kunde</dt>
                  <dd>French Beret</dd>
                </div>
                <div className="fbh-meta-row">
                  <dt>Zeitraum</dt>
                  <dd>{FB_FIGURES.windowMonths}</dd>
                </div>
                <div className="fbh-meta-row">
                  <dt>Website</dt>
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
                  src={FB_HERO_IMAGE.src}
                  alt={FB_HERO_IMAGE.alt}
                  width={FB_HERO_IMAGE.width}
                  height={FB_HERO_IMAGE.height}
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
                <span>Überblick</span>
              </p>
              <h2 className="tc-h2-display" id="fb-overview-h">
                Der Case in
                <br />
                20 Sekunden.
              </h2>
            </div>

            <div className="tc-body">
              <Reveal stagger={45}>
                <dl className="fbq">
                  {FB_FACTS.map((f) => (
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
                <span>Ausgangslage</span>
              </p>
              <h2 className="tc-h2-display" id="fb-approach-h">
                Kein Legacy-SEO.
                <br />
                Ein System von Grund auf.
              </h2>
            </div>

            <div className="tc-body">
              <p className="tc-copy-lead">
                French Beret war kein klassisches SEO-Relaunch-Projekt. Shop-Struktur,
                kommerzielle Landingpages, Produktarchitektur und redaktionelle Inhalte
                konnten von Beginn an gemeinsam gedacht werden.
              </p>
              <p className="tc-copy" style={{ marginTop: "clamp(16px, 1.8vw, 24px)" }}>
                Das Ziel war deshalb nicht, einzelne Rankings nachträglich zu reparieren.
                Es ging darum, eine E-Commerce-Struktur aufzubauen, in der Suchnachfrage,
                Navigation, Produkte und Inhalte dieselbe Architektur nutzen.
              </p>

              <div className="fbs">
                <p>
                  <span className="fbs-a">Search wurde nicht auf den Shop gesetzt.</span>{" "}
                  <span className="fbs-b">Search wurde Teil des Shops.</span>
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
                  <span>Architektur</span>
                </p>
                <h2 className="tc-h2-display" id="fb-flow-h">
                  Von Suchnachfrage zur Shop-Architektur.
                </h2>
              </div>
              <p className="fb-wide-head-note">
                Sechs Ebenen, eine Struktur. Jede Ebene baut auf der vorherigen auf, damit
                Nachfrage, Kategorien, Produkte und Inhalte nicht getrennt voneinander
                entstehen.
              </p>
            </div>

            <Reveal stagger={70}>
              <ol className="fbf-grid">
                {FB_FLOW.map((s) => (
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

            <p className="fbt-label">Taxonomie-Dimensionen</p>
            <ul className="fbt">
              {FB_TAXONOMY.map((t) => (
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
                  <span>Sortiment</span>
                </p>
                <h2 className="tc-h2-display" id="fb-range-h">
                  {FB_FIGURES.products} Live-Produkte.
                </h2>
              </div>
              <p className="fb-wide-head-note">
                Nicht {FB_FIGURES.products} isolierte URLs, sondern ein Commerce-System aus
                Produkten, Collections und redaktionellen Einstiegspunkten.
              </p>
            </div>

            <div className="fbp">
              <figure>
                <div className="fbp-media">
                  <Image
                    src={FB_MODULES[0].image.src}
                    alt={FB_MODULES[0].image.alt}
                    width={FB_MODULES[0].image.width}
                    height={FB_MODULES[0].image.height}
                    sizes="(max-width: 900px) 100vw, 62vw"
                    loading="lazy"
                    className="fbp-img"
                  />
                </div>
                <figcaption className="fb-caption">{FB_VISUAL_CAPTION}</figcaption>
              </figure>

              <div className="fbp-side">
                <div className="fbp-block">
                  <h3>Collections nach</h3>
                  <ul className="fbp-list">
                    <li>Material</li>
                    <li>Farbe</li>
                    <li>Zielgruppe</li>
                    <li>Stil</li>
                  </ul>
                </div>
                <div className="fbp-block">
                  <h3>Editorial Search</h3>
                  <p>Inhalte rund um Auswahl, Styling, Nutzung und Pflege.</p>
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
                  <span>Ergebnis</span>
                </p>
                <h2 className="tc-h2-display" id="fb-result-h">
                  Drei Monate Search.
                </h2>
              </div>
              <p className="fb-wide-head-note">
                Vier Werte aus einer Quelle, im selben Messfenster erhoben. Mehr Kennzahlen
                gibt die Datenlage nicht her, und mehr braucht sie auch nicht.
              </p>
            </div>

            <Reveal stagger={80}>
              <dl className="fbk">
                {FB_KPIS.map((k) => (
                  <div className="fbk-cell" key={k.label} data-reveal>
                    <span className="tc-dot fbk-dot" aria-hidden="true" />
                    <dt>{k.value}</dt>
                    <dd>{k.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <p className="fbk-source">
              Quelle: Google Search Console, Property des Shops. Dokumentiertes
              Messfenster von {FB_FIGURES.windowMonthsIn}.
            </p>
            <p className="fbk-hard">Keine Hochrechnung.</p>
          </section>

          {/* ── 07 · Die Systembausteine ────────────────────────── */}
          <section className="fb-wide" id="bausteine" aria-labelledby="fb-modules-h">
            <div className="fb-wide-head">
              <div>
                <p className="tc-label">
                  <span>07</span>
                  <span>System</span>
                </p>
                <h2 className="tc-h2-display" id="fb-modules-h">
                  Die Systembausteine.
                </h2>
              </div>
              <p className="fb-wide-head-note">
                Vier Bausteine tragen das System: Produktabdeckung, Collection-Struktur,
                redaktionelle Ebene und Storefront. Sie greifen ineinander, statt
                nebeneinander zu stehen.
              </p>
            </div>

            <p className="fb-caption fb-caption-lead">{FB_VISUAL_CAPTION}</p>

            <Reveal stagger={90}>
              <div className="fbm-grid">
                {GRID_MODULES.map((m) => (
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

            {BAND_MODULES.map((m) => (
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
                <span>Erkenntnisse</span>
              </p>
              <h2 className="tc-h2-display" id="fb-learnings-h">
                Was funktioniert hat.
              </h2>
            </div>

            <div className="tc-body">
              <Reveal stagger={70}>
                <ol className="tc-numlist">
                  {FB_LEARNINGS.map((l) => (
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
                <span>Methodik</span>
              </p>
              <h2 className="tc-h2-serif" id="fb-method-h">
                So messen wir.
              </h2>
            </div>

            <div className="tc-body">
              <p className="tc-copy-lead">
                Search-Daten werden über ein fest definiertes Messfenster ausgewertet. Wir
                zeigen die Werte, die direkt in der verwendeten Datenquelle gemessen
                wurden, und trennen dokumentierte Ergebnisse von Interpretation.
              </p>

              <dl className="fbq" style={{ marginTop: "clamp(26px, 2.8vw, 40px)" }}>
                {FB_METHOD_FACTS.map((f) => (
                  <div className="fbq-cell" key={f.key}>
                    <dt>{f.key}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="fbk-source">
                Ø Position {FB_FIGURES.position} ist die durchschnittliche Position aller
                Queries in der Google Search Console. Sie bedeutet nicht, dass einzelne
                Keywords auf Platz {FB_FIGURES.position} ranken, und sie ist kein Ranking
                für ein bestimmtes Keyword.
              </p>
            </div>
          </section>

          {/* ── 10 · Nächster Schritt ───────────────────────────── */}
          <section className="fbc" id="naechster-schritt" aria-labelledby="fb-cta-h">
            <div>
              <p className="tc-label">
                <span>10</span>
                <span>Nächster Schritt</span>
              </p>
              <h2 className="fbc-h2" id="fb-cta-h">
                Wie sichtbar ist
                <br />
                dein Commerce-System?
              </h2>
            </div>

            <div className="fbc-side">
              <p className="fbc-copy">
                Finde heraus, wo deine Marke heute in Google und AI Search steht und
                welcher Engpass als Nächstes gelöst werden sollte.
              </p>

              <p className="fbc-action">
                <Link href="/first-move" className="fbc-btn">
                  First Move starten
                  <span aria-hidden="true">→</span>
                </Link>
              </p>

              <nav className="fbc-related" aria-label="Weiterlesen">
                {FB_RELATED.map((r) => (
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
