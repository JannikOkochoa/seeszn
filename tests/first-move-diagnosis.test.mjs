// ─── Tests: die öffentliche Diagnose ──────────────────────────────────────────
// Der Klassifikator hatte vor August 2026 genau zwei Ausgänge, und alles, was
// kein Befund war, landete in einem Topf. Diese Tests halten die vier Zustände
// auseinander und sichern die Grenzen zwischen ihnen ab, damit daraus nicht
// wieder ein einziger Fallback-Zustand wird.
//
// Ausführen:
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs \
//     tests/first-move-diagnosis.test.mjs
//
// Kein Netz. Die Evidenz kommt aus Fixtures unter tests/fixtures/scan/, die das
// Labor (scripts/first-move-classify-lab.mjs) einmal echt gecrawlt hat, und aus
// synthetischen Oberflächen für die Grenzfälle.

import { readFileSync, existsSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import {
  CONTENT_WORD_FLOOR,
  MIN_CONTENT_PAGES,
  MIN_READABLE_PAGES,
  diagnose,
} from "../lib/first-move/diagnosis.ts";
import { qualify } from "../lib/first-move/qualify.ts";

// ── Synthetische Oberflächen ──────────────────────────────────────────────────

/** Eine gesunde, inhaltstragende Seite. Abweichungen kommen per Override rein. */
function page(path, over = {}) {
  return {
    url: `https://beispiel.de${path}`,
    status: 200,
    title: `Titel ${path}`,
    metaDescription: `Beschreibung ${path}`,
    canonical: `https://beispiel.de${path}`,
    noindex: false,
    h1: [`Überschrift ${path}`],
    h2: ["Was kostet das?"],
    h3: [],
    questionHeadings: 1,
    wordCount: 600,
    internalLinks: [],
    externalLinks: 3,
    jsonLdTypes: ["Organization", "WebPage", "BreadcrumbList"],
    hasOrganizationSchema: true,
    hasFaqSchema: false,
    hreflangCount: 0,
    hreflangLocales: [],
    formCount: 1,
    inputCount: 3,
    requiredInputCount: 2,
    tagSignals: [],
    consentPlatform: null,
    ogSiteName: "Beispiel",
    htmlBytes: 40_000,
    ...over,
  };
}

function surface(over = {}) {
  const samples = over.samples ?? [1, 2, 3, 4, 5, 6, 7, 8].map((n) => page(`/seite-${n}`));
  return {
    home: over.home ?? page("/", { internalLinks: Array.from({ length: 40 }, (_, i) => `https://beispiel.de/s${i}`) }),
    samples,
    robots: { state: "allows", sitemapUrls: [], blocksAiCrawlers: [], ...(over.robots ?? {}) },
    sitemap: { state: "found", urls: Array.from({ length: 40 }, (_, i) => `https://beispiel.de/s${i}`), partial: false, ...(over.sitemap ?? {}) },
  };
}

const state = (over, finding = null) => diagnose(surface(over), finding).state;

// ── Grundzustände ─────────────────────────────────────────────────────────────

test("eine durchgehend solide Oberfläche ergibt eine solide öffentliche Basis", () => {
  const d = diagnose(surface(), null);
  assert.equal(d.state, "healthy_public_foundation");
  assert.equal(d.dimensions.filter((x) => x.verdict === "weak").length, 0);
  assert.ok(d.dimensions.filter((x) => x.verdict === "solid").length >= 3);
});

test("solide Basis entsteht nie allein daraus, dass nichts Negatives gefunden wurde", () => {
  // Genug lesbare Seiten, aber nichts positiv Gemessenes: kein Absender, keine
  // Antwortstruktur, keine Sitemap, dünne interne Verlinkung.
  const flat = surface({
    home: page("/", {
      hasOrganizationSchema: false,
      ogSiteName: null,
      jsonLdTypes: [],
      questionHeadings: 0,
      internalLinks: ["https://beispiel.de/a"],
    }),
    samples: [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
      page(`/seite-${n}`, { questionHeadings: 0, hasOrganizationSchema: false, jsonLdTypes: [] }),
    ),
    sitemap: { state: "missing", urls: [], partial: false },
  });
  const d = diagnose(flat, null);
  assert.notEqual(d.state, "healthy_public_foundation");
  assert.equal(d.state, "mixed_signal");
});

test("eine gemessene Schwäche neben soliden Dimensionen ergibt ein gemischtes Bild", () => {
  const mixed = surface({
    samples: [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
      page(`/seite-${n}`, { questionHeadings: 0, hasFaqSchema: false }),
    ),
    home: page("/", { questionHeadings: 0, internalLinks: Array.from({ length: 40 }, (_, i) => `https://beispiel.de/s${i}`) }),
  });
  const d = diagnose(mixed, null);
  assert.equal(d.state, "mixed_signal");
  assert.equal(d.dimensions.find((x) => x.id === "answer_structure").verdict, "weak");
});

// ── Grenze: healthy ↔ mixed ───────────────────────────────────────────────────

test("Grenze healthy zu mixed: eine einzige gemessene Schwäche kippt den Zustand", () => {
  assert.equal(state({}), "healthy_public_foundation");
  // Nur eine Änderung: doppelte Titel auf drei Seiten.
  const withDupTitles = [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
    page(`/seite-${n}`, { title: n <= 3 ? "Gleicher Titel" : `Titel ${n}` }),
  );
  assert.equal(state({ samples: withDupTitles }), "mixed_signal");
});

test("Grenze healthy zu mixed: Indexierbarkeit muss solide sein", () => {
  const halfNoindex = [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
    page(`/seite-${n}`, { noindex: n <= 4 }),
  );
  const d = diagnose(surface({ samples: halfNoindex }), null);
  assert.equal(d.dimensions.find((x) => x.id === "indexability").verdict, "weak");
  assert.equal(d.state, "mixed_signal");
});

// ── Grenze: mixed ↔ insufficient ──────────────────────────────────────────────

test(`Grenze mixed zu insufficient: unter ${MIN_READABLE_PAGES} lesbaren Seiten`, () => {
  const two = [page("/a"), page("/b")];
  const three = [page("/a"), page("/b"), page("/c")];
  // Die Startseite zählt mit, deshalb ergeben zwei Stichproben drei Seiten.
  const d2 = diagnose(surface({ samples: two.slice(0, 1) }), null);
  assert.equal(d2.state, "insufficient_public_evidence");
  assert.equal(d2.limitation, "too_few_pages");
  assert.notEqual(diagnose(surface({ samples: three }), null).state, "insufficient_public_evidence");
});

test("Grenze mixed zu insufficient: Seiten ohne Text im HTML zählen nicht als Evidenz", () => {
  // Der reale Fall: eine clientseitig gerenderte Seite liefert eine Hülle aus.
  const shells = [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
    page(`/seite-${n}`, { wordCount: CONTENT_WORD_FLOOR - 1, h1: [] }),
  );
  const d = diagnose(
    surface({ samples: shells, home: page("/", { wordCount: 50, h1: [] }) }),
    null,
  );
  assert.equal(d.state, "insufficient_public_evidence");
  assert.equal(d.limitation, "pages_without_content");
  assert.ok(d.evidenceBase.contentPages < MIN_CONTENT_PAGES);
});

test("insufficient entsteht aus Evidenzmangel, nicht aus neutralem Punktestand", () => {
  // Neutral: keine Dimension solide, keine weak, aber genug lesbare Substanz.
  const neutral = surface({
    home: page("/", {
      hasOrganizationSchema: false,
      ogSiteName: "Beispiel",
      jsonLdTypes: [],
      internalLinks: Array.from({ length: 30 }, (_, i) => `https://beispiel.de/s${i}`),
    }),
    samples: [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
      page(`/seite-${n}`, { hasOrganizationSchema: false, jsonLdTypes: [] }),
    ),
    sitemap: { state: "missing", urls: [], partial: false },
  });
  const d = diagnose(neutral, null);
  assert.notEqual(d.state, "insufficient_public_evidence");
  assert.equal(d.limitation, undefined);
});

test("eine nicht lesbare Startseite ist Evidenzmangel, nie ein Befund", () => {
  const blocked = surface({ home: page("/", { status: 403, h1: [], wordCount: 40 }), samples: [] });
  const d = diagnose(blocked, null);
  assert.equal(d.state, "insufficient_public_evidence");
  assert.equal(d.limitation, "surface_not_readable");
});

// ── Grenze: clear ↔ mixed ─────────────────────────────────────────────────────

test("Grenze clear zu mixed: ein Befund aus reiner Abwesenheit trägt keine Empfehlung", () => {
  const absenceOnly = { confidence: "low", impact: "medium", title: "Aus Abwesenheit geschlossen" };
  assert.equal(state({}, absenceOnly), "healthy_public_foundation");
  const d = diagnose(surface(), absenceOnly);
  assert.notEqual(d.state, "clear_signal");
});

test("Grenze clear zu mixed: ein gemessener Befund trägt eine Empfehlung", () => {
  const measured = { confidence: "medium", impact: "high", title: "Gemessenes Muster" };
  const d = diagnose(surface(), measured);
  assert.equal(d.state, "clear_signal");
  assert.equal(d.confidence, "medium");
});

test("ein direkt gemessener Defekt gilt auch ohne Seitenstichprobe", () => {
  // robots.txt sperrt alles: dafür braucht es keine acht Unterseiten.
  const d = diagnose(
    surface({ samples: [], robots: { state: "blocks" } }),
    { confidence: "high", impact: "high", title: "robots.txt sperrt /" },
  );
  assert.equal(d.state, "clear_signal");
});

test("ein gemustertes Signal überschreibt niemals fehlende Evidenz", () => {
  const d = diagnose(
    surface({ samples: [page("/a", { wordCount: 20 })], home: page("/", { wordCount: 30 }) }),
    { confidence: "medium", impact: "high", title: "Muster aus zwei Seiten" },
  );
  assert.equal(d.state, "insufficient_public_evidence");
});

// ── Jeder Zustand liefert Diagnosewert ────────────────────────────────────────

test("jeder Zustand liefert Beobachtungen und eine Evidenzbasis", () => {
  const cases = [
    surface(),
    surface({ samples: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => page(`/s${n}`, { questionHeadings: 0 })) }),
    surface({ samples: [] }),
  ];
  for (const s of cases) {
    const d = diagnose(s, null);
    assert.equal(d.dimensions.length, 5, "immer alle fünf Dimensionen");
    assert.ok(typeof d.evidenceBase.readablePages === "number");
    for (const dim of d.dimensions) {
      assert.ok(dim.observation.length > 0, `${dim.id} ohne Beobachtung`);
      assert.ok(!/https?:\/\//.test(dim.observation), `${dim.id} enthält eine URL`);
    }
  }
});

test("die Diagnose behauptet nie Ranking, Conversion, Umsatz oder Paid-Effizienz", () => {
  const verboten = /\brank(ing)?\b|\bconversion\s*rate\b|\bumsatz\b|\broas\b|\bcpc\b|\bplatzierung\b/i;
  for (const s of [surface(), surface({ samples: [] })]) {
    for (const dim of diagnose(s, null).dimensions) {
      assert.ok(!verboten.test(dim.observation), `${dim.id}: ${dim.observation}`);
    }
  }
});

// ── Präzision: die beiden bestätigten Falschbefunde ───────────────────────────

test("Sprachfassungen derselben Seite sind kein konkurrierender Intent-Cluster", () => {
  // Genau das Muster von gnu.org: /, /home.en.html, /home.de.html …
  const locales = ["en", "de", "es", "fr", "el"].map((l) =>
    page(`/home.${l}.html`, {
      title: "The GNU Operating System and the Free Software Movement",
      h1: ["GNU Operating System"],
    }),
  );
  const finding = qualify({
    route: "unsure",
    domain: "beispiel.de",
    ...surface({ samples: locales }),
  });
  assert.equal(finding, null);
});

test("clientseitig gerenderte Hüllen erzeugen keinen Template-Defekt", () => {
  // Genau das Muster von posthog.com: rund 50 Wörter, keine H1, doppelte
  // Descriptions. Ohne Inhaltsgrenze wurde daraus ein Befund mit Impact "hoch".
  const shells = [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
    page(`/seite-${n}`, { wordCount: 48, h1: [], metaDescription: "Immer dieselbe" }),
  );
  const input = { route: "unsure", domain: "beispiel.de", ...surface({ samples: shells }) };
  const finding = qualify(input);
  const d = diagnose(surface({ samples: shells }), finding);
  assert.equal(d.state, "insufficient_public_evidence");
  assert.equal(d.limitation, "pages_without_content");
});

// ── Reale Evidenz: die Verteilung darf nicht in einen Topf zurückfallen ───────

test("die echten Fixtures verteilen sich auf mehrere Zustände", (t) => {
  const dir = new URL("./fixtures/scan/", import.meta.url);
  const index = new URL("./index.json", dir);
  if (!existsSync(index)) {
    t.skip("keine Fixtures vorhanden");
    return;
  }
  const names = JSON.parse(readFileSync(index, "utf8"));
  const seen = new Set();
  for (const name of names) {
    const fx = JSON.parse(readFileSync(new URL(`${name}.json`, dir), "utf8"));
    const urls = fx.sitemap.urls.slice();
    while (urls.length < fx.sitemapUrlCount) urls.push(`https://${fx.domain}/_p${urls.length}`);
    const input = {
      home: fx.home,
      samples: fx.samples,
      robots: fx.robots,
      sitemap: { ...fx.sitemap, urls },
    };
    const finding = qualify({ route: "unsure", domain: fx.domain, ...input });
    seen.add(diagnose(input, finding).state);
  }
  assert.ok(
    seen.size >= 3,
    `nur ${seen.size} Zustand/Zustände über ${names.length} echte Domains: ${[...seen].join(", ")}`,
  );
});
