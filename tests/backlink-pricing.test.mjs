// ─── Tests: die Backlink-Preiskurve ───────────────────────────────────────────
// Die Preise entstehen nicht mehr aus einer Tabelle, sondern aus einer Kurve
// durch Ankerpunkte. Damit ist jede ganze Menge kaufbar, und damit sind zwei
// Eigenschaften nicht mehr offensichtlich, sondern müssen geprüft werden:
//
//   1. Der Stückpreis fällt auf JEDER ganzen Zahl. Wer mehr kauft, zahlt je
//      Einheit weniger. Fiele er auch nur einmal nicht, wäre die Staffel an
//      dieser Stelle ein Argument gegen die größere Menge.
//   2. Der Gesamtpreis steigt auf JEDER ganzen Zahl. Wer eine Einheit mehr
//      kauft, zahlt insgesamt mehr. Andernfalls gäbe es eine Menge, die
//      günstiger ist als eine kleinere, und das ist ein Fehler im Katalog.
//
// Beide Eigenschaften werden hier für alle 96 beziehungsweise 91 Mengen
// geprüft, nicht an Stichproben.
//
// Stichprobenartig geprüft wird zusätzlich der Wertebereich 5 bis 10 gegen die
// abgestimmten Sollwerte, weil dort die Kurve am steilsten ist.

import assert from "node:assert/strict";

// Die Ankerwerte stehen hier bewusst noch einmal als unabhängige Kopie. Ein
// Test, der seine Erwartung aus derselben Datei liest wie die Implementierung,
// prüft nur, dass eine Datei sich selbst gleicht.
const ONCE_ANCHORS = { 5: 9900, 10: 17900, 20: 35500, 30: 52500, 50: 84900, 75: 123500, 100: 159900 };
const MONTHLY_ANCHORS = { 10: 16200, 20: 32000, 30: 47500, 50: 76500, 75: 111500, 100: 144500 };

const { priceFor, MIN_QUANTITY, MAX_SELF_SERVICE, MIN_TERM_MONTHS, minimumCommitmentCents } =
  await import("../lib/moves/backlinks.ts");

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
};

// ── Grenzen ──────────────────────────────────────────────────────────────────
check("Einmalig beginnt bei 5", () => {
  assert.equal(MIN_QUANTITY.once, 5);
  assert.equal(priceFor(4, "once"), null);
  assert.ok(priceFor(5, "once"));
});

check("Monatlich beginnt bei 10", () => {
  assert.equal(MIN_QUANTITY.monthly, 10);
  assert.equal(priceFor(9, "monthly"), null);
  assert.ok(priceFor(10, "monthly"));
});

check("Selbstbedienung endet bei 100", () => {
  assert.equal(MAX_SELF_SERVICE, 100);
  assert.ok(priceFor(100, "once"));
  assert.equal(priceFor(101, "once"), null, "101 darf keinen berechneten Preis haben");
  assert.equal(priceFor(140, "monthly"), null, "über 100 rechnet die Seite nicht");
});

check("Keine Bruchmengen", () => {
  assert.equal(priceFor(17.5, "once"), null);
});

// ── Die beiden Kurveneigenschaften, über jede ganze Menge ────────────────────
for (const [mode, anchors, min] of [
  ["once", ONCE_ANCHORS, 5],
  ["monthly", MONTHLY_ANCHORS, 10],
]) {
  check(`${mode}: ${min} bis 100 vollständig, Stückpreis fällt streng`, () => {
    let previous = null;
    for (let q = min; q <= 100; q++) {
      const p = priceFor(q, mode);
      assert.ok(p, `Menge ${q} hat keinen Preis`);
      assert.ok(p.totalCents > 0, `Menge ${q}: Gesamtpreis nicht positiv`);
      assert.ok(p.unitCents > 0, `Menge ${q}: Stückpreis nicht positiv`);
      if (previous) {
        assert.ok(
          p.unitCents < previous.unitCents,
          `Menge ${q}: Stückpreis ${p.unitCents} nicht kleiner als ${previous.unitCents} bei ${q - 1}`,
        );
        assert.ok(
          p.totalCents > previous.totalCents,
          `Menge ${q}: Gesamtpreis ${p.totalCents} nicht größer als ${previous.totalCents} bei ${q - 1}`,
        );
      }
      previous = p;
    }
  });

  check(`${mode}: Ankerpreise exakt wie abgestimmt`, () => {
    for (const [q, cents] of Object.entries(anchors)) {
      assert.equal(
        priceFor(Number(q), mode).totalCents,
        cents,
        `Anker ${q} weicht ab`,
      );
    }
  });

  check(`${mode}: Gesamtpreis ist Menge × angezeigtem Stückpreis`, () => {
    for (let q = min; q <= 100; q++) {
      const p = priceFor(q, mode);
      // Auf einem Anker darf der Gesamtpreis vom Produkt abweichen, weil der
      // Ankerwert gilt. Dazwischen muss die angezeigte Rechnung aufgehen.
      if (anchors[q] !== undefined) continue;
      assert.equal(p.totalCents, p.unitCents * q, `Menge ${q}: ${p.unitCents} × ${q} ≠ ${p.totalCents}`);
    }
  });
}

// ── Die abgestimmten Sollwerte 5 bis 10 ──────────────────────────────────────
check("Sollwerte 5 bis 10 stimmen auf den Cent", () => {
  const expected = {
    5: [1980, 9900],
    6: [1942, 11652],
    7: [1904, 13328],
    8: [1866, 14928],
    9: [1828, 16452],
    10: [1790, 17900],
  };
  for (const [q, [unit, total]] of Object.entries(expected)) {
    const p = priceFor(Number(q), "once");
    assert.equal(p.unitCents, unit, `Menge ${q}: Stückpreis ${p.unitCents} statt ${unit}`);
    assert.equal(p.totalCents, total, `Menge ${q}: Gesamtpreis ${p.totalCents} statt ${total}`);
  }
});

// ── Mindestbindung ───────────────────────────────────────────────────────────
check("Mindestlaufzeit sind drei Monate", () => {
  assert.equal(MIN_TERM_MONTHS, 3);
});

check("Mindestbindung ist der dreifache Monatsbetrag, über alle Mengen", () => {
  for (let q = 10; q <= 100; q++) {
    const p = priceFor(q, "monthly");
    assert.equal(minimumCommitmentCents(p.totalCents), p.totalCents * 3, `Menge ${q}`);
  }
  // Der Wert aus der Vorgabe: 20 Stück monatlich, 320 €, Bindung 960 €.
  assert.equal(minimumCommitmentCents(priceFor(20, "monthly").totalCents), 96000);
});

// ── Monatlich ist immer günstiger als derselbe Einmalkauf ────────────────────
check("Monatspreis liegt unter dem Einmalpreis derselben Menge", () => {
  for (let q = 10; q <= 100; q++) {
    const m = priceFor(q, "monthly");
    const o = priceFor(q, "once");
    assert.ok(m.totalCents < o.totalCents, `Menge ${q}: monatlich ${m.totalCents} nicht unter ${o.totalCents}`);
    assert.ok(m.savingCents > 0, `Menge ${q}: keine Ersparnis ausgewiesen`);
    assert.equal(m.savingCents, o.totalCents - m.totalCents, `Menge ${q}: Ersparnis falsch`);
  }
});


// ─── Manuelle Mengeneingabe ────────────────────────────────────────────────
const { parseManualQuantity } = await import("../lib/moves/backlinks.ts");

const casesOnce = [
  ["5", { kind: "valid", quantity: 5 }],
  ["6", { kind: "valid", quantity: 6 }],
  ["17", { kind: "valid", quantity: 17 }],
  ["40", { kind: "valid", quantity: 40 }],
  ["76", { kind: "valid", quantity: 76 }],
  ["99", { kind: "valid", quantity: 99 }],
  ["100", { kind: "valid", quantity: 100 }],
  ["", { kind: "invalid" }],
  ["0", { kind: "valid", quantity: 5 }],
  ["1", { kind: "valid", quantity: 5 }],
  ["4", { kind: "valid", quantity: 5 }],
  ["101", { kind: "custom", requested: 101 }],
  ["150", { kind: "custom", requested: 150 }],
  ["999", { kind: "custom", requested: 999 }],
  ["-1", { kind: "valid", quantity: 5 }],
  ["17.5", { kind: "invalid" }],
  ["abc", { kind: "invalid" }],
  [" ", { kind: "invalid" }],
  ["17 ", { kind: "valid", quantity: 17 }],
  [" 17", { kind: "valid", quantity: 17 }],
];

check("manuelle Menge, einmalig: alle §58-Testfälle", () => {
  for (const [input, expected] of casesOnce) {
    const got = parseManualQuantity(input, "once");
    assert.deepEqual(got, expected, `Eingabe ${JSON.stringify(input)}: ${JSON.stringify(got)} statt ${JSON.stringify(expected)}`);
  }
});

check("manuelle Menge, monatlich: Mindestmenge 10, sonst gleiche Regeln", () => {
  assert.deepEqual(parseManualQuantity("9", "monthly"), { kind: "valid", quantity: 10 });
  assert.deepEqual(parseManualQuantity("10", "monthly"), { kind: "valid", quantity: 10 });
  assert.deepEqual(parseManualQuantity("17", "monthly"), { kind: "valid", quantity: 17 });
  assert.deepEqual(parseManualQuantity("100", "monthly"), { kind: "valid", quantity: 100 });
  assert.deepEqual(parseManualQuantity("101", "monthly"), { kind: "custom", requested: 101 });
});

console.log(
  failures === 0
    ? "\nMANUELLE MENGENEINGABE: ALLE TESTS BESTANDEN"
    : `\nMANUELLE MENGENEINGABE: ${failures} TEST(S) FEHLGESCHLAGEN`,
);
process.exit(failures === 0 ? 0 : 1);
