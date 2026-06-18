// German homepage section: a quotable problem statement, a concise FAQ and
// internal links into the commercial + insight surface. Server component →
// fully crawlable, no client JS. Styled to match the SEESZN editorial system.

import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo";

export const HOME_FAQ_DE: { q: string; a: string }[] = [
  {
    q: "Was ist KI-Sichtbarkeit?",
    a: "KI-Sichtbarkeit beschreibt, ob eine Marke in KI-gestützten Antworten erscheint und als Quelle zitiert wird, etwa in ChatGPT, Perplexity, Gemini oder Google AI Overviews. Sie erweitert das klassische Suchmaschinen-Ranking.",
  },
  {
    q: "Was ist GEO?",
    a: "GEO (Generative Engine Optimization) ist die Optimierung dafür, von generativen Suchsystemen als Quelle abgerufen und zitiert zu werden, statt nur in einer Ergebnisliste zu ranken.",
  },
  {
    q: "Was ist AIO?",
    a: "AIO (AI Overview Optimization) ist die Optimierung von Inhalten dafür, in KI-Antwortflächen wie Google AI Overviews als Quelle zu erscheinen.",
  },
  {
    q: "Was ist der Unterschied zwischen SEO, GEO und AIO?",
    a: "SEO zielt auf Rankings, GEO auf Zitierbarkeit in generativen Antworten, AIO speziell auf Präsenz in KI-Antwortflächen wie AI Overviews. SEO ist die Grundlage; GEO und AIO bauen darauf auf.",
  },
  {
    q: "Wie kann man ChatGPT-Sichtbarkeit messen?",
    a: "Indem man ein definiertes Prompt-Set wiederholt stellt und auswertet, ob, wie und mit welchen Quellen eine Marke genannt wird. Die Ergebnisse variieren je nach Modellversion, Prompt und ob Live-Suche aktiv ist.",
  },
  {
    q: "Wie lange dauert der Aufbau von KI-Sichtbarkeit?",
    a: "Technische Korrekturen wirken schnell. Quell- und Entitätssignale brauchen Wochen bis Monate. Sichtbarkeit ist ein aufgebauter Zustand, kein Schalter, und die Dauer variiert je nach Kategorie und Wettbewerb.",
  },
  {
    q: "Für wen ist SEESZN geeignet?",
    a: "Für deutschsprachige B2B-Unternehmen, Hidden Champions und expertengeführte Marken, die in Suche und KI-Antworten gefunden, zitiert und empfohlen werden wollen und die Substanz haben, die dafür nötig ist.",
  },
  {
    q: "Was kostet ein KI-Sichtbarkeits-Audit?",
    a: "Der Umfang richtet sich nach Größe und Komplexität der Marke. Der Einstieg ist bewusst niedrigschwellig: eine Domain genügt. Den Rahmen klären wir transparent vor Beginn, ohne Retainer-Bindung.",
  },
];

const LINKS = [
  { label: "KI-Sichtbarkeit Agentur", href: "/ki-sichtbarkeit-agentur" },
  { label: "GEO Agentur", href: "/geo-agentur" },
  { label: "AIO Optimierung", href: "/aio-optimierung" },
  { label: "ChatGPT-Sichtbarkeit", href: "/chatgpt-sichtbarkeit" },
  { label: "B2B SEO Agentur", href: "/b2b-seo-agentur" },
  { label: "KI-Sichtbarkeits-Audit", href: "/ki-sichtbarkeits-audit" },
];

export default function HomeFaqDe() {
  return (
    <section className="hf" aria-labelledby="hf-title">
      <JsonLd data={faqSchema(HOME_FAQ_DE)} />

      <div className="hf-head">
        <span className="hf-chip">FAQ</span>
        <span className="hf-chip">SICHTBARKEIT, ERKLÄRT</span>
      </div>

      <h2 id="hf-title" className="hf-title">
        Deine Marke rankt vielleicht.<br />
        <em>Aber wird sie auch zitiert?</em>
        <span className="hf-cursor" aria-hidden="true" />
      </h2>
      <p className="hf-lead">
        Viele Unternehmen sind indexiert, aber nicht abrufbar. Sie ranken und verschwinden
        trotzdem aus KI-Antworten, Vergleichs-Prompts und Empfehlungsfragen.
        Klassisches Ranking ist nur noch ein Teil der Sichtbarkeit.
      </p>

      <dl className="hf-faq">
        {HOME_FAQ_DE.map((item) => (
          <div key={item.q}>
            <dt>{item.q}</dt>
            <dd>{item.a}</dd>
          </div>
        ))}
      </dl>

      <nav className="hf-links" aria-label="Leistungen & Themen">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </nav>

      <style>{`
        .hf {
          --hf-acid: #c8df3f;
          background: var(--paper-soft);
          border-top: 1px solid var(--warm-black);
          padding: clamp(64px, 8vw, 104px) clamp(20px, 5vw, 64px) clamp(72px, 9vw, 104px);
          counter-reset: hfq;
        }
        .hf-head { display: flex; gap: 18px; align-items: center; margin-bottom: 40px; }
        .hf-chip {
          font-family: var(--font-mono), monospace;
          font-size: 11px; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--text-muted);
          display: inline-flex; align-items: center; gap: 9px;
        }
        .hf-chip:first-child::before {
          content: '';
          width: 7px; height: 7px; background: var(--hf-acid);
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--hf-acid) 55%, transparent);
        }
        .hf-title {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(34px, 6vw, 76px);
          line-height: 0.94;
          letter-spacing: -0.02em;
          color: var(--warm-black);
          margin: 0 0 26px;
          max-width: 16ch;
          text-wrap: balance;
        }
        .hf-title em { font-style: normal; color: color-mix(in srgb, var(--warm-black) 56%, var(--paper-soft)); }
        .hf-cursor {
          display: inline-block;
          width: 0.5em; height: 0.08em;
          margin-left: 0.12em;
          vertical-align: baseline;
          background: var(--hf-acid);
        }
        .hf-lead {
          font-size: 17px; line-height: 1.62; color: var(--text-secondary);
          max-width: 60ch; margin-bottom: 16px; letter-spacing: -0.005em;
        }
        .hf-faq {
          margin-top: 52px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: clamp(40px, 5vw, 72px);
          max-width: 1180px;
          border-top: 1px solid var(--warm-black);
        }
        .hf-faq > div {
          padding: 26px 0 28px;
          border-bottom: 1px solid var(--line);
          transition: padding-left 0.4s cubic-bezier(.16,1,.3,1);
        }
        .hf-faq > div:hover { padding-left: 10px; }
        .hf-faq dt {
          font-family: var(--font-display), sans-serif;
          font-size: clamp(19px, 2vw, 23px); font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--ink-strong);
          margin-bottom: 12px;
          display: flex; gap: 12px;
        }
        .hf-faq dt::before {
          counter-increment: hfq;
          content: counter(hfq, decimal-leading-zero);
          font-family: var(--font-mono), monospace;
          font-size: 12px; font-weight: 500;
          color: var(--hf-acid);
          padding-top: 5px;
          flex-shrink: 0;
        }
        .hf-faq dd { font-size: 15.5px; line-height: 1.68; color: var(--text-body); padding-left: 30px; }
        .hf-links {
          margin-top: 56px;
          display: flex; flex-wrap: wrap; gap: 10px;
        }
        .hf-links a {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: var(--font-mono), monospace;
          font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-primary);
          border: 1px solid var(--border-btn);
          padding: 13px 18px;
          position: relative; overflow: hidden; isolation: isolate;
          transition: color 0.45s cubic-bezier(.16,1,.3,1), border-color 0.45s;
        }
        .hf-links a::before {
          content: ''; position: absolute; inset: 0;
          background: var(--warm-black); transform: translateY(101%);
          transition: transform 0.5s cubic-bezier(.16,1,.3,1); z-index: -1;
        }
        .hf-links a span { color: var(--hf-acid); transition: transform 0.4s cubic-bezier(.16,1,.3,1); }
        .hf-links a:hover { color: var(--paper); border-color: var(--warm-black); }
        .hf-links a:hover::before { transform: translateY(0); }
        .hf-links a:hover span { transform: translateX(4px); }
        @media (max-width: 820px) {
          .hf-faq { grid-template-columns: 1fr; }
          .hf-faq > div:hover { padding-left: 0; }
        }
      `}</style>
    </section>
  );
}
