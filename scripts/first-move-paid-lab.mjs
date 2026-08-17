// ─── Paid-Klassifikations-Labor ───────────────────────────────────────────────
// Gegenstück zu scripts/first-move-classify-lab.mjs für den Paid Check.
//
//   crawl   liest jede Einstiegsseite EINMAL öffentlich und legt sie als Fixture
//           unter tests/fixtures/paid/ ab.
//   run     lässt den echten Paid-Klassifikator gegen diese Fixtures laufen.
//
// Der Paid Check liest genau eine Seite, das Fixture ist deshalb klein.
//
// Die Performance-Messung ist hier bewusst nachgebaut statt aus scan.ts
// exportiert: die Produktionsdatei soll für ein Entwicklungswerkzeug nicht
// aufgeweitet werden. Sie ruft denselben öffentlichen Endpunkt mit denselben
// Parametern auf.
//
// Aufruf:
//   node --experimental-strip-types --import ./tests/register-ts.mjs \
//     scripts/first-move-paid-lab.mjs crawl urls.txt
//   node --experimental-strip-types --import ./tests/register-ts.mjs \
//     scripts/first-move-paid-lab.mjs run [--signals]

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { normalizeUrl } from "../lib/scan/fetcher.ts";
import { readPage } from "../lib/first-move/surface.ts";
import { qualifyPublicPaid } from "../lib/first-move/paid.ts";
import { diagnosePaid } from "../lib/first-move/diagnosis.ts";

const FIXTURES = new URL("../tests/fixtures/paid/", import.meta.url);

async function measurePerformance(target) {
  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", target.toString());
  api.searchParams.set("category", "performance");
  api.searchParams.set("strategy", "mobile");
  if (process.env.PAGESPEED_API_KEY) api.searchParams.set("key", process.env.PAGESPEED_API_KEY);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(api.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const score = data?.lighthouseResult?.categories?.performance?.score;
    return typeof score === "number" ? Math.round(score * 100) : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function fixtureName(url) {
  return `${new URL(url).hostname.replace(/^www\./, "").replace(/[^a-z0-9.-]/gi, "_")}.json`;
}

const [mode, ...rest] = process.argv.slice(2);

if (mode === "crawl") {
  mkdirSync(FIXTURES, { recursive: true });
  const arg = rest.find((a) => !a.startsWith("--"));
  const withPerf = rest.includes("--performance");
  const inputs =
    arg && existsSync(arg)
      ? readFileSync(arg, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
      : rest.filter((a) => !a.startsWith("--"));

  for (const raw of inputs) {
    try {
      const target = normalizeUrl(raw);
      const landing = await readPage(target);
      const performance = withPerf ? await measurePerformance(target) : null;
      // Nur was der Klassifikator liest. h2/h3 fließen im Paid-Pfad nirgends ein.
      landing.h2 = [];
      landing.h3 = [];
      landing.internalLinks = landing.internalLinks.slice(0, 20);
      const fx = { input: raw, landing, performance };
      writeFileSync(new URL(fixtureName(landing.url), FIXTURES), JSON.stringify(fx, null, 1));
      console.log(
        `ok   ${new URL(landing.url).hostname.padEnd(26)} status=${landing.status} tags=${landing.tagSignals.length} cmp=${landing.consentPlatform ?? "—"} form=${landing.formCount} in=${landing.inputCount} req=${landing.requiredInputCount} h1=${landing.h1.length} links=${landing.internalLinks.length} words=${landing.wordCount} perf=${performance ?? "—"}`,
      );
    } catch (err) {
      console.log(`FAIL ${String(raw).padEnd(26)} ${err?.code ?? ""} ${err?.message ?? err}`);
    }
  }
  process.exit(0);
}

if (mode === "run") {
  const showSignals = rest.includes("--signals");
  const files = readdirSync(FIXTURES)
    .filter((f) => f.endsWith(".json") && f !== "index.json")
    .sort();
  const rows = [];
  for (const file of files) {
    const fx = JSON.parse(readFileSync(new URL(file, FIXTURES), "utf8"));
    const candidate = qualifyPublicPaid({
      domain: new URL(fx.landing.url).hostname,
      spendBand: "unknown",
      landing: fx.landing,
      samples: [],
      performance: fx.performance,
    });
    const d = diagnosePaid({ landing: fx.landing, performance: fx.performance }, candidate);
    const finding = d.state === "clear_signal" ? candidate : null;
    rows.push({ file, fx, d, candidate, finding });
  }
  const order = {
    clear_signal: 0,
    mixed_signal: 1,
    healthy_public_foundation: 2,
    insufficient_public_evidence: 3,
  };
  rows.sort((a, b) => order[a.d.state] - order[b.d.state] || a.file.localeCompare(b.file));

  for (const r of rows) {
    const host = new URL(r.fx.landing.url).hostname.replace(/^www\./, "");
    const dims = r.d.dimensions.map((x) => `${x.id.slice(0, 6)}:${x.verdict[0]}`).join(" ");
    console.log(
      `${host.padEnd(24)} ${r.d.state.padEnd(29)} conf=${r.d.confidence.padEnd(7)} rec=${(r.finding ? "yes" : "no").padEnd(4)} ${(r.d.limitation ?? "").padEnd(22)} ${dims}`,
    );
    if (r.finding) console.log(`${" ".repeat(24)} → ${r.finding.title}`);
    else if (r.candidate) console.log(`${" ".repeat(24)} (unterdrückt: ${r.candidate.title})`);
    if (showSignals && r.candidate) {
      for (const e of r.candidate.evidence) {
        console.log(`${" ".repeat(26)} · ${e.type}: ${e.observation.slice(0, 110)}`);
      }
    }
  }
  const tally = {};
  for (const r of rows) tally[r.d.state] = (tally[r.d.state] ?? 0) + 1;
  console.log("\nVerteilung:", JSON.stringify(tally));
  process.exit(0);
}

console.error("Modus fehlt: crawl <datei|urls…> [--performance] | run [--signals]");
process.exit(1);
