# SEESZN First Move
## SCAN API CONTRACT V6

**Status:** Source of Truth
**Version:** 6.0.2 (final technical pre-launch pass)
**Supersedes:** `SCAN_API_CONTRACT_v5.md` for the public response shape and the disclosure boundary.

Everything in V5 about evidence discipline stays valid. V6 adds one rule and one
type:

> The full finding never leaves the server. Only a redacted public view does.

---

## 1. Unchanged principles

1. Evidence before recommendation.
2. No fake scan results.
3. No generic best-practice issue becomes a First Move by itself.
4. Search, AI Search and Paid Acquisition use different sources, same discipline.
5. Paid Acquisition is two-stage: public pre-check, then read-only account evidence.
6. A result separates observation from inference.
7. Impact, confidence and effort are distinct internal fields.
8. A finding must be bounded enough for First Move eligibility.
9. Insufficient evidence produces `not_qualified`, never a fabricated recommendation.
10. Every visible state maps to a real scan event.

A response of status 200 is required before any finding is qualified. Bot
protection pages (403 and similar) never produce a finding.

---

## 2. Two views of a finding

### Internal: `FirstMoveFinding`

Produced by `lib/first-move/qualify.ts` and `lib/first-move/paid.ts`. Contains
everything: full evidence with `scope.urls` and measured values, `effort`,
`proposedFirstMove` (title, scope, surface, mode, hours), `measurementHypothesis`
(metric, baseline, direction, window, attribution limits), `eligibility`,
`surfaceKind`, `suggestedComplexity`.

This object stays inside the request handler. It is never serialized to the
client and never stored from the client.

### Public: `PublicFinding`

```ts
interface PublicEvidencePoint {
  id: string
  observation: string          // no URLs, no measured values
}

interface PublicFinding {
  id: string
  route: "search" | "ai_search" | "paid_acquisition" | "unsure"
  status: FindingStatus
  title: string                // the observation
  summary: string
  evidence: PublicEvidencePoint[]   // max 2
  impact: "low" | "medium" | "high"
  confidence: "low" | "medium" | "high"
  interventionType?: string        // class of action, never the target
  eligibility: EligibilityState
  publicEvidenceOnly: true
  requiresReadOnly?: boolean
  surfaceKind?: "commerce" | "site"  // only picks the most relevant proof case
  suggestedComplexity?: Complexity   // prefills the fit check
  createdAt: string
}
```

`interventionType` is the only part of the implementation plan that goes
public. It carries the judgment ("Konsolidierung auf eine zentrale Zielseite")
without the work: which page becomes the target, how it is redirected and how it
is measured stay private. Every candidate in `qualify.ts` and `paid.ts` declares
one.

Removed compared to the internal view: `proposedFirstMove.title` and `.scope`
and the rest of the move object, `measurementHypothesis`, `effort`,
`evidence[].scope`, `evidence[].source`, `evidence[].type`,
`evidence[].measuredValue`, `evidence[].comparisonValue`, evidence beyond the
first two.

`toPublicFinding()` in `lib/first-move/disclosure.ts` performs the reduction and
additionally strips absolute URLs out of free text. Tests:
`tests/first-move-v6.test.mjs`.

### Internal retention

Redacting the response must not throw the analysis away. Both scan routes call
`rememberScan()` (`lib/first-move/scanStore.ts`) with the complete finding,
keyed by the finding id. `/api/first-move/request` calls `recallScan()` and
attaches `internalVerificationContext()` to the internal lead notification and
the stored lead record, so verification does not start from zero.

Storage: `public.first_move_scan_context`.

| Column | Meaning |
|---|---|
| `id` | high-entropy context id (`fm_` + 32 hex, `randomUUID`), also the id of the public finding |
| `created_at` / `expires_at` | written on insert, lifetime 6 hours |
| `domain`, `url`, `route` | what was checked |
| `public_finding` | exactly what the browser received |
| `internal_finding` | the complete internal analysis |

Properties: public observations only, no personal data, no credentials, no raw
page bodies. Six hours is far below the 30 day ceiling for scan data. RLS is on
with no policies; only `service_role` has select, insert and delete, so no
browser client can read it and no route serves a row by id. Expiry is enforced
logically on read, and expired rows are deleted opportunistically on write and
on an expired read, so a physically lingering row changes nothing.

Failure behavior: if the store is unreachable the scan still returns its public
finding and the request still succeeds. The internal notification then carries
`NO_CONTEXT_NOTE` instead of an invented plan.

Development: `persistenceAllowed()` from `lib/devGuard.ts` routes the store to
process memory, so a local scan never writes to the shared database.

The customer-facing mail never contains the internal context.

---

## 3. Endpoints

### `POST /api/first-move/scan`

Body: `{ domain: string, route?: FirstMoveRoute }`. `route` defaults to
`"unsure"`; since V6 the page only sends a route when the visitor supplied
channel context after a no-signal result.

Response: NDJSON, one event per line, `application/x-ndjson`, `no-store`.

```
{"type":"state","state":"domain_reachable","label":"Domain erkannt","detail":"…","at":"…"}
…
{"type":"result","domain":"…","url":"…","route":"unsure","finding":PublicFinding|null,"notQualifiedReason":"…","at":"…"}
```

### `POST /api/first-move/paid-check`

Body: `{ domain: string, spendBand: SpendBand }`. Same NDJSON contract. The
finding is the redacted public view of the paid finding, always with
`requiresReadOnly: true` and `eligibility.reason = "paid_read_only_required"`.

Spend bands: `lt_10k`, `10k_50k`, `50k_250k`, `gt_250k`, `unknown`. The band
weights economic relevance for impact. It never changes the price.

### `POST /api/first-move/request`

In development (`NODE_ENV !== "production"`) this route writes no lead and sends
no mail unless `FIRST_MOVE_DEV_ALLOW_WRITES=true`. It answers `ok: true` with
`devSuppressed: true` so the funnel stays testable. See `lib/devGuard.ts`.


Body: `intent` (`checkout` | `result_email`), `email`, `name`, `note`, `domain`,
`surface`, `fitCheck`, `channelContext`, `finding` (public view),
`companyUrlConfirm` (honeypot).

The handler re-sanitizes the finding defensively: title, summary, up to two
evidence observations, impact, confidence. It no longer accepts a proposed move
or a measurement hypothesis from the client, because the client cannot have
them. Implementation plan and measurement design are produced during paid
verification.

No payment provider is involved. The response never signals a completed payment.

---

## 4. States

`idle`, `normalizing_domain`, `domain_reachable`, `robots_checked`,
`sitemap_checked`, `scope_detected`, `public_pages_read`,
`technical_signals_checked`, `semantic_patterns_found`, `finding_qualifying`,
`public_finding_ready`, `read_only_required`, `account_connected`,
`account_signals_checked`, `finding_ready`, `not_qualified`, `error`.

A state is emitted only after the corresponding work finished. No progress
percentage exists in the contract.

V6 labels: "Domain erkannt", "robots.txt geprüft", "Sitemap geprüft", "Scope
bestimmt", "Relevante Seiten verglichen", "Technische Signale geprüft", "Muster
abgeglichen", "Signale werden abgeglichen", "Relevantes Signal erkannt", "Kein
starkes öffentliches Signal".

---

## 5. Qualification rules

Unchanged from V5:

- at least two independent observations, or one directly measurable strong
  signal plus a confirming observation
- generic checklist items never qualify alone
- product detail variants are not a competing-intent cluster
- boilerplate sales tokens are removed before intent comparison
- paid noise rule: quality score, single CTR deviation, ad strength,
  recommendation score never qualify alone
- public and account-level evidence stay separated

`surfaceKind` is derived from observed signals (Product schema or at least two
product detail paths). It has no influence on qualification, price or
eligibility; it only selects which case study is shown as the most relevant one.

---

## 6. Errors

`invalid_domain`, `blocked_target`, `unreachable`, `timeout`, `internal`,
`rate_limited`. Delivered as a single-line NDJSON error event so the client only
knows one code path.

---

## 7. Security

Unchanged and non-negotiable: HTTP and HTTPS only, localhost blocked, private
and link-local ranges blocked, redirects re-validated, request timeout, response
size cap, per-IP rate limiting, no secret or credential logging. Google Ads
tokens are read-only, revocable and never logged.
