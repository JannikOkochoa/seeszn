// ─── Klassifikations-Labor ────────────────────────────────────────────────────
// Ein Entwicklungswerkzeug, um die Verteilung des Klassifikators zu sehen und
// Änderungen daran deterministisch zu vergleichen.
//
// Es arbeitet in zwei Schritten, und das ist der ganze Punkt:
//
//   crawl   liest jede Domain EINMAL öffentlich und legt die eingesammelte
//           Evidenz als Fixture unter tests/fixtures/scan/ ab.
//   run     lässt den echten Klassifikator gegen diese Fixtures laufen.
//
// Damit lässt sich dieselbe Evidenz vor und nach einer Änderung durch denselben
// Code schicken, ohne fremde Server erneut zu belasten und ohne dass Netzjitter
// das Ergebnis verwackelt. Dieselben Fixtures tragen anschließend die Unit-Tests.
//
// Es gibt keine zweite Scan-Implementierung: gecrawlt wird mit surface.ts,
// klassifiziert mit qualify.ts, redigiert mit disclosure.ts.
//
// Aufruf:
//   node --experimental-strip-types --import ./tests/register-ts.mjs \
//     scripts/first-move-classify-lab.mjs crawl domains.txt
//   node --experimental-strip-types --import ./tests/register-ts.mjs \
//     scripts/first-move-classify-lab.mjs run
//
// Schreibt nie Leads, verschickt nie E-Mail, speichert keine Scan-Kontexte.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { normalizeUrl } from "../lib/scan/fetcher.ts";
import { readPage, readRobots, readSitemap } from "../lib/first-move/surface.ts";
import { qualify } from "../lib/first-move/qualify.ts";
import { diagnose } from "../lib/first-move/diagnosis.ts";

const FIXTURES = new URL("../tests/fixtures/scan/", import.meta.url);

// Dieselbe Auswahl wie im Scan. Bewusst dupliziert statt exportiert: das Labor
// darf die Produktionsdatei nicht um seiner selbst willen aufweiten.
const MAX_SAMPLE_PAGES = 8;
const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|zip|mp4|mp3|xml|json|css|js)(\?|$)/i;
const SKIP_PATH =
  /\/(wp-content|wp-json|feed|tag|author|cart|checkout|login|account|impressum|datenschutz|privacy|agb|legal)\b/i;

function pickSamplePages(home, sitemapUrls, host) {
  const pool = sitemapUrls.length ? sitemapUrls : home.internalLinks;
  const seen = new Set();
  const scored = [];
  for (const raw of pool) {
    let u;
    try {
      u = new URL(raw);
    } catch {
      continue;
    }
    if (u.hostname.toLowerCase().replace(/^www\./, "") !== host) continue;
    if (SKIP_EXT.test(u.pathname) || SKIP_PATH.test(u.pathname)) continue;
    u.hash = "";
    u.search = "";
    const key = u.toString().replace(/\/$/, "");
    if (!key || seen.has(key)) continue;
    if (key === home.url.replace(/\/$/, "")) continue;
    seen.add(key);
    const segments = u.pathname.split("/").filter(Boolean);
    scored.push({ url: u, depth: segments.length, dir: segments[0] ?? "" });
    if (scored.length > 400) break;
  }
  scored.sort((a, b) => a.depth - b.depth);
  const chosen = [];
  const usedDirs = new Set();
  for (const item of scored) {
    if (chosen.length >= MAX_SAMPLE_PAGES) break;
    if (usedDirs.has(item.dir)) continue;
    usedDirs.add(item.dir);
    chosen.push(item.url);
  }
  for (const item of scored) {
    if (chosen.length >= MAX_SAMPLE_PAGES) break;
    if (chosen.some((c) => c.toString() === item.url.toString())) continue;
    chosen.push(item.url);
  }
  return chosen;
}

async function crawlOne(input) {
  const target = normalizeUrl(input);
  const host = target.hostname.toLowerCase().replace(/^www\./, "");
  const home = await readPage(target);
  const origin = new URL(new URL(home.url).origin);
  const robots = await readRobots(origin);
  const sitemap = await readSitemap(origin, robots.sitemapUrls);
  const picks = pickSamplePages(home, sitemap.urls, host);
  const samples = [];
  for (let i = 0; i < picks.length; i += 4) {
    const batch = picks.slice(i, i + 4);
    const res = await Promise.all(batch.map((u) => readPage(u, 7000).catch(() => null)));
    for (const r of res) if (r) samples.push(r);
  }
  return {
    domain: new URL(home.url).hostname.replace(/^www\./, ""),
    home,
    samples,
    robots,
    // Die vollständige URL-Liste wird nicht gespeichert, nur ihre Größe und die
    // ersten Einträge: das Fixture soll klein und lesbar bleiben.
    sitemap: { state: sitemap.state, urls: sitemap.urls.slice(0, 40), partial: sitemap.partial },
    sitemapUrlCount: sitemap.urls.length,
  };
}

function fixtureName(domain) {
  return `${domain.replace(/[^a-z0-9.-]/gi, "_")}.json`;
}

/** Stellt die Sitemap-Größe wieder her, ohne 3000 URLs im Fixture zu halten. */
function rehydrate(fx) {
  const urls = fx.sitemap.urls.slice();
  while (urls.length < fx.sitemapUrlCount) urls.push(`https://${fx.domain}/_padding_${urls.length}`);
  return { ...fx, sitemap: { ...fx.sitemap, urls } };
}

const [mode, ...rest] = process.argv.slice(2);

if (mode === "crawl") {
  mkdirSync(FIXTURES, { recursive: true });
  const arg = rest[0];
  const domains =
    arg && existsSync(arg)
      ? readFileSync(arg, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
      : rest;
  for (const d of domains) {
    try {
      const fx = await crawlOne(d);
      writeFileSync(new URL(fixtureName(fx.domain), FIXTURES), JSON.stringify(fx, null, 2));
      console.log(
        `ok   ${fx.domain.padEnd(28)} home=${fx.home.status} samples=${fx.samples.length} sitemap=${fx.sitemap.state}(${fx.sitemapUrlCount}) robots=${fx.robots.state}`,
      );
    } catch (err) {
      console.log(`FAIL ${String(d).padEnd(28)} ${err?.code ?? ""} ${err?.message ?? err}`);
    }
  }
  process.exit(0);
}

if (mode === "run") {
  const files = readdirSync(FIXTURES).filter((f) => f.endsWith(".json") && f !== "index.json").sort();
  const rows = [];
  for (const file of files) {
    const fx = rehydrate(JSON.parse(readFileSync(new URL(file, FIXTURES), "utf8")));
    const input = {
      route: "unsure",
      domain: fx.domain,
      home: fx.home,
      samples: fx.samples,
      robots: fx.robots,
      sitemap: fx.sitemap,
    };
    const candidate = qualify(input);
    const d = diagnose({ home: fx.home, samples: fx.samples, robots: fx.robots, sitemap: fx.sitemap }, candidate);
    const finding = d.state === "clear_signal" ? candidate : null;
    rows.push({
      domain: fx.domain,
      state: d.state,
      conf: d.confidence,
      base: `${d.evidenceBase.readablePages}/${d.evidenceBase.contentPages}`,
      dims: d.dimensions.map((x) => `${x.id.slice(0, 5)}:${x.verdict[0]}`).join(" "),
      lim: d.limitation ?? "",
      rec: finding ? "yes" : "no",
      title: finding ? finding.title : (candidate ? `(unterdrückt: ${candidate.title})` : "—"),
      obs: d.dimensions.filter((x) => x.verdict !== "unknown").length,
    });
  }
  const order = { clear_signal: 0, mixed_signal: 1, healthy_public_foundation: 2, insufficient_public_evidence: 3 };
  rows.sort((a, b) => order[a.state] - order[b.state] || a.domain.localeCompare(b.domain));
  for (const r of rows) {
    console.log(
      `${r.domain.padEnd(24)} ${r.state.padEnd(29)} conf=${r.conf.padEnd(7)} pages=${r.base.padEnd(6)} rec=${r.rec.padEnd(4)} ${r.lim.padEnd(24)} ${r.dims}`,
    );
    if (r.title !== "—") console.log(`${" ".repeat(24)} ${r.title}`);
  }
  const tally = {};
  for (const r of rows) tally[r.state] = (tally[r.state] ?? 0) + 1;
  console.log("\nVerteilung:", JSON.stringify(tally));
  process.exit(0);
}
