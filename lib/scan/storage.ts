// Shared sessionStorage key for a scan result. No database needed: the intake
// writes the result here, the result page reads it (and re-runs the scan from
// the domain query param if the entry is missing).
export function sessionKeyFor(domain: string): string {
  return `seeszn:scan:${domain.toLowerCase().replace(/^www\./, "")}`;
}
