import { KLUE } from "@/components/kluehspies-room/data";
import MockCta from "./MockCta";
import {
  bestFitSection,
  compareSection,
  contactSection,
  contentMeta,
  footer,
  headerNav,
  hero,
  trustSection,
  trustStats,
  trustStatsAnchor,
  uspSection,
  TELEFON_LABEL,
  URLS,
  type TrustStatIcon,
  type UspIcon,
} from "./content";
import { jsonLdString } from "./schema";
import {
  CompareIllustration,
  IconAdvice,
  IconArrowRight,
  IconCalendar,
  IconCard,
  IconChart,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconChat,
  IconFacebook,
  IconGuests,
  IconHome,
  IconMail,
  IconNoPayment,
  IconPhone,
  IconPortal,
  IconSeat,
  IconSupport,
  IconYears,
} from "./Icons";

/**
 * Über Klühspies — Redesign-Entwurf als echte Weboberfläche.
 *
 * Drei Regeln bestimmen den Aufbau:
 *
 * 1. Alle sichtbaren Texte kommen aus ./content.ts, der typisierten Übernahme
 *    von docs/mockups/ueber-kluehspies/CONTENT.md. Nichts steht hier inline.
 * 2. Das Referenz-PNG ist Zielbild für Komposition, Proportionen und Rhythmus,
 *    wird aber nirgends als Bild eingebaut. Jede Fläche ist echtes HTML.
 * 3. Logo, Teamfoto, Porträt und Siegel sind die echten Klühspies-Dateien aus
 *    public/mockups/ueber-kluehspies/assets/, lokal gespeichert, nicht gehotlinkt.
 *
 * Zur Rundung: app/globals.css setzt projektweit `border-radius: 0 !important`.
 * Der Klühspies-Entwurf lebt aber von weichen Karten. Deshalb dasselbe Muster
 * wie in components/kluehspies-room/HomepageMockup.tsx — auf `.kb` gescopte
 * Radius-Klassen, die nur innerhalb dieses Mockups greifen.
 */
export default function UeberKluehspiesMockup() {
  return (
    <div className="kb">
      {/* Strukturierte Daten der späteren Produktionsseite. Siehe ./schema.ts:
          ein @graph aus TravelAgency, FAQPage und BreadcrumbList, dessen Werte
          aus denselben Konstanten stammen wie der sichtbare Text. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString() }}
      />

      <KluehspiesHeader />

      <main className="kb-main">
        <Breadcrumb />
        <Hero />
        <TrustBar />
        <UspSection />
        <BestFitSection />
        <TrustSection />
        <CompareTeaser />
        <ContactSection />
        <ContentMeta />
      </main>

      <KluehspiesFooter />
      <Styles />
    </div>
  );
}

/* ── 1 · Header / Navigation ─────────────────────────────────────────────── */

function KluehspiesHeader() {
  return (
    <header className="kb-header">
      <div className="kb-servicebar">
        <div className="kb-wrap kb-servicebar-row">
          <span className="kb-service-item">
            <IconAdvice className="kb-service-icon" />
            Beratung &amp; Service
          </span>
          <a className="kb-service-item kb-service-phone" href={URLS.telefon}>
            <IconPhone className="kb-service-icon" />
            {TELEFON_LABEL}
          </a>
          <a className="kb-service-btn kb-r6" href={URLS.kontakt}>
            Kontakt
          </a>
        </div>
      </div>

      <div className="kb-masthead">
        <div className="kb-wrap kb-masthead-row">
          <a className="kb-brand" href={URLS.home}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="kb-brand-logo"
              src="/mockups/ueber-kluehspies/assets/kluehspies-logo.svg"
              alt="Klühspies"
              width={425}
              height={85}
            />
            <span className="kb-brand-claim">Klassenfahrten seit über 40 Jahren</span>
          </a>

          <nav className="kb-nav" aria-label="Hauptnavigation">
            <ul className="kb-nav-list">
              {headerNav.map((item) => (
                <li key={item.label}>
                  <a className="kb-nav-link" href={item.href}>
                    {item.label.toUpperCase()}
                    <IconChevronDown className="kb-nav-chevron" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

/* ── 2 · Breadcrumb ──────────────────────────────────────────────────────── */

function Breadcrumb() {
  return (
    <nav className="kb-breadcrumb-shell" aria-label="Breadcrumb">
      <div className="kb-wrap">
        <ol className="kb-breadcrumb">
          <li>
            <a className="kb-crumb-home" href={URLS.home} aria-label="Startseite">
              <IconHome className="kb-crumb-icon" />
            </a>
          </li>
          <li aria-hidden="true">
            <IconChevronRight className="kb-crumb-sep" />
          </li>
          <li>
            <span aria-current="page">Über Klühspies</span>
          </li>
        </ol>
      </div>
    </nav>
  );
}

/* ── 3 · Hero ────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="kb-hero" aria-labelledby="kb-h1">
      <div className="kb-hero-media">
        {/* LCP-Element. Deshalb kein Lazy-Load, hohe Ladepriorität und feste
            Maße: mit width/height kennt der Browser das Seitenverhältnis vor
            dem Laden und reserviert den Platz, statt den Inhalt darunter
            wegzuschieben. Zur Formatfrage siehe HANDOVER.md §B4: WebP/AVIF
            erzeugt die TYPO3-Bildpipeline, nicht dieses Repository. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero.image.src}
          alt={hero.image.alt}
          width={1920}
          height={800}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <span className="kb-hero-veil" aria-hidden="true" />
      </div>

      <div className="kb-wrap kb-hero-inner">
        <div className="kb-hero-copy">
          {/* Genau eine H1, und sie trägt die vollständige Seitenaussage. Die
              frühere Eyebrow war ein eigenes p über der Überschrift: optisch
              Teil des Titels, semantisch aber losgelöst davon. Sie ist jetzt
              die erste Zeile der H1 und behält ihre Optik über die Spanklasse,
              der Rest der Hero-Komposition bleibt unverändert. */}
          <h1 className="kb-h1" id="kb-h1">
            <span className="kb-h1-lead">{hero.h1.lead}</span>{" "}
            <span className="kb-h1-main">{hero.h1.main}</span>
          </h1>
          {hero.intro.map((p) => (
            <p className="kb-hero-lead" key={p}>
              {p}
            </p>
          ))}

          {/* Ein primärer CTA, ein sekundärer. Der dritte Hero-CTA
              („Bezahlservice ansehen") ist in die Bezahlservice-Karte gewandert,
              wo er ohnehin steht. Drei gleichrangige Angebote im Hero zwingen
              zu einer Entscheidung, die die Seite an dieser Stelle noch gar
              nicht vorbereitet hat. */}
          <div className="kb-hero-actions">
            <a className="kb-btn kb-btn-primary kb-r8" href={hero.primaryCta.href}>
              <IconMail className="kb-btn-icon kb-btn-icon-lead" />
              {hero.primaryCta.label}
            </a>
            {/* Icon als Schlüssel, nicht als Komponente: MockCta ist eine
                Client Component, und über diese Grenze lassen sich keine
                Funktionen reichen. Siehe Kommentar in MockCta.tsx. */}
            <MockCta
              variant="button-outline"
              label={hero.secondaryCta.label}
              icon="handCard"
              note="Ziel-URL offen: Der Anbieter-Vergleich bekommt eine eigene Seite, deren Adresse noch nicht freigegeben ist. Siehe HANDOVER.md §7.1."
            />
          </div>

          {/* Die Reibung benennen, wo sie niedrig ist: die häufigste ungestellte
              Frage vor einer Anfrage ist „binde ich mich damit schon?". */}
          <p className="kb-hero-note">{hero.primaryNote}</p>
        </div>
      </div>
    </section>
  );
}

/* ── 4 · Trust Bar ───────────────────────────────────────────────────────── */

const TRUST_ICONS: Record<TrustStatIcon, (p: { className?: string }) => React.ReactElement> = {
  years: IconYears,
  guests: IconGuests,
  calendar: IconCalendar,
  card: IconCard,
};

function TrustBar() {
  return (
    <section className="kb-trustbar-shell" aria-label="Klühspies in Zahlen">
      <div className="kb-wrap">
        <ul className="kb-trustbar kb-r18">
          {trustStats.map((stat) => {
            const Icon = TRUST_ICONS[stat.icon];
            return (
              <li className="kb-stat" key={stat.label}>
                <span className="kb-stat-badge kb-round" aria-hidden="true">
                  <Icon className="kb-stat-icon" />
                </span>
                <span className="kb-stat-text">
                  <span className="kb-stat-value">{stat.value}</span>
                  <span className="kb-stat-label">{stat.label}</span>
                </span>
              </li>
            );
          })}
        </ul>
        {/* Vier Kacheln, vier Zahlen, aber ohne Satzbau. Aus dem Kontext
            gerissen ergibt „110.000+ / Gäste pro Jahr" keine zitierfähige
            Aussage. Dieser Absatz bindet dieselben Zahlen in ganze Sätze und
            stellt die Verknüpfung zur Entity Klühspies her. */}
        <p className="kb-trustbar-anchor">{trustStatsAnchor}</p>
      </div>
    </section>
  );
}

/* ── 5 · Was Klühspies anders macht ──────────────────────────────────────── */

const USP_ICONS: Record<UspIcon, (p: { className?: string }) => React.ReactElement> = {
  noPayment: IconNoPayment,
  portal: IconPortal,
  chart: IconChart,
  seat: IconSeat,
  support: IconSupport,
};

function UspSection() {
  return (
    <section className="kb-section" aria-labelledby="kb-usp">
      <div className="kb-wrap">
        <h2 className="kb-h2" id="kb-usp">
          {uspSection.heading}
        </h2>
        {/* CONTENT.md führt hier ein Intro als ausdrücklich optional. Das
            Referenz-PNG zeigt unter dieser H2 keinen Fließtext, und das PNG ist
            für die Komposition verbindlich, deshalb bleibt es weg. Der Text
            steht weiterhin in content.ts, falls er später gewünscht ist. */}

        {/* Fünf Karten. Das Vierergrid hätte die fünfte allein in eine zweite
            Reihe gestellt; ein sechster Eintrag wäre nur durch einen erfundenen
            Vorteil zu füllen gewesen. Deshalb 3 + 2 mit zentrierter zweiter
            Reihe: keine bestehende Karte weicht, nichts wird dazuerfunden. */}
        <div className="kb-grid-5">
          {uspSection.cards.map((card) => {
            const Icon = USP_ICONS[card.icon];
            return (
              <article className="kb-card kb-r18" key={card.heading}>
                <span className="kb-card-badge kb-round" aria-hidden="true">
                  <Icon className="kb-card-icon" />
                </span>
                <h3 className="kb-h3">{card.heading}</h3>
                <p className="kb-card-text">{card.text}</p>
                {/* Linktexte benennen das Ziel. Fünfmal „Mehr erfahren" auf
                    einer Seite ist für Screenreader-Nutzung wertlos, weil die
                    Linkliste dann fünf identische Einträge zeigt. Die
                    Freiplatz-Karte trägt keinen Link: zu ihr existiert keine
                    Zielseite, und ein toter Link ist schlechter als keiner. */}
                {card.href && card.linkLabel ? (
                  <a className="kb-cardlink" href={card.href}>
                    {card.linkLabel}
                    <IconArrowRight className="kb-cardlink-icon" />
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 6 · Für welche Schulen ──────────────────────────────────────────────── */

function BestFitSection() {
  return (
    <section className="kb-section" aria-labelledby="kb-bestfit">
      <div className="kb-wrap">
        <h2 className="kb-h2" id="kb-bestfit">
          {bestFitSection.heading}
        </h2>
        {/* Die H2 stellt eine echte Suchanfrage. Eine Liste aus Fragmenten
            beantwortet sie für Lehrkräfte, für ein Antwortsystem aber nicht:
            zitierfähig ist erst ein vollständiger Satz. Der Lead liefert ihn,
            die Liste bleibt die scanbare Fassung darunter. */}
        <p className="kb-section-lead">{bestFitSection.lead}</p>
        <ul className="kb-grid-3">
          {bestFitSection.items.map((item) => (
            <li className="kb-fit kb-r14" key={item}>
              <IconCheck className="kb-fit-check" />
              <span className="kb-fit-text">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 7 · Qualität, auf die Schulen vertrauen ─────────────────────────────── */

function TrustSection() {
  return (
    <section className="kb-section" aria-labelledby="kb-quality">
      <div className="kb-wrap">
        <h2 className="kb-h2" id="kb-quality">
          {trustSection.heading}
        </h2>

        {/* Zwei bis drei Sätze pro Siegel statt Einzeiler plus „Mehr erfahren":
            wer prüft, was geprüft wird und was daraus folgt. Das ist das
            E-E-A-T-Material der Seite, und es steht hier vollständig, statt
            hinter einen Link zu verweisen, den es nicht gibt. Die früheren
            CTAs sind entfallen, weil zu keiner der vier Auszeichnungen eine
            Zielseite existiert. */}
        <div className="kb-grid-4">
          {trustSection.cards.map((card) => (
            <article className="kb-card kb-card-seal kb-r18" key={card.heading}>
              <span className="kb-seal">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.logo.src}
                  alt={card.logo.alt}
                  width={256}
                  height={134}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <h3 className="kb-h3 kb-h3-seal">{card.heading}</h3>
              <p className="kb-card-text">{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 8 · Klassenfahrtanbieter vergleichen ────────────────────────────────── */

function CompareTeaser() {
  return (
    <section className="kb-section kb-section-compare" aria-labelledby="kb-vergleich">
      <div className="kb-wrap">
        <div className="kb-compare kb-r18">
          <div className="kb-compare-visual">
            <CompareIllustration className="kb-compare-illu" />
          </div>
          <div className="kb-compare-copy">
            <h2 className="kb-h2 kb-h2-left" id="kb-vergleich">
              {compareSection.heading}
            </h2>
            <p className="kb-compare-text">{compareSection.text}</p>
            {/* Echte Vorschau statt reinem Versprechen: die vier Kriterien
                stehen sichtbar auf der Seite, der CTA führt später auf die
                ausgeführte Vergleichsseite. Bewusst ohne Wettbewerbernamen,
                die gehören laut CONTENT.md §1 nicht auf die Über-uns-Seite. */}
            <ul className="kb-compare-criteria">
              {compareSection.criteria.map((criterion) => (
                <li key={criterion}>
                  <IconCheck className="kb-compare-check" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
            <MockCta
              variant="button"
              label={compareSection.cta}
              note="Ziel-URL offen: Der Anbieter-Vergleich hat noch keine Produktions-Adresse, deshalb verlinkt dieser CTA bewusst noch nicht. Siehe HANDOVER.md §7.1."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 9 · Persönliche Kontakt-CTA ─────────────────────────────────────────── */

function ContactSection() {
  return (
    <section className="kb-contact" aria-labelledby="kb-contact-h">
      <span className="kb-contact-dots" aria-hidden="true" />
      <div className="kb-wrap kb-contact-inner">
        <figure className="kb-person">
          <span className="kb-person-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="kb-round"
              src={contactSection.person.photo.src}
              alt={contactSection.person.photo.alt}
              width={300}
              height={300}
              loading="lazy"
              decoding="async"
            />
            <span className="kb-person-badge kb-round" aria-hidden="true">
              <IconChat className="kb-person-badge-icon" />
            </span>
          </span>
          <figcaption className="kb-person-caption">
            <span className="kb-person-name">{contactSection.person.name}</span>
            <span className="kb-person-role">{contactSection.person.role}</span>
          </figcaption>
        </figure>

        <div className="kb-contact-copy">
          <h2 className="kb-h2 kb-h2-left kb-h2-light" id="kb-contact-h">
            {contactSection.heading}
          </h2>
          <p className="kb-contact-text">{contactSection.text}</p>
          <div className="kb-contact-actions">
            <a className="kb-btn kb-btn-onblue kb-r8" href={contactSection.primaryCta.href}>
              <IconMail className="kb-btn-icon kb-btn-icon-lead" />
              {contactSection.primaryCta.label}
            </a>
            {/* Tap-to-call. Der Button ist mindestens 58 px hoch und damit auch
                mit dem Daumen sicher zu treffen. */}
            <a className="kb-btn kb-btn-ghost kb-r8" href={contactSection.phoneCta.href}>
              <IconPhone className="kb-btn-icon kb-btn-icon-lead" />
              {contactSection.phoneCta.label}
            </a>
          </div>
          {/* Eine Telefonnummer ohne Zeiten erzeugt Unsicherheit, und ein Teil
              der Zielgruppe ruft grundsätzlich nicht an. Beides steht deshalb
              direkt unter den Buttons. */}
          <p className="kb-contact-meta">
            <span>{contactSection.availability}</span>
            <span className="kb-contact-meta-sep" aria-hidden="true">
              ·
            </span>
            <a className="kb-contact-mail" href={contactSection.email.href}>
              <IconMail className="kb-contact-mail-icon" />
              {contactSection.email.label}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── 10 · Aktualitätssignal ──────────────────────────────────────────────── */

/**
 * Stand und inhaltliche Verantwortung, sichtbar am Ende der Content-Sektion.
 *
 * Beides ist bewusst echter Seitentext und nicht nur Schema: dieselbe Person
 * steht als reviewedBy im FAQPage-Knoten, dasselbe Datum als dateModified.
 * Ein Aktualitätssignal, das nur im JSON-LD steht, ist für Leserinnen und
 * Leser wertlos und für Prüfer nicht belegt.
 */
function ContentMeta() {
  return (
    <section className="kb-contentmeta" aria-label="Stand der Inhalte">
      <div className="kb-wrap">
        <p className="kb-contentmeta-line">
          <span>{contentMeta.standLabel}</span>
          <span className="kb-contentmeta-sep" aria-hidden="true">
            ·
          </span>
          <span>{contentMeta.responsibleLabel}</span>
        </p>
      </div>
    </section>
  );
}

/* ── 11 · Footer ─────────────────────────────────────────────────────────── */

function KluehspiesFooter() {
  return (
    <footer className="kb-footer">
      <div className="kb-wrap">
        <div className="kb-footer-grid">
          <div className="kb-footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="kb-footer-logo"
              src="/mockups/ueber-kluehspies/assets/kluehspies-logo-light.svg"
              alt="Klühspies"
              width={425}
              height={85}
              loading="lazy"
              decoding="async"
            />
            <p className="kb-footer-company">{footer.company}</p>
            <address className="kb-footer-address">
              {footer.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <p className="kb-footer-contact">
              <a href={footer.phone.href}>{footer.phone.label}</a>
              <span>{footer.fax}</span>
              <a href={footer.email.href}>{footer.email.label}</a>
            </p>
            <a
              className="kb-footer-social"
              href={footer.facebook}
              aria-label="Klühspies auf Facebook"
            >
              <IconFacebook className="kb-footer-social-icon" />
            </a>
          </div>

          {footer.columns.map((col) => (
            <nav className="kb-footer-col" key={col.heading} aria-label={col.heading}>
              {/* Bewusst kein h2: die Spaltentitel sind Navigationslabels, keine
                  Inhaltsebene. Der Landmark trägt sie über aria-label, damit die
                  Überschriftenstruktur der Seite sauber bleibt. */}
              <p className="kb-footer-heading">{col.heading.toUpperCase()}</p>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="kb-footer-bottom">
          <p className="kb-footer-copy">{footer.copyright}</p>
          <ul className="kb-footer-legal">
            {footer.legal.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

function Styles() {
  return (
    <style>{`
      /* ══ Tokens ═════════════════════════════════════════════════════════
         Klühspies-CI. Das Blau kommt aus components/kluehspies-room/data.ts
         (Brand Manual) und ist identisch mit dem Blau im echten Logo-SVG.
         Der Rest sind abgeleitete Flächen- und Linientöne aus dem Zielbild. */
      .kb {
        --kb-blue: ${KLUE.blue};
        --kb-blue-deep: #0f4c81;
        --kb-blue-tint: #e6f0fa;
        --kb-blue-wash: #f2f7fc;
        --kb-blue-line: #d9e7f4;
        --kb-ink: #10161d;
        --kb-ink-soft: #4a5763;
        --kb-line: #e8eaee;
        --kb-page: #fbfbfb;

        /* Zielbild: Inhalt nimmt rund 90 % der Viewportbreite ein. */
        --kb-gutter: clamp(20px, 4vw, 60px);
        --kb-content: 1320px;

        /* Sectionrhythmus, aus den Abständen des Referenz-PNG abgeleitet:
           dort liegen zwischen Kartenblock und nächster H2 rund 37 px bei
           841 px Bildbreite, also gut 60 px auf 1440 px. */
        --kb-section-y: clamp(40px, 4.2vw, 60px);

        background: var(--kb-page);
        color: var(--kb-ink);
        font-family: var(--font-kluehspies), "Source Sans Pro", "Source Sans 3",
          "Helvetica Neue", Arial, sans-serif;
        font-size: 16px;
        line-height: 1.65;
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
        /* Deutsche Komposita wie „Klassenfahrtanbieter" sind länger als eine
           320px-Spalte. Ohne diese Regel schiebt ein einziges Wort die Seite
           in den horizontalen Scroll. */
        overflow-wrap: break-word;
      }

      /* Die Seite animiert nichts, was Inhalt aufbaut; es gibt nur Hover- und
         Fokusübergänge. Wer Bewegung reduziert haben will, bekommt sie hier
         abgeschaltet, statt sich auf die Kürze der Übergänge zu verlassen. */
      @media (prefers-reduced-motion: reduce) {
        .kb *,
        .kb *::before,
        .kb *::after {
          transition-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
      }

      /* Rundungen: globales border-radius:0 gilt projektweit, hier bewusst
         zurückgeholt — gescoped auf .kb, damit nichts nach außen wirkt. */
      .kb .kb-r6  { border-radius: 6px !important; }
      .kb .kb-r8  { border-radius: 8px !important; }
      .kb .kb-r14 { border-radius: 14px !important; }
      .kb .kb-r18 { border-radius: 18px !important; }
      .kb .kb-round { border-radius: 50% !important; }

      .kb-wrap {
        width: min(var(--kb-content), 100% - 2 * var(--kb-gutter));
        margin-inline: auto;
      }

      /* Hier bewusst kein color:inherit. Der Selektor .kb a hätte höhere
         Spezifität als die Button-Klassen und würde deren Textfarbe schlucken;
         auf dem blauen Kontaktband ergäbe das weiße Schrift auf weißem Button.
         Der globale a-Reset in globals.css genügt. */
      .kb a { text-decoration: none; }
      .kb img { display: block; max-width: 100%; }
      .kb ul, .kb ol { list-style: none; margin: 0; padding: 0; }
      .kb address { font-style: normal; }

      /* Ein einheitlicher, gut sichtbarer Fokusring für die ganze Seite. */
      .kb a:focus-visible,
      .kb button:focus-visible {
        outline: 3px solid var(--kb-blue);
        outline-offset: 3px;
        border-radius: 4px;
      }
      .kb-contact a:focus-visible,
      .kb-footer a:focus-visible {
        outline-color: #ffffff;
      }

      /* ══ Header ═══════════════════════════════════════════════════════ */
      .kb-header { background: #ffffff; }

      .kb-servicebar { border-bottom: 1px solid var(--kb-line); }
      .kb-servicebar-row {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 26px;
        min-height: 58px;
        font-size: 15px;
      }
      .kb-service-item {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        color: var(--kb-ink-soft);
        white-space: nowrap;
      }
      .kb-service-phone { color: var(--kb-blue); font-weight: 600; }
      .kb-service-icon { width: 19px; height: 19px; color: var(--kb-blue); flex: none; }
      .kb-service-btn {
        border: 1px solid var(--kb-blue);
        color: var(--kb-blue);
        font-size: 14px;
        font-weight: 600;
        padding: 7px 20px;
        white-space: nowrap;
        transition: background-color 0.18s ease, color 0.18s ease;
      }
      .kb-service-btn:hover { background: var(--kb-blue); color: #ffffff; }

      .kb-masthead { border-bottom: 1px solid var(--kb-line); }
      .kb-masthead-row {
        display: flex;
        align-items: center;
        gap: 40px;
        min-height: 96px;
      }
      .kb-brand { flex: none; display: block; }
      .kb-brand-logo { width: 246px; height: auto; }
      .kb-brand-claim {
        display: block;
        margin-top: 5px;
        font-size: 13.5px;
        line-height: 1.3;
        color: var(--kb-ink-soft);
      }

      .kb-nav { margin-left: auto; min-width: 0; }
      .kb-nav-list { display: flex; align-items: center; gap: clamp(14px, 1.9vw, 30px); }
      .kb-nav-link {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.015em;
        color: var(--kb-ink);
        white-space: nowrap;
        padding: 6px 0;
        border-bottom: 2px solid transparent;
        transition: color 0.18s ease, border-color 0.18s ease;
      }
      .kb-nav-link:hover { color: var(--kb-blue); border-bottom-color: var(--kb-blue); }
      .kb-nav-chevron { width: 13px; height: 13px; flex: none; }

      /* ══ Breadcrumb ═══════════════════════════════════════════════════ */
      .kb-breadcrumb-shell { background: #ffffff; }
      .kb-breadcrumb {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 17px 0 15px;
        font-size: 15px;
        color: var(--kb-ink-soft);
      }
      .kb-breadcrumb li { display: inline-flex; align-items: center; }
      .kb-crumb-home { color: var(--kb-blue); display: inline-flex; }
      .kb-crumb-icon { width: 20px; height: 20px; }
      .kb-crumb-sep { width: 13px; height: 13px; color: #9aa5b0; }

      /* ══ Hero ═════════════════════════════════════════════════════════
         Foto liegt rechts und läuft bis zur Fensterkante. Der weiße Verlauf
         darüber gibt dem Text links die Ruhe, ohne ihn in einen Kasten zu
         sperren — genau die Komposition des Zielbilds. */
      .kb-hero { position: relative; background: #ffffff; isolation: isolate; }
      .kb-hero-media {
        position: absolute;
        inset: 0 0 0 33%;
        z-index: 0;
      }
      .kb-hero-media img { width: 100%; height: 100%; object-fit: cover; object-position: 52% 38%; }
      /* Der Verlauf beginnt jetzt mit einer deckenden Zone statt sofort
         abzufallen. Der Textblock links kann je nach Fensterbreite bis in die
         ersten Prozent der Bildfläche hineinragen; dort stand er vorher auf
         einem zu 97 % deckenden Weiß, der Kontrast hing also an der Bildstelle
         darunter. Mit der deckenden Zone ist er unabhängig vom Motiv. */
      .kb-hero-veil {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          #ffffff 0%,
          #ffffff 20%,
          rgba(255, 255, 255, 0.72) 40%,
          rgba(255, 255, 255, 0.18) 66%,
          rgba(255, 255, 255, 0) 86%
        );
      }
      .kb-hero-inner { position: relative; z-index: 1; padding: 46px 0 58px; }
      /* Die Textspalte endet im Zielbild bei rund 35 % der Fensterbreite. Die
         Buttonzeile darf breiter laufen als der Fließtext, sonst bricht sie
         um — im Zielbild stehen beide CTAs nebeneinander. */
      .kb-hero-copy { max-width: 600px; }

      /* Die H1 trägt beide Zeilen. Damit die Optik des Zielbilds erhalten
         bleibt, setzt die erste Zeile die frühere Eyebrow-Typo fort; die
         Titelgröße lebt auf der zweiten Zeile. Ein Blockelement je Zeile
         ersetzt das frühere br und braucht keine Mobil-Ausnahme. */
      .kb-h1 {
        margin: 0;
        max-width: 540px;
        font-weight: 700;
        letter-spacing: -0.015em;
        color: var(--kb-ink);
      }
      .kb-h1-lead {
        display: block;
        font-size: 17px;
        font-weight: 600;
        line-height: 1.3;
        letter-spacing: 0;
        color: var(--kb-blue);
      }
      .kb-h1-main {
        display: block;
        margin-top: 18px;
        font-size: clamp(33px, 3.45vw, 50px);
        line-height: 1.12;
      }
      .kb-hero-lead {
        margin: 0;
        max-width: 445px;
        font-size: 17px;
        line-height: 1.7;
        color: var(--kb-ink-soft);
      }
      .kb-h1 + .kb-hero-lead { margin-top: 26px; }
      .kb-hero-lead + .kb-hero-lead { margin-top: 14px; }

      .kb-hero-actions { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 34px; }
      /* Mikrotext unter der Buttonzeile: kleiner als der Fließtext, aber mit
         demselben Textton. 14px auf Weiß ergibt 7,4:1 und bleibt damit auch
         als Kleintext deutlich über der Anforderung. */
      .kb-hero-note {
        margin: 14px 0 0;
        max-width: 52ch;
        font-size: 14px;
        line-height: 1.55;
        color: var(--kb-ink-soft);
      }

      /* ══ Buttons und Links ════════════════════════════════════════════ */
      .kb-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 11px;
        min-height: 58px;
        padding: 0 28px;
        font-family: inherit;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.2;
        border: 1.5px solid transparent;
        transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
      }
      .kb-btn-icon { width: 22px; height: 22px; flex: none; }
      .kb-btn-icon-lead { margin-left: -2px; }

      .kb-btn-primary { background: var(--kb-blue); color: #ffffff; }
      .kb-btn-primary:hover { background: var(--kb-blue-deep); }

      .kb-btn-outline {
        background: #ffffff;
        color: var(--kb-blue);
        border-color: var(--kb-blue);
      }
      .kb-btn-outline:hover { background: var(--kb-blue-tint); }

      .kb-btn-onblue { background: #ffffff; color: var(--kb-blue); }
      .kb-btn-onblue:hover { background: var(--kb-blue-tint); }

      /* Rand bei 0,6 Alpha lag auf dem Klühspies-Blau bei 2,7:1 und damit unter
         den 3:1, die eine Bedienelement-Begrenzung braucht. 0,85 ergibt 3,7:1. */
      .kb-btn-ghost { color: #ffffff; border-color: rgba(255, 255, 255, 0.85); }
      .kb-btn-ghost:hover { background: rgba(255, 255, 255, 0.14); border-color: #ffffff; }

      .kb-textlink {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        font-weight: 600;
        color: var(--kb-blue);
        text-decoration: underline;
        text-underline-offset: 4px;
        text-decoration-thickness: 1px;
      }
      .kb-textlink-icon { width: 19px; height: 19px; flex: none; }

      .kb-cardlink {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        font-family: inherit;
        font-size: 15px;
        font-weight: 600;
        color: var(--kb-blue);
        background: none;
        border: 0;
        padding: 0;
        text-decoration: underline;
        text-underline-offset: 4px;
        text-decoration-thickness: 1px;
      }
      .kb-cardlink-icon { width: 17px; height: 17px; flex: none; }

      /* CTAs ohne freigegebene Ziel-URL: identische Optik, klar markiert. */
      .kb-mockcta { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
      .kb-mockcta-inline { align-items: center; }
      .kb-mockcta-note {
        margin: 0;
        max-width: 46ch;
        font-size: 13px;
        line-height: 1.5;
        color: var(--kb-ink-soft);
        border-left: 2px solid var(--kb-blue);
        padding-left: 10px;
        text-align: left;
      }

      /* ══ Trust Bar ════════════════════════════════════════════════════ */
      .kb-trustbar-shell { padding-top: 30px; }
      .kb-trustbar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        background: #ffffff;
        border: 1px solid var(--kb-line);
        box-shadow: 0 2px 14px rgba(16, 22, 29, 0.04);
        padding: 48px 40px;
      }
      .kb-stat { display: flex; align-items: center; gap: 20px; }
      .kb-stat-badge {
        flex: none;
        width: 74px;
        height: 74px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--kb-blue-tint);
        color: var(--kb-blue);
      }
      .kb-stat-icon { width: 38px; height: 38px; }
      .kb-stat-text { display: flex; flex-direction: column; min-width: 0; }
      .kb-stat-value {
        font-size: clamp(19px, 1.7vw, 24px);
        font-weight: 700;
        line-height: 1.2;
        color: var(--kb-ink);
      }
      .kb-stat-label { font-size: 16px; line-height: 1.4; color: var(--kb-ink-soft); }

      /* Fließtext-Anker unter der Kachelreihe. Ruhiger gesetzt als der Rest,
         damit er die Kacheln stützt statt mit ihnen zu konkurrieren. */
      .kb-trustbar-anchor {
        margin: 22px auto 0;
        max-width: 88ch;
        text-align: center;
        font-size: 16.5px;
        line-height: 1.7;
        color: var(--kb-ink-soft);
      }

      /* ══ Sections ═════════════════════════════════════════════════════ */
      .kb-section { padding-top: var(--kb-section-y); }
      .kb-h2 {
        margin: 0;
        text-align: center;
        font-size: clamp(25px, 2.4vw, 34px);
        font-weight: 700;
        line-height: 1.24;
        letter-spacing: -0.01em;
        color: var(--kb-ink);
      }
      .kb-h2-left { text-align: left; }
      .kb-h2-light { color: #ffffff; }
      .kb-section-lead {
        margin: 16px auto 0;
        max-width: 74ch;
        text-align: center;
        font-size: 16.5px;
        line-height: 1.65;
        color: var(--kb-ink-soft);
      }
      .kb-h2 + .kb-grid-4,
      .kb-h2 + .kb-grid-5,
      .kb-h2 + .kb-grid-3 { margin-top: 30px; }
      .kb-section-lead + .kb-grid-4,
      .kb-section-lead + .kb-grid-5,
      .kb-section-lead + .kb-grid-3 { margin-top: 32px; }

      .kb-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
      .kb-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

      /* Fünf Karten als 3 + 2 mit zentrierter zweiter Reihe. Sechs Spalten,
         jede Karte über zwei: dann lässt sich die zweite Reihe um eine halbe
         Kartenbreite einrücken, ohne die Kartenbreite zu verändern. */
      .kb-grid-5 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
      .kb-grid-5 > * { grid-column: span 2; }
      .kb-grid-5 > :nth-child(4) { grid-column: 2 / span 2; }
      .kb-grid-5 > :nth-child(5) { grid-column: 4 / span 2; }

      /* ══ Cards ════════════════════════════════════════════════════════ */
      .kb-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        background: #ffffff;
        border: 1px solid var(--kb-line);
        box-shadow: 0 2px 14px rgba(16, 22, 29, 0.035);
        padding: 34px 22px 30px;
      }
      .kb-card-badge {
        width: 106px;
        height: 106px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--kb-blue-tint);
        color: var(--kb-blue);
      }
      .kb-card-icon { width: 51px; height: 51px; }
      .kb-h3 {
        margin: 24px 0 0;
        font-size: clamp(16.5px, 1.3vw, 18.5px);
        font-weight: 700;
        line-height: 1.32;
        color: var(--kb-ink);
      }
      .kb-card-text {
        margin: 12px 0 0;
        font-size: 15.5px;
        line-height: 1.6;
        color: var(--kb-ink-soft);
      }
      .kb-card .kb-cardlink,
      .kb-card .kb-mockcta { margin-top: auto; padding-top: 22px; }

      .kb-card-seal { padding-top: 26px; }
      .kb-seal {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 118px;
        width: 100%;
      }
      .kb-seal img { max-height: 100%; width: auto; object-fit: contain; }
      .kb-h3-seal { margin-top: 18px; font-size: clamp(16px, 1.22vw, 17.5px); }

      /* ══ Best-Fit Mini Cards ══════════════════════════════════════════ */
      .kb-fit {
        display: flex;
        align-items: center;
        gap: 18px;
        background: #ffffff;
        border: 1px solid var(--kb-line);
        box-shadow: 0 2px 14px rgba(16, 22, 29, 0.035);
        padding: 22px 26px;
      }
      .kb-fit-check { width: 38px; height: 38px; flex: none; color: var(--kb-blue); }
      .kb-fit-text { font-size: 16px; line-height: 1.5; color: var(--kb-ink); }

      /* ══ Vergleichs-Teaser ════════════════════════════════════════════ */
      .kb-section-compare { padding-bottom: var(--kb-section-y); }
      .kb-compare {
        display: grid;
        grid-template-columns: 0.92fr 1.08fr;
        align-items: center;
        gap: 40px;
        width: min(100%, 1120px);
        margin-inline: auto;
        background: var(--kb-blue-wash);
        border: 1px solid var(--kb-blue-line);
        padding: 34px 52px 34px 34px;
      }
      .kb-compare-visual { display: flex; justify-content: center; }
      .kb-compare-illu { width: 100%; max-width: 400px; height: auto; }
      .kb-compare-text {
        margin: 16px 0 0;
        max-width: 58ch;
        font-size: 16.5px;
        line-height: 1.65;
        color: var(--kb-ink-soft);
      }
      .kb-compare-criteria {
        display: grid;
        gap: 10px;
        margin-top: 20px;
      }
      .kb-compare-criteria li {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        line-height: 1.45;
        color: var(--kb-ink);
      }
      .kb-compare-check { width: 22px; height: 22px; flex: none; color: var(--kb-blue); }
      .kb-compare-copy .kb-mockcta { margin-top: 28px; }

      /* ══ Kontakt-CTA ══════════════════════════════════════════════════ */
      .kb-contact {
        position: relative;
        background: var(--kb-blue);
        color: #ffffff;
        overflow: hidden;
      }
      /* Punktraster links — dekorativ, greift das Zielbild auf. */
      .kb-contact-dots {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 190px;
        background-image: radial-gradient(rgba(255, 255, 255, 0.22) 1.6px, transparent 1.7px);
        background-size: 13px 13px;
        -webkit-mask-image: linear-gradient(90deg, #000 0%, transparent 100%);
        mask-image: linear-gradient(90deg, #000 0%, transparent 100%);
        pointer-events: none;
      }
      /* Im Zielbild ist die Kontaktgruppe nicht linksbündig, sondern als
         Einheit in der Fläche zentriert: das Porträt beginnt deutlich weiter
         innen als der übrige Seiteninhalt. */
      .kb-contact-inner {
        position: relative;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: clamp(36px, 7.5vw, 118px);
        /* max-width, nicht width: die Klasse sitzt auf demselben Element wie
           .kb-wrap, und ein width würde dessen Gutter überschreiben. So bleibt
           der Seitenrand auf schmalen Schirmen erhalten. */
        max-width: 990px;
        margin-inline: auto;
        padding: 18px 0 32px;
      }
      .kb-person { margin: 0; display: flex; flex-direction: column; align-items: center; }
      /* Kein overflow:hidden auf dem Rahmen — das würde das Chat-Abzeichen
         am Rand abschneiden. Der Kreis entsteht am Bild selbst. */
      .kb-person-frame {
        position: relative;
        width: 248px;
        height: 248px;
      }
      .kb-person-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border: 4px solid rgba(255, 255, 255, 0.92);
      }
      .kb-person-badge {
        position: absolute;
        right: 2px;
        bottom: 20px;
        width: 54px;
        height: 54px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--kb-blue);
        border: 2px solid #ffffff;
        color: #ffffff;
      }
      .kb-person-badge-icon { width: 26px; height: 26px; }
      .kb-person-caption { margin-top: 14px; text-align: center; line-height: 1.35; }
      .kb-person-name { display: block; font-size: 15.5px; font-weight: 700; }
      /* Weiß mit Alpha lag auf dem Klühspies-Blau zwischen 3,9:1 und 4,3:1 und
         damit unter den 4,5:1 für Fließtext. Volles Weiß ergibt 4,7:1. Die
         Transparenz war reine Abstufung und ist als Hierarchiemittel durch
         Schriftgrad und Gewicht ersetzt. Gilt für alle Texte auf Blau. */
      .kb-person-role { display: block; font-size: 15px; color: #ffffff; }

      .kb-contact-text {
        margin: 16px 0 0;
        max-width: 52ch;
        font-size: 17px;
        line-height: 1.65;
        color: #ffffff;
      }
      .kb-contact-actions { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 30px; }
      .kb-contact-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px 12px;
        margin: 18px 0 0;
        font-size: 15px;
        line-height: 1.5;
        color: #ffffff;
      }
      .kb-contact-meta-sep { opacity: 0.7; }
      .kb-contact-mail {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #ffffff;
        text-decoration: underline;
        text-underline-offset: 4px;
        text-decoration-thickness: 1px;
      }
      .kb-contact-mail-icon { width: 18px; height: 18px; flex: none; }

      /* ══ Aktualitätssignal ════════════════════════════════════════════ */
      .kb-contentmeta { background: var(--kb-page); }
      .kb-contentmeta-line {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 10px;
        margin: 0;
        padding: 22px 0 26px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--kb-ink-soft);
      }
      .kb-contentmeta-sep { color: #9aa5b0; }

      /* ══ Footer ═══════════════════════════════════════════════════════ */
      /* Der Footer im Zielbild ist deutlich dichter gesetzt als der Rest der
         Seite: kleinerer Grad, enge Zeilen, wenig Luft. Deshalb hier eine
         eigene, kompaktere Typo statt der Seitenwerte. */
      .kb-footer {
        background: var(--kb-blue);
        color: #ffffff;
        border-top: 1px solid rgba(255, 255, 255, 0.22);
        font-size: 14px;
        line-height: 1.42;
      }
      .kb-footer-grid {
        display: grid;
        grid-template-columns: 1.05fr 1fr 1fr 1fr;
        gap: 40px;
        padding: 14px 0 16px;
      }
      .kb-footer-logo { width: 162px; height: auto; }
      .kb-footer-company { margin: 12px 0 0; font-weight: 700; }
      .kb-footer-address { display: flex; flex-direction: column; }
      .kb-footer-contact {
        margin: 13px 0 0;
        display: flex;
        flex-direction: column;
      }
      .kb-footer-contact a:hover { text-decoration: underline; }
      .kb-footer-social { display: inline-flex; margin-top: 12px; color: #ffffff; }
      .kb-footer-social-icon { width: 24px; height: 24px; }

      .kb-footer-heading {
        margin: 0 0 13px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.04em;
      }
      .kb-footer-col li + li { margin-top: 6px; }
      .kb-footer-col a { color: #ffffff; }
      .kb-footer-col a:hover { text-decoration: underline; }

      .kb-footer-bottom {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px 44px;
        padding: 10px 0 14px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 13px;
      }
      .kb-footer-copy { margin: 0; color: #ffffff; }
      .kb-footer-legal { display: flex; flex-wrap: wrap; gap: 30px; margin-inline: auto; }
      .kb-footer-legal a { color: #ffffff; }
      .kb-footer-legal a:hover { text-decoration: underline; }

      /* ══ Responsive ═══════════════════════════════════════════════════ */

      /* Laptop: Navigation wird schmaler, bevor sie umbricht. */
      @media (max-width: 1280px) {
        .kb-brand-logo { width: 214px; }
        .kb-nav-link { font-size: 12px; }
        .kb-trustbar { padding: 30px 30px; gap: 16px; }
        .kb-stat { gap: 15px; }
        .kb-stat-badge { width: 64px; height: 64px; }
        .kb-stat-icon { width: 33px; height: 33px; }
        .kb-card-badge { width: 100px; height: 100px; }
        .kb-card-icon { width: 48px; height: 48px; }
      }

      /* Tablet: Header stapelt, Navigation wird zur Scrollleiste, alle
         Vierergrids werden 2x2. */
      @media (max-width: 1023px) {
        .kb-masthead-row {
          flex-direction: column;
          align-items: stretch;
          gap: 0;
          padding: 18px 0 0;
          min-height: 0;
        }
        .kb-brand { align-self: flex-start; }
        /* Statt einer nicht funktionierenden Hamburger-Attrappe bleibt die
           Navigation echt und wird zur Scrollleiste. Die weiche Kante rechts
           zeigt an, dass es weitergeht. Gleiches Muster wie die Bereichsleiste
           im SEESZN-Raum. */
        .kb-nav {
          margin-left: 0;
          margin-top: 16px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          -webkit-mask-image: linear-gradient(90deg, #000 88%, transparent 100%);
          mask-image: linear-gradient(90deg, #000 88%, transparent 100%);
        }
        .kb-nav::-webkit-scrollbar { display: none; }
        .kb-nav-list { gap: 22px; padding-bottom: 10px; }
        .kb-nav-link { flex: none; }

        .kb-hero-media { inset: auto; position: relative; height: 300px; }
        .kb-hero-veil { display: none; }
        .kb-hero-inner { padding: 34px 0 46px; }
        .kb-hero-copy, .kb-hero-lead { max-width: 62ch; }

        .kb-trustbar { grid-template-columns: repeat(2, 1fr); gap: 24px 20px; }
        .kb-grid-4 { grid-template-columns: repeat(2, 1fr); }
        .kb-grid-3 { grid-template-columns: 1fr; }
        /* Zweispaltig braucht die fünfte Karte keine Einrückung mehr: vier
           Karten füllen zwei Reihen, die fünfte steht allein und links. */
        .kb-grid-5 { grid-template-columns: repeat(4, 1fr); }
        .kb-grid-5 > :nth-child(4) { grid-column: span 2; }
        .kb-grid-5 > :nth-child(5) { grid-column: span 2; }

        .kb-compare {
          grid-template-columns: 1fr;
          gap: 26px;
          padding: 30px;
          width: 100%;
        }
        .kb-compare-illu { max-width: 340px; }

        .kb-contact-inner {
          grid-template-columns: 1fr;
          justify-items: center;
          text-align: center;
          gap: 30px;
          padding: 44px 0 50px;
        }
        .kb-h2-left { text-align: center; }
        /* justify-items:center zentriert das Porträt; die Textspalte soll
           trotzdem die volle Breite behalten, damit die CTAs sauber am
           Seitenrand ausgerichtet bleiben. */
        .kb-contact-copy { width: 100%; }
        .kb-contact-text { margin-inline: auto; }
        .kb-contact-actions { justify-content: center; }
        .kb-mockcta { align-items: center; }
        .kb-mockcta-note { text-align: center; border-left: 0; padding-left: 0; }

        .kb-footer-grid { grid-template-columns: 1fr 1fr; gap: 34px; }
        .kb-footer-brand { grid-column: 1 / -1; }
      }

      /* Mobil: alles einspaltig, Buttons volle Breite, nichts läuft über. */
      @media (max-width: 640px) {
        .kb-servicebar-row {
          justify-content: space-between;
          gap: 12px;
          min-height: 50px;
        }
        .kb-service-item:not(.kb-service-phone) { display: none; }
        .kb-service-phone { font-size: 14.5px; }

        .kb-brand-logo { width: 178px; }
        .kb-brand-claim { font-size: 12.5px; }

        .kb-hero-media { height: 218px; }
        .kb-hero-inner { padding: 28px 0 40px; }
        .kb-h1-lead { font-size: 16px; }
        .kb-h1-main { margin-top: 14px; }
        .kb-h1 + .kb-hero-lead { margin-top: 20px; }
        .kb-hero-lead { font-size: 16.5px; }
        .kb-hero-actions { flex-direction: column; align-items: stretch; gap: 12px; margin-top: 28px; }
        .kb-hero-actions .kb-mockcta { align-items: stretch; }
        .kb-btn { width: 100%; min-height: 56px; padding: 0 20px; }

        /* Tap-Ziele auf mindestens 44px. Betrifft die Textlinks, die auf dem
           Desktop nur so hoch sind wie ihre Zeile: Navigation, Footer-Spalten,
           Rechtszeile, Breadcrumb-Home und der Mail-Link im Kontaktband. Die
           Vergrößerung passiert über Padding, damit Schriftgrad, Farbe und
           Abstände des Entwurfs unverändert bleiben. */
        .kb-nav-link { padding: 12px 0; }
        .kb-nav-list { gap: 18px; padding-bottom: 4px; }
        .kb-footer-col a,
        .kb-footer-legal a,
        .kb-footer-contact a {
          display: inline-block;
          padding: 12px 0;
        }
        .kb-footer-col li + li { margin-top: 0; }
        .kb-footer-heading { margin-bottom: 4px; }
        .kb-footer-legal { gap: 4px 22px; }
        .kb-crumb-home { padding: 12px 8px 12px 0; }
        .kb-contact-mail { padding: 11px 0; }
        .kb-service-btn { padding: 12px 16px; }

        .kb-trustbar { grid-template-columns: 1fr; gap: 20px; padding: 24px 22px; }
        .kb-stat-badge { width: 58px; height: 58px; }
        .kb-stat-icon { width: 30px; height: 30px; }

        .kb-grid-4 { grid-template-columns: 1fr; gap: 16px; }
        .kb-grid-5 { grid-template-columns: 1fr; gap: 16px; }
        .kb-grid-5 > *,
        .kb-grid-5 > :nth-child(4),
        .kb-grid-5 > :nth-child(5) { grid-column: auto; }
        .kb-card { padding: 32px 22px 28px; }
        .kb-card-badge { width: 92px; height: 92px; }
        .kb-card-icon { width: 45px; height: 45px; }
        .kb-h3 { margin-top: 22px; }

        .kb-seal { height: 92px; }
        .kb-fit { padding: 18px 20px; gap: 14px; }

        .kb-compare { padding: 24px 22px; }
        .kb-compare-copy .kb-btn { width: 100%; }

        .kb-person-frame { width: 190px; height: 190px; }
        .kb-person-badge { width: 48px; height: 48px; bottom: 8px; }
        /* Einspaltig läuft der Text über die volle Breite: das Punktraster
           läge dann hinter der Schrift und nimmt Kontrast. */
        .kb-contact-dots { display: none; }

        .kb-footer-grid { grid-template-columns: 1fr; gap: 30px; padding: 38px 0 32px; }
        .kb-footer-brand { grid-column: auto; }
        .kb-footer-bottom { flex-direction: column; align-items: flex-start; gap: 14px; }
        .kb-footer-legal { margin-inline: 0; }
      }
    `}</style>
  );
}
