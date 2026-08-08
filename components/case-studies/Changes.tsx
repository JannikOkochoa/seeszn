import type { CaseContent } from "@/lib/case-studies/types";
import Reveal from "./Reveal";

// ─── 05 / Was wir verändert haben ────────────────────────────────────────────
// Fünf Eingriffe als ruhiges Register im bestehenden Raster, danach die einzige
// Stelle, an der die Begriffe AIO und GEO ausgeschrieben und eingeordnet werden.
// Danach heisst es auf der ganzen Seite nur noch AI Search bzw. AIO.

export default function Changes({ content }: { content: CaseContent }) {
  const c = content.changes;
  return (
    <section className="tc-sec" id="massnahmen" aria-labelledby="changes-h">
      <div className="tc-rail">
        <p className="tc-label">
          <span>05</span>
          <span>{c.label}</span>
        </p>
        <h2 className="tc-h2-serif" id="changes-h">
          {c.headline}
        </h2>
      </div>

      <div className="tc-body">
        <Reveal stagger={70}>
          <p className="tc-copy-lead" data-reveal>
            {c.intro}
          </p>

          <ol className="tc-numlist csc-list">
            {c.items.map((item) => (
              <li className="tc-numitem" key={item.index} data-reveal>
                <p className="tc-numindex">{item.index}</p>
                <div>
                  <h3 className="tc-numtitle">{item.title}</h3>
                  <p className="tc-numtext">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="csc-definition" data-reveal>
            {c.definition}
          </p>
        </Reveal>
      </div>

      <style>{`
        .csc-list { margin-top: clamp(30px, 3.2vw, 46px); }
        .csc-definition {
          margin-top: clamp(30px, 3.2vw, 46px);
          padding-left: clamp(14px, 1.4vw, 18px);
          border-left: 1px solid var(--olive);
          max-width: 66ch;
          font-family: var(--font-body), sans-serif;
          font-size: clamp(12.5px, 1vw, 14px);
          line-height: 1.75;
          color: var(--text-primary);
        }
      `}</style>
    </section>
  );
}
