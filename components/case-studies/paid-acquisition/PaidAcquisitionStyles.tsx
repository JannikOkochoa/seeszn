// ─── Paid Acquisition at Scale — page-scoped art direction ───────────────────
// Everything here is scoped to .pa-root. The shared case-study chrome supplies
// the reveal base state, the hairlines and the type roles; this file pushes the
// typography and the composition further than a standard SEESZN page.
//
// TWO TYPOGRAPHIC REGISTERS, NEVER MIXED
//   Structure  Barlow Condensed, uppercase, tight — section headings and every
//              oversized numeral. The condensed grotesque is what lets a number
//              be set at 250px without becoming a banner.
//   Statement  Source Serif 4, mixed case — the H1 and the four sentences the
//              page is actually built around. Upright, never italic, per the
//              site's accent rule in globals.css.
//
// FOUR SPACING TIERS, NOT ONE
// A single padding-block across every section reads as a queue. These four
// tiers are assigned deliberately — dense, normal, spacious, chapter-break —
// so the page has tension and release and some transitions feel like turning a
// page rather than scrolling past a divider.
//
// EDGES
// Each photograph meets a different edge: the hero runs off the right, the
// scale image off the left, the closing image carries a full canvas. That is
// what stops the page from settling into text-left / image-right.
//
// COLOUR
// Ivory and ink carry the page; warm taupe is an accent and never a surface.
// Text accents use --pa-taupe-ink rather than --pa-taupe: the decorative taupe
// reaches only 2.8:1 against paper, which is fine for a 1px rule and not fine
// for a word in a headline.

export default function PaidAcquisitionStyles() {
  return (
    <style>{`
      .pa-root {
        --pa-taupe:      #a58263;   /* rules, marks, non-text accents      */
        --pa-taupe-ink:  #7a5a3d;   /* the same accent, safe as text       */
        --pa-stone:      #d8d0c4;
        --pa-dark:       #14120f;   /* the closing canvas, both themes     */
        --pa-dark-ink:   #efe8dc;
        --pa-dark-faint: rgba(239, 232, 220, 0.52);
        --pa-scrim:      rgba(242, 238, 229, 0.72);

        /* Four tiers. Assigned per section, never applied uniformly. */
        --pa-y-tight: clamp(56px, 6.4vw, 104px);
        --pa-y:       clamp(76px, 9vw, 152px);
        --pa-y-lg:    clamp(100px, 12.5vw, 210px);
        --pa-y-xl:    clamp(128px, 17vw, 280px);

        background: var(--paper);
        /* Safety net: several blocks bleed to a page edge. */
        overflow-x: clip;
      }

      [data-theme="dark"] .pa-root {
        --pa-taupe:     #b08a63;
        --pa-taupe-ink: #c9a074;
        --pa-stone:     #3a3730;
        --pa-scrim:     rgba(19, 20, 15, 0.78);
      }

      /* ── Shared roles ──────────────────────────────────────── */
      .pa-label {
        display: flex;
        align-items: baseline;
        gap: 10px;
        font-family: var(--font-mono), monospace;
        font-size: 9.5px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .pa-label span:first-child { color: var(--pa-taupe-ink); }
      .pa-label span + span::before {
        content: "/ ";
        color: var(--text-faint);
      }

      /* Structure register — section headings. */
      .pa-h2 {
        margin-top: clamp(18px, 2vw, 30px);
        font-family: var(--font-display), sans-serif;
        font-weight: 700;
        font-size: clamp(32px, 4.2vw, 68px);
        line-height: 0.94;
        letter-spacing: -0.015em;
        text-transform: uppercase;
        color: var(--ink-strong);
      }

      /* Statement register — the accent word inside a serif line. */
      .pa-accent {
        font-family: var(--font-editorial), Georgia, serif;
        font-style: normal;
        font-weight: 400;
        color: var(--pa-taupe-ink);
      }

      .pa-copy-lead {
        margin-top: clamp(20px, 2.2vw, 32px);
        font-family: var(--font-body), sans-serif;
        font-size: clamp(14.5px, 1.2vw, 17px);
        line-height: 1.68;
        color: var(--text-primary);
        max-width: 54ch;
      }

      /* Every oversized numeral on the page shares one treatment. */
      .pa-stat-value,
      .pa-scale-num,
      .pa-val-a,
      .pa-val-b,
      .pak-cell dt,
      .pa-cpl-end b,
      .pa-ba-rows dd,
      .pa-val-mult b,
      .pa-stat-pull {
        font-family: var(--font-display), sans-serif;
        font-weight: 700;
        color: var(--ink-strong);
        font-variant-numeric: lining-nums tabular-nums;
        letter-spacing: -0.03em;
      }

      /* ── Breadcrumb ────────────────────────────────────────── */
      /* 126px, not the 92px the French Beret case used: <main> starts at the
         top of the document and the announcement bar plus the nav occupy the
         first 106px, so 92px leaves the breadcrumb sitting behind the header. */
      .pa-crumb { padding: 126px var(--gutter) 0; background: var(--paper); }
      .pa-crumb ol {
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
      .pa-crumb a { color: var(--text-muted); border-bottom: 1px solid transparent; }
      .pa-crumb a:hover { color: var(--ink-strong); border-bottom-color: var(--olive); }
      .pa-crumb li[aria-current="page"] { color: var(--text-secondary); }

      /* ── 01 · Hero ─────────────────────────────────────────── */
      /* Three rows: copy, a hairline, the metadata foot. The photograph spans
         all three and runs off the right edge, so the rule crosses it. The copy
         is anchored to the bottom of its row — the whitespace sits above it,
         which is the asymmetry doing work rather than a centred block. */
      .pah {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 50fr) minmax(0, 50fr);
        grid-template-rows: minmax(clamp(360px, 46vw, 620px), auto) auto auto;
        column-gap: clamp(28px, 3.6vw, 62px);
        padding: clamp(24px, 3vw, 46px) 0 clamp(40px, 4.6vw, 76px) var(--gutter);
      }
      .pah-text {
        grid-column: 1;
        grid-row: 1;
        align-self: end;
        padding-bottom: clamp(22px, 2.6vw, 42px);
        min-width: 0;
      }
      /* Publication metadata set on its side in the gutter — an art-book device,
         hidden below the width where the gutter can carry it. */
      .pah-side {
        position: absolute;
        left: 15px;
        top: clamp(40px, 6vw, 96px);
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        font-family: var(--font-mono), monospace;
        font-size: 8.5px;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        color: var(--text-faint);
        pointer-events: none;
      }
      .pah-eyebrow {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        padding-bottom: 14px;
        border-bottom: 1px solid var(--warm-black);
        font-family: var(--font-mono), monospace;
        font-size: 9.5px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .pah-eyebrow b { font-weight: 400; color: var(--ink-strong); }

      .pah-h1 {
        margin-top: clamp(24px, 3vw, 46px);
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(33px, 4.35vw, 72px);
        line-height: 1.02;
        letter-spacing: -0.026em;
        color: var(--ink-strong);
      }
      .pah-h1 span { display: block; }
      /* Deliberately uneven line lengths, with the accent line stepped in. */
      .pah-l3 { margin-left: clamp(20px, 4.4vw, 88px); }

      .pah-sub {
        margin-top: clamp(24px, 2.6vw, 38px);
        font-family: var(--font-body), sans-serif;
        font-size: clamp(14px, 1.15vw, 16.5px);
        line-height: 1.68;
        color: var(--text-body);
        max-width: 44ch;
      }

      /* The rule is a grid item spanning both columns, so it crosses the
         photograph without a single absolute coordinate. */
      .pah-rule {
        position: relative;
        z-index: 2;
        grid-column: 1 / -1;
        grid-row: 2;
        height: 1px;
        background: var(--warm-black);
      }
      .pah-foot {
        grid-column: 1;
        grid-row: 3;
        padding-top: 14px;
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-faint);
      }

      .pah-media {
        position: relative;
        z-index: 1;
        grid-column: 2;
        grid-row: 1 / -1;
        overflow: hidden;
      }
      .pah-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 50% 40%;
        display: block;
        animation: pa-rise 1600ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      @keyframes pa-rise {
        from { clip-path: inset(0 0 100% 0); transform: scale(1.06); }
        to   { clip-path: inset(0 0 0 0);    transform: scale(1); }
      }

      /* ── KPI strip — a descending scale, not three equal cells ─ */
      .pak {
        display: grid;
        grid-template-columns: minmax(0, 42fr) minmax(0, 34fr) minmax(0, 24fr);
        border-top: 1px solid var(--warm-black);
        border-bottom: 1px solid var(--line);
      }
      .pak-cell {
        padding: clamp(20px, 2.4vw, 38px) clamp(18px, 2.2vw, 34px);
        min-width: 0;
      }
      .pak-cell:first-child { padding-left: var(--gutter); }
      .pak-cell:last-child  { padding-right: var(--gutter); }
      .pak-cell + .pak-cell { border-left: 1px solid var(--line); }
      .pak-cell dt {
        font-size: clamp(24px, 3.6vw, 60px);
        line-height: 1.0;
      }
      .pak-cell dd {
        margin-top: 12px;
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      /* Cells two and three carry their label above the value and step down in
         scale — the strip reads left to right as dominant, secondary, note. */
      .pak-cell:nth-child(2),
      .pak-cell:nth-child(3) { display: flex; flex-direction: column-reverse; }
      .pak-cell:nth-child(2) dt { font-size: clamp(17px, 1.95vw, 29px); }
      .pak-cell:nth-child(3) dt { font-size: clamp(14px, 1.45vw, 21px); }
      .pak-cell:nth-child(2) dd,
      .pak-cell:nth-child(3) dd { margin: 0 0 clamp(12px, 1.4vw, 20px); }
      .pak-cell:nth-child(3) dt { color: var(--text-secondary); }

      /* ── 02 · The situation ────────────────────────────────── */
      .pa-sit {
        padding: var(--pa-y-lg) 0;
        border-bottom: 1px solid var(--line);
      }
      /* Headline left, lede dropped into the opposite column and aligned to its
         foot — the void beside a two-line heading becomes composition instead
         of leftover space. */
      .pa-sit-head {
        display: grid;
        grid-template-columns: minmax(0, 56fr) minmax(0, 44fr);
        column-gap: clamp(28px, 4vw, 78px);
        align-items: end;
        padding: 0 var(--gutter);
      }
      .pa-sit-head .pa-label { grid-column: 1; grid-row: 1; }
      .pa-sit-head .pa-h2 { grid-column: 1; grid-row: 2; }
      .pa-sit-head .pa-copy-lead {
        grid-column: 2;
        grid-row: 2;
        margin-top: 0;
        max-width: 42ch;
      }

      /* Editorial interruption: a tall crop running off the left edge with its
         caption parked far away on the right. */
      .pa-sit-figure {
        display: grid;
        grid-template-columns: minmax(0, 68fr) minmax(0, 32fr);
        align-items: end;
        gap: clamp(20px, 3vw, 52px);
        margin-top: clamp(48px, 7vw, 118px);
        padding-right: var(--gutter);
      }
      .pa-sit-media {
        position: relative;
        overflow: hidden;
        height: clamp(400px, 50vw, 700px);
      }
      .pa-sit-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 56% 66%;
        display: block;
      }
      .pa-sit-caption {
        padding-bottom: clamp(8px, 1.6vw, 26px);
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(14px, 1.4vw, 21px);
        line-height: 1.34;
        letter-spacing: -0.012em;
        color: var(--text-secondary);
      }

      /* The number is flush right against the gutter; the illustrative layer
         sits opposite it, smaller and in taupe. Different vertical layers, not
         a caption under a figure. */
      .pa-sit-stat {
        display: grid;
        grid-template-columns: minmax(0, 40fr) minmax(0, 60fr);
        align-items: end;
        gap: clamp(24px, 3.4vw, 58px);
        margin-top: clamp(56px, 8vw, 132px);
        padding: clamp(22px, 2.6vw, 38px) var(--gutter) 0;
        border-top: 1px solid var(--warm-black);
      }
      .pa-stat-pull {
        font-size: clamp(24px, 2.9vw, 46px);
        line-height: 1.0;
        color: var(--pa-taupe-ink);
      }
      .pa-stat-flag {
        margin-top: clamp(12px, 1.4vw, 18px);
        padding-left: 12px;
        border-left: 2px solid var(--pa-taupe);
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        line-height: 1.7;
        color: var(--pa-taupe-ink);
      }
      .pa-stat-note {
        margin-top: clamp(16px, 1.8vw, 24px);
        font-family: var(--font-body), sans-serif;
        font-size: clamp(12.5px, 1vw, 14px);
        line-height: 1.72;
        color: var(--text-secondary);
        max-width: 40ch;
      }
      .pa-stat-main { text-align: right; min-width: 0; }
      .pa-stat-value {
        font-size: clamp(58px, 11.5vw, 186px);
        line-height: 0.82;
        letter-spacing: -0.04em;
      }
      .pa-stat-label {
        margin-top: clamp(14px, 1.6vw, 24px);
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      /* ── Wide sections, three densities ────────────────────── */
      .pa-wide {
        padding: var(--pa-y) var(--gutter);
        border-bottom: 1px solid var(--line);
      }
      .pa-wide-dense { padding-block: var(--pa-y-tight); }
      .pa-wide-open  { padding-block: var(--pa-y-lg); }
      .pa-wide-head {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 38ch);
        align-items: end;
        gap: clamp(24px, 3.4vw, 64px);
        padding-bottom: clamp(34px, 4vw, 62px);
      }
      .pa-wide-note {
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13px, 1.02vw, 14.5px);
        line-height: 1.75;
        color: var(--text-secondary);
      }

      /* ── 03 · The scaling problem ──────────────────────────── */
      /* Unequal columns on a stepped baseline: a contents spread, not a grid of
         four equal cards. The staircase is the whole idea. */
      .pap {
        display: grid;
        grid-template-columns:
          minmax(0, 27fr) minmax(0, 23fr) minmax(0, 27fr) minmax(0, 23fr);
        list-style: none;
        border-top: 1px solid var(--warm-black);
      }
      .pap-col {
        padding: 0 clamp(16px, 1.9vw, 30px) clamp(28px, 3.4vw, 52px) 0;
        min-width: 0;
      }
      .pap-col + .pap-col {
        padding-left: clamp(16px, 1.9vw, 30px);
        border-left: 1px solid var(--line);
      }
      .pap-col:nth-child(1) { padding-top: clamp(24px, 2.8vw, 42px); }
      .pap-col:nth-child(2) { padding-top: clamp(42px, 5.2vw, 84px); }
      .pap-col:nth-child(3) { padding-top: clamp(60px, 7.6vw, 126px); }
      .pap-col:nth-child(4) { padding-top: clamp(78px, 10vw, 168px); }

      .pap-top {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
      }
      .pap-index {
        font-family: var(--font-display), sans-serif;
        font-weight: 700;
        font-size: clamp(34px, 4.2vw, 70px);
        line-height: 0.78;
        letter-spacing: -0.04em;
        color: var(--text-faint);
        font-variant-numeric: lining-nums tabular-nums;
      }
      .pa-mark {
        display: block;
        flex: none;
        margin-bottom: 3px;
        color: var(--pa-taupe);
      }
      .pap-title {
        margin-top: clamp(20px, 2.2vw, 32px);
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(17px, 1.45vw, 21px);
        line-height: 1.24;
        letter-spacing: -0.015em;
        color: var(--ink-strong);
      }
      .pap-text {
        margin-top: 13px;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(12px, 0.94vw, 13.5px);
        line-height: 1.72;
        color: var(--text-secondary);
      }

      /* ── 04 · What we focused on ───────────────────────────── */
      /* A vertical index — the opposite composition to the spread above it. */
      .paw { list-style: none; }
      .paw-row {
        display: grid;
        grid-template-columns: clamp(56px, 7vw, 118px) minmax(0, 24ch) minmax(0, 1fr);
        gap: clamp(16px, 2.4vw, 46px);
        align-items: start;
        padding: clamp(22px, 2.6vw, 40px) 0;
        border-top: 1px solid var(--line);
      }
      .paw-row:first-child { border-top: 1px solid var(--warm-black); }
      .paw-index {
        font-family: var(--font-display), sans-serif;
        font-weight: 700;
        font-size: clamp(26px, 3vw, 50px);
        line-height: 0.86;
        letter-spacing: -0.035em;
        color: var(--text-faint);
        font-variant-numeric: lining-nums tabular-nums;
      }
      .paw-title {
        font-family: var(--font-display), sans-serif;
        font-weight: 700;
        font-size: clamp(22px, 2.3vw, 36px);
        line-height: 0.98;
        letter-spacing: -0.012em;
        text-transform: uppercase;
        color: var(--ink-strong);
      }
      .paw-text {
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13px, 1.02vw, 14.5px);
        line-height: 1.72;
        color: var(--text-body);
        max-width: 48ch;
        padding-top: 3px;
      }

      /* ── 05 · CPL range ────────────────────────────────────── */
      /* Two numerals with a falling band between them. No plot frame, no axis,
         no gridline — the shape is the finding. */
      .pa-chart-row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: clamp(12px, 2.2vw, 44px);
      }
      .pa-cpl-end b {
        display: block;
        font-size: clamp(25px, 4.4vw, 78px);
        line-height: 0.88;
        letter-spacing: -0.035em;
      }
      .pa-cpl-end span {
        display: block;
        margin-top: clamp(10px, 1.2vw, 16px);
        font-family: var(--font-mono), monospace;
        font-size: 8.5px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .pa-cpl-to { text-align: right; }
      .pa-cpl-to b { color: var(--pa-taupe-ink); }

      .pa-plot {
        position: relative;
        height: clamp(150px, 21vw, 290px);
      }
      .pa-plot-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }
      .pa-plot-svg line,
      .pa-plot-svg path { vector-effect: non-scaling-stroke; }
      .pa-band { fill: var(--pa-taupe); opacity: 0.13; stroke: none; }
      .pa-curve { fill: none; stroke: var(--ink-strong); stroke-width: 1; }
      .pa-range { stroke-width: 6; stroke-linecap: butt; }
      .pa-range-from { stroke: var(--ink-strong); }
      .pa-range-to   { stroke: var(--pa-taupe-ink); }

      .pa-chart-foot {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 18px;
        margin-top: clamp(22px, 2.6vw, 38px);
        padding-top: 12px;
        border-top: 1px solid var(--line);
      }
      .pa-chart-foot span {
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-secondary);
      }
      /* The honesty note stays on the page but stops shouting: the chart is
         already legible without it. */
      .pa-chart-foot i {
        font-style: normal;
        font-family: var(--font-mono), monospace;
        font-size: 8.5px;
        letter-spacing: 0.04em;
        color: var(--text-faint);
        text-align: right;
      }

      /* The chart never fades — it draws. The container overrides the shared
         reveal base state so only the two curves animate. */
      [data-reveal-root][data-armed="true"] .pa-chart[data-reveal] {
        opacity: 1;
        transform: none;
      }
      .pa-draw { stroke-dasharray: 1; }
      [data-reveal-root][data-armed="true"] .pa-chart[data-reveal] .pa-draw {
        stroke-dashoffset: 1;
      }
      [data-reveal-root][data-armed="true"] .pa-chart[data-reveal] .pa-band,
      [data-reveal-root][data-armed="true"] .pa-chart[data-reveal] .pa-range {
        opacity: 0;
      }
      [data-reveal-root][data-armed="true"] .pa-chart[data-reveal][data-in="true"] .pa-draw {
        stroke-dashoffset: 0;
        transition: stroke-dashoffset 1700ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      [data-reveal-root][data-armed="true"] .pa-chart[data-reveal][data-in="true"] .pa-band {
        opacity: 0.13;
        transition: opacity 900ms ease 900ms;
      }
      [data-reveal-root][data-armed="true"] .pa-chart[data-reveal][data-in="true"] .pa-range {
        opacity: 1;
        transition: opacity 700ms ease 400ms;
      }

      /* ── 06 · Conversion value ─────────────────────────────── */
      /* The emptiest section on the page. Three stepped numerals on a twelve
         column stage; the multiple sits apart from them. */
      .pa-val {
        padding: var(--pa-y-xl) var(--gutter);
        border-bottom: 1px solid var(--line);
      }
      .pa-val-stage {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        align-items: center;
        margin-top: clamp(48px, 7vw, 128px);
      }
      .pa-val-a, .pa-val-b {
        font-size: clamp(58px, 12.5vw, 210px);
        line-height: 0.84;
        letter-spacing: -0.045em;
      }
      .pa-val-a { grid-column: 1 / 7; grid-row: 1; }
      .pa-val-arrow {
        grid-column: 5 / 9;
        grid-row: 2;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(22px, 3vw, 54px);
        line-height: 1;
        color: var(--pa-taupe-ink);
        padding: clamp(6px, 1vw, 18px) 0;
      }
      .pa-val-b { grid-column: 6 / 13; grid-row: 3; }
      .pa-val-mult {
        grid-column: 10 / 13;
        grid-row: 1;
        align-self: start;
        text-align: right;
      }
      .pa-val-mult b {
        display: block;
        font-size: clamp(30px, 4.6vw, 84px);
        line-height: 0.9;
        color: var(--pa-taupe-ink);
      }
      .pa-val-mult span,
      .pa-val-tag {
        display: block;
        margin-top: clamp(10px, 1.2vw, 18px);
        font-family: var(--font-mono), monospace;
        font-size: 9.5px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .pa-val-tag { grid-column: 1 / 7; grid-row: 4; margin-top: clamp(20px, 2.4vw, 34px); }
      .pa-val-foot {
        margin-top: clamp(52px, 7.5vw, 124px);
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13.5px, 1.05vw, 15px);
        line-height: 1.72;
        color: var(--text-secondary);
        max-width: 46ch;
      }

      /* ── 07 · Managed at scale ─────────────────────────────── */
      /* Second hero moment. Left aligned rather than centred, the label parked
         in the opposite corner, the texture bleeding past the container. */
      .pa-scale {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        padding: var(--pa-y-xl) var(--gutter);
        background: var(--paper-soft);
        border-bottom: 1px solid var(--line);
      }
      .pa-scale-bg {
        position: absolute;
        inset: -8% -10%;
        z-index: -2;
      }
      /* Material, not photography: cropped away from the dark chrome corner so
         the scrim never has to fight it, and drifting slowly enough that the
         movement reads as light changing rather than as an animation. */
      .pa-scale-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 22% 40%;
        display: block;
        opacity: 0.6;
        transform: scale(1.06);
        animation: pa-drift 62s ease-in-out infinite alternate;
      }
      @keyframes pa-drift {
        from { transform: scale(1.06) translate3d(-1.6%, -0.8%, 0); }
        to   { transform: scale(1.06) translate3d(1.6%, 0.8%, 0); }
      }
      .pa-scale::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background:
          radial-gradient(ellipse 86% 70% at 34% 44%, var(--pa-scrim), transparent 76%),
          linear-gradient(to bottom, var(--pa-scrim), transparent 26%, transparent 74%, var(--pa-scrim));
      }
      [data-theme="dark"] .pa-scale-img { opacity: 0.24; }

      .pa-scale-label {
        position: absolute;
        top: clamp(28px, 4vw, 64px);
        right: var(--gutter);
      }
      .pa-scale-inner { position: relative; }
      .pa-scale-num {
        font-size: clamp(52px, 15vw, 250px);
        line-height: 0.8;
        letter-spacing: -0.045em;
      }
      .pa-scale-cap {
        margin-top: clamp(20px, 2.4vw, 36px);
        font-family: var(--font-mono), monospace;
        font-weight: 400;
        font-size: 9.5px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--text-secondary);
      }
      /* Offset to the right so it never aligns with the number above it. */
      .pa-scale-line {
        position: relative;
        margin: clamp(64px, 9.5vw, 168px) 0 0 auto;
        max-width: 22ch;
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(22px, 3.4vw, 56px);
        line-height: 1.16;
        letter-spacing: -0.024em;
        color: var(--ink-strong);
      }

      /* ── 08 · Before / After ───────────────────────────────── */
      /* Two opposing panels: the earlier state compressed on a tinted surface,
         the later state open on paper. Scale carries the change, not colour —
         each panel is also named and ruled differently. */
      .pa-ba {
        display: grid;
        grid-template-columns: minmax(0, 38fr) minmax(0, 62fr);
      }
      .pa-ba-col { min-width: 0; }
      .pa-ba-before {
        background: var(--surface);
        border-top: 2px solid var(--ink-strong);
        padding: calc(clamp(22px, 2.6vw, 36px) + 4px)
                 clamp(20px, 2.4vw, 38px) clamp(28px, 3.2vw, 46px);
      }
      .pa-ba-after {
        border-top: 6px solid var(--pa-taupe);
        padding: clamp(22px, 2.6vw, 36px) 0 clamp(28px, 3.2vw, 46px)
                 clamp(26px, 3.6vw, 68px);
      }
      .pa-ba-tag {
        font-family: var(--font-mono), monospace;
        font-size: 9.5px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .pa-ba-after .pa-ba-tag { color: var(--pa-taupe-ink); }

      .pa-ba-rows { margin-top: clamp(24px, 2.8vw, 40px); }
      .pa-ba-rows > div {
        padding: clamp(16px, 1.9vw, 26px) 0;
        border-top: 1px solid var(--line);
      }
      .pa-ba-rows > div:first-child { border-top: 0; padding-top: 0; }
      .pa-ba-rows dt {
        font-family: var(--font-mono), monospace;
        font-size: 8.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--text-faint);
      }
      .pa-ba-rows dd { margin-top: 10px; line-height: 0.92; }
      .pa-ba-before .pa-ba-rows dd { font-size: clamp(26px, 3vw, 46px); }
      .pa-ba-after  .pa-ba-rows dd {
        font-size: clamp(34px, 4.8vw, 76px);
        color: var(--pa-taupe-ink);
      }

      .pa-ba-title {
        margin-top: clamp(26px, 3vw, 42px);
        padding-top: clamp(16px, 1.9vw, 24px);
        border-top: 1px solid var(--line);
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(17px, 1.6vw, 24px);
        line-height: 1.24;
        letter-spacing: -0.015em;
        color: var(--ink-strong);
      }
      .pa-ba-text {
        margin-top: 11px;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(12.5px, 1vw, 14px);
        line-height: 1.7;
        color: var(--text-secondary);
      }

      /* ── 09 · What changed ─────────────────────────────────── */
      /* The thesis dominates; the principles are footnotes to it. */
      .pa-chg {
        padding: var(--pa-y-lg) var(--gutter);
        border-bottom: 1px solid var(--line);
      }
      .pa-chg-h2 {
        margin-top: clamp(22px, 2.6vw, 40px);
        max-width: 17ch;
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(32px, 5.4vw, 92px);
        line-height: 1.04;
        letter-spacing: -0.028em;
        color: var(--ink-strong);
      }
      .pa-notes {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: clamp(22px, 2.8vw, 52px);
        margin-top: clamp(56px, 8vw, 124px);
        padding-top: clamp(18px, 2.2vw, 30px);
        border-top: 1px solid var(--warm-black);
        list-style: none;
      }
      .pa-note { min-width: 0; }
      .pa-note-index {
        font-family: var(--font-mono), monospace;
        font-size: 9px;
        letter-spacing: 0.2em;
        color: var(--pa-taupe-ink);
      }
      .pa-note-title {
        margin-top: clamp(12px, 1.4vw, 18px);
        font-family: var(--font-body), sans-serif;
        font-size: clamp(11.5px, 0.92vw, 12.5px);
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        line-height: 1.45;
        color: var(--ink-strong);
      }
      .pa-note-text {
        margin-top: 10px;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(12px, 0.96vw, 13.5px);
        line-height: 1.7;
        color: var(--text-secondary);
      }

      /* ── Confidentiality — a museum label ──────────────────── */
      .pa-conf {
        padding: clamp(28px, 3.4vw, 52px) var(--gutter);
        border-bottom: 1px solid var(--line);
        max-width: 660px;
      }
      .pa-conf-idx {
        font-family: var(--font-mono), monospace;
        font-size: 8.5px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--text-faint);
      }
      .pa-conf-main {
        margin-top: clamp(12px, 1.4vw, 18px);
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(15px, 1.35vw, 20px);
        line-height: 1.34;
        letter-spacing: -0.012em;
        color: var(--ink-strong);
      }
      .pa-conf-sub {
        margin-top: 9px;
        font-family: var(--font-mono), monospace;
        font-size: 8.5px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      /* ── Final visual moment ───────────────────────────────── */
      /* The photograph carries the section: a full canvas, the copy a small
         block in one corner, a diagonal scrim guaranteeing the type reads. */
      .pa-close {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 46fr) minmax(0, 54fr);
        align-content: end;
        min-height: min(94vh, 1020px);
        padding: 0;
        background: var(--pa-dark);
        overflow: hidden;
      }
      .pa-close-media {
        position: absolute;
        inset: 0 0 0 auto;
        width: 74%;
        overflow: hidden;
      }
      .pa-close-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 50% 42%;
        display: block;
        transform: scale(1.04);
      }
      .pa-close::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 1;
        background: linear-gradient(
          100deg,
          var(--pa-dark) 26%,
          rgba(20, 18, 15, 0.9) 43%,
          rgba(20, 18, 15, 0.24) 64%,
          rgba(20, 18, 15, 0) 78%
        );
        pointer-events: none;
      }
      .pa-close-copy {
        position: relative;
        z-index: 2;
        grid-column: 1;
        padding: 0 0 clamp(56px, 7vw, 116px) var(--gutter);
        min-width: 0;
      }
      .pa-close-h2 {
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(29px, 4.1vw, 68px);
        line-height: 1.08;
        letter-spacing: -0.026em;
        color: var(--pa-dark-ink);
      }
      .pa-close .pa-accent { color: #c9a074; }
      .pa-close-text {
        margin-top: clamp(24px, 3vw, 44px);
        padding-top: clamp(16px, 1.9vw, 24px);
        border-top: 1px solid rgba(239, 232, 220, 0.2);
        max-width: 32ch;
        font-family: var(--font-body), sans-serif;
        font-size: clamp(13px, 1.02vw, 14.5px);
        line-height: 1.72;
        color: var(--pa-dark-faint);
      }

      /* Scroll-linked parallax where the browser supports it, no JavaScript and
         no layout cost. Everywhere else the image simply sits still. */
      @supports (animation-timeline: view()) {
        @media (prefers-reduced-motion: no-preference) {
          .pa-close-img {
            animation: pa-parallax linear both;
            animation-timeline: view();
            animation-range: entry 0% exit 100%;
          }
          @keyframes pa-parallax {
            from { transform: scale(1.1) translateY(-2.6%); }
            to   { transform: scale(1.1) translateY(2.6%); }
          }
        }
      }

      /* ── Final CTA ─────────────────────────────────────────── */
      .pa-cta {
        display: grid;
        grid-template-columns: minmax(0, 62fr) minmax(0, 38fr);
        gap: clamp(32px, 4vw, 80px);
        padding: var(--pa-y-lg) var(--gutter);
      }
      .pa-cta-h2 {
        margin-top: clamp(20px, 2.2vw, 34px);
        font-family: var(--font-editorial), Georgia, serif;
        font-weight: 400;
        font-size: clamp(30px, 4.2vw, 68px);
        line-height: 1.08;
        letter-spacing: -0.026em;
        color: var(--ink-strong);
      }
      /* Its own line, not a trailing clause — otherwise "talk." wraps off on
         its own and the accent reads as an accident. */
      .pa-cta-accent {
        display: block;
        margin-top: clamp(6px, 0.8vw, 12px);
      }
      .pa-cta-side {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-start;
      }
      .pa-cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 15px 26px;
        border: 1px solid var(--border-btn);
        font-family: var(--font-mono), monospace;
        font-size: 10px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--ink-strong);
        transition: border-color 260ms ease, background-color 260ms ease;
      }
      .pa-cta-btn:hover {
        border-color: var(--border-btn-hovered);
        background: var(--button-hover-bg);
      }
      .pa-cta-btn span { color: var(--pa-taupe-ink); }
      .pa-cta-related {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-self: stretch;
        margin-top: clamp(34px, 4vw, 58px);
        padding-top: clamp(18px, 2.2vw, 28px);
        border-top: 1px solid var(--line);
        font-family: var(--font-mono), monospace;
        font-size: 9.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .pa-cta-related a { color: var(--text-muted); transition: color 220ms ease; }
      .pa-cta-related a:hover { color: var(--ink-strong); }

      /* ── Tablet ────────────────────────────────────────────── */
      @media (max-width: 1180px) {
        .pah-side { display: none; }
      }
      @media (max-width: 1080px) {
        .pap { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .pap-col:nth-child(1) { padding-top: clamp(24px, 3vw, 38px); }
        .pap-col:nth-child(2) { padding-top: clamp(48px, 6vw, 76px); }
        .pap-col:nth-child(3) {
          padding-top: clamp(24px, 3vw, 38px);
          padding-left: 0;
          border-left: 0;
          border-top: 1px solid var(--line);
        }
        .pap-col:nth-child(4) {
          padding-top: clamp(48px, 6vw, 76px);
          border-top: 1px solid var(--line);
        }
        .paw-row { grid-template-columns: clamp(48px, 6vw, 74px) minmax(0, 1fr); }
        .paw-text { grid-column: 2; padding-top: 0; margin-top: 14px; }
        .pa-wide-head { grid-template-columns: minmax(0, 1fr); align-items: start; }
        .pa-notes { grid-template-columns: minmax(0, 1fr); gap: 0; }
        .pa-note { padding: clamp(18px, 2.4vw, 26px) 0; border-top: 1px solid var(--line); }
        .pa-note:first-child { border-top: 0; padding-top: clamp(6px, 1vw, 10px); }
        .pa-note-text { max-width: 58ch; }
      }

      /* ── Mobile ────────────────────────────────────────────── */
      @media (max-width: 860px) {
        /* The image interrupts between the headline and the supporting copy —
           a composition, not a collapsed desktop stack. */
        .pah {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: auto auto auto auto auto auto;
          padding: clamp(16px, 4vw, 26px) 0 clamp(32px, 7vw, 52px);
        }
        .pah-text { display: contents; }
        .pah-eyebrow { grid-row: 1; margin: 0 var(--gutter); }
        .pah-h1 { grid-row: 2; padding: 0 var(--gutter); }
        .pah-media {
          grid-row: 3;
          grid-column: 1;
          height: min(76vh, 600px);
          margin-top: clamp(28px, 7vw, 44px);
        }
        .pah-sub {
          grid-row: 4;
          padding: 0 var(--gutter);
          margin-top: clamp(28px, 7vw, 40px);
          max-width: none;
        }
        .pah-rule { grid-row: 5; margin-top: clamp(26px, 6vw, 38px); }
        .pah-foot { grid-row: 6; padding: 14px var(--gutter) 0; }

        /* One dominant figure, two beneath it. */
        .pak { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .pak-cell { padding: clamp(18px, 5vw, 26px) clamp(16px, 4vw, 22px); }
        .pak-cell:nth-child(1) {
          grid-column: 1 / -1;
          padding: clamp(20px, 5.5vw, 30px) var(--gutter);
        }
        .pak-cell:nth-child(2) {
          border-left: 0;
          border-top: 1px solid var(--line);
          padding-left: var(--gutter);
        }
        .pak-cell:nth-child(3) {
          border-top: 1px solid var(--line);
          padding-right: var(--gutter);
        }
        .pak-cell:nth-child(2) dt { font-size: clamp(15px, 4.4vw, 20px); }
        .pak-cell:nth-child(3) dt { font-size: clamp(13px, 3.8vw, 17px); }

        .pa-sit-head {
          grid-template-columns: minmax(0, 1fr);
        }
        .pa-sit-head .pa-copy-lead {
          grid-column: 1;
          grid-row: 3;
          margin-top: clamp(20px, 5vw, 30px);
          max-width: none;
        }
        .pa-sit-figure {
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(18px, 5vw, 26px);
          padding-right: 0;
        }
        .pa-sit-media { height: min(84vh, 620px); }
        .pa-sit-caption { padding: 0 var(--gutter); }
        .pa-sit-stat {
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(28px, 7vw, 40px);
        }
        /* The figure leads on mobile; the supporting maths follows it. */
        .pa-stat-main { order: -1; text-align: left; }

        .pap { grid-template-columns: minmax(0, 1fr); }
        .pap-col,
        .pap-col + .pap-col {
          padding: clamp(24px, 6vw, 32px) 0;
          border-left: 0;
          border-top: 1px solid var(--line);
        }
        .pap-col:first-child { border-top: 0; }
        .pap-title { margin-top: clamp(14px, 4vw, 20px); }

        .paw-row { grid-template-columns: minmax(0, 1fr); gap: 10px; }
        .paw-text { grid-column: auto; margin-top: 4px; }

        /* The band drops below the first figure and above the second, so the
           decline still reads as a diagonal down the screen. */
        .pa-chart-row {
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(14px, 4vw, 22px);
        }
        .pa-plot { height: clamp(140px, 38vw, 190px); }
        .pa-cpl-end b { font-size: clamp(30px, 9vw, 46px); }
        .pa-chart-foot { flex-direction: column; align-items: flex-start; gap: 7px; }
        .pa-chart-foot i { text-align: left; }

        .pa-val-stage { margin-top: clamp(34px, 9vw, 52px); }
        .pa-val-a, .pa-val-b { font-size: clamp(54px, 21vw, 110px); }
        .pa-val-a { grid-column: 1 / 9; }
        .pa-val-arrow { grid-column: 4 / 10; font-size: clamp(20px, 6vw, 30px); }
        .pa-val-b { grid-column: 5 / 13; text-align: right; }
        .pa-val-mult {
          grid-column: 1 / 13;
          grid-row: 5;
          text-align: left;
          margin-top: clamp(38px, 10vw, 56px);
          padding-top: clamp(18px, 5vw, 26px);
          border-top: 1px solid var(--line);
        }
        .pa-val-mult b { font-size: clamp(40px, 13vw, 62px); }
        .pa-val-tag { grid-column: 1 / 13; }

        .pa-scale-label { position: static; margin-bottom: clamp(28px, 7vw, 40px); }
        .pa-scale-line { max-width: 17ch; }

        .pa-ba { grid-template-columns: minmax(0, 1fr); }
        .pa-ba-before {
          padding: clamp(22px, 5.5vw, 30px) clamp(18px, 4.5vw, 26px) clamp(28px, 7vw, 38px);
        }
        .pa-ba-after { padding: clamp(24px, 6vw, 32px) 0 0; }

        .pa-close { min-height: 90vh; grid-template-columns: minmax(0, 1fr); }
        .pa-close-media { width: 100%; }
        .pa-close-copy { padding-right: var(--gutter); }
        .pa-close::after {
          background: linear-gradient(
            to top,
            var(--pa-dark) 14%,
            rgba(20, 18, 15, 0.9) 34%,
            rgba(20, 18, 15, 0.24) 62%,
            rgba(20, 18, 15, 0) 80%
          );
        }
        .pa-close-copy { max-width: none; }

        .pa-cta { grid-template-columns: minmax(0, 1fr); gap: clamp(32px, 8vw, 44px); }
        .pa-cta-side { justify-content: flex-start; }
      }

      @media (max-width: 420px) {
        .pa-val-a, .pa-val-b { font-size: clamp(48px, 22vw, 84px); }
        .pa-scale-num { letter-spacing: -0.035em; }
      }

      /* ── Reduced motion ────────────────────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .pah-img { animation: none; }
        .pa-scale-img { animation: none; }
        .pa-cta-btn, .pa-cta-related a { transition: none; }
        .pa-draw { stroke-dasharray: none; stroke-dashoffset: 0 !important; }
      }
    `}</style>
  );
}
