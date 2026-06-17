// German homepage section: a quotable problem statement, a concise FAQ and
// internal links into the commercial + insight surface. Server component →
// fully crawlable, no client JS. Styled to match the SEESZN editorial system.

import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo";

export const HOME_FAQ_DE: { q: string; a: string }[] = [
  {
    q: "Was ist KI-Sichtbarkeit?",
    a: "KI-Sichtbarkeit beschreibt, ob eine Marke in KI-gestützten Antworten erscheint und als Quelle zitiert wird — etwa in ChatGPT, Perplexity, Gemini oder Google AI Overviews. Sie erweitert das klassische Suchmaschinen-Ranking.",
  },
  {
    q: "Was ist GEO?",
    a: "GEO (Generative Engine Optimization) ist die Optimierung dafür, von generativen Suchsystemen als Quelle abgerufen und zitiert zu werden — nicht nur in einer Ergebnisliste zu ranken.",
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
    a: "Technische Korrekturen wirken schnell. Quell- und Entitätssignale brauchen Wochen bis Monate. Sichtbarkeit ist ein aufgebauter Zustand, kein Schalter — die Dauer variiert je nach Kategorie und Wettbewerb.",
  },
  {
    q: "Für wen ist SEESZN geeignet?",
    a: "Für deutschsprachige B2B-Unternehmen, Hidden Champions und expertengeführte Marken, die in Suche und KI-Antworten gefunden, zitiert und empfohlen werden wollen — und die Substanz haben, die dafür nötig ist.",
  },
  {
    q: "Was kostet ein KI-Sichtbarkeits-Audit?",
    a: "Der Umfang richtet sich nach Größe und Komplexität der Marke. Der Einstieg ist bewusst niedrigschwellig: eine Domain und eine E-Mail genügen. Den Rahmen klären wir transparent vor Beginn — ohne Retainer-Bindung.",
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
      </h2>
      <p className="hf-lead">
        Viele Unternehmen sind indexiert, aber nicht abrufbar. Sie ranken — und verschwinden
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
          background: var(--paper-soft);
          border-top: 1px solid var(--warm-black);
          padding: 80px 64px 88px;
        }
        .hf-head { display: flex; gap: 16px; align-items: center; margin-bottom: 44px; }
        .hf-chip {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--text-muted);
        }
        .hf-title {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(30px, 4.4vw, 56px);
          line-height: 1.08;
          color: var(--warm-black);
          margin: 0 0 24px;
          max-width: 18ch;
        }
        .hf-title em { font-style: italic; }
        .hf-lead {
          font-size: 16px; line-height: 1.7; color: var(--text-body);
          max-width: 62ch; margin-bottom: 16px;
        }
        .hf-faq {
          margin-top: 44px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 56px;
          max-width: 1100px;
        }
        .hf-faq > div { padding: 24px 0; border-top: 1px solid var(--line); }
        .hf-faq dt {
          font-family: var(--font-display), sans-serif;
          font-size: 18px; font-weight: 600; color: var(--ink-strong);
          margin-bottom: 10px;
        }
        .hf-faq dd { font-size: 15px; line-height: 1.65; color: var(--text-body); }
        .hf-links {
          margin-top: 56px;
          display: flex; flex-wrap: wrap; gap: 12px;
        }
        .hf-links a {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono), monospace;
          font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--text-primary);
          border: 1px solid var(--border-btn);
          padding: 10px 16px;
          transition: border-color 0.2s, background 0.2s;
        }
        .hf-links a span { color: var(--signal); }
        .hf-links a:hover { border-color: var(--border-btn-hovered); background: var(--button-hover-bg); }
        @media (max-width: 820px) {
          .hf { padding: 56px 24px 64px; }
          .hf-faq { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>
    </section>
  );
}
