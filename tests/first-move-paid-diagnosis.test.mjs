// ─── Tests: die öffentliche Paid-Diagnose ─────────────────────────────────────
// Der Paid Check bewertet genau eine Einstiegsseite. Sein Evidenzmodell ist
// damit dünner als das des Search-Scans, und genau daran ist er zuerst
// überheblich geworden: aus der ABWESENHEIT eines sichtbaren Mess-Tags und einer
// bekannten Consent-Plattform entstand ein Befund. Auf zwölf echten Seiten
// erzeugte das fünf Falschbefunde, darunter stripe.com und mailchimp.com.
//
// Diese Tests halten die Grenze fest: öffentlich beurteilbar ist der AUFBAU
// einer Landingpage, nicht die Wirtschaftlichkeit der Paid Acquisition.
//
// Ausführen:
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs \
//     tests/first-move-paid-diagnosis.test.mjs

import { readFileSync, existsSync, readdirSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import {
  CONTENT_WORD_FLOOR,
  PAID_SOLID_DIMENSIONS_FOR_HEALTHY,
  diagnosePaid,
} from "../lib/first-move/diagnosis.ts";
import { qualifyPublicPaid } from "../lib/first-move/paid.ts";
import { PAID_DIAGNOSIS_COPY } from "../lib/first-move/disclosure.ts";

// ── Synthetische Einstiegsseiten ──────────────────────────────────────────────

/** Eine sauber gebaute Landingpage. Abweichungen kommen per Override rein. */
function landing(over = {}) {
  return {
    url: "https://beispiel.de/kampagne",
    status: 200,
    title: "Kampagnen-Landingpage",
    metaDescription: "Beschreibung",
    canonical: "https://beispiel.de/kampagne",
    noindex: false,
    h1: ["Ein klares Versprechen"],
    h2: [],
    h3: [],
    questionHeadings: 0,
    wordCount: 900,
    internalLinks: Array.from({ length: 12 }, (_, i) => `https://beispiel.de/z${i}`),
    externalLinks: 2,
    jsonLdTypes: [],
    hasOrganizationSchema: false,
    hasFaqSchema: false,
    hreflangCount: 0,
    hreflangLocales: [],
    formCount: 1,
    inputCount: 4,
    requiredInputCount: 2,
    tagSignals: ["Google Tag (gtag.js)", "Google Ads Conversion Tag"],
    consentPlatform: "Cookiebot",
    ogSiteName: "Beispiel",
    htmlBytes: 40_000,
    ...over,
  };
}

const run = (over = {}, performance = 85) => {
  const page = landing(over);
  const finding = qualifyPublicPaid({
    domain: "beispiel.de",
    spendBand: "unknown",
    landing: page,
    samples: [],
    performance,
  });
  return { finding, diagnosis: diagnosePaid({ landing: page, performance }, finding) };
};

const verdictOf = (d, id) => d.dimensions.find((x) => x.id === id)?.verdict;

// ── Grundzustände ─────────────────────────────────────────────────────────────

test("eine sauber gebaute Einstiegsseite ergibt eine solide öffentliche Basis", () => {
  const { diagnosis, finding } = run();
  assert.equal(diagnosis.state, "healthy_public_foundation");
  assert.equal(finding, null);
  assert.equal(diagnosis.dimensions.filter((d) => d.verdict === "weak").length, 0);
});

// ── Der eigentliche Fehler: Abwesenheit ist kein Beleg ────────────────────────

test("kein sichtbares Ads-Tag ist keine Schwäche, sondern nicht messbar", () => {
  // Der Normalfall bei Container- oder serverseitigem Tagging.
  const { diagnosis, finding } = run({ tagSignals: [] });
  assert.equal(verdictOf(diagnosis, "measurement"), "unknown");
  assert.notEqual(verdictOf(diagnosis, "measurement"), "weak");
  assert.equal(finding, null, "Abwesenheit eines Tags erzeugt keinen Befund");
});

test("keine erkannte Consent-Plattform ist keine Schwäche, sondern nicht messbar", () => {
  const { diagnosis, finding } = run({ consentPlatform: null });
  assert.equal(verdictOf(diagnosis, "consent"), "unknown");
  assert.equal(finding, null);
});

test("Tag und Consent zusammen unsichtbar erzeugen trotzdem keinen Befund", () => {
  // Genau die Kombination, die vorher stripe.com und mailchimp.com getroffen hat.
  const { diagnosis, finding } = run({ tagSignals: [], consentPlatform: null });
  assert.equal(finding, null);
  assert.notEqual(diagnosis.state, "clear_signal");
});

test("mehrere H1 sind kein Defekt", () => {
  // stripe.com setzt zwei, mailchimp.com sechs. Beides ist legitim.
  const { finding, diagnosis } = run({ h1: ["Eins", "Zwei", "Drei"] });
  assert.equal(finding, null);
  assert.equal(verdictOf(diagnosis, "message_clarity"), "mixed");
});

test("ein Formular ist nicht der einzige gültige Konversionspfad", () => {
  // Eine Seite, die auf Produkt oder Kontakt weiterführt, hat einen Pfad.
  const { diagnosis } = run({ formCount: 0, inputCount: 0, requiredInputCount: 0 });
  assert.equal(verdictOf(diagnosis, "conversion_path"), "solid");
});

// ── Grenze: healthy ↔ mixed ───────────────────────────────────────────────────

test("Grenze healthy zu mixed: eine gemessene Schwäche kippt den Zustand", () => {
  assert.equal(run().diagnosis.state, "healthy_public_foundation");
  // Nur eine Änderung: die Seite liefert keine H1 mehr aus.
  assert.equal(run({ h1: [] }).diagnosis.state, "mixed_signal");
});

test("Grenze healthy zu mixed: der Konversionspfad muss solide sein", () => {
  const { diagnosis } = run({ formCount: 1, inputCount: 8, requiredInputCount: 1 });
  assert.equal(verdictOf(diagnosis, "conversion_path"), "mixed");
  assert.equal(diagnosis.state, "mixed_signal");
});

test("REGRESSION: fehlende gemessene Probleme allein ergeben nie healthy", () => {
  // Nichts Negatives, aber auch nichts positiv Belegtes: kein sichtbares Tag,
  // keine erkannte Consent-Plattform, keine Performance-Messung. Übrig bleiben
  // zwei solide Dimensionen. Das reicht ausdrücklich nicht.
  const { diagnosis } = run({ tagSignals: [], consentPlatform: null }, null);
  const solid = diagnosis.dimensions.filter((d) => d.verdict === "solid").length;
  const weak = diagnosis.dimensions.filter((d) => d.verdict === "weak").length;
  assert.equal(weak, 0, "es gibt keine gemessene Schwäche");
  assert.ok(solid < PAID_SOLID_DIMENSIONS_FOR_HEALTHY, `nur ${solid} solide Dimensionen`);
  assert.equal(diagnosis.state, "mixed_signal", "trotzdem nicht healthy");
});

// ── Grenze: mixed ↔ insufficient ──────────────────────────────────────────────

test("Grenze mixed zu insufficient: eine Hülle ohne Text ist nicht beurteilbar", () => {
  const { diagnosis, finding } = run({
    wordCount: CONTENT_WORD_FLOOR - 1,
    h1: [],
    formCount: 0,
    inputCount: 0,
    internalLinks: [],
  });
  assert.equal(diagnosis.state, "insufficient_public_evidence");
  assert.equal(diagnosis.limitation, "pages_without_content");
  assert.equal(finding, null, "aus einer Hülle entsteht nie ein Befund");
});

test("Grenze mixed zu insufficient: eine Bot-Schutzseite ist nicht beurteilbar", () => {
  const { diagnosis, finding } = run({ status: 403, h1: [], wordCount: 20 });
  assert.equal(diagnosis.state, "insufficient_public_evidence");
  assert.equal(diagnosis.limitation, "surface_not_readable");
  assert.equal(finding, null);
});

test("ein Dokument ohne Title und ohne Überschrift ist keine Landingpage", () => {
  // Der reale Fall: eine als text/plain ausgelieferte RFC-Datei. "Keine H1" wäre
  // dort wahr und zugleich ohne jede Aussage.
  const { diagnosis, finding } = run({
    title: null,
    h1: [],
    h2: [],
    h3: [],
    wordCount: 54_000,
    formCount: 0,
    inputCount: 0,
    internalLinks: [],
  });
  assert.equal(diagnosis.state, "insufficient_public_evidence");
  assert.equal(diagnosis.limitation, "surface_not_readable");
  assert.equal(finding, null);
});

// ── Grenze: clear ↔ mixed ─────────────────────────────────────────────────────

test("Grenze clear zu mixed: ein gemessener Defekt reicht nicht, zwei reichen", () => {
  // Nur eine Schwäche: keine H1.
  const eins = run({ h1: [] });
  assert.equal(eins.finding, null);
  assert.equal(eins.diagnosis.state, "mixed_signal");

  // Zwei gemessene Schwächen: keine H1 und kein weiterführender Pfad.
  const zwei = run({ h1: [], formCount: 0, inputCount: 0, internalLinks: [] });
  assert.ok(zwei.finding, "zwei gemessene Defekte tragen einen Befund");
  assert.equal(zwei.diagnosis.state, "clear_signal");
  assert.equal(zwei.finding.evidence.length, 2);
});

test("der Befundtitel benennt nur den gemessenen Defekt", () => {
  const { finding } = run({ h1: [], formCount: 0, inputCount: 0, internalLinks: [] });
  assert.equal(finding.title, "Auf der Einstiegsseite ist kein nächster Schritt erkennbar.");

  // Keine BEHAUPTUNG über die Wirtschaftlichkeit. Das bloße Wort "Kampagne" ist
  // erlaubt und sogar erwünscht, weil der Befund ausdrücklich sagt, dass er über
  // Kampagnen nichts aussagt. Verboten ist die zusprechende Aussage.
  const behauptung =
    /ineffizient|verliert geld|verbrennt|konvertiert schlecht|zu teuer|schlechte(r|s)? (roas|cac|leadqualität)/i;
  assert.ok(!behauptung.test(finding.title), finding.title);
  assert.ok(!behauptung.test(finding.summary), finding.summary);
  // Und die Einschränkung muss wirklich dastehen.
  assert.match(finding.summary, /sagt dieser Befund nichts/i);
});

test("der Impact folgt der Evidenz, nicht dem angegebenen Budget", () => {
  const page = landing({ h1: [], formCount: 0, inputCount: 0, internalLinks: [] });
  const klein = qualifyPublicPaid({
    domain: "beispiel.de", spendBand: "lt_10k", landing: page, samples: [], performance: 85,
  });
  const gross = qualifyPublicPaid({
    domain: "beispiel.de", spendBand: "gt_250k", landing: page, samples: [], performance: 85,
  });
  assert.equal(klein.impact, gross.impact, "dasselbe Signal, derselbe Impact");
});

test("ein gemessener Ladezeit-Engpass zählt, eine fehlende Messung nicht", () => {
  const gemessen = run({ h1: [] }, 31);
  assert.ok(gemessen.finding, "keine H1 plus Lighthouse 31 sind zwei Messungen");
  assert.equal(verdictOf(gemessen.diagnosis, "page_speed"), "weak");

  const ungemessen = run({ h1: [] }, null);
  assert.equal(ungemessen.finding, null);
  assert.equal(verdictOf(ungemessen.diagnosis, "page_speed"), "unknown");
});

// ── Sprachgrenzen ─────────────────────────────────────────────────────────────

test("keine Paid-Aussage behauptet Wirtschaftlichkeit oder Kampagnenqualität", () => {
  const verboten =
    /\broas\b|\bcac\b|\bconversion[- ]?rate\b(?!n? effizient)|\bumsatz\b|\bleadqualität\b(?! sind)|\bkampagnenqualität\b/i;
  for (const [state, copy] of Object.entries(PAID_DIAGNOSIS_COPY)) {
    for (const key of ["title", "body"]) {
      assert.ok(!verboten.test(copy[key]), `${state}.${key}: ${copy[key]}`);
    }
  }
  // "Solide Basis" darf ausdrücklich keine CRO-Bewertung sein.
  const healthy = PAID_DIAGNOSIS_COPY.healthy_public_foundation;
  assert.match(healthy.title, /öffentlich sichtbare Conversion-Basis/i);
  assert.match(healthy.limits, /ohne interne Daten nicht beurteilen/i);
});

test("jede Paid-Dimension beschreibt eine Beobachtung ohne URL", () => {
  for (const over of [{}, { tagSignals: [], consentPlatform: null }, { h1: [] }]) {
    for (const d of run(over).diagnosis.dimensions) {
      assert.ok(d.observation.length > 0, `${d.id} ohne Beobachtung`);
      assert.ok(!/https?:\/\//.test(d.observation), `${d.id} enthält eine URL`);
    }
  }
});

// ── Reale Evidenz ─────────────────────────────────────────────────────────────

test("die echten Paid-Fixtures verteilen sich auf mehrere Zustände", (t) => {
  const dir = new URL("./fixtures/paid/", import.meta.url);
  if (!existsSync(dir)) {
    t.skip("keine Paid-Fixtures vorhanden");
    return;
  }
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const seen = new Set();
  let clear = 0;
  for (const file of files) {
    const fx = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
    const finding = qualifyPublicPaid({
      domain: "fixture",
      spendBand: "unknown",
      landing: fx.landing,
      samples: [],
      performance: fx.performance,
    });
    const d = diagnosePaid({ landing: fx.landing, performance: fx.performance }, finding);
    seen.add(d.state);
    if (d.state === "clear_signal") clear += 1;
  }
  assert.ok(seen.size >= 3, `nur ${seen.size} Zustand/Zustände: ${[...seen].join(", ")}`);
  // Präzisionsnetz: der öffentliche Paid-Check darf nicht auf breiter Front
  // Engpässe behaupten. Vor der Korrektur waren es 5 von 12.
  assert.ok(
    clear / files.length < 0.2,
    `${clear} von ${files.length} Seiten mit Befund, das ist zu viel für öffentliche Evidenz`,
  );
});
