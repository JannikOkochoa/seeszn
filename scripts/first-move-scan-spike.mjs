// ─── Scan-Spike: viele Domains am Stück prüfen ────────────────────────────────
// Ein Entwicklungswerkzeug für die Blindbewertung des öffentlichen Scans.
//
// Es ruft die echte Scanlogik direkt auf: dieselben Qualifikationsfunktionen,
// derselbe Fetcher mit allen SSRF-Schutzmaßnahmen, dieselben Rauschregeln,
// dieselbe öffentliche Redaktion. Es gibt keine zweite Scan-Implementierung.
//
// Warum ohne HTTP: die öffentliche Route ist auf 8 Prüfungen pro IP und
// 10 Minuten begrenzt. Diese Grenze bleibt unangetastet, und es gibt keinen
// Bypass in der Produktionsroute. Ein lokaler Lauf über 20 Domains braucht sie
// auch nicht, weil er die Route gar nicht erst benutzt.
//
// Was es NICHT tut:
//   - keine Leads schreiben
//   - keine E-Mail versenden
//   - keine Scan-Kontexte speichern
//   - keine Qualitätsbewertung
// Die Bewertung macht ein Mensch. Das Skript liefert nur das Material.
//
// Aufruf:
//   node --experimental-strip-types --import ./tests/register-ts.mjs \
//     scripts/first-move-scan-spike.mjs domains.txt
//
//   node --experimental-strip-types --import ./tests/register-ts.mjs \
//     scripts/first-move-scan-spike.mjs beispiel.de zweite.de
//
// Optionen:
//   --json      zusätzlich scan-spike.json schreiben
//   --states    die gemeldeten Scan-Zustände mit ausgeben
//   --internal  zusätzlich die interne Auswertung zeigen. Ausdrücklich NICHT
//               für die Blindbewertung: die Standardausgabe entspricht genau
//               dem, was ein Besucher sieht.
//
// Bewertungsraster für die manuelle Durchsicht, 0 oder 1 je Zeile:
//   A  Site-spezifisch?
//   B  Relevant?
//   C  Würdest du das einem Kunden zeigen?
//   D  Trägt die Evidenz die Aussage?
// Maximal 4 Punkte pro Domain. Es gibt bewusst keine im Code hinterlegte
// Bestehensgrenze und keine automatische Berechnung.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { runFirstMoveScan } from "../lib/first-move/scan.ts";
import { toPublicFinding } from "../lib/first-move/disclosure.ts";

const args = process.argv.slice(2);
const wantsJson = args.includes("--json");
const showStates = args.includes("--states");
const showInternal = args.includes("--internal");
const inputs = args.filter((a) => !a.startsWith("--"));

if (inputs.length === 0) {
  console.error("Bitte Domains angeben oder eine Datei mit einer Domain pro Zeile.");
  process.exit(1);
}

const domains =
  inputs.length === 1 && existsSync(inputs[0])
    ? readFileSync(inputs[0], "utf8")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
    : inputs;

const results = [];

for (const [index, domain] of domains.entries()) {
  const states = [];
  const started = Date.now();
  let row;

  try {
    const outcome = await runFirstMoveScan(domain, "unsure", (event) => {
      states.push(`${event.label}${event.detail ? `: ${event.detail}` : ""}`);
    });
    row = {
      domain,
      url: outcome.url,
      seconds: Math.round((Date.now() - started) / 100) / 10,
      states,
      // Exakt die Sicht, die die Route ausliefert.
      public: outcome.finding ? toPublicFinding(outcome.finding) : null,
      notQualifiedReason: outcome.notQualifiedReason ?? null,
      internal: showInternal ? (outcome.finding ?? null) : undefined,
    };
  } catch (err) {
    row = {
      domain,
      seconds: Math.round((Date.now() - started) / 100) / 10,
      states,
      error: err instanceof Error ? err.message : String(err),
      public: null,
    };
  }

  results.push(row);

  const n = String(index + 1).padStart(2, "0");
  console.log(`\n${"-".repeat(72)}`);
  console.log(`${n}  ${row.domain}   ${row.seconds}s`);
  console.log("-".repeat(72));

  if (showStates) {
    for (const state of row.states) console.log(`   · ${state}`);
    console.log("");
  }

  if (row.error) {
    console.log(`FEHLER: ${row.error}`);
  } else if (!row.public) {
    console.log("KEIN SIGNAL");
    if (row.notQualifiedReason) console.log(row.notQualifiedReason);
  } else {
    const f = row.public;
    console.log(`Beobachtung:  ${f.title}`);
    console.log(`              ${f.summary}`);
    for (const e of f.evidence) console.log(`Beleg:        ${e.observation}`);
    console.log(`Impact:       ${f.impact}`);
    console.log(`Confidence:   ${f.confidence}`);
    console.log(`Move-Typ:     ${f.interventionType ?? "n/a"}`);
  }

  if (showInternal && row.internal) {
    console.log("\n   [intern, nicht Teil der Blindbewertung]");
    console.log(`   Kandidat: ${row.internal.proposedFirstMove?.title ?? "n/a"}`);
    console.log(`   Scope:    ${row.internal.proposedFirstMove?.scope ?? "n/a"}`);
    const urls = row.internal.evidence.flatMap((e) => e.scope?.urls ?? []).slice(0, 5);
    if (urls.length) console.log(`   URLs:     ${urls.join(" ")}`);
  }

  console.log("");
  console.log("A. Site-spezifisch?                  0 / 1   __");
  console.log("B. Relevant?                         0 / 1   __");
  console.log("C. Würdest du das einem Kunden zeigen? 0 / 1  __");
  console.log("D. Trägt die Evidenz die Aussage?    0 / 1   __");
  console.log("TOTAL: __ / 4");
}

const withSignal = results.filter((r) => r.public).length;
const failed = results.filter((r) => r.error).length;
console.log(`\n${"=".repeat(72)}`);
console.log(`${results.length} Domains · ${withSignal} mit Signal · ${failed} Fehler`);
console.log("Gezeigt wird genau das, was ein Besucher sieht. Bewertet wird manuell.");

if (wantsJson) {
  writeFileSync("scan-spike.json", JSON.stringify(results, null, 2));
  console.log("scan-spike.json geschrieben.");
}
