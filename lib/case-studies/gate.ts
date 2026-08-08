// ─── Publication gate ────────────────────────────────────────────────────────
// Production safety rule for every public evidence value on a case study.
//
// A concrete number, quote or result may reach the public page only when it is
// BOTH verified against project data AND approved for publication. Anything
// else resolves to `null` and the rendering component omits it — no TODO, no
// TBD, no "undefined", no placeholder ever reaches the DOM.
//
// The two flags mean different things and must not be collapsed into one:
//   verified       — the value was checked against a named source and window.
//   publicApproved — the value may be shown outside the client relationship.
//
// Absolute business volumes (sessions, clicks, revenue) stay private by policy;
// ratios and relative changes derived from them are publishable because they
// carry the finding without exposing the client's business size.

/** Any evidence value that can be gated for publication. */
export interface Gated<T> {
  value: T;
  verified: boolean;
  publicApproved: boolean;
}

/** Returns the value only when it is verified AND approved. Otherwise null. */
export function publish<T>(g: Gated<T> | undefined | null): T | null {
  if (!g) return null;
  if (!g.verified || !g.publicApproved) return null;
  return g.value;
}

/** True when a gated value will render. Use to decide whether a block exists. */
export function isPublic(g: Gated<unknown> | undefined | null): boolean {
  return Boolean(g && g.verified && g.publicApproved);
}

/** Filters a list down to the entries that are cleared for publication. */
export function publicOnly<T extends { verified: boolean; publicApproved: boolean }>(
  items: readonly T[],
): T[] {
  return items.filter((i) => i.verified && i.publicApproved);
}
