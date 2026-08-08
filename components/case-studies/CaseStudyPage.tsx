import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CaseStyles from "./CaseStyles";
import Hero from "./Hero";
import QuickFacts from "./QuickFacts";
import Baseline from "./Baseline";
import Findings from "./Findings";
import Changes from "./Changes";
import Result from "./Result";
import Difference from "./Difference";
import TechnicalProof from "./TechnicalProof";
import Method from "./Method";
import Takeaways from "./Takeaways";
import FinalCta from "./FinalCta";
import type { CaseContent } from "@/lib/case-studies/types";

// ─── Gemeinsamer Seitenaufbau beider Sprachfassungen ─────────────────────────
// Deutsch und Englisch rendern durch exakt diese Komponente. Dadurch sind
// Reihenfolge, Raster, Motion, Timing und Responsive-Verhalten garantiert
// identisch — eine Sprachfassung kann optisch nicht abdriften, weil es nur eine
// Implementierung gibt. Unterschiedlich ist ausschliesslich der Inhalt.

export default function CaseStudyPage({ content }: { content: CaseContent }) {
  return (
    <>
      <Nav />
      {/* Sprache serverseitig am Inhaltsbaum: <html lang> wird für /en erst
          nach der Hydration umgestellt (LangSetter). Damit bekommen Vorleser,
          Crawler und vor allem die Silbentrennung schon in der ersten Antwort
          die richtige Sprache für diesen Abschnitt. */}
      <main className="tc-root" lang={content.locale}>
        <CaseStyles />

        {/* Kontext-Breadcrumb — crawlbar und als sichtbare Einordnung. */}
        <nav className="cs-crumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href={content.indexPath}>{content.hero.breadcrumb[0]}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>{content.hero.breadcrumb[1]}</li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{content.hero.breadcrumb[2]}</li>
          </ol>
        </nav>

        <article>
          <Hero content={content} />
          <QuickFacts content={content} />
          <Baseline content={content} />
          <Findings content={content} />
          <Changes content={content} />
          <Result content={content} />
          <Difference content={content} />
          <TechnicalProof content={content} />
          <Method content={content} />
          <Takeaways content={content} />
          <FinalCta content={content} />
        </article>

        <style>{`
          .cs-crumb {
            padding: 92px var(--gutter) 0;
            background: var(--paper);
          }
          .cs-crumb ol {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            list-style: none;
            font-family: var(--font-mono), monospace;
            font-size: 9px;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--text-faint);
          }
          .cs-crumb a { color: var(--text-muted); border-bottom: 1px solid transparent; }
          .cs-crumb a:hover { color: var(--ink-strong); border-bottom-color: var(--olive); }
          .cs-crumb li[aria-current="page"] { color: var(--text-secondary); }

          /* Der Hero bringt seinen eigenen Nav-Abstand mit — der Breadcrumb
             übernimmt ihn, damit beides nicht doppelt gepolstert ist. */
          .cs-crumb + article > .csh { padding-top: clamp(14px, 1.6vw, 22px); }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
