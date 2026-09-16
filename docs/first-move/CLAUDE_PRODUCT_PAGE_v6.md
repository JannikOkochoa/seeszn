# SEESZN First Move
## CLAUDE PRODUCT PAGE V6

**Status:** FINAL SOURCE OF TRUTH for the product page funnel
**Version:** 6.0.2 (final technical pre-launch pass)
**Location:** `docs/first-move/`. These files are internal. They must never live under `public/`, where Next.js would serve them as static assets.
**Supersedes:** `CLAUDE_PRODUCT_PAGE_v5.md` for funnel sequencing, price, public result disclosure, routing timing, contextual proof and copy rules.

V5 remains readable as history. Where V5 and V6 conflict, **V6 wins**.

V6 is not a redesign. The visual system, the security controls, the scan
infrastructure, the analytics contract and the request backend from V5 stay in
place. V6 changes the price, the sequence, and how much of the paid work the
free scan gives away.

---

# 1. Locked commercial values

```txt
PRICE              = 2.490 EUR net          (was 1.490 in V5)
DELIVERY           = 5–7 business days after complete access
CLIENT_EFFORT      = max. 15 minutes for access and approval
MEASUREMENT_WINDOW = 4–8 weeks
RETENTION          = 30 days
HOSTING            = France / EU
REFUND             = equivalent replacement move OR 100 percent refund, customer chooses
```

One product, one fixed price. No "ab 2.490 €", no channel pricing, no launch
discount, no crossed-out price, no scarcity, no countdown, no capacity pressure
without real runtime data.

Single source in code: `lib/first-move/product.ts`. Visible copy, structured
data, emails and API answers read from there.

---

# 2. Core principle

> Everything relevant must be available. Not everything must be visually
> dominant at the same time.

The page behaves like a product, not like a presentation deck. Sequencing, not
mystery: nothing commercially relevant is withheld to manufacture curiosity.

---

# 3. Two buyer speeds

**Discovery lane** (cold visitor)
Hero → Domain → public check → signal → relevant proof → offer → fit → start

**Fast lane** (warm visitor)
Hero → "First Move starten" (header) → offer → fit → start

The public scan is never a gate. A visitor who already understands the product
must not be forced through it. The header CTA anchors to `#angebot`, which is
the commercial part of the same page. No Services, About, Blog, Case Study,
Contact or other agency exits inside the product flow.

---

# 4. Page order

| # | Section | id | Rendering |
|---|---------|----|-----------|
| 1 | Product header (SEESZN / FIRST MOVE / CTA) | - | server |
| 2 | Hero: H1, lead, domain field, price line, microcopy | - | server shell, client field |
| 3 | Public check: states, signal, contextual proof | `#pruefung` | client |
| 4 | Process: "So läuft ein First Move ab" | `#ablauf` | server |
| 5 | Proof: "Ausgewählte Ergebnisse" | `#proof` | server |
| 6 | Offer: SEESZN FIRST MOVE, 2.490 € | `#angebot` | server |
| 7 | Fit check and start | `#start` | client |
| 8 | FAQ and service conditions | `#faq` | server |
| 9 | Closing band with domain field | - | server shell, client field |

Implementation: `components/first-move/Funnel.tsx` owns the sequence and the
interactive state. Every static section is a server-rendered slot passed in as a
ReactNode, so it stays in the delivered HTML.

---

# 5. Product header

Left: `SEESZN`. Right: `FIRST MOVE` and the CTA `FIRST MOVE STARTEN`.

The price is **not** in the header. It stays public directly under the domain
field and in the offer, where it does not compete with the primary action.

---

# 6. Hero

H1 (master): "Finde den nächsten Engpass, den wir belegen und direkt beheben können."

Lead: "Wir prüfen deine Domain auf öffentliche Signale. Wenn sich ein relevanter
Befund zeigt, siehst du ihn direkt. Vor einer Umsetzung verifizieren wir ihn."

The only dominant interactive element is `[ deine-domain.de ] [ Domain prüfen ]`.

Below it, visually secondary:
`2.490 € Festpreis · 5–7 Werktage · max. 15 Min. auf Kundenseite`

No route selector in the hero. The visitor does not diagnose the channel before
SEESZN has looked at the domain.

---

# 7. Channel context, asked late

The question "Wo merkst du das Problem aktuell am stärksten?" (Search / AI
Search / Paid Acquisition / Weiß ich nicht) appears **only** in the no-signal
state, where the answer actually sharpens the next step. It is passed to the
request as `channelContext` and fires `route_select`.

---

# 8. The public scan

The public scan is a demonstration of how SEESZN looks at acquisition problems.
It is not the product. The paid First Move is verification, bounded
implementation and measurement.

- full content width, one of the strongest interactive moments of the page
- real NDJSON states, emitted only after the step actually finished
- no fake percentage meter, no artificial delay, no example finding
- `aria-live="polite"` on the state list, focus moves to the result
- reduced motion respected

State labels are factual: Domain erkannt, robots.txt geprüft, Sitemap geprüft,
Relevante Seiten verglichen, Technische Signale geprüft, Muster abgeglichen.

---

# 9. Language of a public result

A short public scan can see a pattern. It cannot know the cause.

Use: "Relevantes Signal", "Wir sehen ein relevantes Signal", "Wir würden diesen
Befund vor einer Umsetzung verifizieren."

Never: "Ein belastbarer Engpass wurde qualifiziert" or any wording that claims
the root cause is proven before verification.

---

# 10. Free result: show enough, not the implementation

Public before purchase:

1. observation (title and summary)
2. one or two concise supporting evidence points
3. Impact
4. Confidence
5. intervention type, the broad class of action ("Konsolidierung auf eine zentrale Zielseite")
6. the verification line

The intervention type demonstrates judgment. It says what would be done, never
where. Source: `ProposedFirstMove.interventionType`.

Never public: exact winning URL, URLs to consolidate, canonical plan, redirect
plan, internal-link changes, implementation instructions, execution checklist,
measurement hypothesis, baseline values, QA plan, detailed Proposed First Move
scope, effort.

**Redact externally, preserve internally.** The full finding is written to
`public.first_move_scan_context` (migration
`20260809120000_first_move_scan_context.sql`) under a high-entropy id and
re-attached to the internal lead notification and the lead record when a request
arrives. It survives restarts, deploys, multiple instances and separate
serverless invocations. Lifetime 6 hours, logically enforced on read. No route
serves a row by id; the table is server-only (RLS on, no policies, grants for
`service_role` only). If the store is unavailable the scan and the request both
continue and the internal notification says the context could not be recovered.
In development the store falls back to process memory so nothing is written to
the shared database.

Before the first scan the result area shows a clearly marked fictional example
(`lib/first-move/example.ts`, label "Beispiel · noch keine Prüfung gelaufen").
It has its own type, never becomes the `finding` state, is never sent with a
request and is never tracked as a scan result. It disappears the moment a real
check starts.

Enforcement is server-side in `lib/first-move/disclosure.ts` (`toPublicFinding`).
The client never receives the full finding. See `SCAN_API_CONTRACT_v6.md`.

Qualification discipline is unchanged from V5: at least two independent signals,
noise rules intact, bot-protection responses never produce a finding, a null
result beats a fabricated one.

---

# 11. No signal is not a dead end

If nothing qualifies:

- "Öffentlich ist hier noch kein Befund stark genug für eine Empfehlung."
- short explanation that public signals only show a section of the picture
- the channel-context question
- "First Move trotzdem prüfen", which leads to the offer

The product stays buyable when the free scanner finds nothing.

---

# 12. Contextual proof

After a result, exactly one case appears as "Passendes Ergebnis":

| situation | case |
|-----------|------|
| Paid Acquisition | European B2B Workspace Brand |
| commerce surface (product schema or product detail paths) | French Beret |
| everything else, including AI Search | Established DACH Tourism Provider |

`relevantCaseId()` in `lib/first-move/proof.ts`. "Weitere Ergebnisse ansehen"
links to the full proof section, which keeps all three cases available for
visitors who never run a scan.

Approved numbers are unchanged:

- French Beret: 3.59K organic clicks in 3 months, 752K impressions (the average position of 7.1 is documentation context inside the methodology block, not a card metric)
- Established DACH Tourism Provider: 5,3 → 2,2 average position in AI Search, 45 days, client confidential
- European B2B Workspace Brand: 2,5 bis 3,0 Mio. € annual media spend, CPL 167–216 € → 100–130 €, Conversion Value 14K → 37K, 2020–2025, led by Philipp Ehrhardt, client confidential

No 20m revenue claim. No invented metrics.

---

# 13. Commercial reveal

Heading `SEESZN First Move`, price `2.490 €`, sub `Netto · Festpreis`.

Positioning: "Wir verifizieren den Befund, setzen eine klar begrenzte Änderung
um und dokumentieren anschließend das Ergebnis."

Prominent facts: 5–7 Werktage nach vollständigem Zugriff, max. 15 Minuten
Aufwand auf Kundenseite, Umsetzung enthalten, QA enthalten, Messung enthalten
(4–8 Wochen), Evidence Record.

Risk reversal, unchanged in meaning: "Ist der bestätigte First Move nach der
Verifikation nicht umsetzbar, bekommst du wahlweise einen gleichwertigen
Ersatz-Move oder 100 % Erstattung." Never "risikofrei", never a performance,
ranking or result guarantee.

Included and not included live in a `<details>` block.

---

# 14. Fit check and gates

Three questions, unchanged:

1. Wie kann der Move umgesetzt werden?
2. Wie ist der Freigabeweg?
3. Wie komplex ist die Umsetzung? (prefilled from the scan when available)

Gates, unchanged: no implementation route stops checkout, unknown approval
pauses it, very high complexity and enterprise or multi-market scope go to a
scoped review, paid account-level diagnosis requires read-only. Every gate has a
next step. A retainer is never the fallback product.

Complexity informs eligibility and never changes the public price.

The fit check runs with or without a finding.

---

# 15. Start state

There is no payment provider in the repository. Before submission the page
summarizes product, price, scope status, delivery and the next operational step,
and says plainly that scope confirmation and invoice follow the request.

Never shown: payment successful, checkout completed, card charged, purchase
complete.

---

# 16. Google Ads entry page

`/google-ads/first-move`, self-canonical, index and follow. The channel is known
here, so the hero asks for domain plus spend band:

`< 10.000 € / Monat`, `10.000–50.000 €`, `50.000–250.000 €`, `> 250.000 €`, `Weiß ich nicht`

CTA: "Paid Check starten". No OAuth request in the hero.

The public paid stage may only use publicly visible signals: tag and consent
indicators in the delivered HTML, conversion path, form friction, message
clarity, landing page performance. It never claims tracking correctness,
attribution correctness, search-term waste, PMax incrementality, brand versus
non-brand split, offline conversion quality, lead quality or account-level
economics.

Read-only is offered only after a real public paid signal, gated by
`FIRST_MOVE_ADS_OAUTH=enabled` **and** by `ADS_CONNECT_ROUTE_IMPLEMENTED` in
`lib/first-move/paid.ts`. As long as `/api/first-move/ads/connect` does not
exist, the connect step stays hidden even with the flag set, and the server logs
a warning. A CTA into a nonexistent route is worse than no CTA. When hidden, the
page says the read-only step happens in the kickoff instead of faking a
connection. Read-only means: no write
scope, no campaign changes before purchase, revocable, tokens never logged.

---

# 17. Copy rules

Write like an experienced senior specialist explaining the product to a business
owner. Plain is allowed. Not every heading has to be clever.

Forbidden patterns:

- em dash character
- repeated "nicht X, sondern Y" and "kein X, ein Y"
- slogan tricolons ("Ein Produkt. Ein Move. Ein Nachweis.", "Drei Cases. Drei Fragen. Eine Systemkompetenz.", "Beobachtung vor Meinung. Mindestens zwei Signale. Kein generisches Rauschen.")
- generic premium filler ("Antworten ohne Umweg.")
- overwritten consultant lines ("Welcher davon zählt, entscheidet die Evidenz, nicht der Einkauf.")
- "anonymisiert", "risikofrei", 20 Mio revenue claim, fake scarcity or urgency
- keyword stuffing with SEO, GEO, AIO, AI Search, Google Ads, Paid Acquisition

Replacements in force:

| V5 | V6 |
|----|----|
| Ein Produkt. Ein Move. Ein Nachweis. | So läuft ein First Move ab |
| Du kaufst keinen Audit. Du kaufst eine begrenzte Intervention … | Wir verifizieren den Befund, setzen eine klar begrenzte Änderung um und dokumentieren anschließend das Ergebnis. |
| Drei Cases. Drei Fragen. Eine Systemkompetenz. | Ausgewählte Ergebnisse |
| Antworten ohne Umweg. | Häufige Fragen |
| Beobachtung vor Meinung. Mindestens zwei sinnvolle Signale. Kein generisches Rauschen. | Ein Finding wird erst berücksichtigt, wenn mehrere Signale auf denselben Engpass hindeuten. |

Only one process language in public copy. Diagnose/Intervention/Messnachweis,
Find/Ship/Prove and Finden/Umsetzen/Belegen no longer appear as parallel public
frameworks. Find/Ship/Prove may live on internally (`INTERNAL_STAGES`).

---

# 18. Progressive disclosure

Detailed methodology, secondary evidence, expanded exclusions, measurement
detail and the FAQ live in accessible `<details>` blocks. Crawler-visible and
user-visible content stay identical. No SEO-only text, no hidden content that
keyboard or screen reader users cannot reach.

---

# 19. SEO and AIO

Human UX controls visible composition. Technical hygiene stays:

- server-rendered critical copy, one H1, semantic headings
- self-canonical on both routes, the paid page never canonicalizes to master
- index, follow, sitemap entries, correct metadata
- WebPage, Service with Offer (`price: "2490"`, EUR, net), FAQPage, BreadcrumbList
- no AggregateRating, no reviews, no invented availability

Structured data matches visible product reality. No section exists purely for
search engines or answer engines.

---

# 20. Analytics

V5 event names stay valid. `route_select` now fires only when the visitor
actually supplies channel context.

Added in V6: `offer_view`, `proof_expand`, and a `lane` dimension
(`discovery` | `fast`).

Renamed in V6, because there is no online checkout: `checkout_start` →
`first_move_request_start`, `checkout_complete` → `first_move_request_submit`.
A submitted request is not a purchase, not a payment and not a conversion to a
paying customer. The old names remain only as historical references in the V5
documents.

The funnel can be read as: hero → domain_submit → public_scan_complete
(qualified true/false) → proof_expand → offer_view → implementation_check_start
→ first_move_request_start → first_move_request_submit, each carrying `lane`
and `signal`.

No PII, no new tracking script.

---

# 21. Development safety

`.env.local` points at the same Supabase project and the same mail provider as
production. `/api/first-move/request` therefore writes nothing and sends nothing
unless `NODE_ENV === "production"`. The route still answers successfully and
reports `devSuppressed: true`, so the funnel stays testable locally and the UI
shows the suppression instead of pretending success.

| Variable | Effect |
|---|---|
| `FIRST_MOVE_DEV_ALLOW_WRITES=true` | lifts the suppression locally, never in production |
| `SEESZN_DEV_MAIL_TO` | with writes allowed, redirects every local mail to this address |

The same switch governs persistence: `persistenceAllowed()` decides whether the
scan context goes to Supabase or to process memory. There is one guard, not
two.

Production is never affected: the guard in `lib/devGuard.ts` short-circuits to
"allowed" whenever `NODE_ENV` is production.

Other intake routes (`/api/contact`, `/api/brief-request`) are not covered by
this guard yet.

---

# 22. Scan spike

`scripts/first-move-scan-spike.mjs` calls the real scan logic directly
(`runFirstMoveScan` + `toPublicFinding`, same fetcher, same qualification, same
noise rules) and prints exactly what a visitor would see, plus an empty A/B/C/D
scoring line per domain. No HTTP, so the public rate limit is neither touched
nor needed; the production limit stays at 8 per IP per 10 minutes and there is
no bypass in any route. It writes no leads, stores no scan context, sends no
mail and judges nothing. `--internal` shows the internal candidate for debugging
and is explicitly not part of a blind review.

Run: `node --experimental-strip-types --import ./tests/register-ts.mjs scripts/first-move-scan-spike.mjs domains.txt`

---

# 23. Out of scope for V6

The internal Move Library (S01…, A01…, P01…), a persistent shareable scan
summary and a full Evidence Record product system are follow-up projects, not
part of this refactor. The current Evidence Record promise and its existing
implementation stay as they are.
