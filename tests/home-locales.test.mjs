// ─── Tests: die beiden Startseiten-Fassungen ──────────────────────────────────
// Drei Dinge, die auseinanderlaufen könnten, sobald es zwei Sprachen gibt:
//
//   1. Die Struktur. Beide Fassungen müssen dieselbe Sequenz tragen, sonst ist
//      "dieselbe Architektur auf /en" nur eine Behauptung.
//   2. Die Zahlen. Die englische Proof-Fassung schreibt Zahlen in englischer
//      Konvention und ist damit eine zweite Textstelle für denselben Messwert.
//      Der Test vergleicht die Ziffernfolgen mit lib/first-move/proof.ts.
//   3. Die Schreibregeln. Gedankenstrich, Oxford-Komma, "nicht X, sondern Y",
//      "agency", "Agentur" und "studio" als Beschreibung von SEESZN dürfen in
//      keiner sichtbaren Copy vorkommen.
//
// Läuft mit:
//   node --test --experimental-strip-types --import ./tests/register-ts.mjs tests/home-locales.test.mjs

import test from "node:test";
import assert from "node:assert/strict";

import { homeContent } from "../lib/home/index.ts";
import { PROOF_CASES } from "../lib/first-move/proof.ts";
import { PRICE_EUR } from "../lib/first-move/product.ts";
import { PRICE_DISPLAY_NET_EN } from "../lib/first-move/productEn.ts";
import {
  DIAGNOSIS_STRINGS,
  QUALIFY_STRINGS,
  REQUEST_STRINGS,
  SCAN_STRINGS,
  outcomeStringsEn,
} from "../lib/first-move/copy.ts";

const de = homeContent("de");
const en = homeContent("en");

/**
 * Sammelt jeden String aus einem Copy-Baum ein. Funktionen werden mit einer
 * Beispielzahl aufgerufen, damit auch die Satzschablonen geprüft werden.
 */
function strings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (typeof value === "function") {
    try {
      out.push(String(value(3, 9, 5)));
    } catch {
      /* Schablone braucht andere Argumente: dann eben nicht. */
    }
  } else if (Array.isArray(value)) for (const item of value) strings(item, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

/** Nur die Ziffern eines Wertes. "5,3 → 2,2" und "5.3 → 2.2" ergeben "5322". */
function digits(value) {
  return value.replace(/\D+/g, "");
}

test("beide Fassungen tragen dieselbe Sequenz", () => {
  const sequence = (c) => [
    c.constraint.index,
    c.scan.index,
    c.answers.index,
    c.proof.index,
    c.system.index,
    c.recognition.index,
    c.offer.index,
    c.decision.index,
  ];
  assert.deepEqual(sequence(de), ["01", "02", "03", "04", "05", "06", "07", "08"]);
  assert.deepEqual(sequence(en), sequence(de));

  // Dieselben Systemlabels in beiden Sprachen: sie sind Produktsprache, keine
  // Übersetzung.
  assert.deepEqual(
    en.answers.rows.map((r) => r.label),
    de.answers.rows.map((r) => r.label),
  );
  assert.deepEqual(
    en.system.stages.map((s) => s.label),
    de.system.stages.map((s) => s.label),
  );
  assert.deepEqual(en.constraint.surfaces, de.constraint.surfaces);
  assert.equal(en.proof.order.length, de.proof.order.length);
  assert.equal(en.recognition.items.length, de.recognition.items.length);
});

test("die fünf Prüfstufen bilden in beiden Sprachen dieselben Serverzustände ab", () => {
  assert.equal(en.scan.stages.length, de.scan.stages.length);
  for (let i = 0; i < de.scan.stages.length; i++) {
    assert.equal(en.scan.stages[i].id, de.scan.stages[i].id);
    assert.deepEqual(en.scan.stages[i].states, de.scan.stages[i].states);
  }
});

test("das Faktenband trägt in beiden Sprachen dieselben Zahlen", () => {
  assert.equal(en.trustStrip.length, 4);
  for (let i = 0; i < de.trustStrip.length; i++) {
    assert.equal(digits(en.trustStrip[i]), digits(de.trustStrip[i]));
  }
});

test("die englische Proof-Fassung nennt dieselben Messwerte wie die Quelle", () => {
  for (const id of en.proof.order) {
    const display = en.proof.cases[id].display;
    assert.ok(display, `${id}: englische Anzeigewerte fehlen`);
    const source = PROOF_CASES[id];

    assert.equal(
      digits(display.leadValue),
      digits(source.leadValue),
      `${id}: Leitwert weicht von lib/first-move/proof.ts ab`,
    );
    assert.equal(display.secondary.length, source.secondary.length, `${id}: Anzahl Zusatzwerte`);
    for (let i = 0; i < source.secondary.length; i++) {
      assert.equal(
        digits(display.secondary[i].value),
        digits(source.secondary[i].value),
        `${id}: Zusatzwert ${i} weicht ab`,
      );
    }
    // Vertraulichkeit und Attribution bleiben erhalten, wenn die Quelle sie führt.
    if (source.note) assert.ok(display.note, `${id}: Vertraulichkeitshinweis fehlt`);
    if (source.attribution) assert.ok(display.attribution, `${id}: Attribution fehlt`);
  }
});

test("der Tourismusfall bleibt in beiden Fassungen anonym", () => {
  for (const c of [de, en]) {
    const label = `${c.proof.cases.transform.name} ${c.proof.cases.transform.descriptor}`;
    assert.match(label, /Tourism/);
    for (const forbidden of [/schul/i, /school/i, /klassenfahrt/i, /teacher/i, /lehrer/i, /educational/i]) {
      assert.doesNotMatch(strings(c.proof).join(" "), forbidden);
    }
  }
});

test("der Preis steht in der Schreibweise der jeweiligen Sprache", () => {
  assert.equal(de.offer.price, "2.490 € netto");
  assert.equal(en.offer.price, PRICE_DISPLAY_NET_EN);
  assert.equal(en.offer.price, "€2,490 excl. VAT");
  // Beide Fassungen meinen denselben Betrag.
  assert.equal(digits(de.offer.price), String(PRICE_EUR));
  assert.equal(digits(en.offer.price), String(PRICE_EUR));
});

test("keine sichtbare Copy verletzt die Schreibregeln", () => {
  const corpora = [
    ["home-de", strings(de)],
    ["home-en", strings(en)],
    ["outcome-en", strings(outcomeStringsEn())],
    ["diagnosis-de", strings(DIAGNOSIS_STRINGS.de)],
    ["diagnosis-en", strings(DIAGNOSIS_STRINGS.en)],
    ["qualify-de", strings(QUALIFY_STRINGS.de)],
    ["qualify-en", strings(QUALIFY_STRINGS.en)],
    ["scan-de", strings(SCAN_STRINGS.de)],
    ["scan-en", strings(SCAN_STRINGS.en)],
    ["request-de", strings(REQUEST_STRINGS.de)],
    ["request-en", strings(REQUEST_STRINGS.en)],
  ];

  const forbidden = [
    [/—/, "Gedankenstrich"],
    [/, and\b/, "Oxford-Komma vor and"],
    [/\bnicht nur\b/i, "nicht nur"],
    [/\bsondern\b/i, "sondern"],
    [/\bmehr als nur\b/i, "mehr als nur"],
    [/\bnot only\b/i, "not only"],
    [/\bnot just\b/i, "not just"],
    [/\bunlock\b/i, "unlock"],
    [/\belevate\b/i, "elevate"],
    [/\breimagine\b/i, "reimagine"],
    [/\bseamless\b/i, "seamless"],
    [/game-changing/i, "game-changing"],
    [/cutting-edge/i, "cutting-edge"],
    [/future-proof/i, "future-proof"],
    [/ai-powered/i, "AI-powered"],
    [/human-layered/i, "human-layered"],
    [/\bagency\b/i, "agency"],
    [/\bagentur\b/i, "Agentur"],
    [/\bstudio\b/i, "studio"],
  ];

  for (const [name, corpus] of corpora) {
    for (const line of corpus) {
      for (const [pattern, label] of forbidden) {
        assert.doesNotMatch(line, pattern, `${name}: "${label}" in "${line.slice(0, 80)}"`);
      }
    }
  }
});
