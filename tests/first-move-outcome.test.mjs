// ─── Tests: das Ergebnis als Produktobjekt ────────────────────────────────────
// Diese Datei sichert die eine Regel ab, an der der alte Funnel gescheitert ist:
//
//   Die Prüfung endet nie in einem Nichtergebnis.
//
// Vorher konnte `finding === null` bis in die Oberfläche durchschlagen und dort
// zu "Kein starkes Signal" werden. Die Tests hier halten fest, dass es diesen
// Weg nicht mehr gibt: buildOutcome() ist total, jeder Ausgang trägt eine
// Kategorie, einen Beleg und genau eine Fortsetzung, und ein technischer Fehler
// teilt sich mit keinem davon eine Darstellung.
//
// Ausführen:
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs \
//     tests/first-move-outcome.test.mjs

import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import { diagnose } from "../lib/first-move/diagnosis.ts";
import { qualify } from "../lib/first-move/qualify.ts";
import { toPublicFinding } from "../lib/first-move/disclosure.ts";
import {
  BUSINESS_SITUATIONS,
  PUBLICLY_DERIVABLE,
  buildFirstMove,
  buildOutcome,
} from "../lib/first-move/outcome.ts";
import { INCLUDED } from "../lib/first-move/product.ts";

// ── Fixtures ──────────────────────────────────────────────────────────────────

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

/**
 * Acht klar voneinander unterscheidbare Seiten.
 *
 * Wichtig für Case B: die Standardseite aus `page()` trägt bei allen Seiten
 * dieselbe H2. Acht davon nebeneinander erkennt qualify() zu Recht als
 * konkurrierende kommerzielle Absicht, und die Oberfläche wäre dann nicht mehr
 * gesund. Für eine wirklich gesunde Basis müssen die Seiten also auch inhaltlich
 * auseinanderliegen, nicht nur formal in Ordnung sein.
 */
const THEMEN = [
  ["Dachsanierung", "Ziegeltausch"],
  ["Fassadendämmung", "Putzaufbau"],
  ["Fenstertausch", "Verglasung"],
  ["Heizungstausch", "Hydraulikabgleich"],
  ["Photovoltaik", "Speicherauslegung"],
  ["Wärmepumpe", "Schallschutz"],
  ["Innenausbau", "Estrichaufbau"],
  ["Trockenbau", "Ständerwerk"],
];

/**
 * Kein gemeinsames Wort zwischen zwei Seiten. Auch nicht in der Floskel:
 * ein gemeinsames "planen und umsetzen" in allen Titeln reicht qualify()
 * bereits als geteiltes Signal, und genau das soll hier nicht entstehen.
 */
function distinctPages() {
  return THEMEN.map(([thema, detail], i) =>
    page(`/${thema.toLowerCase()}`, {
      title: `${thema} ${detail}`,
      metaDescription: `${thema}: ${detail}.`,
      h1: [`${thema} ${detail}`],
      h2: [`Was kostet ${thema}?`],
      wordCount: 600 + i * 40,
    }),
  );
}

function surface(over = {}) {
  const samples = over.samples ?? distinctPages();
  return {
    home:
      over.home ??
      page("/", {
        title: "Energetische Sanierung aus einer Hand",
        h1: ["Energetische Sanierung aus einer Hand"],
        internalLinks: Array.from({ length: 40 }, (_, i) => `https://beispiel.de/s${i}`),
      }),
    samples,
    robots: { state: "allows", sitemapUrls: [], blocksAiCrawlers: [], ...(over.robots ?? {}) },
    sitemap: {
      state: "found",
      urls: Array.from({ length: 40 }, (_, i) => `https://beispiel.de/s${i}`),
      partial: false,
      ...(over.sitemap ?? {}),
    },
  };
}

/** Führt die echte Kette einmal durch: qualify → diagnose → buildOutcome. */
function run(over = {}) {
  const input = surface(over);
  const finding = qualify({ route: "unsure", domain: "beispiel.de", ...input });
  const diagnosis = diagnose(input, finding);
  const publicFinding = finding ? toPublicFinding(finding) : null;
  return { diagnosis, finding: publicFinding, outcome: buildOutcome(diagnosis, publicFinding) };
}

// ── Case A: ein gemessener öffentlicher Befund ────────────────────────────────

test("Case A: ein gemessener Engpass ergibt eine spezifische Diagnose mit Evidenz", () => {
  // robots.txt sperrt die gesamte Domain. Direkt gemessen, deshalb clear_signal.
  const { diagnosis, outcome, finding } = run({
    robots: { state: "blocks", sitemapUrls: [], blocksAiCrawlers: [] },
  });

  assert.equal(diagnosis.state, "clear_signal");
  assert.equal(outcome.kind, "measured_signal");
  assert.notEqual(outcome.category, "HIDDEN_SIGNAL");
  assert.equal(outcome.category, finding.category);

  // Die Überschrift IST der Befund, nicht ein Zustandstext.
  assert.equal(outcome.headline, finding.title);
  assert.ok(outcome.evidence.length >= 2, "ein Befund ohne Belege ist eine Behauptung");
  assert.ok(outcome.cta.length > 0);
  assert.ok(outcome.meaning.length > 0, "ein Befund ohne kommerzielle Einordnung hilft nicht");
});

test("Case A: der Impact des Moves stammt aus dem gemessenen Befund", () => {
  const { outcome, finding } = run({
    robots: { state: "blocks", sitemapUrls: [], blocksAiCrawlers: [] },
  });
  const move = buildFirstMove(outcome, "low_demand", finding, INCLUDED);
  assert.equal(move.expectedImpact, finding.impact);
  assert.equal(move.category, outcome.category);
  // Der Titel ist die Art des Eingriffs, nicht das konkrete Ziel.
  assert.equal(move.title, finding.interventionType);
});

// ── Case B: gesunde öffentliche Basis ─────────────────────────────────────────

test("Case B: eine gesunde Basis ergibt HIDDEN_SIGNAL, nicht ein Nichtergebnis", () => {
  const { diagnosis, outcome } = run();

  assert.equal(diagnosis.state, "healthy_public_foundation");
  assert.equal(outcome.kind, "hidden_signal");
  assert.equal(outcome.category, "HIDDEN_SIGNAL");

  // Der Kern: die Aussage grenzt ein, sie meldet keinen Fehlschlag.
  assert.match(outcome.headline, /offensichtliche Fehler/i);
  assert.match(outcome.meaning, /grenzt den Engpass ein/i);
  assert.equal(outcome.cta, "First Move finden");
});

test("Case B: der Ausschluss kommt aus echten Messungen, nicht aus vier festen Haken", () => {
  const { outcome, diagnosis } = run();
  const solide = diagnosis.dimensions.filter((d) => d.verdict === "solid");

  assert.equal(outcome.ruledOut.length, solide.length);
  for (const line of outcome.ruledOut) {
    assert.ok(
      solide.some((d) => d.observation === line),
      `"${line}" steht als ausgeschlossen, ohne solide gemessen zu sein`,
    );
  }
});

test("Case B: eine schwache Dimension erscheint nie als ausgeschlossen", () => {
  // Startseite ohne Absenderauszeichnung: die Entity-Dimension wird schwach.
  const { outcome, diagnosis } = run({
    home: page("/", {
      hasOrganizationSchema: false,
      ogSiteName: null,
      jsonLdTypes: [],
      internalLinks: Array.from({ length: 40 }, (_, i) => `https://beispiel.de/s${i}`),
    }),
  });

  const schwach = diagnosis.dimensions.filter((d) => d.verdict === "weak");
  assert.ok(schwach.length > 0, "Fixture erzeugt keine schwache Dimension");
  for (const d of schwach) {
    assert.ok(
      !outcome.ruledOut.includes(d.observation),
      `${d.id} ist schwach, wird aber als ausgeschlossen dargestellt`,
    );
  }
});

// ── Case C: Evidenz vorhanden, aber nicht ausreichend ─────────────────────────

test("Case C: ohne tragenden Befund entsteht keine erfundene harte Empfehlung", () => {
  // Mehrere Seiten ohne H1: gemessene Schwäche, aber kein qualifizierter Befund.
  const { diagnosis, outcome, finding } = run({
    samples: distinctPages().map((p) => ({ ...p, h1: [] })),
  });

  assert.notEqual(diagnosis.state, "clear_signal");
  assert.ok(["narrowed", "hidden_signal"].includes(outcome.kind));

  const move = buildFirstMove(outcome, "unclear_lever", finding, INCLUDED);
  // Kein Impact ohne gemessenen Befund, der ihn trägt.
  assert.equal(move.expectedImpact, undefined);
  // Aber sehr wohl ein nachvollziehbarer nächster Schritt.
  assert.ok(move.title.length > 0);
  assert.ok(move.rationale.length > 0);
  assert.ok(move.deliveryWindow.length > 0);
});

test("Case C: eine eingegrenzte Richtung benennt die Kategorie der stärksten Schwäche", () => {
  const { outcome } = run({
    samples: distinctPages().map((p) => ({ ...p, h1: [] })),
  });
  if (outcome.kind !== "narrowed") return; // Zustand hängt an den Schwellen der Diagnose.
  assert.notEqual(outcome.category, "HIDDEN_SIGNAL");
  assert.ok(outcome.meaning.length > 0);
});

// ── Case D: ein technischer Fehler ist kein Diagnosezustand ───────────────────

test("Case D: ein Fehlerereignis trägt keine Diagnose und kann kein Ergebnis werden", () => {
  // Der Vertrag des Streams: ScanErrorEvent hat kein `diagnosis`-Feld. Damit ist
  // buildOutcome() aus einem Fehler heraus gar nicht aufrufbar, und die
  // Oberfläche kann die beiden nicht verwechseln.
  const src = readFileSync(new URL("../lib/first-move/types.ts", import.meta.url), "utf8");
  const errorBlock = src.slice(src.indexOf("export interface ScanErrorEvent"));
  const body = errorBlock.slice(0, errorBlock.indexOf("}"));
  assert.ok(!body.includes("diagnosis"), "ScanErrorEvent darf keine Diagnose tragen");
  assert.ok(!body.includes("finding"), "ScanErrorEvent darf keinen Befund tragen");
});

test("Case D: Fehlerzustand und Ergebnisschritte teilen sich keine Darstellung", () => {
  const funnel = readFileSync(new URL("../components/first-move/Funnel.tsx", import.meta.url), "utf8");
  // Die Ergebnissequenz hängt an `settled`, der Fehler an `phase === "error"`.
  assert.ok(funnel.includes('{settled && outcome ? ('), "Ergebnissequenz nicht an settled gebunden");
  assert.ok(
    !/phase === "error"[^\n]*outcome/.test(funnel),
    "Fehlerzustand und Ergebnis dürfen nicht in derselben Bedingung stehen",
  );
});

// ── Totalität ─────────────────────────────────────────────────────────────────

test("jeder Diagnosezustand ergibt ein Ergebnis mit Kategorie, Überschrift und CTA", () => {
  const faelle = [
    ["healthy_public_foundation", {}],
    ["clear_signal", { robots: { state: "blocks", sitemapUrls: [], blocksAiCrawlers: [] } }],
    ["insufficient_public_evidence", { samples: [], home: page("/", { status: 500 }) }],
    ["mixed_signal", { samples: distinctPages().map((p) => ({ ...p, h1: [] })) }],
  ];

  const gesehen = new Set();
  for (const [, over] of faelle) {
    const { diagnosis, outcome } = run(over);
    gesehen.add(diagnosis.state);

    assert.ok(outcome, `${diagnosis.state} ergibt kein Ergebnis`);
    assert.ok(outcome.category, `${diagnosis.state} ohne Kategorie`);
    assert.ok(outcome.headline.length > 0, `${diagnosis.state} ohne Überschrift`);
    assert.ok(outcome.cta.length > 0, `${diagnosis.state} ohne Fortsetzung`);
    assert.ok(outcome.confidence, `${diagnosis.state} ohne Sicherheitsband`);
  }
  assert.ok(gesehen.size >= 3, `zu wenige Zustände abgedeckt: ${[...gesehen].join(", ")}`);
});

test("SEARCH_GAP wird aus öffentlichen Signalen nie ausgespielt", () => {
  // Die Kategorie ist vorbereitet, aber nicht belegbar: sie setzt Suchvolumen
  // und Rankings voraus, und beides liest eine öffentliche Prüfung nicht.
  assert.ok(!PUBLICLY_DERIVABLE.includes("SEARCH_GAP"));

  const faelle = [
    {},
    { robots: { state: "blocks", sitemapUrls: [], blocksAiCrawlers: [] } },
    { robots: { state: "allows", sitemapUrls: [], blocksAiCrawlers: ["GPTBot", "PerplexityBot"] } },
    { samples: distinctPages().map((p) => ({ ...p, h1: [] })) },
    { samples: distinctPages().slice(0, 3).map((p) => ({ ...p, wordCount: 40 })) },
    { home: page("/", { noindex: true }) },
    { sitemap: { state: "missing", urls: [], partial: false } },
  ];
  for (const over of faelle) {
    const { outcome } = run(over);
    assert.notEqual(outcome.category, "SEARCH_GAP", `SEARCH_GAP aus ${JSON.stringify(over)}`);
  }
});

// ── Geschäftslage statt Serviceauswahl ────────────────────────────────────────

test("die Kontextfrage erfasst ein Geschäftsproblem, keinen Marketingkanal", () => {
  assert.equal(BUSINESS_SITUATIONS.length, 4);
  const kanaele = /\bsearch\b|\bai search\b|\bseo\b|\bpaid\b|\bads\b|\bgeo\b/i;
  for (const opt of BUSINESS_SITUATIONS) {
    assert.ok(!kanaele.test(opt.label), `"${opt.label}" nennt einen Kanal`);
    assert.ok(opt.note.length > 0, `${opt.id} sagt nicht, was die Angabe ändert`);
  }
});

test("die Geschäftslage geht in die Begründung des Moves ein", () => {
  const { outcome, finding } = run();
  const ohne = buildFirstMove(outcome, null, finding, INCLUDED);
  const mit = buildFirstMove(outcome, "traffic_no_business", finding, INCLUDED);
  assert.notEqual(ohne.rationale, mit.rationale);
  assert.match(mit.rationale, /hinter dem Klick/i);
});

// ── Sprachgrenzen der aktiven Journey ─────────────────────────────────────────

const AKTIVE_DATEIEN = [
  "../lib/first-move/outcome.ts",
  "../lib/first-move/disclosure.ts",
  "../lib/first-move/signals.ts",
  "../lib/first-move/types.ts",
  "../components/first-move/Funnel.tsx",
];

test("die abgeschafften Formulierungen kommen in der aktiven Journey nicht mehr vor", () => {
  // Der Kommentar in disclosure.ts zitiert den alten Text bewusst, um zu
  // erklären, warum es ihn nicht mehr gibt. Geprüft wird deshalb der Code ohne
  // Kommentare.
  const verboten = [
    "Kein starkes Signal",
    "kein Befund stark genug",
    "TROTZDEM PRÜFEN",
    "Trotzdem prüfen",
    "trotzdem genauer prüfen",
    "Wo merkst du den Engpass",
    "Wo merkst du das Problem",
    "Weiß ich nicht",
  ];
  for (const rel of AKTIVE_DATEIEN) {
    const src = readFileSync(new URL(rel, import.meta.url), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\s)\/\/.*$/gm, "");
    for (const phrase of verboten) {
      assert.ok(!src.includes(phrase), `${rel} enthält noch "${phrase}"`);
    }
  }
});

test("der Funnel bietet keine Auswahl der Marketingdisziplin mehr an", () => {
  const funnel = readFileSync(new URL("../components/first-move/Funnel.tsx", import.meta.url), "utf8");
  assert.ok(!funnel.includes("CHANNEL_OPTIONS"), "die Kanalauswahl existiert noch");
  assert.ok(!funnel.includes("route_select"), "das Ereignis der Kanalauswahl feuert noch");
  assert.ok(funnel.includes("BUSINESS_SITUATIONS"), "die Geschäftslage wird nicht gefragt");
});

// ── Pricing ───────────────────────────────────────────────────────────────────

test("vor dem Angebot steht kein Preis in der Journey", () => {
  const funnel = readFileSync(new URL("../components/first-move/Funnel.tsx", import.meta.url), "utf8");
  // Die Ergebnissequenz beginnt bei der Stationsleiste und endet vor dem
  // E-Mail-Formular. In diesem Abschnitt darf keine Preisangabe stehen.
  const von = funnel.indexOf('<ol className="fm-seq"');
  const bis = funnel.indexOf("Sekundärer Weg: Kontakt per Mail");
  assert.ok(von > 0 && bis > von, "Ergebnissequenz nicht auffindbar");
  const sequenz = funnel.slice(von, bis);

  assert.ok(!sequenz.includes("PRICE_DISPLAY"), "die Ergebnissequenz zeigt einen Preis");
  assert.ok(!/\d[.\s]?\d{3}\s?€/.test(sequenz), "die Ergebnissequenz zeigt einen Betrag");
});

test("die Faktenzeile am Domainfeld nennt keinen Betrag mehr", async () => {
  const { HERO_FACT_LINE, PRICE_DISPLAY } = await import("../lib/first-move/product.ts");
  assert.ok(!HERO_FACT_LINE.includes(PRICE_DISPLAY));
  assert.ok(!/€/.test(HERO_FACT_LINE));
  assert.match(HERO_FACT_LINE, /Festpreis/);
});

test("der Preis bleibt vor dem Kauf vollständig sichtbar", () => {
  const sections = readFileSync(
    new URL("../components/first-move/Sections.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(sections.includes("PRICE_DISPLAY"), "das Angebot zeigt keinen Preis");
  assert.ok(sections.includes("PRICE_PROMISE"), "die Zusage vor dem Preis fehlt");
});

// ── Keine erfundene Präzision ─────────────────────────────────────────────────

test("Sicherheit wird als Band angegeben, nie als Prozentwert", () => {
  const { outcome, finding } = run();
  assert.ok(["high", "medium", "limited"].includes(outcome.confidence));

  const move = buildFirstMove(outcome, "growth_stalled", finding, INCLUDED);
  assert.ok(["high", "medium", "limited"].includes(move.confidence));

  // Kommentare zählen nicht: outcome.ts zitiert "Confidence: 82 %" ausdrücklich
  // als das, was hier NICHT passieren darf.
  for (const rel of ["../lib/first-move/outcome.ts", "../components/first-move/Funnel.tsx"]) {
    const src = readFileSync(new URL(rel, import.meta.url), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\s)\/\/.*$/gm, "");
    assert.ok(
      !/confidence[^\n]{0,40}\d+\s*%/i.test(src),
      `${rel} behauptet einen Prozentwert für Confidence`,
    );
  }
});

// ── Case E: Reihenfolge auf schmalen Geräten ──────────────────────────────────

test("Case E: auf Mobile steht der Befund vor dem technischen Protokoll", () => {
  const styles = readFileSync(
    new URL("../components/first-move/styles.tsx", import.meta.url),
    "utf8",
  );
  const von = styles.indexOf("@media (max-width: 1024px)");
  const bis = styles.indexOf("@media (max-width: 780px)");
  assert.ok(von > 0 && bis > von, "Breakpoint nicht auffindbar");
  const block = styles.slice(von, bis);

  assert.match(block, /\.fm-stage-result\s*\{[^}]*order:\s*1/, "das Ergebnis steht nicht zuerst");
  assert.match(block, /\.fm-stage-log\s*\{[^}]*order:\s*2/, "das Protokoll steht nicht danach");
  // Während der Prüfung dreht sich die Reihenfolge zurück: dann ist das
  // Protokoll die eigentliche Information.
  assert.match(block, /:has\(\.fm-stages\)/, "die laufende Prüfung kehrt die Reihenfolge nicht um");
});
