# SEESZN First Move
## CLAUDE PRODUCT PAGE V5

> **SUPERSEDED BY V6.** `CLAUDE_PRODUCT_PAGE_v6.md` replaces this document for the product page funnel: price (2.490 EUR net), funnel sequencing, public result disclosure, routing timing, contextual proof and copy rules. This file stays for history. Where the two conflict, V6 wins.


**Status:** FINAL SOURCE OF TRUTH  
**Version:** 5.0.0

This document supersedes all previous First Move product-page specifications, including V2 and V4, wherever they conflict with V5.

If an older implementation, document, mockup, comment or configuration conflicts with this file, **V5 wins**.

Do not reinterpret the product strategy during implementation.

---

# 1. Product definition

## Public product name

**SEESZN First Move**

## Header label

**FIRST MOVE**

## Internal system name

**Constraint Engine**

The internal term is useful for implementation and strategy. It is not the primary customer-facing headline.

## Core positioning

The customer does not buy SEO, GEO or Google Ads.

The customer buys decision confidence about the highest-value evidenced acquisition constraint that should be fixed first.

First Move is one product.

Search, AI Search and Paid Acquisition are diagnosis routes, not separate products.

Never build:

- separate SEO pricing
- separate GEO pricing
- separate Google Ads pricing
- a service catalogue inside the purchase journey
- a retainer as an immediate fallback offer

---

# 2. Locked commercial values

```txt
PRICE = 1.490 EUR net
DELIVERY = 5 to 7 business days after complete access
CLIENT_EFFORT = max. 15 minutes for access and approval
MEASUREMENT_WINDOW = 4 to 8 weeks
RETENTION = 30 days
HOSTING = France / EU
REFUND = equivalent replacement move OR 100 percent refund, customer chooses
```

Customer delay rule:

The delivery window begins only after complete access and an approval path are available.

If required access is not provided within 14 days, the service pauses.

Customer-caused delay does not create a refund claim arising from that delay.

Place the delay rule in FAQ / Terms / detail copy, not in the hero.

---

# 3. URL architecture

## Master

`/first-move`

Self-canonical.

`index,follow`

Primary traffic:

- Organic
- Direct
- Referral
- Brand
- SEO
- AI Search

## Google Ads entry

`/google-ads/first-move`

Self-canonical.

Do not canonicalize this page to `/first-move`.

It is the same product with different message match.

Both pages use the same:

- price
- risk reversal
- core mechanism
- checkout
- central product definition

The Google Ads page needs unique:

- title
- meta description
- H1
- hero copy
- problem framing
- public paid pre-check explanation
- proof ordering
- at least two substantive content sections

Audit existing `/diagnosis` or similar legacy routes.

If they duplicate the same product intent, update internal links and use a permanent redirect to `/first-move`.

Do not redirect an actually distinct diagnostic tool blindly.

Update sitemap.

---

# 4. Focused product header

On `/first-move` and `/google-ads/first-move` use a focused product header.

Left:

SEESZN logo

Right:

- FIRST MOVE
- 1.490 € netto
- First Move starten

Do not expose the normal agency navigation inside the purchase journey.

No visible primary links to:

- Ergebnisse
- Insights
- Studio
- Services
- About
- Blog
- Social
- Kontakt

Footer may contain:

- Datenschutz
- Impressum
- Terms
- necessary legal links

---

# 5. Visual system

Direction:

- high-end editorial
- European design studio
- APFR-inspired
- architectural
- quiet
- precise
- expensive
- intelligent
- not a SaaS template
- not an AI startup template

Use the existing SEESZN design system, fonts and tokens.

Preferred visual language:

- warm paper / off-white
- deep black
- existing SEESZN acid as accent
- serif display headlines
- sans / mono for labels and technical states
- thin rules
- strong grid
- controlled whitespace
- large editorial numerals
- minimal radius
- minimal shadow

Do not use:

- glassmorphism
- colourful gradients
- generic SaaS cards
- stock SaaS icons
- oversized pills
- decorative blobs
- parallax
- scroll-jacking

Acid is an accent, not a body-text colour.

No em dashes in visible copy.

---

# 6. Assets

Use the existing public assets exactly:

```txt
/first-move/first-move-hero-stone.webp
/first-move/case-build-french-beret.webp
/first-move/case-transform-tourism.webp
/first-move/case-scale-b2b-workspace.webp
/first-move/first-move-footer-texture.webp
```

Hero:

`first-move-hero-stone.webp`

Overlay as real HTML/CSS, not image text:

```txt
FOKUS
EVIDENZ
WIRKUNG
```

BUILD:

`case-build-french-beret.webp`

TRANSFORM:

`case-transform-tourism.webp`

SCALE:

`case-scale-b2b-workspace.webp`

Footer texture is optional. Use it only if composition improves.

Use `next/image`.

Hero gets priority. Other assets lazy-load.

Avoid CLS.

---

# 7. Master hero

Eyebrow:

**SEESZN FIRST MOVE · 1.490 € NETTO**

H1:

**Finde den nächsten Engpass, den wir belegen und direkt beheben können.**

Acid may highlight one important word, preferably `Engpass`.

Support copy:

> Wir starten mit deiner Domain und prüfen öffentliche Signale. Daraus entsteht ein erster belegbarer Befund. Danach vertiefen wir genau dort, wo der größte Hebel liegt: Search, AI Search oder Paid Acquisition. Ein First Move wird nicht nur empfohlen, sondern innerhalb eines klaren Scopes umgesetzt und anschließend dokumentiert.

Domain field:

`deine-domain.de`

CTA:

**Domain prüfen**

Microcopy:

**Keine E-Mail vor dem ersten Ergebnis · Öffentliche Signale · Kein Retainer erforderlich**

The first user commitment is only the domain.

Immediately below, use the three-step strip:

### 01 DIAGNOSE

Öffentliche Signale lesen und Muster erkennen.

### 02 INTERVENTION

Einen begrenzten Move umsetzen, der den Engpass adressiert.

### 03 MESSNACHWEIS

Umsetzung und Wirkung im definierten Fenster dokumentieren.

---

# 8. Routing

Routing is not a service selector.

Question:

**Wo vermutest du den größten Engpass?**

Options:

- SEARCH
- AI SEARCH
- PAID ACQUISITION
- ICH BIN MIR NICHT SICHER

Default:

**ICH BIN MIR NICHT SICHER**

Descriptions:

Search:

Rankings, technische Struktur, Suchintention, interne Signale.

AI Search:

ChatGPT, Gemini, Perplexity, AI Overviews, Entities, Antworten, Zitierfähigkeit.

Paid Acquisition:

Google Ads, Signalqualität, Tracking, Leadqualität, Budgeteffizienz.

Unsure:

SEESZN startet breit und routet anhand der Evidenz.

Use a compact editorial selection UI, not four large service cards.

---

# 9. Public scan UX

The scan experience is a core product moment.

Recommended composition:

Left:

technical live evidence states.

Right:

qualified finding state.

Possible real states:

- Domain erkannt
- robots.txt gelesen
- Sitemap erkannt
- öffentliche URLs gelesen
- Seitentemplates erkannt
- technische Muster geprüft
- semantische Muster erkannt
- Finding wird qualifiziert

Use `aria-live`.

No fake percentage meter.

No generic spinner as the entire experience.

If a real scan endpoint exists, integrate it.

If infrastructure is incomplete, build a clean adapter / state machine.

Do not fabricate production findings.

A static result before a real scan must be labelled **Beispiel**.

Example only:

Finding:

**Drei Seiten konkurrieren um dieselbe kommerzielle Absicht.**

Impact:

High

Confidence:

Medium

Effort:

Low

Proposed First Move:

**Konsolidierung auf eine kanonische Zielseite.**

Timing target:

0 to 3 sec:
domain and reachability

3 to 10 sec:
scope and first signals

10 to 45 sec:
finding qualification

45+ sec:
optionally offer email continuation if processing is genuinely still running

Never ask for email before visible value.

---

# 10. Paid Acquisition: final two-stage flow

This is a V5 override.

Do not request Google Ads OAuth in the hero.

## Stage 1

Inputs:

- domain
- spend band

Spend bands:

- < 10.000 € / Monat
- 10.000 bis 50.000 € / Monat
- 50.000 bis 250.000 € / Monat
- > 250.000 € / Monat
- Ich weiss es nicht

CTA:

**Paid Check starten**

No email.

No OAuth.

Stage 1 may evaluate only public or publicly inferable evidence:

- public tag and measurement signals
- consent implementation
- landing page performance
- conversion path
- form friction
- landing page structure
- technical errors
- message clarity

Do not claim full knowledge of:

- conversion actions
- attribution settings
- search-term waste
- PMax incrementality
- brand versus non-brand spend
- offline conversion quality
- full lead quality

After a real public finding has shown value:

Copy:

**Für den vollständigen Paid-Befund brauchen wir Read-only-Zugriff.**

CTA:

**Google Ads read-only verbinden**

Read-only requirements:

- no write scope
- no campaign changes before purchase
- revocable
- no token logging

With Read-only, account evidence may include:

- Brand Leakage
- Search-Term Waste
- PMax Incrementality
- Conversion Signal Quality
- Campaign Fragmentation
- Landingpage Mismatch
- Lead and value signal quality where data exists

If OAuth is not production-ready, do not fake it.

Use a clean integration boundary / feature flag so the page can launch without rewriting the experience later.

---

# 11. Result state

After qualification:

Headline:

**Ein belastbarer Engpass wurde qualifiziert.**

Show:

- Finding
- Impact
- Confidence
- Effort
- Proposed First Move
- Scope
- Measurement hypothesis

Primary CTA:

**Umsetzung prüfen**

Secondary CTA:

**Ergebnis per E-Mail senden**

Do not make a sales call the primary CTA.

---

# 12. Proof architecture

Section label:

**BEWIESEN IN DER PRAXIS**

H2:

**Drei Cases. Drei Fragen. Eine Systemkompetenz.**

Use three compact proof modules.

Do not place three full case studies inside the purchase flow.

Optional evidence expansion must remain in the same journey.

Never use these visible labels:

- anonymisiert
- anonymer Kunde
- anonymisierte Marke

## BUILD

Label:

**BUILD**

Name:

**French Beret**

Descriptor:

**E-Commerce · International · SEO + GEO**

Lead KPI:

**3.59K**

**Organic Clicks in 3 Monaten**

Secondary:

**752K Google Impressions**

**Ø Position 8,3**

The lead metric is 3.59K clicks, not impressions.

## TRANSFORM

Label:

**TRANSFORM**

Name:

**Established DACH Tourism Provider**

Descriptor:

**DACH · SEO + AI Search**

Lead KPI:

**5,3 → 2,2**

**Average Position in AI Search**

Secondary:

**45 Tage**

Small:

**Client confidential**

Optional evidence expansion:

- constant prompt set
- ChatGPT
- Gemini
- Perplexity
- Google AI Overviews
- same measurement logic before and after

## SCALE

Label:

**SCALE**

Name:

**European B2B Workspace Brand**

Descriptor:

**DACH · Google Ads**

Lead KPI:

**2,5 bis 3,0 Mio. €**

**Annual Media Spend**

Secondary:

**CPL 167 bis 216 € → 100 bis 130 €**

**Conversion Value 14K → 37K**

**2020 bis 2025**

Attribution:

**Led by Philipp Ehrhardt · Paid Acquisition at SEESZN**

Small:

**Client confidential**

Never display:

**20 Mio. €+ Revenue**

Do not claim that SEESZN as a company was already the account owner in 2020.

Master proof order:

1. TRANSFORM
2. BUILD
3. SCALE

Google Ads proof order:

1. SCALE
2. TRANSFORM
3. BUILD

---

# 13. Mechanism

Section:

**SO ARBEITET SEESZN**

Use exactly three steps.

## 01 FIND

Beobachtung vor Meinung.

Mindestens zwei sinnvolle Signale.

Kein generisches Rauschen.

## 02 SHIP

Eine echte begrenzte Intervention geht live.

## 03 PROVE

Implementation bestätigen.

Wirkung im definierten Fenster dokumentieren.

Nur attribuieren, was die Daten tragen.

Customer copy:

**Du kaufst keinen Audit. Du kaufst eine begrenzte Intervention mit dokumentiertem Vorher/Nachher-Nachweis.**

Do not add a fourth `LEARN` step.

---

# 14. Fit check

Headline:

**Passt dieser Move in den Festpreis?**

Only three questions.

## 01 Umsetzung

**Wie kann der Move umgesetzt werden?**

- SEESZN bekommt Zugriff
- Unser internes Team setzt um
- Unsere bestehende Agentur / Entwickler setzen um
- Aktuell gibt es keinen Umsetzungsweg

## 02 Freigabe

**Wie ist der Freigabeweg?**

- Direkte Entscheidung möglich
- Interne Abstimmung 1 bis 2 Personen
- Externe Freigabe
- Noch unklar

## 03 Komplexität

Prefer prefill from scan.

Options:

- Einfach
- Mittel
- Hoch
- Sehr hoch

Complexity does not automatically change price.

It controls eligibility.

Routing is not a fit question.

All deeper access questions belong to onboarding after checkout.

---

# 15. Eligibility gates

## No implementation path

Stop checkout.

Next action:

**Umsetzungsweg klären**

## Approval unknown

Pause checkout.

Next action:

**Freigabeweg klären**

## Paid full finding without Read-only

Do not pretend that an account-level finding is qualified.

Show public value first.

Then request Read-only.

## Enterprise scale

Examples:

- 50.000+ URLs
- very complex paid account

Use scoped review if necessary.

## Multi-market

4+ markets plus SEESZN implementation may require scoped review.

## Capacity

Only show real runtime capacity.

No fake scarcity.

Every gate explains:

- why
- what happens next

Never introduce an immediate retainer as an escape product.

---

# 16. Offer

Heading:

**SEESZN FIRST MOVE**

Price:

**1.490 EUR netto**

Copy:

**Eine verifizierte Diagnose, eine begrenzte Intervention und ein dokumentierter Nachweis.**

Included:

- Scan / Review + Finding-Verifikation
- Auswahl des passenden First Move
- kurzer Zugriff / Kickoff
- Umsetzung der begrenzten Intervention
- QA + eine Freigabeschleife
- Mess-Setup
- Evidence Record
- Follow-up nach Messfenster

Not included:

- Relaunch
- Migration
- Massen-Content
- laufender Linkaufbau
- laufende Ads-Betreuung
- kompletter Account Rebuild
- Multi-Market Rollout

Reassurance:

- 5 bis 7 Werktage nach vollständigem Zugriff
- max. 15 Minuten Kundenaufwand
- 4 bis 8 Wochen Messfenster
- Ersatz-Move oder 100 % Erstattung
- Scan-Daten 30 Tage
- Hosting Frankreich / EU

CTA:

**First Move starten**

No discounts.

No coupons.

No countdown timer.

No fake availability.

---

# 17. Risk reversal

Minimum customer-facing copy:

> Ist der bestätigte First Move nach der Verifikation nicht umsetzbar, bekommst du wahlweise einen gleichwertigen Ersatz-Move oder 100 % Erstattung.

The customer chooses.

Keep the delay clause in detail copy:

> Die Lieferfrist beginnt nach vollständigem Zugriff und geklärtem Freigabeweg. Werden notwendige Zugänge nicht innerhalb von 14 Tagen bereitgestellt, pausiert die Leistung. Eine vom Kunden verursachte Verzögerung begründet keinen Erstattungsanspruch aus dieser Verzögerung.

---

# 18. FAQ

FAQ must be visible, crawlable and server-rendered.

Include:

- Was ist ein SEESZN First Move?
- Was bekomme ich für 1.490 €?
- Welche Signale prüft SEESZN?
- Kann First Move auch Google Ads betreffen?
- Braucht SEESZN vor dem Kauf Zugriff auf meine Website?
- Braucht SEESZN vor dem Kauf Schreibzugriff auf Google Ads?
- Wann ist der First Move umgesetzt?
- Wie wird die Wirkung gemessen?
- Was passiert, wenn kein belastbarer Move gefunden wird?
- Was passiert, wenn der bestätigte Move nicht umsetzbar ist?
- Wie lange werden Scan-Daten gespeichert?
- Was passiert, wenn ich notwendige Zugänge nicht rechtzeitig bereitstelle?

No vague marketing answers.

---

# 19. Final CTA

Headline:

**Der nächste sinnvolle Move beginnt mit deiner Domain.**

Domain field.

CTA:

**Domain prüfen**

Microcopy:

**Keine E-Mail vor dem ersten Ergebnis · 1.490 € Festpreis**

Footer texture is optional.

---

# 20. SEO

## Master

URL:

`/first-move`

Title:

**SEESZN First Move | Den wichtigsten Akquisitionsengpass finden**

Meta description:

**SEESZN findet den stärksten belegbaren Engpass in Search, AI Search oder Paid Acquisition, setzt einen klar begrenzten First Move um und dokumentiert die Wirkung. 1.490 € netto.**

One H1.

Logical H2 / H3 structure.

Critical content server-rendered.

No hidden keyword lists.

No doorway content.

No keyword stuffing.

Natural semantic coverage:

- SEESZN First Move
- Akquisitionsengpass
- SEO
- Search
- AI Search
- Google Ads
- Paid Acquisition
- Website Scan
- AI Search Optimierung
- GEO
- AIO
- Google Ads Analyse

Use `AI Search` as the primary user-facing term.

## Google Ads entry

URL:

`/google-ads/first-move`

Title:

**Google Ads First Move | Budget- und Signalprobleme finden | SEESZN**

Meta description:

**SEESZN zeigt zuerst öffentliche Paid-Acquisition-Signale und vertieft den Befund bei Bedarf per Google Ads Read-only. Ein First Move, 1.490 € netto.**

Self-canonical.

Unique hero and supporting copy.

Sitemap included.

---

# 21. AIO / GEO / machine readability

Critical content must be available in SSR HTML.

Near the hero, include a concise 40 to 60 word definition:

> SEESZN First Move ist eine begrenzte Diagnose- und Umsetzungsleistung. SEESZN identifiziert anhand belegbarer Signale den wichtigsten Engpass in Search, AI Search oder Paid Acquisition, setzt genau eine passende Intervention um und dokumentiert anschließend den Vorher/Nachher-Zustand.

Use:

- explicit section headings
- direct answers
- clear product name
- exact price
- exact delivery
- exact risk reversal
- exact proof metrics
- exact measurement methodology
- semantic HTML

Important information must not exist only inside images or canvas.

Structured data, if consistent with the current architecture:

- Organization
- WebPage
- Service
- Offer
- FAQPage

Offer:

```json
{
  "price": "1490",
  "priceCurrency": "EUR"
}
```

Structured data must match visible content.

No fake review stars.

No AggregateRating without evidence.

---

# 22. Accessibility

Meet WCAG AA.

Required:

- visible focus states
- keyboard navigation
- `aria-live` for scan progress
- real labels
- useful validation
- sufficient hit targets
- no colour-only information
- `prefers-reduced-motion`
- semantic buttons and links

Hero stone is mostly decorative.

Do not stuff SEO keywords into alt text.

---

# 23. Performance

Use Next.js best practices.

- `next/image`
- responsive sizes
- hero priority
- other images lazy
- no CLS
- minimal client JavaScript
- Server Components where appropriate
- no unnecessary animation dependency
- no heavy third-party package without a clear reason

---

# 24. Security

For server-side public URL fetching:

- normalize URLs
- HTTP / HTTPS only
- block localhost
- block private IP ranges
- block link-local ranges
- revalidate redirects
- rate limit
- cap response size
- timeouts
- no secret logging

For Google Ads:

- Read-only pre-purchase
- encrypted token handling
- no token logging
- revocation
- no write operation before purchase

---

# 25. Analytics

Use the existing analytics and consent system.

Events:

```txt
first_move_view
domain_submit
route_select
spend_band_select
public_scan_start
public_scan_signal
public_scan_complete
finding_view
evidence_expand
paid_connect_click
implementation_check_start
fit_check_step
fit_check_complete
checkout_start
checkout_complete
```

The funnel should make it possible to understand:

Hero → Domain → Finding → Fit Check → Checkout → Purchase

Avoid unnecessary PII.

---

# 26. Responsive

Test at least:

- 390 px
- 768 px
- 1024 px
- 1440 px
- 1728 px

Desktop:

editorial grid.

Mobile:

preserve hierarchy and rhythm.

Do not simply stack every desktop box without recomposition.

No horizontal overflow.

---

# 27. Copy hard rules

Never use visible copy containing:

- anonymisiert
- anonymer Kunde
- anonymisierte Marke
- 20 Mio. €+ Revenue
- kostenloses Audit
- kostenloser SEO Scan

Never promise a ranking.

Never use fake scarcity.

Never use a sales call as the primary CTA.

Never use em dashes.

Tone:

- precise
- calm
- confident
- evidence-led
- editorial
- premium

---

# 28. Scan quality

Search / AI Search quality reviewer:

**Maxim**

Paid quality reviewer:

**Philipp**

Before broad rollout, validate scan logic against at least:

- 20 real domains
- 5 Ads accounts

Do not expose fixtures as real findings.

---

# 29. Final QA

Before declaring done:

- production build passes
- TypeScript passes
- lint passes
- no console errors
- no hydration errors
- routes work
- canonicals correct
- metadata correct
- structured data valid
- sitemap correct
- mobile checked
- keyboard checked
- error states checked
- form validation checked
- checkout checked
- legal links checked

Search the new product-page code for:

```txt
EM_DASH_CHARACTER_U_PLUS_2014
anonymisiert
anonym
20 Mio
2 Werktage
28 Tage
Google Ads Read-only prüfen
```

No stale public copy may remain.

Read-only must appear only after visible public Paid value.

French Beret lead KPI must be 3.59K Organic Clicks, not 752K Impressions.

---

# 30. Definition of done

A buyer must understand within seconds:

1. what First Move is
2. what problem it solves
3. why SEESZN is credible
4. why one move is selected
5. what happens
6. what it costs
7. how long it takes
8. what happens if implementation fails
9. what to do next

The buyer should not think:

> Which agency service should I select?

The buyer should think:

> These people identify what I should fix first, ship it and show me what changed.

---

# 31. Build handoff

After implementation, report only:

- changed files
- built routes
- legacy route changes
- scan integration
- Paid two-stage integration
- SEO / AIO implementation
- analytics events
- build / lint / typecheck result
- real remaining technical blockers

Do not propose a new strategy.

Do not reopen the design direction.

Build the frozen V5 product.

---

# 32. Implementation status

Recorded after the production build on 2026-08-09. This section documents where
the shipped product differs from the specification above, and why. Nothing here
reopens the strategy: it records facts a later reader needs so the document does
not contradict the running code.

## Built routes

| Route | Type | Notes |
| --- | --- | --- |
| `/first-move` | static, index,follow, self-canonical | master product page |
| `/google-ads/first-move` | static, index,follow, self-canonical | paid entry page |
| `/api/first-move/scan` | dynamic | NDJSON stream, Search / AI Search / unsure |
| `/api/first-move/paid-check` | dynamic | NDJSON stream, paid stage 1 |
| `/api/first-move/request` | dynamic | result email and binding request |

## Deviations

**Assets were delivered as PNG and converted.** All five assets arrived in
`public/` as PNG files with encoded separators in the filename and were converted
to WebP at the exact paths in section 6. No image was replaced, renamed in
meaning or substituted with stock. The TRANSFORM plate arrived last and is now
live; the proof card still falls back to a typographic evidence plate if a path
in `ASSETS` is ever `null`.

**`/diagnosis` was neither redirected nor removed.** It is a technically distinct
tool with its own API, result cockpit and lead path, so section 3 forbids a blind
redirect. To satisfy the rule that no two indexable German product pages compete
for the same intent, it now carries `noindex, follow` and is out of the sitemap.
It stays live and functional. `/en/diagnosis` is untouched and still indexable,
because no English First Move page exists. Product CTAs sitewide (header, footer,
commercial landing pages, case study) now point at `/first-move`.

**Google Ads Read-only is behind a feature flag.** The OAuth flow is not
production-ready, so no connect button is rendered. `FIRST_MOVE_ADS_OAUTH=enabled`
turns it on; the UI for it already exists. Until then the page states plainly that
Read-only is set up during kickoff, which is what actually happens.

**Checkout is a binding request, not a payment.** The repository has no payment
provider. "First Move starten" collects a company email, writes a lead
(`source: first_move_checkout`) and sends the internal notification. The user
sees: scope confirmation in writing, then the invoice. Nothing pretends a payment
was taken.

**Analytics has no host system yet.** The public site loads no tag manager and no
consent banner, so no script was added. `lib/first-move/analytics.ts` writes the
V5 event names to `window.dataLayer` and `window.gtag` when they exist and is a
no-op otherwise. All fourteen events from section 25 are wired.

**Measurement baselines say "vier Wochen", not "28 Tage".** Same window, wording
chosen so the QA string search in section 29 stays unambiguous.

## Guards added during validation

Two false positives showed up when the scan was tested against real domains and
are now blocked in `lib/first-move/qualify.ts` and `lib/first-move/paid.ts`:

1. **Bot protection.** Cloudflare and Akamai challenge pages answer `403` and
   carry `noindex`, no H1 and no tags. That produced a confident "your homepage is
   noindex" finding for large, well indexed shops. A non-200 entry page now
   qualifies nothing and returns an honest "not publicly readable" result.
2. **Product variants and sales boilerplate.** Three flavours of one product, and
   two different categories that share "online kaufen | Marke", both looked like
   competing commercial intent. Product detail paths are excluded from the intent
   cluster, one page per variant family survives, and boilerplate words are
   removed before the overlap is measured. A match now needs both a high overlap
   and at least two shared non-boilerplate words.
