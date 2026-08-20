// ─── First Move: Stilschicht ──────────────────────────────────────────────────
// Ein Stylesheet für beide Produktseiten. Es benutzt ausschließlich die
// bestehenden SEESZN Tokens und Schriften aus app/globals.css. Keine neue
// Typografie, keine neue UI-Bibliothek, keine Radien, keine Schatten.
//
// Gestaltungsregeln, die hier durchgesetzt werden:
//   - Acid ist Akzent, nie Textfarbe. Als Textmarkierung nur als Unterlage
//     unter tintenschwarzer Schrift, damit der Kontrast AA bleibt.
//   - Rules sind 1px. Flächen sind Papier. Zahlen sind groß und ruhig.
//   - Bewegung liegt zwischen 150 und 250 ms und respektiert
//     prefers-reduced-motion.
//
// V6: die Prüfung ist kein kleines Widget mehr. Sie nimmt die volle Inhaltsbreite
// ein und ist der stärkste interaktive Moment der Seite.

export default function FirstMoveStyles() {
  return (
    <style>{`
/* ── Grundfläche ─────────────────────────────────────────────────────────── */
/* Die gemessene Höhe des klebenden Product Headers. 69px ab 601px Breite, 65px
   darunter, weil dort Innenabstand und Logo kleiner sind. Sie steht hier als
   Variable, damit Sprungziele und Header nicht auseinanderlaufen. */
.fm { background: var(--paper); color: var(--text-body); --fm-header-h: 69px; }
@media (max-width: 600px) { .fm { --fm-header-h: 65px; } }

/* Jedes Sprungziel hält Abstand zum Header. scroll-margin wirkt nur beim
   Scrollen und fügt dem normalen Fluss keinen Platz hinzu. Gilt für Ankerlinks
   ebenso wie für scrollIntoView aus dem Funnel. */
.fm-stage,
.fm-section,
.fm-fit,
.fm-final,
#leistungsbedingungen {
  scroll-margin-top: calc(var(--fm-header-h) + 24px);
}
.fm-wrap { max-width: 1440px; margin: 0 auto; padding-inline: var(--gutter); }
.fm-narrow { max-width: 960px; }

.fm :focus-visible {
  outline: 2px solid var(--ink-strong);
  outline-offset: 3px;
}

.fm-section { padding-block: var(--section-y); border-top: 1px solid var(--line); }
.fm-section--tight { padding-block: clamp(56px, 7vw, 96px); }

.fm-eyebrow {
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text-muted);
  display: block;
}

.fm-h1 {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(40px, 6.4vw, 88px);
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: var(--ink-strong);
  margin: 0;
  text-wrap: balance;
}

.fm-h2 {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(30px, 3.8vw, 54px);
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--ink-strong);
  margin: 0;
  text-wrap: balance;
}
.fm-h2--sm { font-size: clamp(26px, 3vw, 40px); margin-top: 12px; }

.fm-h3 {
  font-family: var(--font-body), sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-strong);
  margin: 0;
}

/* Ein einziges Wort pro Headline. Tinte auf Acid, nie Acid als Schriftfarbe.
   Das Band liegt als Hintergrund im unteren Drittel der Versalhöhe, nicht als
   Unterlänge: Wörter wie "Engpass" haben Unterlängen, ein Strich darunter würde
   sie durchschneiden und in die nächste Zeile ragen. So bleibt die Schrift
   tintenschwarz und der Kontrast erfüllt AA. */
.fm-acid {
  position: relative;
  display: inline-block;
  line-height: 1;
  padding-bottom: 0.24em;
  margin-bottom: -0.24em;
  isolation: isolate;
  color: var(--ink-strong);
}
.fm-acid::before {
  content: "";
  position: absolute;
  left: -0.04em;
  right: -0.04em;
  /* Unteres Drittel der Versalhöhe. Höher gesetzt liest sich das Band als
     Durchstreichung, tiefer als Unterstrich. */
  bottom: 0.28em;
  height: 0.20em;
  background: var(--signal);
  z-index: -1;
}

.fm-lead {
  font-family: var(--font-body), sans-serif;
  font-size: clamp(15px, 1.1vw, 17px);
  line-height: 1.6;
  color: var(--text-primary);
  max-width: 52ch;
  margin: 0;
}

.fm-body { font-size: 15px; line-height: 1.65; color: var(--text-body); max-width: 62ch; margin: 0; }
.fm-serif {
  font-family: var(--font-editorial), Georgia, serif;
  font-weight: 400;
  font-size: clamp(17px, 1.5vw, 21px);
  line-height: 1.55;
  color: var(--ink-strong);
  margin: 0;
}

/* ── Product Header ──────────────────────────────────────────────────────── */
.fm-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--paper);
  border-bottom: 1px solid var(--warm-black);
}
.fm-header-in {
  max-width: 1440px;
  margin: 0 auto;
  padding: 14px var(--gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.fm-logo {
  font-family: var(--font-display), sans-serif;
  font-weight: 800;
  font-size: 26px;
  letter-spacing: -0.07em;
  line-height: 1;
  color: var(--warm-black);
}
.fm-header-right { display: flex; align-items: center; gap: 22px; }
.fm-header-meta { display: flex; align-items: baseline; gap: 12px; }
.fm-header-label {
  font-family: var(--font-body), sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-strong);
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.fm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 46px;
  padding: 13px 24px;
  font-family: var(--font-body), sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid var(--warm-black);
  background: var(--warm-black);
  color: var(--paper);
  transition: background 200ms ease, color 200ms ease, border-color 200ms ease;
}
.fm-btn:hover { background: transparent; color: var(--ink-strong); }
.fm-btn[disabled] { opacity: 0.45; cursor: not-allowed; }
.fm-btn[disabled]:hover { background: var(--warm-black); color: var(--paper); }

.fm-btn--ghost {
  background: transparent;
  color: var(--ink-strong);
  border-color: var(--border-btn);
}
.fm-btn--ghost:hover { border-color: var(--warm-black); background: transparent; }

.fm-btn--sm { min-height: 40px; padding: 10px 18px; font-size: 11px; }

/* ── Hero ────────────────────────────────────────────────────────────────── */
.fm-hero { padding-block: clamp(48px, 6vw, 84px) clamp(40px, 5vw, 72px); }
.fm-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: clamp(32px, 5vw, 72px);
  align-items: center;
}
.fm-hero-copy { display: flex; flex-direction: column; gap: 30px; }
.fm-hero-h1-wrap { display: flex; flex-direction: column; gap: 20px; }

.fm-hero-plate { position: relative; }
.fm-hero-img {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid var(--line);
}
.fm-hero-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Overlay-Typografie: klein, architektonisch an eine Linie gesetzt. */
.fm-hero-overlay {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: linear-gradient(to top, rgba(17,17,15,0.66), rgba(17,17,15,0));
  width: 100%;
}
.fm-hero-overlay span {
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #f5f1e8;
  display: flex;
  align-items: center;
  gap: 10px;
}
.fm-hero-overlay span::before {
  content: "";
  width: 18px;
  height: 1px;
  background: var(--signal);
  flex: none;
}

/* ── Domainfeld ──────────────────────────────────────────────────────────── */
.fm-form { display: flex; flex-direction: column; gap: 12px; max-width: 620px; }
.fm-form--inset { border-top: 1px solid var(--line); padding-top: 16px; }
.fm-field { display: flex; align-items: stretch; gap: 0; border-bottom: 1px solid var(--warm-black); }
.fm-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-family: var(--font-body), sans-serif;
  font-size: 17px;
  color: var(--ink-strong);
  padding: 12px 4px;
  min-height: 48px;
}
.fm-input::placeholder { color: var(--text-faint); }
.fm-input:focus { outline: none; }
.fm-field:focus-within { box-shadow: 0 1px 0 0 var(--signal); }

/* Honeypot. Kein Mensch sieht dieses Feld, kein Screenreader liest es vor. */
.fm-hp { position: absolute; left: -9999px; width: 1px; height: 1px; }

/* Die Preiszeile bleibt sichtbar, ohne die Handlung zu überstrahlen. */
.fm-facts {
  font-family: var(--font-body), sans-serif;
  font-size: 13px;
  letter-spacing: 0.01em;
  color: var(--text-secondary);
  border-top: 1px solid var(--line);
  padding-top: 10px;
  margin: 2px 0 0;
}

.fm-micro {
  font-family: var(--font-body), sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted);
  max-width: 56ch;
}
.fm-error {
  font-family: var(--font-body), sans-serif;
  font-size: 13px;
  color: var(--clay);
  display: flex;
  gap: 8px;
  align-items: baseline;
}
.fm-error::before { content: "!"; font-family: var(--font-mono), monospace; font-weight: 500; }

/* ── Budgetband, nur auf der Google-Ads-Seite ────────────────────────────── */
.fm-bands { border: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.fm-bands-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.fm-band {
  background: transparent;
  border: 1px solid var(--line-strong);
  padding: 9px 14px;
  min-height: 40px;
  font-family: var(--font-body), sans-serif;
  font-size: 12.5px;
  color: var(--text-body);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 200ms ease, border-color 200ms ease;
}
.fm-band::before {
  content: "";
  width: 7px; height: 7px;
  border: 1px solid var(--line-strong);
  flex: none;
}
.fm-band:hover { background: var(--surface-raised); }
.fm-band[aria-pressed="true"] { border-color: var(--warm-black); color: var(--ink-strong); }
.fm-band[aria-pressed="true"]::before { background: var(--signal); border-color: var(--warm-black); }

/* ── Prüfung ─────────────────────────────────────────────────────────────── */
.fm-stage {
  border-top: 1px solid var(--warm-black);
  background: var(--paper-soft);
  padding-block: clamp(40px, 5vw, 76px);
}
.fm-stage-head { display: flex; flex-direction: column; gap: 10px; }
.fm-stage-title {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(26px, 3.4vw, 46px);
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--ink-strong);
  margin: 0;
}
.fm-stage-body {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--warm-black);
  margin-top: clamp(22px, 2.6vw, 34px);
}
.fm-stage-log {
  padding: 24px clamp(20px, 2.4vw, 34px) 24px 0;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.fm-stage-note { margin-top: auto; padding-top: 16px; }
.fm-stage-result {
  padding: 24px 0 24px clamp(24px, 3vw, 44px);
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 320px;
}
.fm-stage-result:focus { outline: none; }
.fm-stage-empty { display: flex; flex-direction: column; gap: 14px; max-width: 60ch; }

.fm-log { display: flex; flex-direction: column; gap: 9px; margin: 0; padding: 0; list-style: none; }
.fm-log li {
  display: grid;
  grid-template-columns: 12px 1fr;
  gap: 10px;
  align-items: baseline;
  font-family: var(--font-mono), monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  animation: fm-in 200ms ease both;
}
.fm-log li::before { content: "+"; color: var(--text-faint); line-height: 1.4; }
.fm-log li[data-live="true"]::before { content: "›"; color: var(--ink-strong); }
.fm-log-label { color: var(--ink-strong); text-transform: uppercase; letter-spacing: 0.1em; }
.fm-log-detail { display: block; color: var(--text-muted); text-transform: none; letter-spacing: 0.02em; margin-top: 3px; }

@keyframes fm-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }

/* ── Das Instrument ──────────────────────────────────────────────────────── */
/* Ein Gerät auf der Seite, kein Formular in einem Kasten. Es trägt eine Frage,
   ein Feld, eine Handlung und zwei Zusagen. Alle Zustände der Prüfung laufen im
   selben Rahmen ab, damit das Auge zwischen Eingabe, Verlauf und Ergebnis nicht
   springt. Nur bestehende Tokens: Papier, Tinte, 1px-Linien, Acid als Akzent. */
.fm-probe {
  border: 1px solid var(--warm-black);
  background: var(--surface-raised);
  display: flex;
  flex-direction: column;
}
.fm-probe-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 16px;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-mono), monospace;
  font-size: 9.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.fm-probe-k { display: inline-flex; align-items: center; gap: 9px; }
.fm-probe-pip {
  width: 6px; height: 6px; flex: none;
  background: var(--signal);
  animation: fm-pip 2.6s ease-in-out infinite;
}
@keyframes fm-pip { 50% { opacity: 0.28; } }
/* Tinte auf Acid, nie Acid als Schriftfarbe. */
.fm-probe-free {
  background: var(--signal);
  color: #11110f;
  padding: 3px 7px;
  letter-spacing: 0.16em;
  font-weight: 500;
  flex: none;
}

.fm-probe-body { padding: 20px 16px 18px; display: flex; flex-direction: column; }
.fm-probe-q {
  display: block;
  font-family: var(--font-body), sans-serif;
  font-size: clamp(18px, 1.5vw, 21px);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--ink-strong);
}
.fm-probe-sub {
  font-family: var(--font-body), sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 8px 0 18px;
}
.fm-probe-input {
  width: 100%;
  min-width: 0;
  border: none;
  border-bottom: 1px solid var(--warm-black);
  background: transparent;
  font-family: var(--font-body), sans-serif;
  font-size: 16px;
  color: var(--ink-strong);
  padding: 12px 2px;
  min-height: 48px;
}
.fm-probe-input::placeholder { color: var(--text-faint); }
.fm-probe-input:focus { outline: none; box-shadow: 0 1px 0 0 var(--signal); }

.fm-probe-cta {
  position: relative;
  overflow: hidden;
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  min-height: 52px;
  padding: 15px 18px;
  border: 1px solid var(--warm-black);
  background: var(--warm-black);
  color: var(--paper);
  font-family: var(--font-body), sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: left;
  transition: background 200ms ease, color 200ms ease;
}
.fm-probe-cta-line {
  position: absolute;
  top: 0; left: 0;
  height: 2px;
  width: 100%;
  background: var(--signal);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 250ms cubic-bezier(.16,1,.3,1);
}
.fm-probe-cta:hover { background: transparent; color: var(--ink-strong); }
.fm-probe-cta:hover .fm-probe-cta-line { transform: scaleX(1); }
.fm-probe-cta-arrow { flex: none; font-size: 15px; transition: transform 200ms ease; }
.fm-probe-cta:hover .fm-probe-cta-arrow { transform: translateX(4px); }

.fm-probe-body .fm-error { margin-top: 12px; }

.fm-probe-trust {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fm-probe-trust li {
  display: grid;
  grid-template-columns: 6px 1fr;
  gap: 10px;
  align-items: baseline;
  font-family: var(--font-body), sans-serif;
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-secondary);
}
.fm-probe-trust li::before {
  content: "";
  width: 6px;
  height: 6px;
  background: var(--signal);
  transform: translateY(4px);
}

.fm-probe-reads { margin-top: 14px; }
.fm-probe-reads > summary { padding: 12px 0 10px; font-size: 12.5px; color: var(--text-secondary); }
.fm-probe-reads .fm-details-body { padding-bottom: 10px; }

.fm-probe-target { display: flex; flex-direction: column; gap: 4px; margin: 0 0 16px; }
.fm-probe-target-k {
  font-family: var(--font-mono), monospace;
  font-size: 9.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.fm-probe-target-v {
  font-family: var(--font-mono), monospace;
  font-size: 13px;
  color: var(--ink-strong);
  overflow-wrap: anywhere;
}
.fm-probe-again { margin-top: 18px; align-self: flex-start; }

/* Das Beispiel vor der ersten Prüfung. Etwas zurückgenommen, damit es nie mit
   einem echten Ergebnis verwechselt wird, aber vollständig lesbar. */
.fm-example { display: flex; flex-direction: column; gap: 18px; }
.fm-example .fm-finding-title { color: var(--text-primary); }

.fm-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-strong);
  border: 1px solid var(--line-strong);
  padding: 5px 10px;
  align-self: flex-start;
}
.fm-badge--example { border-style: dashed; color: var(--text-secondary); }

.fm-badge-row { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
/* Sicherheit der Interpretation. Bewusst als Text und nicht als Prozentwert:
   eine Zahl würde eine Kalibrierung behaupten, die es hier nicht gibt. */
.fm-confidence {
  font-family: var(--font-mono), monospace;
  font-size: 9.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* ── Ablesung: was der Scan beobachtet hat ───────────────────────────────── */
/* Kein Ampelsystem, keine Punktzahl, kein Grün und kein Rot. Die Bewertung
   sitzt in einer 2px-Marke am linken Rand, die Aussage steht im Satz. */
.fm-readout { display: flex; flex-direction: column; margin: 0; }
.fm-readout > div {
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 4px 16px;
  align-items: baseline;
  border-top: 1px solid var(--line);
  padding: 10px 0 10px 12px;
  border-left: 2px solid var(--line-strong);
}
.fm-readout > div:first-child { border-top: none; }
.fm-readout > div[data-verdict="solid"] { border-left-color: var(--signal); }
.fm-readout > div[data-verdict="mixed"] { border-left-color: var(--line-strong); }
.fm-readout > div[data-verdict="weak"] { border-left-color: var(--ink-strong); }
.fm-readout dt {
  font-family: var(--font-mono), monospace;
  font-size: 9.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.fm-readout dd {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-body);
  max-width: 62ch;
}

.fm-finding-title {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(24px, 2.6vw, 38px);
  line-height: 1.05;
  letter-spacing: -0.015em;
  color: var(--ink-strong);
  margin: 0;
  max-width: 24ch;
}

.fm-evidence { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.fm-evidence li {
  display: grid;
  grid-template-columns: 14px 1fr;
  gap: 10px;
  align-items: baseline;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-body);
  max-width: 68ch;
}
.fm-evidence li::before { content: "–"; color: var(--text-faint); }

.fm-verify {
  border-top: 1px solid var(--line);
  padding-top: 14px;
  font-family: var(--font-body), sans-serif;
  color: var(--ink-strong);
  max-width: 56ch;
}

.fm-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--line); max-width: 420px; }
.fm-metric { padding: 14px 16px 0 0; display: flex; flex-direction: column; gap: 4px; }
.fm-metric-k { font-family: var(--font-mono), monospace; font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); }
.fm-metric-v {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: 26px;
  line-height: 1;
  color: var(--ink-strong);
}
/* Die Stufe wird zusätzlich als Balkenlänge gezeigt, damit die Information nicht
   allein am Wort hängt. */
.fm-metric-bar { display: block; height: 2px; width: 34px; background: var(--line-strong); margin-top: 8px; }
.fm-metric--high .fm-metric-bar { background: var(--signal); width: 34px; }
.fm-metric--medium .fm-metric-bar { background: var(--signal); width: 22px; }
.fm-metric--low .fm-metric-bar { background: var(--line-strong); width: 12px; }

.fm-block { border-top: 1px solid var(--line); padding-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.fm-block-k { font-family: var(--font-mono), monospace; font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); }
.fm-block-v { font-size: 14px; line-height: 1.6; color: var(--text-body); max-width: 68ch; }
.fm-block-v strong { color: var(--ink-strong); font-weight: 600; }

/* ── Die Ergebnissequenz ─────────────────────────────────────────────────── */
/* Vier Schritte an derselben Stelle. Der Rahmen bleibt stehen, nur der Inhalt
   wechselt: sonst springt bei jedem Schritt das halbe Layout. */
.fm-outcome { display: flex; flex-direction: column; gap: 20px; }

/* Der Fortschritt. Keine Prozentanzeige, nur vier benannte Stationen. */
.fm-seq {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}
.fm-seq li {
  display: flex;
  align-items: baseline;
  gap: 7px;
  padding: 9px 10px 9px 0;
  border-top: 2px solid transparent;
  margin-top: -1px;
}
.fm-seq li[data-state="done"] { border-top-color: var(--line-strong); }
.fm-seq li[data-state="current"] { border-top-color: var(--warm-black); }
.fm-seq-n {
  font-family: var(--font-mono), monospace;
  font-size: 9.5px;
  letter-spacing: 0.16em;
  color: var(--text-muted);
}
.fm-seq-l {
  font-family: var(--font-mono), monospace;
  font-size: 9.5px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.fm-seq li[data-state="current"] .fm-seq-n,
.fm-seq li[data-state="current"] .fm-seq-l { color: var(--ink-strong); }

/* Ein Schritt. Der Befund ist der Hero, nicht das Formular darunter. */
.fm-verdict { display: flex; flex-direction: column; gap: 16px; }
.fm-verdict-title {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(27px, 3.1vw, 44px);
  line-height: 1.02;
  letter-spacing: -0.018em;
  color: var(--ink-strong);
  margin: 0;
  max-width: 22ch;
}

/* Die kommerzielle Einordnung. Sie trägt die Aussage des Screens und steht
   deshalb ausgezeichnet, aber ohne Kasten und ohne Farbe. */
.fm-narrowing {
  font-family: var(--font-serif), Georgia, serif;
  font-size: clamp(16px, 1.35vw, 19px);
  line-height: 1.5;
  color: var(--ink-strong);
  margin: 0;
  max-width: 46ch;
  border-left: 2px solid var(--signal);
  padding-left: 16px;
}

/* Was ausgeschlossen wurde. Die Haken stehen nur an Punkten, die wirklich
   positiv gemessen wurden; die Auswahl passiert in buildOutcome(). */
.fm-ruled { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.fm-ruled li {
  display: grid;
  grid-template-columns: 15px 1fr;
  gap: 10px;
  align-items: baseline;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-body);
  max-width: 62ch;
}
.fm-ruled li::before {
  content: "✓";
  font-family: var(--font-mono), monospace;
  font-size: 11px;
  color: var(--ink-strong);
}

.fm-badge[data-kind="hidden_signal"],
.fm-badge[data-kind="limited_read"] { border-style: dashed; }
.fm-badge--move { background: var(--signal); border-color: var(--warm-black); }

/* ── Schritt 02: Geschäftslage ───────────────────────────────────────────── */
/* Vier Aussagen über das Geschäft. Bewusst keine Kanäle: welche Disziplin
   greift, ist die Arbeit, die hier gekauft wird. */
.fm-situations { display: flex; flex-direction: column; border: 1px solid var(--line); }
.fm-situation {
  appearance: none;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--line);
  text-align: left;
  padding: 14px 16px 14px 38px;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: var(--font-body), sans-serif;
  color: var(--text-body);
  transition: background 180ms ease;
}
.fm-situation:last-child { border-bottom: none; }
.fm-situation::before {
  content: "";
  position: absolute;
  left: 16px;
  top: 18px;
  width: 10px;
  height: 10px;
  border: 1px solid var(--line-strong);
}
.fm-situation:hover { background: var(--surface-raised); }
.fm-situation[aria-pressed="true"] { background: var(--surface-raised); }
.fm-situation[aria-pressed="true"]::before { background: var(--signal); border-color: var(--warm-black); }
.fm-situation-l { font-size: 15px; line-height: 1.4; color: var(--ink-strong); }
.fm-situation[aria-pressed="true"] .fm-situation-l { font-weight: 500; }
/* Erscheint erst nach der Auswahl: sie sagt, was die Angabe ändert. */
.fm-situation-n { font-size: 12.5px; line-height: 1.55; color: var(--text-secondary); max-width: 56ch; }

/* ── Schritt 03: nicht-öffentliche Signale ───────────────────────────────── */
/* Solange keine Verbindungsroute existiert, sind das beschriebene Quellen und
   keine Buttons. Ein CTA, der ins Leere führt, ist schlimmer als keiner. */
.fm-sources { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
.fm-sources li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 16px;
  align-items: baseline;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}
.fm-sources-l {
  font-family: var(--font-mono), monospace;
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-strong);
}
.fm-sources-a {
  grid-column: 1 / -1;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-body);
  max-width: 60ch;
}
.fm-sources-s {
  font-family: var(--font-mono), monospace;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  white-space: nowrap;
}

/* ── Schritt 04: der Move ────────────────────────────────────────────────── */
.fm-move-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  margin: 0;
  border-top: 1px solid var(--line);
}
.fm-move-facts > div {
  padding: 12px 16px 12px 0;
  border-bottom: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.fm-move-facts dt {
  font-family: var(--font-mono), monospace;
  font-size: 9.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.fm-move-facts dd {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--ink-strong);
}

/* ── Die Prüfung als fünf Stufen ─────────────────────────────────────────── */
.fm-stages { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.fm-stages li {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 14px;
  align-items: baseline;
  padding: 13px 0;
  border-bottom: 1px solid var(--line);
  color: var(--text-muted);
  transition: color 200ms ease;
}
.fm-stages li[data-state="done"] { color: var(--text-body); }
.fm-stages li[data-state="current"] { color: var(--ink-strong); }
.fm-stages-n {
  font-family: var(--font-mono), monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
}
.fm-stages-l {
  font-family: var(--font-display), sans-serif;
  font-size: clamp(15px, 1.5vw, 20px);
  line-height: 1.2;
}
.fm-stages li[data-state="current"] .fm-stages-l { font-weight: 600; }
/* Die laufende Stufe pulsiert dezent. Sie zeigt Arbeit, nicht Fortschritt in
   Prozent: wie lange sie dauert, wissen wir vorher nicht. */
.fm-stages li[data-state="current"] .fm-stages-n { animation: fm-pulse 1.6s ease-in-out infinite; }
@keyframes fm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@media (prefers-reduced-motion: reduce) {
  .fm-stages li[data-state="current"] .fm-stages-n { animation: none; }
}

/* Die Belege im Ergebnis tragen dieselbe Randmarke wie die Ablesung. */
.fm-readout > div[data-status="positive"] { border-left-color: var(--signal); }
.fm-readout > div[data-status="neutral"] { border-left-color: var(--line-strong); }
.fm-readout > div[data-status="opportunity"] { border-left-color: var(--ink-strong); }

.fm-actions { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; padding-top: 4px; }
.fm-link-secondary {
  font-family: var(--font-body), sans-serif;
  font-size: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  border-bottom: 1px solid var(--line-strong);
  padding-bottom: 2px;
  background: none;
  border-left: none; border-right: none; border-top: none;
  min-height: 24px;
}
.fm-link-secondary:hover { color: var(--ink-strong); }

/* ── Passendes Ergebnis nach dem Signal ──────────────────────────────────── */
.fm-relevant {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 4fr) minmax(0, 3fr);
  gap: clamp(20px, 3vw, 44px);
  align-items: end;
  border-top: 1px solid var(--warm-black);
  margin-top: clamp(28px, 3vw, 44px);
  padding-top: 22px;
}
.fm-relevant-k { display: flex; flex-direction: column; gap: 6px; }
.fm-relevant-name { font-family: var(--font-body), sans-serif; font-size: 15px; font-weight: 600; color: var(--ink-strong); }
.fm-relevant-v { display: flex; flex-direction: column; gap: 4px; }
.fm-relevant-num {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(30px, 3.4vw, 46px);
  line-height: 0.96;
  letter-spacing: -0.03em;
  color: var(--ink-strong);
}
.fm-relevant-a { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }

/* ── Aufklappbares ───────────────────────────────────────────────────────── */
.fm-details { border-top: 1px solid var(--line); }
.fm-details > summary {
  list-style: none;
  cursor: pointer;
  padding: 15px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  font-family: var(--font-body), sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-strong);
  min-height: 46px;
}
.fm-details > summary::-webkit-details-marker { display: none; }
.fm-details > summary::after {
  content: "+";
  font-family: var(--font-mono), monospace;
  font-size: 15px;
  color: var(--text-muted);
  flex: none;
}
.fm-details[open] > summary::after { content: "–"; }
.fm-details[open] > summary { color: var(--ink-strong); }
.fm-details-body { padding: 0 0 20px; display: flex; flex-direction: column; gap: 14px; max-width: 76ch; }
.fm-disclose { margin-top: clamp(32px, 4vw, 52px); }

.fm-ev { display: grid; grid-template-columns: 132px 1fr; gap: 16px; align-items: baseline; }
.fm-ev-k { font-family: var(--font-mono), monospace; font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted); }
.fm-ev-v { font-size: 13.5px; line-height: 1.6; color: var(--text-body); }

/* ── Dreischritt im Ablauf ───────────────────────────────────────────────── */
.fm-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--warm-black);
  margin-top: clamp(36px, 4vw, 60px);
}
.fm-step {
  padding: 24px 32px 0 0;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fm-step:last-child { border-right: none; }
.fm-step-num {
  font-family: var(--font-mono), monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--text-faint);
}
.fm-step-title {
  font-family: var(--font-body), sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-strong);
}
.fm-step-body { font-size: 14px; line-height: 1.55; color: var(--text-secondary); max-width: 36ch; }

/* ── Fit Check und Start ─────────────────────────────────────────────────── */
.fm-start-lead { display: flex; flex-direction: column; gap: 18px; max-width: 62ch; }
.fm-fit { display: flex; flex-direction: column; gap: 26px; }
.fm-fit-q { border: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.fm-fit-legend {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-family: var(--font-body), sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--ink-strong);
  padding: 0;
}
.fm-fit-legend span { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.16em; color: var(--text-faint); }
.fm-fit-opts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border: 1px solid var(--line); }
.fm-fit-opt {
  text-align: left;
  background: transparent;
  border: none;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 13px 16px;
  min-height: 48px;
  font-family: var(--font-body), sans-serif;
  font-size: 13.5px;
  color: var(--text-body);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 200ms ease;
}
.fm-fit-opt::before {
  content: "";
  width: 7px; height: 7px;
  border: 1px solid var(--line-strong);
  flex: none;
}
.fm-fit-opt:hover { background: var(--surface-raised); }
.fm-fit-opt[aria-pressed="true"] { background: var(--surface-raised); color: var(--ink-strong); font-weight: 500; }
.fm-fit-opt[aria-pressed="true"]::before { background: var(--signal); border-color: var(--warm-black); }

.fm-gate {
  border: 1px solid var(--warm-black);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--surface-raised);
}
.fm-gate-k { font-family: var(--font-mono), monospace; font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); }
.fm-gate-t { font-family: var(--font-body), sans-serif; font-size: 15px; font-weight: 600; color: var(--ink-strong); }

.fm-checkout {
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-top: 1px solid var(--warm-black);
  padding-top: 22px;
}
.fm-summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 32px; margin: 0; }
.fm-summary > div { display: flex; flex-direction: column; gap: 3px; border-top: 1px solid var(--line); padding-top: 9px; }
.fm-summary dt { font-family: var(--font-mono), monospace; font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); }
.fm-summary dd { margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-strong); }

/* ── Proof ───────────────────────────────────────────────────────────────── */
.fm-proof-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(24px, 3vw, 44px);
  margin-top: clamp(40px, 5vw, 64px);
}
/* Die drei Karten stehen als Spalten nebeneinander. Damit die Evidenz-Zeilen
   auf einer Linie enden, dehnt sich der Textkörper und schiebt das Aufklappen
   nach unten. Ohne das franst die Reihe unten aus. */
.fm-case { display: flex; flex-direction: column; gap: 18px; height: 100%; }
.fm-case-body { flex: 1; }
.fm-case .fm-details { margin-top: auto; }
.fm-case-plate {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--surface);
}
.fm-case-plate img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* Fällt eine Platte aus, trägt die Karte die Zahl selbst. Typografie, kein Bild. */
.fm-case-plate--type {
  background: var(--warm-black);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px;
}
.fm-case-plate--type .fm-case-plate-num {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(38px, 4.4vw, 62px);
  line-height: 0.94;
  letter-spacing: -0.03em;
  color: #f5f1e8;
}
.fm-case-plate--type .fm-case-plate-rule { width: 46px; height: 2px; background: var(--signal); }
.fm-case-plate--type .fm-case-plate-cap {
  font-family: var(--font-mono), monospace;
  font-size: 9.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(245,241,232,0.72);
}

.fm-case-head { display: flex; flex-direction: column; gap: 6px; border-top: 1px solid var(--warm-black); padding-top: 12px; }
.fm-case-label { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.24em; color: var(--ink-strong); }
.fm-case-name { font-family: var(--font-body), sans-serif; font-size: 15px; font-weight: 600; color: var(--ink-strong); }
.fm-case-desc { font-family: var(--font-mono), monospace; font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); }

.fm-case-kpi { display: flex; flex-direction: column; gap: 4px; }
.fm-case-kpi-v {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(34px, 3.6vw, 52px);
  line-height: 0.96;
  letter-spacing: -0.03em;
  color: var(--ink-strong);
}
.fm-case-kpi-c { font-size: 13px; line-height: 1.4; color: var(--text-secondary); }

.fm-case-sec { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--line); padding-top: 12px; }
.fm-case-sec-row { display: flex; flex-direction: column; gap: 1px; }
.fm-case-sec-v { font-family: var(--font-body), sans-serif; font-size: 14px; font-weight: 500; color: var(--ink-strong); }
.fm-case-sec-c { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted); }
.fm-case-note { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-faint); }
.fm-case-attr { font-size: 12.5px; line-height: 1.5; color: var(--text-secondary); }

/* ── Angebot ─────────────────────────────────────────────────────────────── */
.fm-offer { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(32px, 5vw, 72px); align-items: start; }
.fm-offer-detail { display: flex; flex-direction: column; gap: 24px; }
.fm-price {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(56px, 7vw, 104px);
  line-height: 0.88;
  letter-spacing: -0.04em;
  color: var(--ink-strong);
  margin: 0;
}
.fm-price-sub { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--text-muted); margin-top: 10px; display: block; }

.fm-facts-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 32px; margin: 0; }
.fm-facts-grid > div { display: flex; flex-direction: column; gap: 3px; border-top: 1px solid var(--line); padding: 11px 0; }
.fm-facts-grid dt { font-family: var(--font-mono), monospace; font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); }
.fm-facts-grid dd { margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-strong); }

.fm-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.fm-list li {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 10px;
  align-items: baseline;
  padding: 9px 0;
  border-bottom: 1px solid var(--line-soft);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-body);
}
.fm-list--in li::before { content: "✓"; color: var(--ink-strong); font-size: 12px; }
.fm-list--out li::before { content: "×"; color: var(--text-faint); font-size: 13px; }
.fm-list--out li { color: var(--text-muted); }

.fm-reassure { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 24px; margin-top: 26px; padding: 0; }
.fm-reassure li {
  list-style: none;
  font-family: var(--font-body), sans-serif;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--text-secondary);
  border-top: 1px solid var(--line);
  padding-top: 9px;
}

.fm-cols2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(24px, 3vw, 48px); }

/* ── FAQ ─────────────────────────────────────────────────────────────────── */
.fm-faq { margin-top: clamp(32px, 4vw, 48px); border-top: 1px solid var(--warm-black); }
.fm-faq .fm-details > summary { font-size: 16px; padding: 19px 0; }
.fm-faq .fm-details:last-child { border-bottom: 1px solid var(--line); }
.fm-faq-a { font-size: 14.5px; line-height: 1.65; color: var(--text-body); max-width: 74ch; padding-bottom: 22px; margin: 0; }

/* ── Abschluss ───────────────────────────────────────────────────────────── */
.fm-final { position: relative; border-top: 1px solid var(--warm-black); overflow: hidden; }
.fm-final-texture { position: absolute; inset: 0; z-index: 0; }
.fm-final-texture img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0.16; }
.fm-final-in { position: relative; z-index: 1; padding-block: clamp(72px, 9vw, 128px); }

/* ── Product Footer ──────────────────────────────────────────────────────── */
.fm-footer { border-top: 1px solid var(--warm-black); background: var(--paper); }
.fm-footer-in {
  max-width: 1440px;
  margin: 0 auto;
  padding: 22px var(--gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.fm-footer-links { display: flex; gap: 22px; flex-wrap: wrap; }
.fm-footer-link {
  font-family: var(--font-body), sans-serif;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding: 4px 0;
}
.fm-footer-link:hover { color: var(--ink-strong); }
.fm-footer-copy { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.14em; color: var(--text-faint); }

/* ── Skip link ───────────────────────────────────────────────────────────── */
.fm-skip {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--warm-black);
  color: var(--paper);
  padding: 12px 18px;
  font-size: 12px;
  z-index: 100;
}
.fm-skip:focus { left: 0; }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  /* minmax(0, 1fr) statt 1fr: eine implizite min-content-Untergrenze hat den
     Hero auf sehr schmalen Geräten (320px) über den Viewport hinausgedrückt und
     die Seite waagerecht scrollbar gemacht. */
  .fm-hero-grid { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .fm-hero-plate { order: -1; }
  .fm-hero-img { aspect-ratio: 16 / 9; }
  /* Die Spalten stapeln nicht in Quellreihenfolge. Links steht das Protokoll
     der technischen Prüfung, rechts der Befund: übereinandergelegt hieße das,
     der Besucher liest auf dem Telefon zuerst robots.txt und Sitemap und erst
     danach, was das für sein Geschäft bedeutet. Die Reihenfolge dreht sich
     deshalb um. Das Protokoll bleibt vollständig erhalten, es steht nur unter
     der Aussage statt darüber. */
  .fm-stage-body { grid-template-columns: 1fr; display: flex; flex-direction: column; }
  .fm-stage-log {
    order: 2;
    border-right: none;
    border-top: 1px solid var(--line);
    padding: 20px 0 0;
  }
  .fm-stage-result { order: 1; padding: 22px 0; min-height: 0; }
  /* Während der Prüfung ist das Protokoll die eigentliche Information: es gibt
     rechts noch kein Ergebnis, auf das es warten könnte. */
  .fm-stage-body:has(.fm-stages) .fm-stage-log { order: 1; border-top: none; }
  .fm-stage-body:has(.fm-stages) .fm-stage-result { order: 2; }
  .fm-relevant { grid-template-columns: 1fr; gap: 18px; align-items: start; }
  .fm-offer { grid-template-columns: 1fr; gap: 36px; }
  .fm-proof-grid { grid-template-columns: 1fr; gap: 48px; }
  .fm-case { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 6fr); gap: 24px; align-items: start; }
  .fm-case-plate { aspect-ratio: 3 / 4; }
  .fm-case-body { display: flex; flex-direction: column; gap: 16px; }
}

@media (max-width: 780px) {
  .fm-steps { grid-template-columns: 1fr; }
  .fm-step {
    border-right: none;
    border-bottom: 1px solid var(--line);
    padding-right: 0;
    padding-bottom: 22px;
  }
  .fm-step:last-child { border-bottom: none; }
  .fm-cols2 { grid-template-columns: 1fr; }
  .fm-facts-grid, .fm-summary { grid-template-columns: 1fr; gap: 0; }
  .fm-summary > div { padding-top: 9px; }
  .fm-reassure { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fm-metrics { max-width: none; }
  .fm-metric-v { font-size: 22px; }
  .fm-ev { grid-template-columns: 1fr; gap: 4px; }
  .fm-readout > div { grid-template-columns: 1fr; gap: 3px; }
  .fm-header-meta { display: none; }
}

@media (max-width: 600px) {
  .fm-case { grid-template-columns: 1fr; }
  .fm-case-plate { aspect-ratio: 4 / 3; }
  .fm-fit-opts { grid-template-columns: 1fr; }
  .fm-fit-opt { border-right: none; }
  /* Die Stationsleiste wird auf zwei Reihen gebrochen statt auf vier Spalten
     zusammengequetscht. Vier 9px-Labels nebeneinander sind auf 320px nicht
     mehr lesbar. */
  .fm-seq { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fm-narrowing { padding-left: 12px; }
  .fm-sources li { grid-template-columns: 1fr; }
  .fm-sources-s { white-space: normal; }
  .fm-move-facts { grid-template-columns: 1fr; }
  .fm-reassure { grid-template-columns: 1fr; }
  .fm-bands-grid { flex-direction: column; align-items: stretch; }
  .fm-header-in { padding: 12px var(--gutter); }
  .fm-logo { font-size: 22px; }
  .fm-actions { gap: 12px; }
  .fm-actions .fm-btn { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .fm *, .fm *::before, .fm *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
    `}</style>
  );
}
