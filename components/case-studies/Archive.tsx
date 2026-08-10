import Image from "next/image";
import Link from "next/link";
import { de } from "@/lib/case-studies/de";
import { en as enCase } from "@/lib/case-studies/en";
import {
  FB_FIGURES,
  FB_HERO_IMAGE,
  FB_PATH,
} from "@/lib/case-studies/french-beret";

// ─── Ergebnis-Register ───────────────────────────────────────────────────────
// Ein Register, kein Portfolio-Raster. Die drei Einträge tragen die strategische
// Logik im Label statt in einem erklärenden Absatz:
//
//   BUILD      ein System von Grund auf bauen
//   TRANSFORM  ein bestehendes System verbessern
//   SCALE      ein funktionierendes System skalieren
//
// Ein Eintrag ohne veröffentlichte Detailseite wird als solcher ausgewiesen und
// ist kein Link. Er bekommt auch keine Kennzahlen: was nicht dokumentiert ist,
// steht hier nicht.
//
// Die englische Fassung führt nur die eine englisch veröffentlichte Case Study.
// Ein Register, das auf deutschsprachige Seiten verweist, wäre ein Versprechen,
// das die englische Oberfläche nicht einlöst.

interface Entry {
  id: string;
  index: string;
  discipline: string;
  title: string;
  meta: { key: string; value: string }[];
  href?: string;
  status?: string;
  image?: { src: string; width: number; height: number };
  /** Bildausschnitt, wenn das Motiv nicht mittig sitzt. */
  focus?: string;
}

const COPY = {
  de: {
    eyebrow: "Case Studies",
    title: "Ergebnisse",
    lede: "Drei dokumentierte Case Studies aus SEO, AI Search, E-Commerce und Google Ads. Ausgangslage, Maßnahmen, Ergebnisse und Messmethodik werden nachvollziehbar offengelegt. Wo Kunden nicht genannt werden können, kennzeichnen wir das transparent.",
    disciplines: "SEO · AI Search · E-Commerce · Google Ads",
    registerLeft: "Öffentliches Register",
    action: "Case Study ansehen",
    counter: (n: number) => `0${n} Case Studies`,
  },
  en: {
    eyebrow: "Case Studies",
    title: "Results",
    lede: "One publicly documented case study. Starting position, interventions, outcome and measurement setup are all on the record. The client stays anonymous.",
    disciplines: "SEO · AI Search · Technical SEO",
    registerLeft: "Public register",
    action: "View case study",
    counter: (n: number) => `0${n} ${n === 1 ? "entry" : "entries"}`,
  },
} as const;

const DE_ENTRIES: Entry[] = [
  {
    id: "build",
    index: "01",
    discipline: "Build",
    title: "French Beret",
    href: FB_PATH,
    meta: [
      { key: "Disziplin", value: "SEO · E-Commerce · Search Architecture" },
      { key: "Ergebnis", value: `${FB_FIGURES.clicks} organische Klicks in ${FB_FIGURES.windowMonthsIn}` },
      { key: "Impressionen", value: `${FB_FIGURES.impressionsShort} in Google` },
      { key: "Ø Position", value: FB_FIGURES.position },
    ],
    image: {
      src: FB_HERO_IMAGE.src,
      width: FB_HERO_IMAGE.width,
      height: FB_HERO_IMAGE.height,
    },
    focus: "50% 54%",
  },
  {
    id: "transform",
    index: "02",
    discipline: "Transform",
    title: "Tourismus",
    href: de.path,
    meta: [
      { key: "Disziplin", value: "SEO · AIO · Technical SEO" },
      { key: "Markt", value: "DACH" },
      { key: "Ergebnis", value: `Ø ${de.result.from.value} → Ø ${de.result.to.value} in AI Search` },
      { key: "Zeitraum", value: de.result.daysLabel },
    ],
    image: {
      src: de.hero.image.src,
      width: de.hero.image.width,
      height: de.hero.image.height,
    },
    focus: "32% 44%",
  },
  {
    id: "scale",
    index: "03",
    discipline: "Scale",
    title: "B2B Workspace",
    status: "Coming soon",
    meta: [
      { key: "Disziplin", value: "Google Ads · Paid Acquisition · Scale" },
      { key: "Kunde", value: "Anonymisiert" },
    ],
  },
];

const EN_ENTRIES: Entry[] = [
  {
    id: "transform",
    index: "01",
    discipline: "Transform",
    title: "Tourism",
    href: enCase.path,
    meta: [
      { key: "Discipline", value: "SEO · AIO · Technical SEO" },
      { key: "Market", value: "DACH" },
      { key: "Outcome", value: `Avg. ${enCase.result.from.value} → ${enCase.result.to.value} in AI Search` },
      { key: "Window", value: enCase.result.daysLabel },
    ],
    image: {
      src: enCase.hero.image.src,
      width: enCase.hero.image.width,
      height: enCase.hero.image.height,
    },
    focus: "32% 44%",
  },
];

function EntryBody({
  entry,
  action,
  eager,
}: {
  entry: Entry;
  action: string;
  eager: boolean;
}) {
  return (
    <>
      <div className="wa-entry-text">
        <p className="wa-index">
          <span>{entry.index}</span>
          <span aria-hidden="true">·</span>
          <b>{entry.discipline}</b>
        </p>
        <h2 className="wa-entry-title">{entry.title}</h2>

        <dl className="wa-meta">
          {entry.meta.map((m) => (
            <div key={m.key}>
              <dt>{m.key}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>

        {entry.href ? (
          <span className="wa-action">
            {action}
            <span className="wa-arrow" aria-hidden="true">→</span>
          </span>
        ) : (
          <span className="wa-status">{entry.status}</span>
        )}
      </div>

      {entry.image ? (
        <div className="wa-entry-media">
          <Image
            src={entry.image.src}
            alt=""
            aria-hidden="true"
            width={entry.image.width}
            height={entry.image.height}
            sizes="(max-width: 900px) 100vw, 42vw"
            priority={eager}
            loading={eager ? undefined : "lazy"}
            className="wa-img"
            style={entry.focus ? { objectPosition: entry.focus } : undefined}
          />
        </div>
      ) : null}
    </>
  );
}

export default function Archive({ locale = "de" }: { locale?: "de" | "en" }) {
  const c = COPY[locale];
  const entries = locale === "de" ? DE_ENTRIES : EN_ENTRIES;

  return (
    <div className="wa-root">
      <header className="wa-head">
        <p className="wa-eyebrow">
          <span>{c.eyebrow}</span>
          <span>SEESZN</span>
        </p>
        <h1 className="wa-title">{c.title}</h1>
        <p className="wa-lede">{c.lede}</p>
        <p className="wa-disciplines">{c.disciplines}</p>
      </header>

      <p className="wa-register">
        <span>{c.registerLeft}</span>
        <span>{c.counter(entries.length)}</span>
      </p>

      {entries.map((entry, i) =>
        entry.href ? (
          <Link key={entry.id} href={entry.href} className="wa-entry">
            <EntryBody entry={entry} action={c.action} eager={i === 0} />
          </Link>
        ) : (
          <div key={entry.id} className="wa-entry wa-entry-quiet">
            <EntryBody entry={entry} action={c.action} eager={false} />
          </div>
        ),
      )}

      <style>{`
        .wa-root {
          --wa-gutter: var(--gutter);
          background: var(--paper);
          /* Bewusst kompakter als eine klassische Hero-Bühne: am unteren Rand
             eines normalen Desktop-Viewports beginnt bereits der erste Eintrag. */
          padding-top: clamp(78px, 8vw, 112px);
        }

        /* ── Head ──────────────────────────────────────────── */
        .wa-head { padding: 0 var(--wa-gutter); }
        .wa-eyebrow {
          display: flex;
          justify-content: space-between;
          padding-bottom: 13px;
          border-bottom: 1px solid var(--line);
          font-family: var(--font-mono), monospace;
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .wa-title {
          margin-top: clamp(18px, 1.9vw, 28px);
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(42px, 6.2vw, 92px);
          line-height: 0.92;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .wa-lede {
          margin-top: clamp(16px, 1.6vw, 24px);
          max-width: 62ch;
          font-family: var(--font-body), sans-serif;
          font-size: 14px;
          line-height: 1.72;
          color: var(--text-body);
        }
        .wa-disciplines {
          margin-top: clamp(14px, 1.4vw, 20px);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.17em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .wa-register {
          display: flex;
          justify-content: space-between;
          margin: clamp(32px, 3.4vw, 54px) var(--wa-gutter) 0;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        /* ── Einträge ──────────────────────────────────────── */
        .wa-entry {
          display: grid;
          grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
          align-items: stretch;
          border-bottom: 1px solid var(--line);
        }
        /* Ohne Bild trägt der Eintrag die volle Breite und bleibt flach. */
        .wa-entry-quiet { grid-template-columns: minmax(0, 1fr); }
        .wa-entry-text {
          padding: clamp(30px, 3.4vw, 52px) clamp(24px, 3vw, 48px)
                   clamp(30px, 3.4vw, 52px) var(--wa-gutter);
          min-width: 0;
        }
        .wa-index {
          display: flex;
          gap: 8px;
          font-family: var(--font-mono), monospace;
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-faint);
        }
        .wa-index b { font-weight: 400; color: var(--text-secondary); }
        .wa-entry-title {
          margin-top: clamp(10px, 1.2vw, 18px);
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(42px, 6vw, 92px);
          line-height: 0.9;
          letter-spacing: -0.028em;
          color: var(--ink-strong);
        }
        .wa-entry-quiet .wa-entry-title { color: var(--text-muted); }

        .wa-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px clamp(20px, 2.4vw, 40px);
          margin-top: clamp(22px, 2.4vw, 36px);
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
          min-height: 24px;
          margin-top: clamp(24px, 2.6vw, 38px);
          padding-bottom: 4px;
          border-bottom: 1px solid var(--olive);
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.17em;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .wa-status {
          display: inline-block;
          margin-top: clamp(24px, 2.6vw, 38px);
          padding: 7px 13px;
          border: 1px solid var(--line);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
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
          /* min-height an der Zelle im Fluss; das Bild füllt sie absolut, damit
             die Fotografie die Zeilenhöhe nicht aus ihrem Seitenverhältnis
             heraus bestimmt. */
          min-height: clamp(290px, 31vw, 440px);
        }
        .wa-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 50%;
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
