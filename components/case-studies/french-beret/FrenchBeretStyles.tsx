// ─── Case-spezifisches Chrome für French Beret ───────────────────────────────
// Ergänzt das gemeinsame Case-Study-Chrome aus <CaseStyles />, es ersetzt es
// nicht: Farben, Typo-Rollen, Hairlines, Reveal-Regeln und das Schienenraster
// kommen unverändert von dort. Hier stehen nur die Raster, die diese Case Study
// zusätzlich braucht — breite Bahnen statt Schiene, der Architektur-Flow, die
// Kennzahlenbahn und die Systembausteine.
//
// Wird einmal von der Seite ausgegeben, damit die Regeln genau einmal im
// Dokument stehen.

export default function FrenchBeretStyles() {
  return (
    <style>{`
      /* ═══ Breadcrumb ═══════════════════════════════════════════
         Sichtbare Einordnung und crawlbarer Pfad. Er bringt den
         Nav-Abstand mit, den der Hero deshalb nicht mehr braucht. */
      .fb-crumb { padding: 92px var(--gutter) 0; background: var(--paper); }
      .fb-crumb ol {
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
      .fb-crumb a { color: var(--text-muted); border-bottom: 1px solid transparent; }
      .fb-crumb a:hover { color: var(--ink-strong); border-bottom-color: var(--olive); }
      .fb-crumb li[aria-current="page"] { color: var(--text-secondary); }

      /* ═══ Breite Bahn ══════════════════════════════════════════
         Für Abschnitte, die die volle Seitenbreite brauchen. Kopf
         übernimmt das Schienenmaß, damit die Nummern über alle
         Abschnitte hinweg auf derselben Kante sitzen. */
      .fb-wide {
        padding: var(--tc-sec-y) var(--gutter);
        border-bottom: 1px solid var(--line);
        scroll-margin-top: 108px;
      }
      .fb-wide-head {
        display: grid;
        grid-template-columns: var(--tc-rail) minmax(0, 1fr);
        gap: clamp(20px, 3vw, 48px);
        align-items: end;
        padding-bottom: clamp(26px, 3vw, 44px);
      }
      .fb-wide-head-note {
        max-width: 56ch;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13px, 1.02vw, 14.5px);
        line-height: 1.72;
        color: var(--text-body);
      }
      .fb-note {
        margin-top: clamp(18px, 2vw, 26px);
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.12em;
        line-height: 1.8;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      /* Bildunterschrift. Steht genau einmal je Bildblock und trennt die
         illustrative Ebene sichtbar von den gemessenen Werten in Abschnitt 06,
         die ohne jede Abbildung auskommen. */
      .fb-caption {
        margin-top: 12px;
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.13em;
        line-height: 1.7;
        text-transform: uppercase;
        color: var(--text-faint);
      }
      .fb-caption-lead {
        margin: 0 0 clamp(16px, 1.8vw, 24px);
        padding-bottom: 12px;
        border-bottom: 1px solid var(--line-soft);
      }

      /* ═══ 01 · Hero ════════════════════════════════════════════ */
      .fbh {
        padding-top: clamp(10px, 1.4vw, 20px);
        display: grid;
        grid-template-columns: minmax(0, 55fr) minmax(0, 45fr);
        border-bottom: 1px solid var(--line);
      }
      .fbh-text {
        padding: 14px clamp(20px, 2.4vw, 40px) clamp(34px, 3.8vw, 56px) var(--gutter);
        min-width: 0;
      }
      .fbh-eyebrow {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--line);
        font-family: var(--font-mono), monospace;
        font-size: 9.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .fbh-eyebrow b { color: var(--text-secondary); font-weight: 400; }

      .fbh-h1 { margin-top: clamp(20px, 2.4vw, 34px); }
      .fbh-num {
        display: block;
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(62px, 9vw, 138px);
        line-height: 0.84;
        letter-spacing: -0.035em;
        color: var(--ink-strong);
        font-variant-numeric: lining-nums tabular-nums;
      }
      .fbh-tail {
        display: block;
        margin-top: clamp(8px, 1vw, 16px);
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(23px, 2.5vw, 40px);
        line-height: 1.1;
        letter-spacing: -0.022em;
        color: var(--ink-strong);
      }

      .fbh-sub {
        margin-top: clamp(20px, 2.2vw, 30px);
        max-width: 48ch;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13.5px, 1.05vw, 15.5px);
        line-height: 1.72;
        color: var(--text-body);
      }
      .fbh-disc {
        margin-top: clamp(16px, 1.8vw, 24px);
        padding-top: 12px;
        border-top: 1px solid var(--line);
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.13em;
        line-height: 1.7;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      /* Kennzahlen im Hero — 2 × 2, damit jede Zahl Luft behält. */
      .fbh-kpis {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-top: clamp(24px, 2.6vw, 38px);
        border-top: 1px solid var(--line);
      }
      .fbh-kpi {
        padding: clamp(14px, 1.5vw, 20px) clamp(14px, 1.6vw, 26px) clamp(14px, 1.5vw, 20px) 0;
        border-bottom: 1px solid var(--line-soft);
        min-width: 0;
      }
      .fbh-kpi:nth-child(even) {
        border-left: 1px solid var(--line-soft);
        padding-left: clamp(14px, 1.6vw, 26px);
      }
      .fbh-kpi dt {
        font-family: var(--font-display), sans-serif;
        font-weight: 700;
        font-size: clamp(28px, 2.9vw, 44px);
        line-height: 1;
        letter-spacing: -0.01em;
        color: var(--ink-strong);
        font-variant-numeric: lining-nums tabular-nums;
      }
      .fbh-kpi dd {
        margin-top: 8px;
        font-family: var(--font-mono), monospace;
        font-size: 8.5px;
        letter-spacing: 0.14em;
        line-height: 1.6;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .fbh-meta { margin-top: clamp(20px, 2.2vw, 30px); }
      .fbh-meta-row {
        display: grid;
        grid-template-columns: 104px minmax(0, 1fr);
        gap: 16px;
        padding: 5px 0;
        font-family: var(--font-mono), monospace;
        font-size: 9.5px;
        letter-spacing: 0.13em;
        text-transform: uppercase;
      }
      .fbh-meta-row dt { color: var(--text-faint); }
      .fbh-meta-row dd { color: var(--text-secondary); min-width: 0; }
      .fbh-out {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 24px;
        color: var(--ink-strong);
        border-bottom: 1px solid var(--olive);
        text-transform: none;
        letter-spacing: 0.06em;
      }
      .fbh-out span { color: var(--olive); transition: transform 300ms cubic-bezier(0.16,1,0.3,1); }
      .fbh-out:hover span { transform: translate(3px, -3px); }

      .fbh-media { position: relative; min-width: 0; min-height: clamp(320px, 38vw, 600px); }
      .fbh-frame {
        position: absolute;
        inset: 0;
        overflow: hidden;
        clip-path: inset(0 0 100% 0);
        animation: fbh-reveal 1100ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards;
      }
      .fbh-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 50% 52%;
        transform: scale(1.03);
        animation: fbh-settle 1500ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards;
      }
      @keyframes fbh-reveal { to { clip-path: inset(0 0 0 0); } }
      @keyframes fbh-settle { to { transform: scale(1); } }

      /* ═══ 02 · Faktenregister ══════════════════════════════════
         Zwei Spalten, Zeile für Zeile scanbar. Ein einzelner Rest
         am Ende nimmt die volle Breite, damit keine halbe Zeile
         stehen bleibt. */
      .fbq {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        border-top: 1px solid var(--line);
      }
      .fbq-cell {
        padding: clamp(16px, 1.7vw, 24px) clamp(14px, 1.6vw, 26px);
        border-bottom: 1px solid var(--line);
        border-left: 1px solid var(--line-soft);
        min-width: 0;
      }
      .fbq-cell:nth-child(odd) { border-left: 0; padding-left: 0; }
      .fbq-cell:last-child:nth-child(odd) { grid-column: 1 / -1; }
      .fbq-cell dt {
        font-family: var(--font-mono), monospace;
        font-size: 8.5px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--text-faint);
      }
      .fbq-cell dd {
        margin-top: 9px;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13px, 1.05vw, 15px);
        line-height: 1.5;
        color: var(--ink-strong);
      }

      /* ═══ 03 · Editorial-Statement ═════════════════════════════ */
      .fbs {
        margin-top: clamp(30px, 3.4vw, 52px);
        padding-top: clamp(24px, 2.6vw, 36px);
        border-top: 1px solid var(--warm-black);
      }
      .fbs p {
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(25px, 3.1vw, 50px);
        line-height: 1.1;
        letter-spacing: -0.028em;
        max-width: 20ch;
      }
      .fbs-a { color: var(--text-muted); }
      .fbs-b { display: block; color: var(--ink-strong); }

      /* ═══ 04 · Architektur-Flow ════════════════════════════════ */
      .fbf-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        border-top: 1px solid var(--warm-black);
      }
      .fbf-step {
        position: relative;
        padding: clamp(24px, 2.4vw, 34px) clamp(12px, 1.4vw, 22px) clamp(26px, 2.6vw, 36px);
        padding-left: clamp(12px, 1.4vw, 22px);
        border-left: 1px solid var(--line-soft);
        min-width: 0;
      }
      .fbf-step:first-child { border-left: 0; padding-left: 0; }
      .fbf-dot { position: absolute; top: -3px; left: 0; }
      .fbf-step:first-child .fbf-dot { left: 0; }
      .fbf-mark { display: block; color: var(--text-muted); }
      .fbf-index {
        margin-top: clamp(16px, 1.6vw, 22px);
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.16em;
        color: var(--text-faint);
      }
      .fbf-title {
        margin-top: 8px;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(11.5px, 0.9vw, 12.5px);
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        line-height: 1.35;
        color: var(--ink-strong);
      }
      .fbf-text {
        margin-top: 10px;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(11.5px, 0.88vw, 12.5px);
        line-height: 1.65;
        color: var(--text-secondary);
      }

      .fbt {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: clamp(28px, 3vw, 44px);
      }
      .fbt li {
        list-style: none;
        padding: 7px 13px;
        border: 1px solid var(--line);
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--text-secondary);
      }
      .fbt-label {
        margin-top: clamp(30px, 3.2vw, 46px);
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-faint);
      }

      /* ═══ 05 · Sortiment ═══════════════════════════════════════ */
      .fbp {
        display: grid;
        grid-template-columns: minmax(0, 64fr) minmax(0, 36fr);
        gap: clamp(24px, 3vw, 52px);
        align-items: start;
      }
      .fbp-media {
        position: relative;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        border: 1px solid var(--line);
      }
      .fbp-img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .fbp-side { min-width: 0; }
      .fbp-block { border-top: 1px solid var(--warm-black); padding-top: clamp(14px, 1.6vw, 20px); }
      .fbp-block + .fbp-block { margin-top: clamp(24px, 2.6vw, 36px); }
      .fbp-block h3 {
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        font-weight: 400;
        letter-spacing: 0.17em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .fbp-list { margin-top: 12px; list-style: none; }
      .fbp-list li {
        padding: 9px 0;
        border-bottom: 1px solid var(--line-soft);
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13px, 1.02vw, 14.5px);
        color: var(--ink-strong);
      }
      .fbp-block p {
        margin-top: 12px;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13px, 1.02vw, 14.5px);
        line-height: 1.7;
        color: var(--text-body);
      }

      /* ═══ 06 · Kennzahlen ══════════════════════════════════════ */
      .fbk {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        border-top: 1px solid var(--warm-black);
      }
      .fbk-cell {
        position: relative;
        padding: clamp(26px, 2.8vw, 42px) clamp(14px, 1.6vw, 26px) clamp(28px, 3vw, 44px);
        border-left: 1px solid var(--line-soft);
        min-width: 0;
      }
      .fbk-cell:first-child { border-left: 0; padding-left: 0; }
      .fbk-dot { position: absolute; top: -3px; left: 0; }
      .fbk-cell dt {
        font-family: var(--font-display), sans-serif;
        font-weight: 700;
        font-size: clamp(34px, 4.4vw, 74px);
        line-height: 0.92;
        letter-spacing: -0.02em;
        color: var(--ink-strong);
        font-variant-numeric: lining-nums tabular-nums;
      }
      .fbk-cell dd {
        margin-top: clamp(12px, 1.2vw, 18px);
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.15em;
        line-height: 1.6;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .fbk-source {
        margin-top: clamp(22px, 2.4vw, 32px);
        padding-left: 14px;
        border-left: 1px solid var(--olive);
        max-width: 72ch;
        font-family: var(--font-body), sans-serif;
        font-size: 12px;
        line-height: 1.7;
        color: var(--text-primary);
      }
      .fbk-hard {
        margin-top: clamp(16px, 1.8vw, 24px);
        font-family: var(--font-display), sans-serif;
        font-weight: 700;
        font-size: clamp(18px, 1.7vw, 26px);
        line-height: 1;
        letter-spacing: -0.01em;
        text-transform: uppercase;
        color: var(--ink-strong);
      }

      /* ═══ 07 · Systembausteine ═════════════════════════════════ */
      .fbm-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: clamp(18px, 2.2vw, 38px);
        border-top: 1px solid var(--warm-black);
        padding-top: clamp(24px, 2.6vw, 36px);
      }
      .fbm-item { min-width: 0; }
      .fbm-media {
        position: relative;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        border: 1px solid var(--line);
      }
      .fbm-band-media {
        position: relative;
        aspect-ratio: 49 / 20;
        overflow: hidden;
        border: 1px solid var(--line);
      }
      .fbm-img { width: 100%; height: 100%; object-fit: cover; display: block; }
      /* Der Storefront-Ausschnitt sitzt bewusst oben: die Bahn zeigt Navigation,
         Markenclaim und Einstieg, nicht den unteren Seitenfuß. */
      .fbm-band-media .fbm-img { object-position: 50% 0%; }
      .fbm-index {
        margin-top: clamp(14px, 1.5vw, 20px);
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.16em;
        color: var(--text-faint);
      }
      .fbm-title {
        margin-top: 8px;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(12px, 0.95vw, 13px);
        font-weight: 600;
        letter-spacing: 0.11em;
        text-transform: uppercase;
        line-height: 1.4;
        color: var(--ink-strong);
      }
      .fbm-text {
        margin-top: 10px;
        max-width: 44ch;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(12.5px, 0.98vw, 13.5px);
        line-height: 1.7;
        color: var(--text-body);
      }
      .fbm-band { margin-top: clamp(30px, 3.2vw, 48px); }
      .fbm-band-foot {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
        gap: clamp(16px, 2.4vw, 44px);
        align-items: start;
        margin-top: clamp(14px, 1.5vw, 20px);
      }
      .fbm-band-foot .fbm-index, .fbm-band-foot .fbm-title { margin-top: 0; }
      .fbm-band-foot .fbm-title { margin-top: 8px; }
      .fbm-band-foot .fbm-text { margin-top: 0; max-width: 52ch; }

      /* ═══ 10 · Abschluss ═══════════════════════════════════════ */
      .fbc {
        display: grid;
        grid-template-columns: minmax(0, 52fr) minmax(0, 48fr);
        gap: clamp(24px, 3.4vw, 64px);
        padding: clamp(56px, 6vw, 104px) var(--gutter);
        border-bottom: 1px solid var(--line);
        scroll-margin-top: 108px;
      }
      .fbc-h2 {
        margin-top: clamp(18px, 2vw, 28px);
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(31px, 3.7vw, 58px);
        line-height: 1.07;
        letter-spacing: -0.028em;
        color: var(--ink-strong);
      }
      .fbc-side { display: grid; align-content: end; min-width: 0; }
      .fbc-copy {
        max-width: 46ch;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13.5px, 1.05vw, 15px);
        line-height: 1.72;
        color: var(--text-body);
      }
      .fbc-action { margin-top: clamp(24px, 2.6vw, 36px); }
      .fbc-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        padding: 13px 26px;
        border: 1px solid var(--border-btn);
        background: transparent;
        font-family: var(--font-body), sans-serif;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.11em;
        text-transform: uppercase;
        color: var(--text-primary);
        transition: background 300ms ease, border-color 300ms ease;
      }
      .fbc-btn:hover { background: var(--button-hover-bg); border-color: var(--border-btn-hovered); }
      .fbc-btn span { color: var(--olive); transition: transform 320ms cubic-bezier(0.16,1,0.3,1); }
      .fbc-btn:hover span { transform: translateX(5px); }
      .fbc-related { display: grid; gap: 0; margin-top: clamp(28px, 3vw, 44px); border-top: 1px solid var(--line); }
      .fbc-related a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 48px;
        padding: 14px 0;
        border-bottom: 1px solid var(--line-soft);
        font-family: var(--font-body), sans-serif;
        font-size: 13px;
        color: var(--text-secondary);
        transition: color 240ms ease;
      }
      .fbc-related a::after {
        content: "→";
        color: var(--olive);
        opacity: 0.55;
        transition: transform 300ms cubic-bezier(0.16,1,0.3,1), opacity 240ms ease;
      }
      .fbc-related a:hover { color: var(--ink-strong); }
      .fbc-related a:hover::after { transform: translateX(4px); opacity: 1; }

      /* ═══ Tablet ═══════════════════════════════════════════════ */
      @media (max-width: 1080px) {
        .fbh { grid-template-columns: minmax(0, 52fr) minmax(0, 48fr); }
        .fbf-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .fbf-step:nth-child(3n + 1) { border-left: 0; padding-left: 0; }
        .fbf-step:nth-child(n + 4) { border-top: 1px solid var(--line-soft); }
        .fbk { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .fbk-cell:nth-child(odd) { border-left: 0; padding-left: 0; }
        .fbk-cell:nth-child(n + 3) { border-top: 1px solid var(--line-soft); }
        .fbm-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (max-width: 900px) {
        .fb-wide-head { grid-template-columns: minmax(0, 1fr); align-items: start; gap: clamp(18px, 3vw, 26px); }
        .fbp { grid-template-columns: minmax(0, 1fr); }
        .fbc { grid-template-columns: minmax(0, 1fr); }
        .fbc-side { align-content: start; }
      }

      /* ═══ Mobile ═══════════════════════════════════════════════
         Nicht gestapeltes Desktop: Register bleibt Register, der
         Flow bekommt eine eigene vertikale Achse, Zahlen bleiben
         gross und Zeilen bleiben Zeilen. */
      @media (max-width: 780px) {
        .fbh { grid-template-columns: minmax(0, 1fr); padding-top: 0; }
        .fbh-text { padding: 14px var(--gutter) clamp(32px, 8vw, 44px); }
        .fbh-media { aspect-ratio: 3 / 2; min-height: 0; }
        .fbh-num { font-size: clamp(54px, 17vw, 92px); }
        .fbh-meta-row { grid-template-columns: 88px minmax(0, 1fr); gap: 12px; }

        .fbq { grid-template-columns: minmax(0, 1fr); }
        .fbq-cell {
          display: grid;
          grid-template-columns: 104px minmax(0, 1fr);
          gap: 14px;
          align-items: baseline;
          border-left: 0 !important;
          padding: 15px 0 !important;
        }
        .fbq-cell:last-child:nth-child(odd) { grid-column: 1; }
        .fbq-cell dd { margin-top: 0; }

        .fbf-grid { grid-template-columns: minmax(0, 1fr); border-top: 0; }
        /* Eine durchgehende Achse statt sechs Kästen: die Linie läuft über
           alle Schritte, deshalb bekommt auch der erste eine Kante. */
        .fbf-step {
          border-left: 1px solid var(--line) !important;
          border-top: 0 !important;
          padding: 4px 0 clamp(24px, 6vw, 32px) clamp(20px, 5vw, 28px) !important;
        }
        .fbf-step:last-child { padding-bottom: 0 !important; }
        .fbf-dot { top: 6px; left: -3px; }
        .fbf-mark { display: none; }
        .fbf-index { margin-top: 0; }
        .fbf-text { max-width: 52ch; }

        .fbk { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .fbk-cell { padding: clamp(22px, 5vw, 30px) clamp(12px, 3vw, 18px) clamp(24px, 5vw, 32px); }
        .fbk-cell dt { font-size: clamp(30px, 9vw, 44px); }

        .fbm-grid { grid-template-columns: minmax(0, 1fr); gap: clamp(30px, 8vw, 44px); }
        .fbm-band-media { aspect-ratio: 16 / 11; }
        .fbm-band-foot { grid-template-columns: minmax(0, 1fr); gap: 12px; }

        .fbs p { max-width: 24ch; }
      }

      @media (prefers-reduced-motion: reduce) {
        .fbh-frame { animation: none; clip-path: none; }
        .fbh-img { animation: none; transform: none; }
        .fbh-out span, .fbc-btn span, .fbc-related a::after { transition: none; }
      }
    `}</style>
  );
}
