import Image from "next/image";
import Link from "next/link";
import { de } from "@/lib/case-studies/de";
import { en as enCase } from "@/lib/case-studies/en";

// ─── Ergebnis-Archiv ─────────────────────────────────────────────────────────
// Eine öffentliche Case Study, präsentiert als ein Eintrag in einem Register
// statt als Portfolio-Raster mit einer einzelnen einsamen Karte. Keine
// Platzhalter, kein "coming soon": das Register nennt seine Anzahl, und der
// eine Eintrag bekommt die volle Breite.
//
// Die künftige Übersichtsseite liegt unter /case-studies/. Solange sie nicht
// existiert, bleibt dieses Register die Einstiegsseite hinter "Ergebnisse".

const COPY = {
  de: {
    eyebrow: "Case Studies",
    title: "Ergebnisse",
    lede: "Eine öffentlich dokumentierte Case Study. Ausgangslage, Maßnahmen, Ergebnis und Messaufbau sind nachlesbar; der Kunde bleibt anonym.",
    registerLeft: "Öffentliches Register",
    registerRight: "01 Eintrag",
    action: "Case Study ansehen",
    entryTitle: "Tourismus",
    entryMeta: [
      { key: "Disziplin", value: "SEO · AIO · Technical SEO" },
      { key: "Markt", value: "DACH" },
      { key: "Ergebnis", value: `Ø ${de.result.from.value} → Ø ${de.result.to.value} in AI Search` },
      { key: "Zeitraum", value: de.result.daysLabel },
    ],
  },
  en: {
    eyebrow: "Case Studies",
    title: "Results",
    lede: "One publicly documented case study. Starting position, interventions, outcome and measurement setup are all on the record. The client stays anonymous.",
    registerLeft: "Public register",
    registerRight: "01 entry",
    action: "View case study",
    entryTitle: "Tourism",
    entryMeta: [
      { key: "Discipline", value: "SEO · AIO · Technical SEO" },
      { key: "Market", value: "DACH" },
      { key: "Outcome", value: `Avg. ${enCase.result.from.value} → ${enCase.result.to.value} in AI Search` },
      { key: "Window", value: enCase.result.daysLabel },
    ],
  },
} as const;

export default function Archive({ locale = "de" }: { locale?: "de" | "en" }) {
  const c = COPY[locale];
  const study = locale === "de" ? de : enCase;

  return (
    <div className="wa-root">
      <header className="wa-head">
        <p className="wa-eyebrow">
          <span>{c.eyebrow}</span>
          <span>SEESZN</span>
        </p>
        <h1 className="wa-title">{c.title}</h1>
        <p className="wa-lede">{c.lede}</p>
      </header>

      <p className="wa-register">
        <span>{c.registerLeft}</span>
        <span>{c.registerRight}</span>
      </p>

      <Link href={study.path} className="wa-entry">
        <div className="wa-entry-text">
          <p className="wa-index">01</p>
          <h2 className="wa-entry-title">{c.entryTitle}</h2>

          <dl className="wa-meta">
            {c.entryMeta.map((m) => (
              <div key={m.key}>
                <dt>{m.key}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>

          <span className="wa-action">
            {c.action}
            <span className="wa-arrow" aria-hidden="true">→</span>
          </span>
        </div>

        <div className="wa-entry-media">
          <Image
            src={study.hero.image.src}
            alt=""
            aria-hidden="true"
            width={study.hero.image.width}
            height={study.hero.image.height}
            sizes="(max-width: 900px) 100vw, 42vw"
            priority
            className="wa-img"
          />
        </div>
      </Link>

      <style>{`
        .wa-root {
          --wa-gutter: var(--gutter);
          background: var(--paper);
          padding-top: clamp(96px, 11vw, 152px);
        }

        /* ── Head ──────────────────────────────────────────── */
        .wa-head { padding: 0 var(--wa-gutter); }
        .wa-eyebrow {
          display: flex;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--line);
          font-family: var(--font-mono), monospace;
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .wa-title {
          margin-top: clamp(24px, 2.6vw, 40px);
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(46px, 7.4vw, 112px);
          line-height: 0.92;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .wa-lede {
          margin-top: clamp(20px, 2.2vw, 30px);
          max-width: 52ch;
          font-family: var(--font-body), sans-serif;
          font-size: 14px;
          line-height: 1.72;
          color: var(--text-body);
        }

        .wa-register {
          display: flex;
          justify-content: space-between;
          margin: clamp(48px, 5.4vw, 84px) var(--wa-gutter) 0;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        /* ── The entry ─────────────────────────────────────── */
        .wa-entry {
          display: grid;
          grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
          align-items: stretch;
          border-bottom: 1px solid var(--line);
        }
        .wa-entry-text {
          padding: clamp(34px, 3.8vw, 58px) clamp(24px, 3vw, 48px)
                   clamp(34px, 3.8vw, 58px) var(--wa-gutter);
          min-width: 0;
        }
        .wa-index {
          font-family: var(--font-mono), monospace;
          font-size: 9.5px;
          letter-spacing: 0.18em;
          color: var(--text-muted);
        }
        .wa-entry-title {
          margin-top: clamp(10px, 1.2vw, 18px);
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(48px, 7vw, 108px);
          line-height: 0.9;
          letter-spacing: -0.028em;
          color: var(--ink-strong);
        }

        .wa-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px clamp(20px, 2.4vw, 40px);
          margin-top: clamp(26px, 2.8vw, 42px);
          max-width: 500px;
        }
        .wa-meta dt {
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-faint);
        }
        .wa-meta dd {
          margin-top: 4px;
          font-family: var(--font-body), sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: var(--text-body);
        }

        .wa-action {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: clamp(28px, 3vw, 44px);
          padding-bottom: 4px;
          border-bottom: 1px solid var(--olive);
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.17em;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .wa-arrow {
          color: var(--olive);
          transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .wa-entry:hover .wa-arrow,
        .wa-entry:focus-visible .wa-arrow { transform: translateX(5px); }
        .wa-entry:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: -1px; }

        .wa-entry-media {
          position: relative;
          overflow: hidden;
          /* min-height on the in-flow cell; the image fills it absolutely so the
             photograph never sets the row height from its own intrinsic ratio. */
          min-height: clamp(300px, 33vw, 470px);
        }
        .wa-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* A strong crop: the rock stack, not the whole postcard. */
          object-position: 32% 44%;
          display: block;
          transform: scale(1.02);
          transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .wa-entry:hover .wa-img { transform: scale(1.05); }

        @media (max-width: 900px) {
          .wa-entry { grid-template-columns: minmax(0, 1fr); }
          .wa-entry-media { order: -1; min-height: 0; aspect-ratio: 3 / 2; }
          .wa-entry-text { padding: clamp(28px, 7vw, 44px) var(--wa-gutter); }
          .wa-meta { grid-template-columns: minmax(0, 1fr); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wa-arrow, .wa-img { transition: none; }
          .wa-entry:hover .wa-img { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
