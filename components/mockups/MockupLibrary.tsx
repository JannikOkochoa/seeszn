import Link from "next/link";
import { mockups } from "./registry";

/**
 * Mockup Library — die Übersicht unter /mockups.
 *
 * Bewusst schlicht: eine Kopfzeile im SEESZN-Ton und je ein Eintrag aus der
 * Registry. Die Karten kommen aus components/mockups/registry.ts, damit ein
 * zweites Mockup später nur einen Eintrag und eine Route braucht. Leere
 * Platzhalterkarten gibt es nicht.
 */
export default function MockupLibrary() {
  return (
    <div className="ml">
      <header className="ml-head">
        <p className="t-eyebrow">SEESZN · Interne Entwürfe</p>
        <h1 className="ml-title">Mockups</h1>
        <p className="ml-lead">
          Klickbare Konzeptstände für Kundengespräche. Alle Entwürfe hier sind
          interne Vorschauen und nicht veröffentlicht.
        </p>
      </header>

      <ul className="ml-grid">
        {mockups.map((m) => (
          <li key={m.slug}>
            <article className="ml-card">
              {m.preview && (
                <Link
                  className="ml-shot"
                  href={`/mockups/${m.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.preview.src} alt="" loading="lazy" />
                </Link>
              )}

              <div className="ml-body">
                <div className="ml-titlerow">
                  <h2 className="ml-card-title">
                    <Link className="ml-card-link" href={`/mockups/${m.slug}`}>
                      {m.title}
                    </Link>
                  </h2>
                  <span className="ml-badge">{m.badge}</span>
                </div>
                <p className="ml-sub">{m.subline}</p>
                <p className="ml-meta">
                  {m.client} · Konzeptstand {m.stand}
                </p>
                <span className="ml-cta" aria-hidden="true">
                  Mockup öffnen →
                </span>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <style>{`
        .ml {
          max-width: 1400px;
          margin: 0 auto;
          padding: clamp(48px, 7vw, 96px) var(--gutter) clamp(72px, 9vw, 128px);
          font-family: var(--font-body), "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        .ml-head { max-width: 62ch; }
        .ml-title {
          margin: 14px 0 0;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.0;
          letter-spacing: -0.01em;
          color: var(--ink-strong);
        }
        .ml-lead {
          margin: 18px 0 0;
          font-size: 17px;
          line-height: 1.55;
          color: var(--text-body);
        }

        .ml-grid {
          list-style: none;
          margin: clamp(40px, 5vw, 64px) 0 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 420px));
          gap: 28px;
        }

        .ml-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--surface-raised);
          border: 1px solid var(--line);
          transition: border-color 0.25s ease;
        }
        .ml-card:hover { border-color: var(--line-strong); }

        /* Vorschau: oberer Ausschnitt des Referenzbilds, rein dekorativ.
           Der Link darauf ist für Screenreader ausgeblendet, die Karte hat
           ihren echten Link in der Überschrift. */
        .ml-shot {
          display: block;
          height: 190px;
          overflow: hidden;
          border-bottom: 1px solid var(--line);
          background: #ffffff;
        }
        .ml-shot img {
          width: 100%;
          height: auto;
          display: block;
        }

        .ml-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 22px 24px 24px;
        }
        .ml-titlerow {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 14px;
        }
        .ml-card-title {
          margin: 0;
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: 22px;
          line-height: 1.25;
          color: var(--ink-strong);
        }
        /* Der Titel-Link deckt die ganze Karte ab: eine Karte, ein Ziel. */
        .ml-card-link::after {
          content: "";
          position: absolute;
          inset: 0;
        }
        .ml-card { position: relative; }
        .ml-card-link:focus-visible { outline: 2px solid var(--ink-strong); outline-offset: 4px; }

        .ml-badge {
          flex: none;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          border: 1px solid var(--line-strong);
          padding: 3px 9px;
        }
        .ml-sub {
          margin: 10px 0 0;
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-body);
        }
        .ml-meta {
          margin: 6px 0 0;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .ml-cta {
          margin-top: auto;
          padding-top: 22px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-strong);
        }

        @media (max-width: 560px) {
          .ml-grid { grid-template-columns: 1fr; }
          .ml-shot { height: 150px; }
        }
      `}</style>
    </div>
  );
}
