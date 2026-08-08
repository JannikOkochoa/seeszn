import Image from "next/image";
import type { CaseContent } from "@/lib/case-studies/types";
import Reveal from "./Reveal";

// ─── 07 / Was den Unterschied gemacht hat ────────────────────────────────────
// Nach dem Höhepunkt ein bewusst ruhiger, grosszügiger Abschnitt: ein
// editorialer Bildbruch und drei Sätze, die erklären, warum es funktioniert hat.
// Rhythmuswechsel — hier sind keine Zahlen, nur Einordnung.

export default function Difference({ content }: { content: CaseContent }) {
  const c = content.difference;
  return (
    <section className="csd" id="wirkung" aria-labelledby="difference-h">
      <div className="csd-media">
        <Image
          src={c.image.src}
          alt={c.image.alt}
          width={c.image.width}
          height={c.image.height}
          sizes="(max-width: 900px) 100vw, 42vw"
          loading="lazy"
          className="csd-img"
        />
      </div>

      <div className="csd-text">
        <Reveal stagger={90}>
          <p className="tc-label" data-reveal>
            <span>07</span>
            <span>{c.label}</span>
          </p>

          <h2 className="csd-h2" id="difference-h" data-reveal>
            {c.headline}
          </h2>

          <ol className="tc-numlist csd-list">
            {c.items.map((d) => (
              <li className="tc-numitem" key={d.index} data-reveal>
                <p className="tc-numindex">{d.index}</p>
                <div>
                  <h3 className="tc-numtitle">{d.title}</h3>
                  <p className="tc-numtext">{d.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <style>{`
        .csd {
          display: grid;
          grid-template-columns: minmax(0, 42fr) minmax(0, 58fr);
          border-bottom: 1px solid var(--line);
          scroll-margin-top: 108px;
        }
        .csd-media {
          position: relative;
          min-width: 0;
          min-height: clamp(320px, 34vw, 520px);
        }
        .csd-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 46% 52%;
          display: block;
        }
        .csd-text {
          padding: clamp(44px, 5vw, 78px) var(--gutter) clamp(44px, 5vw, 78px)
                   clamp(28px, 3.4vw, 56px);
          min-width: 0;
          display: grid;
          align-content: center;
        }
        .csd-h2 {
          margin-top: clamp(18px, 2vw, 28px);
          margin-bottom: clamp(28px, 3vw, 44px);
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(28px, 3.1vw, 46px);
          line-height: 1.08;
          letter-spacing: -0.022em;
          color: var(--ink-strong);
          max-width: 20ch;
        }

        @media (max-width: 900px) {
          .csd { grid-template-columns: minmax(0, 1fr); }
          .csd-media { aspect-ratio: 4 / 3; min-height: 0; }
          .csd-text { padding: clamp(36px, 9vw, 56px) var(--gutter); }
        }
      `}</style>
    </section>
  );
}
