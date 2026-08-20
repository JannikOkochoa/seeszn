// ─── First Move: die server-gerenderten Abschnitte ────────────────────────────
// Alles Kaufentscheidende steht im ausgelieferten HTML: Ablauf, Proof, Angebot,
// Bedingungen und FAQ. Nichts davon wartet auf JavaScript, nichts davon steckt in
// einem Bild oder Canvas.
//
// Diese Abschnitte werden als Slots an den Funnel übergeben. Sie bleiben damit
// Server Components und landen unverändert im HTML, während der Funnel nur die
// Reihenfolge und die interaktiven Teile steuert.
//
// Aufklappbare Inhalte nutzen <details>. Das ist crawlbar, tastaturbedienbar und
// braucht keinen Client-Code. Sichtbarer Text und Crawler-Text sind identisch.

import Image from "next/image";
import { PROOF_CASES, type ProofCase } from "@/lib/first-move/proof";
import type { FaqItem } from "@/lib/first-move/faq";
import {
  ASSETS,
  DELAY_CLAUSE,
  INCLUDED,
  NOT_INCLUDED,
  OFFER_FACTS,
  OFFER_POSITIONING,
  PRICE_DISPLAY,
  PRICE_PROMISE,
  PROCESS_STEPS,
  PRODUCT_DEFINITION,
  QUALIFICATION_RULE,
  REASSURANCE,
  RISK_REVERSAL_FULL,
} from "@/lib/first-move/product";
import FinalCtaForm from "./FinalCtaForm";

// ── Hero-Bausteine ────────────────────────────────────────────────────────────

export function HeroCopy({
  eyebrow,
  headline,
  lead,
}: {
  eyebrow: string;
  /** Wird als H1 gerendert. Es gibt genau eine H1 pro Seite. */
  headline: React.ReactNode;
  lead: string;
}) {
  return (
    <div className="fm-hero-h1-wrap">
      <span className="fm-eyebrow">{eyebrow}</span>
      <h1 className="fm-h1">{headline}</h1>
      <p className="fm-lead">{lead}</p>
    </div>
  );
}

const OVERLAY = ["Fokus", "Evidenz", "Wirkung"];

export function HeroPlate() {
  return (
    <div className="fm-hero-img">
      <Image
        src={ASSETS.hero}
        alt=""
        width={1448}
        height={1086}
        priority
        fetchPriority="high"
        sizes="(max-width: 1024px) 100vw, 40vw"
      />
      <div className="fm-hero-overlay" aria-hidden="true">
        {OVERLAY.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </div>
    </div>
  );
}

// ── Ablauf ────────────────────────────────────────────────────────────────────

export function Process() {
  return (
    <section className="fm-section" aria-labelledby="fm-process" id="ablauf">
      <div className="fm-wrap">
        <div className="fm-cols2">
          <div>
            <span className="fm-eyebrow">Ablauf</span>
            <h2 id="fm-process" className="fm-h2" style={{ marginTop: 14, maxWidth: "16ch" }}>
              So läuft ein First Move ab
            </h2>
          </div>
          <p className="fm-serif" style={{ alignSelf: "end" }}>
            {PRODUCT_DEFINITION}
          </p>
        </div>

        <div className="fm-steps">
          {PROCESS_STEPS.map((step) => (
            <div className="fm-step" key={step.num}>
              <span className="fm-step-num">{step.num}</span>
              <span className="fm-step-title">{step.title}</span>
              <p className="fm-step-body">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="fm-disclose">
          <details className="fm-details">
            <summary>Wie wir prüfen, bevor wir etwas empfehlen</summary>
            <div className="fm-details-body">
              <p className="fm-body">{QUALIFICATION_RULE}</p>
              <p className="fm-body">
                Ein einzelner Checklistenpunkt reicht nie: fehlende Alt-Texte, eine Meta-Länge oder
                ein Tool-Score werden bei uns nicht zum Engpass erklärt. Antwortet eine Seite dem
                automatisierten Abruf mit einer Bot-Schutzseite, leiten wir daraus keinen Befund ab.
              </p>
              <p className="fm-body">
                Der öffentliche Scan zeigt ein Signal. Ob es die Ursache ist, entscheidet die
                Verifikation mit den nötigen Zugängen. Für Google Ads gilt zusätzlich: was im Konto
                liegt, behaupten wir nicht von außen.
              </p>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}

// ── Proof ─────────────────────────────────────────────────────────────────────

function ProofPlate({ item }: { item: ProofCase }) {
  if (item.image) {
    return (
      <div className="fm-case-plate">
        <Image
          src={item.image}
          alt={item.imageAlt}
          width={1122}
          height={1402}
          sizes="(max-width: 600px) 100vw, (max-width: 1024px) 40vw, 30vw"
          loading="lazy"
        />
      </div>
    );
  }
  // Ohne Bildplatte trägt die Karte die Zahl selbst. Typografie statt Platzhalter.
  return (
    <div className="fm-case-plate fm-case-plate--type" aria-hidden="true">
      <span className="fm-case-plate-cap">{item.label}</span>
      <span className="fm-case-plate-num">{item.leadValue}</span>
      <span className="fm-case-plate-rule" />
    </div>
  );
}

function ProofCard({ item }: { item: ProofCase }) {
  return (
    <article className="fm-case">
      <ProofPlate item={item} />
      <div className="fm-case-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="fm-case-head">
          <span className="fm-case-label">{item.label}</span>
          <h3 className="fm-case-name">{item.name}</h3>
          <span className="fm-case-desc">{item.descriptor}</span>
        </div>

        <div className="fm-case-kpi">
          <span className="fm-case-kpi-v">{item.leadValue}</span>
          <span className="fm-case-kpi-c">{item.leadCaption}</span>
        </div>

        <div className="fm-case-sec">
          {item.secondary.map((s) => (
            <div className="fm-case-sec-row" key={s.caption}>
              <span className="fm-case-sec-v">{s.value}</span>
              <span className="fm-case-sec-c">{s.caption}</span>
            </div>
          ))}
        </div>

        {item.attribution ? <p className="fm-case-attr">{item.attribution}</p> : null}
        {item.note ? <span className="fm-case-note">{item.note}</span> : null}

        <details className="fm-details" data-fm-evidence={item.id}>
          <summary>Messgrößen und Methodik</summary>
          <div className="fm-details-body">
            {item.evidence.map((row) => (
              <div className="fm-ev" key={row.label}>
                <span className="fm-ev-k">{row.label}</span>
                <span className="fm-ev-v">{row.value}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </article>
  );
}

export function Proof({ order }: { order: ProofCase["id"][] }) {
  return (
    <section className="fm-section" aria-labelledby="fm-proof" id="proof">
      <div className="fm-wrap">
        <h2 id="fm-proof" className="fm-h2" style={{ maxWidth: "18ch" }}>
          Ausgewählte Ergebnisse
        </h2>
        <div className="fm-proof-grid">
          {order.map((id) => (
            <ProofCard key={id} item={PROOF_CASES[id]} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Angebot ───────────────────────────────────────────────────────────────────

export function Offer() {
  return (
    <section className="fm-section" aria-labelledby="fm-offer" id="angebot">
      <div className="fm-wrap">
        <div className="fm-offer">
          <div>
            <h2 id="fm-offer" className="fm-h2" style={{ maxWidth: "14ch" }}>
              SEESZN First Move
            </h2>
            {/* Der erste Ort im Funnel, an dem eine Zahl steht. Davor sagt
                PRICE_FRAME, was den Preis begrenzt; hier steht er vollständig
                und vor jeder Bindung. Versteckt wird er nirgends, er kommt nur
                nicht mehr vor dem Ergebnis. */}
            <p className="fm-micro" style={{ marginTop: 20 }}>
              {PRICE_PROMISE}
            </p>
            <p className="fm-price" style={{ marginTop: 12 }}>
              {PRICE_DISPLAY}
            </p>
            <span className="fm-price-sub">Netto · Festpreis</span>
            <p className="fm-serif" style={{ marginTop: 24, maxWidth: "30ch" }}>
              {OFFER_POSITIONING}
            </p>
            <ul className="fm-reassure">
              {REASSURANCE.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="fm-offer-detail">
            <dl className="fm-facts-grid">
              {OFFER_FACTS.map((fact) => (
                <div key={fact.k}>
                  <dt>{fact.k}</dt>
                  <dd>{fact.v}</dd>
                </div>
              ))}
            </dl>

            <p className="fm-body">{RISK_REVERSAL_FULL}</p>

            <details className="fm-details">
              <summary>Was enthalten ist und was nicht</summary>
              <div className="fm-details-body">
                <div className="fm-cols2">
                  <div>
                    <span className="fm-eyebrow" style={{ marginBottom: 12 }}>
                      Enthalten
                    </span>
                    <ul className="fm-list fm-list--in">
                      {INCLUDED.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="fm-eyebrow" style={{ marginBottom: 12 }}>
                      Nicht enthalten
                    </span>
                    <ul className="fm-list fm-list--out">
                      {NOT_INCLUDED.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ und Bedingungen ───────────────────────────────────────────────────────

export function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <section className="fm-section" aria-labelledby="fm-faq" id="faq">
      <div className="fm-wrap">
        <h2 id="fm-faq" className="fm-h2" style={{ maxWidth: "16ch" }}>
          Häufige Fragen
        </h2>
        <div className="fm-faq">
          {items.map((item) => (
            <details className="fm-details" key={item.q}>
              <summary>{item.q}</summary>
              <div className="fm-details-body">
                <p className="fm-faq-a">{item.a}</p>
              </div>
            </details>
          ))}
        </div>

        <div id="leistungsbedingungen" style={{ marginTop: 56 }}>
          <span className="fm-eyebrow">Leistungsbedingungen</span>
          <div className="fm-cols2" style={{ marginTop: 16 }}>
            <p className="fm-body">{RISK_REVERSAL_FULL}</p>
            <p className="fm-body">{DELAY_CLAUSE}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Abschluss ─────────────────────────────────────────────────────────────────

export function FinalCta({ paid = false }: { paid?: boolean }) {
  return (
    <section className="fm-final" aria-labelledby="fm-final">
      <div className="fm-final-texture" aria-hidden="true">
        <Image
          src={ASSETS.footerTexture}
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="fm-final-in">
        <div className="fm-wrap">
          <h2 id="fm-final" className="fm-h2" style={{ maxWidth: "16ch" }}>
            Der nächste sinnvolle Move
            <br />
            beginnt mit deiner <span className="fm-acid">Domain</span>.
          </h2>
          <div style={{ marginTop: 34 }}>
            <FinalCtaForm paid={paid} />
          </div>
        </div>
      </div>
    </section>
  );
}
