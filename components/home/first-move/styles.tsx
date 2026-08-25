// ─── Startseite: Stilschicht der Kaufentscheidung ─────────────────────────────
// Ein Stylesheet für die neue Startseiten-Sequenz. Es benutzt ausschließlich die
// bestehenden SEESZN Tokens, Schriften und Rhythmen aus app/globals.css und
// übernimmt die Gestaltungsregeln der bestehenden Startseitenmodule:
//
//   - Flächen sind Papier, Trennungen sind 1px, Radien gibt es nicht.
//   - Acid (--olive) ist Akzent und Markierung, nie Fließtextfarbe.
//   - Überschriften stehen in Barlow Condensed, genau ein Akzentwort je
//     Überschrift in Source Serif 4 (.hm-accent, gleiche Rolle wie .t-accent).
//   - Bewegung nutzt dieselbe Kurve wie Hero, TheShift und BuiltFor:
//     cubic-bezier(.16,1,.3,1). Keine neue Timing-Sprache.
//
// Alles ist unter .hm verschachtelt, damit keine Regel auf andere Seiten wirkt.

export default function HomeMoveStyles() {
  return (
    <style>{`
/* ── Grundfläche ─────────────────────────────────────────────────────────── */
.hm { background: var(--paper); color: var(--text-body); }

/* Sprungziele halten Abstand zur klebenden Navigation (106px hoch). */
.hm-section { scroll-margin-top: 130px; }

.hm :focus-visible {
  outline: 2px solid var(--ink-strong);
  outline-offset: 3px;
}

.hm-section {
  border-top: 1px solid var(--warm-black);
  padding: var(--section-y) var(--gutter);
}
.hm-section--tight { padding-block: clamp(56px, 7vw, 96px); }

/* ── Kopfzeile eines Abschnitts ──────────────────────────────────────────── */
.hm-head { display: flex; align-items: baseline; gap: 18px; margin-bottom: clamp(28px, 3.4vw, 44px); }
.hm-index {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
.hm-label {
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.hm-rule { width: 48px; height: 2px; background: var(--olive); margin: 20px 0 22px; }

/* ── Typografie ──────────────────────────────────────────────────────────── */
.hm-h2 {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(30px, 4vw, 58px);
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: var(--ink-strong);
  margin: 0;
  text-wrap: balance;
}
.hm-h3 {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(21px, 2.1vw, 28px);
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: var(--ink-strong);
  margin: 0;
}
.hm-accent {
  font-family: var(--font-editorial), Georgia, serif;
  font-weight: 400;
  font-style: normal;
  letter-spacing: -0.01em;
}
.hm-lead {
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 17px;
  line-height: 1.55;
  color: var(--text-primary);
  max-width: 46ch;
}
.hm-body {
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-body);
  max-width: 60ch;
}
.hm-micro {
  font-family: var(--font-mono), monospace;
  font-size: 11px;
  line-height: 1.6;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}
.hm-k {
  display: block;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* ── Handlungen ──────────────────────────────────────────────────────────── */
/* Der dominante CTA der Seite. Tinte auf Papier, Acid nur im Pfeil. */
.hm-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--warm-black);
  color: var(--paper);
  border: 1px solid var(--warm-black);
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 16px 28px;
  min-height: 48px;
  transition: background 0.25s, color 0.25s, border-color 0.25s;
}
.hm-cta:hover { background: transparent; color: var(--text-primary); }
.hm-cta-arrow { color: var(--olive); }

/* Der nachgeordnete Weg. Sichtbar schwächer, nie gleichwertig. */
.hm-secondary {
  display: inline-block;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 13px;
  color: var(--text-muted);
  border-bottom: 1px solid var(--line-strong);
  padding-bottom: 2px;
  transition: color 0.25s, border-color 0.25s;
}
.hm-secondary:hover { color: var(--text-primary); border-color: var(--olive); }

/* ── Hero: Domainfeld ────────────────────────────────────────────────────── */
.hm-form { margin-top: 26px; max-width: 460px; }
.hm-field { display: flex; border: 1px solid var(--button-border); background: var(--surface-raised); }
.hm-input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 15px 16px;
  min-height: 50px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 15px;
  color: var(--text-primary);
}
.hm-input::placeholder { color: var(--text-faint); }
.hm-input:focus { outline: none; }
.hm-field:focus-within { border-color: var(--ink-strong); }
.hm-submit {
  flex: 0 0 auto;
  border: none;
  border-left: 1px solid var(--button-border);
  background: var(--warm-black);
  color: var(--paper);
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 0 22px;
  min-height: 50px;
  transition: background 0.25s, color 0.25s;
}
.hm-submit:hover:not(:disabled) { background: var(--ink-strong); }
.hm-submit:disabled { opacity: 0.62; cursor: progress; }
.hm-form-micro {
  margin-top: 12px;
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  line-height: 1.7;
  color: var(--text-muted);
  text-wrap: balance;
}
.hm-error {
  margin-top: 10px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-strong);
  border-left: 2px solid var(--olive);
  padding-left: 10px;
}

/* ── Faktenband an der Falzkante ─────────────────────────────────────────── */
.hm-strip {
  border-top: 1px solid var(--warm-black);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: var(--paper);
}
.hm-strip-item {
  padding: 18px var(--gutter);
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 10px;
}
.hm-strip-item + .hm-strip-item { border-left: 1px solid var(--line); }
.hm-strip-pip { width: 5px; height: 5px; background: var(--olive); flex: 0 0 auto; }

/* ── 01 Constraint ───────────────────────────────────────────────────────── */
.hm-constraint-grid {
  display: grid;
  grid-template-columns: minmax(0, 54fr) minmax(0, 46fr);
  gap: 0 clamp(32px, 5vw, 80px);
  align-items: start;
}
.hm-surfaces { display: flex; flex-wrap: wrap; gap: 0 22px; margin-top: 26px; align-items: center; }
.hm-surface {
  font-family: var(--font-mono), monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--text-primary);
}
.hm-surface + .hm-surface { padding-left: 22px; border-left: 1px solid var(--line); }

/* ── 02 Prüfung ──────────────────────────────────────────────────────────── */
.hm-stage-grid {
  display: grid;
  grid-template-columns: minmax(0, 38fr) minmax(0, 62fr);
  gap: 0;
  border-top: 1px solid var(--warm-black);
}
.hm-probe { padding: clamp(28px, 3vw, 40px) clamp(28px, 3vw, 40px) clamp(28px, 3vw, 40px) 0; }
.hm-result {
  padding: clamp(28px, 3vw, 40px) 0 clamp(28px, 3vw, 40px) clamp(28px, 3vw, 40px);
  border-left: 1px solid var(--warm-black);
}
.hm-result:focus { outline: none; }

.hm-probe-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 20px; }
.hm-probe-k { display: inline-flex; align-items: center; gap: 8px; }
.hm-probe-pip { width: 6px; height: 6px; background: var(--olive); display: inline-block; }
.hm-probe-q {
  display: block;
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(22px, 2.3vw, 30px);
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: var(--ink-strong);
  margin-bottom: 10px;
}
.hm-probe-sub { font-size: 14px; line-height: 1.6; color: var(--text-body); margin-bottom: 18px; }
.hm-trust { list-style: none; margin-top: 16px; display: grid; gap: 8px; }
.hm-trust li {
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text-muted);
  padding-left: 14px;
  position: relative;
}
.hm-trust li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  width: 5px;
  height: 1px;
  background: var(--line-strong);
}

.hm-details { margin-top: 20px; border-top: 1px solid var(--line); }
.hm-details > summary {
  list-style: none;
  cursor: pointer;
  padding: 12px 0;
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.hm-details > summary::-webkit-details-marker { display: none; }
.hm-details > summary::after { content: "+"; color: var(--olive); }
.hm-details[open] > summary::after { content: "–"; }
.hm-details > summary:hover { color: var(--text-primary); }

.hm-log { list-style: none; display: grid; gap: 7px; padding-bottom: 12px; }
.hm-log li {
  font-family: var(--font-mono), monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.hm-log li::before { content: ""; width: 4px; height: 4px; background: var(--line-strong); flex: 0 0 auto; }
.hm-log li[data-live="true"] { color: var(--text-primary); }
.hm-log li[data-live="true"]::before { background: var(--olive); }
.hm-log-detail { color: var(--text-faint); }

.hm-target { display: flex; gap: 12px; align-items: baseline; margin-bottom: 16px; }
.hm-target-v {
  font-family: var(--font-mono), monospace;
  font-size: 12px;
  color: var(--ink-strong);
  word-break: break-all;
}

/* Ergebnis */
.hm-badge-row { display: flex; flex-wrap: wrap; gap: 12px 18px; align-items: center; margin-bottom: 16px; }
.hm-badge {
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-strong);
  background: var(--signal);
  padding: 5px 9px;
}
.hm-badge--quiet { background: transparent; border: 1px solid var(--line-strong); color: var(--text-secondary); }
.hm-confidence {
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.hm-verdict-title {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(24px, 2.8vw, 38px);
  line-height: 1.04;
  letter-spacing: -0.02em;
  color: var(--ink-strong);
  margin-bottom: 14px;
  text-wrap: balance;
}
.hm-serif {
  font-family: var(--font-editorial), Georgia, serif;
  font-size: 17px;
  line-height: 1.5;
  color: var(--text-primary);
  margin-bottom: 14px;
}
.hm-meaning {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--text-body);
  border-left: 2px solid var(--olive);
  padding-left: 14px;
}
.hm-block { margin-top: 26px; }
.hm-block .hm-k { margin-bottom: 10px; }
.hm-list { list-style: none; display: grid; gap: 10px; }
.hm-list li {
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-body);
  display: flex;
  gap: 12px;
  align-items: baseline;
}
.hm-list li::before { content: ""; width: 6px; height: 6px; flex: 0 0 auto; background: var(--line-strong); }
.hm-list--ruled li::before { background: var(--olive); }
.hm-ev-k { color: var(--text-muted); }
.hm-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; margin-top: 32px; }

.hm-stages { list-style: none; display: grid; gap: 0; }
.hm-stages li {
  display: flex;
  gap: 14px;
  align-items: baseline;
  padding: 12px 0;
  border-top: 1px solid var(--line);
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 14px;
  color: var(--text-faint);
  transition: color 250ms ease;
}
.hm-stages li:first-child { border-top: none; }
.hm-stages li[data-state="done"] { color: var(--text-secondary); }
.hm-stages li[data-state="current"] { color: var(--ink-strong); }
.hm-stages-n { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.12em; }
.hm-stages li[data-state="current"] .hm-stages-n { color: var(--olive); }

/* Beispiel vor der ersten Prüfung */
.hm-example { border: 1px solid var(--line); padding: clamp(20px, 2.2vw, 28px); background: var(--surface-raised); }
.hm-example .hm-badge { background: transparent; border: 1px dashed var(--line-strong); color: var(--text-muted); }

/* ── 03 Vier Antworten ───────────────────────────────────────────────────── */
.hm-answers { border-top: 1px solid var(--warm-black); }
.hm-answer {
  display: grid;
  grid-template-columns: 96px minmax(0, 30fr) minmax(0, 52fr);
  gap: 0 clamp(20px, 3vw, 48px);
  padding: clamp(24px, 2.6vw, 34px) 0;
  border-bottom: 1px solid var(--line);
}
.hm-answer-n {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(30px, 3.4vw, 46px);
  line-height: 0.9;
  color: var(--ink-strong);
}
.hm-answer-l {
  display: block;
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--text-muted);
  margin-bottom: 8px;
}

/* ── 04 Proof ────────────────────────────────────────────────────────────── */
.hm-proof { border-top: 1px solid var(--warm-black); }
.hm-case {
  display: grid;
  grid-template-columns: minmax(0, 34fr) minmax(0, 26fr) minmax(0, 40fr);
  gap: clamp(20px, 3vw, 48px);
  padding: clamp(26px, 3vw, 40px) 0;
  border-bottom: 1px solid var(--line);
  align-items: start;
}
.hm-case-name {
  display: block;
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(20px, 2vw, 26px);
  line-height: 1.1;
  color: var(--ink-strong);
}
.hm-case-desc {
  display: block;
  margin-top: 6px;
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.hm-case-num {
  display: block;
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(32px, 3.6vw, 48px);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--ink-strong);
}
.hm-case-cap { display: block; margin-top: 8px; font-size: 12.5px; line-height: 1.5; color: var(--text-secondary); }
.hm-case-second { margin-top: 14px; display: grid; gap: 8px; }
.hm-case-second span { display: block; font-size: 13px; line-height: 1.45; color: var(--text-body); }
.hm-case-second b {
  font-family: var(--font-mono), monospace;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-strong);
}
.hm-facts { display: grid; gap: 10px; }
.hm-fact { display: grid; grid-template-columns: 108px minmax(0, 1fr); gap: 14px; align-items: baseline; }
.hm-fact dt {
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.hm-fact dd { font-size: 13.5px; line-height: 1.55; color: var(--text-body); }
.hm-case-link {
  display: inline-block;
  margin-top: 14px;
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--line);
  padding-bottom: 2px;
  transition: color 0.25s, border-color 0.25s;
}
.hm-case-link:hover { color: var(--text-primary); border-color: var(--olive); }

/* ── 05 System ───────────────────────────────────────────────────────────── */
.hm-flow { border-top: 1px solid var(--warm-black); }
.hm-stage-row {
  display: grid;
  grid-template-columns: 64px minmax(0, 30fr) minmax(0, 22fr) minmax(0, 44fr);
  gap: 0 clamp(18px, 2.4vw, 40px);
  padding: clamp(20px, 2.2vw, 28px) 0;
  border-bottom: 1px solid var(--line);
  align-items: baseline;
}
.hm-stage-n { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.12em; color: var(--text-muted); }
.hm-stage-l {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(17px, 1.7vw, 22px);
  letter-spacing: 0.01em;
  color: var(--ink-strong);
}
.hm-stage-m { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.1em; color: var(--text-muted); }
.hm-stage-b { font-size: 14px; line-height: 1.6; color: var(--text-body); }
.hm-stage-row[data-human="true"] .hm-stage-n { color: var(--olive); }

/* ── 06 Wiedererkennung ──────────────────────────────────────────────────── */
.hm-recog { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border-top: 1px solid var(--warm-black); }
.hm-recog-item { padding: clamp(24px, 2.6vw, 36px) clamp(20px, 2.4vw, 36px) clamp(24px, 2.6vw, 36px) 0; }
.hm-recog-item + .hm-recog-item { border-left: 1px solid var(--line); padding-left: clamp(20px, 2.4vw, 36px); }
.hm-recog-n { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.18em; color: var(--olive); display: block; margin-bottom: 12px; }
.hm-recog-t { font-size: 15px; line-height: 1.55; color: var(--text-primary); }

/* ── 07 Angebot ──────────────────────────────────────────────────────────── */
.hm-offer-grid {
  display: grid;
  grid-template-columns: minmax(0, 44fr) minmax(0, 56fr);
  gap: clamp(28px, 4vw, 72px);
  border-top: 1px solid var(--warm-black);
  padding-top: clamp(28px, 3vw, 44px);
}
.hm-price {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(46px, 6vw, 84px);
  line-height: 0.92;
  letter-spacing: -0.03em;
  color: var(--ink-strong);
}
.hm-price-cap { display: block; margin-top: 10px; }
.hm-offer-facts { display: grid; gap: 0; margin-top: 26px; }
.hm-offer-fact {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 16px;
  padding: 11px 0;
  border-top: 1px solid var(--line);
  align-items: baseline;
}
.hm-offer-fact dt {
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.hm-offer-fact dd { font-size: 14px; line-height: 1.5; color: var(--text-primary); }
.hm-included { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin-top: 12px; }
.hm-included li {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-body);
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.hm-included li::before { content: ""; width: 5px; height: 5px; background: var(--olive); flex: 0 0 auto; }
.hm-risk { margin-top: 28px; border-top: 1px solid var(--line); padding-top: 18px; }
.hm-reassurance { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 18px; }
.hm-reassurance span {
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* ── 08 Entscheidung ─────────────────────────────────────────────────────── */
.hm-decision-h {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(34px, 5.4vw, 78px);
  line-height: 0.98;
  letter-spacing: -0.025em;
  color: var(--ink-strong);
  margin: 0;
}
.hm-decision-h span { display: block; }

/* ── Scroll-Reveal ───────────────────────────────────────────────────────── */
/* Dieselbe Mechanik und dieselbe Kurve wie in den Case Studies: der versteckte
   Zustand entsteht erst, wenn JavaScript den Beobachter scharf schaltet. Ohne
   JavaScript, bei einem Hydration-Fehler oder bei reduzierter Bewegung bleibt
   der Inhalt vollständig lesbar. */
.hm [data-reveal-root][data-armed="true"] [data-reveal] {
  opacity: 0;
  transform: translateY(14px);
}
.hm [data-reveal-root][data-armed="true"] [data-reveal][data-in="true"] {
  opacity: 1;
  transform: none;
  transition: opacity 620ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 620ms cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--reveal-delay, 0ms);
}

@media (prefers-reduced-motion: reduce) {
  .hm [data-reveal-root][data-armed="true"] [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

/* ── Responsiv ───────────────────────────────────────────────────────────── */
@media (max-width: 1080px) {
  .hm-answer { grid-template-columns: 72px minmax(0, 1fr); }
  .hm-answer-body { grid-column: 2; margin-top: 10px; }
  .hm-case { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .hm-case-facts { grid-column: 1 / -1; }
  .hm-stage-row { grid-template-columns: 56px minmax(0, 1fr); }
  .hm-stage-m { grid-column: 2; }
  .hm-stage-b { grid-column: 2; margin-top: 8px; }
}

@media (max-width: 900px) {
  .hm-strip { grid-template-columns: 1fr 1fr; }
  .hm-strip-item:nth-child(3) { border-left: none; border-top: 1px solid var(--line); }
  .hm-strip-item:nth-child(4) { border-top: 1px solid var(--line); }
  .hm-constraint-grid { grid-template-columns: 1fr; gap: 26px 0; }
  .hm-stage-grid { grid-template-columns: 1fr; }
  .hm-probe { padding: 26px 0; }
  .hm-result { padding: 26px 0; border-left: none; border-top: 1px solid var(--warm-black); }
  .hm-recog { grid-template-columns: 1fr; }
  .hm-recog-item { padding: 22px 0; }
  .hm-recog-item + .hm-recog-item { border-left: none; border-top: 1px solid var(--line); padding-left: 0; }
  .hm-offer-grid { grid-template-columns: 1fr; }
  .hm-included { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .hm-answer { grid-template-columns: 52px minmax(0, 1fr); }
  .hm-case { grid-template-columns: 1fr; }
  .hm-fact { grid-template-columns: 92px minmax(0, 1fr); gap: 10px; }
  .hm-offer-fact { grid-template-columns: 108px minmax(0, 1fr); gap: 12px; }
  .hm-field { flex-direction: column; align-items: stretch; }
  .hm-submit { border-left: none; border-top: 1px solid var(--button-border); padding: 15px 22px; }
  .hm-strip-item { padding: 14px var(--gutter); font-size: 9.5px; letter-spacing: 0.12em; }
}
    `}</style>
  );
}
