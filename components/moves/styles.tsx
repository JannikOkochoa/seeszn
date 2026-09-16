// ─── MOVES: Stilschicht ───────────────────────────────────────────────────────
// Ein Stylesheet für die kommerzielle Fläche. Es führt keine neue Gestaltung
// ein, es setzt die bestehende fort:
//
//   - Tokens, Schriften und Rhythmus kommen aus app/globals.css
//   - Flächen sind Papier, Trennungen sind 1px, Radien gibt es nicht
//   - Acid (--olive) ist Markierung und Zustand, nie Fließtextfarbe
//   - Überschriften in Barlow Condensed, genau ein Akzentwort in Source Serif 4
//   - Bewegung auf cubic-bezier(.16,1,.3,1), dieselbe Kurve wie Nav, Hero,
//     TheShift und die Startseitensequenz
//
// Der einzige neue Baustein ist die Preisauswahl: drei Segmente mit einer
// gleitenden Markierung. Sie folgt derselben Logik wie die Signallinie der
// Navigation, nur waagerecht und mit Zustand statt Hover.
//
// Alles ist unter .mv verschachtelt, damit keine Regel auf andere Seiten wirkt.

export default function MovesStyles() {
  return (
    <style>{`
/* ── Grundfläche ─────────────────────────────────────────────────────────── */
.mv {
  background: var(--paper);
  color: var(--text-body);
  /* Der Abstand zwischen einem Abschnittskopf und dem Block darunter. Einmal
     gesetzt, damit Register, Kaufarten, Qualifizierung, Belege, Ablauf und FAQ
     denselben Absatz haben und nicht jeder seinen eigenen. */
  --block-gap: clamp(22px, 3vw, 36px);
}
.mv :focus-visible { outline: 2px solid var(--ink-strong); outline-offset: 3px; }

.mv-section {
  border-top: 1px solid var(--warm-black);
  padding: var(--section-y) var(--gutter);
  scroll-margin-top: 130px;
}
.mv-section--tight { padding-block: clamp(56px, 7vw, 96px); }
.mv-section--quiet { border-top: 1px solid var(--line); }

/* ── Kopfzeile eines Abschnitts ──────────────────────────────────────────── */
.mv-head { display: flex; align-items: baseline; gap: 18px; margin-bottom: clamp(24px, 3vw, 40px); }
.mv-index {
  font-family: var(--font-display), sans-serif;
  font-weight: 700; font-size: 13px; letter-spacing: 0.04em;
  color: var(--text-muted);
}
.mv-label {
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--text-muted);
}
.mv-rule { width: 48px; height: 2px; background: var(--olive); margin: 20px 0 22px; }

/* ── Typografie ──────────────────────────────────────────────────────────── */
.mv-h1 {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(38px, 6.4vw, 92px);
  line-height: 0.94; letter-spacing: -0.028em;
  color: var(--ink-strong); margin: 0; text-wrap: balance;
}
.mv-h2 {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(30px, 4vw, 58px);
  line-height: 1.0; letter-spacing: -0.02em;
  color: var(--ink-strong); margin: 0; text-wrap: balance;
}
.mv-h3 {
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(20px, 2.1vw, 27px);
  line-height: 1.08; letter-spacing: -0.01em;
  color: var(--ink-strong); margin: 0;
}
.mv-accent {
  font-family: var(--font-editorial), Georgia, serif;
  font-weight: 400; font-style: normal; letter-spacing: -0.012em;
}
.mv-lead {
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 17px; line-height: 1.55; color: var(--text-primary);
  max-width: 48ch; margin: 0;
}
.mv-body {
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 15px; line-height: 1.65; color: var(--text-body);
  max-width: 62ch; margin: 0;
}
.mv-micro {
  display: block;
  font-family: var(--font-mono), monospace;
  font-size: 10px; line-height: 1.7; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--text-muted);
}
.mv-k {
  display: block;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--text-muted);
}
.mv-serif {
  font-family: var(--font-editorial), Georgia, serif;
  font-size: 17px; line-height: 1.55; color: var(--text-primary);
}

/* ── Handlungen ──────────────────────────────────────────────────────────── */
.mv-cta {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  background: var(--warm-black); color: var(--paper);
  border: 1px solid var(--warm-black);
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 12px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase;
  padding: 16px 28px; min-height: 50px;
  position: relative; overflow: hidden;
  transition: background 0.25s, color 0.25s, border-color 0.25s;
}
.mv-cta:hover:not(:disabled) { background: transparent; color: var(--text-primary); }
.mv-cta:disabled { cursor: progress; opacity: 0.9; }
.mv-cta-arrow { color: var(--olive); transition: transform 300ms cubic-bezier(.16,1,.3,1); }
.mv-cta:hover:not(:disabled) .mv-cta-arrow { transform: translateX(4px); }

/* Der Ladebalken im Kauf-Button. Eine Linie, die einmal durchläuft, solange die
   Stripe-Sitzung angelegt wird. Kein Spinner: die Seite hat keine Kreise. */
.mv-cta[data-busy="true"]::after {
  content: ""; position: absolute; left: 0; bottom: 0; height: 2px; width: 100%;
  background: var(--olive); transform-origin: left;
  animation: mv-sweep 1100ms cubic-bezier(.16,1,.3,1) infinite;
}
@keyframes mv-sweep {
  0%   { transform: scaleX(0); opacity: 1; }
  70%  { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(1); opacity: 0; }
}

.mv-secondary {
  display: inline-block;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 13px; color: var(--text-muted);
  border-bottom: 1px solid var(--line-strong); padding-bottom: 2px;
  transition: color 0.25s, border-color 0.25s;
}
.mv-secondary:hover { color: var(--text-primary); border-color: var(--olive); }

/* ── Hero ────────────────────────────────────────────────────────────────── */
.mv-hero { padding: calc(var(--hero-y) + 40px) var(--gutter) clamp(40px, 5vw, 64px); }
.mv-hero-top { display: flex; align-items: baseline; gap: 16px; margin-bottom: clamp(22px, 3vw, 34px); }
.mv-hero-grid {
  display: grid; grid-template-columns: minmax(0, 58fr) minmax(0, 42fr);
  gap: clamp(28px, 4vw, 72px); align-items: end;
}
.mv-hero-aside { padding-bottom: 6px; }
.mv-hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; margin-top: 30px; }

/* Maskierte Zeilenenthüllung. Jede Zeile liegt in einem Fenster mit versteckter
   Überlauffläche und steigt einmal hinein. Läuft beim Laden, ohne Beobachter,
   weil der Hero immer im ersten Bild steht. */
.mv-mask {
  display: block;
  overflow: hidden;
  /* Raum für Unterlängen: bei line-height 0.94 liegt das g unterhalb der
     Zeilenbox und würde von overflow:hidden abgeschnitten. Der Puffer wird
     unten wieder abgezogen, damit der Zeilenabstand unverändert bleibt. */
  padding-bottom: 0.14em;
  margin-bottom: -0.14em;
}
.mv-mask > span { display: block; }
@media (prefers-reduced-motion: no-preference) {
  .mv-mask > span {
    transform: translateY(102%);
    animation: mv-rise 900ms cubic-bezier(.16,1,.3,1) forwards;
    animation-delay: var(--mask-delay, 0ms);
  }
}
@keyframes mv-rise { to { transform: translateY(0); } }

/* Die Belegzeile unter dem Hero. Trennung über Linien, nicht über Zeichen.
   Bewusst ein Raster und kein umbrechendes Flex: ein umgebrochenes Flex-Element
   nimmt seinen border-left mit in die neue Zeile und setzt dort einen Strich vor
   das erste Wort. Im Raster bricht der Text innerhalb seiner Spalte. */
.mv-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0; margin-top: 26px;
}
.mv-facts span {
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.14em; line-height: 1.7;
  text-transform: uppercase; color: var(--text-secondary);
  padding-right: 20px;
}
.mv-facts span + span { padding-left: 20px; border-left: 1px solid var(--line); }

/* Im Produktkopf steht die Belegzeile in der schmalen Spalte. Dort ist eine
   Liste lesbarer als drei enge Spalten, und sie liest sich als das, was sie
   ist: die Zusagen, die am Preis hängen. */
.mv-product-facts {
  grid-template-columns: minmax(0, 1fr);
  gap: 9px;
}
.mv-product-facts span {
  padding: 0 0 0 16px; border-left: none; position: relative;
}
.mv-product-facts span::before {
  content: ""; position: absolute; left: 0; top: 8px;
  width: 9px; height: 1px; background: var(--olive);
}
.mv-product-facts span + span { padding-left: 16px; border-left: none; }

/* ── Das Register der vier Flächen ───────────────────────────────────────── */
.mv-register { border-top: 1px solid var(--warm-black); margin-top: var(--block-gap); }
.mv-reg-head {
  display: grid; grid-template-columns: 64px minmax(0, 26fr) minmax(0, 50fr) minmax(0, 12fr) 28px;
  gap: 0 clamp(16px, 2.4vw, 40px);
  padding: 12px 0; border-bottom: 1px solid var(--line);
}
.mv-reg-row {
  display: grid; grid-template-columns: 64px minmax(0, 26fr) minmax(0, 50fr) minmax(0, 12fr) 28px;
  gap: 0 clamp(16px, 2.4vw, 40px);
  align-items: baseline;
  padding: clamp(22px, 2.6vw, 32px) 0;
  border-bottom: 1px solid var(--line);
  position: relative;
  transition: background 300ms cubic-bezier(.16,1,.3,1);
}
/* Die Anzeigelinie: dieselbe Bewegung wie die Signallinie der Navigation. */
.mv-reg-row::before {
  content: ""; position: absolute; left: 0; top: -1px; height: 1px; width: 100%;
  background: var(--olive);
  transform: scaleX(0); transform-origin: left;
  transition: transform 520ms cubic-bezier(.16,1,.3,1);
}
.mv-reg-row:hover::before, .mv-reg-row:focus-within::before { transform: scaleX(1); }
.mv-reg-row:hover, .mv-reg-row:focus-within { background: var(--surface-raised); }
.mv-reg-n {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(26px, 3vw, 40px); line-height: 0.9; color: var(--text-faint);
  transition: color 300ms;
}
.mv-reg-row:hover .mv-reg-n, .mv-reg-row:focus-within .mv-reg-n { color: var(--ink-strong); }
.mv-reg-name {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(22px, 2.4vw, 32px); line-height: 1.02; letter-spacing: -0.01em;
  color: var(--ink-strong); display: block;
}
.mv-reg-axis { display: block; margin-top: 8px; }
.mv-reg-desc { font-size: 14.5px; line-height: 1.55; color: var(--text-body); }
.mv-reg-from {
  font-family: var(--font-mono), monospace; font-size: 11px;
  letter-spacing: 0.1em; color: var(--text-primary); white-space: nowrap;
}
.mv-reg-arrow {
  justify-self: end; color: var(--olive); font-size: 15px;
  transition: transform 300ms cubic-bezier(.16,1,.3,1);
}
.mv-reg-row:hover .mv-reg-arrow, .mv-reg-row:focus-within .mv-reg-arrow { transform: translateX(5px); }
.mv-reg-link { position: absolute; inset: 0; }

/* ── Die drei Kaufarten ──────────────────────────────────────────────────── */
.mv-modes { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--warm-black); margin-top: var(--block-gap); }
.mv-mode-col { padding: clamp(24px, 2.8vw, 38px) clamp(20px, 2.4vw, 36px) clamp(24px, 2.8vw, 38px) 0; }
.mv-mode-col + .mv-mode-col { border-left: 1px solid var(--line); padding-left: clamp(20px, 2.4vw, 36px); }
.mv-mode-name {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(22px, 2.2vw, 30px); letter-spacing: 0.01em; color: var(--ink-strong);
  display: block;
}
.mv-mode-line { display: block; margin: 6px 0 14px; }
.mv-mode-commit {
  display: block; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line);
  font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.1em;
  color: var(--text-muted); line-height: 1.7;
}

/* ── Qualifizierung ──────────────────────────────────────────────────────── */
.mv-standards { display: grid; grid-template-columns: 1fr 1fr; gap: 0 clamp(32px, 5vw, 80px); border-top: 1px solid var(--warm-black); margin-top: var(--block-gap); }
.mv-standard { padding: clamp(20px, 2.2vw, 28px) 0; border-bottom: 1px solid var(--line); }
.mv-standard-l {
  display: block; margin-bottom: 9px;
  font-family: var(--font-mono), monospace; font-size: 10px;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-strong);
}
.mv-standard-l::before {
  content: ""; display: inline-block; width: 6px; height: 6px;
  background: var(--olive); margin-right: 9px; vertical-align: 1px;
}
.mv-standard p { font-size: 14px; line-height: 1.6; color: var(--text-body); margin: 0; }

.mv-never { margin-top: clamp(28px, 3.4vw, 44px); border-top: 1px solid var(--line); padding-top: 20px; }
.mv-never ul { list-style: none; display: grid; gap: 9px; margin-top: 12px; }
.mv-never li {
  font-size: 14px; line-height: 1.55; color: var(--text-secondary);
  display: flex; gap: 12px; align-items: baseline;
}
.mv-never li::before {
  content: ""; width: 9px; height: 1px; background: var(--line-strong); flex: 0 0 auto;
}

/* ── Belege ──────────────────────────────────────────────────────────────── */
.mv-proof { border-top: 1px solid var(--warm-black); margin-top: var(--block-gap); }
.mv-proof-note {
  font-size: 13.5px; line-height: 1.6; color: var(--text-secondary);
  border-left: 2px solid var(--olive); padding-left: 14px; max-width: 64ch;
  margin-bottom: clamp(24px, 3vw, 38px);
}
.mv-record {
  display: grid; grid-template-columns: minmax(0, 30fr) minmax(0, 34fr) minmax(0, 36fr);
  gap: clamp(20px, 3vw, 48px);
  padding: clamp(26px, 3vw, 40px) 0;
  border-bottom: 1px solid var(--line);
  align-items: start;
}
.mv-record-name {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(19px, 1.9vw, 25px); line-height: 1.1; color: var(--ink-strong); display: block;
}
.mv-record-scope { display: block; margin-top: 7px; }
.mv-deployed { list-style: none; display: grid; gap: 7px; margin-top: 14px; }
.mv-deployed li {
  font-size: 13.5px; line-height: 1.5; color: var(--text-body);
  display: flex; gap: 10px; align-items: baseline;
}
.mv-deployed li::before { content: ""; width: 5px; height: 5px; background: var(--olive); flex: 0 0 auto; }

/* Die Achse. Zwei gemessene Punkte, sonst nichts. Bewusst keine Kurve: es gibt
   keine Zwischenmessung, also darf keine Linie eine suggerieren. */
.mv-axis { position: relative; height: clamp(104px, 11vw, 132px); margin: 6px 0 14px; }
.mv-axis-track { position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--line-strong); }
.mv-axis-pt { position: absolute; top: 50%; transform: translate(-50%, -50%); }
.mv-axis-pt i {
  display: block; width: 9px; height: 9px; background: var(--ink-strong);
  transform: scale(0.2); opacity: 0;
  transition: transform 560ms cubic-bezier(.16,1,.3,1), opacity 420ms;
}
.mv-axis-pt--after i { background: var(--olive); }
.mv-axis-pt b {
  position: absolute; left: 50%; transform: translateX(-50%);
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(28px, 3.2vw, 44px); line-height: 1; letter-spacing: -0.025em;
  color: var(--ink-strong); bottom: 20px; white-space: nowrap;
}
.mv-axis-pt em {
  position: absolute; left: 50%; transform: translateX(-50%); top: 18px;
  font-family: var(--font-mono), monospace; font-size: 9.5px; font-style: normal;
  letter-spacing: 0.16em; color: var(--text-muted); white-space: nowrap;
}
.mv-axis-bracket {
  position: absolute; top: 50%; height: 1px; background: var(--olive);
  transform: scaleX(0); transform-origin: var(--bracket-origin, left);
  transition: transform 760ms cubic-bezier(.16,1,.3,1) 120ms;
}
[data-in="true"] .mv-axis-pt i { transform: scale(1); opacity: 1; }
[data-in="true"] .mv-axis-pt--after i { transition-delay: 420ms; }
[data-in="true"] .mv-axis-bracket { transform: scaleX(1); }

.mv-evidence { display: grid; gap: 0; }
.mv-ev {
  display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 14px;
  padding: 10px 0; border-top: 1px solid var(--line); align-items: baseline;
}
.mv-ev dt {
  font-family: var(--font-mono), monospace; font-size: 9.5px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted);
}
.mv-ev dd { font-size: 13.5px; line-height: 1.55; color: var(--text-body); }
.mv-case-link {
  display: inline-block; margin-top: 16px;
  font-family: var(--font-mono), monospace; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted);
  border-bottom: 1px solid var(--line); padding-bottom: 2px;
  transition: color 0.25s, border-color 0.25s;
}
.mv-case-link:hover { color: var(--text-primary); border-color: var(--olive); }

/* Platz für eine anonymisierte Aufnahme aus der Search Console, sobald es eine
   gibt. Der Rahmen steht bereits, damit das Bild später nichts umbaut. */
.mv-shot { border: 1px solid var(--line); background: var(--surface-raised); padding: 10px; }
.mv-shot img { display: block; width: 100%; height: auto; }
.mv-shot figcaption { margin-top: 10px; }

/* ── Produktkopf ─────────────────────────────────────────────────────────── */
.mv-product-head {
  display: grid; grid-template-columns: minmax(0, 54fr) minmax(0, 46fr);
  gap: clamp(28px, 3.4vw, 52px) clamp(32px, 4.6vw, 80px);
  padding: calc(var(--hero-y) + 34px) var(--gutter) clamp(44px, 5vw, 72px);
  align-items: start;
}
.mv-product-text  { grid-column: 1; grid-row: 1; }
.mv-product-buy   { grid-column: 2; grid-row: 1 / span 2; }
.mv-product-facts { grid-column: 1; grid-row: 2; align-self: end; }
.mv-crumb { display: flex; align-items: baseline; gap: 14px; margin-bottom: clamp(20px, 2.6vw, 30px); }
.mv-crumb a { color: var(--text-muted); transition: color 0.2s; }
.mv-crumb a:hover { color: var(--text-primary); }
.mv-product-h1 { font-size: clamp(34px, 5vw, 72px); }

/* ── Die Kaufkarte ───────────────────────────────────────────────────────── */
/* Kein Kasten mit Schatten: eine Spalte mit einer kräftigen Oberkante, wie jeder
   andere Block der Seite. Der Unterschied entsteht über Gewicht, nicht Dekor. */
.mv-buy { border-top: 2px solid var(--warm-black); padding-top: 20px; scroll-margin-top: 130px; }

.mv-switch { display: grid; grid-template-columns: repeat(3, 1fr); position: relative; border-bottom: 1px solid var(--line); }
.mv-switch-btn {
  background: none; border: none; padding: 13px 6px 15px; text-align: left;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.11em; text-transform: uppercase;
  color: var(--text-muted); position: relative; min-height: 46px;
  transition: color 260ms cubic-bezier(.16,1,.3,1);
}
.mv-switch-btn + .mv-switch-btn { border-left: 1px solid var(--line); padding-left: 14px; }
.mv-switch-btn:hover { color: var(--text-secondary); }
.mv-switch-btn[aria-selected="true"] { color: var(--ink-strong); }
.mv-switch-ind { position: absolute; bottom: -1px; left: 0; height: 2px; background: var(--olive); }

.mv-tier-kicker { margin: 20px 0 0; font-size: 14px; line-height: 1.55; color: var(--text-secondary); }
.mv-price-row { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; margin-top: 14px; }
.mv-price {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(44px, 5.6vw, 76px); line-height: 0.92; letter-spacing: -0.03em;
  color: var(--ink-strong);
}
.mv-price-note {
  font-family: var(--font-mono), monospace; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted);
}

.mv-tier-facts { display: grid; margin-top: 22px; }
.mv-tier-fact {
  display: grid; grid-template-columns: 116px minmax(0, 1fr); gap: 16px;
  padding: 11px 0; border-top: 1px solid var(--line); align-items: baseline;
}
.mv-tier-fact dt {
  font-family: var(--font-mono), monospace; font-size: 9.5px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted);
}
.mv-tier-fact dd { font-size: 13.5px; line-height: 1.55; color: var(--text-primary); }

.mv-buy-actions { margin-top: 26px; display: grid; gap: 14px; }
.mv-buy-actions .mv-cta { width: 100%; }
.mv-reassure { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; }
.mv-reassure span {
  font-family: var(--font-mono), monospace; font-size: 9.5px;
  letter-spacing: 0.12em; line-height: 1.7; text-transform: uppercase;
  color: var(--text-muted); padding-right: 14px;
}
.mv-reassure span + span { padding-left: 14px; border-left: 1px solid var(--line); }

/* Der Hinweis, wenn der Online-Kauf gerade nicht möglich ist. Kein Alarm, ein
   klarer Ersatzweg. */
.mv-notice {
  border-left: 2px solid var(--olive); padding: 2px 0 2px 14px;
  font-size: 13.5px; line-height: 1.6; color: var(--ink-strong);
}
.mv-notice a { border-bottom: 1px solid var(--line-strong); }
.mv-notice a:hover { border-color: var(--olive); }

/* ── Umfang ──────────────────────────────────────────────────────────────── */
.mv-scope { display: grid; grid-template-columns: minmax(0, 34fr) minmax(0, 66fr); gap: clamp(24px, 4vw, 72px); }
.mv-scope-list { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 12px 32px; }
.mv-scope-list li {
  font-size: 14.5px; line-height: 1.55; color: var(--text-body);
  display: flex; gap: 12px; align-items: baseline;
  padding-bottom: 12px; border-bottom: 1px solid var(--line-soft);
}
.mv-scope-list li::before { content: ""; width: 6px; height: 6px; background: var(--olive); flex: 0 0 auto; }

/* ── Ablauf ──────────────────────────────────────────────────────────────── */
.mv-flow { border-top: 1px solid var(--warm-black); margin-top: var(--block-gap); }
.mv-step {
  display: grid; grid-template-columns: 64px minmax(0, 24fr) minmax(0, 52fr) minmax(0, 14fr);
  gap: 0 clamp(18px, 2.4vw, 40px);
  padding: clamp(20px, 2.2vw, 28px) 0; border-bottom: 1px solid var(--line);
  align-items: baseline;
}
.mv-step-n { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.12em; color: var(--text-muted); }
.mv-step:first-child .mv-step-n { color: var(--olive); }
.mv-step-l {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(17px, 1.7vw, 22px); letter-spacing: 0.01em; color: var(--ink-strong);
}
.mv-step-b { font-size: 14px; line-height: 1.6; color: var(--text-body); }
.mv-step-e {
  font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.1em;
  color: var(--text-muted); justify-self: end; white-space: nowrap;
}

/* ── Grenzen und Messgrößen ──────────────────────────────────────────────── */
.mv-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 0 clamp(32px, 5vw, 80px); border-top: 1px solid var(--warm-black); margin-top: var(--block-gap); }
.mv-pair-col { padding-top: clamp(24px, 2.8vw, 36px); }
.mv-pair-col + .mv-pair-col { border-left: 1px solid var(--line); padding-left: clamp(32px, 5vw, 80px); }
.mv-plain { list-style: none; display: grid; gap: 12px; margin-top: 14px; }
.mv-plain li {
  font-size: 14px; line-height: 1.6; color: var(--text-body);
  display: flex; gap: 12px; align-items: baseline;
}
.mv-plain li::before { content: ""; width: 9px; height: 1px; background: var(--line-strong); flex: 0 0 auto; margin-top: 10px; }
.mv-plain--signal li::before { width: 6px; height: 6px; background: var(--olive); margin-top: 0; }

/* ── Kontextuelle Erweiterung ────────────────────────────────────────────── */
/* Keine Empfehlungsleiste. Ein Block, der einen Grund nennt und einen Weg. */
.mv-ext {
  display: grid; grid-template-columns: minmax(0, 40fr) minmax(0, 60fr);
  gap: clamp(24px, 4vw, 72px);
  border-top: 2px solid var(--warm-black); padding-top: clamp(24px, 2.8vw, 36px);
  align-items: start;
}
.mv-ext-h {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(22px, 2.6vw, 34px); line-height: 1.04; letter-spacing: -0.015em;
  color: var(--ink-strong); margin: 0;
}
.mv-ext-target {
  display: inline-flex; align-items: baseline; gap: 10px; margin-top: 18px;
  font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--text-primary);
  border-bottom: 1px solid var(--line-strong); padding-bottom: 4px;
  transition: color 0.25s, border-color 0.25s;
}
.mv-ext-target:hover { border-color: var(--olive); }
.mv-ext-target span { color: var(--olive); transition: transform 300ms cubic-bezier(.16,1,.3,1); }
.mv-ext-target:hover span { transform: translateX(4px); }

/* ── FAQ ─────────────────────────────────────────────────────────────────── */
.mv-faq { border-top: 1px solid var(--warm-black); margin-top: var(--block-gap); }
.mv-faq details { border-bottom: 1px solid var(--line); }
.mv-faq summary {
  list-style: none; cursor: pointer; padding: clamp(16px, 1.8vw, 22px) 0;
  display: grid; grid-template-columns: minmax(0, 1fr) 24px; gap: 20px; align-items: baseline;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: clamp(15px, 1.5vw, 18px); font-weight: 500; line-height: 1.4;
  color: var(--ink-strong); transition: color 0.2s;
}
.mv-faq summary::-webkit-details-marker { display: none; }
.mv-faq summary::after {
  content: "+"; justify-self: end; color: var(--olive);
  font-family: var(--font-mono), monospace; font-size: 16px; line-height: 1;
  transition: transform 300ms cubic-bezier(.16,1,.3,1);
}
.mv-faq details[open] summary::after { content: "–"; }
.mv-faq summary:hover { color: var(--text-secondary); }
.mv-faq-a {
  padding: 0 0 clamp(18px, 2vw, 24px); max-width: 68ch;
  font-size: 14.5px; line-height: 1.68; color: var(--text-body);
}
@media (prefers-reduced-motion: no-preference) {
  .mv-faq details[open] .mv-faq-a { animation: mv-fade 420ms cubic-bezier(.16,1,.3,1); }
}
@keyframes mv-fade { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }

/* ── Abschluss ───────────────────────────────────────────────────────────── */
.mv-close-h {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(32px, 5.2vw, 76px); line-height: 0.98; letter-spacing: -0.025em;
  color: var(--ink-strong); margin: 0;
}
.mv-close-h span { display: block; }
.mv-close-grid { display: grid; grid-template-columns: minmax(0, 56fr) minmax(0, 44fr); gap: clamp(28px, 4vw, 72px); align-items: end; }
.mv-close-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; margin-top: 28px; }

/* ── Briefing nach dem Kauf ──────────────────────────────────────────────── */
.mv-brief { display: grid; grid-template-columns: minmax(0, 38fr) minmax(0, 62fr); gap: clamp(28px, 4vw, 72px); align-items: start; }
.mv-form { display: grid; gap: 18px; }
.mv-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.mv-field { display: grid; gap: 7px; }
.mv-field label {
  font-family: var(--font-mono), monospace; font-size: 9.5px;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted);
}
.mv-field input, .mv-field textarea, .mv-field select {
  width: 100%; border: 1px solid var(--button-border); background: var(--surface-raised);
  padding: 13px 14px; min-height: 48px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 15px; color: var(--text-primary);
  transition: border-color 0.25s, background 0.25s;
}
.mv-field textarea { min-height: 112px; resize: vertical; line-height: 1.6; }
.mv-field input::placeholder, .mv-field textarea::placeholder { color: var(--text-faint); }
.mv-field input:focus, .mv-field textarea:focus, .mv-field select:focus {
  outline: none; border-color: var(--ink-strong); background: var(--paper-soft);
}
.mv-field[data-invalid="true"] input, .mv-field[data-invalid="true"] textarea { border-color: var(--clay); }
.mv-field-err { font-size: 12.5px; line-height: 1.5; color: var(--clay); }

.mv-receipt { border-top: 2px solid var(--warm-black); padding-top: 18px; }
.mv-receipt dl { display: grid; }
.mv-receipt .mv-tier-fact:first-child { border-top: none; }

.mv-done { border-left: 2px solid var(--olive); padding-left: 16px; }

/* ══ PREISE: Entscheidungsfläche ═════════════════════════════════════════ */
/* Der Kopf dieser Seite ist reduziert (72px statt 106px). Alle Abstände nach
   oben rechnen deshalb gegen einen kleineren Wert als im Rest der Website. */
.mv-pricing { padding-top: 72px; }

/* ── Einstieg: die Frage, dann die zwei Wege ─────────────────────────────── */
/* Der Einstieg darf kein Bild verbrauchen. Überschrift, ein Satz und beide Wege
   stehen zusammen im ersten Viewport; dafür ist die Überschrift bewusst kleiner
   gesetzt als auf einer Editorial-Seite. */
.mv-entry { padding: clamp(36px, 4.4vw, 64px) var(--gutter) 0; }
.mv-entry-top { display: flex; align-items: baseline; gap: 16px; margin-bottom: clamp(16px, 2vw, 24px); }
.mv-entry-h {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(32px, 4.6vw, 62px); line-height: 0.98; letter-spacing: -0.025em;
  color: var(--ink-strong); margin: 0; text-wrap: balance; max-width: 18ch;
}
.mv-entry-lead {
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: clamp(15px, 1.5vw, 17px); line-height: 1.55;
  color: var(--text-primary); max-width: 52ch; margin: 18px 0 0;
}

/* Zwei waagerechte Zonen, keine Kacheln. Jede Zone ist eine Aufgabe, kein Tarif:
   deshalb steht in dieser Ansicht auch kein Preis. Ein "ab 99 €" neben
   "2.490 €" würde den teureren Weg künstlich teuer aussehen lassen, obwohl
   beide völlig verschiedene Aufgaben lösen. */
.mv-paths { margin-top: clamp(28px, 3.4vw, 44px); border-top: 1px solid var(--warm-black); }
.mv-path {
  display: grid;
  grid-template-columns: 64px minmax(0, 30fr) minmax(0, 46fr) auto;
  gap: 0 clamp(18px, 2.6vw, 44px);
  align-items: center;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid var(--line);
  padding: clamp(26px, 3.2vw, 44px) 0;
  position: relative;
  transition: background 320ms cubic-bezier(.16,1,.3,1);
}
.mv-path::before {
  content: ""; position: absolute; left: 0; top: -1px; height: 1px; width: 100%;
  background: var(--accent); transform: scaleX(0); transform-origin: left;
  transition: transform 520ms cubic-bezier(.16,1,.3,1);
}
.mv-path:hover, .mv-path:focus-visible { background: var(--surface-raised); }
.mv-path:hover::before, .mv-path:focus-visible::before { transform: scaleX(1); }
.mv-path-n {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(26px, 3vw, 40px); line-height: 0.9; color: var(--text-faint);
  transition: color 320ms;
}
.mv-path:hover .mv-path-n { color: var(--accent); }
.mv-path-name {
  display: block;
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(24px, 3vw, 40px); line-height: 1.0; letter-spacing: -0.02em;
  color: var(--ink-strong);
}
.mv-path-for { display: block; margin-top: 10px; }
.mv-path-body { font-size: 14.5px; line-height: 1.6; color: var(--text-body); margin: 0; }
.mv-path-go {
  justify-self: end;
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 12px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase;
  color: var(--ink-strong); white-space: nowrap;
}
.mv-path-go span { color: var(--accent); transition: transform 300ms cubic-bezier(.16,1,.3,1); }
.mv-path:hover .mv-path-go span { transform: translateX(5px); }

/* ── Der Wegschalter über einer Produktansicht ───────────────────────────── */
/* Wenn ein Weg gewählt ist, schrumpft die Wahl auf eine Zeile. Sie bleibt
   sichtbar, damit niemand den Zurück-Knopf braucht, um den anderen Weg zu
   sehen, und sie trägt keinen Preis. */
.mv-pathbar {
  display: flex; align-items: stretch; gap: 0;
  border-bottom: 1px solid var(--line);
  padding-inline: var(--gutter);
  background: var(--paper);
}
.mv-pathbar-btn {
  background: none; border: none; position: relative;
  padding: 15px 26px 14px 0; min-height: 48px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-muted);
  transition: color 260ms cubic-bezier(.16,1,.3,1);
}
.mv-pathbar-btn + .mv-pathbar-btn { padding-left: 26px; border-left: 1px solid var(--line); }
.mv-pathbar-btn:hover { color: var(--text-secondary); }
.mv-pathbar-btn[aria-selected="true"] { color: var(--ink-strong); }
.mv-pathbar-btn::after {
  content: ""; position: absolute; left: 0; bottom: -1px; height: 2px;
  width: 100%; background: var(--accent);
  transform: scaleX(0); transform-origin: left;
  transition: transform 420ms cubic-bezier(.16,1,.3,1);
}
.mv-pathbar-btn + .mv-pathbar-btn::after { left: 26px; width: calc(100% - 26px); }
.mv-pathbar-btn[aria-selected="true"]::after { transform: scaleX(1); }

/* ── First Move: die Entscheidungsfläche ─────────────────────────────────── */
.mv-fm-head {
  display: grid; grid-template-columns: minmax(0, 54fr) minmax(0, 46fr);
  gap: clamp(28px, 4vw, 72px);
  padding: clamp(34px, 4.2vw, 60px) var(--gutter) clamp(28px, 3.4vw, 44px);
  align-items: start;
}
.mv-fm-statement {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(34px, 4.8vw, 68px); line-height: 0.98; letter-spacing: -0.028em;
  color: var(--ink-strong); margin: 0; text-wrap: balance;
}
.mv-fm-sub {
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: clamp(15px, 1.5vw, 17px); line-height: 1.6;
  color: var(--text-primary); max-width: 46ch; margin: 20px 0 0;
}
/* Preisblock. Die Zahl steht groß, der Rahmen darunter klein: Festpreis, netto,
   keine Stufen. */
.mv-fm-priceblock { border-top: 2px solid var(--warm-black); padding-top: 20px; }
.mv-fm-price {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(50px, 6.4vw, 92px); line-height: 0.9; letter-spacing: -0.035em;
  color: var(--ink-strong); display: block;
}
.mv-fm-price-note {
  display: block; margin-top: 12px;
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted);
}

/* Vier technische Angaben. Datenblatt, keine Vorteilskacheln: Wert groß,
   Beschriftung klein, Trennung über Haarlinien. */
.mv-specs {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--warm-black);
  border-bottom: 1px solid var(--line);
  /* Linien über die volle Breite, Inhalt im Satzspiegel: dieselbe Regel wie
     bei .mv-section und .mv-pathbar. */
  padding-inline: var(--gutter);
}
.mv-spec { padding: clamp(20px, 2.4vw, 30px) clamp(16px, 2vw, 28px) clamp(18px, 2.2vw, 26px) 0; }
.mv-spec + .mv-spec { border-left: 1px solid var(--line); padding-left: clamp(16px, 2vw, 28px); }
.mv-spec-v {
  display: block;
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(20px, 2.2vw, 30px); line-height: 1.0; letter-spacing: -0.01em;
  color: var(--ink-strong);
}
.mv-spec-k {
  display: block; margin-top: 10px;
  font-family: var(--font-mono), monospace;
  font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted);
  line-height: 1.7;
}

/* ── Leistungsumfang als nummerierte Zeilen ──────────────────────────────── */
.mv-steps { border-top: 1px solid var(--warm-black); margin-top: var(--block-gap); }
.mv-stepline {
  display: grid; grid-template-columns: 56px minmax(0, 22fr) minmax(0, 60fr);
  gap: 0 clamp(18px, 2.4vw, 40px);
  padding: clamp(16px, 1.9vw, 24px) 0; border-bottom: 1px solid var(--line);
  align-items: baseline;
}
.mv-stepline-n { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.12em; color: var(--accent); }
.mv-stepline-l {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(16px, 1.6vw, 21px); letter-spacing: 0.01em; color: var(--ink-strong);
}
.mv-stepline-b { font-size: 14px; line-height: 1.6; color: var(--text-body); }

/* ── Grenzen: was First Move nicht ist ───────────────────────────────────── */
.mv-notlist { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 32px; margin-top: 16px; }
.mv-notlist li {
  font-size: 14px; line-height: 1.55; color: var(--text-secondary);
  display: flex; gap: 12px; align-items: baseline;
}
.mv-notlist li::before { content: ""; width: 9px; height: 1px; background: var(--line-strong); flex: 0 0 auto; margin-top: 10px; }

/* ── Klebende Kaufleiste ─────────────────────────────────────────────────── */
/* Erscheint erst, wenn der Preisblock durchgescrollt ist, und verschwindet
   wieder, sobald der Abschluss-CTA im Bild steht. Sie verdeckt nichts: der
   Inhalt bekommt unten Platz in derselben Höhe. */
.mv-sticky {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 90;
  background: var(--paper);
  border-top: 1px solid var(--warm-black);
  padding: 12px var(--gutter);
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  transform: translateY(101%);
  transition: transform 460ms cubic-bezier(.16,1,.3,1);
}
.mv-sticky[data-shown="true"] { transform: translateY(0); }
.mv-sticky-what { display: flex; align-items: baseline; gap: 14px; min-width: 0; }
.mv-sticky-name {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: 17px; letter-spacing: 0.01em; color: var(--ink-strong); white-space: nowrap;
}
.mv-sticky-price {
  font-family: var(--font-mono), monospace; font-size: 12px;
  letter-spacing: 0.08em; color: var(--text-secondary); white-space: nowrap;
}
.mv-sticky .mv-cta { padding: 13px 24px; min-height: 44px; flex: 0 0 auto; }
.mv-sticky-pad { height: 0; }
.mv-sticky-pad[data-shown="true"] { height: 76px; }

@media (prefers-reduced-motion: reduce) {
  .mv-path::before, .mv-pathbar-btn::after, .mv-sticky, .mv-path-go span { transition: none !important; }
}

/* ── Responsiv ───────────────────────────────────────────────────────────── */
@media (max-width: 1080px) {
  .mv-fm-head { grid-template-columns: minmax(0, 1fr); gap: 30px; }
}

@media (max-width: 900px) {
  /* Der Weg wird zur gestapelten Zone. Die Handlung rutscht unter den Text,
     damit sie nicht neben einer zweizeiligen Überschrift klemmt. */
  .mv-path {
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 0 18px;
    padding: clamp(24px, 4vw, 32px) 0;
    align-items: start;
  }
  .mv-path-body { grid-column: 2; margin-top: 12px; }
  .mv-path-go { grid-column: 2; justify-self: start; margin-top: 18px; }
  .mv-specs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mv-spec:nth-child(odd) { padding-left: 0; border-left: none; }
  .mv-spec:nth-child(n+3) { border-top: 1px solid var(--line); }
  .mv-stepline { grid-template-columns: 44px minmax(0, 1fr); }
  .mv-stepline-b { grid-column: 2; margin-top: 8px; }
  .mv-notlist { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .mv-pricing { padding-top: 92px; }
  .mv-entry { padding-top: clamp(24px, 6vw, 34px); }
  .mv-pathbar { overflow-x: auto; }
  .mv-pathbar-btn { font-size: 11px; letter-spacing: 0.08em; padding-right: 18px; white-space: nowrap; }
  .mv-pathbar-btn + .mv-pathbar-btn { padding-left: 18px; }
  .mv-pathbar-btn + .mv-pathbar-btn::after { left: 18px; width: calc(100% - 18px); }
  .mv-sticky { padding: 10px var(--gutter); gap: 12px; }
  .mv-sticky-what { flex-direction: column; gap: 2px; }
  .mv-sticky-name { font-size: 15px; }
  .mv-sticky-price { font-size: 11px; }
  .mv-sticky .mv-cta { padding: 12px 18px; font-size: 11px; letter-spacing: 0.06em; }
  .mv-sticky-pad[data-shown="true"] { height: 84px; }
}

/* ══ BACKLINKS: der Konfigurator ══════════════════════════════════════════ */
/* Der Konfigurator ist das Produkt. Er bekommt deshalb die kräftige Oberkante,
   die sonst nur Angebot und Erweiterung tragen, und sonst keine Auszeichnung:
   kein Kasten, kein Schatten, kein Radius. Gewicht entsteht über Typografie und
   Linien, wie überall sonst auf der Seite. */

.mv-cfg { border-top: 2px solid var(--warm-black); scroll-margin-top: 120px; }

/* Der Kopf dieser einen Seite atmet weniger als die übrigen Produktköpfe. Wer
   hier ankommt, will konfigurieren; Überschrift, Zeile und Belege dürfen dafür
   nicht das erste Bild verbrauchen. Der Regler muss ohne Scrollen erreichbar
   sein, sonst ist die Kerninteraktion versteckt. */
.mv-hero--cfg {
  padding-top: calc(var(--hero-y) * 0.58 + 26px);
  padding-bottom: clamp(22px, 2.6vw, 34px);
}
.mv-hero--cfg .mv-h1 { margin-bottom: 0; }
.mv-hero--cfg .mv-rule { margin: 16px 0 18px; }
.mv-hero--cfg .mv-facts { margin-top: 20px; margin-bottom: clamp(20px, 2.4vw, 30px); }
/* Dieselbe Rolle innerhalb eines Abschnitts: die drei Belegzeilen stehen
   zwischen Fließtext und Konfigurator und brauchen dort denselben Absatz. */
.mv-section .mv-facts { margin-top: 22px; margin-bottom: clamp(22px, 2.6vw, 34px); }

/* ── Kopfzeile: Kaufart links, Zielmarkt rechts ──────────────────────────── */
.mv-cfg-top {
  display: flex; align-items: stretch; justify-content: space-between;
  gap: 24px; border-bottom: 1px solid var(--line);
}

.mv-mode { display: flex; position: relative; }
.mv-mode-btn {
  background: none; border: none; position: relative;
  padding: 16px 26px 17px 0; text-align: left;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 12px; font-weight: 600; letter-spacing: 0.11em; text-transform: uppercase;
  color: var(--text-muted); min-height: 52px;
  display: flex; align-items: center; gap: 12px;
  transition: color 260ms cubic-bezier(.16,1,.3,1);
}
.mv-mode-btn + .mv-mode-btn { padding-left: 26px; border-left: 1px solid var(--line); }
.mv-mode-btn:hover { color: var(--text-secondary); }
.mv-mode-btn[aria-pressed="true"] { color: var(--ink-strong); }
/* Der Rabatt ist eine Tatsache an der Kaufart, kein Störer. Mono, klein,
   Acid nur als Farbe, keine Fläche, kein Rahmen, keine Durchstreichung. */
.mv-mode-save {
  font-family: var(--font-mono), monospace;
  font-size: 9.5px; letter-spacing: 0.14em; color: var(--text-faint);
  transition: color 260ms;
}
.mv-mode-btn[aria-pressed="true"] .mv-mode-save { color: var(--olive); }
.mv-mode-ind { position: absolute; bottom: -1px; height: 2px; background: var(--olive); }

/* ── Werte: Menge, Gesamtpreis, Stückpreis ───────────────────────────────── */
/* Drei feste Rasterspalten. Die Zahlen wachsen nach rechts in den eigenen
   Bereich hinein, deshalb verschiebt ein Stellenwechsel nichts. */
.mv-cfg-values {
  display: grid;
  grid-template-columns: minmax(0, 34fr) minmax(0, 38fr) minmax(0, 28fr);
  gap: clamp(20px, 3vw, 48px);
  padding: clamp(22px, 2.6vw, 34px) 0 clamp(20px, 2.4vw, 30px);
  align-items: start;
}
.mv-cfg-cell { min-width: 0; }
.mv-cfg-k {
  display: block; margin-bottom: 10px;
  font-family: var(--font-mono), monospace;
  font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--text-muted);
}
/* Tabellenziffern in jeder Zahl: gleiche Stellenbreite, kein Zittern beim
   Wechsel von 9 auf 10 oder von 99 auf 100. */
.mv-num {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-variant-numeric: tabular-nums; letter-spacing: -0.03em;
  color: var(--ink-strong); line-height: 0.88; display: block;
}
.mv-num--qty { font-size: clamp(64px, 9.5vw, 132px); }
.mv-num--total { font-size: clamp(38px, 5.2vw, 72px); line-height: 0.92; }
.mv-num--unit { font-size: clamp(24px, 2.8vw, 36px); line-height: 0.95; }
/* Cent kleiner als Euro. Ein "161,10" soll wie ein Preis aussehen und nicht wie
   eine Messreihe. */
.mv-cents { font-size: 0.56em; letter-spacing: -0.01em; }
.mv-cfg-sub {
  display: block; margin-top: 12px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-secondary);
}
.mv-cfg-note {
  display: block; margin-top: 8px;
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.1em; color: var(--text-muted); line-height: 1.6;
}
.mv-cfg-note--signal { color: var(--olive); }
/* Der Träger der wechselnden Zahl. Feste Höhe, damit der Austausch nichts
   verschiebt, während die alte Zahl noch ausblendet. */
.mv-swap { position: relative; display: block; }
.mv-swap > * { display: block; }

/* ── Die Menge als Eingabefeld ────────────────────────────────────────────── */
/* Ruhezustand: eine anklickbare Fläche um die bestehende Zahl, ohne eigene
   Kastenoptik. Die Unterstreichung erscheint erst bei Berührung, dieselbe
   Sprache wie überall sonst auf dieser Seite. */
.mv-qty-edit {
  display: block; width: 100%; background: none; border: none; margin: 0; padding: 0 0 4px;
  text-align: left; cursor: text; color: inherit; font: inherit;
  position: relative;
}
.mv-qty-edit::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2px;
  background: var(--accent);
  transform: scaleX(0); transform-origin: left;
  transition: transform 260ms cubic-bezier(.16,1,.3,1);
}
.mv-qty-edit:hover::after, .mv-qty-edit:focus-visible::after { transform: scaleX(1); }
.mv-qty-edit:focus-visible { outline: none; }
/* Der Fokusring der Seite bleibt erhalten, nur eigens für dieses Feld auf die
   Unterstreichung übertragen statt als Kasten um die riesige Ziffer gelegt. */
.mv-qty-edit:focus-visible .mv-num,
.mv-qty-edit:focus-visible .mv-swap { outline: none; }

/* Bearbeitungszustand: dieselbe Typografie, jetzt als natives Feld. Die
   Unterstreichung bleibt stehen, damit der Wechsel keinen Sprung erzeugt. */
.mv-qty-input {
  display: block; width: 100%; background: none;
  border: none; border-bottom: 2px solid var(--accent);
  margin: 0; padding: 0 0 4px; outline: none;
  -moz-appearance: textfield;
}
.mv-qty-input::-webkit-outer-spin-button,
.mv-qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.mv-qty-input::selection { background: var(--accent); color: var(--paper); }

@media (prefers-reduced-motion: reduce) {
  .mv-qty-edit::after { transition: none; }
}

/* ── Der Mengenregler ────────────────────────────────────────────────────── */
.mv-slider { padding: clamp(10px, 1.6vw, 18px) 10px 0; }
.mv-slider-rail {
  position: relative; height: 56px; display: flex; align-items: center;
  touch-action: pan-y;
}
.mv-slider-track {
  position: absolute; left: 0; right: 0; height: 1px; background: var(--line-strong);
}
.mv-slider-fill {
  position: absolute; left: 0; height: 2px; background: var(--olive);
  transform-origin: left;
}
/* Rasterpunkte. Sie sind das Versprechen, dass zwischen den Stufen nichts liegt. */
.mv-slider-stop {
  position: absolute; top: 50%; width: 7px; height: 7px;
  transform: translate(-50%, -50%);
  background: var(--paper); border: 1px solid var(--line-strong);
  transition: background 260ms, border-color 260ms;
}
.mv-slider-stop[data-passed="true"] { background: var(--olive); border-color: var(--olive); }
.mv-slider-thumb {
  position: absolute; top: 50%; width: 20px; height: 20px;
  transform: translate(-50%, -50%);
  background: var(--warm-black); border: 2px solid var(--warm-black);
  pointer-events: none; z-index: 2;
}
.mv-slider-thumb::after {
  content: ""; position: absolute; inset: 4px; background: var(--olive);
  opacity: 0; transition: opacity 200ms;
}
.mv-slider-rail:hover .mv-slider-thumb::after,
.mv-slider-rail[data-dragging="true"] .mv-slider-thumb::after,
.mv-slider-input:focus-visible ~ .mv-slider-thumb::after { opacity: 1; }

/* Die Bewegung. Beim Ziehen ohne Übergang, sonst würde der Griff dem Finger
   hinterherlaufen. Bei Klick, Tastatur und beim Sprung auf die Monatsmenge mit
   der Kurve des Hauses. */
.mv-slider-fill, .mv-slider-thumb { transition: none; }
.mv-slider-rail[data-dragging="false"] .mv-slider-fill,
.mv-slider-rail[data-dragging="false"] .mv-slider-thumb {
  transition: left 420ms cubic-bezier(.16,1,.3,1), width 420ms cubic-bezier(.16,1,.3,1);
}
.mv-slider-rail[data-autostep="true"] .mv-slider-fill,
.mv-slider-rail[data-autostep="true"] .mv-slider-thumb {
  transition: left 620ms cubic-bezier(.16,1,.3,1), width 620ms cubic-bezier(.16,1,.3,1);
}

/* Der native Regler liegt unsichtbar darüber. Er bringt Tastatur, Touch und die
   Semantik mit; gezeichnet wird alles darunter. */
.mv-slider-input {
  position: absolute; left: 0; width: 100%; height: 56px; margin: 0;
  opacity: 0; cursor: pointer; z-index: 3; -webkit-appearance: none; appearance: none;
  background: transparent;
}
.mv-slider-input::-webkit-slider-thumb { -webkit-appearance: none; width: 44px; height: 56px; }
.mv-slider-input::-moz-range-thumb { width: 44px; height: 56px; border: none; opacity: 0; }

.mv-slider-scale { display: flex; margin-top: 14px; }
.mv-slider-tick {
  position: absolute; transform: translateX(-50%);
  text-align: center;
  font-family: var(--font-mono), monospace;
  font-size: 11px; letter-spacing: 0.08em; font-variant-numeric: tabular-nums;
  color: var(--text-faint);
  background: none; border: none; padding: 10px 8px; min-width: 44px; min-height: 44px;
  transition: color 260ms cubic-bezier(.16,1,.3,1);
}
.mv-slider-ticks { position: relative; height: 44px; margin-top: 6px; }
.mv-slider-tick:hover { color: var(--text-secondary); }
.mv-slider-tick[data-active="true"] { color: var(--ink-strong); font-weight: 500; }
.mv-slider-tick[data-disabled="true"] { color: var(--line); cursor: default; }
.mv-slider-tick[data-edge="start"] { transform: translateX(-50%); text-align: left; }
.mv-slider-tick[data-edge="end"] { transform: translateX(-50%); text-align: right; }

/* ── Über 100: eigenes Bedienelement ─────────────────────────────────────── */
.mv-custom { margin-top: clamp(18px, 2.2vw, 26px); }
.mv-custom-btn {
  display: flex; align-items: baseline; gap: 18px; width: 100%;
  background: none; border: none; border-top: 1px solid var(--line);
  padding: 16px 0 0; text-align: left; min-height: 48px;
  transition: border-color 260ms;
}
.mv-custom-btn:hover { border-color: var(--line-strong); }
.mv-custom-btn[aria-pressed="true"] { border-color: var(--accent); }
.mv-custom-n {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(20px, 2.2vw, 28px); line-height: 0.9;
  color: var(--text-faint); transition: color 260ms;
}
.mv-custom-btn:hover .mv-custom-n { color: var(--text-secondary); }
.mv-custom-btn[aria-pressed="true"] .mv-custom-n { color: var(--accent); }
.mv-custom-l {
  display: block;
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--ink-strong);
}
.mv-custom-s { display: block; margin-top: 6px; font-size: 13.5px; line-height: 1.5; color: var(--text-muted); }

/* ── Mindestlaufzeit am Preis ────────────────────────────────────────────── */
/* Ruhig gesetzt, nicht als Warnung: eine Bindung ist eine Tatsache des
   Angebots, keine Ausnahme, die entschuldigt werden müsste. */
.mv-cfg-term {
  display: block; margin-top: 14px; padding-top: 12px;
  border-top: 1px solid var(--line);
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.12em; line-height: 1.9;
  text-transform: uppercase; color: var(--ink-strong);
}
.mv-review-commit {
  display: block; margin-top: 8px;
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.1em; line-height: 1.7; color: var(--ink-strong);
}

/* ── Fragen: zugeklappte Zeilen, Antwort immer im HTML ───────────────────── */
.mv-questions { border-top: 1px solid var(--warm-black); margin-top: clamp(18px, 2.2vw, 28px); }
.mv-question { border-bottom: 1px solid var(--line); }
.mv-question > summary {
  list-style: none; cursor: pointer;
  display: grid; grid-template-columns: minmax(0, 1fr) 24px; gap: 20px; align-items: baseline;
  padding: clamp(15px, 1.8vw, 21px) 0; min-height: 48px;
}
.mv-question > summary::-webkit-details-marker { display: none; }
.mv-question > summary::after {
  content: "+"; justify-self: end; color: var(--accent);
  font-family: var(--font-mono), monospace; font-size: 15px; line-height: 1;
}
.mv-question[open] > summary::after { content: "–"; }
.mv-question-q {
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: clamp(15px, 1.5vw, 17px); font-weight: 500; line-height: 1.4;
  color: var(--ink-strong); margin: 0;
}
.mv-question > summary:hover .mv-question-q { color: var(--text-secondary); }
.mv-question-a {
  margin: 0; padding: 0 0 clamp(16px, 1.9vw, 22px); max-width: 70ch;
  font-size: 14.5px; line-height: 1.65; color: var(--text-body);
}
@media (prefers-reduced-motion: no-preference) {
  .mv-question[open] .mv-question-a { animation: mv-fade 220ms cubic-bezier(.16,1,.3,1); }
}

/* ── Ein Beleg ───────────────────────────────────────────────────────────── */
.mv-proof-unit {
  display: grid; grid-template-columns: minmax(0, 40fr) minmax(0, 60fr);
  gap: clamp(22px, 3vw, 56px);
  border-top: 1px solid var(--warm-black); margin-top: 16px; padding-top: clamp(20px, 2.4vw, 30px);
  align-items: start;
}
.mv-proof-figure {
  display: block;
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(34px, 4.4vw, 58px); line-height: 0.94; letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums; color: var(--ink-strong);
}
.mv-proof-metric { display: block; margin-top: 10px; font-size: 13.5px; line-height: 1.55; color: var(--text-secondary); max-width: 34ch; }
.mv-proof-ctx { margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: var(--text-body); max-width: 62ch; }

/* ── Minimaler Footer ────────────────────────────────────────────────────── */
.mv-footer {
  border-top: 1px solid var(--warm-black);
  padding: clamp(26px, 3vw, 38px) var(--gutter);
  display: flex; align-items: baseline; justify-content: space-between; gap: 20px 32px; flex-wrap: wrap;
}
.mv-footer-mark {
  font-family: var(--font-display), sans-serif; font-weight: 800;
  font-size: 20px; letter-spacing: -0.06em; color: var(--warm-black); line-height: 1;
}
.mv-footer-nav { display: flex; gap: 22px; }
.mv-footer-nav a {
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-muted); transition: color 0.2s;
}
.mv-footer-nav a:hover { color: var(--text-primary); }
.mv-footer-copy {
  font-family: var(--font-mono), monospace; font-size: 10px;
  letter-spacing: 0.1em; color: var(--text-faint);
}

/* ── First Move: Prüfflächen ─────────────────────────────────────────────── */
.mv-fm-surfaces {
  margin: 14px 0 0;
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted); line-height: 1.8;
}

/* Tabellenziffern überall, wo sich Zahlen ändern: kein Springen beim Wechsel
   von 17 auf 18 oder von 99 € auf 100 €. */
.mv-num, .mv-fm-price, .mv-review-sum, .mv-scale-row, .mv-spec-v {
  font-variant-numeric: tabular-nums;
}

@media (max-width: 900px) {
  .mv-proof-unit { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  .mv-footer { flex-direction: column; align-items: flex-start; gap: 16px; }
}

/* ── Antwortschicht: Fragen als redaktionelle Zeilen ─────────────────────── */
/* Keine Akkordeonwand. Die Antwort steht sichtbar im HTML, der erste Satz
   beantwortet die Frage, der Rest ist Kontext. */
.mv-answers { border-top: 1px solid var(--warm-black); margin-top: var(--block-gap); }
.mv-answer-row {
  display: grid; grid-template-columns: minmax(0, 34fr) minmax(0, 66fr);
  gap: 0 clamp(20px, 3vw, 56px);
  padding: clamp(18px, 2.2vw, 28px) 0; border-bottom: 1px solid var(--line);
  align-items: start;
}
.mv-answer-q {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(16px, 1.6vw, 21px); line-height: 1.15; letter-spacing: -0.005em;
  color: var(--ink-strong); margin: 0;
}
.mv-answer-a { font-size: 14.5px; line-height: 1.65; color: var(--text-body); margin: 0; max-width: 68ch; }

@media (max-width: 900px) {
  .mv-answer-row { grid-template-columns: minmax(0, 1fr); gap: 10px; }
}

/* ── Formatwahl ──────────────────────────────────────────────────────────── */
.mv-seg { display: flex; flex-wrap: wrap; gap: 0; border-top: 1px solid var(--line); }
.mv-seg-btn {
  background: none; border: none; border-bottom: 2px solid transparent;
  padding: 15px 22px 13px 0; min-height: 48px;
  font-family: var(--font-mono), monospace;
  font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--text-muted);
  transition: color 240ms, border-color 240ms;
}
.mv-seg-btn + .mv-seg-btn { padding-left: 22px; }
.mv-seg-btn:hover { color: var(--text-secondary); }
.mv-seg-btn[aria-pressed="true"] { color: var(--ink-strong); border-bottom-color: var(--olive); }
.mv-seg-note {
  margin-top: 12px; font-size: 13px; line-height: 1.6; color: var(--text-muted); max-width: 62ch;
}

/* ── Zielmarkt ───────────────────────────────────────────────────────────── */
.mv-market { position: relative; display: flex; align-items: center; }
.mv-market-btn {
  background: none; border: none; display: flex; align-items: center; gap: 10px;
  padding: 16px 0; min-height: 52px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 13px; color: var(--text-primary);
  transition: color 240ms;
}
.mv-market-btn:hover { color: var(--ink-strong); }
.mv-market-flag { font-size: 16px; line-height: 1; }
.mv-market-caret { color: var(--olive); font-size: 10px; transition: transform 260ms cubic-bezier(.16,1,.3,1); }
.mv-market-btn[aria-expanded="true"] .mv-market-caret { transform: rotate(180deg); }
.mv-market-panel {
  position: absolute; top: calc(100% + 1px); right: 0; z-index: 20;
  width: min(320px, 86vw); background: var(--paper);
  border: 1px solid var(--warm-black); padding: 0;
  box-shadow: 0 18px 40px rgba(31, 30, 26, 0.09);
}
.mv-market-search {
  width: 100%; border: none; border-bottom: 1px solid var(--line);
  background: var(--surface-raised); padding: 13px 14px; min-height: 46px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 14px; color: var(--text-primary);
}
.mv-market-search:focus { outline: none; background: var(--paper-soft); }
.mv-market-list { list-style: none; max-height: 264px; overflow-y: auto; }
.mv-market-opt {
  width: 100%; background: none; border: none; text-align: left;
  display: flex; align-items: center; gap: 11px;
  padding: 11px 14px; min-height: 44px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 14px; color: var(--text-body);
  transition: background 180ms, color 180ms;
}
.mv-market-opt:hover, .mv-market-opt[data-cursor="true"] { background: var(--surface-raised); color: var(--ink-strong); }
.mv-market-opt[aria-selected="true"] { color: var(--ink-strong); }
.mv-market-opt[aria-selected="true"]::after {
  content: ""; margin-left: auto; width: 6px; height: 6px; background: var(--olive);
}
.mv-market-code {
  margin-left: auto; font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.12em; color: var(--text-faint);
}
.mv-market-opt[aria-selected="true"] .mv-market-code { margin-left: auto; }
.mv-market-empty { padding: 16px 14px; font-size: 13px; color: var(--text-muted); }

/* ── Abschluss des Konfigurators ─────────────────────────────────────────── */
.mv-cfg-foot {
  display: flex; flex-wrap: wrap; align-items: center; gap: 18px 28px;
  border-top: 1px solid var(--warm-black); padding-top: clamp(20px, 2.4vw, 30px);
}
.mv-cfg-foot .mv-cta { min-width: 300px; }
.mv-cfg-terms {
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.1em; line-height: 1.7;
  color: var(--text-muted); max-width: 46ch;
}

/* ── Kostenlose Mengenempfehlung ─────────────────────────────────────────── */
/* Zugeklappt eine Zeile, aufgeklappt ein ruhiger Block. Kein Kasten, kein
   Schatten, keine Farbe: derselbe Haarlinien-Rahmen wie alles andere hier. */
.mv-rec { border-top: 1px solid var(--line); margin-top: clamp(22px, 2.6vw, 32px); }
.mv-rec-toggle {
  width: 100%; background: none; border: none; text-align: left;
  display: flex; align-items: baseline; justify-content: space-between; gap: 20px;
  padding: 16px 0; min-height: 48px;
  transition: color 240ms;
}
.mv-rec-eyebrow {
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--text-muted);
}
.mv-rec-open {
  display: inline-flex; align-items: baseline; gap: 10px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 13px; color: var(--text-primary);
  border-bottom: 1px solid var(--line-strong); padding-bottom: 3px;
  transition: color 240ms, border-color 240ms; white-space: nowrap;
}
.mv-rec-open span { color: var(--accent); }
.mv-rec-toggle:hover .mv-rec-open { border-color: var(--accent); }
.mv-rec-toggle:hover .mv-rec-eyebrow { color: var(--text-secondary); }

.mv-rec-body { padding: clamp(6px, 1vw, 12px) 0 clamp(24px, 3vw, 34px); }
.mv-rec-grid {
  display: grid; grid-template-columns: minmax(0, 56fr) minmax(0, 44fr);
  gap: clamp(26px, 4vw, 64px); align-items: start;
}
.mv-rec-form { display: grid; gap: 16px; margin-top: 22px; max-width: 440px; }
.mv-rec-form .mv-cta { width: 100%; }
.mv-rec-trust {
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.1em; line-height: 1.7; color: var(--text-muted);
}
.mv-rec-spec { border-top: 2px solid var(--warm-black); padding-top: 16px; }
.mv-rec-spec .mv-tier-fact { grid-template-columns: 96px minmax(0, 1fr); }

.mv-rec-done { border-left: 2px solid var(--accent); padding-left: 18px; }
.mv-rec-continue {
  background: none; border: none; padding: 6px 0 3px;
  display: inline-flex; align-items: baseline; gap: 10px; margin-top: 10px;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 13px; color: var(--text-primary);
  border-bottom: 1px solid var(--line-strong);
  transition: color 240ms, border-color 240ms;
}
.mv-rec-continue span { color: var(--accent); }
.mv-rec-continue:hover { border-color: var(--accent); }

/* Der Honigtopf. Aus dem Bild genommen, ohne display:none: manche Automaten
   überspringen, was nicht gerendert wird. */
.mv-trap {
  position: absolute; left: -9999px; width: 1px; height: 1px;
  overflow: hidden; opacity: 0; pointer-events: none;
}

@media (max-width: 900px) {
  /* Kein Dialog, keine Überlagerung: die Felder klappen unter dem Regler auf
     und werden gestapelt. Der Block lässt sich jederzeit wieder schließen. */
  .mv-rec-grid { grid-template-columns: minmax(0, 1fr); gap: 26px; }
  .mv-rec-form { max-width: none; }
  .mv-rec-toggle { flex-direction: column; gap: 8px; align-items: flex-start; }
}

/* ── Bestellübersicht vor der Zahlung ────────────────────────────────────── */
.mv-review {
  flex: 1 1 340px; min-width: 0; max-width: 520px;
  border-top: 2px solid var(--warm-black); padding-top: 16px;
}
.mv-review-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 6px; }
.mv-review-back {
  background: none; border: none; padding: 4px 0;
  font-family: var(--font-body), "Helvetica Neue", sans-serif;
  font-size: 13px; color: var(--text-muted);
  border-bottom: 1px solid var(--line-strong);
  transition: color 0.25s, border-color 0.25s;
}
.mv-review-back:hover { color: var(--text-primary); border-color: var(--accent); }
.mv-review-total { margin-top: 18px; border-top: 1px solid var(--warm-black); padding-top: 14px; }
.mv-review-sum {
  display: block; margin-top: 6px;
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: clamp(32px, 3.6vw, 46px); line-height: 0.95; letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums; color: var(--ink-strong);
}
.mv-review-net {
  display: block; margin-top: 8px;
  font-family: var(--font-mono), monospace;
  font-size: 10px; letter-spacing: 0.08em; line-height: 1.7; color: var(--text-muted);
}

/* ── Staffel als Beleg ───────────────────────────────────────────────────── */
/* Die Skalenlogik sichtbar machen, ohne sie zu bewerben. Eine Tabelle, keine
   Kachelreihe, und kein Etikett wie "beliebteste Wahl". */
.mv-scale { border-top: 1px solid var(--warm-black); margin-top: var(--block-gap); }
.mv-scale-row {
  display: grid; grid-template-columns: 96px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 0 clamp(16px, 2.4vw, 40px); align-items: baseline;
  padding: 14px 0; border-bottom: 1px solid var(--line);
  font-variant-numeric: tabular-nums;
}
.mv-scale-row[data-head="true"] { border-bottom-color: var(--line); padding: 10px 0; }
.mv-scale-row[data-active="true"] { background: var(--surface-raised); }
.mv-scale-q {
  font-family: var(--font-display), sans-serif; font-weight: 700;
  font-size: 19px; color: var(--ink-strong);
}
.mv-scale-v { font-family: var(--font-mono), monospace; font-size: 12.5px; color: var(--text-body); }
.mv-scale-v--lead { color: var(--ink-strong); }
/* Balken und Zahl derselben Größe nebeneinander: der Balken macht den Verlauf
   auf einen Blick sichtbar, die Zahl macht ihn überprüfbar. */
.mv-scale-delta { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: center; }
.mv-scale-bar { position: relative; height: 6px; background: var(--line-soft); }
.mv-scale-bar i {
  position: absolute; left: 0; top: 0; bottom: 0; display: block;
  background: var(--line-strong);
  transition: width 420ms cubic-bezier(.16,1,.3,1);
}
.mv-scale-row[data-active="true"] .mv-scale-bar i { background: var(--olive); }

@media (prefers-reduced-motion: reduce) {
  .mv-slider-fill, .mv-slider-thumb, .mv-slider-stop,
  .mv-mode-ind, .mv-market-caret, .mv-scale-bar i { transition: none !important; }
}

/* ── Responsiv ───────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .mv-cfg-top { flex-direction: column; gap: 0; align-items: stretch; }
  .mv-market { border-top: 1px solid var(--line); justify-content: space-between; }
  .mv-market-panel { right: auto; left: 0; width: min(360px, 92vw); }
  .mv-cfg-values { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 22px clamp(18px, 4vw, 36px); }
  .mv-cfg-cell--unit { grid-column: 1 / -1; border-top: 1px solid var(--line); padding-top: 18px; }
  .mv-scale-row { grid-template-columns: 64px minmax(0, 1fr) minmax(0, 1fr); }
  .mv-scale-delta { grid-column: 1 / -1; margin-top: 12px; }
  .mv-cfg-foot .mv-cta { min-width: 0; width: 100%; }
}

@media (max-width: 640px) {
  .mv-mode-btn { padding-right: 16px; font-size: 11px; letter-spacing: 0.08em; }
  .mv-mode-btn + .mv-mode-btn { padding-left: 16px; }
  .mv-num--qty { font-size: clamp(56px, 17vw, 76px); }
  .mv-num--total { font-size: clamp(34px, 10vw, 46px); }
  .mv-num--unit { font-size: clamp(22px, 6.4vw, 28px); }
  /* Weniger Beschriftungen, damit sich nichts überlagert. Gewählt bleibt
     sichtbar, der Rest ist ein Punkt auf der Schiene. */
  .mv-slider-tick[data-minor="true"] { display: none; }
  .mv-seg-btn { padding-right: 16px; font-size: 10px; letter-spacing: 0.1em; }
  .mv-seg-btn + .mv-seg-btn { padding-left: 16px; }
}

/* ── Scroll-Reveal ───────────────────────────────────────────────────────── */
/* Dieselbe Mechanik wie auf der Startseite und in den Case Studies: der
   versteckte Zustand entsteht erst, wenn der Beobachter scharf ist. */
.mv [data-reveal-root][data-armed="true"] [data-reveal] {
  opacity: 0; transform: translateY(14px);
}
.mv [data-reveal-root][data-armed="true"] [data-reveal][data-in="true"] {
  opacity: 1; transform: none;
  transition: opacity 620ms cubic-bezier(.16,1,.3,1), transform 620ms cubic-bezier(.16,1,.3,1);
  transition-delay: var(--reveal-delay, 0ms);
}

@media (prefers-reduced-motion: reduce) {
  .mv [data-reveal-root][data-armed="true"] [data-reveal] {
    opacity: 1 !important; transform: none !important; transition: none !important;
  }
  .mv-axis-pt i, .mv-axis-bracket { opacity: 1 !important; transform: none !important; transition: none !important; }
  .mv-axis-pt i { transform: translate(-50%, -50%) !important; }
  .mv-axis-bracket { transform: scaleX(1) !important; }
  .mv-cta[data-busy="true"]::after { animation: none; transform: scaleX(1); }
}

/* ── Responsiv ───────────────────────────────────────────────────────────── */
@media (max-width: 1080px) {
  .mv-hero-grid { grid-template-columns: 1fr; gap: 26px; align-items: start; }
  /* Eine Spalte, aber eine andere Reihenfolge: Überschrift, Preis, Belege.
     Der Preis rutscht damit vor die Belegzeile und steht auf dem Telefon im
     ersten Scroll, statt hinter drei Vertrauenszeilen zu verschwinden. */
  .mv-product-head { grid-template-columns: 1fr; gap: 30px; }
  .mv-product-text  { grid-column: 1; grid-row: 1; }
  .mv-product-buy   { grid-column: 1; grid-row: 2; }
  .mv-product-facts { grid-column: 1; grid-row: 3; }
  .mv-record { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .mv-record-ev { grid-column: 1 / -1; }
  .mv-step { grid-template-columns: 56px minmax(0, 1fr) 90px; }
  .mv-step-b { grid-column: 2 / -1; margin-top: 8px; }
  .mv-scope { grid-template-columns: 1fr; gap: 24px; }
  .mv-ext { grid-template-columns: 1fr; gap: 20px; }
  .mv-close-grid { grid-template-columns: 1fr; gap: 28px; align-items: start; }
  .mv-brief { grid-template-columns: 1fr; gap: 30px; }
}

@media (max-width: 900px) {
  /* Das Register wird zur Liste. Jede Zeile bleibt eine Zeile, nur gestapelt,
     damit Preis und Name nicht auseinanderfallen. */
  .mv-reg-head { display: none; }
  .mv-reg-row { grid-template-columns: 44px minmax(0, 1fr) 24px; gap: 0 18px; }
  .mv-reg-desc { grid-column: 2 / -1; margin-top: 10px; }
  .mv-reg-from { grid-column: 2 / -1; margin-top: 12px; }
  .mv-reg-arrow { grid-row: 1; grid-column: 3; }
  .mv-modes { grid-template-columns: 1fr; }
  .mv-mode-col { padding: 22px 0; }
  .mv-mode-col + .mv-mode-col { border-left: none; border-top: 1px solid var(--line); padding-left: 0; }
  .mv-standards { grid-template-columns: 1fr; gap: 0; }
  .mv-pair { grid-template-columns: 1fr; }
  .mv-pair-col + .mv-pair-col { border-left: none; border-top: 1px solid var(--line); padding-left: 0; margin-top: 24px; }
  .mv-scope-list { grid-template-columns: 1fr; }
}

@media (max-width: 900px) {
  /* Drei Spalten sind unter 900px zu eng für Mono in Versalien. Gestapelt mit
     Oberlinie statt Trennstrich links, sonst steht der Strich über dem Text. */
  .mv-facts, .mv-reassure { grid-template-columns: minmax(0, 1fr); }
  .mv-facts span + span, .mv-reassure span + span {
    padding-left: 0; border-left: none;
    border-top: 1px solid var(--line); padding-top: 9px; margin-top: 9px;
  }
  .mv-product-facts span + span {
    border-top: none; padding-top: 0; margin-top: 0; padding-left: 16px;
  }
}

@media (max-width: 640px) {
  /* Die klebende Navigation ist auf dem Telefon rund 106px hoch. --hero-y
     allein reicht als Abstand nicht, der Kopf säße dann darunter. */
  .mv-hero { padding-top: calc(var(--hero-y) + 34px); }
  .mv-product-head { padding-top: calc(var(--hero-y) + 34px); }
  .mv-hero--cfg { padding-top: calc(var(--hero-y) * 0.62 + 70px); }
  /* Die drei Belegzeilen entfallen auf dem Telefon. Sie sagen dasselbe, was der
     Konfigurator zwei Zeilen tiefer zeigt: Staffelpreis, Kaufart, Zielmarkt.
     Gestapelt kosten sie hier ein Drittel des ersten Bildes und schieben den
     Regler aus dem Sichtfeld. */
  .mv-hero--cfg .mv-facts { display: none; }
  .mv-hero--cfg .mv-h1 { font-size: clamp(30px, 8.4vw, 40px); }
  .mv-hero--cfg .mv-lead { font-size: 16px; }
  .mv-hero-top { flex-direction: column; align-items: flex-start; gap: 7px; }
  .mv-record { grid-template-columns: 1fr; }
  .mv-step { grid-template-columns: 44px minmax(0, 1fr); }
  .mv-step-e { grid-column: 2; justify-self: start; margin-top: 8px; }
  .mv-ev { grid-template-columns: 92px minmax(0, 1fr); gap: 12px; }
  .mv-tier-fact { grid-template-columns: 100px minmax(0, 1fr); gap: 12px; }
  .mv-row { grid-template-columns: 1fr; }
  .mv-switch-btn { font-size: 10.5px; letter-spacing: 0.08em; padding-inline: 4px; }
  .mv-switch-btn + .mv-switch-btn { padding-left: 8px; }
  .mv-facts { gap: 6px 0; }
  .mv-facts span { padding-right: 14px; }
  .mv-facts span + span { padding-left: 14px; }
  .mv-axis { height: 104px; }
}
    `}</style>
  );
}
