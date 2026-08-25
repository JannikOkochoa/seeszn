// ─── Startseite: die server-gerenderten Abschnitte ────────────────────────────
// Alles Kaufentscheidende steht im ausgelieferten HTML: Engpass, Produkt, Proof,
// System, Angebot und Abschluss. Nichts davon wartet auf JavaScript, nichts
// davon steckt in einem Bild.
//
// Bewegung entsteht ausschließlich über <Reveal>, dieselbe Mechanik wie in den
// Case Studies: der versteckte Zustand wird erst gesetzt, wenn der Beobachter
// scharf ist. Ohne JavaScript bleibt die Seite vollständig lesbar.
//
// Zahlen und Produktfakten kommen aus lib/first-move/product.ts, Belege aus
// lib/first-move/proof.ts. Diese Datei erfindet keine Zahl und keine Zusage.

import Link from "next/link";
import Reveal from "@/components/case-studies/Reveal";
import { PROOF_CASES, type ProofCase } from "@/lib/first-move/proof";
import { HOME_SCAN_ANCHOR, type HomeContent } from "@/lib/home";

// ── 01 Der Engpass ────────────────────────────────────────────────────────────
// Der Abschnitt beginnt direkt unter der Falzkante und ist im ersten Bild
// angeschnitten sichtbar. Er benennt die Lage ohne Drohung.

export function Constraint({ content }: { content: HomeContent }) {
  const CONSTRAINT = content.constraint;
  return (
    <section className="hm-section hm-section--tight" aria-labelledby="hm-constraint-h">
      <div className="hm-head">
        <span className="hm-index">{CONSTRAINT.index}</span>
        <span className="hm-label">{CONSTRAINT.label}</span>
      </div>

      <div className="hm-constraint-grid">
        <div>
          <h2 id="hm-constraint-h" className="hm-h2">
            {CONSTRAINT.line1}
            <br />
            <span className="hm-accent">{CONSTRAINT.line2}</span>
          </h2>
          <div className="hm-rule" />
          <div className="hm-surfaces">
            <span className="hm-label">{CONSTRAINT.surfacesLabel}</span>
            {CONSTRAINT.surfaces.map((surface) => (
              <span key={surface} className="hm-surface">
                {surface}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="hm-body">{CONSTRAINT.body}</p>
          <p className="hm-body" style={{ marginTop: 16, color: "var(--text-primary)" }}>
            {CONSTRAINT.note}
          </p>
        </div>
      </div>
    </section>
  );
}

// ── 03 Vier Antworten, ein Move ───────────────────────────────────────────────

export function Answers({ content }: { content: HomeContent }) {
  const ANSWERS = content.answers;
  return (
    <section className="hm-section" aria-labelledby="hm-answers-h">
      <div className="hm-head">
        <span className="hm-index">{ANSWERS.index}</span>
        <span className="hm-label">{ANSWERS.label}</span>
      </div>

      <h2 id="hm-answers-h" className="hm-h2">
        {ANSWERS.line1}
        <br />
        <span className="hm-accent">{ANSWERS.line2}</span>
      </h2>
      <div className="hm-rule" />
      {/* Die Definition am Stück. Bewusst 40 bis 60 Wörter, damit sie als
          Ganzes zitierbar bleibt. */}
      <p className="hm-lead" style={{ maxWidth: "62ch", marginBottom: 8 }}>
        {ANSWERS.definition}
      </p>

      <Reveal className="hm-answers" stagger={90}>
        {ANSWERS.rows.map((row) => (
          <article key={row.num} className="hm-answer" data-reveal>
            <span className="hm-answer-n">{row.num}</span>
            <div>
              <span className="hm-answer-l">{row.label}</span>
              <h3 className="hm-h3">{row.title}</h3>
            </div>
            <p className="hm-body hm-answer-body">{row.body}</p>
          </article>
        ))}
      </Reveal>
    </section>
  );
}

// ── 04 Proof ──────────────────────────────────────────────────────────────────
// Der Beleg steht neben der Behauptung, nicht auf einer anderen Seite. Jeder
// Fall zeigt Messgröße, Zeitraum, Quelle, Scope und, wo vorhanden, die Grenzen
// der Aussage. Kein Logo-Wall, keine zusätzliche Zahl.

/** Holt einen Beleg aus dem Case. Fehlt er, entfällt die Zeile ersatzlos. */
function evidenceValue(item: ProofCase, ...labels: string[]): string | null {
  for (const label of labels) {
    const hit = item.evidence.find((e) => e.label === label);
    if (hit) return hit.value;
  }
  return null;
}

export function Proof({ content }: { content: HomeContent }) {
  const PROOF = content.proof;
  return (
    <section className="hm-section" aria-labelledby="hm-proof-h">
      <div className="hm-head">
        <span className="hm-index">{PROOF.index}</span>
        <span className="hm-label">{PROOF.label}</span>
      </div>

      <h2 id="hm-proof-h" className="hm-h2">
        {PROOF.line1} <span className="hm-accent">{PROOF.accent}</span>
      </h2>
      <div className="hm-rule" />
      <p className="hm-lead">{PROOF.lead}</p>

      <Reveal className="hm-proof" stagger={100}>
        {PROOF.order.map((id) => {
          const item = PROOF_CASES[id];
          const display = PROOF.cases[id];
          // Ohne eigene Anzeigewerte rendert die Karte unverändert die Quelle
          // aus lib/first-move/proof.ts. Die englische Fassung setzt nur die
          // Schreibweise neu, nie die Zahl.
          const v = display.display;
          const leadValue = v?.leadValue ?? item.leadValue;
          const leadCaption = v?.leadCaption ?? item.leadCaption;
          const secondary = v?.secondary ?? item.secondary;
          const note = v ? v.note : item.note;
          const attribution = v ? v.attribution : item.attribution;
          const window = v ? v.window ?? null : evidenceValue(item, "Zeitraum");
          const metric = v ? v.metric ?? null : evidenceValue(item, "Messgröße", "Messgrößen");
          const source = v ? v.source ?? null : evidenceValue(item, "Quelle", "Quellen");
          const limits = v ? v.limits ?? null : evidenceValue(item, "Grenzen");
          const beforeAfter = leadValue.includes("→");

          return (
            <article key={id} className="hm-case" data-reveal>
              <div>
                <span className="hm-case-name">{display.name}</span>
                <span className="hm-case-desc">{display.descriptor}</span>
                {note ? <span className="hm-case-desc">{note}</span> : null}
                {attribution ? <span className="hm-case-desc">{attribution}</span> : null}
              </div>

              <div>
                <span className="hm-k">{beforeAfter ? PROOF.keys.beforeAfter : PROOF.keys.result}</span>
                <span className="hm-case-num" style={{ marginTop: 10 }}>
                  {leadValue}
                </span>
                <span className="hm-case-cap">{leadCaption}</span>
                {secondary.length ? (
                  <div className="hm-case-second">
                    {secondary.map((s) => (
                      <span key={s.caption}>
                        <b>{s.value}</b> {s.caption}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="hm-case-facts">
                <dl className="hm-facts">
                  {window ? (
                    <div className="hm-fact">
                      <dt>{PROOF.keys.window}</dt>
                      <dd>{window}</dd>
                    </div>
                  ) : null}
                  {metric ? (
                    <div className="hm-fact">
                      <dt>{PROOF.keys.metric}</dt>
                      <dd>{metric}</dd>
                    </div>
                  ) : null}
                  {source ? (
                    <div className="hm-fact">
                      <dt>{PROOF.keys.source}</dt>
                      <dd>{source}</dd>
                    </div>
                  ) : null}
                  <div className="hm-fact">
                    <dt>{PROOF.keys.scope}</dt>
                    <dd>{display.scope}</dd>
                  </div>
                  {limits ? (
                    <div className="hm-fact">
                      <dt>{PROOF.keys.limits}</dt>
                      <dd>{limits}</dd>
                    </div>
                  ) : null}
                </dl>
                {display.href ? (
                  <Link href={display.href} className="hm-case-link">
                    {PROOF.caseLink}
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </Reveal>
    </section>
  );
}

// ── 05 Das System hinter dem First Move ───────────────────────────────────────
// Keine erfundenen Agenten, keine Automatisierungsbehauptung. Die beiden Stufen
// mit menschlicher Freigabe sind ausdrücklich markiert.

export function System({ content }: { content: HomeContent }) {
  const SYSTEM = content.system;
  return (
    <section className="hm-section" aria-labelledby="hm-system-h">
      <div className="hm-head">
        <span className="hm-index">{SYSTEM.index}</span>
        <span className="hm-label">{SYSTEM.label}</span>
      </div>

      <h2 id="hm-system-h" className="hm-h2">
        {SYSTEM.line1} <span className="hm-accent">{SYSTEM.accent}</span>
      </h2>
      <div className="hm-rule" />
      <p className="hm-lead">{SYSTEM.lead}</p>

      <Reveal className="hm-flow" stagger={80}>
        {SYSTEM.stages.map((stage) => (
          <div
            key={stage.num}
            className="hm-stage-row"
            data-reveal
            data-human={stage.label === "HUMAN VERIFICATION" ? "true" : undefined}
          >
            <span className="hm-stage-n">{stage.num}</span>
            <span className="hm-stage-l">{stage.label}</span>
            <span className="hm-stage-m">{stage.meta}</span>
            <p className="hm-stage-b">{stage.body}</p>
          </div>
        ))}
      </Reveal>

      <p className="hm-micro" style={{ marginTop: 24, maxWidth: "60ch" }}>
        {SYSTEM.note}
      </p>
    </section>
  );
}

// ── 06 Wiedererkennung ────────────────────────────────────────────────────────

export function Recognition({ content }: { content: HomeContent }) {
  const RECOGNITION = content.recognition;
  return (
    <section className="hm-section hm-section--tight" aria-labelledby="hm-recog-h">
      <div className="hm-head">
        <span className="hm-index">{RECOGNITION.index}</span>
        <span className="hm-label">{RECOGNITION.label}</span>
      </div>

      <h2 id="hm-recog-h" className="hm-h2">
        {RECOGNITION.line1} <span className="hm-accent">{RECOGNITION.accent}</span>
      </h2>
      <div className="hm-rule" />

      <div className="hm-recog">
        {RECOGNITION.items.map((item, i) => (
          <div key={item} className="hm-recog-item">
            <span className="hm-recog-n">{`0${i + 1}`}</span>
            <p className="hm-recog-t">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── 07 Das Angebot ────────────────────────────────────────────────────────────
// Der Preis erscheint hier zum ersten Mal, also nach Befund, Beleg und System.
// Alle Werte kommen aus den gesperrten Produktwerten.

export function Offer({ anchor, content }: { anchor: string; content: HomeContent }) {
  const OFFER = content.offer;
  return (
    <section id={anchor} className="hm-section" aria-labelledby="hm-offer-h">
      <div className="hm-head">
        <span className="hm-index">{OFFER.index}</span>
        <span className="hm-label">{OFFER.label}</span>
      </div>

      <h2 id="hm-offer-h" className="hm-h2">
        {OFFER.name}
      </h2>
      <div className="hm-rule" />
      <p className="hm-lead">{OFFER.priceFrame}</p>

      <div className="hm-offer-grid">
        <div>
          <span className="hm-price">{OFFER.price}</span>
          <span className="hm-k hm-price-cap">{OFFER.priceCaption}</span>

          <dl className="hm-offer-facts">
            {OFFER.facts.map((fact) => (
              <div key={fact.k} className="hm-offer-fact">
                <dt>{fact.k}</dt>
                <dd>{fact.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <span className="hm-k">{OFFER.includedLabel}</span>
          <ul className="hm-included">
            {OFFER.included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="hm-risk">
            <span className="hm-k">{OFFER.riskLabel}</span>
            <p className="hm-body" style={{ marginTop: 10 }}>
              {OFFER.riskReversal}
            </p>
            <div className="hm-reassurance">
              {OFFER.reassurance.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>

          <div className="hm-actions">
            <Link href={OFFER.ctaHref} className="hm-cta">
              {OFFER.cta}
              <span className="hm-cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <span className="hm-micro" style={{ maxWidth: "34ch" }}>
              {OFFER.pricePromise}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 08 Die Entscheidung ───────────────────────────────────────────────────────

export function Decision({ content }: { content: HomeContent }) {
  const DECISION = content.decision;
  const OFFER = content.offer;
  return (
    <section className="hm-section" aria-labelledby="hm-decision-h">
      <div className="hm-head">
        <span className="hm-index">{DECISION.index}</span>
        <span className="hm-label">{DECISION.label}</span>
      </div>

      <h2 id="hm-decision-h" className="hm-decision-h">
        <span>{DECISION.line1}</span>
        <span>{DECISION.line2}</span>
        <span className="hm-accent">{DECISION.accent}</span>
      </h2>
      <div className="hm-rule" />
      <p className="hm-lead">{DECISION.body}</p>

      <div className="hm-actions">
        <Link href={OFFER.ctaHref} className="hm-cta">
          {DECISION.cta}
          <span className="hm-cta-arrow" aria-hidden="true">
            →
          </span>
        </Link>
        <a href={`#${HOME_SCAN_ANCHOR}`} className="hm-secondary">
          {DECISION.secondary}
        </a>
      </div>
    </section>
  );
}
