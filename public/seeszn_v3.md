# SEESZN — Complete Website Rebuild Brief
## Rebuild from scratch. Delete everything from the current version.

This brief is the single source of truth. Follow it exactly.
Do not invent, improvise, or carry over anything from the previous build.
After completing Nav + Hero, stop and show a screenshot before continuing.

---

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS + CSS custom properties
- Framer Motion (scroll animations only — no typewriter)
- next/font/google for all fonts
- Resend for contact form
- All images in /public — filenames listed per section

---

## Global Reset (globals.css)

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-radius: 0 !important;
}

:root {
  --paper:      #ECE6DA;
  --warm-black: #11100E;
  --ink:        #1E1817;
  --dust:       #B8AEA0;
  --clay:       #9A4F32;
  --olive:      #C7D63A;
}

html {
  background: var(--paper);
  color: var(--warm-black);
  -webkit-font-smoothing: antialiased;
}

body { background: var(--paper); }

a { color: inherit; text-decoration: none; }
button { cursor: pointer; font-family: inherit; }

/* Only exception to border-radius: 0 */
.olive-dot { border-radius: 50% !important; }
```

---

## Fonts (layout.tsx)

```tsx
import { Barlow_Condensed, Playfair_Display, IBM_Plex_Mono } from 'next/font/google'

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
})
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
})
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})
```

Apply all three variables to `<html>`.

---

## Typography Rules

| Role | Font | Weight | Case |
|---|---|---|---|
| Wordmark | Barlow Condensed | 800 | UPPER |
| Hero headline | Playfair Display | 400/italic | Sentence |
| Section display | Barlow Condensed | 700 | UPPER |
| Service numbers (01–04) | Barlow Condensed | 700 | — |
| Body / labels / meta | IBM Plex Mono | 400 | mixed |
| Data accent (83%) | Barlow Condensed | 800 | — |

- All labels: `font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dust)`
- IBM Plex Mono body: `font-size: 13–14px; line-height: 1.7`
- Playfair Display display: `line-height: 1.05`
- `border-radius: 0` everywhere except `.olive-dot`

---

## NAV

Fixed top. `background: var(--paper)`. `border-bottom: 1px solid var(--warm-black)`. Height: 64px.

**Left:** SEESZN in Barlow Condensed 800, 20px, `letter-spacing: -0.01em`
Below wordmark: `width: 32px; height: 2px; background: var(--olive); margin-top: 4px`

**Center:** Four items in IBM Plex Mono 11px uppercase, `letter-spacing: 0.12em`:
`WORK · METHOD · INTELLIGENCE · ABOUT`
Active state: small olive dot below `width: 4px; height: 4px; background: var(--olive)` centered under text.

**Right:** Button `START A DIAGNOSIS →`
- `border: 1px solid var(--warm-black)`
- `background: transparent`
- `padding: 10px 20px`
- `font-family: IBM Plex Mono; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase`
- `border-radius: 0`
- Arrow `→` always `color: var(--olive)`
- Hover: `background: var(--warm-black); color: var(--paper)`

---

## SECTION 01 — HERO

Full viewport height (`min-height: 100vh`). Two columns: 55% left / 45% right. No gap.

**Left column** — `padding: 120px 64px 80px`, vertically flex, justify-content: flex-start, padding-top after nav.

Top label: `01` in IBM Plex Mono 11px, `var(--dust)`

Headline — Playfair Display 400, `font-size: clamp(52px, 7vw, 96px)`, `line-height: 1.05`, `color: var(--warm-black)`:
```
You are not
in the answer.
```
The word `answer` → `<em>` styled `font-style: italic`, same font, same size, same color.

Olive rule: `width: 48px; height: 2px; background: var(--olive); margin: 24px 0`

Sub in IBM Plex Mono 13px, `var(--dust)`, `max-width: 360px`, `line-height: 1.7`:
```
VISIBILITY SYSTEMS FOR BRANDS
ENTERING MACHINE MEMORY.
```

CTA `START A DIAGNOSIS →` — same style as nav button, `margin-top: 40px`

Vertical text — right edge of left column, rotated 90deg, IBM Plex Mono 10px uppercase `var(--dust)`:
`PARIS — BREMEN — BANGKOK`

**Right column** — full height, no padding:
- Image: `/public/seeszn-home-main-picture.png`
- `object-fit: cover; width: 100%; height: 100%`
- Caption bottom-right inside image: `CARVED FORM` IBM Plex Mono 10px `var(--dust)` with `padding: 16px`

Bottom: `border-top: 1px solid var(--warm-black)` full width divider.

---

## SECTION 02 — THE SHIFT

Background: `var(--warm-black)`. `padding: 64px`.

**Top — full width black bar with white text:**
Barlow Condensed 700, `clamp(28px, 4vw, 48px)`, `color: var(--paper)`, `letter-spacing: 0.02em`:
```
SEARCH WAS ONCE A PAGE.
NOW IT IS AN ANSWER.
ANSWERS NEED SOURCES.
```

**Below — Timeline row:**
Four points connected by a horizontal line. Each point: small circle `var(--olive)` 8px, label above, year below.

```
2000          2010          2020          2024+
Rankings      Traffic       Attention     AI Answers
```

Line: `1px solid var(--dust)` connecting all four dots horizontally.
Labels: IBM Plex Mono 11px uppercase `var(--dust)`.
Years: IBM Plex Mono 13px `var(--paper)`.

**Bottom right:** Link `THE SHIFT →` IBM Plex Mono 12px `var(--olive)`, right-aligned.

---

## SECTION 03 — SERVICES (PRESENCE · SOURCES · CITATIONS · TIMING)

Label top-left: `02` + `WHAT WE BUILD` in IBM Plex Mono 11px `var(--dust)`.

Four rows. Each row: `border-top: 1px solid var(--warm-black)`. Last row also `border-bottom: 1px solid var(--warm-black)`.

Each row layout — three columns:
- **Left (15%):** Service number in Barlow Condensed 700, `font-size: clamp(48px, 6vw, 80px)`, `color: var(--warm-black)`
- **Middle (45%):** Service name + description
- **Right (40%):** Image, `height: 200px`, `object-fit: cover`

Row padding: `48px 0`

```
ROW 01 — PRESENCE
  Name: PRESENCE (Barlow Condensed 700, 28px)
  Sub: Appear where intent begins. (IBM Plex Mono 13px var(--dust))
  Image: /public/seeszn-home-main-01.png

ROW 02 — SOURCES
  Name: SOURCES (Barlow Condensed 700, 28px)
  Sub: Become the material machines pull from. (IBM Plex Mono 13px var(--dust))
  Image: /public/seeszn-home-main-02.png

ROW 03 — CITATIONS
  Name: CITATIONS (Barlow Condensed 700, 28px)
  Sub: Turn mentions into memory. (IBM Plex Mono 13px var(--dust))
  Image: /public/seeszn-home-main-03.png

ROW 04 — TIMING
  Name: TIMING (Barlow Condensed 700, 28px)
  Sub: Enter before the category hardens. (IBM Plex Mono 13px var(--dust))
  Image: /public/seeszn-home-main-04.png
```

Expand/collapse `+` icon far right of each row — IBM Plex Mono, toggles a hidden detail paragraph on click.

---

## SECTION 04 — ABSENCE INDEX

Label: `03 THE ABSENCE INDEX` IBM Plex Mono 11px `var(--dust)`.

Two-column layout: 50% / 50%.

**Left column:**
Headline — Playfair Display 400, `clamp(36px, 5vw, 64px)`:
```
Absence
is measurable.
```

Data accent — Barlow Condensed 800, `clamp(80px, 12vw, 140px)`, `color: var(--olive)`:
```
83%
```

Below in IBM Plex Mono 13px `var(--dust)`, `max-width: 320px`, `line-height: 1.7`:
```
OF DEFINE PROMPTS IN A CATEGORY
CAN FORM ANSWERS WITHOUT THE
BRANDS THAT BELIEVE THEY OWN IT.
```

Link: `SEE THE DATA →` IBM Plex Mono 12px `var(--olive)`, `margin-top: 32px`

**Right column:**
Particle scatter diagram — implement as SVG or Canvas:
- ~400 small dots (`var(--dust)`, radius 2px) randomly distributed in a 400×400 area
- One bright olive dot (`var(--olive)`, radius 5px) near center with a small label line pointing to it
- Label on the olive dot: `CITATION ABSENCE` IBM Plex Mono 10px `var(--olive)`
- Around the scatter: four labeled callouts connected by thin `var(--dust)` lines:
  - Top right: `PROMPT DRIFT`
  - Right: `SOURCE GAPS`
  - Bottom right: `CITATION ABSENCE` (olive colored)
  - Far right: `ENTITY WEAKNESS`
  - Bottom: `COMPETITOR RECALL`
- All callout labels: IBM Plex Mono 10px `var(--dust)` except CITATION ABSENCE which is `var(--olive)`

---

## SECTION 05 — SELECTED PROOFS (Cases)

Label left: `04 SELECTED PROOFS` IBM Plex Mono 11px `var(--dust)`.
Link right: `VIEW ALL CASES →` IBM Plex Mono 11px `var(--olive)`.

Three equal-width cards side by side. Each card:
- `border: 1px solid var(--warm-black)`
- Top: image `height: 200px`, `object-fit: cover`
- Body: `padding: 24px`
- Tag: IBM Plex Mono 10px uppercase `var(--dust)` — EDUCATION / TRAVEL / SAAS
- Headline: Playfair Display italic, 22px, `color: var(--warm-black)`:
  - Card 1: `From searchable to referenced.`
  - Card 2: `From content to category memory.`
  - Card 3: `From mentions to machine trust.`
- CTA: `VIEW CASE →` IBM Plex Mono 11px `var(--olive)`, `margin-top: 16px`
- Images: use main-01, main-03, main-04 respectively

---

## SECTION 06 — MANIFESTO

Full-width. `padding: 96px 64px`. Two columns: 55% / 45%.

**Left:**
Label: `05 OUR MANIFESTO` IBM Plex Mono 11px `var(--dust)`.

Headline — Barlow Condensed 700, `clamp(40px, 6vw, 80px)`, `line-height: 0.95`, `letter-spacing: 0.01em`:
```
IF THE MODEL
CANNOT CITE YOU,
YOU DO NOT EXIST.
```
The word `CITE` → `color: var(--olive)`

**Right:**
Four rows, each `border-top: 1px solid var(--dust)`, `padding: 16px 0`:

```
NOT RANKINGS     →    RECALL
NOT TRAFFIC      →    PRESENCE
NOT CONTENT      →    CITATIONS
NOT REACH        →    AUTHORITY
```

Left item: IBM Plex Mono 13px `var(--dust)` with strikethrough `text-decoration: line-through`
Arrow `→`: `var(--dust)`
Right item: IBM Plex Mono 13px `var(--warm-black)` bold

Bottom: Link `→` IBM Plex Mono 12px `var(--olive)`, right-aligned.

---

## SECTION 07 — CLOSING CTA

Two columns: 55% left / 45% right.

**Left:**
Label: `06` IBM Plex Mono 11px `var(--dust)`.

Headline — Playfair Display 400, `clamp(36px, 5vw, 64px)`:
```
This is not a pitch.
It is a diagnosis.
```

Sub in IBM Plex Mono 13px `var(--dust)`, `max-width: 400px`, `line-height: 1.7`, `margin: 24px 0`:
```
We map your visibility across Google
and all major AI platforms before we
discuss working together.
```

Form:
- Email input: `border: 1px solid var(--warm-black)`, `background: transparent`, IBM Plex Mono 14px, `padding: 14px 16px`, full width
- Focus: `outline: none; border-color: var(--olive)`
- Submit: `START A DIAGNOSIS →`, full black button, full width, IBM Plex Mono 12px uppercase, `padding: 14px`
- Arrow `→` always `color: var(--olive)`
- Success: replace form with IBM Plex Mono 14px: `Diagnosis requested. We'll be in touch.`

Resend API route: `/app/api/contact/route.ts`, sends to `hello@seeszn.com`

**Right:**
- Image: `/public/seeszn-home-main-picture.png`
- `object-fit: cover; width: 100%; height: 100%; min-height: 400px`

---

## FOOTER

`border-top: 1px solid var(--warm-black)`. `padding: 24px 64px`. Flex row space-between.

Left: `PARIS — BREMEN — BANGKOK` IBM Plex Mono 11px uppercase `var(--dust)`
Center: `SEESZN` Barlow Condensed 700 16px
Right: `HELLO@SEESZN.COM` IBM Plex Mono 11px `var(--dust)`

---

## Animations (Framer Motion)

Scroll-triggered only. NO typewriter. NO on-mount animations except hero.

```
Hero content: opacity 0→1, y 20→0, duration 0.6s, ease [0.16,1,0.3,1], stagger 0.1s between elements

All other sections: opacity 0→1, y 16→0, duration 0.5s
triggered at viewport threshold 0.15
stagger 0.08s between child elements

Hover — CTA buttons: background fill 0.2s
Hover — service rows: background var(--dust) at 4% opacity, 0.15s
Hover — case cards: border-color var(--olive), 0.15s

NO bounce, spring, rotate, scale, blur, flip
```

---

## Image Asset Map

All images go in `/public/`:

```
seeszn-home-main-picture.png  → Hero right column (vertical sculpture)
seeszn-home-main-01.png       → PRESENCE row + Case card 1 (light concrete)
seeszn-home-main-02.png       → SOURCES row (dark black concrete)
seeszn-home-main-03.png       → CITATIONS row + Case card 2 (clay/terracotta)
seeszn-home-main-04.png       → TIMING row + Case card 3 (layered light concrete)
```

---

## Build Order

1. globals.css + layout.tsx (fonts, CSS vars, reset)
2. Nav.tsx — stop, screenshot
3. Hero.tsx — stop, screenshot
4. TheShift.tsx (Section 02)
5. Services.tsx (Section 03) with images
6. AbsenceIndex.tsx (Section 04) with SVG scatter
7. Cases.tsx (Section 05)
8. Manifesto.tsx (Section 06)
9. Contact.tsx + /api/contact/route.ts (Section 07)
10. Footer.tsx
11. Animation pass (Framer Motion)
12. Mobile responsive pass
13. Metadata + OG + favicon (SZN)

---

## Critical Rules (enforce throughout)

- `border-radius: 0` globally — only `.olive-dot` nav indicator gets `border-radius: 50%`
- Background is ALWAYS `#ECE6DA` — never white, never pure black except Section 02
- IBM Plex Mono for ALL body text, labels, meta, UI copy
- Playfair Display ONLY for: hero headline, absence index headline, case card headlines, closing CTA headline
- Barlow Condensed ONLY for: wordmark, service numbers, data accent (83%), manifesto headline
- Olive `#C7D63A` appears on: nav rule, nav dot, CTA arrows, timeline dots, 83% number, CITE in manifesto, all `→` links, form focus state
- No gradients, no shadows, no decoration
- All section labels: IBM Plex Mono 11px, uppercase, letter-spacing 0.12em, color var(--dust)
