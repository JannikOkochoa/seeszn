# SEESZN First Move
## SCAN API CONTRACT V5

> **SUPERSEDED BY V6.** `SCAN_API_CONTRACT_v6.md` replaces this document for the public response shape: the full finding never leaves the server, only a redacted `PublicFinding` does. The evidence discipline described here stays valid. Where the two conflict, V6 wins.


**Status:** Source of Truth  
**Version:** 5.0.0  
**Supersedes:** `SCAN_API_CONTRACT_v2.md` and any older scan contract where it conflicts with this file.

This contract defines what the SEESZN First Move scan is allowed to observe, qualify, display and use as the basis for a proposed intervention.

The product rule is simple:

> A First Move is not a generic audit finding. It is a bounded, evidenced constraint that can support one realistic intervention and a measurement hypothesis.

---

## 1. Core principles

1. **Evidence before recommendation.**
2. **No fake scan results.**
3. **No generic best-practice issue may become a First Move by itself.**
4. **Search, AI Search and Paid Acquisition use different evidence sources but the same qualification discipline.**
5. **Paid Acquisition is two-stage: public pre-check first, Read-only account evidence second.**
6. **A result must separate observation from inference.**
7. **Impact, confidence and effort are distinct fields.**
8. **A finding must be bounded enough to fit First Move eligibility.**
9. **If evidence is insufficient, the correct output is `not_qualified`, not a fabricated recommendation.**
10. **All visible states must be traceable to real scan events or clearly marked examples.**

---

## 2. Canonical finding object

```ts
export type FirstMoveFinding = {
  id: string
  route: "search" | "ai_search" | "paid_acquisition" | "unsure"

  status:
    | "candidate"
    | "qualified"
    | "not_qualified"
    | "requires_more_evidence"
    | "ineligible"

  title: string
  summary: string

  evidence: EvidenceItem[]

  impact: "low" | "medium" | "high"
  confidence: "low" | "medium" | "high"
  effort: "low" | "medium" | "high"

  proposedFirstMove?: ProposedFirstMove
  measurementHypothesis?: MeasurementHypothesis

  eligibility: EligibilityState

  publicEvidenceOnly: boolean
  requiresReadOnly?: boolean

  createdAt: string
}
```

---

## 3. Evidence object

```ts
export type EvidenceItem = {
  id: string
  source:
    | "public_html"
    | "robots"
    | "sitemap"
    | "headers"
    | "performance"
    | "structured_data"
    | "internal_linking"
    | "content"
    | "entity_signal"
    | "ai_search_monitoring"
    | "public_tag_signal"
    | "consent_signal"
    | "landing_page"
    | "google_ads_read_only"
    | "crm_read_only"
    | "other"

  type: string
  observation: string

  scope?: {
    urls?: string[]
    querySet?: string
    market?: string
    accountIdMasked?: string
  }

  measuredValue?: string | number
  comparisonValue?: string | number

  observedAt: string
  reproducible: boolean
}
```

### Evidence rule

A meaningful First Move should normally have at least two supporting signals or one exceptionally strong directly measurable signal plus a second corroborating observation.

A generic checklist item is not corroboration.

---

## 4. Proposed First Move

```ts
export type ProposedFirstMove = {
  title: string
  scope: string
  implementationSurface:
    | "website"
    | "content"
    | "information_architecture"
    | "technical_seo"
    | "ai_search"
    | "google_ads"
    | "measurement"

  implementationMode:
    | "SEESZN_access"
    | "internal_team"
    | "existing_agency"

  expectedHours?: number

  bounded: boolean
  reversibleOrControlled: boolean
}
```

A proposed First Move must be:

- specific
- bounded
- realistically implementable
- measurable
- appropriate for the fixed-price product
- not a disguised full rebuild

---

## 5. Measurement hypothesis

```ts
export type MeasurementHypothesis = {
  metric: string
  baselineDefinition: string
  expectedDirection: "increase" | "decrease" | "stabilize" | "clarify"
  measurementWindowWeeksMin: 4
  measurementWindowWeeksMax: 8
  attributionLimitations?: string[]
}
```

Never promise a ranking, CPL, ROAS or traffic outcome that the evidence cannot support.

---

# 6. Search scan contract

## 6.1 Allowed public evidence

Examples:

- domain reachability
- HTTP status
- canonical behavior
- robots directives
- sitemap presence and syntax
- indexability signals
- heading structure
- template repetition
- duplicate or competing pages
- internal linking patterns
- content overlap
- semantic clustering
- structured data
- page performance
- HTML document size
- crawlable content
- public entity consistency
- public citation and answer structure

## 6.2 Search finding examples

Potentially valid:

- multiple indexable pages target the same commercial intent and dilute relevance
- commercially critical page has structurally weak internal support relative to competing internal pages
- crawl/indexation defect blocks a meaningful section
- template defect systematically flattens semantic structure across high-value pages
- a clearly evidenced information architecture issue creates measurable search friction

Potentially invalid if isolated:

- one missing alt text
- one generic meta description
- missing Organization schema
- one uncompressed image
- one H-tag preference issue with no broader consequence
- a generic "write more content" recommendation
- a generic backlink recommendation
- an automated SEO score

---

# 7. Search noise rules

The following items may contribute to a broader finding but must never qualify a First Move alone:

- missing alt attributes
- generic meta descriptions
- missing Organization schema
- image compression opportunities
- isolated title-length warnings
- generic content length recommendations
- generic "add FAQ schema" recommendations
- tool-generated health scores
- individual low-priority warnings without business relevance

A First Move must connect evidence to a meaningful constraint.

---

# 8. AI Search contract

AI Search is not a separate hack.

Potential evidence sources:

- explicit brand presence across a constant prompt set
- average position within a constant prompt set
- entity consistency
- source citation patterns
- answer extraction quality
- public third-party corroboration
- content chunk clarity
- page-level answer structure
- availability of verifiable factual statements

A valid AI Search finding must state:

1. what was observed
2. where it was observed
3. what the comparison basis is
4. how the proposed intervention could plausibly affect discoverability or citation readiness
5. what cannot be causally guaranteed

The Tourism proof methodology uses a constant prompt set and compares the same measurement logic before and after.

---

# 9. Paid Acquisition: two-stage evidence model

This section supersedes any earlier rule that asks for Google Ads Read-only access in the hero.

## Stage 1: Public pre-check

### Inputs

- domain
- monthly spend band

### No email required

### No OAuth required

### Allowed public signals

- public tag and measurement signals
- consent implementation
- landing page performance
- landing page structure
- conversion path
- form friction
- public technical defects
- message clarity
- ad-to-landing-page message consistency only where the ad/message context is actually available

### Public stage must NOT claim full knowledge of

- complete conversion action setup
- account attribution configuration
- actual search-term waste
- PMax incrementality
- brand versus non-brand spend
- offline conversion quality
- complete lead quality
- account-level bidding logic

When the public stage finds something useful, show it before requesting deeper access.

---

## Stage 2: Google Ads Read-only

Trigger:

> Visible public value has already been shown.

CTA:

> Google Ads read-only verbinden

Requirements:

- no write scope
- no campaign changes before purchase
- connection revocable
- tokens never logged
- data handling follows the 30-day retention policy where applicable
- account identifiers should be masked in user-facing logs

Account evidence may include:

- brand leakage
- search-term waste
- PMax incrementality
- conversion signal quality
- campaign fragmentation
- landing page mismatch
- value signal quality
- lead quality signals if available
- offline conversion feedback if available

---

# 10. Paid finding object

```ts
export type PaidFinding = FirstMoveFinding & {
  route: "paid_acquisition"

  paidCategory:
    | "brand_leakage"
    | "search_term_waste"
    | "pmax_incrementality"
    | "conversion_signal_quality"
    | "campaign_fragmentation"
    | "landing_page_mismatch"
    | "lead_value_signal"
    | "other"

  publicEvidence: EvidenceItem[]
  accountEvidence?: EvidenceItem[]

  economicSignal?: {
    metric: string
    currentValue?: string | number
    comparisonValue?: string | number
    source: "google_ads_read_only" | "crm_read_only" | "derived"
  }

  requiresReadOnly: boolean
}
```

---

# 11. Paid noise rules

The following must NEVER qualify a First Move by themselves:

- isolated low Quality Score
- single CTR deviation
- Ad Strength warning
- Recommendation Score
- automatic Google recommendation
- generic broad-match recommendation
- isolated bidding recommendation
- one campaign labelled "Limited by budget"
- generic "use Performance Max" recommendation
- generic "increase budget" recommendation

A Paid First Move must be supported by meaningful account evidence, economic relevance or multiple independent signals.

Examples:

**Bad:**
"Quality Score is 5/10. Improve ads."

**Potentially valid:**
"High-spend non-brand queries repeatedly resolve to landing pages that do not match the commercial intent, while the same mismatch appears across multiple high-cost ad groups and correlates with poor downstream conversion quality."

---

# 12. Scan states

```ts
export type ScanState =
  | "idle"
  | "normalizing_domain"
  | "domain_reachable"
  | "robots_checked"
  | "sitemap_checked"
  | "scope_detected"
  | "public_pages_read"
  | "technical_signals_checked"
  | "semantic_patterns_found"
  | "finding_qualifying"
  | "public_finding_ready"
  | "read_only_required"
  | "account_connected"
  | "account_signals_checked"
  | "finding_ready"
  | "not_qualified"
  | "error"
```

Use `aria-live` for meaningful status changes.

No fake percentage meter.

No artificial delay if the real result is already ready.

---

# 13. Result state

A qualified result contains:

- finding
- impact
- confidence
- effort
- proposed First Move
- scope
- measurement hypothesis
- eligibility

Primary CTA:

> Umsetzung prüfen

Secondary CTA:

> Ergebnis per E-Mail senden

Never make a sales call the primary CTA.

---

# 14. Eligibility

```ts
export type EligibilityState = {
  eligible: boolean

  reason?:
    | "no_implementation_path"
    | "approval_unknown"
    | "paid_read_only_required"
    | "enterprise_scale"
    | "multi_market_scope"
    | "capacity"
    | "insufficient_evidence"
    | "other"

  nextAction?: string
}
```

Complexity does not automatically change the price.

Complexity decides whether the bounded 1.490 EUR First Move can be responsibly sold.

---

# 15. Fit check contract

Routing is not a fit question.

Only three fit questions exist:

1. implementation path
2. approval path
3. complexity

Everything else belongs to onboarding after checkout.

---

# 16. Security requirements

For server-side domain fetches:

- normalize URLs
- allow only HTTP and HTTPS
- block localhost
- block private and link-local IP ranges
- revalidate every redirect target
- rate limit
- cap response size
- enforce timeouts
- never log secrets

For Google Ads:

- Read-only only in pre-check
- tokens encrypted
- tokens never logged
- revocation supported
- no write operation before purchase

---

# 17. Quality review

Search / AI Search finding quality reviewer:

**Maxim**

Paid finding quality reviewer:

**Philipp**

Before broad rollout, test at least:

- 20 real domains
- 5 Ads accounts

The production UI must never pretend that fixtures are real user findings.

---

# 18. Hard validation rules

A production finding fails validation if:

- it contains no evidence
- it contains only noise evidence
- it claims account data from a public scan
- it presents a generic checklist item as the main constraint
- the proposed move is not bounded
- the proposed move is a full rebuild
- measurement is undefined
- confidence is presented as certainty without evidence
- user-visible proof or findings are fabricated

---

# 19. Data retention

Scan data retention:

**30 days**

Hosting region:

**France / EU**

Only keep what is operationally necessary.

---

# 20. Final contract rule

The scan exists to create decision-quality evidence.

It must not optimize for the number of issues found.

It must optimize for finding the single strongest bounded constraint that can responsibly become a First Move.

---

# 21. Implementation status

Recorded after the production build on 2026-08-09.

## Where the contract lives in code

| Contract section | Implementation |
| --- | --- |
| Finding, evidence, eligibility, scan states | `lib/first-move/types.ts` |
| Public surface reading | `lib/first-move/surface.ts` |
| Search / AI Search qualification | `lib/first-move/qualify.ts` |
| Paid stage 1 and the Read-only boundary | `lib/first-move/paid.ts` |
| State machine and orchestration | `lib/first-move/scan.ts` |
| Labelled example finding | `lib/first-move/example.ts` |
| Transport | `app/api/first-move/{scan,paid-check}/route.ts` |

## Transport

Both scan routes answer with `application/x-ndjson`: one JSON event per line,
streamed. A state goes out only when its step has actually finished, so there is
no artificial delay and no progress meter. The client reads the stream with
`response.body.getReader()` and renders the states into an `aria-live` region.

Every outbound request goes through `lib/scan/fetcher.ts`, which already enforces
URL normalization, http and https only, blocked localhost, private and link-local
ranges, revalidated redirects, timeouts and a byte cap. Rate limiting is per IP
per route.

## Implemented candidates

- competing commercial intent, consolidation to one canonical target
- crawl and indexation defect, robots disallow or noindex on the entry page
- template-level semantic flattening
- AI Search citability, including AI crawler disallow

Each requires at least two independent observations. The paid public check
requires two as well. Where nothing clears the bar the response carries
`finding: null` and a reason.

## Hard preconditions added after real-domain testing

`qualify()` and `qualifyPublicPaid()` both return `null` when the entry page did
not answer `200`. Bot protection answers `403` with a challenge page that carries
`noindex`, no H1 and no measurement tag. Without this guard those pages produced
confident findings that said nothing about the real site.

The competing-intent candidate additionally excludes product detail paths, keeps
only one page per variant family, and strips sales boilerplate ("online",
"kaufen", "günstig" and similar) before measuring overlap. A group needs both a
Jaccard overlap of at least 0.5 and at least two shared non-boilerplate words.

## Not yet implemented

Stage 2 Google Ads Read-only. The evidence model, the finding type and the UI
exist; the OAuth flow does not. `isAdsOAuthEnabled()` gates the connect step on
`FIRST_MOVE_ADS_OAUTH=enabled`. No fake connection is offered.

## Quality review

The scan logic was exercised against roughly 25 real domains during the build,
which is what surfaced the two guards above. The formal blind review against 20
domains (Maxim, Search and AI Search) and 5 Ads accounts (Philipp, Paid) is still
outstanding and is the remaining gate before broad rollout.
